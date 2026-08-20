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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-14 md:py-16">
      <div className="text-center">
        <img
          src={heroLogo}
          alt="Access Prestige Taxi"
          width={400}
          height={150}
          className="mx-auto h-28 w-auto object-contain sm:h-40 md:h-48"
        />
        <p className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Access <span className="text-primary">Prestige</span> Taxi
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("contact.eyebrow")}</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl md:text-5xl">{t("contact.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">{t("contact.intro")}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {c.badge}
        </span>
      </div>

      {/* Contact cards: 1-col on mobile, 2-col on md */}
      <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
        <a
          href={`tel:${first.tel}`}
          className="group flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary sm:flex-col sm:items-start sm:p-6"
        >
          <Phone className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{t("contact.phone")}</h2>
            {DRIVERS.map((d) => (
              <p key={d.tel} className="text-lg font-bold text-primary sm:mt-1 sm:text-xl">
                <span className="mr-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {d.name}
                </span>
                {d.display}
              </p>
            ))}
            <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{t("contact.phone.sub")}</p>
          </div>
        </a>

        <a
          href={`https://wa.me/${first.intl.replace("+", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary sm:flex-col sm:items-start sm:p-6"
        >
          <MessageCircle className="h-7 w-7 shrink-0 text-green-500 sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{c.whatsappTitle}</h2>
            <p className="font-semibold text-green-500 sm:mt-1 sm:text-lg">{c.whatsappHeadline}</p>
            <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{c.whatsappSub}</p>
          </div>
        </a>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="group flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary sm:flex-col sm:items-start sm:p-6"
        >
          <Mail className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{t("contact.email")}</h2>
            <p className="break-all font-semibold sm:mt-1 sm:text-base">✉️ {CONTACT_EMAIL}</p>
            <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{t("contact.email.sub")}</p>
          </div>
        </a>

        <div className="flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-col sm:items-start sm:p-6">
          <MapPin className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{c.zoneTitle}</h2>
            <p className="font-semibold sm:mt-1">{c.zoneMain}</p>
            <p className="text-sm text-muted-foreground">{c.zoneSub}</p>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2">{c.zoneLong}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-row items-start gap-4 rounded-2xl border border-primary/30 bg-card p-5 sm:mt-6 sm:p-6">
        <HeartPulse className="h-7 w-7 shrink-0 text-primary" />
        <div>
          <h2 className="font-display text-lg font-semibold sm:text-xl">{c.cmuTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{c.cmuText}</p>
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <ContactForm />
      </div>

    </div>
  );
}
