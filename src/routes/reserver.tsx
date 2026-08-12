import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Bot,
  Navigation,
  MessageSquare,
  CheckCircle2,
  Car,
  Mic,
  MicOff,
  Bell,
  X,
  AlertCircle,
  RotateCcw,
  User,
  Mail,
  Users,
  Briefcase,
} from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  clearReserverSession,
  loadReserverSession,
  saveReserverSession,
  type ReserverSession,
} from "@/lib/reserver-session";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { aiChatReservation } from "@/lib/reserver-chat.functions";
import { transcribeAudio } from "@/lib/stt.functions";
import { geocodeAddress, reverseGeocode } from "@/lib/googleGeocode";
import { loadGoogleMaps, onGoogleMapsAuthFailure, clearGoogleMapsAuthFailure } from "@/lib/googleMaps";
import { MapFallback } from "@/components/MapFallback";

import { useI18n } from "@/i18n/I18nProvider";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { SITE_URL, seoLinks } from "@/lib/seo-hreflang";
import { ogImageUrl } from "@/lib/og";
import { SocialMetaSync } from "@/components/SocialMetaSync";
import {
  businessRef,
  localBusinessNode,
} from "@/lib/business";
import ogReserverFr from "@/assets/apt-og-reserver-fr.jpg.asset.json";
import ogReserverEn from "@/assets/apt-og-reserver-en.jpg.asset.json";
import { DRIVERS } from "@/data/drivers";
import { detaillerPrix, HEURE_DEBUT_JOUR, HEURE_FIN_JOUR } from "@/lib/tarif";
import { placesGeolocate } from "@/lib/places";
import { locateUser, describePosition, positionMessage, failureMessage } from "@/lib/geolocation";


// ─── Géolocalisation : même configuration que Start Fresh Here ──────────────
const MAX_AUTO_GEO_ACCURACY_M = 1500;
const MAX_AUTO_GEO_DISTANCE_KM = 130;
/** Centre de zone : Saintes (Charente-Maritime). */
const ZONE_CENTER: [number, number] = [45.746, -0.6337];

function distanceKmBetween(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function isInServiceZone(lat: number, lng: number): boolean {
  return distanceKmBetween(ZONE_CENTER, [lat, lng]) <= MAX_AUTO_GEO_DISTANCE_KM;
}

/** Repli si le GPS du navigateur échoue : Google Geolocation (plus précis que l'IP brute). */
async function ipGeolocate(): Promise<{ lat: number; lng: number } | null> {
  const g = await placesGeolocate();
  if (g) return { lat: g.lat, lng: g.lng };
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const j = await res.json();
    const lat = Number(j?.latitude);
    const lng = Number(j?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}


const RESERVER_TITLE_FR = "Réserver un taxi en Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC_FR =
  "Réservez votre taxi en Charente-Maritime en discutant (ou à la voix) avec notre assistante. Devis instantané, créneaux vérifiés, confirmation immédiate.";
const RESERVER_TITLE_EN = "Book a taxi in Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC_EN =
  "Book your taxi in Charente-Maritime by chatting (or speaking) with our assistant. Instant quote, verified time slots, immediate confirmation.";
const RESERVER_URL = `${SITE_URL}/reserver`;

// Visuels de partage localisés : version FR (par défaut) et version EN,
// déclarée en second og:image pour les partages anglophones.
const OG_IMAGE_FR = ogImageUrl(ogReserverFr.url);
const OG_IMAGE_EN = ogImageUrl(ogReserverEn.url);
const OG_IMAGE_W = "1200";
const OG_IMAGE_H = "630";
const OG_ALT_FR =
  "Access Prestige Taxi — réservez votre taxi en Charente-Maritime, BMW iX1 électrique et van Mercedes 7 places";
const OG_ALT_EN =
  "Access Prestige Taxi — book your taxi in Charente-Maritime, electric BMW iX1 and 7-seater Mercedes van";

const RESERVER_SOCIAL_FR = {
  title: RESERVER_TITLE_FR,
  description: RESERVER_DESC_FR,
  image: OG_IMAGE_FR,
  alt: OG_ALT_FR,
  url: RESERVER_URL,
};
const RESERVER_SOCIAL_EN = {
  title: RESERVER_TITLE_EN,
  description: RESERVER_DESC_EN,
  image: OG_IMAGE_EN,
  alt: OG_ALT_EN,
  url: `${RESERVER_URL}?lang=en`,
};

export const Route = createFileRoute("/reserver")({
  // ?lang=en / ?lang=fr permettent aux partages de forcer la langue du visuel
  // et des textes sociaux (la page reste servie sur la même URL).
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | "fr" } => ({
    lang:
      search['lang'] === "en"
        ? ("en" as const)
        : search['lang'] === "fr"
          ? ("fr" as const)
          : undefined,
  }),
  head: (ctx: { match?: { search?: { lang?: "en" | "fr" } } }) => {
    const isEn = ctx?.match?.search?.lang === "en";
    const title = isEn ? RESERVER_TITLE_EN : RESERVER_TITLE_FR;
    const desc = isEn ? RESERVER_DESC_EN : RESERVER_DESC_FR;
    const image = isEn ? OG_IMAGE_EN : OG_IMAGE_FR;
    const alt = isEn ? OG_ALT_EN : OG_ALT_FR;

    return {
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:site_name", content: "Access Prestige Taxi" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: isEn ? `${RESERVER_URL}?lang=en` : RESERVER_URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: OG_IMAGE_W },
      { property: "og:image:height", content: OG_IMAGE_H },
      { property: "og:image:alt", content: alt },
      { property: "og:locale", content: isEn ? "en_GB" : "fr_FR" },
      { property: "og:locale:alternate", content: isEn ? "fr_FR" : "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: alt },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { name: "theme-color", content: "#F5F0E6" },
    ],
    // Canonical auto-référent : /reserver?lang=en se canonicalise sur lui-même
    // (sinon Google ignore l'alternate anglais), tout autre paramètre retombe
    // sur l'URL propre.
    links: seoLinks("/reserver", ctx?.match?.search),
    scripts: [
      // Entité métier unique du site (adresse, coordonnées GPS, horaires),
      // partagée par toutes les pages via son @id.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            localBusinessNode(),
            {
              "@type": "WebPage",
              "@id": `${RESERVER_URL}#webpage`,
              url: RESERVER_URL,
              name: RESERVER_TITLE_FR,
              description: RESERVER_DESC_FR,
              inLanguage: "fr-FR",
              isPartOf: { "@id": `${SITE_URL}/#website` },
              about: businessRef,
              primaryImageOfPage: OG_IMAGE_FR,
              workTranslation: {
                "@type": "WebPage",
                url: RESERVER_URL,
                name: RESERVER_TITLE_EN,
                description: RESERVER_DESC_EN,
                inLanguage: "en-GB",
                primaryImageOfPage: OG_IMAGE_EN,
              },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: `${SITE_URL}/`,
              name: "Access Prestige Taxi",
              inLanguage: ["fr-FR", "en-GB"],
              publisher: businessRef,
            },
          ],
        }),
      },
      // TaxiService + action de réservation : décrit le service
      // réservable depuis cette page, avec zone desservie, horaires et téléphones.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TaxiService",
          "@id": `${SITE_URL}/#taxiservice`,
          name: "Access Prestige Taxi",
          url: RESERVER_URL,
          description: RESERVER_DESC_FR,
          alternateName: RESERVER_TITLE_EN,
          areaServed: [
            { "@type": "AdministrativeArea", name: "Charente-Maritime" },
            { "@type": "Country", name: "France" },
          ],
          availableLanguage: ["fr", "en"],
          provider: businessRef,
          potentialAction: {
            "@type": "ReserveAction",
            name: "Réserver un taxi",
            target: {
              "@type": "EntryPoint",
              urlTemplate: RESERVER_URL,
              inLanguage: ["fr", "en"],
              actionPlatform: [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/MobileWebPlatform",
              ],
            },
            result: { "@type": "Reservation", name: "Réservation de course en taxi" },
          },
        }),
      },
      // FAQ de la page réservation : questions réellement traitées par le service.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${SITE_URL}/reserver#faq`,
          mainEntity: [
            {
              "@type": "Question",
              name: "Comment réserver un taxi chez Access Prestige Taxi ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sur la page Réserver, indiquez votre adresse de départ, votre destination et l'heure souhaitée, à la voix ou par écrit. L'assistante vous donne aussitôt le tarif estimé, puis vous confirmez la course en une étape.",
              },
            },
            {
              "@type": "Question",
              name: "Puis-je réserver par la voix ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Oui. Le bouton micro permet de dicter votre trajet en français ou en anglais ; la réservation reste possible entièrement par écrit si vous préférez.",
              },
            },
            {
              "@type": "Question",
              name: "Quels sont les horaires de réservation ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Les courses sont assurées du lundi au vendredi, de 8h à 20h. Les réservations à l'avance peuvent être enregistrées à tout moment depuis le site.",
              },
            },
            {
              "@type": "Question",
              name: "Comment le prix de la course est-il calculé ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Le tarif estimé combine la prise en charge et le prix au kilomètre, avec un tarif jour (07h-19h) et un tarif nuit. La distance, la durée et le détail du calcul s'affichent dans le récapitulatif avant confirmation.",
              },
            },
            {
              "@type": "Question",
              name: "Y a-t-il une limite de distance ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Non. Nous assurons tous les trajets sans limite de kilométrage, y compris les longues distances au départ ou à destination de la Charente-Maritime.",
              },
            },
            {
              "@type": "Question",
              name: "Proposez-vous des sièges bébé et le transport de groupe ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Oui. Sièges bébé et rehausseurs enfants sont disponibles sur demande, et le van Mercedes permet de transporter jusqu'à 7 passagers avec leurs bagages.",
              },
            },
            {
              "@type": "Question",
              name: "Assurez-vous le transport sanitaire conventionné ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Oui, nous sommes conventionnés pour le transport sanitaire : consultations, hospitalisations, dialyses et examens médicaux, sur prescription.",
              },
            },
          ],
        }),
      },
      // Fil d'Ariane pour la page de réservation.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Réserver", item: `${SITE_URL}/reserver` },
          ],
        }),
      },
    ],
    };
  },

  component: ReserverPage,
});

type ChatMsg = { role: "user" | "assistant"; content: string };

type Quote = {
  distance_km?: number;
  duree_min?: number;
  prix_estime?: number;
  depart_resolu?: string;
  arrivee_resolu?: string;
  pickup_datetime?: string;
};

// ─── Récapitulatif / validations avant confirmation ────────────────────────
const MAX_INPUT = 800;

const RECAP: Record<"fr" | "en", Record<string, string>> = {
  fr: {
    open: "Vérifier et confirmer",
    title: "Récapitulatif de votre course",
    subtitle: "Vérifiez les informations avant de confirmer définitivement.",
    from: "Départ",
    to: "Arrivée",
    when: "Date et heure",
    dist: "Distance / durée",
    price: "Tarif estimé",
    contact: "Vos coordonnées",
    name: "Nom et prénom",
    phone: "Téléphone",
    email: "E-mail",
    pax: "Passagers",
    bags: "Bagages",
    note: "Précision (optionnel)",
    note_ph: "Siège bébé, étage, bagages volumineux…",
    agree: "Je confirme l'exactitude de ces informations.",
    cancel: "Modifier",
    submit: "Confirmer la réservation",
    err_name: "Indiquez votre nom (2 caractères minimum).",
    err_phone: "Numéro invalide : 10 chiffres, ex. 06 12 34 56 78.",
    err_email: "Adresse e-mail invalide.",
    err_agree: "Merci de cocher la case de confirmation.",
    err_pax: "Entre 1 et 7 passagers.",
    err_bags: "Entre 0 et 7 bagages.",
    err_input: `Message trop long (${MAX_INPUT} caractères maximum).`,
    err_depart: "Précisez une adresse de départ complète (rue et ville).",
    err_quote: "Demandez d'abord un devis à l'assistante.",
    ok_title: "Réservation confirmée",
    ok_desc: "Votre chauffeur est prévenu. Vous recevez la confirmation par e-mail.",
    ok_ref: "Référence de suivi",
    ok_cta: "Suivre ma course",
    counter: "caractères restants",
    close: "Fermer le récapitulatif",
    required: "obligatoire",
    optional: "facultatif",
    trip_section: "Votre trajet",
    review_section: "Ce qui sera envoyé au chauffeur",
    err_title: "Corrigez les champs suivants",
    err_intro: "Le formulaire n'a pas été envoyé.",
    valid: "Champ validé",
    to_fill: "À compléter",
    restored: "Nous avons retrouvé votre réservation en cours.",
    restored_cta: "Recommencer à zéro",
    map_error_title: "Carte indisponible",
    calc_title: "Détail du calcul",
    calc_base: "Prise en charge",
    calc_day: "Kilomètres tarif jour",
    calc_night: "Kilomètres tarif nuit",
    calc_dist: "Distance totale",
    calc_dur: "Durée estimée",
    calc_total: "Total estimé",
    calc_rule: `Tarif jour de ${HEURE_DEBUT_JOUR}h à ${HEURE_FIN_JOUR}h (heure de Paris). Tarif nuit de ${HEURE_FIN_JOUR}h à ${HEURE_DEBUT_JOUR}h, ainsi que les dimanches et jours fériés toute la journée. Une course à cheval sur la frontière est facturée au prorata des kilomètres parcourus dans chaque plage.`,
  },
  en: {
    open: "Review and confirm",
    title: "Your ride summary",
    subtitle: "Please check the details before confirming.",
    from: "Pickup",
    to: "Drop-off",
    when: "Date and time",
    dist: "Distance / duration",
    price: "Estimated fare",
    contact: "Your details",
    name: "Full name",
    phone: "Phone",
    email: "Email",
    pax: "Passengers",
    bags: "Luggage",
    note: "Note (optional)",
    note_ph: "Baby seat, floor number, large luggage…",
    agree: "I confirm these details are correct.",
    cancel: "Edit",
    submit: "Confirm booking",
    err_name: "Please enter your name (2 characters minimum).",
    err_phone: "Invalid number: 10 digits, e.g. 06 12 34 56 78.",
    err_email: "Invalid email address.",
    err_agree: "Please tick the confirmation box.",
    err_pax: "Between 1 and 7 passengers.",
    err_bags: "Between 0 and 7 pieces of luggage.",
    err_input: `Message too long (${MAX_INPUT} characters maximum).`,
    err_depart: "Please enter a complete pickup address (street and town).",
    err_quote: "Ask the assistant for a quote first.",
    ok_title: "Booking confirmed",
    ok_desc: "Your driver has been notified. A confirmation email is on its way.",
    ok_ref: "Tracking reference",
    ok_cta: "Track my ride",
    counter: "characters left",
    close: "Close summary",
    required: "required",
    optional: "optional",
    trip_section: "Your journey",
    review_section: "What will be sent to the driver",
    err_title: "Please fix the following fields",
    err_intro: "The form was not submitted.",
    valid: "Field valid",
    to_fill: "To complete",
    restored: "We restored your booking in progress.",
    restored_cta: "Start over",
    map_error_title: "Map unavailable",
    calc_title: "How this fare is calculated",
    calc_base: "Pick-up charge",
    calc_day: "Kilometres at day rate",
    calc_night: "Kilometres at night rate",
    calc_dist: "Total distance",
    calc_dur: "Estimated duration",
    calc_total: "Estimated total",
    calc_rule: `Day rate from ${HEURE_DEBUT_JOUR}am to ${HEURE_FIN_JOUR - 12}pm (Paris time). Night rate from ${HEURE_FIN_JOUR - 12}pm to ${HEURE_DEBUT_JOUR}am, and all day on Sundays and public holidays. A ride crossing the boundary is billed pro rata to the kilometres driven in each period.`,
  },
};

/** Champs du récapitulatif → id DOM, pour lier erreurs, labels et focus. */
const FIELD_IDS: Record<string, string> = {
  nom: "recap-nom",
  telephone: "recap-tel",
  email: "recap-email",
  passagers: "recap-pax",
  bagages: "recap-bags",
  agree: "recap-agree",
};

const PHONE_RE = /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function formatPickup(iso: string | undefined, lang: "fr" | "en"): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Textes bilingues (FR/EN) de la page ───────────────────────────────────
type TxtKey =
  | "kicker"
  | "hero_title"
  | "hero_sub"
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "brand"
  | "online"
  | "thinking"
  | "greeting"
  | "sug1"
  | "sug2"
  | "sug3"
  | "sug4"
  | "placeholder"
  | "sent"
  | "error"
  | "fare_title"
  | "fare_empty"
  | "trip_title"
  | "depart"
  | "arrivee"
  | "date"
  | "gps_detecting"
  | "gps_detected"
  | "gps_denied"
  | "gps_unavailable"
  | "gps_manual"
  | "gps_auto"
  | "gps_low"
  | "addr_help_title"
  | "addr_help_desc"
  | "addr_help_1"
  | "addr_help_2"
  | "addr_help_3"
  | "addr_help_ex_title"
  | "addr_help_ex_1"
  | "addr_help_ex_2"
  | "addr_help_ex_3"
  | "addr_help_ex_4"
  | "addr_help_note"
  | "gps_ask_manual"
  | "gps_use_other"
  | "gps_enter"
  | "gps_placeholder"
  | "gps_back"
  | "gps_out_zone"
  | "gps_out_zone_msg"
  | "gps_ip_note"
  | "gps_enter_arrivee"
  | "gps_arrivee_ph"
  | "gps_use_addresses"
  | "ask_destination"
  | "map_label"
  | "map_zone"
  | "map_from"
  | "map_to"
  | "call"
  | "myrides"
  | "footer"
  | "success"
  | "push_title"
  | "push_desc"
  | "push_btn"
  | "push_test"
  | "push_again"
  | "push_off"
  | "push_on"
  | "push_denied"
  | "push_unsupported"
  | "push_activating"
  | "voice_unsupported"
  | "voice_denied"
  | "voice_no_mic"
  | "voice_error"
  | "voice_start"
  | "voice_stop"
  | "voice_listening"
  | "voice_empty"
  | "voice_hint_title"
  | "voice_hint_desc"
  | "voice_hint_1"
  | "voice_hint_2"
  | "voice_hint_3"
  | "voice_hint_cta"
  | "voice_hint_later"
  | "voice_denied_help"
  | "voice_review"
  | "voice_transcribing"
  | "voice_level";

const TXT: Record<"fr" | "en", Record<TxtKey, string>> = {
  fr: {
    kicker: "Access Prestige Taxi · Charente-Maritime",
    hero_title: "Réservez en parlant, tout simplement",
    hero_sub: "Dites votre trajet, notre assistante calcule le tarif et confirme la course en moins d'une minute.",
    step1: "Votre trajet",
    step2: "Devis",
    step3: "Confirmation",
    step4: "Chauffeur en route",
    brand: "Margot — Access Prestige Taxi",
    online: "En ligne",
    thinking: "Margot rédige…",
    greeting:
      "Bonjour, Margot d'Access Prestige Taxi à votre écoute. Où souhaitez-vous aller, et à quelle heure ?",
    sug1: "Aéroport La Rochelle demain 9h",
    sug2: "Gare de La Rochelle tout de suite",
    sug3: "Royan → Bordeaux vendredi 14h",
    sug4: "Groupe de 6 personnes vers l'Île de Ré",
    placeholder: "Écrivez ou appuyez sur le micro…",
    sent: "Réservation enregistrée",
    error: "Un instant, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?",
    fare_title: "Tarif estimé",
    fare_empty: "Indiquez votre trajet pour obtenir un tarif.",
    trip_title: "Votre course",
    depart: "Départ à préciser",
    arrivee: "Destination à préciser",
    date: "Date et heure à préciser",
    gps_detecting: "Détection de votre position…",
    gps_detected: "Position détectée",
    gps_denied: "Géolocalisation refusée",
    gps_unavailable: "Position indisponible",
    gps_manual: "Départ manuel",
    gps_auto: "Votre départ est détecté automatiquement.",
    gps_low: "Votre position n'est pas assez précise",
    addr_help_title: "Comment indiquer une adresse précise",
    addr_help_desc:
      "Si l'adresse n'est pas reconnue ou si la position détectée reste approximative, donnez un repère plus complet : nous desservons toute la France, sans limite de distance.",
    addr_help_1: "Numéro + rue + ville : « 12 rue du Palais, La Rochelle ».",
    addr_help_2: "Ou un point de repère connu : gare, aéroport, hôpital, monument, quartier.",
    addr_help_3: "Ajoutez le code postal si plusieurs communes portent le même nom.",
    addr_help_ex_title: "Exemples à Bordeaux",
    addr_help_ex_1: "Gare de Bordeaux Saint-Jean (37 rue Charles Domercq, 33800)",
    addr_help_ex_2: "Aéroport de Bordeaux-Mérignac, 33700 Mérignac",
    addr_help_ex_3: "Place de la Bourse / Quinconces / Cité du Vin, 33000 Bordeaux",
    addr_help_ex_4: "CHU Pellegrin, place Amélie Raba-Léon, 33000 Bordeaux",
    addr_help_note:
      "Astuce : quartiers (Chartrons, Bacalan, La Bastide) et communes (Mérignac, Pessac, Talence) suffisent, une précision au numéro n'est demandée que pour une rue.",
    gps_ask_manual: "Merci d'indiquer votre adresse de départ exacte, puis votre destination.",
    gps_use_other: "Utiliser une autre adresse de départ",
    gps_enter: "Saisissez votre adresse de départ",
    gps_placeholder: "Ex : Vieux-Port, La Rochelle",
    gps_back: "Revenir à ma position GPS",
    gps_out_zone: "Position hors zone de détection automatique",
    gps_out_zone_msg:
      "Votre position détectée se situe à plus de 130 km de Saintes : nous ne pouvons pas la reprendre automatiquement. Nous assurons pourtant tous les trajets, sans limite de distance — saisissez simplement votre adresse de départ et votre destination ci-dessous.",
    gps_ip_note: "Position approximative estimée d'après votre connexion Internet (repli IP).",
    gps_enter_arrivee: "Saisissez votre adresse d'arrivée",
    gps_arrivee_ph: "Ex : Aéroport de La Rochelle",
    gps_use_addresses: "Calculer le tarif avec ces adresses",
    ask_destination: "Quelle est votre destination ?",
    map_label: "Carte du trajet",
    map_zone: "Charente-Maritime et longue distance",
    map_from: "Départ",
    map_to: "Arrivée",
    call: "Vous préférez appeler ?",
    myrides: "Voir mes courses",
    footer: "Transport sanitaire conventionné · Aucune limite de distance · 5j/7 de 8h à 20h",
    success: "Réservation enregistrée !",
    push_title: "Notifications de course",
    push_desc: "Soyez prévenu dès que votre chauffeur accepte et arrive.",
    push_btn: "Activer les notifications",
    push_test: "Tester",
    push_again: "Réinscrire cet appareil",
    push_off: "Désactivé",
    push_on: "Activé",
    push_denied: "Notifications refusées dans votre navigateur.",
    push_unsupported: "Non supporté sur cet appareil.",
    push_activating: "Activation…",
    voice_unsupported: "La saisie vocale n'est pas supportée sur ce navigateur.",
    voice_denied: "Micro refusé. Autorisez le micro dans votre navigateur.",
    voice_no_mic: "Aucun micro détecté.",
    voice_error: "Impossible de démarrer le micro. Réessayez.",
    voice_start: "Parler",
    voice_stop: "Arrêter le micro",
    voice_listening: "Écoute en cours",
    voice_empty: "Rien n'a été compris. Réessayez.",
    voice_hint_title: "Autoriser le micro",
    voice_hint_desc: "Pour dicter votre trajet, votre navigateur va demander l'accès au microphone.",
    voice_hint_1: "Cliquez sur « Autoriser » dans la fenêtre du navigateur.",
    voice_hint_2: "Sur iPhone : Réglages → Safari → Microphone → Autoriser.",
    voice_hint_3: "L'enregistrement démarre automatiquement dès l'autorisation.",
    voice_hint_cta: "Autoriser et parler",
    voice_hint_later: "Plus tard",
    voice_denied_help: "Micro bloqué : ouvrez l'icône du cadenas dans la barre d'adresse et réautorisez le microphone.",
    voice_review: "Transcription enregistrée dans le champ : relisez, corrigez puis envoyez.",
    voice_transcribing: "Transcription en cours…",
    voice_level: "Niveau sonore",
  },
  en: {
    kicker: "Access Prestige Taxi · Charente-Maritime",
    hero_title: "Book by simply speaking",
    hero_sub: "Say your journey, our assistant calculates the fare and confirms your ride in under a minute.",
    step1: "Your journey",
    step2: "Quote",
    step3: "Confirmation",
    step4: "Driver on the way",
    brand: "Margot — Access Prestige Taxi",
    online: "Online",
    thinking: "Margot is typing…",
    greeting: "Hello, Margot from Access Prestige Taxi. Where would you like to go, and at what time?",
    sug1: "La Rochelle airport tomorrow 9am",
    sug2: "La Rochelle station right now",
    sug3: "Royan → Bordeaux Friday 2pm",
    sug4: "Group of 6 to Île de Ré",
    placeholder: "Type, or tap the microphone…",
    sent: "Booking recorded",
    error: "One moment, I could not process your request. Could you rephrase it?",
    fare_title: "Estimated fare",
    fare_empty: "Tell us your journey to get a fare.",
    trip_title: "Your ride",
    depart: "Pickup to be confirmed",
    arrivee: "Destination to be confirmed",
    date: "Date and time to be confirmed",
    gps_detecting: "Detecting your location…",
    gps_detected: "Location detected",
    gps_denied: "Location denied",
    gps_unavailable: "Location unavailable",
    gps_manual: "Manual pickup",
    gps_auto: "Your pickup point is detected automatically.",
    gps_low: "Your location is not accurate enough",
    addr_help_title: "How to give a precise address",
    addr_help_desc:
      "If an address isn't recognised or your detected position stays approximate, give a fuller landmark: we cover the whole country, with no distance limit.",
    addr_help_1: "Street number + street + city: “12 rue du Palais, La Rochelle”.",
    addr_help_2: "Or a known landmark: train station, airport, hospital, monument, district.",
    addr_help_3: "Add the postcode when several towns share the same name.",
    addr_help_ex_title: "Examples in Bordeaux",
    addr_help_ex_1: "Bordeaux Saint-Jean station (37 rue Charles Domercq, 33800)",
    addr_help_ex_2: "Bordeaux-Mérignac Airport, 33700 Mérignac",
    addr_help_ex_3: "Place de la Bourse / Quinconces / Cité du Vin, 33000 Bordeaux",
    addr_help_ex_4: "Pellegrin Hospital, place Amélie Raba-Léon, 33000 Bordeaux",
    addr_help_note:
      "Tip: districts (Chartrons, Bacalan, La Bastide) and towns (Mérignac, Pessac, Talence) are enough — a street number is only needed for a street address.",
    gps_ask_manual: "Please enter your exact pickup address, then your destination.",
    gps_use_other: "Use another pickup address",
    gps_enter: "Enter your pickup address",
    gps_placeholder: "E.g. Old Port, La Rochelle",
    gps_back: "Back to my GPS location",
    gps_out_zone: "Location outside the automatic detection area",
    gps_out_zone_msg:
      "Your detected location is more than 130 km from Saintes, so we cannot use it automatically. We still cover every journey with no distance limit — simply enter your pickup and drop-off addresses below.",
    gps_ip_note: "Approximate location estimated from your internet connection (IP fallback).",
    gps_enter_arrivee: "Enter your drop-off address",
    gps_arrivee_ph: "E.g. La Rochelle airport",
    gps_use_addresses: "Get a fare with these addresses",
    ask_destination: "What is your destination?",
    map_label: "Route map",
    map_zone: "Charente-Maritime and long distance",
    map_from: "Pickup",
    map_to: "Drop-off",
    call: "Prefer to call?",
    myrides: "See my rides",
    footer: "Approved medical transport · No distance limit · 5 days a week, 8am–8pm",
    success: "Booking recorded!",
    push_title: "Ride notifications",
    push_desc: "Get notified as soon as your driver accepts and arrives.",
    push_btn: "Enable notifications",
    push_test: "Test",
    push_again: "Re-register this device",
    push_off: "Off",
    push_on: "On",
    push_denied: "Notifications denied in your browser.",
    push_unsupported: "Not supported on this device.",
    push_activating: "Enabling…",
    voice_unsupported: "Voice input is not supported on this browser.",
    voice_denied: "Microphone denied. Please allow microphone access.",
    voice_no_mic: "No microphone detected.",
    voice_error: "Could not start the microphone. Please try again.",
    voice_start: "Speak",
    voice_stop: "Stop microphone",
    voice_listening: "Listening…",
    voice_empty: "Nothing was understood. Please try again.",
    voice_hint_title: "Allow microphone",
    voice_hint_desc: "To dictate your trip, your browser will ask for microphone access.",
    voice_hint_1: "Click “Allow” in the browser prompt.",
    voice_hint_2: "On iPhone: Settings → Safari → Microphone → Allow.",
    voice_hint_3: "Recording starts automatically once access is granted.",
    voice_hint_cta: "Allow and speak",
    voice_hint_later: "Later",
    voice_denied_help: "Microphone blocked: open the lock icon in the address bar and allow the microphone again.",
    voice_review: "Transcript saved in the field: review, edit, then send.",
    voice_transcribing: "Transcribing…",
    voice_level: "Input level",
  },
};

// ─── Lieux canoniques Charente-Maritime ────────────────────────────────────
const CANONICAL_PLACES: Array<{ match: RegExp; label: string; coord: [number, number] }> = [
  {
    match: /(aeroport|airport).*(rochelle|re|lrh)|^lrh$|^aeroport$|^airport$/,
    label: "Aéroport La Rochelle-Île de Ré, 17000 La Rochelle",
    coord: [46.1792, -1.1953],
  },
  {
    match: /gare.*(rochelle)|rochelle.*gare|^gare$/,
    label: "Gare de La Rochelle, 17000 La Rochelle",
    coord: [46.1531, -1.1458],
  },
  { match: /gare.*royan|royan.*gare/, label: "Gare de Royan, 17200 Royan", coord: [45.6256, -1.0275] },
  { match: /gare.*saintes|saintes.*gare/, label: "Gare de Saintes, 17100 Saintes", coord: [45.7486, -0.6236] },
  {
    match: /gare.*rochefort|rochefort.*gare/,
    label: "Gare de Rochefort, 17300 Rochefort",
    coord: [45.9447, -0.9636],
  },
  {
    match: /(vieux.port|vieux port).*(rochelle)?/,
    label: "Vieux-Port de La Rochelle, 17000 La Rochelle",
    coord: [46.1558, -1.1528],
  },
  { match: /aquarium/, label: "Aquarium de La Rochelle, 17000 La Rochelle", coord: [46.1539, -1.1508] },
  { match: /zoo.*palmyre|palmyre/, label: "Zoo de La Palmyre, 17570 Les Mathes", coord: [45.6828, -1.1675] },
  { match: /ile.*de.*re|^re$/, label: "Île de Ré, 17580 Saint-Martin-de-Ré", coord: [46.2019, -1.3667] },
  { match: /ile.*d.*oleron|oleron/, label: "Île d'Oléron, 17310 Saint-Pierre-d'Oléron", coord: [45.9436, -1.3086] },
  { match: /fort.*boyard/, label: "Fort Boyard, Charente-Maritime", coord: [45.9992, -1.2133] },
  { match: /gare.*surgeres|surgeres.*gare/, label: "Gare de Surgères, 17700 Surgères", coord: [46.1078, -0.7508] },
  { match: /port.*rochefort|arsenal.*rochefort/, label: "Arsenal maritime de Rochefort, 17300 Rochefort", coord: [45.9368, -0.9588] },
  { match: /citadelle.*saint.*martin|saint.*martin.*re/, label: "Saint-Martin-de-Ré, 17410", coord: [46.2034, -1.3671] },
  { match: /phare.*baleines/, label: "Phare des Baleines, 17590 Saint-Clément-des-Baleines", coord: [46.2442, -1.5619] },
  { match: /palais.*royan|palais.*congres/, label: "Palais des Congrès de Royan, 17200 Royan", coord: [45.6218, -1.0334] },
  { match: /gare.*saint.*jean|saint.*jean.*bordeaux/, label: "Gare de Bordeaux Saint-Jean, 33800 Bordeaux", coord: [44.8259, -0.5563] },
  { match: /aeroport.*bordeaux|merignac.*aeroport/, label: "Aéroport de Bordeaux-Mérignac, 33700 Mérignac", coord: [44.8283, -0.7156] },
];

function normalizeAddressText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function expandAbbreviations(value: string): string {
  return value
    .replace(/\bst\b/gi, "Saint")
    .replace(/\bste\b/gi, "Sainte")
    .replace(/\bav\b/gi, "Avenue")
    .replace(/\bbd\b/gi, "Boulevard")
    .replace(/\bpl\b/gi, "Place");
}

async function geocodeFullAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address?.trim()) return null;
  const trimmed = expandAbbreviations(address.trim());
  const normalized = normalizeAddressText(trimmed);

  const canonical = CANONICAL_PLACES.find((p) => p.match.test(normalized));
  if (canonical) return { lat: canonical.coord[0], lng: canonical.coord[1] };

  const attempts = [trimmed, `${trimmed}, Charente-Maritime, France`, `${trimmed}, France`];
  for (const attempt of attempts) {
    const c = await geocodeAddress(attempt);
    if (c) return c;
  }
  return null;
}

const LANG_LABEL: Record<string, string> = { fr: "français", en: "anglais" };

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read_failed"));
    reader.onloadend = () => {
      const s = String(reader.result || "");
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    reader.readAsDataURL(blob);
  });
}

function ReserverPage() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const L = (lang === "en" ? "en" : "fr") as "fr" | "en";
  const tx = (k: TxtKey) => TXT[L][k];
  const chat = useServerFn(aiChatReservation);
  const { subscription: clientPushToken } = usePushNotifications();
  // ─── Reprise automatique (refresh / retour arrière) ─────────────────────
  // Restauration après hydratation (jamais pendant le rendu SSR : évite tout
  // décalage d'hydratation entre le HTML serveur et le premier rendu client).
  const [wasRestored, setWasRestored] = useState(false);
  const hydratedRef = useRef(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: TXT[L].greeting }]);
  const [input, setInput] = useState("");
  const inputRef = useRef("");
  useEffect(() => {
    inputRef.current = input;
  }, [input]);
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [suiviId, setSuiviId] = useState<string | null>(null);
  // Récapitulatif avant soumission
  const [recapOpen, setRecapOpen] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    passagers: "1",
    bagages: "0",
    note: "",
    agree: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const recapDialogRef = useFocusTrap<HTMLDivElement>(recapOpen && !reservationId, () => setRecapOpen(false));
  const [gps, setGps] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<
    "denied" | "unavailable" | "timeout" | "low_accuracy" | "out_of_zone" | null
  >(null);
  /** Vrai quand la position affichée provient du repli IP (approximative). */
  const [gpsFromIp, setGpsFromIp] = useState(false);
  const [manualArrivee, setManualArrivee] = useState<string>("");
  const [manualDepart, setManualDepart] = useState<string>("");
  const [manualDepartCoord, setManualDepartCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [showManualDepart, setShowManualDepart] = useState(false);

  const gpsRef = useRef(gps);
  const gpsErrorRef = useRef(gpsError);
  const gpsBusyRef = useRef(gpsBusy);
  const manualDepartRef = useRef(manualDepart);
  const manualDepartCoordRef = useRef(manualDepartCoord);
  useEffect(() => {
    gpsRef.current = gps;
  }, [gps]);
  useEffect(() => {
    gpsErrorRef.current = gpsError;
  }, [gpsError]);
  useEffect(() => {
    gpsBusyRef.current = gpsBusy;
  }, [gpsBusy]);
  useEffect(() => {
    manualDepartRef.current = manualDepart;
  }, [manualDepart]);
  useEffect(() => {
    manualDepartCoordRef.current = manualDepartCoord;
  }, [manualDepartCoord]);

  const gpsResolveRef = useRef<(() => void) | null>(null);
  const gpsReadyRef = useRef<Promise<void>>(
    new Promise<void>((resolve) => {
      gpsResolveRef.current = resolve;
    }),
  );
  function markGpsReady() {
    gpsResolveRef.current?.();
    gpsResolveRef.current = null;
  }

  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voicePartial, setVoicePartial] = useState("");
  const [voiceReviewed, setVoiceReviewed] = useState(false);
  const [micGate, setMicGate] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const levelTickRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const srcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const recStartRef = useRef(0);
  const lastLoudRef = useRef(0);
  const hasSpokenRef = useRef(false);
  const stoppingRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const fromMarker = useRef<any>(null);
  const toMarker = useRef<any>(null);
  const gpsMarker = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const transcribeFn = useServerFn(transcribeAudio);

  // Reset greeting when language changes (only if no conversation started)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: TXT[L].greeting }];
      }
      return prev;
    });
  }, [L]);

  // refus de clé signalé par Google même après chargement du SDK
  useEffect(() => onGoogleMapsAuthFailure((detail) => setMapError(detail)), []);

  // init Google Map
  useEffect(() => {
    let mounted = true;

    (async () => {
      let g: any;
      try {
        g = await loadGoogleMaps();
        setMapError(null);
      } catch (e: any) {
        setMapError(e?.message ?? "Google Maps indisponible");
        return;
      }
      if (!mounted || !mapRef.current || mapInst.current) return;
      mapInst.current = new g.maps.Map(mapRef.current, {
        center: { lat: 46.1591, lng: -1.1520 },
        zoom: 10,
        disableDefaultUI: false,
        clickableIcons: false,
      });
      // La carte s'affiche vraiment → on annule tout repli affiché à tort.
      g.maps.event.addListenerOnce(mapInst.current, "tilesloaded", () => {
        clearGoogleMapsAuthFailure();
        setMapError(null);
      });
    })();
    return () => {
      mounted = false;
      mapInst.current = null;
    };
  }, []);

  // update from/to markers when quote resolves addresses
  useEffect(() => {
    const map = mapInst.current;
    const g = (window as any).google;
    if (!map || !g?.maps || !quote) return;
    (async () => {
      const bounds = new g.maps.LatLngBounds();
      let count = 0;
      if (quote.depart_resolu) {
        const c = await geocodeFullAddress(quote.depart_resolu);
        if (c) {
          if (fromMarker.current) fromMarker.current.setPosition(c);
          else fromMarker.current = new g.maps.Marker({ position: c, map, title: tx("map_from") });
          bounds.extend(c);
          count++;
        }
      }
      if (quote.arrivee_resolu) {
        const c = await geocodeFullAddress(quote.arrivee_resolu);
        if (c) {
          if (toMarker.current) toMarker.current.setPosition(c);
          else
            toMarker.current = new g.maps.Marker({
              position: c,
              map,
              title: tx("map_to"),
              label: { text: "📍", fontSize: "22px" },
            });
          bounds.extend(c);
          count++;
        }
      }
      if (count >= 2) map.fitBounds(bounds, 60);
      else if (count === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(14);
      }
    })();
  }, [quote]);

  // AUTO geoloc on mount — cascade robuste (GPS précis → GPS en cache →
  // estimation réseau → géo-IP) avec message clair sur la précision, la ville
  // et la marche à suivre quand la position est approximative ou refusée.
  useEffect(() => {
    let cancelled = false;
    setGpsBusy(true);

    const setGreeting = (content: string) =>
      setMessages((prev) =>
        prev.length === 1 && prev[0].role === "assistant" ? [{ role: "assistant", content }] : prev,
      );

    const placeMarker = (lat: number, lng: number, approximate: boolean) => {
      const map = mapInst.current;
      const g = (window as any).google;
      if (!map || !g?.maps) return;
      const pos = { lat, lng };
      if (gpsMarker.current) gpsMarker.current.setPosition(pos);
      else
        gpsMarker.current = new g.maps.Marker({
          position: pos,
          map,
          title: TXT[L].map_from,
          label: { text: "🧭", fontSize: "18px" },
        });
      map.setCenter(pos);
      map.setZoom(approximate ? 11 : 14);
    };

    (async () => {
      const outcome = await locateUser();
      if (cancelled) return;

      if (!outcome.ok) {
        setGpsBusy(false);
        setGpsFromIp(false);
        setGpsError(outcome.reason);
        markGpsReady();
        setShowManualDepart(true);
        setGreeting(`📍 ${failureMessage(outcome.reason, L)}`);
        return;
      }

      const fix = outcome.fix;
      const { label, city } = await describePosition(fix.lat, fix.lng, L);
      if (cancelled) return;

      setGpsFromIp(fix.source === "ip" || fix.source === "network");
      setGps({ lat: fix.lat, lng: fix.lng, label });
      setGpsError(fix.approximate ? "low_accuracy" : null);
      setGpsBusy(false);
      markGpsReady();
      if (fix.approximate) setShowManualDepart(true);
      setGreeting(
        fix.approximate
          ? `📍 ${positionMessage(fix, city, L)}\n${label}`
          : `📍 ${positionMessage(fix, city, L)}\n${TXT[L].ask_destination}`,
      );
      placeMarker(fix.lat, fix.lng, fix.approximate);
    })();

    return () => {
      cancelled = true;
    };
  }, []);


  // When user picks a manual departure, update greeting & map
  useEffect(() => {
    if (!manualDepart) return;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [
          {
            role: "assistant",
            content: `📍 ${TXT[L].map_from} : ${manualDepart}.\n${TXT[L].ask_destination}`,
          },
        ];
      }
      return prev;
    });
    if (manualDepartCoord) {
      const map = mapInst.current;
      const g = (window as any).google;
      if (map && g?.maps) {
        const pos = { lat: manualDepartCoord.lat, lng: manualDepartCoord.lng };
        if (gpsMarker.current) gpsMarker.current.setPosition(pos);
        else gpsMarker.current = new g.maps.Marker({ position: pos, map, label: { text: "🧭", fontSize: "18px" } });
        map.setCenter(pos);
        map.setZoom(14);
      }
    }
  }, [manualDepart, manualDepartCoord]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // ─── Reprise automatique : restauration puis sauvegarde continue ─────────
  useEffect(() => {
    const saved = loadReserverSession();
    hydratedRef.current = true;
    if (!saved) return;
    if (saved.messages?.length) setMessages(saved.messages);
    if (saved.quote) setQuote(saved.quote as Quote);
    if (saved.form) setForm(saved.form);
    if (saved.manualDepart) {
      setManualDepart(saved.manualDepart);
      setManualDepartCoord(saved.manualDepartCoord ?? null);
      setShowManualDepart(true);
    }
    if (saved.reservationId) setReservationId(saved.reservationId);
    if (saved.suiviId) setSuiviId(saved.suiviId);
    if (saved.recapOpen && !saved.reservationId) setRecapOpen(true);
    setWasRestored(true);
  }, []);

  const sessionSnapshotRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const persist = () => {
      if (!hydratedRef.current) return;
      // Rien à mémoriser tant que le client n'a pas commencé (accueil seul).
      const started = messages.length > 1 || Boolean(quote) || Boolean(manualDepart);
      if (!started) return;
      saveReserverSession({
        lang: L,
        messages,
        quote,
        form,
        manualDepart,
        manualDepartCoord,
        reservationId,
        suiviId,
        recapOpen,
      });
    };
    sessionSnapshotRef.current = persist;
    persist();
  }, [messages, quote, form, manualDepart, manualDepartCoord, reservationId, suiviId, recapOpen, L]);

  // Retour arrière navigateur / onglet masqué / bfcache : on fige l'état exact
  // avant que la page ne soit démontée ou mise en cache.
  useEffect(() => {
    const flush = () => sessionSnapshotRef.current?.();
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  function resetConversation() {
    clearReserverSession();
    setWasRestored(false);
    setMessages([{ role: "assistant", content: TXT[L].greeting }]);
    setQuote(null);
    setReservationId(null);
    setSuiviId(null);
    setFormErrors({});
    setRecapOpen(false);
    setForm({ nom: "", telephone: "", email: "", passagers: "1", bagages: "0", note: "", agree: false });
  }

  const R = RECAP[L];

  /** Validations claires côté client, avant tout appel à l'assistante. */
  function validateBeforeSend(clean: string): string | null {
    if (clean.length > MAX_INPUT) return R.err_input;
    // Une adresse de départ saisie à la main doit être exploitable.
    const manual = manualDepartRef.current?.trim() ?? "";
    if (manual && manual.length < 6) return R.err_depart;
    return null;
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const invalid = validateBeforeSend(clean);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      if (!manualDepartRef.current && gpsBusyRef.current) {
        await Promise.race([gpsReadyRef.current, new Promise<void>((resolve) => setTimeout(resolve, 5000))]);
      }
      // Une position PC issue du Wi-Fi/IP peut être moins précise, mais ses
      // coordonnées restent exploitables pour le calcul. La retirer ici faisait
      // croire à Margot qu'aucun départ n'avait été détecté.
      const usableGps = gpsRef.current;
      const departure = manualDepartRef.current
        ? {
            label: manualDepartRef.current,
            lat: manualDepartCoordRef.current?.lat,
            lng: manualDepartCoordRef.current?.lng,
          }
        : usableGps?.label
          ? { label: usableGps.label, lat: usableGps.lat, lng: usableGps.lng }
          : null;
      const res = await chat({
        data: {
          messages: next,
          lang: LANG_LABEL[L] ?? "français",
          lang_code: L,
          gps: usableGps,
          departure,
          client_fcm_token:
            clientPushToken ?? (typeof window !== "undefined" ? window.localStorage.getItem("fcm_token") : null),
        },
      });
      setMessages([...next, { role: "assistant", content: res.reply || "…" }]);
      if (res.quote) setQuote(res.quote as Quote);
      if (res.reservation_id) {
        setReservationId(res.reservation_id);
        toast.success(TXT[L].success);
        const trackId = res.suivi_id ?? res.reservation_id;
        setSuiviId(trackId ?? null);
        setRecapOpen(false);
        // Laisse le temps de lire la confirmation avant la redirection.
        setTimeout(() => {
          clearReserverSession();
          navigate({ to: "/suivi/$id", params: { id: trackId! } });
        }, 6000);
      }
    } catch (e: any) {
      toast.error(e?.message ?? TXT[L].error);
      setMessages([...next, { role: "assistant", content: TXT[L].error }]);
    } finally {
      setBusy(false);
    }
  }

  // ─── Détection de silence : arrêt auto du micro ───────────────────────────
  const SILENCE_RMS = 0.015;
  const SILENCE_MS = 1400;
  const NO_SPEECH_MS = 6000;
  const MAX_RECORDING_MS = 25000;

  function encodeWav(chunks: Float32Array[], sampleRate: number, targetRate = 16000): Blob {
    let total = 0;
    for (const c of chunks) total += c.length;
    const merged = new Float32Array(total);
    let off = 0;
    for (const c of chunks) {
      merged.set(c, off);
      off += c.length;
    }
    // Downsample (simple decimation with averaging)
    const ratio = sampleRate / targetRate;
    const outLen = ratio > 1 ? Math.floor(merged.length / ratio) : merged.length;
    const out = new Float32Array(outLen);
    if (ratio > 1) {
      for (let i = 0; i < outLen; i++) {
        const start = Math.floor(i * ratio);
        const end = Math.min(merged.length, Math.floor((i + 1) * ratio));
        let sum = 0;
        for (let j = start; j < end; j++) sum += merged[j];
        out[i] = sum / Math.max(1, end - start);
      }
    } else {
      out.set(merged);
    }
    const rate = ratio > 1 ? targetRate : sampleRate;
    const buffer = new ArrayBuffer(44 + out.length * 2);
    const view = new DataView(buffer);
    const writeStr = (o: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + out.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, out.length * 2, true);
    let p = 44;
    for (let i = 0; i < out.length; i++, p += 2) {
      const s = Math.max(-1, Math.min(1, out[i]));
      view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  }

  function cleanupMic() {
    try {
      procRef.current?.disconnect();
    } catch {}
    try {
      srcNodeRef.current?.disconnect();
    } catch {}
    procRef.current = null;
    srcNodeRef.current = null;
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  }

  /** Transcription en streaming (SSE) — latence minimale ; retombe en batch si indisponible. */
  async function transcribeStreaming(base64: string): Promise<string> {
    try {
      const res = await fetch("/api/transcribe-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mime: "audio/wav" }),
      });
      if (!res.ok || !res.body) throw new Error(`stream_${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (!value) continue;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const raw = trimmed.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw) as { type?: string; delta?: string; text?: string };
            if (evt.type === "transcript.text.delta" && evt.delta) {
              acc += evt.delta;
              setVoicePartial(acc);
            } else if (evt.type === "transcript.text.done" && evt.text) {
              acc = evt.text;
              setVoicePartial(acc);
            }
          } catch {
            /* ignore keep-alive / partial frames */
          }
        }
      }
      if (acc.trim()) return acc.trim();
      throw new Error("stream_empty");
    } catch (err) {
      console.warn("[voice] streaming unavailable, batch fallback", err);
      const { text } = await transcribeFn({ data: { base64, mime: "audio/wav" } });
      return (text ?? "").trim();
    }
  }

  async function finishVoice(send_ = true) {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    const ctx = audioCtxRef.current;
    const rate = ctx?.sampleRate ?? 44100;
    const chunks = pcmRef.current;
    pcmRef.current = [];
    cleanupMic();
    setListening(false);
    setVoiceLevel(0);
    if (!send_ || chunks.length === 0) {
      stoppingRef.current = false;
      return;
    }
    const blob = encodeWav(chunks, rate);
    if (blob.size < 4000 || !hasSpokenRef.current) {
      stoppingRef.current = false;
      setVoiceError(TXT[L].voice_empty);
      toast.error(TXT[L].voice_empty);
      return;
    }
    setTranscribing(true);
    setVoicePartial("");
    setVoiceError(null);
    try {
      const base64 = await blobToBase64(blob);
      const text = await transcribeStreaming(base64);
      if (text) {
        // Sauvegarde automatique dans le champ : l'utilisateur relit / corrige avant envoi.
        const combined = inputRef.current ? `${inputRef.current} ${text}`.trim() : text;
        setInput(combined.slice(0, MAX_INPUT));
        setVoiceReviewed(true);
        requestAnimationFrame(() => {
          const el = textareaRef.current;
          if (el) {
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
          }
        });
      } else {
        setVoiceError(TXT[L].voice_empty);
        toast.error(TXT[L].voice_empty);
      }
    } catch (err) {
      console.error("[voice] transcription failed", err);
      setVoiceError(TXT[L].voice_error);
      toast.error(TXT[L].voice_error);
    } finally {
      setVoicePartial("");
      setTranscribing(false);
      stoppingRef.current = false;
    }
  }


  function stopVoice() {
    void finishVoice(true);
  }

  const voiceStartingRef = useRef(false);

  async function startRecording() {
    if (listening || voiceStartingRef.current) return;
    voiceStartingRef.current = true;
    setVoiceError(null);
    setVoicePartial("");

    try {
      const Ctx: typeof AudioContext | undefined =
        typeof window !== "undefined" ? window.AudioContext || (window as any).webkitAudioContext : undefined;
      if (!Ctx || !navigator.mediaDevices?.getUserMedia) {
        setVoiceError(TXT[L].voice_unsupported);
        toast.error(TXT[L].voice_unsupported);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch (err: any) {
        const name = err?.name || err?.message;
        let msg = TXT[L].voice_error;
        if (name === "NotAllowedError" || name === "SecurityError") {
          msg = TXT[L].voice_denied;
          setMicPermission("denied");
          setMicGate(true);
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          msg = TXT[L].voice_no_mic;
        }
        setVoiceError(msg);
        toast.error(msg);
        return;
      }
      mediaStreamRef.current = stream;
      setMicPermission("granted");
      setMicGate(false);

      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {}
      }
      const source = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      srcNodeRef.current = source;
      procRef.current = proc;
      pcmRef.current = [];
      hasSpokenRef.current = false;
      recStartRef.current = Date.now();
      lastLoudRef.current = Date.now();
      stoppingRef.current = false;

      proc.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        pcmRef.current.push(new Float32Array(data));
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const rms = Math.sqrt(sum / data.length);
        const now = Date.now();
        if (now - levelTickRef.current > 80) {
          levelTickRef.current = now;
          setVoiceLevel(Math.min(1, rms * 8));
        }
        if (rms > SILENCE_RMS) {
          hasSpokenRef.current = true;
          lastLoudRef.current = now;
        }
        const elapsed = now - recStartRef.current;
        if (
          (hasSpokenRef.current && now - lastLoudRef.current > SILENCE_MS) ||
          (!hasSpokenRef.current && elapsed > NO_SPEECH_MS) ||
          elapsed > MAX_RECORDING_MS
        ) {
          void finishVoice(true);
        }
      };
      source.connect(proc);
      // Gain 0 sink : nécessaire pour que onaudioprocess se déclenche (Safari/Chrome)
      const sink = ctx.createGain();
      sink.gain.value = 0;
      proc.connect(sink);
      sink.connect(ctx.destination);

      setListening(true);
    } catch (err) {
      console.error("[voice] start failed", err);
      cleanupMic();
      setVoiceError(TXT[L].voice_error);
      toast.error(TXT[L].voice_error);
      setListening(false);
    } finally {
      voiceStartingRef.current = false;
    }
  }

  const startRecordingRef = useRef(startRecording);
  startRecordingRef.current = startRecording;

  async function toggleVoice() {
    if (listening) {
      stopVoice();
      return;
    }
    // Écran d'explication avant la 1re demande d'autorisation (ou après un refus)
    let state: string = micPermission;
    try {
      const perm = await (navigator as any).permissions?.query?.({ name: "microphone" as PermissionName });
      if (perm?.state) {
        state = perm.state;
        setMicPermission(perm.state);
      }
    } catch {
      /* Safari : Permissions API micro non supportée */
    }
    const seen = typeof window !== "undefined" && localStorage.getItem("apt_mic_intro") === "1";
    if (state === "granted" || (seen && state !== "denied")) {
      void startRecording();
      return;
    }
    setVoiceError(null);
    setMicGate(true);
  }

  // Relance automatique dès que l'autorisation micro passe à "granted"
  useEffect(() => {
    let perm: any;
    let cancelled = false;
    (async () => {
      try {
        perm = await (navigator as any).permissions?.query?.({ name: "microphone" as PermissionName });
      } catch {
        return;
      }
      if (!perm || cancelled) return;
      setMicPermission(perm.state);
      perm.onchange = () => {
        setMicPermission(perm.state);
        if (perm.state === "granted") {
          setVoiceError(null);
          setMicGate(false);
          void startRecordingRef.current();
        }
      };
    })();
    return () => {
      cancelled = true;
      if (perm) perm.onchange = null;
    };
  }, []);



  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && listening) stopVoice();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening]);

  useEffect(() => {
    return () => cleanupMic();
  }, []);

  function submitRecap() {
    const errors: Record<string, string> = {};
    const nom = form.nom.trim();
    const tel = form.telephone.trim();
    const email = form.email.trim();
    const pax = Number(form.passagers);
    const bags = Number(form.bagages);

    if (nom.length < 2) errors.nom = R.err_name;
    if (!PHONE_RE.test(tel.replace(/\s+/g, " "))) errors.telephone = R.err_phone;
    if (!EMAIL_RE.test(email)) errors.email = R.err_email;
    if (!Number.isFinite(pax) || pax < 1 || pax > 7) errors.passagers = R.err_pax;
    if (!Number.isFinite(bags) || bags < 0 || bags > 7) errors.bagages = R.err_bags;
    if (!form.agree) errors.agree = R.err_agree;

    setFormErrors(errors);
    const keys = Object.keys(errors);
    if (keys.length > 0) {
      // Accessibilité : le résumé d'erreurs reçoit le focus (lu par le lecteur
      // d'écran), et le premier champ fautif est mis en évidence.
      window.setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 0);
      return;
    }

    const note = form.note.trim();
    const msg =
      L === "en"
        ? `I confirm the booking. Name: ${nom}. Phone: ${tel}. Email: ${email}. Passengers: ${pax}. Luggage: ${bags}.${note ? ` Note: ${note}.` : ""}`
        : `Je confirme la réservation. Nom : ${nom}. Téléphone : ${tel}. Email : ${email}. Passagers : ${pax}. Bagages : ${bags}.${note ? ` Précision : ${note}.` : ""}`;
    setRecapOpen(false);
    void send(msg);
  }

  // Accessibilité : la confirmation prend le focus dès qu'elle apparaît.
  useEffect(() => {
    if (reservationId) confirmationRef.current?.focus();
  }, [reservationId]);

  const pickupLabel = formatPickup(quote?.pickup_datetime, L);

  /** Décomposition officielle du prix (mêmes règles que le simulateur). */
  const fareDetail =
    quote?.distance_km != null && quote.distance_km > 0
      ? detaillerPrix(quote.distance_km, quote.pickup_datetime ?? new Date().toISOString(), quote.duree_min)
      : null;
  const eur = (n: number) => `${n.toFixed(2)} €`;

  /** Toutes les valeurs qui partiront au chauffeur, relues avant validation. */
  const reviewRows = [
    { icon: MapPin, label: R.from, value: quote?.depart_resolu ?? manualDepart ?? "" },
    { icon: MapPin, label: R.to, value: quote?.arrivee_resolu ?? "" },
    { icon: Calendar, label: R.when, value: pickupLabel ?? "" },
    {
      icon: Car,
      label: R.dist,
      value: quote?.distance_km != null ? `${quote.distance_km} km · ~${quote.duree_min} min` : "",
    },
    { icon: Sparkles, label: R.price, value: quote?.prix_estime != null ? `${quote.prix_estime.toFixed(2)} €` : "" },
    { icon: User, label: R.name, value: form.nom.trim() },
    { icon: Phone, label: R.phone, value: form.telephone.trim() },
    { icon: Mail, label: R.email, value: form.email.trim() },
    { icon: Users, label: R.pax, value: form.passagers },
    { icon: Briefcase, label: R.bags, value: form.bagages },
    { icon: MessageSquare, label: R.note, value: form.note.trim() },
  ];

  const sugg = [tx("sug1"), tx("sug2"), tx("sug3"), tx("sug4")];
  const stepsLabels = [tx("step1"), tx("step2"), tx("step3"), tx("step4")];
  const currentStep = reservationId ? 3 : quote ? 2 : messages.length > 1 ? 1 : 0;

  return (
    <main className="min-h-screen bg-background">
      <SocialMetaSync lang={L} fr={RESERVER_SOCIAL_FR} en={RESERVER_SOCIAL_EN} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="mb-6 inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
        >
          ↩ {L === "en" ? "Back to site" : "Retour au site"}
        </Link>
        <div className="text-center">

          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <Sparkles className="h-3.5 w-3.5" /> {tx("kicker")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {tx("hero_title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{tx("hero_sub")}</p>
          {wasRestored && !reservationId && (
            <div
              role="status"
              aria-live="polite"
              className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm"
            >
              <span className="text-foreground">{R.restored}</span>
              <button
                type="button"
                onClick={resetConversation}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {R.restored_cta}
              </button>
            </div>
          )}
        </div>

        {/* Steps banner */}
        <ol className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 sm:grid-cols-4">
          {[MessageSquare, Calendar, CheckCircle2, Car].map((Icon, i) => {
            const active = i <= currentStep;
            return (
              <li
                key={i}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${active ? "bg-accent/10 text-accent" : "text-muted-foreground"}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? "bg-accent text-accent-foreground" : "bg-muted"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">
                  {i + 1}. {stepsLabels[i]}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* Chat */}
          <section className="flex h-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
            <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{tx("brand")}</p>
                <p className="text-[11px] text-emerald-600">● {tx("online")}</p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-secondary text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> {tx("thinking")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && !busy && (
              <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-3">
                {sugg.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Écran d'explication micro */}
            {micGate && (
              <div className="border-t border-border/60 bg-accent/5 px-4 py-3" role="dialog" aria-label={tx("voice_hint_title")}>
                <p className="text-sm font-semibold text-foreground">{tx("voice_hint_title")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tx("voice_hint_desc")}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• {tx("voice_hint_1")}</li>
                  <li>• {tx("voice_hint_2")}</li>
                  <li>• {tx("voice_hint_3")}</li>
                </ul>
                {micPermission === "denied" && (
                  <p className="mt-2 text-xs font-medium text-destructive">{tx("voice_denied_help")}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem("apt_mic_intro", "1");
                      } catch {}
                      void startRecording();
                    }}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    {tx("voice_hint_cta")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMicGate(false)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    {tx("voice_hint_later")}
                  </button>
                </div>
              </div>
            )}

            {/* Indicateur d'enregistrement / transcription */}
            {(listening || transcribing || voiceError || voiceReviewed) && (
              <div className="border-t border-border/60 px-4 py-2.5" aria-live="polite">
                {listening && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-destructive">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
                      {tx("voice_listening")}
                    </span>
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      role="meter"
                      aria-label={tx("voice_level")}
                      aria-valuenow={Math.round(voiceLevel * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-100"
                        style={{ width: `${Math.max(4, Math.round(voiceLevel * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
                {transcribing && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    {voicePartial ? voicePartial : tx("voice_transcribing")}
                  </p>
                )}
                {!listening && !transcribing && voiceError && (
                  <p className="text-xs font-medium text-destructive">{voiceError}</p>
                )}
                {!listening && !transcribing && !voiceError && voiceReviewed && (
                  <p className="text-xs text-accent">{tx("voice_review")}</p>
                )}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setVoiceReviewed(false);
                send(input);
              }}
              className="flex items-end gap-2 border-t border-border/60 bg-background/60 p-3"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}

                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                disabled={busy || !!reservationId}
                placeholder={reservationId ? tx("sent") : tx("placeholder")}
                maxLength={MAX_INPUT}
                aria-invalid={input.length > MAX_INPUT}
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
              />
              {input.length > MAX_INPUT - 200 && (
                <span className="self-center text-[11px] text-muted-foreground" aria-live="polite">
                  {MAX_INPUT - input.length} {R.counter}
                </span>
              )}
              <button
                type="button"
                onClick={toggleVoice}
                disabled={busy || !!reservationId || transcribing}
                aria-pressed={listening}
                aria-label={listening ? tx("voice_stop") : tx("voice_start")}
                title={listening ? tx("voice_stop") : tx("voice_start")}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  listening
                    ? "animate-pulse border-destructive bg-destructive text-destructive-foreground"
                    : transcribing
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {transcribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : listening ? (
                  <MicOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only" aria-live="polite">
                  {listening ? tx("voice_listening") : ""}
                </span>
              </button>
              <button
                type="submit"
                disabled={busy || !input.trim() || !!reservationId}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                aria-label="Envoyer"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </section>

          {/* Live recap card */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-6 shadow-[var(--shadow-elegant)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">{tx("fare_title")}</p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
                {quote?.prix_estime != null ? `${quote.prix_estime.toFixed(2)} €` : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {quote?.distance_km != null ? `${quote.distance_km} km · ~${quote.duree_min} min` : tx("fare_empty")}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tx("trip_title")}
              </p>
              <ul className="space-y-2.5 text-sm">
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">
                    {quote?.depart_resolu ?? <span className="italic text-muted-foreground">{tx("depart")}</span>}
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-foreground">
                    {quote?.arrivee_resolu ?? <span className="italic text-muted-foreground">{tx("arrivee")}</span>}
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="italic text-muted-foreground">{tx("date")}</span>
                </li>
              </ul>
            </div>

            {/* Récapitulatif avant soumission / confirmation multilingue */}
            {reservationId ? (
              <div
                ref={confirmationRef}
                tabIndex={-1}
                className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {R.ok_title}
                </p>
                <p className="mt-1 text-muted-foreground">{R.ok_desc}</p>
                {suiviId && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {R.ok_ref} :{" "}
                    <span className="font-mono font-semibold text-foreground">{suiviId}</span>
                  </p>
                )}
                {suiviId && (
                  <Link
                    to="/suivi/$id"
                    params={{ id: suiviId }}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Car className="h-4 w-4" /> {R.ok_cta}
                  </Link>
                )}
              </div>
            ) : (
              quote?.prix_estime != null && (
                <button
                  type="button"
                  onClick={() => setRecapOpen(true)}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {R.open}
                </button>
              )
            )}

            {/* GPS status (auto) + manual fallback */}
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4" aria-live="polite">
              <div className="flex items-start gap-3">
                <Navigation
                  className={`mt-0.5 h-5 w-5 shrink-0 text-accent ${gpsBusy ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {gpsBusy
                      ? tx("gps_detecting")
                      : manualDepart
                        ? tx("gps_manual")
                        : gps
                          ? tx("gps_detected")
                          : gpsError === "denied"
                            ? tx("gps_denied")
                            : gpsError === "out_of_zone"
                              ? tx("gps_out_zone")
                              : tx("gps_unavailable")}
                  </p>
                  <p className="mt-0.5 break-words text-[11px] text-muted-foreground">
                    {manualDepart || gps?.label || tx("gps_auto")}
                  </p>
                  {!gpsBusy && gpsFromIp && gps && !manualDepart && (
                    <p className="mt-1 break-words text-[11px] text-muted-foreground">{tx("gps_ip_note")}</p>
                  )}
                </div>
              </div>

              {!gpsBusy && gpsError === "out_of_zone" && (
                <p
                  role="status"
                  className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-foreground"
                >
                  {tx("gps_out_zone_msg")}
                </p>
              )}

              {!gpsBusy && (gps || gpsError) && !showManualDepart && (
                <button
                  type="button"
                  onClick={() => setShowManualDepart(true)}
                  className="mt-3 text-[11px] font-medium text-accent underline underline-offset-2 hover:text-accent/80"
                >
                  {tx("gps_use_other")}
                </button>
              )}

              {!gpsBusy && (!gps || showManualDepart || gpsError) && (
                <div className="mt-3 space-y-2">
                  <label htmlFor="manual-depart" className="block text-[11px] font-medium text-muted-foreground">
                    {tx("gps_enter")}
                  </label>
                  <AddressAutocomplete
                    value={manualDepart}
                    onChange={(v, s) => {
                      setManualDepart(v);
                      if (!v) setManualDepartCoord(null);
                      if (s) setManualDepartCoord({ lat: s.lat, lng: s.lng });
                    }}
                    placeholder={tx("gps_placeholder")}
                  />
                  <span className="block pt-1 text-[11px] font-medium text-muted-foreground">
                    {tx("gps_enter_arrivee")}
                  </span>
                  <AddressAutocomplete
                    value={manualArrivee}
                    onChange={(v) => setManualArrivee(v)}
                    placeholder={tx("gps_arrivee_ph")}
                  />
                  {manualDepart.trim().length > 2 && manualArrivee.trim().length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const msg =
                          L === "en"
                            ? `Pickup: ${manualDepart.trim()}. Drop-off: ${manualArrivee.trim()}.`
                            : `Départ : ${manualDepart.trim()}. Arrivée : ${manualArrivee.trim()}.`;
                        void send(msg);
                      }}
                      className="w-full rounded-xl bg-accent px-3 py-2 text-[12px] font-semibold text-accent-foreground transition hover:opacity-90"
                    >
                      {tx("gps_use_addresses")}
                    </button>
                  )}
                  {gps && showManualDepart && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualDepart(false);
                        setManualDepart("");
                        setManualDepartCoord(null);
                      }}
                      className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      {tx("gps_back")}
                    </button>
                  )}
                </div>
              )}
            </div>

            <PushReminderCard L={L} />

            <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              <p>{tx("call")}</p>
              <a
                href="tel:+33650321923"
                className="mt-1 inline-flex items-center gap-2 text-base font-bold text-accent hover:underline"
              >
                <Phone className="h-4 w-4" /> Alain 06 50 32 19 23
              </a>
              <a
                href="tel:+33650260015"
                className="mt-1 inline-flex items-center gap-2 text-base font-bold text-accent hover:underline"
              >
                <Phone className="h-4 w-4" /> Patricia 06 50 26 00 15
              </a>
            </div>

            <Link to="/client/trajets" className="block text-center text-xs text-muted-foreground hover:text-accent">
              {tx("myrides")}
            </Link>
          </aside>
        </div>

        {/* Modale de récapitulatif avant soumission */}
        {recapOpen && !reservationId && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setRecapOpen(false)}
          >
            <div
              ref={recapDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="recap-title"
              aria-describedby="recap-subtitle"
              className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)] sm:rounded-3xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="recap-title" className="font-display text-xl font-bold text-foreground">
                    {R.title}
                  </h2>
                  <p id="recap-subtitle" className="mt-1 text-xs text-muted-foreground">
                    {R.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecapOpen(false)}
                  aria-label={R.close}
                  className="-mr-1 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Résumé d'erreurs : focusable, annoncé, liens vers les champs */}
              {Object.keys(formErrors).length > 0 && (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                  className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                >
                  <p className="flex items-center gap-2 font-semibold text-destructive">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" /> {R.err_title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-destructive/80">{R.err_intro}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-destructive">
                    {Object.entries(formErrors).map(([field, message]) => (
                      <li key={field}>
                        <a
                          href={`#${FIELD_IDS[field] ?? "recap-nom"}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(FIELD_IDS[field] ?? "")?.focus();
                          }}
                          className="underline underline-offset-2"
                        >
                          {message}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {R.trip_section}
              </h3>
              <dl className="mt-2 space-y-2 rounded-2xl border border-border bg-background/60 p-4 text-sm">

                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">{R.from}</dt>
                  <dd className="text-right font-medium text-foreground">{quote?.depart_resolu ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">{R.to}</dt>
                  <dd className="text-right font-medium text-foreground">{quote?.arrivee_resolu ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">{R.when}</dt>
                  <dd className="text-right font-medium text-foreground">{pickupLabel ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-muted-foreground">{R.dist}</dt>
                  <dd className="text-right font-medium text-foreground">
                    {quote?.distance_km != null ? `${quote.distance_km} km · ~${quote.duree_min} min` : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-2">
                  <dt className="shrink-0 font-semibold text-foreground">{R.price}</dt>
                  <dd className="text-right font-display text-lg font-bold text-accent">
                    {quote?.prix_estime != null ? `${quote.prix_estime.toFixed(2)} €` : "—"}
                  </dd>
                </div>
              </dl>

              {fareDetail && (
                <section className="mt-3 rounded-2xl border border-border bg-background/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {R.calc_title}
                  </h4>
                  <dl className="mt-2 space-y-1.5 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{R.calc_base}</dt>
                      <dd className="font-medium text-foreground">{eur(fareDetail.priseEnCharge)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{R.calc_dist}</dt>
                      <dd className="font-medium text-foreground">{fareDetail.distanceKm.toFixed(1)} km</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{R.calc_dur}</dt>
                      <dd className="font-medium text-foreground">~{Math.round(fareDetail.dureeMin)} min</dd>
                    </div>
                    {fareDetail.kmJour > 0 && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">
                          ☀️ {R.calc_day} · {fareDetail.kmJour.toFixed(1)} km × {eur(fareDetail.tarifKmJour)}/km
                        </dt>
                        <dd className="font-medium text-foreground">{eur(fareDetail.prixJour)}</dd>
                      </div>
                    )}
                    {fareDetail.kmNuit > 0 && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">
                          🌙 {R.calc_night} · {fareDetail.kmNuit.toFixed(1)} km × {eur(fareDetail.tarifKmNuit)}/km
                        </dt>
                        <dd className="font-medium text-foreground">{eur(fareDetail.prixNuit)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 border-t border-border pt-1.5">
                      <dt className="font-semibold text-foreground">{R.calc_total}</dt>
                      <dd className="font-display font-bold text-accent">{eur(fareDetail.total)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{R.calc_rule}</p>
                </section>
              )}

              <form
                className="mt-4 space-y-3"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  submitRecap();
                }}
              >
                <fieldset className="space-y-3 border-0 p-0">
                <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {R.contact}
                </legend>

                <div>
                  <label htmlFor="recap-nom" className="block text-xs font-medium text-muted-foreground">
                    {R.name}{" "}
                    <span className="text-destructive" aria-hidden="true">*</span>
                    <span className="sr-only"> ({R.required})</span>
                  </label>
                  <input
                    id="recap-nom"
                    value={form.nom}
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    maxLength={100}
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-invalid={!!formErrors.nom}
                    aria-describedby={formErrors.nom ? "recap-nom-err" : undefined}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  {formErrors.nom && (
                    <p id="recap-nom-err" className="mt-1 text-[11px] font-medium text-destructive">
                      {formErrors.nom}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="recap-tel" className="block text-xs font-medium text-muted-foreground">
                      {R.phone}{" "}
                      <span className="text-destructive" aria-hidden="true">*</span>
                      <span className="sr-only"> ({R.required})</span>
                    </label>
                    <input
                      id="recap-tel"
                      type="tel"
                      inputMode="tel"
                      value={form.telephone}
                      onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                      maxLength={20}
                      autoComplete="tel"
                      placeholder="06 12 34 56 78"
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.telephone}
                      aria-describedby={formErrors.telephone ? "recap-tel-err" : undefined}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    {formErrors.telephone && (
                      <p id="recap-tel-err" className="mt-1 text-[11px] font-medium text-destructive">
                        {formErrors.telephone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="recap-email" className="block text-xs font-medium text-muted-foreground">
                      {R.email}{" "}
                      <span className="text-destructive" aria-hidden="true">*</span>
                      <span className="sr-only"> ({R.required})</span>
                    </label>
                    <input
                      id="recap-email"
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      maxLength={255}
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? "recap-email-err" : undefined}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    {formErrors.email && (
                      <p id="recap-email-err" className="mt-1 text-[11px] font-medium text-destructive">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="recap-pax" className="block text-xs font-medium text-muted-foreground">
                      {R.pax}
                    </label>
                    <input
                      id="recap-pax"
                      type="number"
                      min={1}
                      max={7}
                      value={form.passagers}
                      onChange={(e) => setForm((f) => ({ ...f, passagers: e.target.value }))}
                      aria-invalid={!!formErrors.passagers}
                      aria-describedby={formErrors.passagers ? "recap-pax-err" : undefined}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    {formErrors.passagers && (
                      <p id="recap-pax-err" className="mt-1 text-[11px] font-medium text-destructive">
                        {formErrors.passagers}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="recap-bags" className="block text-xs font-medium text-muted-foreground">
                      {R.bags}
                    </label>
                    <input
                      id="recap-bags"
                      type="number"
                      min={0}
                      max={7}
                      value={form.bagages}
                      onChange={(e) => setForm((f) => ({ ...f, bagages: e.target.value }))}
                      aria-invalid={!!formErrors.bagages}
                      aria-describedby={formErrors.bagages ? "recap-bags-err" : undefined}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    {formErrors.bagages && (
                      <p id="recap-bags-err" className="mt-1 text-[11px] font-medium text-destructive">
                        {formErrors.bagages}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="recap-note" className="block text-xs font-medium text-muted-foreground">
                    {R.note}
                  </label>
                  <textarea
                    id="recap-note"
                    rows={2}
                    maxLength={300}
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder={R.note_ph}
                    className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>

                </fieldset>

                {/* Récapitulatif complet, mis à jour en direct avant envoi */}
                <section
                  aria-live="polite"
                  className="rounded-2xl border border-accent/30 bg-accent/5 p-4"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">{R.review_section}</h3>
                  <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-2">
                    {reviewRows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-2 sm:block">
                        <dt className="flex items-center gap-1.5 text-muted-foreground">
                          <row.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {row.label}
                        </dt>
                        <dd
                          className={`text-right font-medium sm:text-left ${row.value ? "text-foreground" : "italic text-muted-foreground"}`}
                        >
                          {row.value || R.to_fill}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <div>
                  <label htmlFor="recap-agree" className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                      id="recap-agree"
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 accent-[hsl(var(--accent))]"
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.agree}
                      aria-describedby={formErrors.agree ? "recap-agree-err" : undefined}
                    />
                    <span>{R.agree}</span>
                  </label>
                  {formErrors.agree && (
                    <p id="recap-agree-err" className="mt-1 text-[11px] font-medium text-destructive">
                      {formErrors.agree}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRecapOpen(false)}
                    className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {R.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-[2] rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : R.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Aide contextuelle adresses */}
        <details className="group mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-accent" aria-hidden="true" />
              {tx("addr_help_title")}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground group-open:hidden">+</span>
            <span className="hidden text-[11px] font-medium text-muted-foreground group-open:inline">−</span>
          </summary>
          <div className="border-t border-border/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <p>{tx("addr_help_desc")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>{tx("addr_help_1")}</li>
              <li>{tx("addr_help_2")}</li>
              <li>{tx("addr_help_3")}</li>
            </ul>
            <p className="mt-3 font-semibold text-foreground">{tx("addr_help_ex_title")}</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>{tx("addr_help_ex_1")}</li>
              <li>{tx("addr_help_ex_2")}</li>
              <li>{tx("addr_help_ex_3")}</li>
              <li>{tx("addr_help_ex_4")}</li>
            </ul>
            <p className="mt-3 text-[11px] italic">{tx("addr_help_note")}</p>
          </div>
        </details>

        {/* Map */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("map_label")}</p>
            <span className="text-[11px] text-muted-foreground">{tx("map_zone")}</span>
          </div>
          <div className="relative h-[360px] w-full">
            <div ref={mapRef} className="absolute inset-0" />
            {mapError && (
              <MapFallback lang={L} lat={46.1591} lng={-1.152} zoom={10} label={R.map_error_title} />
            )}


          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">{tx("footer")}</p>
      </div>
    </main>
  );
}

function PushReminderCard({ L }: { L: "fr" | "en" }) {
  const { status, subscribe, testNotification } = usePushNotifications({ autoAudience: "client" });
  const [busy, setBusy] = useState(false);
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  const isUnsupported = status === "unsupported";

  async function enable() {
    setBusy(true);
    try {
      const ok = await subscribe("client", null, null);
      if (ok) toast.success(TXT[L].push_on);
      else if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        toast.error(TXT[L].push_denied);
      } else {
        toast.error(TXT[L].voice_error);
      }
    } finally {
      setBusy(false);
    }
  }

  const stateLabel = isGranted
    ? TXT[L].push_on
    : isDenied
      ? TXT[L].push_denied
      : isUnsupported
        ? TXT[L].push_unsupported
        : TXT[L].push_off;
  const stateColor = isGranted
    ? "bg-emerald-500/15 text-emerald-600"
    : isDenied
      ? "bg-destructive/15 text-destructive"
      : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Bell className={`h-4 w-4 ${isGranted ? "" : "opacity-70"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{TXT[L].push_title}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${stateColor}`}
            >
              {stateLabel}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{TXT[L].push_desc}</p>

          {isUnsupported ? null : isDenied ? (
            <p className="mt-2 text-[11px] text-destructive">{TXT[L].push_denied}</p>
          ) : isGranted ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => testNotification()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-background px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/10"
              >
                <Bell className="h-3.5 w-3.5" /> {TXT[L].push_test}
              </button>
              <button
                type="button"
                onClick={enable}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {TXT[L].push_again}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={enable}
              disabled={busy || status === "loading"}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {TXT[L].push_activating}
                </>
              ) : (
                <>
                  <Bell className="h-3.5 w-3.5" /> {TXT[L].push_btn}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
