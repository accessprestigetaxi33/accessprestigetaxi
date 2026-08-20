import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { BadgeCheck, FileText, MapPin, Phone, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";

const SITE = "https://www.accessprestigetaxi.fr";
const TITLE = "Sécurité & mentions légales — Access Prestige Taxi";
const DESC =
  "Chauffeurs de taxi agréés, véhicules assurés tous risques, suivi de course en temps réel : toutes nos garanties de sécurité et nos mentions légales en Charente-Maritime.";

export const Route = createFileRoute("/securite")({
  head: ({ match }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/securite` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...socialImageMeta(TITLE),
    ],
    links: seoLinks("/securite", match.search),
  }),
  component: SecuritePage,
});

const COPY = {
  fr: {
    eyebrow: "Garanties",
    h1: "Sécurité & mentions légales",
    lead:
      "Cette page est tenue à jour par Patricia et Alain, chauffeurs d'Access Prestige Taxi. Elle décrit concrètement les garanties appliquées à chaque course en Charente-Maritime.",
    pillars: [
      {
        icon: BadgeCheck,
        t: "Chauffeurs agréés",
        d: "Carte professionnelle de conducteur de taxi en cours de validité et autorisation de stationnement départementale pour nos deux chauffeurs. Permis vérifié et visite médicale à jour.",
      },
      {
        icon: ShieldCheck,
        t: "Assurance transport de personnes",
        d: "Les véhicules sont assurés tous risques avec garantie spécifique transport de personnes à titre onéreux. Entretien constructeur, contrôles réguliers et pneumatiques suivis.",
      },
      {
        icon: Clock,
        t: "Suivi en temps réel",
        d: "Chaque réservation confirmée génère un lien de suivi personnel : statut reçu, chauffeur assigné, en route, terminé. Vous pouvez le partager avec un proche.",
      },
      {
        icon: Sparkles,
        t: "Véhicules 100 % électriques",
        d: "BMW iX1 et Audi Q6 e-tron électriques 5 places, van Mercedes 8 places : aides à la conduite et habitacle nettoyé entre chaque client.",
      },
    ],
    childTitle: "Enfants, mobilité réduite et animaux",
    childText:
      "Sièges enfant et rehausseurs fournis gratuitement sur demande à la réservation. Aide à la montée et à la descente pour les personnes à mobilité réduite. Animaux acceptés en caisse de transport, chiens guides sans condition.",
    dataTitle: "Vos données",
    dataText:
      "Nous collectons uniquement les informations nécessaires à la réalisation de la course (nom, téléphone, e-mail, adresses, date) et à la facturation. Elles ne sont ni revendues ni utilisées à des fins publicitaires.",
    reviewTitle: "Avis clients : comment ils sont publiés",
    reviewText:
      "Les avis déposés sur le site sont d'abord mis en attente. Patricia et Alain les relisent depuis leur espace chauffeur : un avis peut être publié, refusé ou signalé s'il est manifestement abusif. Seuls les avis publiés apparaissent sur la page d'accueil, avec leur note d'origine, sans modification du texte.",
    legalTitle: "Mentions légales",
    legalRows: [
      ["Service", "Access Prestige Taxi — taxi de tourisme, deux chauffeurs indépendants"],
      ["Zone", "Charente-Maritime (17), longue distance toute France"],
      ["Contact", "accessprestigetaxi@gmail.com"],
      ["Tarifs", "Tarifs préfectoraux affichés au compteur, estimation ferme communiquée avant la course"],
      ["Réclamation", "Par e-mail ou téléphone, réponse sous 48 h ouvrées"],
    ],
    more: "Voir aussi",
    legalLink: "Mentions légales",
    privacyLink: "Confidentialité",
    destinationsLink: "Destinations",
    cta: "Réserver une course",
  },
  en: {
    eyebrow: "Guarantees",
    h1: "Safety & legal information",
    lead:
      "This page is maintained by Patricia and Alain, the two Access Prestige Taxi drivers. It sets out the guarantees applied to every ride in Charente-Maritime.",
    pillars: [
      {
        icon: BadgeCheck,
        t: "Licensed drivers",
        d: "Valid professional taxi driver cards and departmental operating permits for both drivers, with up-to-date licences and medical checks.",
      },
      {
        icon: ShieldCheck,
        t: "Passenger transport insurance",
        d: "Both vehicles carry fully comprehensive cover including paid passenger transport. Manufacturer servicing, regular checks and monitored tyres.",
      },
      {
        icon: Clock,
        t: "Real-time tracking",
        d: "Every confirmed booking creates a personal tracking link: received, driver assigned, on the way, completed. Share it with a relative if you wish.",
      },
      {
        icon: Sparkles,
        t: "Fully electric fleet",
        d: "Electric 5-seat BMW iX1 and Audi Q6 e-tron, plus an 8-seat Mercedes van: driver assistance systems and a cabin cleaned between every passenger.",
      },
    ],
    childTitle: "Children, reduced mobility and pets",
    childText:
      "Child seats and boosters provided free on request at booking. Assistance getting in and out for passengers with reduced mobility. Pets accepted in a carrier; guide dogs always welcome.",
    dataTitle: "Your data",
    dataText:
      "We only collect what the ride and the invoice require (name, phone, email, addresses, date). Nothing is sold or used for advertising.",
    reviewTitle: "How client reviews are published",
    reviewText:
      "Reviews submitted on the site are held for moderation. Patricia and Alain review them from the driver area: a review can be published, rejected or flagged when clearly abusive. Only published reviews appear on the homepage, with their original rating and unedited text.",
    legalTitle: "Legal information",
    legalRows: [
      ["Service", "Access Prestige Taxi — licensed taxi, two independent drivers"],
      ["Area", "Charente-Maritime (17), long distance nationwide"],
      ["Contact", "accessprestigetaxi@gmail.com"],
      ["Fares", "Prefecture-regulated meter fares; a firm estimate is given before the ride"],
      ["Complaints", "By email or phone, answered within 48 working hours"],
    ],
    more: "See also",
    legalLink: "Legal notice",
    privacyLink: "Privacy",
    destinationsLink: "Destinations",
    cta: "Book a ride",
  },
} as const;

function SecuritePage() {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl md:text-5xl">{c.h1}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {c.pillars.map((p) => (
          <div key={p.t} className="rounded-2xl border border-border bg-card p-5">
            <p.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold">{p.t}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.childTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.childText}</p>
      </section>

      <section id="avis" className="mt-10 scroll-mt-24 rounded-2xl border border-primary/30 bg-card p-6">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.reviewTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.reviewText}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.dataTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.dataText}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.legalTitle}</h2>
        <dl className="mt-4 divide-y divide-border rounded-2xl border border-border">
          {c.legalRows.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr]">
              <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{k}</dt>
              <dd className="text-sm text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          {DRIVERS.map((d) => (
            <a
              key={d.tel}
              href={`tel:${d.intl}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:border-primary/60"
            >
              <Phone className="h-4 w-4 text-primary" /> {d.name} · {d.display}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.more}</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/mentions-legales" className="inline-flex items-center gap-2 text-primary underline">
            <FileText className="h-4 w-4" /> {c.legalLink}
          </Link>
          <Link to="/confidentialite" className="inline-flex items-center gap-2 text-primary underline">
            <ShieldCheck className="h-4 w-4" /> {c.privacyLink}
          </Link>
          <Link to="/destinations" className="inline-flex items-center gap-2 text-primary underline">
            <MapPin className="h-4 w-4" /> {c.destinationsLink}
          </Link>
        </div>
        <Link
          to="/reserver"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
        >
          {c.cta}
        </Link>
      </section>
    </div>
  );
}
