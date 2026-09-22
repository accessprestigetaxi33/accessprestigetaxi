// Recalcul serveur de `reservations.duree_s` (à la minute près) — corrige les
// anciennes réservations dont la durée avait été calculée sur le trajet le
// plus long via rocade (inflation de 60-100%). Idempotent : ne met à jour la
// ligne que si la nouvelle valeur diffère d'au moins 1 minute.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { roundSecondsToMinute } from "@/lib/duration";

export const recomputeReservationDuration = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { osmGeocode, osmRoutes, trafficFactor } = await import("@/lib/osm.server");

    const { supabaseAdmin } = await import("@/lib/nova-supabase.server");

    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .select("id,depart,arrivee,destination,duree_s,status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { ok: false, reason: "not_found" as const };
    if (row.status === "completed" || row.status === "cancelled" || row.status === "annulee") {
      return { ok: true, changed: false, duree_s: row.duree_s ?? null, skipped: "final_status" as const };
    }

    const depart = (row.depart ?? "").trim();
    const arrivee = (row.arrivee ?? row.destination ?? "").trim();
    if (!depart || !arrivee) return { ok: false, reason: "missing_address" as const };

    const [from, to] = await Promise.all([osmGeocode(depart, "fr"), osmGeocode(arrivee, "fr")]);
    if (!from || !to) return { ok: false, reason: "geocode_failed" as const };

    // Itinéraire OSRM : on retient le plus rapide, majoré du facteur trafic.
    const routes = await osmRoutes([from.lng, from.lat], [to.lng, to.lat], true);
    if (routes.length === 0) return { ok: false, reason: "directions_failed" as const };
    const fastest = routes.reduce((a, b) => (b.durationS < a.durationS ? b : a));
    const rawSec = Math.round(fastest.durationS * trafficFactor());
    if (!rawSec) return { ok: false, reason: "directions_failed" as const };

    const newDureeS = roundSecondsToMinute(rawSec);
    const oldDureeS = row.duree_s ?? 0;
    const diffMin = Math.abs(newDureeS - oldDureeS) / 60;
    if (diffMin < 1) {
      return { ok: true, changed: false, duree_s: oldDureeS };
    }

    const { error: upErr } = await supabaseAdmin
      .from("reservations")
      .update({ duree_s: newDureeS })
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, changed: true, duree_s: newDureeS, previous_duree_s: oldDureeS };
  });
