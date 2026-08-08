import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type DriverLivePosition = {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  updated_at: string;
  /** Âge de la mesure en secondes, calculé côté serveur (horloge fiable). */
  age_s: number;
};

/**
 * Position live du chauffeur pour la page de suivi client.
 *
 * Fail-closed : accessible uniquement avec la clé de suivi de la course
 * (suivi_id / tracking_id / id), et seulement pendant les statuts où le
 * client a légitimement besoin de la position. Aucune lecture directe de
 * `driver_gps` n'est possible depuis le navigateur (aucun droit Data API).
 */
export const getSuiviDriverPosition = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ suivi_key: z.string().trim().min(6).max(200) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; position: DriverLivePosition | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin.rpc("get_reservation_for_suivi", {
      p_key: data.suivi_key,
    });
    const reservation = Array.isArray(rows) ? (rows[0] as any) : (rows as any);
    if (!reservation) return { ok: false, position: null };

    const status = String(reservation.status ?? "");
    if (!["accepted", "en_route", "arrived"].includes(status)) {
      return { ok: true, position: null };
    }

    const driverId = String(reservation.assigned_driver ?? "").toLowerCase().trim();
    let query = supabaseAdmin
      .from("driver_gps")
      .select("latitude, longitude, heading, speed, accuracy, is_active, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (driverId === "alain" || driverId === "patricia") {
      // Le panneau chauffeur écrit sous l'identifiant "driver" ou la clé du
      // chauffeur : on tente d'abord la ligne dédiée puis on retombe dessus.
      const { data: own } = await supabaseAdmin
        .from("driver_gps")
        .select("latitude, longitude, heading, speed, accuracy, is_active, updated_at")
        .eq("id", driverId)
        .eq("is_active", true)
        .maybeSingle();
      if (own?.latitude != null && own?.longitude != null) {
        const age = (Date.now() - Date.parse(own.updated_at)) / 1000;
        if (age <= 180) {
          return {
            ok: true,
            position: {
              lat: own.latitude,
              lng: own.longitude,
              heading: own.heading ?? null,
              speed: own.speed ?? null,
              accuracy: own.accuracy ?? null,
              updated_at: own.updated_at,
              age_s: Math.round(age),
            },
          };
        }
      }
    }

    const { data: gps } = await query.maybeSingle();
    if (!gps || gps.latitude == null || gps.longitude == null) return { ok: true, position: null };
    const age = (Date.now() - Date.parse(gps.updated_at)) / 1000;
    // Position périmée (> 3 min) : on ne montre rien plutôt qu'un point faux.
    if (age > 180) return { ok: true, position: null };

    return {
      ok: true,
      position: {
        lat: gps.latitude,
        lng: gps.longitude,
        heading: gps.heading ?? null,
        speed: gps.speed ?? null,
        accuracy: gps.accuracy ?? null,
        updated_at: gps.updated_at,
        age_s: Math.round(age),
      },
    };
  });
