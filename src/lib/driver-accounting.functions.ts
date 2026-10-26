// Comptabilité de l'espace chauffeur : chiffre d'affaires, URSSAF, factures.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({ token: z.string().trim().min(6).max(120) });

export type Expense = {
  id: string;
  driver_slug: string;
  label: string;
  category: string;
  amount: number;
  expense_date: string;
  odometer_km: number | null;
  distance_km: number | null;
  liters: number | null;
  receipt_url: string | null;
  created_at: string;
};

export type RideCost = {
  id: string;
  tracking_id: string | null;
  pickup_datetime: string;
  depart: string | null;
  arrivee: string | null;
  distance_km: number;
  price: number;
  cost: number;
  margin: number;
};

export type MonthAccounting = {
  month: string;
  urssafRate: number;
  driverShareRate: number;
  revenue: number;
  rides: number;
  urssaf: number;
  expenses: number;
  net: number;
  /** Kilomètres réellement parcourus en course sur le mois. */
  km: number;
  fuelCost: number;
  fuelLiters: number;
  maintenanceCost: number;
  otherCost: number;
  /** Coût réel au kilomètre (carburant + entretien + autres) / km parcourus. */
  costPerKm: number;
  consumption: number;
  rideCosts: RideCost[];
  drivers: { slug: string; name: string; rides: number; revenue: number; share: number }[];
  expenseList: Expense[];
  months: { month: string; revenue: number; rides: number }[];
};


async function admin() {
  const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
  return supabaseAdmin;
}

async function resolveDriver(token: string) {
  const { resolveDriverSession } = await import("@/lib/driver-session.server");
  return resolveDriverSession(token);
}


function round(n: number) {
  return Math.round(n * 100) / 100;
}

async function signReceipts(rows: any[]) {
  const db = await admin();
  const out: Expense[] = [];
  for (const r of rows) {
    let url: string | null = null;
    if (r.receipt_path) {
      const { data } = await db.storage.from("receipts").createSignedUrl(r.receipt_path, 3600);
      url = data?.signedUrl ?? null;
    }
    out.push({
      id: r.id,
      driver_slug: r.driver_slug,
      label: r.label,
      category: r.category,
      amount: Number(r.amount ?? 0),
      expense_date: r.expense_date,
      odometer_km: r.odometer_km == null ? null : Number(r.odometer_km),
      distance_km: r.distance_km == null ? null : Number(r.distance_km),
      liters: r.liters == null ? null : Number(r.liters),
      receipt_url: url,
      created_at: r.created_at,
    });

  }
  return out;
}

/** Synthèse comptable d'un mois : CA des 2 chauffeurs, URSSAF, factures, net. */
export const driverMonthAccounting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ month: z.string().regex(/^\d{4}-\d{2}$/).optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<MonthAccounting> => {
    await resolveDriver(data.token);
    const db = await admin();

    const now = new Date();
    const month = data.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [y, m] = month.split("-").map(Number) as [number, number];
    const from = new Date(Date.UTC(y, m - 1, 1));
    const to = new Date(Date.UTC(y, m, 1));

    const { data: settings } = await db
      .from("accounting_settings")
      .select("urssaf_rate, driver_share_rate")
      .eq("id", 1)
      .maybeSingle();
    const urssafRate = Number(settings?.urssaf_rate ?? 21.2);
    const driverShareRate = Number(settings?.driver_share_rate ?? 0);

    const { data: accounts } = await db.from("driver_accounts").select("slug, name").order("slug");

    const yearStart = new Date(Date.UTC(y - 1, m - 1, 1));
    const { data: rides } = await db
      .from("reservations")
      .select("id, tracking_id, depart, arrivee, destination, pickup_datetime, status, prix_estime, prix_final, distance_km, distance_reelle_km, driver_slug")
      .gte("pickup_datetime", yearStart.toISOString())
      .lt("pickup_datetime", to.toISOString())
      .limit(2000);


    const valid = (rides ?? []).filter((r) => r.status !== "cancelled");
    const inMonth = valid.filter((r) => new Date(r.pickup_datetime) >= from);

    const revenue = round(inMonth.reduce((s, r) => s + Number(r.prix_estime ?? 0), 0));
    const perDriver = (accounts ?? []).map((a) => {
      const sel = inMonth.filter((r) => r.driver_slug === a.slug);
      const rev = round(sel.reduce((s, r) => s + Number(r.prix_estime ?? 0), 0));
      return {
        slug: a.slug,
        name: a.name,
        rides: sel.length,
        revenue: rev,
        share: round((rev * driverShareRate) / 100),
      };
    });

    const byMonth = new Map<string, { revenue: number; rides: number }>();
    for (const r of valid) {
      const key = String(r.pickup_datetime).slice(0, 7);
      const cur = byMonth.get(key) ?? { revenue: 0, rides: 0 };
      cur.rides += 1;
      cur.revenue = round(cur.revenue + Number(r.prix_estime ?? 0));
      byMonth.set(key, cur);
    }

    const { data: expenseRows } = await db
      .from("driver_expenses")
      .select("*")
      .gte("expense_date", from.toISOString().slice(0, 10))
      .lt("expense_date", to.toISOString().slice(0, 10))
      .order("expense_date", { ascending: false });

    const expenseList = await signReceipts(expenseRows ?? []);
    const expenses = round(expenseList.reduce((s, e) => s + e.amount, 0));
    const urssaf = round((revenue * urssafRate) / 100);

    // Coût réel : uniquement des justificatifs saisis, rapportés aux km réellement parcourus.
    const norm = (c: string) => c.toLowerCase();
    const sumBy = (match: (c: string) => boolean) =>
      round(expenseList.filter((e) => match(norm(e.category))).reduce((s, e) => s + e.amount, 0));
    const fuelCost = sumBy((c) => c.startsWith("carburant"));
    const maintenanceCost = sumBy((c) => c.startsWith("entretien"));
    const otherCost = round(expenses - fuelCost - maintenanceCost);
    const fuelLiters = round(expenseList.reduce((s, e) => s + (e.liters ?? 0), 0));

    const ridesKm = round(inMonth.reduce((s, r) => s + Number(r.distance_reelle_km ?? r.distance_km ?? 0), 0));
    const declaredKm = round(expenseList.reduce((s, e) => s + (e.distance_km ?? 0), 0));
    const km = round(Math.max(ridesKm, declaredKm));
    const costPerKm = km > 0 ? Math.round((expenses / km) * 1000) / 1000 : 0;
    const consumption = km > 0 && fuelLiters > 0 ? round((fuelLiters / km) * 100) : 0;

    const rideCosts: RideCost[] = inMonth
      .map((r) => {
        const dist = round(Number(r.distance_reelle_km ?? r.distance_km ?? 0));
        const price = round(Number(r.prix_final ?? r.prix_estime ?? 0));
        const cost = round(dist * costPerKm);
        return {
          id: r.id,
          tracking_id: r.tracking_id ?? null,
          pickup_datetime: r.pickup_datetime,
          depart: r.depart ?? null,
          arrivee: r.arrivee ?? r.destination ?? null,
          distance_km: dist,
          price,
          cost,
          margin: round(price - cost),
        };
      })
      .sort((a, b) => (a.pickup_datetime < b.pickup_datetime ? 1 : -1));

    return {
      month,
      urssafRate,
      driverShareRate,
      revenue,
      rides: inMonth.length,
      urssaf,
      expenses,
      net: round(revenue - urssaf - expenses),
      km,
      fuelCost,
      fuelLiters,
      maintenanceCost,
      otherCost,
      costPerKm,
      consumption,
      rideCosts,
      drivers: perDriver,
      expenseList,
      months: [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([mo, v]) => ({ month: mo, ...v })),
    };
  });


/** Enregistre une facture (photo optionnelle en base64). */
export const driverAddExpense = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      label: z.string().trim().min(1).max(160),
      category: z.string().trim().min(1).max(40),
      amount: z.number().min(0).max(100000),
      expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      odometer_km: z.number().min(0).max(5_000_000).optional(),
      distance_km: z.number().min(0).max(100000).optional(),
      liters: z.number().min(0).max(2000).optional(),

      file: z
        .object({ name: z.string().max(200), type: z.string().max(80), base64: z.string().max(22_000_000) })
        .optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const driver = await resolveDriver(data.token);
    const db = await admin();

    let receipt_path: string | null = null;
    if (data.file) {
      const bytes = Buffer.from(data.file.base64, "base64");
      const ext = (data.file.name.split(".").pop() ?? "jpg").toLowerCase().slice(0, 5);
      receipt_path = `${driver.slug}/${crypto.randomUUID()}.${ext}`;
      const { error } = await db.storage
        .from("receipts")
        .upload(receipt_path, bytes, { contentType: data.file.type || "image/jpeg", upsert: false });
      if (error) {
        console.error("[driver] receipt upload failed", error);
        throw new Error("upload_failed");
      }
    }

    const { error } = await db.from("driver_expenses").insert({
      driver_slug: driver.slug,
      label: data.label,
      category: data.category,
      amount: data.amount,
      expense_date: data.expense_date,
      odometer_km: data.odometer_km ?? null,
      distance_km: data.distance_km ?? null,
      liters: data.liters ?? null,
      receipt_path,

    });
    if (error) throw new Error("insert_failed");
    return { ok: true };
  });

/** Supprime une facture. */
export const driverDeleteExpense = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await resolveDriver(data.token);
    const db = await admin();
    const { data: row } = await db.from("driver_expenses").select("receipt_path").eq("id", data.id).maybeSingle();
    if (row?.receipt_path) await db.storage.from("receipts").remove([row.receipt_path]);
    const { error } = await db.from("driver_expenses").delete().eq("id", data.id);
    if (error) throw new Error("delete_failed");
    return { ok: true };
  });

/** Met à jour le taux URSSAF et la part reversée aux chauffeurs. */
export const driverUpdateAccountingSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      urssaf_rate: z.number().min(0).max(100),
      driver_share_rate: z.number().min(0).max(100),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    await resolveDriver(data.token);
    const db = await admin();
    const { error } = await db
      .from("accounting_settings")
      .upsert({
        id: 1,
        urssaf_rate: data.urssaf_rate,
        driver_share_rate: data.driver_share_rate,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error("update_failed");
    return { ok: true };
  });
