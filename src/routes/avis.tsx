import { useCallback, useEffect, useState } from "react";
import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ogImageUrl, ogPageUrl } from "@/lib/og";
import ogHomeFr from "@/assets/apt-og-home-fr.jpg.asset.json";
import ogHomeEn from "@/assets/apt-og-home-en.jpg.asset.json";
import { ArrowLeft, BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/motion-ui";

// ── Styles partagés avec la home ────────────────────────────────────────────
const NIGHT_SECTION = "dark border-t border-white/10 bg-[#0a0f2c]";
const CARD =
  "dark rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--gold)_55%,transparent)]";

interface PublicAvis {
  id: string;
  author_name: string | null;
  note: number;
  commentaire: string | null;
  created_at: string;
}

// ── Visuels de partage ──────────────────────────────────────────────────────
const AVIS_SOCIAL_FR = {
  title: "Avis clients — taxi Marennes, Oléron & Charente-Maritime",
  description:
    "Avis vérifiés de nos clients à Marennes, sur l'île d'Oléron et en Charente-Maritime : transferts aéroport, transport médical conventionné et mises à disposition en Charente-Maritime.",
  image: ogImageUrl(ogHomeFr.url),
  url: ogPageUrl("/avis", "fr"),
};
const AVIS_SOCIAL_EN = {
  title: "Reviews — taxi in Marennes, Oléron & Charente-Maritime",
  description:
    "Verified reviews from our clients in Marennes, Oléron island and Charente-Maritime: airport transfers, covered medical transport and chauffeur services in Charente-Maritime.",
  image: ogImageUrl(ogHomeEn.url),
  url: ogPageUrl("/avis", "en"),
};

// ── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/avis")({
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | "fr" } => ({
    lang: search["lang"] === "en" ? "en" : search["lang"] === "fr" ? "fr" : undefined,
  }),
  head: (ctx: { match?: { search?: { lang?: "en" | "fr" } } }) => {
    const isEn = ctx?.match?.search?.lang === "en";
    const social = isEn ? AVIS_SOCIAL_EN : AVIS_SOCIAL_FR;
    return {
      meta: [
        keywordsMeta(["avis taxi Marennes", "avis taxi île d'Oléron", "meilleur taxi Charente-Maritime"]),
        { title: social.title },
        { name: "description", content: social.description },
        { name: "robots", content: "index, follow" },
        { property: "og:site_name", content: "Access Prestige Taxi" },
        { property: "og:title", content: social.title },
        { property: "og:description", content: social.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: social.url },
        { property: "og:image", content: social.image },
        { property: "og:image:secure_url", content: social.image },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: isEn ? "en_GB" : "fr_FR" },
        { property: "og:locale:alternate", content: isEn ? "fr_FR" : "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: social.title },
        { name: "twitter:description", content: social.description },
        { name: "twitter:image", content: social.image },
      ],
      links: seoLinks("/avis", ctx?.match?.search),
    };
  },
  component: AvisPage,
});

// ── Étoiles ──────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(n) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string, lang: "fr" | "en") {
  try {
    return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Carrousel à flèches (tous les avis, optimisé mobile/desktop) ────────────
function ReviewsCarousel({ reviews, isEn }: { reviews: PublicAvis[]; isEn: boolean }) {
  const [trackRef, setTrackRef] = useState<HTMLDivElement | null>(null);

  const scrollByCard = (dir: 1 | -1) => {
    if (!trackRef) return;
    const card = trackRef.querySelector("[data-review-card]") as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 300) + 16;
    trackRef.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative mt-10">
      <div
        ref={setTrackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((r) => (
          <article
            key={r.id}
            data-review-card
            className={`w-[85%] shrink-0 snap-start p-6 text-left sm:w-[360px] ${CARD}`}
          >
            <Stars n={r.note} />
            {r.commentaire && <p className="mt-3 text-sm leading-relaxed text-card-foreground">“{r.commentaire}”</p>}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate font-semibold text-card-foreground">
                {r.author_name || (isEn ? "Anonymous" : "Anonyme")}
              </span>
              <span>·</span>
              <span className="shrink-0">{formatDate(r.created_at, isEn ? "en" : "fr")}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label={isEn ? "Previous" : "Précédent"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label={isEn ? "Next" : "Suivant"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary active:scale-95"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
function AvisPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";

  const [reviews, setReviews] = useState<PublicAvis[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("avis")
        .select("id, author_name, note, commentaire, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setReviews(data ?? []);
    } catch {
      // silencieux : la page reste consultable même si le chargement échoue
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("avis-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "avis" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const avgNote = reviews.length > 0 ? reviews.reduce((s, a) => s + a.note, 0) / reviews.length : 0;

  return (
    <div className={NIGHT_SECTION}>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary transition hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isEn ? "Back to home" : "Retour à l'accueil"}
        </Link>

        <Reveal>
          <p className="mt-8 text-center text-[11px] uppercase tracking-[0.3em] text-primary">
            {isEn ? "Client reviews" : "Avis clients"}
          </p>
          <h1 className="mt-3 text-center font-display text-2xl font-semibold text-foreground sm:text-4xl">
            {isEn ? "All our reviews" : "Tous nos avis"}
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Stars n={avgNote} />
            <p className="text-sm text-muted-foreground">
              {loading
                ? isEn
                  ? "Loading reviews…"
                  : "Chargement des avis…"
                : reviews.length > 0
                  ? isEn
                    ? `${avgNote.toFixed(1)} / 5 — ${reviews.length} verified review${reviews.length > 1 ? "s" : ""}`
                    : `${avgNote.toFixed(1)} / 5 — ${reviews.length} avis vérifié${reviews.length > 1 ? "s" : ""}`
                  : isEn
                    ? "No reviews yet."
                    : "Pas encore d'avis."}
            </p>
          </div>
        </Reveal>

        {reviews.length > 0 && (
          <Reveal delay={0.12}>
            <ReviewsCarousel reviews={reviews} isEn={isEn} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
