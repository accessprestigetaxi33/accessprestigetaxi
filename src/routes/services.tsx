import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { ShieldCheck, Users, Route as RouteIcon, HelpCircle } from "lucide-react";
import { useI18n, useT } from "@/i18n/I18nProvider";
import { BulletedList } from "@/components/BulletedList";
import { SERVICE_CARDS_EN, SERVICE_CARDS_FR } from "@/data/services-cards";

const SERVICES_TITLE = "Services taxi Charente-Maritime : Aéroport, Gare, CPAM";
const SERVICES_DESC =
  "Découvrez nos services de taxi en Charente-Maritime : transferts aéroport, gare, transport conventionné CPAM, mariages, business, longues distances.";
const SERVICES_URL = "https://accessprestigetaxi.lovable.app/services";

const SERVICE_LIST = [
  { name: "Transfert tous aéroports", description: "Transferts vers et depuis tous les aéroports." },
  { name: "Transfert toutes gares", description: "Transferts vers et depuis toutes les gares." },
  { name: "Transport conventionné CPAM", description: "Transport sanitaire conventionné, possible avec fauteuil roulant." },
  { name: "Mariages et événements", description: "Mise à disposition pour mariages et événements." },
  { name: "Trajets professionnels", description: "Déplacements business et mise à disposition avec chauffeur." },
  { name: "Longues distances", description: "Trajets longue distance en France et en Europe sur réservation." },
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
  head: ({ match }) => ({
    meta: [
      { title: SERVICES_TITLE },
      { name: "description", content: SERVICES_DESC },
      { property: "og:title", content: SERVICES_TITLE },
      { property: "og:description", content: SERVICES_DESC },
      { property: "og:url", content: SERVICES_URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SERVICES_TITLE },
      { name: "twitter:description", content: SERVICES_DESC },
      ...socialImageMeta(SERVICES_TITLE),
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
              mainEntity: SERVICES_FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "ItemList",
              itemListElement: SERVICE_LIST.map((svc, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Service",
                  name: svc.name,
                  description: svc.description,
                  provider: { "@type": "TaxiService", name: "Access Prestige Taxi" },
                  areaServed: "Charente-Maritime",
                },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: "https://accessprestigetaxi.lovable.app/" },
                { "@type": "ListItem", position: 2, name: "Services", item: "https://accessprestigetaxi.lovable.app/services" },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const t = useT();
  const { lang } = useI18n();
  // Catalogue unique (ex-section "Nos services" de la page d'accueil + détails).
  const services = lang === "en" ? SERVICE_CARDS_EN : SERVICE_CARDS_FR;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14 md:py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("services.eyebrow")}</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">{t("services.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
          {t("services.intro")}
        </p>
      </div>

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
                <h2 id={headingId} className="font-display text-lg font-semibold sm:text-xl">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <BulletedList items={s.points} className="mt-4" ariaLabelledBy={headingId} />
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

      <div className="mt-12 text-center sm:mt-16">
        <Link
          to="/reservation"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] active:scale-95 sm:w-auto sm:rounded-md sm:py-3"
        >
          {t("services.cta")}
        </Link>
      </div>
    </div>
  );
}
