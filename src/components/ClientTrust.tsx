import { useEffect, useState } from "react";
import { BadgeCheck, Quote, ShieldCheck, Star, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
    noReviews: "Soyez le premier à partager votre expérience — les avis publiés proviennent de courses réellement effectuées.",
    outOf: "sur 5",
    trust: [
      { icon: BadgeCheck, t: "Chauffeurs agréés", d: "Carte professionnelle taxi, autorisation de stationnement en Charente & Charente-Maritime." },
      { icon: ShieldCheck, t: "Assurance & sécurité", d: "Véhicules assurés tous risques, contrôlés et entretenus, sièges enfant sur demande." },
      { icon: Clock, t: "Ponctualité suivie", d: "Suivi de course en temps réel et lien de suivi partagé avec vos proches." },
      { icon: Sparkles, t: "Confort 100 % électrique", d: "Audi Q6 e-tron silencieuses, eau, chargeurs et Wi-Fi à bord." },
    ],
    verified: "Avis vérifié",
  },
  en: {
    eyebrow: "Reviews & reassurance",
    title: "Trusted by our passengers",
    lead: "Punctuality, safety and discretion: what riders remember about Patricia and Alain.",
    reviews: (n: number) => `${n} verified review${n > 1 ? "s" : ""}`,
    noReviews: "Be the first to share your experience — published reviews come from real completed rides.",
    outOf: "out of 5",
    trust: [
      { icon: BadgeCheck, t: "Licensed drivers", d: "Professional taxi licence and permits across Charente & Charente-Maritime." },
      { icon: ShieldCheck, t: "Insurance & safety", d: "Fully insured, serviced vehicles; child seats available on request." },
      { icon: Clock, t: "Tracked punctuality", d: "Real-time ride tracking with a link you can share with family." },
      { icon: Sparkles, t: "100% electric comfort", d: "Silent Audi Q6 e-tron with water, chargers and on-board Wi-Fi." },
    ],
    verified: "Verified review",
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

export function ClientTrust() {
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
      .limit(6)
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

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">{c.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-card px-6 py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-foreground">
              {average.toFixed(1).replace(".", lang === "en" ? "." : ",")}
            </span>
            <span className="text-sm text-muted-foreground">{c.outOf}</span>
          </div>
          <Stars value={average} />
          <p className="text-xs text-muted-foreground">{count ? c.reviews(count) : c.noReviews}</p>
        </div>

        {withText.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {withText.map((r) => (
              <figure key={r.id} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <Quote className="h-5 w-5 text-primary" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
                  “{r.commentaire}”
                </blockquote>
                <figcaption className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {r.author_name?.trim() || "Client"}
                    </span>
                    <Stars value={r.note} />
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {c.verified}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.trust.map((t) => (
            <div key={t.t} className="rounded-2xl border border-border bg-card/60 p-5">
              <t.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">{t.t}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
