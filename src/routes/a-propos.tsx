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
    <main className="mx-auto max-w-[390px] px-3 py-5 text-white sm:max-w-3xl sm:px-6">
      <section className="overflow-hidden rounded-[30px] border border-[#d6a83d]/70 bg-[#030a13] shadow-[0_0_40px_rgba(214,168,61,.08)]">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-7">
          <div>
            <div className="text-[9px] font-bold tracking-[.15em] text-[#e8bd5d]">ACCESS PRESTIGE TAXI</div>
            <div className="mt-1 text-[5px] tracking-[.22em] text-white/60">L'EXCELLENCE À CHAQUE TRAJET</div>
          </div>
          <span className="text-xl text-[#e8bd5d]">☰</span>
        </div>
        <div className="px-6 py-5">
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#d6a83d]/45 px-3 py-1 text-[10px] font-bold tracking-wider text-[#e8bd5d]">
              À PROPOS
            </span>
            <h1 className="mt-4 font-display text-[29px] leading-tight text-[#f4efe5]">
              Notre histoire,
              <br />
              vos trajets
            </h1>
            <div className="mx-auto mt-4 h-px w-7 bg-[#e8bd5d]" />
          </div>
          <div className="mt-4 space-y-3 text-[12px] leading-5 text-white/70">
            <p>
              <b className="text-[#e8bd5d]">Access Prestige Taxi</b>, c'est l'histoire de deux chauffeurs passionnés :{" "}
              <b className="text-[#e8bd5d]">Patricia et Alain.</b>
            </p>
            <p>Basés en Charente-Maritime, nous mettons tout notre savoir-faire au service de vos déplacements.</p>
            <p>Ponctualité, discrétion et confort sont les valeurs qui nous guident au quotidien.</p>
          </div>
          <h2 className="mt-4 text-center font-display text-[22px]">Nos engagements</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {commitments.map((b) => (
              <article
                key={b.title}
                className="min-h-[118px] rounded-xl border border-white/20 bg-[linear-gradient(145deg,#111b26,#07101a)] p-3"
              >
                <b.icon className="h-7 w-7 text-[#e8bd5d]" />
                <h3 className="mt-2 font-display text-[14px] text-[#e8bd5d]">{b.title}</h3>
                <p className="mt-2 text-[9px] leading-4 text-white/60">{b.desc}</p>
              </article>
            ))}
          </div>
          <Link
            to="/reserver"
            className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-b from-[#f6cd6b] to-[#cf962a] text-[11px] font-extrabold text-[#181107]"
          >
            RÉSERVER MAINTENANT
          </Link>
        </div>
      </section>
    </main>
  );
}
