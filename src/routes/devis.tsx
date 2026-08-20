import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { Accessibility, Clock3, Mail, Phone, Users, Zap } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { useRef, useState } from "react";
import { QuoteForm, type QuotePrefill } from "@/components/QuoteForm";
import { QuoteEstimator } from "@/components/QuoteEstimator";
import heroLogoAsset from "@/assets/apt-logo-lockup.webp.asset.json";

const heroLogo = heroLogoAsset.url;
const SITE = "https://www.accessprestigetaxi.fr";
const URL_DEVIS = `${SITE}/devis`;
const TITLE = "Demander un devis taxi — Charente-Maritime | Access Prestige Taxi";
const DESC =
  "Demandez un devis taxi gratuit en Charente-Maritime : trajet, date, véhicule électrique ou van 8 places, transport sanitaire conventionné et transport de groupe. Réponse rapide.";
const EMAIL = "accessprestigetaxi@gmail.com";

export const Route = createFileRoute("/devis")({
  head: ({ match }) => ({
    meta: [
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
    eyebrow: "Devis gratuit",
    h1: "Demander un devis",
    lead:
      "Décrivez votre trajet en une minute : nous vous répondons avec un prix ferme, adapté à votre véhicule et à vos besoins (transport sanitaire conventionné, transport de groupe, longue distance).",
    perks: [
      { icon: Zap, t: "Véhicules électriques", d: "BMW iX1 et Audi Q6 e-tron, 5 places." },
      { icon: Users, t: "Van 8 places", d: "Mercedes classe V pour les groupes et les bagages." },
      { icon: Accessibility, t: "Transport sanitaire", d: "Conventionné, fauteuil roulant possible." },
      { icon: Clock3, t: "Réponse rapide", d: "Un devis clair, sans engagement." },
    ],
    orCall: "Ou contactez-nous directement",
    track: "Déjà une demande ? Suivre mon devis par numéro de référence",
    bookNow: "Besoin d'un trajet immédiat ? Réservez en ligne",
  },
  en: {
    eyebrow: "Free quote",
    h1: "Request a quote",
    lead:
      "Describe your journey in a minute: we reply with a firm price matched to your vehicle and your needs (covered medical transport, group transport, long distance).",
    perks: [
      { icon: Zap, t: "Electric vehicles", d: "BMW iX1 and Audi Q6 e-tron, 5 seats." },
      { icon: Users, t: "8-seat van", d: "Mercedes V-Class for groups and luggage." },
      { icon: Accessibility, t: "Medical transport", d: "Covered, wheelchair available." },
      { icon: Clock3, t: "Fast reply", d: "A clear quote, no commitment." },
    ],
    orCall: "Or contact us directly",
    track: "Already sent a request? Track your quote by reference number",
    bookNow: "Need a ride right now? Book online",
  },
} as const;

function DevisPage() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const [prefill, setPrefill] = useState<QuotePrefill | undefined>(undefined);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <img
          src={heroLogo}
          alt="Access Prestige Taxi"
          width={360}
          height={200}
          className="mx-auto h-24 w-auto object-contain sm:h-28"
        />
        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl md:text-[2.75rem]">{c.h1}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {c.perks.map((p) => (
          <div key={p.t} className="rounded-xl border border-border bg-card/60 p-4">
            <p.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold">{p.t}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <QuoteEstimator
          onQuote={(p) => {
            setPrefill({
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
            requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
          }}
        />
      </div>

      <div className="mt-10">
        <QuoteForm prefill={prefill} formRef={formRef} />
      </div>

      <p className="mt-6 text-center text-sm">
        <Link to="/devis/suivi" search={{ ref: undefined }} className="font-semibold text-primary underline">
          {c.track} →
        </Link>
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-card/40 p-6 text-center">
        <h2 className="font-display text-lg font-semibold">{c.orCall}</h2>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {DRIVERS.map((d) => (
            <a
              key={d.tel}
              href={`tel:${d.intl}`}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold transition hover:border-primary/60 sm:w-auto"
            >
              <Phone className="h-4 w-4 text-primary" /> {d.name} — {d.display}
            </a>
          ))}
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold transition hover:border-primary/60 sm:w-auto"
          >
            <Mail className="h-4 w-4 text-primary" /> {EMAIL}
          </a>
        </div>
        <Link to="/reserver" className="mt-5 inline-block text-sm font-semibold text-primary underline">
          {c.bookNow} →
        </Link>
      </section>
    </div>
  );
}
