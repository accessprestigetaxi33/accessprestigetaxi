import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, MapPin, Phone, Euro } from "lucide-react";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { socialImageMeta } from "@/lib/og";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";

const URL = `${SITE}/taxi-charente-maritime`;
const TITLE_FR = "Taxi Charente-Maritime : Marennes, Oléron | Access Prestige Taxi";
const DESC_FR =
  "Taxi en Charente-Maritime : Marennes, île d'Oléron, Rochefort, La Rochelle, Royan, Saintes. 5j/7 de 8h à 20h, tarifs officiels. Réservation immédiate.";
const TITLE_EN = "Taxi Charente-Maritime: Marennes, Oléron | Access Prestige Taxi";
const DESC_EN =
  "Taxi in Charente-Maritime: Marennes, Oléron island, Rochefort, La Rochelle, Royan, Saintes. 5 days a week, 8am-8pm, official fares. Book in seconds.";

export const Route = createFileRoute("/taxi-charente-maritime")({
  head: ({ match }) => ({
    meta: [
      keywordsMeta([
        "taxi Charente-Maritime",
        "taxi Marennes",
        "taxi île d'Oléron",
        "taxi Rochefort",
        "taxi La Rochelle",
        "taxi Royan",
        "taxi Saintes",
        "chauffeur privé Charente-Maritime",
        "réserver taxi Charente-Maritime",
      ]),
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
    links: seoLinks("/taxi-charente-maritime", match.search),
  }),
  component: TaxiCharenteMaritimePage,
});

const COPY = {
  fr: {
    eyebrow: "Charente-Maritime · Nouvelle-Aquitaine",
    h1: "Taxi en Charente-Maritime",
    lead:
      "Access Prestige Taxi, basé à Marennes, couvre tout le département : île d'Oléron, Rochefort, La Rochelle, Royan, Saintes, Saujon et toutes distances, en France comme en Europe.",
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
    areasT: "Nos pages locales",
    areasLead: "Deux pages dédiées détaillent nos horaires, tarifs et zones d'intervention :",
    areas: [
      {
        to: "/taxi-marennes" as const,
        title: "Taxi à Marennes",
        desc: "Marennes-Hiers-Brouage, Bourcefranc-le-Chapus, bassin de Marennes-Oléron, départs vers Rochefort et La Rochelle.",
      },
      {
        to: "/taxi-oleron" as const,
        title: "Taxi sur l'île d'Oléron",
        desc: "Le Château-d'Oléron, Saint-Trojan-les-Bains, Dolus-d'Oléron, Saint-Pierre-d'Oléron, Saint-Georges-d'Oléron, Chassiron.",
      },
    ],
    zoneT: "Zone d'intervention",
    zoneLead: "Au départ de Marennes, nous intervenons dans toute la Charente-Maritime :",
    zones: [
      "Marennes-Hiers-Brouage et le bassin ostréicole",
      "Île d'Oléron (toutes communes)",
      "Rochefort, Bourcefranc-le-Chapus",
      "La Rochelle et l'île de Ré",
      "Royan, Saintes, Saujon",
      "Gares et aéroports : La Rochelle, Bordeaux, Nantes, Poitiers",
      "Toutes distances en France et en Europe",
    ],
    fleetT: "Nos véhicules",
    fleet: [
      "BMW iX1 100 % électrique (Patricia) — 4 passagers",
      "Audi Q6 e-tron 100 % électrique (Alain) — 4 passagers",
      "Van Mercedes Classe V (Alain) — jusqu'à 7 passagers",
      "Sièges bébé et rehausseurs disponibles sur demande",
    ],
    ctaT: "Réservez votre taxi en Charente-Maritime",
    ctaP: "En ligne en moins d'une minute, ou par téléphone auprès de l'un de nos deux chauffeurs.",
  },
  en: {
    eyebrow: "Charente-Maritime · Nouvelle-Aquitaine",
    h1: "Taxi in Charente-Maritime",
    lead:
      "Access Prestige Taxi, based in Marennes, covers the whole department: Oléron island, Rochefort, La Rochelle, Royan, Saintes, Saujon and any distance, in France and across Europe.",
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
    areasT: "Our local pages",
    areasLead: "Two dedicated pages detail our hours, fares and service areas:",
    areas: [
      {
        to: "/taxi-marennes" as const,
        title: "Taxi in Marennes",
        desc: "Marennes-Hiers-Brouage, Bourcefranc-le-Chapus, the Marennes-Oléron basin, departures to Rochefort and La Rochelle.",
      },
      {
        to: "/taxi-oleron" as const,
        title: "Taxi on Oléron island",
        desc: "Le Château-d'Oléron, Saint-Trojan-les-Bains, Dolus-d'Oléron, Saint-Pierre-d'Oléron, Saint-Georges-d'Oléron, Chassiron.",
      },
    ],
    zoneT: "Service area",
    zoneLead: "Departing from Marennes, we drive across the whole Charente-Maritime:",
    zones: [
      "Marennes-Hiers-Brouage and the oyster basin",
      "Oléron island (all villages)",
      "Rochefort, Bourcefranc-le-Chapus",
      "La Rochelle and Ré island",
      "Royan, Saintes, Saujon",
      "Stations and airports: La Rochelle, Bordeaux, Nantes, Poitiers",
      "Any distance in France and Europe",
    ],
    fleetT: "Our vehicles",
    fleet: [
      "Fully electric BMW iX1 (Patricia) — 4 passengers",
      "Fully electric Audi Q6 e-tron (Alain) — 4 passengers",
      "Mercedes V-Class van (Alain) — up to 7 passengers",
      "Baby seats and boosters available on request",
    ],
    ctaT: "Book your taxi in Charente-Maritime",
    ctaP: "Online in under a minute, or by phone with one of our two drivers.",
  },
} as const;

function TaxiCharenteMaritimePage() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = COPY[isEn ? "en" : "fr"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TaxiService",
        "@id": `${URL}#service`,
        name: "Access Prestige Taxi — Charente-Maritime",
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
          "Charente-Maritime",
          "Marennes",
          "Île d'Oléron",
          "Rochefort",
          "La Rochelle",
          "Royan",
          "Saintes",
        ].map((name) => ({ "@type": "City", name })),
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "20:00",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: isEn ? "Taxi services in Charente-Maritime" : "Prestations taxi en Charente-Maritime",
          itemListElement: [
            "Trajets locaux et toutes distances",
            "Transport médical conventionné",
            "Transferts gares et aéroports",
            "Transport de groupe (jusqu'à 7 passagers)",
          ].map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${URL}#page`,
        url: URL,
        name: isEn ? TITLE_EN : TITLE_FR,
        description: isEn ? DESC_EN : DESC_FR,
        inLanguage: isEn ? "en" : "fr",
        isPartOf: { "@type": "WebSite", name: "Access Prestige Taxi", url: SITE },
        about: { "@id": `${URL}#service` },
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

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.areasT}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{c.areasLead}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {c.areas.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group rounded-2xl border border-[#e0b866]/25 bg-card p-6 transition hover:border-primary"
            >
              <h3 className="flex items-center justify-between gap-2 font-display text-lg font-semibold">
                {a.title}
                <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

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
    </div>
  );
}
