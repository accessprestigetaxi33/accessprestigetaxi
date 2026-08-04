import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

const DRIVERS = ["patricia", "alain"] as const;
type DriverKey = (typeof DRIVERS)[number];

export type DriverStatRow = {
  driver: DriverKey | "non_attribuee";
  total: number;
  accepted: number;
  refused: number;
  completed: number;
  pending: number;
  acceptanceRate: number; // 0-100
  avgAcceptMinutes: number | null;
  avgTripMinutes: number | null;
  revenue: number;
  km: number;
};

function bucketOf(d: string | null | undefined): DriverKey | "non_attribuee" {
  return d === "patricia" || d === "alain" ? d : "non_attribuee";
}

/** Statistiques temps réel par chauffeur (courses, taux d'acceptation, temps moyens). */
export const getDriverStats = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ days: z.number().int().min(1).max(365).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const days = data.days ?? 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const [{ data: resas }, { data: events }, { data: avis }] = await Promise.all([
      supabaseAdmin
        .from("reservations")
        .select("id,status,assigned_driver,prix_estime,distance_km,created_at,duree_s")
        .gte("created_at", since),
      supabaseAdmin
        .from("reservation_events")
        .select("reservation_id,event_type,to_value,driver,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true }),
      supabaseAdmin.from("avis").select("note").eq("status", "approved"),
    ]);

    const rows: any[] = (resas as any[]) ?? [];
    const evs: any[] = (events as any[]) ?? [];

    // Délais création → acceptation & acceptation → terminée, par réservation.
    const firstAt: Record<string, Record<string, string>> = {};
    for (const e of evs) {
      const key = e.event_type === "created" ? "created" : e.to_value;
      if (!key) continue;
      firstAt[e.reservation_id] ??= {};
      firstAt[e.reservation_id][key] ??= e.created_at;
    }

    const empty = (driver: DriverStatRow["driver"]): DriverStatRow => ({
      driver,
      total: 0,
      accepted: 0,
      refused: 0,
      completed: 0,
      pending: 0,
      acceptanceRate: 0,
      avgAcceptMinutes: null,
      avgTripMinutes: null,
      revenue: 0,
      km: 0,
    });

    const acc: Record<string, DriverStatRow> = {
      patricia: empty("patricia"),
      alain: empty("alain"),
      non_attribuee: empty("non_attribuee"),
    };
    const acceptDelays: Record<string, number[]> = { patricia: [], alain: [], non_attribuee: [] };
    const tripDurations: Record<string, number[]> = { patricia: [], alain: [], non_attribuee: [] };

    for (const r of rows) {
      const b = bucketOf(r.assigned_driver);
      const s = acc[b];
      s.total += 1;
      const st = String(r.status ?? "");
      const marks = firstAt[r.id] ?? {};
      const wasAccepted = !!marks["accepted"] || ["accepted", "en_route", "arrived", "completed", "terminee"].includes(st);
      if (wasAccepted) s.accepted += 1;
      if (["cancelled", "refused", "refusee", "annulee"].includes(st)) s.refused += 1;
      if (["completed", "terminee"].includes(st)) {
        s.completed += 1;
        s.revenue += Number(r.prix_estime ?? 0);
        s.km += Number(r.distance_km ?? 0);
      }
      if (st === "pending") s.pending += 1;

      const created = marks["created"] ?? r.created_at;
      if (created && marks["accepted"]) {
        const d = (new Date(marks["accepted"]).getTime() - new Date(created).getTime()) / 60000;
        if (d >= 0 && d < 60 * 24) acceptDelays[b].push(d);
      }
      const end = marks["completed"] ?? marks["terminee"];
      if (marks["accepted"] && end) {
        const d = (new Date(end).getTime() - new Date(marks["accepted"]).getTime()) / 60000;
        if (d >= 0 && d < 60 * 12) tripDurations[b].push(d);
      } else if (r.duree_s) {
        tripDurations[b].push(Number(r.duree_s) / 60);
      }
    }

    const avg = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null);
    for (const key of Object.keys(acc)) {
      const s = acc[key];
      const decided = s.accepted + s.refused;
      s.acceptanceRate = decided > 0 ? Math.round((s.accepted / decided) * 100) : 0;
      s.avgAcceptMinutes = avg(acceptDelays[key]);
      s.avgTripMinutes = avg(tripDurations[key]);
      s.revenue = Math.round(s.revenue);
      s.km = Math.round(s.km);
    }

    const notes = ((avis as any[]) ?? []).map((a) => Number(a.note)).filter((n) => Number.isFinite(n));
    const note = notes.length ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10 : 0;

    // Répartition par jour (7 derniers jours) pour le mini graphe.
    const byDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d.getTime() + 86400000);
      byDay.push({
        date: d.toISOString().slice(0, 10),
        count: rows.filter((r) => {
          const t = new Date(r.created_at).getTime();
          return t >= d.getTime() && t < next.getTime();
        }).length,
      });
    }

    return {
      days,
      note,
      byDay,
      drivers: [acc.patricia, acc.alain, acc.non_attribuee] as DriverStatRow[],
      global: {
        total: rows.length,
        completed: acc.patricia.completed + acc.alain.completed + acc.non_attribuee.completed,
        revenue: acc.patricia.revenue + acc.alain.revenue + acc.non_attribuee.revenue,
        km: acc.patricia.km + acc.alain.km + acc.non_attribuee.km,
      },
    };
  });

/** Historique horodaté des demandes, attributions et changements de statut. */
export const listReservationEvents = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      limit: z.number().int().min(1).max(200).optional(),
      driver: z.enum(["patricia", "alain", "all"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("reservation_events")
      .select("id,reservation_id,event_type,from_value,to_value,driver,client_name,depart,destination,created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 60);
    if (data.driver && data.driver !== "all") q = q.eq("driver", data.driver);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { events: (rows as any[]) ?? [] };
  });
