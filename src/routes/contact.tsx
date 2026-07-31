import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { useT, useI18n } from "@/i18n/I18nProvider";

const CONTACT_TITLE = "Contact : Access Prestige Taxi";
const CONTACT_DESC =
  "Contactez Access Prestige Taxi : 06 50 26 00 15, taxi.city033@gmail.com. Interventions en Charente & Charente-Maritime.";
const CONTACT_URL = "https://accessprestigetaxi.lovable.app/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: CONTACT_TITLE },
      { name: "description", content: CONTACT_DESC },
      { property: "og:title", content: CONTACT_TITLE },
      { property: "og:description", content: CONTACT_DESC },
      { property: "og:url", content: CONTACT_URL },
      { property: "og:type", content: "website" },
    ],
    links: seoLinks("/contact"),
  }),
  component: ContactPage,
});

const COPY = {
  fr: {
    whatsappTitle: "WhatsApp",
    whatsappHeadline: "Discutons sur WhatsApp",
    whatsappSub: "Messagerie instantanée",
    zoneTitle: "Zone d'intervention",
    zoneMain: "Charente & Charente-Maritime",
    zoneSub: "Tout le département (16 & 17)",
    zoneLong: "Longues distances sur toute la France et en Europe sur réservation.",
  },
  en: {
    whatsappTitle: "WhatsApp",
    whatsappHeadline: "Chat with us on WhatsApp",
    whatsappSub: "Instant messaging",
    zoneTitle: "Service area",
    zoneMain: "Charente & Charente-Maritime",
    zoneSub: "The whole area (16 & 17)",
    zoneLong: "Long-distance trips throughout France and Europe by reservation.",
  },
} as const;

function ContactPage() {
  const t = useT();
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-14 md:py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("contact.eyebrow")}</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">{t("contact.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">{t("contact.intro")}</p>
      </div>

      {/* Contact cards: 1-col on mobile, 2-col on md */}
      <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
        <a
          href="tel:0650260015"
          className="group flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary sm:flex-col sm:items-start sm:p-6"
        >
          <Phone className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{t("contact.phone")}</h2>
            <p className="text-xl font-bold text-primary sm:mt-1 sm:text-2xl">06 50 26 00 15</p>
            <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{t("contact.phone.sub")}</p>
          </div>
        </a>

        <a
          href="https://wa.me/33650260015"
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
          href="mailto:taxi.city033@gmail.com"
          className="group flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary sm:flex-col sm:items-start sm:p-6"
        >
          <Mail className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{t("contact.email")}</h2>
            <p className="break-all font-semibold sm:mt-1 sm:text-base">taxi.city033@gmail.com</p>
            <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{t("contact.email.sub")}</p>
          </div>
        </a>

        <div className="flex flex-row items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-col sm:items-start sm:p-6">
          <MapPin className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
          <div>
            <h2 className="font-display text-lg font-semibold sm:mt-3 sm:text-xl">{c.zoneTitle}</h2>
            <p className="font-semibold sm:mt-1">{c.zoneMain}</p>
            <p className="text-sm text-muted-foreground">{c.zoneSub}</p>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2">
              {c.zoneLong}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-primary/30 bg-card p-4 text-center sm:mt-8 sm:p-5">
        <Clock className="mx-auto h-6 w-6 text-primary sm:h-7 sm:w-7" />
        <p className="mt-2 font-display text-base font-semibold sm:text-lg">{t("common.available_247")}</p>
      </div>
    </div>
  );
}
