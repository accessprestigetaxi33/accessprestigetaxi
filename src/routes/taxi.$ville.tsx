import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ArrowRight, Check, Clock, Euro, HelpCircle, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { VILLES, getVille } from "@/data/villes";
import { DRIVERS } from "@/data/drivers";
import { LocalReviews } from "@/components/LocalReviews";
import { LocalBusinessCard } from "@/components/LocalBusinessCard";

const SITE = "https://www.accessprestigetaxi.fr";

export const Route = createFileRoute("/taxi/$ville")({
  loader: ({ params }) => {
    const ville = getVille(params.ville);
    if (!ville) throw notFound();
    return { slug: ville.slug };
  },
  head: ({ params, match }) => {
    const ville = getVille(params.ville);
    if (!ville) {
      return { meta: [{ title: "Ville introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE}/taxi/${ville.slug}`;
    return {
      meta: [
        { title: ville.fr.metaTitle },
        { name: "description", content: ville.fr.metaDescription },
        { property: "og:title", content: ville.fr.metaTitle },
        { property: "og:description", content: ville.fr.metaDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "fr_FR" },
        { property: "og:locale:alternate", content: "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: ville.fr.metaTitle },
        { name: "twitter:description", content: ville.fr.metaDescription },
        ...socialImageMeta(ville.fr.metaTitle),
      ],
      links: seoLinks(`/taxi/${params.ville}`, match.search),
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold">Ville introuvable</h1>
      <Link to="/destinations" className="mt-4 inline-block text-primary underline">
        Voir nos destinations
      </Link>
    </div>
  ),
  component: VillePage,
});

const UI = {
  fr: {
    eyebrow: "Charente-Maritime",
    book: "Réserver ma course",
    quote: "Demander un devis",
    call: "Appeler",
    included: "Ce qui est inclus",
    faq: "Questions fréquentes",
    around: "Communes desservies",
    other: "Autres villes",
    hoursT: "Horaires",
    hours: "5 jours sur 7, de 8h à 20h — réservation en ligne 24h/24, longues distances sur rendez-vous.",
    pricesT: "Tarifs",
    prices: "Prise en charge 2,83 € · 2,16 €/km en journée · 3,24 €/km la nuit, le dimanche et les jours fériés. Devis gratuit.",
    priceNote: "* Tarif indicatif hors bouchons et incidents : seul le compteur du taxi fait foi.",
    island: "Voir la page Taxi île d'Oléron",
    marennes: "Voir la page Taxi Marennes",
    dept: "Voir la page Taxi Charente-Maritime",
    faqLink: "Tarifs, compteur et réservation : consultez notre FAQ",
  },
  en: {
    eyebrow: "Charente-Maritime",
    book: "Book my ride",
    quote: "Request a quote",
    call: "Call",
    included: "What's included",
    faq: "Frequently asked questions",
    around: "Towns and villages served",
    other: "Other towns",
    hoursT: "Opening hours",
    hours: "5 days a week, 8am to 8pm — online booking 24/7, long distances by appointment.",
    pricesT: "Fares",
    prices: "€2.83 pick-up · €2.16/km daytime · €3.24/km at night, on Sundays and public holidays. Free quote.",
    priceNote: "* Indicative fare, excluding traffic and incidents: only the taximeter is binding.",
    island: "See the Taxi Oléron island page",
    marennes: "See the Taxi Marennes page",
    dept: "See the Taxi Charente-Maritime page",
    faqLink: "Fares, meter and booking: read our FAQ",
  },
} as const;

function VillePage() {
  const { slug } = Route.useLoaderData();
  const { lang } = useI18n();
  const isEn = lang === "en";
  const u = UI[isEn ? "en" : "fr"];
  const ville = getVille(slug)!;
  const c = isEn ? ville.en : ville.fr;
  const url = `${SITE}/taxi/${ville.slug}`;

  // Schema.org : FAQPage (résultats enrichis) + LocalBusiness/TaxiService local
  // + fil d'ariane. Les questions/réponses affichées sont EXACTEMENT celles du
  // balisage, comme l'exige Google pour les rich results FAQ.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: isEn ? "en-GB" : "fr-FR",
        mainEntity: c.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "TaxiService",
        "@id": `${url}#service`,
        name: `Access Prestige Taxi — ${ville.name}`,
        url,
        description: c.metaDescription,
        provider: {
          "@type": "LocalBusiness",
          additionalType: "https://schema.org/TaxiService",
          name: "Access Prestige Taxi",
          url: SITE,
          telephone: DRIVERS.map((d) => d.intl),
          email: "accessprestigetaxi@gmail.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: ville.name,
            postalCode: ville.postal,
            addressRegion: "Charente-Maritime",
            addressCountry: "FR",
          },
          geo: { "@type": "GeoCoordinates", latitude: ville.lat, longitude: ville.lng },
          hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `Access Prestige Taxi ${ville.name} ${ville.postal}`,
          )}`,
          priceRange: "€€",
          currenciesAccepted: "EUR",
          paymentAccepted: "Espèces, Carte bancaire, Virement, Tiers payant",
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
          { "@type": "City", name: ville.name },
          ...ville.around.map((a) => ({ "@type": "City", name: a })),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Access Prestige Taxi", item: SITE },
          { "@type": "ListItem", position: 2, name: c.h1, item: url },
        ],
      },
    ],
  };

  const others = VILLES.filter((v) => v.slug !== ville.slug);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" /> {u.eyebrow}
      </span>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl md:text-[2.75rem] md:leading-tight">
        {c.h1}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.lead}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          to="/reserver"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
        >
          {u.book} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/devis"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3.5 text-sm font-semibold transition hover:border-primary/60"
        >
          {u.quote}
        </Link>
        {DRIVERS.map((d) => (
          <a
            key={d.tel}
            href={`tel:${d.intl}`}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3.5 text-sm font-semibold transition hover:border-primary/60"
          >
            <Phone className="h-4 w-4 text-primary" /> {u.call} {d.name}
          </a>
        ))}
      </div>

      <div className="mt-12 space-y-8">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">{s.h}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{s.p}</p>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{u.included}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {c.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {b}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-[#e0b866]/25 bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Clock className="h-5 w-5 text-primary" /> {u.hoursT}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{u.hours}</p>
        </section>
        <section className="rounded-2xl border border-[#e0b866]/25 bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Euro className="h-5 w-5 text-primary" /> {u.pricesT}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{u.prices}</p>
          <p className="mt-3 text-xs leading-relaxed text-destructive">{u.priceNote}</p>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{u.around}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{[ville.name, ...ville.around].join(" · ")}</p>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold sm:text-2xl">
          <HelpCircle className="h-5 w-5 text-primary" /> {u.faq}
        </h2>
        <div className="mt-4 space-y-4">
          {c.faq.map((f) => (
            <details key={f.q} className="rounded-xl border border-border bg-card/50 p-5" open>
              <summary className="cursor-pointer list-none text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <LocalBusinessCard
        locality={ville.name}
        postalCode={ville.postal}
        latitude={ville.lat}
        longitude={ville.lng}
      />

      <section className="mt-10 space-y-2">
        {ville.island ? (
          <p className="text-sm">
            <Link to="/taxi-oleron" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
              {u.island}
            </Link>
          </p>
        ) : null}
        {ville.marennes ? (
          <p className="text-sm">
            <Link to="/taxi-marennes" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
              {u.marennes}
            </Link>
          </p>
        ) : null}
        <p className="text-sm">
          <Link to="/taxi-charente-maritime" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
            {u.dept}
          </Link>
        </p>
        <p className="text-sm">
          <Link to="/faq" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
            {u.faqLink}
          </Link>
        </p>
      </section>

      <LocalReviews villeName={ville.name} serviceId={`${url}#service`} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">{u.other}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <Link
              key={o.slug}
              to="/taxi/$ville"
              params={{ ville: o.slug }}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:border-primary/60"
            >
              {isEn ? `Taxi in ${o.name}` : `Taxi ${o.name}`}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
