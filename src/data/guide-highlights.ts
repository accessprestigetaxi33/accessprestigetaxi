// Aperçus blog affichés sur la page d'accueil.
//
// PERFORMANCE : le module `guide-charente.ts` pèse ~700 Ko une fois compilé.
// L'importer depuis la home obligeait chaque visiteur à télécharger tout le
// guide avant l'interactivité. On ne garde donc ici que les 3 cartes mises en
// avant (hôtel / restaurant / visite). Si vous changez ces articles, mettez à
// jour les slugs ci-dessous — ils doivent exister dans guide-charente.ts.
export type GuideHighlight = {
  slug: string;
  name: string;
  city: string;
  photo: string;
  fr: string;
  en: string;
};

export const GUIDE_HIGHLIGHTS: GuideHighlight[] = [
  {"slug": "hotel-la-monnaie-la-rochelle", "name": "Hôtel La Monnaie", "city": "La Rochelle", "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/La_rochelle%2C_Le_vieux_port.JPG/960px-La_rochelle%2C_Le_vieux_port.JPG", "fr": "L'ancien atelier monétaire du roi, cour d'honneur et pierre blonde, à cent mètres des tours du port.", "en": "The king's former mint, with a grand courtyard and golden stone, a hundred metres from the harbour towers."},
  {"slug": "christopher-coutanceau-la-rochelle", "name": "Christopher Coutanceau", "city": "La Rochelle", "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/La_rochelle%2C_Le_vieux_port.JPG/960px-La_rochelle%2C_Le_vieux_port.JPG", "fr": "La grande table marine de l'Atlantique : poissons de ligne, coquillages du pertuis et une salle ouverte sur l'océan.", "en": "The great Atlantic seafood table: line-caught fish, shellfish from the pertuis and a dining room open to the ocean."},
  {"slug": "corderie-royale-rochefort", "name": "Corderie Royale de Rochefort", "city": "Rochefort", "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Corderie-Royale-de-l%27Arsenal-de-Rochefort%2C_Charente-Maritime%2C-France-DSC_5828.jpg/960px-Corderie-Royale-de-l%27Arsenal-de-Rochefort%2C_Charente-Maritime%2C-France-DSC_5828.jpg", "fr": "Le plus long bâtiment industriel d'Europe au XVIIᵉ siècle : 374 mètres de pierre pour fabriquer les cordages du roi.", "en": "Europe's longest industrial building in the 17th century: 374 metres of stone to make the king's ropes."}
];
