// Espace chauffeur : onglets messages, clients, avis, statistiques, GPS, appareils.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({
  token: z.string().trim().min(6).max(120),
  // Profil actif de l'espace commun (Adam/Ayoub, Alain/Patricia, ...) — sans
  // ça, tout ici (chat, GPS, messages) retombe sur le compte propriétaire de
  // la session au lieu du profil réellement sélectionné sur l'appareil.
  as: z.string().trim().min(1).max(60).optional(),
});

async function admin() {
  const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
  return supabaseAdmin;
}

async function resolveDriver(token: string, as?: string): Promise<{ slug: string; name: string }> {
  const { resolveDriverSession } = await import("@/lib/driver-session.server");
  const base = await resolveDriverSession(token);
  if (!as) return base;
  const db = await admin();
  const { data: profile } = await db.from("driver_accounts").select("slug, name, active").eq("slug", as).maybeSingle();
  if ((profile as { slug: string; name: string; active: boolean } | null)?.active) {
    const p = profile as { slug: string; name: string };
    await db.from("driver_accounts").update({ last_seen_at: new Date().toISOString() }).eq("slug", p.slug);
    return { slug: p.slug, name: p.name };
  }
  return base;
}

/* ─────────────── Messages ─────────────── */

export type DriverThread = {
  reservation_id: string;
  client: string;
  tracking_id: string | null;
  pickup_datetime: string;
  depart: string | null;
  destination: string | null;
  last_message: string;
  last_at: string;
  unread: number;
};

export type DriverMessage = {
  id: string;
  sender: string;
  content: string;
  created_at: string;
};

export const driverThreads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ threads: DriverThread[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: msgs, error } = await db
      .from("reservation_messages")
      .select("id, reservation_id, sender, content, created_at, read_by_chauffeur")
      .order("created_at", { ascending: false })
      .limit(400);
    if (error) throw new Error("list_failed");
    const rows = msgs ?? [];
    const ids = [...new Set(rows.map((m) => m.reservation_id))];
    const { data: resas } = ids.length
      ? await db
          .from("reservations")
          .select("id, nom, client_name, tracking_id, pickup_datetime, depart, destination, arrivee")
          .in("id", ids)
      : { data: [] as never[] };
    const byId = new Map((resas ?? []).map((r) => [r.id, r]));
    const threads = new Map<string, DriverThread>();
    for (const m of rows) {
      const r = byId.get(m.reservation_id);
      const cur = threads.get(m.reservation_id);
      if (!cur) {
        threads.set(m.reservation_id, {
          reservation_id: m.reservation_id,
          client: (r?.client_name || r?.nom || "Client") as string,
          tracking_id: (r?.tracking_id ?? null) as string | null,
          pickup_datetime: (r?.pickup_datetime ?? m.created_at) as string,
          depart: (r?.depart ?? null) as string | null,
          destination: (r?.destination ?? r?.arrivee ?? null) as string | null,
          last_message: m.content,
          last_at: m.created_at,
          unread: !m.read_by_chauffeur && m.sender !== "chauffeur" ? 1 : 0,
        });
      } else if (!m.read_by_chauffeur && m.sender !== "chauffeur") {
        cur.unread += 1;
      }
    }
    return { threads: [...threads.values()] };
  });

export const driverThreadMessages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ reservationId: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ messages: DriverMessage[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("reservation_messages")
      .select("id, sender, content, created_at")
      .eq("reservation_id", data.reservationId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error("list_failed");
    // Marque uniquement les messages client comme lus (RPC dédiée).
    const { error: rpcError } = await (db.rpc as any)("mark_reservation_read_by_chauffeur", {
      p_reservation_id: data.reservationId,
    });
    if (rpcError) console.warn("[driver] mark read failed", rpcError);
    return { messages: (rows ?? []) as DriverMessage[] };
  });

export const driverSendMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      reservationId: z.string().uuid(),
      content: z.string().trim().min(1).max(1000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { error } = await db.from("reservation_messages").insert({
      reservation_id: data.reservationId,
      sender: "chauffeur",
      content: data.content,
      read_by_chauffeur: true,
      read_by_client: false,
    });
    if (error) throw new Error("insert_failed");
    try {
      const { data: reservation } = await db
        .from("reservations")
        .select("tracking_id, suivi_id")
        .eq("id", data.reservationId)
        .maybeSingle();
      const trackingRef = reservation?.tracking_id ?? reservation?.suivi_id ?? data.reservationId;
      const trackingUrl = `/suivi/${trackingRef}#chat-chauffeur`;
      const { sendPushToAudience } = await import("@/lib/push.server");
      await sendPushToAudience(
        "client",
        {
          title: "Message de votre chauffeur",
          body: data.content.slice(0, 120),
          url: trackingUrl,
          // Suffixe horodaté : chaque message est une notification distincte
          // (le garde-fou anti-doublon ignore volontairement ces tags).
          tag: `msg-${data.reservationId}-${Date.now()}`,
          // Bouton d'action : ouvre directement la conversation de suivi.
          actions: [{ action: "reply", title: "Répondre" }],
          data: { url: trackingUrl, audience: "client", kind: "chat" },
        },
        { reservationId: data.reservationId },
      );
    } catch (e) {
      console.warn("[driver] message push failed", e);
    }
    return { ok: true as const };
  });

/* ─────────────── Clients ─────────────── */

export type DriverClient = {
  name: string;
  phone: string | null;
  email: string | null;
  rides: number;
  revenue: number;
  last_at: string | null;
};

export type DriverClientRide = {
  id: string;
  pickup_datetime: string;
  depart: string | null;
  destination: string | null;
  arrivee: string | null;
  status: string;
  prix_estime: number | null;
  prix_final?: number | null;
  distance_km?: number | null;
  message?: string | null;
};

export type DriverClientProfile = {
  rides: DriverClientRide[];
  /** Adresses les plus utilisées par ce client (départ + arrivée). */
  addresses: { address: string; count: number }[];
  /** Remarques laissées par le client lors de ses réservations. */
  notes: { at: string; text: string }[];
};

/** Fiche client : historique, adresses habituelles et remarques. */
export const driverClientHistory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      phone: z
        .string()
        .max(30)
        .regex(/^[0-9+ ().-]*$/, "invalid_phone")
        .nullable(),
      name: z.string().max(120),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<DriverClientProfile> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const SELECT =
      "id, pickup_datetime, depart, destination, arrivee, status, prix_estime, prix_final, distance_km, message, nom, client_name, telephone, client_phone";
    const columns = data.phone ? (["telephone", "client_phone"] as const) : (["nom", "client_name"] as const);
    const value = data.phone ? data.phone : data.name;

    // Deux requêtes paramétrées (.eq) au lieu d'un filtre .or() concaténé :
    // la valeur saisie ne peut jamais modifier la structure du filtre.
    const results = await Promise.all(
      columns.map((col) =>
        db.from("reservations").select(SELECT).eq(col, value).order("pickup_datetime", { ascending: false }).limit(50),
      ),
    );
    if (results.some((r) => r.error)) throw new Error("list_failed");

    const byId = new Map<string, DriverClientRide>();
    for (const r of results) {
      for (const row of (r.data ?? []) as DriverClientRide[]) {
        byId.set(row.id, row);
      }
    }
    const rides = [...byId.values()].sort((a, b) => (a.pickup_datetime < b.pickup_datetime ? 1 : -1)).slice(0, 50);

    const counts = new Map<string, number>();
    for (const r of rides) {
      for (const a of [r.depart, r.destination ?? r.arrivee]) {
        const key = (a ?? "").trim();
        if (key.length < 3) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const addresses = [...counts.entries()]
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const notes = rides
      .filter((r) => (r.message ?? "").trim().length > 0)
      .slice(0, 15)
      .map((r) => ({ at: r.pickup_datetime, text: (r.message as string).trim() }));

    return { rides, addresses, notes };
  });

export const driverClients = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ clients: DriverClient[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("reservations")
      .select("nom, client_name, telephone, client_phone, email, client_email, prix_estime, pickup_datetime, status")
      .order("pickup_datetime", { ascending: false })
      .limit(800);
    if (error) throw new Error("list_failed");
    const map = new Map<string, DriverClient>();
    for (const r of rows ?? []) {
      const phone = (r.client_phone || r.telephone || "") as string;
      const name = ((r.client_name || r.nom || "Client") as string).trim();
      const key = phone || name.toLowerCase();
      const cur =
        map.get(key) ??
        ({
          name,
          phone: phone || null,
          email: ((r.client_email || r.email) as string | null) ?? null,
          rides: 0,
          revenue: 0,
          last_at: null,
        } satisfies DriverClient);
      if (r.status !== "cancelled") {
        cur.rides += 1;
        cur.revenue = Math.round((cur.revenue + Number(r.prix_estime ?? 0)) * 100) / 100;
      }
      if (!cur.last_at || r.pickup_datetime > cur.last_at) cur.last_at = r.pickup_datetime;
      map.set(key, cur);
    }
    return {
      clients: [...map.values()].sort((a, b) => b.rides - a.rides).slice(0, 200),
    };
  });

/* ─────────────── Fiches clients (table clients, créées automatiquement à la résa) ─────────────── */

export type ClientCard = {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  total_courses: number;
  total_depense: number;
  last_ride_at: string | null;
  last_depart: string | null;
  last_arrivee: string | null;
};

const CARD_COLS =
  "id, name, first_name, last_name, phone, email, address, notes, total_courses, total_depense, last_ride_at, last_depart, last_arrivee";

export const driverClientCards = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ cards: ClientCard[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("clients")
      .select(CARD_COLS)
      .order("last_ride_at", { ascending: false, nullsFirst: false })
      .limit(500);
    if (error) throw new Error("list_failed");
    return {
      cards: ((rows ?? []) as unknown as ClientCard[]).map((c) => ({
        ...c,
        total_courses: Number(c.total_courses ?? 0),
        total_depense: Number(c.total_depense ?? 0),
      })),
    };
  });

const opt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))
    .nullable();

export const driverUpdateClientCard = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(120),
      first_name: opt(80),
      last_name: opt(80),
      phone: z
        .string()
        .trim()
        .max(30)
        .regex(/^[0-9+ ().-]*$/, "invalid_phone")
        .transform((v) => (v.length ? v : null))
        .nullable(),
      email: z
        .string()
        .trim()
        .max(255)
        .refine((v) => v === "" || z.string().email().safeParse(v).success, "invalid_email")
        .transform((v) => (v.length ? v.toLowerCase() : null))
        .nullable(),
      address: opt(300),
      notes: opt(2000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { id, token: _t, ...patch } = data;
    const { error } = await db
      .from("clients")
      .update(patch as never)
      .eq("id", id);
    if (error) throw new Error("update_failed");
    return { ok: true };
  });

/* ─────────────── Avis ─────────────── */

export type DriverAvis = {
  id: string;
  author_name: string;
  note: number;
  commentaire: string | null;
  status: string;
  created_at: string;
};

export const driverAvisList = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ avis: DriverAvis[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("avis")
      .select("id, author_name, note, commentaire, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("list_failed");
    return { avis: (rows ?? []) as DriverAvis[] };
  });

export const driverAvisSetStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      id: z.string().uuid(),
      status: z.enum(["approved", "pending", "rejected"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { error } = await db.from("avis").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("update_failed");
    return { ok: true as const };
  });

export const driverAvisDelete = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { error } = await db.from("avis").delete().eq("id", data.id);
    if (error) throw new Error("delete_failed");
    return { ok: true as const };
  });

/* ─────────────── Statistiques ─────────────── */

export type DriverStats = {
  totals: { rides: number; revenue: number; avgTicket: number; km: number };
  byStatus: { status: string; count: number }[];
  byMonth: { month: string; rides: number; revenue: number }[];
  byDriver: { slug: string; name: string; rides: number; revenue: number }[];
  topDestinations: { label: string; count: number }[];
  avgNote: number | null;
};

export const driverStats = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<DriverStats> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const since = new Date();
    since.setUTCMonth(since.getUTCMonth() - 11, 1);
    const [{ data: rows, error }, { data: accounts }, { data: notes }] = await Promise.all([
      db
        .from("reservations")
        .select("status, prix_estime, distance_km, pickup_datetime, destination, arrivee, driver_slug")
        .gte("pickup_datetime", since.toISOString())
        .limit(2000),
      db.from("driver_accounts").select("slug, name").eq("active", true),
      db.from("avis").select("note").eq("status", "approved").limit(500),
    ]);
    if (error) throw new Error("list_failed");
    const all = rows ?? [];
    const done = all.filter((r) => r.status !== "cancelled");
    const revenue = done.reduce((s, r) => s + Number(r.prix_estime ?? 0), 0);
    const km = done.reduce((s, r) => s + Number(r.distance_km ?? 0), 0);

    const count = <T extends string>(list: (T | null)[]) => {
      const m = new Map<string, number>();
      for (const v of list) {
        const k = (v ?? "—").toString();
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return m;
    };

    const byMonth = new Map<string, { rides: number; revenue: number }>();
    for (const r of done) {
      const key = String(r.pickup_datetime).slice(0, 7);
      const cur = byMonth.get(key) ?? { rides: 0, revenue: 0 };
      cur.rides += 1;
      cur.revenue += Number(r.prix_estime ?? 0);
      byMonth.set(key, cur);
    }

    const drivers = (accounts ?? []) as { slug: string; name: string }[];
    const noteList = (notes ?? []).map((n) => Number(n.note)).filter((n) => n > 0);

    return {
      totals: {
        rides: done.length,
        revenue: Math.round(revenue * 100) / 100,
        avgTicket: done.length ? Math.round((revenue / done.length) * 100) / 100 : 0,
        km: Math.round(km),
      },
      byStatus: [...count(all.map((r) => r.status as string))].map(([status, c]) => ({
        status,
        count: c,
      })),
      byMonth: [...byMonth.entries()]
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([month, v]) => ({ month, rides: v.rides, revenue: Math.round(v.revenue * 100) / 100 })),
      byDriver: drivers.map((d) => {
        const sel = done.filter((r) => r.driver_slug === d.slug);
        return {
          slug: d.slug,
          name: d.name,
          rides: sel.length,
          revenue: Math.round(sel.reduce((s, r) => s + Number(r.prix_estime ?? 0), 0) * 100) / 100,
        };
      }),
      topDestinations: [...count(done.map((r) => (r.destination ?? r.arrivee) as string | null))]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, c]) => ({ label, count: c })),
      avgNote: noteList.length ? Math.round((noteList.reduce((s, n) => s + n, 0) / noteList.length) * 10) / 10 : null,
    };
  });

/* ─────────────── Position GPS ─────────────── */

export type DriverGps = {
  id: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  updated_at: string;
};

export const driverGpsState = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ rows: DriverGps[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("driver_gps")
      .select("id, is_active, latitude, longitude, speed, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);
    if (error) throw new Error("list_failed");
    return { rows: (rows ?? []) as DriverGps[] };
  });

export const driverGpsPush = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().nullable().optional(),
      speed: z.number().nullable().optional(),
      heading: z.number().nullable().optional(),
      active: z.boolean().default(true),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const now = new Date().toISOString();
    // `.select()` force une réponse avec corps : sans lui, la réponse vide de
    // l'écriture reste en attente dans le runtime serveur et la position
    // n'était jamais enregistrée.
    const { error } = await db
      .from("driver_gps")
      .upsert(
        {
          id: driver.slug,
          is_active: data.active,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy ?? null,
          speed: data.speed ?? null,
          heading: data.heading ?? null,
          updated_at: now,
          heartbeat_at: now,
        },
        { onConflict: "id" },
      )
      .select("id");
    if (error) throw new Error("update_failed");
    return { ok: true as const };
  });

export const driverGpsStop = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    await db.from("driver_gps").update({ is_active: false }).eq("id", driver.slug);
    return { ok: true as const };
  });

/* ─────────────── Appareils (notifications) ─────────────── */

export type DriverDevice = {
  id: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string | null;
  driver_id: string | null;
};

export const driverDevices = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ devices: DriverDevice[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("push_subscriptions")
      .select("id, user_agent, created_at, last_seen_at, expires_at, driver_id")
      .eq("audience", "chauffeur")
      .order("last_seen_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("list_failed");
    return { devices: (rows ?? []) as DriverDevice[] };
  });

export const driverDeviceDelete = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { error } = await db.from("push_subscriptions").delete().eq("id", data.id);
    if (error) throw new Error("delete_failed");
    return { ok: true as const };
  });

export const driverTestPush = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ deviceId: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data }) => {
    const driver = await resolveDriver(data.token, data.as);
    const { sendPushToAudience } = await import("@/lib/push.server");
    const res = await sendPushToAudience(
      "chauffeur",
      {
        title: data.deviceId ? "Test ciblé" : "Test de notification",
        body: data.deviceId
          ? `Test envoyé sur cet appareil précis (${driver.name}).`
          : `Tout fonctionne, ${driver.name}.`,
        url: "/driver",
        tag: `test-${Date.now()}`,
      },
      { subscriptionId: data.deviceId ?? null },
    );
    return {
      ok: true as const,
      sent: res.sent,
      reason: res.reason ?? null,
      diagnostic:
        res.sent === 0
          ? res.reason === "no_matching_subscriptions"
            ? "Aucun appareil enregistré ne correspond. Activez les notifications depuis l'app installée sur le téléphone."
            : res.reason === "fcm_auth_failed"
              ? "Le service d'envoi n'a pas pu s'authentifier (configuration Firebase)."
              : "L'envoi n'a atteint aucun appareil — consultez le journal des échecs."
          : null,
    };
  });

/* ─────────────── Journal des envois / échecs ─────────────── */

export type PushFailureRow = {
  id: string;
  created_at: string;
  audience: string;
  tag: string | null;
  http_status: number | null;
  error_code: string | null;
  title: string | null;
  user_agent: string | null;
  fcm_token_suffix: string | null;
};

/** Journal des notifications qui n'ont pas pu être délivrées. */
export const driverPushFailures = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ failures: PushFailureRow[]; sends: PushFailureRow[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: failures } = await db
      .from("push_send_failures")
      .select("id, created_at, audience, tag, http_status, error_code, title, user_agent, fcm_token_suffix")
      .order("created_at", { ascending: false })
      .limit(30);
    const { data: sends } = await db
      .from("push_send_log")
      .select("id, created_at, audience, tag, http_status, error_code, title, fcm_token_suffix")
      .order("created_at", { ascending: false })
      .limit(30);
    return {
      failures: (failures ?? []) as PushFailureRow[],
      sends: ((sends ?? []) as any[]).map((s) => ({ ...s, user_agent: null })) as PushFailureRow[],
    };
  });

/* ─────────────── Planning (calendrier) ─────────────── */

export type PlanningRide = {
  id: string;
  nom: string | null;
  telephone: string | null;
  pickup_datetime: string;
  depart: string | null;
  arrivee: string | null;
  destination: string | null;
  status: string;
  prix_estime: number | null;
  driver_slug: string | null;
};

/** Courses d'un mois donné (pour l'affichage calendrier). */
export const driverPlanningMonth = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      year: z.number().int().min(2020).max(2100),
      month: z.number().int().min(0).max(11),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<{ rides: PlanningRide[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const from = new Date(Date.UTC(data.year, data.month, 1, 0, 0, 0));
    const to = new Date(Date.UTC(data.year, data.month + 1, 1, 0, 0, 0));
    const { data: rows, error } = await db
      .from("reservations")
      .select("id, nom, telephone, pickup_datetime, depart, arrivee, destination, status, prix_estime, driver_slug")
      .gte("pickup_datetime", from.toISOString())
      .lt("pickup_datetime", to.toISOString())
      .order("pickup_datetime", { ascending: true })
      .limit(500);
    if (error) throw new Error("list_failed");
    return { rides: (rows ?? []) as PlanningRide[] };
  });

/* ─────────────── Discussion entre chauffeurs ─────────────── */

export type TeamMessage = {
  id: string;
  sender_slug: string;
  content: string;
  created_at: string;
};

/** Derniers messages de la discussion interne de l'équipe. */
export const driverTeamChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<TeamMessage[]> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("driver_chat")
      .select("id, sender_slug, content, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("chat_failed");
    return (rows ?? []).reverse() as TeamMessage[];
  });

/** Envoie un message dans la discussion interne de l'équipe. */
export const driverTeamChatSend = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ content: z.string().trim().min(1).max(1000) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const { error } = await db.from("driver_chat").insert({ sender_slug: driver.slug, content: data.content });
    if (error) throw new Error("chat_send_failed");
    return { ok: true };
  });
