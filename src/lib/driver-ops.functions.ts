// Espace chauffeur : stats, planning, sauvegardes.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({
  token: z.string().trim().min(6).max(120),
  as: z.string().trim().min(1).max(60).optional(),
});

async function admin() {
  const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
  return supabaseAdmin;
}
async function auth(token: string) {
  const { resolveDriverSession } = await import("@/lib/driver-session.server");
  return resolveDriverSession(token);
}

/* ───── Stats ───── */
export type DriverStat = { slug: string; name: string; rides: number; revenue: number; km: number; avg: number };
export type WeekPoint = { week: string; bySlug: Record<string, number> };

export const driverStatsCompare = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TokenSchema.extend({ period: z.enum(["week", "month", "year"]) }).parse(i))
  .handler(async ({ data }): Promise<{ stats: DriverStat[]; weeks: WeekPoint[] }> => {
    await auth(data.token);
    const db = await admin();
    const now = new Date();
    const days = data.period === "week" ? 7 : data.period === "month" ? 30 : 365;
    const since = new Date(Math.min(now.getTime() - days * 86400_000, now.getTime() - 56 * 86400_000));
    const periodStart = now.getTime() - days * 86400_000;
    const [{ data: accounts }, { data: rides }] = await Promise.all([
      db.from("driver_accounts").select("slug, name, active"),
      db
        .from("reservations")
        .select("driver_slug, status, prix_final, prix_estime, distance_reelle_km, distance_km, pickup_datetime")
        .eq("status", "completed")
        .gte("pickup_datetime", since.toISOString())
        .limit(5000),
    ]);
    const names = new Map(((accounts ?? []) as { slug: string; name: string }[]).map((a) => [a.slug, a.name]));
    const agg = new Map<string, DriverStat>();
    const weekMap = new Map<string, Record<string, number>>();
    for (const r of rides ?? []) {
      const slug = r.driver_slug ?? "equipe";
      const price = Number(r.prix_final ?? r.prix_estime ?? 0);
      const km = Number(r.distance_reelle_km ?? r.distance_km ?? 0);
      const t = new Date(r.pickup_datetime).getTime();
      if (t >= periodStart) {
        const s = agg.get(slug) ?? { slug, name: names.get(slug) ?? slug, rides: 0, revenue: 0, km: 0, avg: 0 };
        s.rides++;
        s.revenue += price;
        s.km += km;
        agg.set(slug, s);
      }
      if (t >= now.getTime() - 56 * 86400_000) {
        const d = new Date(t);
        const monday = new Date(
          Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)),
        );
        const key = monday.toISOString().slice(0, 10);
        const w = weekMap.get(key) ?? {};
        w[slug] = Math.round(((w[slug] ?? 0) + price) * 100) / 100;
        weekMap.set(key, w);
      }
    }
    const stats = [...agg.values()]
      .map((s) => ({
        ...s,
        revenue: Math.round(s.revenue * 100) / 100,
        km: Math.round(s.km * 10) / 10,
        avg: s.rides ? Math.round((s.revenue / s.rides) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
    const weeks = [...weekMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, bySlug]) => ({ week, bySlug }));
    return { stats, weeks };
  });

/* ───── Planning ───── */
export type Unavail = { id: string; driver_slug: string; starts_at: string; ends_at: string; reason: string | null };

export const driverUnavailList = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TokenSchema.parse(i))
  .handler(async ({ data }): Promise<{ rows: Unavail[]; absentNow: string[] }> => {
    await auth(data.token);
    const db = await admin();
    const { data: rows } = await db
      .from("driver_unavailability" as never)
      .select("id, driver_slug, starts_at, ends_at, reason")
      .gte("ends_at", new Date(Date.now() - 86400_000).toISOString())
      .order("starts_at")
      .limit(200);
    const list = (rows ?? []) as unknown as Unavail[];
    const n = Date.now();
    const absentNow = [
      ...new Set(
        list
          .filter((r) => new Date(r.starts_at).getTime() <= n && new Date(r.ends_at).getTime() > n)
          .map((r) => r.driver_slug),
      ),
    ];
    return { rows: list, absentNow };
  });

export const driverUnavailAdd = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    TokenSchema.extend({
      driver_slug: z.string().trim().min(1).max(60),
      starts_at: z.string().datetime({ offset: true }),
      ends_at: z.string().datetime({ offset: true }),
      reason: z.string().trim().max(200).optional(),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    await auth(data.token);
    if (new Date(data.ends_at) <= new Date(data.starts_at)) throw new Error("bad_range");
    const db = await admin();
    const { error } = await db.from("driver_unavailability" as never).insert({
      driver_slug: data.driver_slug,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      reason: data.reason || null,
    } as never);
    if (error) throw new Error("insert_failed");
    return { ok: true };
  });

export const driverUnavailDelete = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    await auth(data.token);
    const db = await admin();
    const { error } = await db
      .from("driver_unavailability" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("delete_failed");
    return { ok: true };
  });

/* ───── Sauvegardes ───── */
export const driverBackups = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TokenSchema.parse(i))
  .handler(async ({ data }) => {
    await auth(data.token);
    const db = await admin();
    const { data: files } = await db.storage.from("backups").list("", { sortBy: { column: "name", order: "desc" } });
    const out: { name: string; created_at: string | null; size: number; url: string | null }[] = [];
    for (const f of (files ?? []).filter((x) => x.name.endsWith(".json"))) {
      const { data: signed } = await db.storage.from("backups").createSignedUrl(f.name, 600);
      out.push({
        name: f.name,
        created_at: f.created_at ?? null,
        size: Number((f.metadata as { size?: number } | null)?.size ?? 0),
        url: signed?.signedUrl ?? null,
      });
    }
    return { files: out };
  });

export const driverBackupNow = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => TokenSchema.parse(i))
  .handler(async ({ data }) => {
    await auth(data.token);
    const { runBackup } = await import("@/lib/ops.server");
    return runBackup();
  });
