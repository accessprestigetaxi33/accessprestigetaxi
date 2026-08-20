import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowDownUp,
  BadgeCheck,
  Baby,
  Briefcase,
  CalendarClock,
  Car,
  CheckCircle2,
  CreditCard,
  Crosshair,
  Dog,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Route as RouteIcon,
  Share2,
  Stethoscope,
  Timer,
  User,
  Users,
  Accessibility,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete, type GeocodeSuggestion } from "@/components/AddressAutocomplete";
import { useI18n } from "@/i18n/I18nProvider";
import { quoteRide, bookRide } from "@/lib/booking.functions";
import { locateUser } from "@/lib/geolocation";
import { placesReverse } from "@/lib/places";

/* ────────────────────────────── i18n ────────────────────────────── */

type Lang = "fr" | "en";

const T = {
  fr: {
    eyebrow: "Réservation en direct",
    title: "Votre course, réservée en 60 secondes",
    subtitle:
      "Adresse, heure, passagers : le tarif s'affiche en direct pendant que vous remplissez. Aucune attente, aucune approximation.",
    trip: "Votre trajet",
    from: "Départ",
    to: "Destination",
    from_ph: "Adresse, hôtel, gare, aéroport…",
    to_ph: "Où allez-vous ?",
    mypos: "Ma position",
    locating: "Localisation…",
    swap: "Inverser départ et destination",
    when: "Quand ?",
    asap: "Dès que possible",
    in1h: "Dans 1 h",
    tomorrow: "Demain 08:00",
    datetime: "Date et heure de prise en charge",
    who: "Passagers, bagages & options",
    pax: "Passagers",
    bags: "Bagages",
    options: "Besoins particuliers",
    opt_baby: "Siège bébé",
    opt_child: "Siège enfant",
    opt_wheel: "Fauteuil roulant",
    opt_pet: "Animal",
    opt_med: "Transport sanitaire conventionné",
    opt_flight: "Vol / train à surveiller",
    payment: "Paiement",
    pay_cb: "CB à bord",
    pay_cash: "Espèces",
    pay_inv: "Facture entreprise",
    contact: "Vos coordonnées",
    name: "Nom et prénom",
    phone: "Téléphone",
    email: "E-mail (confirmation + suivi)",
    note: "Précision pour le chauffeur (optionnel)",
    note_ph: "Étage, code d'accès, bagage volumineux, numéro de vol…",
    quote: "Estimation en direct",
    quote_wait: "Renseignez départ, destination et heure",
    computing: "Calcul de l'itinéraire…",
    distance: "Distance",
    duration: "Durée estimée",
    vehicle: "Véhicule proposé",
    berline: "Berline électrique · jusqu'à 4 passagers",
    van: "Van Mercedes · jusqu'à 7 passagers",
    price: "Tarif estimé",
    detail_base: "Prise en charge",
    detail_day: "Km tarif jour",
    detail_night: "Km tarif nuit",
    regime_jour: "Tarif jour",
    regime_nuit: "Tarif nuit",
    regime_mixte: "Tarif jour + nuit",
    submit: "Confirmer ma réservation",
    submitting: "Enregistrement…",
    submitting_detail: "Nous enregistrons votre course et prévenons les chauffeurs…",
    pending_ref: "Attribution du numéro…",
    pending_note: "Vos chauffeurs sont prévenus, finalisation en cours…",

    missing: "Il manque :",
    m_from: "le départ",
    m_to: "la destination",
    m_when: "l'heure",
    m_name: "votre nom",
    m_phone: "votre téléphone",
    legal:
      "Tarif estimé selon les tarifs préfectoraux (prise en charge + km, jour 07h–19h / nuit). Le montant final dépend de l'itinéraire réel.",
    ok_title: "Réservation confirmée",
    ok_sub: "Votre chauffeur est prévenu. Vous recevez la confirmation par e-mail.",
    ok_ref: "Référence de suivi",
    ok_track: "Suivre ma course",
    ok_new: "Nouvelle réservation",
    ok_cal: "Ajouter au calendrier",
    ok_share: "Partager",
    err_quote: "Impossible de calculer cet itinéraire. Vérifiez les adresses.",
    err_book: "Enregistrement impossible. Appelez-nous au 06 03 44 48 63.",
    err_phone: "Numéro de téléphone invalide.",
    err_email: "Adresse e-mail invalide.",
    err_past: "Choisissez une heure au moins 20 minutes après maintenant.",
    trust1: "Chauffeurs professionnels · 20 ans d'expérience",
    trust2: "Toutes distances · Charente-Maritime et au-delà",
    trust3: "Confirmation immédiate + suivi en temps réel",
  },
  en: {
    eyebrow: "Live booking",
    title: "Your ride, booked in 60 seconds",
    subtitle:
      "Address, time, passengers: the fare updates live as you type. No waiting, no guesswork.",
    trip: "Your trip",
    from: "Pickup",
    to: "Destination",
    from_ph: "Address, hotel, station, airport…",
    to_ph: "Where to?",
    mypos: "My location",
    locating: "Locating…",
    swap: "Swap pickup and destination",
    when: "When?",
    asap: "As soon as possible",
    in1h: "In 1 hour",
    tomorrow: "Tomorrow 08:00",
    datetime: "Pickup date and time",
    who: "Passengers, luggage & options",
    pax: "Passengers",
    bags: "Luggage",
    options: "Special needs",
    opt_baby: "Baby seat",
    opt_child: "Child seat",
    opt_wheel: "Wheelchair",
    opt_pet: "Pet",
    opt_med: "Approved medical transport",
    opt_flight: "Flight / train to track",
    payment: "Payment",
    pay_cb: "Card on board",
    pay_cash: "Cash",
    pay_inv: "Company invoice",
    contact: "Your details",
    name: "Full name",
    phone: "Phone",
    email: "Email (confirmation + tracking)",
    note: "Note for the driver (optional)",
    note_ph: "Floor, door code, oversized luggage, flight number…",
    quote: "Live estimate",
    quote_wait: "Enter pickup, destination and time",
    computing: "Computing route…",
    distance: "Distance",
    duration: "Estimated time",
    vehicle: "Suggested vehicle",
    berline: "Electric saloon · up to 4 passengers",
    van: "Mercedes van · up to 7 passengers",
    price: "Estimated fare",
    detail_base: "Pick-up charge",
    detail_day: "Day-rate km",
    detail_night: "Night-rate km",
    regime_jour: "Day rate",
    regime_nuit: "Night rate",
    regime_mixte: "Day + night rate",
    submit: "Confirm my booking",
    submitting: "Saving…",
    submitting_detail: "We are saving your ride and notifying the drivers…",
    missing: "Missing:",
    m_from: "pickup",
    m_to: "destination",
    m_when: "time",
    m_name: "your name",
    m_phone: "your phone",
    legal:
      "Estimate based on official taxi rates (pick-up charge + km, day 7am–7pm / night). Final amount depends on the actual route.",
    ok_title: "Booking confirmed",
    ok_sub: "Your driver has been notified. A confirmation email is on its way.",
    ok_ref: "Tracking reference",
    ok_track: "Track my ride",
    ok_new: "New booking",
    ok_cal: "Add to calendar",
    ok_share: "Share",
    err_quote: "We couldn't compute this route. Please check the addresses.",
    err_book: "Booking failed. Please call us on +33 6 03 44 48 63.",
    err_phone: "Invalid phone number.",
    err_email: "Invalid email address.",
    err_past: "Pick a time at least 20 minutes from now.",
    trust1: "Professional drivers · 20 years of experience",
    trust2: "Any distance · Charente-Maritime and beyond",
    trust3: "Instant confirmation + live tracking",
  },
} satisfies Record<Lang, Record<string, string>>;

/* ─────────────────────── helpers date (Europe/Paris) ─────────────────────── */

function parisParts(d: Date) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => f.find((p) => p.type === t)?.value ?? "00";
  return { y: g("year"), m: g("month"), d: g("day"), h: g("hour"), mi: g("minute") };
}

/** "YYYY-MM-DDTHH:mm" à l'heure de Paris (valeur d'un input datetime-local). */
function parisLocalValue(d: Date): string {
  const p = parisParts(d);
  return `${p.y}-${p.m}-${p.d}T${p.h}:${p.mi}`;
}

function addMinutes(d: Date, min: number) {
  return new Date(d.getTime() + min * 60_000);
}

function tomorrow8(): string {
  const p = parisParts(addMinutes(new Date(), 24 * 60));
  return `${p.y}-${p.m}-${p.d}T08:00`;
}

function formatWhen(value: string, lang: Lang) {
  if (!value) return "";
  const d = new Date(`${value}:00`);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/* ────────────────────────────── UI atoms ────────────────────────────── */

function SectionCard({
  step,
  icon,
  title,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {step}
        </span>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold sm:text-xl">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Stepper({
  label,
  icon,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${label} -1`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition active:scale-95 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-base font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`${label} +1`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition active:scale-95 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </span>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background/70 text-foreground hover:border-primary/60 hover:bg-primary/5"
      }`}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────── page ────────────────────────────── */

type QuoteState = {
  loading: boolean;
  error: string | null;
  data:
    | (Extract<Awaited<ReturnType<typeof quoteRide>>, { ok: true }> & { key: string })
    | null;
};

const QUICK_DESTINATIONS = [
  "Gare de La Rochelle",
  "Aéroport La Rochelle-Île de Ré (LRH)",
  "Gare de Rochefort",
  "Gare de Saintes",
  "Gare de Royan",
  "Zoo de La Palmyre",
];

export function BookingStudio() {
  const { lang } = useI18n();
  const L = T[(lang === "en" ? "en" : "fr") as Lang];
  const isEn = lang === "en";
  const navigate = useNavigate();

  const getQuote = useServerFn(quoteRide);
  const book = useServerFn(bookRide);

  const [depart, setDepart] = useState("");
  const [departCoord, setDepartCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [arrivee, setArrivee] = useState("");
  const [arriveeCoord, setArriveeCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [when, setWhen] = useState(() => parisLocalValue(addMinutes(new Date(), 30)));
  const [quickWhen, setQuickWhen] = useState<"asap" | "1h" | "tomorrow" | null>("asap");
  const [pax, setPax] = useState(1);
  const [bags, setBags] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const [paiement, setPaiement] = useState<"cb" | "especes" | "facture">("cb");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ suiviId: string; prix: number } | null>(null);
  const [quote, setQuote] = useState<QuoteState>({ loading: false, error: null, data: null });

  const minWhen = useMemo(() => parisLocalValue(addMinutes(new Date(), 15)), []);

  const OPTION_LIST = useMemo(
    () => [
      { id: "baby", label: L.opt_baby, icon: <Baby className="h-4 w-4" /> },
      { id: "child", label: L.opt_child, icon: <Users className="h-4 w-4" /> },
      { id: "wheelchair", label: L.opt_wheel, icon: <Accessibility className="h-4 w-4" /> },
      { id: "pet", label: L.opt_pet, icon: <Dog className="h-4 w-4" /> },
      { id: "medical", label: L.opt_med, icon: <Stethoscope className="h-4 w-4" /> },
      { id: "flight", label: L.opt_flight, icon: <Timer className="h-4 w-4" /> },
    ],
    [L],
  );

  const setQuick = (kind: "asap" | "1h" | "tomorrow") => {
    setQuickWhen(kind);
    if (kind === "asap") setWhen(parisLocalValue(addMinutes(new Date(), 30)));
    else if (kind === "1h") setWhen(parisLocalValue(addMinutes(new Date(), 60)));
    else setWhen(tomorrow8());
  };

  const useMyPosition = useCallback(async () => {
    setLocating(true);
    try {
      const res = await locateUser();
      if (!res.ok) {
        toast.error(isEn ? "Location unavailable." : "Position indisponible.");
        return;
      }
      const { lat, lng } = res.fix;
      setDepartCoord({ lat, lng });
      const label = await placesReverse(lat, lng, lang).catch(() => null);
      setDepart(label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLocating(false);
    }
  }, [isEn, lang]);

  const swap = () => {
    setDepart(arrivee);
    setArrivee(depart);
    setDepartCoord(arriveeCoord);
    setArriveeCoord(departCoord);
  };

  /* ── devis en direct (debounce) ── */
  const seqRef = useRef(0);
  useEffect(() => {
    const ready = depart.trim().length >= 3 && arrivee.trim().length >= 3 && !!when;
    if (!ready) {
      setQuote({ loading: false, error: null, data: null });
      return;
    }
    const key = `${depart}|${arrivee}|${when}|${pax}|${bags}`;
    if (quote.data?.key === key) return;
    const seq = ++seqRef.current;
    setQuote((q) => ({ ...q, loading: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const res = await getQuote({
          data: {
            depart,
            depart_coord: departCoord,
            arrivee,
            arrivee_coord: arriveeCoord,
            pickup_datetime: `${when}:00`,
            passagers: pax,
            bagages: bags,
          },
        });
        if (seq !== seqRef.current) return;
        if (res.ok) setQuote({ loading: false, error: null, data: { ...res, key } });
        else setQuote({ loading: false, error: L.err_quote, data: null });
      } catch {
        if (seq === seqRef.current) setQuote({ loading: false, error: L.err_quote, data: null });
      }
    }, 550);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depart, arrivee, when, pax, bags, departCoord, arriveeCoord]);

  /* ── validation ── */
  const missing: string[] = [];
  const missingIds: string[] = [];
  if (depart.trim().length < 3) { missing.push(L.m_from); missingIds.push(""); }
  if (arrivee.trim().length < 3) { missing.push(L.m_to); missingIds.push(""); }
  if (!when) { missing.push(L.m_when); missingIds.push("when"); }
  if (nom.trim().length < 2) { missing.push(L.m_name); missingIds.push("nom"); }
  if (tel.replace(/\D/g, "").length < 9) { missing.push(L.m_phone); missingIds.push("tel"); }
  const canSubmit = missing.length === 0 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (missing.length > 0) {
      toast.error(`${L.missing} ${missing.join(", ")}`, { position: "top-center" });
      const el = missingIds[0] ? document.getElementById(missingIds[0]) : null;
      if (!el) window.scrollTo({ top: 0, behavior: "smooth" });
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        try { (el as HTMLElement).focus({ preventScroll: true }); } catch { /* noop */ }
      }
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error(L.err_email);
      return;
    }
    if (new Date(`${when}:00`).getTime() < Date.now() - 60 * 60_000) {
      toast.error(L.err_past);
      return;
    }
    setSubmitting(true);
    try {
      const optionLabels = options.map(
        (id) => OPTION_LIST.find((o) => o.id === id)?.label ?? id,
      );
      const res = await book({
        data: {
          depart,
          depart_coord: departCoord,
          arrivee,
          arrivee_coord: arriveeCoord,
          pickup_datetime: `${when}:00`,
          passagers: pax,
          bagages: bags,
          nom: nom.trim(),
          telephone: tel.trim(),
          email: email.trim() || null,
          paiement,
          options: optionLabels,
          note: note.trim(),
          lang: isEn ? "en" : "fr",
        },
      });
      if (!res.ok) {
        toast.error(res.error === "ROUTE_FAILED" ? L.err_quote : L.err_book, {
          position: "top-center",
        });
        return;
      }
      setSuccess({ suiviId: res.suivi_id, prix: res.prix });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("[booking] submit failed", err);
      toast.error(L.err_book, { position: "top-center" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── écran de confirmation ── */
  if (success) {
    const icsHref = buildIcs({
      when,
      depart,
      arrivee,
      lang: isEn ? "en" : "fr",
      ref: success.suiviId,
    });
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-primary/30 bg-card p-6 text-center shadow-lg sm:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{L.ok_title}</h1>
          <p className="mt-2 text-muted-foreground">{L.ok_sub}</p>

          <dl className="mt-6 space-y-2 rounded-2xl bg-secondary/60 p-4 text-left text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{L.from}</dt>
              <dd className="text-right font-medium">{depart}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{L.to}</dt>
              <dd className="text-right font-medium">{arrivee}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{L.when}</dt>
              <dd className="text-right font-medium">{formatWhen(when, isEn ? "en" : "fr")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{L.price}</dt>
              <dd className="text-right font-semibold text-primary">
                ≈ {success.prix.toFixed(2)} €
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{L.ok_ref}</dt>
              <dd className="text-right font-mono font-semibold">{success.suiviId}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/suivi/$id" params={{ id: success.suiviId }}>
                {L.ok_track}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={icsHref} download="course-access-prestige-taxi.ics">
                <CalendarClock className="mr-2 h-4 w-4" />
                {L.ok_cal}
              </a>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                const url = `${window.location.origin}/suivi/${success.suiviId}`;
                if (navigator.share) void navigator.share({ title: "Access Prestige Taxi", url });
                else {
                  void navigator.clipboard.writeText(url);
                  toast.success(isEn ? "Link copied" : "Lien copié");
                }
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {L.ok_share}
            </Button>
          </div>
          <button
            type="button"
            className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
            onClick={() => {
              setSuccess(null);
              setDepart("");
              setArrivee("");
              setNote("");
              setOptions([]);
              void navigate({ to: "/reserver" });
            }}
          >
            {L.ok_new}
          </button>
        </div>
      </main>
    );
  }

  const q = quote.data;
  const priceLabel = q ? `${q.prix.toFixed(2)} €` : null;

  const QuotePanel = (
    <div className="rounded-2xl border border-primary/25 bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <RouteIcon className="h-5 w-5 text-primary" />
        {L.quote}
      </h2>

      {!q && !quote.loading && (
        <p className="mt-3 text-sm text-muted-foreground">{quote.error ?? L.quote_wait}</p>
      )}
      {quote.loading && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {L.computing}
        </p>
      )}

      {q && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{L.price}</p>
            <p className="font-display text-4xl font-bold text-primary">≈ {priceLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {q.prix_detail.regime === "mixte"
                ? L.regime_mixte
                : q.prix_detail.regime === "nuit"
                  ? L.regime_nuit
                  : L.regime_jour}
            </p>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{L.distance}</dt>
              <dd className="font-medium tabular-nums">{q.distance_km.toFixed(1)} km</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{L.duration}</dt>
              <dd className="font-medium tabular-nums">{Math.round(q.duree_s / 60)} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{L.detail_base}</dt>
              <dd className="tabular-nums">{q.prix_detail.priseEnCharge.toFixed(2)} €</dd>
            </div>
            {q.prix_detail.prixJour > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {L.detail_day} ({q.prix_detail.kmJour.toFixed(1)} km)
                </dt>
                <dd className="tabular-nums">{q.prix_detail.prixJour.toFixed(2)} €</dd>
              </div>
            )}
            {q.prix_detail.prixNuit > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {L.detail_night} ({q.prix_detail.kmNuit.toFixed(1)} km)
                </dt>
                <dd className="tabular-nums">{q.prix_detail.prixNuit.toFixed(2)} €</dd>
              </div>
            )}
          </dl>

          <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/60 p-3 text-sm">
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                {L.vehicle}
              </span>
              {q.vehicule === "van" ? L.van : L.berline}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">{L.legal}</p>
        </div>
      )}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-40 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
      {submitting && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+1rem)] z-[70] mx-auto flex max-w-md items-center gap-3 rounded-lg border border-primary/30 bg-card p-4 shadow-xl"
        >
          <Loader2 className="h-6 w-6 shrink-0 animate-spin text-primary" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{L.submitting}</p>
            <p className="text-sm leading-snug text-muted-foreground">{L.submitting_detail}</p>
          </div>
        </div>
      )}
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{L.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {L.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {L.subtitle}
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          {[L.trust1, L.trust2, L.trust3].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      </header>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* 1 — trajet */}
          <SectionCard step={1} icon={<MapPin className="h-5 w-5" />} title={L.trip}>
            <div className="relative space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{L.from}</label>
                <div className="flex gap-2">
                  <AddressAutocomplete
                    className="flex-1"
                    value={depart}
                    lang={lang}
                    placeholder={L.from_ph}
                    onChange={(v: string, s?: GeocodeSuggestion) => {
                      setDepart(v);
                      setDepartCoord(s ? { lat: s.lat, lng: s.lng } : null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useMyPosition}
                    disabled={locating}
                    className="shrink-0"
                    aria-label={L.mypos}
                  >
                    {locating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Crosshair className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">{locating ? L.locating : L.mypos}</span>
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swap}
                  aria-label={L.swap}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition hover:border-primary hover:text-primary active:scale-95"
                >
                  <ArrowDownUp className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{L.to}</label>
                <AddressAutocomplete
                  value={arrivee}
                  lang={lang}
                  placeholder={L.to_ph}
                  onChange={(v: string, s?: GeocodeSuggestion) => {
                    setArrivee(v);
                    setArriveeCoord(s ? { lat: s.lat, lng: s.lng } : null);
                  }}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_DESTINATIONS.map((d) => (
                    <Chip
                      key={d}
                      active={arrivee === d}
                      onClick={() => {
                        setArrivee(d);
                        setArriveeCoord(null);
                      }}
                    >
                      {d}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2 — quand */}
          <SectionCard step={2} icon={<CalendarClock className="h-5 w-5" />} title={L.when}>
            <div className="flex flex-wrap gap-2">
              <Chip active={quickWhen === "asap"} onClick={() => setQuick("asap")}>
                {L.asap}
              </Chip>
              <Chip active={quickWhen === "1h"} onClick={() => setQuick("1h")}>
                {L.in1h}
              </Chip>
              <Chip active={quickWhen === "tomorrow"} onClick={() => setQuick("tomorrow")}>
                {L.tomorrow}
              </Chip>
            </div>
            <div className="mt-3">
              <label htmlFor="when" className="mb-1.5 block text-sm font-medium">
                {L.datetime}
              </label>
              <Input
                id="when"
                type="datetime-local"
                value={when}
                min={minWhen}
                step={300}
                onChange={(e) => {
                  setWhen(e.target.value);
                  setQuickWhen(null);
                }}
                className="h-12 text-base"
              />
              {when && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {formatWhen(when, isEn ? "en" : "fr")}
                </p>
              )}
            </div>
          </SectionCard>

          {/* 3 — passagers & options */}
          <SectionCard step={3} icon={<Users className="h-5 w-5" />} title={L.who}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stepper
                label={L.pax}
                icon={<Users className="h-4 w-4" />}
                value={pax}
                min={1}
                max={7}
                onChange={setPax}
              />
              <Stepper
                label={L.bags}
                icon={<Briefcase className="h-4 w-4" />}
                value={bags}
                min={0}
                max={10}
                onChange={setBags}
              />
            </div>

            <p className="mb-2 mt-5 text-sm font-medium">{L.options}</p>
            <div className="flex flex-wrap gap-2">
              {OPTION_LIST.map((o) => (
                <Chip
                  key={o.id}
                  active={options.includes(o.id)}
                  onClick={() =>
                    setOptions((prev) =>
                      prev.includes(o.id) ? prev.filter((x) => x !== o.id) : [...prev, o.id],
                    )
                  }
                >
                  {o.icon}
                  {o.label}
                </Chip>
              ))}
            </div>

            <p className="mb-2 mt-5 flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-primary" />
              {L.payment}
            </p>
            <div className="flex flex-wrap gap-2">
              {([
                ["cb", L.pay_cb],
                ["especes", L.pay_cash],
                ["facture", L.pay_inv],
              ] as const).map(([id, label]) => (
                <Chip key={id} active={paiement === id} onClick={() => setPaiement(id)}>
                  {label}
                </Chip>
              ))}
            </div>
          </SectionCard>

          {/* 4 — coordonnées */}
          <SectionCard step={4} icon={<User className="h-5 w-5" />} title={L.contact}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="nom" className="mb-1.5 block text-sm font-medium">
                  {L.name}
                </label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  autoComplete="name"
                  className="h-12 text-base"
                />
              </div>
              <div>
                <label htmlFor="tel" className="mb-1.5 block text-sm font-medium">
                  <Phone className="mr-1 inline h-3.5 w-3.5 text-primary" />
                  {L.phone}
                </label>
                <Input
                  id="tel"
                  type="tel"
                  inputMode="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  className="h-12 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  <Mail className="mr-1 inline h-3.5 w-3.5 text-primary" />
                  {L.email}
                </label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-12 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
                  {L.note}
                </label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={L.note_ph}
                  rows={3}
                  className="text-base"
                />
              </div>
            </div>
          </SectionCard>

          {/* panneau devis en flux mobile */}
          <div className="lg:hidden">{QuotePanel}</div>
        </div>

        {/* colonne devis desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {QuotePanel}
            <Button type="submit" size="lg" disabled={submitting} aria-disabled={!canSubmit} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {L.submitting}
                </>
              ) : (
                L.submit
              )}
            </Button>
            {missing.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                {L.missing} {missing.join(", ")}
              </p>
            )}
          </div>
        </aside>

        {/* barre d'action mobile / tablette */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">
                {missing.length ? `${L.missing} ${missing.join(", ")}` : L.price}
              </p>
              <p className="font-display text-xl font-bold text-primary">
                {quote.loading ? "…" : priceLabel ? `≈ ${priceLabel}` : "—"}
              </p>
            </div>
            <Button type="submit" size="lg" disabled={submitting} aria-disabled={!canSubmit} className="shrink-0">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : L.submit}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}

/* ────────────────────────────── .ics ────────────────────────────── */

function buildIcs(args: { when: string; depart: string; arrivee: string; lang: Lang; ref: string }) {
  const dt = new Date(`${args.when}:00`);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title =
    args.lang === "en" ? "Taxi — Access Prestige Taxi" : "Taxi — Access Prestige Taxi";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Access Prestige Taxi//Booking//FR",
    "BEGIN:VEVENT",
    `UID:${args.ref}@accessprestigetaxi`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(dt)}`,
    `DTEND:${stamp(new Date(dt.getTime() + 60 * 60_000))}`,
    `SUMMARY:${title}`,
    `LOCATION:${args.depart.replace(/[,;]/g, " ")}`,
    `DESCRIPTION:${args.depart} -> ${args.arrivee} (${args.ref})`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}
