import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Calculator, Info, Loader2, MapPin, Repeat, Users } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { searchAddress } from "@/lib/googleGeocode";
import { getDistanceAndDurationKm } from "@/lib/googleRoute";
import { detaillerPrix } from "@/lib/tarif";

export type EstimatePayload = {
  depart: string;
  arrivee: string;
  date: string;
  heure: string;
  allerRetour: boolean;
  passagers: number;
  vehicule: string;
  distanceKm: number | null;
  prix: number | null;
};

const COPY = {
  fr: {
    eyebrow: "Tarifs estimés",
    title: "Calculez le prix de votre trajet",
    lead:
      "Tarifs officiels taxi : prise en charge 2,83 €, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. Distances calculées avec Google Maps.",
    depart: "Adresse de départ",
    arrivee: "Adresse d'arrivée",
    date: "Date",
    heure: "Heure",
    allerRetour: "Aller-retour",
    passagers: "Passagers",
    vehicule: "Véhicule",
    vehicules: [
      { v: "BMW iX1 100 % électrique — 5 places", max: 4 },
      { v: "Audi Q6 e-tron électrique — 5 places", max: 4 },
      { v: "Van Mercedes classe V — 8 places", max: 7 },
    ],
    autoVan: "Van Mercedes sélectionné automatiquement (plus de 4 passagers).",
    compute: "Calculer l'estimation",
    computing: "Calcul en cours…",
    result: "Estimation",
    distance: "Distance",
    duration: "Durée estimée",
    regime: { jour: "Tarif jour", nuit: "Tarif nuit", mixte: "Tarif mixte jour/nuit" },
    round: "Aller-retour inclus (×2)",
    quote: "Demander un devis avec ces informations",
    disclaimer:
      "Estimation indicative calculée sur l'itinéraire Google Maps et les tarifs officiels. Le prix ferme vous est confirmé dans le devis. Le transport sanitaire conventionné est facturé selon la convention.",
    errAddr: "Adresse introuvable, précisez la ville.",
    errRoute: "Impossible de calculer l'itinéraire. Réessayez ou demandez un devis.",
  },
  en: {
    eyebrow: "Estimated fares",
    title: "Work out the price of your journey",
    lead:
      "Official taxi rates: €2.83 pickup, €2.16/km during the day and €3.24/km at night, on Sundays and public holidays. Distances computed with Google Maps.",
    depart: "Pickup address",
    arrivee: "Drop-off address",
    date: "Date",
    heure: "Time",
    allerRetour: "Return trip",
    passagers: "Passengers",
    vehicule: "Vehicle",
    vehicules: [
      { v: "BMW iX1 fully electric — 5 seats", max: 4 },
      { v: "Audi Q6 e-tron electric — 5 seats", max: 4 },
      { v: "Mercedes V-Class van — 8 seats", max: 7 },
    ],
    autoVan: "Mercedes van selected automatically (more than 4 passengers).",
    compute: "Calculate estimate",
    computing: "Calculating…",
    result: "Estimate",
    distance: "Distance",
    duration: "Estimated duration",
    regime: { jour: "Day rate", nuit: "Night rate", mixte: "Mixed day/night rate" },
    round: "Return trip included (×2)",
    quote: "Request a quote with these details",
    disclaimer:
      "Indicative estimate based on the Google Maps route and official rates. The firm price is confirmed in your quote. Covered medical transport is billed under the health-service agreement.",
    errAddr: "Address not found, please add the town.",
    errRoute: "Unable to compute the route. Try again or request a quote.",
  },
} as const;

/** Distance à vol d'oiseau (secours si Google Directions est indisponible). */
function haversineKm([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatEUR(v: number, lang: string) {
  return new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(v);
}

export function QuoteEstimator({ onQuote }: { onQuote?: (p: EstimatePayload) => void }) {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;

  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [date, setDate] = useState(todayISO());
  const [heure, setHeure] = useState("09:00");
  const [allerRetour, setAllerRetour] = useState(false);
  const [passagers, setPassagers] = useState(1);
  const [vehicule, setVehicule] = useState<string>(c.vehicules[0].v);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<{ km: number; min: number } | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Au-delà de 4 passagers, seul le van 8 places convient.
  useEffect(() => {
    const list = c.vehicules;
    if (passagers > 4) setVehicule(list[2].v);
    else if (vehicule === list[2].v && passagers <= 4) setVehicule(list[0].v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passagers, lang]);

  const detail = useMemo(() => {
    if (!route) return null;
    const km = allerRetour ? route.km * 2 : route.km;
    const min = allerRetour ? route.min * 2 : route.min;
    return detaillerPrix(km, `${date}T${heure}:00`, min);
  }, [route, allerRetour, date, heure]);

  async function compute() {
    setError(null);
    if (depart.trim().length < 3 || arrivee.trim().length < 3) {
      setError(c.errAddr);
      setState("error");
      return;
    }
    setState("loading");
    try {
      // Le géocodage peut rester bloqué (proxy lent, SDK restreint) : on borne l'attente.
      const [a, b] = await Promise.all([
        withTimeout(searchAddress(depart, 1).catch(() => null), 9000),
        withTimeout(searchAddress(arrivee, 1).catch(() => null), 9000),
      ]);
      if (!a?.length || !b?.length) {
        setError(c.errAddr);
        setState("error");
        return;
      }
      // Google Directions peut être indisponible (quota, restriction de domaine) :
      // on borne l'attente et on retombe sur une estimation à vol d'oiseau ×1,3.
      const dd = await withTimeout(getDistanceAndDurationKm(a[0].coord, b[0].coord).catch(() => null), 8000);
      if (dd && dd.distanceKm) {
        setRoute({ km: Math.round(dd.distanceKm * 10) / 10, min: Math.max(Math.round(dd.dureeS / 60), 1) });
      } else {
        const km = Math.round(haversineKm(a[0].coord, b[0].coord) * 1.3 * 10) / 10;
        if (!km) throw new Error("no route");
        setRoute({ km, min: Math.max(Math.round((km / 60) * 60), 1) });
      }
      setState("done");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch {
      setError(c.errRoute);
      setState("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[#d6a83d]/45 bg-[#07101a] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-primary";
  const labelCls = "text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70";

  return (
    <section
      id="tarifs"
      className="rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-5 text-white sm:p-7"
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
      <h2 className="mt-2 flex items-center gap-2 font-display text-xl font-semibold sm:text-2xl">
        <Calculator className="h-5 w-5 text-primary" /> {c.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.lead}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>{c.depart}</span>
          <div className="relative mt-1.5">
            <input
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              maxLength={180}
              placeholder="La Rochelle, gare SNCF"
              className={`${inputCls} pr-10`}
            />
            <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-primary" />
          </div>
        </label>
        <label className="block">
          <span className={labelCls}>{c.arrivee}</span>
          <div className="relative mt-1.5">
            <input
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              maxLength={180}
              placeholder="Royan, Pontaillac"
              className={`${inputCls} pr-10`}
            />
            <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-primary" />
          </div>
        </label>
        <label className="block">
          <span className={labelCls}>{c.date}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block">
          <span className={labelCls}>{c.heure}</span>
          <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block">
          <span className={labelCls}>{c.passagers}</span>
          <div className="relative mt-1.5">
            <input
              type="number"
              min={1}
              max={8}
              value={passagers}
              onChange={(e) => setPassagers(Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
              className={`${inputCls} pr-10`}
            />
            <Users className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-primary" />
          </div>
        </label>
        <label className="block">
          <span className={labelCls}>{c.vehicule}</span>
          <select value={vehicule} onChange={(e) => setVehicule(e.target.value)} className={`${inputCls} mt-1.5`}>
            {c.vehicules
              .filter((v) => passagers <= v.max)
              .map((v) => (
                <option key={v.v} value={v.v}>
                  {v.v}
                </option>
              ))}
          </select>
        </label>
      </div>

      {passagers > 4 && <p className="mt-2 text-xs text-primary">{c.autoVan}</p>}

      <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={allerRetour}
          onChange={(e) => setAllerRetour(e.target.checked)}
          className="h-4 w-4 accent-[hsl(var(--primary))]"
        />
        <Repeat className="h-4 w-4 text-primary" /> {c.allerRetour}
      </label>

      <button
        type="button"
        onClick={compute}
        disabled={state === "loading"}
        className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
        {state === "loading" ? c.computing : c.compute}
      </button>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      {detail && state === "done" && (
        <div ref={resultRef} className="mt-6 rounded-2xl border border-primary/40 bg-background p-5">
          <p className={labelCls}>{c.result}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-primary">{formatEUR(detail.total, lang)}</p>
          <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider">{c.distance}</dt>
              <dd className="text-foreground">{detail.distanceKm.toFixed(1)} km</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider">{c.duration}</dt>
              <dd className="text-foreground">{detail.dureeMin} min</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider">Tarif</dt>
              <dd className="text-foreground">{c.regime[detail.regime]}</dd>
            </div>
          </dl>
          {allerRetour && <p className="mt-3 text-xs text-primary">{c.round}</p>}
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.disclaimer}
          </p>
          {onQuote && (
            <button
              type="button"
              onClick={() =>
                onQuote({
                  depart,
                  arrivee,
                  date,
                  heure,
                  allerRetour,
                  passagers,
                  vehicule,
                  distanceKm: detail.distanceKm,
                  prix: detail.total,
                })
              }
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-primary/60 px-5 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              {c.quote} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
