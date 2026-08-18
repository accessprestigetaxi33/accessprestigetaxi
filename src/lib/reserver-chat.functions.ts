// Assistante de réservation conversationnelle (Access Prestige Taxi).
// Même architecture que le projet de référence : un unique server fn qui
// exécute une boucle d'appels d'outils (compute_quote, check_slot,
// confirm_reservation) contre la passerelle IA Lovable, puis renvoie la
// réponse finale + le devis + l'identifiant de réservation.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { routeGoogle } from "@/lib/google.server";
import { resolveAddress, sanitizeAssistantReply } from "@/lib/address-resolver.server";
import { calculerPrixMixte, estTarifJourParis, parseAsParisTime } from "@/lib/tarif";

const MIN_SPACING_MIN = 20;
const MODEL = "google/gemini-2.5-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const BRAND = "Access Prestige Taxi";

type ChatMsg = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
  name?: string;
};

const SYSTEM_PROMPT = (
  now: string,
  lang: string,
  departureContext: string,
  hasDeparture: boolean,
) => `Tu es Margot, assistante réservation d'${BRAND}, en Charente-Maritime. Langue de réponse : ${lang}.

IDENTITÉ & TON — RÈGLE ABSOLUE :
Tu es une personne réelle, chaleureuse, calme et professionnelle — comme une standardiste expérimentée d'une compagnie de taxi haut de gamme. Vouvoiement systématique. Phrases courtes, naturelles, humaines.
• Commence la toute première réponse par une salutation brève ("Bonjour, Margot d'Access Prestige Taxi à votre écoute.") — jamais dans les réponses suivantes.
• Utilise des formules humaines : "Bien sûr", "Avec plaisir", "Je comprends", "Un instant, je vérifie…", "Parfait, c'est noté".
• INTERDIT ABSOLU : argot, familiarités, plaisanteries, ironie, jargon informatique ("système", "bug", "serveur", "modèle", "IA", "chatbot"), majuscules criées, codes techniques en MAJUSCULES_AVEC_UNDERSCORES, emojis autres que 📍.
• En cas de difficulté : reste factuelle, calme, orientée solution. Ne rejette jamais la faute sur le client.

${departureContext}

Objectif : réserver en EXACTEMENT 2 questions d'information (+ la confirmation du prix). Chaque question regroupe toutes les infos nécessaires en une seule phrase claire.

RÈGLE PRIORITAIRE — NE JAMAIS REDEMANDER UNE INFO DÉJÀ DONNÉE : avant de poser une question, relis TOUS les messages du client depuis le début de la conversation, y compris son tout premier message. S'il a déjà indiqué la destination, le jour/l'heure ("tout de suite", "demain 14h", un nom de lieu…), le nom, le téléphone ou l'email — même sans qu'on les lui ait demandés — ne repose jamais la question correspondante. Utilise directement ce qu'il a donné et ne demande que ce qui manque réellement. Si toutes les infos d'une étape sont déjà connues, saute directement à l'étape suivante (jusqu'à l'appel d'outil) sans reformuler la question.

Étape 1 — Trajet : UNE SEULE question qui demande ${hasDeparture ? "à la fois la **destination** et le **jour/heure**" : "à la fois le **départ**, la **destination** et le **jour/heure**"} — mais uniquement pour les informations que le client n'a pas déjà données (ex : "Avec plaisir. Quelle est votre destination, et à quelle heure souhaitez-vous être pris en charge ?"). Si le client a déjà précisé l'heure ("tout de suite" = maintenant + 15 min) ou la destination dans un message précédent, ne demande que ce qui reste manquant, ou rien du tout si tout est déjà connu. Il est actuellement ${now}, heure de Paris — c'est ta seule référence pour "maintenant".

FORMAT pickup_datetime OBLIGATOIRE : ISO 8601 en heure 24h, sans suffixe de fuseau, ex "2026-07-06T16:00:00". Un client qui dit "16h" ou "4h de l'après-midi" → toujours '16:00:00', JAMAIS '04:00:00'.
Étape 2 — Devis : appelle compute_quote puis check_slot. Annonce prix + heure naturellement ("Comptez environ 32 € pour une prise en charge à 14h00."). Puis : "Souhaitez-vous que je confirme la réservation ?"
Étape 3 — Contact : UNE SEULE question qui demande **nom, téléphone et email** — les 3 sont obligatoires.

Puis confirm_reservation. Passagers=1, bagages=0 par défaut.

Règles métier :
• Tarifs : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit (19h-7h), le dimanche et les jours fériés. Tarif mixte automatique.
• Flotte : BMW iX1 électrique (5 places), Audi Q6 e-tron électrique (5 places) et van Mercedes (8 places). Propose le van dès 6 passagers ou pour un groupe.
• Sièges bébé et sièges enfant disponibles sur demande, sans supplément.
• Zone SEO : Charente-Maritime (La Rochelle, Rochefort, Royan, Saintes, Île de Ré, Île d'Oléron, Châtelaillon-Plage…). Prestations toutes distances vers la France et l'Europe, toutes gares et tous aéroports.
• Synonymes : "aéroport" → "Aéroport La Rochelle-Île de Ré", "gare" → "Gare de La Rochelle", "zoo" → "Zoo de La Palmyre".
• Paiement : carte bancaire à bord, espèces, virement.
• Si le départ ou l'arrivée n'est pas situé précisément : demande avec empathie le numéro et la rue, la ville, ou un point de repère connu. Ne dis jamais "erreur", "invalide", "introuvable".
• Si check_slot renvoie ok:false : "Ce créneau vient d'être réservé, je suis désolée. Je peux vous proposer [suggestions] — lequel vous conviendrait ?"
• Si l'heure est passée : propose un créneau au moins 15 minutes après maintenant.
• Après confirmation : "C'est confirmé, votre réservation est enregistrée. Votre chauffeur est prévenu et vous recevrez la confirmation par email. Excellente journée à vous."`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "compute_quote",
      description:
        "Calcule la distance, la durée et le tarif estimé d'une course taxi en Charente-Maritime entre deux adresses pour un horaire donné.",
      parameters: {
        type: "object",
        properties: {
          depart: { type: "string" },
          arrivee: { type: "string" },
          pickup_datetime: {
            type: "string",
            description:
              "Datetime ISO 8601 SANS suffixe de fuseau (ex: '2026-07-06T16:00:00'), heure LOCALE de Paris, format 24h obligatoire. 16h l'après-midi = '16:00:00', JAMAIS '04:00:00'.",
          },
        },
        required: ["depart", "arrivee", "pickup_datetime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_slot",
      description: "Vérifie qu'aucune autre réservation n'est trop proche du créneau demandé.",
      parameters: {
        type: "object",
        properties: {
          pickup_datetime: {
            type: "string",
            description:
              "Datetime ISO 8601 SANS suffixe de fuseau, heure LOCALE de Paris, format 24h obligatoire (16h = '16:00:00').",
          },
        },
        required: ["pickup_datetime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirm_reservation",
      description: "Crée définitivement la réservation après confirmation du client.",
      parameters: {
        type: "object",
        properties: {
          nom: { type: "string" },
          telephone: { type: "string" },
          email: { type: "string" },
          depart: { type: "string" },
          arrivee: { type: "string" },
          pickup_datetime: {
            type: "string",
            description:
              "Datetime ISO 8601 SANS suffixe de fuseau, heure LOCALE de Paris, format 24h obligatoire.",
          },
          passagers: { type: "number" },
          bagages: { type: "number" },
          service_type: { type: "string" },
          distance_km: { type: "number" },
          duree_min: { type: "number" },
          prix_estime: { type: "number" },
          message: { type: "string" },
        },
        required: ["nom", "telephone", "email", "depart", "arrivee", "pickup_datetime"],
      },
    },
  },
] as const;

async function computeQuote(
  args: { depart: string; arrivee: string; pickup_datetime: string },
  langCode: string,
  gpsOrigin?: { lat: number; lng: number; label?: string } | null,
) {
  const targetTs = parseAsParisTime(args.pickup_datetime);
  if (!Number.isNaN(targetTs.getTime()) && targetTs.getTime() < Date.now() - 2 * 60_000) {
    return {
      ok: false,
      error:
        "HEURE_PASSEE: l'heure demandée est déjà passée. Demande au client une heure future (au moins 15 min après maintenant) avant de calculer le prix.",
    };
  }

  const useGps =
    !!gpsOrigin &&
    (!args.depart ||
      args.depart === gpsOrigin.label ||
      /position|gps|actuelle|ici|current/i.test(args.depart));

  const fromRes = useGps
    ? ({
        ok: true as const,
        geocode: {
          lat: gpsOrigin!.lat,
          lng: gpsOrigin!.lng,
          label: gpsOrigin!.label ?? "Position actuelle",
          confidence: 1,
        },
      } as any)
    : await resolveAddress(args.depart, "depart", langCode);
  const toRes: any = await resolveAddress(args.arrivee, "arrivee", langCode);

  if (!fromRes.ok)
    return {
      ok: false,
      error: `DEPART_A_PRECISER: ${fromRes.hint} Garde l'heure inchangée. N'utilise JAMAIS les mots "erreur", "invalide", "introuvable", "système".`,
    };
  if (!toRes.ok)
    return {
      ok: false,
      error: `ARRIVEE_A_PRECISER: ${toRes.hint} Garde l'heure inchangée. N'utilise JAMAIS les mots "erreur", "invalide", "introuvable", "système". Ne propose JAMAIS une autre heure.`,
    };

  const from = fromRes.geocode;
  const to = toRes.geocode;
  const r = await routeGoogle(from, to, args.pickup_datetime);
  if (!r)
    return {
      ok: false,
      error:
        "TRAJET_A_PRECISER: indique calmement au client que tu n'arrives pas à calculer précisément le trajet et demande-lui un repère plus clair. Ne change PAS l'heure.",
    };

  const kmRaw = r.distanceKm;
  return {
    ok: true,
    distance_km: Math.round(kmRaw * 10) / 10,
    duree_min: Math.round(r.dureeS / 60),
    duree_s: r.dureeS,
    prix_estime: calculerPrixMixte(kmRaw, args.pickup_datetime),
    depart_resolu: from.label,
    arrivee_resolu: to.label,
    // Renvoyé au navigateur pour le récapitulatif affiché avant confirmation.
    pickup_datetime: args.pickup_datetime,
  };
}

async function checkSlot(args: { pickup_datetime: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const target = parseAsParisTime(args.pickup_datetime);
  if (Number.isNaN(target.getTime())) return { ok: false, error: "Date invalide" };
  if (target.getTime() < Date.now() - 2 * 60_000) {
    const nowStr = new Date(Date.now() + 15 * 60_000).toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      dateStyle: "short",
      timeStyle: "short",
    });
    return {
      ok: false,
      error: `HEURE_PASSEE: l'heure demandée est déjà passée. Propose au client une heure future (par exemple à partir de ${nowStr}).`,
    };
  }
  const wMs = MIN_SPACING_MIN * 60 * 1000;
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("id, pickup_datetime")
    .in("status", ["pending", "accepted", "en_route", "arrived"])
    .gte("pickup_datetime", new Date(target.getTime() - wMs).toISOString())
    .lte("pickup_datetime", new Date(target.getTime() + wMs).toISOString());
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: true };
  const last = Math.max(...data.map((r: any) => new Date(r.pickup_datetime).getTime()));
  const suggestions = [30, 45, 90].map((m) => new Date(last + m * 60_000).toISOString());
  return { ok: false, conflict_at: (data[0] as any).pickup_datetime, suggestions };
}

function newSuiviId() {
  return `APT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function confirmReservation(
  args: any,
  langCode: "fr" | "en",
  clientFcmToken?: string | null,
) {
  const normalizedEmail = typeof args.email === "string" ? args.email.trim().toLowerCase() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
    return {
      ok: false as const,
      error: "EMAIL_OBLIGATOIRE: demande au client son email valide avant de confirmer.",
    };
  }

  const slot = await checkSlot({ pickup_datetime: args.pickup_datetime });
  if (!slot.ok)
    return {
      ok: false as const,
      error: "Créneau indisponible",
      conflict_at: (slot as any).conflict_at,
      suggestions: (slot as any).suggestions,
    };

  // Sécurité tarifaire : on ne fait jamais confiance au prix renvoyé par le modèle.
  // Cet appel réseau (Google) ne doit JAMAIS faire échouer une réservation par
  // ailleurs valide (créneau OK, coordonnées OK) : un timeout/429/credentials
  // manquants sur ce simple recalcul de contrôle ne doit dégrader que le
  // détail du prix, jamais bloquer la création de la course.
  let quote: any = { ok: false };
  try {
    quote = await computeQuote(
      { depart: args.depart, arrivee: args.arrivee, pickup_datetime: args.pickup_datetime },
      langCode,
      null,
    );
  } catch (e) {
    console.warn("[chat] price safety recompute failed, falling back to model-provided values", e);
  }
  const depart = (quote as any).depart_resolu ?? args.depart;
  const arrivee = (quote as any).arrivee_resolu ?? args.arrivee;
  const distanceKm = (quote as any).distance_km ?? args.distance_km ?? null;
  // duree_s doit être un entier en base : args.duree_min vient du modèle et
  // n'est pas garanti entier, on arrondit pour éviter une valeur invalide.
  const dureeS =
    (quote as any).duree_s ?? (args.duree_min ? Math.round(args.duree_min * 60) : null);
  const prix = (quote as any).prix_estime ?? args.prix_estime ?? null;

  const suiviId = newSuiviId();

  // Validation ISO en amont (hors try d'insertion) pour renvoyer un message
  // clair au modèle plutôt qu'un crash si la date est mal formée.
  const parsedPickup = parseAsParisTime(args.pickup_datetime);
  if (Number.isNaN(parsedPickup.getTime())) {
    return {
      ok: false as const,
      error: "DATE_INVALIDE: reformule la date/heure au format demandé et réessaie.",
    };
  }
  const pickupIso = parsedPickup.toISOString();

  // Insertion DIRECTE via supabaseAdmin — comme dans le projet de référence
  // qui fonctionne. On évite d'appeler une autre createServerFn
  // (createReservationPublic) DEPUIS ce handler : cet appel imbriqué peut
  // échouer silencieusement en production (contexte de requête non transmis
  // à l'appel interne, round-trip qui échoue) sans jamais faire remonter
  // d'erreur exploitable — c'est ce qui empêchait le console.error d'avant
  // de jamais rien afficher alors que la réservation échouait à chaque fois.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const payload = {
    nom: String(args.nom).slice(0, 200),
    telephone: String(args.telephone).slice(0, 30),
    email: normalizedEmail,
    depart,
    arrivee,
    pickup_datetime: pickupIso,
    date_heure: pickupIso,
    passagers: Number(args.passagers) > 0 ? Math.min(Math.round(Number(args.passagers)), 12) : 1,
    bagages: Number.isFinite(Number(args.bagages))
      ? Math.max(0, Math.min(Math.round(Number(args.bagages)), 20))
      : 0,
    service_type: args.service_type ?? "standard",
    status: "pending",
    suivi_id: suiviId,
    client_name: String(args.nom).slice(0, 200),
    client_phone: String(args.telephone).slice(0, 30),
    client_email: normalizedEmail,
    destination: arrivee,
    distance_km: distanceKm,
    duree_s: dureeS,
    nb_passagers: Number(args.passagers) > 0 ? Math.min(Math.round(Number(args.passagers)), 12) : 1,
    paiement: null,
    tarif_jour: estTarifJourParis(args.pickup_datetime),
    prix_estime: prix,
    source: "chat",
    lang: langCode,
    message: args.message ?? null,
  };

  const { data: inserted, error } = await supabaseAdmin
    .from("reservations")
    .insert(payload as any)
    .select("id, suivi_id")
    .single();

  if (error) {
    // Avant : l'erreur réelle (contrainte DB, RLS, champ manquant…) était
    // avalée par l'appel imbriqué — seul un message générique repartait vers
    // le modèle, qui n'avait aucun cas prévu pour ça et finissait par
    // improviser une excuse, sans que la vraie cause n'apparaisse nulle part.
    // On journalise maintenant l'erreur Postgres complète (code/détails/hint
    // en plus du message) pour pouvoir la corriger si ça se reproduit.
    console.error("[chat] confirm_reservation insert failed:", {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
      hint: (error as any).hint,
      nom: args?.nom,
      depart,
      arrivee,
      pickup_datetime: args?.pickup_datetime,
    });
    return { ok: false as const, error: error.message ?? "insert_failed" };
  }

  const trackingLink = `https://accessprestigetaxi.lovable.app/suivi/${suiviId}`;

  // Lie le token push générique de /reserver à cette réservation précise.
  if (clientFcmToken && /^[A-Za-z0-9_\-:]{50,500}$/.test(clientFcmToken)) {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const endpoint = `fcm://${clientFcmToken}-client-reservation-${inserted.id}`;
      await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
      await supabaseAdmin.from("push_subscriptions").insert({
        audience: "client",
        endpoint,
        fcm_token: clientFcmToken,
        reservation_id: inserted.id,
        last_seen_at: new Date().toISOString(),
      } as any);
    } catch (e) {
      console.warn("[chat] client push link failed", e);
    }
  }

  try {
    const { deliverClientConfirmation, logReservationEvent, sendDriverPush } =
      await import("@/lib/reservation-notifications.server");
    const when = new Date(pickupIso).toLocaleString(langCode === "en" ? "en-GB" : "fr-FR", {
      timeZone: "Europe/Paris",
      dateStyle: "long",
      timeStyle: "short",
    });
    await deliverClientConfirmation({
      reservationId: inserted.id,
      email: normalizedEmail,
      lang: langCode,
      payload: {
        clientName: args.nom,
        pickupDatetime: when,
        depart,
        arrivee,
        priceEstimate: prix ?? 0,
        trackingId: suiviId,
        trackingLink,
      },
    });
    await logReservationEvent(
      inserted.id,
      "created_from_chat",
      null,
      null,
      null,
      args.nom,
      depart,
      arrivee,
    );
    await sendDriverPush(
      "chauffeur",
      langCode === "en" ? "New booking" : "Nouvelle réservation",
      `${args.nom} — ${depart} → ${arrivee}`,
      "/driver",
      inserted.id,
    );
  } catch (e) {
    console.warn("[chat] reservation notifications failed", e);
  }

  return {
    ok: true as const,
    reservation_id: inserted.id,
    suivi_id: suiviId,
    tracking_link: trackingLink,
  };
}

export const aiChatReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
          .max(60),
        lang: z.string().default("français"),
        lang_code: z.enum(["fr", "en"]).default("fr"),
        gps: z
          .object({ lat: z.number(), lng: z.number(), label: z.string().optional() })
          .nullable()
          .optional(),
        departure: z
          .object({ label: z.string(), lat: z.number().optional(), lng: z.number().optional() })
          .nullable()
          .optional(),
        client_fcm_token: z.string().min(50).max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const now = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const departureLabel =
      data.departure?.label ??
      data.gps?.label ??
      (data.gps ? `${data.gps.lat.toFixed(5)}, ${data.gps.lng.toFixed(5)}` : null);
    const hasDeparture = !!departureLabel;
    const departureCoords =
      data.departure?.lat != null && data.departure?.lng != null
        ? ` Coordonnées fiables pour le calcul : ${data.departure.lat}, ${data.departure.lng}.`
        : data.gps
          ? ` Coordonnées fiables pour le calcul : ${data.gps.lat}, ${data.gps.lng}.`
          : "";
    const departureContext = hasDeparture
      ? `DÉPART DÉJÀ DÉTECTÉ ET CONFIRMÉ : "${departureLabel}".${departureCoords}
RÈGLE PRIORITAIRE : considère ce départ comme suffisamment précis, même si son libellé est seulement une ville ou un quartier. Ne demande JAMAIS de numéro de rue. Lors de compute_quote, recopie exactement ce libellé afin que les coordonnées détectées soient utilisées.`
      : `ADRESSE DE DÉPART : non disponible — demande-la au client.`;

    const msgs: ChatMsg[] = [
      { role: "system", content: SYSTEM_PROMPT(now, data.lang, departureContext, hasDeparture) },
      ...data.messages,
    ];

    let lastReservationId: string | null = null;
    let lastSuiviId: string | null = null;
    let lastQuote: any = null;

    for (let i = 0; i < 8; i++) {
      const res = await fetch(GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
        body: JSON.stringify({ model: MODEL, messages: msgs, tools: TOOLS, tool_choice: "auto" }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        if (res.status === 429)
          throw new Error("Trop de demandes simultanées, réessayez dans une minute.");
        if (res.status === 402) throw new Error("Service momentanément indisponible.");
        throw new Error(`AI ${res.status}: ${txt.slice(0, 200)}`);
      }
      const json: any = await res.json();
      const choice = json?.choices?.[0]?.message;
      if (!choice) throw new Error("AI no choice");

      const toolCalls = choice.tool_calls ?? [];
      if (toolCalls.length === 0) {
        return {
          reply: sanitizeAssistantReply(choice.content ?? "", data.lang_code),
          reservation_id: lastReservationId,
          suivi_id: lastSuiviId,
          quote: lastQuote,
        };
      }

      msgs.push({ role: "assistant", content: choice.content ?? "", tool_calls: toolCalls });

      for (const tc of toolCalls) {
        const fnName = tc.function?.name;
        let args: any = {};
        try {
          args = JSON.parse(tc.function?.arguments ?? "{}");
        } catch {}
        let result: any;
        if (fnName === "compute_quote") {
          const gpsOrigin = data.gps
            ? {
                lat: data.gps.lat,
                lng: data.gps.lng,
                label: data.departure?.label ?? data.gps.label,
              }
            : data.departure && data.departure.lat != null && data.departure.lng != null
              ? { lat: data.departure.lat, lng: data.departure.lng, label: data.departure.label }
              : null;
          result = await computeQuote(args, data.lang_code, gpsOrigin);
          if (result.ok) lastQuote = result;
        } else if (fnName === "check_slot") {
          result = await checkSlot(args);
        } else if (fnName === "confirm_reservation") {
          result = await confirmReservation(args, data.lang_code, data.client_fcm_token ?? null);
          if (result.ok) {
            lastReservationId = result.reservation_id;
            lastSuiviId = result.suivi_id;
            return {
              reply:
                data.lang_code === "en"
                  ? "Your booking is confirmed. Your driver has been notified and your confirmation is on its way."
                  : "Votre réservation est confirmée. Votre chauffeur est prévenu et votre confirmation est en cours d’envoi.",
              reservation_id: lastReservationId,
              suivi_id: lastSuiviId,
              quote: lastQuote,
            };
          }
        } else {
          result = { error: "unknown_tool" };
        }
        msgs.push({
          role: "tool",
          tool_call_id: tc.id,
          name: fnName,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      reply: sanitizeAssistantReply(
        lastReservationId
          ? data.lang_code === "en"
            ? "Your booking is confirmed. Your driver has been notified."
            : "Votre réservation est confirmée. Votre chauffeur est prévenu."
          : data.lang_code === "en"
            ? "One moment please, I could not complete your request. Could you rephrase it?"
            : "Un instant s'il vous plaît, je n'ai pas pu finaliser votre demande. Pourriez-vous la reformuler ?",
        data.lang_code,
      ),
      reservation_id: lastReservationId,
      suivi_id: lastSuiviId,
      quote: lastQuote,
    };
  });
