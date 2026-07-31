import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Star, UtensilsCrossed, BedDouble, Footprints, Landmark } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  GUIDE_ENTRIES,
  GUIDE_CATEGORIES,
  DEPTS,
  type GuideCategory,
  type Dept,
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
    title: "Charente & Charente-Maritime : où manger, dormir, marcher et s'émerveiller",
    lead:
      "Restaurants de caractère, hôtels étoilés, randonnées côtières et sites chargés d'histoire — sélectionnés par nos deux chauffeurs, et desservis en Audi Q6 e-tron 100 % électrique.",
    all: "Tout",
    filterCat: "Catégorie",
    filterDept: "Département",
    read: "Lire l'article",
    count: (n: number) => `${n} adresse${n > 1 ? "s" : ""}`,
    ctaTitle: "On vous y emmène",
    ctaText: "Trajet à la demande depuis Bordeaux, la Gironde et toute la Nouvelle-Aquitaine.",
    ctaBtn: "Réserver ma course",
  },
  en: {
    eyebrow: "The Access Prestige Taxi guide",
    title: "Charente & Charente-Maritime: where to eat, sleep, walk and wonder",
    lead:
      "Characterful restaurants, star-rated hotels, coastal hikes and history-rich sites — picked by our two drivers and served in a fully electric Audi Q6 e-tron.",
    all: "All",
    filterCat: "Category",
    filterDept: "Area",
    read: "Read the article",
    count: (n: number) => `${n} place${n > 1 ? "s" : ""}`,
    ctaTitle: "We'll take you there",
    ctaText: "On-demand rides from Bordeaux, the Gironde and across Nouvelle-Aquitaine.",
    ctaBtn: "Book a ride",
  },
} as const;

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Guide Charente & Charente-Maritime — Restaurants, hôtels, randos | Access Prestige Taxi" },
      {
        name: "description",
        content:
          "Guide complet de la Charente et de la Charente-Maritime : restaurants étoilés, hôtels classés par étoiles, randonnées et lieux à visiter avec leur histoire. Transport en taxi 100 % électrique.",
      },
      { property: "og:title", content: "Guide Charente & Charente-Maritime | Access Prestige Taxi" },
      {
        property: "og:description",
        content:
          "Restaurants, hôtels étoilés, randonnées et sites historiques de Charente et Charente-Maritime, avec photos et conseils.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
});

function BlogIndex() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;
  const [cat, setCat] = useState<GuideCategory | "all">("all");
  const [dept, setDept] = useState<Dept | "all">("all");

  const entries = useMemo(
    () =>
      GUIDE_ENTRIES.filter((e) => (cat === "all" || e.category === cat) && (dept === "all" || e.dept === dept)),
    [cat, dept],
  );

  return (
    <main className="pb-16">
      {/* HERO */}
      <section className="border-b border-border bg-[var(--gradient-dark,linear-gradient(180deg,#0b0b0d,#111014))]">
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

      {/* FILTRES */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur sm:top-20">
        <div className="mx-auto max-w-6xl space-y-2 px-3 py-3 sm:px-6">
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={cat === "all"} onClick={() => setCat("all")} label={c.all} />
            {GUIDE_CATEGORIES.map((g) => (
              <Chip
                key={g.key}
                active={cat === g.key}
                onClick={() => setCat(g.key)}
                label={isEn ? g.en : g.fr}
              />
            ))}
          </div>
          <div className="-mx-3 flex items-center gap-2 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <Chip active={dept === "all"} onClick={() => setDept("all")} label={c.all} subtle />
            {DEPTS.map((d) => (
              <Chip
                key={d.key}
                active={dept === d.key}
                onClick={() => setDept(d.key)}
                label={`${isEn ? d.en : d.fr} (${d.key})`}
                subtle
              />
            ))}
            <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground sm:inline">
              {c.count(entries.length)}
            </span>
          </div>
        </div>
      </section>

      {/* GRILLE */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e, i) => {
            const Icon = CAT_ICON[e.category];
            const txt = isEn ? e.en : e.fr;
            return (
              <article
                key={e.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60"
              >
                <Link to="/blog/$slug" params={{ slug: e.slug }} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <img
                      src={e.photos[0]}
                      alt={`${e.name} — ${e.city}`}
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
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
                  <div className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">
                      {e.city} · {e.dept}
                    </span>
                  </div>

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
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{c.ctaTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{c.ctaText}</p>
        <Link
          to="/reservation"
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
