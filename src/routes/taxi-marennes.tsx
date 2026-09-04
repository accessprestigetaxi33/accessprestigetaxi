import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, MapPin, Phone, Euro } from "lucide-react";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { socialImageMeta } from "@/lib/og";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";

const URL = `${SITE}/taxi-marennes`;
const TITLE_FR = "Taxi à Marennes : horaires, tarifs et zone d'intervention | Access Prestige Taxi";
const DESC_FR =
  "Taxi privé basé à Marennes : 5j/7 de 8h à 20h, tarifs officiels, île d'Oléron, Rochefort, La Rochelle. Réservation en ligne immédiate.";
const TITLE_EN = "Taxi in Marennes: hours, fares and service area | Access Prestige Taxi";
const DESC_EN =
  "Private taxi based in Marennes: 5 days a week, 8am-8pm, official fares, Oléron island, Rochefort, La Rochelle. Book online in seconds.";

export const Route = createFileRoute("/taxi-marennes")({
  head: ({ match }) => ({
    meta: [
      { title: TITLE_FR },
      { name: "description", content: DESC_FR },
      { property: "og:title", content: TITLE_FR },
      { property: "og:description", content: DESC_FR },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE_FR },
      { name: "twitter:description", content: DESC_FR },
      ...socialImageMeta(TITLE_FR),
    ],
    links: seoLinks("/taxi-marennes", match.search),
  }),
  component: TaxiMarennesPage,
});

const COPY = {
  fr: {
    eyebrow: "Marennes · Charente-Maritime",
    h1: "Taxi à Marennes",
    lead:
      "Votre chauffeur privé basé à Marennes, au service de toute la Charente-Maritime : île d'Oléron, Bourcefranc-le-Chapus, Rochefort, La Rochelle et toutes distances.",
    book: "Réserver ma course",
    quote: "Demander un devis",
    call: "Appeler",
    hoursT: "Horaires",
    hours: [
      "5 jours sur 7, de 8h à 20h",
      "Réservation en ligne 24h/24",
      "Trajets longue distance sur rendez-vous",
      "Transport médical conventionné sur réservation",
    ],
    pricesT: "Tarifs",
    prices: [
      "Prise en charge : 2,83 €",
      "Tarif journée : 2,16 €/km",
      "Tarif nuit, dimanche et jours fériés : 3,24 €/km",
      "Devis gratuit et prix annoncé avant le départ",
    ],
    priceNote:
      "* Tarifs officiels taxi. L'estimation ne prend pas en compte bouchons et incidents : seul le compteur fait foi.",
    zoneT: "Zone d'intervention",
    zoneLead: "Nous intervenons au départ de Marennes vers toute la Charente-Maritime :",
    zones: [
      "Marennes-Hiers-Brouage",
      "Île d'Oléron (Le Château, Saint-Pierre, Saint-Trojan, Dolus…)",
      "Bourcefranc-le-Chapus",
      "Rochefort",
      "La Rochelle",
      "Royan, Saintes, Saujon",
      "Gares et aéroports : La Rochelle, Bordeaux, Nantes, Poitiers",
    ],
    fleetT: "Nos véhicules",
    fleet: [
      "BMW iX1 100 % électrique (Patricia) — 4 passagers",
      "Audi Q6 e-tron 100 % électrique (Alain) — 4 passagers",
      "Van Mercedes Classe V (Alain) — jusqu'à 7 passagers",
      "Sièges bébé et rehausseurs disponibles sur demande",
    ],
    ctaT: "Réservez votre taxi à Marennes",
    ctaP: "En ligne en moins d'une minute, ou par téléphone auprès de l'un de nos deux chauffeurs.",
    guides: "Nos guides Marennes & Oléron",
  },
  en: {
    eyebrow: "Marennes · Charente-Maritime",
    h1: "Taxi in Marennes",
    lead:
      "Your private driver based in Marennes, serving the whole Charente-Maritime area: Oléron island, Bourcefranc-le-Chapus, Rochefort, La Rochelle and any distance.",
    book: "Book my ride",
    quote: "Request a quote",
    call: "Call",
    hoursT: "Opening hours",
    hours: [
      "5 days a week, 8am to 8pm",
      "Online booking 24/7",
      "Long-distance trips by appointment",
      "Approved medical transport on booking",
    ],
    pricesT: "Fares",
    prices: [
      "Pick-up charge: €2.83",
      "Daytime rate: €2.16/km",
      "Night, Sunday and public holidays: €3.24/km",
      "Free quote and price confirmed before departure",
    ],
    priceNote:
      "* Official taxi fares. Estimates exclude traffic jams and incidents: only the taximeter is binding.",
    zoneT: "Service area",
    zoneLead: "We drive from Marennes across the whole Charente-Maritime:",
    zones: [
      "Marennes-Hiers-Brouage",
      "Oléron island (Le Château, Saint-Pierre, Saint-Trojan, Dolus…)",
      "Bourcefranc-le-Chapus",
      "Rochefort",
      "La Rochelle",
      "Royan, Saintes, Saujon",
      "Stations and airports: La Rochelle, Bordeaux, Nantes, Poitiers",
    ],
    fleetT: "Our vehicles",
    fleet: [
      "Fully electric BMW iX1 (Patricia) — 4 passengers",
      "Fully electric Audi Q6 e-tron (Alain) — 4 passengers",
      "Mercedes V-Class van (Alain) — up to 7 passengers",
      "Baby seats and boosters available on request",
    ],
    ctaT: "Book your taxi in Marennes",
    ctaP: "Online in under a minute, or by phone with one of our two drivers.",
    guides: "Our Marennes & Oléron guides",
  },
} as const;

const GUIDE_LINKS = [
  { slug: "taxi-a-marennes-chauffeur-prive", fr: "Taxi à Marennes : votre chauffeur privé", en: "Taxi in Marennes: your private driver" },
  { slug: "rejoindre-l-ile-d-oleron-en-taxi", fr: "Rejoindre l'île d'Oléron en taxi", en: "Reaching Oléron island by taxi" },
  { slug: "visiter-brouage-et-le-bassin-de-marennes-oleron", fr: "Visiter Brouage et le bassin de Marennes-Oléron", en: "Visiting Brouage and the Marennes-Oléron basin" },
] as const;

function TaxiMarennesPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = COPY[isEn ? "en" : "fr"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TaxiService",
        "@id": `${URL}#service`,
        name: "Access Prestige Taxi — Marennes",
        url: URL,
        description: isEn ? DESC_EN : DESC_FR,
        priceRange: "€€",
        provider: {
          "@type": "LocalBusiness",
          additionalType: "https://schema.org/TaxiService",
          name: "Access Prestige Taxi",
          url: SITE,
          telephone: DRIVERS.map((d) => d.intl),
          email: "accessprestigetaxi@gmail.com",
          priceRange: "€€",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Marennes-Hiers-Brouage",
            postalCode: "17320",
            addressRegion: "Charente-Maritime",
            addressCountry: "FR",
          },
          geo: { "@type": "GeoCoordinates", latitude: 45.8231, longitude: -1.1055 },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "08:00",
              closes: "20:00",
            },
          ],
        },
        areaServed: [
          "Marennes",
          "Île d'Oléron",
          "Bourcefranc-le-Chapus",
          "Rochefort",
          "La Rochelle",
          "Charente-Maritime",
        ].map((name) => ({ "@type": "City", name })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Access Prestige Taxi", item: SITE },
          { "@type": "ListItem", position: 2, name: c.h1, item: URL },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" /> {c.eyebrow}
      </span>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl md:text-[2.75rem] md:leading-tight">
        {c.h1}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.lead}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          to="/reserver"
          className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
        >
          {c.book} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/devis"
          className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#e0b866]/30 px-5 py-3.5 text-sm font-semibold transition hover:border-primary"
        >
          {c.quote}
        </Link>
        {DRIVERS.map((d) => (
          <a
            key={d.tel}
            href={`tel:${d.intl}`}
            className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#e0b866]/30 px-5 py-3.5 text-sm font-semibold transition hover:border-primary"
          >
            <Phone className="h-4 w-4 text-primary" /> {c.call} {d.name}
          </a>
        ))}
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-[#e0b866]/25 bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Clock className="h-5 w-5 text-primary" /> {c.hoursT}
          </h2>
          <ul className="mt-4 space-y-2">
            {c.hours.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {h}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e0b866]/25 bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Euro className="h-5 w-5 text-primary" /> {c.pricesT}
          </h2>
          <ul className="mt-4 space-y-2">
            {c.prices.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-destructive">{c.priceNote}</p>
        </section>
      </div>

      <section className="mt-12 rounded-2xl border border-[#e0b866]/25 bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold sm:text-2xl">
          <MapPin className="h-5 w-5 text-primary" /> {c.zoneT}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{c.zoneLead}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {c.zones.map((z) => (
            <li key={z} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {z}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.fleetT}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {c.fleet.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-[#e0b866]/25 bg-[#080b0d] p-6 sm:p-7">
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{c.ctaT}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{c.ctaP}</p>
        <Link
          to="/reserver"
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 sm:w-auto"
        >
          {c.book} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.guides}</h2>
        <ul className="mt-4 space-y-2">
          {GUIDE_LINKS.map((g) => (
            <li key={g.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: g.slug }}
                className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-90"
              >
                {isEn ? g.en : g.fr}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
