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
import logoLockup from "@/assets/apt-hero-banner.png";
import { DRIVERS } from "@/data/drivers";


const COPY = {
  fr: {
    kicker: "100 % électrique · Charente & Charente-Maritime",
    tagline: "Votre mobilité, notre priorité",
    lead:
      "Deux chauffeurs, deux Audi Q6 e-tron. Un service de taxi haut de gamme, silencieux et zéro émission, disponible 7j/7 et 24h/24.",
    ctaBook: "Réserver ma course",
    ctaCall: "Appeler",
    callPrefix: "Appeler",
    driversEyebrow: "Nos deux chauffeurs",
    driversTitle: "Patricia & Alain, à votre service",
    driversLead:
      "Deux chauffeurs indépendants, une même exigence : ponctualité, discrétion et confort en Audi Q6 e-tron 100 % électrique, en Charente et Charente-Maritime.",
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
    kicker: "100% electric · Charente & Charente-Maritime",
    tagline: "Your mobility, our priority",
    lead:
      "Two drivers, two Audi Q6 e-tron. A premium, silent, zero-emission taxi service available 24/7.",
    ctaBook: "Book a ride",
    ctaCall: "Call",
    callPrefix: "Call",
    driversEyebrow: "Our two drivers",
    driversTitle: "Patricia & Alain, at your service",
    driversLead:
      "Two independent drivers, one shared standard: punctuality, discretion and comfort in a fully electric Audi Q6 e-tron, across Charente and Charente-Maritime.",
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
      { title: "Access Prestige Taxi — Taxi 100 % électrique en Charente" },
      {
        name: "description",
        content:
          "Taxi haut de gamme 100 % électrique en Charente et Charente-Maritime. Deux chauffeurs, Audi Q6 e-tron, transport conventionné, gares & aéroports, 7j/7 24h/24.",
      },
      { property: "og:title", content: "Access Prestige Taxi — Taxi 100 % électrique en Charente" },
      {
        property: "og:description",
        content:
          "Votre mobilité, notre priorité. Réservation rapide, vocale ou écrite, en véhicule 100 % électrique en Charente & Charente-Maritime.",
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
          areaServed: [
            { "@type": "AdministrativeArea", name: "Charente" },
            { "@type": "AdministrativeArea", name: "Charente-Maritime" },
          ],
          telephone: DRIVERS.map((d) => d.intl),
          availableLanguage: ["fr", "en"],
          openingHours: "Mo-Su 00:00-23:59",
          employee: DRIVERS.map((d) => ({
            "@type": "Person",
            name: d.name,
            jobTitle: "Chauffeur de taxi",
            telephone: d.intl,
          })),
          contactPoint: DRIVERS.map((d) => ({
            "@type": "ContactPoint",
            name: d.name,
            telephone: d.intl,
            contactType: "reservations",
            areaServed: ["Charente", "Charente-Maritime"],
            availableLanguage: ["fr", "en"],
          })),
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

        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-14 text-center sm:pt-20">
          <img
            src={logoLockup}
            alt="Access Prestige Taxi — Audi Q6 e-tron, taxi 100 % électrique en Charente"
            width={1536}
            height={500}
            fetchPriority="high"
            className="w-full rounded-2xl drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
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
            {DRIVERS.map((d) => (
              <a
                key={d.tel}
                href={`tel:${d.tel}`}
                aria-label={`${c.callPrefix} ${d.name} — ${d.display}`}
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.callPrefix} {d.name}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{d.display}</span>
                </span>
              </a>
            ))}
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

      {/* DRIVERS */}
      <section id="chauffeurs" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-5xl px-5">
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.driversEyebrow}</p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {c.driversTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            {c.driversLead}
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {DRIVERS.map((d) => (
              <article key={d.tel} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-lg font-semibold text-primary">
                    {d.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-card-foreground">{d.name}</h3>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Audi Q6 e-tron</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {lang === "en" ? d.bio.en : d.bio.fr}
                </p>
                <a
                  href={`tel:${d.tel}`}
                  aria-label={`${c.callPrefix} ${d.name} — ${d.display}`}
                  className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="tabular-nums">
                    {c.callPrefix} {d.name} · {d.display}
                  </span>
                </a>
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
