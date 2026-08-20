import { createFileRoute } from "@tanstack/react-router";
import { BookingStudio } from "@/components/BookingStudio";
import { SocialMetaSync } from "@/components/SocialMetaSync";
import { useI18n } from "@/i18n/I18nProvider";
import { SITE_URL, seoLinks } from "@/lib/seo-hreflang";
import { ogImageUrl } from "@/lib/og";
import { businessRef, localBusinessNode } from "@/lib/business";
import ogReserverFr from "@/assets/apt-og-reserver-fr.jpg.asset.json";
import ogReserverEn from "@/assets/apt-og-reserver-en.jpg.asset.json";

const RESERVER_TITLE_FR = "Réserver un taxi en Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC_FR =
  "Réservez votre taxi en Charente-Maritime en 60 secondes : adresse, heure, passagers. Tarif calculé en direct, confirmation immédiate et suivi en temps réel.";
const RESERVER_TITLE_EN = "Book a taxi in Charente-Maritime — Access Prestige Taxi";
const RESERVER_DESC_EN =
  "Book your taxi in Charente-Maritime in 60 seconds: address, time, passengers. Live fare calculation, instant confirmation and real-time tracking.";
const RESERVER_URL = `${SITE_URL}/reserver`;

const OG_IMAGE_FR = ogImageUrl(ogReserverFr.url);
const OG_IMAGE_EN = ogImageUrl(ogReserverEn.url);
const OG_IMAGE_W = "1200";
const OG_IMAGE_H = "630";
const OG_ALT_FR =
  "Access Prestige Taxi — réservez votre taxi en Charente-Maritime, BMW iX1 et Audi Q6 électriques 5 places, van Mercedes 8 places";
const OG_ALT_EN =
  "Access Prestige Taxi — book your taxi in Charente-Maritime, 5-seat electric BMW iX1 and Audi Q6, 8-seat Mercedes van";

const RESERVER_SOCIAL_FR = {
  title: RESERVER_TITLE_FR,
  description: RESERVER_DESC_FR,
  image: OG_IMAGE_FR,
  alt: OG_ALT_FR,
  url: RESERVER_URL,
};
const RESERVER_SOCIAL_EN = {
  title: RESERVER_TITLE_EN,
  description: RESERVER_DESC_EN,
  image: OG_IMAGE_EN,
  alt: OG_ALT_EN,
  url: `${RESERVER_URL}?lang=en`,
};

export const Route = createFileRoute("/reserver")({
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | "fr" } => ({
    lang:
      search["lang"] === "en"
        ? ("en" as const)
        : search["lang"] === "fr"
          ? ("fr" as const)
          : undefined,
  }),
  head: (ctx: { match?: { search?: { lang?: "en" | "fr" } } }) => {
    const isEn = ctx?.match?.search?.lang === "en";
    const title = isEn ? RESERVER_TITLE_EN : RESERVER_TITLE_FR;
    const desc = isEn ? RESERVER_DESC_EN : RESERVER_DESC_FR;
    const image = isEn ? OG_IMAGE_EN : OG_IMAGE_FR;
    const alt = isEn ? OG_ALT_EN : OG_ALT_FR;

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:site_name", content: "Access Prestige Taxi" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: isEn ? `${RESERVER_URL}?lang=en` : RESERVER_URL },
        { property: "og:type", content: "website" },
        { property: "og:image", content: image },
        { property: "og:image:secure_url", content: image },
        { property: "og:image:width", content: OG_IMAGE_W },
        { property: "og:image:height", content: OG_IMAGE_H },
        { property: "og:image:alt", content: alt },
        { property: "og:locale", content: isEn ? "en_GB" : "fr_FR" },
        { property: "og:locale:alternate", content: isEn ? "fr_FR" : "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: alt },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
        },
        { name: "theme-color", content: "#F5F0E6" },
      ],
      links: seoLinks("/reserver", ctx?.match?.search),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              localBusinessNode(),
              {
                "@type": "WebPage",
                "@id": `${RESERVER_URL}#webpage`,
                url: RESERVER_URL,
                name: RESERVER_TITLE_FR,
                description: RESERVER_DESC_FR,
                inLanguage: "fr-FR",
                isPartOf: { "@id": `${SITE_URL}/#website` },
                about: businessRef,
                primaryImageOfPage: OG_IMAGE_FR,
                workTranslation: {
                  "@type": "WebPage",
                  url: `${RESERVER_URL}?lang=en`,
                  name: RESERVER_TITLE_EN,
                  description: RESERVER_DESC_EN,
                  inLanguage: "en-GB",
                  primaryImageOfPage: OG_IMAGE_EN,
                },
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: `${SITE_URL}/`,
                name: "Access Prestige Taxi",
                inLanguage: ["fr-FR", "en-GB"],
                publisher: businessRef,
              },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TaxiService",
            "@id": `${SITE_URL}/#taxiservice`,
            name: "Access Prestige Taxi",
            url: RESERVER_URL,
            description: RESERVER_DESC_FR,
            alternateName: RESERVER_TITLE_EN,
            areaServed: [
              { "@type": "AdministrativeArea", name: "Charente-Maritime" },
              { "@type": "Country", name: "France" },
            ],
            availableLanguage: ["fr", "en"],
            provider: businessRef,
            potentialAction: {
              "@type": "ReserveAction",
              name: "Réserver un taxi",
              target: {
                "@type": "EntryPoint",
                urlTemplate: RESERVER_URL,
                inLanguage: ["fr", "en"],
                actionPlatform: [
                  "https://schema.org/DesktopWebPlatform",
                  "https://schema.org/MobileWebPlatform",
                ],
              },
              result: { "@type": "Reservation", name: "Réservation de course en taxi" },
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${SITE_URL}/reserver#faq`,
            mainEntity: [
              {
                "@type": "Question",
                name: "Comment réserver un taxi chez Access Prestige Taxi ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sur la page Réserver, indiquez votre adresse de départ, votre destination, l'heure et le nombre de passagers : le tarif estimé s'affiche en direct, puis vous confirmez la course en un clic.",
                },
              },
              {
                "@type": "Question",
                name: "La réservation en ligne est-elle immédiate ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui. Dès la validation du formulaire, la course est enregistrée, le chauffeur est notifié et vous recevez immédiatement votre lien de suivi en temps réel.",
                },
              },
              {
                "@type": "Question",
                name: "Comment le prix de la course est-il calculé ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Le tarif estimé combine la prise en charge et le prix au kilomètre, avec un tarif jour (07h-19h) et un tarif nuit. La distance, la durée et le détail du calcul s'affichent en direct avant confirmation.",
                },
              },
              {
                "@type": "Question",
                name: "Y a-t-il une limite de distance ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Non. Nous assurons toutes distances, y compris les longs trajets au départ ou à destination de la Charente-Maritime.",
                },
              },
              {
                "@type": "Question",
                name: "Proposez-vous des sièges bébé et le transport de groupe ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui. Sièges bébé et rehausseurs enfants sont disponibles sur demande, et le van Mercedes permet de transporter jusqu'à 7 passagers avec leurs bagages.",
                },
              },
              {
                "@type": "Question",
                name: "Assurez-vous le transport sanitaire conventionné ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui, nous sommes conventionnés pour le transport sanitaire, y compris avec fauteuil roulant : consultations, hospitalisations, dialyses et examens médicaux.",
                },
              },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Réserver", item: RESERVER_URL },
            ],
          }),
        },
      ],
    };
  },
  component: ReserverPage,
});

function ReserverPage() {
  const { lang } = useI18n();
  return (
    <>
      <SocialMetaSync
        lang={lang === "en" ? "en" : "fr"}
        fr={RESERVER_SOCIAL_FR}
        en={RESERVER_SOCIAL_EN}
      />
      <BookingStudio />
    </>
  );
}
