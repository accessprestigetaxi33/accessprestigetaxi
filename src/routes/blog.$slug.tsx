import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { imgAt, imgSrcSet } from "@/lib/img";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { ArrowLeft, ArrowRight, MapPin, Phone, Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { GUIDE_ENTRIES, GUIDE_CATEGORIES, getGuideEntry, guideName, type GuideEntry } from "@/data/guide-charente";
import { Languages } from "lucide-react";

const PHONE = "0650260015";
const PHONE_DISPLAY = "06 50 26 00 15";

const COPY = {
  fr: {
    back: "Retour au guide",
    history: "L'histoire du lieu",
    tips: "Nos conseils",
    gallery: "En images",
    practical: "En bref",
    nearby: "À découvrir aussi",
    ctaTitle: "Trajet en taxi 100 % électrique",
    ctaText: "Nos deux chauffeurs vous conduisent partout depuis la Charente-Maritime, en BMW iX1 ou Audi Q6 e-tron 5 places, ou en van Mercedes 8 places.",
    book: "Réserver ma course",
    bookHere: "Réserver un taxi vers",
    call: "Appeler un chauffeur",
    stars: "étoiles",
    homeLink: "Taxi à Marennes et en Charente-Maritime : découvrir notre service",
    readEn: "Read in English",
  },
  en: {
    back: "Back to the guide",
    history: "The story of the place",
    tips: "Our tips",
    gallery: "In pictures",
    practical: "At a glance",
    nearby: "Also worth a look",
    ctaTitle: "Ride in a fully electric taxi",
    ctaText: "Our two drivers take you anywhere from Charente-Maritime in a 5-seat BMW iX1 or Audi Q6 e-tron, or an 8-seat Mercedes van.",
    book: "Book a ride",
    bookHere: "Book a taxi to",
    call: "Call a driver",
    stars: "stars",
    homeLink: "Taxi in Marennes and Charente-Maritime: discover our service",
    readEn: "Lire en français",
  },
} as const;

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const entry = getGuideEntry(params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  component: BlogArticle,
  head: ({ params, match }) => {
    const e = getGuideEntry(params.slug);
    if (!e) return {};
    const isEn = (match.search as { lang?: string } | undefined)?.lang === "en";
    const name = isEn ? (e.nameEn ?? e.name) : e.name;
    const title = isEn
      ? `${name}, ${e.city} — Charente-Maritime guide | Access Prestige Taxi`
      : `${name}, ${e.city} — Guide Charente-Maritime | Access Prestige Taxi`;
    const desc = (isEn ? e.en.teaser : e.fr.teaser).slice(0, 155);
    const url = `${SITE}/blog/${e.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: e.photos[0] },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: e.photos[0] },
      ],
      links: seoLinks(`/blog/${e.slug}`, match.search),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type":
                  e.category === "hotel" ? "Hotel" : e.category === "restaurant" ? "Restaurant" : "TouristAttraction",
                name,
                description: isEn ? e.en.teaser : e.fr.teaser,
                image: e.photos,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: e.city,
                  addressRegion: "Charente-Maritime",
                  addressCountry: "FR",
                },
                ...(e.stars ? { starRating: { "@type": "Rating", ratingValue: e.stars } } : {}),
              },
              {
                "@type": "Article",
                "@id": `${url}#article`,
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                headline: name.slice(0, 110),
                description: isEn ? e.en.teaser : e.fr.teaser,
                image: e.photos,
                inLanguage: isEn ? "en-GB" : "fr-FR",
                // Dates éditoriales : contenu de guide publié puis relu par les chauffeurs.
                datePublished: "2026-01-15",
                dateModified: "2026-01-15",
                author: {
                  "@type": "Organization",
                  name: "Access Prestige Taxi",
                  url: SITE,
                },
                publisher: {
                  "@type": "Organization",
                  name: "Access Prestige Taxi",
                  url: SITE,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE}/favicon.png`,
                    width: 512,
                    height: 512,
                  },
                },
              },

              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
                  { "@type": "ListItem", position: 2, name: "Guide", item: `${SITE}/blog` },
                  { "@type": "ListItem", position: 3, name, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
});

function BlogArticle() {
  const { slug } = Route.useParams();
  const entry = getGuideEntry(slug) as GuideEntry;
  const { lang, setLang } = useI18n();
  const isEn = lang === "en";
  const c = isEn ? COPY.en : COPY.fr;
  const txt = isEn ? entry.en : entry.fr;
  const title = guideName(entry, isEn);
  const catLabel = GUIDE_CATEGORIES.find((g) => g.key === entry.category)!;
  const others = GUIDE_ENTRIES.filter((e) => e.slug !== entry.slug && e.dept === entry.dept).slice(0, 3);

  return (
    <main className="bg-[#050708] pb-16">
      <article>
        {/* HERO IMAGE */}
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden bg-[#0b0f12] sm:aspect-[21/9] lg:max-h-[560px]">
            <img
              src={imgAt(entry.photos[0], 1280)}
              srcSet={imgSrcSet(entry.photos[0], [500, 1280, 1920])}
              sizes="100vw"
              alt={`${title}, ${entry.city}`}
              fetchPriority="high"
              decoding="async"
              width={1280}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>


        <div className="mx-auto mt-6 max-w-3xl px-4 sm:-mt-20 sm:px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {c.back}
          </Link>

          {/* Bascule de langue de l'article */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setLang(isEn ? "fr" : "en")}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#e0b866]/60 px-4 text-xs font-semibold uppercase tracking-wider text-[#e0b866] transition hover:bg-[#e0b866] hover:text-black"
              aria-label={c.readEn}
            >
              <Languages className="h-4 w-4" aria-hidden="true" /> {c.readEn}
            </button>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-white/55">
            <span className="text-primary">{isEn ? catLabel.en : catLabel.fr}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {entry.city} ({entry.dept})
            </span>
          </p>

          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {title}
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

          {/* RÉSERVATION PRÉREMPLIE — la destination du formulaire = ce lieu */}
          <Link
            to="/reserver"
            search={{ to: `${entry.name}, ${entry.city}` }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 sm:w-auto"
            aria-label={`${c.bookHere} ${title}`}
          >
            {c.bookHere} {title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>


          {/* EN BREF */}
          <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-[#e0b866]/25 bg-border sm:grid-cols-3">
            {entry.facts.map((f, i) => (
              <div key={i} className="bg-[#080b0d] px-4 py-4">
                <dt className="text-[10px] uppercase tracking-widest text-white/55">
                  {c.practical} · {i + 1}
                </dt>
                <dd className="mt-1 text-sm font-medium text-white">{isEn ? f.en : f.fr}</dd>
              </div>
            ))}
          </dl>

          {/* HISTOIRE */}
          <h2 className="mt-10 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.history}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-base">{txt.history}</p>

          {/* GALERIE — 3 photos */}
          <h2 className="mt-10 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.gallery}</h2>
        </div>

        <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {entry.photos.map((src, i) => (
              <figure key={i} className="overflow-hidden rounded-2xl border border-[#e0b866]/25 bg-[#0b0f12]">
                <img
                  src={imgAt(src, 500)}
                  srcSet={imgSrcSet(src, [250, 330, 500, 1280])}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  alt={`${title}, ${entry.city} — photo ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                  className="aspect-square w-full object-cover sm:aspect-[4/3]"
                />
              </figure>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* CONSEILS */}
          <h2 className="mt-10 font-display text-xl font-semibold text-foreground sm:text-2xl">{c.tips}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-base">{txt.tips}</p>

          {/* LIEN INTERNE — pages dédiées Taxi Marennes / Taxi Oléron */}
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            <Link to="/taxi-marennes" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
              {c.homeLink}
            </Link>
          </p>
          {entry.slug.includes("oleron") && (
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              <Link to="/taxi-oleron" className="font-semibold text-primary underline underline-offset-4 hover:opacity-90">
                {isEn ? "Taxi on Oléron island: hours, fares and booking" : "Taxi île d'Oléron : horaires, tarifs et réservation"}
              </Link>
            </p>
          )}



          {/* CTA */}
          <section className="mt-10 rounded-2xl border border-[#e0b866]/25 bg-[#080b0d] p-5 sm:p-7">
            <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{c.ctaTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{c.ctaText}</p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <Link
                to="/reserver"
                search={{ to: `${entry.name}, ${entry.city}` }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
              >
                {c.book} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${PHONE}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e0b866]/25 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary"
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
                className="group overflow-hidden rounded-2xl border border-[#e0b866]/25 bg-[#080b0d] transition hover:border-primary/60"
              >
                <img
                  src={imgAt(o.photos[0], 500)}
                  srcSet={imgSrcSet(o.photos[0], [250, 330, 500])}
                  sizes="(min-width: 640px) 25vw, 100vw"
                  alt={`${guideName(o, isEn)}, ${o.city}`}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={400}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105 sm:aspect-[16/10]"
                />
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/55">{o.city}</p>
                  <p className="mt-1 font-display text-base font-semibold text-white">{guideName(o, isEn)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
