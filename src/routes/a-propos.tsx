import { socialImageMeta } from "@/lib/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo-hreflang";
import { Award, MapPin, Clock, Heart } from "lucide-react";
import { useT } from "@/i18n/I18nProvider";
import { DRIVERS, SERVICE_HOURS } from "@/data/drivers";

const ABOUT_TITLE = "À propos – Access Prestige Taxi | Charente-Maritime";
const ABOUT_DESC =
  "Access Prestige Taxi : deux chauffeurs, Patricia et Alain, un service de taxi premium 100 % électrique en Charente-Maritime.";
const ABOUT_URL = "https://accessprestigetaxi.fr/a-propos";

export const Route = createFileRoute("/a-propos")({
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
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "20:00",
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14 md:py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("about.eyebrow")}</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">{t("about.title")}</h1>
      </div>

      <div className="mt-10 space-y-5 text-base text-muted-foreground sm:mt-12 sm:space-y-6 sm:text-lg">
        <p>
          <span className="font-semibold text-foreground">{t("about.p1.brand")}</span> {t("about.p1")}
        </p>
        <p>{t("about.p2")}</p>
        <p>{t("about.p3")}</p>
      </div>

      <h2 className="mt-12 text-center font-display text-2xl font-semibold sm:text-3xl">
        {t("about.b.section") !== "about.b.section" ? t("about.b.section") : "Nos engagements"}
      </h2>

      {/* 1-col on mobile, 2-col on md */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
        {[
          { icon: Award, title: t("about.b1.t"), desc: t("about.b1.d") },
          { icon: Clock, title: t("about.b2.t"), desc: t("about.b2.d") },
          { icon: MapPin, title: t("about.b3.t"), desc: t("about.b3.d") },
          { icon: Heart, title: t("about.b4.t"), desc: t("about.b4.d") },
        ].map((b) => (
          <div key={b.title} className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <b.icon className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
            <h3 className="mt-3 font-display text-lg font-semibold sm:mt-4 sm:text-xl">{b.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center sm:mt-14">
        <Link
          to="/reservation"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] active:scale-95 sm:w-auto sm:rounded-md sm:py-3"
        >
          {t("about.cta")}
        </Link>
      </div>
    </div>
  );
}
