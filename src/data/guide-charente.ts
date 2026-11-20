// Guide Charente-Maritime-Maritime — contenu éditorial du blog
// Restaurants, hôtels (étoilés), randonnées et lieux à visiter.
// Photos : Wikimedia Commons (licences libres), 3 par article.

// Guide limité à Marennes-Hiers-Brouage et Ciré-d'Aunis.
export type GuideCategory = "restaurant" | "hotel" | "randonnee" | "visite" | "surf";
export type Dept = "17";

export type GuideEntry = {
  slug: string;
  category: GuideCategory;
  dept: Dept;
  name: string;
  /** Titre anglais de l'article (fallback : `name`). */
  nameEn?: string;
  city: string;
  /** Classement hôtelier officiel (étoiles) — hôtels uniquement. */
  stars?: 1 | 2 | 3 | 4 | 5;
  /** Distinctions Michelin — restaurants uniquement. */
  michelin?: 1 | 2;
  /** Infos pratiques : durée, distance, difficulté… */
  facts: { fr: string; en: string }[];
  fr: { teaser: string; history: string; tips: string };
  en: { teaser: string; history: string; tips: string };
  photos: [string, string, string];
};

export const GUIDE_ENTRIES: GuideEntry[] = [
  {
    slug: "cabanes-ostreicoles-marennes-oleron",
    category: "restaurant",
    dept: "17",
    name: "Les cabanes ostréicoles",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Dégustation d'huîtres en cabane", en: "Oyster tasting in a hut" },
      { fr: "Bassin Marennes-Oléron (IGP)", en: "Marennes-Oléron basin (PGI)" },
      { fr: "Toute l'année, midi surtout", en: "All year, mainly lunchtime" },
    ],
    fr: {
      teaser:
        "Tables de bois, seau d'huîtres, crevettes grises et vin blanc frais : le repas le plus authentique de la côte.",
      history:
        "Le bassin de Marennes-Oléron est le premier bassin ostréicole d'Europe. Ses claires — anciens marais salants reconvertis au XIXᵉ siècle, quand le sel a cessé d'être rentable — donnent aux huîtres l'affinage lent et le célèbre reflet vert dû à une micro-algue, la navicule bleue. La fine de claire et la pousse en claire y sont nées ; l'IGP protège aujourd'hui ce savoir-faire, transmis de génération en génération dans des cabanes colorées alignées au bord des chenaux.",
      tips: "Prévoyez des chaussures fermées : les chenaux sont boueux. Un chauffeur permet de goûter le vin sans compter les verres.",
    },
    en: {
      teaser:
        "Wooden tables, a bucket of oysters, grey shrimp and chilled white wine: the coast's most authentic meal.",
      history:
        "The Marennes-Oléron basin is Europe's leading oyster area. Its claires — former salt pans converted in the 19th century when salt lost its value — give oysters their slow refining and famous green sheen, produced by a micro-algae, the blue navicula. Fine de claire and pousse en claire were born here; a PGI now protects this know-how, passed down in the colourful huts lining the channels.",
      tips: "Wear closed shoes: the channels are muddy. A driver means you can taste the wine without counting glasses.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Phare_de_Chassiron%2C_Ol%C3%A9ron.jpg/1920px-Phare_de_Chassiron%2C_Ol%C3%A9ron.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Vue_originale_du_phare_de_Chassiron_%28Ol%C3%A9ron%29.JPG/1920px-Vue_originale_du_phare_de_Chassiron_%28Ol%C3%A9ron%29.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Les_Hu%C3%AEtres_de_Trousse_Chemise_%282%29.JPG/1920px-Les_Hu%C3%AEtres_de_Trousse_Chemise_%282%29.JPG",
    ],
  },
  {
    slug: "marais-de-brouage",
    category: "randonnee",
    dept: "17",
    name: "Marais de Brouage",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Boucle de 10 km autour de la citadelle", en: "10 km loop around the citadel" },
      { fr: "Observation d'oiseaux (cigognes)", en: "Birdwatching (storks)" },
      { fr: "Plat, sans ombre", en: "Flat, no shade" },
    ],
    fr: {
      teaser: "Un océan d'herbe où flotte une citadelle de pierre : le marais le plus étrange de la côte atlantique.",
      history:
        "Brouage fut au XVIᵉ siècle l'un des premiers ports à sel d'Europe, exportant vers la Hollande et la Baltique ; Samuel de Champlain, fondateur de Québec, y naquit vers 1570. Richelieu en fit une place forte royale et fit élever les remparts que l'on parcourt aujourd'hui. Puis la mer se retira, l'envasement isola la ville, et l'ancien golfe devint ce marais de 16 000 hectares, désormais réserve pour cigognes blanches, busards et échasses.",
      tips: "Le meilleur moment : lever du soleil, quand la brume couvre le marais. Jumelles recommandées.",
    },
    en: {
      teaser: "An ocean of grass with a stone citadel floating in it: the strangest marsh on the Atlantic coast.",
      history:
        "In the 16th century Brouage was one of Europe's leading salt ports, shipping to Holland and the Baltic; Samuel de Champlain, founder of Quebec, was born here around 1570. Richelieu made it a royal stronghold and raised the ramparts you can still walk. Then the sea withdrew, silt cut the town off, and the former gulf became this 16,000-hectare marsh, now a haven for white storks, harriers and stilts.",
      tips: "Best at sunrise, when mist covers the marsh. Binoculars recommended.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/969_-_Rempart_de_la_citadelle_-_Brouage.jpg/1920px-969_-_Rempart_de_la_citadelle_-_Brouage.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Brouage-Remparts.jpg/1920px-Brouage-Remparts.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/972_-_Rempart_de_la_citadelle_-_Brouage.jpg/1920px-972_-_Rempart_de_la_citadelle_-_Brouage.jpg",
    ],
  },
  {
    slug: "visiter-marennes-hiers-brouage",
    category: "visite",
    dept: "17",
    name: "Visiter Marennes-Hiers-Brouage",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Monument & patrimoine", en: "Landmarks & heritage" },
      { fr: "Secteur : Bassin de Marennes", en: "Area: Bassin de Marennes" },
      { fr: "Prise en charge au départ de Marennes", en: "Pick-up from Marennes" },
    ],
    fr: {
      teaser: "Citadelle de Brouage, halle aux vivres, clocher de Marennes et cité de l'huître.",
      history:
        "Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP : la Marennes-Oléron affinée en claires.",
      tips: "Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande.",
    },
    en: {
      teaser: "Brouage citadel, the victuals hall, Marennes bell tower and the oyster centre.",
      history:
        "Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds.",
      tips: "Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/17219-Marennes-Hiers-Brouage-argile.jpg/1920px-17219-Marennes-Hiers-Brouage-argile.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Marennes-Hiers-Brouage_OSM_01.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Marennes-Eglise.jpg/1920px-Marennes-Eglise.jpg",
    ],
  },
  {
    slug: "randonnees-et-balades-a-marennes-hiers-brouage",
    category: "randonnee",
    dept: "17",
    name: "Randonnées et balades à Marennes-Hiers-Brouage",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Balade nature", en: "Nature walk" },
      { fr: "Secteur : Bassin de Marennes", en: "Area: Bassin de Marennes" },
      { fr: "Prise en charge au départ de Marennes", en: "Pick-up from Marennes" },
    ],
    fr: {
      teaser: "Boucle des marais de Brouage : 12 km plats entre claires, canaux et hérons.",
      history:
        "Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP : la Marennes-Oléron affinée en claires.",
      tips: "Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande.",
    },
    en: {
      teaser: "The Brouage marsh loop: 12 flat kilometres between oyster ponds, canals and herons.",
      history:
        "Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds.",
      tips: "Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/17219-Marennes-Hiers-Brouage-argile.jpg/1920px-17219-Marennes-Hiers-Brouage-argile.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Marennes-Hiers-Brouage_OSM_01.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Marennes-Eglise.jpg/1920px-Marennes-Eglise.jpg",
    ],
  },
  {
    slug: "ou-manger-a-marennes-hiers-brouage",
    category: "restaurant",
    dept: "17",
    name: "Où manger à Marennes-Hiers-Brouage",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Tables & spécialités", en: "Tables & specialities" },
      { fr: "Secteur : Bassin de Marennes", en: "Area: Bassin de Marennes" },
      { fr: "Prise en charge au départ de Marennes", en: "Pick-up from Marennes" },
    ],
    fr: {
      teaser: "Huîtres fines et spéciales de claire, éclade de moules, sur les cabanes du chenal.",
      history:
        "Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP : la Marennes-Oléron affinée en claires.",
      tips: "Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande.",
    },
    en: {
      teaser: "Fines and spéciales de claire oysters, pine-needle mussels, in the channel-side huts.",
      history:
        "Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds.",
      tips: "Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/17219-Marennes-Hiers-Brouage-argile.jpg/1920px-17219-Marennes-Hiers-Brouage-argile.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Marennes-Hiers-Brouage_OSM_01.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Marennes-Eglise.jpg/1920px-Marennes-Eglise.jpg",
    ],
  },
  {
    slug: "ou-dormir-a-marennes-hiers-brouage",
    category: "hotel",
    dept: "17",
    name: "Où dormir à Marennes-Hiers-Brouage",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Hôtels & classement", en: "Hotels & star ratings" },
      { fr: "Secteur : Bassin de Marennes", en: "Area: Bassin de Marennes" },
      { fr: "Prise en charge au départ de Marennes", en: "Pick-up from Marennes" },
    ],
    fr: {
      teaser: "Hôtels 2 et 3 étoiles à Marennes, chambres d'hôtes dans les fermes du marais.",
      history:
        "Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP : la Marennes-Oléron affinée en claires.",
      tips: "Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande.",
    },
    en: {
      teaser: "Two- and three-star hotels in Marennes, guesthouses in marsh farmhouses.",
      history:
        "Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds.",
      tips: "Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/17219-Marennes-Hiers-Brouage-argile.jpg/1920px-17219-Marennes-Hiers-Brouage-argile.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Marennes-Hiers-Brouage_OSM_01.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Marennes-Eglise.jpg/1920px-Marennes-Eglise.jpg",
    ],
  },
  {
    slug: "hotel-du-port-marennes",
    category: "hotel",
    dept: "17",
    name: "Hôtel du Port",
    city: "Marennes-Hiers-Brouage",
    stars: 3,
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Hôtel 3 étoiles", en: "3-star hotel" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Hôtel du Port à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Hôtel du Port in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "hotel-de-la-plage-marennes",
    category: "hotel",
    dept: "17",
    name: "Hôtel de la Plage",
    city: "Marennes-Hiers-Brouage",
    stars: 2,
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Hôtel 2 étoiles", en: "2-star hotel" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Hôtel de la Plage à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Hôtel de la Plage in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "hotel-le-relais-atlantique-marennes",
    category: "hotel",
    dept: "17",
    name: "Hôtel Le Relais Atlantique",
    city: "Marennes-Hiers-Brouage",
    stars: 4,
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Hôtel 4 étoiles", en: "4-star hotel" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Hôtel Le Relais Atlantique à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Hôtel Le Relais Atlantique in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "la-table-du-pertuis-marennes",
    category: "restaurant",
    dept: "17",
    name: "La Table du Pertuis",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Cuisine régionale et produits de la mer", en: "Regional cuisine and seafood" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "La Table du Pertuis à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "La Table du Pertuis in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "le-comptoir-des-huitres-marennes",
    category: "restaurant",
    dept: "17",
    name: "Le Comptoir des Huîtres",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Cuisine régionale et produits de la mer", en: "Regional cuisine and seafood" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Le Comptoir des Huîtres à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Le Comptoir des Huîtres in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "sentier-du-littoral-marennes",
    category: "randonnee",
    dept: "17",
    name: "Sentier du littoral",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Balade familiale, terrain plat", en: "Family walk, flat terrain" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Sentier du littoral à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Coastal footpath in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "eglise-et-centre-historique-marennes",
    category: "visite",
    dept: "17",
    name: "Église et centre historique",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Ouvert toute l'année", en: "Open all year" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Église et centre historique à Marennes, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Church and historic centre in Marennes, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200",
    ],
  },
  {
    slug: "hotel-du-port-brouage",
    category: "hotel",
    dept: "17",
    name: "Hôtel du Port",
    city: "Marennes-Hiers-Brouage",
    stars: 3,
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Hôtel 3 étoiles", en: "3-star hotel" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Hôtel du Port à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Hôtel du Port in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
    ],
  },
  {
    slug: "hotel-de-la-plage-brouage",
    category: "hotel",
    dept: "17",
    name: "Hôtel de la Plage",
    city: "Marennes-Hiers-Brouage",
    stars: 2,
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Hôtel 2 étoiles", en: "2-star hotel" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Hôtel de la Plage à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Hôtel de la Plage in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
    ],
  },
  {
    slug: "hotel-le-relais-atlantique-brouage",
    category: "hotel",
    dept: "17",
    name: "Hôtel Le Relais Atlantique",
    city: "Marennes-Hiers-Brouage",
    stars: 4,
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Hôtel 4 étoiles", en: "4-star hotel" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Hôtel Le Relais Atlantique à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Hôtel Le Relais Atlantique in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
    ],
  },
  {
    slug: "la-table-du-pertuis-brouage",
    category: "restaurant",
    dept: "17",
    name: "La Table du Pertuis",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Cuisine régionale et produits de la mer", en: "Regional cuisine and seafood" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "La Table du Pertuis à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "La Table du Pertuis in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
    ],
  },
  {
    slug: "le-comptoir-des-huitres-brouage",
    category: "restaurant",
    dept: "17",
    name: "Le Comptoir des Huîtres",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Cuisine régionale et produits de la mer", en: "Regional cuisine and seafood" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Le Comptoir des Huîtres à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Le Comptoir des Huîtres in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
    ],
  },
  {
    slug: "sentier-du-littoral-brouage",
    category: "randonnee",
    dept: "17",
    name: "Sentier du littoral",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Balade familiale, terrain plat", en: "Family walk, flat terrain" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Sentier du littoral à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Coastal footpath in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
    ],
  },
  {
    slug: "eglise-et-centre-historique-brouage",
    category: "visite",
    dept: "17",
    name: "Église et centre historique",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Commune de Charente-Maritime", en: "Town in Charente-Maritime" },
      { fr: "Ouvert toute l'année", en: "Open all year" },
      { fr: "Proche du littoral atlantique", en: "Close to the Atlantic coast" },
    ],
    fr: {
      teaser: "Église et centre historique à Brouage, une adresse représentative du charme de la Charente-Maritime.",
      history:
        "Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique : ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire.",
      tips: "Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte.",
    },
    en: {
      teaser: "Church and historic centre in Brouage, a fine example of Charente-Maritime's coastal charm.",
      history:
        "Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism.",
      tips: "Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200",
    ],
  },
  {
    slug: "guide-marennes-capitale-de-l-huitre",
    category: "visite",
    dept: "17",
    name: "Guide de Marennes, capitale de l’huître",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Clocher de 85 m, panorama sur le bassin", en: "85 m bell tower, view over the basin" },
      { fr: "Port de La Cayenne et cabanes ostréicoles", en: "La Cayenne harbour and oyster huts" },
      { fr: "Base d’Access Prestige Taxi", en: "Access Prestige Taxi home base" },
    ],
    fr: {
      teaser:
        "Notre ville. Entre marais, claires et chenaux, Marennes donne son nom à l’huître la plus connue de France — et c’est d’ici que partent nos courses.",
      history:
        "Marennes s’est construite sur le sel avant de vivre de l’huître. Quand les marais salants ont cessé d’être rentables au XIXᵉ siècle, les paludiers ont transformé leurs bassins en claires : ces bassins peu profonds où l’huître s’affine lentement et prend ce reflet vert dû à la navicule bleue. Le clocher gothique de Saint-Pierre-de-Sales, haut de 85 mètres, servait d’amer aux marins du pertuis de Maumusson ; on y monte encore pour embrasser d’un regard le bassin, les marais et les kilomètres de chenaux. Au port de La Cayenne, les chalands et les cabanes colorées travaillent au rythme des marées, comme au premier jour.",
      tips: "Le marché couvert le mardi et le vendredi matin, les dégustations en cabane l’après-midi. Prise en charge immédiate depuis Marennes : nous sommes basés ici, 5j/7 de 8h à 20h.",
    },
    en: {
      teaser:
        "Our home town. Between marshes, claires and channels, Marennes gives its name to France’s best-known oyster — and every ride of ours starts here.",
      history:
        "Marennes was built on salt before it lived on oysters. When the salt pans stopped paying in the 19th century, salt workers turned their basins into claires: shallow ponds where oysters refine slowly and take on the green sheen of the blue navicula. The 85-metre Gothic tower of Saint-Pierre-de-Sales was a landmark for sailors of the Maumusson strait; you can still climb it for a sweep over the basin, the marshes and miles of channels. At La Cayenne harbour, flat-bottomed boats and colourful huts still work to the rhythm of the tides.",
      tips: "Covered market on Tuesday and Friday mornings, hut tastings in the afternoon. Immediate pick-up in Marennes: we are based here, 5 days a week, 8am to 8pm.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Marennes-17_Clocher_-porche_2013.jpg/1280px-Marennes-17_Clocher_-porche_2013.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Marennes-17_Chaland%26pont_La_Cayenne_2014.jpg/1280px-Marennes-17_Chaland%26pont_La_Cayenne_2014.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Marennes_17_Paysage_du_marais_2013.jpg/1280px-Marennes_17_Paysage_du_marais_2013.jpg",
    ],
  },
  {
    slug: "marennes-plage-et-le-port-de-la-cayenne",
    category: "randonnee",
    dept: "17",
    name: "Marennes-Plage et le port de La Cayenne",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Boucle plage / chenal : 6 km, très facile", en: "Beach & channel loop: 6 km, very easy" },
      { fr: "Vue sur le viaduc de la Seudre", en: "Views of the Seudre viaduct" },
      { fr: "Plage surveillée en juillet-août", en: "Lifeguarded in July and August" },
    ],
    fr: {
      teaser:
        "Une balade plate au ras de l’eau : la plage de Marennes, le chenal de La Cayenne et les cabanes, face au viaduc de la Seudre.",
      history:
        "Marennes-Plage est née au début du XXᵉ siècle, quand les Marennais ont aménagé une digue et une plage de sable au bout du chenal. En face, le viaduc de la Seudre, ouvert en 1972, a remplacé le bac qui reliait laborieusement les deux rives et désenclavé le pays de Marennes. Le sentier suit les digues des anciens marais salants : c’est le domaine des aigrettes, des avocettes et des cabanes ostréicoles, dont beaucoup ont été reconverties en ateliers d’artistes.",
      tips: "Idéal en poussette ou à vélo, sans dénivelé. Vent d’ouest fréquent l’après-midi : coupe-vent conseillé. Dépose et reprise possibles au parking de la plage.",
    },
    en: {
      teaser:
        "A flat waterside walk: Marennes beach, the La Cayenne channel and the oyster huts, facing the Seudre viaduct.",
      history:
        "Marennes-Plage appeared in the early 20th century when the town built a dyke and a sandy beach at the end of the channel. Opposite, the Seudre viaduct, opened in 1972, replaced the slow ferry between the two banks and opened up the Marennes area. The path follows the dykes of the old salt pans, home to egrets, avocets and oyster huts, many now turned into artists' studios.",
      tips: "Perfect with a pushchair or by bike, no climbs. Westerly wind is common in the afternoon. Drop-off and pick-up at the beach car park.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Site_de_Marennes-Plage.JPG/1280px-Site_de_Marennes-Plage.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Plage_et_viaduc_Seudre_%C3%A0_Marennes.JPG/1280px-Plage_et_viaduc_Seudre_%C3%A0_Marennes.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Marennes_17_Pont_sur_la_Seudre_2014.jpg/1280px-Marennes_17_Pont_sur_la_Seudre_2014.jpg",
    ],
  },
  {
    slug: "taxi-a-marennes-chauffeur-prive",
    category: "visite",
    dept: "17",
    name: "Taxi à Marennes : votre chauffeur privé pour tous vos trajets",
    nameEn: "Taxi in Marennes: your private driver for every journey",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Basés à Marennes, 5j/7 de 8h à 20h", en: "Based in Marennes, 5 days a week, 8am-8pm" },
      { fr: "Transport médical conventionné", en: "Approved medical transport" },
      { fr: "Jusqu’à 7 passagers avec le van", en: "Up to 7 passengers in the van" },
    ],
    fr: {
      teaser:
        "Alain et Patricia, vos deux chauffeurs de taxi basés à Marennes : gares, aéroports, rendez-vous médicaux, sorties et trajets longue distance au départ de Marennes-Hiers-Brouage.",
      history:
        "Access Prestige Taxi est né à Marennes, au cœur du bassin de Marennes-Oléron. Notre entreprise est basée en Charente-Maritime, et c’est à Marennes-Hiers-Brouage que nous prenons nos clients en charge. Nos courses les plus fréquentes sont simples : une prise en charge à domicile pour prendre un train ou un avion, un rendez-vous médical, une visite de la citadelle de Brouage, une sortie au restaurant sans se soucier du retour. Patricia conduit une BMW iX1 100 % électrique, Alain une Audi Q6 e-tron et un van Mercedes Classe V qui accueille jusqu’à 7 personnes avec les bagages. Sièges enfant et siège bébé sont disponibles sur simple demande, et le transport sanitaire assis est conventionné.",
      tips: "Réservez la veille pour les trains tôt le matin et les vols. Pour un groupe, une famille ou un vol avec bagages, demandez le van dès la réservation. Nous prenons nos clients en charge à Marennes-Hiers-Brouage et assurons aussi les longues distances.",
    },
    en: {
      teaser:
        "Alain and Patricia, your two taxi drivers based in Marennes: stations, airports, medical appointments, evenings out and long-distance rides from Marennes-Hiers-Brouage.",
      history:
        "Access Prestige Taxi was born in Marennes, in the heart of the Marennes-Oléron basin. Our business is based in Charente-Maritime, and we pick our clients up in Marennes-Hiers-Brouage. Our most frequent rides are simple ones: a door-to-door pick-up for a train or a flight, a medical appointment, a visit to the Brouage citadel, dinner out without worrying about the drive home. Patricia drives a fully electric BMW iX1, Alain an Audi Q6 e-tron and a Mercedes V-Class van seating up to 7 people with luggage. Child and baby seats are available on request, and seated medical transport is state-approved.",
      tips: "Book the day before for early trains and flights. For a group, a family or a flight with luggage, ask for the van when booking. We pick our clients up in Marennes-Hiers-Brouage and also handle long-distance journeys.",
    },
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Marennes-17_Clocher_-porche_2013.jpg/1280px-Marennes-17_Clocher_-porche_2013.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Marennes-17_Chaland%26pont_La_Cayenne_2014.jpg/1280px-Marennes-17_Chaland%26pont_La_Cayenne_2014.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Marennes_17_Paysage_du_marais_2013.jpg/1280px-Marennes_17_Paysage_du_marais_2013.jpg",
    ],
  },
  {
    slug: "visiter-brouage-et-le-bassin-de-marennes-oleron",
    category: "visite",
    dept: "17",
    name: "Visiter Brouage et le bassin de Marennes-Oléron en toute tranquillité",
    nameEn: "Visiting Brouage and the Marennes-Oléron basin, stress-free",
    city: "Marennes-Hiers-Brouage",
    facts: [
      { fr: "Citadelle de Brouage à 10 min de Marennes", en: "Brouage citadel 10 min from Marennes" },
      { fr: "Remparts du XVIIᵉ siècle, entrée libre", en: "17th-century ramparts, free access" },
      { fr: "Boucle conseillée : 3 à 4 heures", en: "Suggested loop: 3 to 4 hours" },
    ],
    fr: {
      teaser:
        "Une demi-journée entre la citadelle de Brouage, les marais et les cabanes ostréicoles du bassin de Marennes-Oléron, sans chercher de place de parking.",
      history:
        "Brouage fut un port de mer et la capitale européenne du sel avant que ses marais ne s’envasent et ne l’éloignent de l’océan. Ville natale de Samuel de Champlain, fondateur de Québec, elle a été fortifiée au XVIIᵉ siècle et conserve un rempart quasi complet, ses portes, ses poudrières et sa halle aux vivres, aujourd’hui posés au milieu des prés salés. Autour, le bassin de Marennes-Oléron vit toujours de l’huître : les claires, ces bassins peu profonds hérités des salines, affinent les fines et les spéciales dont la couleur verte vient d’une algue microscopique. Les chenaux de La Cayenne alignent les cabanes de bois colorées où l’on déguste sur le pouce, face aux parcs découverts à marée basse.",
      tips: "Parcours suggéré : remparts de Brouage en fin de matinée, déjeuner d’huîtres dans une cabane de La Cayenne, puis marais et viaduc de la Seudre en fin d’après-midi pour la lumière. Nous vous déposons à chaque étape et restons joignables entre deux.",
    },
    en: {
      teaser:
        "Half a day between the Brouage citadel, the marshes and the oyster huts of the Marennes-Oléron basin — with no parking to look for.",
      history:
        "Brouage was a seaport and Europe's salt capital before its marshes silted up and left it inland. Birthplace of Samuel de Champlain, founder of Quebec, it was fortified in the 17th century and still has an almost complete rampart, its gates, powder magazines and provisions hall, now set among salt meadows. Around it, the Marennes-Oléron basin still lives on oysters: the claires, shallow ponds inherited from the salt pans, refine the fines and spéciales whose green tint comes from a microscopic alga. The channels of La Cayenne are lined with colourful wooden huts where you can taste on the spot, facing beds uncovered at low tide.",
      tips: "Suggested route: the Brouage ramparts late morning, an oyster lunch in a hut at La Cayenne, then the marshes and the Seudre viaduct late afternoon for the light. We drop you at each stop and stay reachable in between.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Citadelle.jpg?width=1280",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle%20de%20Hiers-Brouage%20-%20vue%20Est.jpg?width=1280",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Marennes-17_Chaland%26pont_La_Cayenne_2014.jpg/1280px-Marennes-17_Chaland%26pont_La_Cayenne_2014.jpg",
    ],
  },
  {
    slug: "taxi-a-cire-d-aunis",
    category: "visite",
    dept: "17",
    name: "Taxi à Ciré-d'Aunis : rendez-vous, gares et sorties",
    nameEn: "Taxi in Ciré-d'Aunis: appointments, stations and outings",
    city: "Ciré-d'Aunis",
    facts: [
      { fr: "Sur réservation, 5j/7 de 8h à 20h", en: "By appointment, 5 days a week, 8am-8pm" },
      { fr: "Transport médical conventionné", en: "Approved medical transport" },
      { fr: "Jusqu’à 7 passagers avec le van", en: "Up to 7 passengers in the van" },
    ],
    fr: {
      teaser:
        "Un rendez-vous médical, un train ou une sortie depuis Ciré-d'Aunis ? Alain et Patricia viennent vous chercher à domicile, sur réservation.",
      history:
        "Ciré-d'Aunis est un village de l'Aunis traversé par le canal de Charras. Sans transport en commun pratique pour chaque trajet, un taxi sur réservation simplifie le quotidien : rendez-vous médicaux, examens, départ en train, retour de l'hôpital ou sortie en famille. Patricia conduit une BMW iX1 100 % électrique, Alain une Audi Q6 e-tron et un van Mercedes Classe V jusqu'à 7 passagers. Sièges enfant et siège bébé sont disponibles sur simple demande, et le transport sanitaire assis est conventionné.",
      tips: "Réservez la veille pour un train tôt le matin ou un rendez-vous médical. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course.",
    },
    en: {
      teaser:
        "A medical appointment, a train or an outing from Ciré-d'Aunis? Alain and Patricia pick you up at home, by appointment.",
      history:
        "Ciré-d'Aunis is a village in the Aunis area, crossed by the Charras canal. Without convenient public transport for every trip, a pre-booked taxi makes daily life easier: medical appointments, tests, catching a train, coming home from hospital or a family outing. Patricia drives a fully electric BMW iX1, Alain an Audi Q6 e-tron and a Mercedes V-Class van for up to 7 passengers. Child and baby seats are available on request, and seated medical transport is state-approved.",
      tips: "Book the day before for an early train or a medical appointment. The estimated fare is given before departure; only the meter is binding at the end of the ride.",
    },
    photos: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/234%20-%20Mairie%20-%20Cir%C3%A9%20d'Aunis.jpg?width=1280",
      "https://commons.wikimedia.org/wiki/Special:FilePath/1053%20-%20Canal%20de%20Charras%20pont%20-%20Cir%C3%A9%20d'Aunis.jpg?width=1280",
      "https://commons.wikimedia.org/wiki/Special:FilePath/002%20Cir%C3%A9%20(%2017290%20).JPG?width=1280",
    ],
  },
];

export const GUIDE_CATEGORIES: { key: GuideCategory; fr: string; en: string }[] = [
  { key: "restaurant", fr: "Restaurants", en: "Restaurants" },
  { key: "hotel", fr: "Hôtels", en: "Hotels" },
  { key: "randonnee", fr: "Randonnées", en: "Hikes" },
  { key: "visite", fr: "À visiter", en: "To visit" },
];

export const DEPTS: { key: Dept; fr: string; en: string }[] = [
  { key: "17", fr: "Charente-Maritime", en: "Charente-Maritime" },
];

/** Toutes les villes et villages couverts par le guide, triés alphabétiquement. */
export const GUIDE_CITIES: string[] = Array.from(new Set(GUIDE_ENTRIES.map((e) => e.city))).sort((a, b) =>
  a.localeCompare(b, "fr"),
);

export function getGuideEntry(slug: string): GuideEntry | undefined {
  return GUIDE_ENTRIES.find((e) => e.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Tags thématiques — dérivés du contenu éditorial (aucune donnée en dur) */
/* ------------------------------------------------------------------ */

export type GuideTag =
  "mer" | "patrimoine" | "nature" | "famille" | "terroir" | "velo" | "panorama" | "gastronomie" | "surf";

export const GUIDE_TAGS: { key: GuideTag; fr: string; en: string }[] = [
  { key: "mer", fr: "Bord de mer", en: "Seaside" },
  { key: "patrimoine", fr: "Patrimoine", en: "Heritage" },
  { key: "nature", fr: "Nature & marais", en: "Nature & marshes" },
  { key: "famille", fr: "En famille", en: "Family friendly" },
  { key: "terroir", fr: "Terroir", en: "Local produce" },
  { key: "velo", fr: "Vélo", en: "Cycling" },
  { key: "panorama", fr: "Panorama", en: "Panoramic view" },
  { key: "gastronomie", fr: "Gastronomie", en: "Fine dining" },
];

const TAG_RULES: { key: GuideTag; re: RegExp }[] = [
  { key: "mer", re: /plage|mer\b|océan|littoral|c[ôo]t[ie]|estran|port\b|phare|île|ile\b|estuaire/i },
  {
    key: "patrimoine",
    re: /ch[âa]teau|église|abbaye|roman[ea]|fortif|citadelle|mus[ée]e|histoire|vestige|donjon|remparts?/i,
  },
  { key: "nature", re: /marais|forêt|nature|oiseaux|réserve|dune|estuaire|sentier|pinède|conche/i },
  { key: "famille", re: /famille|enfant|poussette|facile|accessible|zoo|parc\b/i },
  { key: "terroir", re: /huîtres?|ostréic|cognac|pineau|march[ée]|vin\b|sel\b|salin|producteur|ferme/i },
  { key: "velo", re: /v[ée]lo|cycl|v[ée]lodyss[ée]e|piste/i },
  { key: "panorama", re: /panorama|point de vue|vue sur|belv[ée]d[èe]re|falaise/i },
  { key: "gastronomie", re: /michelin|étoil|gastronomi|chef\b|table\b/i },
];

/** Tags calculés à partir du texte FR + des infos pratiques de la fiche. */
export function guideTags(e: GuideEntry): GuideTag[] {
  const hay = [e.name, e.city, e.fr.teaser, e.fr.history, e.fr.tips, ...e.facts.map((f) => f.fr)].join(" ");
  const tags = TAG_RULES.filter((r) => r.re.test(hay)).map((r) => r.key);
  if (e.michelin && !tags.includes("gastronomie")) tags.push("gastronomie");
  if (e.category === "randonnee" && !tags.includes("nature")) tags.push("nature");
  if (e.category === "surf") {
    if (!tags.includes("surf")) tags.push("surf");
    if (!tags.includes("mer")) tags.push("mer");
  }
  return tags;
}

/** Villes/villages du guide avec le nombre de fiches, triés alphabétiquement. */
export const GUIDE_CITY_STATS: { city: string; count: number }[] = GUIDE_CITIES.map((city) => ({
  city,
  count: GUIDE_ENTRIES.filter((e) => e.city === city).length,
})).sort((a, b) => a.city.localeCompare(b.city, "fr"));

/** Normalise pour la recherche (sans accents, insensible à la casse). */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Titre de l'article dans la langue demandée (repli sur le titre français). */
export function guideName(entry: GuideEntry, isEn: boolean): string {
  return isEn ? (entry.nameEn ?? entry.name) : entry.name;
}
