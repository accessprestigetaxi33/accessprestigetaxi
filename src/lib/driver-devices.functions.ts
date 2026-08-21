import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Gestion des demandes de devis (table `devis`) depuis le panneau chauffeur.
 * Le navigateur du chauffeur n'est pas authentifié Supabase : toute lecture/
 * écriture sensible passe ici après validation du jeton chauffeur.
 */
const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

export type Devis = {
  id: string;
  reference: string;
  nom: string;
  email: string;
  telephone: string | null;
  depart: string;
  arrivee: string;
  date_souhaitee: string | null;
  heure_souhaitee: string | null;
  aller_retour: boolean;
  passagers: number;
  bagages: number;
  vehicule: string | null;
  prestation: string | null;
  transport_sanitaire: boolean;
  fauteuil_roulant: boolean;
  transport_groupe: boolean;
  sieges_enfant: boolean;
  distance_km: number | null;
  prix_estime: number | null;
  precisions: string | null;
  langue: string;
  statut: string;
  reponse: string | null;
  prix_propose: number | null;
  created_at: string;
  updated_at: string;
};

const DEVIS_COLUMNS =
  "id,reference,nom,email,telephone,depart,arrivee,date_souhaitee,heure_souhaitee,aller_retour,passagers,bagages,vehicule,prestation,transport_sanitaire,fauteuil_roulant,transport_groupe,sieges_enfant,distance_km,prix_estime,precisions,langue,statut,reponse,prix_propose,created_at,updated_at";

/** Liste des devis, plus récents en premier. */
export const listDriverDevis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("devis")
      .select(DEVIS_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`devis_list_failed: ${error.message}`);

    const list = ((rows as any[]) ?? []) as Devis[];
    return {
      devis: list,
      // NOTE : "recu" est la valeur par défaut observée en base (column_default
      // de `statut`). À ajuster si d'autres valeurs de statut "en attente"
      // existent réellement dans vos données.
      pending: list.filter((d) => d.statut === "recu").length,
    };
  });

const PatchSchema = z.object({
  // NOTE : enum construit par hypothèse (recu = valeur par défaut confirmée en
  // base ; traite/accepte/refuse = supposés). Dis-moi les vraies valeurs de
  // `statut` utilisées si elles diffèrent, j'ajuste en une passe.
  statut: z.enum(["recu", "traite", "accepte", "refuse"]).optional(),
  reponse: z.string().trim().max(2000).optional(),
  prix_propose: z.number().nonnegative().max(100000).nullable().optional(),
});

/** Met à jour un devis (statut, réponse texte, prix proposé). */
export const driverUpdateDevis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      devis_id: z.string().uuid(),
      patch: PatchSchema,
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    if (Object.keys(data.patch).length === 0) return { changed: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: updated, error } = await supabaseAdmin
      .from("devis")
      .update(data.patch as any)
      .eq("id", data.devis_id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(`devis_update_failed: ${error.message}`);
    return { changed: !!updated };
  });

/** Supprime définitivement un devis. */
export const driverDeleteDevis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ devis_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("devis").delete().eq("id", data.devis_id);
    if (error) throw new Error(`devis_delete_failed: ${error.message}`);
    return { ok: true };
  });
