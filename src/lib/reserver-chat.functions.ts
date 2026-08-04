import { createServerFn } from "@tanstack/react-start";
import { streamText, tool, type UIMessage, convertToModelMessages, isStepCount, zodSchema } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { resolveAddress, sanitizeAssistantReply } from "@/lib/address-resolver.server";
import { geocodeGoogle, routeGoogle } from "@/lib/google.server";
import { createReservationPublic } from "@/lib/reservation-create.functions";
import { calculerPrixMixte, estTarifJourParis } from "@/lib/tarif";
import { enqueueClientConfirmationEmail, logReservationEvent, sendDriverPush } from "@/lib/reservation-notifications.server";
import { formatInTimeZone } from "date-fns-tz";
import { addMinutes, formatISO, parseISO, isBefore, addDays } from "date-fns";

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
- Tarifs : prise en charge 2,70 €, 2,28 €/km (jour 8h-20h), 3,22 €/km (nuit/dimanche/férié). Tarif mixte appliqué selon l'heure de prise en charge.
- Horaires d'ouverture : lundi au vendredi, 8h-20h. Pas de réservation en dehors de ces horaires.
- Flotte : Patricia conduit une BMW iX1 électrique (4 passagers max). Alain conduit un Mercedes V-Class pouvant accueillir jusqu'à 7 passagers.
- Options : siège enfant et siège bébé disponibles sur demande.
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
- Fares: pickup charge €2.70, €2.28/km (day 8am-8pm), €3.22/km (night/Sunday/holiday). Mixed fare applied based on pickup time.
- Opening hours: Monday to Friday, 8am-8pm. No bookings outside these hours.
- Fleet: Patricia drives a 100% electric BMW iX1 (max 4 passengers). Alain drives a Mercedes V-Class that can accommodate up to 7 passengers.
- Options: child seat and baby seat available on request.
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

function nowParis() {
  return new Date(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );
}

function parsePickup(iso: string): Date {
  return parseISO(iso);
}

function isWithinOpeningHours(iso: string): boolean {
  const d = parsePickup(iso);
  const day = d.getDay();
  const hour = d.getHours() + d.getMinutes() / 60;
  return OPEN_DAYS.includes(day) && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

function nextOpenSlot(): Date {
  const now = nowParis();
  let candidate = addMinutes(now, MIN_ADVANCE_MINUTES);
  while (!isWithinOpeningHours(formatISO(candidate))) {
    candidate = addMinutes(candidate, 15);
    if (candidate.getHours() >= CLOSE_HOUR) {
      candidate = addDays(candidate, 1);
      candidate.setHours(OPEN_HOUR, 0, 0, 0);
    }
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

export const aiChatReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const schema = z.object({
      messages: z.array(z.any()),
      lang: z.enum(["fr", "en"]).default("fr"),
      sessionId: z.string().default("anonymous"),
    });
    return schema.parse(input);
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");
    const lang = data.lang;

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

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    if (lastUser?.data?.state) {
      const parsed = ReservationState.safeParse(lastUser.data.state);
      if (parsed.success) state = parsed.data;
    }

    const system = getSystemPrompt(lang);

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(data.messages as UIMessage[]),
      stopWhen: [isStepCount(MAX_STEPS)],
      tools: {
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
          parameters: z.object({
            pickup_datetime: z.string().describe("ISO datetime de prise en charge / Pickup ISO datetime"),
          }),
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
                reason:
                  lang === "en"
                    ? "We are open Monday to Friday, 8am-8pm."
                    : "Nous sommes ouverts du lundi au vendredi, de 8h à 20h.",
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
          parameters: z.object({
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
            state = { ...state, ...params };

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
                    ? "We are open Monday to Friday, 8am-8pm. Please choose another time."
                    : "Nous sommes ouverts du lundi au vendredi, de 8h à 20h. Choisissez un autre horaire.",
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
              message: state.notes || null,
              service_type: "standard",
              source: "chat",
            };

            try {
              const inserted = await createReservationPublic({ data: payload });
              const trackingLink = buildTrackingLink(suiviId, lang);

              if (state.email) {
                await enqueueClientConfirmationEmail(inserted.id, state.email, lang, {
                  clientName: state.nom!,
                  pickupDatetime: formatPickupDateTime(when, lang),
                  depart: from.geocode.label,
                  arrivee: to.geocode.label,
                  priceEstimate: price,
                  trackingId: suiviId,
                });
              }

              await logReservationEvent(inserted.id, "created_from_chat", null, null, null, state.nom!, from.geocode.label, to.geocode.label);

              await sendDriverPush(
                "patricia",
                lang === "en" ? "New booking" : "Nouvelle réservation",
                `${state.nom!} — ${from.geocode.label} → ${to.geocode.label}`,
                trackingLink,
                inserted.id,
              );
              await sendDriverPush(
                "alain",
                lang === "en" ? "New booking" : "Nouvelle réservation",
                `${state.nom!} — ${from.geocode.label} → ${to.geocode.label}`,
                trackingLink,
                inserted.id,
              );

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
          parameters: z.object({ reason: z.string().nullable() }),
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
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: data.messages as UIMessage[],
      sendReasoning: false,
    });
  });
