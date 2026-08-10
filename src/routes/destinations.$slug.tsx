import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ArrowRight, Check, Clock, MapPin, Phone, Route as RouteIcon } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DESTINATIONS, getDestination } from "@/data/destinations";
import { DRIVERS } from "@/data/drivers";

const SITE = "https://accessprestigetaxi.lovable.app";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const dest = getDestination(params.slug);
    if (!dest) throw notFound();
    return { slug: dest.slug };
  },
  head: ({ params, match }) => {
    const dest = getDestination(params.slug);
    if (!dest) {
      return { meta: [{ title: "Destination introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE}/destinations/${dest.slug}`;
    return {
      meta: [
        { title: dest.fr.metaTitle },
        { name: "description", content: dest.fr.metaDescription },
        { property: "og:title", content: dest.fr.metaTitle },
        { property: "og:description", content: dest.fr.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "fr_FR" },
        { property: "og:locale:alternate", content: "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: dest.fr.metaTitle },
        { name: "twitter:description", content: dest.fr.metaDescription },
        ...socialImageMeta(dest.fr.metaTitle),
      ],
      links: seoLinks(`/destinations/${params.slug}`, match.search),
    };
  },
  notFoundComponent: () => {
    const { lang } = useI18n();
    const isEn = lang === "en";
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">
          {isEn ? "Destination not found" : "Destination introuvable"}
        </h1>
        <Link to="/destinations" className="mt-4 inline-block text-primary underline">
          {isEn ? "See all destinations" : "Voir toutes les destinations"}
        </Link>
      </div>
    );
  },
  errorComponent: () => {
    const { lang } = useI18n();
    const isEn = lang === "en";
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">
          {isEn ? "Page unavailable" : "Page indisponible"}
        </h1>
      </div>
    );
  },
  component: DestinationPage,
});

const UI = {
  fr: {
    back: "Toutes les destinations",
    book: "Réserver ce trajet",
    call: "Appeler",
    distance: "Distance",
    duration: "Durée moyenne",
    price: "À partir de",
    quote: "Conventionné CPAM",
    included: "Ce qui est inclus",
    faq: "Questions fréquentes",
    other: "Autres trajets",
    safety: "Sécurité, assurance et garanties",
  },
  en: {
    back: "All destinations",
    book: "Book this ride",
    call: "Call",
    distance: "Distance",
    duration: "Average duration",
    price: "From",
    quote: "Health-service covered",
    included: "What's included",
    faq: "Frequently asked questions",
    other: "Other routes",
    safety: "Safety, insurance and guarantees",
  },
} as const;

function DestinationPage() {
  const { slug } = Route.useLoaderData();
  const { lang } = useI18n();
  const isEn = lang === "en";
  const u = UI[isEn ? "en" : "fr"];
  const dest = getDestination(slug)!;
  const c = isEn ? dest.en : dest.fr;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: c.h1,
        serviceType: "Taxi service",
        provider: {
          "@type": "TaxiService",
          name: "Access Prestige Taxi",
          areaServed: ["Charente-Maritime"],
          telephone: DRIVERS.map((d) => d.intl),
        },
        areaServed: dest.dept,
        description: c.metaDescription,
        url: `${SITE}/destinations/${dest.slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const others = DESTINATIONS.filter((d) => d.slug !== dest.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link to="/destinations" className="text-xs uppercase tracking-[0.2em] text-primary">
        ← {u.back}
      </Link>

      <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" /> {dest.dept}
      </span>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl md:text-[2.75rem] md:leading-tight">{c.h1}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.lead}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat icon={RouteIcon} label={u.distance} value={`${dest.distanceKm} km`} />
        <Stat icon={Clock} label={u.duration} value={`${dest.durationMin} min`} />
        <Stat
          icon={Check}
          label={dest.priceFrom > 0 ? u.price : ""}
          value={dest.priceFrom > 0 ? `${dest.priceFrom} €` : u.quote}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/reserver"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
        >
          {u.book} <ArrowRight className="h-4 w-4" />
        </Link>
        {DRIVERS.map((d) => (
          <a
            key={d.tel}
            href={`tel:${d.intl}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3.5 text-sm font-semibold transition hover:border-primary/60"
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
        <Link to="/securite" className="mt-5 inline-block text-sm font-semibold text-primary underline">
          {u.safety} →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{u.faq}</h2>
        <div className="mt-4 space-y-4">
          {c.faq.map((f) => (
            <div key={f.q} className="rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">{u.other}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              to="/destinations/$slug"
              params={{ slug: o.slug }}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:border-primary/60"
            >
              {(isEn ? o.en : o.fr).title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </span>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
