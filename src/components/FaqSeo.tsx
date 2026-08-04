import { ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

type Qa = { q: string; a: string };

const COPY: Record<"fr" | "en", { eyebrow: string; title: string; lead: string; cta: string; items: Qa[] }> = {
  fr: {
    eyebrow: "Questions fréquentes",
    title: "Tout savoir avant de réserver",
    lead: "Réservation, véhicules électriques, disponibilités, bagages et sièges enfants : les réponses de Patricia et Alain.",
    cta: "Réserver ma course",
    items: [
      {
        q: "Comment réserver un taxi en moins d'une minute ?",
        a: "Ouvrez la page Réserver : vous dictez ou écrivez votre départ, votre arrivée, la date et le nombre de passagers, puis vous validez. L'assistant vous propose une estimation immédiate et vous recevez une confirmation avec un lien de suivi en temps réel. Vous pouvez aussi appeler directement Patricia ou Alain.",
      },
      {
        q: "La réservation vocale fonctionne-t-elle en anglais ?",
        a: "Oui. L'assistant de réservation comprend le français et l'anglais, à la voix comme au clavier. Le site entier bascule en anglais grâce au sélecteur de langue du menu.",
      },
      {
        q: "Vos véhicules sont-ils vraiment 100 % électriques ?",
        a: "La BMW iX1 de Patricia et l'Audi Q6 e-tron sont 100 % électriques : zéro émission à l'usage, aucune vibration, un habitacle silencieux. Le van Mercedes V-Class d'Alain, utilisé pour les groupes jusqu'à 7 personnes, est thermique afin d'assurer les longues distances avec bagages.",
      },
      {
        q: "Quel véhicule choisir selon mon trajet ?",
        a: "BMW iX1 pour 1 à 4 passagers au quotidien, Audi Q6 e-tron pour les déplacements professionnels et les longues distances en SUV premium, van Mercedes 7 places pour les familles, les équipes et les transferts aéroport avec beaucoup de bagages.",
      },
      {
        q: "Quelles sont vos disponibilités ?",
        a: "Nous roulons 5 jours sur 7, de 8h à 20h, sur toute la Charente-Maritime. En dehors de ces créneaux, réservez à l'avance : nous organisons les départs très tôt et les retours tardifs sur demande.",
      },
      {
        q: "Combien de bagages puis-je emporter ?",
        a: "Comptez 2 valises cabine et 2 grandes valises dans la BMW iX1 ou l'Audi Q6 e-tron. Le van Mercedes accepte jusqu'à 7 passagers avec leurs bagages, ou moins de passagers et un volume de coffre bien plus important. Signalez vélos, planches de surf, poussettes ou instruments à la réservation : nous adaptons le véhicule.",
      },
      {
        q: "Proposez-vous des sièges bébé et des sièges enfant ?",
        a: "Oui, et sans supplément : siège bébé (0-13 kg), siège enfant (9-18 kg) et rehausseur (15-36 kg). Indiquez le type de siège au moment de la réservation, il est installé et vérifié avant votre prise en charge.",
      },
      {
        q: "Prenez-vous en charge le transport conventionné ?",
        a: "Oui, pour les trajets médicaux assis avec prescription : consultations, hospitalisations, dialyses et cures. Nous gérons la feuille de route et le tiers payant, vous n'avancez pas les frais.",
      },
      {
        q: "Comment suivre ma course et récupérer ma facture ?",
        a: "Chaque réservation génère un lien de suivi en temps réel, partageable avec vos proches. En fin de course, votre reçu détaillé est disponible en ligne et téléchargeable en PDF depuis votre espace client.",
      },
      {
        q: "Puis-je réserver un transport de groupe ?",
        a: "Oui : le van Mercedes emmène jusqu'à 7 personnes en un seul trajet et à un seul tarif — mariages, séminaires, sorties, transferts gare ou aéroport.",
      },
    ],
  },
  en: {
    eyebrow: "Frequently asked questions",
    title: "Everything you need before booking",
    lead: "Booking, electric vehicles, availability, luggage and child seats: answers from Patricia and Alain.",
    cta: "Book my ride",
    items: [
      {
        q: "How do I book a taxi in under a minute?",
        a: "Open the Book page: dictate or type your pickup, destination, date and number of passengers, then confirm. The assistant gives an instant estimate and you receive a confirmation with a real-time tracking link. You can also call Patricia or Alain directly.",
      },
      {
        q: "Does voice booking work in English?",
        a: "Yes. The booking assistant understands both French and English, by voice or keyboard, and the whole website switches to English from the language selector in the menu.",
      },
      {
        q: "Are your vehicles really 100% electric?",
        a: "Patricia's BMW iX1 and the Audi Q6 e-tron are 100% electric: zero tailpipe emissions, no vibration, a silent cabin. Alain's Mercedes V-Class van, used for groups of up to 7 people, runs on fuel so it can cover long distances fully loaded.",
      },
      {
        q: "Which vehicle should I choose?",
        a: "BMW iX1 for 1 to 4 passengers on everyday trips, Audi Q6 e-tron for business travel and long-distance journeys in a premium SUV, and the 7-seat Mercedes van for families, teams and airport transfers with plenty of luggage.",
      },
      {
        q: "When are you available?",
        a: "We drive 5 days a week, from 8am to 8pm, across Charente-Maritime. Outside those hours, book in advance: very early departures and late returns are arranged on request.",
      },
      {
        q: "How much luggage can I bring?",
        a: "Expect 2 cabin bags and 2 large suitcases in the BMW iX1 or Audi Q6 e-tron. The Mercedes van carries up to 7 passengers with their luggage, or fewer passengers and a far larger boot. Mention bikes, surfboards, prams or instruments when booking and we'll match the right vehicle.",
      },
      {
        q: "Do you provide baby and child seats?",
        a: "Yes, at no extra cost: baby seat (0-13 kg), child seat (9-18 kg) and booster (15-36 kg). Pick the seat type when booking and it is fitted and checked before pickup.",
      },
      {
        q: "Do you handle medical transport?",
        a: "Yes, for seated medical trips with a prescription: consultations, hospital stays, dialysis and treatment courses. We take care of the paperwork and direct billing, so you don't pay upfront.",
      },
      {
        q: "How do I track my ride and get my receipt?",
        a: "Every booking generates a real-time tracking link you can share with family. At the end of the ride, your detailed receipt is available online and downloadable as a PDF from your client area.",
      },
      {
        q: "Can I book group transport?",
        a: "Yes: the Mercedes van takes up to 7 people in one trip at a single fare — weddings, conferences, nights out, station and airport transfers.",
      },
    ],
  },
};

export function FaqSeo() {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "en" ? "en" : "fr",
    mainEntity: c.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section id="faq" className="border-t border-border py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl text-balance">
            {c.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.lead}</p>
        </div>

        <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {c.items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-[56px] cursor-pointer touch-manipulation list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition hover:text-primary sm:px-6 sm:text-base">
                <span className="min-w-0">{item.q}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-primary transition duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/reserver"
            className="inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            {c.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
