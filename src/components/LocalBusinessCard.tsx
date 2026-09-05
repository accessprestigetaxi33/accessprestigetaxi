import { Clock, Mail, MapPin, Navigation, Phone, Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { BUSINESS_EMAIL, BUSINESS_NAME } from "@/lib/business";

export type LocalListing = {
  /** Commune de rattachement affichée dans la fiche. */
  locality: string;
  postalCode: string;
  latitude: number;
  longitude: number;
};

const COPY = {
  fr: {
    eyebrow: "Fiche locale",
    title: (v: string) => `${BUSINESS_NAME} à ${v}`,
    hours: "Ouvert 5j/7, de 8h à 20h — réservation en ligne 24h/24",
    area: "Charente-Maritime",
    maps: "Voir sur Google Maps",
    route: "Itinéraire",
    review: "Laisser un avis Google",
    call: "Appeler",
    mail: "Écrire un e-mail",
    note:
      "Retrouvez-nous aussi sur Google : notre fiche d'établissement affiche nos horaires, notre zone d'intervention et les avis de nos clients.",
  },
  en: {
    eyebrow: "Local listing",
    title: (v: string) => `${BUSINESS_NAME} in ${v}`,
    hours: "Open 5 days a week, 8am–8pm — online booking 24/7",
    area: "Charente-Maritime",
    maps: "View on Google Maps",
    route: "Get directions",
    review: "Leave a Google review",
    call: "Call",
    mail: "Send an email",
    note:
      "Find us on Google too: our business listing shows our opening hours, service area and customer reviews.",
  },
} as const;

/**
 * Bloc « fiche locale / Google Business » réutilisé par les pages locales.
 * Il donne aux visiteurs (et aux moteurs) les mêmes signaux NAP que la fiche
 * d'établissement Google : nom, adresse, horaires, téléphones, itinéraire.
 */
export function LocalBusinessCard({ locality, postalCode, latitude, longitude }: LocalListing) {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = COPY[isEn ? "en" : "fr"];

  const query = encodeURIComponent(`${BUSINESS_NAME} ${locality} ${postalCode}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const reviewUrl = `https://www.google.com/search?q=${query}#lrd=,1,,`;

  return (
    <section className="mt-12 rounded-2xl border border-[#e0b866]/25 bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-primary">{c.eyebrow}</p>
      <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{c.title(locality)}</h2>

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {locality}, {postalCode} — {c.area}, France
        </li>
        <li className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {c.hours}
        </li>
        {DRIVERS.map((d) => (
          <li key={d.tel} className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {d.name} — <a href={`tel:${d.intl}`} className="font-semibold text-foreground underline underline-offset-4">{d.display}</a>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <a href={`mailto:${BUSINESS_EMAIL}`} className="underline underline-offset-4">
            {BUSINESS_EMAIL}
          </a>
        </li>
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.note}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#e0b866]/30 px-4 py-3 text-sm font-semibold transition hover:border-primary"
        >
          <MapPin className="h-4 w-4 text-primary" /> {c.maps}
        </a>
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#e0b866]/30 px-4 py-3 text-sm font-semibold transition hover:border-primary"
        >
          <Navigation className="h-4 w-4 text-primary" /> {c.route}
        </a>
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#e0b866]/30 px-4 py-3 text-sm font-semibold transition hover:border-primary"
        >
          <Star className="h-4 w-4 text-primary" /> {c.review}
        </a>
      </div>
    </section>
  );
}
