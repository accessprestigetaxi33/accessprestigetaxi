import { keywordsMeta } from "@/lib/seo-keywords";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, HelpCircle, Phone } from "lucide-react";
import { seoLinks, SITE_URL as SITE } from "@/lib/seo-hreflang";
import { socialImageMeta } from "@/lib/og";
import { useI18n } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import { LocalBusinessCard } from "@/components/LocalBusinessCard";

const URL = `${SITE}/faq`;
const TITLE_FR = "FAQ taxi : tarifs, compteur, Oléron | Access Prestige Taxi";
const DESC_FR =
  "Questions fréquentes sur nos taxis en Charente-Maritime : tarifs officiels, fonctionnement du compteur, trajets vers l'île d'Oléron, réservation et paiement.";
const TITLE_EN = "Taxi FAQ: fares, meter, Oléron | Access Prestige Taxi";
const DESC_EN =
  "Frequently asked questions about our taxis in Charente-Maritime: official fares, how the meter works, trips to Oléron island, booking and payment.";

export const Route = createFileRoute("/faq")({
  head: ({ match }) => ({
    meta: [
      keywordsMeta([
        "tarif taxi Charente-Maritime",
        "prix taxi Marennes",
        "compteur taxi",
        "taxi île d'Oléron prix",
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
    h1: "FAQ taxi en Charente-Maritime",
    lead:
      "Tarifs, compteur, trajets vers l'île d'Oléron, réservation et paiement : les réponses d'Alain et Patricia, vos chauffeurs basés à Marennes.",
    ctaT: "Une question sans réponse ?",
    ctaP: "Appelez-nous ou réservez en ligne en moins d'une minute, 24h/24.",
    book: "Réserver ma course",
    call: "Appeler",
    more: "Pages utiles",
    groups: [
      {
        title: "Tarifs",
        items: [
          {
            q: "Quels sont vos tarifs de taxi en Charente-Maritime ?",
            a: "Nous appliquons les tarifs taxi officiels du département : prise en charge 2,83 €, tarif journée 2,16 €/km, tarif nuit, dimanche et jours fériés 3,24 €/km. Le prix estimé vous est annoncé avant le départ et le devis est gratuit.",
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
        title: "Trajets vers l'île d'Oléron",
        items: [
          {
            q: "Desservez-vous toute l'île d'Oléron ?",
            a: "Oui : Le Château-d'Oléron, Dolus, Saint-Pierre, Saint-Trojan-les-Bains, Saint-Georges, Saint-Denis et la pointe de Chassiron, au départ de Marennes comme des gares et aéroports de la région.",
          },
          {
            q: "Combien de temps faut-il pour rejoindre Oléron ?",
            a: "Comptez environ 15 minutes depuis Marennes jusqu'au Château-d'Oléron par le viaduc, 45 minutes depuis Rochefort et environ 1 h 15 depuis La Rochelle, hors trafic estival.",
          },
          {
            q: "Le passage du viaduc est-il payant ?",
            a: "Non, le viaduc reliant Bourcefranc-le-Chapus à l'île d'Oléron est gratuit : aucun péage n'est ajouté à votre course.",
          },
          {
            q: "Peut-on réserver un taxi pour la journée sur l'île ?",
            a: "Oui, nous proposons la mise à disposition avec chauffeur : visites, plages, marchés et restaurants, avec un véhicule qui vous attend entre chaque étape.",
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
    h1: "Taxi FAQ in Charente-Maritime",
    lead:
      "Fares, the meter, trips to Oléron island, booking and payment: answers from Alain and Patricia, your drivers based in Marennes.",
    ctaT: "Still have a question?",
    ctaP: "Call us or book online in under a minute, 24/7.",
    book: "Book my ride",
    call: "Call",
    more: "Useful pages",
    groups: [
      {
        title: "Fares",
        items: [
          {
            q: "What are your taxi fares in Charente-Maritime?",
            a: "We apply the official county taxi fares: €2.83 pick-up charge, €2.16/km daytime rate, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure and quotes are free.",
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
        title: "Trips to Oléron island",
        items: [
          {
            q: "Do you serve the whole of Oléron island?",
            a: "Yes: Le Château-d'Oléron, Dolus, Saint-Pierre, Saint-Trojan-les-Bains, Saint-Georges, Saint-Denis and Chassiron point, from Marennes as well as from regional stations and airports.",
          },
          {
            q: "How long does it take to reach Oléron?",
            a: "Around 15 minutes from Marennes to Le Château-d'Oléron over the viaduct, 45 minutes from Rochefort and about 1h15 from La Rochelle, outside summer traffic.",
          },
          {
            q: "Is there a toll on the viaduct?",
            a: "No, the viaduct linking Bourcefranc-le-Chapus to Oléron island is free: no toll is added to your fare.",
          },
          {
            q: "Can I book a taxi for a full day on the island?",
            a: "Yes, we offer hourly hire with a driver: sightseeing, beaches, markets and restaurants, with the car waiting for you between stops.",
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
  { to: "/taxi-oleron" as const, fr: "Taxi île d'Oléron", en: "Taxi on Oléron island" },
  { to: "/taxi-charente-maritime" as const, fr: "Taxi Charente-Maritime", en: "Taxi in Charente-Maritime" },
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
