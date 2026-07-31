import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Phone, Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { GUIDE_ENTRIES, GUIDE_CATEGORIES, getGuideEntry, type GuideEntry } from "@/data/guide-charente";

const PHONE = "0673072322";
const PHONE_DISPLAY = "06 73 07 23 22";

const COPY = {
  fr: {
    back: "Retour au guide",
    history: "L'histoire du lieu",
    tips: "Nos conseils",
    gallery: "En images",
    practical: "En bref",
    nearby: "À découvrir aussi",
    ctaTitle: "Trajet en taxi 100 % électrique",
    ctaText: "Nos deux chauteurs vous conduisent en Audi Q6 e-tron, 7j/7 et 24h/24, depuis Bordeaux et la Gironde.",
    book: "Réserver ma course",
    call: "Appeler un chauffeur",
    stars: "étoiles",
  },
  en: {
    back: "Back to the guide",
    history: "The story of the place",
    tips: "Our tips",
    gallery: "In pictures",
    practical: "At a glance",
    nearby: "Also worth a look",
    ctaTitle: "Ride in a fully electric taxi",
    ctaText: "Our two drivers take you there in an Audi Q6 e-tron, 24/7, from Bordeaux and the Gironde.",
    book: "Book a ride",
    call: "Call a driver",
    stars: "stars",
  },
} as const;

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const entry = getGuideEntry(params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  component: BlogArticle,
  head: ({ params }) => {
    const e = getGuideEntry(params.slug);
    if (!e) return {};
    const title = `${e.name}, ${e.city} — Guide Charente | Access Prestige Taxi`;
    const desc = e.fr.teaser.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${e.slug}` },
        { property: "og:image", content: e.photos[0] },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: e.photos[0] },
      ],
      links: [{ rel: "canonical", href: `/blog/${e.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type":
              e.category === "hotel" ? "Hotel" : e.category === "restaurant" ? "Restaurant" : "TouristAttraction",
            name: e.name,
            description: e.fr.teaser,
            image: e.photos,
            address: {
              "@type": "PostalAddress",
              addressLocality: e.city,
              addressRegion: e.dept === "16" ? "Charente" : "Charente-Maritime",
              addressCountry: "FR",
            },
            ...(e.stars ? { starRating: { "@type": "Rating", ratingValue: e.stars } } : {}),
          }),
        },
      ],
    };
  },
});

function BlogArticle() {
  const { slug } = Route.useParams();
  const entry = getGuideEntry(slug) as GuideEntry;
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;
  const txt = isEn ? entry.en : entry.fr;
  const catLabel = GUIDE_CATEGORIES.find((g) => g.key === entry.category)!;
  const others = GUIDE_ENTRIES.filter((e) => e.slug !== entry.slug && e.dept === entry.dept).slice(0, 3);

  return (
    <main className="pb-16">
      <article>
        {/* HERO IMAGE */}
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden bg-secondary sm:aspect-[21/9]">
            <img
              src={entry.photos[0]}
              alt={`${entry.name}, ${entry.city}`}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="mx-auto -mt-12 max-w-3xl px-4 sm:-mt-20 sm:px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {c.back}
          </Link>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="text-primary">{isEn ? catLabel.en : catLabel.fr}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {entry.city} ({entry.dept})
            </span>
          </p>

          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {entry.name}
          </h1>

          {entry.stars ? (
            <p className="mt-3 flex items-center gap-1" aria-label={`${entry.stars} ${c.stars}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < entry.stars! ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4 text-border"}
                />
              ))}
              <span className="ml-2 text-sm font-semibold text-foreground">
                {entry.stars} {c.stars}
              </span>
            </p>
          ) : null}
          {entry.michelin ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/50 px-3 py-1 text-xs font-semibold text-primary">
              {entry.michelin} {isEn ? "Michelin star" : "étoile"}
              {entry.michelin > 1 ? "s" : ""} Michelin
            </p>
          ) : null}

          <p className="mt-5 text-base leading-relaxed text-foreground/90 sm:text-lg">{txt.teaser}</p>

          {/* EN BREF */}
          <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {entry.facts.map((f, i) => (
              <div key={i} className="bg-card px-4 py-4">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.practical} · {i + 1}
                </dt>
                <dd className="mt-1 text-sm font-medium text-card-foreground">{isEn ? f.en : f.fr}</dd>
              </div>
            ))}
          </dl>

          {/* HISTOIRE */}
          <h2 className="mt-10 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.history}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{txt.history}</p>

          {/* GALERIE — 3 photos */}
          <h2 className="mt-10 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.gallery}</h2>
        </div>

        <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {entry.photos.map((src, i) => (
              <figure key={i} className="overflow-hidden rounded-2xl border border-border bg-secondary">
                <img
                  src={src}
                  alt={`${entry.name} — ${isEn ? "photo" : "photo"} ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* CONSEILS */}
          <h2 className="mt-10 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.tips}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{txt.tips}</p>

          {/* CTA */}
          <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <h2 className="font-display text-xl font-semibold text-card-foreground sm:text-2xl">{c.ctaTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.ctaText}</p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <Link
                to="/reservation"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
              >
                {c.book} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${PHONE}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                <Phone className="h-4 w-4 text-primary" /> {PHONE_DISPLAY}
              </a>
            </div>
          </section>

          {/* AUTRES */}
          <h2 className="mt-12 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.nearby}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                to="/blog/$slug"
                params={{ slug: o.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60"
              >
                <img
                  src={o.photos[0]}
                  alt={`${o.name}, ${o.city}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.city}</p>
                  <p className="mt-1 font-display text-base font-semibold text-card-foreground">{o.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
