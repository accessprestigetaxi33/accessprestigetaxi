import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ArrowRight, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DESTINATIONS } from "@/data/destinations";

const SITE = "https://www.accessprestigetaxi.fr";
const TITLE = "Destinations taxi Charente-Maritime — Access Prestige Taxi";
const DESC =
  "Nos trajets taxi les plus réservés en Charente-Maritime : gare TGV d'Angoulême, aéroport de Bordeaux, île de Ré, Royan, vignobles de Cognac et transport conventionné.";

export const Route = createFileRoute("/destinations/")({
  head: ({ match }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/destinations` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...socialImageMeta(TITLE),
    ],
    links: seoLinks("/destinations", match.search),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: TITLE,
              description: DESC,
              url: `${SITE}/destinations`,
            },
            {
              "@type": "ItemList",
              itemListElement: DESTINATIONS.map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: d.fr.h1,
                url: `${SITE}/destinations/${d.slug}`,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
                { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE}/destinations` },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: DestinationsIndex,
});

const COPY = {
  fr: {
    eyebrow: "Destinations",
    h1: "Destinations taxi en Charente-Maritime",
    lead:
      "Chaque trajet dispose de sa page dédiée : distance, durée, tarif de départ et conseils pratiques. Deux chauffeurs, une BMW iX1 électrique et un van Mercedes 7 places, zéro émission en Charente-Maritime.",
    from: "À partir de",
    onQuote: "Sur prescription",
    see: "Voir le trajet",
  },
  en: {
    eyebrow: "Destinations",
    h1: "Taxi destinations across Charente-Maritime",
    lead:
      "Every route has its own page: distance, duration, starting fare and practical tips. Two drivers, one electric BMW iX1 and one 7-seat Mercedes van, zero emissions across Charente-Maritime.",
    from: "From",
    onQuote: "On prescription",
    see: "View this route",
  },
} as const;

function DestinationsIndex() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = COPY[isEn ? "en" : "fr"];

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl md:text-5xl">{c.h1}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((d) => {
          const copy = isEn ? d.en : d.fr;
          return (
            <Link
              key={d.slug}
              to="/destinations/$slug"
              params={{ slug: d.slug }}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {d.dept}
              </span>
              <h2 className="mt-3 font-display text-lg font-semibold text-card-foreground">{copy.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{copy.lead}</p>
              <span className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>
                  {d.priceFrom > 0 ? `${c.from} ${d.priceFrom} €` : c.onQuote} · {d.durationMin} min
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  {c.see} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
