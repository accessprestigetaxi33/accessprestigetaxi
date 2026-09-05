import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, MapPin, Phone, Euro } from "lucide-react";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { socialImageMeta } from "@/lib/og";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { LocalBusinessCard } from "@/components/LocalBusinessCard";

const URL = `${SITE}/taxi-oleron`;
const TITLE_FR = "Taxi île d'Oléron : horaires, tarifs | Access Prestige Taxi";
const DESC_FR =
  "Taxi sur l'île d'Oléron (Charente-Maritime) : 5j/7 de 8h à 20h, tarifs officiels, Le Château, Saint-Trojan, Dolus, Saint-Pierre. Réservation immédiate.";
const TITLE_EN = "Taxi Oléron island: hours and fares | Access Prestige Taxi";
const DESC_EN =
  "Taxi on Oléron island (Charente-Maritime): 5 days a week, 8am-8pm, official fares, Le Château, Saint-Trojan, Dolus, Saint-Pierre. Book in seconds.";

export const Route = createFileRoute("/taxi-oleron")({
  head: ({ match }) => ({
    meta: [
      keywordsMeta([
        "taxi île d'Oléron",
        "taxi Oléron",
        "taxi Le Château-d'Oléron",
        "taxi Saint-Trojan-les-Bains",
        "taxi Dolus-d'Oléron",
        "taxi Saint-Pierre-d'Oléron",
        "taxi Saint-Georges-d'Oléron",
        "réserver taxi Oléron",
        "tarif taxi Oléron",
        "taxi Marennes Oléron",
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
    links: seoLinks("/taxi-oleron", match.search),
  }),
  component: TaxiOleronPage,
});

const COPY = {
  fr: {
    eyebrow: "Île d'Oléron · Charente-Maritime",
    h1: "Taxi sur l'île d'Oléron",
    lead:
      "Votre chauffeur privé sur l'île d'Oléron, au départ de Marennes : Le Château-d'Oléron, Saint-Trojan-les-Bains, Dolus-d'Oléron, Saint-Pierre-d'Oléron, Saint-Georges-d'Oléron et toutes les communes de l'île.",
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
    zoneLead: "Nous intervenons sur toute l'île d'Oléron et au départ de l'île :",
    zones: [
      "Le Château-d'Oléron et son port ostréicole",
      "Saint-Trojan-les-Bains",
      "Dolus-d'Oléron et La Brée-les-Bains",
      "Saint-Pierre-d'Oléron et La Cotinière",
      "Saint-Georges-d'Oléron, Boyardville",
      "Le Douhet, Saint-Denis-d'Oléron, phare de Chassiron",
      "Viaduc de Martrou — liaison Marennes et continent",
    ],
    fleetT: "Nos véhicules",
    fleet: [
      "BMW iX1 100 % électrique (Patricia) — 4 passagers",
      "Audi Q6 e-tron 100 % électrique (Alain) — 4 passagers",
      "Van Mercedes Classe V (Alain) — jusqu'à 7 passagers",
      "Sièges bébé et rehausseurs disponibles sur demande",
    ],
    ctaT: "Réservez votre taxi sur l'île d'Oléron",
    ctaP: "En ligne en moins d'une minute, ou par téléphone auprès de l'un de nos deux chauffeurs.",
    guides: "Nos guides Oléron & Marennes",
    alsoTaxi: "Vous cherchez un taxi à Marennes ?",
  },
  en: {
    eyebrow: "Oléron island · Charente-Maritime",
    h1: "Taxi on Oléron island",
    lead:
      "Your private driver on Oléron island, departing from Marennes: Le Château-d'Oléron, Saint-Trojan-les-Bains, Dolus-d'Oléron, Saint-Pierre-d'Oléron, Saint-Georges-d'Oléron and every village on the island.",
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
    zoneLead: "We drive across the whole Oléron island and from the island:",
    zones: [
      "Le Château-d'Oléron and its oyster port",
      "Saint-Trojan-les-Bains",
      "Dolus-d'Oléron and La Brée-les-Bains",
      "Saint-Pierre-d'Oléron and La Cotinière",
      "Saint-Georges-d'Oléron, Boyardville",
      "Le Douhet, Saint-Denis-d'Oléron, Chassiron lighthouse",
      "Martrou viaduct — link to Marennes and the mainland",
    ],
    fleetT: "Our vehicles",
    fleet: [
      "Fully electric BMW iX1 (Patricia) — 4 passengers",
      "Fully electric Audi Q6 e-tron (Alain) — 4 passengers",
      "Mercedes V-Class van (Alain) — up to 7 passengers",
      "Baby seats and boosters available on request",
    ],
    ctaT: "Book your taxi on Oléron island",
    ctaP: "Online in under a minute, or by phone with one of our two drivers.",
    guides: "Our Oléron & Marennes guides",
    alsoTaxi: "Looking for a taxi in Marennes?",
  },
} as const;

const GUIDE_LINKS = [
  { slug: "rejoindre-l-ile-d-oleron-en-taxi", fr: "Rejoindre l'île d'Oléron en taxi", en: "Reaching Oléron island by taxi" },
  { slug: "taxi-a-marennes-chauffeur-prive", fr: "Taxi à Marennes : votre chauffeur privé", en: "Taxi in Marennes: your private driver" },
  { slug: "visiter-brouage-et-le-bassin-de-marennes-oleron", fr: "Visiter Brouage et le bassin de Marennes-Oléron", en: "Visiting Brouage and the Marennes-Oléron basin" },
] as const;

const ISLAND_TOWNS = [
  { slug: "taxi-le-chateau-d-oleron", name: "Le Château-d'Oléron" },
  { slug: "taxi-saint-trojan-les-bains", name: "Saint-Trojan-les-Bains" },
  { slug: "taxi-dolus-d-oleron", name: "Dolus-d'Oléron" },
  { slug: "taxi-saint-pierre-d-oleron", name: "Saint-Pierre-d'Oléron" },
] as const;

function TaxiOleronPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = COPY[isEn ? "en" : "fr"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TaxiService",
        "@id": `${URL}#service`,
        name: "Access Prestige Taxi — Île d'Oléron",
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
          hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            "Access Prestige Taxi Le Château-d'Oléron 17480",
          )}`,
          sameAs: [`${SITE}/`, `${SITE}/faq`],
          currenciesAccepted: "EUR",
          paymentAccepted: "Espèces, Carte bancaire, Virement, Tiers payant",
          geo: { "@type": "GeoCoordinates", latitude: 45.9, longitude: -1.2 },
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
          "Île d'Oléron",
          "Le Château-d'Oléron",
          "Saint-Trojan-les-Bains",
          "Dolus-d'Oléron",
          "Saint-Pierre-d'Oléron",
          "Saint-Georges-d'Oléron",
          "Marennes",
          "Charente-Maritime",
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
          name: isEn ? "Taxi services on Oléron island" : "Prestations taxi sur l'île d'Oléron",
          itemListElement: [
            "Trajets sur l'île et toutes distances",
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
        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          {isEn ? "Taxi by town on Oléron island" : "Taxi par commune sur l'île d'Oléron"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ISLAND_TOWNS.map((t) => (
            <Link
              key={t.slug}
              to="/taxi/$ville"
              params={{ ville: t.slug }}
              className="rounded-xl border border-[#e0b866]/25 bg-card px-4 py-3 text-sm font-semibold transition hover:border-primary"
            >
              {isEn ? `Taxi in ${t.name}` : `Taxi ${t.name}`}
            </Link>
          ))}
        </div>
      </section>

      <LocalBusinessCard locality="Le Château-d'Oléron" postalCode="17480" latitude={45.8886} longitude={-1.1958} />

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
        <p className="mt-4 text-sm">
          <Link to="/taxi-marennes" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
            {c.alsoTaxi}
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link to="/taxi-charente-maritime" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
            {isEn ? "Taxi across Charente-Maritime" : "Taxi dans toute la Charente-Maritime"}
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link to="/faq" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
            {isEn ? "Fares, meter and booking: read our FAQ" : "Tarifs, compteur et réservation : consultez notre FAQ"}
          </Link>
        </p>
      </section>
    </div>
  );
}
