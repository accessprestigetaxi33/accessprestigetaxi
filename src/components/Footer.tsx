import { Link, useLocation } from "@tanstack/react-router";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Plane,
  UserRound,
  Heart,
  Route,
  Stethoscope,
  Briefcase,
  MessageCircle,
  Car,
  Headphones,
  Lock,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import logo from "@/assets/tcb-logo-badge.webp";
import { useI18n, useT } from "@/i18n/I18nProvider";

const PHONE = "0603444863";
const PHONE_DISPLAY = "06 03 44 48 63";
const EMAIL = "accessprestigetaxi@gmail.com";
const WHATSAPP = `https://wa.me/33${PHONE.replace(/^0/, "")}`;

// TODO: swap in the real social profile URLs once available.
const SOCIALS = [
  { key: "facebook", href: "#", label: "Facebook", Icon: Facebook },
  { key: "instagram", href: "#", label: "Instagram", Icon: Instagram },
  { key: "google", href: "#", label: "Google", Icon: null },
  { key: "linkedin", href: "#", label: "LinkedIn", Icon: Linkedin },
] as const;

const COPY = {
  fr: {
    tagline:
      "Votre service de taxi premium en Charente-Maritime. Toutes distances, confort, ponctualité et discrétion.",
    highlights: [
      { Icon: Clock, text: "Service 7j/7 – 24h/24" },
      { Icon: MapPin, text: "Charente-Maritime et au-delà, toutes distances" },
      { Icon: ShieldCheck, text: "Chauffeurs professionnels et véhicules haut de gamme" },
    ],
    navTitle: "Navigation",
    // NB : vérifier les chemins de route "/notre-flotte" et "/avis-clients", absents des fichiers fournis.
    nav: [
      { to: "/", label: "Accueil" },
      { to: "/reserver", label: "Réserver une course" },
      { to: "/services", label: "Nos services" },
      { to: "/notre-flotte", label: "Notre flotte" },
      { to: "/a-propos", label: "À propos" },
      { to: "/avis-clients", label: "Avis clients" },
      { to: "/contact", label: "Contact" },
    ],
    servicesTitle: "Nos services",
    services: [
      { Icon: Plane, text: "Transferts Aéroports & Gares" },
      { Icon: UserRound, text: "Mise à disposition" },
      { Icon: Heart, text: "Mariages & Événements" },
      { Icon: Route, text: "Trajets longue distance" },
      { Icon: Stethoscope, text: "Transport médical conventionné" },
      { Icon: Briefcase, text: "Business & Professionnels" },
    ],
    contactTitle: "Contact",
    phoneNote: "Appel direct",
    emailNote: "Réponse rapide",
    zone: "Charente-Maritime",
    country: "Toutes distances, France et Europe",
    whatsapp: "Nous écrire sur WhatsApp",
    features: [
      { Icon: Car, title: "Véhicules premium", subtitle: "Confort & électriques" },
      { Icon: UserRound, title: "Chauffeurs expérimentés", subtitle: "Ponctuels & discrets" },
      { Icon: Lock, title: "Paiement sécurisé", subtitle: "CB à bord" },
      { Icon: Headphones, title: "Service client 24/7", subtitle: "À votre écoute" },
    ],
    rights: "Tous droits réservés.",
    legal: [
      { to: "/mentions-legales", label: "Mentions légales" },
      { to: "/confidentialite", label: "Politique de confidentialité" },
      { to: "/cgv", label: "CGV" }, // TODO : créer la route /cgv si elle n'existe pas encore
    ],
  },
  en: {
    tagline: "Your premium taxi service in Charente-Maritime. Any distance, comfort, punctuality and discretion.",
    highlights: [
      { Icon: Clock, text: "Available 7 days a week, 24/7" },
      { Icon: MapPin, text: "Charente-Maritime and beyond, any distance" },
      { Icon: ShieldCheck, text: "Professional drivers and premium vehicles" },
    ],
    navTitle: "Navigation",
    nav: [
      { to: "/", label: "Home" },
      { to: "/reserver", label: "Book a ride" },
      { to: "/services", label: "Our services" },
      { to: "/notre-flotte", label: "Our fleet" },
      { to: "/a-propos", label: "About" },
      { to: "/avis-clients", label: "Reviews" },
      { to: "/contact", label: "Contact" },
    ],
    servicesTitle: "Our services",
    services: [
      { Icon: Plane, text: "Airport & station transfers" },
      { Icon: UserRound, text: "Chauffeur service" },
      { Icon: Heart, text: "Weddings & events" },
      { Icon: Route, text: "Long-distance rides" },
      { Icon: Stethoscope, text: "Medically-approved transport" },
      { Icon: Briefcase, text: "Business & professionals" },
    ],
    contactTitle: "Contact",
    phoneNote: "Call us directly",
    emailNote: "Quick reply",
    zone: "Charente-Maritime",
    country: "Any distance, France and Europe",
    whatsapp: "Message us on WhatsApp",
    features: [
      { Icon: Car, title: "Premium vehicles", subtitle: "Comfort & electric" },
      { Icon: UserRound, title: "Experienced drivers", subtitle: "Punctual & discreet" },
      { Icon: Lock, title: "Secure payment", subtitle: "Card on board" },
      { Icon: Headphones, title: "24/7 customer care", subtitle: "Here for you" },
    ],
    rights: "All rights reserved.",
    legal: [
      { to: "/mentions-legales", label: "Legal notice" },
      { to: "/confidentialite", label: "Privacy policy" },
      { to: "/cgv", label: "Terms & conditions" },
    ],
  },
} as const;

export function Footer() {
  const { lang } = useI18n();
  const t = useT();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const year = new Date().getFullYear();

  return (
    <footer aria-label={t("aria.footer")} className="bg-[#0b0b0d] text-[#c9c4b8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Main grid — 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-10">
          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex touch-manipulation items-center gap-3 [-webkit-tap-highlight-color:transparent]"
            >
              <img
                src={logo}
                alt="Access Prestige Taxi"
                className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
              />
              <span className="font-display leading-tight">
                <span className="block text-lg font-bold tracking-wide text-white sm:text-xl">ACCESS PRESTIGE</span>
                <span className="mt-1 flex items-center gap-2 text-xs font-semibold tracking-[0.35em] text-primary">
                  <span aria-hidden="true" className="h-px w-4 bg-primary/50" />
                  TAXI
                  <span aria-hidden="true" className="h-px w-4 bg-primary/50" />
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9b9689]">{c.tagline}</p>

            <ul className="mt-5 space-y-3">
              {c.highlights.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-[#c9c4b8]">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-primary">{c.navTitle}</h3>
            <span aria-hidden="true" className="mt-2 block h-px w-6 bg-primary/40" />
            <ul className="mt-4 space-y-1">
              {c.nav.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group flex touch-manipulation items-center justify-between gap-2 py-1.5 text-sm text-[#c9c4b8] transition [-webkit-tap-highlight-color:transparent] hover:text-white"
                  >
                    {l.label}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-primary/60 transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-primary">{c.servicesTitle}</h3>
            <span aria-hidden="true" className="mt-2 block h-px w-6 bg-primary/40" />
            <ul className="mt-4 space-y-3">
              {c.services.map(({ Icon, text }) => (
                <li key={text}>
                  <Link
                    to="/services"
                    className="flex touch-manipulation items-start gap-2.5 py-0.5 text-sm text-[#c9c4b8] transition [-webkit-tap-highlight-color:transparent] hover:text-white"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-primary">{c.contactTitle}</h3>
            <span aria-hidden="true" className="mt-2 block h-px w-6 bg-primary/40" />
            <ul className="mt-4 space-y-3.5">
              <li>
                <a
                  href={`tel:${PHONE}`}
                  className="flex touch-manipulation items-start gap-2.5 text-sm text-[#c9c4b8] transition [-webkit-tap-highlight-color:transparent] hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold text-white">{PHONE_DISPLAY}</span>
                    <span className="text-xs text-[#9b9689]">{c.phoneNote}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex touch-manipulation items-start gap-2.5 text-sm text-[#c9c4b8] transition [-webkit-tap-highlight-color:transparent] hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block break-all font-semibold text-white">{EMAIL}</span>
                    <span className="text-xs text-[#9b9689]">{c.emailNote}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[#c9c4b8]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-white">{c.zone}</span>
                  <span className="text-xs text-[#9b9689]">{c.country}</span>
                </span>
              </li>
            </ul>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full touch-manipulation items-center justify-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary transition [-webkit-tap-highlight-color:transparent] hover:bg-primary/10 active:scale-95 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {c.whatsapp}
            </a>
          </div>
        </div>

        {/* FEATURES BAR */}
        <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 sm:p-8 lg:grid-cols-4">
          {c.features.map(({ Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-white">{title}</span>
                <span className="text-xs text-[#9b9689]">{subtitle}</span>
              </span>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-center text-xs text-[#9b9689] sm:mt-10 sm:flex-row sm:justify-between sm:pt-8 sm:text-left">
          <p>
            © {year} Access Prestige Taxi. {c.rights}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {c.legal.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="touch-manipulation transition [-webkit-tap-highlight-color:transparent] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ key, href, label, Icon }) => (
              <a
                key={key}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border border-primary/40 text-primary transition [-webkit-tap-highlight-color:transparent] hover:bg-primary/10"
              >
                {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : <span className="text-xs font-bold">G</span>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * SiteFooter — same design as Footer, wrapped with the route-based
 * visibility rule (hidden on back-office / auth / tracking screens).
 */
export function SiteFooter() {
  const { pathname } = useLocation();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/tracking") ||
    pathname.startsWith("/chauffeur") ||
    pathname.startsWith("/lovable") ||
    pathname.startsWith("/email")
  ) {
    return null;
  }

  return <Footer />;
}

export default Footer;
