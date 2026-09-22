import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PUBLIC_COLUMNS =
  "id, nom, telephone, email, pickup_datetime, depart, arrivee, passagers, bagages, service_type, message, status, created_at, suivi_id, tracking_id, client_account_id";
const FIN_PUBLIC_COLUMNS =
  "id,depart,destination,arrivee,status,prix_estime,distance_km,duree_s,nb_passagers,bagages,nom,client_name,email,client_email,telephone,client_phone,paiement,heure_course,pickup_datetime,suivi_id";
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Preuve d'appartenance d'une réservation.
 *
 * L'identifiant de course (UUID en URL) ne suffit pas : il peut fuiter par
 * lien partagé, historique de navigation, referer ou journaux serveur. Le
 * porteur doit présenter soit la clé de suivi (`suivi_id` / `tracking_id`),
 * soit un jeton de session client propriétaire de la course.
 */
const ProofSchema = z.object({
  id: z.string().uuid(),
  /** Clé de suivi (`suivi_id` / `tracking_id`) de la course. */
  proof: z.string().trim().min(3).max(80).nullable().optional(),
  /** Jeton de session client (auth maison). */
  token: z.string().trim().min(32).max(128).nullable().optional(),
});

async function isOwner(row: any, proof?: string | null, token?: string | null): Promise<boolean> {
  const key = (proof ?? "").trim().toLowerCase();
  if (key) {
    if (row.suivi_id && String(row.suivi_id).toLowerCase() === key) return true;
    if (row.tracking_id && String(row.tracking_id).toLowerCase() === key) return true;
  }
  if (token) {
    try {
      const { requireClientSession } = await import("@/lib/client-session.server");
      const identity = await requireClientSession(token);
      if (row.client_account_id && row.client_account_id === identity.account_id) return true;
    } catch {
      /* jeton invalide : aucune preuve */
    }
  }
  return false;
}

export const getReservationPublic = createServerFn({ method: "POST" })
  .inputValidator((input) => ProofSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .select(PUBLIC_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const owner = await isOwner(row, data.proof, data.token);
    const { suivi_id, tracking_id, client_account_id, ...rest } = row as any;
    if (owner) return { ...rest, suivi_id, can_cancel: true };

    // Sans preuve d'appartenance : aucune donnée de contact n'est renvoyée.
    return {
      ...rest,
      nom: "",
      telephone: "",
      email: null,
      message: null,
      suivi_id: null,
      can_cancel: false,
    };
  });

export const cancelReservationPublic = createServerFn({ method: "POST" })
  .inputValidator((input) => ProofSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/lib/nova-supabase.server");

    const { data: existing, error: readErr } = await supabaseAdmin
      .from("reservations")
      .select("id, suivi_id, tracking_id, client_account_id")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!existing) return { ok: false };
    if (!(await isOwner(existing, data.proof, data.token))) throw new Error("UNAUTHORIZED");

    const { data: updated, error } = await supabaseAdmin
      .from("reservations")
      .update({ status: "annulee" })
      .eq("id", data.id)
      .not("status", "in", "(annulee,terminee)")
      .select("id, email, client_email, lang, nom, client_name, pickup_datetime, depart, arrivee, destination")
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (updated) {
      try {
        const row: any = updated;
        const email = row.client_email || row.email;
        if (email) {
          const { sendClientCancellationEmail } = await import("@/lib/reservation-notifications.server");
          await sendClientCancellationEmail({
            reservationId: data.id,
            email,
            lang: row.lang ?? "fr",
            clientName: row.client_name ?? row.nom ?? null,
            pickupDatetime: row.pickup_datetime ?? null,
            depart: row.depart ?? null,
            arrivee: row.arrivee ?? row.destination ?? null,
          });
        }
      } catch (e) {
        console.warn("[reservation] cancellation email failed", e);
      }
    }

    return { ok: !!updated };
  });


export const getReservationForFinPublic = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ key: z.string().trim().min(3).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const key = data.key.trim();
    const { getTaxiSupabaseAdmin } = await import("@/lib/taxi-supabase.server");
    const supabaseAdmin = getTaxiSupabaseAdmin();

    const base = supabaseAdmin.from("reservations").select(FIN_PUBLIC_COLUMNS).limit(1);
    const { data: rows, error } = UUID_RE.test(key)
      ? await base.or(`id.eq.${key.toLowerCase()},suivi_id.eq.${key.toLowerCase()}`)
      : await base.eq("suivi_id", key);

    if (error) throw new Error(error.message);
    const row = rows?.[0] ?? null;
    if (!row) return null;
    return {
      ...row,
      destination: row.destination ?? row.arrivee ?? "",
      nb_passagers: row.nb_passagers ?? null,
      nb_bagages: (row as any).bagages ?? null,
      prix_final: null,
      distance_reelle_km: null,
      duree_reelle_min: null,
      chauffeur_id: null,
      prenom: row.client_name ?? row.nom ?? "Client",
      nom: row.nom ?? row.client_name ?? "Client",
      email: row.email ?? row.client_email ?? "",
      telephone: row.telephone ?? row.client_phone ?? "",
      paiement: row.paiement ?? "especes",
    };
  });

export const getPriceHistoryPublic = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ key: z.string().trim().min(3).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const key = data.key.trim();
    const { getTaxiSupabaseAdmin } = await import("@/lib/taxi-supabase.server");
    const supabaseAdmin = getTaxiSupabaseAdmin();
    const { data: rows, error } = await supabaseAdmin.rpc("get_price_history_for_suivi", {
      p_key: key,
    });
    if (error) throw new Error(error.message);
    return Array.isArray(rows) ? rows : [];
  });
