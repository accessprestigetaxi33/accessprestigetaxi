import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ogImageUrl, ogPageUrl } from "@/lib/og";
import { SocialMetaSync } from "@/components/SocialMetaSync";
import ogHomeFr from "@/assets/apt-og-home-fr.jpg.asset.json";
import ogHomeEn from "@/assets/apt-og-home-en.jpg.asset.json";
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
  Bell,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { NotificationOptInStep } from "@/components/NotificationOptInStep";
import { ReviewForm } from "@/components/ReviewForm";
import { ClientTrust } from "@/components/ClientTrust";
import { FaqSeo } from "@/components/FaqSeo";
import { Reveal, Counter } from "@/components/motion-ui";
import { GUIDE_HIGHLIGHTS } from "@/data/guide-highlights";
import { DESTINATIONS } from "@/data/destinations";
import heroCars from "@/assets/apt-hero-fr.webp.asset.json";
import heroCarsEn from "@/assets/apt-hero-en.webp.asset.json";
import photoInterior from "@/assets/apt-interior.jpg.asset.json";
import photoDriver from "@/assets/apt-driver.jpg.asset.json";
import photoBmwReal from "@/assets/apt-bmw-real.webp.asset.json";
import photoAudiReal from "@/assets/apt-audi-real.webp.asset.json";
import photoVanReal from "@/assets/apt-van-real.webp.asset.json";

import photoMedical from "@/assets/apt-medical.webp";
import photoAirport from "@/assets/apt-airport.webp";
import photoBusiness from "@/assets/apt-business.webp";
import photoPrice from "@/assets/apt-price.webp";
import photoLaRochelle from "@/assets/apt-larochelle.webp";
import photoIleDeRe from "@/assets/apt-ile-de-re.webp";
import photoRoyan from "@/assets/apt-royan.webp";
import photoGare from "@/assets/apt-gare.webp";
import photoStepVoice from "@/assets/apt-step-voice.webp";
import photoStepConfirm from "@/assets/apt-step-confirm.webp";
import photoStepTrack from "@/assets/apt-step-track.webp";

const BLOG_PICKS = GUIDE_HIGHLIGHTS;

const SLOGAN_FR = "L'excellence à chaque trajet";
const SLOGAN_EN = "Excellence on every journey";

// Domaine canonique du site — sert à générer les URLs absolues pour
// og:url / og:image / twitter:image, obligatoires selon la spec Open Graph.
const SITE_URL = "https://accessprestigetaxi.fr";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const CARD =
  "rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--gold)_55%,transparent)]";

// Diaporama hero façon pub, en attendant une vraie vidéo : zoom/pan lent (Ken Burns)
// en fondu enchaîné entre plusieurs photos existantes. Ajoute/retire des entrées
// ici pour changer les visuels utilisés.
const heroSlides = (lang: "fr" | "en") => {
  const en = lang === "en";
  return [
    {
      id: "brand",
      src: en ? heroCarsEn.url : heroCars.url,
      alt: en
        ? "Access Prestige Taxi — BMW iX1 electric and Mercedes V-Class van, excellence on every journey, Charente-Maritime"
        : "Access Prestige Taxi — BMW iX1 électrique et van Mercedes V-Class, l'excellence à chaque trajet, Charente-Maritime",
      label: en ? "Our fleet" : "Notre flotte",
      title: en ? "Excellence on every journey" : "L'excellence à chaque trajet",
      desc: en
        ? "Two drivers, three premium vehicles across Charente-Maritime."
        : "Deux chauffeurs, trois véhicules haut de gamme en Charente-Maritime.",
      specs: en ? ["2 drivers", "", "Charente-Maritime"] : ["2 chauffeurs", "", "Charente-Maritime"],
      // Bannière de marque complète : logo, slogan et services doivent rester lisibles.
      contain: true,
      pan: { x: 0, y: 0 },
    },
    {
      id: "bmw",
      src: photoBmwReal.url,
      alt: en
        ? "BMW iX1 100% electric taxi driven by Patricia, Access Prestige Taxi in Charente-Maritime"
        : "Taxi BMW iX1 100 % électrique conduit par Patricia, Access Prestige Taxi en Charente-Maritime",
      label: "BMW iX1 · Patricia",
      title: en ? "BMW iX1 — 100% electric" : "BMW iX1 — 100 % électrique",
      desc: en
        ? "Silent, zero-emission rides for airport transfers, medical trips and daily journeys, up to 4 passengers."
        : "Trajets silencieux et zéro émission pour transferts aéroport, courses médicales et déplacements du quotidien, jusqu'à 4 passagers.",
      specs: en ? ["4 passengers", "Zero emission", "Child seats"] : ["4 passagers", "Zéro émission", "Sièges enfants"],
      pan: { x: 18, y: 6 },
    },
    {
      id: "audi",
      src: photoAudiReal.url,
      alt: en
        ? "Audi Q6 e-tron, 100% electric premium SUV for business transfers, Access Prestige Taxi"
        : "Audi Q6 e-tron, SUV premium 100 % électrique pour transferts affaires, Access Prestige Taxi",
      label: "Audi Q6 e-tron",
      title: en ? "Audi Q6 e-tron — premium SUV" : "Audi Q6 e-tron — SUV premium",
      desc: en
        ? "Our electric flagship for business travel and long-distance transfers: generous space, deep comfort, total discretion."
        : "Notre vaisseau amiral électrique pour les déplacements professionnels et les longues distances : espace généreux, confort profond, discrétion totale.",
      specs: en ? ["Business", "Long distance", "100% electric"] : ["Affaires", "Longue distance", "100 % électrique"],
      pan: { x: -16, y: -8 },
    },
    {
      id: "van",
      src: photoVanReal.url,
      alt: en
        ? "Mercedes V-Class 7-seat van driven by Alain for group transport, Access Prestige Taxi"
        : "Van Mercedes V-Class 7 places conduit par Alain pour le transport de groupe, Access Prestige Taxi",
      label: "Mercedes Van · Alain",
      title: en ? "Mercedes van — up to 7 seats" : "Van Mercedes — jusqu'à 7 places",
      desc: en
        ? "Family, team or wedding: seven passengers plus luggage in one trip, at one single fare."
        : "Famille, équipe ou mariage : sept passagers et leurs bagages en un seul trajet, à un seul tarif.",
      specs: en ? ["7 passengers", "Luggage", "Single fare"] : ["7 passagers", "Bagages", "Tarif unique"],
      pan: { x: 16, y: -10 },
    },
    {
      id: "driver",
      src: photoDriver.url,
      alt: en
        ? "Access Prestige Taxi licensed driver at the wheel in Charente-Maritime"
        : "Chauffeur de taxi agréé Access Prestige Taxi au volant en Charente-Maritime",
      label: en ? "Our drivers" : "Nos chauffeurs",
      title: en ? "Patricia & Alain at your service" : "Patricia & Alain à votre service",
      desc: en
        ? "Licensed taxi drivers, punctual and discreet, with real-time tracking on every booking."
        : "Chauffeurs de taxi agréés, ponctuels et discrets, avec suivi en temps réel sur chaque réservation.",
      specs: en ? ["Licensed", "Real-time tracking", "Discretion"] : ["Agréés", "Suivi temps réel", "Discrétion"],
      pan: { x: -14, y: 10 },
    },
  ];
};

const HERO_SLIDE_DURATION_MS = 6000;

/** Fait défiler les slides, sauf si l'utilisateur préfère un mouvement réduit ou a choisi un véhicule. */
function useHeroSlideshow(count: number, durationMs: number) {
  const [index, setIndex] = useState(0);
  const [canAnimate, setCanAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setCanAnimate(!prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!canAnimate || paused || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), durationMs);
    return () => clearInterval(id);
  }, [canAnimate, paused, count, durationMs]);

  const select = (i: number) => {
    setIndex(i);
    setPaused(true);
  };


  return { index, canAnimate, select, paused };
}


const COPY = {
  fr: {
    kicker: "10 ans d'expérience · Transport sanitaire conventionné · Charente-Maritime",
    h1: "Taxi 100 % électrique en Charente-Maritime",
    tagline: SLOGAN_FR,
    lead: "Deux chauffeurs, une BMW iX1 100 % électrique et un van Mercedes 7 places. Transport sanitaire conventionné et courses sans limite de distance, pour tous types de prestations.",
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
      { n: 1, suffix: "", l: "SUV Audi Q6 e-tron électrique" },
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
        photo: photoBmwReal.url,
        t: "Disponible sur réservation",
        d: "Réservation immédiate ou planifiée.",
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
        photo: photoBmwReal.url,
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
      "La Rochelle, Rochefort, Royan, Saintes, Île de Ré et Oléron — nous vous y conduisons.",
    destEyebrow: "Destinations",
    destTitle: "Là où l'on vous emmène",
    destLead: "Quelques itinéraires que nos clients réservent au quotidien : l'arrivée en douceur, c'est notre métier.",
    destinations: [
      { img: photoAirport, from: "La Rochelle", to: "Aéroport de La Rochelle", meta: "≈ 15 min · vol suivi" },
      { img: photoGare, from: "Rochefort", to: "Gare TGV", meta: "≈ 20 min · accueil quai" },
      { img: photoIleDeRe, from: "La Rochelle", to: "Île de Ré", meta: "≈ 35 min · pont inclus" },
      { img: photoRoyan, from: "Saintes", to: "Royan", meta: "≈ 45 min · côte de Beauté" },
      { img: photoVanReal.url, from: "Groupe", to: "Van 7 places", meta: "Transferts à plusieurs" },
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
        img: photoVanReal.url,
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
    kicker: "10 years of experience · Approved medical transport · Charente-Maritime",
    h1: "100% electric taxi in Charente-Maritime",
    tagline: SLOGAN_EN,
    lead: "Two drivers, one fully electric BMW iX1 and one 7-seat Mercedes van. Approved medical transport and rides with no distance limit, for every type of service.",
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
      { n: 1, suffix: "", l: "Audi Q6 e-tron electric SUV" },
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
        photo: photoBmwReal.url,
        t: "Available on booking",
        d: "Instant or scheduled booking.",
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
        photo: photoBmwReal.url,
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
      "La Rochelle, Rochefort, Royan, Saintes, Île de Ré and Oléron — we drive you there.",
    destEyebrow: "Destinations",
    destTitle: "Where we take you",
    destLead: "A few routes our clients book every day — arriving smoothly is our job.",
    destinations: [
      { img: photoAirport, from: "La Rochelle", to: "La Rochelle airport", meta: "≈ 15 min · flight tracked" },
      { img: photoGare, from: "Rochefort", to: "TGV station", meta: "≈ 20 min · platform meet" },
      { img: photoIleDeRe, from: "La Rochelle", to: "Île de Ré", meta: "≈ 35 min · bridge included" },
      { img: photoRoyan, from: "Saintes", to: "Royan", meta: "≈ 45 min · Atlantic coast" },
      { img: photoVanReal.url, from: "Group", to: "7-seat van", meta: "Group transfers" },
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
        img: photoVanReal.url,
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

// Métadonnées sociales localisées : visuel, titre et description dédiés
// FR / EN, avec cache-busting sur l'image (voir src/lib/og.ts).
const HOME_SOCIAL_FR = {
  title: "Access Prestige Taxi — L'excellence à chaque trajet",
  description:
    "L'excellence à chaque trajet : réservation vocale ou écrite en moins d'une minute, BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes 7 places en Charente-Maritime.",
  image: ogImageUrl(ogHomeFr.url),
  alt: "Access Prestige Taxi — taxi 100 % électrique en Charente-Maritime, BMW iX1 et van Mercedes V-Class",
  url: ogPageUrl("/", "fr"),
};
const HOME_SOCIAL_EN = {
  title: "Access Prestige Taxi — Excellence on every journey",
  description:
    "Book by voice or text in under a minute: 100% electric BMW iX1 and Audi Q6 e-tron, plus a 7-seat Mercedes van across Charente-Maritime.",
  image: ogImageUrl(ogHomeEn.url),
  alt: "Access Prestige Taxi — 100% electric taxi in Charente-Maritime, BMW iX1 and Mercedes V-Class van",
  url: ogPageUrl("/", "en"),
};

export const Route = createFileRoute("/")({
  component: Index,
  // ?lang=en / ?lang=fr : force la langue du visuel et des textes sociaux
  // pour les partages (la page reste servie sur la même URL).
  validateSearch: (search: Record<string, unknown>) => ({
    lang:
      search['lang'] === "en"
        ? ("en" as const)
        : search['lang'] === "fr"
          ? ("fr" as const)
          : undefined,
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
          ? "100% electric taxi in Charente-Maritime: BMW iX1, Audi Q6 e-tron, 7-seat van, medical transport, stations and airports."
          : "Taxi 100 % électrique en Charente-Maritime : BMW iX1, Audi Q6 e-tron, van 7 places, transport conventionné, gares et aéroports.",
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

    links: seoLinks("/", match.search),
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
          logo: absoluteUrl("/favicon.png"),
          address: {
            "@type": "PostalAddress",
            addressRegion: "Charente-Maritime",
            addressCountry: "FR",
          },
          areaServed: [{ "@type": "AdministrativeArea", name: "Charente-Maritime" }],
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "L'excellence à chaque trajet — flotte Access Prestige Taxi",
          alternateName: "Excellence on every journey — Access Prestige Taxi fleet",
          itemListElement: [
            {
              "@type": "Car",
              position: 1,
              name: "BMW iX1 100 % électrique",
              alternateName: "BMW iX1 100% electric",
              image: absoluteUrl(photoBmwReal.url),
              vehicleSeatingCapacity: 4,
              fuelType: "Electric",
              description:
                "Taxi BMW iX1 100 % électrique conduit par Patricia : transferts aéroport, courses médicales et déplacements du quotidien en Charente-Maritime.",
            },
            {
              "@type": "Car",
              position: 2,
              name: "Audi Q6 e-tron",
              image: absoluteUrl(photoAudiReal.url),
              vehicleSeatingCapacity: 4,
              fuelType: "Electric",
              description:
                "SUV premium 100 % électrique pour déplacements professionnels et longues distances en Charente-Maritime.",
            },
            {
              "@type": "Car",
              position: 3,
              name: "Van Mercedes V-Class 7 places",
              alternateName: "Mercedes V-Class 7-seat van",
              image: absoluteUrl(photoVanReal.url),
              vehicleSeatingCapacity: 7,
              description:
                "Van Mercedes conduit par Alain : transport de groupe jusqu'à 7 passagers avec bagages, tarif unique.",
            },
          ],
        }),
      },
    ],
    };
  },
});


function Index() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const alain = DRIVERS.find((d) => d.name === "Alain");

  const slides = useMemo(() => heroSlides(lang === "en" ? "en" : "fr"), [lang]);
  const { index: slideIndex, canAnimate, select } = useHeroSlideshow(slides.length, HERO_SLIDE_DURATION_MS);

  return (
    <main>
      <SocialMetaSync
        lang={lang === "en" ? "en" : "fr"}
        fr={HOME_SOCIAL_FR}
        en={HOME_SOCIAL_EN}
      />

      {/* HERO — diaporama photo avec effet Ken Burns (zoom/pan lent), sans texte en surimpression */}
      <section className="relative isolate min-h-[55svh] overflow-hidden sm:min-h-[60vh] lg:min-h-[70vh]">
        {(() => {
          const slide = slides[slideIndex];
          const isBanner = Boolean(slide.contain);
          return (
            <>
              <AnimatePresence mode="sync">
                <motion.div
                  key={slideIndex}
                  className="absolute inset-0 -z-20 overflow-hidden bg-background"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                  <motion.img
                    src={slide.src}
                    alt={slide.alt}
                    fetchPriority={slideIndex === 0 ? "high" : undefined}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                    width={1376}
                    height={768}
                    className={
                      isBanner
                        ? "h-full w-full object-contain object-center"
                        : "h-full w-full object-cover object-center"
                    }
                    initial={isBanner ? { opacity: 1, scale: 1 } : { scale: 1.06, x: 0, y: 0 }}
                    animate={
                      isBanner
                        ? { scale: 1, x: 0, y: 0 }
                        : canAnimate
                          ? { scale: 1.16, x: slide.pan.x, y: slide.pan.y }
                          : { scale: 1.06, x: 0, y: 0 }
                    }
                    transition={{ duration: (HERO_SLIDE_DURATION_MS / 1000) * 1.5, ease: "linear" }}
                  />
                </motion.div>
              </AnimatePresence>
              {/* Voile sombre : quasi nul sur la bannière pour garder les écritures lisibles */}
              <div
                className={
                  isBanner
                    ? "absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_0%,transparent_80%,var(--background)_100%)]"
                    : "absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,8,10,0.15)_0%,rgba(8,8,10,0.35)_60%,var(--background)_100%)]"
                }
              />
            </>
          );
        })()}
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
            {c.h1}
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

          {/* Sélecteur de véhicule : clic = slide affichée + récapitulatif animé */}
          <div className="mt-12 w-full">
            <h2 id="fleet-heading" className="sr-only">
              {lang === "en"
                ? "Excellence on every journey — our electric taxi fleet in Charente-Maritime"
                : "L'excellence à chaque trajet — notre flotte de taxis électriques en Charente-Maritime"}
            </h2>
            <div className="flex justify-start gap-2 overflow-x-auto pb-2 sm:justify-center sm:gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={i === slideIndex}
                  aria-label={s.title}
                  className={`group relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition duration-300 sm:h-20 sm:w-32 ${
                    i === slideIndex
                      ? "border-primary shadow-[var(--shadow-gold)]"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    width={320}
                    height={180}
                    className={s.contain ? "h-full w-full object-contain" : "h-full w-full object-cover"}
                  />
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {slides[slideIndex].id !== "brand" && (
                <motion.div
                  key={slides[slideIndex].id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mt-5 rounded-2xl border border-border bg-card p-5 text-left sm:p-6"
                >
                  <p className="text-[11px] uppercase tracking-[0.25em] text-primary">{slides[slideIndex].label}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-foreground sm:text-2xl">
                    {slides[slideIndex].title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {slides[slideIndex].desc}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {slides[slideIndex].specs.map((spec) => (
                      <li
                        key={spec}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                      >
                        {spec}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              src={photoVanReal.url}
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
      <section className="dark relative isolate overflow-hidden border-y border-border">
        <img
          src={photoBmwReal.url}
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
                <article className={`h-full overflow-hidden ${CARD}`}>
                  <img
                    src={d.electric ? photoBmwReal.url : photoVanReal.url}
                    alt={lang === "en" ? `${d.name} — ${d.vehicle.en}` : `${d.name} — ${d.vehicle.fr}`}
                    loading="lazy"
                    width={1600}
                    height={900}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="p-6 sm:p-7">
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
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Véhicule complémentaire 100 % électrique */}
          <Reveal delay={0.16}>
            <article className={`mt-5 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:p-7 ${CARD}`}>
              <img
                src={photoAudiReal.url}
                alt="Audi Q6 e-tron — Access Prestige Taxi"
                loading="lazy"
                width={1600}
                height={900}
                className="aspect-[16/10] w-full shrink-0 rounded-2xl border border-border object-cover sm:w-64"
              />
              <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold text-card-foreground">
                  Audi Q6 e-tron
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {lang === "en" ? "Fully electric · up to 4 seats" : "100 % électrique · jusqu'à 4 places"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {lang === "en"
                    ? "Our premium fully electric SUV, available on request for business transfers, airport runs and long distances: silent cabin, generous luggage space and extended range across Charente-Maritime."
                    : "Notre SUV haut de gamme 100 % électrique, disponible sur demande pour les transferts affaires, les aéroports et les longues distances : habitacle silencieux, coffre généreux et grande autonomie en Charente-Maritime."}
                </p>
                {alain ? (
                  <a
                    href={`tel:${alain.tel}`}
                    aria-label={`${c.callPrefix} ${alain.name} — ${alain.display}`}
                    className="mt-5 inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="tabular-nums">
                      {c.callPrefix} {alain.name} · {alain.display}
                    </span>
                  </a>
                ) : null}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* INSTALLER L'APPLI */}
      <section id="application" className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-center text-center">
              <img
                src={lang === "en" ? heroCarsEn.url : heroCars.url}
                alt={
                  lang === "en"
                    ? "Access Prestige Taxi app icon"
                    : "Icône de l'application Access Prestige Taxi"
                }
                loading="lazy"
                width={512}
                height={512}
                className="h-24 w-24 rounded-3xl border border-primary/30 object-cover shadow-[var(--shadow-gold)]"
              />
              <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-primary">
                {lang === "en" ? "Web app" : "Application"}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
                {lang === "en"
                  ? "Install Access Prestige Taxi on your phone"
                  : "Installez Access Prestige Taxi sur votre téléphone"}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {lang === "en"
                  ? "Add the site to your home screen and get a real app icon: book in one tap, follow your driver live, find your rides, receipts and invoices, and chat directly with Alain or Patricia."
                  : "Ajoutez le site à votre écran d'accueil pour obtenir une vraie icône d'application : réservez en un geste, suivez votre chauffeur en direct, retrouvez vos courses, reçus et factures, et discutez directement avec Alain ou Patricia."}
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Reveal>
              <article className={`h-full p-6 ${CARD}`}>
                <h3 className="font-display text-lg font-semibold text-card-foreground">
                  {lang === "en" ? "iPhone & iPad (Safari)" : "iPhone et iPad (Safari)"}
                </h3>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    1.{" "}
                    {lang === "en"
                      ? "Open accessprestigetaxi.fr in Safari."
                      : "Ouvrez accessprestigetaxi.fr dans Safari."}
                  </li>
                  <li>
                    2.{" "}
                    {lang === "en"
                      ? "Tap the Share button at the bottom of the screen."
                      : "Touchez le bouton Partager en bas de l'écran."}
                  </li>
                  <li>
                    3.{" "}
                    {lang === "en"
                      ? "Choose “Add to Home Screen”, then Add."
                      : "Choisissez « Sur l'écran d'accueil », puis Ajouter."}
                  </li>
                </ol>
              </article>
            </Reveal>
            <Reveal delay={0.08}>
              <article className={`h-full p-6 ${CARD}`}>
                <h3 className="font-display text-lg font-semibold text-card-foreground">
                  {lang === "en" ? "Android (Chrome)" : "Android (Chrome)"}
                </h3>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    1.{" "}
                    {lang === "en"
                      ? "Open accessprestigetaxi.fr in Chrome."
                      : "Ouvrez accessprestigetaxi.fr dans Chrome."}
                  </li>
                  <li>
                    2.{" "}
                    {lang === "en"
                      ? "Open the ⋮ menu at the top right."
                      : "Ouvrez le menu ⋮ en haut à droite."}
                  </li>
                  <li>
                    3.{" "}
                    {lang === "en"
                      ? "Choose “Install app” / “Add to Home screen”."
                      : "Choisissez « Installer l'application » / « Ajouter à l'écran d'accueil »."}
                  </li>
                </ol>
              </article>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <article className="mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-destructive">
                <Bell className="h-5 w-5 shrink-0" />
                {lang === "en"
                  ? "Turn on notifications — and what they are for"
                  : "Comment activer les notifications et à quoi servent-elles"}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {lang === "en"
                  ? "Notifications tell you the moment your ride is confirmed, when Alain or Patricia is on the way, when the driver has arrived, and when a new message or your receipt is available."
                  : "Les notifications vous préviennent dès que votre course est confirmée, quand Alain ou Patricia est en route, à l'arrivée du chauffeur, et lorsqu'un nouveau message ou votre reçu est disponible."}
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90">
                <li>
                  1.{" "}
                  {lang === "en"
                    ? "Install the app on your home screen (steps above) — required on iPhone and iPad."
                    : "Installez l'application sur votre écran d'accueil (étapes ci-dessus) — obligatoire sur iPhone et iPad."}
                </li>
                <li>
                  2.{" "}
                  {lang === "en"
                    ? "Open the app from its icon, then sign in to your client area."
                    : "Ouvrez l'application depuis son icône, puis connectez-vous à votre espace client."}
                </li>
                <li>
                  3.{" "}
                  {lang === "en"
                    ? "Tap “Allow” when your phone asks for notification permission."
                    : "Touchez « Autoriser » quand votre téléphone demande l'autorisation de notification."}
                </li>
                <li>
                  4.{" "}
                  {lang === "en"
                    ? "If you declined: Settings › Notifications › Access Prestige Taxi › Allow notifications."
                    : "Si vous avez refusé : Réglages › Notifications › Access Prestige Taxi › Autoriser les notifications."}
                </li>
              </ol>
            </article>
          </Reveal>

          <Reveal delay={0.12}>
            <NotificationOptInStep />
          </Reveal>


          <Reveal delay={0.14}>
            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              {lang === "en"
                ? "Alain and Patricia use a separate private app for drivers."
                : "Alain et Patricia disposent d'une application chauffeur privée séparée."}
            </p>
          </Reveal>
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

      {/* FAQ SEO */}
      <FaqSeo />

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
                    src={e.photo}
                    alt={`${e.name} — ${e.city}`}
                    loading="lazy"
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
