import { socialImageMeta } from "@/lib/og";
import { imgAt, imgSrcSet } from "@/lib/img";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Search, Star, UtensilsCrossed, BedDouble, Footprints, Landmark, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  GUIDE_ENTRIES,
  GUIDE_CATEGORIES,
  GUIDE_TAGS,
  GUIDE_CITY_STATS,
  guideTags,
  normalize,
  type GuideCategory,
  type GuideTag,
} from "@/data/guide-charente";

const CAT_ICON: Record<GuideCategory, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  hotel: BedDouble,
  randonnee: Footprints,
  visite: Landmark,
};

const COPY = {
  fr: {
    eyebrow: "Le guide Access Prestige Taxi",
    title: "Charente-Maritime : où manger, dormir, marcher et s'émerveiller",
    lead:
      "Restaurants de caractère, hôtels étoilés, randonnées côtières et sites chargés d'histoire — sélectionnés par nos deux chauffeurs, et desservis en BMW iX1 100 % électrique.",
    all: "Tout",
    filterCat: "Catégorie",
    filterCity: "Ville ou village",
    filterTag: "Thématique",
    allCities: "Toutes les villes",
    searchLabel: "Rechercher une adresse, une ville, un lieu",
    searchPlaceholder: "Rechercher : La Rochelle, huîtres, château…",
    reset: "Réinitialiser",
    empty: "Aucune adresse ne correspond à votre recherche.",
    more: "Voir plus d'adresses",
    read: "Lire l'article",
    count: (n: number) => `${n} adresse${n > 1 ? "s" : ""}`,
    ctaTitle: "On vous y emmène",
    ctaText: "Trajet à la demande dans toute la Charente-Maritime, en BMW iX1 électrique, Audi Q6 e-tron ou van Mercedes 7 places.",
    ctaBtn: "Réserver ma course",
  },
  en: {
    eyebrow: "The Access Prestige Taxi guide",
    title: "Charente-Maritime: where to eat, sleep, walk and wonder",
    lead:
      "Characterful restaurants, star-rated hotels, coastal hikes and history-rich sites — picked by our two drivers and served in a fully electric BMW iX1.",
    all: "All",
    filterCat: "Category",
    filterCity: "Town or village",
    filterTag: "Theme",
    allCities: "All towns",
    searchLabel: "Search a place, a town, a landmark",
    searchPlaceholder: "Search: La Rochelle, oysters, castle…",
    reset: "Reset",
    empty: "No place matches your search.",
    more: "Show more places",
    read: "Read the article",
    count: (n: number) => `${n} place${n > 1 ? "s" : ""}`,
    ctaTitle: "We'll take you there",
    ctaText: "On-demand rides across Charente-Maritime in an electric BMW iX1, Audi Q6 e-tron or 7-seat Mercedes van.",
    ctaBtn: "Book a ride",
  },
} as const;

const BLOG_TITLE = "Guide Charente-Maritime — Restaurants, hôtels, randos";
const BLOG_DESC =
  "Guide de la Charente-Maritime : restaurants, hôtels étoilés, randonnées et lieux à visiter, avec taxi 100 % électrique.";
const BLOG_OG_DESC =
  "Restaurants, hôtels étoilés, randonnées et sites historiques de Charente-Maritime, avec photos et conseils.";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: ({ match }) => ({
    meta: [
      { title: BLOG_TITLE },
      { name: "description", content: BLOG_DESC },
      { property: "og:title", content: BLOG_TITLE },
      { property: "og:description", content: BLOG_OG_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/blog` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: BLOG_TITLE },
      { name: "twitter:description", content: BLOG_OG_DESC },
      ...socialImageMeta(BLOG_TITLE),
    ],
    links: seoLinks("/blog", match.search),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: BLOG_TITLE,
              description: BLOG_DESC,
              url: `${SITE}/blog`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
                { "@type": "ListItem", position: 2, name: "Guide", item: `${SITE}/blog` },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

const PAGE_SIZE = 24;

function BlogIndex() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;
  const [cat, setCat] = useState<GuideCategory | "all">("all");
  const [city, setCity] = useState<string | "all">("all");
  const [tag, setTag] = useState<GuideTag | "all">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const indexed = useMemo(
    () =>
      GUIDE_ENTRIES.map((e) => ({
        e,
        tags: guideTags(e),
        hay: normalize([e.name, e.city, e.fr.teaser, e.en.teaser, ...e.facts.map((f) => `${f.fr} ${f.en}`)].join(" ")),
      })),
    [],
  );

  const entries = useMemo(() => {
    const q = normalize(query);
    return indexed
      .filter(
        (r) =>
          (cat === "all" || r.e.category === cat) &&
          (city === "all" || r.e.city === city) &&
          (tag === "all" || r.tags.includes(tag)) &&
          (q === "" || r.hay.includes(q)),
      )
      .map((r) => r.e);
  }, [indexed, cat, city, tag, query]);

  const visible = entries.slice(0, limit);
  const resetAll = () => {
    setCat("all");
    setCity("all");
    setTag("all");
    setQuery("");
    setLimit(PAGE_SIZE);
  };
  const onFilterChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setLimit(PAGE_SIZE);
  };
  const hasFilter = cat !== "all" || city !== "all" || tag !== "all" || query !== "";

  return (
    <main className="pb-16">
      {/* HERO */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary sm:text-[11px]">{c.eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-balance font-display text-2xl font-semibold leading-tight text-foreground sm:text-4xl">
            {c.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {c.lead}
          </p>
        </div>
      </section>

      {/* FILTRES : recherche + catégories + thématiques + villes */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur sm:top-20">
        <div className="mx-auto max-w-7xl space-y-2.5 px-3 py-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(ev) => {
                setQuery(ev.target.value);
                setLimit(PAGE_SIZE);
              }}
              aria-label={c.searchLabel}
              placeholder={c.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-24 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
            />
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-xs text-muted-foreground sm:inline">
              {c.count(entries.length)}
            </span>
          </div>

          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={cat === "all"} onClick={() => onFilterChange(setCat)("all")} label={c.all} />
            {GUIDE_CATEGORIES.map((g) => (
              <Chip
                key={g.key}
                active={cat === g.key}
                onClick={() => onFilterChange(setCat)(g.key)}
                label={isEn ? g.en : g.fr}
              />
            ))}
          </div>

          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={tag === "all"} onClick={() => onFilterChange(setTag)("all")} label={c.filterTag} subtle />
            {GUIDE_TAGS.map((t) => (
              <Chip
                key={t.key}
                active={tag === t.key}
                onClick={() => onFilterChange(setTag)(tag === t.key ? "all" : t.key)}
                label={isEn ? t.en : t.fr}
                subtle
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="guide-city">
              {c.filterCity}
            </label>
            <select
              id="guide-city"
              value={city}
              onChange={(ev) => {
                setCity(ev.target.value);
                setLimit(PAGE_SIZE);
              }}
              className="h-10 min-w-[200px] flex-1 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary sm:flex-none"
            >
              <option value="all">{c.allCities}</option>
              {GUIDE_CITY_STATS.map((s) => (
                <option key={s.city} value={s.city}>
                  {s.city} ({s.count})
                </option>
              ))}
            </select>
            {hasFilter && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <X className="h-3.5 w-3.5" /> {c.reset}
              </button>
            )}
            <span className="ml-auto text-xs text-muted-foreground sm:hidden">{c.count(entries.length)}</span>
          </div>
        </div>
      </section>

      {/* NAVIGATION PAR VILLE ET VILLAGE */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <h2 className="text-[11px] uppercase tracking-[0.28em] text-primary">{c.filterCity}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {GUIDE_CITY_STATS.map((s) => (
            <button
              key={s.city}
              type="button"
              aria-pressed={city === s.city}
              onClick={() => onFilterChange(setCity)(city === s.city ? "all" : s.city)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                city === s.city
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-primary/60",
              ].join(" ")}
            >
              <MapPin className="h-3 w-3 shrink-0" />
              {s.city}
              <span className={city === s.city ? "opacity-80" : "text-muted-foreground"}>{s.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* GRILLE */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{c.empty}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {visible.map((e, i) => {
              const Icon = CAT_ICON[e.category];
              const txt = isEn ? e.en : e.fr;
              const tags = guideTags(e).slice(0, 3);
              return (
                <article
                  key={e.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60"
                >
                  <Link to="/blog/$slug" params={{ slug: e.slug }} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                      <img
                        src={imgAt(e.photos[0], 500)}
                        srcSet={imgSrcSet(e.photos[0], [250, 330, 500])}
                        sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        alt={`${e.name}, ${e.city} — ${isEn ? "Charente-Maritime guide by Access Prestige Taxi" : "guide Charente-Maritime par Access Prestige Taxi"}`}
                        loading={i < 3 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : "auto"}
                        decoding="async"
                        width={640}
                        height={480}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                        <Icon className="h-3 w-3" />
                        {isEn
                          ? GUIDE_CATEGORIES.find((g) => g.key === e.category)!.en
                          : GUIDE_CATEGORIES.find((g) => g.key === e.category)!.fr}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => onFilterChange(setCity)(e.city)}
                      className="flex min-w-0 items-center gap-2 text-left text-[11px] uppercase tracking-widest text-muted-foreground transition hover:text-primary"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{e.city}</span>
                    </button>

                    <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-card-foreground">
                      <Link to="/blog/$slug" params={{ slug: e.slug }} className="hover:text-primary">
                        {e.name}
                      </Link>
                    </h2>

                    {e.stars ? <Stars n={e.stars} /> : null}
                    {e.michelin ? (
                      <p className="mt-1.5 text-xs font-semibold text-primary">
                        {e.michelin} {isEn ? "Michelin star" : "étoile"}
                        {e.michelin > 1 ? "s" : ""} Michelin
                      </p>
                    ) : null}

                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{txt.teaser}</p>

                    {tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.map((t) => {
                          const def = GUIDE_TAGS.find((g) => g.key === t)!;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => onFilterChange(setTag)(t)}
                              className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary"
                            >
                              {isEn ? def.en : def.fr}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <Link
                      to="/blog/$slug"
                      params={{ slug: e.slug }}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      {c.read} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {visible.length < entries.length && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              {c.more} ({entries.length - visible.length})
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{c.ctaTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{c.ctaText}</p>
        <Link
          to="/reserver"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 sm:w-auto"
        >
          {c.ctaBtn} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}

function Chip({
  active,
  onClick,
  label,
  subtle,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition",
        subtle ? "py-1.5" : "py-2",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/80 hover:border-primary/60",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <p className="mt-1.5 flex items-center gap-0.5" aria-label={`${n}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < n ? "h-3.5 w-3.5 fill-primary text-primary" : "h-3.5 w-3.5 text-border"}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-muted-foreground">{n}★</span>
    </p>
  );
}
