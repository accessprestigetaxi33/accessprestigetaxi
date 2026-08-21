import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Mise à jour, listing (planning/clients) et suppression des réservations
 * côté espace chauffeur. Le navigateur du chauffeur n'est pas authentifié
 * Supabase : toute lecture/écriture sensible passe ici après validation du
 * jeton chauffeur.
 */
const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

export type Resa = {
  id: string;
  depart: string;
  destination: string;
  date_heure: string;
  pickup_datetime: string;
  status: string;
  prix_estime: number | null;
  distance_km: number | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  email: string | null;
  suivi_id: string | null;
  message: string | null;
  assigned_driver?: string | null;
};

const RESA_COLUMNS =
  "id,depart,destination,date_heure,pickup_datetime,status,prix_estime,distance_km,client_name,client_phone,client_email,email,suivi_id,message,assigned_driver";

const PatchSchema = z
  .object({
    status: z.string().trim().max(40).optional(),
    distance_km: z.number().nonnegative().max(5000).nullable().optional(),
    prix_estime: z.number().nonnegative().max(100000).nullable().optional(),
    pickup_datetime: z.string().trim().min(10).max(40).optional(),
  })
  .partial();

/**
 * Met à jour une réservation (statut, itinéraire, prix, heure…).
 * `not_status`, si fourni, rend l'action idempotente : si la réservation est
 * déjà dans cet état, aucune écriture n'est faite (changed: false) — utile
 * pour éviter les doubles clics/doubles notifications (accepter, terminer,
 * annuler…).
 */
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

    let query = supabaseAdmin
      .from("reservations")
      .update(data.patch as any)
      .eq("id", data.reservation_id);
    if (data.not_status) query = query.neq("status", data.not_status);

    const { data: updated, error } = await query.select("id").maybeSingle();
    if (error) throw new Error(`reservation_update_failed: ${error.message}`);
    return { changed: !!updated };
  });

/**
 * Listing des réservations selon l'onglet appelant :
 * - "planning" : les courses du jour (planning.tsx)
 * - "clients"  : l'historique complet, agrégé par client côté client
 *   (ClientsTab), plus la table `clients` (id/phone) quand elle existe, pour
 *   permettre la suppression ciblée d'un client par id.
 */
export const driverListReservations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ scope: z.enum(["planning", "clients"]) }).parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.scope === "planning") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data: rows, error } = await supabaseAdmin
        .from("reservations")
        .select(RESA_COLUMNS)
        .gte("pickup_datetime", start.toISOString())
        .lt("pickup_datetime", end.toISOString())
        .order("pickup_datetime", { ascending: true });
      if (error) throw new Error(`planning_failed: ${error.message}`);
      return { rows: ((rows as any[]) ?? []) as Resa[] };
    }

    // scope === "clients" : historique complet, plus récent en premier.
    const { data: rows, error } = await supabaseAdmin
      .from("reservations")
      .select(RESA_COLUMNS)
      .order("pickup_datetime", { ascending: false })
      .limit(2000);
    if (error) throw new Error(`clients_failed: ${error.message}`);

    // Table `clients` optionnelle (id stable pour la suppression groupée) :
    // ignorée silencieusement si elle n'existe pas encore côté base.
    let clients: { id: string; phone: string }[] = [];
    try {
      const { data: cRows } = await supabaseAdmin.from("clients" as any).select("id, phone");
      clients = ((cRows as any[]) ?? []).map((c) => ({ id: c.id, phone: c.phone }));
    } catch {
      clients = [];
    }

    return { rows: ((rows as any[]) ?? []) as Resa[], clients };
  });

/** Supprime un client : sa fiche (si elle existe) + toutes ses réservations. */
export const driverDeleteClient = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      phone: z.string().trim().min(1).max(30),
      client_id: z.string().uuid().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: resaError } = await supabaseAdmin.from("reservations").delete().eq("client_phone", data.phone);
    if (resaError) throw new Error(`client_reservations_delete_failed: ${resaError.message}`);

    if (data.client_id) {
      // Best-effort : la table `clients` peut ne pas exister selon les
      // environnements — on ne bloque pas la suppression des réservations.
      try {
        await supabaseAdmin
          .from("clients" as any)
          .delete()
          .eq("id", data.client_id);
      } catch {
        /* ignore */
      }
    }

    return { ok: true };
  });
