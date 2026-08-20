// Logique serveur des demandes de devis : création (référence unique + e-mails)
// et consultation du statut. Jamais importé par le navigateur.
import { getTaxiSupabaseAdmin } from "@/lib/taxi-supabase.server";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SITE = "https://www.accessprestigetaxi.fr";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I, O, 0, 1 (lisible au téléphone)

export function genererReference() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join("");
  return `APT-${code}`;
}

export type DevisInput = {
  nom: string;
  email: string;
  telephone?: string | null;
  depart: string;
  arrivee: string;
  date_souhaitee?: string | null;
  heure_souhaitee?: string | null;
  aller_retour: boolean;
  passagers: number;
  bagages: number;
  vehicule?: string | null;
  prestation?: string | null;
  transport_sanitaire: boolean;
  fauteuil_roulant: boolean;
  transport_groupe: boolean;
  sieges_enfant: boolean;
  distance_km?: number | null;
  prix_estime?: number | null;
  precisions?: string | null;
  langue: "fr" | "en";
};

function formatEUR(v?: number | null) {
  if (v == null || !Number.isFinite(v)) return "";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function formatQuand(d: DevisInput) {
  if (!d.date_souhaitee) return "—";
  const [y, m, day] = d.date_souhaitee.split("-");
  const date = `${day}/${m}/${y}`;
  return d.heure_souhaitee ? `${date} ${d.langue === "en" ? "at" : "à"} ${d.heure_souhaitee}` : date;
}

export async function creerDevis(input: DevisInput) {
  const supabase = getTaxiSupabaseAdmin();

  // La référence est unique en base : on retente en cas de collision improbable.
  let reference = genererReference();
  let inserted: { reference: string } | null = null;
  for (let attempt = 0; attempt < 4 && !inserted; attempt++) {
    const { data, error } = await supabase
      .from("devis")
      .insert({ ...input, reference, statut: "recu" })
      .select("reference")
      .single();
    if (!error && data) {
      inserted = data as { reference: string };
      break;
    }
    if (error && error.code !== "23505") throw new Error(error.message);
    reference = genererReference();
  }
  if (!inserted) throw new Error("Impossible d'enregistrer la demande");

  const quand = formatQuand(input);
  const estimation = input.prix_estime
    ? `≈ ${formatEUR(input.prix_estime)}${input.distance_km ? ` (${Math.round(input.distance_km)} km)` : ""}`
    : "";
  const options = [
    input.aller_retour ? "Aller-retour" : null,
    input.transport_sanitaire ? "Transport sanitaire conventionné" : null,
    input.fauteuil_roulant ? "Fauteuil roulant" : null,
    input.transport_groupe ? "Transport de groupe" : null,
    input.sieges_enfant ? "Siège bébé / rehausseur" : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Les e-mails ne doivent jamais faire échouer l'enregistrement de la demande.
  const results = await Promise.allSettled([
    sendTemplateEmail("devis-confirmation", input.email, {
      idempotencyKey: `devis-client-${inserted.reference}`,
      replyTo: "accessprestigetaxi@gmail.com",
      templateData: {
        nom: input.nom,
        reference: inserted.reference,
        depart: input.depart,
        arrivee: input.arrivee,
        quand,
        vehicule: input.vehicule ?? "",
        passagers: String(input.passagers),
        estimation,
        suiviUrl: `${SITE}/devis/suivi?ref=${encodeURIComponent(inserted.reference)}`,
        lang: input.langue,
      },
    }),
    sendTemplateEmail("devis-admin", "accessprestigetaxi@gmail.com", {
      idempotencyKey: `devis-admin-${inserted.reference}`,
      replyTo: input.email,
      templateData: {
        reference: inserted.reference,
        nom: input.nom,
        email: input.email,
        telephone: input.telephone ?? "",
        depart: input.depart,
        arrivee: input.arrivee,
        quand,
        vehicule: input.vehicule ?? "",
        prestation: input.prestation ?? "",
        passagers: String(input.passagers),
        bagages: String(input.bagages),
        options,
        estimation,
        precisions: input.precisions ?? "",
        lang: input.langue,
      },
    }),
  ]);

  return {
    reference: inserted.reference,
    emailSent: results[0].status === "fulfilled",
  };
}

export async function lireDevis(reference: string, email: string) {
  const supabase = getTaxiSupabaseAdmin();
  const { data, error } = await supabase
    .from("devis")
    .select(
      "reference,statut,created_at,updated_at,depart,arrivee,date_souhaitee,heure_souhaitee,vehicule,passagers,aller_retour,prix_estime,prix_propose,reponse,email",
    )
    .eq("reference", reference.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  // Vérification de propriété : la référence seule ne suffit pas à lire la demande.
  if (!data || String(data.email).toLowerCase() !== email.trim().toLowerCase()) return null;
  const { email: _omit, ...safe } = data as Record<string, any>;
  return safe;
}
