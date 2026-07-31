// Guide Charente & Charente-Maritime — contenu éditorial du blog
// Restaurants, hôtels (étoilés), randonnées et lieux à visiter.
// Photos : Wikimedia Commons (licences libres), 3 par article.

export type GuideCategory = "restaurant" | "hotel" | "randonnee" | "visite";
export type Dept = "16" | "17";

export type GuideEntry = {
  slug: string;
  category: GuideCategory;
  dept: Dept;
  name: string;
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

const P = {
  angouleme: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Angoul%C3%AAme_16_Fa%C3%A7ade_cath%C3%A9drale_2014.JPG/1920px-Angoul%C3%AAme_16_Fa%C3%A7ade_cath%C3%A9drale_2014.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/008_Angoul%C3%AAme_cath%C3%A9drale_Saint-Pierre_le_portail.JPG/1920px-008_Angoul%C3%AAme_cath%C3%A9drale_Saint-Pierre_le_portail.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Angoul%C3%AAme_16_Le_plateau_vu_de_Saint-Martin_2014.jpg/1920px-Angoul%C3%AAme_16_Le_plateau_vu_de_Saint-Martin_2014.jpg",
  ],
  angoulemeVille: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Angoul%C3%AAme_Rue_des_Trois-Notre-Dame.jpg/1920px-Angoul%C3%AAme_Rue_des_Trois-Notre-Dame.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Angoul%C3%AAme_Rue_des_Trois-fours_2012.jpg/1920px-Angoul%C3%AAme_Rue_des_Trois-fours_2012.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Angoul%C3%AAme_hdsr_DSCF0432.jpg",
  ],
  cognac: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Cognac_16_Fontaine_Fran%C3%A7ois-Ier_2014.jpg/1920px-Cognac_16_Fontaine_Fran%C3%A7ois-Ier_2014.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cognac_16-Fontaine_F-1er%26tourelle_sud.JPG/1920px-Cognac_16-Fontaine_F-1er%26tourelle_sud.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Cognac_16_Linteau%26chiffre_Fran%C3%A7ois_Ier_2014.JPG/1920px-Cognac_16_Linteau%26chiffre_Fran%C3%A7ois_Ier_2014.JPG",
  ],
  chais: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Monnet_Cognac_ChaisCathedrale.jpg/1920px-Monnet_Cognac_ChaisCathedrale.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Monnet_Cognac_Bar.jpg/1920px-Monnet_Cognac_Bar.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Monnet_Cognac_Gate.jpg/1920px-Monnet_Cognac_Gate.jpg",
  ],
  aubeterre: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_02.JPG/1920px-%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_02.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_18.JPG/1920px-%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_18.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_17.JPG/1920px-%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_17.JPG",
  ],
  bourgCharente: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Bourg-Charente_chateau.JPG/1920px-Bourg-Charente_chateau.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/4/4a/Bourg-ch_castle1.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/7/78/Ch%C3%A2teau_de_Cress%C3%A9_%28Bourg-Charente%29.jpg",
  ],
  jarnac: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Jarnac_16_Quai_de_l%27Orangerie%26bateaux_de_plaisance_2014.JPG/1920px-Jarnac_16_Quai_de_l%27Orangerie%26bateaux_de_plaisance_2014.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/e/ea/Jarnac_pont_Charente.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/1f/Jarnac_Quai_Fontbadant.jpg",
  ],
  confolens: [
    "https://upload.wikimedia.org/wikipedia/commons/f/f9/Confolens_et_la_Vienne_Confolens_and_Vienne_river_%284648325486%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e4/Vienne_%26_pt._Vieux%2C_Confo_%2816%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Confolens_%284648328702%29.jpg/1920px-Confolens_%284648328702%29.jpg",
  ],
  braconne: [
    "https://upload.wikimedia.org/wikipedia/commons/6/67/Braconne_parking.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/d/d3/Braconne_fosse_mobile2.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/Puym_roch4.JPG",
  ],
  eauxClaires: [
    "https://upload.wikimedia.org/wikipedia/commons/2/27/Puym_roch.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/c/c4/Puym_roch3.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/Puym_roch4.JPG",
  ],
  laRochelle: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/La_rochelle%2C_Le_vieux_port.JPG/1920px-La_rochelle%2C_Le_vieux_port.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg/1920px-Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/021_-_CityMobyl2_-_La_Rochelle.jpg/1280px-021_-_CityMobyl2_-_La_Rochelle.jpg",
  ],
  laRochelle2: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg/1920px-Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/021_-_CityMobyl2_-_La_Rochelle.jpg/1280px-021_-_CityMobyl2_-_La_Rochelle.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/La_rochelle%2C_Le_vieux_port.JPG/1920px-La_rochelle%2C_Le_vieux_port.JPG",
  ],
  rochefort: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Corderie-Royale-de-l%27Arsenal-de-Rochefort%2C_Charente-Maritime%2C-France-DSC_5828.jpg/1920px-Corderie-Royale-de-l%27Arsenal-de-Rochefort%2C_Charente-Maritime%2C-France-DSC_5828.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France--DSC_5863.jpg/1920px-Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France--DSC_5863.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France-DSC_5860.jpg/1920px-Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France-DSC_5860.jpg",
  ],
  oleron: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Vue_originale_du_phare_de_Chassiron_%28Ol%C3%A9ron%29.JPG/1920px-Vue_originale_du_phare_de_Chassiron_%28Ol%C3%A9ron%29.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Phare_de_Chassiron%2C_Ol%C3%A9ron.jpg/1920px-Phare_de_Chassiron%2C_Ol%C3%A9ron.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Les_Hu%C3%AEtres_de_Trousse_Chemise_%282%29.JPG/1920px-Les_Hu%C3%AEtres_de_Trousse_Chemise_%282%29.JPG",
  ],
  ileDeRe: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Saint-Martin-de-R%C3%A9%2C_port%2C_close-up%2C_R%C3%A9_island%2C_Charente-Maritime.jpg/1920px-Saint-Martin-de-R%C3%A9%2C_port%2C_close-up%2C_R%C3%A9_island%2C_Charente-Maritime.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lighthouse%2C_harbor_Saint-Martin-de-R%C3%A9%2C_R%C3%A9_island%2C_Charente-Maritime%2C_France.jpg/1920px-Lighthouse%2C_harbor_Saint-Martin-de-R%C3%A9%2C_R%C3%A9_island%2C_Charente-Maritime%2C_France.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Entrance_harbor%2C_Saint-Martin%2C_R%C3%A9_island%2C_august_2015.jpg/1920px-Entrance_harbor%2C_Saint-Martin%2C_R%C3%A9_island%2C_august_2015.jpg",
  ],
  brouage: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Brouage-Remparts.jpg/1920px-Brouage-Remparts.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/969_-_Rempart_de_la_citadelle_-_Brouage.jpg/1920px-969_-_Rempart_de_la_citadelle_-_Brouage.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/972_-_Rempart_de_la_citadelle_-_Brouage.jpg/1920px-972_-_Rempart_de_la_citadelle_-_Brouage.jpg",
  ],
  laCoubre: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Le_phare_de_La_Coubre_-_mai_2012.JPG/1920px-Le_phare_de_La_Coubre_-_mai_2012.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/1/14/Phare_de_la_Coubre_-_La_Tremblade.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Plage_et_phare_de_la_Coubre_-_panoramio.jpg/1920px-Plage_et_phare_de_la_Coubre_-_panoramio.jpg",
  ],
  saintes: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Arc_de_Germanicus_%28Saintes%2C_France%2C_2015%29_05.jpg/1920px-Arc_de_Germanicus_%28Saintes%2C_France%2C_2015%29_05.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_01.jpg/1920px-Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_04.jpg/1920px-Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_04.jpg",
  ],
  royan: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/00_4633_%C3%89glise_Notre-Dame_de_Royan_-_Frankreich.jpg/1920px-00_4633_%C3%89glise_Notre-Dame_de_Royan_-_Frankreich.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Le_Front_de_mer_%C3%A0_Pontaillac%2C_Royan_-_panoramio.jpg/1920px-Le_Front_de_mer_%C3%A0_Pontaillac%2C_Royan_-_panoramio.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Front_de_mer%2C_%C3%A0_Pontaillac.jpg/1920px-Front_de_mer%2C_%C3%A0_Pontaillac.jpg",
  ],
  talmont: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Talmont_17_%C3%89glise_remparts_2013.jpg/1920px-Talmont_17_%C3%89glise_remparts_2013.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Talmont-sur-Gironde_17_%C3%89glise_fa%C3%A7ade_NNW.jpg/1920px-Talmont-sur-Gironde_17_%C3%89glise_fa%C3%A7ade_NNW.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Talmont-sur-Gironde_17_%C3%89glise_chevet_2013.jpg/1920px-Talmont-sur-Gironde_17_%C3%89glise_chevet_2013.jpg",
  ],
  fortBoyard: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Fort_Boyard_%2851269094270%29.jpg/1920px-Fort_Boyard_%2851269094270%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/Sunset_over_Fort_Boyard_%281%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/4b/Vigie_fort_boyard2.JPG",
  ],
  saintJeanDAngely: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg/1920px-Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Saint-Jean-d%27Ang%C3%A9ly-Abbaye-Cloitre.jpg/1920px-Saint-Jean-d%27Ang%C3%A9ly-Abbaye-Cloitre.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg/1920px-Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg",
  ],
  chatelaillon: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/003_Salles-sur-Mer_%28_17220_%29.JPG/1280px-003_Salles-sur-Mer_%28_17220_%29.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ch%C3%A2telaillon-Plage_La_grande_plage.jpg/1920px-Ch%C3%A2telaillon-Plage_La_grande_plage.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Ch%C3%A2telaillon-Plage_Rathaus.JPG/1920px-Ch%C3%A2telaillon-Plage_Rathaus.JPG",
  ],
} as const;

const trio = (a: readonly string[]): [string, string, string] => [a[0], a[1], a[2]];

export const GUIDE_ENTRIES: GuideEntry[] = [
  // ────────────── RESTAURANTS ──────────────
  {
    slug: "les-sources-de-fontbelle-angouleme",
    category: "restaurant",
    dept: "16",
    name: "Les Sources de Fontbelle",
    city: "Angoulême",
    michelin: 1,
    facts: [
      { fr: "Cuisine gastronomique charentaise", en: "Charente fine dining" },
      { fr: "Une étoile Michelin", en: "One Michelin star" },
      { fr: "≈ 1 h 15 de Bordeaux", en: "≈ 1 h 15 from Bordeaux" },
    ],
    fr: {
      teaser:
        "La table étoilée d'Angoulême : produits charentais, sauces d'orfèvre et une salle contemporaine posée au pied du plateau.",
      history:
        "Angoulême, capitale historique de l'Angoumois, a bâti sa prospérité sur le papier et l'imprimerie avant de devenir la capitale mondiale de la bande dessinée. Le quartier de Fontbelle, en contrebas des remparts élevés au XIIIᵉ siècle, tirait son nom des sources qui alimentaient autrefois les moulins à papier de la Charente. C'est dans cette mémoire d'eau vive que la maison puise son identité : une cuisine de terroir — beurre de Charente-Poitou, agneau du Poitou, cagouilles, pineau et cognac — travaillée avec la précision d'un atelier d'orfèvre.",
      tips:
        "Réservez le déjeuner en semaine pour le menu du marché. Le stationnement est difficile sur le plateau : nos chauffeurs vous déposent devant la porte et reviennent vous chercher à l'heure convenue.",
    },
    en: {
      teaser:
        "Angoulême's Michelin-starred table: Charente produce, masterful sauces and a contemporary dining room below the old town.",
      history:
        "Angoulême, historic capital of the Angoumois, built its wealth on paper and printing before becoming the world capital of comics. The Fontbelle district, below ramparts raised in the 13th century, took its name from the springs that once powered the paper mills of the Charente. That memory of running water shapes the kitchen: regional produce — Charente-Poitou butter, Poitou lamb, snails, pineau and cognac — handled with a jeweller's precision.",
      tips:
        "Book a weekday lunch for the market menu. Parking on the plateau is difficult: our drivers drop you at the door and return at the agreed time.",
    },
    photos: trio(P.angouleme),
  },
  {
    slug: "la-ribaudiere-bourg-charente",
    category: "restaurant",
    dept: "16",
    name: "La Ribaudière",
    city: "Bourg-Charente",
    michelin: 1,
    facts: [
      { fr: "Terrasse au bord du fleuve Charente", en: "Terrace on the Charente river" },
      { fr: "Une étoile Michelin", en: "One Michelin star" },
      { fr: "À 10 min de Cognac", en: "10 min from Cognac" },
    ],
    fr: {
      teaser:
        "Une villa contemporaine posée sur la rive, un jardin qui descend jusqu'à l'eau et une cuisine de rivière d'une grande finesse.",
      history:
        "Bourg-Charente est dominé par son château Renaissance et son église romane du XIIᵉ siècle, sentinelles d'un fleuve qui fut, jusqu'au XIXᵉ siècle, l'autoroute des eaux-de-vie. Les gabares y descendaient les barriques vers Tonnay-Charente et l'Atlantique — un trafic qui a fait la fortune des maisons de cognac voisines. La table s'est installée sur cette rive marchande, face aux prairies inondables, et cuisine ce que le fleuve et le vignoble apportent : anguille, sandre, caviar de Gironde, pineau des Charentes.",
      tips:
        "Demandez une table côté jardin au coucher du soleil. Accord cognac-dessert incontournable — d'où l'intérêt d'un chauffeur pour le retour.",
    },
    en: {
      teaser:
        "A contemporary villa on the riverbank, a garden sloping to the water and refined river cuisine.",
      history:
        "Bourg-Charente is watched over by its Renaissance château and 12th-century Romanesque church, sentinels of a river that was, until the 19th century, the motorway of brandy. Flat-bottomed gabares carried barrels down to Tonnay-Charente and the Atlantic, building the fortunes of the neighbouring cognac houses. The restaurant sits on that merchant bank, facing the water meadows, and cooks what river and vineyard provide: eel, pike-perch, Gironde caviar and pineau des Charentes.",
      tips:
        "Ask for a garden-side table at sunset. The cognac-and-dessert pairing is a must — all the more reason to have a driver for the way home.",
    },
    photos: trio(P.bourgCharente),
  },
  {
    slug: "tables-de-jarnac",
    category: "restaurant",
    dept: "16",
    name: "Les tables des quais",
    city: "Jarnac",
    facts: [
      { fr: "Bistronomie et produits locaux", en: "Bistronomy, local produce" },
      { fr: "Vue sur les quais de la Charente", en: "Views over the Charente quays" },
      { fr: "Idéal après une visite de chai", en: "Ideal after a cellar visit" },
    ],
    fr: {
      teaser:
        "Sur les quais de Jarnac, des tables sans façon où l'on mange le fleuve, la ferme et le potager, verre de pineau à la main.",
      history:
        "Jarnac doit sa notoriété à deux choses : le « coup de Jarnac », porté en 1547 lors d'un duel resté légendaire, et les grandes maisons de cognac installées le long du fleuve depuis le XVIIIᵉ siècle. Ville natale de François Mitterrand, elle a gardé ses quais de pierre blanche, ses chais aux toits noircis par le « champignon des anges » — cette moisissure qui se nourrit des vapeurs d'alcool — et une douceur de vivre très charentaise.",
      tips:
        "Enchaînez avec la maison natale de François Mitterrand puis une promenade en gabare. Nous vous attendons au pied de l'embarcadère.",
    },
    en: {
      teaser:
        "On the Jarnac quays, unfussy tables serving the river, the farm and the kitchen garden, glass of pineau in hand.",
      history:
        "Jarnac is known for two things: the infamous 1547 duel that gave French the phrase 'coup de Jarnac', and the great cognac houses lining the river since the 18th century. Birthplace of President François Mitterrand, it has kept its pale stone quays, its cellars blackened by the 'angels' fungus' that feeds on alcohol vapours, and a very Charentais gentleness of life.",
      tips:
        "Follow up with Mitterrand's birthplace and a gabare river cruise. We wait for you at the landing stage.",
    },
    photos: trio(P.jarnac),
  },
  {
    slug: "christopher-coutanceau-la-rochelle",
    category: "restaurant",
    dept: "17",
    name: "Christopher Coutanceau",
    city: "La Rochelle",
    michelin: 2,
    facts: [
      { fr: "Deux étoiles Michelin + étoile verte", en: "Two Michelin stars + green star" },
      { fr: "Cuisinier-pêcheur, pêche durable", en: "Chef-fisherman, sustainable catch" },
      { fr: "Face à la plage de la Concurrence", en: "Facing Concurrence beach" },
    ],
    fr: {
      teaser:
        "La grande table marine de l'Atlantique : poissons de ligne, coquillages du pertuis et une salle ouverte sur l'océan.",
      history:
        "La Rochelle vit du large depuis le XIIᵉ siècle : port franc médiéval, place forte protestante assiégée par Richelieu en 1627-1628, puis port négrier et enfin capitale de la voile. Les trois tours qui gardent le chenal — Saint-Nicolas, la Chaîne et la Lanterne — rappellent qu'on fermait le port d'une chaîne chaque nuit. La maison Coutanceau, installée face à la plage depuis trois générations, a fait de la pêche locale et raisonnée un manifeste, jusqu'à obtenir l'étoile verte de la gastronomie durable.",
      tips:
        "Le menu « tout poisson » se réserve plusieurs semaines à l'avance. Prévoyez une balade digestive jusqu'à la tour de la Lanterne.",
    },
    en: {
      teaser:
        "The great Atlantic seafood table: line-caught fish, shellfish from the pertuis and a dining room open to the ocean.",
      history:
        "La Rochelle has lived from the sea since the 12th century: a medieval free port, a Protestant stronghold besieged by Richelieu in 1627-28, later a slave-trade port and finally France's sailing capital. The three towers guarding the channel — Saint-Nicolas, Chaîne and Lanterne — recall the chain drawn across the harbour each night. The Coutanceau family, facing the beach for three generations, turned local, responsible fishing into a manifesto, earning the Michelin green star.",
      tips:
        "The all-fish menu books out weeks ahead. Plan a post-dinner walk to the Lantern Tower.",
    },
    photos: trio(P.laRochelle),
  },
  {
    slug: "les-flots-la-rochelle",
    category: "restaurant",
    dept: "17",
    name: "Les Flots",
    city: "La Rochelle",
    facts: [
      { fr: "Bistrot marin au pied de la tour de la Chaîne", en: "Seafood bistro by the Chain Tower" },
      { fr: "Huîtres Marennes-Oléron", en: "Marennes-Oléron oysters" },
      { fr: "Ouvert midi et soir", en: "Open lunch and dinner" },
    ],
    fr: {
      teaser:
        "Le classique du Vieux-Port : plateau de fruits de mer, blanc de la côte et vue sur les mâts.",
      history:
        "Le Vieux-Port, creusé dès le Moyen Âge dans une anse naturelle, fut le cœur battant du commerce du sel et du vin vers l'Angleterre et les Flandres. Les maisons à arcades des rues voisines datent des XVIᵉ-XVIIIᵉ siècles, quand les armateurs protestants faisaient bâtir en pierre de Crazannes. L'établissement occupe une ancienne maison de pilotes, à quelques mètres de la chaîne qui verrouillait autrefois l'entrée du port.",
      tips:
        "Arrivez tôt en été : le quartier est piéton et très fréquenté. Dépose-minute possible côté Cours des Dames.",
    },
    en: {
      teaser:
        "The Old Port classic: seafood platter, coastal white wine and a view over the masts.",
      history:
        "Dug out of a natural cove in the Middle Ages, the Old Port was the beating heart of the salt and wine trade with England and Flanders. The arcaded houses nearby date from the 16th-18th centuries, when Protestant shipowners built in Crazannes stone. The restaurant occupies a former pilots' house, steps from the chain that once locked the harbour entrance.",
      tips:
        "Come early in summer: the quarter is pedestrian and busy. Drop-off possible on Cours des Dames.",
    },
    photos: trio(P.laRochelle2),
  },
  {
    slug: "cabanes-ostreicoles-marennes-oleron",
    category: "restaurant",
    dept: "17",
    name: "Les cabanes ostréicoles",
    city: "Marennes-Oléron",
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
      tips:
        "Prévoyez des chaussures fermées : les chenaux sont boueux. Un chauffeur permet de goûter le vin sans compter les verres.",
    },
    en: {
      teaser:
        "Wooden tables, a bucket of oysters, grey shrimp and chilled white wine: the coast's most authentic meal.",
      history:
        "The Marennes-Oléron basin is Europe's leading oyster area. Its claires — former salt pans converted in the 19th century when salt lost its value — give oysters their slow refining and famous green sheen, produced by a micro-algae, the blue navicula. Fine de claire and pousse en claire were born here; a PGI now protects this know-how, passed down in the colourful huts lining the channels.",
      tips:
        "Wear closed shoes: the channels are muddy. A driver means you can taste the wine without counting glasses.",
    },
    photos: trio(P.oleron),
  },

  // ────────────── HÔTELS ──────────────
  {
    slug: "chais-monnet-cognac",
    category: "hotel",
    dept: "16",
    name: "Chais Monnet & Spa",
    city: "Cognac",
    stars: 5,
    facts: [
      { fr: "Hôtel 5 étoiles", en: "5-star hotel" },
      { fr: "Spa, piscines, jazz club", en: "Spa, pools, jazz club" },
      { fr: "Ancien chai de 1838", en: "Former 1838 cognac cellar" },
    ],
    fr: {
      teaser:
        "Un chai du XIXᵉ siècle transformé en palace contemporain : charpentes cathédrale, spa, jazz club et table gastronomique.",
      history:
        "Jean Monnet — père du négoce familial et grand-oncle du « père de l'Europe » — fonde sa maison de cognac en 1838 sur ce site de deux hectares en plein centre-ville. Les chais, avec leur charpente en carène de bateau, ont vieilli des eaux-de-vie pendant plus d'un siècle avant d'être laissés à l'abandon. Restaurés à partir de 2013 dans le respect des pierres et des poutres d'origine, ils abritent depuis 2018 l'un des rares 5 étoiles de Charente, où la mémoire du cognac se lit dans chaque volume.",
      tips:
        "La visite du chai cathédrale se fait même sans être client. Trajet gare de Cognac ou aéroport d'Angoulême assuré par nos chauffeurs.",
    },
    en: {
      teaser:
        "A 19th-century cognac warehouse turned contemporary palace: cathedral timbers, spa, jazz club and a gastronomic table.",
      history:
        "Jean Monnet — head of the family trade and great-uncle of the 'father of Europe' — founded his cognac house here in 1838, on a two-hectare site in the town centre. The cellars, with their upturned-hull roof frames, aged eaux-de-vie for over a century before falling derelict. Restored from 2013 with respect for the original stone and beams, since 2018 they have housed one of Charente's rare 5-star hotels.",
      tips:
        "The cathedral cellar can be visited even by non-guests. We handle transfers from Cognac station or Angoulême airport.",
    },
    photos: trio(P.chais),
  },
  {
    slug: "hotel-saint-gelais-angouleme",
    category: "hotel",
    dept: "16",
    name: "Hôtel Saint-Gelais",
    city: "Angoulême",
    stars: 4,
    facts: [
      { fr: "Hôtel 4 étoiles", en: "4-star hotel" },
      { fr: "Hôtel particulier du XVIIIᵉ", en: "18th-century mansion" },
      { fr: "Intra-muros, sur le plateau", en: "Inside the ramparts" },
    ],
    fr: {
      teaser:
        "Un hôtel particulier du plateau, cour pavée, jardin clos et douze chambres au calme absolu.",
      history:
        "La famille de Saint-Gelais, seigneurs de Lusignan, a marqué l'Angoumois dès le XVᵉ siècle ; Mellin de Saint-Gelais fut le poète officiel de François Iᵉʳ. L'hôtel occupe une demeure du XVIIIᵉ siècle bâtie en pierre de taille blonde, typique de l'urbanisme du plateau, à deux pas de la cathédrale Saint-Pierre et de ses 75 personnages sculptés en façade. Les remparts qui l'entourent offrent aujourd'hui l'une des plus belles promenades panoramiques du Sud-Ouest.",
      tips:
        "Idéal pendant le Festival de la BD (janvier) : réservez très tôt, et prévoyez un transfert, la ville haute est fermée à la circulation.",
    },
    en: {
      teaser:
        "A mansion on the upper town, paved courtyard, walled garden and twelve wonderfully quiet rooms.",
      history:
        "The Saint-Gelais family, lords of Lusignan, shaped the Angoumois from the 15th century; Mellin de Saint-Gelais was official poet to François I. The hotel occupies an 18th-century house of pale ashlar stone, typical of the plateau, steps from Saint-Pierre cathedral and the 75 carved figures on its façade. The surrounding ramparts offer one of south-west France's finest panoramic walks.",
      tips:
        "Ideal during the January comics festival: book far ahead and plan a transfer, as the upper town closes to traffic.",
    },
    photos: trio(P.angoulemeVille),
  },
  {
    slug: "maison-hote-vallee-eaux-claires",
    category: "hotel",
    dept: "16",
    name: "Logis de la Vallée des Eaux Claires",
    city: "Puymoyen",
    stars: 3,
    facts: [
      { fr: "Logis 3 étoiles / chambres d'hôtes", en: "3-star logis / guest rooms" },
      { fr: "Au départ des sentiers", en: "At the trailheads" },
      { fr: "10 min d'Angoulême", en: "10 min from Angoulême" },
    ],
    fr: {
      teaser:
        "Une maison de pierre au fond d'un vallon calcaire, à cinq minutes des falaises et des anciens moulins à papier.",
      history:
        "La vallée des Eaux Claires, creusée par un ruisseau affluent de la Charente, a fait vivre pendant cinq siècles les moulins à papier d'Angoumois : on y fabriquait dès le XVᵉ siècle un papier réputé jusqu'en Hollande, exporté par le fleuve. Les falaises calcaires abritent des abris sous roche occupés dès la préhistoire, et le site du Roc, classé, reste un haut lieu de l'escalade charentaise.",
      tips:
        "Parfait pour un week-end randonnée. Nos chauffeurs assurent la navette depuis la gare TGV d'Angoulême (2 h de Paris).",
    },
    en: {
      teaser:
        "A stone house at the end of a limestone valley, five minutes from the cliffs and the old paper mills.",
      history:
        "The Eaux Claires valley, carved by a tributary of the Charente, powered the Angoumois paper mills for five centuries: from the 15th century it produced paper prized as far as Holland and shipped down the river. The limestone cliffs shelter rock overhangs occupied since prehistory, and the listed Roc site remains a landmark for Charente climbers.",
      tips:
        "Perfect for a hiking weekend. We shuttle from Angoulême TGV station (2 h from Paris).",
    },
    photos: trio(P.eauxClaires),
  },
  {
    slug: "hotel-la-monnaie-la-rochelle",
    category: "hotel",
    dept: "17",
    name: "Hôtel La Monnaie",
    city: "La Rochelle",
    stars: 4,
    facts: [
      { fr: "Hôtel 4 étoiles", en: "4-star hotel" },
      { fr: "Monument historique de 1620", en: "1620 listed monument" },
      { fr: "100 m de la tour de la Lanterne", en: "100 m from the Lantern Tower" },
    ],
    fr: {
      teaser:
        "L'ancien atelier monétaire du roi, cour d'honneur et pierre blonde, à cent mètres des tours du port.",
      history:
        "L'Hôtel de la Monnaie fut construit en 1619-1620 pour frapper la monnaie royale à La Rochelle, privilège que la ville détenait depuis le Moyen Âge et qu'elle perdit après le siège de 1628. Le bâtiment, classé Monument historique, a conservé sa façade Louis XIII, sa cour pavée et ses vastes salles voûtées, aujourd'hui converties en chambres et en spa. Rares sont les hôtels français à pouvoir revendiquer une adresse où l'on battait littéralement l'argent du royaume.",
      tips:
        "Le quartier est piéton : prévoyez une dépose-minute rue Saint-Michel. Aquarium et Vieux-Port à pied.",
    },
    en: {
      teaser:
        "The king's former mint, with a grand courtyard and golden stone, a hundred metres from the harbour towers.",
      history:
        "The Hôtel de la Monnaie was built in 1619-20 to strike royal coinage in La Rochelle, a privilege the city held since the Middle Ages and lost after the 1628 siege. Listed as a Monument historique, it keeps its Louis XIII façade, paved courtyard and vaulted halls, now converted into rooms and a spa. Few French hotels can claim an address where the kingdom's silver was literally minted.",
      tips:
        "The area is pedestrian: use the rue Saint-Michel drop-off. Aquarium and Old Port on foot.",
    },
    photos: trio(P.laRochelle),
  },
  {
    slug: "hotel-de-toiras-ile-de-re",
    category: "hotel",
    dept: "17",
    name: "Hôtel de Toiras",
    city: "Saint-Martin-de-Ré",
    stars: 5,
    facts: [
      { fr: "Hôtel 5 étoiles, Relais & Châteaux", en: "5-star, Relais & Châteaux" },
      { fr: "Maison d'armateur du XVIIᵉ", en: "17th-century shipowner's house" },
      { fr: "Sur le port de Saint-Martin", en: "On Saint-Martin harbour" },
    ],
    fr: {
      teaser:
        "Une maison d'armateur sur le port, meubles d'époque et service de grande maison, au cœur des fortifications de Vauban.",
      history:
        "Saint-Martin-de-Ré porte le nom du maréchal de Toiras, qui défendit l'île contre le débarquement anglais de Buckingham en 1627. Après le siège, Vauban ceintura la ville d'une enceinte à double bastion, inscrite depuis 2008 au patrimoine mondial de l'UNESCO ; le port servit ensuite de point de départ des bagnards vers la Guyane. L'hôtel occupe une demeure d'armateur du XVIIᵉ siècle, quand les navires rétais rapportaient sel, vin et cargaisons du Nouveau Monde.",
      tips:
        "Le pont de l'île est payant et souvent chargé l'été : partez tôt. Nos véhicules électriques circulent sans restriction sur l'île.",
    },
    en: {
      teaser:
        "A shipowner's house on the harbour, period furniture and grand-hotel service, inside Vauban's fortifications.",
      history:
        "Saint-Martin-de-Ré is named after Marshal de Toiras, who defended the island against Buckingham's English landing in 1627. After the siege, Vauban ringed the town with a double-bastioned wall, UNESCO-listed since 2008; the harbour later became the departure point for convicts bound for Guiana. The hotel occupies a 17th-century shipowner's house from the days when Ré's ships brought back salt, wine and New World cargo.",
      tips:
        "The island bridge is tolled and busy in summer: leave early. Our electric cars travel the island without restriction.",
    },
    photos: trio(P.ileDeRe),
  },
  {
    slug: "relais-du-bois-saint-georges-saintes",
    category: "hotel",
    dept: "17",
    name: "Relais du Bois Saint-Georges",
    city: "Saintes",
    stars: 4,
    facts: [
      { fr: "Hôtel 4 étoiles", en: "4-star hotel" },
      { fr: "Parc de 7 hectares avec lac", en: "7-hectare park with lake" },
      { fr: "10 min de l'amphithéâtre romain", en: "10 min from the Roman arena" },
    ],
    fr: {
      teaser:
        "Un parc arboré, un lac, des chambres à thème et une piscine sous verrière, aux portes de la Saintes romaine.",
      history:
        "Saintes — Mediolanum Santonum — fut la capitale de l'Aquitaine romaine. On y voit encore l'arc de Germanicus, élevé en l'an 18-19 apr. J.-C. à l'entrée du pont sur la Charente, et un amphithéâtre creusé dans un vallon vers 40 apr. J.-C., l'un des plus anciens de Gaule, qui accueillait 15 000 spectateurs. Le Moyen Âge y ajouta l'abbaye aux Dames, fondée en 1047 et longtemps dirigée par des abbesses issues de la haute noblesse.",
      tips:
        "Base idéale entre Cognac et Royan. Demandez une chambre côté parc pour le silence.",
    },
    en: {
      teaser:
        "Wooded grounds, a lake, themed rooms and a glasshouse pool, at the gates of Roman Saintes.",
      history:
        "Saintes — Mediolanum Santonum — was the capital of Roman Aquitaine. The Arch of Germanicus, raised in AD 18-19 at the bridgehead over the Charente, still stands, as does an amphitheatre dug into a valley around AD 40, one of the oldest in Gaul, seating 15,000. The Middle Ages added the Abbaye aux Dames, founded in 1047 and long led by abbesses of high nobility.",
      tips:
        "An ideal base between Cognac and Royan. Ask for a park-side room for silence.",
    },
    photos: trio(P.saintes),
  },

  // ────────────── RANDONNÉES ──────────────
  {
    slug: "foret-de-la-braconne",
    category: "randonnee",
    dept: "16",
    name: "Forêt de la Braconne",
    city: "Brie / Jauldes",
    facts: [
      { fr: "Boucles de 5 à 18 km", en: "Loops from 5 to 18 km" },
      { fr: "Difficulté facile à moyenne", en: "Easy to moderate" },
      { fr: "20 min d'Angoulême", en: "20 min from Angoulême" },
    ],
    fr: {
      teaser:
        "4 000 hectares de chênes et de hêtres percés de gouffres spectaculaires : la grande forêt d'Angoulême.",
      history:
        "Ancienne forêt royale, la Braconne doit son relief à un sous-sol karstique : la Grande Fosse, la Fosse Limousine et la Fosse Mobile sont d'immenses effondrements circulaires creusés par la dissolution du calcaire, longtemps entourés de légendes de diables et de fées. Pendant la Seconde Guerre mondiale, la forêt abrita un vaste dépôt de munitions et servit de refuge aux maquis charentais. Elle est aujourd'hui gérée par l'ONF et sillonnée de sentiers balisés.",
      tips:
        "La Fosse Mobile est le plus impressionnant des gouffres. Prévoyez de l'eau : aucun commerce sur place.",
    },
    en: {
      teaser:
        "4,000 hectares of oak and beech punctured by spectacular sinkholes: Angoulême's great forest.",
      history:
        "A former royal forest, the Braconne owes its relief to karst geology: the Grande Fosse, Fosse Limousine and Fosse Mobile are vast circular collapses carved by dissolving limestone, long surrounded by tales of devils and fairies. During the Second World War the forest held a huge munitions depot and sheltered the Charente resistance. It is now managed by the national forestry office and criss-crossed with waymarked trails.",
      tips:
        "The Fosse Mobile is the most impressive sinkhole. Bring water: there are no shops.",
    },
    photos: trio(P.braconne),
  },
  {
    slug: "vallee-des-eaux-claires",
    category: "randonnee",
    dept: "16",
    name: "Vallée des Eaux Claires",
    city: "Puymoyen",
    facts: [
      { fr: "Boucle de 8 km, 2 h 30", en: "8 km loop, 2 h 30" },
      { fr: "Falaises, moulins, sources", en: "Cliffs, mills, springs" },
      { fr: "10 min d'Angoulême", en: "10 min from Angoulême" },
    ],
    fr: {
      teaser:
        "Falaises calcaires, ruisseau limpide et moulins à papier : la randonnée la plus photogénique d'Angoumois.",
      history:
        "Le vallon fut, du XVᵉ au XIXᵉ siècle, l'un des grands centres papetiers d'Europe : une vingtaine de moulins y battaient le chiffon pour produire un papier d'une blancheur recherchée par les imprimeurs hollandais. Le moulin du Verger, en activité depuis 1539, fabrique encore du papier à la main. Plus haut, les abris sous roche du Roc livrent des vestiges du Paléolithique, et les parois attirent les grimpeurs depuis les années 1950.",
      tips:
        "Chaussures antidérapantes : la roche est glissante après la pluie. Départ conseillé au parking du Roc.",
    },
    en: {
      teaser:
        "Limestone cliffs, a clear stream and paper mills: the most photogenic walk in the Angoumois.",
      history:
        "From the 15th to the 19th century this valley was one of Europe's great papermaking centres: some twenty mills beat rags into a paper whose whiteness Dutch printers prized. The Moulin du Verger, running since 1539, still makes paper by hand. Higher up, the Roc rock shelters have yielded Palaeolithic remains, and the walls have drawn climbers since the 1950s.",
      tips:
        "Wear grippy shoes: the rock is slippery after rain. Start from the Roc car park.",
    },
    photos: trio(P.eauxClaires),
  },
  {
    slug: "boucle-de-la-charente-jarnac",
    category: "randonnee",
    dept: "16",
    name: "Boucle de la Charente",
    city: "Jarnac / Bourg-Charente",
    facts: [
      { fr: "12 km le long du fleuve", en: "12 km along the river" },
      { fr: "Plat, accessible en famille", en: "Flat, family-friendly" },
      { fr: "Chais et écluses sur le parcours", en: "Cellars and locks en route" },
    ],
    fr: {
      teaser:
        "Un chemin de halage entre vignes de cognac, écluses et îles boisées : la Charente à hauteur d'eau.",
      history:
        "Henri IV appelait la Charente « le plus beau ruisseau du royaume ». Canalisée dès le XVIIᵉ siècle puis équipée d'écluses au XIXᵉ, elle a porté les gabares chargées de barriques jusqu'à l'Atlantique. Le chemin de halage, où des hommes et des bœufs tiraient les bateaux à contre-courant, est aujourd'hui un sentier ombragé qui relie les villages viticoles. Les prairies inondables alentour abritent loutres, hérons et une flore protégée.",
      tips:
        "Combinez la marche avec une visite de chai et un retour en taxi : pas besoin de revenir au point de départ.",
    },
    en: {
      teaser:
        "A towpath between cognac vines, locks and wooded islands: the Charente at water level.",
      history:
        "Henri IV called the Charente 'the loveliest stream in the kingdom'. Canalised from the 17th century and locked in the 19th, it carried barrel-laden gabares to the Atlantic. The towpath, where men and oxen hauled boats upstream, is now a shaded trail linking wine villages. The surrounding flood meadows shelter otters, herons and protected plants.",
      tips:
        "Combine the walk with a cellar visit and a taxi back: no need to return to your starting point.",
    },
    photos: trio(P.jarnac),
  },
  {
    slug: "sentier-des-douaniers-ile-de-re",
    category: "randonnee",
    dept: "17",
    name: "Sentier des douaniers",
    city: "Île de Ré",
    facts: [
      { fr: "Plus de 100 km de littoral", en: "Over 100 km of coastline" },
      { fr: "Marais salants et plages", en: "Salt marshes and beaches" },
      { fr: "Plat, praticable toute l'année", en: "Flat, walkable year-round" },
    ],
    fr: {
      teaser:
        "Le tour de l'île à pied : marais salants, ports blancs à volets verts, dunes et phare des Baleines.",
      history:
        "Le sentier suit le tracé des rondes que les douaniers effectuaient dès le XVIIIᵉ siècle pour surveiller la contrebande de sel et d'alcool. Le sel, « or blanc » de Ré, faisait vivre l'île depuis le Moyen Âge : les marais salants, dessinés au XIIᵉ siècle par les moines cisterciens, produisent encore une fleur de sel récoltée à la main. Le phare des Baleines, allumé en 1854, doit son nom aux cétacés que la côte échouait autrefois.",
      tips:
        "Le vent d'ouest est constant : coupe-vent conseillé même en été. Nos chauffeurs récupèrent les marcheurs à n'importe quel village.",
    },
    en: {
      teaser:
        "Walking round the island: salt marshes, white harbours with green shutters, dunes and the Whale Lighthouse.",
      history:
        "The path follows the rounds customs officers walked from the 18th century to watch for salt and alcohol smuggling. Salt, Ré's 'white gold', sustained the island from the Middle Ages: the marshes, laid out by Cistercian monks in the 12th century, still yield hand-harvested fleur de sel. The Whale Lighthouse, lit in 1854, is named after the cetaceans once stranded on this coast.",
      tips:
        "The west wind never stops: bring a windbreaker even in summer. Our drivers collect walkers in any village.",
    },
    photos: trio(P.ileDeRe),
  },
  {
    slug: "marais-de-brouage",
    category: "randonnee",
    dept: "17",
    name: "Marais de Brouage",
    city: "Hiers-Brouage",
    facts: [
      { fr: "Boucle de 10 km autour de la citadelle", en: "10 km loop around the citadel" },
      { fr: "Observation d'oiseaux (cigognes)", en: "Birdwatching (storks)" },
      { fr: "Plat, sans ombre", en: "Flat, no shade" },
    ],
    fr: {
      teaser:
        "Un océan d'herbe où flotte une citadelle de pierre : le marais le plus étrange de la côte atlantique.",
      history:
        "Brouage fut au XVIᵉ siècle l'un des premiers ports à sel d'Europe, exportant vers la Hollande et la Baltique ; Samuel de Champlain, fondateur de Québec, y naquit vers 1570. Richelieu en fit une place forte royale et fit élever les remparts que l'on parcourt aujourd'hui. Puis la mer se retira, l'envasement isola la ville, et l'ancien golfe devint ce marais de 16 000 hectares, désormais réserve pour cigognes blanches, busards et échasses.",
      tips:
        "Le meilleur moment : lever du soleil, quand la brume couvre le marais. Jumelles recommandées.",
    },
    en: {
      teaser:
        "An ocean of grass with a stone citadel floating in it: the strangest marsh on the Atlantic coast.",
      history:
        "In the 16th century Brouage was one of Europe's leading salt ports, shipping to Holland and the Baltic; Samuel de Champlain, founder of Quebec, was born here around 1570. Richelieu made it a royal stronghold and raised the ramparts you can still walk. Then the sea withdrew, silt cut the town off, and the former gulf became this 16,000-hectare marsh, now a haven for white storks, harriers and stilts.",
      tips:
        "Best at sunrise, when mist covers the marsh. Binoculars recommended.",
    },
    photos: trio(P.brouage),
  },
  {
    slug: "foret-de-la-coubre",
    category: "randonnee",
    dept: "17",
    name: "Forêt et phare de la Coubre",
    city: "La Tremblade",
    facts: [
      { fr: "8 000 ha de pins, 300 marches au phare", en: "8,000 ha of pines, 300 lighthouse steps" },
      { fr: "Pistes cyclables et sentiers dunaires", en: "Cycle paths and dune trails" },
      { fr: "20 min de Royan", en: "20 min from Royan" },
    ],
    fr: {
      teaser:
        "Pins maritimes, dunes blanches et un phare rouge et blanc qui veille sur la pointe la plus mouvante de France.",
      history:
        "La forêt de la Coubre a été plantée à partir de 1810 pour fixer des dunes qui avançaient de plusieurs mètres par an et menaçaient les villages. Le phare actuel, haut de 64 m, date de 1905 : les deux précédents avaient été emportés par l'érosion, la pointe reculant sans cesse sous l'assaut des courants du pertuis de Maumusson. Du sommet, on embrasse l'estuaire de la Gironde, l'île d'Oléron et la Grande Côte.",
      tips:
        "Baignade dangereuse sur la Grande Côte (baïnes) : préférez les plages surveillées. Ascension du phare payante.",
    },
    en: {
      teaser:
        "Maritime pines, white dunes and a red-and-white lighthouse watching over France's most shifting headland.",
      history:
        "The Coubre forest was planted from 1810 to fix dunes advancing several metres a year and threatening villages. The present 64-metre lighthouse dates from 1905: the two earlier ones were lost to erosion as the point retreated under the currents of the Maumusson strait. From the top you take in the Gironde estuary, Oléron and the Grande Côte.",
      tips:
        "Swimming on the Grande Côte is dangerous (rip channels): use supervised beaches. Lighthouse climb is ticketed.",
    },
    photos: trio(P.laCoubre),
  },

  // ────────────── À VISITER ──────────────
  {
    slug: "angouleme-remparts-et-bd",
    category: "visite",
    dept: "16",
    name: "Angoulême, remparts et bande dessinée",
    city: "Angoulême",
    facts: [
      { fr: "Cathédrale romane du XIIᵉ siècle", en: "12th-century Romanesque cathedral" },
      { fr: "Murs peints BD dans toute la ville", en: "Comic murals across the city" },
      { fr: "Festival international en janvier", en: "International festival in January" },
    ],
    fr: {
      teaser:
        "Une ville-balcon ceinte de remparts, une cathédrale sculptée et vingt-cinq murs peints signés des plus grands auteurs.",
      history:
        "Perchée sur un éperon calcaire dominant la Charente, Angoulême est occupée depuis l'Antiquité et fut le siège d'un puissant comté au Moyen Âge. Sa cathédrale Saint-Pierre, consacrée en 1128, présente une façade unique en France : plus de 70 personnages sculptés y racontent l'Ascension et le Jugement dernier. Les remparts, reconstruits aux XVIᵉ et XVIIᵉ siècles, offrent un chemin de ronde de 3 km. Depuis 1974, le Festival international de la bande dessinée a fait de la ville la capitale mondiale du 9ᵉ art, avec son musée et ses murs peints.",
      tips:
        "Commencez par le rempart Desaix au coucher du soleil, puis descendez au musée de la BD par la passerelle.",
    },
    en: {
      teaser:
        "A balcony city ringed by ramparts, a carved cathedral and twenty-five murals by leading comic artists.",
      history:
        "Perched on a limestone spur above the Charente, Angoulême has been settled since antiquity and was the seat of a powerful medieval county. Saint-Pierre cathedral, consecrated in 1128, has a façade unique in France: over 70 carved figures tell the Ascension and Last Judgement. The ramparts, rebuilt in the 16th and 17th centuries, form a 3 km walkway. Since 1974 the International Comics Festival has made the city the world capital of the ninth art, with its museum and painted walls.",
      tips:
        "Start on the Desaix rampart at sunset, then walk down to the comics museum via the footbridge.",
    },
    photos: trio(P.angouleme),
  },
  {
    slug: "cognac-chais-et-quais",
    category: "visite",
    dept: "16",
    name: "Cognac, chais et quais",
    city: "Cognac",
    facts: [
      { fr: "Maisons Hennessy, Martell, Rémy Martin", en: "Hennessy, Martell, Rémy Martin" },
      { fr: "Château de François Iᵉʳ (1494)", en: "François I's castle (1494)" },
      { fr: "Visites de chais toute l'année", en: "Cellar tours all year" },
    ],
    fr: {
      teaser:
        "La capitale mondiale de l'eau-de-vie : chais noircis, quais de pierre et dégustations dans des caves centenaires.",
      history:
        "Cognac naît du commerce du sel puis du vin, expédiés par la Charente vers l'Europe du Nord. Au XVIIᵉ siècle, les négociants hollandais font distiller le vin pour le conserver pendant les traversées : le brandewijn, « vin brûlé », devient le cognac. François Iᵉʳ y naît en 1494 dans le château des Valois, qui abrite aujourd'hui un chai. Les murs des maisons de négoce sont noircis par Baudoinia compniacensis, le « champignon des anges », qui se nourrit des vapeurs d'alcool s'échappant des fûts.",
      tips:
        "Deux visites de chais suffisent dans une journée. Dégustation oblige : confiez la conduite à nos chauffeurs.",
    },
    en: {
      teaser:
        "The world capital of brandy: blackened cellars, stone quays and tastings in century-old cellars.",
      history:
        "Cognac grew on the salt and then wine trade shipped down the Charente to northern Europe. In the 17th century Dutch merchants had the wine distilled so it would survive the voyage: brandewijn, 'burnt wine', became cognac. François I was born here in 1494 in the Valois castle, which now houses a cellar. The merchant houses' walls are blackened by Baudoinia compniacensis, the 'angels' fungus', feeding on alcohol vapours escaping the barrels.",
      tips:
        "Two cellar tours are plenty in a day. Tastings included: leave the driving to us.",
    },
    photos: trio(P.cognac),
  },
  {
    slug: "aubeterre-sur-dronne",
    category: "visite",
    dept: "16",
    name: "Aubeterre-sur-Dronne",
    city: "Aubeterre-sur-Dronne",
    facts: [
      { fr: "Plus Beaux Villages de France", en: "One of France's most beautiful villages" },
      { fr: "Église monolithe du XIIᵉ siècle", en: "12th-century monolithic church" },
      { fr: "1 h 45 de Bordeaux", en: "1 h 45 from Bordeaux" },
    ],
    fr: {
      teaser:
        "Un village blanc accroché à sa falaise et, creusée dans la roche, une église souterraine de 20 mètres de haut.",
      history:
        "L'église Saint-Jean d'Aubeterre est l'une des plus grandes églises monolithes d'Europe : entièrement taillée dans le calcaire au XIIᵉ siècle, sur un sanctuaire du VIIᵉ, elle abrite un reliquaire monolithe hexagonal, une nécropole de sarcophages creusés à même le sol et une galerie supérieure. Le village, dont le nom vient d'alba terra — « terre blanche » —, fut une étape sur le chemin de Saint-Jacques et conserve ses ruelles en escalier, son église haute Saint-Jacques et ses maisons de pierre claire.",
      tips:
        "L'église est fraîche : prévoyez une veste. Le village se visite à pied, les rues sont très pentues.",
    },
    en: {
      teaser:
        "A white village clinging to its cliff and, carved into the rock, a 20-metre-high underground church.",
      history:
        "Saint-Jean of Aubeterre is one of Europe's largest monolithic churches: cut entirely from limestone in the 12th century over a 7th-century sanctuary, it holds a hexagonal monolithic reliquary, a necropolis of floor-hewn sarcophagi and an upper gallery. The village — from alba terra, 'white earth' — was a stop on the way to Santiago and keeps its stepped lanes, upper Saint-Jacques church and pale stone houses.",
      tips:
        "The church is cool: bring a jacket. The village is walked on foot; streets are steep.",
    },
    photos: trio(P.aubeterre),
  },
  {
    slug: "confolens-cite-medievale",
    category: "visite",
    dept: "16",
    name: "Confolens, cité médiévale",
    city: "Confolens",
    facts: [
      { fr: "Pont Vieux du XIIIᵉ siècle", en: "13th-century Old Bridge" },
      { fr: "Festival de folklore en août", en: "Folklore festival in August" },
      { fr: "Maisons à pans de bois", en: "Half-timbered houses" },
    ],
    fr: {
      teaser:
        "Deux rivières, un pont médiéval et des maisons à colombages : la Charente limousine dans sa version carte postale.",
      history:
        "Confolens — confluentes, le confluent de la Vienne et du Goire — s'est développée autour d'un château comtal et d'un pont de pierre bâti au XIIIᵉ siècle, longtemps le seul passage de la Vienne sur des dizaines de kilomètres. La ville basse a gardé ses maisons à pans de bois des XVᵉ-XVIᵉ siècles, ses hôtels particuliers et sa tour de l'horloge. Depuis 1958, son Festival international de folklore réunit chaque août des troupes du monde entier.",
      tips:
        "Vue idéale sur le Pont Vieux depuis la rive droite en fin d'après-midi.",
    },
    en: {
      teaser:
        "Two rivers, a medieval bridge and half-timbered houses: the Limousin Charente at its most picturesque.",
      history:
        "Confolens — confluentes, where the Vienne meets the Goire — grew around a count's castle and a 13th-century stone bridge, long the only crossing of the Vienne for miles. The lower town keeps its 15th-16th-century timber-framed houses, mansions and clock tower. Since 1958 its International Folklore Festival has drawn troupes from around the world every August.",
      tips:
        "The best view of the Old Bridge is from the right bank in late afternoon.",
    },
    photos: trio(P.confolens),
  },
  {
    slug: "corderie-royale-rochefort",
    category: "visite",
    dept: "17",
    name: "Corderie Royale de Rochefort",
    city: "Rochefort",
    facts: [
      { fr: "374 m de long, bâtie en 1666", en: "374 m long, built in 1666" },
      { fr: "Chantier de l'Hermione à proximité", en: "Hermione shipyard nearby" },
      { fr: "30 min de La Rochelle", en: "30 min from La Rochelle" },
    ],
    fr: {
      teaser:
        "Le plus long bâtiment industriel d'Europe au XVIIᵉ siècle : 374 mètres de pierre pour fabriquer les cordages du roi.",
      history:
        "Colbert crée l'arsenal de Rochefort en 1666 pour doter la France d'un port militaire à l'abri des attaques anglaises, à 15 km de l'océan sur un méandre de la Charente. La Corderie Royale, longue de 374 m — la longueur d'une aussière de marine — est bâtie sur un radeau de chêne posé sur un sol marécageux. Pendant deux siècles, on y tresse tous les cordages de la flotte. Incendiée en 1944, elle est restaurée à partir de 1976 ; l'arsenal a vu naître 550 navires, dont l'Hermione qui porta La Fayette en Amérique en 1780.",
      tips:
        "Combinez avec le chantier de l'Hermione et les jardins de la Marine. Comptez une demi-journée.",
    },
    en: {
      teaser:
        "Europe's longest industrial building in the 17th century: 374 metres of stone to make the king's ropes.",
      history:
        "Colbert founded the Rochefort arsenal in 1666 to give France a naval port safe from English attack, 15 km inland on a bend of the Charente. The Royal Ropeworks, 374 m long — the length of a naval hawser — was built on an oak raft laid over marshy ground. For two centuries it braided every rope in the fleet. Burnt in 1944, it was restored from 1976; the arsenal built 550 ships, among them the Hermione that carried Lafayette to America in 1780.",
      tips:
        "Combine with the Hermione shipyard and the Navy gardens. Allow half a day.",
    },
    photos: trio(P.rochefort),
  },
  {
    slug: "talmont-sur-gironde",
    category: "visite",
    dept: "17",
    name: "Talmont-sur-Gironde",
    city: "Talmont-sur-Gironde",
    facts: [
      { fr: "Plus Beaux Villages de France", en: "One of France's most beautiful villages" },
      { fr: "Église Sainte-Radegonde (1094)", en: "Sainte-Radegonde church (1094)" },
      { fr: "Roses trémières en été", en: "Hollyhocks in summer" },
    ],
    fr: {
      teaser:
        "Une église romane posée au bord de la falaise, face à l'estuaire, et des ruelles blanches couvertes de roses trémières.",
      history:
        "Talmont est une bastide fondée en 1284 par Édouard Iᵉʳ d'Angleterre, alors duc d'Aquitaine, pour contrôler le trafic de l'estuaire de la Gironde. Son plan en damier est resté intact. L'église Sainte-Radegonde, bâtie vers 1094 sur un promontoire, servait de repère aux marins et d'étape aux pèlerins de Saint-Jacques embarquant pour Soulac ; le chevet a été plusieurs fois reconstruit, la falaise s'effondrant sous l'action des marées.",
      tips:
        "Le parking est à l'entrée du village, obligatoirement à pied ensuite. Superbe à marée haute au soleil couchant.",
    },
    en: {
      teaser:
        "A Romanesque church on the cliff edge facing the estuary, and white lanes covered in hollyhocks.",
      history:
        "Talmont is a bastide founded in 1284 by Edward I of England, then Duke of Aquitaine, to control traffic in the Gironde estuary. Its grid plan survives intact. Sainte-Radegonde church, built around 1094 on a promontory, served as a landmark for sailors and a stop for pilgrims to Santiago embarking for Soulac; its chevet has been rebuilt several times as the cliff crumbles under the tides.",
      tips:
        "Park at the village entrance and continue on foot. Stunning at high tide and sunset.",
    },
    photos: trio(P.talmont),
  },
  {
    slug: "fort-boyard-et-oleron",
    category: "visite",
    dept: "17",
    name: "Fort Boyard et l'île d'Oléron",
    city: "Oléron",
    facts: [
      { fr: "Fort bâti de 1801 à 1857", en: "Fort built 1801-1857" },
      { fr: "Phare de Chassiron, 224 marches", en: "Chassiron lighthouse, 224 steps" },
      { fr: "Croisières au départ de Boyardville", en: "Cruises from Boyardville" },
    ],
    fr: {
      teaser:
        "Le fort le plus célèbre de France vu depuis la mer, puis les phares, les cabanes et les plages d'Oléron.",
      history:
        "Imaginé sous Louis XIV puis jugé irréalisable, Fort Boyard est finalement lancé par Bonaparte en 1801 pour interdire le passage entre Ré et Oléron aux flottes anglaises. Il faudra plus d'un demi-siècle et un banc de sable instable pour l'achever, en 1857 — au moment précis où la portée des canons le rendait inutile. Il servit de prison, fut abandonné, puis devint mondialement célèbre grâce à la télévision. Oléron, deuxième plus grande île de France métropolitaine, complète la visite avec ses ports ostréicoles et le phare de Chassiron, allumé en 1836.",
      tips:
        "Le fort ne se visite pas : on l'approche en bateau. Réservez la croisière, très prisée en été.",
    },
    en: {
      teaser:
        "France's most famous fort seen from the sea, then Oléron's lighthouses, oyster huts and beaches.",
      history:
        "Conceived under Louis XIV then judged impossible, Fort Boyard was finally begun by Bonaparte in 1801 to close the gap between Ré and Oléron to English fleets. An unstable sandbank meant half a century of work, finishing in 1857 — just as longer-range guns made it pointless. It served as a prison, was abandoned, then became world-famous through television. Oléron, mainland France's second-largest island, adds oyster ports and the Chassiron lighthouse, lit in 1836.",
      tips:
        "The fort cannot be entered: you approach it by boat. Book the cruise, very popular in summer.",
    },
    photos: trio(P.fortBoyard),
  },
  {
    slug: "abbaye-royale-saint-jean-dangely",
    category: "visite",
    dept: "17",
    name: "Abbaye royale de Saint-Jean-d'Angély",
    city: "Saint-Jean-d'Angély",
    facts: [
      { fr: "UNESCO — chemins de Saint-Jacques", en: "UNESCO — Santiago pilgrim routes" },
      { fr: "Tours inachevées du XVIIIᵉ", en: "Unfinished 18th-century towers" },
      { fr: "40 min de La Rochelle", en: "40 min from La Rochelle" },
    ],
    fr: {
      teaser:
        "Deux tours monumentales restées inachevées depuis 1789, vestiges d'une abbaye qui attirait toute la chrétienté.",
      history:
        "L'abbaye est fondée en 817 par Pépin Iᵉʳ d'Aquitaine pour abriter une relique présentée comme le chef de saint Jean-Baptiste, rapportée d'Orient. Le pèlerinage qui s'ensuit fait la fortune de la ville, étape majeure sur la via Turonensis vers Compostelle — inscription UNESCO à la clé. Détruite par les guerres de Religion, l'abbatiale est reconstruite à partir de 1741 dans un style monumental, mais le chantier s'arrête net à la Révolution : les tours restent ouvertes sur le ciel, spectaculaires.",
      tips:
        "Le centre médiéval, avec ses maisons à colombages et sa tour de l'horloge, se visite en une heure.",
    },
    en: {
      teaser:
        "Two monumental towers left unfinished since 1789, remains of an abbey that drew all of Christendom.",
      history:
        "The abbey was founded in 817 by Pepin I of Aquitaine to house a relic presented as the head of John the Baptist, brought from the East. The resulting pilgrimage made the town's fortune as a major stop on the via Turonensis to Santiago — hence its UNESCO listing. Destroyed in the Wars of Religion, the abbey church was rebuilt from 1741 on a monumental scale, but work stopped dead at the Revolution: the towers remain open to the sky.",
      tips:
        "The medieval centre, with timber-framed houses and clock tower, takes about an hour.",
    },
    photos: trio(P.saintJeanDAngely),
  },
  {
    slug: "royan-architecture-des-annees-50",
    category: "visite",
    dept: "17",
    name: "Royan, capitale des années 50",
    city: "Royan",
    facts: [
      { fr: "Église Notre-Dame de Guillaume Gillet (1958)", en: "Notre-Dame church by Gillet (1958)" },
      { fr: "Label Ville d'art et d'histoire", en: "City of Art and History" },
      { fr: "Cinq conches et un front de mer", en: "Five coves and a seafront" },
    ],
    fr: {
      teaser:
        "Une station Belle Époque rasée en 1945 et reconstruite en béton audacieux : un manifeste d'architecture moderne face à l'océan.",
      history:
        "Royan, station balnéaire élégante depuis le Second Empire, est détruite à 85 % par les bombardements alliés de janvier et avril 1945 visant la poche allemande de l'estuaire. La reconstruction, confiée à une équipe d'architectes modernistes, invente une ville nouvelle : front de mer sur portiques, villas à toitures en aile d'avion, marché couvert en voile de béton (1955) et surtout l'église Notre-Dame de Guillaume Gillet, achevée en 1958, nef de béton brut de 65 m de haut classée Monument historique.",
      tips:
        "Circuit architecture disponible à l'office de tourisme. Superbe lumière en fin de journée sur la conche de Pontaillac.",
    },
    en: {
      teaser:
        "A Belle Époque resort flattened in 1945 and rebuilt in bold concrete: a modern architecture manifesto facing the ocean.",
      history:
        "An elegant resort since the Second Empire, Royan was 85% destroyed by Allied bombing in January and April 1945 targeting the German pocket on the estuary. Reconstruction, entrusted to modernist architects, invented a new town: a seafront on porticoes, villas with wing-shaped roofs, a concrete-shell market hall (1955) and above all Guillaume Gillet's Notre-Dame church, completed in 1958, a 65-metre raw concrete nave now a listed monument.",
      tips:
        "An architecture trail is available at the tourist office. Beautiful late light over Pontaillac cove.",
    },
    photos: trio(P.royan),
  },
  {
    slug: "chatelaillon-plage",
    category: "visite",
    dept: "17",
    name: "Châtelaillon-Plage",
    city: "Châtelaillon-Plage",
    facts: [
      { fr: "3 km de plage de sable fin", en: "3 km of fine sand" },
      { fr: "Villas balnéaires 1900", en: "1900s seaside villas" },
      { fr: "15 min de La Rochelle", en: "15 min from La Rochelle" },
    ],
    fr: {
      teaser:
        "La plage familiale de La Rochelle : trois kilomètres de sable, villas 1900 et marché sous halle.",
      history:
        "Castrum Allionis fut au Xᵉ siècle la capitale de l'Aunis, siège des seigneurs de Châtelaillon, avant que la mer n'engloutisse la cité et son château — les vestiges reposent aujourd'hui sous les flots au large. La station renaît à la fin du XIXᵉ siècle avec l'arrivée du chemin de fer : on y bâtit des villas éclectiques à bow-windows et céramiques, dont beaucoup subsistent le long du front de mer, réaménagé au début des années 2000.",
      tips:
        "Marché couvert le matin, puis plage. Liaison rapide avec l'aéroport et la gare de La Rochelle.",
    },
    en: {
      teaser:
        "La Rochelle's family beach: three kilometres of sand, 1900s villas and a covered market.",
      history:
        "Castrum Allionis was the 10th-century capital of the Aunis and seat of the lords of Châtelaillon, before the sea swallowed town and castle — the remains lie offshore. The resort was reborn in the late 19th century with the railway: eclectic villas with bow windows and ceramics went up, many still standing along the seafront, redeveloped in the early 2000s.",
      tips:
        "Covered market in the morning, then the beach. Quick link to La Rochelle airport and station.",
    },
    photos: trio(P.chatelaillon),
  },
];

export const GUIDE_CATEGORIES: { key: GuideCategory; fr: string; en: string }[] = [
  { key: "restaurant", fr: "Restaurants", en: "Restaurants" },
  { key: "hotel", fr: "Hôtels", en: "Hotels" },
  { key: "randonnee", fr: "Randonnées", en: "Hikes" },
  { key: "visite", fr: "À visiter", en: "To visit" },
];

export const DEPTS: { key: Dept; fr: string; en: string }[] = [
  { key: "16", fr: "Charente", en: "Charente" },
  { key: "17", fr: "Charente-Maritime", en: "Charente-Maritime" },
];

export function getGuideEntry(slug: string): GuideEntry | undefined {
  return GUIDE_ENTRIES.find((e) => e.slug === slug);
}
