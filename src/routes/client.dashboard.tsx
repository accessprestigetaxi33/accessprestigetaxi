import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { Award, MapPin, Clock, Heart } from "lucide-react";
import { useT } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";

const ABOUT_TITLE = "À propos – Access Prestige Taxi | Charente-Maritime";
const ABOUT_DESC =
  "Access Prestige Taxi : deux chauffeurs, Patricia et Alain, un service de taxi premium 100 % électrique en Charente-Maritime.";
const ABOUT_URL = "https://www.accessprestigetaxi.fr/a-propos";

export const Route = createFileRoute("/client/dashboard")({
  head: ({ match }) => ({
    meta: [
      { title: ABOUT_TITLE },
      { name: "description", content: ABOUT_DESC },
      { property: "og:title", content: ABOUT_TITLE },
      { property: "og:description", content: ABOUT_DESC },
      { property: "og:url", content: ABOUT_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ABOUT_TITLE },
      { name: "twitter:description", content: ABOUT_DESC },
      ...socialImageMeta(ABOUT_TITLE),
    ],
    links: seoLinks("/a-propos", match.search),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          additionalType: "https://schema.org/TaxiService",
          name: "Access Prestige Taxi",
          slogan: "L'excellence à chaque trajet",
          url: ABOUT_URL,
          telephone: DRIVERS.map((d) => d.intl),
          areaServed: { "@type": "AdministrativeArea", name: "Charente-Maritime" },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  const commitments = [
    { icon: Award, title: t("about.b1.t"), desc: t("about.b1.d") },
    { icon: Clock, title: t("about.b2.t"), desc: t("about.b2.d") },
    { icon: MapPin, title: t("about.b3.t"), desc: t("about.b3.d") },
    { icon: Heart, title: t("about.b4.t"), desc: t("about.b4.d") },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
      <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card/40 px-5 py-10 text-center shadow-[0_24px_70px_rgba(0,0,0,.18)] sm:px-10 sm:py-16">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_center,rgba(212,169,83,.13),transparent_65%)] sm:block" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">{t("about.eyebrow")}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            {t("about.title")}
          </h1>
          <div className="mx-auto mt-5 h-px w-10 bg-primary" />
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-3xl space-y-5 text-[15px] leading-8 text-muted-foreground sm:mt-14 sm:text-lg">
        <p>
          <span className="font-semibold text-foreground">{t("about.p1.brand")}</span> {t("about.p1")}
        </p>
        <p>{t("about.p2")}</p>
        <p>{t("about.p3")}</p>
      </section>

      <section className="mt-14 border-t border-border/70 pt-10 sm:mt-16 sm:pt-14">
        <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
          {t("about.b.section") !== "about.b.section" ? t("about.b.section") : "Nos engagements"}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {commitments.map((b) => (
            <article
              key={b.title}
              className="rounded-2xl border border-border bg-card/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/50 sm:p-7"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{b.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 text-center sm:mt-14">
        <Link
          to="/reserver"
          className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 sm:w-auto sm:min-w-72"
        >
          {t("about.cta")}
        </Link>
      </div>
    </main>
  );
}
