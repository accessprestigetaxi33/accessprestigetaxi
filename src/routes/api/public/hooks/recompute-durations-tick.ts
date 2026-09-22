import { createFileRoute } from "@tanstack/react-router";
import { roundSecondsToMinute } from "@/lib/duration";

/**
 * Cron tick : recalcule `reservations.duree_s` à la minute près pour les
 * anciennes réservations, par petits lots (10 lignes/appel).
 *
 * Géocodage et itinéraires 100 % OpenStreetMap / OSRM — aucune clé requise.
 * Auth : secret de cron (`x-cron-secret`).
 */

const BATCH_SIZE = 10;

async function fastestDurationSec(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<number | null> {
  const { osmRoutes, trafficFactor } = await import("@/lib/osm.server");
  const routes = await osmRoutes([from.lng, from.lat], [to.lng, to.lat], true);
  if (!routes.length) return null;
  let best = Infinity;
  for (const r of routes) if (r.durationS > 0 && r.durationS < best) best = r.durationS;
  if (!Number.isFinite(best)) return null;
  return Math.round(best * trafficFactor());
}

export const Route = createFileRoute("/api/public/hooks/recompute-durations-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronSecret } = await import("@/lib/cron-auth.server");
        const denied = requireCronSecret(request);
        if (denied) return denied;

        const { supabaseAdmin } = await import("@/lib/nova-supabase.server");

        const { data: rows, error } = await supabaseAdmin
          .from("reservations")
          .select("id,depart,arrivee,destination,duree_s,status,pickup_datetime")
          .is("duree_recomputed_at" as any, null)
          .not("status", "in", "(completed,cancelled,annulee)")
          .order("pickup_datetime", { ascending: false })
          .limit(BATCH_SIZE);

        if (error) {
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        const results: {
          id: string;
          status: "updated" | "unchanged" | "skipped" | "error";
          previous_duree_s: number | null;
          new_duree_s: number | null;
          reason?: string;
        }[] = [];

        for (const row of (rows ?? []) as any[]) {
          const stamp = new Date().toISOString();
          try {
            const depart = (row.depart ?? "").trim();
            const arrivee = (row.arrivee ?? row.destination ?? "").trim();
            if (!depart || !arrivee) {
              await supabaseAdmin
                .from("reservations")
                .update({ duree_recomputed_at: stamp } as any)
                .eq("id", row.id);
              results.push({
                id: row.id,
                status: "skipped",
                previous_duree_s: row.duree_s ?? null,
                new_duree_s: null,
                reason: "missing_address",
              });
              continue;
            }

            const { osmGeocode } = await import("@/lib/osm.server");
            const [from, to] = await Promise.all([osmGeocode(depart), osmGeocode(arrivee)]);
            if (!from || !to) {
              await supabaseAdmin
                .from("reservations")
                .update({ duree_recomputed_at: stamp } as any)
                .eq("id", row.id);
              results.push({
                id: row.id,
                status: "skipped",
                previous_duree_s: row.duree_s ?? null,
                new_duree_s: null,
                reason: "geocode_failed",
              });
              continue;
            }

            const rawSec = await fastestDurationSec(from, to);
            if (!rawSec) {
              await supabaseAdmin
                .from("reservations")
                .update({ duree_recomputed_at: stamp } as any)
                .eq("id", row.id);
              results.push({
                id: row.id,
                status: "skipped",
                previous_duree_s: row.duree_s ?? null,
                new_duree_s: null,
                reason: "directions_failed",
              });
              continue;
            }

            const newDureeS = roundSecondsToMinute(rawSec);
            const oldDureeS = row.duree_s ?? 0;
            const diffMin = Math.abs(newDureeS - oldDureeS) / 60;

            if (diffMin < 1) {
              await supabaseAdmin
                .from("reservations")
                .update({ duree_recomputed_at: stamp } as any)
                .eq("id", row.id);
              results.push({
                id: row.id,
                status: "unchanged",
                previous_duree_s: oldDureeS,
                new_duree_s: newDureeS,
              });
            } else {
              const { error: upErr } = await supabaseAdmin
                .from("reservations")
                .update({ duree_s: newDureeS, duree_recomputed_at: stamp } as any)
                .eq("id", row.id);
              if (upErr) throw new Error(upErr.message);
              results.push({
                id: row.id,
                status: "updated",
                previous_duree_s: oldDureeS,
                new_duree_s: newDureeS,
              });
            }
          } catch (e) {
            // Marque quand même comme traitée pour ne pas bloquer la file.
            try {
              await supabaseAdmin
                .from("reservations")
                .update({ duree_recomputed_at: new Date().toISOString() } as any)
                .eq("id", row.id);
            } catch {
              /* noop */
            }
            results.push({
              id: row.id,
              status: "error",
              previous_duree_s: row.duree_s ?? null,
              new_duree_s: null,
              reason: e instanceof Error ? e.message : String(e),
            });
          }

          // Rate-limit léger pour respecter les serveurs OSM publics.
          await new Promise((r) => setTimeout(r, 120));
        }

        const counts = results.reduce(
          (acc, r) => {
            acc[r.status] = (acc[r.status] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        console.log(
          `[recompute-durations-tick] processed=${results.length}`,
          counts,
        );

        return Response.json({
          ok: true,
          processed: results.length,
          counts,
          results,
        });
      },
    },
  },
});
