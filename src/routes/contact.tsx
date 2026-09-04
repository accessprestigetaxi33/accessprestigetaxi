import { socialImageMeta } from "@/lib/og";
import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, HeartPulse } from "lucide-react";
import { useT, useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { ContactForm } from "@/components/ContactForm";
import heroLogoAsset from "@/assets/apt-logo-lockup.webp.asset.json";
const heroLogo = heroLogoAsset.url;

const CONTACT_EMAIL = "accessprestigetaxi@gmail.com";
const CONTACT_TITLE = "Contact taxi Marennes, Oléron & Charente-Maritime";
const CONTACT_DESC =
  "Contactez votre taxi à Marennes, sur l'île d'Oléron et en Charente-Maritime : 06 03 44 48 63, accessprestigetaxi@gmail.com. Transport sanitaire avec fauteuil roulant, toutes distances, Charente-Maritime.";
const CONTACT_URL = "https://www.accessprestigetaxi.fr/contact";

export const Route = createFileRoute("/contact")({
  head: ({ match }) => ({
    meta: [
      keywordsMeta(["numéro taxi Marennes", "téléphone taxi île d'Oléron", "contact taxi Charente-Maritime"]),
      { title: CONTACT_TITLE },
      { name: "description", content: CONTACT_DESC },
      { property: "og:title", content: CONTACT_TITLE },
      { property: "og:description", content: CONTACT_DESC },
      { property: "og:url", content: CONTACT_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: CONTACT_TITLE },
      { name: "twitter:description", content: CONTACT_DESC },
      ...socialImageMeta(CONTACT_TITLE),
    ],
    links: seoLinks("/contact", match.search),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          additionalType: "https://schema.org/TaxiService",
          name: "Access Prestige Taxi",
          slogan: "L'excellence à chaque trajet",
          url: CONTACT_URL,
          telephone: DRIVERS.map((d) => d.intl),
          email: CONTACT_EMAIL,
          areaServed: { "@type": "AdministrativeArea", name: "Charente-Maritime" },
          knowsAbout: ["Transport sanitaire avec fauteuil roulant", "Prestations toutes distances"],
        }),
      },
    ],
  }),
  component: ContactPage,
});

const COPY = {
  fr: {
    back: "Retour au site",
    whatsappTitle: "WhatsApp",
    whatsappHeadline: "Discutons sur WhatsApp",
    whatsappSub: "Messagerie instantanée",
    zoneTitle: "Zone d'intervention",
    zoneMain: "Charente-Maritime",
    zoneSub: "Tout le département (17) et au-delà",
    zoneLong: "Toutes distances : France et Europe, pour tous types de prestations.",
    cmuTitle: "Transport sanitaire conventionné",
    cmuText:
      "Consultations, hospitalisations, dialyses, chimiothérapies : prise en charge conventionnée sur prescription médicale.",
    badge: "20 ans d'expérience",
  },
  en: {
    back: "Back to website",
    whatsappTitle: "WhatsApp",
    whatsappHeadline: "Chat with us on WhatsApp",
    whatsappSub: "Instant messaging",
    zoneTitle: "Service area",
    zoneMain: "Charente-Maritime",
    zoneSub: "The whole area (17) and beyond",
    zoneLong: "All distances: anywhere in France and Europe, for every type of journey.",
    cmuTitle: "Approved medical transport",
    cmuText:
      "Appointments, hospital stays, dialysis, chemotherapy: covered medical transport with a doctor's prescription.",
    badge: "20 years of experience",
  },
} as const;

// Ornement laurier — remplace les chevrons ❯❮ autour du badge d'expérience,
// pour matcher le rendu de la maquette (petit rameau doré symétrique).
function Laurel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={className}>
      <path d="M21 3c-5 1-10 5-11 12" strokeLinecap="round" />
      <path
        d="M14 5.6c-1.3.5-2.2 1.5-2.5 2.6M12.6 8.9c-1.3.5-2.2 1.4-2.6 2.5M11.2 12.2c-1.2.5-2.1 1.4-2.5 2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Logo WhatsApp — icône de marque, distincte du style doré des autres
// cartes (fond vert #25D366 + glyphe blanc), conforme à la maquette.
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.5-.3z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.3c1.4.8 3.1 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3C4.4 15 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8.2-8 8.2z" />
    </svg>
  );
}

function ContactPage() {
  const t = useT();
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const first = DRIVERS[0]!;
  const cards = [
    {
      icon: Phone,
      label: "Appelez-nous",
      main: first.display,
      sub: "Disponible 24h/24 – 7j/7",
      href: `tel:${first.tel}`,
    },
    {
      icon: MessageCircle,
      label: c.whatsappTitle,
      main: c.whatsappHeadline,
      sub: "Réponse rapide",
      href: `https://wa.me/${first.intl.replace("+", "")}`,
    },
    {
      icon: Mail,
      label: "E-Mail",
      main: CONTACT_EMAIL,
      sub: "Nous vous répondons rapidement",
      href: `mailto:${CONTACT_EMAIL}`,
    },
    { icon: MapPin, label: c.zoneTitle, main: c.zoneMain, sub: c.zoneSub, href: "#" },
  ];
  return (
    <main className="px-3 py-5 text-white sm:px-6">
      <Link
        to="/"
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d6a83d]/45 bg-[#07101a] px-3 py-1.5 text-[12px] font-semibold text-[#e8bd5d] transition hover:bg-[#111b26]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {c.back}
      </Link>
      <section className="overflow-hidden rounded-[30px] bg-[#030a13] p-4 shadow-[0_0_40px_rgba(214,168,61,.08)]">
        <div className="pt-3 text-center">
          <span className="inline-block rounded-full border border-[#d6a83d]/45 px-3 py-1 text-[10px] font-bold tracking-wider text-[#e8bd5d]">
            CONTACTEZ-NOUS
          </span>
          <h1 className="mt-5 font-display text-[31px] leading-none text-[#f4efe5]">À votre écoute</h1>
          <div className="mt-5 flex items-center justify-center gap-2 text-[16px] tracking-wide text-[#e8bd5d]">
            <Laurel className="h-4 w-4" />
            <span>20 ans d’expérience</span>
            <Laurel className="h-4 w-4 -scale-x-100" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {cards.map(({ icon: Icon, label, main, sub, href }) => {
            const isWhatsapp = label === c.whatsappTitle;
            return (
              <a
                key={label}
                href={href}
                className="flex min-h-[74px] items-center gap-3 rounded-xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-3 text-left"
              >
                <span
                  className={
                    isWhatsapp
                      ? "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#25D366] bg-[#07101a]"
                      : "grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#d6a83d]/40 bg-[#111b25]"
                  }
                >
                  {isWhatsapp ? (
                    <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
                  ) : (
                    <Icon className="h-7 w-7 text-[#e8bd5d]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold text-[#e8bd5d]">{label}</span>
                  <span className="mt-1 block break-all text-[13px] text-white/90">{main}</span>
                  <span className="mt-1 block text-[10px] text-white/60">{sub}</span>
                </span>
                <span className="text-[#e8bd5d]">›</span>
              </a>
            );
          })}
        </div>
        <section className="mt-3 flex gap-4 rounded-xl border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] p-4">
          <HeartPulse className="mt-1 h-8 w-8 shrink-0 text-[#e8bd5d]" />
          <div>
            <h2 className="font-display text-[17px] text-[#e8bd5d]">{c.cmuTitle}</h2>
            <p className="mt-2 text-[11px] leading-5 text-white/70">{c.cmuText}</p>
          </div>
        </section>
        <a
          href="#contact-form"
          className="mt-3 flex min-h-11 items-center justify-center rounded-lg border border-[#d6a83d]/45 bg-[linear-gradient(145deg,#111b26,#07101a)] text-[11px] font-extrabold text-[#e8bd5d]"
        >
          ÉCRIRE UN MESSAGE
        </a>
        <div id="contact-form" className="mt-4">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
