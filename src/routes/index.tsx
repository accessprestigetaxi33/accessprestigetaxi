import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ogImageUrl, ogPageUrl } from "@/lib/og";
import { SocialMetaSync } from "@/components/SocialMetaSync";
import ogHomeFr from "@/assets/apt-og-home-fr.jpg.asset.json";
import ogHomeEn from "@/assets/apt-og-home-en.jpg.asset.json";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Award,
  Baby,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Clock,
  Crown,
  Gem,
  HeartHandshake,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { ReviewForm } from "@/components/ReviewForm";
import { ClientTrust } from "@/components/ClientTrust";
import { Reveal } from "@/components/motion-ui";
import { imgAt, imgSrcSet } from "@/lib/img";
import { GUIDE_HIGHLIGHTS } from "@/data/guide-highlights";
import heroCars from "@/assets/apt-hero-clean-fr.webp";
import heroCarsEn from "@/assets/apt-hero-clean-en.webp";
import photoDriver from "@/assets/apt-driver.jpg.asset.json";
import photoBmwReal from "@/assets/apt-bmw-real.webp.asset.json";
import photoAudiReal from "@/assets/apt-audi-real.webp.asset.json";
import photoVanReal from "@/assets/apt-van-real.webp.asset.json";
import photoStepVoice from "@/assets/apt-step-voice.webp";
import photoStepConfirm from "@/assets/apt-step-confirm.webp";
import photoStepTrack from "@/assets/apt-step-track.webp";

const BLOG_PICKS = GUIDE_HIGHLIGHTS;
const SLOGAN_FR = "L'excellence à chaque trajet";
const SLOGAN_EN = "Excellence on every journey";
const SITE_URL = "https://www.accessprestigetaxi.fr";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const CARD =
  "rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--gold)_55%,transparent)]";

const ENGAGEMENTS_FR = [
  {
    icon: Stethoscope,
    title: "Transport médical conventionné",
    lead: "Un accompagnement humain, serein et professionnel.",
    details: [
      "Nous assurons votre trajet avec bienveillance et ponctualité, conventionné CPAM.",
      "Tiers payant sur présentation de bon de transport.",
      "Transport personnalisé pour vos consultations, hospitalisations, dialyses, chimiothérapies...",
      "Accompagnement de la porte à porte, toutes distances.",
    ],
  },
  {
    icon: BriefcaseBusiness,
    title: "Prestige & Privé",
    lead: "Vos déplacements méritent mieux qu'un simple trajet.",
    details: [
      "Transferts gares et aéroports, longues distances, déplacements professionnels, événements, mariages, tourisme et mise à disposition.",
      "Accueil personnalisé : vol ou train suivi en temps réel, votre chauffeur ajuste l'heure de prise en charge, pancarte à votre nom.",
      "Déplacements professionnels et privés : ponctualité et discrétion.",
      "Mise à disposition avec chauffeur à partir d'une demi-journée.",
      "Transport de groupe, toutes distances.",
    ],
  },
] as const;

const ENGAGEMENTS_EN = [
  {
    icon: Stethoscope,
    title: "Covered medical transport",
    lead: "Human, reassuring and professional support.",
    details: [
      "We handle your ride with care and punctuality, covered by CPAM.",
      "Third-party payment on presentation of a transport voucher.",
      "Personalised transport for consultations, hospital stays, dialysis, chemotherapy...",
      "Door-to-door support, all distances.",
    ],
  },
  {
    icon: BriefcaseBusiness,
    title: "Prestige & Private",
    lead: "Your journeys deserve more than a simple ride.",
    details: [
      "Station and airport transfers, long distances, business travel, events, weddings, tourism and chauffeur services.",
      "Personalised welcome: flight or train tracked in real time, your driver adjusts pickup time, name board on arrival.",
      "Business and private travel: punctuality and discretion.",
      "Chauffeur service from half a day.",
      "Group transport, all distances.",
    ],
  },
] as const;

const FLEET_VALUES_FR = [
  { icon: Clock, title: "Ponctualité", text: "Nous sommes là quand vous comptez sur nous." },
  { icon: Gem, title: "Discrétion", text: "Une présence professionnelle et respectueuse." },
  { icon: ShieldCheck, title: "Confort", text: "Des voitures haut de gamme et parfaitement entretenues." },
  { icon: HeartHandshake, title: "Attention", text: "Une écoute et un service personnalisé pour chaque trajet." },
] as const;

const FLEET_VALUES_EN = [
  { icon: Clock, title: "Punctuality", text: "We're there when you count on us." },
  { icon: Gem, title: "Discretion", text: "A professional and respectful presence." },
  { icon: ShieldCheck, title: "Comfort", text: "Premium vehicles, perfectly maintained." },
  { icon: HeartHandshake, title: "Attention", text: "Personalised care and service on every ride." },
] as const;

const HERO_PILLARS_FR = [
  { icon: Crown, label: "Élégance" },
  { icon: Gem, label: "Discrétion" },
  { icon: Award, label: "Exigence" },
] as const;

const HERO_PILLARS_EN = [
  { icon: Crown, label: "Elegance" },
  { icon: Gem, label: "Discretion" },
  { icon: Award, label: "Excellence" },
] as const;

const COPY = {
  fr: {
    h1: "L'élégance de votre trajet",
    tagline: "Votre confort, notre priorité",
    lead: "Transport de haut de gamme et transport médical conventionné en Charente-Maritime. Une prise en charge personnalisée, des véhicules premium et un service pensé dans les moindres détails.",
    ctaBook: "Réserver mon trajet",
    callPrefix: "Appeler",
    fleetEyebrow: "Notre flotte",
    fleetTitle: "Votre confort, notre priorité",
    fleetText:
      "La collection Access Prestige Taxi : des véhicules haut de gamme, parfaitement entretenus, pensés pour chaque besoin.",
    vehicles: [
      {
        title: "BMW iX1",
        subtitle: "100 % électrique · 5 places",
        img: photoBmwReal.url,
        alt: "BMW iX1 100 % électrique Access Prestige Taxi",
      },
      {
        title: "Audi Q6 e-tron",
        subtitle: "100 % électrique · SUV premium",
        img: photoAudiReal.url,
        alt: "Audi Q6 e-tron Access Prestige Taxi",
      },
      {
        title: "Mercedes V-Class",
        subtitle: "8 places · transport de groupe",
        img: photoVanReal.url,
        alt: "Mercedes V-Class 8 places Access Prestige Taxi",
      },
    ],
    reviewsEyebrow: "Avis clients",
    reviewsTitle: "Ils nous font confiance",
    reviewsLink: "Voir tous les avis",
    howEyebrow: "Comment réserver ?",
    howTitle: "Réserver en toute simplicité",
    how: [
      {
        s: "1",
        img: photoStepVoice,
        t: "Réservez en ligne ou par téléphone",
        d: "En quelques clics sur le site, ou par un appel direct à votre chauffeur.",
      },
      {
        s: "2",
        img: photoStepConfirm,
        t: "Recevez une confirmation",
        d: "Prix annoncé et chauffeur assigné, confirmation immédiate.",
      },
      {
        s: "3",
        img: photoStepTrack,
        t: "Votre chauffeur vous prend en charge",
        d: "À l'heure convenue, où que vous soyez.",
      },
    ],
    appEyebrow: "Suivi & espace client",
    appText:
      "Installez l'application pour un suivi en temps réel, et retrouvez dans votre espace personnel l'historique de vos courses, vos factures et vos adresses favorites.",
    notify: "Activer les notifications",
    client: "Accéder à l'espace client",
    ios: [
      "Ouvrez Safari et allez sur accessprestigetaxi.fr",
      "Tapez le bouton Partager (carré avec flèche)",
      "Sélectionnez « Sur l'écran d'accueil »",
      "Ouvrez l'appli, puis appuyez sur « Activer les notifications » sur la page Réserver",
    ],
    android: [
      "Ouvrez Chrome et allez sur accessprestigetaxi.fr",
      "Tapez le menu ⋮ (trois points) en haut à droite",
      "Sélectionnez « Ajouter à l'écran d'accueil »",
      "Ouvrez l'appli, puis appuyez sur « Activer les notifications » sur la page Réserver",
    ],
    blogEyebrow: "Le blog",
    blogTitle: "Guide Charente-Maritime",
    blogText: "Restaurants, hôtels, randonnées et lieux à visiter — repérés par vos chauffeurs.",
    blogCta: "Voir tout le guide",
  },
  en: {
    h1: "The elegance of your journey",
    tagline: "Your comfort, our priority",
    lead: "Premium transport and covered medical transport across Charente-Maritime. Personalised care, premium vehicles and a service considered down to the smallest detail.",
    ctaBook: "Book my ride",
    callPrefix: "Call",
    fleetEyebrow: "Our fleet",
    fleetTitle: "Your comfort, our priority",
    fleetText: "The Access Prestige Taxi collection: premium, perfectly maintained vehicles designed for every need.",
    vehicles: [
      {
        title: "BMW iX1",
        subtitle: "100% electric · 5 seats",
        img: photoBmwReal.url,
        alt: "BMW iX1 100% electric Access Prestige Taxi",
      },
      {
        title: "Audi Q6 e-tron",
        subtitle: "100% electric · premium SUV",
        img: photoAudiReal.url,
        alt: "Audi Q6 e-tron Access Prestige Taxi",
      },
      {
        title: "Mercedes V-Class",
        subtitle: "8 seats · group transport",
        img: photoVanReal.url,
        alt: "Mercedes V-Class 8-seat Access Prestige Taxi",
      },
    ],
    reviewsEyebrow: "Client reviews",
    reviewsTitle: "They trust us",
    reviewsLink: "See all reviews",
    howEyebrow: "How to book?",
    howTitle: "Booking made simple",
    how: [
      {
        s: "1",
        img: photoStepVoice,
        t: "Book online or by phone",
        d: "A few clicks on the site, or a direct call to your driver.",
      },
      {
        s: "2",
        img: photoStepConfirm,
        t: "Receive a confirmation",
        d: "Quoted price and assigned driver, confirmed instantly.",
      },
      { s: "3", img: photoStepTrack, t: "Your driver picks you up", d: "At the agreed time, wherever you are." },
    ],
    appEyebrow: "Tracking & account",
    appText:
      "Install the app for real-time tracking, and find your ride history, invoices and saved addresses in your personal account.",
    notify: "Enable notifications",
    client: "Go to the client area",
    ios: [
      "Open Safari and go to accessprestigetaxi.fr",
      "Tap the Share button (square with arrow)",
      "Select “Add to Home Screen”",
      "Open the app, then tap “Enable notifications” on the Book a ride page",
    ],
    android: [
      "Open Chrome and go to accessprestigetaxi.fr",
      "Tap the ⋮ menu at the top right",
      "Select “Add to Home Screen”",
      "Open the app, then tap “Enable notifications” on the Book a ride page",
    ],
    blogEyebrow: "Blog",
    blogTitle: "Charente-Maritime guide",
    blogText: "Restaurants, hotels, hikes and places to visit — picked by your drivers.",
    blogCta: "See the full guide",
  },
} as const;

const HOME_SOCIAL_FR = {
  title: "Access Prestige Taxi — L'excellence à chaque trajet",
  description:
    "L'excellence à chaque trajet : réservation en ligne ou par téléphone, BMW iX1 et Audi Q6 e-tron électriques, van Mercedes 8 places en Charente-Maritime.",
  image: ogImageUrl(ogHomeFr.url),
  alt: "Access Prestige Taxi — taxi 100 % électrique en Charente-Maritime",
  url: ogPageUrl("/", "fr"),
};

const HOME_SOCIAL_EN = {
  title: "Access Prestige Taxi — Excellence on every journey",
  description:
    "Book online or by phone: electric BMW iX1 and Audi Q6 e-tron, plus an 8-seat Mercedes van across Charente-Maritime.",
  image: ogImageUrl(ogHomeEn.url),
  alt: "Access Prestige Taxi — electric taxi in Charente-Maritime",
  url: ogPageUrl("/", "en"),
};

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | "fr" } => ({
    lang: search["lang"] === "en" ? "en" : search["lang"] === "fr" ? "fr" : undefined,
  }),
  head: (ctx: { match?: { search?: { lang?: "en" | "fr" } } }) => {
    const isEn = ctx?.match?.search?.lang === "en";
    const social = isEn ? HOME_SOCIAL_EN : HOME_SOCIAL_FR;
    return {
      meta: [
        {
          title: isEn
            ? "Electric taxi in Charente-Maritime | Access Prestige"
            : "Taxi électrique Charente-Maritime | Access Prestige",
        },
        {
          name: "description",
          content: isEn
            ? "Taxi in Charente-Maritime: electric premium vehicles, 8-seat van and covered medical transport."
            : "Taxi en Charente-Maritime : véhicules électriques premium, van 8 places et transport sanitaire conventionné.",
        },
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
        { property: "og:image:alt", content: social.alt },
        { property: "og:locale", content: isEn ? "en_GB" : "fr_FR" },
        { property: "og:locale:alternate", content: isEn ? "fr_FR" : "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: social.title },
        { name: "twitter:description", content: social.description },
        { name: "twitter:image", content: social.image },
        { name: "twitter:image:alt", content: social.alt },
      ],
      links: seoLinks("/", ctx?.match?.search),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TaxiService",
            "@id": `${SITE_URL}/#taxiservice`,
            name: "Access Prestige Taxi",
            alternateName: "Access Prestige Taxi — taxi conventionné Charente-Maritime",
            slogan: SLOGAN_FR,
            url: SITE_URL,
            image: absoluteUrl(heroCars),
            logo: absoluteUrl("/favicon.png"),
            email: "accessprestigetaxi@gmail.com",
            currenciesAccepted: "EUR",
            paymentAccepted: "Espèces, Carte bancaire, Virement, Tiers payant (transport conventionné)",
            address: { "@type": "PostalAddress", addressRegion: "Charente-Maritime", addressCountry: "FR" },
            areaServed: [
              { "@type": "AdministrativeArea", name: "Charente-Maritime" },
              { "@type": "City", name: "La Rochelle" },
              { "@type": "City", name: "Rochefort" },
              { "@type": "City", name: "Saintes" },
              { "@type": "City", name: "Royan" },
              { "@type": "City", name: "Saint-Jean-d'Angély" },
            ],
            knowsLanguage: ["fr", "en"],
            telephone: DRIVERS.map((d) => d.intl),
            availableLanguage: ["fr", "en"],
            openingHours: "Mo-Fr 08:00-20:00",
            priceRange: "€€",
            employee: DRIVERS.map((d) => ({
              "@type": "Person",
              name: d.name,
              jobTitle: "Chauffeur de taxi",
              telephone: d.intl,
            })),
          }),
        },
      ],
    };
  },
});

function Index() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const engagements = lang === "en" ? ENGAGEMENTS_EN : ENGAGEMENTS_FR;
  const fleetValues = lang === "en" ? FLEET_VALUES_EN : FLEET_VALUES_FR;
  const pillars = lang === "en" ? HERO_PILLARS_EN : HERO_PILLARS_FR;
  const [openEngagement, setOpenEngagement] = useState<number | null>(null);

  return (
    <main>
      <SocialMetaSync lang={lang === "en" ? "en" : "fr"} fr={HOME_SOCIAL_FR} en={HOME_SOCIAL_EN} />

      {/* 1. HERO — uniquement le contenu prévu sur le document */}
      <section className="relative isolate overflow-hidden border-b border-border bg-black">
        <div className="relative h-[42svh] min-h-[300px] max-h-[620px] sm:h-[48vh]">
          <img
            src={lang === "en" ? heroCarsEn : heroCars}
            alt={
              lang === "en"
                ? "Access Prestige Taxi — premium vehicles in Charente-Maritime"
                : "Access Prestige Taxi — véhicules premium en Charente-Maritime"
            }
            fetchPriority="high"
            loading="eager"
            width={1376}
            height={768}
            className="h-full w-full object-contain object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.9)_100%)]" />
        </div>

        <div className="relative bg-black px-5 pb-14 pt-8 sm:px-6 sm:pb-18 sm:pt-10 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl text-balance">
                {c.h1}
              </h1>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary sm:text-base">
                {c.tagline}
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{c.lead}</p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/reserver"
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl btn-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02]"
                >
                  {c.ctaBook} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {DRIVERS.map((d) => (
                  <a
                    key={d.tel}
                    href={`tel:${d.tel}`}
                    aria-label={`${c.callPrefix} ${d.name} — ${d.display}`}
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border-2 border-primary bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                        {c.callPrefix} {d.name}
                      </span>
                      <span className="text-sm tabular-nums">{d.display}</span>
                    </span>
                  </a>
                ))}
              </div>

              <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                {pillars.map((p, i) => (
                  <li key={p.label} className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/85">
                      <p.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      {p.label}
                    </span>
                    {i < pillars.length - 1 && (
                      <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. NOS ENGAGEMENTS — présent sur le document */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">
              {lang === "en" ? "Our commitments" : "Nos engagements"}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {engagements.map((e, i) => {
              const isOpen = openEngagement === i;
              return (
                <Reveal key={e.title} delay={i * 0.08}>
                  <div className={`h-full p-7 sm:p-8 ${CARD}`}>
                    <e.icon className="h-9 w-9 text-primary" aria-hidden="true" />
                    <h2 className="mt-4 font-display text-xl font-semibold text-card-foreground sm:text-2xl">
                      {e.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{e.lead}</p>
                    <button
                      type="button"
                      onClick={() => setOpenEngagement(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {isOpen
                        ? lang === "en"
                          ? "Show less"
                          : "Voir moins"
                        : lang === "en"
                          ? "Learn more"
                          : "En savoir plus"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-5 space-y-2 overflow-hidden border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground"
                        >
                          {e.details.map((d) => (
                            <li key={d} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                              {d}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. NOTRE FLOTTE — présent sur le document */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.fleetEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.fleetTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
              {c.fleetText}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {c.vehicles.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <article className={`overflow-hidden ${CARD}`}>
                  <img
                    src={v.img}
                    alt={v.alt}
                    loading="lazy"
                    width={1600}
                    height={900}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="p-5 text-center sm:p-6">
                    <h3 className="font-display text-xl font-semibold text-card-foreground">{v.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{v.subtitle}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fleetValues.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <div className={`p-5 text-center ${CARD}`}>
                  <v.icon className="mx-auto h-7 w-7 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-base font-semibold text-card-foreground">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Baby className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {lang === "en"
              ? "Baby seats and booster seats available on request."
              : "Sièges bébé et rehausseurs disponibles sur demande."}
          </p>
        </div>
      </section>

      {/* 4. AVIS CLIENTS — présent sur le document */}
      <section id="avis" className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.reviewsEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {c.reviewsTitle}
            </h2>
            <div className="mt-5 flex justify-center">
              <a href="#avis" className="text-sm font-semibold text-primary underline underline-offset-4">
                {c.reviewsLink}
              </a>
            </div>
          </Reveal>

          <div className="mt-10">
            <ClientTrust>
              <div className="mx-auto max-w-2xl border-t border-border pt-10">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <ReviewForm />
                </div>
              </div>
            </ClientTrust>
          </div>
        </div>
      </section>

      {/* 5. COMMENT RÉSERVER — ajouté comme demandé */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.howEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.howTitle}
            </h2>
          </Reveal>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {c.how.map((h, i) => (
              <Reveal as="li" key={h.s} delay={i * 0.08}>
                <div className={`h-full overflow-hidden bg-background ${CARD}`}>
                  <img
                    src={h.img}
                    alt={h.t}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-6">
                    <span className="font-display text-4xl font-semibold text-primary/30">{h.s}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{h.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.2}>
            <div className="mt-8 flex justify-center">
              <Link
                to="/reserver"
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl btn-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02]"
              >
                {c.ctaBook} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. SUIVI & ESPACE CLIENT — ajouté comme demandé */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="dark rounded-3xl border border-primary/40 bg-card p-7 shadow-[var(--shadow-gold)] sm:p-8">
              <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.appEyebrow}</p>
              <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-foreground/80 sm:text-base">
                {c.appText}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/reserver"
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl btn-gold px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" /> {c.notify}
                </Link>
                <Link
                  to="/client/login"
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-primary px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  {c.client} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Reveal delay={0.08}>
              <article className={`h-full p-6 ${CARD}`}>
                <h3 className="font-display text-base font-semibold text-card-foreground">iPhone / iOS</h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {c.ios.map((step, i) => (
                    <li key={step}>
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
              </article>
            </Reveal>
            <Reveal delay={0.14}>
              <article className={`h-full p-6 ${CARD}`}>
                <h3 className="font-display text-base font-semibold text-card-foreground">Android</h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {c.android.map((step, i) => (
                    <li key={step}>
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. BLOG — conservé comme demandé */}
      <section className="border-t border-border bg-background py-20">
        <div className="divider-gold" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.blogEyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
                  {c.blogTitle}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">{c.blogText}</p>
              </div>
              <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
                {c.blogCta} →
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_PICKS.map((e, i) => (
              <Reveal key={e.slug} delay={i * 0.06}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: e.slug }}
                  className={`group block h-full overflow-hidden ${CARD}`}
                >
                  <img
                    src={imgAt(e.photo, 500)}
                    srcSet={imgSrcSet(e.photo, [250, 330, 500])}
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
                    alt={`${e.name} — ${e.city}`}
                    loading="lazy"
                    decoding="async"
                    width={500}
                    height={352}
                    className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{e.city}</p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-card-foreground">{e.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {lang === "en" ? e.en : e.fr}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
