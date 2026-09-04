import { socialImageMeta, ogLangFromSearch, ogPageUrl, absoluteUrl } from "@/lib/og";
import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ShieldCheck, Users, Route as RouteIcon, HelpCircle, FileText } from "lucide-react";
import { useI18n, useT } from "@/i18n/I18nProvider";
import { BulletedList } from "@/components/BulletedList";
import { SERVICE_CARDS_EN, SERVICE_CARDS_FR } from "@/data/services-cards";

const SERVICES_URL = absoluteUrl("/services");

const META = {
  fr: {
    title: "Prestations taxi Marennes, Oléron & Charente-Maritime",
    desc: "Taxi à Marennes, sur l'île d'Oléron et en Charente-Maritime : transport santé conventionné, transferts toutes gares et tous aéroports, mise à disposition avec chauffeur, transport de groupe 8 places et trajets toutes distances, en véhicules électriques.",
  },
  en: {
    title: "Taxi services in Marennes, Oléron & Charente-Maritime",
    desc: "Taxi in Marennes, Oléron island and Charente-Maritime: covered medical transport (wheelchair accessible), transfers to every station and airport, chauffeur hire, 8-seat group transport and all-distance journeys, with electric vehicles.",
  },
} as const;

/** Prestation pré-sélectionnée dans le formulaire /devis pour chaque carte. */
const PRESTATION_BY_CARD: Record<string, string> = {
  sanitaire: "sanitaire",
  transferts: "transfert",
  pro: "mise-a-dispo",
  "mise-a-disposition": "mise-a-dispo",
  groupe: "groupe",
  distances: "longue-distance",
};

const SERVICE_LIST = [
  {
    name: "Transport santé conventionné",
    description: "Transport assis professionnalisé et transport avec fauteuil roulant, conventionné CPAM.",
  },
  {
    name: "Transferts toutes gares et tous aéroports",
    description: "Transferts vers et depuis toutes les gares et tous les aéroports, suivi des vols et des trains.",
  },
  {
    name: "Déplacements professionnels et privés",
    description: "Trajets business, hôtels et campings, discrétion et ponctualité.",
  },
  { name: "Mise à disposition avec chauffeur", description: "Demi-journée, journée complète ou événementiel." },
  { name: "Transport de groupe", description: "Van Mercedes classe V jusqu'à 8 places, bagages volumineux acceptés." },
  { name: "Trajets toutes distances", description: "Longue distance en France et en Europe, sur réservation." },
];

const SERVICES_FAQ = [
  {
    q: "Comment fonctionne le suivi en temps réel de mon vol ou de mon train ?",
    a: "Dès que vous nous communiquez votre numéro de vol ou de train, nous le suivons automatiquement. Si l'arrivée est avancée ou retardée, l'heure de prise en charge est ajustée : vous n'avez rien à faire, le taxi sera là quand vous sortirez.",
  },
  {
    q: "Combien de temps le taxi attend-il après l'atterrissage ?",
    a: "Le taxi se présente après l'atterrissage réel (et non l'horaire prévu). Le temps nécessaire pour récupérer vos bagages et passer la douane est pris en compte. Au-delà, le temps d'attente supplémentaire est facturé au tarif réglementé en vigueur.",
  },
  {
    q: "Comment se passe la prise en charge CPAM / ALD ?",
    a: "Munissez-vous de la prescription médicale de transport remise par votre médecin. Sur présentation de ce bon de transport, nous appliquons le tiers payant : la course est directement prise en charge par l'Assurance Maladie. En ALD, la prise en charge est intégrale et valable pour toutes les distances.",
  },
];

export const Route = createFileRoute("/services")({
  head: ({ match }) => {
    const lang = ogLangFromSearch(match.search as { lang?: string } | undefined);
    const m = META[lang];
    const pageUrl = ogPageUrl("/services", lang);
    return {
      meta: [
        keywordsMeta(["taxi conventionné Marennes", "transport médical île d'Oléron", "taxi 8 places Charente-Maritime", "transfert aéroport Charente-Maritime"]),
        { title: m.title },
        { name: "description", content: m.desc },
        { property: "og:title", content: m.title },
        { property: "og:description", content: m.desc },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: lang === "en" ? "en_GB" : "fr_FR" },
        { property: "og:locale:alternate", content: lang === "en" ? "fr_FR" : "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: m.title },
        { name: "twitter:description", content: m.desc },
        ...socialImageMeta(m.title),
      ],
      links: seoLinks("/services", match.search),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                "@id": `${SERVICES_URL}#faq`,
                mainEntity: SERVICES_FAQ.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "LocalBusiness",
                additionalType: "https://schema.org/TaxiService",
                "@id": "https://www.accessprestigetaxi.fr/#business",
                name: "Access Prestige Taxi",
                url: "https://www.accessprestigetaxi.fr",
                email: "accessprestigetaxi@gmail.com",
                areaServed: { "@type": "AdministrativeArea", name: "Charente-Maritime" },
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  name: "Prestations Access Prestige Taxi",
                  itemListElement: SERVICE_LIST.map((svc) => ({
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: svc.name,
                      description: svc.description,
                      serviceType: svc.name,
                      areaServed: { "@type": "AdministrativeArea", name: "Charente-Maritime" },
                      provider: { "@id": "https://www.accessprestigetaxi.fr/#business" },
                    },
                  })),
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.accessprestigetaxi.fr/" },
                  { "@type": "ListItem", position: 2, name: "Services", item: SERVICES_URL },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: ServicesPage,
});

function ServicesPage() {
  const t = useT();
  const { lang } = useI18n();
  const isEn = lang === "en";
  // Catalogue unique (ex-section "Nos services" de la page d'accueil + détails).
  const services = isEn ? SERVICE_CARDS_EN : SERVICE_CARDS_FR;
  const quoteLabel = isEn ? "Request a quote" : "Demander un devis";
  const quoteForLabel = isEn ? "Request a quote for this service" : "Demander un devis pour cette prestation";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14 md:py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("services.eyebrow")}</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">{t("services.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
          {t("services.intro")}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/devis"
            search={{ prestation: undefined, lang: undefined }}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] active:scale-95 sm:w-auto"
          >
            <FileText className="h-4 w-4" /> {quoteLabel}
          </Link>
          <Link
            to="/reserver"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border px-7 font-semibold transition hover:border-primary/60 sm:w-auto"
          >
            {t("services.cta")}
          </Link>
        </div>
      </div>

      <h2 className="sr-only">{isEn ? "Our services in detail" : "Nos prestations en détail"}</h2>

      <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => {
          const headingId = `svc-${s.id}-title`;
          return (
            <article
              key={s.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/50"
            >
              <img
                src={s.photo}
                alt={s.title}
                loading={i < 3 ? "eager" : "lazy"}
                decoding="async"
                width={1280}
                height={853}
                className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:h-48"
              />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 id={headingId} className="font-display text-lg font-semibold sm:text-xl">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <BulletedList items={s.points} className="mt-4" ariaLabelledBy={headingId} />
                <Link
                  to="/devis"
                  search={{ prestation: PRESTATION_BY_CARD[s.id] ?? "autre", lang: undefined }}
                  aria-label={`${quoteForLabel} : ${s.title}`}
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 self-start rounded-xl border border-primary/50 px-4 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="h-4 w-4" /> {quoteLabel}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Badges: 1-col on mobile, 3-col on md */}
      <div className="mt-10 grid gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4">
        {[
          { icon: RouteIcon, label: t("services.b1") },
          { icon: Users, label: t("services.b2") },
          { icon: ShieldCheck, label: t("services.b3") },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
            <b.icon className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-sm font-medium sm:text-base">{b.label}</span>
          </div>
        ))}
      </div>

      <section className="mt-14 sm:mt-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl md:text-4xl">{t("faqx.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{t("faqx.intro")}</p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl space-y-3 sm:mt-10">
          {(["tracking", "wait", "cpam"] as const).map((k) => (
            <details
              key={k}
              className="group rounded-xl border border-border bg-card/50 p-4 transition hover:border-primary/40 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 font-semibold">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="flex-1 text-sm sm:text-base">{t(`faqx.${k}.q`)}</span>
                <span className="ml-2 text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pl-8 text-sm leading-relaxed text-muted-foreground">{t(`faqx.${k}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-16 sm:flex-row">
        <Link
          to="/devis"
          search={{ prestation: undefined, lang: undefined }}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] active:scale-95 sm:w-auto"
        >
          <FileText className="h-4 w-4" /> {quoteLabel}
        </Link>
        <Link
          to="/reserver"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border px-8 font-semibold transition hover:border-primary/60 sm:w-auto"
        >
          {t("services.cta")}
        </Link>
      </div>
    </div>
  );
}
