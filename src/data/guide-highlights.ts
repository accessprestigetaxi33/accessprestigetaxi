// Aperçus blog affichés sur la page d'accueil.
//
// PERFORMANCE : le module `guide-charente.ts` pèse ~700 Ko une fois compilé.
// L'importer depuis la home obligeait chaque visiteur à télécharger tout le
// guide avant l'interactivité. On ne garde donc ici que les 3 cartes mises en
// avant. Si vous changez ces articles, mettez à jour les slugs ci-dessous —
// ils doivent exister dans guide-charente.ts.
export type GuideHighlight = {
  slug: string;
  name: string;
  city: string;
  photo: string;
  fr: string;
  en: string;
};

export const GUIDE_HIGHLIGHTS: GuideHighlight[] = [
  {
    slug: "taxi-a-marennes-chauffeur-prive",
    name: "Taxi à Marennes : votre chauffeur privé",
    city: "Marennes",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Marennes-17_Clocher_-porche_2013.jpg/1280px-Marennes-17_Clocher_-porche_2013.jpg",
    fr: "Gares, aéroports, rendez-vous médicaux, sorties : Alain et Patricia vous conduisent depuis Marennes dans toute la Charente-Maritime.",
    en: "Stations, airports, medical appointments, evenings out: Alain and Patricia drive you from Marennes across Charente-Maritime.",
  },
  {
    slug: "rejoindre-l-ile-d-oleron-en-taxi",
    name: "Rejoindre l’île d’Oléron en taxi",
    city: "Oléron",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Pont%20d%27Ol%C3%A9ron.jpg?width=1280",
    fr: "Depuis Marennes, Rochefort ou La Rochelle : durées indicatives, points de dépose et pourquoi le taxi reste le plus simple sur l’île.",
    en: "From Marennes, Rochefort or La Rochelle: indicative times, drop-off points and why a taxi is simplest on the island.",
  },
  {
    slug: "visiter-brouage-et-le-bassin-de-marennes-oleron",
    name: "Visiter Brouage et le bassin de Marennes-Oléron",
    city: "Marennes",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Citadelle.jpg?width=1280",
    fr: "Citadelle, marais et cabanes ostréicoles : une demi-journée de découverte, sans chercher de place de parking.",
    en: "Citadel, marshes and oyster huts: a half-day of discovery, with no parking to look for.",
  },
];
