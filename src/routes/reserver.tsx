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
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { aiChatReservation } from "@/lib/reserver-chat.functions";
import { transcribeAudio } from "@/lib/stt.functions";
import { geocodeAddress, reverseGeocode } from "@/lib/googleGeocode";
import { loadGoogleMaps } from "@/lib/googleMaps";
import { useI18n } from "@/i18n/I18nProvider";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { seoLinks } from "@/lib/seo-hreflang";

const RESERVER_TITLE_FR = "Réserver un taxi en Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC_FR =
  "Réservez votre taxi en Charente-Maritime en discutant (ou à la voix) avec notre assistante. Devis instantané, créneaux vérifiés, confirmation immédiate.";

export const Route = createFileRoute("/reserver")({
  head: () => ({
    meta: [
      { title: RESERVER_TITLE_FR },
      { name: "description", content: RESERVER_DESC_FR },
      { property: "og:title", content: RESERVER_TITLE_FR },
      { property: "og:description", content: RESERVER_DESC_FR },
      { property: "og:url", content: "https://accessprestigetaxi.lovable.app/reserver" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: RESERVER_TITLE_FR },
      { name: "twitter:description", content: RESERVER_DESC_FR },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_GB" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { name: "theme-color", content: "#F5F0E6" },
    ],
    links: seoLinks("/reserver"),
  }),
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
  },
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
  | "gps_ask_manual"
  | "gps_use_other"
  | "gps_enter"
  | "gps_placeholder"
  | "gps_back"
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
  | "voice_empty";

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
    gps_ask_manual: "Merci d'indiquer votre adresse de départ exacte, puis votre destination.",
    gps_use_other: "Utiliser une autre adresse de départ",
    gps_enter: "Saisissez votre adresse de départ",
    gps_placeholder: "Ex : Vieux-Port, La Rochelle",
    gps_back: "Revenir à ma position GPS",
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
    gps_ask_manual: "Please enter your exact pickup address, then your destination.",
    gps_use_other: "Use another pickup address",
    gps_enter: "Enter your pickup address",
    gps_placeholder: "E.g. Old Port, La Rochelle",
    gps_back: "Back to my GPS location",
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
  const [gps, setGps] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<"denied" | "unavailable" | "timeout" | "low_accuracy" | null>(null);
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
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceRafRef = useRef<number | null>(null);
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

  // AUTO geoloc on mount — no button.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("unavailable");
      markGpsReady();
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const LOW_ACCURACY_LIMIT_M = 300;
        const isLowAccuracy = typeof accuracy === "number" && accuracy > LOW_ACCURACY_LIMIT_M;
        const label = (await reverseGeocode(lat, lng)) ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setGps(isLowAccuracy ? null : { lat, lng, label });
        setGpsError(isLowAccuracy ? "low_accuracy" : null);
        setGpsBusy(false);
        markGpsReady();
        setMessages((prev) => {
          if (prev.length === 1 && prev[0].role === "assistant") {
            if (isLowAccuracy) {
              const accM = Math.round(accuracy);
              return [
                {
                  role: "assistant",
                  content: `📍 ${TXT[L].gps_low} (±${accM} m). ${TXT[L].gps_ask_manual}`,
                },
              ];
            }
            return [
              {
                role: "assistant",
                content: `📍 ${TXT[L].gps_detected} : ${label}.\n${TXT[L].ask_destination}`,
              },
            ];
          }
          return prev;
        });
        const map = mapInst.current;
        const g = (window as any).google;
        if (!isLowAccuracy && map && g?.maps) {
          const pos2 = { lat, lng };
          if (gpsMarker.current) gpsMarker.current.setPosition(pos2);
          else
            gpsMarker.current = new g.maps.Marker({
              position: pos2,
              map,
              title: TXT[L].map_from,
              label: { text: "🧭", fontSize: "18px" },
            });
          map.setCenter(pos2);
          map.setZoom(14);
        }
      },
      (err) => {
        setGpsBusy(false);
        const code = err?.code;
        setGpsError(code === 1 ? "denied" : code === 3 ? "timeout" : "unavailable");
        markGpsReady();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
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
      const usableGps = gpsErrorRef.current === "low_accuracy" ? null : gpsRef.current;
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
        setTimeout(() => navigate({ to: "/suivi/$id", params: { id: trackId! } }), 6000);
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

  function stopSilenceWatch() {
    if (silenceRafRef.current != null) {
      cancelAnimationFrame(silenceRafRef.current);
      silenceRafRef.current = null;
    }
    analyserRef.current = null;
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  }

  function startSilenceWatch(stream: MediaStream) {
    try {
      const Ctx: typeof AudioContext | undefined = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const audioCtx = new Ctx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.fftSize);
      const start = Date.now();
      let lastLoud = Date.now();
      let hasSpoken = false;

      const tick = () => {
        const an = analyserRef.current;
        if (!an) return;
        an.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        const now = Date.now();
        if (rms > SILENCE_RMS) {
          lastLoud = now;
          hasSpoken = true;
        }
        if (hasSpoken && now - lastLoud > SILENCE_MS) return stopVoice();
        if (!hasSpoken && now - start > NO_SPEECH_MS) return stopVoice();
        if (now - start > MAX_RECORDING_MS) return stopVoice();
        silenceRafRef.current = requestAnimationFrame(tick);
      };
      silenceRafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      console.warn("[voice] détection de silence indisponible", e);
    }
  }

  function cleanupMic() {
    try {
      mediaRecRef.current?.state === "recording" && mediaRecRef.current.stop();
    } catch {}
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    mediaRecRef.current = null;
    audioChunksRef.current = [];
    stopSilenceWatch();
  }

  function stopVoice() {
    try {
      mediaRecRef.current?.state === "recording" && mediaRecRef.current.stop();
    } catch {}
  }

  const voiceStartingRef = useRef(false);

  async function toggleVoice() {
    if (listening) {
      stopVoice();
      return;
    }
    if (voiceStartingRef.current) return;
    voiceStartingRef.current = true;

    try {
      if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
        toast.error(TXT[L].voice_unsupported);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error(TXT[L].voice_unsupported);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await Promise.race([
          navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("getUserMedia_timeout")), 8000)),
        ]);
      } catch (err: any) {
        const name = err?.name || err?.message;
        if (name === "NotAllowedError" || name === "SecurityError") toast.error(TXT[L].voice_denied);
        else if (name === "NotFoundError" || name === "OverconstrainedError") toast.error(TXT[L].voice_no_mic);
        else toast.error(TXT[L].voice_error);
        return;
      }
      mediaStreamRef.current = stream;

      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
      const mime = candidates.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || "";
      let rec: MediaRecorder;
      try {
        rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      } catch {
        cleanupMic();
        toast.error(TXT[L].voice_error);
        return;
      }
      mediaRecRef.current = rec;
      audioChunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      rec.onstart = () => {
        setListening(true);
        startSilenceWatch(stream);
      };
      rec.onerror = () => {
        setListening(false);
        cleanupMic();
        toast.error(TXT[L].voice_error);
      };
      rec.onstop = async () => {
        setListening(false);
        const blob = new Blob(audioChunksRef.current, { type: rec.mimeType || mime || "audio/webm" });
        cleanupMic();
        if (blob.size < 1200) return;
        setTranscribing(true);
        try {
          const base64 = await blobToBase64(blob);
          const { text } = await transcribeFn({ data: { base64, mime: blob.type } });
          if (text) {
            const combined = inputRef.current ? `${inputRef.current} ${text}` : text;
            setInput("");
            send(combined);
          } else {
            toast.error(TXT[L].voice_empty);
          }
        } catch {
          toast.error(TXT[L].voice_error);
        } finally {
          setTranscribing(false);
        }
      };

      try {
        rec.start();
      } catch {
        cleanupMic();
        setListening(false);
        toast.error(TXT[L].voice_error);
      }
    } catch {
      toast.error(TXT[L].voice_error);
      setListening(false);
    } finally {
      voiceStartingRef.current = false;
    }
  }

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

  const sugg = [tx("sug1"), tx("sug2"), tx("sug3"), tx("sug4")];
  const stepsLabels = [tx("step1"), tx("step2"), tx("step3"), tx("step4")];
  const currentStep = reservationId ? 3 : quote ? 2 : messages.length > 1 ? 1 : 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <Sparkles className="h-3.5 w-3.5" /> {tx("kicker")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {tx("hero_title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{tx("hero_sub")}</p>
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-border/60 bg-background/60 p-3"
            >
              <textarea
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
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
              />
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
                            : tx("gps_unavailable")}
                  </p>
                  <p className="mt-0.5 break-words text-[11px] text-muted-foreground">
                    {manualDepart || gps?.label || tx("gps_auto")}
                  </p>
                </div>
              </div>

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

        {/* Map */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("map_label")}</p>
            <span className="text-[11px] text-muted-foreground">{tx("map_zone")}</span>
          </div>
          <div className="relative h-[360px] w-full">
            <div ref={mapRef} className="absolute inset-0" />
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/95 p-4">
                <pre className="max-h-full max-w-full overflow-auto whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-[11px] leading-relaxed text-destructive">
                  {mapError}
                </pre>
              </div>
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
