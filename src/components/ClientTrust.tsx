import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BadgeCheck, Quote, Star } from "lucide-react";
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
    eyebrow: "Avis & réassurance",
    title: "La confiance de nos clients",
    lead: "Ponctualité, sécurité et discrétion : ce que nos passagers retiennent de Patricia et Alain.",
    reviews: (n: number) => `${n} avis vérifié${n > 1 ? "s" : ""}`,
    noReviews:
      "Soyez le premier à partager votre expérience — les avis publiés proviennent de courses réellement effectuées.",
    outOf: "sur 5",
    verified: "Avis vérifié",
    safety: "Sécurité, assurance & garanties",
    moderation: "Chaque avis est relu par Patricia et Alain avant publication.",
  },
  en: {
    eyebrow: "Reviews & reassurance",
    title: "Trusted by our passengers",
    lead: "Punctuality, safety and discretion: what riders remember about Patricia and Alain.",
    reviews: (n: number) => `${n} verified review${n > 1 ? "s" : ""}`,
    noReviews: "Be the first to share your experience — published reviews come from real completed rides.",
    outOf: "out of 5",
    verified: "Verified review",
    safety: "Safety, insurance & guarantees",
    moderation: "Every review is checked by Patricia and Alain before publication.",
  },
} as const;

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

export function ClientTrust({ children }: { children?: ReactNode }) {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("avis")
      .select("id,author_name,note,commentaire,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (active && data) setReviews(data as Review[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const withText = reviews.filter((r) => (r.commentaire ?? "").trim().length > 0).slice(0, 3);
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + (r.note || 0), 0) / count : 5;

  const jsonLd =
    count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "TaxiService",
          name: "Access Prestige Taxi",
          areaServed: ["Charente-Maritime"],
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
          })),
        }
      : null;

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-5">
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">{c.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{c.lead}</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-black px-6 py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-white">
              {average.toFixed(1).replace(".", lang === "en" ? "." : ",")}
            </span>
            <span className="text-sm text-white/70">{c.outOf}</span>
          </div>
          <Stars value={average} />
          <p className="text-xs text-white/70">{count ? c.reviews(count) : c.noReviews}</p>
        </div>

        {withText.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {withText.map((r) => (
              <figure key={r.id} className="flex h-full flex-col rounded-2xl border border-border bg-black p-6">
                <Quote className="h-5 w-5 text-primary" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-white">“{r.commentaire}”</blockquote>
                <figcaption className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-white">
                      {r.author_name?.trim() || "Client"}
                    </span>
                    <Stars value={r.note} />
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-white">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {c.verified}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {c.moderation}{" "}
          <Link to="/securite" className="font-semibold text-primary underline">
            {c.safety}
          </Link>
        </p>

        {children ? <div className="mt-14">{children}</div> : null}
      </div>
    </section>
  );
}
