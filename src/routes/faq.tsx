import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, HelpCircle, Phone } from "lucide-react";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { socialImageMeta } from "@/lib/og";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { LocalBusinessCard } from "@/components/LocalBusinessCard";

const URL = `${SITE}/faq`;
const TITLE_FR = "FAQ taxi Marennes & Ciré-d'Aunis : tarifs, réservation | Access Taxi PBR";
const DESC_FR =
  "Questions fréquentes sur nos taxis à Marennes-Hiers-Brouage et Ciré-d'Aunis : tarifs officiels, fonctionnement du compteur, réservation et paiement.";
const TITLE_EN = "Taxi FAQ Marennes & Ciré-d'Aunis: fares, booking | Access Taxi PBR";
const DESC_EN =
  "Frequently asked questions about our taxis in Marennes-Hiers-Brouage and Ciré-d'Aunis: official fares, how the meter works, booking and payment.";

export const Route = createFileRoute("/faq")({
  head: ({ match }) => ({
    meta: [
      keywordsMeta([
        "tarif taxi Brouage",
        "prix taxi Marennes",
        "compteur taxi",
        "taxi Ciré-d'Aunis prix",
        "réserver un taxi Marennes",
        "questions fréquentes taxi",
      ]),
      { title: TITLE_FR },
      { name: "description", content: DESC_FR },
      { property: "og:title", content: TITLE_FR },
      { property: "og:description", content: DESC_FR },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE_FR },
      { name: "twitter:description", content: DESC_FR },
      ...socialImageMeta(TITLE_FR),
    ],
    links: seoLinks("/faq", match.search),
  }),
  component: FaqPage,
});

type Qa = { q: string; a: string };
type Group = { title: string; items: Qa[] };

const COPY: Record<"fr" | "en", {
  eyebrow: string;
  h1: string;
  lead: string;
  groups: Group[];
  ctaT: string;
  ctaP: string;
  book: string;
  call: string;
  more: string;
}> = {
  fr: {
    eyebrow: "Questions fréquentes",
    h1: "FAQ taxi Marennes-Hiers-Brouage & Ciré-d'Aunis",
    lead:
      "Tarifs, compteur, réservation et paiement : les réponses d'Alain et Patricia, vos chauffeurs à Marennes-Hiers-Brouage et Ciré-d'Aunis.",
    ctaT: "Une question sans réponse ?",
    ctaP: "Appelez-nous ou réservez en ligne en moins d'une minute, 24h/24.",
    book: "Réserver ma course",
    call: "Appeler",
    more: "Pages utiles",
    groups: [
      {
        title: "Zone desservie",
        items: [
          {
            q: "Où êtes-vous basés et quelles communes desservez-vous ?",
            a: "Access Taxi PBR est basée en Charente-Maritime, à Marennes-Hiers-Brouage (17320). Nous prenons nos clients en charge à Marennes-Hiers-Brouage, Brouage et Ciré-d'Aunis.",
          },
          {
            q: "Quel taxi appeler à Marennes-Hiers-Brouage, Brouage ou Ciré-d'Aunis ?",
            a: "Appelez Access Taxi PBR au 06 03 44 48 63 (Alain) ou au 06 50 26 00 15 (Patricia), ou réservez en ligne 24h/24. Nous roulons 5j/7 de 8h à 20h : transport privé, chauffeur privé et transport médical conventionné.",
          },
        ],
      },
      {
        title: "Tarifs",
        items: [
          {
            q: "Quels sont vos tarifs de taxi à Marennes-Hiers-Brouage et Ciré-d'Aunis ?",
            a: "Nous appliquons les tarifs taxi officiels du département : prise en charge 2,70 €, tarif journée 2,28 €/km, tarif nuit, dimanche et jours fériés 3,22 €/km. Le prix estimé vous est annoncé avant le départ et le devis est gratuit.",
          },
          {
            q: "Le prix affiché lors de la réservation est-il définitif ?",
            a: "Non, il s'agit d'une estimation calculée sur la distance et la durée théoriques du trajet. Elle ne tient pas compte des bouchons, des déviations ou des incidents de circulation : seul le compteur du taxi fait foi en fin de course.",
          },
          {
            q: "Y a-t-il des suppléments ?",
            a: "Les tarifs officiels prévoient des majorations pour les trajets de nuit, le dimanche et les jours fériés. Les sièges bébé, les rehausseurs et l'aide aux bagages ne sont jamais facturés en supplément.",
          },
          {
            q: "Comment puis-je payer ma course ?",
            a: "Espèces, carte bancaire et virement sont acceptés. Pour le transport médical conventionné, nous pratiquons le tiers payant : vous n'avancez rien si la prescription le permet.",
          },
          {
            q: "Puis-je obtenir une facture ?",
            a: "Oui. Dès que le chauffeur clôture la course avec le prix final du compteur, votre facture est disponible en ligne, téléchargeable en PDF et envoyée automatiquement par e-mail.",
          },
        ],
      },
      {
        title: "Le compteur",
        items: [
          {
            q: "Comment fonctionne le compteur du taxi ?",
            a: "Le compteur homologué démarre à la prise en charge et additionne la distance parcourue et le temps d'attente selon le tarif horaire en vigueur (jour, nuit, dimanche ou jour férié). Le montant affiché en fin de course est le prix à régler.",
          },
          {
            q: "Pourquoi le prix final peut-il différer de l'estimation ?",
            a: "Un embouteillage, une déviation, un arrêt supplémentaire ou une attente prolongée allongent la course et sont comptabilisés par le compteur. C'est pourquoi nous parlons toujours de tarif indicatif avant le départ.",
          },
          {
            q: "Puis-je demander un prix forfaitaire ?",
            a: "Oui, pour les longues distances et les transferts vers les gares et aéroports, demandez un devis : nous vous confirmons un prix ferme par écrit avant la réservation.",
          },
        ],
      },
      {
        title: "Réservation",
        items: [
          {
            q: "Comment réserver un taxi ?",
            a: "En ligne 24h/24 depuis la page Réserver, à la voix ou au clavier, en français comme en anglais. Vous pouvez aussi appeler directement Alain ou Patricia pendant nos heures d'ouverture.",
          },
          {
            q: "Quels sont vos horaires ?",
            a: "Nous roulons 5 jours sur 7, de 8h à 20h. La réservation en ligne reste ouverte 24h/24 et les trajets longue distance se organisent sur rendez-vous.",
          },
          {
            q: "Combien de temps à l'avance faut-il réserver ?",
            a: "Une course locale peut souvent être prise en charge le jour même. Pour un train, un avion, un rendez-vous médical ou un transport de groupe, réservez si possible 24 à 48 h à l'avance.",
          },
          {
            q: "Combien de passagers pouvez-vous transporter ?",
            a: "Jusqu'à 4 passagers dans la BMW iX1 ou l'Audi Q6 e-tron 100 % électriques, et jusqu'à 7 passagers dans le van Mercedes Classe V pour les groupes et les gros bagages.",
          },
          {
            q: "Puis-je annuler ma réservation ?",
            a: "Oui, l'annulation est possible à tout moment et sans frais : depuis votre espace client, par téléphone ou en répondant à l'e-mail de confirmation.",
          },
        ],
      },
    ],
  },
  en: {
    eyebrow: "Frequently asked questions",
    h1: "Taxi FAQ — Marennes-Hiers-Brouage & Ciré-d'Aunis",
    lead:
      "Fares, the meter, booking and payment: answers from Alain and Patricia, your drivers in Marennes-Hiers-Brouage and Ciré-d'Aunis.",
    ctaT: "Still have a question?",
    ctaP: "Call us or book online in under a minute, 24/7.",
    book: "Book my ride",
    call: "Call",
    more: "Useful pages",
    groups: [
      {
        title: "Service area",
        items: [
          {
            q: "Where are you based and which towns do you serve?",
            a: "Access Taxi PBR is based in Charente-Maritime, in Marennes-Hiers-Brouage (17320). We pick our clients up in Marennes-Hiers-Brouage, Brouage and Ciré-d'Aunis.",
          },
          {
            q: "Which taxi should I call in Marennes-Hiers-Brouage, Brouage or Ciré-d'Aunis?",
            a: "Call Access Taxi PBR on +33 6 03 44 48 63 (Alain) or +33 6 50 26 00 15 (Patricia), or book online 24/7. We drive 5 days a week, 8am to 8pm: private transport, private driver and approved medical transport.",
          },
        ],
      },
      {
        title: "Fares",
        items: [
          {
            q: "What are your taxi fares in Marennes-Hiers-Brouage and Ciré-d'Aunis?",
            a: "We apply the official county taxi fares: €2.70 pick-up charge, €2.28/km daytime rate, €3.22/km at night, on Sundays and public holidays. The estimated price is confirmed before departure and quotes are free.",
          },
          {
            q: "Is the price shown at booking final?",
            a: "No, it is an estimate based on the theoretical distance and duration. It excludes traffic jams, diversions and incidents: only the taximeter is binding at the end of the ride.",
          },
          {
            q: "Are there any extra charges?",
            a: "Official fares include surcharges for night trips, Sundays and public holidays. Baby seats, boosters and luggage assistance are never charged extra.",
          },
          {
            q: "How can I pay?",
            a: "Cash, card and bank transfer are accepted. For approved medical transport we handle direct billing, so you pay nothing upfront when the prescription allows it.",
          },
          {
            q: "Can I get an invoice?",
            a: "Yes. As soon as the driver closes the ride with the final metered price, your invoice is available online, downloadable as a PDF and emailed to you automatically.",
          },
        ],
      },
      {
        title: "The meter",
        items: [
          {
            q: "How does the taximeter work?",
            a: "The approved meter starts at pick-up and adds distance travelled and waiting time at the rate in force (day, night, Sunday or public holiday). The amount displayed at the end of the ride is the amount due.",
          },
          {
            q: "Why can the final price differ from the estimate?",
            a: "Traffic, a diversion, an extra stop or a long wait all lengthen the ride and are counted by the meter. That is why the price given before departure is always indicative.",
          },
          {
            q: "Can I ask for a fixed price?",
            a: "Yes. For long distances and station or airport transfers, request a quote: we confirm a firm written price before you book.",
          },
        ],
      },
      {
        title: "Booking",
        items: [
          {
            q: "How do I book a taxi?",
            a: "Online 24/7 from the Book page, by voice or keyboard, in French or English. You can also call Alain or Patricia directly during opening hours.",
          },
          {
            q: "What are your opening hours?",
            a: "We drive 5 days a week, from 8am to 8pm. Online booking stays open 24/7 and long-distance trips are arranged by appointment.",
          },
          {
            q: "How far in advance should I book?",
            a: "A local ride can often be covered the same day. For a train, a flight, a medical appointment or group transport, book 24 to 48 hours ahead when possible.",
          },
          {
            q: "How many passengers can you carry?",
            a: "Up to 4 passengers in the fully electric BMW iX1 or Audi Q6 e-tron, and up to 7 passengers in the Mercedes V-Class van for groups and bulky luggage.",
          },
          {
            q: "Can I cancel my booking?",
            a: "Yes, cancellation is free and possible at any time: from your client area, by phone or by replying to the confirmation email.",
          },
        ],
      },
    ],
  },
};

const RELATED = [
  { to: "/taxi-marennes" as const, fr: "Taxi à Marennes", en: "Taxi in Marennes" },
  { to: "/devis" as const, fr: "Demander un devis", en: "Request a quote" },
];

function FaqPage() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const c = COPY[isEn ? "en" : "fr"];
  const all = c.groups.flatMap((g) => g.items);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${URL}#faq`,
        url: URL,
        name: isEn ? TITLE_EN : TITLE_FR,
        description: isEn ? DESC_EN : DESC_FR,
        inLanguage: isEn ? "en" : "fr",
        mainEntity: all.map((i) => ({
          "@type": "Question",
          name: i.q,
          acceptedAnswer: { "@type": "Answer", text: i.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Access Prestige Taxi", item: SITE },
          { "@type": "ListItem", position: 2, name: c.h1, item: URL },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <HelpCircle className="h-3.5 w-3.5 text-primary" /> {c.eyebrow}
      </span>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl md:text-[2.75rem] md:leading-tight">{c.h1}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.lead}</p>

      {c.groups.map((g) => (
        <section key={g.title} className="mt-10">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">{g.title}</h2>
          <div className="mt-4 divide-y divide-[#e0b866]/20 overflow-hidden rounded-2xl border border-[#e0b866]/25 bg-card">
            {g.items.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex min-h-[56px] cursor-pointer touch-manipulation list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition hover:text-primary sm:text-base">
                  <span className="min-w-0">{item.q}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-primary transition duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <LocalBusinessCard locality="Marennes-Hiers-Brouage" postalCode="17320" latitude={45.8231} longitude={-1.1055} />

      <section className="mt-12 rounded-2xl border border-[#e0b866]/25 bg-[#080b0d] p-6 sm:p-7">
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{c.ctaT}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{c.ctaP}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link
            to="/reserver"
            className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90"
          >
            {c.book} <ArrowRight className="h-4 w-4" />
          </Link>
          {DRIVERS.map((d) => (
            <a
              key={d.tel}
              href={`tel:${d.intl}`}
              className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#e0b866]/30 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-primary"
            >
              <Phone className="h-4 w-4 text-primary" /> {c.call} {d.name}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{c.more}</h2>
        <ul className="mt-4 space-y-2">
          {RELATED.map((r) => (
            <li key={r.to}>
              <Link to={r.to} className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-90">
                {isEn ? r.en : r.fr}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
