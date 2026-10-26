// Espace chauffeur : accès par jeton personnel (sans mot de passe).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { detaillerPrix } from "@/lib/tarif";

const TokenSchema = z.object({
  token: z.string().trim().min(6).max(120),
  // Profil actif de l'espace commun : n'importe quel slug de chauffeur actif
  // (nombre illimité de profils, ex. adam/ayoub/mehdi/... — voir driver_accounts).
  as: z.string().trim().min(1).max(60).optional(),
});
const EmailPasswordSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(6).max(200),
});

export type DriverIdentity = { slug: string; name: string };

export type DriverRide = {
  id: string;
  tracking_id: string | null;
  depart: string | null;
  arrivee: string | null;
  destination: string | null;
  pickup_datetime: string;
  status: string;
  prix_estime: number | null;
  distance_km: number | null;
  nom: string | null;
  telephone: string | null;
  driver_slug: string | null;
  overflow_from_slug: string | null;
  overflow_at: string | null;
  overflow_taken_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  distance_reelle_km: number | null;
  duree_reelle_s: number | null;
  prix_final: number | null;
  client_lat: number | null;
  client_lng: number | null;
  client_pos_at: string | null;
  email: string | null;
  passagers: number | null;
  bagages: number | null;
};

export type DriverAccounting = {
  today: { rides: number; revenue: number };
  week: { rides: number; revenue: number };
  month: { rides: number; revenue: number };
  year: { rides: number; revenue: number };
  months: { month: string; rides: number; revenue: number }[];
  rides: DriverRide[];
};

const RIDE_COLS =
  "id, tracking_id, depart, arrivee, destination, pickup_datetime, status, prix_estime, distance_km, nom, telephone, driver_slug, overflow_from_slug, overflow_at, overflow_taken_at, started_at, completed_at, distance_reelle_km, duree_reelle_s, prix_final, client_lat, client_lng, client_pos_at, email, passagers, bagages";

async function admin() {
  const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
  return supabaseAdmin;
}

/** Sessions chauffeur sans expiration : valides jusqu'à déconnexion explicite. */
const NEVER_EXPIRES = new Date("2126-01-01T00:00:00Z").toISOString();

/** Empreinte SHA-256 : la base ne stocke jamais le jeton en clair. */
async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Crée un jeton de session aléatoire lié à un chauffeur. */
async function createSession(slug: string): Promise<string> {
  const db = await admin();
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const { error } = await db
    .from("driver_sessions")
    .insert({ slug, token_hash: await hashToken(token), expires_at: NEVER_EXPIRES });
  if (error) {
    console.error("[driver] session create failed", error);
    throw new Error("session_failed");
  }
  return token;
}

async function resolveDriver(token: string, as?: string): Promise<DriverIdentity> {
  const db = await admin();
  const { data: session, error: sessionError } = await db
    .from("driver_sessions")
    .select("id, slug, expires_at")
    .eq("token_hash", await hashToken(token))
    .maybeSingle();
  if (sessionError) {
    console.error("[driver] session lookup failed", sessionError);
    throw new Error("lookup_failed");
  }
  if (!session) throw new Error("invalid_token");
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await db.from("driver_sessions").delete().eq("id", session.id);
    throw new Error("session_expired");
  }
  const { data, error } = await db
    .from("driver_accounts")
    .select("slug, name, active")
    .eq("slug", session.slug)
    .maybeSingle();
  if (error) {
    console.error("[driver] lookup failed", error);
    throw new Error("lookup_failed");
  }
  if (!data || !data.active) throw new Error("invalid_token");
  const now = new Date().toISOString();
  await db.from("driver_sessions").update({ last_used_at: now }).eq("id", session.id);
  await db.from("driver_accounts").update({ last_seen_at: now }).eq("slug", data.slug);
  // Espace commun : le profil choisi sur l'appareil (Adam / Ayoub) devient
  // l'identité effective pour l'attribution et le passage de course.
  if (as) {
    const { data: profile } = await db
      .from("driver_accounts")
      .select("slug, name, active")
      .eq("slug", as)
      .maybeSingle();
    if (profile?.active) {
      await db.from("driver_accounts").update({ last_seen_at: now }).eq("slug", profile.slug);
      return { slug: profile.slug, name: profile.name };
    }
  }
  return { slug: data.slug, name: data.name };
}

/** Déconnexion : le jeton de session est détruit côté serveur. */
export const driverLogout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const db = await admin();
    await db
      .from("driver_sessions")
      .delete()
      .eq("token_hash", await hashToken(data.token));
    return { ok: true };
  });

/** Vérifie le jeton et renvoie l'identité du chauffeur. */
export const driverLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<DriverIdentity> => resolveDriver(data.token, data.as));

/**
 * Connexion par email + mot de passe (compte commun). Le mot de passe est
 * vérifié côté base via pgcrypto (fonction SQL verify_driver_password),
 * il ne transite jamais en clair au-delà de cette requête et n'est jamais
 * stocké. Renvoie le même jeton de session que le lien magique, pour
 * réutiliser tout le reste du flux existant (localStorage, requêtes).
 */
export const driverPasswordLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailPasswordSchema.parse(input))
  .handler(async ({ data }): Promise<{ token: string; name: string }> => {
    const db = await admin();
    const { data: rows, error } = await (
      db.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
    )("verify_driver_password", {
      p_email: data.email,
      p_password: data.password,
    });
    if (error) {
      console.error("[driver] password login failed", error);
      throw new Error("lookup_failed");
    }
    const row = (rows as { slug: string; name: string; token: string }[] | null)?.[0];
    if (!row) throw new Error("invalid_credentials");
    await db.from("driver_accounts").update({ last_seen_at: new Date().toISOString() }).eq("slug", row.slug);
    // Jeton de session (sans expiration, valable jusqu'à déconnexion), distinct du jeton permanent du compte.
    const token = await createSession(row.slug);
    return { token, name: row.name };
  });

/**
 * Liste des profils chauffeur actifs (noms uniquement, aucun jeton exposé).
 * Exclut le compte de connexion partagé "equipe" : seuls les profils
 * attribuables à une vraie personne apparaissent, en nombre illimité —
 * ajouter un profil ne demande qu'une ligne dans driver_accounts.
 */
export const driverAccounts = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ slug: string; name: string }[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("driver_accounts")
      .select("slug, name, active")
      .eq("active", true)
      .neq("slug", "equipe")
      .order("slug");
    if (error) {
      console.error("[driver] accounts failed", error);
      return [];
    }
    return ((data ?? []) as { slug: string; name: string }[]).map((d) => ({
      slug: d.slug,
      name: d.name,
    }));
  },
);

/** Liste des courses à venir / récentes (toutes, non assignées comprises). */
export const driverRides = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ driver: DriverIdentity; drivers: DriverIdentity[]; rides: DriverRide[] }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const [{ data: rows, error }, { data: accounts }] = await Promise.all([
      db
        .from("reservations")
        .select(RIDE_COLS)
        .gte("pickup_datetime", since)
        .order("pickup_datetime", { ascending: true })
        .limit(100),
      db.from("driver_accounts").select("slug, name").eq("active", true).neq("slug", "equipe").order("slug"),
    ]);
    if (error) throw new Error("list_failed");
    return {
      driver,
      drivers: ((accounts ?? []) as DriverIdentity[]).map((a) => ({
        slug: a.slug,
        name: a.name,
      })),
      rides: (rows ?? []) as DriverRide[],
    };
  });

/** Historique paginé des courses terminées de l'équipe, indépendamment des courses à venir. */
export const driverCompletedRides = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ page: z.number().int().min(0).max(10000) }).parse(input))
  .handler(async ({ data }): Promise<{ rides: DriverRide[]; hasMore: boolean }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const pageSize = 50;
    const { data: rows, error } = await db
      .from("reservations")
      .select(RIDE_COLS)
      .eq("status", "completed")
      .order("pickup_datetime", { ascending: false })
      .range(data.page * pageSize, (data.page + 1) * pageSize);
    if (error) throw new Error("list_failed");
    const rides = (rows ?? []) as DriverRide[];
    return { rides: rides.slice(0, pageSize), hasMore: rides.length > pageSize };
  });

/** Prend une course en charge / la libère. */
export const driverClaimRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid(), claim: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();

    if (data.claim) {
      // On ne peut prendre qu'une course libre, en débordement, ou déjà à soi
      // (idempotent) — jamais une course déjà attribuée à l'autre chauffeur.
      const { data: updated, error } = await db
        .from("reservations")
        .update({ driver_slug: driver.slug })
        .eq("id", data.id)
        .or(`driver_slug.is.null,status.eq.en_debordement,driver_slug.eq.${driver.slug}`)
        .select("id")
        .maybeSingle();
      if (error) throw new Error("update_failed");
      if (!updated) throw new Error("already_assigned");
    } else {
      // On ne peut libérer que sa propre course.
      const { data: updated, error } = await db
        .from("reservations")
        .update({ driver_slug: null })
        .eq("id", data.id)
        .eq("driver_slug", driver.slug)
        .select("id")
        .maybeSingle();
      if (error) throw new Error("update_failed");
      if (!updated) throw new Error("not_owner");
    }

    return { ok: true };
  });

/**
 * Accepte la course : le chauffeur se l'attribue, la course passe en
 * « confirmée » et sa position est partagée pour le suivi client en direct.
 */
export const driverAcceptRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      id: z.string().uuid(),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      accuracy: z.number().nullable().optional(),
      heading: z.number().nullable().optional(),
      speed: z.number().nullable().optional(),
      route: z
        .object({
          label: z.string().trim().min(1).max(120),
          km: z.number().nonnegative(),
          min: z.number().nonnegative(),
          coords: z.array(z.tuple([z.number(), z.number()])).max(2000),
        })
        .nullable()
        .optional(),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true; shared: boolean }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const patch: Record<string, unknown> = { driver_slug: driver.slug, status: "confirmed" };
    if (data.route) {
      // Prix recalculé pour l'itinéraire choisi par le chauffeur — sans ça,
      // la page suivi client garde le prix figé de l'estimation initiale.
      const { data: current } = await db.from("reservations").select("pickup_datetime").eq("id", data.id).maybeSingle();
      const pickupDatetime = current?.pickup_datetime ?? new Date().toISOString();
      patch["route_label"] = data.route.label;
      patch["route_coords"] = data.route.coords;
      patch["distance_km"] = data.route.km;
      patch["duree_s"] = Math.round(data.route.min * 60);
      patch["duree_recomputed_at"] = new Date().toISOString();
      patch["prix_estime"] = detaillerPrix(data.route.km, pickupDatetime, data.route.min).total;
    }
    const { data: updated, error } = await db
      .from("reservations")
      .update(patch as never)
      .eq("id", data.id)
      // On ne peut accepter qu'une course libre (pending), en débordement, ou
      // déjà à soi — jamais voler une course déjà confirmée pour l'autre chauffeur.
      .or(`driver_slug.is.null,status.eq.pending,status.eq.en_debordement,driver_slug.eq.${driver.slug}`)
      .select("id")
      .maybeSingle();
    if (error) throw new Error("update_failed");
    if (!updated) throw new Error("already_taken");
    let shared = false;
    if (data.latitude != null && data.longitude != null) {
      const now = new Date().toISOString();
      const { error: gpsError } = await db.from("driver_gps").upsert(
        {
          id: driver.slug,
          is_active: true,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy ?? null,
          heading: data.heading ?? null,
          speed: data.speed ?? null,
          updated_at: now,
          heartbeat_at: now,
        },
        { onConflict: "id" },
      );
      shared = !gpsError;
    }
    // Confirmation envoyée directement au client (notification + e-mail avec
    // le lien de suivi en direct), sans action du chauffeur.
    try {
      const { notifyRideConfirmed } = await import("@/lib/reservation-notifications.server");
      await notifyRideConfirmed(data.id);
    } catch (e) {
      console.warn("[driver] client confirmation failed", e);
    }
    return { ok: true, shared };
  });

/**
 * Passe la course à l'autre chauffeur (relais quand l'un est plus proche
 * du client). Fonctionne dans les deux sens.
 */
export const driverTransferRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ id: z.string().uuid(), to: z.string().trim().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true; to: string }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: target, error: tErr } = await db
      .from("driver_accounts")
      .select("slug, name, active")
      .eq("slug", data.to)
      .maybeSingle();
    if (tErr) throw new Error("lookup_failed");
    if (!target || !target.active) throw new Error("invalid_target");

    const { error } = await db.from("reservations").update({ driver_slug: target.slug }).eq("id", data.id);
    if (error) throw new Error("update_failed");

    // Notification push au chauffeur qui récupère la course (best effort).
    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      await sendPushToAudience(
        "chauffeur",
        {
          title: "Course transférée",
          body: `Une course vient d'être passée à ${target.name}. Ouvrez l'espace chauffeur.`,
          url: "/driver",
          tag: `transfer-${data.id}`,
        },
        { reservationId: data.id, driverId: target.slug },
      );
    } catch (e) {
      console.warn("[driver] transfer push failed", e);
    }

    return { ok: true, to: target.name };
  });

/** Change l'itinéraire d'une course en cours et prévient le client. */
export const driverUpdateRideRoute = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      id: z.string().uuid(),
      label: z.string().trim().min(1).max(120),
      km: z.number().nonnegative(),
      min: z.number().nonnegative(),
      coords: z.array(z.tuple([z.number(), z.number()])).max(2000),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true; notified: number }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();

    const { data: reservation } = await db
      .from("reservations")
      .select("id, pickup_datetime, depart, arrivee, destination, suivi_id, tracking_id, client_account_id")
      .eq("id", data.id)
      .maybeSingle();

    // Même recalcul de prix qu'à l'acceptation, pour que le prix affiché au
    // client reste cohérent avec le nouvel itinéraire choisi par le chauffeur.
    const pickupDatetime = reservation?.pickup_datetime ?? new Date().toISOString();
    const patch = {
      route_label: data.label,
      route_coords: data.coords,
      distance_km: data.km,
      duree_s: Math.round(data.min * 60),
      duree_recomputed_at: new Date().toISOString(),
      prix_estime: detaillerPrix(data.km, pickupDatetime, data.min).total,
    };
    const { error } = await db
      .from("reservations")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error("update_failed");

    let notified = 0;
    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const suiviPath = `/suivi/${reservation?.suivi_id ?? reservation?.tracking_id ?? data.id}`;
      const res = await sendPushToAudience(
        "client",
        {
          title: "Itinéraire mis à jour",
          body: `Votre chauffeur passe par ${data.label} — ${data.km} km, environ ${Math.round(data.min)} min.`,
          url: suiviPath,
          tag: `route-${data.id}-${Date.now()}`,
          data: { url: suiviPath, reservation_id: data.id, audience: "client", kind: "route" },
        },
        {
          reservationId: data.id,
          ...(reservation?.client_account_id ? { accountId: reservation.client_account_id } : {}),
        },
      );
      notified = res.sent ?? 0;
    } catch (e) {
      console.warn("[driver] route push failed", e);
    }

    return { ok: true, notified };
  });

/** Change l'horaire de prise en charge (à la demande du client) et prévient le client. */
export const driverRescheduleRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      id: z.string().uuid(),
      pickup_datetime: z.string().datetime({ offset: true }),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: ride } = await db
      .from("reservations")
      .select("id, status, distance_km, duree_s, suivi_id, tracking_id, client_account_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!ride) throw new Error("not_found");
    if (["completed", "cancelled"].includes(ride.status as string)) throw new Error("closed");
    const iso = new Date(data.pickup_datetime).toISOString();
    const patch: Record<string, unknown> = { pickup_datetime: iso };
    if (ride.distance_km != null) {
      // Tarif jour/nuit dépend de l'heure : on recalcule l'estimation.
      patch["prix_estime"] = detaillerPrix(
        Number(ride.distance_km),
        iso,
        ride.duree_s != null ? Number(ride.duree_s) / 60 : undefined,
      ).total;
    }
    const { error } = await db
      .from("reservations")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error("update_failed");

    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const suiviPath = `/suivi/${ride.suivi_id ?? ride.tracking_id ?? data.id}`;
      const heure = new Date(iso).toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      await sendPushToAudience(
        "client",
        {
          title: "Horaire modifié",
          body: `Votre prise en charge est maintenant prévue ${heure}.`,
          url: suiviPath,
          tag: `time-${data.id}-${Date.now()}`,
          data: { url: suiviPath, reservation_id: data.id, audience: "client", kind: "reschedule" },
        },
        {
          reservationId: data.id,
          ...(ride.client_account_id ? { accountId: ride.client_account_id as string } : {}),
        },
      );
    } catch (e) {
      console.warn("[driver] reschedule push failed", e);
    }
    return { ok: true };
  });

/** Change le statut d'une course. */
export const driverSetStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      id: z.string().uuid(),
      status: z.enum(["confirmed", "in_progress", "arrived", "completed", "cancelled"]),
      // Données réelles saisies par le chauffeur à la fin de la course.
      realDistanceKm: z.number().min(0).max(2000).nullable().optional(),
      realPrice: z.number().min(0).max(10000).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();

    const { data: current } = await db
      .from("reservations")
      .select("status, started_at, distance_km, duree_s, prix_estime, pickup_datetime")
      .eq("id", data.id)
      .maybeSingle();

    const now = new Date();

    // Garde-fou : on n'annule pas une course déjà clôturée ou déjà annulée.
    if (data.status === "cancelled" && ["completed", "cancelled"].includes(current?.status as string)) {
      throw new Error("closed");
    }

    // Garde-fou : une course ne peut pas passer « En route » plus d'1 h avant son
    // heure de prise en charge (une course prévue dans plusieurs jours restait
    // « en cours » dès son acceptation, et le client recevait la notification
    // « Votre chauffeur est en route »).
    if (data.status === "in_progress" && current?.pickup_datetime) {
      const msUntilPickup = new Date(current.pickup_datetime).getTime() - now.getTime();
      if (msUntilPickup > 60 * 60 * 1000) throw new Error("too_early");
    }

    const patch: Record<string, unknown> = { status: data.status };

    // Départ réel : on horodate le début de course.
    if (data.status === "in_progress" && !current?.started_at) {
      patch["started_at"] = now.toISOString();
    }

    // Fin de course : distance, durée et prix réellement réalisés.
    if (data.status === "completed") {
      patch["completed_at"] = now.toISOString();
      const startedAt = current?.started_at ? new Date(current.started_at) : null;
      const realSeconds = startedAt
        ? Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 1000))
        : (current?.duree_s ?? null);
      patch["duree_reelle_s"] = realSeconds;
      patch["distance_reelle_km"] = data.realDistanceKm != null ? data.realDistanceKm : (current?.distance_km ?? null);
      patch["prix_final"] = data.realPrice != null ? data.realPrice : (current?.prix_estime ?? null);
    }

    const { error } = await db
      .from("reservations")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error("update_failed");

    // Prévenir le client des étapes clés (en route vers lui, chauffeur sur place).
    const notice =
      data.status === "in_progress"
        ? { title: "Votre chauffeur est en route", body: "Suivez son arrivée en direct." }
        : data.status === "arrived"
          ? { title: "Votre chauffeur est arrivé", body: "Il vous attend au point de rendez-vous." }
          : data.status === "cancelled"
            ? {
                title: "Votre course a été annulée",
                body: "Votre chauffeur ne peut malheureusement pas l'assurer. Contactez-nous pour la reprogrammer.",
              }
            : null;
    if (notice) {
      try {
        const { data: reservation } = await db
          .from("reservations")
          .select("id, suivi_id, tracking_id, client_account_id")
          .eq("id", data.id)
          .maybeSingle();
        const suiviPath = `/suivi/${reservation?.suivi_id ?? reservation?.tracking_id ?? data.id}`;
        const { sendPushToAudience } = await import("@/lib/push.server");
        await sendPushToAudience(
          "client",
          {
            ...notice,
            url: suiviPath,
            tag: `status-${data.id}-${data.status}`,
            data: {
              url: suiviPath,
              reservation_id: data.id,
              audience: "client",
              kind: "status",
            },
          } as never,
          {
            reservationId: data.id,
            ...(reservation?.client_account_id ? { accountId: reservation.client_account_id } : {}),
            dedupTtlMinutes: 10,
          } as never,
        );
      } catch (e) {
        console.warn("[driver] status push failed", e);
      }
    }

    return { ok: true };
  });

/** Comptabilité : chiffre d'affaires du chauffeur. */
export const driverAccounting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<DriverAccounting> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const start = new Date();
    start.setUTCMonth(start.getUTCMonth() - 11, 1);
    start.setUTCHours(0, 0, 0, 0);

    const { data: rows, error } = await db
      .from("reservations")
      .select(RIDE_COLS)
      .eq("driver_slug", driver.slug)
      .gte("pickup_datetime", start.toISOString())
      .order("pickup_datetime", { ascending: false })
      .limit(500);
    if (error) throw new Error("list_failed");

    const rides = ((rows ?? []) as DriverRide[]).filter((r) => r.status !== "cancelled");

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(dayStart);
    weekStart.setDate(dayStart.getDate() - ((dayStart.getDay() + 6) % 7));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const sum = (from: Date) => {
      const sel = rides.filter((r) => new Date(r.pickup_datetime) >= from);
      return {
        rides: sel.length,
        revenue: Math.round(sel.reduce((s, r) => s + (r.prix_final ?? r.prix_estime ?? 0), 0) * 100) / 100,
      };
    };

    const byMonth = new Map<string, { rides: number; revenue: number }>();
    for (const r of rides) {
      const key = r.pickup_datetime.slice(0, 7);
      const cur = byMonth.get(key) ?? { rides: 0, revenue: 0 };
      cur.rides += 1;
      cur.revenue = Math.round((cur.revenue + (r.prix_final ?? r.prix_estime ?? 0)) * 100) / 100;
      byMonth.set(key, cur);
    }

    return {
      today: sum(dayStart),
      week: sum(weekStart),
      month: sum(monthStart),
      year: sum(yearStart),
      months: [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([month, v]) => ({ month, ...v })),
      rides: rides.slice(0, 50),
    };
  });

/** Supprime définitivement une course (balayage dans l'espace chauffeur). */
export const driverDeleteRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    // Jamais de suppression d'une course en cours (un balayage accidentel ne doit pas la faire disparaître).
    const { data: deleted, error } = await db
      .from("reservations")
      .delete()
      .eq("id", data.id)
      .not("status", "in", "(in_progress,arrived,en_route)")
      .select("id");
    if (error) throw new Error("delete_failed");
    if (!deleted?.length) throw new Error("ride_in_progress");
    return { ok: true as const };
  });

/* ------------------------------------------------------------------ */
/* Débordement : passer une course qu'on ne peut pas assurer à l'équipe */
/* ------------------------------------------------------------------ */

/** Le chauffeur déclare qu'il ne peut pas assurer la course : elle part en débordement. */
export const driverOverflowRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true; notified: number }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: ride, error } = await db
      .from("reservations")
      .update({
        driver_slug: null,
        status: "en_debordement",
        overflow_from_slug: driver.slug,
        overflow_at: new Date().toISOString(),
        overflow_taken_at: null,
      } as never)
      .eq("id", data.id)
      // Garde serveur : on ne met en débordement qu'une course libre (pending, sans
      // chauffeur) ou la sienne, et jamais une course déjà en débordement, démarrée,
      // terminée ou annulée. Supprime la dernière fenêtre de conflit entre deux appareils.
      .in("status", ["pending", "confirmed"])
      .or(`and(status.eq.pending,driver_slug.is.null),driver_slug.eq.${driver.slug}`)
      .select("id, depart, arrivee, destination, pickup_datetime")
      .maybeSingle();
    if (error) throw new Error("update_failed");
    if (!ride) throw new Error("ride_unavailable");

    let notified = 0;
    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const { data: others } = await db
        .from("driver_accounts")
        .select("slug, active")
        .eq("active", true)
        .neq("slug", driver.slug);
      const heure = ride?.pickup_datetime
        ? new Date(ride.pickup_datetime).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const url = `/driver?ride=${data.id}`;
      for (const o of (others ?? []) as { slug: string }[]) {
        const res = await sendPushToAudience(
          "chauffeur",
          {
            title: "Course disponible",
            body: `${heure} — ${ride?.depart ?? "Départ"} → ${ride?.arrivee ?? ride?.destination ?? "Arrivée"}`,
            url,
            tag: `overflow-${data.id}`,
            data: { url, reservation_id: data.id, audience: "chauffeur", kind: "overflow" },
            actions: [
              { action: "accept", title: "Accepter" },
              { action: "refuse", title: "Refuser" },
            ],
          } as never,
          { reservationId: data.id, driverId: o.slug },
        );
        notified += res.sent ?? 0;
      }
    } catch (e) {
      console.warn("[driver] overflow push failed", e);
    }
    return { ok: true, notified };
  });

/** Courses en débordement disponibles pour les autres chauffeurs. */
export const driverOverflowRides = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }): Promise<{ rides: DriverRide[] }> => {
    await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: rows, error } = await db
      .from("reservations")
      .select(RIDE_COLS)
      .eq("status", "en_debordement")
      .order("pickup_datetime", { ascending: true })
      .limit(50);
    if (error) throw new Error("list_failed");
    return { rides: (rows ?? []) as DriverRide[] };
  });

/** Un chauffeur récupère une course en débordement ; l'auteur du débordement est prévenu. */
export const driverTakeOverflowRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: current } = await db
      .from("reservations")
      .select("id, status, overflow_from_slug")
      .eq("id", data.id)
      .maybeSingle();
    if (!current || (current as { status: string }).status !== "en_debordement") {
      throw new Error("already_taken");
    }
    const { error } = await db
      .from("reservations")
      .update({
        driver_slug: driver.slug,
        status: "confirmed",
        overflow_taken_at: new Date().toISOString(),
      } as never)
      .eq("id", data.id)
      .eq("status", "en_debordement");
    if (error) throw new Error("update_failed");

    const origin = (current as { overflow_from_slug: string | null }).overflow_from_slug;
    if (origin) {
      try {
        const { data: me } = await db
          .from("driver_accounts")
          .select("name, phone")
          .eq("slug", driver.slug)
          .maybeSingle();
        const phone = (me as { phone: string | null } | null)?.phone;
        const { sendPushToAudience } = await import("@/lib/push.server");
        await sendPushToAudience(
          "chauffeur",
          {
            title: "Course reprise",
            body: `${me?.name ?? driver.name} assure votre course${phone ? ` — ${phone}` : ""}.`,
            url: "/driver",
            tag: `overflow-taken-${data.id}`,
          },
          { reservationId: data.id, driverId: origin },
        );
      } catch (e) {
        console.warn("[driver] overflow taken push failed", e);
      }
    }
    return { ok: true };
  });

/** Le chauffeur d'origine reprend sa course tant qu'elle n'a pas démarré. */
export const driverReclaimOverflowRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const { data: current } = await db
      .from("reservations")
      .select("id, status, overflow_from_slug")
      .eq("id", data.id)
      .maybeSingle();
    const row = current as { status: string; overflow_from_slug: string | null } | null;
    if (!row || row.overflow_from_slug !== driver.slug) throw new Error("not_allowed");
    if (["in_progress", "arrived", "completed", "cancelled"].includes(row.status)) throw new Error("too_late");

    const { error } = await db
      .from("reservations")
      .update({
        driver_slug: driver.slug,
        status: "confirmed",
        overflow_from_slug: null,
        overflow_at: null,
        overflow_taken_at: null,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error("update_failed");
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Réservation manuelle : le chauffeur saisit un client reçu en direct */
/* ------------------------------------------------------------------ */

const ManualBookingSchema = TokenSchema.extend({
  nom: z.string().trim().min(1).max(100),
  telephone: z.string().trim().min(4).max(30).optional(),
  email: z.string().trim().email().max(255).optional(),
  depart: z.string().trim().min(1).max(200),
  arrivee: z.string().trim().min(1).max(200),
  pickup_datetime: z.string().trim().min(1), // ISO, construit côté formulaire
  passagers: z.number().int().min(1).max(9).optional(),
  bagages: z.number().int().min(0).max(9).optional(),
  prix_estime: z.number().min(0).max(5000).optional(),
  service_type: z.string().trim().max(60).optional(),
  // Canal par lequel le client a contacté le chauffeur directement.
  source: z.enum(["sms", "email", "whatsapp", "telephone", "autre"]),
  // Qui a pris l'appel/le message chez le chauffeur (facultatif).
  prise_par: z.string().trim().min(1).max(60).optional(),
  observation1: z.string().max(1000).optional(),
  observation2: z.string().max(1000).optional(),
});

function randomTrackingId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Le chauffeur saisit lui-même une réservation reçue en direct (SMS, e-mail,
 * WhatsApp, appel) en dehors du site. Créée déjà "confirmed" et affectée à
 * ce chauffeur — pas de notification "nouvelle réservation" aux deux
 * chauffeurs puisqu'il vient de la saisir lui-même. Un lien de suivi
 * (/suivi/<tracking_id>) est généré comme pour une résa classique.
 */
export const driverCreateManualReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ManualBookingSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; id: string; tracking_id: string }> => {
    const driver = await resolveDriver(data.token, data.as);
    const db = await admin();
    const tracking_id = randomTrackingId();
    const { data: row, error } = await db
      .from("reservations")
      .insert({
        nom: data.nom,
        client_name: data.nom,
        // Colonne obligatoire en base : chaîne vide si le client n'a pas laissé de numéro.
        telephone: data.telephone ?? "",
        client_phone: data.telephone ?? null,
        email: data.email ?? null,
        depart: data.depart,
        arrivee: data.arrivee,
        destination: data.arrivee,
        pickup_datetime: data.pickup_datetime,
        passagers: data.passagers ?? 1,
        bagages: data.bagages ?? 0,
        prix_estime: data.prix_estime ?? null,
        service_type: data.service_type ?? "standard",
        message:
          [data.observation1, data.observation2]
            .map((s) => s?.trim())
            .filter(Boolean)
            .join("\n") || null,
        status: "confirmed",
        driver_slug: driver.slug,
        tracking_id,
        source: data.source,
        prise_par: data.prise_par ?? null,
      } as never)
      .select("id, tracking_id")
      .single();
    if (error) {
      console.error("[driver] manual reservation failed", error);
      throw new Error("insert_failed");
    }
    return { ok: true, id: (row as { id: string }).id, tracking_id };
  });
