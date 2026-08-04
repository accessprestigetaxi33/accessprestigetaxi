import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Baby,
  BatteryCharging,
  BriefcaseBusiness,
  Phone,
  PlaneTakeoff,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { ReviewForm } from "@/components/ReviewForm";
import { ClientTrust } from "@/components/ClientTrust";
import { Reveal, Counter } from "@/components/motion-ui";
import { GUIDE_ENTRIES } from "@/data/guide-charente";
import { DESTINATIONS } from "@/data/destinations";
import heroCars from "@/assets/apt-hero-2026c.png.asset.json";
import photoInterior from "@/assets/apt-interior.jpg.asset.json";
import photoDriver from "@/assets/apt-driver.jpg.asset.json";
import photoExterior from "@/assets/apt-exterior.jpg.asset.json";
import photoVan from "@/assets/apt-van.jpg.asset.json";
import photoMedical from "@/assets/apt-medical.jpg";
import photoAirport from "@/assets/apt-airport.jpg";
import photoBusiness from "@/assets/apt-business.jpg";
import photoPrice from "@/assets/apt-price.jpg";
import photoLaRochelle from "@/assets/apt-larochelle.jpg";
import photoIleDeRe from "@/assets/apt-ile-de-re.jpg";
import photoRoyan from "@/assets/apt-royan.jpg";
import photoGare from "@/assets/apt-gare.jpg";
import photoStepVoice from "@/assets/apt-step-voice.jpg";
import photoStepConfirm from "@/assets/apt-step-confirm.jpg";
import photoStepTrack from "@/assets/apt-step-track.jpg";

const BLOG_PICKS = ["hotel", "restaurant", "visite"]
  .map((cat) => GUIDE_ENTRIES.find((e) => e.category === cat))
  .filter((e): e is (typeof GUIDE_ENTRIES)[number] => Boolean(e));

const SLOGAN_FR = "L'excellence à chaque trajet";
const SLOGAN_EN = "Excellence on every journey";

// TODO : remplace par le domaine définitif si tu passes sur un nom de domaine perso
// (ex: https://accessprestigetaxi.fr). Sert à générer des URLs absolues pour
// og:url / og:image / twitter:image, obligatoires selon la spec Open Graph.
const SITE_URL = "https://accessprestigetaxi.lovable.app";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const CARD =
  "rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--gold)_55%,transparent)]";

// Diaporama hero façon pub, en attendant une vraie vidéo : zoom/pan lent (Ken Burns)
// en fondu enchaîné entre plusieurs photos existantes. Ajoute/retire des entrées
// ici pour changer les visuels utilisés.
const HERO_SLIDES = [
  {
    src: heroCars.url,
    alt: "BMW iX1, Audi Q8 et van Mercedes 7 places Access Prestige Taxi, 100 % électrique, au coucher du soleil",
    pan: { x: 0, y: 0 },
    // Bannière de marque : contient du texte (TRANSPORT · TRANSFERTS · DÉPLACEMENTS,
    // 100 % ÉLECTRIQUE) qu'il ne faut jamais rogner → affichage intégral.
    contain: true,
  },
  {
    src: photoExterior.url,
    alt: "BMW iX1 Access Prestige Taxi, extérieur",
    pan: { x: 18, y: 6 },
  },
  {
    src: photoDriver.url,
    alt: "Chauffeur Access Prestige Taxi au volant",
    pan: { x: -14, y: 10 },
  },
  {
    src: photoVan.url,
    alt: "Van Mercedes 7 places Access Prestige Taxi",
    pan: { x: 16, y: -10 },
  },
];

const HERO_SLIDE_DURATION_MS = 6000;

/** Fait défiler les slides, sauf si l'utilisateur préfère un mouvement réduit. */
function useHeroSlideshow(count: number, durationMs: number) {
  const [index, setIndex] = useState(0);
  const [canAnimate, setCanAnimate] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setCanAnimate(!prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!canAnimate || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), durationMs);
    return () => clearInterval(id);
  }, [canAnimate, count, durationMs]);

  return { index, canAnimate };
}

const COPY = {
  fr: {
    kicker: "100 % électrique · Charente-Maritime",
    tagline: SLOGAN_FR,
    lead: "Deux chauffeurs, une BMW iX1 100 % électrique et un van Mercedes 7 places. Un service de taxi haut de gamme, silencieux et attentionné, disponible 5j/7 de 8h à 20h.",
    ctaBook: "Réserver ma course",
    ctaCall: "Appeler",
    callPrefix: "Appeler",
    driversEyebrow: "Nos deux chauffeurs",
    driversTitle: "Patricia & Alain, à votre service",
    driversLead:
      "Deux chauffeurs indépendants, une même exigence : ponctualité, discrétion et confort, en Charente-Maritime.",
    stats: [
      { n: 2, suffix: "", l: "chauffeurs dédiés" },
      { n: 100, suffix: " %", l: "électrique (BMW iX1)" },
      { n: 7, suffix: " places", l: "van Mercedes" },
      { n: 5, suffix: "j/7 · 8h-20h", l: "disponibilité" },
    ],
    servicesEyebrow: "Nos services",
    servicesTitle: "Une prestation pensée pour chaque trajet",
    services: [
      { photo: photoMedical, t: "Transport conventionné", d: "Trajets médicaux assis, prise en charge simplifiée." },
      {
        photo: photoInterior.url,
        t: "Confort intérieur",
        d: "Habitacle soigné, silence électrique, eau et chargeurs à bord.",
      },
      { photo: photoAirport, t: "Gares & aéroports", d: "Suivi des vols et des trains, accueil en gare." },
      {
        photo: photoDriver.url,
        t: "Chauffeurs agréés",
        d: "Patricia et Alain, chauffeurs de taxi conventionnés en Charente-Maritime.",
      },
      { photo: photoBusiness, t: "Déplacements professionnels", d: "Ponctualité, discrétion, facture entreprise." },
      {
        photo: photoExterior.url,
        t: "Disponible 5j/7, 8h-20h",
        d: "Réservation immédiate ou planifiée, 5 jours sur 7, de 8h à 20h.",
      },
    ],
    seatsEyebrow: "Familles",
    seatsTitle: "Sièges bébé et rehausseurs enfants, sur demande",
    seatsText:
      "Nous embarquons gratuitement un siège bébé (0-13 kg), un siège enfant ou un rehausseur : précisez-le simplement au moment de la réservation rapide, nous préparons le véhicule avant votre départ.",
    seatsItems: ["Siège bébé (0-13 kg)", "Siège enfant (9-18 kg)", "Rehausseur (15-36 kg)"],
    seatsCta: "Choisir mon siège à la réservation",
    groupEyebrow: "Transport de groupe",
    groupTitle: "Jusqu'à 7 personnes dans le van Mercedes",
    groupText:
      "Famille, équipe, mariage, sortie entre amis ou transfert aéroport à plusieurs : le van Mercedes d'Alain accueille jusqu'à 7 passagers avec leurs bagages, en un seul trajet et à un seul tarif.",
    groupBullets: ["7 passagers + bagages", "Un seul tarif, un seul véhicule", "Mise à disposition à l'heure"],
    groupCta: "Réserver le van 7 places",
    whyEyebrow: "Pourquoi nous",
    whyTitle: "L'élégance électrique, sans compromis",
    why: [
      {
        photo: photoExterior.url,
        t: "Zéro émission",
        d: "La BMW iX1 de Patricia roule 100 % à l'électrique, sans bruit ni vibration.",
      },
      {
        photo: photoDriver.url,
        t: "Deux chauffeurs, un standard",
        d: "Même exigence de confort, de discrétion et de ponctualité.",
      },
      { photo: photoPrice, t: "Prix annoncé, prix tenu", d: "Estimation transparente avant le départ." },
    ],
    bannerTitle: "La Charente-Maritime, d'un point à l'autre",
    bannerText:
      "La Rochelle, Rochefort, Royan, Saintes, Île de Ré et Oléron — nous vous y conduisons 5j/7, de 8h à 20h.",
    destEyebrow: "Destinations",
    destTitle: "Là où l'on vous emmène",
    destLead: "Quelques itinéraires que nos clients réservent au quotidien : l'arrivée en douceur, c'est notre métier.",
    destinations: [
      { img: photoAirport, from: "La Rochelle", to: "Aéroport de La Rochelle", meta: "≈ 15 min · vol suivi" },
      { img: photoGare, from: "Rochefort", to: "Gare TGV", meta: "≈ 20 min · accueil quai" },
      { img: photoIleDeRe, from: "La Rochelle", to: "Île de Ré", meta: "≈ 35 min · pont inclus" },
      { img: photoRoyan, from: "Saintes", to: "Royan", meta: "≈ 45 min · côte de Beauté" },
      { img: photoVan.url, from: "Groupe", to: "Van 7 places", meta: "Transferts à plusieurs" },
      { img: photoMedical, from: "Domicile", to: "Hôpital / clinique", meta: "Conventionné CPAM" },
    ],
    bestEyebrow: "Les best-sellers",
    bestTitle: "Nos courses les plus demandées",
    best: [
      {
        n: "01",
        img: photoGare,
        t: "Transferts gare & aéroport",
        d: "Accueil pancarte, suivi du train ou du vol, bagages pris en charge.",
      },
      {
        n: "02",
        img: photoMedical,
        t: "Trajets médicaux conventionnés",
        d: "Dialyse, chimiothérapie, consultations : prise en charge simplifiée.",
      },
      {
        n: "03",
        img: photoVan.url,
        t: "Groupes jusqu'à 7 personnes",
        d: "Van Mercedes, bagages inclus, un seul véhicule pour tout le monde.",
      },
    ],
    howEyebrow: "Comment ça marche",
    howTitle: "Trois étapes, une minute",
    how: [
      {
        s: "1",
        img: photoStepVoice,
        t: "Vous décrivez le trajet",
        d: "À la voix ou à l'écrit : départ, arrivée, date, heure et siège enfant.",
      },
      {
        s: "2",
        img: photoStepConfirm,
        t: "Nous confirmons",
        d: "Prix annoncé et chauffeur assigné, confirmation par e-mail.",
      },
      {
        s: "3",
        img: photoStepTrack,
        t: "Vous suivez la course",
        d: "Lien de suivi en temps réel, puis reçu détaillé à l'arrivée.",
      },
    ],
    clientEyebrow: "Espace client",
    clientTitle: "Vos courses, vos factures, au même endroit",
    clientText:
      "Créez votre espace pour retrouver l'historique de vos trajets, télécharger vos factures, enregistrer vos adresses favorites et programmer vos courses récurrentes.",
    clientCta: "Accéder à l'espace client",
    reviewEyebrow: "Vos avis",
    reviewTitle: "Déposez votre avis",
    reviewText: "Votre retour aide Patricia et Alain à faire encore mieux. Merci pour votre confiance.",
    blogEyebrow: "Le blog",
    blogTitle: "Guide Charente-Maritime",
    blogText: "Restaurants, hôtels, randonnées et lieux à visiter — repérés par vos chauffeurs.",
    blogCta: "Voir tout le guide",
    ctaTitle: "Prêt à réserver votre course ?",
    ctaText: "Réservation en moins d'une minute, à la voix ou à l'écrit.",
  },
  en: {
    kicker: "100% electric · Charente-Maritime",
    tagline: SLOGAN_EN,
    lead: "Two drivers, one fully electric BMW iX1 and one 7-seat Mercedes van. A premium, silent and attentive taxi service, available 5 days a week from 8am to 8pm.",
    ctaBook: "Book a ride",
    ctaCall: "Call",
    callPrefix: "Call",
    driversEyebrow: "Our two drivers",
    driversTitle: "Patricia & Alain, at your service",
    driversLead:
      "Two independent drivers, one shared standard: punctuality, discretion and comfort across Charente-Maritime.",
    stats: [
      { n: 2, suffix: "", l: "dedicated drivers" },
      { n: 100, suffix: "%", l: "electric (BMW iX1)" },
      { n: 7, suffix: " seats", l: "Mercedes van" },
      { n: 5, suffix: " days/wk · 8am-8pm", l: "availability" },
    ],
    servicesEyebrow: "Our services",
    servicesTitle: "A service designed for every journey",
    services: [
      { photo: photoMedical, t: "Medical transport", d: "Seated medical trips with simplified coverage." },
      {
        photo: photoInterior.url,
        t: "Interior comfort",
        d: "Immaculate cabin, electric silence, water and chargers on board.",
      },
      { photo: photoAirport, t: "Stations & airports", d: "Flight and train tracking, meet & greet." },
      {
        photo: photoDriver.url,
        t: "Licensed drivers",
        d: "Patricia and Alain, licensed taxi drivers in Charente-Maritime.",
      },
      { photo: photoBusiness, t: "Business travel", d: "Punctual, discreet, company invoicing." },
      {
        photo: photoExterior.url,
        t: "Available 5 days a week, 8am-8pm",
        d: "Instant or scheduled booking, five days a week, 8am to 8pm.",
      },
    ],
    seatsEyebrow: "Families",
    seatsTitle: "Baby seats and child boosters, on request",
    seatsText:
      "We carry a baby seat (0-13 kg), a child seat or a booster free of charge: just pick the seat type in the quick booking form and we fit it before pickup.",
    seatsItems: ["Baby seat (0-13 kg)", "Child seat (9-18 kg)", "Booster (15-36 kg)"],
    seatsCta: "Pick my seat when booking",
    groupEyebrow: "Group transport",
    groupTitle: "Up to 7 people in the Mercedes van",
    groupText:
      "Family, team, wedding, night out or a group airport transfer: Alain's Mercedes van seats up to 7 passengers with their luggage — one ride, one fare.",
    groupBullets: ["7 passengers + luggage", "One fare, one vehicle", "Hourly hire available"],
    groupCta: "Book the 7-seat van",
    whyEyebrow: "Why us",
    whyTitle: "Electric elegance, no compromise",
    why: [
      {
        photo: photoExterior.url,
        t: "Zero emissions",
        d: "Patricia's BMW iX1 is fully electric — no noise, no vibration.",
      },
      {
        photo: photoDriver.url,
        t: "Two drivers, one standard",
        d: "The same demand for comfort, discretion and punctuality.",
      },
      { photo: photoPrice, t: "Quoted price, final price", d: "Transparent estimate before departure." },
    ],
    bannerTitle: "Charente-Maritime, door to door",
    bannerText:
      "La Rochelle, Rochefort, Royan, Saintes, Île de Ré and Oléron — we drive you there 5 days a week, 8am to 8pm.",
    destEyebrow: "Destinations",
    destTitle: "Where we take you",
    destLead: "A few routes our clients book every day — arriving smoothly is our job.",
    destinations: [
      { img: photoAirport, from: "La Rochelle", to: "La Rochelle airport", meta: "≈ 15 min · flight tracked" },
      { img: photoGare, from: "Rochefort", to: "TGV station", meta: "≈ 20 min · platform meet" },
      { img: photoIleDeRe, from: "La Rochelle", to: "Île de Ré", meta: "≈ 35 min · bridge included" },
      { img: photoRoyan, from: "Saintes", to: "Royan", meta: "≈ 45 min · Atlantic coast" },
      { img: photoVan.url, from: "Group", to: "7-seat van", meta: "Group transfers" },
      { img: photoMedical, from: "Home", to: "Hospital / clinic", meta: "Medical transport" },
    ],
    bestEyebrow: "Best-sellers",
    bestTitle: "Our most requested rides",
    best: [
      {
        n: "01",
        img: photoGare,
        t: "Station & airport transfers",
        d: "Meet & greet, train or flight tracking, luggage handled.",
      },
      {
        n: "02",
        img: photoMedical,
        t: "Covered medical trips",
        d: "Dialysis, chemotherapy, appointments: simplified coverage.",
      },
      {
        n: "03",
        img: photoVan.url,
        t: "Groups of up to 7",
        d: "Mercedes van, luggage included, one vehicle for everyone.",
      },
    ],
    howEyebrow: "How it works",
    howTitle: "Three steps, one minute",
    how: [
      {
        s: "1",
        img: photoStepVoice,
        t: "Describe your ride",
        d: "By voice or typing: pickup, drop-off, date, time and child seat.",
      },
      {
        s: "2",
        img: photoStepConfirm,
        t: "We confirm",
        d: "Quoted price and assigned driver, confirmed by email.",
      },
      {
        s: "3",
        img: photoStepTrack,
        t: "Track your ride",
        d: "Live tracking link, then a detailed receipt on arrival.",
      },
    ],
    clientEyebrow: "Client area",
    clientTitle: "Your rides and invoices in one place",
    clientText:
      "Create your account to find your ride history, download invoices, save favourite addresses and schedule recurring rides.",
    clientCta: "Go to the client area",
    reviewEyebrow: "Your reviews",
    reviewTitle: "Leave a review",
    reviewText: "Your feedback helps Patricia and Alain do even better. Thank you for your trust.",
    blogEyebrow: "The blog",
    blogTitle: "Charente-Maritime guide",
    blogText: "Restaurants, hotels, hikes and places to visit — picked by your drivers.",
    blogCta: "See the full guide",
    ctaTitle: "Ready to book your ride?",
    ctaText: "Book in under a minute, by voice or by typing.",
  },
} as const;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Access Prestige Taxi — Taxi 100 % électrique en Charente-Maritime" },
      {
        name: "description",
        content:
          "Taxi haut de gamme 100 % électrique en Charente-Maritime. Deux chauffeurs, BMW iX1 électrique et van Mercedes 7 places, sièges bébé et enfants, transport conventionné, gares & aéroports, 5j/7 8h-20h.",
      },
      { property: "og:title", content: "Access Prestige Taxi — L'excellence à chaque trajet" },
      {
        property: "og:description",
        content:
          "L'excellence à chaque trajet : réservation rapide vocale ou écrite, BMW iX1 100 % électrique et van Mercedes 7 places en Charente-Maritime, 5j/7 8h-20h.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:image", content: absoluteUrl(heroCars.url) },
      { property: "og:image:width", content: "1656" },
      { property: "og:image:height", content: "932" },
      {
        property: "og:image:alt",
        content: "BMW iX1 100 % électrique et van Mercedes 7 places Access Prestige Taxi",
      },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Access Prestige Taxi — L'excellence à chaque trajet" },
      {
        name: "twitter:description",
        content:
          "Taxi haut de gamme 100 % électrique en Charente-Maritime, 5j/7 de 8h à 20h. Réservation en moins d'une minute.",
      },
      { name: "twitter:image", content: absoluteUrl(heroCars.url) },
    ],
    links: seoLinks("/"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TaxiService",
          name: "Access Prestige Taxi",
          slogan: SLOGAN_FR,
          url: SITE_URL,
          image: absoluteUrl(heroCars.url),
          // TODO : remplace par ton logo réel si tu en as un dans /assets (utile pour le Knowledge Panel Google)
          // logo: absoluteUrl("/logo.png"),
          // TODO : renseigne l'adresse réelle si tu as un point fixe (bureau, station) —
          // important pour le référencement local / pack Google Maps. Sans adresse fixe
          // pour un service de VTC/taxi à domicile, tu peux laisser addressRegion seul.
          address: {
            "@type": "PostalAddress",
            addressRegion: "Charente-Maritime",
            addressCountry: "FR",
          },
          areaServed: [{ "@type": "AdministrativeArea", name: "Charente-Maritime" }],
          telephone: DRIVERS.map((d) => d.intl),
          availableLanguage: ["fr", "en"],
          openingHours: "Mo-Fr 08:00-20:00",
          // TODO : ajuste selon ta tarification réelle (€, €€, €€€)
          priceRange: "€€",
          // TODO : ajoute tes profils réels (Google Business, Facebook, Instagram...) —
          // utile pour relier ta fiche Google Business à ce site.
          // sameAs: ["https://www.google.com/maps/place/...", "https://www.facebook.com/..."],
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
            areaServed: ["Charente-Maritime"],
            availableLanguage: ["fr", "en"],
          })),
          // IMPORTANT : n'active aggregateRating que si ce sont de VRAIS avis. Google
          // pénalise (et peut désindexer) les notes fictives ou gonflées en JSON-LD.
          // Branche ratingValue/reviewCount sur tes données réelles issues de ReviewForm/
          // ClientTrust dès que tu as un nombre d'avis significatif, par ex :
          // aggregateRating: {
          //   "@type": "AggregateRating",
          //   ratingValue: realAverageRating,
          //   reviewCount: realReviewCount,
          // },
        }),
      },
    ],
  }),
});

function Index() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const { index: slideIndex, canAnimate } = useHeroSlideshow(HERO_SLIDES.length, HERO_SLIDE_DURATION_MS);

  return (
    <main>
      {/* HERO — diaporama photo avec effet Ken Burns (zoom/pan lent), sans texte en surimpression */}
      <section className="relative isolate min-h-[55svh] overflow-hidden sm:min-h-[60vh] lg:min-h-[70vh]">
        <AnimatePresence mode="sync">
          <motion.div
            key={slideIndex}
            className="absolute inset-0 -z-20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <motion.img
              src={HERO_SLIDES[slideIndex].src}
              alt={HERO_SLIDES[slideIndex].alt}
              fetchPriority={slideIndex === 0 ? "high" : undefined}
              loading={slideIndex === 0 ? "eager" : "lazy"}
              width={1656}
              height={932}
              className="h-full w-full object-cover object-center"
              initial={{ scale: 1.06, x: 0, y: 0 }}
              animate={
                canAnimate
                  ? { scale: 1.16, x: HERO_SLIDES[slideIndex].pan.x, y: HERO_SLIDES[slideIndex].pan.y }
                  : { scale: 1.06, x: 0, y: 0 }
              }
              transition={{ duration: (HERO_SLIDE_DURATION_MS / 1000) * 1.5, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,8,10,0.15)_0%,rgba(8,8,10,0.35)_60%,var(--background)_100%)]" />
      </section>

      {/* HERO — contenu (titre, texte, CTA, stats), juste après la vidéo/photo */}
      <section className="border-t border-border bg-background pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-primary"
          >
            <BatteryCharging className="hidden h-3.5 w-3.5 sm:inline-block" />
            <span className="text-[10px] leading-relaxed sm:text-[11px]">{c.kicker}</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl text-balance"
          >
            {c.tagline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {c.lead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex w-full flex-col flex-wrap items-stretch justify-center gap-3 md:w-auto md:flex-row md:items-center"
          >
            <Link
              to="/reserver"
              className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
            >
              {c.ctaBook} <ArrowRight className="h-4 w-4" />
            </Link>
            {DRIVERS.map((d) => (
              <a
                key={d.tel}
                href={`tel:${d.tel}`}
                aria-label={`${c.callPrefix} ${d.name} — ${d.display}`}
                className="inline-flex min-h-[52px] touch-manipulation items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition duration-300 hover:scale-[1.03] hover:border-primary active:scale-[0.98]"
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
          </motion.div>

          <dl className="mt-14 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {c.stats.map((s) => (
              <div key={s.l} className="bg-card px-3 py-4 sm:px-4 sm:py-5">
                <dt className="font-display text-xl font-semibold text-primary sm:text-2xl lg:text-3xl">
                  <Counter value={s.n} suffix={s.suffix} />
                </dt>
                <dd className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-[11px]">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SERVICES */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.servicesEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.servicesTitle}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.services.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.05}>
                <article className={`group h-full overflow-hidden ${CARD}`}>
                  {"photo" in s && s.photo ? (
                    <img
                      src={s.photo}
                      alt={s.t}
                      loading="lazy"
                      width={1280}
                      height={853}
                      className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-card-foreground">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SIÈGES BÉBÉ & ENFANTS */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-6 lg:px-8 lg:grid-cols-2">
          <Reveal>
            <img
              src={photoInterior.url}
              alt={c.seatsTitle}
              loading="lazy"
              width={1280}
              height={853}
              className="aspect-[4/3] w-full rounded-3xl border border-border object-cover"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.seatsEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.seatsTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.seatsText}</p>
            <ul className="mt-6 space-y-2">
              {c.seatsItems.map((s) => (
                <li key={s} className="flex items-center gap-3 text-sm text-foreground">
                  <Baby className="h-4 w-4 shrink-0 text-primary" />
                  {s}
                </li>
              ))}
            </ul>
            <Link
              to="/reserver"
              className="mt-7 inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              {c.seatsCta} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* TRANSPORT DE GROUPE — VAN 7 PLACES */}
      <section className="border-t border-border py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-6 lg:px-8 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <img
              src={photoVan.url}
              alt={c.groupTitle}
              loading="lazy"
              width={1600}
              height={900}
              className="aspect-[16/10] w-full rounded-3xl border border-border object-cover"
            />
          </Reveal>
          <Reveal delay={0.08} className="lg:order-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.groupEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.groupTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.groupText}</p>
            <ul className="mt-6 space-y-2">
              {c.groupBullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-foreground">
                  <Users className="h-4 w-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to="/reserver"
              search={{ passagers: 7 } as never}
              className="mt-7 inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary transition duration-300 hover:scale-[1.03] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
            >
              {c.groupCta} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* BANNIÈRE PHOTO PLEINE LARGEUR */}
      <section className="relative isolate overflow-hidden border-y border-border">
        <img
          src={photoExterior.url}
          alt={c.bannerTitle}
          loading="lazy"
          width={1600}
          height={900}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,8,10,0.92),rgba(8,8,10,0.55))]" />
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-24 sm:py-32">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.bannerTitle}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85 sm:text-base">{c.bannerText}</p>
            <Link
              to="/reserver"
              className="mt-8 inline-flex min-h-[48px] touch-manipulation items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              {c.ctaBook} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* DRIVERS */}
      <section id="chauffeurs" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.driversEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.driversTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
              {c.driversLead}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {DRIVERS.map((d, i) => (
              <Reveal key={d.tel} delay={i * 0.08}>
                <article className={`h-full p-6 sm:p-7 ${CARD}`}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-lg font-semibold text-primary">
                      {d.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold text-card-foreground">{d.name}</h3>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {lang === "en" ? d.vehicle.en : d.vehicle.fr} · {d.seats}
                        {lang === "en" ? " seats" : " places"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {lang === "en" ? d.bio.en : d.bio.fr}
                  </p>
                  <a
                    href={`tel:${d.tel}`}
                    aria-label={`${c.callPrefix} ${d.name} — ${d.display}`}
                    className="mt-6 inline-flex min-h-[52px] touch-manipulation w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="tabular-nums">
                      {c.callPrefix} {d.name} · {d.display}
                    </span>
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.destEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.destTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.destLead}</p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.destinations.map((d, i) => (
              <Reveal key={`${d.from}-${d.to}`} delay={i * 0.04}>
                <Link
                  to="/destinations/$slug"
                  params={{ slug: DESTINATIONS[i]?.slug ?? DESTINATIONS[0].slug }}
                  className={`group flex items-center gap-3 px-4 py-4 ${CARD}`}
                >
                  <img
                    src={d.img}
                    alt={`${d.from} → ${d.to}`}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-card-foreground">{d.from}</span>
                    <span className="block truncate text-sm font-semibold text-card-foreground">{d.to}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      {d.meta}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary opacity-0 transition group-hover:opacity-100" />
                </Link>
              </Reveal>
            ))}
          </div>

          <Link
            to="/destinations"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary underline"
          >
            {lang === "en" ? "See all destinations" : "Voir toutes les destinations"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* BEST-SELLERS */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.bestEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.bestTitle}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {c.best.map((b, i) => (
              <Reveal key={b.n} delay={i * 0.06}>
                <article className={`group relative h-full overflow-hidden ${CARD}`}>
                  <img
                    src={b.img}
                    alt={b.t}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="p-6 pt-8">
                    <span className="absolute right-4 top-[10.5rem] font-display text-5xl font-semibold text-primary/15">
                      {b.n}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-card-foreground">{b.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
                    <Link
                      to="/reserver"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      {c.ctaBook} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.whyEyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.whyTitle}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.why.map((w, i) => (
              <Reveal key={w.t} delay={i * 0.06}>
                <div className={`group h-full overflow-hidden ${CARD}`}>
                  {"photo" in w && w.photo ? (
                    <img
                      src={w.photo}
                      alt={w.t}
                      loading="lazy"
                      width={1600}
                      height={900}
                      className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">{w.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.howEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.howTitle}
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.how.map((h, i) => (
              <Reveal as="li" key={h.s} delay={i * 0.08}>
                <div className={`group h-full overflow-hidden bg-background ${CARD}`}>
                  <img
                    src={h.img}
                    alt={h.t}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-36 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
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
        </div>
      </section>

      {/* ESPACE CLIENT */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid items-center gap-8 rounded-3xl border border-primary/30 bg-card p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.clientEyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl text-balance">
                  {c.clientTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.clientText}</p>
              </div>
              <Link
                to="/client/login"
                className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-primary px-6 py-3.5 text-sm font-semibold text-primary transition duration-300 hover:scale-[1.03] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                {c.clientCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AVIS & RÉASSURANCE */}
      <ClientTrust />

      {/* AVIS */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.reviewEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.reviewTitle}
            </h2>
            <p className="mt-3 text-center text-sm text-muted-foreground">{c.reviewText}</p>
            <div className="mt-8 rounded-2xl border border-border bg-background p-6">
              <ReviewForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* BLOG */}
      <section className="border-t border-border py-20">
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
                    src={e.photos[0]}
                    alt={`${e.name} — ${e.city}`}
                    loading="lazy"
                    className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{e.city}</p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-card-foreground">{e.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {lang === "en" ? e.en.teaser : e.fr.teaser}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.ctaTitle}
            </h2>
            <p className="mt-3 text-muted-foreground">{c.ctaText}</p>
            <Link
              to="/reserver"
              className="mt-8 inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              {c.ctaBook} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
