import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

type Review = {
  id: string;
  author_name: string | null;
  note: number;
  commentaire: string | null;
  created_at: string;
};

const COPY = {
  fr: {
    eyebrow: "Avis clients",
    title: (v: string) => `Ils ont voyagé avec nous à ${v}`,
    lead: "Avis vérifiés, publiés après relecture par Alain et Patricia.",
    count: (n: number) => `${n} avis vérifié${n > 1 ? "s" : ""}`,
    outOf: "sur 5",
    empty: "Soyez le premier à laisser un avis après votre course.",
    cta: "Déposer un avis",
  },
  en: {
    eyebrow: "Customer reviews",
    title: (v: string) => `They travelled with us in ${v}`,
    lead: "Verified reviews, published after review by Alain and Patricia.",
    count: (n: number) => `${n} verified review${n > 1 ? "s" : ""}`,
    outOf: "out of 5",
    empty: "Be the first to leave a review after your ride.",
    cta: "Leave a review",
  },
} as const;

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

/**
 * Avis clients + balisage schema.org Review/AggregateRating rattaché au nœud
 * TaxiService de la page locale (@id passé en prop) : Google relie ainsi les
 * notes à l'entité locale plutôt qu'à une entité anonyme.
 */
export function LocalReviews({ villeName, serviceId }: { villeName: string; serviceId: string }) {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("avis")
      .select("id,author_name,note,commentaire,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (active && data) setReviews(data as Review[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + (r.note || 0), 0) / count : 0;
  const withText = reviews.filter((r) => (r.commentaire ?? "").trim().length > 0);

  const jsonLd =
    count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "TaxiService",
          "@id": serviceId,
          name: `Access Prestige Taxi — ${villeName}`,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: count,
            bestRating: "5",
            worstRating: "1",
          },
          review: withText.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author_name?.trim() || "Client" },
            datePublished: (r.created_at || "").slice(0, 10),
            reviewBody: r.commentaire,
            reviewRating: { "@type": "Rating", ratingValue: r.note, bestRating: "5", worstRating: "1" },
            itemReviewed: { "@id": serviceId },
          })),
        }
      : null;

  return (
    <section className="mt-12">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
      <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{c.title(villeName)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{c.lead}</p>

      {count > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Stars value={average} />
            <span className="text-sm font-semibold text-foreground">
              {average.toFixed(1)} <span className="text-muted-foreground">{c.outOf}</span>
            </span>
            <span className="text-sm text-muted-foreground">· {c.count(count)}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {withText.slice(0, 4).map((r) => (
              <figure key={r.id} className="rounded-xl border border-border bg-card p-5">
                <Quote className="h-4 w-4 text-primary" />
                <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.commentaire}</blockquote>
                <figcaption className="mt-3 flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Stars value={r.note} /> {r.author_name?.trim() || "Client"}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{c.empty}</p>
      )}

      <Link to="/" hash="avis" className="mt-5 inline-block text-sm font-semibold text-primary underline">
        {c.cta} →
      </Link>
    </section>
  );
}
