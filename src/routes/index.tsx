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
  BriefcaseBusiness,
  Phone,
  PlaneTakeoff,
  Stethoscope,
  Bell,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileText,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { SERVICE_CARDS_FR, SERVICE_CARDS_EN } from "@/data/services-cards";
import { DRIVERS } from "@/data/drivers";
import { ReviewForm } from "@/components/ReviewForm";
import { ClientTrust } from "@/components/ClientTrust";
import { FaqSeo } from "@/components/FaqSeo";
import { Reveal, Counter } from "@/components/motion-ui";
import { imgAt, imgSrcSet } from "@/lib/img";
import { GUIDE_HIGHLIGHTS } from "@/data/guide-highlights";
import { DESTINATIONS } from "@/data/destinations";
import heroCars from "@/assets/apt-hero-clean-fr.webp";
import heroCarsEn from "@/assets/apt-hero-clean-en.webp";
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
const SITE_URL = "https://www.accessprestigetaxi.fr";

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
      // NB: heroCars/heroCarsEn sont importés directement en .webp (pas de
      // fichier .asset.json associé), donc aucune variante redimensionnée
      // n'existe pour cette bannière — contrairement aux autres slides ci-
      // dessous. Pour un vrai fix responsive sur cette image (probable LCP
      // mobile), il faut la faire passer par le même pipeline d'assets que
      // apt-bmw-real.webp / apt-audi-real.webp / apt-van-real.webp.
      src: en ? heroCarsEn : heroCars,
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
      src: imgAt(photoBmwReal.url, 1376),
      srcSet: imgSrcSet(photoBmwReal.url, [640, 960, 1376, 1920]),
      alt: en
        ? "BMW iX1 100% electric taxi driven by Patricia, Access Prestige Taxi in Charente-Maritime"
        : "Taxi BMW iX1 100 % électrique conduit par Patricia, Access Prestige Taxi en Charente-Maritime",
      label: "BMW iX1 · Patricia",
      title: en ? "BMW iX1 — 100% electric" : "BMW iX1 — 100 % électrique",
      desc: en
        ? "Silent, zero-emission rides for station, airport and medical trips in a 5-seat vehicle."
        : "Trajets silencieux et zéro émission vers toutes les gares, tous les aéroports et pour le transport sanitaire, en véhicule 5 places.",
      specs: en ? ["5 seats", "Zero emission", "Child seats"] : ["5 places", "Zéro émission", "Sièges enfants"],
      pan: { x: 18, y: 6 },
    },
    {
      id: "audi",
      src: imgAt(photoAudiReal.url, 1376),
      srcSet: imgSrcSet(photoAudiReal.url, [640, 960, 1376, 1920]),
      alt: en
        ? "Audi Q6 e-tron, 100% electric premium SUV for business transfers, Access Prestige Taxi"
        : "Audi Q6 e-tron, SUV premium 100 % électrique pour transferts affaires, Access Prestige Taxi",
      label: "Audi Q6 e-tron",
      title: en ? "Audi Q6 e-tron — premium SUV" : "Audi Q6 e-tron — SUV premium",
      desc: en
        ? "Our electric flagship for business travel and long-distance transfers: generous space, deep comfort, total discretion."
        : "Notre vaisseau amiral électrique pour les déplacements professionnels et les longues distances : espace généreux, confort profond, discrétion totale.",
      specs: en ? ["5 seats", "All distances", "100% electric"] : ["5 places", "Toutes distances", "100 % électrique"],
      pan: { x: -16, y: -8 },
    },
    {
      id: "van",
      src: imgAt(photoVanReal.url, 1376),
      srcSet: imgSrcSet(photoVanReal.url, [640, 960, 1376, 1920]),
      alt: en
        ? "Mercedes V-Class 8-seat van driven by Alain for group transport, Access Prestige Taxi"
        : "Van Mercedes V-Class 8 places conduit par Alain pour le transport de groupe, Access Prestige Taxi",
      label: "Mercedes Van · Alain",
      title: en ? "Mercedes van — 8 seats" : "Van Mercedes — 8 places",
      desc: en
        ? "Family, team or wedding: an 8-seat vehicle for groups and luggage."
        : "Famille, équipe ou mariage : un véhicule 8 places pour les groupes et leurs bagages.",
      specs: en ? ["8 seats", "Luggage", "Single fare"] : ["8 places", "Bagages", "Tarif unique"],
      pan: { x: 16, y: -10 },
    },
    {
      id: "driver",
      src: imgAt(photoDriver.url, 1376),
      srcSet: imgSrcSet(photoDriver.url, [640, 960, 1376, 1920]),
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
    setIndex(((i % count) + count) % count);
    setPaused(true);
  };

  const next = () => select(index + 1);
  const prev = () => select(index - 1);
  const togglePause = () => setPaused((p) => !p);

  return { index, canAnimate, select, next, prev, paused, togglePause };
}

// Cases du hero : reprennent les pictogrammes et mentions de la bannière photo.
const HERO_PILLARS_FR = [
  { icon: Stethoscope, label: "Transport conventionné" },
  { icon: PlaneTakeoff, label: "Transferts gares & aéroports" },
  { icon: BriefcaseBusiness, label: "Déplacements professionnels" },
  { icon: Leaf, label: "100 % électrique" },
] as const;

const HERO_PILLARS_EN = [
  { icon: Stethoscope, label: "Covered medical transport" },
  { icon: PlaneTakeoff, label: "Station & airport transfers" },
  { icon: BriefcaseBusiness, label: "Business travel" },
  { icon: Leaf, label: "100% electric" },
] as const;

const COPY = {
  fr: {
    h1: "L'excellence, sans compromis",
    tagline: SLOGAN_FR,
    lead: "Deux chauffeurs, un seul niveau d'exigence : silence électrique de la BMW iX1 et de l'Audi Q6 e-tron, espace du van Mercedes classe V 8 places, transport sanitaire conventionné avec fauteuil roulant — toutes distances, en Charente-Maritime.",
    ctaBook: "Réserver ma course",
    ctaCall: "Appeler",
    callPrefix: "Appeler",
    driversEyebrow: "Nos deux chauffeurs",
    driversTitle: "Patricia & Alain, à votre service",
    driversLead:
      "Deux chauffeurs indépendants, choisis pour leur sérieux : ponctualité, discrétion et un accueil qui fait la différence.",
    stats: [
      { n: 2, suffix: "", l: "chauffeurs dédiés — Alain & Patricia", img: photoDriver.url },
      { n: 100, suffix: " %", l: "électrique (BMW iX1)", img: photoBmwReal.url },
      { n: 5, suffix: " places", l: "Audi Q6 e-tron électrique", img: photoAudiReal.url },
      { n: 8, suffix: " places", l: "van Mercedes classe V", img: photoVanReal.url },
    ],
    groupEyebrow: "Transport de groupe",
    groupTitle: "Le van Mercedes 8 places, taillé pour vos groupes",
    groupBullets: ["8 places", "Grand volume de bagages", "Un seul tarif, un seul véhicule", "Toutes distances"],
    groupCta: "Réserver le van 8 places",
    whyEyebrow: "Pourquoi nous choisir",
    whyTitle: "Chaque trajet mérite le même soin",
    why: [
      {
        photo: photoInterior.url,
        t: "Confort intérieur",
        d: "Habitacle soigné, silence électrique, eau et chargeurs à bord : le bien-être pensé jusque dans le détail.",
      },
      {
        photo: photoDriver.url,
        t: "Fiabilité",
        d: "Ponctualité, discrétion, disponibilité : notre parole donnée à chaque course.",
      },
      {
        photo: photoBmwReal.url,
        t: "Sur mesure, quel que soit le besoin",
        d: "Sièges bébé et rehausseurs enfants sur demande, fauteuil roulant, groupes et longues distances.",
      },
    ],

    bannerTitle: "La Charente-Maritime, d'un point à l'autre",
    bannerText:
      "De La Rochelle à Oléron, de Rochefort à l'Île de Ré : nous couvrons toute la Charente-Maritime, seul ou à plusieurs, avec le van Mercedes 8 places d'Alain pour vos groupes.",
    destEyebrow: "Destinations",
    destTitle: "Là où l'on vous emmène",
    destinations: [
      { img: photoAirport, from: "La Rochelle", to: "Aéroport de La Rochelle", meta: "≈ 15 min · vol suivi" },
      { img: photoGare, from: "Rochefort", to: "Gare TGV", meta: "≈ 20 min · accueil quai" },
      { img: photoIleDeRe, from: "La Rochelle", to: "Île de Ré", meta: "≈ 35 min · pont inclus" },
      { img: photoRoyan, from: "Saintes", to: "Royan", meta: "≈ 45 min · côte de Beauté" },
      { img: photoVanReal.url, from: "Groupe", to: "Van 8 places", meta: "Transferts à plusieurs" },
      { img: photoMedical, from: "Domicile", to: "Hôpital / clinique", meta: "Conventionné CPAM" },
    ],
    bestEyebrow: "Les incontournables",
    bestTitle: "Ce que nos clients réservent le plus",
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
        d: "Dialyse, chimiothérapie, consultations : une prise en charge simple et sereine.",
      },
      {
        n: "03",
        img: photoVanReal.url,
        t: "Groupes en van 8 places",
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
    ctaTitle: "Votre chauffeur vous attend",
    ctaText: "Réservez en moins d'une minute, à la voix ou à l'écrit.",
  },
  en: {
    h1: "Excellence, without compromise",
    tagline: SLOGAN_EN,
    lead: "Two drivers, one shared standard: electric silence in the BMW iX1 and Audi Q6 e-tron, space in the 8-seat Mercedes V-Class van, covered medical transport with wheelchair access — all distances, across Charente-Maritime.",
    ctaBook: "Book a ride",
    ctaCall: "Call",
    callPrefix: "Call",
    driversEyebrow: "Our two drivers",
    driversTitle: "Patricia & Alain, at your service",
    driversLead:
      "Two independent drivers, chosen for their care: punctuality, discretion and a welcome that makes the difference.",
    stats: [
      { n: 2, suffix: "", l: "dedicated drivers — Alain & Patricia", img: photoDriver.url },
      { n: 100, suffix: "%", l: "electric (BMW iX1)", img: photoBmwReal.url },
      { n: 5, suffix: " seats", l: "Audi Q6 e-tron electric SUV", img: photoAudiReal.url },
      { n: 8, suffix: " seats", l: "Mercedes V-Class van", img: photoVanReal.url },
    ],
    groupEyebrow: "Group transport",
    groupTitle: "The 8-seat Mercedes van, built for your groups",
    groupBullets: ["8 seats", "Generous luggage space", "One fare, one vehicle", "All distances"],
    groupCta: "Book the 8-seat van",
    whyEyebrow: "Why choose us",
    whyTitle: "Every journey deserves the same care",
    why: [
      {
        photo: photoInterior.url,
        t: "Interior comfort",
        d: "Immaculate cabin, electric silence, water and chargers on board: wellbeing considered down to the detail.",
      },
      {
        photo: photoDriver.url,
        t: "Reliability",
        d: "Punctuality, discretion, availability: our word, kept on every ride.",
      },
      {
        photo: photoBmwReal.url,
        t: "Tailored to every need",
        d: "Baby and booster seats on request, wheelchair access, groups and long distances.",
      },
    ],
    bannerTitle: "Charente-Maritime, door to door",
    bannerText:
      "From La Rochelle to Oléron, from Rochefort to Île de Ré: we cover all of Charente-Maritime, solo or in a group, with Alain's 8-seat Mercedes van.",
    destEyebrow: "Destinations",
    destTitle: "Where we take you",
    destinations: [
      { img: photoAirport, from: "La Rochelle", to: "La Rochelle airport", meta: "≈ 15 min · flight tracked" },
      { img: photoGare, from: "Rochefort", to: "TGV station", meta: "≈ 20 min · platform meet" },
      { img: photoIleDeRe, from: "La Rochelle", to: "Île de Ré", meta: "≈ 35 min · bridge included" },
      { img: photoRoyan, from: "Saintes", to: "Royan", meta: "≈ 45 min · Atlantic coast" },
      { img: photoVanReal.url, from: "Group", to: "8-seat van", meta: "Group transfers" },
      { img: photoMedical, from: "Home", to: "Hospital / clinic", meta: "Medical transport" },
    ],
    bestEyebrow: "Fan favourites",
    bestTitle: "What our clients book the most",
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
        d: "Dialysis, chemotherapy, appointments: simple, unhurried care.",
      },
      {
        n: "03",
        img: photoVanReal.url,
        t: "Groups in an 8-seat van",
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
    ctaTitle: "Your driver is waiting",
    ctaText: "Book in under a minute, by voice or by typing.",
  },
} as const;

// Métadonnées sociales localisées : visuel, titre et description dédiés
// FR / EN, avec cache-busting sur l'image (voir src/lib/og.ts).
const HOME_SOCIAL_FR = {
  title: "Access Prestige Taxi — L'excellence à chaque trajet",
  description:
    "L'excellence à chaque trajet : réservation vocale ou écrite en moins d'une minute, BMW iX1 et Audi Q6 e-tron 5 places électriques, van Mercedes 8 places en Charente-Maritime.",
  image: ogImageUrl(ogHomeFr.url),
  alt: "Access Prestige Taxi — taxi 100 % électrique en Charente-Maritime, BMW iX1 et van Mercedes V-Class",
  url: ogPageUrl("/", "fr"),
};
const HOME_SOCIAL_EN = {
  title: "Access Prestige Taxi — Excellence on every journey",
  description:
    "Book by voice or text in under a minute: 5-seat electric BMW iX1 and Audi Q6 e-tron, plus an 8-seat Mercedes van across Charente-Maritime.",
  image: ogImageUrl(ogHomeEn.url),
  alt: "Access Prestige Taxi — 100% electric taxi in Charente-Maritime, BMW iX1 and Mercedes V-Class van",
  url: ogPageUrl("/", "en"),
};

export const Route = createFileRoute("/")({
  component: Index,
  // ?lang=en / ?lang=fr : force la langue du visuel et des textes sociaux
  // pour les partages (la page reste servie sur la même URL).
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | "fr" } => ({
    lang: search["lang"] === "en" ? ("en" as const) : search["lang"] === "fr" ? ("fr" as const) : undefined,
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
            ? "Taxi in Charente-Maritime: 5-seat electric BMW iX1 and Audi Q6 e-tron, 8-seat van, wheelchair medical transport, all stations and airports."
            : "Taxi en Charente-Maritime : BMW iX1 et Audi Q6 e-tron électriques 5 places, van 8 places, transport sanitaire avec fauteuil roulant, toutes gares et aéroports.",
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
            address: {
              "@type": "PostalAddress",
              addressRegion: "Charente-Maritime",
              addressCountry: "FR",
            },
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
                name: "Van Mercedes V-Class 8 places",
                alternateName: "Mercedes V-Class 8-seat van",
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
  const {
    index: slideIndex,
    canAnimate,
    select,
    next,
    prev,
    paused,
    togglePause,
  } = useHeroSlideshow(slides.length, HERO_SLIDE_DURATION_MS);

  return (
    <main>
      <SocialMetaSync lang={lang === "en" ? "en" : "fr"} fr={HOME_SOCIAL_FR} en={HOME_SOCIAL_EN} />

      {/* HERO — diaporama photo avec effet Ken Burns (zoom/pan lent), sans texte en surimpression */}
      <section
        className="relative isolate min-h-[40svh] overflow-hidden sm:min-h-[45vh] lg:min-h-[52vh]"
        role="region"
        aria-roledescription={lang === "en" ? "image carousel" : "diaporama d'images"}
        aria-label={
          lang === "en"
            ? "Access Prestige Taxi fleet: BMW iX1 electric, Audi Q6 e-tron and Mercedes V-Class 8-seat van in Charente-Maritime"
            : "Flotte Access Prestige Taxi : BMW iX1 électrique, Audi Q6 e-tron et van Mercedes V-Class 8 places en Charente-Maritime"
        }
      >
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
                    srcSet={"srcSet" in slide ? slide.srcSet : undefined}
                    sizes="100vw"
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
      <section className="relative overflow-hidden border-t border-border bg-background pb-16 pt-12 sm:pb-20 sm:pt-16">
        {/* Voile doré premium : la variable --gradient-gold existait déjà dans le thème
            mais n'était utilisée nulle part sur la home — d'où le fait qu'aucun or ne
            se voyait en arrière-plan. Ici en watermark très léger, purement décoratif. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-[0.10]"
          style={{ backgroundImage: "var(--gradient-gold)", maskImage: "linear-gradient(180deg, black, transparent)" }}
        />
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 sm:px-6 lg:px-8 text-center">
          {/* Bloc critique above-the-fold : H1, texte d'accroche et CTA arrivent en premier,
              avant les pastilles/valeurs/paragraphe SEO — sur un écran 375px, le visiteur voit
              le titre et le bouton "Réserver" sans avoir à défiler. Une seule animation (pas de
              cascade par élément) pour limiter le coût TTI/INP sur mobile milieu de gamme. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
              {c.h1}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{c.lead}</p>

            <div className="mt-8 flex w-full flex-col flex-wrap items-stretch justify-center gap-3 md:w-auto md:flex-row md:items-center md:mx-auto">
              <Link
                to="/reserver"
                className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
              >
                {c.ctaBook} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {DRIVERS.map((d) => (
                <a
                  key={d.tel}
                  href={`tel:${d.tel}`}
                  aria-label={`${c.callPrefix} ${d.name} — ${d.display}`}
                  className="inline-flex min-h-[52px] touch-manipulation items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition duration-300 hover:scale-[1.03] hover:border-primary active:scale-[0.98]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {c.callPrefix} {d.name}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{d.display}</span>
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Pastille de services + paragraphe SEO : contenu secondaire, placé après le
              CTA principal et non animé (pas de motion.div) pour éviter d'ajouter une
              cascade d'animations au chargement. La rangée "valeurs" (Ponctualité,
              Confort, Discrétion, Sécurité) a été retirée : elle répétait ce qui est déjà
              dit dans driversLead et la section "Pourquoi nous choisir" — un des points
              que Rafael voulait décluttérer pour un rendu plus premium. */}
          <div className="mt-10 w-full">
            <ul
              aria-label={lang === "en" ? "Our main taxi services" : "Nos principales prestations de taxi"}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              {(lang === "en" ? HERO_PILLARS_EN : HERO_PILLARS_FR).map((p, i) => (
                <li key={p.label} className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/80 sm:text-xs">
                    <p.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {p.label}
                  </span>
                  {i < (lang === "en" ? HERO_PILLARS_EN : HERO_PILLARS_FR).length - 1 && (
                    <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ul>

            {/* Texte SEO + liens internes (mêmes destinations que le menu) — utile sur mobile */}
            <nav
              aria-label={lang === "en" ? "Quick site links" : "Liens rapides du site"}
              className="mx-auto mt-4 max-w-2xl border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground/80"
            >
              {lang === "en" ? (
                <p>
                  Access Prestige Taxi, your 100% electric taxi in Charente-Maritime: discover our{" "}
                  <Link
                    to="/services"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    taxi services
                  </Link>
                  ,{" "}
                  <Link
                    to="/reserver"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    book a ride online
                  </Link>
                  ,{" "}
                  <Link
                    to="/devis"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    request a quote
                  </Link>
                  , read our{" "}
                  <Link
                    to="/blog"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    Charente-Maritime guide
                  </Link>
                  , browse our{" "}
                  <Link
                    to="/destinations"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    destinations
                  </Link>
                  , learn more{" "}
                  <Link
                    to="/a-propos"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    about Patricia &amp; Alain
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/contact"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    contact us
                  </Link>
                  .
                </p>
              ) : (
                <p>
                  Access Prestige Taxi, votre taxi 100 % électrique en Charente-Maritime : découvrez nos{" "}
                  <Link
                    to="/services"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    services de taxi
                  </Link>
                  ,{" "}
                  <Link
                    to="/reserver"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    réservez votre course en ligne
                  </Link>
                  ,{" "}
                  <Link
                    to="/devis"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    demandez un devis
                  </Link>
                  , consultez notre{" "}
                  <Link
                    to="/blog"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    guide Charente-Maritime
                  </Link>
                  , nos{" "}
                  <Link
                    to="/destinations"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    destinations
                  </Link>
                  , apprenez-en plus{" "}
                  <Link
                    to="/a-propos"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    sur Patricia &amp; Alain
                  </Link>{" "}
                  ou{" "}
                  <Link
                    to="/contact"
                    className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    contactez-nous
                  </Link>
                  .
                </p>
              )}
            </nav>
          </div>

          <dl
            aria-label={
              lang === "en"
                ? "Access Prestige Taxi in figures: drivers and vehicles"
                : "Access Prestige Taxi en chiffres : chauffeurs et véhicules"
            }
            className="mt-14 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4"
          >
            {c.stats.map((s) => (
              <div key={s.l} className="overflow-hidden bg-card text-left">
                <img
                  src={s.img}
                  alt={`Access Prestige Taxi — ${s.n}${s.suffix} ${s.l}`}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={360}
                  className="h-24 w-full object-cover sm:h-28 lg:h-32"
                />
                <div className="px-3 py-3 sm:px-4 sm:py-4">
                  <dt className="font-display text-xl font-semibold text-primary sm:text-2xl lg:text-3xl">
                    <Counter value={s.n} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-[11px]">
                    {s.l}
                  </dd>
                </div>
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
            <div
              role="group"
              aria-label={lang === "en" ? "Choose a vehicle to preview" : "Choisir un véhicule à afficher"}
              onKeyDown={(e) => {
                const container = e.currentTarget;
                const focusActive = () => {
                  window.setTimeout(() => {
                    container.querySelector<HTMLButtonElement>("[data-slide-index][aria-pressed='true']")?.focus();
                  }, 0);
                };

                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  next();
                  focusActive();
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  prev();
                  focusActive();
                } else if (e.key === "Home") {
                  e.preventDefault();
                  select(0);
                  focusActive();
                } else if (e.key === "End") {
                  e.preventDefault();
                  select(slides.length - 1);
                  focusActive();
                }
              }}
              className="flex flex-wrap items-center justify-center gap-2 pb-2 sm:gap-3"
            >
              <button
                type="button"
                onClick={prev}
                aria-label={lang === "en" ? "Previous vehicle" : "Véhicule précédent"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={i === slideIndex}
                  tabIndex={i === slideIndex ? 0 : -1}
                  data-slide-index={i}
                  className={`min-h-11 shrink-0 rounded-xl border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xs ${
                    i === slideIndex
                      ? "border-primary bg-primary/10 text-primary shadow-[var(--shadow-gold)]"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}

              <button
                type="button"
                onClick={next}
                aria-label={lang === "en" ? "Next vehicle" : "Véhicule suivant"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={togglePause}
                aria-label={
                  paused
                    ? lang === "en"
                      ? "Resume automatic slideshow"
                      : "Reprendre le défilement automatique"
                    : lang === "en"
                      ? "Pause automatic slideshow"
                      : "Mettre en pause le défilement automatique"
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {paused ? (
                  <Play className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <p aria-live="polite" className="sr-only">
              {lang === "en"
                ? `Slide ${slideIndex + 1} of ${slides.length}: ${slides[slideIndex].title}`
                : `Diapositive ${slideIndex + 1} sur ${slides.length} : ${slides[slideIndex].title}`}
            </p>

            <AnimatePresence mode="wait">
              {slides[slideIndex].id !== "brand" && (
                <motion.div
                  key={slides[slideIndex].id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  role="group"
                  aria-live="polite"
                  aria-label={`${slides[slideIndex].title} — ${slides[slideIndex].label}`}
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

      {/* NOS SERVICES — aperçu directement sur la home, catalogue complet réutilisé
          depuis /services (SERVICE_CARDS_FR/EN) pour ne pas dupliquer le contenu et
          rester cohérent si une prestation est ajoutée/modifiée. Évite d'obliger le
          visiteur à passer par le menu pour voir ce qu'on propose. */}
      <section className="relative overflow-hidden border-t border-border bg-background py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 opacity-[0.08]"
          style={{ backgroundImage: "var(--gradient-gold)", maskImage: "linear-gradient(0deg, black, transparent)" }}
        />
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">
              {lang === "en" ? "Our services" : "Nos prestations"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {lang === "en" ? "A service for every journey" : "Une prestation pour chaque trajet"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {lang === "en"
                ? "Medical transport, station and airport transfers, chauffeur hire, group travel — all in electric vehicles."
                : "Transport sanitaire, transferts gares et aéroports, mise à disposition, transport de groupe — le tout en véhicules électriques."}
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(lang === "en" ? SERVICE_CARDS_EN : SERVICE_CARDS_FR).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <Link to="/services" className={`group flex h-full flex-col overflow-hidden ${CARD}`}>
                  <img
                    src={s.photo}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={426}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:h-44"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-semibold text-card-foreground sm:text-lg">{s.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/devis"
              search={{ prestation: undefined, lang: undefined }}
              className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-7 font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {lang === "en" ? "Request a quote" : "Demander un devis"}
            </Link>
            <Link
              to="/services"
              className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-border px-7 font-semibold transition duration-300 hover:scale-[1.03] hover:border-primary/60 active:scale-[0.98] sm:w-auto"
            >
              {lang === "en" ? "See all services" : "Voir toutes nos prestations"}
            </Link>
          </div>
        </div>
      </section>

      {/* TRANSPORT DE GROUPE — VAN 8 PLACES */}
      {/* BANDE PREMIUM — flotte de groupe + destinations, fond noir/doré, un seul message fort */}
      <section className="dark relative isolate overflow-hidden border-y border-border">
        <img
          src={photoBmwReal.url}
          alt={c.bannerTitle}
          loading="lazy"
          width={1600}
          height={900}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,8,10,0.92),rgba(8,8,10,0.6))]" />
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-24 sm:py-32">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.groupEyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.bannerTitle}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85 sm:text-base">{c.bannerText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/reserver"
                className="inline-flex min-h-[48px] touch-manipulation items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                {c.ctaBook} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/reserver"
                search={{ passagers: 7 } as never}
                className="inline-flex min-h-[48px] touch-manipulation items-center gap-2 rounded-xl border border-primary/60 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary transition duration-300 hover:scale-[1.03] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                {c.groupCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
                <h3 className="font-display text-xl font-semibold text-card-foreground">Audi Q6 e-tron</h3>
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

          <Reveal delay={0.2}>
            <div className="mt-10 flex justify-center">
              <Link
                to="/reserver"
                className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
              >
                {c.ctaBook} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DESTINATIONS — regroupe aussi les trajets les plus demandés (gare/aéroport, médical, groupes) */}
      <section className="bg-background py-20">
        <div className="divider-gold" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.destEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.destTitle}
            </h2>
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

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline"
            >
              {lang === "en" ? "See all destinations" : "Voir toutes les destinations"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/reserver"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {c.ctaBook} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* POURQUOI NOUS CHOISIR — 3e bande noir/doré, pour répartir l'identité premium sur toute la page */}
      <section className="dark border-t border-border bg-background py-20">
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
          <Reveal delay={0.2}>
            <div className="mt-8 flex justify-center">
              <Link
                to="/reserver"
                className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
              >
                {c.ctaBook} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE — étapes de réservation, suivi/appli et espace client réunis */}
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

          {/* Suivi/appli + espace client : condensés en une bande unique plutôt qu'en deux
              sections séparées, avec un lien vers la page Réserver pour l'activation détaillée */}
          <Reveal delay={0.16}>
            <div className="dark mt-10 grid gap-4 rounded-3xl border border-primary/40 bg-card p-7 shadow-[var(--shadow-gold)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary">
                  {lang === "en" ? "Tracking & account" : "Suivi & espace client"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80 sm:text-base">
                  {lang === "en"
                    ? "Install the app for real-time tracking, and find your ride history, invoices and saved addresses in your personal account."
                    : "Installez l'application pour un suivi en temps réel, et retrouvez dans votre espace personnel l'historique de vos courses, vos factures et vos adresses favorites."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/reserver"
                  className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition duration-300 hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
                >
                  <Bell className="h-4 w-4" /> {lang === "en" ? "Enable notifications" : "Activer les notifications"}
                </Link>
                <Link
                  to="/client/login"
                  className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-primary px-6 py-3.5 text-sm font-semibold text-primary transition duration-300 hover:scale-[1.03] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                >
                  {c.clientCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Tuto d'installation, condensé : deux mini-cartes iOS/Android plutôt qu'un
              grand bloc séparé — reste sous le même h2 "Comment ça marche" */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Reveal delay={0.2}>
              <article className={`h-full p-6 ${CARD}`}>
                <h3 className="font-display text-base font-semibold text-card-foreground">
                  {lang === "en" ? "iPhone / iOS" : "iPhone / iOS"}
                </h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    1.{" "}
                    {lang === "en"
                      ? "Open Safari and go to accessprestigetaxi.fr"
                      : "Ouvrez Safari et allez sur accessprestigetaxi.fr"}
                  </li>
                  <li>
                    2.{" "}
                    {lang === "en"
                      ? "Tap the Share button (square with arrow)"
                      : "Tapez le bouton Partager (carré avec flèche)"}
                  </li>
                  <li>3. {lang === "en" ? "Select “Add to Home Screen”" : "Sélectionnez « Sur l'écran d'accueil »"}</li>
                  <li>
                    4.{" "}
                    {lang === "en"
                      ? "Open the app, then tap “Enable notifications” on the Book a ride page"
                      : "Ouvrez l'appli, puis appuyez sur « Activer les notifications » sur la page Réserver"}
                  </li>
                </ol>
              </article>
            </Reveal>
            <Reveal delay={0.26}>
              <article className={`h-full p-6 ${CARD}`}>
                <h3 className="font-display text-base font-semibold text-card-foreground">
                  {lang === "en" ? "Android" : "Android"}
                </h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    1.{" "}
                    {lang === "en"
                      ? "Open Chrome and go to accessprestigetaxi.fr"
                      : "Ouvrez Chrome et allez sur accessprestigetaxi.fr"}
                  </li>
                  <li>
                    2.{" "}
                    {lang === "en"
                      ? "Tap the ⋮ menu at the top right"
                      : "Tapez le menu ⋮ (trois points) en haut à droite"}
                  </li>
                  <li>
                    3. {lang === "en" ? "Select “Add to Home Screen”" : "Sélectionnez « Ajouter à l'écran d'accueil »"}
                  </li>
                  <li>
                    4.{" "}
                    {lang === "en"
                      ? "Open the app, then tap “Enable notifications” on the Book a ride page"
                      : "Ouvrez l'appli, puis appuyez sur « Activer les notifications » sur la page Réserver"}
                  </li>
                </ol>
              </article>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              {lang === "en"
                ? 'Without installing, background alerts ("Driver on the way", "Arrived") can\'t be sent — that\'s what the app is for.'
                : "Sans installation, les alertes en arrière-plan (« Taxi en route », « Arrivé ») ne peuvent pas être envoyées — c'est à ça que sert l'appli."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* AVIS — réassurance, avis clients et dépôt d'avis réunis en une seule section */}
      <ClientTrust>
        <div className="mx-auto max-w-2xl border-t border-border pt-10">
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.reviewEyebrow}</p>
          <h3 className="mt-3 text-center font-display text-2xl font-semibold text-foreground sm:text-3xl text-balance">
            {c.reviewTitle}
          </h3>
          <p className="mt-3 text-center text-sm text-muted-foreground">{c.reviewText}</p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <ReviewForm />
          </div>
        </div>
      </ClientTrust>

      {/* FAQ SEO */}
      <FaqSeo />

      {/* BLOG */}
      <section className="py-20">
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

      {/* CTA FINAL — bande premium noir/doré, cohérente avec la bande flotte/destinations plus haut */}
      <section className="dark relative isolate overflow-hidden border-t border-border">
        <img
          src={photoAudiReal.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1600}
          height={900}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,8,10,0.88)_0%,rgba(8,8,10,0.92)_100%)]" />
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              {c.ctaTitle}
            </h2>
            <p className="mt-3 text-foreground/80">{c.ctaText}</p>
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
