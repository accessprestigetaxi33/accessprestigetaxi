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
    slug: "guide-marennes-capitale-de-l-huitre",
    name: "Guide de Marennes, capitale de l’huître",
    city: "Marennes",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Marennes-17_Clocher_-porche_2013.jpg/1280px-Marennes-17_Clocher_-porche_2013.jpg",
    fr: "Notre ville. Entre marais, claires et chenaux, Marennes donne son nom à l’huître la plus connue de France — et c’est d’ici que partent nos courses.",
    en: "Our home town. Between marshes, claires and channels, Marennes gives its name to France’s best-known oyster — and every ride of ours starts here.",
  },
  {
    slug: "marennes-plage-et-le-port-de-la-cayenne",
    name: "Marennes-Plage et le port de La Cayenne",
    city: "Marennes",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Site_de_Marennes-Plage.JPG/1280px-Site_de_Marennes-Plage.JPG",
    fr: "Une balade plate au ras de l’eau : la plage de Marennes, le chenal de La Cayenne et les cabanes, face au viaduc de la Seudre.",
    en: "A flat waterside walk: Marennes beach, the La Cayenne channel and the oyster huts, facing the Seudre viaduct.",
  },
  {
    slug: "surf-autour-de-marennes",
    name: "Surfer autour de Marennes",
    city: "Marennes",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Vert_bois_-_2016a.jpg/1280px-Vert_bois_-_2016a.jpg",
    fr: "Marennes n’a pas de vague, mais elle est au centre du triangle : Vert-Bois, Gatseau et Ronce sont tous à moins de 30 minutes.",
    en: "Marennes has no waves of its own, but it sits at the centre of the triangle: Vert-Bois, Gatseau and Ronce are all under 30 minutes away.",
  },
];
