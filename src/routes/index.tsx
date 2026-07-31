import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  BriefcaseBusiness,
  Clock,
  Leaf,
  Phone,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import logoLockup from "@/assets/apt-logo-lockup.png.asset.json";

const PHONE = "0673072322";
const PHONE_DISPLAY = "06 73 07 23 22";

const COPY = {
  fr: {
    kicker: "100 % électrique · Bordeaux & Gironde",
    tagline: "Votre mobilité, notre priorité",
    lead:
      "Deux chauffeurs, deux Audi Q6 e-tron. Un service de taxi haut de gamme, silencieux et zéro émission, disponible 7j/7 et 24h/24.",
    ctaBook: "Réserver ma course",
    ctaCall: "Appeler un chauffeur",
    scroll: "Découvrir",
    stats: [
      { v: "2", l: "chauffeurs dédiés" },
      { v: "100 %", l: "électrique" },
      { v: "24/7", l: "disponibilité" },
      { v: "0 g", l: "CO₂ à l'usage" },
    ],
    servicesEyebrow: "Nos services",
    servicesTitle: "Une prestation pensée pour chaque trajet",
    services: [
      { icon: Stethoscope, t: "Transport conventionné", d: "Trajets médicaux assis, prise en charge simplifiée." },
      { icon: PlaneTakeoff, t: "Gares & aéroports", d: "Suivi des vols et des trains, accueil en gare." },
      { icon: BriefcaseBusiness, t: "Déplacements professionnels", d: "Ponctualité, discrétion, facture entreprise." },
      { icon: Sparkles, t: "Conciergerie", d: "Courses, livraisons et mises à disposition sur mesure." },
      { icon: BatteryCharging, t: "100 % électrique", d: "Audi Q6 e-tron : silence, confort et zéro émission." },
      { icon: Clock, t: "Disponible 24h/24", d: "Réservation immédiate ou planifiée, 7 jours sur 7." },
    ],
    whyEyebrow: "Pourquoi nous",
    whyTitle: "L'élégance électrique, sans compromis",
    why: [
      { icon: Leaf, t: "Zéro émission", d: "Chaque course est réalisée en véhicule 100 % électrique." },
      { icon: Users, t: "Deux chauffeurs, un standard", d: "Même exigence de confort et de discrétion." },
      { icon: ShieldCheck, t: "Prix annoncé, prix tenu", d: "Estimation transparente avant le départ." },
    ],
    ctaTitle: "Prêt à réserver votre course ?",
    ctaText: "Réservation en moins d'une minute, à la voix ou à l'écrit.",
  },
  en: {
    kicker: "100% electric · Bordeaux & Gironde",
    tagline: "Your mobility, our priority",
    lead:
      "Two drivers, two Audi Q6 e-tron. A premium, silent, zero-emission taxi service available 24/7.",
    ctaBook: "Book a ride",
    ctaCall: "Call a driver",
    scroll: "Explore",
    stats: [
      { v: "2", l: "dedicated drivers" },
      { v: "100%", l: "electric" },
      { v: "24/7", l: "availability" },
      { v: "0 g", l: "CO₂ in use" },
    ],
    servicesEyebrow: "Our services",
    servicesTitle: "A service designed for every journey",
    services: [
      { icon: Stethoscope, t: "Medical transport", d: "Seated medical trips with simplified coverage." },
      { icon: PlaneTakeoff, t: "Stations & airports", d: "Flight and train tracking, meet & greet." },
      { icon: BriefcaseBusiness, t: "Business travel", d: "Punctual, discreet, company invoicing." },
      { icon: Sparkles, t: "Concierge", d: "Errands, deliveries and bespoke chauffeur hours." },
      { icon: BatteryCharging, t: "100% electric", d: "Audi Q6 e-tron: silence, comfort, zero emissions." },
      { icon: Clock, t: "Available 24/7", d: "Instant or scheduled booking, seven days a week." },
    ],
    whyEyebrow: "Why us",
    whyTitle: "Electric elegance, no compromise",
    why: [
      { icon: Leaf, t: "Zero emissions", d: "Every ride is driven in a fully electric vehicle." },
      { icon: Users, t: "Two drivers, one standard", d: "The same demand for comfort and discretion." },
      { icon: ShieldCheck, t: "Quoted price, final price", d: "Transparent estimate before departure." },
    ],
    ctaTitle: "Ready to book your ride?",
    ctaText: "Book in under a minute, by voice or by typing.",
  },
} as const;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Access Prestige Taxi — Taxi 100 % électrique à Bordeaux" },
      {
        name: "description",
        content:
          "Taxi haut de gamme 100 % électrique à Bordeaux et en Gironde. Deux chauffeurs, Audi Q6 e-tron, transport conventionné, gares & aéroports, 7j/7 24h/24.",
      },
      { property: "og:title", content: "Access Prestige Taxi — Taxi 100 % électrique à Bordeaux" },
      {
        property: "og:description",
        content:
          "Votre mobilité, notre priorité. Réservation rapide, vocale ou écrite, en véhicule 100 % électrique à Bordeaux.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TaxiService",
          name: "Access Prestige Taxi",
          slogan: "Votre mobilité, notre priorité",
          areaServed: "Bordeaux, Gironde, France",
          telephone: "+33673072322",
          availableLanguage: ["fr", "en"],
          openingHours: "Mo-Su 00:00-23:59",
        }),
      },
    ],
  }),
});

function Index() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[var(--gradient-dark,linear-gradient(180deg,#0b0b0d,#111014))]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--gold)_22%,transparent),transparent_70%)]" />

        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-14 text-center sm:pt-20">
          <img
            src={logoLockup}
            alt="Access Prestige Taxi — taxi 100 % électrique à Bordeaux"
            width={1184}
            height={695}
            fetchPriority="high"
            className="w-full max-w-md drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-w-lg"
          />

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-primary">
            <BatteryCharging className="h-3.5 w-3.5" /> {c.kicker}
          </p>

          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
            {c.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{c.lead}</p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/reservation"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
            >
              {c.ctaBook} <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-foreground transition hover:border-primary"
            >
              <Phone className="h-4 w-4 text-primary" /> {PHONE_DISPLAY}
            </a>
          </div>

          <dl className="mt-14 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {c.stats.map((s) => (
              <div key={s.l} className="bg-card px-4 py-5">
                <dt className="font-display text-2xl font-semibold text-primary sm:text-3xl">{s.v}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SERVICES */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.servicesEyebrow}</p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {c.servicesTitle}
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.services.map((s) => (
              <article
                key={s.t}
                className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/60"
              >
                <s.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.whyEyebrow}</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {c.whyTitle}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {c.why.map((w) => (
              <div key={w.t}>
                <w.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{w.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{c.ctaTitle}</h2>
          <p className="mt-3 text-muted-foreground">{c.ctaText}</p>
          <Link
            to="/reservation"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
          >
            {c.ctaBook} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
