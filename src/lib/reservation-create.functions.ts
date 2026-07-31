import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Création de réservation côté serveur.
 * Le client anonyme n'a aucun droit de lecture sur `reservations` (RLS),
 * l'insertion + relecture (id / suivi_id) doit donc passer par le serveur.
 */
const CreateSchema = z.object({
  nom: z.string().trim().min(1).max(200),
  telephone: z.string().trim().min(5).max(30),
  email: z.string().trim().max(320).nullable().optional(),
  depart: z.string().trim().min(1).max(500),
  arrivee: z.string().trim().min(1).max(500),
  pickup_datetime: z.string().min(4).max(60),
  passagers: z.number().int().min(1).max(12),
  bagages: z.number().int().min(0).max(20).nullable().optional(),
  suivi_id: z.string().trim().min(3).max(80),
  distance_km: z.number().nonnegative().nullable().optional(),
  duree_s: z.number().int().nonnegative().nullable().optional(),
  paiement: z.string().trim().max(40).nullable().optional(),
  tarif_jour: z.boolean().nullable().optional(),
  prix_estime: z.number().nonnegative().nullable().optional(),
  lang: z.enum(["fr", "en"]).default("fr"),
  message: z.string().trim().max(2000).nullable().optional(),
  service_type: z.string().trim().max(40).default("standard"),
  source: z.string().trim().max(40).default("form"),
});

export const createReservationPublic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email || null;
    const payload: any = {
      nom: data.nom,
      telephone: data.telephone,
      email,
      depart: data.depart,
      arrivee: data.arrivee,
      pickup_datetime: data.pickup_datetime,
      passagers: data.passagers,
      bagages: data.bagages ?? 0,
      service_type: data.service_type,
      status: "pending",
      suivi_id: data.suivi_id,
      client_name: data.nom,
      client_phone: data.telephone,
      client_email: email,
      destination: data.arrivee,
      distance_km: data.distance_km ?? null,
      duree_s: data.duree_s && data.duree_s > 0 ? data.duree_s : null,
      nb_passagers: data.passagers,
      paiement: data.paiement ?? null,
      tarif_jour: data.tarif_jour ?? null,
      prix_estime: data.prix_estime ?? null,
      source: data.source,
      lang: data.lang,
      message: data.message || null,
      // client_account_id volontairement absent : réservation invitée
    };

    const { data: inserted, error } = await supabaseAdmin
      .from("reservations")
      .insert(payload)
      .select("id,suivi_id")
      .single();
    if (error) throw new Error(error.message);
    return inserted as { id: string; suivi_id: string | null };
  });

/** Indique si un taxi est disponible (aucune course active en cours). */
export const getTaxiAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .in("status", ["accepted", "en_route", "arrived"]);
  if (error) throw new Error(error.message);
  return { available: (count ?? 0) === 0 };
});
