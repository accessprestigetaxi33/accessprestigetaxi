import { socialImageMeta } from "@/lib/og";
import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { Accessibility, ArrowLeft, Clock3, Mail, Phone, Users, Zap } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { useRef, useState } from "react";
import { QuoteForm, type QuotePrefill } from "@/components/QuoteForm";
import { QuoteEstimator } from "@/components/QuoteEstimator";

const SITE = "https://www.accessprestigetaxi.fr";
const URL_DEVIS = `${SITE}/devis`;
const TITLE = "Devis taxi Marennes, île d'Oléron & Charente-Maritime";
const DESC =
  "Demandez un devis taxi gratuit à Marennes, sur l'île d'Oléron et en Charente-Maritime : trajet, date, véhicule électrique ou van 8 places, transport sanitaire conventionné et transport de groupe. Réponse rapide.";
const EMAIL = "accessprestigetaxi@gmail.com";

export const Route = createFileRoute("/devis")({
  validateSearch: (search: Record<string, unknown>): { lang?: string; prestation?: string } => ({
    lang: typeof search.lang === "string" ? search.lang : undefined,
    prestation: typeof search.prestation === "string" ? search.prestation : undefined,
  }),
  head: ({ match }) => ({
    meta: [
      keywordsMeta(["devis taxi Marennes", "prix taxi île d'Oléron", "tarif taxi Charente-Maritime"]),
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL_DEVIS },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...socialImageMeta(TITLE),
    ],
    links: seoLinks("/devis", match.search),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": `${URL_DEVIS}#page`,
          url: URL_DEVIS,
          name: TITLE,
          description: DESC,
          inLanguage: ["fr-FR", "en-GB"],
          mainEntity: {
            "@type": "LocalBusiness",
            additionalType: "https://schema.org/TaxiService",
            name: "Access Prestige Taxi",
            url: SITE,
            email: EMAIL,
            telephone: DRIVERS.map((d) => d.intl),
            areaServed: { "@type": "AdministrativeArea", name: "Charente-Maritime" },
            makesOffer: [
              { "@type": "Offer", name: "Transport sanitaire conventionné" },
              { "@type": "Offer", name: "Transport de groupe 8 places" },
              { "@type": "Offer", name: "Transferts toutes gares et tous aéroports" },
            ],
          },
        }),
      },
    ],
  }),
  component: DevisPage,
});

const COPY = {
  fr: {
    back: "Retour au site",
    eyebrow: "Devis gratuit",
    h1: "Demander un devis",
    lead: "Décrivez votre trajet en une minute : nous vous répondons avec un prix ferme, adapté à votre véhicule et à vos besoins (transport sanitaire conventionné, transport de groupe, longue distance).",
    perks: [
      { icon: Zap, t: "Véhicules électriques", d: "BMW iX1 et Audi Q6 e-tron, 5 places." },
      { icon: Users, t: "Van 8 places", d: "Mercedes classe V pour les groupes et les bagages." },
      { icon: Accessibility, t: "Transport sanitaire", d: "Conventionné, fauteuil roulant possible." },
      { icon: Clock3, t: "Réponse rapide", d: "Un devis clair, sans engagement." },
    ],
    estimTag: "Estimation rapide",
    estimTitle: "Estimez votre trajet",
    formTag: "Formulaire de devis",
    formTitle: "Finalisez votre demande",
    orCall: "Ou contactez-nous directement",
    track: "Déjà une demande ? Suivre mon devis par numéro de référence",
    bookNow: "Besoin d'un trajet immédiat ? Réservez en ligne",
  },
  en: {
    back: "Back to website",
    eyebrow: "Free quote",
    h1: "Request a quote",
    lead: "Describe your journey in a minute: we reply with a firm price matched to your vehicle and your needs (covered medical transport, group transport, long distance).",
    perks: [
      { icon: Zap, t: "Electric vehicles", d: "BMW iX1 and Audi Q6 e-tron, 5 seats." },
      { icon: Users, t: "8-seat van", d: "Mercedes V-Class for groups and luggage." },
      { icon: Accessibility, t: "Medical transport", d: "Covered, wheelchair available." },
      { icon: Clock3, t: "Fast reply", d: "A clear quote, no commitment." },
    ],
    estimTag: "Quick estimate",
    estimTitle: "Estimate your ride",
    formTag: "Quote form",
    formTitle: "Finalise your request",
    orCall: "Or contact us directly",
    track: "Already sent a request? Track your quote by reference number",
    bookNow: "Need a ride right now? Book online",
  },
} as const;

function DevisPage() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const { prestation } = Route.useSearch();
  const [prefill, setPrefill] = useState<QuotePrefill | undefined>(prestation ? { prestation } : undefined);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <main className="px-3 py-5 text-white sm:px-6">
      <Link
        to="/"
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d6a83d]/45 bg-[#07101a] px-3 py-1.5 text-[12px] font-semibold text-[#e8bd5d] transition hover:bg-[#111b26]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {c.back}
      </Link>
      <section className="overflow-hidden rounded-[30px] bg-[#030a13] shadow-[0_0_40px_rgba(214,168,61,.08)]">
        <div className="px-6 py-5">
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#d6a83d]/45 px-3 py-1 text-[10px] font-bold tracking-wider text-[#e8bd5d]">
              {c.eyebrow.toUpperCase()}
            </span>
            <h1 className="mt-4 font-display text-[29px] leading-tight text-[#f4efe5]">{c.h1}</h1>
            <p className="mx-auto mt-3 max-w-[300px] text-[12px] leading-5 text-white/70">{c.lead}</p>
          </div>

          {/* Perks */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {c.perks.map((p) => (
              <article
                key={p.t}
                className="min-h-[118px] rounded-xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-3"
              >
                <p.icon className="h-7 w-7 text-[#e8bd5d]" />
                <h3 className="mt-2 font-display text-[14px] text-[#f4efe5]">{p.t}</h3>
                <p className="mt-1 text-[9px] leading-4 text-white/60">{p.d}</p>
              </article>
            ))}
          </div>

          {/* Estimation rapide */}
          <section className="mt-6">
            <p className="text-center text-[13px] font-bold uppercase tracking-[0.2em] text-[#e8bd5d]">{c.estimTag}</p>
            <div className="mt-3 rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-3">
              <h2 className="font-display text-[19px] text-[#f4efe5]">{c.estimTitle}</h2>
              <div className="mt-3">
                <QuoteEstimator
                  onQuote={(p) => {
                    setPrefill({
                      prestation,
                      depart: p.depart,
                      arrivee: p.arrivee,
                      date: p.date,
                      heure: p.heure,
                      allerRetour: p.allerRetour,
                      passagers: p.passagers,
                      vehicule: p.vehicule,
                      distanceKm: p.distanceKm,
                      prix: p.prix,
                    });
                    requestAnimationFrame(() =>
                      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
                    );
                  }}
                />
              </div>
            </div>
          </section>

          {/* Formulaire de devis */}
          <section className="mt-6">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#e8bd5d]">{c.formTag}</p>
            <div className="mt-3 rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-3">
              <h2 className="font-display text-[19px] text-[#f4efe5]">{c.formTitle}</h2>
              <div className="mt-3">
                <QuoteForm prefill={prefill} formRef={formRef} />
              </div>
            </div>
          </section>

          <p className="mt-5 text-center text-[11px]">
            <Link to="/devis/suivi" search={{ ref: undefined }} className="font-semibold text-[#e8bd5d] underline">
              {c.track} →
            </Link>
          </p>

          {/* Contact direct */}
          <section className="mt-5 rounded-2xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-4 text-center">
            <h2 className="font-display text-[16px] text-[#f4efe5]">{c.orCall}</h2>
            <div className="mt-3 flex flex-col items-center justify-center gap-2">
              {DRIVERS.map((d) => (
                <a
                  key={d.tel}
                  href={`tel:${d.intl}`}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d6a83d]/45 px-4 text-[12px] font-semibold text-white/90"
                >
                  <Phone className="h-4 w-4 text-[#e8bd5d]" /> {d.name} — {d.display}
                </a>
              ))}
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d6a83d]/45 px-4 text-[12px] font-semibold text-white/90"
              >
                <Mail className="h-4 w-4 text-[#e8bd5d]" /> {EMAIL}
              </a>
            </div>
            <Link to="/reserver" className="mt-4 inline-block text-[12px] font-semibold text-[#e8bd5d] underline">
              {c.bookNow} →
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
