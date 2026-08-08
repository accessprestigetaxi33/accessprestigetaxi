import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({ token: z.string().min(1).max(200) });

/**
 * Le panneau chauffeur pousse sa position ici.
 * La ligne `driver_gps` est écrite sous l'identifiant du chauffeur
 * (patricia / alain), jamais depuis le navigateur en direct.
 */
export const updateMyDriverPosition = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).max(100000).nullable().optional(),
      speed: z.number().min(0).max(500).nullable().optional(),
      heading: z.number().min(0).max(360).nullable().optional(),
      is_active: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    const identity = assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const id = identity.id === "admin" ? "driver" : identity.id;
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("driver_gps").upsert(
      {
        id,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy ?? null,
        speed: data.speed ?? null,
        heading: data.heading ?? null,
        is_active: data.is_active ?? true,
        updated_at: now,
        heartbeat_at: now,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, id, updated_at: now };
  });

/** Coupe le partage de position du chauffeur connecté. */
export const stopMyDriverPosition = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    const identity = assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = identity.id === "admin" ? "driver" : identity.id;
    await supabaseAdmin
      .from("driver_gps")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    return { ok: true };
  });

/** Dernières positions connues (le chauffeur voit la sienne, l'admin les deux). */
export const listDriverPositions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    const identity = assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("driver_gps")
      .select("id, latitude, longitude, accuracy, speed, heading, is_active, updated_at");
    if (identity.id !== "admin") q = q.eq("id", identity.id);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    return {
      me: identity.id,
      positions: ((rows as any[]) ?? []).map((r) => ({
        id: r.id as string,
        lat: r.latitude as number | null,
        lng: r.longitude as number | null,
        accuracy: r.accuracy as number | null,
        speed: r.speed as number | null,
        heading: r.heading as number | null,
        is_active: !!r.is_active,
        updated_at: r.updated_at as string,
        age_s: Math.max(0, Math.round((Date.now() - Date.parse(r.updated_at)) / 1000)),
      })),
    };
  });
