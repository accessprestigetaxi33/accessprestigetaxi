import { socialImageMeta } from "@/lib/og";
import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { Phone, Mail, MapPin, MessageCircle, HeartPulse } from "lucide-react";
import { useT, useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { ContactForm } from "@/components/ContactForm";
import heroLogoAsset from "@/assets/apt-logo-lockup.webp.asset.json";
const heroLogo = heroLogoAsset.url;

const CONTACT_EMAIL = "accessprestigetaxi@gmail.com";
const CONTACT_TITLE = "Contact taxi Charente-Maritime — Access Prestige Taxi";
const CONTACT_DESC =
  "Contactez Access Prestige Taxi : 06 03 44 48 63, accessprestigetaxi@gmail.com. Transport sanitaire avec fauteuil roulant, toutes distances, Charente-Maritime.";
const CONTACT_URL = "https://www.accessprestigetaxi.fr/contact";

export const Route = createFileRoute("/contact")({
  head: ({ match }) => ({
    meta: [
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
    <main className="mx-auto max-w-[390px] px-3 py-5 text-white sm:max-w-3xl sm:px-6">
      <section className="overflow-hidden rounded-[30px] border border-[#d6a83d]/70 bg-[#030a13] p-4 shadow-[0_0_40px_rgba(214,168,61,.08)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 pb-4">
          <div>
            <div className="text-[9px] font-bold tracking-[.15em] text-[#e8bd5d]">ACCESS PRESTIGE TAXI</div>
            <div className="mt-1 text-[5px] tracking-[.22em] text-white/60">L'EXCELLENCE À CHAQUE TRAJET</div>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#d6a83d]/40 text-[#e8bd5d]">
            ☰
          </span>
        </div>
        <div className="pt-3 text-center">
          <span className="inline-block rounded-full border border-[#d6a83d]/45 px-3 py-1 text-[10px] font-bold tracking-wider text-[#e8bd5d]">
            CONTACTEZ-NOUS
          </span>
          <h1 className="mt-5 font-display text-[31px] leading-none text-[#f4efe5]">À votre écoute</h1>
          <div className="mt-5 text-[16px] tracking-wide text-[#e8bd5d]">❯ 20 ans d’expérience ❮</div>
        </div>
        <div className="mt-5 space-y-2">
          {cards.map(({ icon: Icon, label, main, sub, href }) => (
            <a
              key={label}
              href={href}
              className="flex min-h-[74px] items-center gap-3 rounded-xl border border-white/20 bg-[linear-gradient(145deg,#111b26,#07101a)] p-3 text-left"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-[#111b25]">
                <Icon className="h-7 w-7 text-[#e8bd5d]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-[#e8bd5d]">{label}</span>
                <span className="mt-1 block break-all text-[13px] text-white/90">{main}</span>
                <span className="mt-1 block text-[10px] text-white/60">{sub}</span>
              </span>
              <span className="text-[#e8bd5d]">›</span>
            </a>
          ))}
        </div>
        <section className="mt-3 flex gap-4 rounded-xl border border-white/20 bg-[linear-gradient(145deg,#111b26,#07101a)] p-4">
          <HeartPulse className="mt-1 h-8 w-8 shrink-0 text-[#e8bd5d]" />
          <div>
            <h2 className="font-display text-[17px] text-[#e8bd5d]">{c.cmuTitle}</h2>
            <p className="mt-2 text-[11px] leading-5 text-white/70">{c.cmuText}</p>
          </div>
        </section>
        <a
          href="#contact-form"
          className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-b from-[#f6cd6b] to-[#cf962a] text-[11px] font-extrabold text-[#181107]"
        >
          ÉCRIRE UN MESSAGE
        </a>
        <div id="contact-form" className="mt-4 rounded-xl border border-white/15 p-2">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
