import { useState, type ReactNode } from "react";
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
  Bell,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  Gem,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  User,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { ReviewForm } from "@/components/ReviewForm";
import { ClientTrust } from "@/components/ClientTrust";
import { Reveal } from "@/components/motion-ui";
import { GUIDE_HIGHLIGHTS } from "@/data/guide-highlights";
import heroCars from "@/assets/hero-brouage-q6-bmw-vclass.webp";
import photoQ6Real from "@/assets/apt-q6-real.png";
import photoBmwReal from "@/assets/apt-bmw-real.png";
import photoVanReal from "@/assets/apt-van-real.png";
import medicalService from "@/assets/medical-service.webp";
import prestigeService from "@/assets/prestige-service.webp";
import reviewPhone from "@/assets/review-phone.webp";
import stepPhone from "@/assets/step-phone.webp";
import stepCalendar from "@/assets/step-calendar.webp";
import stepDriver from "@/assets/step-driver.webp";
import stepCar from "@/assets/step-car.webp";
import trackingPhone from "@/assets/tracking-phone.webp";
import appPhones from "@/assets/app-phones.webp";
import valuePunctuality from "@/assets/value-punctuality.webp";
import valueSecurity from "@/assets/value-security.webp";
import valueDiscretion from "@/assets/value-discretion.webp";
import valueComfort from "@/assets/value-comfort.webp";
import guideNice from "@/assets/guide-nice.webp";
import guideMonaco from "@/assets/guide-monaco.webp";
import guideCannes from "@/assets/guide-cannes.webp";

const BLOG_PICKS = GUIDE_HIGHLIGHTS;
const SLOGAN_FR = "L'excellence à chaque trajet";
const SLOGAN_EN = "Excellence on every journey";
const SITE_URL = "https://www.accessprestigetaxi.fr";

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function ReserveButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <Link
      to="/reserver"
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full btn-gold border border-[#e0b866] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02] ${className}`}
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

const HERO_VALUES_FR = ["Élégance", "Discrétion", "Exigence"] as const;
const HERO_VALUES_EN = ["Elegance", "Discretion", "Excellence"] as const;

const COPY = {
  fr: {
    h1: "Votre confort, notre priorité",
    tagline: "",
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
        title: "Audi Q6 e-tron",
        subtitle: "100 % électrique · SUV premium",
        img: photoQ6Real,
        alt: "Audi Q6 e-tron Access Prestige Taxi",
        details: [
          "SUV premium 100 % électrique, autonomie élevée pour les longues distances et trajets inter-villes.",
          "Habitacle spacieux et haut de gamme, pensé pour le confort sur les trajets professionnels et privés.",
          "Idéal pour les mises à disposition avec chauffeur et les déplacements d'affaires exigeants.",
        ],
      },
      {
        title: "BMW iX1",
        subtitle: "100 % électrique · 5 places",
        img: photoBmwReal,
        alt: "BMW iX1 100 % électrique Access Prestige Taxi",
        details: [
          "SUV 100 % électrique, silencieux et sans émissions, idéal pour vos trajets en ville comme sur route.",
          "5 places confortables, climatisation, sièges en cuir et espace bagages adapté aux valises.",
          "Parfait pour les transferts gare, aéroport et rendez-vous professionnels en Charente-Maritime.",
        ],
      },
      {
        title: "Mercedes V-Class",
        subtitle: "8 places · transport de groupe",
        img: photoVanReal,
        alt: "Mercedes V-Class 8 places Access Prestige Taxi",
        details: [
          "Van premium 8 places, la solution idéale pour les groupes, familles et transferts d'équipe.",
          "Large espace pour les bagages, adapté aux transferts aéroport et gare pour plusieurs passagers.",
          "Également disponible pour les mariages, événements et sorties en groupe en Charente-Maritime.",
        ],
      },
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
    h1: "Your comfort, our priority",
    tagline: "",
    lead: "Premium transport and covered medical transport across Charente-Maritime. Personalised care, premium vehicles and a service considered down to the smallest detail.",
    ctaBook: "Book my ride",
    reserveCta: "Book",
    callPrefix: "Call",
    fleetEyebrow: "Our fleet",
    fleetTitle: "Your comfort, our priority",
    fleetText: "The Access Prestige Taxi collection: premium, perfectly maintained vehicles designed for every need.",
    vehicles: [
      {
        title: "Audi Q6 e-tron",
        subtitle: "100% electric · premium SUV",
        img: photoQ6Real,
        alt: "Audi Q6 e-tron Access Prestige Taxi",
        details: [
          "A fully electric SUV, quiet and emission-free, ideal for city rides and longer journeys alike.",
          "5 comfortable seats, air conditioning, leather trim and luggage space suited to suitcases.",
          "Perfect for station transfers, airport runs and business appointments across Charente-Maritime.",
        ],
      },
      {
        title: "BMW iX1",
        subtitle: "100% electric · 5 seats",
        img: photoBmwReal,
        alt: "BMW iX1 100% electric Access Prestige Taxi",
        details: [
          "A fully electric SUV, quiet and emission-free, ideal for city rides and longer journeys alike.",
          "5 comfortable seats, air conditioning, leather trim and luggage space suited to suitcases.",
          "Perfect for station transfers, airport runs and business appointments across Charente-Maritime.",
        ],
      },
      {
        title: "Mercedes V-Class",
        subtitle: "8 seats · group transport",
        img: photoVanReal,
        alt: "Mercedes V-Class 8-seat Access Prestige Taxi",
        details: [
          "A premium 8-seat van, the ideal solution for groups, families and team transfers.",
          "Generous luggage space, well suited to airport and station transfers for several passengers.",
          "Also available for weddings, events and group outings across Charente-Maritime.",
        ],
      },
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

function LearnMoreToggle({
  lang,
  details,
  variant = "outline",
}: {
  lang: "fr" | "en";
  details: readonly string[];
  variant?: "outline" | "solid";
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className={
          variant === "solid"
            ? "mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full btn-gold border border-[#e0b866] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02]"
            : "mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
        }
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
            className={
              variant === "solid"
                ? "mt-5 space-y-2 overflow-hidden pt-5 text-left text-sm leading-relaxed text-white/80"
                : "mt-5 space-y-2 overflow-hidden pt-5 text-left text-sm leading-relaxed text-muted-foreground"
            }
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

function SplitPhotoCard({
  image,
  alt,
  icon: Icon,
  title,
  lead,
  children,
  reverse = false,
}: {
  image: string;
  alt: string;
  icon: typeof Stethoscope;
  title: string;
  lead?: string;
  children?: ReactNode;
  reverse?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[#e0b866] bg-[#07111f] shadow-[0_18px_55px_rgba(0,0,0,0.38)]">
      <div
        className={`grid min-h-[330px] md:min-h-[360px] ${reverse ? "md:grid-cols-[0.95fr_1.05fr]" : "md:grid-cols-[1.05fr_0.95fr]"}`}
      >
        <div className={`relative flex flex-col justify-center p-6 sm:p-8 ${reverse ? "md:order-2" : "md:order-1"}`}>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#07111f] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <Icon className="h-7 w-7 text-[#e0b866]" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight text-[#f6f0e5] sm:text-[28px]">{title}</h3>
          <div className="mt-5 h-px w-12 bg-[#e0b866]" aria-hidden="true" />
          {lead && <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">{lead}</p>}
          {children}
        </div>
        <div className={`relative min-h-[270px] overflow-hidden md:min-h-0 ${reverse ? "md:order-1" : "md:order-2"}`}>
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,31,0.35),rgba(7,17,31,0.02)_55%,rgba(7,17,31,0.08))]"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}

function NotificationOptIn({ lang }: { lang: "fr" | "en" }) {
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  const handleClick = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission === "granted" ? "granted" : "denied");
    } catch {
      setStatus("unsupported");
    }
  };

  const labels = {
    idle: lang === "en" ? "Enable notifications" : "Activer les notifications",
    granted: lang === "en" ? "Notifications enabled" : "Notifications activées",
    denied: lang === "en" ? "Notifications blocked" : "Notifications bloquées",
    unsupported: lang === "en" ? "Not supported on this device" : "Non disponible sur cet appareil",
  } as const;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "granted" || status === "unsupported"}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full btn-gold border border-[#e0b866] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
    >
      <Bell className="h-3.5 w-3.5" aria-hidden="true" />
      {labels[status]}
    </button>
  );
}

function InstallAppToggle({ lang }: { lang: "fr" | "en" }) {
  const [isOpen, setIsOpen] = useState(false);

  const android =
    lang === "en"
      ? [
          "Open the site in Chrome.",
          "Tap the menu (⋮) in the top right corner.",
          'Select "Add to Home screen" or "Install app".',
          "Confirm — the icon appears on your home screen.",
        ]
      : [
          "Ouvrez le site dans Chrome.",
          "Appuyez sur le menu (⋮) en haut à droite.",
          "Sélectionnez « Ajouter à l'écran d'accueil » ou « Installer l'application ».",
          "Confirmez — l'icône apparaît sur votre écran d'accueil.",
        ];

  const iphone =
    lang === "en"
      ? [
          "Open the site in Safari.",
          "Tap the Share icon (square with an arrow).",
          'Select "Add to Home Screen".',
          'Tap "Add" — the icon appears on your home screen.',
        ]
      : [
          "Ouvrez le site dans Safari.",
          "Appuyez sur l'icône de partage (carré avec une flèche).",
          "Sélectionnez « Sur l'écran d'accueil ».",
          "Appuyez sur « Ajouter » — l'icône apparaît sur votre écran d'accueil.",
        ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full btn-gold border border-[#e0b866] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02]"
      >
        {isOpen ? (lang === "en" ? "Show less" : "Voir moins") : lang === "en" ? "Learn more" : "En savoir plus"}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 grid gap-5 overflow-hidden pt-5 text-left sm:grid-cols-2"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e0b866]">Android</p>
              <ol className="mt-2 space-y-2 text-sm leading-relaxed text-white/80">
                {android.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e0b866]">iPhone</p>
              <ol className="mt-2 space-y-2 text-sm leading-relaxed text-white/80">
                {iphone.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PhotoTopCard({
  image,
  alt,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  image: string;
  alt: string;
  icon: typeof Stethoscope;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#e0b866] bg-[#07111f] shadow-[0_16px_45px_rgba(0,0,0,0.32)]">
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.035]"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,20,0.02),rgba(3,10,20,0.18)_58%,rgba(3,10,20,0.48))]"
          aria-hidden="true"
        />
        <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#07111f]/90 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-[#e0b866]" aria-hidden="true" />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-xl font-semibold text-[#f6f0e5]">{title}</h3>
        {subtitle && <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/55">{subtitle}</p>}
        {children}
      </div>
    </article>
  );
}

function CompactPhotoCard({
  image,
  alt,
  icon: Icon,
  title,
  text,
}: {
  image: string;
  alt: string;
  icon: typeof Stethoscope;
  title: string;
  text: string;
}) {
  return (
    <article className="group relative min-h-[190px] overflow-hidden rounded-[20px] border border-[#e0b866] bg-[#07111f] shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,20,0.96),rgba(3,10,20,0.68)_52%,rgba(3,10,20,0.2))]"
        aria-hidden="true"
      />
      <div className="relative h-full p-4 sm:p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07111f]/90">
          <Icon className="h-5 w-5 text-[#e0b866]" aria-hidden="true" />
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold text-[#f6f0e5]">{title}</h3>
        <p className="mt-1.5 max-w-[80%] text-xs leading-relaxed text-white/65">{text}</p>
      </div>
    </article>
  );
}

const GUIDE_IMAGES = [guideNice, guideMonaco, guideCannes];

function Index() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const engagements = lang === "en" ? ENGAGEMENTS_EN : ENGAGEMENTS_FR;
  const fleetValues = lang === "en" ? FLEET_VALUES_EN : FLEET_VALUES_FR;
  const heroValues = lang === "en" ? HERO_VALUES_EN : HERO_VALUES_FR;
  const [heroMenuOpen, setHeroMenuOpen] = useState(false);

  return (
    <main className="homepage-gold-borders">
      <style>{`
        .homepage-gold-borders article {
          border: 2px solid #e0b866 !important;
        }
        .homepage-gold-borders button,
        .homepage-gold-borders a.btn-gold,
        .homepage-gold-borders a[href^="tel:"],
        .homepage-gold-borders a[href="/avis"] {
          border: 2px solid #e0b866 !important;
        }
      `}</style>
      <SocialMetaSync lang={lang === "en" ? "en" : "fr"} fr={HOME_SOCIAL_FR} en={HOME_SOCIAL_EN} />

      {/* 1. HERO — image hero de référence : Q6 / BMW iX1 / V-Class avec logos */}
      <section className="relative isolate overflow-hidden bg-black">
        <div className="relative w-full aspect-[2/3] min-h-[560px] sm:aspect-[1145/570] sm:min-h-0">
          <img
            src={heroCars}
            alt="Access Prestige Taxi — Audi Q6, BMW iX1 et Mercedes V-Class avec logos Access Prestige"
            fetchPriority="high"
            loading="eager"
            width={1145}
            height={570}
            className="absolute inset-0 h-full w-full object-cover object-center max-sm:object-contain"
          />

          {/* Contenu texte : aucun texte n'est intégré dans l'image, sauf le logo présent dans la photo */}
          <div className="absolute inset-x-0 top-[10%] z-10 flex flex-col items-center px-4 text-center sm:top-[16%]">
            <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-4xl md:text-5xl lg:text-6xl">
              {lang === "en" ? "EXCELLENCE ON EVERY JOURNEY" : "L’EXCELLENCE À CHAQUE TRAJET"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-base md:text-lg">
              {lang === "en"
                ? "Private transfers · Covered medical transport · Chauffeur service"
                : "Transferts privés · Transport médical conventionné · Mise à disposition"}
            </p>
          </div>

          {/* Un seul bouton RÉSERVER dans le hero */}
          <div className="absolute left-1/2 top-[42%] z-20 w-[min(300px,78vw)] -translate-x-1/2 sm:top-[35%]">
            <button
              type="button"
              onClick={() => setHeroMenuOpen((open) => !open)}
              aria-expanded={heroMenuOpen}
              className="btn-gold flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border-2 border-[#e0b866] px-6 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition hover:scale-[1.02] sm:text-sm"
            >
              {lang === "en" ? "BOOK" : "RÉSERVER"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${heroMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {heroMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-1 overflow-hidden rounded-xl border-2 border-[#e0b866] bg-[#07111f]/95 shadow-[0_16px_45px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                >
                  <Link
                    to="/reserver"
                    onClick={() => setHeroMenuOpen(false)}
                    className="flex min-h-[50px] items-center justify-center border-b border-[#e0b866]/50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#e0b866] hover:text-black"
                  >
                    {lang === "en" ? "RÉSERVER EN LIGNE" : "RÉSERVER EN LIGNE"}
                  </Link>
                  <a
                    href="tel:0603444863"
                    onClick={() => setHeroMenuOpen(false)}
                    className="flex min-h-[50px] items-center justify-center border-b border-[#e0b866]/50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#e0b866] hover:text-black"
                  >
                    APPELER ALAIN – 06 03 44 48 63
                  </a>
                  <a
                    href="tel:0650260015"
                    onClick={() => setHeroMenuOpen(false)}
                    className="flex min-h-[50px] items-center justify-center px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#e0b866] hover:text-black"
                  >
                    APPELER PATRICIA – 06 50 26 00 15
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 2. VOTRE CONFORT — texte de présentation à la place des pictogrammes */}
      <section className="bg-[#07111f] px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-[#f6f0e5] sm:text-4xl lg:text-5xl">
              {lang === "en" ? "Your comfort, our priority" : "Votre confort, notre priorité"}
            </h2>
            <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-white/75 sm:text-lg">
              {lang === "en"
                ? "High-end transportation and approved medical transportation in Charente-Maritime. Personalised care, premium vehicles and a service designed down to the smallest detail."
                : "Transport de haut de gamme et transport médical conventionné en Charente-Maritime. Une prise en charge personnalisée, des véhicules premium et un service pensé dans les moindres détails."}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-[#e0b866] sm:text-base">
              {(lang === "en" ? ["Elegance", "Discretion", "Excellence"] : ["Élégance", "Discrétion", "Exigence"]).map(
                (value) => (
                  <span key={value}>✓ {value}</span>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. NOS ENGAGEMENTS — reproduction de la composition de la maquette */}
      <section id="services" className="bg-[#07111f] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#f6f0e5] sm:text-3xl">
              <span className="text-white">Nos </span>
              <span className="text-[#e0b866]">engagements</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 md:grid-cols-2 md:gap-6">
            <Reveal>
              <SplitPhotoCard
                image={medicalService}
                alt="Transport médical conventionné"
                icon={Stethoscope}
                title={engagements[0].title}
                lead={engagements[0].lead}
              >
                <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={engagements[0].details} variant="solid" />
              </SplitPhotoCard>
            </Reveal>
            <Reveal delay={0.08}>
              <SplitPhotoCard
                image={prestigeService}
                alt="Prestige et transport privé"
                icon={BriefcaseBusiness}
                title={engagements[1].title}
                lead={engagements[1].lead}
                reverse
              >
                <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={engagements[1].details} variant="solid" />
              </SplitPhotoCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. NOTRE FLOTTE */}
      <section className="bg-[#07111f] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#f6f0e5] sm:text-3xl">
              <span className="text-white">Notre </span>
              <span className="text-[#e0b866]">flotte</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.vehicles.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <PhotoTopCard
                  image={v.img}
                  alt={v.alt}
                  icon={[Car, Car, Crown][i]}
                  title={v.title}
                  subtitle={v.subtitle}
                >
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs leading-relaxed text-white/70">
                      {i === 0 ? "1 à 3 passagers" : i === 1 ? "1 à 3 passagers" : "4 à 7 passagers"}
                    </span>
                    <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={v.details} variant="solid" />
                  </div>
                </PhotoTopCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fleetValues.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.04}>
                <CompactPhotoCard
                  image={[valuePunctuality, valueSecurity, valueDiscretion, valueComfort][i]}
                  alt={`${v.title} — Access Prestige Taxi`}
                  icon={v.icon}
                  title={v.title}
                  text={v.text}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AVIS CLIENTS */}
      <section id="avis" className="bg-[#07111f] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#f6f0e5] sm:text-3xl">
              <span className="text-white">Avis de nos </span>
              <span className="text-[#e0b866]">clients</span>
            </h2>
          </Reveal>
          <div className="mt-6">
            <SplitPhotoCard
              image={reviewPhone}
              alt="Avis clients Access Prestige Taxi"
              icon={Award}
              title={lang === "en" ? "Your satisfaction is our priority" : "Votre satisfaction est notre priorité"}
              lead={
                lang === "en"
                  ? "Clients trust us for a premium, human service."
                  : "Des clients nous font déjà confiance pour un service premium et humain."
              }
            >
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/avis"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#e0b866] transition hover:bg-[#e0b866] hover:text-[#07111f]"
                >
                  {lang === "en" ? "See reviews" : "Voir les avis"}{" "}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <ReserveButton label={c.reserveCta} />
              </div>
            </SplitPhotoCard>
          </div>
          <div className="mt-6 rounded-[22px] bg-black p-5 sm:p-7">
            <ClientTrust>
              <div className="text-black [&_p]:!text-black [&_blockquote]:!text-black [&_label]:!text-black [&_h3]:!text-black [&_h4]:!text-black [&_li]:!text-black [&_input]:!text-black [&_textarea]:!text-black [&_select]:!text-black [&_option]:text-black">
                <ReviewForm />
              </div>
            </ClientTrust>
          </div>
        </div>
      </section>

      {/* 6. COMMENT RÉSERVER — 4 cartes comme dans la maquette */}
      <section className="bg-[#07111f] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#f6f0e5] sm:text-3xl">
              <span className="text-white">Comment </span>
              <span className="text-[#e0b866]">réserver ?</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: c.how[0], image: stepPhone },
              { step: c.how[1], image: stepCalendar },
              { step: c.how[2], image: stepDriver },
              {
                step: {
                  s: "4",
                  icon: CheckCircle2,
                  t: lang === "en" ? "Enjoy a smooth journey" : "Profitez d’un trajet serein",
                  d:
                    lang === "en"
                      ? "Sit back while we take care of everything."
                      : "Installez-vous, on s’occupe de tout.",
                  details: [],
                },
                image: stepCar,
              },
            ].map(({ step, image }, i) => (
              <Reveal as="div" key={step.s} delay={i * 0.05}>
                <article className="group relative min-h-[300px] overflow-hidden rounded-[20px] border border-[#e0b866] bg-[#07111f]">
                  <img
                    src={image}
                    alt={step.t}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${i < 3 ? "brightness-[1.08] contrast-[1.06] saturate-[1.05]" : ""}`}
                  />
                  <div
                    className={`absolute inset-0 ${i < 3 ? "bg-[linear-gradient(90deg,rgba(3,10,20,0.78),rgba(3,10,20,0.38)_50%,rgba(3,10,20,0.10))]" : "bg-[linear-gradient(90deg,rgba(3,10,20,0.97),rgba(3,10,20,0.76)_50%,rgba(3,10,20,0.2))]"}`}
                    aria-hidden="true"
                  />
                  <div className="relative flex h-full flex-col p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-[#e0b866]">
                      {step.s}
                    </span>
                    <div className="mt-auto">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#07111f]/90">
                        <step.icon className="h-5 w-5 text-[#e0b866]" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[#f6f0e5]">{step.t}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/65">{step.d}</p>
                      {step.details.length > 0 && (
                        <LearnMoreToggle lang={lang === "en" ? "en" : "fr"} details={step.details} variant="solid" />
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SUIVI & ESPACE CLIENT */}
      <section className="bg-[#07111f] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#f6f0e5] sm:text-3xl">
              <span className="text-white">Suivi & </span>
              <span className="text-[#e0b866]">espace client</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <SplitPhotoCard
              image={trackingPhone}
              alt="Suivi du trajet"
              icon={Bell}
              title={lang === "en" ? "Trip notifications" : "Suivez votre trajet par notifications"}
              lead={
                lang === "en"
                  ? "No live map — instead you receive a notification at each key step: booking confirmed, driver on the way, driver arrived."
                  : "Pas de carte en temps réel, mais une notification à chaque étape clé de votre trajet : réservation confirmée, chauffeur en route, chauffeur arrivé."
              }
            >
              <div className="mt-5 flex flex-wrap gap-3">
                <NotificationOptIn lang={lang === "en" ? "en" : "fr"} />
              </div>
              <LearnMoreToggle
                lang={lang === "en" ? "en" : "fr"}
                variant="solid"
                details={
                  lang === "en"
                    ? [
                        "Confirmation notification as soon as your booking is registered.",
                        "Alert when your driver sets off towards your pickup point.",
                        "Notification when your driver arrives on site.",
                        "Automatic reminder ahead of your appointment time.",
                      ]
                    : [
                        "Notification de confirmation dès l'enregistrement de votre réservation.",
                        "Alerte lorsque votre chauffeur se met en route vers le point de prise en charge.",
                        "Notification à l'arrivée de votre chauffeur sur place.",
                        "Rappel automatique avant l'heure de votre rendez-vous.",
                      ]
                }
              />
            </SplitPhotoCard>
            <SplitPhotoCard
              image={appPhones}
              alt="Application mobile Access Prestige Taxi"
              icon={Smartphone}
              title={
                lang === "en"
                  ? "Web app, installable on your phone"
                  : "Application web, installable sur votre téléphone"
              }
              lead={
                lang === "en"
                  ? "Access Prestige Taxi is a web app: add it to your home screen in a few taps, no App Store or Play Store needed."
                  : "Access Prestige Taxi est une application web : ajoutez-la à votre écran d'accueil en quelques gestes, sans passer par l'App Store ou le Play Store."
              }
              reverse
            >
              <InstallAppToggle lang={lang === "en" ? "en" : "fr"} />
            </SplitPhotoCard>
            <div className="lg:col-span-2">
              <SplitPhotoCard
                image={reviewPhone}
                alt={lang === "en" ? "Client account" : "Espace client"}
                icon={User}
                title={lang === "en" ? "Your client area" : "Votre espace client"}
                lead={
                  lang === "en"
                    ? "Ride history, invoices and saved addresses, all in one secure personal space."
                    : "Historique de vos courses, factures et adresses favorites, réunis dans un espace personnel sécurisé."
                }
              >
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/client/login"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full btn-gold border border-[#e0b866] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:scale-[1.02]"
                  >
                    {lang === "en" ? "Access my client area" : "Accéder à l'espace client"}{" "}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <LearnMoreToggle
                  lang={lang === "en" ? "en" : "fr"}
                  variant="solid"
                  details={
                    lang === "en"
                      ? [
                          "Full history of your past rides.",
                          "Download your invoices at any time.",
                          "Manage and save your favourite addresses.",
                          "Modify or cancel a booking in one click.",
                        ]
                      : [
                          "Historique complet de vos trajets passés.",
                          "Téléchargement de vos factures à tout moment.",
                          "Gestion et enregistrement de vos adresses favorites.",
                          "Modification ou annulation d'une réservation en un clic.",
                        ]
                  }
                />
              </SplitPhotoCard>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GUIDE & ACTUALITÉS */}
      <section className="bg-[#07111f] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-[#f6f0e5] sm:text-3xl">
              <span className="text-white">Guide & </span>
              <span className="text-[#e0b866]">actualités</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_PICKS.map((e, i) => (
              <Reveal key={e.slug} delay={i * 0.05}>
                <article className="group overflow-hidden rounded-[22px] border border-[#e0b866] bg-[#07111f] shadow-[0_16px_45px_rgba(0,0,0,0.32)]">
                  <Link to="/blog/$slug" params={{ slug: e.slug }} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={GUIDE_IMAGES[i % GUIDE_IMAGES.length]}
                        alt={`${e.name} — ${e.city}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div
                        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,20,0.08),rgba(3,10,20,0.76))]"
                        aria-hidden="true"
                      />
                      <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#07111f]/90">
                        <MapPin className="h-5 w-5 text-[#e0b866]" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-[#f6f0e5]">{e.name}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">
                        {lang === "en" ? e.en : e.fr}
                      </p>
                      <span className="mt-4 inline-flex rounded-full bg-[#e0b866] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#07111f]">
                        {lang === "en" ? "Read article" : "Lire l’article"}
                      </span>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
