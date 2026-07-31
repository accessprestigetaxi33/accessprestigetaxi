import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

const SITE = "https://accessprestigetaxi.lovable.app";
const URL = `${SITE}/confidentialite`;
const TITLE_FR = "Politique de confidentialité — Access Prestige Taxi";
const TITLE_EN = "Privacy Policy — Access Prestige Taxi";
const DESC_FR =
  "Politique de confidentialité Access Prestige Taxi : données collectées, finalités, durée de conservation et droits RGPD.";
const DESC_EN =
  "Access Prestige Taxi privacy policy: data collected, purposes, retention periods and your GDPR rights.";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: TITLE_FR },
      { name: "description", content: DESC_FR },
      { property: "og:title", content: TITLE_FR },
      { property: "og:description", content: DESC_FR },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index,follow" },
    ],
    links: seoLinks("/confidentialite"),
  }),
  component: ConfidentialitePage,
});

const COPY = {
  fr: {
    eyebrow: "RGPD",
    h1: "Politique de confidentialité",
    updated: "Dernière mise à jour",
    controller: {
      title: "Responsable du traitement",
      body: (
        <>
          <strong>Access Prestige Taxi</strong> — Patricia & Alain, chauffeurs de taxi indépendants, Charente (16) et
          Charente-Maritime (17), France.
          <br />
          Contact&nbsp;: <a href="mailto:taxipatricia@gmail.com" className="text-primary hover:underline">taxipatricia@gmail.com</a>
        </>
      ),
    },
    dataTitle: "Données collectées",
    dataItems: [
      <><strong>Réservation</strong>&nbsp;: nom, prénom, téléphone, email, adresses de départ et d'arrivée, date et heure.</>,
      <><strong>Contact</strong>&nbsp;: nom, email, téléphone (facultatif), message.</>,
      <><strong>Suivi GPS</strong>&nbsp;: position du véhicule en temps réel pendant la course (visible uniquement par le client concerné).</>,
      <><strong>Mesure d'audience</strong>&nbsp;: visites anonymes (identifiant de session local, pas de cookies tiers).</>,
    ],
    purposeTitle: "Finalités",
    purposeItems: [
      "Traiter votre demande de réservation et vous contacter.",
      "Assurer le suivi du véhicule en temps réel pendant votre trajet.",
      "Améliorer la qualité du service (statistiques agrégées).",
      "Respecter nos obligations légales (facturation, comptabilité).",
    ],
    legalBasisTitle: "Base légale",
    legalBasisText:
      "Exécution du contrat de transport (article 6.1.b RGPD), consentement pour le suivi GPS et la mesure d'audience, et obligation légale pour la conservation comptable.",
    retentionTitle: "Durée de conservation",
    retentionItems: [
      "Réservations actives\u00a0: 12 mois.",
      "Données comptables\u00a0: 10 ans (obligation légale).",
      "Position GPS\u00a0: supprimée à la fin de la course.",
      "Messages de contact\u00a0: 24 mois.",
    ],
    recipientsTitle: "Destinataires",
    recipientsText: (
      <>
        Vos données ne sont jamais revendues. Elles sont accessibles uniquement à Patricia et Alain, exploitants d'Access
        Prestige Taxi, et à nos prestataires techniques (hébergeur, base de données) liés par contrat de sous-traitance
        conforme RGPD.
      </>
    ),
    rightsTitle: "Vos droits",
    rightsIntro: "Vous disposez des droits suivants\u00a0:",
    rightsItems: [
      <>Droit d'accès, de rectification et d'effacement de vos données.</>,
      <>Droit d'opposition et de limitation du traitement.</>,
      <>Droit à la portabilité.</>,
      <>Droit d'introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-primary hover:underline">CNIL</a>.</>,
    ],
    rightsOutro: (
      <>
        Pour exercer vos droits&nbsp;: <a href="mailto:taxipatricia@gmail.com" className="text-primary hover:underline">taxipatricia@gmail.com</a>.
      </>
    ),
    cookiesTitle: "Cookies",
    cookiesText: (
      <>
        Le site n'utilise <strong>aucun cookie publicitaire ni traceur tiers</strong>. Seul un identifiant de session
        anonyme est stocké localement dans votre navigateur pour les statistiques agrégées de fréquentation.
      </>
    ),
    contactTitle: "Contact",
    contactText: (
      <>
        Pour toute question, contactez-nous via la page{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact</Link> ou par email.
      </>
    ),
  },
  en: {
    eyebrow: "GDPR",
    h1: "Privacy Policy",
    updated: "Last updated",
    controller: {
      title: "Data controller",
      body: (
        <>
          <strong>Access Prestige Taxi</strong> — Patricia & Alain, independent licensed taxi drivers, Charente (16) and
          Charente-Maritime (17), France.
          <br />
          Contact: <a href="mailto:taxipatricia@gmail.com" className="text-primary hover:underline">taxipatricia@gmail.com</a>
        </>
      ),
    },
    dataTitle: "Data we collect",
    dataItems: [
      <><strong>Bookings</strong>: name, surname, phone number, email, pickup and drop-off addresses, date and time.</>,
      <><strong>Contact form</strong>: name, email, phone (optional), message.</>,
      <><strong>GPS tracking</strong>: real-time vehicle location during the ride (visible only to the passenger concerned).</>,
      <><strong>Audience measurement</strong>: anonymous visits (local session identifier, no third-party cookies).</>,
    ],
    purposeTitle: "Purposes",
    purposeItems: [
      "Process your booking request and get in touch with you.",
      "Track the vehicle in real time during your journey.",
      "Improve service quality (aggregated statistics).",
      "Comply with our legal obligations (invoicing, accounting).",
    ],
    legalBasisTitle: "Legal basis",
    legalBasisText:
      "Performance of the transport contract (Article 6.1.b GDPR), consent for GPS tracking and audience measurement, and legal obligation for accounting records.",
    retentionTitle: "Retention period",
    retentionItems: [
      "Active bookings: 12 months.",
      "Accounting records: 10 years (legal obligation).",
      "GPS location: deleted at the end of the ride.",
      "Contact messages: 24 months.",
    ],
    recipientsTitle: "Recipients",
    recipientsText: (
      <>
        Your data is never sold. It is only accessible to Patricia and Alain, who run Access Prestige Taxi, and to our
        technical service providers (hosting, database) bound by a GDPR-compliant data processing agreement.
      </>
    ),
    rightsTitle: "Your rights",
    rightsIntro: "You have the following rights:",
    rightsItems: [
      <>The right to access, rectify and erase your data.</>,
      <>The right to object to and restrict processing.</>,
      <>The right to data portability.</>,
      <>The right to lodge a complaint with the <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-primary hover:underline">CNIL</a> (the French data protection authority).</>,
    ],
    rightsOutro: (
      <>
        To exercise your rights: <a href="mailto:taxipatricia@gmail.com" className="text-primary hover:underline">taxipatricia@gmail.com</a>.
      </>
    ),
    cookiesTitle: "Cookies",
    cookiesText: (
      <>
        The site uses <strong>no advertising cookies and no third-party trackers</strong>. Only an anonymous session
        identifier is stored locally in your browser for aggregated visit statistics.
      </>
    ),
    contactTitle: "Contact",
    contactText: (
      <>
        For any question, please contact us via the{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact</Link> page or by email.
      </>
    ),
  },
} as const;

function ConfidentialitePage() {
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
          <h2 className="font-display text-xl font-semibold">{c.controller.title}</h2>
          <p className="mt-2 text-muted-foreground">{c.controller.body}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.dataTitle}</h2>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            {c.dataItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.purposeTitle}</h2>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            {c.purposeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.legalBasisTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.legalBasisText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.retentionTitle}</h2>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            {c.retentionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.recipientsTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.recipientsText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.rightsTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.rightsIntro}</p>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            {c.rightsItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-muted-foreground">{c.rightsOutro}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.cookiesTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.cookiesText}</p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">{c.contactTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.contactText}</p>
        </div>
      </section>
    </div>
  );
}
