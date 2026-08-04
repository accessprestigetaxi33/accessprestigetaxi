import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Accès aux données réservées au panneau chauffeur.
 * Le navigateur du chauffeur n'est pas authentifié Supabase : toutes les
 * lectures/écritures sensibles passent ici après validation du jeton chauffeur.
 */
const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

const PatchSchema = z.object({
  status: z.enum(["pending", "accepted", "en_route", "arrived", "completed", "cancelled"]).optional(),
  distance_km: z.number().nonnegative().max(2000).optional(),
  prix_estime: z.number().nonnegative().max(100000).optional(),
  pickup_datetime: z.string().min(4).max(60).optional(),
  refus_motif: z.string().trim().max(500).optional(),
  route_label: z.string().trim().max(200).optional(),
});

/** Met à jour une course (champs autorisés uniquement). */
export const driverUpdateReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      reservation_id: z.string().uuid(),
      patch: PatchSchema,
      not_status: z.string().trim().max(40).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    if (Object.keys(data.patch).length === 0) return { changed: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("reservations")
      .update(data.patch as any)
      .eq("id", data.reservation_id);
    if (data.not_status) q = q.neq("status", data.not_status);
    const { data: updated, error } = await q.select("id").maybeSingle();
    if (error) throw new Error(error.message);
    return { changed: !!updated };
  });

/** Lectures agrégées du panneau chauffeur. */
export const driverListReservations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ scope: z.enum(["planning", "clients"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.scope === "planning") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const { data: rows, error } = await supabaseAdmin
        .from("reservations")
        .select("id,depart,destination,pickup_datetime,status,prix_estime,distance_km,assigned_driver")
        .gte("pickup_datetime", today.toISOString())
        .lt("pickup_datetime", tomorrow.toISOString())
        .neq("status", "cancelled")
        .order("pickup_datetime", { ascending: true });
      if (error) throw new Error(error.message);
      return { rows: rows ?? [], clients: [] as any[] };
    }

    const [{ data: rows, error }, { data: clients }] = await Promise.all([
      supabaseAdmin
        .from("reservations")
        .select("client_name,client_phone,depart,destination,prix_estime,pickup_datetime,status")
        .not("client_phone", "is", null)
        .order("pickup_datetime", { ascending: false }),
      supabaseAdmin.from("clients").select("id,phone"),
    ]);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], clients: clients ?? [] };
  });

/** Supprime un client et toutes ses courses. */
export const driverDeleteClient = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      phone: z.string().trim().min(4).max(30),
      client_id: z.string().uuid().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const normalize = (p: string) => p.replace(/[^0-9]/g, "").replace(/^0/, "33");
    const target = normalize(data.phone);
    const { data: all } = await supabaseAdmin.from("reservations").select("id,client_phone,telephone");
    const ids = ((all as any[]) ?? [])
      .filter((r) => normalize(r.client_phone ?? "") === target || normalize(r.telephone ?? "") === target)
      .map((r) => r.id);

    if (ids.length > 0) {
      await supabaseAdmin.from("avis").update({ reservation_id: null } as any).in("reservation_id", ids);
      const { error: delErr } = await supabaseAdmin.from("reservations").delete().in("id", ids);
      if (delErr) throw new Error(delErr.message);
    }
    if (data.client_id) {
      const { error } = await supabaseAdmin.from("clients").delete().eq("id", data.client_id);
      if (error) throw new Error(error.message);
    }
    return { deleted: ids.length };
  });
