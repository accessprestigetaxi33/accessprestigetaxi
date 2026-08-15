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
        a: "La BMW iX1 de Patricia et l'Audi Q6 e-tron sont 100 % électriques, chacun en 5 places : zéro émission à l'usage, aucune vibration, un habitacle silencieux. Le van Mercedes V-Class d'Alain est un véhicule 8 places adapté aux groupes et aux bagages.",
      },
      {
        q: "Quel véhicule choisir selon mon trajet ?",
        a: "BMW iX1 5 places pour les trajets du quotidien, Audi Q6 e-tron 5 places pour les déplacements professionnels et les prestations toutes distances, van Mercedes 8 places pour les familles, les équipes et les transferts avec beaucoup de bagages.",
      },
      {
        q: "Combien de bagages puis-je emporter ?",
        a: "Comptez 2 valises cabine et 2 grandes valises dans la BMW iX1 ou l'Audi Q6 e-tron. Le van Mercedes 8 places offre un volume bien plus important. Signalez vélos, planches de surf, poussettes, fauteuil roulant ou instruments à la réservation : nous adaptons le véhicule.",
      },
      {
        q: "Proposez-vous des sièges bébé et des sièges enfant ?",
        a: "Oui, et sans supplément : siège bébé (0-13 kg), siège enfant (9-18 kg) et rehausseur (15-36 kg). Indiquez le type de siège au moment de la réservation, il est installé et vérifié avant votre prise en charge.",
      },
      {
        q: "Prenez-vous en charge le transport conventionné ?",
        a: "Oui, pour les trajets médicaux avec prescription, y compris avec fauteuil roulant selon le besoin : consultations, hospitalisations, dialyses et cures. Nous gérons la feuille de route et le tiers payant.",
      },
      {
        q: "Comment suivre ma course et récupérer ma facture ?",
        a: "Chaque réservation génère un lien de suivi en temps réel, partageable avec vos proches. En fin de course, votre reçu détaillé est disponible en ligne et téléchargeable en PDF depuis votre espace client.",
      },
      {
        q: "Puis-je réserver un transport de groupe ?",
        a: "Oui : le van Mercedes 8 places accueille les groupes en un seul trajet et à un seul tarif — mariages, séminaires, sorties, transferts vers toutes les gares et tous les aéroports.",
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
        a: "Patricia's BMW iX1 and the Audi Q6 e-tron are fully electric 5-seat vehicles: zero tailpipe emissions, no vibration and a silent cabin. Alain's Mercedes V-Class is an 8-seat vehicle for groups and luggage.",
      },
      {
        q: "Which vehicle should I choose?",
        a: "The 5-seat BMW iX1 suits everyday trips, the 5-seat Audi Q6 e-tron suits business and all-distance services, and the 8-seat Mercedes van suits families, teams and transfers with plenty of luggage.",
      },
      {
        q: "How much luggage can I bring?",
        a: "Expect 2 cabin bags and 2 large suitcases in the BMW iX1 or Audi Q6 e-tron. The 8-seat Mercedes van offers much more room. Mention bikes, surfboards, prams, wheelchairs or instruments when booking and we'll match the right vehicle.",
      },
      {
        q: "Do you provide baby and child seats?",
        a: "Yes, at no extra cost: baby seat (0-13 kg), child seat (9-18 kg) and booster (15-36 kg). Pick the seat type when booking and it is fitted and checked before pickup.",
      },
      {
        q: "Do you handle medical transport?",
        a: "Yes, for prescribed medical transport, including wheelchair needs where appropriate: consultations, hospital stays, dialysis and treatment courses. We handle the paperwork and direct billing.",
      },
      {
        q: "How do I track my ride and get my receipt?",
        a: "Every booking generates a real-time tracking link you can share with family. At the end of the ride, your detailed receipt is available online and downloadable as a PDF from your client area.",
      },
      {
        q: "Can I book group transport?",
        a: "Yes: the 8-seat Mercedes van carries groups in one trip at a single fare — weddings, conferences, nights out, and transfers to all stations and airports.",
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
