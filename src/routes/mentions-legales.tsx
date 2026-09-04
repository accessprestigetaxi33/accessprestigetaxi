import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { useI18n } from "@/i18n/I18nProvider";

const SITE = "https://www.accessprestigetaxi.fr";
const URL = `${SITE}/mentions-legales`;
const TITLE_FR = "Mentions légales — Access Prestige Taxi";
const DESC_FR =
  "Mentions légales d'Access Prestige Taxi : éditeur du site, hébergement, propriété intellectuelle et contact.";

export const Route = createFileRoute("/mentions-legales")({
  head: ({ match }) => ({
    meta: [
      { title: TITLE_FR },
      { name: "description", content: DESC_FR },
      { property: "og:title", content: TITLE_FR },
      { property: "og:description", content: DESC_FR },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE_FR },
      { name: "twitter:description", content: DESC_FR },
      ...socialImageMeta(TITLE_FR),
      { name: "robots", content: "index,follow" },
    ],
    links: seoLinks("/mentions-legales", match.search),
  }),
  component: MentionsLegalesPage,
});

const COPY = {
  fr: {
    eyebrow: "Informations légales",
    h1: "Mentions légales",
    updated: "Dernière mise à jour",
    publisherTitle: "Éditeur du site",
    publisherIntro: (
      <>Le site <strong>accessprestigetaxi.fr</strong> est édité par&nbsp;:</>
    ),
    publisherItems: [
      <><strong>Access Prestige Taxi</strong> — Patricia & Alain, artisans taxi indépendants</>,
      <>Zone d'activité&nbsp;: Charente-Maritime (17), France</>,
      <>Téléphone&nbsp;: <a href="tel:+33650260015" className="text-primary hover:underline">06 50 26 00 15</a> (Patricia) ·{" "}
        <a href="tel:+33603444863" className="text-primary hover:underline">06 03 44 48 63</a> (Alain)</>,
      <>Email&nbsp;: <a href="mailto:accessprestigetaxi@gmail.com" className="text-primary hover:underline">accessprestigetaxi@gmail.com</a></>,
      <>Numéro ADS / Carte professionnelle&nbsp;: disponible sur demande</>,
    ],
    publisherDirTitle: "Directeur de la publication",
    publisherDirText: "Le responsable de la publication est l'exploitant d'Access Prestige Taxi.",
    hostingTitle: "Hébergement",
    hostingText: (
      <>Le site est hébergé par <strong>Cloudflare, Inc.</strong> — 101 Townsend Street, San Francisco, CA 94107, USA.</>
    ),
    ipTitle: "Propriété intellectuelle",
    ipText:
      "L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes, code source) est protégé par le droit d'auteur. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite.",
    liabilityTitle: "Responsabilité",
    liabilityText:
      "Les informations diffusées (tarifs, disponibilités, estimations) sont indicatives. Le compteur taxi homologué fait foi pour la facturation finale conformément à la réglementation en vigueur (arrêtés préfectoraux de la Charente et de la Charente-Maritime).",
    contactTitle: "Contact",
    contactText: (
      <>
        Pour toute question relative au site ou à nos services, vous pouvez nous joindre via la page{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact</Link>.
      </>
    ),
  },
  en: {
    eyebrow: "Legal information",
    h1: "Legal Notice",
    updated: "Last updated",
    publisherTitle: "Website publisher",
    publisherIntro: (
      <>The website <strong>accessprestigetaxi.fr</strong> is published by:</>
    ),
    publisherItems: [
      <><strong>Access Prestige Taxi</strong> — Patricia & Alain, independent licensed taxi drivers</>,
      <>Service area: Charente-Maritime (17), France</>,
      <>Phone: <a href="tel:+33650260015" className="text-primary hover:underline">06 50 26 00 15</a> (Patricia) ·{" "}
        <a href="tel:+33603444863" className="text-primary hover:underline">06 03 44 48 63</a> (Alain)</>,
      <>Email: <a href="mailto:accessprestigetaxi@gmail.com" className="text-primary hover:underline">accessprestigetaxi@gmail.com</a></>,
      <>Operating licence / professional card: available on request</>,
    ],
    publisherDirTitle: "Publication director",
    publisherDirText: "The person responsible for publication is the operator of Access Prestige Taxi.",
    hostingTitle: "Hosting",
    hostingText: (
      <>The website is hosted by <strong>Cloudflare, Inc.</strong> — 101 Townsend Street, San Francisco, CA 94107, USA.</>
    ),
    ipTitle: "Intellectual property",
    ipText:
      "All content on this website (text, images, logos, graphics, source code) is protected by copyright. Any reproduction, representation, modification or use, in whole or in part, without prior written permission is prohibited.",
    liabilityTitle: "Liability",
    liabilityText:
      "The information published (fares, availability, estimates) is provided for guidance only. The approved taxi meter is authoritative for final billing, in accordance with applicable regulations (prefectoral orders for Charente-Maritime).",
    contactTitle: "Contact",
    contactText: (
      <>
        For any question about the website or our services, you can reach us via the{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact</Link> page.
      </>
    ),
  },
} as const;

function MentionsLegalesPage() {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{c.h1}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {c.updated}&nbsp;: {new Date().toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}
      </p>

      <section className="prose prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed sm:text-base">
        <div>
          <h2 className="font-display text-xl font-semibold">{c.publisherTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.publisherIntro}</p>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            {c.publisherItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.publisherDirTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.publisherDirText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.hostingTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.hostingText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.ipTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.ipText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.liabilityTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.liabilityText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.contactTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.contactText}</p>
        </div>
      </section>
    </div>
  );
}
