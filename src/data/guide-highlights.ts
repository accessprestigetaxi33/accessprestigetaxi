// Aperçus blog affichés sur la page d'accueil.
//
// PERFORMANCE : le module `guide-charente.ts` pèse ~700 Ko une fois compilé.
// L'importer depuis la home obligeait chaque visiteur à télécharger tout le
// guide avant l'interactivité. On ne garde donc ici que les cartes mises en
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
    city: "Marennes-Hiers-Brouage",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Marennes-17_Clocher_-porche_2013.jpg/1280px-Marennes-17_Clocher_-porche_2013.jpg",
    fr: "Rendez-vous médicaux, sorties, trajets du quotidien : Alain et Patricia vous conduisent depuis Marennes-Hiers-Brouage.",
    en: "Medical appointments, evenings out, everyday trips: Alain and Patricia drive you from Marennes-Hiers-Brouage.",
  },
  {
    slug: "visiter-brouage-et-le-bassin-de-marennes-oleron",
    name: "Visiter Brouage et le bassin de Marennes-Oléron",
    city: "Marennes-Hiers-Brouage",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Citadelle.jpg?width=1280",
    fr: "Citadelle, marais et cabanes ostréicoles : une demi-journée de découverte, sans chercher de place de parking.",
    en: "Citadel, marshes and oyster huts: a half-day of discovery, with no parking to look for.",
  },
];
