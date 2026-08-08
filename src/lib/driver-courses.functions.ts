import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const COURSE_FIELDS =
  "id,depart,destination,arrivee,pickup_datetime,status,prix_estime,distance_km,client_name,client_phone,client_email,nom,telephone,email,suivi_id,message,assigned_driver,created_at";

const ACTIVE_STATUSES = ["pending", "accepted", "en_route", "arrived"];

const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

/** Liste les courses actives (+ celles avec messages non lus) pour le panneau chauffeur. */
export const listDriverCourses = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ extra_ids: z.array(z.string().uuid()).max(50).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    const identity = assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: active, error } = await supabaseAdmin
      .from("reservations")
      .select(COURSE_FIELDS)
      .in("status", ACTIVE_STATUSES)
      .order("pickup_datetime", { ascending: true });
    if (error) throw new Error(error.message);

    const rows: any[] = active ?? [];
    const known = new Set(rows.map((r) => r.id));
    const extras = (data.extra_ids ?? []).filter((id) => !known.has(id));
    if (extras.length > 0) {
      const { data: extraRows } = await supabaseAdmin.from("reservations").select(COURSE_FIELDS).in("id", extras);
      rows.push(...((extraRows as any[]) ?? []));
    }

    return {
      driverId: identity.id,
      driverName: identity.name,
      courses: rows.map((r) => ({
        ...r,
        destination: r.destination || r.arrivee || "",
        client_name: r.client_name || r.nom || "",
        client_phone: r.client_phone || r.telephone || "",
        client_email: r.client_email || r.email || "",
      })),
    };
  });

/** Réassigne manuellement une course à Patricia ou Alain. */
export const setCourseDriver = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      reservation_id: z.string().uuid(),
      driver: z.enum(["patricia", "alain"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reservations")
      .update({ assigned_driver: data.driver } as any)
      .eq("id", data.reservation_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Met à jour le statut d'une course (panneau chauffeur uniquement). */
export const driverSetReservationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      reservation_id: z.string().uuid(),
      status: z.enum(["pending", "accepted", "en_route", "arrived", "completed", "cancelled"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin
      .from("reservations")
      .update({ status: data.status } as any)
      .eq("id", data.reservation_id)
      .neq("status", data.status)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { changed: !!updated };
  });

/** Supprime définitivement une course (panneau chauffeur uniquement). */
export const driverDeleteReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ reservation_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("avis")
      .update({ reservation_id: null } as any)
      .eq("reservation_id", data.reservation_id);
    const { error } = await supabaseAdmin.from("reservations").delete().eq("id", data.reservation_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
