// Actions client depuis la page de suivi : relance du chauffeur
// (« Où en êtes-vous ? ») et partage de la position du client.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

const RefSchema = z.object({
  ref: z
    .string()
    .trim()
    .min(4)
    .max(80)
    .regex(/^[A-Za-z0-9_-]+$/),
});

const PositionSchema = RefSchema.extend({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

type Ride = {
  id: string;
  tracking_id: string | null;
  status: string;
  depart: string | null;
  arrivee: string | null;
  nom: string | null;
  driver_slug: string | null;
  driver_ping_at: string | null;
};

export type TrackingSnapshot = {
  id: string;
  nom: string | null;
  pickup_datetime: string;
  depart: string;
  arrivee: string;
  destination: string | null;
  passagers: number;
  bagages: number;
  service_type: string;
  status: string;
  tracking_id: string | null;
  distance_km: number | null;
  prix_estime: number | null;
  duree_s: number | null;
  client_name: string | null;
  route_coords: Json;
  route_label: string | null;
};

export type TrackingDriverPosition = {
  latitude: number;
  longitude: number;
  heading: number | null;
  is_active: boolean;
  updated_at: string | null;
};

async function admin() {
  const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
  return supabaseAdmin;
}

async function findRide(ref: string): Promise<Ride | null> {
  const db = await admin();
  const cols = "id, tracking_id, status, depart, arrivee, nom, driver_slug, driver_ping_at";
  const { data } = await db
    .from("reservations")
    .select(cols)
    .or(`tracking_id.eq.${ref},suivi_id.eq.${ref}`)
    .limit(1)
    .maybeSingle();
  if (data) return data as unknown as Ride;
  if (!/^[0-9a-f-]{36}$/i.test(ref)) return null;
  const { data: byId } = await db
    .from("reservations")
    .select(cols)
    .eq("id", ref)
    .maybeSingle();
  return (byId as unknown as Ride) ?? null;
}

/** Lecture publique étroite : le serveur vérifie la référence et ne renvoie aucun téléphone/e-mail/message. */
export const getTrackingSnapshot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefSchema.parse(input))
  .handler(async ({ data }): Promise<TrackingSnapshot | null> => {
    const db = await admin();
    const { data: row } = await db
      .from("reservations")
      .select(
        "id, nom, pickup_datetime, depart, arrivee, destination, passagers, bagages, service_type, status, tracking_id, distance_km, prix_estime, duree_s, client_name, route_coords, route_label",
      )
      .or(`tracking_id.eq.${data.ref},suivi_id.eq.${data.ref}`)
      .limit(1)
      .maybeSingle();
    return (row as unknown as TrackingSnapshot) ?? null;
  });

/** Position chauffeur limitée à une course active identifiée par sa référence de suivi. */
export const getTrackingDriverPosition = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefSchema.parse(input))
  .handler(async ({ data }): Promise<TrackingDriverPosition | null> => {
    const db = await admin();
    const { data: ride } = await db
      .from("reservations")
      .select("driver_slug, status")
      .or(`tracking_id.eq.${data.ref},suivi_id.eq.${data.ref}`)
      .limit(1)
      .maybeSingle();
    if (!ride?.driver_slug || ["completed", "cancelled"].includes(ride.status)) return null;
    const { data: position } = await db
      .from("driver_gps")
      .select("latitude, longitude, heading, is_active, updated_at")
      .eq("id", ride.driver_slug)
      .eq("is_active", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .gt("updated_at", new Date(Date.now() - 15 * 60_000).toISOString())
      .maybeSingle();
    return (position as unknown as TrackingDriverPosition) ?? null;
  });

/** « Où en êtes-vous ? » : relance le chauffeur (1 fois toutes les 5 min). */
export const pingDriver = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: boolean; reason?: string }> => {
    const ride = await findRide(data.ref);
    if (!ride) return { ok: false, reason: "not_found" };
    if (["completed", "cancelled"].includes(ride.status)) {
      return { ok: false, reason: "closed" };
    }
    const last = ride.driver_ping_at ? new Date(ride.driver_ping_at).getTime() : 0;
    if (Date.now() - last < 5 * 60_000) return { ok: false, reason: "too_soon" };

    const db = await admin();
    await db
      .from("reservations")
      .update({ driver_ping_at: new Date().toISOString() } as never)
      .eq("id", ride.id);

    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const url = `/driver?ride=${ride.id}`;
      await sendPushToAudience(
        "chauffeur",
        {
          title: "Où en êtes-vous ?",
          body: `${ride.nom ?? "Le client"} attend — ${ride.depart ?? ""}`,
          url,
          tag: `ping-${ride.id}-${Math.floor(Date.now() / 300000)}`,
          requireInteraction: true,
          data: { url, reservation_id: ride.id, audience: "chauffeur", kind: "ping" },
        } as never,
        { reservationId: ride.id, driverId: ride.driver_slug, dedupTtlMinutes: 5 },
      );
    } catch (e) {
      console.warn("[tracking] ping push failed", e);
    }
    return { ok: true };
  });

/** Partage de la position exacte du client avec le chauffeur. */
export const shareClientPosition = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PositionSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: boolean; reason?: string }> => {
    const ride = await findRide(data.ref);
    if (!ride) return { ok: false, reason: "not_found" };
    if (["completed", "cancelled"].includes(ride.status)) {
      return { ok: false, reason: "closed" };
    }
    const db = await admin();
    await db
      .from("reservations")
      .update({
        client_lat: data.lat,
        client_lng: data.lng,
        client_pos_at: new Date().toISOString(),
      } as never)
      .eq("id", ride.id);

    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const url = `/driver?ride=${ride.id}`;
      await sendPushToAudience(
        "chauffeur",
        {
          title: "Position du client partagée",
          body: `${ride.nom ?? "Le client"} a partagé sa position exacte.`,
          url,
          tag: `clientpos-${ride.id}`,
          data: {
            url,
            reservation_id: ride.id,
            audience: "chauffeur",
            kind: "client_position",
          },
        } as never,
        { reservationId: ride.id, driverId: ride.driver_slug, dedupTtlMinutes: 5 },
      );
    } catch (e) {
      console.warn("[tracking] client position push failed", e);
    }
    return { ok: true };
  });

/* ─────────────── Chat client ↔ chauffeur ─────────────── */

export type TrackingMessage = {
  id: string;
  sender: string;
  content: string;
  created_at: string;
};

/** Messages de la course (vue client) + marquage « lu » des messages chauffeur. */
export const clientMessages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefSchema.parse(input))
  .handler(async ({ data }): Promise<{ messages: TrackingMessage[] }> => {
    const ride = await findRide(data.ref);
    if (!ride) return { messages: [] };
    const db = await admin();
    const { data: rows } = await db
      .from("reservation_messages")
      .select("id, sender, content, created_at")
      .eq("reservation_id", ride.id)
      .order("created_at", { ascending: true })
      .limit(200);
    await db
      .from("reservation_messages")
      .update({ read_by_client: true } as never)
      .eq("reservation_id", ride.id)
      .eq("sender", "chauffeur")
      .eq("read_by_client", false);
    return { messages: (rows ?? []) as TrackingMessage[] };
  });

/** Envoi d'un message client depuis la page de suivi + notification chauffeur. */
export const clientSendMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    RefSchema.extend({ content: z.string().trim().min(1).max(1000) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; reason?: string }> => {
    const ride = await findRide(data.ref);
    if (!ride) return { ok: false, reason: "not_found" };
    const db = await admin();
    const { error } = await db.from("reservation_messages").insert({
      reservation_id: ride.id,
      sender: "client",
      content: data.content,
      read_by_chauffeur: false,
      read_by_client: true,
    } as never);
    if (error) return { ok: false, reason: "insert_failed" };

    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const url = `/driver?ride=${ride.id}&tab=messages`;
      await sendPushToAudience(
        "chauffeur",
        {
          title: `Message de ${ride.nom ?? "votre client"}`,
          body: data.content.slice(0, 120),
          url,
          // Horodaté : chaque message client donne bien une notification.
          tag: `chat-${ride.id}-${Date.now()}`,
          requireInteraction: true,
          actions: [{ action: "reply", title: "Répondre" }],
          data: { url, reservation_id: ride.id, audience: "chauffeur", kind: "chat" },
        } as never,
        { reservationId: ride.id, driverId: ride.driver_slug },
      );
    } catch (e) {
      console.warn("[tracking] client chat push failed", e);
    }
    return { ok: true };
  });
