import { streamText, tool, type UIMessage, convertToModelMessages, isStepCount, zodSchema } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, getLovableAiGatewayRunId } from "@/lib/ai-gateway.server";
import { resolveAddress } from "@/lib/address-resolver.server";
import { geocodeGoogle, routeGoogle } from "@/lib/google.server";
import { createReservationPublic } from "@/lib/reservation-create.functions";
import { calculerPrixMixte, estTarifJourParis, parseAsParisTime, partsParis } from "@/lib/tarif";
import { deliverClientConfirmation, logReservationEvent, sendDriverPush } from "@/lib/reservation-notifications.server";
import { formatInTimeZone } from "date-fns-tz";
import { addMinutes, formatISO, parseISO, isBefore, addDays } from "date-fns";

type LovableAiGatewayProvider = ReturnType<typeof createLovableAiGatewayProvider>;

const TIMEZONE = "Europe/Paris";
const MIN_ADVANCE_MINUTES = 60;
const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;
const OPEN_DAYS = [1, 2, 3, 4, 5]; // lundi-vendredi

const BRAND = "Access Prestige Taxi";
const PHONE_PATRICIA = "+33650260015";
const PHONE_ALAIN = "+33650321923";
const WHATSAPP_PATRICIA = "https://wa.me/33650260015";
const WHATSAPP_ALAIN = "https://wa.me/33650321923";
const EMAIL = "taxipatricia@gmail.com";

const SYSTEM_PROMPT_FR = `Tu es Margot, l'assistante de réservation de ${BRAND} en Charente-Maritime.
RÈGLES ABSOLUES :
- Tu ne réponds JAMAIS avec des codes techniques, des tokens d'erreur, des mots en UPPER_SNAKE_CASE, ou des détails internes.
- Si une adresse n'est pas trouvée, demande poliment au client de reformuler avec un repère connu (numéro + rue + ville, ou un lieu connu comme Aéroport La Rochelle, Gare de La Rochelle, Vieux-Port, Aquarium, Zoo de La Palmyre, Fort Boyard, Île de Ré, Île d'Oléron, Royan, Saintes, Rochefort, Châtelaillon-Plage…).
- Si un créneau est refusé, propose une alternative proche et reste concise.
- Tu parles en français courtois et professionnel.
- Tarifs : prise en charge 2,83 €, 2,16 €/km (jour), 3,24 €/km (nuit/dimanche/férié). Tarif mixte appliqué selon l'heure de prise en charge.
- Horaires d'ouverture : lundi au vendredi. Pas de réservation en dehors de ces horaires.
- Flotte : Patricia conduit une BMW iX1 électrique (4 passagers max). Alain conduit un Mercedes V-Class pouvant accueillir jusqu'à 7 passagers.
- Options : siège enfant et siège bébé disponibles sur demande.
- DEMANDES SPÉCIALES (obligatoire) : avant toute confirmation, tu dois TOUJOURS demander spontanément, en une seule question courte, s'il y a des besoins particuliers : siège bébé ou siège enfant (et l'âge/nombre d'enfants), bagages volumineux, animal, fauteuil roulant / PMR, transport sanitaire conventionné, ou toute autre demande. Ne saute jamais cette question, même si le client va vite. Si la réponse est « non », note-le et continue.
- Reporte ces informations dans childSeats, babySeats, bagages et notes lors de l'appel à confirm_reservation.
- Destinations : Charente-Maritime et au-delà (Bordeaux, Nantes, aéroports, gares, etc.).
- Paiement : CB à bord, espèces, virement.
- Quand le client confirme, appelle l'outil confirm_reservation avec toutes les informations collectées.
- Si le client veut un devis sans réserver, appelle compute_quote.
- Si le client demande un créneau spécifique, appelle check_slot.
- Si le client est perdu ou veut parler à un humain, appelle human_handoff.
- N'invente jamais de prix, d'horaire ou de disponibilité. Utilise toujours les outils.`;

const SYSTEM_PROMPT_EN = `You are Margot, the booking assistant for ${BRAND} in Charente-Maritime.
ABSOLUTE RULES:
- NEVER reply with technical codes, error tokens, UPPER_SNAKE_CASE words, or internal details.
- If an address is not found, politely ask the client to rephrase with a clear landmark (street number + street + city, or a known place like La Rochelle Airport, La Rochelle train station, Old Port, Aquarium, La Palmyre Zoo, Fort Boyard, Île de Ré, Île d'Oléron, Royan, Saintes, Rochefort, Châtelaillon-Plage…).
- If a slot is refused, suggest a nearby alternative and stay concise.
- Speak in courteous, professional English.
- Fares: pickup charge €2.83, €2.16/km (day), €3.24/km (night/Sunday/holiday). Mixed fare applied based on pickup time.
- Opening hours:. No bookings outside these hours.
- Fleet: Patricia drives a 100% electric BMW iX1 (max 4 passengers). Alain drives a Mercedes V-Class that can accommodate up to 7 passengers.
- Options: child seat and baby seat available on request.
- SPECIAL REQUESTS (mandatory): before any confirmation, you must ALWAYS proactively ask, in one short question, whether there are special needs: baby or child seat (with children's ages/number), bulky luggage, pet, wheelchair / reduced mobility, approved medical transport, or any other request. Never skip this question, even if the client is in a hurry. If the answer is "no", note it and continue.
- Report this in childSeats, babySeats, bagages and notes when calling confirm_reservation.
- Destinations: Charente-Maritime and beyond (Bordeaux, Nantes, airports, train stations, etc.).
- Payment: card on board, cash, bank transfer.
- When the client confirms, call confirm_reservation with all collected information.
- If the client wants a quote without booking, call compute_quote.
- If the client asks for a specific slot, call check_slot.
- If the client is lost or wants to speak to a human, call human_handoff.
- Never invent prices, times, or availability. Always use the tools.`;

const MAX_STEPS = 8;

function getSystemPrompt(lang: string) {
  return lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_FR;
}

function formatPickupDateTime(iso: string, lang: string) {
  return formatInTimeZone(parseISO(iso), TIMEZONE, lang === "en" ? "MMMM d, yyyy 'at' HH:mm" : "d MMMM yyyy 'à' HH:mm");
}

// Instant "maintenant" (absolu). Les calculs de jour/heure passent par Paris.
function nowParis(): Date {
  return new Date();
}

// Un ISO sans fuseau est interprété comme une heure locale de Paris.
function parsePickup(iso: string): Date {
  return parseAsParisTime(iso);
}

function toParisIso(d: Date): string {
  return formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function isWithinOpeningHours(iso: string): boolean {
  const p = partsParis(iso);
  const day = WEEKDAY_INDEX[p.weekday] ?? new Date(parsePickup(iso)).getUTCDay();
  const hour = p.hour + p.minute / 60;
  return OPEN_DAYS.includes(day) && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

function nextOpenSlot(): Date {
  let candidate = addMinutes(nowParis(), MIN_ADVANCE_MINUTES);
  for (let i = 0; i < 24 * 4 * 8; i++) {
    if (isWithinOpeningHours(toParisIso(candidate))) return candidate;
    candidate = addMinutes(candidate, 15);
  }
  return candidate;
}


function buildTrackingLink(suiviId: string, lang: string) {
  return `https://accessprestigetaxi.lovable.app/${lang === "en" ? "tracking" : "suivi"}?id=${encodeURIComponent(suiviId)}`;
}

const ReservationState = z.object({
  nom: z.string().nullable(),
  telephone: z.string().nullable(),
  email: z.string().nullable(),
  depart: z.string().nullable(),
  arrivee: z.string().nullable(),
  pickup_datetime: z.string().nullable(),
  passagers: z.number().int().nullable(),
  bagages: z.number().int().nullable(),
  childSeats: z.number().int().nullable(),
  babySeats: z.number().int().nullable(),
  notes: z.string().nullable(),
  paiement: z.string().nullable(),
});

type ReservationStateType = z.infer<typeof ReservationState>;

export type ReservationChatInput = {
  messages: UIMessage[];
  lang: "fr" | "en";
  sessionId?: string;
};

export async function runReservationChat(input: ReservationChatInput, request: Request, lovableApiKey: string) {
  const gateway = createLovableAiGatewayProvider(lovableApiKey, getLovableAiGatewayRunId(request));
  const lang = input.lang;

  let state: ReservationStateType = {
    nom: null,
    telephone: null,
    email: null,
    depart: null,
    arrivee: null,
    pickup_datetime: null,
    passagers: null,
    bagages: null,
    childSeats: null,
    babySeats: null,
    notes: null,
    paiement: null,
  };

  const lastUser = [...input.messages].reverse().find((m) => m.role === "user");
  const lastUserData = (lastUser as any)?.data;
  if (lastUserData?.state) {
    const parsed = ReservationState.safeParse(lastUserData.state);
    if (parsed.success) state = parsed.data;
  }

  const system = getSystemPrompt(lang);

  const result = streamText({
    model: gateway("google/gemini-2.5-flash"),
    system,
    messages: await convertToModelMessages(input.messages),
    stopWhen: [isStepCount(MAX_STEPS)],
    tools: buildTools(lang, state, gateway),
  });

  return { result, gateway };
}

function buildTools(lang: string, state: ReservationStateType, _gateway: LovableAiGatewayProvider) {
  return {
    compute_quote: tool({
      description:
        lang === "en"
          ? "Compute a fare estimate between two addresses for a given pickup time and passenger count."
          : "Calcule un devis entre deux adresses pour une heure et un nombre de passagers donnés.",
      inputSchema: zodSchema(
        z.object({
          depart: z.string().describe("Adresse de départ / Pickup address"),
          arrivee: z.string().describe("Adresse d'arrivée / Drop-off address"),
          pickup_datetime: z.string().nullable().describe("ISO datetime de prise en charge (optionnel) / Pickup ISO datetime (optional)"),
          passagers: z.number().int().nullable().describe("Nombre de passagers / Passenger count"),
        }),
      ),
      execute: async (args: { depart: string; arrivee: string; pickup_datetime: string | null; passagers: number | null }) => {
        const from = await resolveAddress(args.depart, "depart", lang);
        const to = await resolveAddress(args.arrivee, "arrivee", lang);
        if (!from.ok) return { error: from.hint } as const;
        if (!to.ok) return { error: to.hint } as const;

        const route = await routeGoogle(from.geocode, to.geocode, args.pickup_datetime ?? undefined);
        if (!route) {
          return {
            error:
              lang === "en"
                ? "Unable to calculate the route. Please check the addresses or contact us."
                : "Impossible de calculer l'itinéraire. Vérifiez les adresses ou contactez-nous.",
          } as const;
        }

        const when = args.pickup_datetime ?? formatISO(addMinutes(new Date(), MIN_ADVANCE_MINUTES));
        const tarifJour = estTarifJourParis(when);
        const price = calculerPrixMixte(route.distanceKm, when);

        state.depart = from.geocode.label;
        state.arrivee = to.geocode.label;
        state.pickup_datetime = when;
        state.passagers = args.passagers ?? state.passagers;

        return {
          depart: from.geocode.label,
          arrivee: to.geocode.label,
          distance_km: Number(route.distanceKm.toFixed(1)),
          duree_min: Math.ceil(route.dureeS / 60),
          tarif_jour: tarifJour,
          prix_estime: price,
          pickup_datetime: when,
          passagers: args.passagers ?? state.passagers,
        };
      },
    }),
    check_slot: tool({
      description:
        lang === "en"
          ? "Check whether a requested pickup slot is available and within opening hours."
          : "Vérifie si un créneau demandé est disponible et dans les horaires d'ouverture.",
      inputSchema: zodSchema(
        z.object({
          pickup_datetime: z.string().describe("ISO datetime de prise en charge / Pickup ISO datetime"),
        }),
      ),
      execute: async (args: { pickup_datetime: string }) => {
        const requested = parsePickup(args.pickup_datetime);
        const minTime = addMinutes(nowParis(), MIN_ADVANCE_MINUTES);
        if (isBefore(requested, minTime)) {
          const next = nextOpenSlot();
          return {
            available: false,
            reason:
              lang === "en"
                ? `Reservations must be made at least ${MIN_ADVANCE_MINUTES} minutes in advance.`
                : `Les réservations doivent être faites au moins ${MIN_ADVANCE_MINUTES} minutes à l'avance.`,
            next_available: formatISO(next),
          };
        }
        if (!isWithinOpeningHours(args.pickup_datetime)) {
          const next = nextOpenSlot();
          return {
            available: false,
            reason: lang === "en" ? "We are open." : "Nous sommes ouverts du lundi au vendredi.",
            next_available: formatISO(next),
          };
        }
        state.pickup_datetime = args.pickup_datetime;
        return {
          available: true,
          reason: lang === "en" ? "The slot is available." : "Le créneau est disponible.",
          next_available: null,
        };
      },
    }),
    confirm_reservation: tool({
      description:
        lang === "en"
          ? "Confirm and create the reservation after collecting all required fields."
          : "Confirme et crée la réservation après avoir collecté tous les champs requis.",
      inputSchema: zodSchema(
        z.object({
          nom: z.string().describe("Nom du client / Client name"),
          telephone: z.string().describe("Téléphone du client / Client phone"),
          email: z.string().nullable().describe("Email du client (optionnel) / Client email (optional)"),
          depart: z.string().describe("Adresse de départ / Pickup address"),
          arrivee: z.string().describe("Adresse d'arrivée / Drop-off address"),
          pickup_datetime: z.string().describe("ISO datetime de prise en charge / Pickup ISO datetime"),
          passagers: z.number().int().describe("Nombre de passagers / Passenger count"),
          bagages: z.number().int().nullable().describe("Nombre de bagages / Luggage count"),
          childSeats: z.number().int().nullable().describe("Nombre de sièges enfant / Child seats"),
          babySeats: z.number().int().nullable().describe("Nombre de sièges bébé / Baby seats"),
          notes: z.string().nullable().describe("Notes / Notes"),
          paiement: z.string().nullable().describe("Mode de paiement / Payment method"),
        }),
      ),
      execute: async (params: {
        nom: string;
        telephone: string;
        email: string | null;
        depart: string;
        arrivee: string;
        pickup_datetime: string;
        passagers: number;
        bagages: number | null;
        childSeats: number | null;
        babySeats: number | null;
        notes: string | null;
        paiement: string | null;
      }) => {
        Object.assign(state, params);

        const from = await resolveAddress(state.depart!, "depart", lang);
        const to = await resolveAddress(state.arrivee!, "arrivee", lang);
        if (!from.ok) return { ok: false, message: from.hint };
        if (!to.ok) return { ok: false, message: to.hint };

        const route = await routeGoogle(from.geocode, to.geocode, state.pickup_datetime!);
        if (!route) {
          return {
            ok: false,
            message:
              lang === "en"
                ? "Unable to calculate the route. Please check the addresses or contact us."
                : "Impossible de calculer l'itinéraire. Vérifiez les adresses ou contactez-nous.",
          };
        }

        const when = state.pickup_datetime!;
        if (!isWithinOpeningHours(when)) {
          return {
            ok: false,
            message:
              lang === "en"
                ? "We are open. Please choose another time."
                : "Nous sommes ouverts du lundi au vendredi. Choisissez un autre horaire.",
          };
        }

        const tarifJour = estTarifJourParis(when);
        const price = calculerPrixMixte(route.distanceKm, when);
        const suiviId = `APT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const payload = {
          nom: state.nom!,
          telephone: state.telephone!,
          email: state.email,
          depart: from.geocode.label,
          arrivee: to.geocode.label,
          pickup_datetime: when,
          passagers: state.passagers!,
          bagages: state.bagages ?? 0,
          suivi_id: suiviId,
          distance_km: Number(route.distanceKm.toFixed(1)),
          duree_s: route.dureeS,
          paiement: state.paiement ?? (lang === "en" ? "Card on board" : "CB à bord"),
          tarif_jour: tarifJour,
          prix_estime: price,
          lang,
          message:
            [
              state.childSeats ? (lang === "en" ? `${state.childSeats} child seat(s)` : `${state.childSeats} siège(s) enfant`) : null,
              state.babySeats ? (lang === "en" ? `${state.babySeats} baby seat(s)` : `${state.babySeats} siège(s) bébé`) : null,
              state.notes || null,
            ]
              .filter(Boolean)
              .join(" — ") || null,
          service_type: "standard",
          source: "chat",
        };

        try {
          const inserted = await createReservationPublic({ data: payload });
          const trackingLink = buildTrackingLink(suiviId, lang);

          await deliverClientConfirmation({
            reservationId: inserted.id,
            email: state.email ?? null,
            lang,
            payload: {
              clientName: state.nom!,
              pickupDatetime: formatPickupDateTime(when, lang),
              depart: from.geocode.label,
              arrivee: to.geocode.label,
              priceEstimate: price,
              trackingId: suiviId,
              trackingLink,
            },
          });

          await logReservationEvent(inserted.id, "created_from_chat", null, null, null, state.nom!, from.geocode.label, to.geocode.label);

          await sendDriverPush("chauffeur", lang === "en" ? "New booking" : "Nouvelle réservation", `${state.nom!} — ${from.geocode.label} → ${to.geocode.label}`, trackingLink, inserted.id);

          return {
            ok: true,
            reservation_id: inserted.id,
            suivi_id: suiviId,
            tracking_link: trackingLink,
            message:
              lang === "en"
                ? `Your reservation is confirmed for ${formatPickupDateTime(when, lang)}. You can follow your taxi live at: ${trackingLink}`
                : `Votre réservation est confirmée pour le ${formatPickupDateTime(when, lang)}. Suivez votre taxi en direct ici : ${trackingLink}`,
          };
        } catch (err: any) {
          console.error("[confirm_reservation] error", err);
          return {
            ok: false,
            message:
              lang === "en"
                ? "We could not finalize your reservation. Please call us or try again."
                : "Nous n'avons pas pu finaliser votre réservation. Appelez-nous ou réessayez.",
          };
        }
      },
    }),
    human_handoff: tool({
      description: lang === "en" ? "Hand off to a human operator." : "Transfère vers un opérateur humain.",
      inputSchema: zodSchema(z.object({ reason: z.string().nullable() })),
      execute: async (_args: { reason: string | null }) => {
        return {
          ok: true,
          message:
            lang === "en"
              ? "Patricia or Alain will take over. You can reach us at the numbers below or on WhatsApp."
              : "Patricia ou Alain reprend la main. Vous pouvez nous joindre aux numéros ci-dessous ou sur WhatsApp.",
          phone: `${PHONE_PATRICIA} / ${PHONE_ALAIN}`,
          whatsapp: `${WHATSAPP_PATRICIA} / ${WHATSAPP_ALAIN}`,
          email: EMAIL,
        };
      },
    }),
  };
}
