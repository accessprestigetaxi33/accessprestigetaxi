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
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Gem,
  HeartHandshake,
  Phone,
  ShieldCheck,
  Smartphone,
  Star,
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
import photoBmwReal from "@/assets/apt-bmw-real.webp.asset.json";
import photoAudiReal from "@/assets/apt-audi-real.webp.asset.json";
import photoVanReal from "@/assets/apt-van-real.webp.asset.json";

const BLOG_PICKS = GUIDE_HIGHLIGHTS;
const SLOGAN_FR = "L'excellence à chaque trajet";
const SLOGAN_EN = "Excellence on every journey";
const SITE_URL = "https://www.accessprestigetaxi.fr";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const CARD =
  "dark rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--gold)_55%,transparent)]";

const NIGHT_SECTION = "dark border-t border-white/10 bg-[#0a0f2c]";

function ReserveButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <Link
      to="/reserver"
      className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg btn-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02] ${className}`}
    >
      {label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

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

const REVIEWS_FR = [
  {
    name: "Jessica Roquejoffre",
    text: "Patricia et Alain sont toujours très agréables et disponibles à l'heure. Cela fait plus de 6 ans que je suis cliente, je vous conseille vraiment.",
  },
  {
    name: "I GO",
    text: "3 jours en taxi : visite du Cap Ferret, de Bordeaux et des alentours. Service impeccable, une personne très professionnelle et agréable.",
  },
  {
    name: "enrico boto",
    text: "Patricia, disponible, ponctuelle et serviable. Voiture toujours propre et agréable, qui rend chaque déplacement plaisant.",
  },
] as const;

const REVIEWS_EN = [
  {
    name: "Jessica Roquejoffre",
    text: "Patricia and Alain are always lovely and on time. I've been a client for more than 6 years — I highly recommend them.",
  },
  {
    name: "I GO",
    text: "3 days by taxi: Cap Ferret, Bordeaux and the surrounding area. Impeccable service, a very professional and pleasant person.",
  },
  {
    name: "enrico boto",
    text: "Patricia is available, punctual and helpful. The car is always clean and pleasant, making every ride enjoyable.",
  },
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
    reserveCta: "Réserver",
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
        details: [
          "SUV 100 % électrique, silencieux et sans émissions, idéal pour vos trajets en ville comme sur route.",
          "5 places confortables, climatisation, sièges en cuir et espace bagages adapté aux valises.",
          "Parfait pour les transferts gare, aéroport et rendez-vous professionnels en Charente-Maritime.",
        ],
      },
      {
        title: "Audi Q6 e-tron",
        subtitle: "100 % électrique · SUV premium",
        img: photoAudiReal.url,
        alt: "Audi Q6 e-tron Access Prestige Taxi",
        details: [
          "SUV premium 100 % électrique, autonomie élevée pour les longues distances et trajets inter-villes.",
          "Habitacle spacieux et haut de gamme, pensé pour le confort sur les trajets professionnels et privés.",
          "Idéal pour les mises à disposition avec chauffeur et les déplacements d'affaires exigeants.",
        ],
      },
      {
        title: "Mercedes V-Class",
        subtitle: "8 places · transport de groupe",
        img: photoVanReal.url,
        alt: "Mercedes V-Class 8 places Access Prestige Taxi",
        details: [
          "Van premium 8 places, la solution idéale pour les groupes, familles et transferts d'équipe.",
          "Large espace pour les bagages, adapté aux transferts aéroport et gare pour plusieurs passagers.",
          "Également disponible pour les mariages, événements et sorties en groupe en Charente-Maritime.",
        ],
      },
    ],
    reviewsEyebrow: "Avis clients",
    reviewsTitle: "Ils nous font confiance",
    reviewsVerified: "Avis vérifié",
    reviewsLink: "Voir tous les avis",
    reviewsDetails: [
      "Des avis vérifiés laissés par nos clients après un transfert aéroport, un transport médical conventionné ou une mise à disposition.",
      "Une note élevée saluant la ponctualité, le confort des véhicules électriques et la discrétion de nos chauffeurs Alain et Patricia.",
      "Votre avis compte : partagez votre expérience pour aider d'autres voyageurs en Charente-Maritime.",
    ],
    howEyebrow: "Comment réserver ?",
    howTitle: "Réserver en toute simplicité",
    how: [
      {
        s: "1",
        icon: Smartphone,
        t: "Réservez en ligne ou par téléphone",
        d: "En quelques clics sur le site, ou par un appel direct à votre chauffeur.",
        details: [
          "Formulaire de réservation en ligne disponible 24h/24, avec estimation du tarif avant validation.",
          "Réservation par téléphone directement auprès d'Alain ou de Patricia, pour un contact humain et personnalisé.",
          "Course immédiate ou planifiée à l'avance, y compris pour vos rendez-vous médicaux et transferts aéroport.",
          "Aucune commission d'application : le prix annoncé est le prix payé.",
        ],
      },
      {
        s: "2",
        icon: CheckCircle2,
        t: "Recevez une confirmation",
        d: "Prix annoncé et chauffeur assigné, confirmation immédiate.",
        details: [
          "Confirmation instantanée par SMS ou notification avec le nom et le numéro de votre chauffeur.",
          "Tarif fixe communiqué avant le départ, sans mauvaise surprise à l'arrivée.",
          "Possibilité de modifier ou d'annuler votre réservation directement depuis votre espace client.",
        ],
      },
      {
        s: "3",
        icon: Car,
        t: "Votre chauffeur vous prend en charge",
        d: "À l'heure convenue, où que vous soyez.",
        details: [
          "Suivi en temps réel de l'arrivée de votre chauffeur sur la carte, comme pour un VTC.",
          "Prise en charge à domicile, en gare, à l'aéroport ou à toute adresse en Charente-Maritime.",
          "Véhicule haut de gamme, propre et parfaitement entretenu, pour un trajet confortable jusqu'à destination.",
        ],
      },
    ],
    appEyebrow: "Suivi & espace client",
    appText:
      "Installez l'application pour un suivi en temps réel, et retrouvez dans votre espace personnel l'historique de vos courses, vos factures et vos adresses favorites.",
    appDetails: [
      "Application installable directement depuis votre navigateur, sans passer par un store, en quelques secondes.",
      "Notifications en temps réel : chauffeur en route, arrivée imminente, confirmation de course.",
      "Espace client sécurisé : historique complet de vos trajets, téléchargement de vos factures et gestion de vos adresses favorites.",
    ],
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
    reserveCta: "Book",
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
        details: [
          "A fully electric SUV, quiet and emission-free, ideal for city rides and longer journeys alike.",
          "5 comfortable seats, air conditioning, leather trim and luggage space suited to suitcases.",
          "Perfect for station transfers, airport runs and business appointments across Charente-Maritime.",
        ],
      },
      {
        title: "Audi Q6 e-tron",
        subtitle: "100% electric · premium SUV",
        img: photoAudiReal.url,
        alt: "Audi Q6 e-tron Access Prestige Taxi",
        details: [
          "A premium, fully electric SUV with strong range for long-distance and inter-city journeys.",
          "A spacious, upscale cabin designed for comfort on business and private trips.",
          "Ideal for chauffeur services and demanding business travel.",
        ],
      },
      {
        title: "Mercedes V-Class",
        subtitle: "8 seats · group transport",
        img: photoVanReal.url,
        alt: "Mercedes V-Class 8-seat Access Prestige Taxi",
        details: [
          "A premium 8-seat van, the ideal solution for groups, families and team transfers.",
          "Generous luggage space, well suited to airport and station transfers for several passengers.",
          "Also available for weddings, events and group outings across Charente-Maritime.",
        ],
      },
    ],
    reviewsEyebrow: "Client reviews",
    reviewsTitle: "They trust us",
    reviewsVerified: "Verified review",
    reviewsLink: "See all reviews",
    reviewsDetails: [
      "Verified reviews from clients after an airport transfer, covered medical transport or a chauffeur service.",
      "A high rating praising punctuality, the comfort of our electric vehicles and the discretion of drivers Alain and Patricia.",
      "Your review matters: share your experience to help other travellers across Charente-Maritime.",
    ],
    howEyebrow: "How to book?",
    howTitle: "Booking made simple",
    how: [
      {
        s: "1",
        icon: Smartphone,
        t: "Book online or by phone",
        d: "A few clicks on the site, or a direct call to your driver.",
        details: [
          "Online booking form available 24/7, with a fare estimate shown before you confirm.",
          "Book by phone directly with Alain or Patricia for a personal, human contact.",
          "Book an immediate ride or plan ahead, including for medical appointments and airport transfers.",
          "No app commission: the quoted price is the price you pay.",
        ],
      },
      {
        s: "2",
        icon: CheckCircle2,
        t: "Receive a confirmation",
        d: "Quoted price and assigned driver, confirmed instantly.",
        details: [
          "Instant confirmation by SMS or notification with your driver's name and phone number.",
          "Fixed fare communicated before departure, with no surprise on arrival.",
          "Change or cancel your booking anytime from your client account.",
        ],
      },
      {
        s: "3",
        icon: Car,
        t: "Your driver picks you up",
        d: "At the agreed time, wherever you are.",
        details: [
          "Real-time tracking of your driver's arrival on the map, just like a private-hire app.",
          "Pickup at home, the station, the airport, or any address across Charente-Maritime.",
          "A premium, clean and perfectly maintained vehicle for a comfortable ride to your destination.",
        ],
      },
    ],
    appEyebrow: "Tracking & account",
    appText:
      "Install the app for real-time tracking, and find your ride history, invoices and saved addresses in your personal account.",
    appDetails: [
      "Installable straight from your browser in a few seconds, with no app store needed.",
      "Real-time notifications: driver on the way, arrival imminent, ride confirmed.",
      "A secure client area: full ride history, downloadable invoices and saved favourite addresses.",
    ],
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

function LearnMoreToggle({ lang, details }: { lang: "fr" | "en"; details: readonly string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
      >
        {isOpen ? (lang === "en" ? "Show less" : "Voir moins") : lang === "en" ? "Learn more" : "En savoir plus"}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 space-y-2 overflow-hidden border-t border-border pt-5 text-left text-sm leading-relaxed text-muted-foreground"
          >
            {details.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {d}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewsCarousel({
  reviews,
  verifiedLabel,
  reserveLabel,
}: {
  reviews: readonly { name: string; text: string }[];
  verifiedLabel: string;
  reserveLabel: string;
}) {
  const [trackRef, setTrackRef] = useState<HTMLDivElement | null>(null);

  const scrollByCard = (dir: 1 | -1) => {
    if (!trackRef) return;
    const card = trackRef.querySelector("[data-review-card]") as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 300) + 16;
    trackRef.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative mt-10">
      <div
        ref={setTrackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((r) => (
          <article
            key={r.name}
            data-review-card
            className={`w-[85%] shrink-0 snap-start p-6 text-left sm:w-[360px] ${CARD}`}
          >
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-card-foreground">“{r.text}”</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="font-semibold text-card-foreground">{r.name}</span>
              <span>·</span>
              <span>{verifiedLabel}</span>
            </div>
            <ReserveButton label={reserveLabel} className="mt-4" />
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Précédent"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Suivant"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function Index() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const engagements = lang === "en" ? ENGAGEMENTS_EN : ENGAGEMENTS_FR;
  const fleetValues = lang === "en" ? FLEET_VALUES_EN : FLEET_VALUES_FR;
  const pillars = lang === "en" ? HERO_PILLARS_EN : HERO_PILLARS_FR;
  const reviews = lang === "en" ? REVIEWS_EN : REVIEWS_FR;

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
      <section className={`${NIGHT_SECTION} py-20`}>
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">
              {lang === "en" ? "Our commitments" : "Nos engagements"}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {engagements.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.08}>
                <div className={`h-full p-7 sm:p-8 ${CARD}`}>
                  <e.icon className="h-9 w-9 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-xl font-semibold text-card-foreground sm:text-2xl">
                    {e.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{e.lead}</p>
                  <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={e.details} />
                  <ReserveButton label={c.reserveCta} className="mt-5" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NOTRE FLOTTE — présent sur le document */}
      <section className={`${NIGHT_SECTION} py-20`}>
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
                    <div className="flex justify-center">
                      <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={v.details} />
                    </div>
                    <ReserveButton label={c.reserveCta} className="mt-4" />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fleetValues.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <div className={`flex h-full flex-col items-center p-5 text-center ${CARD}`}>
                  <v.icon className="mx-auto h-7 w-7 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-base font-semibold text-card-foreground">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.text}</p>
                  <ReserveButton label={c.reserveCta} className="mt-4" />
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
      <section id="avis" className={`${NIGHT_SECTION} py-20`}>
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-primary">{c.reviewsEyebrow}</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {c.reviewsTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <ReviewsCarousel reviews={reviews} verifiedLabel={c.reviewsVerified} reserveLabel={c.reserveCta} />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-6 flex justify-center">
              <Link
                to="/avis"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                {c.reviewsLink} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-2 flex justify-center text-center">
              <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={c.reviewsDetails} />
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
      <section className={`${NIGHT_SECTION} py-20`}>
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
                <div className={`flex h-full flex-col p-6 ${CARD}`}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <h.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </span>
                    <span className="font-display text-4xl font-semibold text-primary/30">{h.s}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{h.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.d}</p>
                  <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={h.details} />
                  <ReserveButton label={c.reserveCta} className="mt-4" />
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
              <div className="flex justify-center text-center">
                <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={c.appDetails} />
              </div>
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
      <section className={`${NIGHT_SECTION} py-20`}>
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
                <div className={`flex h-full flex-col overflow-hidden ${CARD}`}>
                  <Link to="/blog/$slug" params={{ slug: e.slug }} className="group block">
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
                  <div className="mt-auto px-5 pb-5">
                    <ReserveButton label={c.reserveCta} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
