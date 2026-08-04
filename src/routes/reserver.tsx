import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { gaEvent } from "@/lib/ga4";
import { useServerFn } from "@tanstack/react-start";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createReservationPublic, getTaxiAvailability } from "@/lib/reservation-create.functions";
import { unsubscribePush } from "@/lib/push.functions";
import { broadcastDriverFeed } from "@/lib/suivi-broadcast";
import {
  calculerPrix,
  calculerPrixMixte,
  PRISE_EN_CHARGE,
  estTarifJourParis,
  estJourFerieFR,
  partsParis,
} from "@/lib/tarif";
import { reverseGeocode, searchAddress } from "@/lib/googleGeocode";
import { getDistanceAndDurationKm } from "@/lib/googleRoute";
import { roundSecondsToMinute } from "@/lib/duration";

import { newSuiviId } from "@/lib/suivi-id";
import { notifyNewReservation, subscribePush as subscribePushServer } from "@/lib/push.functions";
import { seedReservationSpecialRequest } from "@/lib/chat.functions";
import { getFcmToken } from "@/lib/firebase";
import { ensureMicAccess, describeGeoError } from "@/lib/permissions";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ListeningOverlay } from "@/components/ListeningOverlay";

import { DICTS, LANGUAGES, type Lang } from "@/i18n/dict";
import { useI18n } from "@/i18n/I18nProvider";

const RESERVER_TITLE = "Réserver un taxi en Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC =
  "Réservez votre taxi en Charente-Maritime en ligne en 2 minutes : départ, destination, date — tarif estimé en direct et confirmation immédiate.";
const RESERVER_URL = "https://accessprestigetaxi.lovable.app/reserver";

export const Route = createFileRoute("/reserver")({
  head: () => ({
    meta: [
      { title: RESERVER_TITLE },
      { name: "description", content: RESERVER_DESC },
      { property: "og:title", content: RESERVER_TITLE },
      { property: "og:description", content: RESERVER_DESC },
      { property: "og:url", content: RESERVER_URL },
      { property: "og:type", content: "website" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { name: "theme-color", content: "#1a1209" },
    ],
    links: seoLinks("/reserver"),
  }),
  component: ReservationPage,
});

const SERVICE_CENTER: [number, number] = [45.6486, 0.1562]; // Angoulême, Charente
const NAMED_PLACE_REGEX =
  /aeroport|airport|gare|station|hopital|clinique|universite|fac|campus|centre commercial|centre|stade|mairie|hotel de ville|prefecture|sous prefecture|eglise|cathedrale|basilique|chateau|lycee|college|ecole|musee|theatre|opera|cinema|parc|jardin|plage|port|marina|zoo|monument|lieu dit|lieu-dit|supermarche|hypermarche|supermarket|magasin|commerce|marche|carrefour|leclerc|lidl|aldi|auchan|intermarche|super u|hyper u|casino|monoprix|franprix|biocoop|grand frais|picard|decathlon|ikea|fnac|darty|leroy merlin|castorama|brico|mcdo|mcdonald|kfc|burger king|quick|subway|starbucks|pizza/i;
function isNamedPlaceQuery(value: string): boolean {
  return NAMED_PLACE_REGEX.test(normalizeAddressText(value));
}
const UI = {
  fr: {
    micDenied: "Accès au micro refusé. Autorisez-le dans les réglages du navigateur.",
    noVoice: "Aucune voix détectée. Réessayez en parlant plus fort.",
    noMic: "Aucun micro détecté sur cet appareil.",
    micNetwork: "Réseau indisponible pour la dictée. Vérifiez votre connexion.",
    geoInvalid: "Position invalide. Saisissez l\u2019adresse de départ manuellement.",
    geoImprecise: (m: number) =>
      `Signal GPS trop imprécis (${m} m). Saisissez l\u2019adresse exacte pour éviter une mauvaise prise en charge.`,
    geoIncoherent:
      "Position incohérente avec la zone Charente-Maritime-Maritime. Saisissez l\u2019adresse exacte de départ.",
    detectingAuto: "Détection automatique du départ…",
    locating: "Localisation en cours…",
    approxIp: "Position approximative (via IP) — vous pouvez préciser l'adresse",
    approxDetected: "Position approximative détectée — vérifiez l'adresse de départ",
    gpsDetected: "Position GPS détectée — modifiable si besoin",
    gpsUnavailableIp: "Position GPS indisponible — position approximative via IP.",
    httpsRequired: "La géolocalisation GPS nécessite HTTPS. Saisissez l\u2019adresse exacte de départ.",
    geoNotAvailable: "Géolocalisation non disponible sur cet appareil",
    gpsTimeout: "GPS trop long à répondre. Saisissez l'adresse exacte de départ.",
    approxDetectedRefine: "Position approximative détectée — vous pouvez préciser l'adresse.",
    multiplePlaces: "Plusieurs lieux trouvés — choisissez le bon",
    selectFromList: "Sélectionnez une adresse dans la liste",
    addressNotFound: "Adresse introuvable — précisez la ville ou le lieu",
    distanceEstimated: "Distance estimée (GPS indisponible) — le prix peut être ajusté par le taxi.",
    confirmEmailSent:
      "Un email de confirmation vous a été envoyé. Pensez à vérifier vos spams si vous ne le trouvez pas.",
    backToSite: "Retour au site",
    dictateDestOnly: "Dictez uniquement la destination",
    dictateFullTrip: "Dictez le trajet complet",
    listening: "⏹ J'écoute…",
    dictateDestBtn: "🎤 Destination",
    dictateTripBtn: "🎤 Dicter le trajet",
    departPlaceholder: "Adresse de départ",
    geolocateAria: "Me géolocaliser",
    edit: "Modifier",
    firstNamePh: "Jean",
    lastNamePh: "Dupont",
    emailPh: "jean@exemple.fr",
    hiddenButtonDebug: "Bouton caché",
    listeningLabel: "Je vous écoute…",
    dictateDestinationLabel: "Dictez la destination",
    listeningHintBoth: "Dites votre trajet, ex : « 12 rue de la République à gare d\u2019Angoulême »",
    listeningHintDest: "Dites uniquement votre destination. Touchez « Arrêter » pour valider.",
  },
  en: {
    micDenied: "Microphone access denied. Allow it in your browser settings.",
    noVoice: "No voice detected. Try speaking louder.",
    noMic: "No microphone detected on this device.",
    micNetwork: "Network unavailable for dictation. Check your connection.",
    geoInvalid: "Invalid position. Please enter the pickup address manually.",
    geoImprecise: (m: number) =>
      `GPS signal too imprecise (${m} m). Enter the exact address to avoid a wrong pickup point.`,
    geoIncoherent: "Position inconsistent with the Charente area. Please enter the exact pickup address.",
    detectingAuto: "Automatically detecting pickup location…",
    locating: "Locating…",
    approxIp: "Approximate position (via IP) — you can refine the address",
    approxDetected: "Approximate position detected — please check the pickup address",
    gpsDetected: "GPS position detected — editable if needed",
    gpsUnavailableIp: "GPS position unavailable — approximate position via IP.",
    httpsRequired: "GPS geolocation requires HTTPS. Please enter the exact pickup address.",
    geoNotAvailable: "Geolocation not available on this device",
    gpsTimeout: "GPS took too long to respond. Please enter the exact pickup address.",
    approxDetectedRefine: "Approximate position detected — you can refine the address.",
    multiplePlaces: "Several places found — choose the right one",
    selectFromList: "Select an address from the list",
    addressNotFound: "Address not found — specify the city or place",
    distanceEstimated: "Estimated distance (GPS unavailable) — the price may be adjusted by the driver.",
    confirmEmailSent: "A confirmation email has been sent to you. Please check your spam folder if you can't find it.",
    backToSite: "Back to site",
    dictateDestOnly: "Dictate destination only",
    dictateFullTrip: "Dictate the full trip",
    listening: "⏹ Listening…",
    dictateDestBtn: "🎤 Destination",
    dictateTripBtn: "🎤 Dictate trip",
    departPlaceholder: "Pickup address",
    geolocateAria: "Locate me",
    edit: "Edit",
    firstNamePh: "John",
    lastNamePh: "Doe",
    emailPh: "john@example.com",
    hiddenButtonDebug: "Button hidden",
    listeningLabel: "Listening…",
    dictateDestinationLabel: "Dictate destination",
    listeningHintBoth: "Say your trip, e.g. « 12 rue de la République to Angoulême station »",
    listeningHintDest: "Say only your destination. Tap « Stop » to confirm.",
  },
} as const;

const MAX_AUTO_GEO_ACCURACY_M = 1500;
const MAX_AUTO_GEO_DISTANCE_KM = 130;

interface FormState {
  depart: string;
  destination: string;
  date: string;
  heure: string;
  passagers: number;
  bagages: number;
  paiement: string;
  prenom: string;
  nom: string;
  phone: string;
  email: string;
  message: string;
}

interface OrsResult {
  distanceKm: number;
  dureeS: number;
}

type AddressChoice = {
  label: string;
  coord: [number, number];
  distanceKm: number;
};

function shortLabel(label: string): string {
  const parts = label
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return label;

  // Mots-clés indiquant un nom de lieu (aéroport, gare, hôpital, centre...)
  const isNamedPlace =
    /aéroport|airport|gare|station|hôpital|hopital|clinique|université|universite|centre|stade|mairie|église|eglise|château|chateau|lycée|lycee|école|ecole/i.test(
      parts[0],
    );

  if (isNamedPlace) {
    // Cherche la ville : première partie qui ne contient pas de chiffre et n'est pas un code postal ni une région connue
    const skipWords =
      /gironde|charente|charente-maritime|nouvelle-aquitaine|aquitaine|france|métropolitaine|metropolitaine|département|region|^\d{5}$/i;
    const ville = parts.slice(1).find((p) => !skipWords.test(p) && !/^\d/.test(p));
    return ville ? `${parts[0]}, ${ville}` : parts[0];
  }

  // Adresse classique : rue + ville (ignore code postal, département, région, France)
  const skipWords =
    /gironde|charente|charente-maritime|nouvelle-aquitaine|aquitaine|france|métropolitaine|metropolitaine|^\d{5}$/i;
  const kept = parts.filter((p) => !skipWords.test(p));
  return kept.slice(0, 2).join(", ");
}

function expandAbbreviations(value: string): string {
  return value
    .replace(/\bst\b/gi, "Saint")
    .replace(/\bste\b/gi, "Sainte")
    .replace(/\bav\b/gi, "Avenue")
    .replace(/\bbd\b/gi, "Boulevard")
    .replace(/\bpl\b/gi, "Place");
}

async function geocodeFullAddress(address: string): Promise<{ coord: [number, number]; label: string } | null> {
  const trimmed = expandAbbreviations(address.trim());
  const normalized = normalizeAddressText(trimmed);
  // Court-circuit : si la requête correspond à un lieu canonique connu, on
  // renvoie directement ses coordonnées vérifiées (évite les mauvaises adresses Nominatim).
  const canonical = CANONICAL_PLACES.find((p) => p.match.test(normalized));
  if (canonical) {
    return { coord: canonical.coord, label: canonical.label };
  }
  const parts = trimmed
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const short = parts.slice(0, 2).join(", ");

  // Variantes spécifiques pour les lieux nommés courants
  const namedPlaceVariants: string[] = [];
  if (/aeroport|airport/.test(normalized)) {
    if (/angouleme|cognac|champniers|brie/.test(normalized)) {
      namedPlaceVariants.push("Aéroport d'Angoulême-Cognac, Champniers", "Angouleme Cognac Airport");
    } else if (/bordeaux|merignac|bod/.test(normalized)) {
      namedPlaceVariants.push(
        "Aéroport de Bordeaux-Mérignac",
        "Bordeaux-Mérignac Airport",
        "aéroport Bordeaux Mérignac",
      );
    } else {
      // aéroport d'une autre ville : extraire la ville probable
      const cityToken = normalized
        .replace(/aeroport|airport|de|du|d/g, " ")
        .trim()
        .split(/\s+/)[0];
      if (cityToken && cityToken.length > 2) {
        namedPlaceVariants.push(`aéroport ${cityToken}, France`, `${cityToken} airport, France`);
      }
    }
  }
  if (/gare/.test(normalized)) {
    if (/angouleme/.test(normalized)) {
      namedPlaceVariants.push("Gare d'Angoulême, Charente");
    } else if (/bordeaux|saint.jean/.test(normalized)) {
      namedPlaceVariants.push("Gare de Bordeaux-Saint-Jean");
    } else {
      const cityToken = normalized
        .replace(/gare|de|du|d/g, " ")
        .trim()
        .split(/\s+/)[0];
      if (cityToken && cityToken.length > 2) {
        namedPlaceVariants.push(`gare ${cityToken}, France`);
      }
    }
  }

  // Plusieurs variantes pour maximiser les chances de trouver lieux nommés et adresses
  const attempts = [
    ...namedPlaceVariants, // lieux nommés en priorité
    trimmed,
    trimmed + ", France",
    short,
    short + ", France",
    parts[0] + ", France",
    parts[0] + ", Angoulême, France",
    parts[0] + ", Charente, France",
    parts[0] + ", Charente-Maritime, France",
  ].filter((v, i, arr) => v.length > 2 && arr.indexOf(v) === i);

  for (const query of attempts) {
    const results = await searchAddress(query, 1);
    if (results.length) {
      const r = results[0];
      return { coord: [r.coord[0], r.coord[1]], label: shortLabel(r.label) };
    }
  }
  return null;
}

function distanceKmBetween(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function normalizeAddressText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function usefulSearchTokens(query: string): string[] {
  const skip = new Set([
    "rue",
    "avenue",
    "av",
    "boulevard",
    "bd",
    "route",
    "chemin",
    "place",
    "allee",
    "impasse",
    "cours",
    "de",
    "du",
    "des",
    "la",
    "le",
    "les",
    "d",
    "l",
    "a",
    "au",
    "aux",
    "france",
    "gironde",
  ]);
  return normalizeAddressText(expandAbbreviations(query))
    .split(" ")
    .filter((token) => token.length >= 3 && !skip.has(token))
    .slice(0, 4);
}

function isPlausibleAddressMatch(query: string, label: string): boolean {
  const tokens = usefulSearchTokens(query);
  if (tokens.length === 0) return true;
  const normalizedLabel = normalizeAddressText(label);
  const normalizedQuery = normalizeAddressText(query);
  // Lieux nommés : accepter dès qu'un seul token matche
  const isNamedPlaceQuery =
    /aeroport|airport|gare|station|hopital|clinique|universite|centre|stade|mairie|eglise|chateau|lycee|ecole/.test(
      normalizedQuery,
    );
  const hits = tokens.filter((token) => normalizedLabel.includes(token)).length;
  if (isNamedPlaceQuery) return hits >= 1;
  return hits >= Math.min(2, tokens.length) || normalizedLabel.includes(tokens[0]);
}

function dedupeAddressChoices(choices: AddressChoice[]): AddressChoice[] {
  const seen = new Set<string>();
  return choices.filter((choice) => {
    const key = `${choice.label.toLowerCase()}-${choice.coord[0].toFixed(4)}-${choice.coord[1].toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Configuration des résultats ────────────────────────────────────────────
// Nombre max de suggestions affichées (top N). Configurable selon contexte.
const MAX_CHOICES_DEFAULT = 4;
const MAX_CHOICES_SUPERMARKET = 5; // un peu plus pour comparer plusieurs magasins
const SUPERMARKET_RADIUS_KM = 15; // on resserre pour éviter les magasins trop loin
const SUPERMARKET_MAX_DISTANCE_KM = 25;

// Marques de supermarchés courantes — utilisées pour filtrer les résultats Google par catégorie
// (shop=supermarket) et éliminer les POIs sans rapport (école qui contient « lidl » dans un texte, etc.)
const SUPERMARKET_BRANDS = [
  "aldi",
  "lidl",
  "carrefour",
  "leclerc",
  "auchan",
  "intermarche",
  "intermarché",
  "super u",
  "hyper u",
  "u express",
  "casino",
  "monoprix",
  "franprix",
  "biocoop",
  "grand frais",
  "picard",
  "spar",
  "g20",
  "netto",
  "cora",
  "match",
  "colruyt",
];

function detectSupermarketBrand(query: string): string | null {
  const n = normalizeAddressText(query);
  for (const brand of SUPERMARKET_BRANDS) {
    const nb = normalizeAddressText(brand);
    if (n.includes(nb)) return nb;
  }
  return null;
}

// Lieux canoniques (coordonnées vérifiées) — utilisés en priorité absolue
// quand la requête correspond, pour éviter les mauvaises adresses (cas ambigus de géocodage).
const CANONICAL_PLACES: Array<{
  match: RegExp;
  label: string;
  coord: [number, number]; // [lat, lng]
  subPlaces?: Array<{ label: string; coord: [number, number] }>;
}> = [
  // ── Charente (16) ──────────────────────────────────────────────────────────
  {
    match: /gare.*(angouleme|angoulême)|(angouleme|angoulême).*gare/,
    label: "Gare d'Angoulême, Place de la Gare, 16000 Angoulême",
    coord: [45.6553, 0.1626],
    subPlaces: [
      { label: "Gare d'Angoulême — Parvis / arrêt taxis, 16000 Angoulême", coord: [45.6553, 0.1626] },
      { label: "Gare d'Angoulême — Dépose-minute, 16000 Angoulême", coord: [45.6549, 0.1633] },
    ],
  },
  {
    match:
      /(aeroport|airport).*(angouleme|angoulême|cognac|brie|champniers)|(angouleme|angoulême|cognac).*(aeroport|airport)/,
    label: "Aéroport d'Angoulême-Cognac, 249 Rue Jean Mermoz, 16430 Champniers",
    coord: [45.7291, 0.2205],
  },
  {
    match: /gare.*cognac|cognac.*gare/,
    label: "Gare de Cognac, Place de la Gare, 16100 Cognac",
    coord: [45.6846, -0.3259],
  },
  {
    match: /(hopital|hôpital|chu|ch).*(girac|angouleme|angoulême)|girac/,
    label: "Centre hospitalier d'Angoulême — Girac, 16470 Saint-Michel",
    coord: [45.6353, 0.1197],
  },
  {
    match: /(cite|cité).*(bande dessinee|bande dessinée|bd)|musee.*bande/,
    label: "Cité internationale de la BD, 121 Rue de Bordeaux, 16000 Angoulême",
    coord: [45.6494, 0.1494],
  },
  // ── Charente-Maritime (17) ─────────────────────────────────────────────────
  {
    match: /gare.*(la rochelle|rochelle)|(la rochelle|rochelle).*gare/,
    label: "Gare de La Rochelle-Ville, Boulevard Maréchal Joffre, 17000 La Rochelle",
    coord: [46.1531, -1.1454],
  },
  {
    match: /(aeroport|airport).*(rochelle|ile de re|île de ré)|^lrh$/,
    label: "Aéroport de La Rochelle-Île de Ré, Rue du Jura, 17000 La Rochelle",
    coord: [46.1792, -1.1953],
  },
  {
    match: /gare.*saintes|saintes.*gare/,
    label: "Gare de Saintes, Avenue de la Marne, 17100 Saintes",
    coord: [45.7462, -0.636],
  },
  {
    match: /gare.*rochefort|rochefort.*gare/,
    label: "Gare de Rochefort, Avenue Wilson, 17300 Rochefort",
    coord: [45.9414, -0.9615],
  },
  {
    match: /gare.*royan|royan.*gare/,
    label: "Gare de Royan, Place de la Gare, 17200 Royan",
    coord: [45.6262, -1.0171],
  },
  {
    match: /(zoo|palmyre)/,
    label: "Zoo de La Palmyre, 6 Avenue de Royan, 17570 Les Mathes",
    coord: [45.6939, -1.1774],
  },
  {
    match: /(ile|île).*(oleron|oléron)|oleron|oléron/,
    label: "Île d'Oléron (Saint-Pierre-d'Oléron), 17310",
    coord: [45.9459, -1.3116],
  },
  {
    match: /(ile|île).*(de re|de ré)|saint.martin.de.re/,
    label: "Saint-Martin-de-Ré, Île de Ré, 17410",
    coord: [46.2019, -1.3667],
  },
  // ── Hors département, destinations longue distance fréquentes ──────────────
  {
    match: /(aeroport|airport).*(bordeaux|merignac|bod)|^bod$|merignac.*(aeroport|airport)/,
    label: "Aéroport de Bordeaux-Mérignac (Terminal), 33700 Mérignac",
    coord: [44.8283, -0.7156],
    subPlaces: [
      { label: "Aéroport Bordeaux-Mérignac — Hall A (Départs), 33700 Mérignac", coord: [44.8295, -0.7166] },
      { label: "Aéroport Bordeaux-Mérignac — Hall B (Arrivées), 33700 Mérignac", coord: [44.8281, -0.715] },
      { label: "Aéroport Bordeaux-Mérignac — Terminal Billi (low-cost), 33700 Mérignac", coord: [44.8235, -0.7193] },
    ],
  },
  {
    match: /gare.*(bordeaux|saint.jean|st.jean)|bordeaux.*gare/,
    label: "Gare de Bordeaux-Saint-Jean, Rue Charles Domercq, 33800 Bordeaux",
    coord: [44.8259, -0.5564],
  },
  {
    match: /futuroscope/,
    label: "Futuroscope, Avenue René Monory, 86360 Chasseneuil-du-Poitou",
    coord: [46.6704, 0.3701],
  },
  {
    match: /gare.*poitiers|poitiers.*gare/,
    label: "Gare de Poitiers, Boulevard du Grand Cerf, 86000 Poitiers",
    coord: [46.5822, 0.3333],
  },
  {
    match: /gare.*niort|niort.*gare/,
    label: "Gare de Niort, Rue Mazagran, 79000 Niort",
    coord: [46.3175, -0.4626],
  },
];

function findCanonicalPlace(query: string, origin: [number, number]): AddressChoice | null {
  const n = normalizeAddressText(expandAbbreviations(query));
  for (const p of CANONICAL_PLACES) {
    if (p.match.test(n)) {
      return { label: p.label, coord: p.coord, distanceKm: distanceKmBetween(origin, p.coord) };
    }
  }
  return null;
}

function findCanonicalSubPlaces(query: string, origin: [number, number]): AddressChoice[] | null {
  const n = normalizeAddressText(expandAbbreviations(query));
  for (const p of CANONICAL_PLACES) {
    if (p.match.test(n) && p.subPlaces && p.subPlaces.length > 0) {
      return p.subPlaces.map((s) => ({
        label: s.label,
        coord: s.coord,
        distanceKm: distanceKmBetween(origin, s.coord),
      }));
    }
  }
  return null;
}

// ─── Cache des recherches récentes (5 min, par requête + origine arrondie) ───
type CachedChoices = { ts: number; choices: AddressChoice[] };
const CHOICES_CACHE = new Map<string, CachedChoices>();
const CHOICES_CACHE_TTL_MS = 5 * 60 * 1000;
const CHOICES_CACHE_MAX = 80;

function buildCacheKey(query: string, origin: [number, number], radiusKm: number): string {
  return `${normalizeAddressText(query)}|${origin[0].toFixed(2)},${origin[1].toFixed(2)}|${radiusKm}`;
}
function readCache(key: string): AddressChoice[] | null {
  const hit = CHOICES_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CHOICES_CACHE_TTL_MS) {
    CHOICES_CACHE.delete(key);
    return null;
  }
  return hit.choices;
}
function writeCache(key: string, choices: AddressChoice[]) {
  if (CHOICES_CACHE.size >= CHOICES_CACHE_MAX) {
    const oldest = CHOICES_CACHE.keys().next().value;
    if (oldest) CHOICES_CACHE.delete(oldest);
  }
  CHOICES_CACHE.set(key, { ts: Date.now(), choices });
}

function rankAndTrim(
  query: string,
  origin: [number, number],
  buckets: AddressChoice[],
  canonical: AddressChoice | null,
  maxChoices: number = MAX_CHOICES_DEFAULT,
): AddressChoice[] {
  const tokens = usefulSearchTokens(query);
  const brand = detectSupermarketBrand(query);
  let pool = dedupeAddressChoices([...(canonical ? [canonical] : []), ...buckets]).filter((choice) =>
    isPlausibleAddressMatch(query, choice.label),
  );

  if (brand) {
    // Filtrage strict supermarchés : on ne garde que les libellés dont le NOM (avant " — ")
    // commence par la marque. Cela écarte les rues/lieux contenant le mot par hasard
    // (« Rue Aldi », école « Lidl Center », etc.) renvoyés par le géocodage.
    const nb = brand;
    pool = pool.filter((choice) => {
      const head = normalizeAddressText(choice.label.split("—")[0] ?? choice.label);
      return head.startsWith(nb) || head.split(" ").slice(0, 3).join(" ").includes(nb);
    });
    // Limite stricte de distance pour supermarchés
    pool = pool.filter((c) => c.distanceKm <= SUPERMARKET_MAX_DISTANCE_KM);
  }

  const all = pool.sort((a, b) => {
    const aLabel = normalizeAddressText(a.label);
    const bLabel = normalizeAddressText(b.label);
    const aHits = tokens.filter((token) => aLabel.includes(token)).length;
    const bHits = tokens.filter((token) => bLabel.includes(token)).length;
    const aBucket = Math.round(a.distanceKm / 2);
    const bBucket = Math.round(b.distanceKm / 2);
    return aBucket - bBucket || bHits - aHits || a.distanceKm - b.distanceKm;
  });

  const limit = brand ? Math.min(maxChoices, MAX_CHOICES_SUPERMARKET) : maxChoices;
  if (canonical) {
    const others = all.filter((c) => c.label !== canonical.label);
    return [canonical, ...others].slice(0, limit);
  }
  return all.slice(0, limit);
}

async function searchNearbyAddressChoices(
  query: string,
  origin: [number, number],
  radiusKm = 20,
): Promise<AddressChoice[]> {
  const key = buildCacheKey(query, origin, radiusKm);
  const cached = readCache(key);
  if (cached) return cached;

  const normalizedQ = normalizeAddressText(query);
  const extraVariants: string[] = [];
  if (/aeroport|airport/.test(normalizedQ) && /angouleme|cognac|champniers/.test(normalizedQ)) {
    extraVariants.push("Aéroport d'Angoulême-Cognac", "Angouleme Cognac Airport");
  }
  if (/aeroport|airport/.test(normalizedQ) && /rochelle|ile de re/.test(normalizedQ)) {
    extraVariants.push("Aéroport de La Rochelle-Île de Ré", "La Rochelle Airport");
  }
  if (/aeroport|airport/.test(normalizedQ) && /bordeaux|merignac|bod/.test(normalizedQ)) {
    extraVariants.push("Aéroport de Bordeaux-Mérignac", "Bordeaux-Mérignac Airport", "BOD Bordeaux");
  }
  if (/gare/.test(normalizedQ) && /angouleme|charente/.test(normalizedQ)) {
    extraVariants.push("Gare d'Angoulême", "Gare Angoulême Charente");
  }
  if (/gare/.test(normalizedQ) && /saint.jean|st.jean|bordeaux/.test(normalizedQ)) {
    extraVariants.push("Gare de Bordeaux-Saint-Jean", "Gare Saint Jean Bordeaux");
  }
  const variants = [...new Set([query, `${query}, Charente`, `${query}, Charente-Maritime`, ...extraVariants])];
  const groups = await Promise.all(variants.map((v) => searchAddress(v, 6).catch(() => [])));
  const googleChoices = groups.flat().map((item) => ({
    label: shortLabel(item.label),
    coord: item.coord,
    distanceKm: distanceKmBetween(origin, item.coord),
  }));
  const canonical = findCanonicalPlace(query, origin);
  const result = rankAndTrim(query, origin, googleChoices, canonical);
  writeCache(key, result);
  return result;
}

// Version streaming : émet le résultat canonique immédiatement, puis les résultats Google dès qu'ils arrivent.
async function searchNearbyAddressChoicesStreaming(
  query: string,
  origin: [number, number],
  radiusKm: number,
  onPartial: (choices: AddressChoice[], done: boolean) => void,
): Promise<AddressChoice[]> {
  const key = buildCacheKey(query, origin, radiusKm);
  const cached = readCache(key);
  if (cached) {
    onPartial(cached, true);
    return cached;
  }

  const canonical = findCanonicalPlace(query, origin);

  // 0) Canonical immédiat
  if (canonical) onPartial(rankAndTrim(query, origin, [], canonical), false);

  const normalizedQ = normalizeAddressText(query);
  const extraVariants: string[] = [];
  if (/aeroport|airport/.test(normalizedQ) && /angouleme|cognac|champniers/.test(normalizedQ)) {
    extraVariants.push("Aéroport d'Angoulême-Cognac", "Angouleme Cognac Airport");
  }
  if (/aeroport|airport/.test(normalizedQ) && /rochelle|ile de re/.test(normalizedQ)) {
    extraVariants.push("Aéroport de La Rochelle-Île de Ré", "La Rochelle Airport");
  }
  if (/aeroport|airport/.test(normalizedQ) && /bordeaux|merignac|bod/.test(normalizedQ)) {
    extraVariants.push("Aéroport de Bordeaux-Mérignac", "Bordeaux-Mérignac Airport", "BOD Bordeaux");
  }
  if (/gare/.test(normalizedQ) && /angouleme|charente/.test(normalizedQ)) {
    extraVariants.push("Gare d'Angoulême", "Gare Angoulême Charente");
  }
  if (/gare/.test(normalizedQ) && /saint.jean|st.jean|bordeaux/.test(normalizedQ)) {
    extraVariants.push("Gare de Bordeaux-Saint-Jean", "Gare Saint Jean Bordeaux");
  }
  const variants = [...new Set([query, `${query}, Charente`, `${query}, Charente-Maritime`, ...extraVariants])];

  const groups = await Promise.all(variants.map((v) => searchAddress(v, 6).catch(() => [])));
  const googleChoices = groups.flat().map((item) => ({
    label: shortLabel(item.label),
    coord: item.coord,
    distanceKm: distanceKmBetween(origin, item.coord),
  }));

  const result = rankAndTrim(query, origin, googleChoices, canonical);
  writeCache(key, result);
  onPartial(result, true);
  return result;
}

function requestBrowserPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function getAutoGeoRejectionReason(pos: GeolocationPosition, lang: Lang, allowApproximate = false): string | null {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(accuracy)) {
    return lang === "en" ? UI.en.geoInvalid : UI.fr.geoInvalid;
  }
  if (!allowApproximate && accuracy > MAX_AUTO_GEO_ACCURACY_M) {
    return lang === "en" ? UI.en.geoImprecise(Math.round(accuracy)) : UI.fr.geoImprecise(Math.round(accuracy));
  }
  const distanceFromCenter = distanceKmBetween(SERVICE_CENTER, [lat, lng]);
  if (distanceFromCenter > MAX_AUTO_GEO_DISTANCE_KM) {
    return lang === "en" ? UI.en.geoIncoherent : UI.fr.geoIncoherent;
  }
  return null;
}

// ─── Fallback géolocalisation IP (si le GPS du navigateur échoue) ───────────
async function ipGeolocate(): Promise<{ lat: number; lng: number } | null> {
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

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "13px 16px",
  borderRadius: 10,
  border: `1.5px solid ${hasError ? "#dc2626" : "#e2d9c8"}`,
  fontSize: 16,
  background: hasError ? "#fff5f5" : "#faf9f7",
  color: "#1a1209",
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  boxSizing: "border-box",
  minHeight: 48,
  transition: "border-color 0.15s",
});

/**
 * Construit un ISO string avec l'offset réel Europe/Paris
 * à partir d'une date "YYYY-MM-DD" et d'une heure "HH:MM".
 * Évite la confusion UTC / local qui fausse les calculs nuit et mixte.
 */
function toParisIso(date: string, heure: string): string {
  // On forge directement un ISO en heure locale Paris en cherchant le bon offset UTC.
  // Principe : on cherche l'offset réel de Europe/Paris pour ce moment précis,
  // sans passer par le fuseau du navigateur qui peut être différent.
  const [h, m] = heure.split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  // Estimation initiale : UTC = heure Paris - 2h (été) ou -1h (hiver)
  // On itère pour trouver l'offset exact
  for (const guessOffset of [120, 60, 0]) {
    const utcMs = Date.UTC(y, mo - 1, d, h - Math.floor(guessOffset / 60), m - (guessOffset % 60));
    const check = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date(utcMs));
    const hPart = check.find((p) => p.type === "hour");
    const mPart = check.find((p) => p.type === "minute");
    const hVal = hPart ? parseInt(hPart.value, 10) : -1;
    const mVal = mPart ? parseInt(mPart.value, 10) : -1;
    if (hVal === h && mVal === m) {
      const sign = guessOffset >= 0 ? "+" : "-";
      const absMin = Math.abs(guessOffset);
      const hh = String(Math.floor(absMin / 60)).padStart(2, "0");
      const mm = String(absMin % 60).padStart(2, "0");
      return `${date}T${heure}:00${sign}${hh}:${mm}`;
    }
  }
  // Fallback ultime : ISO sans offset (heure locale navigateur)
  return `${date}T${heure}:00`;
}

function ReservationPage() {
  const navigate = useNavigate();
  // GA4 : début du tunnel de réservation
  useEffect(() => {
    gaEvent("reservation_start", { page: "/reserver" });
  }, []);

  const [today, setToday] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [isSubscribedToNotifs, setIsSubscribedToNotifs] = useState(false);
  const { status: hookStatus, subscribe: subscribePush } = usePushNotifications();
  const repairClientPushRegistration = useServerFn(subscribePushServer);
  // Force à "idle" pour client — on ne veut pas d'auto-subscription
  const pushStatus: string = hookStatus;

  const [fromCoord, setFromCoord] = useState<[number, number] | null>(null);
  const [toCoord, setToCoord] = useState<[number, number] | null>(null);
  const [orsResult, setOrsResult] = useState<OrsResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [geolocLoading, setGeolocLoading] = useState(false);
  // Indicateur visible du statut géoloc client : idle | hint | loading | success | denied | ip | error
  type GeolocStatus = "idle" | "hint" | "loading" | "success" | "denied" | "ip" | "error";
  const [geolocStatus, setGeolocStatus] = useState<GeolocStatus>("idle");
  const [geolocStatusMsg, setGeolocStatusMsg] = useState<string>("");
  const [taxiAvailable, setTaxiAvailable] = useState<boolean | null>(null);
  const [departChoices, setDepartChoices] = useState<AddressChoice[]>([]);
  const [searchingDepart, setSearchingDepart] = useState(false);
  const [searchingDestination, setSearchingDestination] = useState(false);
  const departDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceBothListening, setVoiceBothListening] = useState(false);
  const voiceRecogRef = useRef<any>(null);
  const voiceBothRecogRef = useRef<any>(null);
  const resolveDestinationAddressRef = useRef<(() => void) | null>(null);
  const resolveDepartAddressRef = useRef<(() => void) | null>(null);
  // Quand la géoloc (ou un choix de liste) pose directement label+coord,
  // on veut empêcher le prochain onBlur/debounce de relancer resolveDepartAddress
  // et de reset fromCoord à null. Ce flag neutralise un seul appel.
  const skipNextDepartResolveRef = useRef(false);
  // true quand le champ destination est en focus — empêche d'écraser le texte en cours de saisie
  const destinationFocusedRef = useRef(false);

  const startVoiceRecognition = useCallback(async () => {
    if (voiceRecogRef.current) {
      try {
        voiceRecogRef.current.stop();
      } catch {
        /* noop */
      }
      voiceRecogRef.current = null;
      setVoiceListening(false);
      return;
    }
    const access = await ensureMicAccess();
    if (!access.ok) {
      toast.error(access.reason, { duration: 7000 });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error(
        lang === "en"
          ? "Voice input is not supported by this browser — please type your addresses."
          : "La saisie vocale n'est pas supportée par ce navigateur — saisissez vos adresses au clavier.",
        { duration: 7000 },
      );
      return;
    }
    gaEvent("reservation_voice_start");
    const recog = new SR();
    recog.lang = lang === "en" ? "en-GB" : "fr-FR";
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart = () => setVoiceListening(true);
    recog.onend = () => {
      setVoiceListening(false);
      voiceRecogRef.current = null;
    };
    recog.onerror = (e: any) => {
      setVoiceListening(false);
      voiceRecogRef.current = null;
      const code = e?.error as string | undefined;
      if (code === "not-allowed" || code === "service-not-allowed") {
        toast.error(lang === "en" ? UI.en.micDenied : UI.fr.micDenied, { duration: 6000 });
      } else if (code === "no-speech") {
        toast.info(lang === "en" ? UI.en.noVoice : UI.fr.noVoice);
      } else if (code === "audio-capture") {
        toast.error(lang === "en" ? UI.en.noMic : UI.fr.noMic);
      } else if (code === "network") {
        toast.error(lang === "en" ? UI.en.micNetwork : UI.fr.micNetwork);
      }
    };
    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      set("destination", transcript);
      setToCoord(null);
      // Déclencher la résolution d'adresse après un court délai
      setTimeout(() => resolveDestinationAddressRef.current?.(), 300);
    };
    voiceRecogRef.current = recog;
    try {
      recog.start();
    } catch {
      setVoiceListening(false);
      voiceRecogRef.current = null;
    }
  }, []);

  // Reconnaissance vocale "départ + destination" en une seule phrase.
  // Détecte des séparateurs courants : "à", "vers", "jusqu'à", "destination",
  // "direction", "puis", "et", "->".
  const startVoiceRecognitionBoth = useCallback(async () => {
    if (voiceBothRecogRef.current) {
      try {
        voiceBothRecogRef.current.stop();
      } catch {
        /* noop */
      }
      voiceBothRecogRef.current = null;
      setVoiceBothListening(false);
      return;
    }
    const access = await ensureMicAccess();
    if (!access.ok) {
      toast.error(access.reason, { duration: 7000 });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error(
        lang === "en"
          ? "Voice input is not supported by this browser — please type your addresses."
          : "La saisie vocale n'est pas supportée par ce navigateur — saisissez vos adresses au clavier.",
        { duration: 7000 },
      );
      return;
    }
    gaEvent("reservation_voice_start");
    const recog = new SR();
    recog.lang = lang === "en" ? "en-GB" : "fr-FR";
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart = () => setVoiceBothListening(true);
    recog.onend = () => {
      setVoiceBothListening(false);
      voiceBothRecogRef.current = null;
    };
    recog.onerror = (e: any) => {
      setVoiceBothListening(false);
      voiceBothRecogRef.current = null;
      const code = e?.error as string | undefined;
      if (code === "not-allowed" || code === "service-not-allowed") {
        toast.error(lang === "en" ? UI.en.micDenied : UI.fr.micDenied, { duration: 6000 });
      } else if (code === "no-speech") {
        toast.info(lang === "en" ? UI.en.noVoice : UI.fr.noVoice);
      } else if (code === "audio-capture") {
        toast.error(lang === "en" ? UI.en.noMic : UI.fr.noMic);
      } else if (code === "network") {
        toast.error(lang === "en" ? UI.en.micNetwork : UI.fr.micNetwork);
      }
    };
    recog.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      const raw = transcript.trim();
      let depart = "";
      let destination = "";

      // ── Stratégie 1 : "départ [X] destination [Y]" ou "de [X] à [Y]" ──
      // Cherche un mot-clé de départ EN DÉBUT de phrase (accent optionnel)
      const departPrefixMatch = raw.match(/^(?:de|depuis|du|d'|partir de|d[ée]part[:\s]?)\s+(.+)/i);
      const cleanedWithDepart = departPrefixMatch ? departPrefixMatch[1] : raw;

      // Séparateurs destination (accent optionnel sur "destination" déjà ok)
      const destSepRegex =
        /\s+(?:jusqu'?[àa]|jusque?|destination[:\s]?|direction|vers|puis|->|=>|à destination de|arriv[ée]e?[:\s]?)\s+/i;

      // Séparateurs départ (quand les deux mots-clés sont dans la phrase)
      const destParts = cleanedWithDepart.split(destSepRegex);

      if (destParts.length >= 2) {
        // Le premier morceau avant le séparateur destination = départ
        depart = destParts[0].trim();
        destination = destParts.slice(1).join(" ").trim();
      } else {
        // ── Stratégie 2 : pas de séparateur destination → cherche "départ" au milieu
        const midDepartMatch = raw.match(
          /^(.+?)\s+(?:d[ée]part|depuis|de chez)\s+(.+?)(?:\s+(?:destination|vers|à|jusqu'?[àa])\s+(.+))?$/i,
        );
        if (midDepartMatch && midDepartMatch[3]) {
          depart = midDepartMatch[2].trim();
          destination = midDepartMatch[3].trim();
        } else {
          // ── Stratégie 3 : fallback " à " / " vers " simple (sans préfixe)
          const lower = raw.toLowerCase();
          let sepIdx = -1;
          let sepLen = 0;
          for (const sep of [" vers ", " jusqu'à ", " jusqu'a ", " à ", " a "]) {
            const i = lower.lastIndexOf(sep);
            if (i > 0) {
              sepIdx = i;
              sepLen = sep.length;
              break;
            }
          }
          if (sepIdx > 0) {
            depart = raw.slice(0, sepIdx).trim();
            destination = raw.slice(sepIdx + sepLen).trim();
          } else {
            // Aucun séparateur trouvé → tout en destination (comportement original)
            destination = raw;
          }
        }
      }

      if (depart) {
        set("depart", depart);
        setFromCoord(null);
        setDepartChoices([]);
      }
      if (destination) {
        set("destination", destination);
        setToCoord(null);
      }
      // Résolution séquentielle : départ d'abord (sert d'origine), puis destination.
      setTimeout(() => {
        if (depart) resolveDepartAddressRef.current?.();
        setTimeout(() => resolveDestinationAddressRef.current?.(), 600);
      }, 200);
    };
    voiceBothRecogRef.current = recog;
    try {
      recog.start();
    } catch {
      setVoiceBothListening(false);
      voiceBothRecogRef.current = null;
    }
  }, []);

  const [f, setF] = useState<FormState>(() => {
    // Pré-remplir depuis les query params (?depart=...&destination=...&passagers=N)
    // Ex: venant de "Réserver le même trajet" depuis suivi.$id
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const passagersParam = parseInt(params?.get("passagers") ?? "1", 10);
    return {
      depart: params?.get("depart") ?? "",
      destination: params?.get("destination") ?? "",
      date: "",
      heure: "",
      passagers: Number.isFinite(passagersParam) && passagersParam >= 1 && passagersParam <= 6 ? passagersParam : 1,
      bagages: 0,
      paiement: "cb",
      prenom: "",
      nom: "",
      phone: "",
      email: "",
      message: "",
    };
  });

  const set = (k: keyof FormState, v: any) => setF((p) => ({ ...p, [k]: v }));

  // Résoudre automatiquement les adresses pré-remplies via query params
  useEffect(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    if (!params?.get("depart") && !params?.get("destination")) return;
    const timer = setTimeout(() => {
      if (params?.get("depart")) resolveDepartAddressRef.current?.();
      if (params?.get("destination")) setTimeout(() => resolveDestinationAddressRef.current?.(), 600);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Langue synchronisée avec le sélecteur global du site (I18nProvider) :
  // le formulaire ne garde plus un état isolé qui restait en français.
  const { lang, setLang } = useI18n();
  const d = DICTS[lang];
  const t = (k: string) => d[k] ?? DICTS["fr"][k] ?? k;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const u = lang === "en" ? UI.en : UI.fr;

  const pickupIso = f.date && f.heure ? toParisIso(f.date, f.heure) : null;

  // ── Tarification Paris : règle unique demandée
  //    7h-19h = Jour, 19h-7h = Nuit, dimanche/jour férié = Nuit, toujours en heure Europe/Paris. ──
  function getTarifMotif(iso: string | null): { isJour: boolean; label: string; motif: string } {
    const en = lang === "en";
    const dayLabel = en ? "Day rate" : "Tarif jour";
    const nightLabel = en ? "Night rate" : "Tarif nuit";
    const parisTime = en ? "Paris time" : "Heure de Paris";
    if (!iso) return { isJour: true, label: dayLabel, motif: parisTime };
    const p = partsParis(iso);
    if (p.weekday === "Sun") return { isJour: false, label: nightLabel, motif: en ? "Sunday" : "Dimanche" };
    if (estJourFerieFR(p.year, p.month, p.day))
      return { isJour: false, label: nightLabel, motif: en ? "Public holiday" : "Jour férié" };
    const hStr = en
      ? `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`
      : `${p.hour}h${String(p.minute).padStart(2, "0")}`;
    const h = p.hour + p.minute / 60;
    if (h >= 19 || h < 7) return { isJour: false, label: nightLabel, motif: `${parisTime} (${hStr})` };
    return { isJour: true, label: dayLabel, motif: `${parisTime} (${hStr})` };
  }

  const TARIF_JOUR_KM = 2.16;
  const TARIF_NUIT_KM = 3.24;
  const PRISE = 2.83;

  // Détail du calcul mixte : prorata jour/nuit minute par minute.
  function detailMixte(distKm: number, pickupMs: number, dureeS: number) {
    if (distKm <= 0) {
      return { jourKm: 0, nuitKm: 0, jourMin: 0, nuitMin: 0, pctJour: 0, pctNuit: 0, total: PRISE };
    }
    const steps = Math.max(Math.round(dureeS / 60), 1);
    const stepMs = (dureeS * 1000) / steps;
    const stepMin = stepMs / 60000;
    const frac = distKm / steps;
    let jourKm = 0,
      nuitKm = 0,
      jourMin = 0,
      nuitMin = 0;
    for (let i = 0; i < steps; i++) {
      const iso = new Date(pickupMs + i * stepMs).toISOString();
      if (estTarifJourParis(iso)) {
        jourKm += frac;
        jourMin += stepMin;
      } else {
        nuitKm += frac;
        nuitMin += stepMin;
      }
    }
    const total = parseFloat((PRISE + jourKm * TARIF_JOUR_KM + nuitKm * TARIF_NUIT_KM).toFixed(2));
    const pctJour = Math.round((jourKm / distKm) * 100);
    const pctNuit = 100 - pctJour;
    return { jourKm, nuitKm, jourMin, nuitMin, pctJour, pctNuit, total };
  }

  function calculerPrixMixteLocal(distKm: number, pickupMs: number, dureeS: number): number {
    return detailMixte(distKm, pickupMs, dureeS).total;
  }

  const tarifInfo = getTarifMotif(pickupIso);
  const tarifJour = tarifInfo.isJour;

  const detailCalc =
    orsResult && pickupIso ? detailMixte(orsResult.distanceKm, new Date(pickupIso).getTime(), orsResult.dureeS) : null;

  const prixAller: number = (() => {
    if (!orsResult) return PRISE_EN_CHARGE;
    const raw = detailCalc ? detailCalc.total : calculerPrix(orsResult.distanceKm, true);
    const MAX_PRIX = 2000;
    return raw > MAX_PRIX ? PRISE_EN_CHARGE : raw;
  })();

  useEffect(() => {
    const d = new Date().toISOString().split("T")[0];
    setToday(d);
    setF((p) => ({ ...p, date: p.date || d }));
  }, []);

  // ── Carte supprimée ──────────────────────────────────────────────────────

  // ── Google Directions : recalcul distance/prix ─────────────────────────────
  useEffect(() => {
    if (!fromCoord || !toCoord) {
      setOrsResult(null);
      return;
    }
    setCalcLoading(true);

    const fetchRoute = async () => {
      try {
        const r = await getDistanceAndDurationKm([fromCoord[1], fromCoord[0]], [toCoord[1], toCoord[0]]);
        if (r && r.distanceKm > 0 && r.dureeS > 0) {
          setOrsResult({
            distanceKm: parseFloat(r.distanceKm.toFixed(2)),
            dureeS: roundSecondsToMinute(r.dureeS),
          });
          setCalcLoading(false);
          return;
        }
      } catch {
        // ignore, setCalcLoading(false) ci-dessous
      }
      setCalcLoading(false);
    };

    fetchRoute();
  }, [fromCoord, toCoord]);

  // ── Géolocalisation départ (navigateur client) ───────────────────────────
  const handleGeolocate = useCallback((options?: { automatic?: boolean }) => {
    const automatic = options?.automatic === true;
    setGeolocLoading(true);
    setGeolocStatus("loading");
    setGeolocStatusMsg(
      automatic
        ? lang === "en"
          ? UI.en.detectingAuto
          : UI.fr.detectingAuto
        : lang === "en"
          ? UI.en.locating
          : UI.fr.locating,
    );

    const applyPosition = async (lat: number, lng: number, source: "gps" | "approx" | "ip" = "gps") => {
      let adresse = await reverseGeocode(lat, lng).catch(() => null);
      if (!adresse) {
        const fallback = await searchAddress(`${lat}, ${lng}`, 1).catch(() => []);
        adresse = fallback[0]?.label ?? null;
      }
      if (departDebounceRef.current) clearTimeout(departDebounceRef.current);
      skipNextDepartResolveRef.current = true;
      set("depart", adresse ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setFromCoord([lat, lng]);
      setDepartChoices([]);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.depart;
        return next;
      });
      if (source === "ip" || source === "approx") {
        setGeolocStatus("ip");
        setGeolocStatusMsg(
          source === "ip"
            ? lang === "en"
              ? UI.en.approxIp
              : UI.fr.approxIp
            : lang === "en"
              ? UI.en.approxDetected
              : UI.fr.approxDetected,
        );
      } else {
        setGeolocStatus("success");
        setGeolocStatusMsg(lang === "en" ? UI.en.gpsDetected : UI.fr.gpsDetected);
      }
      if (!automatic || source === "gps") toast.success(t("res.geo.btn") + " ✓");
      setGeolocLoading(false);
    };

    const rejectAutoPosition = (message: string, kind: GeolocStatus = "error") => {
      setGeolocLoading(false);
      // Ne pas effacer une coordonnée déjà fiable : l'utilisateur peut corriger
      // l'adresse texte sans perdre le centrage carte/la réservation.
      setErrors((prev) => ({ ...prev, depart: message }));
      setGeolocStatus(kind);
      setGeolocStatusMsg(message);
      toast.error(message);
    };

    const tryIpFallback = async (fallbackMessage: string, fallbackKind: GeolocStatus = "error") => {
      const ip = await ipGeolocate();
      if (ip) {
        const distanceFromCenter = distanceKmBetween(SERVICE_CENTER, [ip.lat, ip.lng]);
        if (distanceFromCenter <= MAX_AUTO_GEO_DISTANCE_KM) {
          if (!automatic) toast.info(lang === "en" ? UI.en.gpsUnavailableIp : UI.fr.gpsUnavailableIp);
          await applyPosition(ip.lat, ip.lng, "ip");
          return;
        }
      }
      rejectAutoPosition(fallbackMessage, fallbackKind);
    };

    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      void tryIpFallback(lang === "en" ? UI.en.httpsRequired : UI.fr.httpsRequired);
      return;
    }

    if (!navigator.geolocation) {
      void tryIpFallback(lang === "en" ? UI.en.geoNotAvailable : UI.fr.geoNotAvailable);
      return;
    }

    const geoErrorMessage = (err?: GeolocationPositionError) => {
      if (!err) {
        return lang === "en" ? UI.en.gpsTimeout : UI.fr.gpsTimeout;
      }
      return describeGeoError(err);
    };

    const isDenied = (err: any) => err && typeof err === "object" && "code" in err && err.code === 1; // PERMISSION_DENIED

    // IMPORTANT iOS/Safari : `navigator.geolocation.getCurrentPosition` DOIT être appelé
    // synchroniquement dans le contexte du geste utilisateur, sinon le prompt de permission
    // n'apparaît jamais et le call timeout silencieusement. On ouvre donc la requête GPS ici,
    // puis on chaîne les fallbacks via callbacks (pas d'await avant getCurrentPosition).
    const onFirstSuccess = (precise: GeolocationPosition) => {
      const reason = getAutoGeoRejectionReason(precise, lang, true);
      if (reason) {
        void tryIpFallback(reason);
        return;
      }
      const source = precise.coords.accuracy > MAX_AUTO_GEO_ACCURACY_M ? "approx" : "gps";
      void applyPosition(precise.coords.latitude, precise.coords.longitude, source);
    };

    const onFirstError = (firstErr: GeolocationPositionError) => {
      if (isDenied(firstErr)) {
        void tryIpFallback(geoErrorMessage(firstErr), "denied");
        return;
      }
      // Retry rapide avec cache autorisé — ré-invoqué dans le même tick, gesture toujours valide via la permission accordée précédemment.
      navigator.geolocation.getCurrentPosition(
        (cached) => {
          const reason = getAutoGeoRejectionReason(cached, lang, true);
          if (reason) {
            void tryIpFallback(reason);
            return;
          }
          if (!automatic) toast.info(lang === "en" ? UI.en.approxDetectedRefine : UI.fr.approxDetectedRefine);
          const source = cached.coords.accuracy > MAX_AUTO_GEO_ACCURACY_M ? "approx" : "gps";
          void applyPosition(cached.coords.latitude, cached.coords.longitude, source);
        },
        (secondErr) => {
          const err = (secondErr || firstErr) as GeolocationPositionError;
          void tryIpFallback(geoErrorMessage(err), isDenied(err) ? "denied" : "error");
        },
        { enableHighAccuracy: false, maximumAge: 120000, timeout: 8000 },
      );
    };

    navigator.geolocation.getCurrentPosition(onFirstSuccess, onFirstError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 18000,
    });
  }, []);

  // ── Auto-géoloc au chargement (départ vide, une seule fois par montage) ──
  // Pas de table ni d'Edge Function nécessaire : la position vient du navigateur,
  // puis fallback IP si le GPS est refusé/indisponible.
  const autoGeolocTriedRef = useRef(false);
  useEffect(() => {
    if (autoGeolocTriedRef.current) return;
    if (typeof window === "undefined") return;
    if (f.depart.trim().length > 0) return; // déjà rempli (query param ou autre)
    if (geolocLoading) return;
    autoGeolocTriedRef.current = true;
    const timer = window.setTimeout(() => handleGeolocate({ automatic: true }), 350);
    return () => window.clearTimeout(timer);
  }, [f.depart, geolocLoading, handleGeolocate]);

  // ── Résoudre adresse départ (saisie manuelle) ────────────────────────────
  const resolveDepartAddress = useCallback(async () => {
    // Géoloc vient de poser l'adresse directement — on saute ce resolve
    if (skipNextDepartResolveRef.current) {
      skipNextDepartResolveRef.current = false;
      return;
    }
    const value = f.depart.trim();
    if (!value) return;
    setCalcLoading(true);
    setSearchingDepart(true);
    const origin = fromCoord ?? SERVICE_CENTER;
    const namedPlace = isNamedPlaceQuery(value);

    const canonical = findCanonicalPlace(value, origin);
    if (canonical) {
      setCalcLoading(false);
      setSearchingDepart(false);
      setDepartChoices([]);
      setFromCoord(canonical.coord);
      set("depart", canonical.label);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.depart;
        return next;
      });
      return;
    }

    if (namedPlace) {
      const nearby = await searchNearbyAddressChoicesStreaming(value, origin, 200, (partial) => {
        const close = partial.slice(0, 4);
        if (close.length) setDepartChoices(close);
      });
      const close = nearby;
      if (close.length === 1 || (close.length > 1 && close[0].distanceKm + 5 < close[1].distanceKm)) {
        setCalcLoading(false);
        setSearchingDepart(false);
        setDepartChoices([]);
        setFromCoord(close[0].coord);
        set("depart", close[0].label);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.depart;
          return next;
        });
        return;
      }
      if (close.length > 1) {
        setCalcLoading(false);
        setSearchingDepart(false);
        setDepartChoices(close.slice(0, 4));
        setFromCoord(null);
        setErrors((prev) => ({ ...prev, depart: lang === "en" ? UI.en.multiplePlaces : UI.fr.multiplePlaces }));
        return;
      }
    }

    const result = await geocodeFullAddress(value);
    if (result) {
      if (result.coord) {
        setCalcLoading(false);
        setSearchingDepart(false);
        setDepartChoices([]);
        setFromCoord(result.coord);
        set("depart", result.label);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.depart;
          return next;
        });
        return;
      }
    }

    const nearbyChoices = await searchNearbyAddressChoicesStreaming(value, origin, 200, (partial) => {
      const close = partial.slice(0, 4);
      if (close.length) setDepartChoices(close);
    });
    const closeChoices = nearbyChoices.slice(0, 4);
    setCalcLoading(false);
    setSearchingDepart(false);

    if (closeChoices.length) {
      setDepartChoices(closeChoices);
      setFromCoord(null);
      setErrors((prev) => ({ ...prev, depart: lang === "en" ? UI.en.selectFromList : UI.fr.selectFromList }));
    } else {
      setDepartChoices([]);
      setFromCoord(null);
      setErrors((prev) => ({ ...prev, depart: lang === "en" ? UI.en.addressNotFound : UI.fr.addressNotFound }));
    }
  }, [f.depart, fromCoord]);

  // ── Résoudre adresse destination ─────────────────────────────────────────
  const resolveDestinationAddress = useCallback(async () => {
    const value = f.destination.trim();
    if (!value) return;
    setCalcLoading(true);
    setSearchingDestination(true);

    // Si le départ est saisi mais fromCoord pas encore résolu (l'utilisateur
    // a sauté directement au champ destination avant que resolveDepartAddress finisse),
    // on le résout maintenant nous-mêmes pour avoir un fromCoord à jour.
    let resolvedFromCoord = fromCoord;
    if (f.depart.trim() && !fromCoord) {
      const departResult = await geocodeFullAddress(f.depart.trim());
      if (departResult) {
        resolvedFromCoord = departResult.coord;
        setFromCoord(departResult.coord);
        set("depart", departResult.label);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.depart;
          return next;
        });
      }
    }

    const origin = resolvedFromCoord ?? SERVICE_CENTER;

    // Lieu canonique connu (coordonnées vérifiées) en priorité.
    const canonical = findCanonicalPlace(value, origin);
    if (canonical) {
      setToCoord(canonical.coord);
      set("destination", canonical.label);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.destination;
        return next;
      });
      setCalcLoading(false);
      setSearchingDestination(false);
      return;
    }

    // Géocodage direct de l'adresse saisie (texte ou dictée à l'oral) — pas de liste de choix.
    const result = await geocodeFullAddress(value);
    setCalcLoading(false);
    setSearchingDestination(false);

    if (result) {
      setToCoord(result.coord);
      // N'écrase le texte que si le champ n'est plus en focus
      // (évite de remplacer ce que l'utilisateur tape encore pendant le debounce)
      if (!destinationFocusedRef.current) {
        set("destination", result.label);
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next.destination;
        return next;
      });
    } else {
      setToCoord(null);
      setErrors((prev) => ({
        ...prev,
        destination: lang === "en" ? UI.en.addressNotFound : UI.fr.addressNotFound,
      }));
    }
  }, [f.destination, f.depart, fromCoord]);

  useEffect(() => {
    resolveDestinationAddressRef.current = resolveDestinationAddress;
  }, [resolveDestinationAddress]);

  useEffect(() => {
    resolveDepartAddressRef.current = resolveDepartAddress;
  }, [resolveDepartAddress]);

  // ── Disponibilité taxi ────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await getTaxiAvailability();
        setTaxiAvailable(!!res?.available);
      } catch {
        setTaxiAvailable(null);
      }
    };
    check();
  }, []);

  // ── Push client retirée ──────────────────────────────────────────────────
  // Le client n'est plus notifié par push. Toutes les étapes sont visibles
  // en temps réel sur /suivi/$id (bandeau d'étapes + statut). On garde
  // uniquement la push chauffeur (Patricia) à la création (notifyNewReservation).

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return; // guard anti double-submit

    const newErrors: Record<string, string> = {};
    if (!f.prenom.trim()) newErrors.prenom = t("res.err.required");
    if (!f.nom.trim()) newErrors.nom = t("res.err.required");
    if (!f.phone.trim()) newErrors.phone = t("res.err.required");
    if (!f.email.trim()) newErrors.email = t("res.err.required");
    if (!f.depart.trim()) newErrors.depart = t("res.err.required");
    if (!f.destination.trim()) newErrors.destination = t("res.err.required");
    if (!f.date.trim()) newErrors.date = t("res.err.required");
    if (!f.heure.trim()) newErrors.heure = t("res.err.required");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("res.err.required"));
      return;
    }

    // ── Résolution tardive des coordonnées ────────────────────────────────────
    // Si le user a cliqué "Réserver" sans quitter le champ (onBlur pas encore
    // déclenché, ou résolution async encore en cours), on géocode ici avant
    // de valider. geocodeFullAddress court-circuite sur CANONICAL_PLACES
    // (aéroport, gare…) donc c'est quasi-instantané pour les lieux connus.
    let resolvedFrom = fromCoord;
    let resolvedTo = toCoord;

    if (f.depart.trim() && !resolvedFrom) {
      const r = await geocodeFullAddress(f.depart.trim());
      if (r) {
        resolvedFrom = r.coord;
        setFromCoord(r.coord);
        set("depart", r.label);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.depart;
          return next;
        });
      }
    }

    if (f.destination.trim() && !resolvedTo) {
      const r = await geocodeFullAddress(f.destination.trim());
      if (r) {
        resolvedTo = r.coord;
        setToCoord(r.coord);
        set("destination", r.label);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.destination;
          return next;
        });
      }
    }

    if (!resolvedFrom) {
      setErrors((prev) => ({ ...prev, depart: t("res.geo.err.unavailable") }));
      toast.error(t("res.geo.err.unavailable"));
      return;
    }
    if (!resolvedTo) {
      setErrors((prev) => ({ ...prev, destination: t("res.geo.err.unavailable") }));
      toast.error(t("res.geo.err.unavailable"));
      return;
    }

    // Fallback distance si Google Directions indisponible : haversine × 1.3 (évite de bloquer la résa)
    let distanceKm = orsResult?.distanceKm ?? 0;
    let dureeS = orsResult?.dureeS ?? 0;
    if (!orsResult && resolvedFrom && resolvedTo) {
      const R = 6371;
      const dLat = ((resolvedTo[0] - resolvedFrom[0]) * Math.PI) / 180;
      const dLng = ((resolvedTo[1] - resolvedFrom[1]) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((resolvedFrom[0] * Math.PI) / 180) *
          Math.cos((resolvedTo[0] * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      distanceKm = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3).toFixed(2));
      dureeS = roundSecondsToMinute((distanceKm / 30) * 3600); // ~30 km/h en ville
      toast.warning(lang === "en" ? UI.en.distanceEstimated : UI.fr.distanceEstimated);
    }

    setSending(true);
    gaEvent("reservation_submit", { depart: f.depart, destination: f.destination, passagers: f.passagers });

    try {
      const suiviId = newSuiviId();

      const fullName = `${f.prenom} ${f.nom}`.trim();
      const pickupIsoFinal = f.date && f.heure ? toParisIso(f.date, f.heure) : new Date().toISOString();

      const inserted = await createReservationPublic({
        data: {
          nom: fullName,
          telephone: f.phone,
          email: f.email || null,
          depart: f.depart,
          arrivee: f.destination,
          pickup_datetime: pickupIsoFinal,
          passagers: f.passagers,
          bagages: f.bagages,
          suivi_id: suiviId,
          distance_km: distanceKm,
          duree_s: dureeS > 0 ? dureeS : null,
          paiement: f.paiement,
          tarif_jour: tarifJour,
          prix_estime: calculerPrixMixteLocal(distanceKm, new Date(pickupIsoFinal).getTime(), dureeS),
          lang: (lang === "en" ? "en" : "fr") as "fr" | "en",
          message: f.message.trim() || null,
          service_type: "standard",
          source: "form",
        },
      });

      gaEvent("reservation_confirmed", {
        reservation_id: inserted?.id,
        distance_km: distanceKm,
        value: calculerPrixMixteLocal(distanceKm, new Date(pickupIsoFinal).getTime(), dureeS),
        currency: "EUR",
      });

      // Réveille instantanément les tableaux de bord chauffeur ouverts.
      broadcastDriverFeed("reservation");

      // Si le navigateur est déjà en "granted", on ré-attache immédiatement
      // l'abonnement push client à la réservation créée. Sinon le bouton peut
      // afficher granted mais la DB n'a qu'une ligne générique ou absente.
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const fcm = await getFcmToken();
          if (fcm) {
            await repairClientPushRegistration({
              data: {
                audience: "client",
                fcm_token: fcm,
                reservation_id: inserted.id,
                user_agent: navigator.userAgent.slice(0, 500),
              },
            });
            setIsSubscribedToNotifs(true);
          }
        } catch (pushLinkErr) {
          console.warn("[push] impossible de rattacher la réservation au client", pushLinkErr);
        }
      }

      // ⚠️ Push client retirée — le client est notifié visuellement sur /suivi/$id.

      toast.success(`${t("conf.ok.title")} ${f.prenom}`, {
        description: lang === "en" ? UI.en.confirmEmailSent : UI.fr.confirmEmailSent,
        duration: 8000,
      });
      setSending(false);

      // ── Seed du fil de conversation avec la demande spéciale ──────────────
      // Si le client a saisi une "demande spéciale" à la réservation, on
      // l'insère comme premier message client pour que le chauffeur et le
      // client (page /suivi/$id) démarrent sur un fil unique et cohérent.
      const specialMsg = f.message.trim();
      if (specialMsg) {
        try {
          await seedReservationSpecialRequest({
            data: { reservation_id: inserted.id, content: specialMsg },
          });
        } catch (e) {
          console.warn("[chat] seed special request failed (non-blocking)", e);
        }
      }

      // ── Notifier le chauffeur Patricia (push FCM + email) ─────────────────────
      // On attend la fin avant de naviguer : sinon le navigateur peut tuer
      // la requête en cours lors du changement de page (notamment sur mobile),
      // ce qui explique que Patricia ne recevait plus de push ni d'email.
      // Timeout 8s pour ne pas bloquer en cas d'erreur réseau.
      try {
        await Promise.race([
          notifyNewReservation({ data: { reservation_id: inserted.id } }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("notify timeout")), 8000)),
        ]);
      } catch (e) {
        console.warn("[notify] chauffeur notify failed (non-blocking)", e);
      }

      // ── Email client géré par notify-new-reservation (Edge Function) ────────
      // L'envoi est déclenché par notifyNewReservation() ci-dessus — pas de doublon ici.

      navigate({ to: "/suivi/$id", params: { id: inserted.suivi_id } });
    } catch (err: any) {
      setSending(false);
      toast.error(t("res.err.global"), { description: err?.message });
    }
  };

  const anyListening = voiceListening || voiceBothListening;
  const stopAllListening = () => {
    try {
      voiceRecogRef.current?.stop?.();
    } catch {
      /* noop */
    }
    try {
      voiceBothRecogRef.current?.stop?.();
    } catch {
      /* noop */
    }
  };

  const passagersOptions = [1, 2, 3, 4, 5, 6];
  const bagagesOptions = [0, 1, 2, 3, 4, 5];
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const STEP_LABELS = lang === "en" ? ["Trip", "Details", "Contact"] : ["Trajet", "Détails", "Contact"];

  const goToStep = (target: 0 | 1 | 2) => {
    if (target <= step) setStep(target);
  };

  const validateTrajet = (): boolean => {
    const next = { ...errors };
    let ok = true;
    if (!f.depart.trim() || !fromCoord) {
      next.depart =
        lang === "en" ? "Please select a valid pickup address" : "Sélectionnez une adresse de départ valide";
      ok = false;
    } else {
      delete next.depart;
    }
    if (!f.destination.trim() || !toCoord) {
      next.destination = lang === "en" ? "Please select a valid destination" : "Sélectionnez une destination valide";
      ok = false;
    } else {
      delete next.destination;
    }
    if (!f.date) {
      next.date = lang === "en" ? "Required" : "Requis";
      ok = false;
    } else {
      delete next.date;
    }
    if (!f.heure) {
      next.heure = lang === "en" ? "Required" : "Requis";
      ok = false;
    } else {
      delete next.heure;
    }
    setErrors(next);
    return ok;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!validateTrajet()) return;
      gaEvent("reservation_step", { step: "trajet_complete" });
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
    }
  };

  return (
    <div
      style={{
        background: "#f5f0e8",
        fontFamily: "'DM Sans',sans-serif",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        height: "100dvh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; max-width: 100vw; overscroll-behavior-y: contain; }
        input, select, button, textarea { font-family: 'DM Sans', sans-serif; }
        input[type=date], input[type=time] { color-scheme: light; }
        input[type=text], input[type=tel], input[type=email] { font-size: 16px !important; }
        button, a { touch-action: manipulation; }
        select { touch-action: manipulation; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes floatCar { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .tcb-step { animation: slideIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .tcb-stepper-btn:active { transform: scale(0.92); }
        .tcb-pay-btn:active { transform: scale(0.97); }
        .tcb-nav-btn:active { transform: scale(0.97); }
        .tcb-step-label { display: inline; }
        @media (max-width: 380px) { .tcb-step-label { display: none; } }
        input:focus, select:focus, textarea:focus { border-color: #c9a84c !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.14); }
      `}</style>

      {/* ── Contenu principal ── */}
      <div
        dir={dir}
        style={{
          background: "#f5f0e8",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        {/* ══════════ HERO / EN-TÊTE + STEPPER ══════════ */}
        <div
          style={{
            position: "relative",
            background: "radial-gradient(120% 140% at 15% -10%, #3a2a10 0%, #1a1209 55%, #120c06 100%)",
            padding: "16px 20px 20px",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <svg
            width="180"
            height="130"
            viewBox="0 0 180 130"
            style={{ position: "absolute", top: -10, right: -20, opacity: 0.14, pointerEvents: "none" }}
          >
            <circle cx="120" cy="55" r="70" fill="none" stroke="#e8c96a" strokeWidth="1" />
            <circle cx="140" cy="30" r="40" fill="none" stroke="#e8c96a" strokeWidth="1" />
          </svg>

          {/* Ligne retour + langue */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep((s) => (s - 1) as 0 | 1 | 2))}
              aria-label={lang === "en" ? UI.en.backToSite : UI.fr.backToSite}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(201,168,76,0.35)",
                color: "#e8c96a",
                borderRadius: 99,
                padding: "10px 16px",
                minHeight: 40,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'DM Sans', sans-serif",
                backdropFilter: "blur(4px)",
              }}
            >
              {step === 0 ? (lang === "en" ? "← Back" : "← Retour") : lang === "en" ? "← Previous" : "← Précédent"}
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#e8c96a",
                borderRadius: 99,
                padding: "9px 12px",
                minHeight: 40,
                fontSize: 13,
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#1a1209", color: "#e8c96a" }}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {step === 0 && (
            <div style={{ position: "relative", maxWidth: "72%", marginBottom: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(201,168,76,0.14)",
                  border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: 99,
                  padding: "4px 10px",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#e8c96a",
                  marginBottom: 10,
                }}
              >
                ✦ {lang === "en" ? "Premium taxi booking" : "Réservation taxi premium"}
              </div>
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 700,
                  color: "#f5f0e8",
                  fontFamily: "'Clash Display'",
                  lineHeight: 1.15,
                }}
              >
                {t("res.title")}
              </div>
              <div style={{ fontSize: 13, color: "rgba(232,201,106,0.8)", marginTop: 6, lineHeight: 1.4 }}>
                {t("res.intro")}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: -8,
                  top: -6,
                  fontSize: 42,
                  animation: "floatCar 3.2s ease-in-out infinite",
                }}
              >
                🚖
              </div>
            </div>
          )}

          {step > 0 && (
            <div style={{ position: "relative", marginBottom: 18 }}>
              <div style={{ fontSize: 21, fontWeight: 700, color: "#f5f0e8", fontFamily: "'Clash Display'" }}>
                {STEP_LABELS[step]}
              </div>
            </div>
          )}

          {/* Stepper de progression */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                <button
                  type="button"
                  onClick={() => goToStep(i as 0 | 1 | 2)}
                  disabled={i > step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: "transparent",
                    border: "none",
                    cursor: i <= step ? "pointer" : "default",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                      background:
                        i < step
                          ? "#c9a84c"
                          : i === step
                            ? "linear-gradient(135deg, #e8c96a 0%, #c9a84c 100%)"
                            : "rgba(255,255,255,0.08)",
                      color: i <= step ? "#1a1209" : "rgba(232,201,106,0.5)",
                      border: i === step ? "2px solid #f5f0e8" : "1px solid rgba(201,168,76,0.3)",
                      boxShadow: i === step ? "0 0 0 3px rgba(201,168,76,0.2)" : "none",
                    }}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className="tcb-step-label"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: i <= step ? "#e8c96a" : "rgba(232,201,106,0.4)",
                    }}
                  >
                    {label}
                  </span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: i < step ? "#c9a84c" : "rgba(255,255,255,0.1)",
                      borderRadius: 2,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ══════════ GRILLE TARIFAIRE (étape 1 seulement) ══════════ */}
        {step === 0 && (
          <div
            style={{
              background: "#fff",
              padding: "14px 16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              borderBottom: "1px solid #ede8de",
            }}
          >
            {[
              {
                icon: "☀️",
                label: t("res.tarif.day"),
                detail: t("res.tarif.day_detail"),
                price: t("res.tarif.day_price"),
                accent: "#c9a84c",
              },
              {
                icon: "🌙",
                label: t("res.tarif.night"),
                detail: t("res.tarif.night_detail"),
                price: t("res.tarif.night_price"),
                accent: "#7a6a50",
              },
              {
                icon: "🚩",
                label: t("res.tarif.pickup"),
                detail: "",
                price: t("res.tarif.pickup_price"),
                accent: "#c9a84c",
              },
              {
                icon: "ℹ️",
                label: t("res.tarif.booking_fee"),
                detail: t("res.tarif.booking_fee_detail"),
                price: "",
                accent: "#7a6a50",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 10px",
                  borderRadius: 12,
                  background: "#faf9f6",
                  border: "1px solid #ede8de",
                  borderLeft: `3px solid ${item.accent}`,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 17,
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 9,
                    background: "rgba(201,168,76,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "#7a6a50",
                      lineHeight: 1.25,
                      overflowWrap: "break-word",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {item.label}
                  </div>
                  {item.detail && <div style={{ fontSize: 9.5, color: "#b0a180", lineHeight: 1.2 }}>{item.detail}</div>}
                  {item.price && (
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1209", marginTop: 1 }}>{item.price}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════ CORPS ══════════ */}
        <div
          style={{
            padding: "18px 16px max(24px, env(safe-area-inset-bottom, 0px))",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {step === 0 && taxiAvailable === false && (
            <div
              className="tcb-step"
              style={{
                background: "#fff5f5",
                border: "1.5px solid #fca5a5",
                borderRadius: 14,
                padding: "13px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#fecaca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🚕
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#b91c1c", marginBottom: 2 }}>
                  {t("taxi.banner.busy.title")}
                </div>
                <div style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.4 }}>{t("taxi.banner.busy.desc")}</div>
              </div>
            </div>
          )}
          {step === 0 && taxiAvailable === true && (
            <div
              className="tcb-step"
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #4ade80",
                borderRadius: 14,
                padding: "13px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✅
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>{t("taxi.banner.available.msg")}</div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* ══════════ ÉTAPE 1 — TRAJET ══════════ */}
            {step === 0 && (
              <div key="step-0" className="tcb-step" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "18px 16px",
                    border: "1px solid #ede8de",
                    boxShadow: "0 2px 10px rgba(26,18,9,0.05)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1a1209",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      🚖 {t("res.loc.ride_section")}
                    </div>
                    <button
                      type="button"
                      onClick={fromCoord ? startVoiceRecognition : startVoiceRecognitionBoth}
                      title={
                        fromCoord
                          ? lang === "en"
                            ? UI.en.dictateDestOnly
                            : UI.fr.dictateDestOnly
                          : lang === "en"
                            ? UI.en.dictateFullTrip
                            : UI.fr.dictateFullTrip
                      }
                      style={{
                        background:
                          voiceBothListening || voiceListening
                            ? "#dc2626"
                            : "linear-gradient(135deg, #1a1209 0%, #2d1f0a 100%)",
                        border: "none",
                        borderRadius: 99,
                        padding: "9px 14px",
                        minHeight: 40,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        color: voiceBothListening || voiceListening ? "#fff" : "#e8c96a",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        animation: voiceBothListening || voiceListening ? "pulse 1s ease-in-out infinite" : "none",
                        boxShadow: "0 2px 8px rgba(26,18,9,0.2)",
                      }}
                    >
                      {voiceBothListening || voiceListening
                        ? lang === "en"
                          ? UI.en.listening
                          : UI.fr.listening
                        : fromCoord
                          ? lang === "en"
                            ? UI.en.dictateDestBtn
                            : UI.fr.dictateDestBtn
                          : lang === "en"
                            ? UI.en.dictateTripBtn
                            : UI.fr.dictateTripBtn}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        paddingTop: 12,
                        width: 14,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#22c55e",
                          boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 46,
                          background: "repeating-linear-gradient(180deg, #d8cca4 0 4px, transparent 4px 8px)",
                          margin: "4px 0",
                        }}
                      />
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: "#ef4444",
                          boxShadow: "0 0 0 3px rgba(239,68,68,0.18)",
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 0 }}>
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            color: "#7a6a50",
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {t("res.loc.from")}
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={f.depart}
                            onChange={(e) => {
                              const v = e.target.value;
                              set("depart", v);
                              setFromCoord(null);
                              setDepartChoices([]);
                              if (departDebounceRef.current) clearTimeout(departDebounceRef.current);
                            }}
                            onBlur={resolveDepartAddress}
                            placeholder={lang === "en" ? UI.en.departPlaceholder : UI.fr.departPlaceholder}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            name="tcb-depart-x"
                            style={{ ...inputStyle(!!errors.depart), paddingRight: 52 }}
                          />
                          <button
                            type="button"
                            onClick={() => handleGeolocate()}
                            disabled={geolocLoading}
                            style={{
                              position: "absolute",
                              right: 6,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "linear-gradient(135deg, #c9a84c 0%, #a5842f 100%)",
                              border: "none",
                              borderRadius: 9,
                              cursor: geolocLoading ? "wait" : "pointer",
                              color: "#fff",
                              padding: "8px 10px",
                              minWidth: 40,
                              minHeight: 40,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              fontWeight: 700,
                              boxShadow: "0 2px 6px rgba(201,168,76,0.35)",
                            }}
                            aria-label={lang === "en" ? UI.en.geolocateAria : UI.fr.geolocateAria}
                          >
                            {geolocLoading ? "⏳" : "📍"}
                          </button>
                        </div>
                        {geolocStatus !== "idle" && (
                          <div
                            role="status"
                            aria-live="polite"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginTop: 6,
                              padding: "6px 10px",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 600,
                              background:
                                geolocStatus === "success"
                                  ? "#f0fdf4"
                                  : geolocStatus === "loading"
                                    ? "#fefce8"
                                    : geolocStatus === "hint" || geolocStatus === "ip"
                                      ? "#eff6ff"
                                      : "#fff5f5",
                              color:
                                geolocStatus === "success"
                                  ? "#166534"
                                  : geolocStatus === "loading"
                                    ? "#854d0e"
                                    : geolocStatus === "hint" || geolocStatus === "ip"
                                      ? "#1e40af"
                                      : "#b91c1c",
                              border: "1px solid currentColor",
                            }}
                          >
                            <span>
                              {geolocStatus === "hint" && "📍"}
                              {geolocStatus === "loading" && "⏳"}
                              {geolocStatus === "success" && "✓"}
                              {geolocStatus === "ip" && "🌐"}
                              {geolocStatus === "denied" && "🚫"}
                              {geolocStatus === "error" && "⚠️"}
                            </span>
                            <span style={{ flex: 1 }}>{geolocStatusMsg}</span>
                            {(geolocStatus === "success" || geolocStatus === "ip") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setGeolocStatus("idle");
                                  setGeolocStatusMsg("");
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "inherit",
                                  cursor: "pointer",
                                  fontSize: 11,
                                  textDecoration: "underline",
                                }}
                              >
                                {lang === "en" ? UI.en.edit : UI.fr.edit}
                              </button>
                            )}
                          </div>
                        )}
                        {errors.depart && (
                          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.depart}</div>
                        )}
                        {fromCoord && !errors.depart && (
                          <div style={{ color: "#166534", fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                            ✓ {t("res.geo.btn")}
                          </div>
                        )}
                        {searchingDepart && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 6,
                              color: "#9a7427",
                              fontSize: 11,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                border: "2px solid #c9a84c",
                                borderTopColor: "transparent",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                            {t("res.loc.searching")}
                          </div>
                        )}
                        {searchingDepart && departChoices.length === 0 && (
                          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                style={{
                                  height: 44,
                                  borderRadius: 10,
                                  background: "linear-gradient(90deg, #f5f0e8, #ede8de, #f5f0e8)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 1.4s ease-in-out infinite",
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {departChoices.length > 0 && (
                          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                            {departChoices.map((choice) => (
                              <button
                                key={`${choice.label}-${choice.coord[0]}-${choice.coord[1]}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  if (departDebounceRef.current) clearTimeout(departDebounceRef.current);
                                  skipNextDepartResolveRef.current = true;
                                  set("depart", choice.label);
                                  setFromCoord(choice.coord);
                                  setDepartChoices([]);
                                  setErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.depart;
                                    return next;
                                  });
                                }}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "10px 12px",
                                  borderRadius: 11,
                                  border: "1.5px solid #e2d9c8",
                                  background: "#faf9f7",
                                  color: "#1a1209",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span style={{ fontSize: 14 }}>📍</span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>
                                    {choice.label}
                                  </span>
                                  <span style={{ display: "block", fontSize: 11, color: "#9a7427", marginTop: 2 }}>
                                    à {choice.distanceKm.toFixed(1)} km
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            color: "#7a6a50",
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {t("res.loc.to")}
                        </label>
                        <input
                          type="text"
                          value={f.destination}
                          onChange={(e) => {
                            const v = e.target.value;
                            set("destination", v);
                            setToCoord(null);
                            if (destinationDebounceRef.current) clearTimeout(destinationDebounceRef.current);
                          }}
                          onFocus={() => {
                            destinationFocusedRef.current = true;
                          }}
                          onBlur={() => {
                            destinationFocusedRef.current = false;
                            resolveDestinationAddress();
                          }}
                          placeholder={t("res.f.to.ph")}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          name="tcb-dest-x"
                          style={inputStyle(!!errors.destination)}
                        />
                        {errors.destination && (
                          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.destination}</div>
                        )}
                        {searchingDestination && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 6,
                              color: "#9a7427",
                              fontSize: 11,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                border: "2px solid #c9a84c",
                                borderTopColor: "transparent",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                            {t("res.loc.searching")}
                          </div>
                        )}
                        {toCoord && !errors.destination && (
                          <div style={{ color: "#166534", fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                            ✓ {t("res.loc.to")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {fromCoord && toCoord && (
                    <div
                      style={{
                        marginTop: 16,
                        background: "linear-gradient(135deg, #1a1209 0%, #2d1f0a 100%)",
                        borderRadius: 14,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      {calcLoading ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#e8c96a",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              border: "2px solid #e8c96a",
                              borderTopColor: "transparent",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          {lang === "en" ? "Calculating your fare…" : "Calcul du tarif en cours…"}
                        </div>
                      ) : (
                        <>
                          <div>
                            <div
                              style={{
                                fontSize: 10.5,
                                color: "rgba(232,201,106,0.75)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontWeight: 700,
                              }}
                            >
                              {lang === "en" ? "Estimated fare" : "Prix estimé"}
                            </div>
                            <div
                              style={{ fontSize: 24, fontWeight: 800, color: "#f5f0e8", fontFamily: "'Clash Display'" }}
                            >
                              {prixAller.toFixed(2)} €
                            </div>
                            {orsResult && (
                              <div style={{ fontSize: 11, color: "rgba(232,201,106,0.7)", marginTop: 2 }}>
                                {orsResult.distanceKm.toFixed(1)} km · {Math.round(orsResult.dureeS / 60)} min
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 26 }}>💰</div>
                        </>
                      )}
                    </div>
                  )}

                  <div style={{ height: 1, background: "#ede8de", margin: "16px 0" }} />

                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        color: "#7a6a50",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <span>📅</span> {t("res.datetime.title")}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <input
                          type="date"
                          value={f.date}
                          onChange={(e) => set("date", e.target.value)}
                          min={today}
                          style={inputStyle(!!errors.date)}
                        />
                        {errors.date && (
                          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.date}</div>
                        )}
                      </div>
                      <div>
                        <input
                          type="time"
                          value={f.heure}
                          onChange={(e) => set("heure", e.target.value)}
                          style={inputStyle(!!errors.heure)}
                        />
                        {errors.heure && (
                          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.heure}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="tcb-nav-btn"
                  onClick={handleNext}
                  style={{
                    padding: "17px 20px",
                    background: "linear-gradient(135deg, #1a1209 0%, #2d1f0a 60%, #1a1209 100%)",
                    color: "#e8c96a",
                    border: "1.5px solid rgba(201,168,76,0.5)",
                    borderRadius: 16,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(26,18,9,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {lang === "en" ? "Continue" : "Continuer"} →
                </button>
              </div>
            )}

            {/* ══════════ ÉTAPE 2 — DÉTAILS ══════════ */}
            {step === 1 && (
              <div key="step-1" className="tcb-step" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "18px 16px",
                    border: "1px solid #ede8de",
                    boxShadow: "0 2px 10px rgba(26,18,9,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1a1209",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    ⚙️ {t("res.loc.trip_details_section")}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            color: "#7a6a50",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          <span>👥</span> {t("res.f.passengers")}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: "1.5px solid #ede0c4",
                            borderRadius: 12,
                            padding: "6px 8px",
                            background: "#faf9f6",
                          }}
                        >
                          <button
                            type="button"
                            className="tcb-stepper-btn"
                            onClick={() => set("passagers", Math.max(1, f.passagers - 1))}
                            disabled={f.passagers <= 1}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              background: "#1a1209",
                              color: "#e8c96a",
                              fontSize: 16,
                              fontWeight: 700,
                              cursor: "pointer",
                              opacity: f.passagers <= 1 ? 0.35 : 1,
                            }}
                          >
                            −
                          </button>
                          <div style={{ textAlign: "center", lineHeight: 1.15 }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1209" }}>{f.passagers}</div>
                            <div style={{ fontSize: 9.5, color: "#9a7427", fontWeight: 600 }}>
                              {f.passagers > 1 ? t("res.loc.passengers_pl") : t("res.loc.passenger_sg")}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="tcb-stepper-btn"
                            onClick={() => set("passagers", Math.min(6, f.passagers + 1))}
                            disabled={f.passagers >= 6}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              background: "linear-gradient(135deg, #c9a84c 0%, #a5842f 100%)",
                              color: "#fff",
                              fontSize: 16,
                              fontWeight: 700,
                              cursor: "pointer",
                              opacity: f.passagers >= 6 ? 0.35 : 1,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            color: "#7a6a50",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          <span>🧳</span> {t("res.f.luggage")}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: "1.5px solid #ede0c4",
                            borderRadius: 12,
                            padding: "6px 8px",
                            background: "#faf9f6",
                          }}
                        >
                          <button
                            type="button"
                            className="tcb-stepper-btn"
                            onClick={() => set("bagages", Math.max(0, f.bagages - 1))}
                            disabled={f.bagages <= 0}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              background: "#1a1209",
                              color: "#e8c96a",
                              fontSize: 16,
                              fontWeight: 700,
                              cursor: "pointer",
                              opacity: f.bagages <= 0 ? 0.35 : 1,
                            }}
                          >
                            −
                          </button>
                          <div style={{ textAlign: "center", lineHeight: 1.15 }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1209" }}>{f.bagages}</div>
                            <div style={{ fontSize: 9.5, color: "#9a7427", fontWeight: 600 }}>
                              {f.bagages > 1 ? t("res.loc.luggage_pl") : t("res.loc.luggage_sg")}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="tcb-stepper-btn"
                            onClick={() => set("bagages", Math.min(5, f.bagages + 1))}
                            disabled={f.bagages >= 5}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              background: "linear-gradient(135deg, #c9a84c 0%, #a5842f 100%)",
                              color: "#fff",
                              fontSize: 16,
                              fontWeight: 700,
                              cursor: "pointer",
                              opacity: f.bagages >= 5 ? 0.35 : 1,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#7a6a50",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        <span>💳</span> {t("res.loc.payment_section")}
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { val: "cb", icon: "💳", label: t("res.loc.card") },
                          { val: "especes", icon: "💶", label: t("res.loc.cash") },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            className="tcb-pay-btn"
                            onClick={() => set("paiement", opt.val)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 7,
                              padding: "12px 10px",
                              borderRadius: 12,
                              border: f.paiement === opt.val ? "1.5px solid #c9a84c" : "1.5px solid #ede0c4",
                              background:
                                f.paiement === opt.val
                                  ? "linear-gradient(135deg, #1a1209 0%, #2d1f0a 100%)"
                                  : "#faf9f6",
                              color: f.paiement === opt.val ? "#e8c96a" : "#1a1209",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ fontSize: 16 }}>{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    type="button"
                    className="tcb-nav-btn"
                    onClick={() => setStep(0)}
                    style={{
                      padding: "15px 16px",
                      background: "#fff",
                      color: "#1a1209",
                      border: "1.5px solid #ede0c4",
                      borderRadius: 16,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ← {lang === "en" ? "Back" : "Retour"}
                  </button>
                  <button
                    type="button"
                    className="tcb-nav-btn"
                    onClick={handleNext}
                    style={{
                      padding: "15px 16px",
                      background: "linear-gradient(135deg, #1a1209 0%, #2d1f0a 60%, #1a1209 100%)",
                      color: "#e8c96a",
                      border: "1.5px solid rgba(201,168,76,0.5)",
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(26,18,9,0.25)",
                    }}
                  >
                    {lang === "en" ? "Continue" : "Continuer"} →
                  </button>
                </div>
              </div>
            )}

            {/* ══════════ ÉTAPE 3 — CONTACT + CONFIRMATION ══════════ */}
            {step === 2 && (
              <div key="step-2" className="tcb-step" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Récap trajet compact */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #1a1209 0%, #2d1f0a 100%)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "rgba(232,201,106,0.75)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                      }}
                    >
                      {lang === "en" ? "Trip summary" : "Récapitulatif"}
                    </div>
                    {fromCoord && toCoord && (
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#f5f0e8", fontFamily: "'Clash Display'" }}>
                        {prixAller.toFixed(2)} €
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#e8dcc3", lineHeight: 1.6 }}>
                    <div>🟢 {f.depart || "—"}</div>
                    <div>🔴 {f.destination || "—"}</div>
                    <div style={{ opacity: 0.75, marginTop: 2 }}>
                      📅 {f.date} · 🕐 {f.heure} · 👥 {f.passagers} · 🧳 {f.bagages} ·{" "}
                      {f.paiement === "cb" ? t("res.loc.card") : t("res.loc.cash")}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "18px 16px",
                    border: "1px solid #ede8de",
                    boxShadow: "0 2px 10px rgba(26,18,9,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1a1209",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    👤 {t("res.loc.contact_section")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { k: "prenom" as const, label: t("res.loc.firstname"), ph: u.firstNamePh, icon: "👤" },
                        { k: "nom" as const, label: t("res.loc.lastname"), ph: u.lastNamePh, icon: "👤" },
                      ].map(({ k, label, ph, icon }) => (
                        <div key={k}>
                          <label
                            style={{
                              fontSize: 11,
                              color: "#7a6a50",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              marginBottom: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            <span>{icon}</span>
                            {label}
                          </label>
                          <input
                            type="text"
                            value={f[k]}
                            onChange={(e) => set(k, e.target.value)}
                            placeholder={ph}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="words"
                            spellCheck={false}
                            name={`tcb-${k}-x`}
                            style={inputStyle(!!errors[k])}
                          />
                          {errors[k] && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors[k]}</div>}
                        </div>
                      ))}
                    </div>
                    {[
                      { k: "phone" as const, label: t("res.loc.phone"), ph: "06 12 34 56 78", type: "tel", icon: "📱" },
                      { k: "email" as const, label: t("res.loc.email"), ph: u.emailPh, type: "email", icon: "✉️" },
                    ].map(({ k, label, ph, type, icon }) => (
                      <div key={k}>
                        <label
                          style={{
                            fontSize: 11,
                            color: "#7a6a50",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          <span>{icon}</span>
                          {label}
                        </label>
                        <input
                          type={type}
                          value={f[k]}
                          onChange={(e) => set(k, e.target.value)}
                          placeholder={ph}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          name={`tcb-${k}-x`}
                          style={inputStyle(!!errors[k])}
                        />
                        {errors[k] && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors[k]}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(255,253,247,0.9) 0%, rgba(252,247,234,0.8) 100%)",
                    border: "1px solid rgba(201,168,76,0.22)",
                    borderRadius: 18,
                    padding: "16px 18px",
                    boxShadow: "0 1px 3px rgba(26,18,9,0.04)",
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      color: "#7a6a50",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span>✨</span>
                    {t("res.special.title")}
                  </label>
                  <textarea
                    value={f.message}
                    onChange={(e) => set("message", e.target.value.slice(0, 500))}
                    placeholder={t("res.special.placeholder")}
                    rows={3}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.75)",
                      border: "1.5px solid rgba(201,168,76,0.25)",
                      borderRadius: 12,
                      fontSize: 16,
                      color: "#1a1209",
                      fontFamily: "inherit",
                      outline: "none",
                      lineHeight: 1.5,
                    }}
                  />
                  <div style={{ marginTop: 6, fontSize: 11, color: "#a8956a", textAlign: "right" }}>
                    {f.message.length}/500
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10 }}>
                  <button
                    type="button"
                    className="tcb-nav-btn"
                    onClick={() => setStep(1)}
                    style={{
                      padding: "16px 18px",
                      background: "#fff",
                      color: "#1a1209",
                      border: "1.5px solid #ede0c4",
                      borderRadius: 16,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ←
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      padding: "18px 20px",
                      background: sending
                        ? "#c9b98a"
                        : "linear-gradient(135deg, #1a1209 0%, #2d1f0a 60%, #1a1209 100%)",
                      color: sending ? "#a8956a" : "#e8c96a",
                      border: "1.5px solid rgba(201,168,76,0.5)",
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: 17,
                      cursor: sending ? "wait" : "pointer",
                      letterSpacing: "0.02em",
                      boxShadow: sending ? "none" : "0 6px 20px rgba(26,18,9,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{sending ? "⏳" : "🚖"}</span>
                    {sending ? t("res.sending") : t("res.send")}
                  </button>
                </div>

                {/* ── Bouton notifs client ── */}
                {typeof window !== "undefined" && "Notification" in window ? (
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,249,247,0.95) 100%)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: 16,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      boxShadow: "0 2px 10px rgba(26,18,9,0.04)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isSubscribedToNotifs) {
                          const loadingId = toast.loading(t("reserver.notif.disabling_loading"));
                          try {
                            const fcm = await getFcmToken().catch(() => null);
                            const error = fcm ? null : new Error("no-token");
                            if (fcm) await unsubscribePush({ data: { fcm_token: fcm } });

                            toast.dismiss(loadingId);
                            if (error) {
                              toast.error(t("reserver.notif.disable_error"));
                            } else {
                              setIsSubscribedToNotifs(false);
                              toast.success(t("reserver.notif.disabled_success"));
                            }
                          } catch (err) {
                            toast.dismiss(loadingId);
                            toast.error(t("reserver.notif.network_error"));
                          }
                        } else {
                          const loadingId = toast.loading(
                            pushStatus === "granted"
                              ? t("reserver.notif.repairing_loading")
                              : t("reserver.notif.activating_loading"),
                          );
                          try {
                            const ok = await subscribePush("client");
                            toast.dismiss(loadingId);
                            if (ok) {
                              setIsSubscribedToNotifs(true);
                              toast.success(
                                pushStatus === "granted"
                                  ? t("reserver.notif.resubscribed_success")
                                  : t("reserver.notif.activated_success"),
                              );
                            } else {
                              toast.error(t("reserver.notif.activate_error"));
                            }
                          } catch (err) {
                            toast.dismiss(loadingId);
                            toast.error("❌ " + ((err as Error)?.message || t("reserver.notif.network_error")));
                          }
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        padding: "14px 20px",
                        background: isSubscribedToNotifs
                          ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
                          : "linear-gradient(135deg, #1a1209 0%, #2d1f0a 100%)",
                        color: isSubscribedToNotifs ? "#b91c1c" : "#e8c96a",
                        border: "1.5px solid rgba(201,168,76,0.4)",
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        letterSpacing: "0.01em",
                        width: "100%",
                        pointerEvents: "auto",
                        touchAction: "manipulation",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{isSubscribedToNotifs ? "🔕" : "🔔"}</span>
                      {isSubscribedToNotifs
                        ? t("reserver.notif.disable_btn")
                        : pushStatus === "granted"
                          ? t("reserver.notif.repair_btn")
                          : t("reserver.notif.enable_btn")}
                    </button>
                    <p style={{ margin: 0, fontSize: 12, color: "#7a6a50", textAlign: "center", opacity: 0.8 }}>
                      {isSubscribedToNotifs
                        ? t("reserver.notif.duration_sub")
                        : pushStatus === "granted"
                          ? t("reserver.notif.permission_hint_sub")
                          : t("reserver.notif.enable_sub")}
                    </p>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "#999", padding: "8px 16px", textAlign: "center" }}>
                    ⚠️ {u.hiddenButtonDebug}: pushStatus={pushStatus} | Notification={String("Notification" in window)}
                  </div>
                )}
              </div>
            )}
          </form>

          <div style={{ height: 4 }} />
        </div>
      </div>
      <ListeningOverlay
        open={anyListening}
        label={voiceBothListening ? u.listeningLabel : u.dictateDestinationLabel}
        hint={voiceBothListening ? u.listeningHintBoth : u.listeningHintDest}
        onCancel={stopAllListening}
      />
    </div>
  );
}
