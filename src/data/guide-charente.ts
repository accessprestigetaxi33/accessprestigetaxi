// Guide Charente-Maritime-Maritime — contenu éditorial du blog
// Restaurants, hôtels (étoilés), randonnées et lieux à visiter.
// Photos: Wikimedia Commons (licences libres), 3 par article.

export type GuideCategory ="restaurant" |"hotel" |"randonnee" |"visite";
export type Dept ="17";

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
 /** Infos pratiques: durée, distance, difficulté… */
 facts: { fr: string; en: string }[];
 fr: { teaser: string; history: string; tips: string };
 en: { teaser: string; history: string; tips: string };
 photos: [string, string, string];
};

const P = {
 angouleme: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Angoul%C3%AAme_16_Fa%C3%A7ade_cath%C3%A9drale_2014.JPG/1920px-Angoul%C3%AAme_16_Fa%C3%A7ade_cath%C3%A9drale_2014.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/008_Angoul%C3%AAme_cath%C3%A9drale_Saint-Pierre_le_portail.JPG/1920px-008_Angoul%C3%AAme_cath%C3%A9drale_Saint-Pierre_le_portail.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Angoul%C3%AAme_16_Le_plateau_vu_de_Saint-Martin_2014.jpg/1920px-Angoul%C3%AAme_16_Le_plateau_vu_de_Saint-Martin_2014.jpg"],
 angoulemeVille: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Angoul%C3%AAme_Rue_des_Trois-Notre-Dame.jpg/1920px-Angoul%C3%AAme_Rue_des_Trois-Notre-Dame.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Angoul%C3%AAme_Rue_des_Trois-fours_2012.jpg/1920px-Angoul%C3%AAme_Rue_des_Trois-fours_2012.jpg""https://upload.wikimedia.org/wikipedia/commons/3/3f/Angoul%C3%AAme_hdsr_DSCF0432.jpg"],
 cognac: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Cognac_16_Fontaine_Fran%C3%A7ois-Ier_2014.jpg/1920px-Cognac_16_Fontaine_Fran%C3%A7ois-Ier_2014.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cognac_16-Fontaine_F-1er%26tourelle_sud.JPG/1920px-Cognac_16-Fontaine_F-1er%26tourelle_sud.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Cognac_16_Linteau%26chiffre_Fran%C3%A7ois_Ier_2014.JPG/1920px-Cognac_16_Linteau%26chiffre_Fran%C3%A7ois_Ier_2014.JPG"],
 chais: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Monnet_Cognac_ChaisCathedrale.jpg/1920px-Monnet_Cognac_ChaisCathedrale.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Monnet_Cognac_Bar.jpg/1920px-Monnet_Cognac_Bar.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Monnet_Cognac_Gate.jpg/1920px-Monnet_Cognac_Gate.jpg"],
 aubeterre: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_02.JPG/1920px-%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_02.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_18.JPG/1920px-%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_18.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_17.JPG/1920px-%C3%89glise_monolithe_Saint-Jean_%28Aubeterre-sur-Dronne%29_17.JPG"],
 bourgCharente: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Bourg-Charente_chateau.JPG/1920px-Bourg-Charente_chateau.JPG""https://upload.wikimedia.org/wikipedia/commons/4/4a/Bourg-ch_castle1.JPG""https://upload.wikimedia.org/wikipedia/commons/7/78/Ch%C3%A2teau_de_Cress%C3%A9_%28Bourg-Charente%29.jpg"],
 jarnac: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Jarnac_16_Quai_de_l%27Orangerie%26bateaux_de_plaisance_2014.JPG/1920px-Jarnac_16_Quai_de_l%27Orangerie%26bateaux_de_plaisance_2014.JPG""https://upload.wikimedia.org/wikipedia/commons/e/ea/Jarnac_pont_Charente.jpg""https://upload.wikimedia.org/wikipedia/commons/1/1f/Jarnac_Quai_Fontbadant.jpg"],
 confolens: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Confolens_et_la_Vienne_Confolens_and_Vienne_river_%284648325486%29.jpg""https://upload.wikimedia.org/wikipedia/commons/e/e4/Vienne_%26_pt._Vieux%2C_Confo_%2816%29.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Confolens_%284648328702%29.jpg/1920px-Confolens_%284648328702%29.jpg"],
 braconne: ["https://upload.wikimedia.org/wikipedia/commons/6/67/Braconne_parking.JPG""https://upload.wikimedia.org/wikipedia/commons/d/d3/Braconne_fosse_mobile2.JPG""https://upload.wikimedia.org/wikipedia/commons/3/36/Puym_roch4.JPG"],
 eauxClaires: ["https://upload.wikimedia.org/wikipedia/commons/2/27/Puym_roch.JPG""https://upload.wikimedia.org/wikipedia/commons/c/c4/Puym_roch3.JPG""https://upload.wikimedia.org/wikipedia/commons/3/36/Puym_roch4.JPG"],
 laRochelle: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/La_rochelle%2C_Le_vieux_port.JPG/1920px-La_rochelle%2C_Le_vieux_port.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg/1920px-Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/021_-_CityMobyl2_-_La_Rochelle.jpg/1280px-021_-_CityMobyl2_-_La_Rochelle.jpg"],
 laRochelle2: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg/1920px-Tour_Lanterne_ao%C3%BBt_2015_La_Rochelle_Charente_Maritime.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/021_-_CityMobyl2_-_La_Rochelle.jpg/1280px-021_-_CityMobyl2_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/La_rochelle%2C_Le_vieux_port.JPG/1920px-La_rochelle%2C_Le_vieux_port.JPG"],
 rochefort: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Corderie-Royale-de-l%27Arsenal-de-Rochefort%2C_Charente-Maritime%2C-France-DSC_5828.jpg/1920px-Corderie-Royale-de-l%27Arsenal-de-Rochefort%2C_Charente-Maritime%2C-France-DSC_5828.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France--DSC_5863.jpg/1920px-Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France--DSC_5863.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France-DSC_5860.jpg/1920px-Corderie-de-l%27Arsenal-a-Rochefort%2C-Charente-Maritime%2C-France-DSC_5860.jpg"],
 oleron: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Vue_originale_du_phare_de_Chassiron_%28Ol%C3%A9ron%29.JPG/1920px-Vue_originale_du_phare_de_Chassiron_%28Ol%C3%A9ron%29.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Phare_de_Chassiron%2C_Ol%C3%A9ron.jpg/1920px-Phare_de_Chassiron%2C_Ol%C3%A9ron.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Les_Hu%C3%AEtres_de_Trousse_Chemise_%282%29.JPG/1920px-Les_Hu%C3%AEtres_de_Trousse_Chemise_%282%29.JPG"],
 ileDeRe: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Saint-Martin-de-R%C3%A9%2C_port%2C_close-up%2C_R%C3%A9_island%2C_Charente-Maritime.jpg/1920px-Saint-Martin-de-R%C3%A9%2C_port%2C_close-up%2C_R%C3%A9_island%2C_Charente-Maritime.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lighthouse%2C_harbor_Saint-Martin-de-R%C3%A9%2C_R%C3%A9_island%2C_Charente-Maritime%2C_France.jpg/1920px-Lighthouse%2C_harbor_Saint-Martin-de-R%C3%A9%2C_R%C3%A9_island%2C_Charente-Maritime%2C_France.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Entrance_harbor%2C_Saint-Martin%2C_R%C3%A9_island%2C_august_2015.jpg/1920px-Entrance_harbor%2C_Saint-Martin%2C_R%C3%A9_island%2C_august_2015.jpg"],
 brouage: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Brouage-Remparts.jpg/1920px-Brouage-Remparts.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/969_-_Rempart_de_la_citadelle_-_Brouage.jpg/1920px-969_-_Rempart_de_la_citadelle_-_Brouage.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/972_-_Rempart_de_la_citadelle_-_Brouage.jpg/1920px-972_-_Rempart_de_la_citadelle_-_Brouage.jpg"],
 laCoubre: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Le_phare_de_La_Coubre_-_mai_2012.JPG/1920px-Le_phare_de_La_Coubre_-_mai_2012.JPG""https://upload.wikimedia.org/wikipedia/commons/1/14/Phare_de_la_Coubre_-_La_Tremblade.jpeg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Plage_et_phare_de_la_Coubre_-_panoramio.jpg/1920px-Plage_et_phare_de_la_Coubre_-_panoramio.jpg"],
 saintes: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Arc_de_Germanicus_%28Saintes%2C_France%2C_2015%29_05.jpg/1920px-Arc_de_Germanicus_%28Saintes%2C_France%2C_2015%29_05.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_01.jpg/1920px-Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_01.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_04.jpg/1920px-Arch_of_Germanicus_%28Saintes%2C_France%2C_2015%29_04.jpg"],
 royan: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/00_4633_%C3%89glise_Notre-Dame_de_Royan_-_Frankreich.jpg/1920px-00_4633_%C3%89glise_Notre-Dame_de_Royan_-_Frankreich.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Le_Front_de_mer_%C3%A0_Pontaillac%2C_Royan_-_panoramio.jpg/1920px-Le_Front_de_mer_%C3%A0_Pontaillac%2C_Royan_-_panoramio.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Front_de_mer%2C_%C3%A0_Pontaillac.jpg/1920px-Front_de_mer%2C_%C3%A0_Pontaillac.jpg"],
 talmont: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Talmont_17_%C3%89glise_remparts_2013.jpg/1920px-Talmont_17_%C3%89glise_remparts_2013.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Talmont-sur-Gironde_17_%C3%89glise_fa%C3%A7ade_NNW.jpg/1920px-Talmont-sur-Gironde_17_%C3%89glise_fa%C3%A7ade_NNW.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Talmont-sur-Gironde_17_%C3%89glise_chevet_2013.jpg/1920px-Talmont-sur-Gironde_17_%C3%89glise_chevet_2013.jpg"],
 fortBoyard: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Fort_Boyard_%2851269094270%29.jpg/1920px-Fort_Boyard_%2851269094270%29.jpg""https://upload.wikimedia.org/wikipedia/commons/f/fb/Sunset_over_Fort_Boyard_%281%29.jpg""https://upload.wikimedia.org/wikipedia/commons/4/4b/Vigie_fort_boyard2.JPG"],
 saintJeanDAngely: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg/1920px-Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Saint-Jean-d%27Ang%C3%A9ly-Abbaye-Cloitre.jpg/1920px-Saint-Jean-d%27Ang%C3%A9ly-Abbaye-Cloitre.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg/1920px-Abbaye_Saint-Jean-Baptiste_de_Saint-Jean-d%27Ang%C3%A9ly.jpg"],
 chatelaillon: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/003_Salles-sur-Mer_%28_17220_%29.JPG/1280px-003_Salles-sur-Mer_%28_17220_%29.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ch%C3%A2telaillon-Plage_La_grande_plage.jpg/1920px-Ch%C3%A2telaillon-Plage_La_grande_plage.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Ch%C3%A2telaillon-Plage_Rathaus.JPG/1920px-Ch%C3%A2telaillon-Plage_Rathaus.JPG"],
} as const;

const trio = (a: readonly string[]): [string, string, string] => [a[0], a[1], a[2]];

export const GUIDE_ENTRIES: GuideEntry[] = [
 {
 slug:"christopher-coutanceau-la-rochelle"category:"restaurant"dept:"17"name:"Christopher Coutanceau"city:"La Rochelle"michelin: 2,
 facts: [
 { fr:"Deux étoiles Michelin + étoile verte"en:"Two Michelin stars + green star" },
 { fr:"Cuisinier-pêcheur, pêche durable"en:"Chef-fisherman, sustainable catch" },
 { fr:"Face à la plage de la Concurrence"en:"Facing Concurrence beach" },
 ],
 fr: {
 teaser:"La grande table marine de l'Atlantique: poissons de ligne, coquillages du pertuis et une salle ouverte sur l'océan."history:"La Rochelle vit du large depuis le XIIᵉ siècle: port franc médiéval, place forte protestante assiégée par Richelieu en 1627-1628, puis port négrier et enfin capitale de la voile. Les trois tours qui gardent le chenal — Saint-Nicolas, la Chaîne et la Lanterne — rappellent qu'on fermait le port d'une chaîne chaque nuit. La maison Coutanceau, installée face à la plage depuis trois générations, a fait de la pêche locale et raisonnée un manifeste, jusqu'à obtenir l'étoile verte de la gastronomie durable."tips:"Le menu « tout poisson » se réserve plusieurs semaines à l'avance. Prévoyez une balade digestive jusqu'à la tour de la Lanterne."},
 en: {
 teaser:"The great Atlantic seafood table: line-caught fish, shellfish from the pertuis and a dining room open to the ocean."history:"La Rochelle has lived from the sea since the 12th century: a medieval free port, a Protestant stronghold besieged by Richelieu in 1627-28, later a slave-trade port and finally France's sailing capital. The three towers guarding the channel — Saint-Nicolas, Chaîne and Lanterne — recall the chain drawn across the harbour each night. The Coutanceau family, facing the beach for three generations, turned local, responsible fishing into a manifesto, earning the Michelin green star."tips:"The all-fish menu books out weeks ahead. Plan a post-dinner walk to the Lantern Tower."},
 photos: trio(P.laRochelle),
 },
 {
 slug:"les-flots-la-rochelle"category:"restaurant"dept:"17"name:"Les Flots"city:"La Rochelle"facts: [
 { fr:"Bistrot marin au pied de la tour de la Chaîne"en:"Seafood bistro by the Chain Tower" },
 { fr:"Huîtres Marennes-Oléron"en:"Marennes-Oléron oysters" },
 { fr:"Ouvert midi et soir"en:"Open lunch and dinner" },
 ],
 fr: {
 teaser:"Le classique du Vieux-Port: plateau de fruits de mer, blanc de la côte et vue sur les mâts."history:"Le Vieux-Port, creusé dès le Moyen Âge dans une anse naturelle, fut le cœur battant du commerce du sel et du vin vers l'Angleterre et les Flandres. Les maisons à arcades des rues voisines datent des XVIᵉ-XVIIIᵉ siècles, quand les armateurs protestants faisaient bâtir en pierre de Crazannes. L'établissement occupe une ancienne maison de pilotes, à quelques mètres de la chaîne qui verrouillait autrefois l'entrée du port."tips:"Arrivez tôt en été: le quartier est piéton et très fréquenté. Dépose-minute possible côté Cours des Dames."},
 en: {
 teaser:"The Old Port classic: seafood platter, coastal white wine and a view over the masts."history:"Dug out of a natural cove in the Middle Ages, the Old Port was the beating heart of the salt and wine trade with England and Flanders. The arcaded houses nearby date from the 16th-18th centuries, when Protestant shipowners built in Crazannes stone. The restaurant occupies a former pilots' house, steps from the chain that once locked the harbour entrance."tips:"Come early in summer: the quarter is pedestrian and busy. Drop-off possible on Cours des Dames."},
 photos: trio(P.laRochelle2),
 },
 {
 slug:"cabanes-ostreicoles-marennes-oleron"category:"restaurant"dept:"17"name:"Les cabanes ostréicoles"city:"Marennes-Oléron"facts: [
 { fr:"Dégustation d'huîtres en cabane"en:"Oyster tasting in a hut" },
 { fr:"Bassin Marennes-Oléron (IGP)"en:"Marennes-Oléron basin (PGI)" },
 { fr:"Toute l'année, midi surtout"en:"All year, mainly lunchtime" },
 ],
 fr: {
 teaser:"Tables de bois, seau d'huîtres, crevettes grises et vin blanc frais: le repas le plus authentique de la côte."history:"Le bassin de Marennes-Oléron est le premier bassin ostréicole d'Europe. Ses claires — anciens marais salants reconvertis au XIXᵉ siècle, quand le sel a cessé d'être rentable — donnent aux huîtres l'affinage lent et le célèbre reflet vert dû à une micro-algue, la navicule bleue. La fine de claire et la pousse en claire y sont nées; l'IGP protège aujourd'hui ce savoir-faire, transmis de génération en génération dans des cabanes colorées alignées au bord des chenaux."tips:"Prévoyez des chaussures fermées: les chenaux sont boueux. Un chauffeur permet de goûter le vin sans compter les verres."},
 en: {
 teaser:"Wooden tables, a bucket of oysters, grey shrimp and chilled white wine: the coast's most authentic meal."history:"The Marennes-Oléron basin is Europe's leading oyster area. Its claires — former salt pans converted in the 19th century when salt lost its value — give oysters their slow refining and famous green sheen, produced by a micro-algae, the blue navicula. Fine de claire and pousse en claire were born here; a PGI now protects this know-how, passed down in the colourful huts lining the channels."tips:"Wear closed shoes: the channels are muddy. A driver means you can taste the wine without counting glasses."},
 photos: trio(P.oleron),
 },
 {
 slug:"hotel-la-monnaie-la-rochelle"category:"hotel"dept:"17"name:"Hôtel La Monnaie"city:"La Rochelle"stars: 4,
 facts: [
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Monument historique de 1620"en:"1620 listed monument" },
 { fr:"100 m de la tour de la Lanterne"en:"100 m from the Lantern Tower" },
 ],
 fr: {
 teaser:"L'ancien atelier monétaire du roi, cour d'honneur et pierre blonde, à cent mètres des tours du port."history:"L'Hôtel de la Monnaie fut construit en 1619-1620 pour frapper la monnaie royale à La Rochelle, privilège que la ville détenait depuis le Moyen Âge et qu'elle perdit après le siège de 1628. Le bâtiment, classé Monument historique, a conservé sa façade Louis XIII, sa cour pavée et ses vastes salles voûtées, aujourd'hui converties en chambres et en spa. Rares sont les hôtels français à pouvoir revendiquer une adresse où l'on battait littéralement l'argent du royaume."tips:"Le quartier est piéton: prévoyez une dépose-minute rue Saint-Michel. Aquarium et Vieux-Port à pied."},
 en: {
 teaser:"The king's former mint, with a grand courtyard and golden stone, a hundred metres from the harbour towers."history:"The Hôtel de la Monnaie was built in 1619-20 to strike royal coinage in La Rochelle, a privilege the city held since the Middle Ages and lost after the 1628 siege. Listed as a Monument historique, it keeps its Louis XIII façade, paved courtyard and vaulted halls, now converted into rooms and a spa. Few French hotels can claim an address where the kingdom's silver was literally minted."tips:"The area is pedestrian: use the rue Saint-Michel drop-off. Aquarium and Old Port on foot."},
 photos: trio(P.laRochelle),
 },
 {
 slug:"hotel-de-toiras-ile-de-re"category:"hotel"dept:"17"name:"Hôtel de Toiras"city:"Saint-Martin-de-Ré"stars: 5,
 facts: [
 { fr:"Hôtel 5 étoiles, Relais & Châteaux"en:"5-star, Relais & Châteaux" },
 { fr:"Maison d'armateur du XVIIᵉ"en:"17th-century shipowner's house" },
 { fr:"Sur le port de Saint-Martin"en:"On Saint-Martin harbour" },
 ],
 fr: {
 teaser:"Une maison d'armateur sur le port, meubles d'époque et service de grande maison, au cœur des fortifications de Vauban."history:"Saint-Martin-de-Ré porte le nom du maréchal de Toiras, qui défendit l'île contre le débarquement anglais de Buckingham en 1627. Après le siège, Vauban ceintura la ville d'une enceinte à double bastion, inscrite depuis 2008 au patrimoine mondial de l'UNESCO; le port servit ensuite de point de départ des bagnards vers la Guyane. L'hôtel occupe une demeure d'armateur du XVIIᵉ siècle, quand les navires rétais rapportaient sel, vin et cargaisons du Nouveau Monde."tips:"Le pont de l'île est payant et souvent chargé l'été: partez tôt. Nos véhicules électriques circulent sans restriction sur l'île."},
 en: {
 teaser:"A shipowner's house on the harbour, period furniture and grand-hotel service, inside Vauban's fortifications."history:"Saint-Martin-de-Ré is named after Marshal de Toiras, who defended the island against Buckingham's English landing in 1627. After the siege, Vauban ringed the town with a double-bastioned wall, UNESCO-listed since 2008; the harbour later became the departure point for convicts bound for Guiana. The hotel occupies a 17th-century shipowner's house from the days when Ré's ships brought back salt, wine and New World cargo."tips:"The island bridge is tolled and busy in summer: leave early. Our electric cars travel the island without restriction."},
 photos: trio(P.ileDeRe),
 },
 {
 slug:"relais-du-bois-saint-georges-saintes"category:"hotel"dept:"17"name:"Relais du Bois Saint-Georges"city:"Saintes"stars: 4,
 facts: [
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Parc de 7 hectares avec lac"en:"7-hectare park with lake" },
 { fr:"10 min de l'amphithéâtre romain"en:"10 min from the Roman arena" },
 ],
 fr: {
 teaser:"Un parc arboré, un lac, des chambres à thème et une piscine sous verrière, aux portes de la Saintes romaine."history:"Saintes — Mediolanum Santonum — fut la capitale de l'Aquitaine romaine. On y voit encore l'arc de Germanicus, élevé en l'an 18-19 apr. J.-C. à l'entrée du pont sur la Charente, et un amphithéâtre creusé dans un vallon vers 40 apr. J.-C., l'un des plus anciens de Gaule, qui accueillait 15 000 spectateurs. Le Moyen Âge y ajouta l'abbaye aux Dames, fondée en 1047 et longtemps dirigée par des abbesses issues de la haute noblesse."tips:"Base idéale entre Cognac et Royan. Demandez une chambre côté parc pour le silence."},
 en: {
 teaser:"Wooded grounds, a lake, themed rooms and a glasshouse pool, at the gates of Roman Saintes."history:"Saintes — Mediolanum Santonum — was the capital of Roman Aquitaine. The Arch of Germanicus, raised in AD 18-19 at the bridgehead over the Charente, still stands, as does an amphitheatre dug into a valley around AD 40, one of the oldest in Gaul, seating 15,000. The Middle Ages added the Abbaye aux Dames, founded in 1047 and long led by abbesses of high nobility."tips:"An ideal base between Cognac and Royan. Ask for a park-side room for silence."},
 photos: trio(P.saintes),
 },
 {
 slug:"sentier-des-douaniers-ile-de-re"category:"randonnee"dept:"17"name:"Sentier des douaniers"city:"Île de Ré"facts: [
 { fr:"Plus de 100 km de littoral"en:"Over 100 km of coastline" },
 { fr:"Marais salants et plages"en:"Salt marshes and beaches" },
 { fr:"Plat, praticable toute l'année"en:"Flat, walkable year-round" },
 ],
 fr: {
 teaser:"Le tour de l'île à pied: marais salants, ports blancs à volets verts, dunes et phare des Baleines."history:"Le sentier suit le tracé des rondes que les douaniers effectuaient dès le XVIIIᵉ siècle pour surveiller la contrebande de sel et d'alcool. Le sel, « or blanc » de Ré, faisait vivre l'île depuis le Moyen Âge: les marais salants, dessinés au XIIᵉ siècle par les moines cisterciens, produisent encore une fleur de sel récoltée à la main. Le phare des Baleines, allumé en 1854, doit son nom aux cétacés que la côte échouait autrefois."tips:"Le vent d'ouest est constant: coupe-vent conseillé même en été. Nos chauffeurs récupèrent les marcheurs à n'importe quel village."},
 en: {
 teaser:"Walking round the island: salt marshes, white harbours with green shutters, dunes and the Whale Lighthouse."history:"The path follows the rounds customs officers walked from the 18th century to watch for salt and alcohol smuggling. Salt, Ré's'white gold'sustained the island from the Middle Ages: the marshes, laid out by Cistercian monks in the 12th century, still yield hand-harvested fleur de sel. The Whale Lighthouse, lit in 1854, is named after the cetaceans once stranded on this coast."tips:"The west wind never stops: bring a windbreaker even in summer. Our drivers collect walkers in any village."},
 photos: trio(P.ileDeRe),
 },
 {
 slug:"marais-de-brouage"category:"randonnee"dept:"17"name:"Marais de Brouage"city:"Hiers-Brouage"facts: [
 { fr:"Boucle de 10 km autour de la citadelle"en:"10 km loop around the citadel" },
 { fr:"Observation d'oiseaux (cigognes)"en:"Birdwatching (storks)" },
 { fr:"Plat, sans ombre"en:"Flat, no shade" },
 ],
 fr: {
 teaser:"Un océan d'herbe où flotte une citadelle de pierre: le marais le plus étrange de la côte atlantique."history:"Brouage fut au XVIᵉ siècle l'un des premiers ports à sel d'Europe, exportant vers la Hollande et la Baltique; Samuel de Champlain, fondateur de Québec, y naquit vers 1570. Richelieu en fit une place forte royale et fit élever les remparts que l'on parcourt aujourd'hui. Puis la mer se retira, l'envasement isola la ville, et l'ancien golfe devint ce marais de 16 000 hectares, désormais réserve pour cigognes blanches, busards et échasses."tips:"Le meilleur moment: lever du soleil, quand la brume couvre le marais. Jumelles recommandées."},
 en: {
 teaser:"An ocean of grass with a stone citadel floating in it: the strangest marsh on the Atlantic coast."history:"In the 16th century Brouage was one of Europe's leading salt ports, shipping to Holland and the Baltic; Samuel de Champlain, founder of Quebec, was born here around 1570. Richelieu made it a royal stronghold and raised the ramparts you can still walk. Then the sea withdrew, silt cut the town off, and the former gulf became this 16,000-hectare marsh, now a haven for white storks, harriers and stilts."tips:"Best at sunrise, when mist covers the marsh. Binoculars recommended."},
 photos: trio(P.brouage),
 },
 {
 slug:"foret-de-la-coubre"category:"randonnee"dept:"17"name:"Forêt et phare de la Coubre"city:"La Tremblade"facts: [
 { fr:"8 000 ha de pins, 300 marches au phare"en:"8,000 ha of pines, 300 lighthouse steps" },
 { fr:"Pistes cyclables et sentiers dunaires"en:"Cycle paths and dune trails" },
 { fr:"20 min de Royan"en:"20 min from Royan" },
 ],
 fr: {
 teaser:"Pins maritimes, dunes blanches et un phare rouge et blanc qui veille sur la pointe la plus mouvante de France."history:"La forêt de la Coubre a été plantée à partir de 1810 pour fixer des dunes qui avançaient de plusieurs mètres par an et menaçaient les villages. Le phare actuel, haut de 64 m, date de 1905: les deux précédents avaient été emportés par l'érosion, la pointe reculant sans cesse sous l'assaut des courants du pertuis de Maumusson. Du sommet, on embrasse l'estuaire de la Gironde, l'île d'Oléron et la Grande Côte."tips:"Baignade dangereuse sur la Grande Côte (baïnes): préférez les plages surveillées. Ascension du phare payante."},
 en: {
 teaser:"Maritime pines, white dunes and a red-and-white lighthouse watching over France's most shifting headland."history:"The Coubre forest was planted from 1810 to fix dunes advancing several metres a year and threatening villages. The present 64-metre lighthouse dates from 1905: the two earlier ones were lost to erosion as the point retreated under the currents of the Maumusson strait. From the top you take in the Gironde estuary, Oléron and the Grande Côte."tips:"Swimming on the Grande Côte is dangerous (rip channels): use supervised beaches. Lighthouse climb is ticketed."},
 photos: trio(P.laCoubre),
 },
 {
 slug:"corderie-royale-rochefort"category:"visite"dept:"17"name:"Corderie Royale de Rochefort"city:"Rochefort"facts: [
 { fr:"374 m de long, bâtie en 1666"en:"374 m long, built in 1666" },
 { fr:"Chantier de l'Hermione à proximité"en:"Hermione shipyard nearby" },
 { fr:"30 min de La Rochelle"en:"30 min from La Rochelle" },
 ],
 fr: {
 teaser:"Le plus long bâtiment industriel d'Europe au XVIIᵉ siècle: 374 mètres de pierre pour fabriquer les cordages du roi."history:"Colbert crée l'arsenal de Rochefort en 1666 pour doter la France d'un port militaire à l'abri des attaques anglaises, à 15 km de l'océan sur un méandre de la Charente. La Corderie Royale, longue de 374 m — la longueur d'une aussière de marine — est bâtie sur un radeau de chêne posé sur un sol marécageux. Pendant deux siècles, on y tresse tous les cordages de la flotte. Incendiée en 1944, elle est restaurée à partir de 1976; l'arsenal a vu naître 550 navires, dont l'Hermione qui porta La Fayette en Amérique en 1780."tips:"Combinez avec le chantier de l'Hermione et les jardins de la Marine. Comptez une demi-journée."},
 en: {
 teaser:"Europe's longest industrial building in the 17th century: 374 metres of stone to make the king's ropes."history:"Colbert founded the Rochefort arsenal in 1666 to give France a naval port safe from English attack, 15 km inland on a bend of the Charente. The Royal Ropeworks, 374 m long — the length of a naval hawser — was built on an oak raft laid over marshy ground. For two centuries it braided every rope in the fleet. Burnt in 1944, it was restored from 1976; the arsenal built 550 ships, among them the Hermione that carried Lafayette to America in 1780."tips:"Combine with the Hermione shipyard and the Navy gardens. Allow half a day."},
 photos: trio(P.rochefort),
 },
 {
 slug:"talmont-sur-gironde"category:"visite"dept:"17"name:"Talmont-sur-Gironde"city:"Talmont-sur-Gironde"facts: [
 { fr:"Plus Beaux Villages de France"en:"One of France's most beautiful villages" },
 { fr:"Église Sainte-Radegonde (1094)"en:"Sainte-Radegonde church (1094)" },
 { fr:"Roses trémières en été"en:"Hollyhocks in summer" },
 ],
 fr: {
 teaser:"Une église romane posée au bord de la falaise, face à l'estuaire, et des ruelles blanches couvertes de roses trémières."history:"Talmont est une bastide fondée en 1284 par Édouard Iᵉʳ d'Angleterre, alors duc d'Aquitaine, pour contrôler le trafic de l'estuaire de la Gironde. Son plan en damier est resté intact. L'église Sainte-Radegonde, bâtie vers 1094 sur un promontoire, servait de repère aux marins et d'étape aux pèlerins de Saint-Jacques embarquant pour Soulac; le chevet a été plusieurs fois reconstruit, la falaise s'effondrant sous l'action des marées."tips:"Le parking est à l'entrée du village, obligatoirement à pied ensuite. Superbe à marée haute au soleil couchant."},
 en: {
 teaser:"A Romanesque church on the cliff edge facing the estuary, and white lanes covered in hollyhocks."history:"Talmont is a bastide founded in 1284 by Edward I of England, then Duke of Aquitaine, to control traffic in the Gironde estuary. Its grid plan survives intact. Sainte-Radegonde church, built around 1094 on a promontory, served as a landmark for sailors and a stop for pilgrims to Santiago embarking for Soulac; its chevet has been rebuilt several times as the cliff crumbles under the tides."tips:"Park at the village entrance and continue on foot. Stunning at high tide and sunset."},
 photos: trio(P.talmont),
 },
 {
 slug:"fort-boyard-et-oleron"category:"visite"dept:"17"name:"Fort Boyard et l'île d'Oléron"city:"Oléron"facts: [
 { fr:"Fort bâti de 1801 à 1857"en:"Fort built 1801-1857" },
 { fr:"Phare de Chassiron, 224 marches"en:"Chassiron lighthouse, 224 steps" },
 { fr:"Croisières au départ de Boyardville"en:"Cruises from Boyardville" },
 ],
 fr: {
 teaser:"Le fort le plus célèbre de France vu depuis la mer, puis les phares, les cabanes et les plages d'Oléron."history:"Imaginé sous Louis XIV puis jugé irréalisable, Fort Boyard est finalement lancé par Bonaparte en 1801 pour interdire le passage entre Ré et Oléron aux flottes anglaises. Il faudra plus d'un demi-siècle et un banc de sable instable pour l'achever, en 1857 — au moment précis où la portée des canons le rendait inutile. Il servit de prison, fut abandonné, puis devint mondialement célèbre grâce à la télévision. Oléron, deuxième plus grande île de France métropolitaine, complète la visite avec ses ports ostréicoles et le phare de Chassiron, allumé en 1836."tips:"Le fort ne se visite pas: on l'approche en bateau. Réservez la croisière, très prisée en été."},
 en: {
 teaser:"France's most famous fort seen from the sea, then Oléron's lighthouses, oyster huts and beaches."history:"Conceived under Louis XIV then judged impossible, Fort Boyard was finally begun by Bonaparte in 1801 to close the gap between Ré and Oléron to English fleets. An unstable sandbank meant half a century of work, finishing in 1857 — just as longer-range guns made it pointless. It served as a prison, was abandoned, then became world-famous through television. Oléron, mainland France's second-largest island, adds oyster ports and the Chassiron lighthouse, lit in 1836."tips:"The fort cannot be entered: you approach it by boat. Book the cruise, very popular in summer."},
 photos: trio(P.fortBoyard),
 },
 {
 slug:"abbaye-royale-saint-jean-dangely"category:"visite"dept:"17"name:"Abbaye royale de Saint-Jean-d'Angély"city:"Saint-Jean-d'Angély"facts: [
 { fr:"UNESCO — chemins de Saint-Jacques"en:"UNESCO — Santiago pilgrim routes" },
 { fr:"Tours inachevées du XVIIIᵉ"en:"Unfinished 18th-century towers" },
 { fr:"40 min de La Rochelle"en:"40 min from La Rochelle" },
 ],
 fr: {
 teaser:"Deux tours monumentales restées inachevées depuis 1789, vestiges d'une abbaye qui attirait toute la chrétienté."history:"L'abbaye est fondée en 817 par Pépin Iᵉʳ d'Aquitaine pour abriter une relique présentée comme le chef de saint Jean-Baptiste, rapportée d'Orient. Le pèlerinage qui s'ensuit fait la fortune de la ville, étape majeure sur la via Turonensis vers Compostelle — inscription UNESCO à la clé. Détruite par les guerres de Religion, l'abbatiale est reconstruite à partir de 1741 dans un style monumental, mais le chantier s'arrête net à la Révolution: les tours restent ouvertes sur le ciel, spectaculaires."tips:"Le centre médiéval, avec ses maisons à colombages et sa tour de l'horloge, se visite en une heure."},
 en: {
 teaser:"Two monumental towers left unfinished since 1789, remains of an abbey that drew all of Christendom."history:"The abbey was founded in 817 by Pepin I of Aquitaine to house a relic presented as the head of John the Baptist, brought from the East. The resulting pilgrimage made the town's fortune as a major stop on the via Turonensis to Santiago — hence its UNESCO listing. Destroyed in the Wars of Religion, the abbey church was rebuilt from 1741 on a monumental scale, but work stopped dead at the Revolution: the towers remain open to the sky."tips:"The medieval centre, with timber-framed houses and clock tower, takes about an hour."},
 photos: trio(P.saintJeanDAngely),
 },
 {
 slug:"royan-architecture-des-annees-50"category:"visite"dept:"17"name:"Royan, capitale des années 50"city:"Royan"facts: [
 { fr:"Église Notre-Dame de Guillaume Gillet (1958)"en:"Notre-Dame church by Gillet (1958)" },
 { fr:"Label Ville d'art et d'histoire"en:"City of Art and History" },
 { fr:"Cinq conches et un front de mer"en:"Five coves and a seafront" },
 ],
 fr: {
 teaser:"Une station Belle Époque rasée en 1945 et reconstruite en béton audacieux: un manifeste d'architecture moderne face à l'océan."history:"Royan, station balnéaire élégante depuis le Second Empire, est détruite à 85 % par les bombardements alliés de janvier et avril 1945 visant la poche allemande de l'estuaire. La reconstruction, confiée à une équipe d'architectes modernistes, invente une ville nouvelle: front de mer sur portiques, villas à toitures en aile d'avion, marché couvert en voile de béton (1955) et surtout l'église Notre-Dame de Guillaume Gillet, achevée en 1958, nef de béton brut de 65 m de haut classée Monument historique."tips:"Circuit architecture disponible à l'office de tourisme. Superbe lumière en fin de journée sur la conche de Pontaillac."},
 en: {
 teaser:"A Belle Époque resort flattened in 1945 and rebuilt in bold concrete: a modern architecture manifesto facing the ocean."history:"An elegant resort since the Second Empire, Royan was 85% destroyed by Allied bombing in January and April 1945 targeting the German pocket on the estuary. Reconstruction, entrusted to modernist architects, invented a new town: a seafront on porticoes, villas with wing-shaped roofs, a concrete-shell market hall (1955) and above all Guillaume Gillet's Notre-Dame church, completed in 1958, a 65-metre raw concrete nave now a listed monument."tips:"An architecture trail is available at the tourist office. Beautiful late light over Pontaillac cove."},
 photos: trio(P.royan),
 },
 {
 slug:"chatelaillon-plage"category:"visite"dept:"17"name:"Châtelaillon-Plage"city:"Châtelaillon-Plage"facts: [
 { fr:"3 km de plage de sable fin"en:"3 km of fine sand" },
 { fr:"Villas balnéaires 1900"en:"1900s seaside villas" },
 { fr:"15 min de La Rochelle"en:"15 min from La Rochelle" },
 ],
 fr: {
 teaser:"La plage familiale de La Rochelle: trois kilomètres de sable, villas 1900 et marché sous halle."history:"Castrum Allionis fut au Xᵉ siècle la capitale de l'Aunis, siège des seigneurs de Châtelaillon, avant que la mer n'engloutisse la cité et son château — les vestiges reposent aujourd'hui sous les flots au large. La station renaît à la fin du XIXᵉ siècle avec l'arrivée du chemin de fer: on y bâtit des villas éclectiques à bow-windows et céramiques, dont beaucoup subsistent le long du front de mer, réaménagé au début des années 2000."tips:"Marché couvert le matin, puis plage. Liaison rapide avec l'aéroport et la gare de La Rochelle."},
 en: {
 teaser:"La Rochelle's family beach: three kilometres of sand, 1900s villas and a covered market."history:"Castrum Allionis was the 10th-century capital of the Aunis and seat of the lords of Châtelaillon, before the sea swallowed town and castle — the remains lie offshore. The resort was reborn in the late 19th century with the railway: eclectic villas with bow windows and ceramics went up, many still standing along the seafront, redeveloped in the early 2000s."tips:"Covered market in the morning, then the beach. Quick link to La Rochelle airport and station."},
 photos: trio(P.chatelaillon),
 },
 {
 slug:"visiter-la-rochelle"category:"visite"dept:"17"name:"Visiter La Rochelle"city:"La Rochelle"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 0 km de La Rochelle"en:"≈ 0 km from La Rochelle" },
 ],
 fr: {
 teaser:"Les tours du Vieux-Port, l'hôtel de ville Renaissance, le Muséum et l'Aquarium se visitent à pied en une journée."history:"Port fortifié dès le XIIᵉ siècle, La Rochelle fut la place forte protestante assiégée par Richelieu en 1627-1628. Ses trois tours médiévales — Saint-Nicolas, la Chaîne et la Lanterne — gardent encore l'entrée du Vieux-Port, bordé d'arcades du XVIIIᵉ siècle bâties par les armateurs du commerce atlantique."tips:"Nos deux chauffeurs desservent La Rochelle. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Old Port towers, the Renaissance city hall, the natural history museum and the Aquarium all fit into one walking day."history:"A fortified port since the 12th century, La Rochelle was the Protestant stronghold besieged by Richelieu in 1627-28. Its three medieval towers — Saint-Nicolas, the Chain and the Lantern — still guard the Old Port, lined with 18th-century arcades built by Atlantic trading shipowners."tips:"Our two drivers serve La Rochelle. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/021_-_CityMobyl2_-_La_Rochelle.jpg/1920px-021_-_CityMobyl2_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/1023_-_La_Coursive_%28entr%C3%A9e_principale%29_-_La_Rochelle.jpg/1920px-1023_-_La_Coursive_%28entr%C3%A9e_principale%29_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/17300-La_Rochelle-argile.jpg/1920px-17300-La_Rochelle-argile.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-la-rochelle"category:"randonnee"dept:"17"name:"Randonnées et balades à La Rochelle"city:"La Rochelle"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 0 km de La Rochelle"en:"≈ 0 km from La Rochelle" },
 ],
 fr: {
 teaser:"Le sentier du littoral file des Minimes à Aytré: 8 km de front de mer, plage de la Concurrence et pointe des Minimes."history:"Port fortifié dès le XIIᵉ siècle, La Rochelle fut la place forte protestante assiégée par Richelieu en 1627-1628. Ses trois tours médiévales — Saint-Nicolas, la Chaîne et la Lanterne — gardent encore l'entrée du Vieux-Port, bordé d'arcades du XVIIIᵉ siècle bâties par les armateurs du commerce atlantique."tips:"Nos deux chauffeurs desservent La Rochelle. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The coastal path runs from Les Minimes to Aytré: 8 km of seafront, Concurrence beach and the Minimes headland."history:"A fortified port since the 12th century, La Rochelle was the Protestant stronghold besieged by Richelieu in 1627-28. Its three medieval towers — Saint-Nicolas, the Chain and the Lantern — still guard the Old Port, lined with 18th-century arcades built by Atlantic trading shipowners."tips:"Our two drivers serve La Rochelle. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/369_-_Mairie_-_Lhoumeau.jpg/1920px-369_-_Mairie_-_Lhoumeau.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/805_-_Porte_Maubec_%28int%C3%A9rieur%29_-_La_Rochelle.jpg/1920px-805_-_Porte_Maubec_%28int%C3%A9rieur%29_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/809_-_Vestiges_de_la_porte_de_Cougnes_-_La_Rochelle.jpg/1920px-809_-_Vestiges_de_la_porte_de_Cougnes_-_La_Rochelle.jpg"],
 },
 {
 slug:"ou-manger-a-la-rochelle"category:"restaurant"dept:"17"name:"Où manger à La Rochelle"city:"La Rochelle"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 0 km de La Rochelle"en:"≈ 0 km from La Rochelle" },
 ],
 fr: {
 teaser:"Poissons de la criée, huîtres de Marennes-Oléron, mouclade charentaise et cagouilles: la cuisine rochelaise est maritime et beurrée."history:"Port fortifié dès le XIIᵉ siècle, La Rochelle fut la place forte protestante assiégée par Richelieu en 1627-1628. Ses trois tours médiévales — Saint-Nicolas, la Chaîne et la Lanterne — gardent encore l'entrée du Vieux-Port, bordé d'arcades du XVIIIᵉ siècle bâties par les armateurs du commerce atlantique."tips:"Nos deux chauffeurs desservent La Rochelle. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Fish from the auction hall, Marennes-Oléron oysters, mouclade and snails: La Rochelle's cooking is maritime and buttery."history:"A fortified port since the 12th century, La Rochelle was the Protestant stronghold besieged by Richelieu in 1627-28. Its three medieval towers — Saint-Nicolas, the Chain and the Lantern — still guard the Old Port, lined with 18th-century arcades built by Atlantic trading shipowners."tips:"Our two drivers serve La Rochelle. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/921_-_Th%C3%A9atre_Verdi%C3%A8re_-_La_Rochelle.jpg/1920px-921_-_Th%C3%A9atre_Verdi%C3%A8re_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/959_-_Clo%C3%AEtre_des_Dames_Blanches_-_La_Rochelle.jpg/1920px-959_-_Clo%C3%AEtre_des_Dames_Blanches_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/021_-_CityMobyl2_-_La_Rochelle.jpg/1920px-021_-_CityMobyl2_-_La_Rochelle.jpg"],
 },
 {
 slug:"ou-dormir-a-la-rochelle"category:"hotel"dept:"17"name:"Où dormir à La Rochelle"city:"La Rochelle"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 0 km de La Rochelle"en:"≈ 0 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 4 et 5 étoiles dans les hôtels particuliers du centre, 3 étoiles autour des Minimes, chambres d'hôtes dans les rues à arcades."history:"Port fortifié dès le XIIᵉ siècle, La Rochelle fut la place forte protestante assiégée par Richelieu en 1627-1628. Ses trois tours médiévales — Saint-Nicolas, la Chaîne et la Lanterne — gardent encore l'entrée du Vieux-Port, bordé d'arcades du XVIIIᵉ siècle bâties par les armateurs du commerce atlantique."tips:"Nos deux chauffeurs desservent La Rochelle. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Four- and five-star hotels in the historic mansions of the centre, three-star addresses around Les Minimes, guesthouses in the arcaded streets."history:"A fortified port since the 12th century, La Rochelle was the Protestant stronghold besieged by Richelieu in 1627-28. Its three medieval towers — Saint-Nicolas, the Chain and the Lantern — still guard the Old Port, lined with 18th-century arcades built by Atlantic trading shipowners."tips:"Our two drivers serve La Rochelle. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/1023_-_La_Coursive_%28entr%C3%A9e_principale%29_-_La_Rochelle.jpg/1920px-1023_-_La_Coursive_%28entr%C3%A9e_principale%29_-_La_Rochelle.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/17300-La_Rochelle-argile.jpg/1920px-17300-La_Rochelle-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/369_-_Mairie_-_Lhoumeau.jpg/1920px-369_-_Mairie_-_Lhoumeau.jpg"],
 },
 {
 slug:"visiter-rochefort"category:"visite"dept:"17"name:"Visiter Rochefort"city:"Rochefort"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Corderie royale, maison de Pierre Loti, pont transbordeur du Martrou et musée de la Marine."history:"Rochefort est une ville née d'une décision: en 1666, Colbert y implante l'arsenal de la Marine royale. La Corderie royale, longue de 374 mètres, y produisait tous les cordages de la flotte; la frégate Hermione y a été reconstruite entre 1997 et 2014."tips:"Nos deux chauffeurs desservent Rochefort. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Corderie Royale, Pierre Loti's house, the Martrou transporter bridge and the naval museum."history:"Rochefort was born of a decision: in 1666 Colbert founded the royal naval arsenal here. The 374-metre Corderie Royale made all the fleet's ropes; the frigate Hermione was rebuilt here between 1997 and 2014."tips:"Our two drivers serve Rochefort. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/077_-_Eglise_Notre-Dame_-_Rochefort.jpg/1920px-077_-_Eglise_Notre-Dame_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/7/7c/077_-_Tour_des_signaux_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/079_-_Eglise_Notre-Dame_vieille_paroisse_-_Rochefort.jpg/1920px-079_-_Eglise_Notre-Dame_vieille_paroisse_-_Rochefort.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-rochefort"category:"randonnee"dept:"17"name:"Randonnées et balades à Rochefort"city:"Rochefort"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucle des bords de Charente jusqu'au pont transbordeur, prolongée par la digue de Soubise."history:"Rochefort est une ville née d'une décision: en 1666, Colbert y implante l'arsenal de la Marine royale. La Corderie royale, longue de 374 mètres, y produisait tous les cordages de la flotte; la frégate Hermione y a été reconstruite entre 1997 et 2014."tips:"Nos deux chauffeurs desservent Rochefort. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"A loop along the Charente riverbank to the transporter bridge, extended by the Soubise dyke."history:"Rochefort was born of a decision: in 1666 Colbert founded the royal naval arsenal here. The 374-metre Corderie Royale made all the fleet's ropes; the frigate Hermione was rebuilt here between 1997 and 2014."tips:"Our two drivers serve Rochefort. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/079_-_Porte_de_la_pr%C3%A9fecture_maritime_-_Rochefort.jpg/1920px-079_-_Porte_de_la_pr%C3%A9fecture_maritime_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/084_-_Eglise_Saint-Louis_-_Rochefort.jpg/1920px-084_-_Eglise_Saint-Louis_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/089_-_Chapelle_de_la_Cabane_Carr%C3%A9e_-_Rochefort.jpg/1920px-089_-_Chapelle_de_la_Cabane_Carr%C3%A9e_-_Rochefort.jpg"],
 },
 {
 slug:"ou-manger-a-rochefort"category:"restaurant"dept:"17"name:"Où manger à Rochefort"city:"Rochefort"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Bistrots de l'arsenal, cuisine de la Charente: anguilles, éclade de moules, melon charentais."history:"Rochefort est une ville née d'une décision: en 1666, Colbert y implante l'arsenal de la Marine royale. La Corderie royale, longue de 374 mètres, y produisait tous les cordages de la flotte; la frégate Hermione y a été reconstruite entre 1997 et 2014."tips:"Nos deux chauffeurs desservent Rochefort. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Arsenal bistros and river cooking: eels, pine-needle grilled mussels, Charentais melon."history:"Rochefort was born of a decision: in 1666 Colbert founded the royal naval arsenal here. The 374-metre Corderie Royale made all the fleet's ropes; the frigate Hermione was rebuilt here between 1997 and 2014."tips:"Our two drivers serve Rochefort. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/102_-_Fa%C3%A7ade_du_th%C3%A9atre_-_Rochefort.jpg/1920px-102_-_Fa%C3%A7ade_du_th%C3%A9atre_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/102_-_Temple_Protestant_-_Rochefort.jpg/1920px-102_-_Temple_Protestant_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/077_-_Eglise_Notre-Dame_-_Rochefort.jpg/1920px-077_-_Eglise_Notre-Dame_-_Rochefort.jpg"],
 },
 {
 slug:"ou-dormir-a-rochefort"category:"hotel"dept:"17"name:"Où dormir à Rochefort"city:"Rochefort"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles autour de la place Colbert, thermes et résidences 4 étoiles près du Martrou."history:"Rochefort est une ville née d'une décision: en 1666, Colbert y implante l'arsenal de la Marine royale. La Corderie royale, longue de 374 mètres, y produisait tous les cordages de la flotte; la frégate Hermione y a été reconstruite entre 1997 et 2014."tips:"Nos deux chauffeurs desservent Rochefort. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels around Place Colbert, spa and four-star residences near Le Martrou."history:"Rochefort was born of a decision: in 1666 Colbert founded the royal naval arsenal here. The 374-metre Corderie Royale made all the fleet's ropes; the frigate Hermione was rebuilt here between 1997 and 2014."tips:"Our two drivers serve Rochefort. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/7/7c/077_-_Tour_des_signaux_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/079_-_Eglise_Notre-Dame_vieille_paroisse_-_Rochefort.jpg/1920px-079_-_Eglise_Notre-Dame_vieille_paroisse_-_Rochefort.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/079_-_Porte_de_la_pr%C3%A9fecture_maritime_-_Rochefort.jpg/1920px-079_-_Porte_de_la_pr%C3%A9fecture_maritime_-_Rochefort.jpg"],
 },
 {
 slug:"visiter-saintes"category:"visite"dept:"17"name:"Visiter Saintes"city:"Saintes"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Arc de Germanicus, amphithéâtre gallo-romain, Abbaye aux Dames et cathédrale Saint-Pierre."history:"Mediolanum Santonum fut capitale de l'Aquitaine romaine: l'arc de Germanicus (19 apr. J.-C.) et l'amphithéâtre creusé dans le vallon en témoignent. L'Abbaye aux Dames, fondée en 1047, formait les filles de la noblesse et accueille aujourd'hui un festival de musique classique réputé."tips:"Nos deux chauffeurs desservent Saintes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Arch of Germanicus, the Gallo-Roman amphitheatre, the Abbaye aux Dames and Saint-Pierre cathedral."history:"Mediolanum Santonum was the capital of Roman Aquitaine: the Arch of Germanicus (AD 19) and the amphitheatre carved into the valley remain. The Abbaye aux Dames, founded in 1047, educated noblewomen and now hosts a renowned classical music festival."tips:"Our two drivers serve Saintes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/6/6b/-25ansparcantonPC.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/17415-Saintes-argile.jpg/1920px-17415-Saintes-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Amphith%C3%A9%C3%A2tre_Saintes_inond%C3%A9_%281982%29.jpg/1920px-Amphith%C3%A9%C3%A2tre_Saintes_inond%C3%A9_%281982%29.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saintes"category:"randonnee"dept:"17"name:"Randonnées et balades à Saintes"city:"Saintes"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Les quais de Charente jusqu'au parc de Fontbedeau, puis la vallée vers Chaniers et ses moulins."history:"Mediolanum Santonum fut capitale de l'Aquitaine romaine: l'arc de Germanicus (19 apr. J.-C.) et l'amphithéâtre creusé dans le vallon en témoignent. L'Abbaye aux Dames, fondée en 1047, formait les filles de la noblesse et accueille aujourd'hui un festival de musique classique réputé."tips:"Nos deux chauffeurs desservent Saintes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Charente quays to Fontbedeau park, then the valley towards Chaniers and its mills."history:"Mediolanum Santonum was the capital of Roman Aquitaine: the Arch of Germanicus (AD 19) and the amphitheatre carved into the valley remain. The Abbaye aux Dames, founded in 1047, educated noblewomen and now hosts a renowned classical music festival."tips:"Our two drivers serve Saintes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/9/95/Ancienne_chapelle_des_b%C3%A9n%C3%A9dictins.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Basilique_Saint-Eutrope_de_Saintes.jpg/1920px-Basilique_Saint-Eutrope_de_Saintes.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bateau-mouche_Saintes.jpg/1920px-Bateau-mouche_Saintes.jpg"],
 },
 {
 slug:"ou-manger-a-saintes"category:"restaurant"dept:"17"name:"Où manger à Saintes"city:"Saintes"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Tables de marché, pineau des Charentes et grillons charentais, marché couvert le mercredi et le samedi."history:"Mediolanum Santonum fut capitale de l'Aquitaine romaine: l'arc de Germanicus (19 apr. J.-C.) et l'amphithéâtre creusé dans le vallon en témoignent. L'Abbaye aux Dames, fondée en 1047, formait les filles de la noblesse et accueille aujourd'hui un festival de musique classique réputé."tips:"Nos deux chauffeurs desservent Saintes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Market-driven tables, pineau des Charentes and potted pork, covered market on Wednesday and Saturday."history:"Mediolanum Santonum was the capital of Roman Aquitaine: the Arch of Germanicus (AD 19) and the amphitheatre carved into the valley remain. The Abbaye aux Dames, founded in 1047, educated noblewomen and now hosts a renowned classical music festival."tips:"Our two drivers serve Saintes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Boiffiers.jpg/1920px-Boiffiers.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Bus_de_Saintes.jpg/1920px-Bus_de_Saintes.jpg""https://upload.wikimedia.org/wikipedia/commons/6/6b/-25ansparcantonPC.jpg"],
 },
 {
 slug:"ou-dormir-a-saintes"category:"hotel"dept:"17"name:"Où dormir à Saintes"city:"Saintes"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 et 4 étoiles dans les demeures de la rive droite, dont un domaine hôtelier en parc boisé."history:"Mediolanum Santonum fut capitale de l'Aquitaine romaine: l'arc de Germanicus (19 apr. J.-C.) et l'amphithéâtre creusé dans le vallon en témoignent. L'Abbaye aux Dames, fondée en 1047, formait les filles de la noblesse et accueille aujourd'hui un festival de musique classique réputé."tips:"Nos deux chauffeurs desservent Saintes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three- and four-star hotels in right-bank townhouses, including a country-house hotel set in woodland."history:"Mediolanum Santonum was the capital of Roman Aquitaine: the Arch of Germanicus (AD 19) and the amphitheatre carved into the valley remain. The Abbaye aux Dames, founded in 1047, educated noblewomen and now hosts a renowned classical music festival."tips:"Our two drivers serve Saintes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/17415-Saintes-argile.jpg/1920px-17415-Saintes-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Amphith%C3%A9%C3%A2tre_Saintes_inond%C3%A9_%281982%29.jpg/1920px-Amphith%C3%A9%C3%A2tre_Saintes_inond%C3%A9_%281982%29.jpg""https://upload.wikimedia.org/wikipedia/commons/9/95/Ancienne_chapelle_des_b%C3%A9n%C3%A9dictins.jpg"],
 },
 {
 slug:"visiter-royan"category:"visite"dept:"17"name:"Visiter Royan"city:"Royan"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Église Notre-Dame, marché central en coque de béton, front de mer et villas 1900 de Pontaillac."history:"Bombardée en janvier 1945, Royan a été rebâtie dans les années 1950: elle est aujourd'hui l'un des plus grands ensembles d'architecture moderne de France, couronné par l'église Notre-Dame de Guillaume Gillet, un vaisseau de béton achevé en 1958."tips:"Nos deux chauffeurs desservent Royan. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Notre-Dame church, the concrete-shell central market, the seafront and the 1900s villas of Pontaillac."history:"Bombed in January 1945, Royan was rebuilt in the 1950s and is now one of France's largest sets of modernist architecture, crowned by Guillaume Gillet's Notre-Dame church, a concrete vessel completed in 1958."tips:"Our two drivers serve Royan. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/17306-Royan-Sols.png/1920px-17306-Royan-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/17306-Royan-argile.jpg/1920px-17306-Royan-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/1/1c/2001-12-Royan-Plage.JPG"],
 },
 {
 slug:"randonnees-et-balades-a-royan"category:"randonnee"dept:"17"name:"Randonnées et balades à Royan"city:"Royan"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier des cinq plages: Grande Conche, Pigeonnier, Chay, Foncillon et Pontaillac."history:"Bombardée en janvier 1945, Royan a été rebâtie dans les années 1950: elle est aujourd'hui l'un des plus grands ensembles d'architecture moderne de France, couronné par l'église Notre-Dame de Guillaume Gillet, un vaisseau de béton achevé en 1958."tips:"Nos deux chauffeurs desservent Royan. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The five-beaches path: Grande Conche, Pigeonnier, Chay, Foncillon and Pontaillac."history:"Bombed in January 1945, Royan was rebuilt in the 1950s and is now one of France's largest sets of modernist architecture, crowned by Guillaume Gillet's Notre-Dame church, a concrete vessel completed in 1958."tips:"Our two drivers serve Royan. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/2/20/BNMsFr2829Fol18Henry3LandsAquit.jpg""https://upload.wikimedia.org/wikipedia/commons/c/c5/BR_151_-_PONTAILLAC_ROYAN_-_L%27arriv%C3%A9e_du_Tramway.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Boulevard_Briand.jpg/1920px-Boulevard_Briand.jpg"],
 },
 {
 slug:"ou-manger-a-royan"category:"restaurant"dept:"17"name:"Où manger à Royan"city:"Royan"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Fruits de mer sur le port, glaces sur le front de mer, cagouilles et huîtres de la Seudre."history:"Bombardée en janvier 1945, Royan a été rebâtie dans les années 1950: elle est aujourd'hui l'un des plus grands ensembles d'architecture moderne de France, couronné par l'église Notre-Dame de Guillaume Gillet, un vaisseau de béton achevé en 1958."tips:"Nos deux chauffeurs desservent Royan. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Seafood on the harbour, ice cream on the seafront, snails and Seudre oysters."history:"Bombed in January 1945, Royan was rebuilt in the 1950s and is now one of France's largest sets of modernist architecture, crowned by Guillaume Gillet's Notre-Dame church, a concrete vessel completed in 1958."tips:"Our two drivers serve Royan. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/CAREL.jpg/1920px-CAREL.jpg""https://upload.wikimedia.org/wikipedia/commons/b/b6/Cordouan.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/17306-Royan-Sols.png/1920px-17306-Royan-Sols.png"],
 },
 {
 slug:"ou-dormir-a-royan"category:"hotel"dept:"17"name:"Où dormir à Royan"city:"Royan"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 et 4 étoiles à Pontaillac et sur le front de mer, résidences familiales près de la Grande Conche."history:"Bombardée en janvier 1945, Royan a été rebâtie dans les années 1950: elle est aujourd'hui l'un des plus grands ensembles d'architecture moderne de France, couronné par l'église Notre-Dame de Guillaume Gillet, un vaisseau de béton achevé en 1958."tips:"Nos deux chauffeurs desservent Royan. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three- and four-star hotels at Pontaillac and along the seafront, family residences near the Grande Conche."history:"Bombed in January 1945, Royan was rebuilt in the 1950s and is now one of France's largest sets of modernist architecture, crowned by Guillaume Gillet's Notre-Dame church, a concrete vessel completed in 1958."tips:"Our two drivers serve Royan. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/17306-Royan-argile.jpg/1920px-17306-Royan-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/1/1c/2001-12-Royan-Plage.JPG""https://upload.wikimedia.org/wikipedia/commons/2/20/BNMsFr2829Fol18Henry3LandsAquit.jpg"],
 },
 {
 slug:"visiter-saint-martin-de-re"category:"visite"dept:"17"name:"Visiter Saint-Martin-de-Ré"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Remparts Vauban, citadelle, clocher-observatoire et ruelles à roses trémières."history:"Vauban fortifie Saint-Martin après 1681: ses remparts de 14 km, inscrits au patrimoine mondial de l'UNESCO depuis 2008, pouvaient abriter toute la population de l'île. Le port en forme de fer à cheval fut aussi le point de départ des bagnards vers la Guyane jusqu'en 1938."tips:"Nos deux chauffeurs desservent Saint-Martin-de-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Vauban's ramparts, the citadel, the observatory bell tower and lanes full of hollyhocks."history:"Vauban fortified Saint-Martin after 1681: its 14 km of ramparts, UNESCO-listed since 2008, could shelter the whole island's population. The horseshoe harbour was also the departure point for convicts bound for Guiana until 1938."tips:"Our two drivers serve Saint-Martin-de-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/17369-Saint-Martin-de-R%C3%A9-Sols.png/1920px-17369-Saint-Martin-de-R%C3%A9-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/176_-_Maison_de_la_Vinatrie_-_St_Martin_de_R%C3%A9.jpg/1920px-176_-_Maison_de_la_Vinatrie_-_St_Martin_de_R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/975_-_Porte_des_Campani_-_St_Martin_de_R%C3%A9.jpg/1920px-975_-_Porte_des_Campani_-_St_Martin_de_R%C3%A9.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-martin-de-re"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Martin-de-Ré"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Tour des fortifications puis piste côtière vers La Flotte et Loix, à plat, accessible à tous."history:"Vauban fortifie Saint-Martin après 1681: ses remparts de 14 km, inscrits au patrimoine mondial de l'UNESCO depuis 2008, pouvaient abriter toute la population de l'île. Le port en forme de fer à cheval fut aussi le point de départ des bagnards vers la Guyane jusqu'en 1938."tips:"Nos deux chauffeurs desservent Saint-Martin-de-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"A circuit of the fortifications, then the flat coastal track to La Flotte and Loix, easy for everyone."history:"Vauban fortified Saint-Martin after 1681: its 14 km of ramparts, UNESCO-listed since 2008, could shelter the whole island's population. The horseshoe harbour was also the departure point for convicts bound for Guiana until 1938."tips:"Our two drivers serve Saint-Martin-de-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Bataille_navale_Re_1622.jpg/1920px-Bataille_navale_Re_1622.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BeachCruiser-Saint-Martin-de-Re-byRundvald.jpg/1920px-BeachCruiser-Saint-Martin-de-Re-byRundvald.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bombardement_d%27Olone_et_de_Saint-Martin-de-Re_en_1696.jpg/1920px-Bombardement_d%27Olone_et_de_Saint-Martin-de-Re_en_1696.jpg"],
 },
 {
 slug:"ou-manger-a-saint-martin-de-re"category:"restaurant"dept:"17"name:"Où manger à Saint-Martin-de-Ré"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Huîtres de Ré, pommes de terre AOP, sel de l'île et carrelets du port."history:"Vauban fortifie Saint-Martin après 1681: ses remparts de 14 km, inscrits au patrimoine mondial de l'UNESCO depuis 2008, pouvaient abriter toute la population de l'île. Le port en forme de fer à cheval fut aussi le point de départ des bagnards vers la Guyane jusqu'en 1938."tips:"Nos deux chauffeurs desservent Saint-Martin-de-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Ré oysters, PDO potatoes, island salt and fish from the harbour."history:"Vauban fortified Saint-Martin after 1681: its 14 km of ramparts, UNESCO-listed since 2008, could shelter the whole island's population. The horseshoe harbour was also the departure point for convicts bound for Guiana until 1938."tips:"Our two drivers serve Saint-Martin-de-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/9/91/Clerjotte_ile_de_Re_2.jpg""https://upload.wikimedia.org/wikipedia/commons/f/ff/Colombages_%C3%A0_Saint-Martin-en-R%C3%A9.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/17369-Saint-Martin-de-R%C3%A9-Sols.png/1920px-17369-Saint-Martin-de-R%C3%A9-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-martin-de-re"category:"hotel"dept:"17"name:"Où dormir à Saint-Martin-de-Ré"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 4 et 5 étoiles dans les demeures d'armateurs du port, maisons d'hôtes de charme dans les venelles."history:"Vauban fortifie Saint-Martin après 1681: ses remparts de 14 km, inscrits au patrimoine mondial de l'UNESCO depuis 2008, pouvaient abriter toute la population de l'île. Le port en forme de fer à cheval fut aussi le point de départ des bagnards vers la Guyane jusqu'en 1938."tips:"Nos deux chauffeurs desservent Saint-Martin-de-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Four- and five-star hotels in the harbour's shipowner mansions, charming guesthouses in the lanes."history:"Vauban fortified Saint-Martin after 1681: its 14 km of ramparts, UNESCO-listed since 2008, could shelter the whole island's population. The horseshoe harbour was also the departure point for convicts bound for Guiana until 1938."tips:"Our two drivers serve Saint-Martin-de-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/176_-_Maison_de_la_Vinatrie_-_St_Martin_de_R%C3%A9.jpg/1920px-176_-_Maison_de_la_Vinatrie_-_St_Martin_de_R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/975_-_Porte_des_Campani_-_St_Martin_de_R%C3%A9.jpg/1920px-975_-_Porte_des_Campani_-_St_Martin_de_R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Bataille_navale_Re_1622.jpg/1920px-Bataille_navale_Re_1622.jpg"],
 },
 {
 slug:"visiter-ars-en-re"category:"visite"dept:"17"name:"Visiter Ars-en-Ré"city:"Ars-en-Ré"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Clocher Saint-Étienne, port de plaisance, marais salants et cabanes de sauniers."history:"Le clocher noir et blanc d'Ars, peint en 1840 comme amer pour les navigateurs, domine un village classé parmi les Plus Beaux Villages de France. Le bourg vécut du sel: les marais salants de Fier d'Ars sont exploités depuis le Moyen Âge."tips:"Nos deux chauffeurs desservent Ars-en-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Saint-Étienne steeple, the marina, the salt marshes and salt workers' huts."history:"Ars's black-and-white steeple, painted in 1840 as a seamark, rises over a village listed among France's Most Beautiful Villages. Salt made the town: the Fier d'Ars salt marshes have been worked since the Middle Ages."tips:"Our two drivers serve Ars-en-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/007_-_Eglise_Saint-Etienne_-_Ars_en_R%C3%A9.jpg/1920px-007_-_Eglise_Saint-Etienne_-_Ars_en_R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/009_-_Ancienne_raffinerie_%C3%A0_sel_-_Ars_en_R%C3%A9.jpg/1920px-009_-_Ancienne_raffinerie_%C3%A0_sel_-_Ars_en_R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/17019-Ars-en-R%C3%A9-Sols.png/1920px-17019-Ars-en-R%C3%A9-Sols.png"],
 },
 {
 slug:"randonnees-et-balades-a-ars-en-re"category:"randonnee"dept:"17"name:"Randonnées et balades à Ars-en-Ré"city:"Ars-en-Ré"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucle des marais du Fier d'Ars, réserve ornithologique de Lilleau des Niges: flamants et avocettes."history:"Le clocher noir et blanc d'Ars, peint en 1840 comme amer pour les navigateurs, domine un village classé parmi les Plus Beaux Villages de France. Le bourg vécut du sel: les marais salants de Fier d'Ars sont exploités depuis le Moyen Âge."tips:"Nos deux chauffeurs desservent Ars-en-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Fier d'Ars marsh loop and the Lilleau des Niges bird reserve: flamingos and avocets."history:"Ars's black-and-white steeple, painted in 1840 as a seamark, rises over a village listed among France's Most Beautiful Villages. Salt made the town: the Fier d'Ars salt marshes have been worked since the Middle Ages."tips:"Our two drivers serve Ars-en-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/17019-Ars-en-R%C3%A9-argile.jpg/1920px-17019-Ars-en-R%C3%A9-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/9/9f/Clocher_Ars-en-R%C3%A9_018.jpg""https://upload.wikimedia.org/wikipedia/commons/6/6d/Gare_Ars_en_R%C3%A9.jpg"],
 },
 {
 slug:"ou-manger-a-ars-en-re"category:"restaurant"dept:"17"name:"Où manger à Ars-en-Ré"city:"Ars-en-Ré"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Fleur de sel, huîtres du Fier, glaces au caramel salé et poissons grillés du port."history:"Le clocher noir et blanc d'Ars, peint en 1840 comme amer pour les navigateurs, domine un village classé parmi les Plus Beaux Villages de France. Le bourg vécut du sel: les marais salants de Fier d'Ars sont exploités depuis le Moyen Âge."tips:"Nos deux chauffeurs desservent Ars-en-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Fleur de sel, Fier oysters, salted-caramel ice cream and grilled harbour fish."history:"Ars's black-and-white steeple, painted in 1840 as a seamark, rises over a village listed among France's Most Beautiful Villages. Salt made the town: the Fier d'Ars salt marshes have been worked since the Middle Ages."tips:"Our two drivers serve Ars-en-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/e/ec/Mairie_Ars_ile_de_Re.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Maison_Ars-en-R%C3%A9.jpg/1920px-Maison_Ars-en-R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/007_-_Eglise_Saint-Etienne_-_Ars_en_R%C3%A9.jpg/1920px-007_-_Eglise_Saint-Etienne_-_Ars_en_R%C3%A9.jpg"],
 },
 {
 slug:"ou-dormir-a-ars-en-re"category:"hotel"dept:"17"name:"Où dormir à Ars-en-Ré"city:"Ars-en-Ré"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Petits hôtels 3 et 4 étoiles à jardin, chambres d'hôtes dans les maisons de sauniers."history:"Le clocher noir et blanc d'Ars, peint en 1840 comme amer pour les navigateurs, domine un village classé parmi les Plus Beaux Villages de France. Le bourg vécut du sel: les marais salants de Fier d'Ars sont exploités depuis le Moyen Âge."tips:"Nos deux chauffeurs desservent Ars-en-Ré. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Small three- and four-star hotels with gardens, guesthouses in old salt workers' houses."history:"Ars's black-and-white steeple, painted in 1840 as a seamark, rises over a village listed among France's Most Beautiful Villages. Salt made the town: the Fier d'Ars salt marshes have been worked since the Middle Ages."tips:"Our two drivers serve Ars-en-Ré. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/009_-_Ancienne_raffinerie_%C3%A0_sel_-_Ars_en_R%C3%A9.jpg/1920px-009_-_Ancienne_raffinerie_%C3%A0_sel_-_Ars_en_R%C3%A9.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/17019-Ars-en-R%C3%A9-Sols.png/1920px-17019-Ars-en-R%C3%A9-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/17019-Ars-en-R%C3%A9-argile.jpg/1920px-17019-Ars-en-R%C3%A9-argile.jpg"],
 },
 {
 slug:"visiter-la-flotte"category:"visite"dept:"17"name:"Visiter La Flotte"city:"La Flotte"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 27 km de La Rochelle"en:"≈ 27 km from La Rochelle" },
 ],
 fr: {
 teaser:"Marché médiéval, port à marée, ruines de l'abbaye des Châteliers face à la mer."history:"La Flotte-en-Ré, également classée Plus Beau Village de France, conserve un marché médiéval sous charpente et l'abbaye cistercienne des Châteliers, fondée en 1156 et ruinée par les troupes anglaises puis par les guerres de Religion."tips:"Nos deux chauffeurs desservent La Flotte. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The medieval market, the tidal harbour and the seafront ruins of Les Châteliers abbey."history:"La Flotte-en-Ré, also listed among France's Most Beautiful Villages, keeps a timber-framed medieval market and the Cistercian abbey of Les Châteliers, founded in 1156 and ruined by English troops and the Wars of Religion."tips:"Our two drivers serve La Flotte. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/002_-_March%C3%A9_m%C3%A9di%C3%A9val_-_La_Flotte.jpg/1920px-002_-_March%C3%A9_m%C3%A9di%C3%A9val_-_La_Flotte.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/004_-_Eglise_Sainte-Catherine_-_La_Flotte.jpg/1920px-004_-_Eglise_Sainte-Catherine_-_La_Flotte.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/106_-_Abbaye_des_Ch%C3%A2teliers_-_La_Flotte.jpg/1920px-106_-_Abbaye_des_Ch%C3%A2teliers_-_La_Flotte.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-la-flotte"category:"randonnee"dept:"17"name:"Randonnées et balades à La Flotte"city:"La Flotte"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 27 km de La Rochelle"en:"≈ 27 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chemin côtier vers Rivedoux et le fort de La Prée, bastion de 1625."history:"La Flotte-en-Ré, également classée Plus Beau Village de France, conserve un marché médiéval sous charpente et l'abbaye cistercienne des Châteliers, fondée en 1156 et ruinée par les troupes anglaises puis par les guerres de Religion."tips:"Nos deux chauffeurs desservent La Flotte. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Coastal path towards Rivedoux and Fort de La Prée, a 1625 bastion."history:"La Flotte-en-Ré, also listed among France's Most Beautiful Villages, keeps a timber-framed medieval market and the Cistercian abbey of Les Châteliers, founded in 1156 and ruined by English troops and the Wars of Religion."tips:"Our two drivers serve La Flotte. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/17161-La_Flotte-Sols.png/1920px-17161-La_Flotte-Sols.png""https://upload.wikimedia.org/wikipedia/commons/c/cd/AbbayeNotreDamedeRe_01.JPG""https://upload.wikimedia.org/wikipedia/commons/b/bb/Enseigne_mairie_La_Flotte.jpg"],
 },
 {
 slug:"ou-manger-a-la-flotte"category:"restaurant"dept:"17"name:"Où manger à La Flotte"city:"La Flotte"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 27 km de La Rochelle"en:"≈ 27 km from La Rochelle" },
 ],
 fr: {
 teaser:"Étals du marché couvert le matin, bars à huîtres du quai, tourteaux et bulots."history:"La Flotte-en-Ré, également classée Plus Beau Village de France, conserve un marché médiéval sous charpente et l'abbaye cistercienne des Châteliers, fondée en 1156 et ruinée par les troupes anglaises puis par les guerres de Religion."tips:"Nos deux chauffeurs desservent La Flotte. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Covered market stalls in the morning, oyster bars on the quay, crab and whelks."history:"La Flotte-en-Ré, also listed among France's Most Beautiful Villages, keeps a timber-framed medieval market and the Cistercian abbey of Les Châteliers, founded in 1156 and ruined by English troops and the Wars of Religion."tips:"Our two drivers serve La Flotte. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/1/19/Fortlapreelaflotte03.jpg""https://upload.wikimedia.org/wikipedia/commons/0/01/Jetee_port_La_Flotte.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/002_-_March%C3%A9_m%C3%A9di%C3%A9val_-_La_Flotte.jpg/1920px-002_-_March%C3%A9_m%C3%A9di%C3%A9val_-_La_Flotte.jpg"],
 },
 {
 slug:"ou-dormir-a-la-flotte"category:"hotel"dept:"17"name:"Où dormir à La Flotte"city:"La Flotte"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 27 km de La Rochelle"en:"≈ 27 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 et 4 étoiles à quelques mètres du port, souvent avec piscine et spa."history:"La Flotte-en-Ré, également classée Plus Beau Village de France, conserve un marché médiéval sous charpente et l'abbaye cistercienne des Châteliers, fondée en 1156 et ruinée par les troupes anglaises puis par les guerres de Religion."tips:"Nos deux chauffeurs desservent La Flotte. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three- and four-star hotels steps from the harbour, often with pool and spa."history:"La Flotte-en-Ré, also listed among France's Most Beautiful Villages, keeps a timber-framed medieval market and the Cistercian abbey of Les Châteliers, founded in 1156 and ruined by English troops and the Wars of Religion."tips:"Our two drivers serve La Flotte. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/004_-_Eglise_Sainte-Catherine_-_La_Flotte.jpg/1920px-004_-_Eglise_Sainte-Catherine_-_La_Flotte.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/106_-_Abbaye_des_Ch%C3%A2teliers_-_La_Flotte.jpg/1920px-106_-_Abbaye_des_Ch%C3%A2teliers_-_La_Flotte.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/17161-La_Flotte-Sols.png/1920px-17161-La_Flotte-Sols.png"],
 },
 {
 slug:"visiter-saint-clement-des-baleines"category:"visite"dept:"17"name:"Visiter Saint-Clément-des-Baleines"city:"Saint-Clément-des-Baleines"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 45 km de La Rochelle"en:"≈ 45 km from La Rochelle" },
 ],
 fr: {
 teaser:"Phare des Baleines, vieille tour de Vauban et estran rocheux de la Conche."history:"À la pointe ouest de Ré, le phare des Baleines, allumé en 1854, remplace la tour de Vauban de 1682 restée voisine. Ses 257 marches ouvrent sur le pertuis Breton, redouté des marins pour ses hauts-fonds."tips:"Nos deux chauffeurs desservent Saint-Clément-des-Baleines. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Baleines lighthouse, Vauban's old tower and the rocky Conche foreshore."history:"At Ré's western tip, the Baleines lighthouse, lit in 1854, replaced Vauban's 1682 tower which still stands beside it. Its 257 steps open onto the Pertuis Breton, feared by sailors for its shallows."tips:"Our two drivers serve Saint-Clément-des-Baleines. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/171_-_Eglise_Saint-Cl%C3%A9ment_-_St_Cl%C3%A9ment_des_Baleines.jpg/1920px-171_-_Eglise_Saint-Cl%C3%A9ment_-_St_Cl%C3%A9ment_des_Baleines.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/17318-Saint-Cl%C3%A9ment-des-Baleines-Sols.png/1920px-17318-Saint-Cl%C3%A9ment-des-Baleines-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/17318-Saint-Cl%C3%A9ment-des-Baleines-argile.jpg/1920px-17318-Saint-Cl%C3%A9ment-des-Baleines-argile.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-clement-des-baleines"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Clément-des-Baleines"city:"Saint-Clément-des-Baleines"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 45 km de La Rochelle"en:"≈ 45 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier des douaniers le long des dunes, entre forêt du Lizay et plage de la Conche des Baleines."history:"À la pointe ouest de Ré, le phare des Baleines, allumé en 1854, remplace la tour de Vauban de 1682 restée voisine. Ses 257 marches ouvrent sur le pertuis Breton, redouté des marins pour ses hauts-fonds."tips:"Nos deux chauffeurs desservent Saint-Clément-des-Baleines. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The customs officers' path along the dunes, between the Lizay forest and Conche des Baleines beach."history:"At Ré's western tip, the Baleines lighthouse, lit in 1854, replaced Vauban's 1682 tower which still stands beside it. Its 257 steps open onto the Pertuis Breton, feared by sailors for its shallows."tips:"Our two drivers serve Saint-Clément-des-Baleines. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/174_-_Mairie_-_St_Cl%C3%A9ment_des_Baleines.jpg/1920px-174_-_Mairie_-_St_Cl%C3%A9ment_des_Baleines.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/220_-_Ancien_Phare_des_Baleines_-_St_Cl%C3%A9ment.jpg/1920px-220_-_Ancien_Phare_des_Baleines_-_St_Cl%C3%A9ment.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/609_-_La_c%C3%B4te_pr%C3%A8s_du_Phare_des_Baleines_-_St_Cl%C3%A9ment.jpg/1920px-609_-_La_c%C3%B4te_pr%C3%A8s_du_Phare_des_Baleines_-_St_Cl%C3%A9ment.jpg"],
 },
 {
 slug:"ou-manger-a-saint-clement-des-baleines"category:"restaurant"dept:"17"name:"Où manger à Saint-Clément-des-Baleines"city:"Saint-Clément-des-Baleines"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 45 km de La Rochelle"en:"≈ 45 km from La Rochelle" },
 ],
 fr: {
 teaser:"Restaurants de plage, moules-frites, poissons du pertuis grillés au feu de bois."history:"À la pointe ouest de Ré, le phare des Baleines, allumé en 1854, remplace la tour de Vauban de 1682 restée voisine. Ses 257 marches ouvrent sur le pertuis Breton, redouté des marins pour ses hauts-fonds."tips:"Nos deux chauffeurs desservent Saint-Clément-des-Baleines. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Beach restaurants, moules-frites and wood-fire grilled fish from the strait."history:"At Ré's western tip, the Baleines lighthouse, lit in 1854, replaced Vauban's 1682 tower which still stands beside it. Its 257 steps open onto the Pertuis Breton, feared by sailors for its shallows."tips:"Our two drivers serve Saint-Clément-des-Baleines. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/d/d8/Ile-de-Re_vue_du_ciel.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/171_-_Eglise_Saint-Cl%C3%A9ment_-_St_Cl%C3%A9ment_des_Baleines.jpg/1920px-171_-_Eglise_Saint-Cl%C3%A9ment_-_St_Cl%C3%A9ment_des_Baleines.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/17318-Saint-Cl%C3%A9ment-des-Baleines-Sols.png/1920px-17318-Saint-Cl%C3%A9ment-des-Baleines-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-clement-des-baleines"category:"hotel"dept:"17"name:"Où dormir à Saint-Clément-des-Baleines"city:"Saint-Clément-des-Baleines"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île de Ré"en:"Area: Île de Ré" },
 { fr:"≈ 45 km de La Rochelle"en:"≈ 45 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles à l'orée de la forêt, campings haut de gamme et locations de charme."history:"À la pointe ouest de Ré, le phare des Baleines, allumé en 1854, remplace la tour de Vauban de 1682 restée voisine. Ses 257 marches ouvrent sur le pertuis Breton, redouté des marins pour ses hauts-fonds."tips:"Nos deux chauffeurs desservent Saint-Clément-des-Baleines. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels at the forest edge, upmarket campsites and character rentals."history:"At Ré's western tip, the Baleines lighthouse, lit in 1854, replaced Vauban's 1682 tower which still stands beside it. Its 257 steps open onto the Pertuis Breton, feared by sailors for its shallows."tips:"Our two drivers serve Saint-Clément-des-Baleines. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/17318-Saint-Cl%C3%A9ment-des-Baleines-argile.jpg/1920px-17318-Saint-Cl%C3%A9ment-des-Baleines-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/174_-_Mairie_-_St_Cl%C3%A9ment_des_Baleines.jpg/1920px-174_-_Mairie_-_St_Cl%C3%A9ment_des_Baleines.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/220_-_Ancien_Phare_des_Baleines_-_St_Cl%C3%A9ment.jpg/1920px-220_-_Ancien_Phare_des_Baleines_-_St_Cl%C3%A9ment.jpg"],
 },
 {
 slug:"visiter-saint-pierre-d-oleron"category:"visite"dept:"17"name:"Visiter Saint-Pierre-d'Oléron"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 75 km de La Rochelle"en:"≈ 75 km from La Rochelle" },
 ],
 fr: {
 teaser:"Lanterne des morts, église Saint-Pierre, marché quotidien et maison des Aïeules."history:"Capitale historique d'Oléron, Saint-Pierre garde une lanterne des morts du XIIIᵉ siècle, unique sur l'île, et la maison des Aïeules où Pierre Loti repose au jardin. La ville commande depuis toujours les marais et les vignes de l'île."tips:"Nos deux chauffeurs desservent Saint-Pierre-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The lantern of the dead, Saint-Pierre church, the daily market and the Maison des Aïeules."history:"Oléron's historic capital, Saint-Pierre keeps a 13th-century lantern of the dead, unique on the island, and the Maison des Aïeules where Pierre Loti is buried in the garden. The town has always governed the island's marshes and vineyards."tips:"Our two drivers serve Saint-Pierre-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/17%2C_Ile_d%C2%B4Ol%C3%A9ron%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_kissenot._1914.jpg/1920px-17%2C_Ile_d%C2%B4Ol%C3%A9ron%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_kissenot._1914.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballet._V._1915.jpg/1920px-17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballet._V._1915.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballon._1915.jpg/1920px-17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballon._1915.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-pierre-d-oleron"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Pierre-d'Oléron"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 75 km de La Rochelle"en:"≈ 75 km from La Rochelle" },
 ],
 fr: {
 teaser:"Pistes cyclables et sentiers vers La Cotinière, premier port de pêche artisanal de la côte."history:"Capitale historique d'Oléron, Saint-Pierre garde une lanterne des morts du XIIIᵉ siècle, unique sur l'île, et la maison des Aïeules où Pierre Loti repose au jardin. La ville commande depuis toujours les marais et les vignes de l'île."tips:"Nos deux chauffeurs desservent Saint-Pierre-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Cycle tracks and paths to La Cotinière, the coast's leading small-scale fishing port."history:"Oléron's historic capital, Saint-Pierre keeps a 13th-century lantern of the dead, unique on the island, and the Maison des Aïeules where Pierre Loti is buried in the garden. The town has always governed the island's marshes and vineyards."tips:"Our two drivers serve Saint-Pierre-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/17385-Saint-Pierre-d%27Ol%C3%A9ron-Sols.png/1920px-17385-Saint-Pierre-d%27Ol%C3%A9ron-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/17385-Saint-Pierre-d%27Ol%C3%A9ron-argile.jpg/1920px-17385-Saint-Pierre-d%27Ol%C3%A9ron-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Borderie_saint_pierre_d%27oleron_moulin.jpg/1920px-Borderie_saint_pierre_d%27oleron_moulin.jpg"],
 },
 {
 slug:"ou-manger-a-saint-pierre-d-oleron"category:"restaurant"dept:"17"name:"Où manger à Saint-Pierre-d'Oléron"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 75 km de La Rochelle"en:"≈ 75 km from La Rochelle" },
 ],
 fr: {
 teaser:"Criée de La Cotinière: soles, bars de ligne, langoustines; huîtres et vins de pays d'Oléron."history:"Capitale historique d'Oléron, Saint-Pierre garde une lanterne des morts du XIIIᵉ siècle, unique sur l'île, et la maison des Aïeules où Pierre Loti repose au jardin. La ville commande depuis toujours les marais et les vignes de l'île."tips:"Nos deux chauffeurs desservent Saint-Pierre-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"La Cotinière fish auction: sole, line-caught bass, langoustines; oysters and island wines."history:"Oléron's historic capital, Saint-Pierre keeps a 13th-century lantern of the dead, unique on the island, and the Maison des Aïeules where Pierre Loti is buried in the garden. The town has always governed the island's marshes and vineyards."tips:"Our two drivers serve Saint-Pierre-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Brosen_windrose-fr.svg/1920px-Brosen_windrose-fr.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/City_locator_14.svg/1920px-City_locator_14.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/17%2C_Ile_d%C2%B4Ol%C3%A9ron%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_kissenot._1914.jpg/1920px-17%2C_Ile_d%C2%B4Ol%C3%A9ron%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_kissenot._1914.jpg"],
 },
 {
 slug:"ou-dormir-a-saint-pierre-d-oleron"category:"hotel"dept:"17"name:"Où dormir à Saint-Pierre-d'Oléron"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 75 km de La Rochelle"en:"≈ 75 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles au bourg et sur la côte, résidences 4 étoiles avec spa vers La Cotinière."history:"Capitale historique d'Oléron, Saint-Pierre garde une lanterne des morts du XIIIᵉ siècle, unique sur l'île, et la maison des Aïeules où Pierre Loti repose au jardin. La ville commande depuis toujours les marais et les vignes de l'île."tips:"Nos deux chauffeurs desservent Saint-Pierre-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels in town and on the coast, four-star spa residences towards La Cotinière."history:"Oléron's historic capital, Saint-Pierre keeps a 13th-century lantern of the dead, unique on the island, and the Maison des Aïeules where Pierre Loti is buried in the garden. The town has always governed the island's marshes and vineyards."tips:"Our two drivers serve Saint-Pierre-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballet._V._1915.jpg/1920px-17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballet._V._1915.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballon._1915.jpg/1920px-17%2C_Ile_d%C2%B4Ol%C3%A9ron_Saint_Pierre%2C_Charente-Maritime%2C_coiffure_ol%C3%A9ronnaise_le_ballon._1915.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/17385-Saint-Pierre-d%27Ol%C3%A9ron-Sols.png/1920px-17385-Saint-Pierre-d%27Ol%C3%A9ron-Sols.png"],
 },
 {
 slug:"visiter-le-chateau-d-oleron"category:"visite"dept:"17"name:"Visiter Le Château-d'Oléron"city:"Le Château-d'Oléron"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Citadelle et remparts, port ostréicole aux cabanes colorées, marché sous halle."history:"La citadelle du Château, commencée sous Louis XIII et remaniée par Vauban, ferme l'entrée du pertuis de Maumusson. Les cabanes colorées du port ostréicole, autrefois lieux de tri des huîtres, abritent aujourd'hui des ateliers d'artistes."tips:"Nos deux chauffeurs desservent Le Château-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The citadel and ramparts, the oyster port with its coloured huts, the covered market."history:"The citadel of Le Château, begun under Louis XIII and reworked by Vauban, closes the Maumusson strait. The colourful huts of the oyster port, once sorting sheds, now house artists' studios."tips:"Our two drivers serve Le Château-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-Sols.png/1920px-17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-argile.jpg/1920px-17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/305_-_Eglise_Notre-Dame-de-l%27Assomption_-_Ch%C3%A2teau_d%27Ol%C3%A9ron.jpg/1920px-305_-_Eglise_Notre-Dame-de-l%27Assomption_-_Ch%C3%A2teau_d%27Ol%C3%A9ron.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-le-chateau-d-oleron"category:"randonnee"dept:"17"name:"Randonnées et balades à Le Château-d'Oléron"city:"Le Château-d'Oléron"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Tour des remparts et sentier des claires ostréicoles jusqu'à Ors."history:"La citadelle du Château, commencée sous Louis XIII et remaniée par Vauban, ferme l'entrée du pertuis de Maumusson. Les cabanes colorées du port ostréicole, autrefois lieux de tri des huîtres, abritent aujourd'hui des ateliers d'artistes."tips:"Nos deux chauffeurs desservent Le Château-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"A walk around the ramparts and along the oyster-bed path to Ors."history:"The citadel of Le Château, begun under Louis XIII and reworked by Vauban, closes the Maumusson strait. The colourful huts of the oyster port, once sorting sheds, now house artists' studios."tips:"Our two drivers serve Le Château-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/9/91/Alienor.jpg""https://upload.wikimedia.org/wikipedia/commons/1/1a/Ancienne_gare_de_La_Chevalerie.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CabaneArtiste.jpg/1920px-CabaneArtiste.jpg"],
 },
 {
 slug:"ou-manger-a-le-chateau-d-oleron"category:"restaurant"dept:"17"name:"Où manger à Le Château-d'Oléron"city:"Le Château-d'Oléron"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Dégustation d'huîtres fines de claire directement chez les ostréiculteurs du port."history:"La citadelle du Château, commencée sous Louis XIII et remaniée par Vauban, ferme l'entrée du pertuis de Maumusson. Les cabanes colorées du port ostréicole, autrefois lieux de tri des huîtres, abritent aujourd'hui des ateliers d'artistes."tips:"Nos deux chauffeurs desservent Le Château-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Tasting fines de claire oysters straight from the growers on the harbour."history:"The citadel of Le Château, begun under Louis XIII and reworked by Vauban, closes the Maumusson strait. The colourful huts of the oyster port, once sorting sheds, now house artists' studios."tips:"Our two drivers serve Le Château-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/e/e6/Cabanes_ostr%C3%A9icoles_au_Ch%C3%A2teau-d%27Ol%C3%A9ron.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Cabannes_de_p%C3%AAcheur.jpg/1920px-Cabannes_de_p%C3%AAcheur.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-Sols.png/1920px-17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-Sols.png"],
 },
 {
 slug:"ou-dormir-a-le-chateau-d-oleron"category:"hotel"dept:"17"name:"Où dormir à Le Château-d'Oléron"city:"Le Château-d'Oléron"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles et maisons d'hôtes dans les rues de la citadelle."history:"La citadelle du Château, commencée sous Louis XIII et remaniée par Vauban, ferme l'entrée du pertuis de Maumusson. Les cabanes colorées du port ostréicole, autrefois lieux de tri des huîtres, abritent aujourd'hui des ateliers d'artistes."tips:"Nos deux chauffeurs desservent Le Château-d'Oléron. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels and guesthouses in the citadel streets."history:"The citadel of Le Château, begun under Louis XIII and reworked by Vauban, closes the Maumusson strait. The colourful huts of the oyster port, once sorting sheds, now house artists' studios."tips:"Our two drivers serve Le Château-d'Oléron. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-argile.jpg/1920px-17093-Le_Ch%C3%A2teau-d%27Ol%C3%A9ron-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/305_-_Eglise_Notre-Dame-de-l%27Assomption_-_Ch%C3%A2teau_d%27Ol%C3%A9ron.jpg/1920px-305_-_Eglise_Notre-Dame-de-l%27Assomption_-_Ch%C3%A2teau_d%27Ol%C3%A9ron.jpg""https://upload.wikimedia.org/wikipedia/commons/9/91/Alienor.jpg"],
 },
 {
 slug:"visiter-saint-trojan-les-bains"category:"visite"dept:"17"name:"Visiter Saint-Trojan-les-Bains"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 80 km de La Rochelle"en:"≈ 80 km from La Rochelle" },
 ],
 fr: {
 teaser:"Front de mer 1900, port de plaisance, petit train de la forêt et plage de Gatseau."history:"Station climatique dès 1900, Saint-Trojan est adossée à une forêt domaniale de 2 000 hectares plantée au XIXᵉ siècle pour fixer les dunes. Le petit train touristique y circule depuis 1963 jusqu'à la plage de Gatseau."tips:"Nos deux chauffeurs desservent Saint-Trojan-les-Bains. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The 1900s seafront, the marina, the forest train and Gatseau beach."history:"A climatic resort since 1900, Saint-Trojan backs onto a 2,000-hectare state forest planted in the 19th century to stabilise the dunes. Its little tourist train has run to Gatseau beach since 1963."tips:"Our two drivers serve Saint-Trojan-les-Bains. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/17411-Saint-Trojan-les-Bains-Sols.png/1920px-17411-Saint-Trojan-les-Bains-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/17411-Saint-Trojan-les-Bains-argile.jpg/1920px-17411-Saint-Trojan-les-Bains-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Arriv%C3%A9e_du_train_en_gare_de_Saint-Trojan-les-Bains.jpg/1920px-Arriv%C3%A9e_du_train_en_gare_de_Saint-Trojan-les-Bains.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-trojan-les-bains"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Trojan-les-Bains"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 80 km de La Rochelle"en:"≈ 80 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentiers forestiers sous les pins maritimes, boucle des dunes jusqu'à la pointe de Manson."history:"Station climatique dès 1900, Saint-Trojan est adossée à une forêt domaniale de 2 000 hectares plantée au XIXᵉ siècle pour fixer les dunes. Le petit train touristique y circule depuis 1963 jusqu'à la plage de Gatseau."tips:"Nos deux chauffeurs desservent Saint-Trojan-les-Bains. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Forest trails under maritime pines and a dune loop to the Manson headland."history:"A climatic resort since 1900, Saint-Trojan backs onto a 2,000-hectare state forest planted in the 19th century to stabilise the dunes. Its little tourist train has run to Gatseau beach since 1963."tips:"Our two drivers serve Saint-Trojan-les-Bains. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/FR_17_Saint_Trojan_les_Bains_-_%C3%89glise.jpg/1920px-FR_17_Saint_Trojan_les_Bains_-_%C3%89glise.jpg""https://upload.wikimedia.org/wikipedia/commons/a/af/M%C3%A9morial_d%C3%A9barquement_de_Gatseau.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Plage_de_Gatseau.JPG/1920px-Plage_de_Gatseau.JPG"],
 },
 {
 slug:"ou-manger-a-saint-trojan-les-bains"category:"restaurant"dept:"17"name:"Où manger à Saint-Trojan-les-Bains"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 80 km de La Rochelle"en:"≈ 80 km from La Rochelle" },
 ],
 fr: {
 teaser:"Restaurants de plage, huîtres et pineau en apéritif face au pertuis."history:"Station climatique dès 1900, Saint-Trojan est adossée à une forêt domaniale de 2 000 hectares plantée au XIXᵉ siècle pour fixer les dunes. Le petit train touristique y circule depuis 1963 jusqu'à la plage de Gatseau."tips:"Nos deux chauffeurs desservent Saint-Trojan-les-Bains. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Beach restaurants, oysters and pineau as an aperitif facing the strait."history:"A climatic resort since 1900, Saint-Trojan backs onto a 2,000-hectare state forest planted in the 19th century to stabilise the dunes. Its little tourist train has run to Gatseau beach since 1963."tips:"Our two drivers serve Saint-Trojan-les-Bains. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/1/10/Plaque_historique_du_d%C3%A9barquement_sur_l%27%C3%AEle_d%27Ol%C3%A9ron.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Saint-Trojan-les-Bains_-_mairie_01.jpg/1920px-Saint-Trojan-les-Bains_-_mairie_01.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/17411-Saint-Trojan-les-Bains-Sols.png/1920px-17411-Saint-Trojan-les-Bains-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-trojan-les-bains"category:"hotel"dept:"17"name:"Où dormir à Saint-Trojan-les-Bains"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Île d'Oléron"en:"Area: Île d'Oléron" },
 { fr:"≈ 80 km de La Rochelle"en:"≈ 80 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles à jardin, thalasso et résidences 4 étoiles en lisière de forêt."history:"Station climatique dès 1900, Saint-Trojan est adossée à une forêt domaniale de 2 000 hectares plantée au XIXᵉ siècle pour fixer les dunes. Le petit train touristique y circule depuis 1963 jusqu'à la plage de Gatseau."tips:"Nos deux chauffeurs desservent Saint-Trojan-les-Bains. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star garden hotels, thalassotherapy and four-star residences at the forest edge."history:"A climatic resort since 1900, Saint-Trojan backs onto a 2,000-hectare state forest planted in the 19th century to stabilise the dunes. Its little tourist train has run to Gatseau beach since 1963."tips:"Our two drivers serve Saint-Trojan-les-Bains. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/17411-Saint-Trojan-les-Bains-argile.jpg/1920px-17411-Saint-Trojan-les-Bains-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Arriv%C3%A9e_du_train_en_gare_de_Saint-Trojan-les-Bains.jpg/1920px-Arriv%C3%A9e_du_train_en_gare_de_Saint-Trojan-les-Bains.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/FR_17_Saint_Trojan_les_Bains_-_%C3%89glise.jpg/1920px-FR_17_Saint_Trojan_les_Bains_-_%C3%89glise.jpg"],
 },
 {
 slug:"visiter-marennes-hiers-brouage"category:"visite"dept:"17"name:"Visiter Marennes-Hiers-Brouage"city:"Marennes-Hiers-Brouage"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 65 km de La Rochelle"en:"≈ 65 km from La Rochelle" },
 ],
 fr: {
 teaser:"Citadelle de Brouage, halle aux vivres, clocher de Marennes et cité de l'huître."history:"Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP: la Marennes-Oléron affinée en claires."tips:"Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Brouage citadel, the victuals hall, Marennes bell tower and the oyster centre."history:"Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds."tips:"Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/17219-Marennes-Hiers-Brouage-argile.jpg/1920px-17219-Marennes-Hiers-Brouage-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Blue_pencil.svg/1920px-Blue_pencil.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Brosen_windrose-fr.svg/1920px-Brosen_windrose-fr.svg.png"],
 },
 {
 slug:"randonnees-et-balades-a-marennes-hiers-brouage"category:"randonnee"dept:"17"name:"Randonnées et balades à Marennes-Hiers-Brouage"city:"Marennes-Hiers-Brouage"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 65 km de La Rochelle"en:"≈ 65 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucle des marais de Brouage: 12 km plats entre claires, canaux et hérons."history:"Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP: la Marennes-Oléron affinée en claires."tips:"Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Brouage marsh loop: 12 flat kilometres between oyster ponds, canals and herons."history:"Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds."tips:"Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/City_locator_14.svg/1920px-City_locator_14.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/France_-_17_-_Beaugeay_-_%C3%89glise_Saint_Germain.JPG/1920px-France_-_17_-_Beaugeay_-_%C3%89glise_Saint_Germain.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Info_Simple.svg/1920px-Info_Simple.svg.png"],
 },
 {
 slug:"ou-manger-a-marennes-hiers-brouage"category:"restaurant"dept:"17"name:"Où manger à Marennes-Hiers-Brouage"city:"Marennes-Hiers-Brouage"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 65 km de La Rochelle"en:"≈ 65 km from La Rochelle" },
 ],
 fr: {
 teaser:"Huîtres fines et spéciales de claire, éclade de moules, sur les cabanes du chenal."history:"Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP: la Marennes-Oléron affinée en claires."tips:"Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Fines and spéciales de claire oysters, pine-needle mussels, in the channel-side huts."history:"Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds."tips:"Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Marennes-Eglise.jpg/1920px-Marennes-Eglise.jpg""https://upload.wikimedia.org/wikipedia/commons/b/ba/Marennes-Hiers-Brouage_OSM_01.png""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/17219-Marennes-Hiers-Brouage-argile.jpg/1920px-17219-Marennes-Hiers-Brouage-argile.jpg"],
 },
 {
 slug:"ou-dormir-a-marennes-hiers-brouage"category:"hotel"dept:"17"name:"Où dormir à Marennes-Hiers-Brouage"city:"Marennes-Hiers-Brouage"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 65 km de La Rochelle"en:"≈ 65 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles à Marennes, chambres d'hôtes dans les fermes du marais."history:"Brouage, place forte du XVIIᵉ siècle bâtie en pleine mer et patrie de Samuel de Champlain, se retrouva enclavée quand le marais s'envasa. Marennes, elle, a donné son nom à la seule huître française bénéficiant d'une IGP: la Marennes-Oléron affinée en claires."tips:"Nos deux chauffeurs desservent Marennes-Hiers-Brouage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Two- and three-star hotels in Marennes, guesthouses in marsh farmhouses."history:"Brouage, a 17th-century fortress built in the open sea and birthplace of Samuel de Champlain, was stranded when the marsh silted up. Marennes gave its name to France's only PGI oyster: the Marennes-Oléron, finished in clay ponds."tips:"Our two drivers serve Marennes-Hiers-Brouage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Blue_pencil.svg/1920px-Blue_pencil.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Brosen_windrose-fr.svg/1920px-Brosen_windrose-fr.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/City_locator_14.svg/1920px-City_locator_14.svg.png"],
 },
 {
 slug:"visiter-fouras"category:"visite"dept:"17"name:"Visiter Fouras"city:"Fouras"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Fort Vauban et son musée, pointe de la Fumée, vue sur Fort Boyard et l'île d'Aix."history:"Presqu'île avancée dans l'estuaire, Fouras a vu Napoléon s'embarquer en 1815 avant sa reddition. Son donjon médiéval, remanié par Vauban, surveille la rade d'où part le bac pour l'île d'Aix et où se dresse Fort Boyard, achevé en 1857."tips:"Nos deux chauffeurs desservent Fouras. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Fort Vauban and its museum, the Pointe de la Fumée, views of Fort Boyard and Île d'Aix."history:"A peninsula reaching into the estuary, Fouras saw Napoleon embark in 1815 before his surrender. Its medieval keep, reworked by Vauban, watches the roadstead where the Île d'Aix ferry leaves and Fort Boyard, completed in 1857, stands offshore."tips:"Our two drivers serve Fouras. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/012_-_Grande_Plage_-_Fouras.jpg/1920px-012_-_Grande_Plage_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/1/16/097_-_Eglise_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/1013_-_Halte_ferroviaire_-_St_Laurent_de_la_Pr%C3%A9e.jpg/1920px-1013_-_Halte_ferroviaire_-_St_Laurent_de_la_Pr%C3%A9e.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-fouras"category:"randonnee"dept:"17"name:"Randonnées et balades à Fouras"city:"Fouras"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier des quatre plages jusqu'à la pointe de la Fumée, entre carrelets et parcs à huîtres."history:"Presqu'île avancée dans l'estuaire, Fouras a vu Napoléon s'embarquer en 1815 avant sa reddition. Son donjon médiéval, remanié par Vauban, surveille la rade d'où part le bac pour l'île d'Aix et où se dresse Fort Boyard, achevé en 1857."tips:"Nos deux chauffeurs desservent Fouras. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The four-beaches path to the Pointe de la Fumée, past fishing huts and oyster beds."history:"A peninsula reaching into the estuary, Fouras saw Napoleon embark in 1815 before his surrender. Its medieval keep, reworked by Vauban, watches the roadstead where the Île d'Aix ferry leaves and Fort Boyard, completed in 1857, stands offshore."tips:"Our two drivers serve Fouras. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/138_-_Halle_aux_poissons_-_Fouras.jpg/1920px-138_-_Halle_aux_poissons_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/150_-_Ch%C3%A2teau_Treuil-Bussac_-_Fouras.jpg/1920px-150_-_Ch%C3%A2teau_Treuil-Bussac_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/153_-_Plage_Nord_-_Fouras.jpg/1920px-153_-_Plage_Nord_-_Fouras.jpg"],
 },
 {
 slug:"ou-manger-a-fouras"category:"restaurant"dept:"17"name:"Où manger à Fouras"city:"Fouras"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Huîtres de la Fumée, crevettes grises, restaurants de bord de plage."history:"Presqu'île avancée dans l'estuaire, Fouras a vu Napoléon s'embarquer en 1815 avant sa reddition. Son donjon médiéval, remanié par Vauban, surveille la rade d'où part le bac pour l'île d'Aix et où se dresse Fort Boyard, achevé en 1857."tips:"Nos deux chauffeurs desservent Fouras. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Fumée oysters, brown shrimp and beachside restaurants."history:"A peninsula reaching into the estuary, Fouras saw Napoleon embark in 1815 before his surrender. Its medieval keep, reworked by Vauban, watches the roadstead where the Île d'Aix ferry leaves and Fort Boyard, completed in 1857, stands offshore."tips:"Our two drivers serve Fouras. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/155_-_Villa_Plage_Nord_-_Fouras.jpg/1920px-155_-_Villa_Plage_Nord_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/f/f9/156_-_Villa_Plage_Nord_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/012_-_Grande_Plage_-_Fouras.jpg/1920px-012_-_Grande_Plage_-_Fouras.jpg"],
 },
 {
 slug:"ou-dormir-a-fouras"category:"hotel"dept:"17"name:"Où dormir à Fouras"city:"Fouras"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles familiaux, résidences face à la rade."history:"Presqu'île avancée dans l'estuaire, Fouras a vu Napoléon s'embarquer en 1815 avant sa reddition. Son donjon médiéval, remanié par Vauban, surveille la rade d'où part le bac pour l'île d'Aix et où se dresse Fort Boyard, achevé en 1857."tips:"Nos deux chauffeurs desservent Fouras. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Family two- and three-star hotels and residences facing the roadstead."history:"A peninsula reaching into the estuary, Fouras saw Napoleon embark in 1815 before his surrender. Its medieval keep, reworked by Vauban, watches the roadstead where the Île d'Aix ferry leaves and Fort Boyard, completed in 1857, stands offshore."tips:"Our two drivers serve Fouras. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/1/16/097_-_Eglise_-_Fouras.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/1013_-_Halte_ferroviaire_-_St_Laurent_de_la_Pr%C3%A9e.jpg/1920px-1013_-_Halte_ferroviaire_-_St_Laurent_de_la_Pr%C3%A9e.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/138_-_Halle_aux_poissons_-_Fouras.jpg/1920px-138_-_Halle_aux_poissons_-_Fouras.jpg"],
 },
 {
 slug:"visiter-chatelaillon-plage"category:"visite"dept:"17"name:"Visiter Châtelaillon-Plage"city:"Châtelaillon-Plage"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Front de mer, villas éclectiques, marché couvert et casino."history:"Capitale de l'Aunis au Xᵉ siècle, l'ancienne cité de Castrum Allionis a été engloutie par la mer; la station renaît avec le chemin de fer et ses villas balnéaires 1900 alignées sur trois kilomètres de sable."tips:"Nos deux chauffeurs desservent Châtelaillon-Plage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The seafront, eclectic villas, the covered market and the casino."history:"Capital of the Aunis in the 10th century, the old town of Castrum Allionis was swallowed by the sea; the resort was reborn with the railway and its 1900s villas along three kilometres of sand."tips:"Our two drivers serve Châtelaillon-Plage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/5/57/003_Salles-sur-Mer_%28_17220_%29.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/1604_-_Claude_Chastillon_-_Ancienne_ville_et_forteresse_de_Ch%C3%A2telaillon.jpg/1920px-1604_-_Claude_Chastillon_-_Ancienne_ville_et_forteresse_de_Ch%C3%A2telaillon.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/17094-Ch%C3%A2telaillon-Plage-Sols.png/1920px-17094-Ch%C3%A2telaillon-Plage-Sols.png"],
 },
 {
 slug:"randonnees-et-balades-a-chatelaillon-plage"category:"randonnee"dept:"17"name:"Randonnées et balades à Châtelaillon-Plage"city:"Châtelaillon-Plage"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Promenade littorale vers la pointe du Rocher et les marais d'Yves, réserve naturelle d'oiseaux."history:"Capitale de l'Aunis au Xᵉ siècle, l'ancienne cité de Castrum Allionis a été engloutie par la mer; la station renaît avec le chemin de fer et ses villas balnéaires 1900 alignées sur trois kilomètres de sable."tips:"Nos deux chauffeurs desservent Châtelaillon-Plage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Coastal walk to the Pointe du Rocher and the Yves marshes bird reserve."history:"Capital of the Aunis in the 10th century, the old town of Castrum Allionis was swallowed by the sea; the resort was reborn with the railway and its 1900s villas along three kilometres of sand."tips:"Our two drivers serve Châtelaillon-Plage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/17094-Ch%C3%A2telaillon-Plage-argile.jpg/1920px-17094-Ch%C3%A2telaillon-Plage-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/202_-_Eglise_Saint-Etienne_-_Yves.jpg/1920px-202_-_Eglise_Saint-Etienne_-_Yves.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/282_-_Les_Boucholeurs_-_Chatelaillon.jpg/1920px-282_-_Les_Boucholeurs_-_Chatelaillon.jpg"],
 },
 {
 slug:"ou-manger-a-chatelaillon-plage"category:"restaurant"dept:"17"name:"Où manger à Châtelaillon-Plage"city:"Châtelaillon-Plage"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Bars à huîtres du front de mer, poissons grillés, marché le matin."history:"Capitale de l'Aunis au Xᵉ siècle, l'ancienne cité de Castrum Allionis a été engloutie par la mer; la station renaît avec le chemin de fer et ses villas balnéaires 1900 alignées sur trois kilomètres de sable."tips:"Nos deux chauffeurs desservent Châtelaillon-Plage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Seafront oyster bars, grilled fish and a morning market."history:"Capital of the Aunis in the 10th century, the old town of Castrum Allionis was swallowed by the sea; the resort was reborn with the railway and its 1900s villas along three kilometres of sand."tips:"Our two drivers serve Châtelaillon-Plage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/693_-_Eglise_de_Saint-Vivien_-_St_Vivien.jpg/1920px-693_-_Eglise_de_Saint-Vivien_-_St_Vivien.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/694_-_Casino_-_Ch%C3%A2telaillon.jpg/1920px-694_-_Casino_-_Ch%C3%A2telaillon.jpg""https://upload.wikimedia.org/wikipedia/commons/5/57/003_Salles-sur-Mer_%28_17220_%29.JPG"],
 },
 {
 slug:"ou-dormir-a-chatelaillon-plage"category:"hotel"dept:"17"name:"Où dormir à Châtelaillon-Plage"city:"Châtelaillon-Plage"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 et 4 étoiles avec spa marin face à la plage."history:"Capitale de l'Aunis au Xᵉ siècle, l'ancienne cité de Castrum Allionis a été engloutie par la mer; la station renaît avec le chemin de fer et ses villas balnéaires 1900 alignées sur trois kilomètres de sable."tips:"Nos deux chauffeurs desservent Châtelaillon-Plage. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three- and four-star hotels with sea spa facing the beach."history:"Capital of the Aunis in the 10th century, the old town of Castrum Allionis was swallowed by the sea; the resort was reborn with the railway and its 1900s villas along three kilometres of sand."tips:"Our two drivers serve Châtelaillon-Plage. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/1604_-_Claude_Chastillon_-_Ancienne_ville_et_forteresse_de_Ch%C3%A2telaillon.jpg/1920px-1604_-_Claude_Chastillon_-_Ancienne_ville_et_forteresse_de_Ch%C3%A2telaillon.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/17094-Ch%C3%A2telaillon-Plage-Sols.png/1920px-17094-Ch%C3%A2telaillon-Plage-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/17094-Ch%C3%A2telaillon-Plage-argile.jpg/1920px-17094-Ch%C3%A2telaillon-Plage-argile.jpg"],
 },
 {
 slug:"visiter-talmont-sur-gironde"category:"visite"dept:"17"name:"Visiter Talmont-sur-Gironde"city:"Talmont-sur-Gironde"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Église Sainte-Radegonde, ruelles à roses trémières, remparts et carrelets sur pilotis."history:"Bastide fondée en 1284 par Édouard Iᵉʳ d'Angleterre, Talmont s'accroche à une falaise au-dessus de l'estuaire. Son église romane Sainte-Radegonde, du XIIᵉ siècle, servait d'amer aux pèlerins de Saint-Jacques embarqués sur la Gironde."tips:"Nos deux chauffeurs desservent Talmont-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Sainte-Radegonde church, hollyhock lanes, ramparts and stilted fishing huts."history:"A bastide founded in 1284 by Edward I of England, Talmont clings to a cliff above the estuary. Its 12th-century Romanesque church of Sainte-Radegonde served as a landmark for pilgrims sailing the Gironde."tips:"Our two drivers serve Talmont-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/17437-Talmont-sur-Gironde-Sols.png/1920px-17437-Talmont-sur-Gironde-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/17437-Talmont-sur-Gironde-argile.jpg/1920px-17437-Talmont-sur-Gironde-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bastide_Talmont-sur-Gironde.jpg/1920px-Bastide_Talmont-sur-Gironde.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-talmont-sur-gironde"category:"randonnee"dept:"17"name:"Randonnées et balades à Talmont-sur-Gironde"city:"Talmont-sur-Gironde"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier de l'estuaire vers Barzan et le site gallo-romain du Fâ."history:"Bastide fondée en 1284 par Édouard Iᵉʳ d'Angleterre, Talmont s'accroche à une falaise au-dessus de l'estuaire. Son église romane Sainte-Radegonde, du XIIᵉ siècle, servait d'amer aux pèlerins de Saint-Jacques embarqués sur la Gironde."tips:"Nos deux chauffeurs desservent Talmont-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The estuary path towards Barzan and the Gallo-Roman site of Le Fâ."history:"A bastide founded in 1284 by Edward I of England, Talmont clings to a cliff above the estuary. Its 12th-century Romanesque church of Sainte-Radegonde served as a landmark for pilgrims sailing the Gironde."tips:"Our two drivers serve Talmont-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/4/4f/EdwardI-Cassell.jpg""https://upload.wikimedia.org/wikipedia/commons/5/51/Remparttalmon2.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Talmont-sur-Gironde_17_Baie%26estuaire_2013.jpg/1920px-Talmont-sur-Gironde_17_Baie%26estuaire_2013.jpg"],
 },
 {
 slug:"ou-manger-a-talmont-sur-gironde"category:"restaurant"dept:"17"name:"Où manger à Talmont-sur-Gironde"city:"Talmont-sur-Gironde"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Bars à vin, produits de l'estuaire et esturgeon fumé de Gironde."history:"Bastide fondée en 1284 par Édouard Iᵉʳ d'Angleterre, Talmont s'accroche à une falaise au-dessus de l'estuaire. Son église romane Sainte-Radegonde, du XIIᵉ siècle, servait d'amer aux pèlerins de Saint-Jacques embarqués sur la Gironde."tips:"Nos deux chauffeurs desservent Talmont-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Wine bars, estuary produce and smoked Gironde sturgeon."history:"A bastide founded in 1284 by Edward I of England, Talmont clings to a cliff above the estuary. Its 12th-century Romanesque church of Sainte-Radegonde served as a landmark for pilgrims sailing the Gironde."tips:"Our two drivers serve Talmont-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Talmont-sur-Gironde_17_%C3%89glise_chevet_2013.jpg/1920px-Talmont-sur-Gironde_17_%C3%89glise_chevet_2013.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Talmont-sur-Gironde_Cimeti%C3%A8re.jpg/1920px-Talmont-sur-Gironde_Cimeti%C3%A8re.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/17437-Talmont-sur-Gironde-Sols.png/1920px-17437-Talmont-sur-Gironde-Sols.png"],
 },
 {
 slug:"ou-dormir-a-talmont-sur-gironde"category:"hotel"dept:"17"name:"Où dormir à Talmont-sur-Gironde"city:"Talmont-sur-Gironde"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes du village, hôtels 3 étoiles à Meschers et Cozes."history:"Bastide fondée en 1284 par Édouard Iᵉʳ d'Angleterre, Talmont s'accroche à une falaise au-dessus de l'estuaire. Son église romane Sainte-Radegonde, du XIIᵉ siècle, servait d'amer aux pèlerins de Saint-Jacques embarqués sur la Gironde."tips:"Nos deux chauffeurs desservent Talmont-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Village guesthouses, three-star hotels in Meschers and Cozes."history:"A bastide founded in 1284 by Edward I of England, Talmont clings to a cliff above the estuary. Its 12th-century Romanesque church of Sainte-Radegonde served as a landmark for pilgrims sailing the Gironde."tips:"Our two drivers serve Talmont-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/17437-Talmont-sur-Gironde-argile.jpg/1920px-17437-Talmont-sur-Gironde-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bastide_Talmont-sur-Gironde.jpg/1920px-Bastide_Talmont-sur-Gironde.jpg""https://upload.wikimedia.org/wikipedia/commons/4/4f/EdwardI-Cassell.jpg"],
 },
 {
 slug:"visiter-mornac-sur-seudre"category:"visite"dept:"17"name:"Visiter Mornac-sur-Seudre"city:"Mornac-sur-Seudre"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Église romane fortifiée, halle, ruelles blanches et cabanes ostréicoles du chenal."history:"Classé Plus Beau Village de France, Mornac vit du sel et de l'huître depuis le Moyen Âge. Son église fortifiée du XIᵉ siècle et sa halle du XVIᵉ siècle veillent sur un port de chenal où les gabares chargeaient jadis le sel de la Seudre."tips:"Nos deux chauffeurs desservent Mornac-sur-Seudre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The fortified Romanesque church, the market hall, whitewashed lanes and oyster huts."history:"Listed among France's Most Beautiful Villages, Mornac has lived on salt and oysters since the Middle Ages. Its 11th-century fortified church and 16th-century market hall watch over a channel port where barges once loaded Seudre salt."tips:"Our two drivers serve Mornac-sur-Seudre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/17247-Mornac-sur-Seudre-Sols.png/1920px-17247-Mornac-sur-Seudre-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/17247-Mornac-sur-Seudre-argile.jpg/1920px-17247-Mornac-sur-Seudre-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/692_-_Eglise_Saint-Pierre_vue_arri%C3%A8re_-_Mornac_sur_Seudre.jpg/1920px-692_-_Eglise_Saint-Pierre_vue_arri%C3%A8re_-_Mornac_sur_Seudre.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-mornac-sur-seudre"category:"randonnee"dept:"17"name:"Randonnées et balades à Mornac-sur-Seudre"city:"Mornac-sur-Seudre"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucle des marais salants de la Seudre, embarquement possible en yole."history:"Classé Plus Beau Village de France, Mornac vit du sel et de l'huître depuis le Moyen Âge. Son église fortifiée du XIᵉ siècle et sa halle du XVIᵉ siècle veillent sur un port de chenal où les gabares chargeaient jadis le sel de la Seudre."tips:"Nos deux chauffeurs desservent Mornac-sur-Seudre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"A loop through the Seudre salt marshes, with rowing-boat trips available."history:"Listed among France's Most Beautiful Villages, Mornac has lived on salt and oysters since the Middle Ages. Its 11th-century fortified church and 16th-century market hall watch over a channel port where barges once loaded Seudre salt."tips:"Our two drivers serve Mornac-sur-Seudre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/695_-_Eglise_Saint-Pierre_nef_-_Mornac_sur_Seudre.jpg/1920px-695_-_Eglise_Saint-Pierre_nef_-_Mornac_sur_Seudre.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/697_-_Rue_ancienne_maisons_et_%C3%A9glise_-_Mornac_sur_Seudre.jpg/1920px-697_-_Rue_ancienne_maisons_et_%C3%A9glise_-_Mornac_sur_Seudre.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/699_-_Phare_m%C3%A9di%C3%A9val_-_Mornac_sur_Seudre.jpg/1920px-699_-_Phare_m%C3%A9di%C3%A9val_-_Mornac_sur_Seudre.jpg"],
 },
 {
 slug:"ou-manger-a-mornac-sur-seudre"category:"restaurant"dept:"17"name:"Où manger à Mornac-sur-Seudre"city:"Mornac-sur-Seudre"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Huîtres de la Seudre en cabane, sel et salicorne."history:"Classé Plus Beau Village de France, Mornac vit du sel et de l'huître depuis le Moyen Âge. Son église fortifiée du XIᵉ siècle et sa halle du XVIᵉ siècle veillent sur un port de chenal où les gabares chargeaient jadis le sel de la Seudre."tips:"Nos deux chauffeurs desservent Mornac-sur-Seudre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Seudre oysters in the huts, salt and samphire."history:"Listed among France's Most Beautiful Villages, Mornac has lived on salt and oysters since the Middle Ages. Its 11th-century fortified church and 16th-century market hall watch over a channel port where barges once loaded Seudre salt."tips:"Our two drivers serve Mornac-sur-Seudre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Ch%C3%A2teau_de_Mornac-sur-Seudre.jpg/1920px-Ch%C3%A2teau_de_Mornac-sur-Seudre.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Eglise_de_Mornac3.jpg/1920px-Eglise_de_Mornac3.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/17247-Mornac-sur-Seudre-Sols.png/1920px-17247-Mornac-sur-Seudre-Sols.png"],
 },
 {
 slug:"ou-dormir-a-mornac-sur-seudre"category:"hotel"dept:"17"name:"Où dormir à Mornac-sur-Seudre"city:"Mornac-sur-Seudre"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes de charme, hôtels 3 étoiles à Saujon et Royan."history:"Classé Plus Beau Village de France, Mornac vit du sel et de l'huître depuis le Moyen Âge. Son église fortifiée du XIᵉ siècle et sa halle du XVIᵉ siècle veillent sur un port de chenal où les gabares chargeaient jadis le sel de la Seudre."tips:"Nos deux chauffeurs desservent Mornac-sur-Seudre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Charming guesthouses, three-star hotels in Saujon and Royan."history:"Listed among France's Most Beautiful Villages, Mornac has lived on salt and oysters since the Middle Ages. Its 11th-century fortified church and 16th-century market hall watch over a channel port where barges once loaded Seudre salt."tips:"Our two drivers serve Mornac-sur-Seudre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/17247-Mornac-sur-Seudre-argile.jpg/1920px-17247-Mornac-sur-Seudre-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/692_-_Eglise_Saint-Pierre_vue_arri%C3%A8re_-_Mornac_sur_Seudre.jpg/1920px-692_-_Eglise_Saint-Pierre_vue_arri%C3%A8re_-_Mornac_sur_Seudre.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/695_-_Eglise_Saint-Pierre_nef_-_Mornac_sur_Seudre.jpg/1920px-695_-_Eglise_Saint-Pierre_nef_-_Mornac_sur_Seudre.jpg"],
 },
 {
 slug:"visiter-la-tremblade"category:"visite"dept:"17"name:"Visiter La Tremblade"city:"La Tremblade"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Phare de la Coubre, chenal ostréicole, plages sauvages de la Côte sauvage."history:"La Tremblade est la porte de la forêt de la Coubre, 8 000 hectares de pins plantés à partir de 1808 pour fixer les dunes les plus mobiles d'Europe. Son chenal de Ronce-les-Bains reste l'un des grands ports ostréicoles de la Seudre."tips:"Nos deux chauffeurs desservent La Tremblade. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Coubre lighthouse, the oyster channel and the wild beaches of the Côte Sauvage."history:"La Tremblade is the gateway to the Coubre forest, 8,000 hectares of pines planted from 1808 to fix Europe's most mobile dunes. Its Ronce-les-Bains channel remains a major Seudre oyster port."tips:"Our two drivers serve La Tremblade. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/17452-La_Tremblade-Sols.png/1920px-17452-La_Tremblade-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/17452-La_Tremblade-argile.jpg/1920px-17452-La_Tremblade-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Centre_de_secours_des_pompiers_de_La_Tremblade.jpg/1920px-Centre_de_secours_des_pompiers_de_La_Tremblade.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-la-tremblade"category:"randonnee"dept:"17"name:"Randonnées et balades à La Tremblade"city:"La Tremblade"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Pistes forestières de la Coubre et sentier des dunes, 20 km praticables à pied ou à vélo."history:"La Tremblade est la porte de la forêt de la Coubre, 8 000 hectares de pins plantés à partir de 1808 pour fixer les dunes les plus mobiles d'Europe. Son chenal de Ronce-les-Bains reste l'un des grands ports ostréicoles de la Seudre."tips:"Nos deux chauffeurs desservent La Tremblade. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Coubre forest tracks and dune path, 20 km on foot or by bike."history:"La Tremblade is the gateway to the Coubre forest, 8,000 hectares of pines planted from 1808 to fix Europe's most mobile dunes. Its Ronce-les-Bains channel remains a major Seudre oyster port."tips:"Our two drivers serve La Tremblade. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/D25_pr%C3%A8s_du_Gardour.JPG/1920px-D25_pr%C3%A8s_du_Gardour.JPG""https://upload.wikimedia.org/wikipedia/commons/0/08/Entr%C3%A9e_d%27Arvert_%28retouch%C3%A9e%29.jpg""https://upload.wikimedia.org/wikipedia/commons/2/26/Eugene_Smurgis.jpg"],
 },
 {
 slug:"ou-manger-a-la-tremblade"category:"restaurant"dept:"17"name:"Où manger à La Tremblade"city:"La Tremblade"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Huîtres de Ronce, moules de bouchot, restaurants de plage à la Côte sauvage."history:"La Tremblade est la porte de la forêt de la Coubre, 8 000 hectares de pins plantés à partir de 1808 pour fixer les dunes les plus mobiles d'Europe. Son chenal de Ronce-les-Bains reste l'un des grands ports ostréicoles de la Seudre."tips:"Nos deux chauffeurs desservent La Tremblade. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Ronce oysters, bouchot mussels and beach restaurants on the Côte Sauvage."history:"La Tremblade is the gateway to the Coubre forest, 8,000 hectares of pines planted from 1808 to fix Europe's most mobile dunes. Its Ronce-les-Bains channel remains a major Seudre oyster port."tips:"Our two drivers serve La Tremblade. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/9/90/Female_Pandion.jpg""https://upload.wikimedia.org/wikipedia/commons/a/a9/Fran%C3%A7ois_F%C3%A9nelon.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/17452-La_Tremblade-Sols.png/1920px-17452-La_Tremblade-Sols.png"],
 },
 {
 slug:"ou-dormir-a-la-tremblade"category:"hotel"dept:"17"name:"Où dormir à La Tremblade"city:"La Tremblade"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles à Ronce-les-Bains, campings haut de gamme sous les pins."history:"La Tremblade est la porte de la forêt de la Coubre, 8 000 hectares de pins plantés à partir de 1808 pour fixer les dunes les plus mobiles d'Europe. Son chenal de Ronce-les-Bains reste l'un des grands ports ostréicoles de la Seudre."tips:"Nos deux chauffeurs desservent La Tremblade. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels in Ronce-les-Bains, upmarket campsites under the pines."history:"La Tremblade is the gateway to the Coubre forest, 8,000 hectares of pines planted from 1808 to fix Europe's most mobile dunes. Its Ronce-les-Bains channel remains a major Seudre oyster port."tips:"Our two drivers serve La Tremblade. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/17452-La_Tremblade-argile.jpg/1920px-17452-La_Tremblade-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Centre_de_secours_des_pompiers_de_La_Tremblade.jpg/1920px-Centre_de_secours_des_pompiers_de_La_Tremblade.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/D25_pr%C3%A8s_du_Gardour.JPG/1920px-D25_pr%C3%A8s_du_Gardour.JPG"],
 },
 {
 slug:"visiter-saint-palais-sur-mer"category:"visite"dept:"17"name:"Visiter Saint-Palais-sur-Mer"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 110 km de La Rochelle"en:"≈ 110 km from La Rochelle" },
 ],
 fr: {
 teaser:"Conche du Platin, rochers du Puits de l'Auture, villas Belle Époque et parc du Golf."history:"Station née de la mode des bains de mer sous le Second Empire, Saint-Palais aligne villas Belle Époque et conches abritées. Le site du Puits de l'Auture et les rochers de la Grande Côte forment l'un des plus beaux couchers de soleil de l'Atlantique."tips:"Nos deux chauffeurs desservent Saint-Palais-sur-Mer. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Platin cove, the Puits de l'Auture rocks, Belle Époque villas and the golf park."history:"A resort born of the Second Empire seaside craze, Saint-Palais lines up Belle Époque villas and sheltered coves. The Puits de l'Auture and the Grande Côte rocks make one of the Atlantic's finest sunsets."tips:"Our two drivers serve Saint-Palais-sur-Mer. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/17380-Saint-Palais-sur-Mer-Sols.png/1920px-17380-Saint-Palais-sur-Mer-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/17380-Saint-Palais-sur-Mer-argile.jpg/1920px-17380-Saint-Palais-sur-Mer-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/8/89/Ancienne_%C3%A9glise_Saint_Pallais.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-palais-sur-mer"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Palais-sur-Mer"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 110 km de La Rochelle"en:"≈ 110 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier de la Corniche jusqu'à la Grande Côte: 6 km de falaises basses et de pinèdes."history:"Station née de la mode des bains de mer sous le Second Empire, Saint-Palais aligne villas Belle Époque et conches abritées. Le site du Puits de l'Auture et les rochers de la Grande Côte forment l'un des plus beaux couchers de soleil de l'Atlantique."tips:"Nos deux chauffeurs desservent Saint-Palais-sur-Mer. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Corniche path to the Grande Côte: 6 km of low cliffs and pine woods."history:"A resort born of the Second Empire seaside craze, Saint-Palais lines up Belle Époque villas and sheltered coves. The Puits de l'Auture and the Grande Côte rocks make one of the Atlantic's finest sunsets."tips:"Our two drivers serve Saint-Palais-sur-Mer. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Armand_Guillaumin_-_Saint-Palais%2C_la_Pointe_de_la_Douane%2C_ao%C3%BBt_92%2C_10_heures_du_matin_-_PPP586_-_Mus%C3%A9e_des_Beaux-Arts_de_la_ville_de_Paris.jpg/1920px-Armand_Guillaumin_-_Saint-Palais%2C_la_Pointe_de_la_Douane%2C_ao%C3%BBt_92%2C_10_heures_du_matin_-_PPP586_-_Mus%C3%A9e_des_Beaux-Arts_de_la_ville_de_Paris.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Ecole_de_Saint-Palais.jpg/1920px-Ecole_de_Saint-Palais.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Eglise_de_Saint_Palais_sur_mer.jpg/1920px-Eglise_de_Saint_Palais_sur_mer.jpg"],
 },
 {
 slug:"ou-manger-a-saint-palais-sur-mer"category:"restaurant"dept:"17"name:"Où manger à Saint-Palais-sur-Mer"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 110 km de La Rochelle"en:"≈ 110 km from La Rochelle" },
 ],
 fr: {
 teaser:"Restaurants de bord de mer, plateaux de fruits de mer et poissons de la criée de Royan."history:"Station née de la mode des bains de mer sous le Second Empire, Saint-Palais aligne villas Belle Époque et conches abritées. Le site du Puits de l'Auture et les rochers de la Grande Côte forment l'un des plus beaux couchers de soleil de l'Atlantique."tips:"Nos deux chauffeurs desservent Saint-Palais-sur-Mer. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Seafront restaurants, seafood platters and fish from the Royan auction."history:"A resort born of the Second Empire seaside craze, Saint-Palais lines up Belle Époque villas and sheltered coves. The Puits de l'Auture and the Grande Côte rocks make one of the Atlantic's finest sunsets."tips:"Our two drivers serve Saint-Palais-sur-Mer. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/L%27oc%C3%A9an_%C3%A0_Saint-Palais.jpg/1920px-L%27oc%C3%A9an_%C3%A0_Saint-Palais.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Les-carrelets-de-Saint-Palais-sur-Mer-France-DSC_5021.jpg/1920px-Les-carrelets-de-Saint-Palais-sur-Mer-France-DSC_5021.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/17380-Saint-Palais-sur-Mer-Sols.png/1920px-17380-Saint-Palais-sur-Mer-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-palais-sur-mer"category:"hotel"dept:"17"name:"Où dormir à Saint-Palais-sur-Mer"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 110 km de La Rochelle"en:"≈ 110 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 et 4 étoiles avec vue mer, résidences familiales dans les pins."history:"Station née de la mode des bains de mer sous le Second Empire, Saint-Palais aligne villas Belle Époque et conches abritées. Le site du Puits de l'Auture et les rochers de la Grande Côte forment l'un des plus beaux couchers de soleil de l'Atlantique."tips:"Nos deux chauffeurs desservent Saint-Palais-sur-Mer. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three- and four-star sea-view hotels and family residences among the pines."history:"A resort born of the Second Empire seaside craze, Saint-Palais lines up Belle Époque villas and sheltered coves. The Puits de l'Auture and the Grande Côte rocks make one of the Atlantic's finest sunsets."tips:"Our two drivers serve Saint-Palais-sur-Mer. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/17380-Saint-Palais-sur-Mer-argile.jpg/1920px-17380-Saint-Palais-sur-Mer-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/8/89/Ancienne_%C3%A9glise_Saint_Pallais.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Armand_Guillaumin_-_Saint-Palais%2C_la_Pointe_de_la_Douane%2C_ao%C3%BBt_92%2C_10_heures_du_matin_-_PPP586_-_Mus%C3%A9e_des_Beaux-Arts_de_la_ville_de_Paris.jpg/1920px-Armand_Guillaumin_-_Saint-Palais%2C_la_Pointe_de_la_Douane%2C_ao%C3%BBt_92%2C_10_heures_du_matin_-_PPP586_-_Mus%C3%A9e_des_Beaux-Arts_de_la_ville_de_Paris.jpg"],
 },
 {
 slug:"visiter-saint-georges-de-didonne"category:"visite"dept:"17"name:"Visiter Saint-Georges-de-Didonne"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Phare de Saint-Georges, pointe de Suzac, parc de l'Estuaire et front de mer."history:"À l'embouchure de la Gironde, Saint-Georges garde son phare de 1901 et la pointe de Suzac, couverte de blockhaus du Mur de l'Atlantique. Sa plage de deux kilomètres, abritée par la pointe de Vallières, est l'une des plus sûres de l'estuaire."tips:"Nos deux chauffeurs desservent Saint-Georges-de-Didonne. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Saint-Georges lighthouse, Suzac headland, the Estuary park and the seafront."history:"At the mouth of the Gironde, Saint-Georges keeps its 1901 lighthouse and the Suzac headland, covered with Atlantic Wall bunkers. Its two-kilometre beach, sheltered by the Vallières point, is among the estuary's safest."tips:"Our two drivers serve Saint-Georges-de-Didonne. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/17333-Saint-Georges-de-Didonne-Sols.png/1920px-17333-Saint-Georges-de-Didonne-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/17333-Saint-Georges-de-Didonne-argile.jpg/1920px-17333-Saint-Georges-de-Didonne-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/a/a0/Aire_du_Poitevin-saintongeais.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-georges-de-didonne"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Georges-de-Didonne"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier de l'estuaire de la pointe de Vallières au bois de Suzac, vue sur Cordouan."history:"À l'embouchure de la Gironde, Saint-Georges garde son phare de 1901 et la pointe de Suzac, couverte de blockhaus du Mur de l'Atlantique. Sa plage de deux kilomètres, abritée par la pointe de Vallières, est l'une des plus sûres de l'estuaire."tips:"Nos deux chauffeurs desservent Saint-Georges-de-Didonne. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Estuary path from Vallières point to Suzac wood, with views of Cordouan."history:"At the mouth of the Gironde, Saint-Georges keeps its 1901 lighthouse and the Suzac headland, covered with Atlantic Wall bunkers. Its two-kilometre beach, sheltered by the Vallières point, is among the estuary's safest."tips:"Our two drivers serve Saint-Georges-de-Didonne. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/7/77/Bundesarchiv_Bild_146-1985-039-04%2C_Frankreich%2C_deutsche_Soldaten_am_Strand.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bus_Carabus.JPG/1920px-Bus_Carabus.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ch%C3%A2teau_d%27eau_de_Suzac.JPG/1920px-Ch%C3%A2teau_d%27eau_de_Suzac.JPG"],
 },
 {
 slug:"ou-manger-a-saint-georges-de-didonne"category:"restaurant"dept:"17"name:"Où manger à Saint-Georges-de-Didonne"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Cabanes à huîtres, glaciers du front de mer, cuisine de bord d'estuaire."history:"À l'embouchure de la Gironde, Saint-Georges garde son phare de 1901 et la pointe de Suzac, couverte de blockhaus du Mur de l'Atlantique. Sa plage de deux kilomètres, abritée par la pointe de Vallières, est l'une des plus sûres de l'estuaire."tips:"Nos deux chauffeurs desservent Saint-Georges-de-Didonne. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Oyster huts, seafront ice cream parlours and estuary cooking."history:"At the mouth of the Gironde, Saint-Georges keeps its 1901 lighthouse and the Suzac headland, covered with Atlantic Wall bunkers. Its two-kilometre beach, sheltered by the Vallières point, is among the estuary's safest."tips:"Our two drivers serve Saint-Georges-de-Didonne. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/a/ae/Colette_Besson_1.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Complexe_Colette_Besson.jpg/1920px-Complexe_Colette_Besson.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/17333-Saint-Georges-de-Didonne-Sols.png/1920px-17333-Saint-Georges-de-Didonne-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-georges-de-didonne"category:"hotel"dept:"17"name:"Où dormir à Saint-Georges-de-Didonne"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Côte de Beauté"en:"Area: Côte de Beauté" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles proches de la plage, résidences de vacances."history:"À l'embouchure de la Gironde, Saint-Georges garde son phare de 1901 et la pointe de Suzac, couverte de blockhaus du Mur de l'Atlantique. Sa plage de deux kilomètres, abritée par la pointe de Vallières, est l'une des plus sûres de l'estuaire."tips:"Nos deux chauffeurs desservent Saint-Georges-de-Didonne. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Two- and three-star hotels near the beach and holiday residences."history:"At the mouth of the Gironde, Saint-Georges keeps its 1901 lighthouse and the Suzac headland, covered with Atlantic Wall bunkers. Its two-kilometre beach, sheltered by the Vallières point, is among the estuary's safest."tips:"Our two drivers serve Saint-Georges-de-Didonne. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/17333-Saint-Georges-de-Didonne-argile.jpg/1920px-17333-Saint-Georges-de-Didonne-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/a/a0/Aire_du_Poitevin-saintongeais.jpg""https://upload.wikimedia.org/wikipedia/commons/7/77/Bundesarchiv_Bild_146-1985-039-04%2C_Frankreich%2C_deutsche_Soldaten_am_Strand.jpg"],
 },
 {
 slug:"visiter-meschers-sur-gironde"category:"visite"dept:"17"name:"Visiter Meschers-sur-Gironde"city:"Meschers-sur-Gironde"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 100 km de La Rochelle"en:"≈ 100 km from La Rochelle" },
 ],
 fr: {
 teaser:"Grottes de Régulus et de Matata, port de plaisance, carrelets accrochés à la falaise."history:"Meschers est célèbre pour ses grottes creusées dans la falaise calcaire, habitées depuis la préhistoire, refuges de protestants puis de contrebandiers, et aujourd'hui aménagées en sites de visite au-dessus de l'estuaire."tips:"Nos deux chauffeurs desservent Meschers-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Régulus and Matata caves, the marina and fishing huts clinging to the cliff."history:"Meschers is famous for its caves cut into the limestone cliff, inhabited since prehistory, used as refuges by Protestants and smugglers, and now open to visitors above the estuary."tips:"Our two drivers serve Meschers-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/17230-Meschers-sur-Gironde-Sols.png/1920px-17230-Meschers-sur-Gironde-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/17230-Meschers-sur-Gironde-argile.jpg/1920px-17230-Meschers-sur-Gironde-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/d/dd/Allium_roseum_flor.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-meschers-sur-gironde"category:"randonnee"dept:"17"name:"Randonnées et balades à Meschers-sur-Gironde"city:"Meschers-sur-Gironde"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 100 km de La Rochelle"en:"≈ 100 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier des falaises vers Talmont: 7 km au-dessus de la Gironde."history:"Meschers est célèbre pour ses grottes creusées dans la falaise calcaire, habitées depuis la préhistoire, refuges de protestants puis de contrebandiers, et aujourd'hui aménagées en sites de visite au-dessus de l'estuaire."tips:"Nos deux chauffeurs desservent Meschers-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The cliff path to Talmont: 7 km above the Gironde."history:"Meschers is famous for its caves cut into the limestone cliff, inhabited since prehistory, used as refuges by Protestants and smugglers, and now open to visitors above the estuary."tips:"Our two drivers serve Meschers-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/f/f1/Arces_eglise.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Bateaux_%C3%A0_Meschers.jpg/1920px-Bateaux_%C3%A0_Meschers.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Blockhaus_%C3%A0_Suzac.JPG/1920px-Blockhaus_%C3%A0_Suzac.JPG"],
 },
 {
 slug:"ou-manger-a-meschers-sur-gironde"category:"restaurant"dept:"17"name:"Où manger à Meschers-sur-Gironde"city:"Meschers-sur-Gironde"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 100 km de La Rochelle"en:"≈ 100 km from La Rochelle" },
 ],
 fr: {
 teaser:"Restaurants troglodytiques dans la falaise, poissons de l'estuaire, pibales en saison."history:"Meschers est célèbre pour ses grottes creusées dans la falaise calcaire, habitées depuis la préhistoire, refuges de protestants puis de contrebandiers, et aujourd'hui aménagées en sites de visite au-dessus de l'estuaire."tips:"Nos deux chauffeurs desservent Meschers-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Troglodyte cliff restaurants, estuary fish and elvers in season."history:"Meschers is famous for its caves cut into the limestone cliff, inhabited since prehistory, used as refuges by Protestants and smugglers, and now open to visitors above the estuary."tips:"Our two drivers serve Meschers-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chateau_d%27eau_de_Meschers.jpg/1920px-Chateau_d%27eau_de_Meschers.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Cognac_glass.jpg/1920px-Cognac_glass.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/17230-Meschers-sur-Gironde-Sols.png/1920px-17230-Meschers-sur-Gironde-Sols.png"],
 },
 {
 slug:"ou-dormir-a-meschers-sur-gironde"category:"hotel"dept:"17"name:"Où dormir à Meschers-sur-Gironde"city:"Meschers-sur-Gironde"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Estuaire"en:"Area: Estuaire" },
 { fr:"≈ 100 km de La Rochelle"en:"≈ 100 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles et chambres d'hôtes avec vue sur l'estuaire."history:"Meschers est célèbre pour ses grottes creusées dans la falaise calcaire, habitées depuis la préhistoire, refuges de protestants puis de contrebandiers, et aujourd'hui aménagées en sites de visite au-dessus de l'estuaire."tips:"Nos deux chauffeurs desservent Meschers-sur-Gironde. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels and guesthouses with estuary views."history:"Meschers is famous for its caves cut into the limestone cliff, inhabited since prehistory, used as refuges by Protestants and smugglers, and now open to visitors above the estuary."tips:"Our two drivers serve Meschers-sur-Gironde. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/17230-Meschers-sur-Gironde-argile.jpg/1920px-17230-Meschers-sur-Gironde-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/d/dd/Allium_roseum_flor.jpg""https://upload.wikimedia.org/wikipedia/commons/f/f1/Arces_eglise.JPG"],
 },
 {
 slug:"visiter-jonzac"category:"visite"dept:"17"name:"Visiter Jonzac"city:"Jonzac"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Haute-Saintonge"en:"Area: Haute-Saintonge" },
 { fr:"≈ 120 km de La Rochelle"en:"≈ 120 km from La Rochelle" },
 ],
 fr: {
 teaser:"Château, cloître des Carmes, moulin de Chez Bret et Antilles de Jonzac."history:"Jonzac est devenue station thermale en 1979 après le forage d'une eau chaude à 1 800 mètres de profondeur. Son château du XVᵉ siècle, aujourd'hui mairie et sous-préfecture, domine la Seugne et le vieux moulin à eau."tips:"Nos deux chauffeurs desservent Jonzac. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The castle, the Carmelite cloister, the Chez Bret mill and the Antilles water park."history:"Jonzac became a spa town in 1979 after hot water was drilled at 1,800 metres. Its 15th-century castle, now town hall and sub-prefecture, overlooks the Seugne and the old water mill."tips:"Our two drivers serve Jonzac. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/17197-Jonzac-Sols.png/1920px-17197-Jonzac-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/17197-Jonzac-argile.jpg/1920px-17197-Jonzac-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/A%C3%A9rodrome_Jonzac-Neulles3.JPG/1920px-A%C3%A9rodrome_Jonzac-Neulles3.JPG"],
 },
 {
 slug:"randonnees-et-balades-a-jonzac"category:"randonnee"dept:"17"name:"Randonnées et balades à Jonzac"city:"Jonzac"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Haute-Saintonge"en:"Area: Haute-Saintonge" },
 { fr:"≈ 120 km de La Rochelle"en:"≈ 120 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucle de la Seugne et vallée verdoyante vers Saint-Germain-de-Lusignan."history:"Jonzac est devenue station thermale en 1979 après le forage d'une eau chaude à 1 800 mètres de profondeur. Son château du XVᵉ siècle, aujourd'hui mairie et sous-préfecture, domine la Seugne et le vieux moulin à eau."tips:"Nos deux chauffeurs desservent Jonzac. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Seugne loop and green valley towards Saint-Germain-de-Lusignan."history:"Jonzac became a spa town in 1979 after hot water was drilled at 1,800 metres. Its 15th-century castle, now town hall and sub-prefecture, overlooks the Seugne and the old water mill."tips:"Our two drivers serve Jonzac. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Base_de_loisirs_de_Jonzac.JPG/1920px-Base_de_loisirs_de_Jonzac.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Champagnac.jpg/1920px-Champagnac.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Chateau_de_Jonzac.jpg/1920px-Chateau_de_Jonzac.jpg"],
 },
 {
 slug:"ou-manger-a-jonzac"category:"restaurant"dept:"17"name:"Où manger à Jonzac"city:"Jonzac"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Haute-Saintonge"en:"Area: Haute-Saintonge" },
 { fr:"≈ 120 km de La Rochelle"en:"≈ 120 km from La Rochelle" },
 ],
 fr: {
 teaser:"Cuisine de Haute-Saintonge: pineau, cognac, canard et melon."history:"Jonzac est devenue station thermale en 1979 après le forage d'une eau chaude à 1 800 mètres de profondeur. Son château du XVᵉ siècle, aujourd'hui mairie et sous-préfecture, domine la Seugne et le vieux moulin à eau."tips:"Nos deux chauffeurs desservent Jonzac. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Haute-Saintonge cooking: pineau, cognac, duck and melon."history:"Jonzac became a spa town in 1979 after hot water was drilled at 1,800 metres. Its 15th-century castle, now town hall and sub-prefecture, overlooks the Seugne and the old water mill."tips:"Our two drivers serve Jonzac. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Cloitre_des_carmes_jonzac.jpg/1920px-Cloitre_des_carmes_jonzac.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Eglise_d%27Ozillac.jpg/1920px-Eglise_d%27Ozillac.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/17197-Jonzac-Sols.png/1920px-17197-Jonzac-Sols.png"],
 },
 {
 slug:"ou-dormir-a-jonzac"category:"hotel"dept:"17"name:"Où dormir à Jonzac"city:"Jonzac"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Haute-Saintonge"en:"Area: Haute-Saintonge" },
 { fr:"≈ 120 km de La Rochelle"en:"≈ 120 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles et résidences thermales, chambres d'hôtes dans les logis."history:"Jonzac est devenue station thermale en 1979 après le forage d'une eau chaude à 1 800 mètres de profondeur. Son château du XVᵉ siècle, aujourd'hui mairie et sous-préfecture, domine la Seugne et le vieux moulin à eau."tips:"Nos deux chauffeurs desservent Jonzac. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels and spa residences, guesthouses in old manor houses."history:"Jonzac became a spa town in 1979 after hot water was drilled at 1,800 metres. Its 15th-century castle, now town hall and sub-prefecture, overlooks the Seugne and the old water mill."tips:"Our two drivers serve Jonzac. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/17197-Jonzac-argile.jpg/1920px-17197-Jonzac-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/A%C3%A9rodrome_Jonzac-Neulles3.JPG/1920px-A%C3%A9rodrome_Jonzac-Neulles3.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Base_de_loisirs_de_Jonzac.JPG/1920px-Base_de_loisirs_de_Jonzac.JPG"],
 },
 {
 slug:"visiter-saint-jean-d-angely"category:"visite"dept:"17"name:"Visiter Saint-Jean-d'Angély"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Abbaye royale et tours inachevées, fontaine du Pilori, maisons à pans de bois."history:"Étape du chemin de Saint-Jacques inscrite à l'UNESCO, la ville s'est développée autour d'une abbaye royale fondée en 817 pour abriter une relique du chef de saint Jean-Baptiste. Ses tours inachevées, chantier arrêté à la Révolution, dominent encore le bourg."tips:"Nos deux chauffeurs desservent Saint-Jean-d'Angély. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The royal abbey and unfinished towers, the Pilori fountain and half-timbered houses."history:"A UNESCO-listed stop on the Santiago pilgrim route, the town grew around a royal abbey founded in 817 to house a relic of John the Baptist. Its unfinished towers, abandoned at the Revolution, still dominate the town."tips:"Our two drivers serve Saint-Jean-d'Angély. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/17347-Saint-Jean-d%27Ang%C3%A9ly-Sols.png/1920px-17347-Saint-Jean-d%27Ang%C3%A9ly-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/17347-Saint-Jean-d%27Ang%C3%A9ly-argile.jpg/1920px-17347-Saint-Jean-d%27Ang%C3%A9ly-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/e/e3/Beffroi_Saint-Jean-d%27Angely.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-jean-d-angely"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Jean-d'Angély"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chemin de halage de la Boutonne et boucle des prairies humides."history:"Étape du chemin de Saint-Jacques inscrite à l'UNESCO, la ville s'est développée autour d'une abbaye royale fondée en 817 pour abriter une relique du chef de saint Jean-Baptiste. Ses tours inachevées, chantier arrêté à la Révolution, dominent encore le bourg."tips:"Nos deux chauffeurs desservent Saint-Jean-d'Angély. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Boutonne towpath and a loop through the wet meadows."history:"A UNESCO-listed stop on the Santiago pilgrim route, the town grew around a royal abbey founded in 817 to house a relic of John the Baptist. Its unfinished towers, abandoned at the Revolution, still dominate the town."tips:"Our two drivers serve Saint-Jean-d'Angély. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/1/1a/Benedictines_St_Jean_dY.jpg""https://upload.wikimedia.org/wikipedia/commons/e/e2/Ecluses_St_Jean_dY.jpg""https://upload.wikimedia.org/wikipedia/commons/4/4a/Fontaine_du_Pilori_Saint-Jean-d%27Angely.jpg"],
 },
 {
 slug:"ou-manger-a-saint-jean-d-angely"category:"restaurant"dept:"17"name:"Où manger à Saint-Jean-d'Angély"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Marché de Saintonge, chevreau, mojettes et cognac de Petite Champagne."history:"Étape du chemin de Saint-Jacques inscrite à l'UNESCO, la ville s'est développée autour d'une abbaye royale fondée en 817 pour abriter une relique du chef de saint Jean-Baptiste. Ses tours inachevées, chantier arrêté à la Révolution, dominent encore le bourg."tips:"Nos deux chauffeurs desservent Saint-Jean-d'Angély. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Saintonge market produce, kid goat, white beans and Petite Champagne cognac."history:"A UNESCO-listed stop on the Santiago pilgrim route, the town grew around a royal abbey founded in 817 to house a relic of John the Baptist. Its unfinished towers, abandoned at the Revolution, still dominate the town."tips:"Our two drivers serve Saint-Jean-d'Angély. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/0/03/Les_tours_Saint-Jean-d%27Angely.jpg""https://upload.wikimedia.org/wikipedia/commons/9/9c/Maison_%C3%A0_colombage2_Saint-Jean-d%27Angely.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/17347-Saint-Jean-d%27Ang%C3%A9ly-Sols.png/1920px-17347-Saint-Jean-d%27Ang%C3%A9ly-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-jean-d-angely"category:"hotel"dept:"17"name:"Où dormir à Saint-Jean-d'Angély"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles au centre, logis de charme dans la campagne alentour."history:"Étape du chemin de Saint-Jacques inscrite à l'UNESCO, la ville s'est développée autour d'une abbaye royale fondée en 817 pour abriter une relique du chef de saint Jean-Baptiste. Ses tours inachevées, chantier arrêté à la Révolution, dominent encore le bourg."tips:"Nos deux chauffeurs desservent Saint-Jean-d'Angély. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Two- and three-star hotels in the centre, charming inns in the surrounding countryside."history:"A UNESCO-listed stop on the Santiago pilgrim route, the town grew around a royal abbey founded in 817 to house a relic of John the Baptist. Its unfinished towers, abandoned at the Revolution, still dominate the town."tips:"Our two drivers serve Saint-Jean-d'Angély. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/17347-Saint-Jean-d%27Ang%C3%A9ly-argile.jpg/1920px-17347-Saint-Jean-d%27Ang%C3%A9ly-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/e/e3/Beffroi_Saint-Jean-d%27Angely.jpg""https://upload.wikimedia.org/wikipedia/commons/1/1a/Benedictines_St_Jean_dY.jpg"],
 },
 {
 slug:"visiter-pons"category:"visite"dept:"17"name:"Visiter Pons"city:"Pons"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 85 km de La Rochelle"en:"≈ 85 km from La Rochelle" },
 ],
 fr: {
 teaser:"Donjon, hôpital des pèlerins, jardin de l'hôtel de ville et château d'Usson."history:"Le donjon de Pons, élevé vers 1187 par les puissants sires de Pons, reste l'un des mieux conservés du Sud-Ouest. L'hôpital des pèlerins, du XIIᵉ siècle, est l'un des rares hospices jacquaires encore debout en France, inscrit à l'UNESCO."tips:"Nos deux chauffeurs desservent Pons. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The keep, the pilgrims' hospital, the town hall garden and Usson castle."history:"The keep of Pons, raised around 1187 by the powerful lords of Pons, is among the best preserved in south-west France. The 12th-century pilgrims' hospital is one of the rare Santiago hospices still standing, UNESCO-listed."tips:"Our two drivers serve Pons. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/17283-Pons-Sols.png/1920px-17283-Pons-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/17283-Pons-argile.jpg/1920px-17283-Pons-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Centre-Pons.JPG/1920px-Centre-Pons.JPG"],
 },
 {
 slug:"randonnees-et-balades-a-pons"category:"randonnee"dept:"17"name:"Randonnées et balades à Pons"city:"Pons"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 85 km de La Rochelle"en:"≈ 85 km from La Rochelle" },
 ],
 fr: {
 teaser:"Vallée de la Seugne, moulins et lavoirs, boucle facile de 8 km."history:"Le donjon de Pons, élevé vers 1187 par les puissants sires de Pons, reste l'un des mieux conservés du Sud-Ouest. L'hôpital des pèlerins, du XIIᵉ siècle, est l'un des rares hospices jacquaires encore debout en France, inscrit à l'UNESCO."tips:"Nos deux chauffeurs desservent Pons. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Seugne valley, mills and washhouses, an easy 8 km loop."history:"The keep of Pons, raised around 1187 by the powerful lords of Pons, is among the best preserved in south-west France. The 12th-century pilgrims' hospital is one of the rare Santiago hospices still standing, UNESCO-listed."tips:"Our two drivers serve Pons. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Chapelle_Saint-Gilles%2C_Pons.jpg/1920px-Chapelle_Saint-Gilles%2C_Pons.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Chapelle_des_Ursulines.jpg/1920px-Chapelle_des_Ursulines.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Ch%C3%A2teau_de_Pons2.JPG/1920px-Ch%C3%A2teau_de_Pons2.JPG"],
 },
 {
 slug:"ou-manger-a-pons"category:"restaurant"dept:"17"name:"Où manger à Pons"city:"Pons"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 85 km de La Rochelle"en:"≈ 85 km from La Rochelle" },
 ],
 fr: {
 teaser:"Tables de terroir, pineau, grillons et fromages de chèvre de Saintonge."history:"Le donjon de Pons, élevé vers 1187 par les puissants sires de Pons, reste l'un des mieux conservés du Sud-Ouest. L'hôpital des pèlerins, du XIIᵉ siècle, est l'un des rares hospices jacquaires encore debout en France, inscrit à l'UNESCO."tips:"Nos deux chauffeurs desservent Pons. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Regional tables, pineau, potted pork and Saintonge goat cheese."history:"The keep of Pons, raised around 1187 by the powerful lords of Pons, is among the best preserved in south-west France. The 12th-century pilgrims' hospital is one of the rare Santiago hospices still standing, UNESCO-listed."tips:"Our two drivers serve Pons. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Ch%C3%A2teau_de_Pons4.JPG/1920px-Ch%C3%A2teau_de_Pons4.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Distillerie_du_donjon_04049.JPG/1920px-Distillerie_du_donjon_04049.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/17283-Pons-Sols.png/1920px-17283-Pons-Sols.png"],
 },
 {
 slug:"ou-dormir-a-pons"category:"hotel"dept:"17"name:"Où dormir à Pons"city:"Pons"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 85 km de La Rochelle"en:"≈ 85 km from La Rochelle" },
 ],
 fr: {
 teaser:"Logis 3 étoiles et chambres d'hôtes dans les demeures du XVIIIᵉ siècle."history:"Le donjon de Pons, élevé vers 1187 par les puissants sires de Pons, reste l'un des mieux conservés du Sud-Ouest. L'hôpital des pèlerins, du XIIᵉ siècle, est l'un des rares hospices jacquaires encore debout en France, inscrit à l'UNESCO."tips:"Nos deux chauffeurs desservent Pons. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star inns and guesthouses in 18th-century houses."history:"The keep of Pons, raised around 1187 by the powerful lords of Pons, is among the best preserved in south-west France. The 12th-century pilgrims' hospital is one of the rare Santiago hospices still standing, UNESCO-listed."tips:"Our two drivers serve Pons. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/17283-Pons-argile.jpg/1920px-17283-Pons-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Centre-Pons.JPG/1920px-Centre-Pons.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Chapelle_Saint-Gilles%2C_Pons.jpg/1920px-Chapelle_Saint-Gilles%2C_Pons.jpg"],
 },
 {
 slug:"visiter-surgeres"category:"visite"dept:"17"name:"Visiter Surgères"city:"Surgères"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Enceinte fortifiée, église Notre-Dame, parc du château et École nationale des industries laitières."history:"Surgères doit sa renommée au beurre AOP Charentes-Poitou, né de la coopération laitière fondée ici en 1888. Son enceinte médiévale de vingt tours enserre l'église romane Notre-Dame, chef-d'œuvre du XIIᵉ siècle à la façade sculptée."tips:"Nos deux chauffeurs desservent Surgères. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The fortified wall, Notre-Dame church, the castle park and the national dairy school."history:"Surgères owes its fame to PDO Charentes-Poitou butter, born of the dairy cooperative founded here in 1888. Its medieval wall of twenty towers encloses the Romanesque church of Notre-Dame, a 12th-century masterpiece."tips:"Our two drivers serve Surgères. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/d/d8/17-Surg%C3%A8res-logis-seigneurial.jpg""https://upload.wikimedia.org/wikipedia/commons/b/ba/17-Surg%C3%A8res-%C3%A9glise-nord.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/17434-Surg%C3%A8res-Sols.png/1920px-17434-Surg%C3%A8res-Sols.png"],
 },
 {
 slug:"randonnees-et-balades-a-surgeres"category:"randonnee"dept:"17"name:"Randonnées et balades à Surgères"city:"Surgères"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucle de la Gères et chemins de plaine vers Saint-Georges-du-Bois."history:"Surgères doit sa renommée au beurre AOP Charentes-Poitou, né de la coopération laitière fondée ici en 1888. Son enceinte médiévale de vingt tours enserre l'église romane Notre-Dame, chef-d'œuvre du XIIᵉ siècle à la façade sculptée."tips:"Nos deux chauffeurs desservent Surgères. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Gères loop and plain paths towards Saint-Georges-du-Bois."history:"Surgères owes its fame to PDO Charentes-Poitou butter, born of the dairy cooperative founded here in 1888. Its medieval wall of twenty towers encloses the Romanesque church of Notre-Dame, a 12th-century masterpiece."tips:"Our two drivers serve Surgères. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/e/e1/2008-08-Surg%C3%A8res-Castle-townhall.JPG""https://upload.wikimedia.org/wikipedia/commons/8/84/2008-08-Surg%C3%A8res-Castle.JPG""https://upload.wikimedia.org/wikipedia/commons/6/66/2008-08-Surg%C3%A8res-Street.JPG"],
 },
 {
 slug:"ou-manger-a-surgeres"category:"restaurant"dept:"17"name:"Où manger à Surgères"city:"Surgères"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Beurre AOP, fromages fermiers et cuisine de plaine à la crème."history:"Surgères doit sa renommée au beurre AOP Charentes-Poitou, né de la coopération laitière fondée ici en 1888. Son enceinte médiévale de vingt tours enserre l'église romane Notre-Dame, chef-d'œuvre du XIIᵉ siècle à la façade sculptée."tips:"Nos deux chauffeurs desservent Surgères. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"PDO butter, farm cheeses and creamy plain cooking."history:"Surgères owes its fame to PDO Charentes-Poitou butter, born of the dairy cooperative founded here in 1888. Its medieval wall of twenty towers encloses the Romanesque church of Notre-Dame, a 12th-century masterpiece."tips:"Our two drivers serve Surgères. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/8/8f/2008-08-Surg%C3%A8res-markethall.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Ancien_presbyt%C3%A8re_de_Surg%C3%A8res.JPG/1920px-Ancien_presbyt%C3%A8re_de_Surg%C3%A8res.JPG""https://upload.wikimedia.org/wikipedia/commons/d/d8/17-Surg%C3%A8res-logis-seigneurial.jpg"],
 },
 {
 slug:"ou-dormir-a-surgeres"category:"hotel"dept:"17"name:"Où dormir à Surgères"city:"Surgères"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles près de la gare, gîtes ruraux alentour."history:"Surgères doit sa renommée au beurre AOP Charentes-Poitou, né de la coopération laitière fondée ici en 1888. Son enceinte médiévale de vingt tours enserre l'église romane Notre-Dame, chef-d'œuvre du XIIᵉ siècle à la façade sculptée."tips:"Nos deux chauffeurs desservent Surgères. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Two- and three-star hotels near the station and rural gîtes nearby."history:"Surgères owes its fame to PDO Charentes-Poitou butter, born of the dairy cooperative founded here in 1888. Its medieval wall of twenty towers encloses the Romanesque church of Notre-Dame, a 12th-century masterpiece."tips:"Our two drivers serve Surgères. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/b/ba/17-Surg%C3%A8res-%C3%A9glise-nord.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/17434-Surg%C3%A8res-Sols.png/1920px-17434-Surg%C3%A8res-Sols.png""https://upload.wikimedia.org/wikipedia/commons/e/e1/2008-08-Surg%C3%A8res-Castle-townhall.JPG"],
 },
 {
 slug:"visiter-aulnay-de-saintonge"category:"visite"dept:"17"name:"Visiter Aulnay-de-Saintonge"city:"Aulnay-de-Saintonge"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Église Saint-Pierre, cimetière à croix hosannière, halle et vieux bourg."history:"L'église Saint-Pierre d'Aulnay, bâtie vers 1130 en plein champ, est considérée comme l'un des sommets de l'art roman saintongeais: ses voussures sculptées d'anges, de vieillards et d'animaux fantastiques sont inscrites à l'UNESCO au titre des chemins de Compostelle."tips:"Nos deux chauffeurs desservent Aulnay-de-Saintonge. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Saint-Pierre church, the cemetery with its hosanna cross, the market hall and old town."history:"The church of Saint-Pierre in Aulnay, built around 1130 in open fields, is a summit of Saintonge Romanesque art: its carved archivolts of angels, elders and fantastic beasts are UNESCO-listed on the Santiago routes."tips:"Our two drivers serve Aulnay-de-Saintonge. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/17024-Aulnay-Sols.png/1920px-17024-Aulnay-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/17024-Aulnay-argile.jpg/1920px-17024-Aulnay-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/a/ab/Aulnay1.1.JPG"],
 },
 {
 slug:"randonnees-et-balades-a-aulnay-de-saintonge"category:"randonnee"dept:"17"name:"Randonnées et balades à Aulnay-de-Saintonge"city:"Aulnay-de-Saintonge"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier des églises romanes vers Dampierre-sur-Boutonne et son château Renaissance."history:"L'église Saint-Pierre d'Aulnay, bâtie vers 1130 en plein champ, est considérée comme l'un des sommets de l'art roman saintongeais: ses voussures sculptées d'anges, de vieillards et d'animaux fantastiques sont inscrites à l'UNESCO au titre des chemins de Compostelle."tips:"Nos deux chauffeurs desservent Aulnay-de-Saintonge. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Romanesque church trail towards Dampierre-sur-Boutonne and its Renaissance castle."history:"The church of Saint-Pierre in Aulnay, built around 1130 in open fields, is a summit of Saintonge Romanesque art: its carved archivolts of angels, elders and fantastic beasts are UNESCO-listed on the Santiago routes."tips:"Our two drivers serve Aulnay-de-Saintonge. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/b/bf/Aulnay1.2.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Aulnay_Ancienne_Gare.jpg/1920px-Aulnay_Ancienne_Gare.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Aulnay_Ancienne_%C3%A9cole_des_gar%C3%A7ons.jpg/1920px-Aulnay_Ancienne_%C3%A9cole_des_gar%C3%A7ons.jpg"],
 },
 {
 slug:"ou-manger-a-aulnay-de-saintonge"category:"restaurant"dept:"17"name:"Où manger à Aulnay-de-Saintonge"city:"Aulnay-de-Saintonge"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Auberges de campagne, agneau, mojettes et vins de pays charentais."history:"L'église Saint-Pierre d'Aulnay, bâtie vers 1130 en plein champ, est considérée comme l'un des sommets de l'art roman saintongeais: ses voussures sculptées d'anges, de vieillards et d'animaux fantastiques sont inscrites à l'UNESCO au titre des chemins de Compostelle."tips:"Nos deux chauffeurs desservent Aulnay-de-Saintonge. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Country inns, lamb, white beans and local Charentais wines."history:"The church of Saint-Pierre in Aulnay, built around 1130 in open fields, is a summit of Saintonge Romanesque art: its carved archivolts of angels, elders and fantastic beasts are UNESCO-listed on the Santiago routes."tips:"Our two drivers serve Aulnay-de-Saintonge. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Aulnay_Eglise_1.jpg/1920px-Aulnay_Eglise_1.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Aulnay_Eglise_2.jpg/1920px-Aulnay_Eglise_2.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/17024-Aulnay-Sols.png/1920px-17024-Aulnay-Sols.png"],
 },
 {
 slug:"ou-dormir-a-aulnay-de-saintonge"category:"hotel"dept:"17"name:"Où dormir à Aulnay-de-Saintonge"city:"Aulnay-de-Saintonge"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 90 km de La Rochelle"en:"≈ 90 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes dans les logis, hôtels 2 étoiles à Saint-Jean-d'Angély."history:"L'église Saint-Pierre d'Aulnay, bâtie vers 1130 en plein champ, est considérée comme l'un des sommets de l'art roman saintongeais: ses voussures sculptées d'anges, de vieillards et d'animaux fantastiques sont inscrites à l'UNESCO au titre des chemins de Compostelle."tips:"Nos deux chauffeurs desservent Aulnay-de-Saintonge. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Guesthouses in old manors, two-star hotels in Saint-Jean-d'Angély."history:"The church of Saint-Pierre in Aulnay, built around 1130 in open fields, is a summit of Saintonge Romanesque art: its carved archivolts of angels, elders and fantastic beasts are UNESCO-listed on the Santiago routes."tips:"Our two drivers serve Aulnay-de-Saintonge. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/17024-Aulnay-argile.jpg/1920px-17024-Aulnay-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/a/ab/Aulnay1.1.JPG""https://upload.wikimedia.org/wikipedia/commons/b/bf/Aulnay1.2.JPG"],
 },
 {
 slug:"visiter-saint-savinien"category:"visite"dept:"17"name:"Visiter Saint-Savinien"city:"Saint-Savinien"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Quais du fleuve, église Saint-Savinien, carrières et plage fluviale."history:"Petite Cité de Caractère posée sur la Charente, Saint-Savinien vécut de la pierre: ses carrières ont fourni le calcaire des fortifications de Rochefort et de nombreuses églises de la région. Le fleuve y forme une boucle bordée de quais et de plages fluviales."tips:"Nos deux chauffeurs desservent Saint-Savinien. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The river quays, Saint-Savinien church, the quarries and the river beach."history:"A Petite Cité de Caractère on the Charente, Saint-Savinien lived on stone: its quarries supplied the limestone for Rochefort's fortifications and many regional churches. The river forms a loop lined with quays and river beaches."tips:"Our two drivers serve Saint-Savinien. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/17397-Saint-Savinien-Sols.png/1920px-17397-Saint-Savinien-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/17397-Saint-Savinien-argile.jpg/1920px-17397-Saint-Savinien-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Echasse_blanche-17.jpg/1920px-Echasse_blanche-17.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-savinien"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Savinien"city:"Saint-Savinien"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chemin de halage vers Taillebourg et le champ de bataille de 1242."history:"Petite Cité de Caractère posée sur la Charente, Saint-Savinien vécut de la pierre: ses carrières ont fourni le calcaire des fortifications de Rochefort et de nombreuses églises de la région. Le fleuve y forme une boucle bordée de quais et de plages fluviales."tips:"Nos deux chauffeurs desservent Saint-Savinien. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The towpath to Taillebourg and the 1242 battlefield."history:"A Petite Cité de Caractère on the Charente, Saint-Savinien lived on stone: its quarries supplied the limestone for Rochefort's fortifications and many regional churches. The river forms a loop lined with quays and river beaches."tips:"Our two drivers serve Saint-Savinien. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Cuve_baptismale.jpg/1920px-FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Cuve_baptismale.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Ext%C3%A9rieur.jpg/1920px-FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Ext%C3%A9rieur.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Tableau_repr%C3%A9sentant_Saint-Jean-Baptiste.jpg/1920px-FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Tableau_repr%C3%A9sentant_Saint-Jean-Baptiste.jpg"],
 },
 {
 slug:"ou-manger-a-saint-savinien"category:"restaurant"dept:"17"name:"Où manger à Saint-Savinien"city:"Saint-Savinien"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Guinguettes de bord de fleuve, anguilles et cuisine de rivière."history:"Petite Cité de Caractère posée sur la Charente, Saint-Savinien vécut de la pierre: ses carrières ont fourni le calcaire des fortifications de Rochefort et de nombreuses églises de la région. Le fleuve y forme une boucle bordée de quais et de plages fluviales."tips:"Nos deux chauffeurs desservent Saint-Savinien. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Riverside guinguettes, eels and river cooking."history:"A Petite Cité de Caractère on the Charente, Saint-Savinien lived on stone: its quarries supplied the limestone for Rochefort's fortifications and many regional churches. The river forms a loop lined with quays and river beaches."tips:"Our two drivers serve Saint-Savinien. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/FR_17_Saint-Savinien_-_Cimeti%C3%A8re_des_protestants.jpg/1920px-FR_17_Saint-Savinien_-_Cimeti%C3%A8re_des_protestants.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/FR_17_Saint-Savinien_-_Coulonge-sur-Charente_-_%C3%89glise_Sainte-Marie_de_l%27Assomption_%28sud-est%29.jpg/1920px-FR_17_Saint-Savinien_-_Coulonge-sur-Charente_-_%C3%89glise_Sainte-Marie_de_l%27Assomption_%28sud-est%29.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/17397-Saint-Savinien-Sols.png/1920px-17397-Saint-Savinien-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saint-savinien"category:"hotel"dept:"17"name:"Où dormir à Saint-Savinien"city:"Saint-Savinien"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes sur les quais, hôtels 2 étoiles à Saintes."history:"Petite Cité de Caractère posée sur la Charente, Saint-Savinien vécut de la pierre: ses carrières ont fourni le calcaire des fortifications de Rochefort et de nombreuses églises de la région. Le fleuve y forme une boucle bordée de quais et de plages fluviales."tips:"Nos deux chauffeurs desservent Saint-Savinien. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Quayside guesthouses, two-star hotels in Saintes."history:"A Petite Cité de Caractère on the Charente, Saint-Savinien lived on stone: its quarries supplied the limestone for Rochefort's fortifications and many regional churches. The river forms a loop lined with quays and river beaches."tips:"Our two drivers serve Saint-Savinien. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/17397-Saint-Savinien-argile.jpg/1920px-17397-Saint-Savinien-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Echasse_blanche-17.jpg/1920px-Echasse_blanche-17.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Cuve_baptismale.jpg/1920px-FR_17_Saint-Savinien_-_Agonnay_-_%C3%89glise_Saint-Germain_-_Cuve_baptismale.jpg"],
 },
 {
 slug:"visiter-saint-porchaire"category:"visite"dept:"17"name:"Visiter Saint-Porchaire"city:"Saint-Porchaire"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Château de La Roche-Courbon, jardins à la française, grottes préhistoriques."history:"À deux pas du bourg, le château de La Roche-Courbon, sauvé de la ruine par Pierre Loti dans un article de 1908 puis restauré avec ses jardins à la française, domine une vallée où des grottes préhistoriques ont livré des occupations vieilles de 100 000 ans."tips:"Nos deux chauffeurs desservent Saint-Porchaire. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"La Roche-Courbon castle, its formal gardens and prehistoric caves."history:"Just outside town, the château of La Roche-Courbon — saved from ruin by Pierre Loti's 1908 article and restored with its formal gardens — overlooks a valley whose prehistoric caves reveal 100,000 years of occupation."tips:"Our two drivers serve Saint-Porchaire. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/6/6b/-25ansparcantonPC.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/17387-Saint-Porchaire-Sols.png/1920px-17387-Saint-Porchaire-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/17387-Saint-Porchaire-argile.jpg/1920px-17387-Saint-Porchaire-argile.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saint-porchaire"category:"randonnee"dept:"17"name:"Randonnées et balades à Saint-Porchaire"city:"Saint-Porchaire"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentiers du bois de La Roche-Courbon et vallée du Bruant."history:"À deux pas du bourg, le château de La Roche-Courbon, sauvé de la ruine par Pierre Loti dans un article de 1908 puis restauré avec ses jardins à la française, domine une vallée où des grottes préhistoriques ont livré des occupations vieilles de 100 000 ans."tips:"Nos deux chauffeurs desservent Saint-Porchaire. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Trails through the Roche-Courbon woods and the Bruant valley."history:"Just outside town, the château of La Roche-Courbon — saved from ruin by Pierre Loti's 1908 article and restored with its formal gardens — overlooks a valley whose prehistoric caves reveal 100,000 years of occupation."tips:"Our two drivers serve Saint-Porchaire. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Buste_de_Pierre_Loti_%C3%A0_Saint-Porchaire_%28Charente-Maritime%29.jpg/1920px-Buste_de_Pierre_Loti_%C3%A0_Saint-Porchaire_%28Charente-Maritime%29.jpg""https://upload.wikimedia.org/wikipedia/commons/8/8c/Gardens.jpg""https://upload.wikimedia.org/wikipedia/commons/4/40/Grattoirs_car%C3%A9n%C3%A9s.jpg"],
 },
 {
 slug:"ou-manger-a-saint-porchaire"category:"restaurant"dept:"17"name:"Où manger à Saint-Porchaire"city:"Saint-Porchaire"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Auberges saintongeaises, produits fermiers et pineau."history:"À deux pas du bourg, le château de La Roche-Courbon, sauvé de la ruine par Pierre Loti dans un article de 1908 puis restauré avec ses jardins à la française, domine une vallée où des grottes préhistoriques ont livré des occupations vieilles de 100 000 ans."tips:"Nos deux chauffeurs desservent Saint-Porchaire. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Saintonge inns, farm produce and pineau."history:"Just outside town, the château of La Roche-Courbon — saved from ruin by Pierre Loti's 1908 article and restored with its formal gardens — overlooks a valley whose prehistoric caves reveal 100,000 years of occupation."tips:"Our two drivers serve Saint-Porchaire. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Grottes_du_parc_du_Ch%C3%A2teau_de_la_Roche-Corbon_en_1972_%281%29.jpg/1920px-Grottes_du_parc_du_Ch%C3%A2teau_de_la_Roche-Corbon_en_1972_%281%29.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Grottes_du_parc_du_Ch%C3%A2teau_de_la_Roche-Courbon_en_1972_%282%292.jpg/1920px-Grottes_du_parc_du_Ch%C3%A2teau_de_la_Roche-Courbon_en_1972_%282%292.jpg""https://upload.wikimedia.org/wikipedia/commons/6/6b/-25ansparcantonPC.jpg"],
 },
 {
 slug:"ou-dormir-a-saint-porchaire"category:"hotel"dept:"17"name:"Où dormir à Saint-Porchaire"city:"Saint-Porchaire"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Saintonge"en:"Area: Saintonge" },
 { fr:"≈ 60 km de La Rochelle"en:"≈ 60 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes de campagne, hôtels 3 étoiles à Saintes et Rochefort."history:"À deux pas du bourg, le château de La Roche-Courbon, sauvé de la ruine par Pierre Loti dans un article de 1908 puis restauré avec ses jardins à la française, domine une vallée où des grottes préhistoriques ont livré des occupations vieilles de 100 000 ans."tips:"Nos deux chauffeurs desservent Saint-Porchaire. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Country guesthouses, three-star hotels in Saintes and Rochefort."history:"Just outside town, the château of La Roche-Courbon — saved from ruin by Pierre Loti's 1908 article and restored with its formal gardens — overlooks a valley whose prehistoric caves reveal 100,000 years of occupation."tips:"Our two drivers serve Saint-Porchaire. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/17387-Saint-Porchaire-Sols.png/1920px-17387-Saint-Porchaire-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/17387-Saint-Porchaire-argile.jpg/1920px-17387-Saint-Porchaire-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Buste_de_Pierre_Loti_%C3%A0_Saint-Porchaire_%28Charente-Maritime%29.jpg/1920px-Buste_de_Pierre_Loti_%C3%A0_Saint-Porchaire_%28Charente-Maritime%29.jpg"],
 },
 {
 slug:"visiter-ile-d-aix"category:"visite"dept:"17"name:"Visiter Île d'Aix"city:"Île d'Aix"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Îles"en:"Area: Îles" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Musée napoléonien, fort Liédot, phares jumeaux et village aux volets colorés."history:"Île sans voiture de 130 hectares, Aix fut fortifiée par Vauban puis par Napoléon, qui y passa ses trois derniers jours en France en juillet 1815 avant de se rendre aux Anglais. La maison de l'Empereur est aujourd'hui musée national."tips:"Nos deux chauffeurs desservent Île d'Aix. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Napoleonic museum, Fort Liédot, the twin lighthouses and the brightly shuttered village."history:"A car-free island of 130 hectares, Aix was fortified by Vauban and later Napoleon, who spent his last three days in France here in July 1815 before surrendering to the British. The Emperor's house is now a national museum."tips:"Our two drivers serve Île d'Aix. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/410_-_Eglise_Saint-Martin_chevet_-_Ile_d%27Aix.jpg/1920px-410_-_Eglise_Saint-Martin_chevet_-_Ile_d%27Aix.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Eastlake_-_Napoleon_on_the_Bellerophon.jpg/1920px-Eastlake_-_Napoleon_on_the_Bellerophon.jpg""https://upload.wikimedia.org/wikipedia/commons/1/17/Ic%C3%B4ne-%C3%AEle.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-ile-d-aix"category:"randonnee"dept:"17"name:"Randonnées et balades à Île d'Aix"city:"Île d'Aix"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Îles"en:"Area: Îles" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Tour de l'île à pied: 6 km de sentier littoral, plages et batteries."history:"Île sans voiture de 130 hectares, Aix fut fortifiée par Vauban puis par Napoléon, qui y passa ses trois derniers jours en France en juillet 1815 avant de se rendre aux Anglais. La maison de l'Empereur est aujourd'hui musée national."tips:"Nos deux chauffeurs desservent Île d'Aix. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"A walk around the island: 6 km of coast path, beaches and gun batteries."history:"A car-free island of 130 hectares, Aix was fortified by Vauban and later Napoleon, who spent his last three days in France here in July 1815 before surrendering to the British. The Emperor's house is now a national museum."tips:"Our two drivers serve Île d'Aix. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/4/44/Jamblet_battery_at_Ile_d%C2%B4Aix.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/La_Favoli%C3%A8re_%28ing%C3%A9nieur%29_-_L%27isle_Madame%2C_l%27isle_d%27Ay_et_fortifications%2C_1672.png/1920px-La_Favoli%C3%A8re_%28ing%C3%A9nieur%29_-_L%27isle_Madame%2C_l%27isle_d%27Ay_et_fortifications%2C_1672.png""https://upload.wikimedia.org/wikipedia/commons/a/a5/La_Tente_battery_at_%C3%8Ele-d%27Aix.jpg"],
 },
 {
 slug:"ou-manger-a-ile-d-aix"category:"restaurant"dept:"17"name:"Où manger à Île d'Aix"city:"Île d'Aix"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Îles"en:"Area: Îles" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Restaurants du village, huîtres et fruits de mer face à Fort Boyard."history:"Île sans voiture de 130 hectares, Aix fut fortifiée par Vauban puis par Napoléon, qui y passa ses trois derniers jours en France en juillet 1815 avant de se rendre aux Anglais. La maison de l'Empereur est aujourd'hui musée national."tips:"Nos deux chauffeurs desservent Île d'Aix. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Village restaurants, oysters and seafood facing Fort Boyard."history:"A car-free island of 130 hectares, Aix was fortified by Vauban and later Napoleon, who spent his last three days in France here in July 1815 before surrendering to the British. The Emperor's house is now a national museum."tips:"Our two drivers serve Île d'Aix. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/6/65/Oc%C3%A9an_Atlantique.png""https://upload.wikimedia.org/wikipedia/commons/c/c1/PixAile3.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/410_-_Eglise_Saint-Martin_chevet_-_Ile_d%27Aix.jpg/1920px-410_-_Eglise_Saint-Martin_chevet_-_Ile_d%27Aix.jpg"],
 },
 {
 slug:"ou-dormir-a-ile-d-aix"category:"hotel"dept:"17"name:"Où dormir à Île d'Aix"city:"Île d'Aix"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Îles"en:"Area: Îles" },
 { fr:"≈ 40 km de La Rochelle"en:"≈ 40 km from La Rochelle" },
 ],
 fr: {
 teaser:"Un hôtel de charme sur l'île, hôtels 3 étoiles à Fouras pour l'embarquement."history:"Île sans voiture de 130 hectares, Aix fut fortifiée par Vauban puis par Napoléon, qui y passa ses trois derniers jours en France en juillet 1815 avant de se rendre aux Anglais. La maison de l'Empereur est aujourd'hui musée national."tips:"Nos deux chauffeurs desservent Île d'Aix. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"One charming island hotel, three-star hotels in Fouras by the ferry."history:"A car-free island of 130 hectares, Aix was fortified by Vauban and later Napoleon, who spent his last three days in France here in July 1815 before surrendering to the British. The Emperor's house is now a national museum."tips:"Our two drivers serve Île d'Aix. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Eastlake_-_Napoleon_on_the_Bellerophon.jpg/1920px-Eastlake_-_Napoleon_on_the_Bellerophon.jpg""https://upload.wikimedia.org/wikipedia/commons/1/17/Ic%C3%B4ne-%C3%AEle.jpg""https://upload.wikimedia.org/wikipedia/commons/4/44/Jamblet_battery_at_Ile_d%C2%B4Aix.jpg"],
 },
 {
 slug:"visiter-tonnay-charente"category:"visite"dept:"17"name:"Visiter Tonnay-Charente"city:"Tonnay-Charente"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Pont suspendu, quais du port de commerce, église Saint-Étienne."history:"Le pont suspendu de Tonnay-Charente, ouvert en 1842 et long de 200 mètres, était l'un des plus grands d'Europe à sa construction; réservé aux piétons depuis 1971, il offre la plus belle vue sur les quais où accostaient les navires venus d'Amérique."tips:"Nos deux chauffeurs desservent Tonnay-Charente. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The suspension bridge, the commercial quays and Saint-Étienne church."history:"Tonnay-Charente's suspension bridge, opened in 1842 and 200 metres long, was one of Europe's largest when built; pedestrian-only since 1971, it gives the finest view over the quays where ships from the Americas once docked."tips:"Our two drivers serve Tonnay-Charente. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/17449-Tonnay-Charente-Sols.png/1920px-17449-Tonnay-Charente-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/17449-Tonnay-Charente-argile.jpg/1920px-17449-Tonnay-Charente-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Arche_pont_suspendu_Tonnay-Charente.jpg/1920px-Arche_pont_suspendu_Tonnay-Charente.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-tonnay-charente"category:"randonnee"dept:"17"name:"Randonnées et balades à Tonnay-Charente"city:"Tonnay-Charente"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chemin de halage de la Charente jusqu'à Rochefort, 8 km plats."history:"Le pont suspendu de Tonnay-Charente, ouvert en 1842 et long de 200 mètres, était l'un des plus grands d'Europe à sa construction; réservé aux piétons depuis 1971, il offre la plus belle vue sur les quais où accostaient les navires venus d'Amérique."tips:"Nos deux chauffeurs desservent Tonnay-Charente. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The Charente towpath to Rochefort, 8 flat kilometres."history:"Tonnay-Charente's suspension bridge, opened in 1842 and 200 metres long, was one of Europe's largest when built; pedestrian-only since 1971, it gives the finest view over the quays where ships from the Americas once docked."tips:"Our two drivers serve Tonnay-Charente. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Biblioth%C3%A8que_municipale_de_Tonnay-Charente_%282%29.jpg/1920px-Biblioth%C3%A8que_municipale_de_Tonnay-Charente_%282%29.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/B%C3%A2timent_d%27habitation_%C3%A0_Tonnay-Charente.jpg/1920px-B%C3%A2timent_d%27habitation_%C3%A0_Tonnay-Charente.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/B%C3%A2timents_de_la_Croix-Rouge_%C3%A0_Tonnay-Charente.jpg/1920px-B%C3%A2timents_de_la_Croix-Rouge_%C3%A0_Tonnay-Charente.jpg"],
 },
 {
 slug:"ou-manger-a-tonnay-charente"category:"restaurant"dept:"17"name:"Où manger à Tonnay-Charente"city:"Tonnay-Charente"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Bistrots de quai, produits du fleuve et du marais."history:"Le pont suspendu de Tonnay-Charente, ouvert en 1842 et long de 200 mètres, était l'un des plus grands d'Europe à sa construction; réservé aux piétons depuis 1971, il offre la plus belle vue sur les quais où accostaient les navires venus d'Amérique."tips:"Nos deux chauffeurs desservent Tonnay-Charente. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Quayside bistros, river and marsh produce."history:"Tonnay-Charente's suspension bridge, opened in 1842 and 200 metres long, was one of Europe's largest when built; pedestrian-only since 1971, it gives the finest view over the quays where ships from the Americas once docked."tips:"Our two drivers serve Tonnay-Charente. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Centre_Richard1.jpg/1920px-Centre_Richard1.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Centre_Richard3.jpg/1920px-Centre_Richard3.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/17449-Tonnay-Charente-Sols.png/1920px-17449-Tonnay-Charente-Sols.png"],
 },
 {
 slug:"ou-dormir-a-tonnay-charente"category:"hotel"dept:"17"name:"Où dormir à Tonnay-Charente"city:"Tonnay-Charente"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 35 km de La Rochelle"en:"≈ 35 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles, nombreuses adresses à Rochefort à 10 minutes."history:"Le pont suspendu de Tonnay-Charente, ouvert en 1842 et long de 200 mètres, était l'un des plus grands d'Europe à sa construction; réservé aux piétons depuis 1971, il offre la plus belle vue sur les quais où accostaient les navires venus d'Amérique."tips:"Nos deux chauffeurs desservent Tonnay-Charente. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Two- and three-star hotels, plus many options in Rochefort ten minutes away."history:"Tonnay-Charente's suspension bridge, opened in 1842 and 200 metres long, was one of Europe's largest when built; pedestrian-only since 1971, it gives the finest view over the quays where ships from the Americas once docked."tips:"Our two drivers serve Tonnay-Charente. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/17449-Tonnay-Charente-argile.jpg/1920px-17449-Tonnay-Charente-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Arche_pont_suspendu_Tonnay-Charente.jpg/1920px-Arche_pont_suspendu_Tonnay-Charente.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Biblioth%C3%A8que_municipale_de_Tonnay-Charente_%282%29.jpg/1920px-Biblioth%C3%A8que_municipale_de_Tonnay-Charente_%282%29.jpg"],
 },
 {
 slug:"visiter-marans"category:"visite"dept:"17"name:"Visiter Marans"city:"Marans"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 25 km de La Rochelle"en:"≈ 25 km from La Rochelle" },
 ],
 fr: {
 teaser:"Port de plaisance, halle, écluse et maison de la Réserve naturelle."history:"Porte sud du Marais poitevin, Marans fut un port céréalier relié à la mer par un canal creusé au XIXᵉ siècle. La ville a donné son nom à la poule de Marans, réputée pour ses œufs roux extra-foncés."tips:"Nos deux chauffeurs desservent Marans. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The marina, the market hall, the lock and the nature reserve centre."history:"Southern gateway to the Marais Poitevin, Marans was a grain port linked to the sea by a 19th-century canal. The town gave its name to the Marans hen, famed for its very dark brown eggs."tips:"Our two drivers serve Marans. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/a/ab/004_St_Jean_de_Liversay_%28_17170_%29.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/17218-Marans-Sols.png/1920px-17218-Marans-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/17218-Marans-argile.jpg/1920px-17218-Marans-argile.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-marans"category:"randonnee"dept:"17"name:"Randonnées et balades à Marans"city:"Marans"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 25 km de La Rochelle"en:"≈ 25 km from La Rochelle" },
 ],
 fr: {
 teaser:"Balades en barque et sentiers du Marais poitevin, digues de la Sèvre Niortaise."history:"Porte sud du Marais poitevin, Marans fut un port céréalier relié à la mer par un canal creusé au XIXᵉ siècle. La ville a donné son nom à la poule de Marans, réputée pour ses œufs roux extra-foncés."tips:"Nos deux chauffeurs desservent Marans. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Punt trips and Marais Poitevin trails along the Sèvre Niortaise dykes."history:"Southern gateway to the Marais Poitevin, Marans was a grain port linked to the sea by a 19th-century canal. The town gave its name to the Marans hen, famed for its very dark brown eggs."tips:"Our two drivers serve Marans. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/255_-_Mairie_-_Andilly.jpg/1920px-255_-_Mairie_-_Andilly.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/332_-_Eglise_Notre-Dame_de_l%27Assomption_-_Marans.jpg/1920px-332_-_Eglise_Notre-Dame_de_l%27Assomption_-_Marans.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/334_-_Halle_du_march%C3%A9_-_Marans.jpg/1920px-334_-_Halle_du_march%C3%A9_-_Marans.jpg"],
 },
 {
 slug:"ou-manger-a-marans"category:"restaurant"dept:"17"name:"Où manger à Marans"city:"Marans"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 25 km de La Rochelle"en:"≈ 25 km from La Rochelle" },
 ],
 fr: {
 teaser:"Anguilles, mogettes, escargots et beurre AOP."history:"Porte sud du Marais poitevin, Marans fut un port céréalier relié à la mer par un canal creusé au XIXᵉ siècle. La ville a donné son nom à la poule de Marans, réputée pour ses œufs roux extra-foncés."tips:"Nos deux chauffeurs desservent Marans. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Eels, white beans, snails and PDO butter."history:"Southern gateway to the Marais Poitevin, Marans was a grain port linked to the sea by a 19th-century canal. The town gave its name to the Marans hen, famed for its very dark brown eggs."tips:"Our two drivers serve Marans. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/7/7a/Bb_blue.jpg""https://upload.wikimedia.org/wikipedia/commons/b/bb/Black222.JPG""https://upload.wikimedia.org/wikipedia/commons/a/ab/004_St_Jean_de_Liversay_%28_17170_%29.JPG"],
 },
 {
 slug:"ou-dormir-a-marans"category:"hotel"dept:"17"name:"Où dormir à Marans"city:"Marans"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 25 km de La Rochelle"en:"≈ 25 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes du marais, hôtels 3 étoiles à La Rochelle à 25 minutes."history:"Porte sud du Marais poitevin, Marans fut un port céréalier relié à la mer par un canal creusé au XIXᵉ siècle. La ville a donné son nom à la poule de Marans, réputée pour ses œufs roux extra-foncés."tips:"Nos deux chauffeurs desservent Marans. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Marsh guesthouses, three-star hotels in La Rochelle 25 minutes away."history:"Southern gateway to the Marais Poitevin, Marans was a grain port linked to the sea by a 19th-century canal. The town gave its name to the Marans hen, famed for its very dark brown eggs."tips:"Our two drivers serve Marans. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/17218-Marans-Sols.png/1920px-17218-Marans-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/17218-Marans-argile.jpg/1920px-17218-Marans-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/255_-_Mairie_-_Andilly.jpg/1920px-255_-_Mairie_-_Andilly.jpg"],
 },
 {
 slug:"visiter-esnandes"category:"visite"dept:"17"name:"Visiter Esnandes"city:"Esnandes"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Église fortifiée Saint-Martin, maison de la Mytiliculture, baie de l'Aiguillon."history:"Esnandes possède une étonnante église-forteresse du XIVᵉ siècle, crénelée comme un donjon face à la baie de l'Aiguillon. C'est aussi le berceau de la mytiliculture sur bouchots, technique née ici au XIIIᵉ siècle selon la tradition."tips:"Nos deux chauffeurs desservent Esnandes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The fortified church of Saint-Martin, the mussel-farming centre and Aiguillon bay."history:"Esnandes has a startling 14th-century fortress church, battlemented like a keep and facing the Aiguillon bay. It is also the cradle of bouchot mussel farming, said to have begun here in the 13th century."tips:"Our two drivers serve Esnandes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/057_-_Eglise_Saint-Martin_-_Villedoux.jpg/1920px-057_-_Eglise_Saint-Martin_-_Villedoux.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/17153-Esnandes-Sols.png/1920px-17153-Esnandes-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/17153-Esnandes-argile.jpg/1920px-17153-Esnandes-argile.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-esnandes"category:"randonnee"dept:"17"name:"Randonnées et balades à Esnandes"city:"Esnandes"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier de la baie vers la pointe Saint-Clément, falaises et réserve d'oiseaux."history:"Esnandes possède une étonnante église-forteresse du XIVᵉ siècle, crénelée comme un donjon face à la baie de l'Aiguillon. C'est aussi le berceau de la mytiliculture sur bouchots, technique née ici au XIIIᵉ siècle selon la tradition."tips:"Nos deux chauffeurs desservent Esnandes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The bay path to Pointe Saint-Clément, with cliffs and a bird reserve."history:"Esnandes has a startling 14th-century fortress church, battlemented like a keep and facing the Aiguillon bay. It is also the cradle of bouchot mussel farming, said to have begun here in the 13th century."tips:"Our two drivers serve Esnandes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/190_-_Eglise_Saint-Martin_-_Esnandes.jpg/1920px-190_-_Eglise_Saint-Martin_-_Esnandes.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/267_-_Eglise_Saint-Martin_-_Esnandes.jpg/1920px-267_-_Eglise_Saint-Martin_-_Esnandes.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/269_-_Eglise_Saint-Martin_nef_-_Esnandes.jpg/1920px-269_-_Eglise_Saint-Martin_nef_-_Esnandes.jpg"],
 },
 {
 slug:"ou-manger-a-esnandes"category:"restaurant"dept:"17"name:"Où manger à Esnandes"city:"Esnandes"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Moules de bouchot de la baie, éclade et mouclade."history:"Esnandes possède une étonnante église-forteresse du XIVᵉ siècle, crénelée comme un donjon face à la baie de l'Aiguillon. C'est aussi le berceau de la mytiliculture sur bouchots, technique née ici au XIIIᵉ siècle selon la tradition."tips:"Nos deux chauffeurs desservent Esnandes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Bouchot mussels from the bay, éclade and mouclade."history:"Esnandes has a startling 14th-century fortress church, battlemented like a keep and facing the Aiguillon bay. It is also the cradle of bouchot mussel farming, said to have begun here in the 13th century."tips:"Our two drivers serve Esnandes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Brosen_windrose-fr.svg/1920px-Brosen_windrose-fr.svg.png""https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Carrelets_esnandes.jpg/1920px-Carrelets_esnandes.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/057_-_Eglise_Saint-Martin_-_Villedoux.jpg/1920px-057_-_Eglise_Saint-Martin_-_Villedoux.jpg"],
 },
 {
 slug:"ou-dormir-a-esnandes"category:"hotel"dept:"17"name:"Où dormir à Esnandes"city:"Esnandes"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Aunis"en:"Area: Aunis" },
 { fr:"≈ 15 km de La Rochelle"en:"≈ 15 km from La Rochelle" },
 ],
 fr: {
 teaser:"Chambres d'hôtes, hôtels 3 et 4 étoiles à La Rochelle tout proche."history:"Esnandes possède une étonnante église-forteresse du XIVᵉ siècle, crénelée comme un donjon face à la baie de l'Aiguillon. C'est aussi le berceau de la mytiliculture sur bouchots, technique née ici au XIIIᵉ siècle selon la tradition."tips:"Nos deux chauffeurs desservent Esnandes. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Guesthouses, three- and four-star hotels in nearby La Rochelle."history:"Esnandes has a startling 14th-century fortress church, battlemented like a keep and facing the Aiguillon bay. It is also the cradle of bouchot mussel farming, said to have begun here in the 13th century."tips:"Our two drivers serve Esnandes. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/17153-Esnandes-Sols.png/1920px-17153-Esnandes-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/17153-Esnandes-argile.jpg/1920px-17153-Esnandes-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/190_-_Eglise_Saint-Martin_-_Esnandes.jpg/1920px-190_-_Eglise_Saint-Martin_-_Esnandes.jpg"],
 },
 {
 slug:"visiter-saujon"category:"visite"dept:"17"name:"Visiter Saujon"city:"Saujon"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Thermes, train des Mouettes, église et halles du centre."history:"Saujon est une station thermale spécialisée depuis 1860 dans le traitement des troubles anxieux, unique en France par sa spécialité psychiatrique. Le train des Mouettes, ligne à vapeur de 1875, relie encore la ville à La Tremblade l'été."tips:"Nos deux chauffeurs desservent Saujon. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The spa, the Train des Mouettes, the church and the covered market."history:"Saujon has been a spa town since 1860, unique in France for treating anxiety disorders. The Train des Mouettes, an 1875 steam line, still links the town to La Tremblade in summer."tips:"Our two drivers serve Saujon. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/17421-Saujon-Sols.png/1920px-17421-Saujon-Sols.png""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/17421-Saujon-argile.jpg/1920px-17421-Saujon-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/1/14/Catastrophe_de_Saujon_%281910%29.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-saujon"category:"randonnee"dept:"17"name:"Randonnées et balades à Saujon"city:"Saujon"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentiers de la Seudre et marais de Saujon, départ du chemin vers Mornac."history:"Saujon est une station thermale spécialisée depuis 1860 dans le traitement des troubles anxieux, unique en France par sa spécialité psychiatrique. Le train des Mouettes, ligne à vapeur de 1875, relie encore la ville à La Tremblade l'été."tips:"Nos deux chauffeurs desservent Saujon. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Seudre paths and Saujon marshes, start of the trail to Mornac."history:"Saujon has been a spa town since 1860, unique in France for treating anxiety disorders. The Train des Mouettes, an 1875 steam line, still links the town to La Tremblade in summer."tips:"Our two drivers serve Saujon. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/5/5c/Champaigne_portrait_richelieu_eb.jpg""https://upload.wikimedia.org/wikipedia/commons/5/58/Eglise_de_saujon.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Eglise_du_Chay.jpeg/1920px-Eglise_du_Chay.jpeg"],
 },
 {
 slug:"ou-manger-a-saujon"category:"restaurant"dept:"17"name:"Où manger à Saujon"city:"Saujon"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Cuisine thermale et produits de la Seudre, huîtres et poissons."history:"Saujon est une station thermale spécialisée depuis 1860 dans le traitement des troubles anxieux, unique en France par sa spécialité psychiatrique. Le train des Mouettes, ligne à vapeur de 1875, relie encore la ville à La Tremblade l'été."tips:"Nos deux chauffeurs desservent Saujon. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Spa-town cooking and Seudre produce, oysters and fish."history:"Saujon has been a spa town since 1860, unique in France for treating anxiety disorders. The Train des Mouettes, an 1875 steam line, still links the town to La Tremblade in summer."tips:"Our two drivers serve Saujon. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Espace_culturel_du_Ch%C3%A2teau.jpg/1920px-Espace_culturel_du_Ch%C3%A2teau.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/La_Seudre_%C3%A0_Saujon.jpg/1920px-La_Seudre_%C3%A0_Saujon.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/17421-Saujon-Sols.png/1920px-17421-Saujon-Sols.png"],
 },
 {
 slug:"ou-dormir-a-saujon"category:"hotel"dept:"17"name:"Où dormir à Saujon"city:"Saujon"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Bassin de la Seudre"en:"Area: Bassin de la Seudre" },
 { fr:"≈ 95 km de La Rochelle"en:"≈ 95 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles et résidences thermales, adresses 4 étoiles à Royan."history:"Saujon est une station thermale spécialisée depuis 1860 dans le traitement des troubles anxieux, unique en France par sa spécialité psychiatrique. Le train des Mouettes, ligne à vapeur de 1875, relie encore la ville à La Tremblade l'été."tips:"Nos deux chauffeurs desservent Saujon. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels and spa residences, four-star options in Royan."history:"Saujon has been a spa town since 1860, unique in France for treating anxiety disorders. The Train des Mouettes, an 1875 steam line, still links the town to La Tremblade in summer."tips:"Our two drivers serve Saujon. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/17421-Saujon-argile.jpg/1920px-17421-Saujon-argile.jpg""https://upload.wikimedia.org/wikipedia/commons/1/14/Catastrophe_de_Saujon_%281910%29.jpg""https://upload.wikimedia.org/wikipedia/commons/5/5c/Champaigne_portrait_richelieu_eb.jpg"],
 },
 {
 slug:"visiter-charron-marais-poitevin"category:"visite"dept:"17"name:"Visiter Charron / Marais poitevin"city:"Charron / Marais poitevin"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Canaux et embarcadères, digues de la Sèvre, réserve naturelle de la baie de l'Aiguillon."history:"Le Marais poitevin, deuxième zone humide de France, a été asséché à partir du XIIIᵉ siècle par des moines venus des abbayes voisines. Sa partie sud, en Charente-Maritime, mêle canaux, digues et prairies inondables jusqu'à la baie de l'Aiguillon."tips:"Nos deux chauffeurs desservent Charron / Marais poitevin. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Canals and boat landings, the Sèvre dykes and the Aiguillon bay nature reserve."history:"The Marais Poitevin, France's second largest wetland, was drained from the 13th century by monks from nearby abbeys. Its southern, Charente-Maritime part mixes canals, dykes and flood meadows down to Aiguillon bay."tips:"Our two drivers serve Charron / Marais poitevin. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Am%C3%A9nagement_de_la_S%C3%A8vre_Niortaise_et_du_Marais_Poitevin_en_1818_par_Mesnager.jpg/1920px-Am%C3%A9nagement_de_la_S%C3%A8vre_Niortaise_et_du_Marais_Poitevin_en_1818_par_Mesnager.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Chaill%C3%A9_les_Marais_Canal_du_Clain.jpg/1920px-Chaill%C3%A9_les_Marais_Canal_du_Clain.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Chaolaises_dans_le_Marais_poitevin_dess%C3%A9ch%C3%A9_%C3%A0_Esnandes.jpg/1920px-Chaolaises_dans_le_Marais_poitevin_dess%C3%A9ch%C3%A9_%C3%A0_Esnandes.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-charron-marais-poitevin"category:"randonnee"dept:"17"name:"Randonnées et balades à Charron / Marais poitevin"city:"Charron / Marais poitevin"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Boucles plates de 5 à 15 km entre frênes têtards et canaux, idéales en famille."history:"Le Marais poitevin, deuxième zone humide de France, a été asséché à partir du XIIIᵉ siècle par des moines venus des abbayes voisines. Sa partie sud, en Charente-Maritime, mêle canaux, digues et prairies inondables jusqu'à la baie de l'Aiguillon."tips:"Nos deux chauffeurs desservent Charron / Marais poitevin. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Flat 5-to-15 km loops between pollarded ash trees and canals, ideal with children."history:"The Marais Poitevin, France's second largest wetland, was drained from the 13th century by monks from nearby abbeys. Its southern, Charente-Maritime part mixes canals, dykes and flood meadows down to Aiguillon bay."tips:"Our two drivers serve Charron / Marais poitevin. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Communal_de_Lairoux_%28vue_5%2C_%C3%89duarel%2C_11_avril_2016%29.JPG/1920px-Communal_de_Lairoux_%28vue_5%2C_%C3%89duarel%2C_11_avril_2016%29.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Conche_des_cabanes_-_20150810_14h26_%2811048%29.jpg/1920px-Conche_des_cabanes_-_20150810_14h26_%2811048%29.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Coulon-Promenade_en_barque.JPG/1920px-Coulon-Promenade_en_barque.JPG"],
 },
 {
 slug:"ou-manger-a-charron-marais-poitevin"category:"restaurant"dept:"17"name:"Où manger à Charron / Marais poitevin"city:"Charron / Marais poitevin"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Anguilles, escargots, mogettes et fromages de chèvre du marais."history:"Le Marais poitevin, deuxième zone humide de France, a été asséché à partir du XIIIᵉ siècle par des moines venus des abbayes voisines. Sa partie sud, en Charente-Maritime, mêle canaux, digues et prairies inondables jusqu'à la baie de l'Aiguillon."tips:"Nos deux chauffeurs desservent Charron / Marais poitevin. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Eels, snails, white beans and marsh goat cheese."history:"The Marais Poitevin, France's second largest wetland, was drained from the 13th century by monks from nearby abbeys. Its southern, Charente-Maritime part mixes canals, dykes and flood meadows down to Aiguillon bay."tips:"Our two drivers serve Charron / Marais poitevin. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Coulon-Quai_Louis_Tardy.JPG/1920px-Coulon-Quai_Louis_Tardy.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Damvix_le_port_02.jpg/1920px-Damvix_le_port_02.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Am%C3%A9nagement_de_la_S%C3%A8vre_Niortaise_et_du_Marais_Poitevin_en_1818_par_Mesnager.jpg/1920px-Am%C3%A9nagement_de_la_S%C3%A8vre_Niortaise_et_du_Marais_Poitevin_en_1818_par_Mesnager.jpg"],
 },
 {
 slug:"ou-dormir-a-charron-marais-poitevin"category:"hotel"dept:"17"name:"Où dormir à Charron / Marais poitevin"city:"Charron / Marais poitevin"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Marais poitevin"en:"Area: Marais poitevin" },
 { fr:"≈ 30 km de La Rochelle"en:"≈ 30 km from La Rochelle" },
 ],
 fr: {
 teaser:"Gîtes et chambres d'hôtes dans les fermes du marais."history:"Le Marais poitevin, deuxième zone humide de France, a été asséché à partir du XIIIᵉ siècle par des moines venus des abbayes voisines. Sa partie sud, en Charente-Maritime, mêle canaux, digues et prairies inondables jusqu'à la baie de l'Aiguillon."tips:"Nos deux chauffeurs desservent Charron / Marais poitevin. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Gîtes and guesthouses in marsh farmhouses."history:"The Marais Poitevin, France's second largest wetland, was drained from the 13th century by monks from nearby abbeys. Its southern, Charente-Maritime part mixes canals, dykes and flood meadows down to Aiguillon bay."tips:"Our two drivers serve Charron / Marais poitevin. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Chaill%C3%A9_les_Marais_Canal_du_Clain.jpg/1920px-Chaill%C3%A9_les_Marais_Canal_du_Clain.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Chaolaises_dans_le_Marais_poitevin_dess%C3%A9ch%C3%A9_%C3%A0_Esnandes.jpg/1920px-Chaolaises_dans_le_Marais_poitevin_dess%C3%A9ch%C3%A9_%C3%A0_Esnandes.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Communal_de_Lairoux_%28vue_5%2C_%C3%89duarel%2C_11_avril_2016%29.JPG/1920px-Communal_de_Lairoux_%28vue_5%2C_%C3%89duarel%2C_11_avril_2016%29.JPG"],
 },
 {
 slug:"visiter-les-mathes-la-palmyre"category:"visite"dept:"17"name:"Visiter Les Mathes / La Palmyre"city:"Les Mathes / La Palmyre"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Côte sauvage"en:"Area: Côte sauvage" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Zoo de La Palmyre, port de plaisance, plages de la Côte sauvage."history:"La Palmyre est née dans les années 1960 au milieu des dunes boisées; son zoo, ouvert en 1966, est l'un des plus visités de France avec 1 600 animaux sur 18 hectares de pinède."tips:"Nos deux chauffeurs desservent Les Mathes / La Palmyre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"La Palmyre zoo, the marina and the Côte Sauvage beaches."history:"La Palmyre grew up in the 1960s among wooded dunes; its zoo, opened in 1966, is one of France's most visited with 1,600 animals across 18 hectares of pine forest."tips:"Our two drivers serve Les Mathes / La Palmyre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/b/bf/Bonne-Anse.jpg""https://upload.wikimedia.org/wikipedia/commons/1/1c/Bonne_Anse.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Cascade_zoo_palmyre.jpg/1920px-Cascade_zoo_palmyre.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-les-mathes-la-palmyre"category:"randonnee"dept:"17"name:"Randonnées et balades à Les Mathes / La Palmyre"city:"Les Mathes / La Palmyre"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Côte sauvage"en:"Area: Côte sauvage" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Pistes cyclables et sentiers de dunes vers le phare de la Coubre."history:"La Palmyre est née dans les années 1960 au milieu des dunes boisées; son zoo, ouvert en 1966, est l'un des plus visités de France avec 1 600 animaux sur 18 hectares de pinède."tips:"Nos deux chauffeurs desservent Les Mathes / La Palmyre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Cycle tracks and dune paths towards the Coubre lighthouse."history:"La Palmyre grew up in the 1960s among wooded dunes; its zoo, opened in 1966, is one of France's most visited with 1,600 animals across 18 hectares of pine forest."tips:"Our two drivers serve Les Mathes / La Palmyre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/EuroVelo1_dans_la_for%C3%AAt_de_la_Coubre.JPG/1920px-EuroVelo1_dans_la_for%C3%AAt_de_la_Coubre.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Heinkel_He_111_during_the_Battle_of_Britain.jpg/1920px-Heinkel_He_111_during_the_Battle_of_Britain.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/LPLM11.jpg/1920px-LPLM11.jpg"],
 },
 {
 slug:"ou-manger-a-les-mathes-la-palmyre"category:"restaurant"dept:"17"name:"Où manger à Les Mathes / La Palmyre"city:"Les Mathes / La Palmyre"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Côte sauvage"en:"Area: Côte sauvage" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Restaurants de plage et de port, moules-frites et fruits de mer."history:"La Palmyre est née dans les années 1960 au milieu des dunes boisées; son zoo, ouvert en 1966, est l'un des plus visités de France avec 1 600 animaux sur 18 hectares de pinède."tips:"Nos deux chauffeurs desservent Les Mathes / La Palmyre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Beach and harbour restaurants, moules-frites and seafood."history:"La Palmyre grew up in the 1960s among wooded dunes; its zoo, opened in 1966, is one of France's most visited with 1,600 animals across 18 hectares of pine forest."tips:"Our two drivers serve Les Mathes / La Palmyre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/LPLM2.jpg/1920px-LPLM2.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/LPLM4.jpg/1920px-LPLM4.jpg""https://upload.wikimedia.org/wikipedia/commons/b/bf/Bonne-Anse.jpg"],
 },
 {
 slug:"ou-dormir-a-les-mathes-la-palmyre"category:"hotel"dept:"17"name:"Où dormir à Les Mathes / La Palmyre"city:"Les Mathes / La Palmyre"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Côte sauvage"en:"Area: Côte sauvage" },
 { fr:"≈ 105 km de La Rochelle"en:"≈ 105 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 3 étoiles sous les pins, résidences et campings familiaux."history:"La Palmyre est née dans les années 1960 au milieu des dunes boisées; son zoo, ouvert en 1966, est l'un des plus visités de France avec 1 600 animaux sur 18 hectares de pinède."tips:"Nos deux chauffeurs desservent Les Mathes / La Palmyre. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Three-star hotels under the pines, residences and family campsites."history:"La Palmyre grew up in the 1960s among wooded dunes; its zoo, opened in 1966, is one of France's most visited with 1,600 animals across 18 hectares of pine forest."tips:"Our two drivers serve Les Mathes / La Palmyre. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/1/1c/Bonne_Anse.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Cascade_zoo_palmyre.jpg/1920px-Cascade_zoo_palmyre.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/EuroVelo1_dans_la_for%C3%AAt_de_la_Coubre.JPG/1920px-EuroVelo1_dans_la_for%C3%AAt_de_la_Coubre.JPG"],
 },
 {
 slug:"visiter-bourcefranc-le-chapus"category:"visite"dept:"17"name:"Visiter Bourcefranc-le-Chapus"city:"Bourcefranc-le-Chapus"facts: [
 { fr:"Monument & patrimoine"en:"Landmarks & heritage" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Fort Louvois, viaduc d'Oléron, port ostréicole du Chapus."history:"Bâti entre 1691 et 1694 sur un banc rocheux, le fort Louvois complétait la citadelle d'Oléron pour verrouiller le pertuis. On y accède à pied à marée basse par une chaussée de 400 mètres, en bateau à marée haute."tips:"Nos deux chauffeurs desservent Bourcefranc-le-Chapus. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Fort Louvois, the Oléron bridge and the Chapus oyster harbour."history:"Built between 1691 and 1694 on a rocky bank, Fort Louvois completed Oléron's citadel to lock the strait. It is reached on foot at low tide by a 400-metre causeway, by boat at high tide."tips:"Our two drivers serve Bourcefranc-le-Chapus. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Fort_Louvois-1107.jpg/1920px-Fort_Louvois-1107.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Fort_Louvois_-_Bourcefranc.jpg/1920px-Fort_Louvois_-_Bourcefranc.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Fort_Louvois_-_Bourcefranc_Le_Chapus.jpg/1920px-Fort_Louvois_-_Bourcefranc_Le_Chapus.jpg"],
 },
 {
 slug:"randonnees-et-balades-a-bourcefranc-le-chapus"category:"randonnee"dept:"17"name:"Randonnées et balades à Bourcefranc-le-Chapus"city:"Bourcefranc-le-Chapus"facts: [
 { fr:"Balade nature"en:"Nature walk" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Sentier littoral du Chapus vers Marennes, entre parcs à huîtres et vasières."history:"Bâti entre 1691 et 1694 sur un banc rocheux, le fort Louvois complétait la citadelle d'Oléron pour verrouiller le pertuis. On y accède à pied à marée basse par une chaussée de 400 mètres, en bateau à marée haute."tips:"Nos deux chauffeurs desservent Bourcefranc-le-Chapus. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"The coastal path from Le Chapus to Marennes, past oyster beds and mudflats."history:"Built between 1691 and 1694 on a rocky bank, Fort Louvois completed Oléron's citadel to lock the strait. It is reached on foot at low tide by a 400-metre causeway, by boat at high tide."tips:"Our two drivers serve Bourcefranc-le-Chapus. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Fort_Louvois_-_Gu%C3%A9rite.JPG/1920px-Fort_Louvois_-_Gu%C3%A9rite.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Fort_Louvois_-_Logement.JPG/1920px-Fort_Louvois_-_Logement.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Fort_Louvois_-_Panorama1.jpg/1920px-Fort_Louvois_-_Panorama1.jpg"],
 },
 {
 slug:"ou-manger-a-bourcefranc-le-chapus"category:"restaurant"dept:"17"name:"Où manger à Bourcefranc-le-Chapus"city:"Bourcefranc-le-Chapus"facts: [
 { fr:"Tables & spécialités"en:"Tables & specialities" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Cabanes à huîtres du Chapus, crevettes et bulots."history:"Bâti entre 1691 et 1694 sur un banc rocheux, le fort Louvois complétait la citadelle d'Oléron pour verrouiller le pertuis. On y accède à pied à marée basse par une chaussée de 400 mètres, en bateau à marée haute."tips:"Nos deux chauffeurs desservent Bourcefranc-le-Chapus. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Chapus oyster huts, shrimp and whelks."history:"Built between 1691 and 1694 on a rocky bank, Fort Louvois completed Oléron's citadel to lock the strait. It is reached on foot at low tide by a 400-metre causeway, by boat at high tide."tips:"Our two drivers serve Bourcefranc-le-Chapus. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Fort_Louvois_-_Tour.JPG/1920px-Fort_Louvois_-_Tour.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Fort_Louvois_-_Tour_02.JPG/1920px-Fort_Louvois_-_Tour_02.JPG""https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Fort_Louvois-1107.jpg/1920px-Fort_Louvois-1107.jpg"],
 },
 {
 slug:"ou-dormir-a-bourcefranc-le-chapus"category:"hotel"dept:"17"name:"Où dormir à Bourcefranc-le-Chapus"city:"Bourcefranc-le-Chapus"facts: [
 { fr:"Hôtels & classement"en:"Hotels & star ratings" },
 { fr:"Secteur: Bassin de Marennes"en:"Area: Bassin de Marennes" },
 { fr:"≈ 70 km de La Rochelle"en:"≈ 70 km from La Rochelle" },
 ],
 fr: {
 teaser:"Hôtels 2 et 3 étoiles à Bourcefranc et Marennes."history:"Bâti entre 1691 et 1694 sur un banc rocheux, le fort Louvois complétait la citadelle d'Oléron pour verrouiller le pertuis. On y accède à pied à marée basse par une chaussée de 400 mètres, en bateau à marée haute."tips:"Nos deux chauffeurs desservent Bourcefranc-le-Chapus. Dépose au plus près du site, van jusqu'à 7 personnes pour les groupes, sièges bébé et rehausseurs enfants sur demande."},
 en: {
 teaser:"Two- and three-star hotels in Bourcefranc and Marennes."history:"Built between 1691 and 1694 on a rocky bank, Fort Louvois completed Oléron's citadel to lock the strait. It is reached on foot at low tide by a 400-metre causeway, by boat at high tide."tips:"Our two drivers serve Bourcefranc-le-Chapus. Door-to-door drop-off, a van seating up to 7 for groups, baby and booster seats on request."},
 photos: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Fort_Louvois_-_Bourcefranc.jpg/1920px-Fort_Louvois_-_Bourcefranc.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Fort_Louvois_-_Bourcefranc_Le_Chapus.jpg/1920px-Fort_Louvois_-_Bourcefranc_Le_Chapus.jpg""https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Fort_Louvois_-_Gu%C3%A9rite.JPG/1920px-Fort_Louvois_-_Gu%C3%A9rite.JPG"],
 },

 {
 slug:"hotel-du-port-la-rochelle"category:"hotel"dept:"17"name:"Hôtel du Port"city:"La Rochelle"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-la-rochelle"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"La Rochelle"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-la-rochelle"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"La Rochelle"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-la-rochelle"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"La Rochelle"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-la-rochelle"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"La Rochelle"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-la-rochelle"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"La Rochelle"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-la-rochelle"category:"visite"dept:"17"name:"Église et centre historique"city:"La Rochelle"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à La Rochelle, une adresse représentative du charme de la Charente-Maritime."history:"La Rochelle, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in La Rochelle, a fine example of Charente-Maritime's coastal charm."history:"La Rochelle, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Vieux_Port_de_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tour_de_la_Lanterne_La_Rochelle.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_de_ville_de_La_Rochelle.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-rochefort"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Rochefort"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-rochefort"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Rochefort"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-rochefort"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Rochefort"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-rochefort"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Rochefort"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-rochefort"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Rochefort"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-rochefort"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Rochefort"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-rochefort"category:"visite"dept:"17"name:"Église et centre historique"city:"Rochefort"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Rochefort, une adresse représentative du charme de la Charente-Maritime."history:"Rochefort, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Rochefort, a fine example of Charente-Maritime's coastal charm."history:"Rochefort, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Corderie_royale_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_transbordeur_de_Rochefort.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hermione_Rochefort.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-royan"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Royan"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-royan"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Royan"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-royan"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Royan"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-royan"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Royan"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-royan"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Royan"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-royan"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Royan"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-royan"category:"visite"dept:"17"name:"Église et centre historique"city:"Royan"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Royan, une adresse représentative du charme de la Charente-Maritime."history:"Royan, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Royan, a fine example of Charente-Maritime's coastal charm."history:"Royan, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Front_de_mer_de_Royan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_central_de_Royan.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saintes"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saintes"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saintes"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saintes"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saintes"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saintes"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saintes"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saintes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saintes"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saintes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saintes"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saintes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saintes"category:"visite"dept:"17"name:"Église et centre historique"city:"Saintes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saintes, une adresse représentative du charme de la Charente-Maritime."history:"Saintes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saintes, a fine example of Charente-Maritime's coastal charm."history:"Saintes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Arc_de_Germanicus_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_aux_Dames_Saintes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Amphitheatre_gallo-romain_de_Saintes.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-jean-d-angely"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Jean-d'Angély"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-jean-d-angely"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Jean-d'Angély"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-jean-d-angely"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Jean-d'Angély"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-jean-d-angely"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-jean-d-angely"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-jean-d-angely"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-jean-d-angely"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Jean-d'Angély"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Jean-d'Angély, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Jean-d'Angély, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Jean-d'Angély, a fine example of Charente-Maritime's coastal charm."history:"Saint-Jean-d'Angély, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Abbaye_de_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Tours_de_l_abbaye_Saint-Jean-d_Angely.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Saint-Jean-d_Angely.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-jonzac"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Jonzac"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-jonzac"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Jonzac"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-jonzac"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Jonzac"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-jonzac"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Jonzac"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-jonzac"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Jonzac"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-jonzac"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Jonzac"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-jonzac"category:"visite"dept:"17"name:"Église et centre historique"city:"Jonzac"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Jonzac, une adresse représentative du charme de la Charente-Maritime."history:"Jonzac, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Jonzac, a fine example of Charente-Maritime's coastal charm."history:"Jonzac, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Thermes_de_Jonzac.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Jonzac.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-marennes"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Marennes"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-marennes"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Marennes"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-marennes"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Marennes"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-marennes"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Marennes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-marennes"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Marennes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-marennes"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Marennes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-marennes"category:"visite"dept:"17"name:"Église et centre historique"city:"Marennes"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Marennes, une adresse représentative du charme de la Charente-Maritime."history:"Marennes, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Marennes, a fine example of Charente-Maritime's coastal charm."history:"Marennes, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-de-Sales_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Cayenne_Marennes.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_Marennes.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-martin-de-re"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Martin-de-Ré"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-martin-de-re"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Martin-de-Ré"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-martin-de-re"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Martin-de-Ré"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-martin-de-re"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-martin-de-re"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-martin-de-re"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-martin-de-re"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Martin-de-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Martin-de-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Martin-de-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Martin-de-Ré, a fine example of Charente-Maritime's coastal charm."history:"Saint-Martin-de-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_de_Saint-Martin-de-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Remparts_de_Saint-Martin-de-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-ars-en-re"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Ars-en-Ré"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-ars-en-re"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Ars-en-Ré"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-ars-en-re"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Ars-en-Ré"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-ars-en-re"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Ars-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-ars-en-re"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Ars-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-ars-en-re"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Ars-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-ars-en-re"category:"visite"dept:"17"name:"Église et centre historique"city:"Ars-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Ars-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Ars-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Ars-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Ars-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Clocher_noir_et_blanc_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Ars-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Village_d_Ars-en-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-la-flotte"category:"hotel"dept:"17"name:"Hôtel du Port"city:"La Flotte"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-la-flotte"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"La Flotte"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-la-flotte"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"La Flotte"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-la-flotte"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"La Flotte"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-la-flotte"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"La Flotte"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-la-flotte"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"La Flotte"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-la-flotte"category:"visite"dept:"17"name:"Église et centre historique"city:"La Flotte"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à La Flotte, une adresse représentative du charme de la Charente-Maritime."history:"La Flotte, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in La Flotte, a fine example of Charente-Maritime's coastal charm."history:"La Flotte, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_La_Flotte.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Flotte.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-le-bois-plage-en-re"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Le Bois-Plage-en-Ré"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-le-bois-plage-en-re"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Le Bois-Plage-en-Ré"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-le-bois-plage-en-re"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Le Bois-Plage-en-Ré"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-le-bois-plage-en-re"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Le Bois-Plage-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-le-bois-plage-en-re"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Le Bois-Plage-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-le-bois-plage-en-re"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Le Bois-Plage-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-le-bois-plage-en-re"category:"visite"dept:"17"name:"Église et centre historique"city:"Le Bois-Plage-en-Ré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Le Bois-Plage-en-Ré, une adresse représentative du charme de la Charente-Maritime."history:"Le Bois-Plage-en-Ré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Le Bois-Plage-en-Ré, a fine example of Charente-Maritime's coastal charm."history:"Le Bois-Plage-en-Ré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_du_Bois-Plage-en-Re.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_du_Bois-Plage-en-Re.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-pierre-d-oleron"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Pierre-d'Oléron"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-pierre-d-oleron"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Pierre-d'Oléron"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-pierre-d-oleron"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Pierre-d'Oléron"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-pierre-d-oleron"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-pierre-d-oleron"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-pierre-d-oleron"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-pierre-d-oleron"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Pierre-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Pierre-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Pierre-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Pierre-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Saint-Pierre-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marche_de_Saint-Pierre-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Maison_des_Aieules_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-le-chateau-d-oleron"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Le Château-d'Oléron"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-le-chateau-d-oleron"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Le Château-d'Oléron"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-le-chateau-d-oleron"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Le Château-d'Oléron"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-le-chateau-d-oleron"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Le Château-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-le-chateau-d-oleron"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Le Château-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-le-chateau-d-oleron"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Le Château-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-le-chateau-d-oleron"category:"visite"dept:"17"name:"Église et centre historique"city:"Le Château-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Le Château-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Le Château-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Le Château-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Le Château-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Citadelle_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_du_Chateau-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_du_Chateau-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-trojan-les-bains"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Trojan-les-Bains"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-trojan-les-bains"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Trojan-les-Bains"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-trojan-les-bains"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Trojan-les-Bains"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-trojan-les-bains"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-trojan-les-bains"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-trojan-les-bains"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-trojan-les-bains"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Trojan-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Trojan-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Trojan-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Trojan-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Saint-Trojan-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Petit_train_de_Saint-Trojan.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Trojan-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_Saint-Trojan.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-fouras"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Fouras"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-fouras"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Fouras"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-fouras"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Fouras"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-fouras"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Fouras"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-fouras"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Fouras"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-fouras"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Fouras"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-fouras"category:"visite"dept:"17"name:"Église et centre historique"city:"Fouras"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Fouras, une adresse représentative du charme de la Charente-Maritime."history:"Fouras, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Fouras, a fine example of Charente-Maritime's coastal charm."history:"Fouras, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Vauban_de_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pointe_de_la_Fumee_Fouras.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Fouras.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-chatelaillon-plage"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Châtelaillon-Plage"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-chatelaillon-plage"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Châtelaillon-Plage"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-chatelaillon-plage"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Châtelaillon-Plage"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-chatelaillon-plage"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Châtelaillon-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-chatelaillon-plage"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Châtelaillon-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-chatelaillon-plage"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Châtelaillon-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-chatelaillon-plage"category:"visite"dept:"17"name:"Église et centre historique"city:"Châtelaillon-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Châtelaillon-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Châtelaillon-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Châtelaillon-Plage, a fine example of Charente-Maritime's coastal charm."history:"Châtelaillon-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_La_grande_plage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chatelaillon-Plage_Rathaus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Casino_de_Chatelaillon-Plage.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-surgeres"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Surgères"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-surgeres"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Surgères"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-surgeres"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Surgères"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-surgeres"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Surgères"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-surgeres"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Surgères"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-surgeres"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Surgères"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-surgeres"category:"visite"dept:"17"name:"Église et centre historique"city:"Surgères"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Surgères, une adresse représentative du charme de la Charente-Maritime."history:"Surgères, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Surgères, a fine example of Charente-Maritime's coastal charm."history:"Surgères, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Notre-Dame_de_Surgeres.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halles_de_Surgeres.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-pons"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Pons"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-pons"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Pons"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-pons"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Pons"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-pons"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Pons"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-pons"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Pons"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-pons"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Pons"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-pons"category:"visite"dept:"17"name:"Église et centre historique"city:"Pons"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Pons, une adresse représentative du charme de la Charente-Maritime."history:"Pons, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Pons, a fine example of Charente-Maritime's coastal charm."history:"Pons, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Donjon_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Hopital_des_pelerins_de_Pons.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Vivien_de_Pons.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-talmont-sur-gironde"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Talmont-sur-Gironde"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-talmont-sur-gironde"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Talmont-sur-Gironde"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-talmont-sur-gironde"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Talmont-sur-Gironde"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-talmont-sur-gironde"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Talmont-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-talmont-sur-gironde"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Talmont-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-talmont-sur-gironde"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Talmont-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-talmont-sur-gironde"category:"visite"dept:"17"name:"Église et centre historique"city:"Talmont-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Talmont-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Talmont-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Talmont-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Talmont-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Talmont_17_Eglise_remparts_2013.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_facade_NNW.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Talmont-sur-Gironde_17_Eglise_chevet_2013.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-brouage"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Brouage"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-brouage"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Brouage"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-brouage"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Brouage"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-brouage"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Brouage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-brouage"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Brouage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-brouage"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Brouage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-brouage"category:"visite"dept:"17"name:"Église et centre historique"city:"Brouage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Brouage, une adresse représentative du charme de la Charente-Maritime."history:"Brouage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Brouage, a fine example of Charente-Maritime's coastal charm."history:"Brouage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Brouage-Remparts.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/969_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/972_-_Rempart_de_la_citadelle_-_Brouage.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-georges-de-didonne"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Georges-de-Didonne"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-georges-de-didonne"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Georges-de-Didonne"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-georges-de-didonne"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Georges-de-Didonne"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-georges-de-didonne"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-georges-de-didonne"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-georges-de-didonne"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-georges-de-didonne"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Georges-de-Didonne"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Georges-de-Didonne, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Georges-de-Didonne, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Georges-de-Didonne, a fine example of Charente-Maritime's coastal charm."history:"Saint-Georges-de-Didonne, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Saint-Georges-de-Didonne.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Saint-Georges-de-Didonne.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-meschers-sur-gironde"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Meschers-sur-Gironde"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-meschers-sur-gironde"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Meschers-sur-Gironde"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-meschers-sur-gironde"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Meschers-sur-Gironde"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-meschers-sur-gironde"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Meschers-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-meschers-sur-gironde"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Meschers-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-meschers-sur-gironde"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Meschers-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-meschers-sur-gironde"category:"visite"dept:"17"name:"Église et centre historique"city:"Meschers-sur-Gironde"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Meschers-sur-Gironde, une adresse représentative du charme de la Charente-Maritime."history:"Meschers-sur-Gironde, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Meschers-sur-Gironde, a fine example of Charente-Maritime's coastal charm."history:"Meschers-sur-Gironde, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Meschers.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Meschers-sur-Gironde_port.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Falaises_de_Meschers.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-aytre"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Aytré"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-aytre"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Aytré"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-aytre"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Aytré"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-aytre"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Aytré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-aytre"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Aytré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-aytre"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Aytré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-aytre"category:"visite"dept:"17"name:"Église et centre historique"city:"Aytré"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Aytré, une adresse représentative du charme de la Charente-Maritime."history:"Aytré, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Aytré, a fine example of Charente-Maritime's coastal charm."history:"Aytré, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Aytre.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_d_Aytre.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-angoulins"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Angoulins"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-angoulins"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Angoulins"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-angoulins"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Angoulins"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-angoulins"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Angoulins"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-angoulins"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Angoulins"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-angoulins"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Angoulins"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-angoulins"category:"visite"dept:"17"name:"Église et centre historique"city:"Angoulins"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Angoulins, une adresse représentative du charme de la Charente-Maritime."history:"Angoulins, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Angoulins, a fine example of Charente-Maritime's coastal charm."history:"Angoulins, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_d_Angoulins.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_d_Angoulins.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-yves"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Yves"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-yves"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Yves"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-yves"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Yves"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-yves"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Yves"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-yves"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Yves"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-yves"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Yves"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-yves"category:"visite"dept:"17"name:"Église et centre historique"city:"Yves"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Yves, une adresse représentative du charme de la Charente-Maritime."history:"Yves, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Yves, a fine example of Charente-Maritime's coastal charm."history:"Yves, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Reserve_naturelle_d_Yves.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_d_Yves.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-tonnay-charente"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Tonnay-Charente"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-tonnay-charente"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Tonnay-Charente"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-tonnay-charente"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Tonnay-Charente"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-tonnay-charente"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Tonnay-Charente"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-tonnay-charente"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Tonnay-Charente"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-tonnay-charente"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Tonnay-Charente"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-tonnay-charente"category:"visite"dept:"17"name:"Église et centre historique"city:"Tonnay-Charente"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Tonnay-Charente, une adresse représentative du charme de la Charente-Maritime."history:"Tonnay-Charente, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Tonnay-Charente, a fine example of Charente-Maritime's coastal charm."history:"Tonnay-Charente, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_suspendu_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Tonnay-Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Tonnay-Charente.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-savinien"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Savinien"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-savinien"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Savinien"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-savinien"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Savinien"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-savinien"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Savinien"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-savinien"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Savinien"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-savinien"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Savinien"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-savinien"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Savinien"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Savinien, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Savinien, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Savinien, a fine example of Charente-Maritime's coastal charm."history:"Saint-Savinien, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Savinien_sur_Charente.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Saint-Savinien.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Ile_de_la_Grenouillette_Saint-Savinien.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-taillebourg"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Taillebourg"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-taillebourg"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Taillebourg"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-taillebourg"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Taillebourg"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-taillebourg"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Taillebourg"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-taillebourg"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Taillebourg"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-taillebourg"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Taillebourg"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-taillebourg"category:"visite"dept:"17"name:"Église et centre historique"city:"Taillebourg"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Taillebourg, une adresse représentative du charme de la Charente-Maritime."history:"Taillebourg, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Taillebourg, a fine example of Charente-Maritime's coastal charm."history:"Taillebourg, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_Taillebourg.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Taillebourg.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-aulnay"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Aulnay"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-aulnay"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Aulnay"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-aulnay"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Aulnay"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-aulnay"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Aulnay"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-aulnay"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Aulnay"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-aulnay"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Aulnay"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-aulnay"category:"visite"dept:"17"name:"Église et centre historique"city:"Aulnay"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Aulnay, une adresse représentative du charme de la Charente-Maritime."history:"Aulnay, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Aulnay, a fine example of Charente-Maritime's coastal charm."history:"Aulnay, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_Saint-Pierre_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Portail_de_l_eglise_d_Aulnay.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cimetiere_de_Perton_Aulnay.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-matha"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Matha"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-matha"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Matha"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-matha"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Matha"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-matha"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Matha"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-matha"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Matha"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-matha"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Matha"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-matha"category:"visite"dept:"17"name:"Église et centre historique"city:"Matha"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Matha, une adresse représentative du charme de la Charente-Maritime."history:"Matha, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Matha, a fine example of Charente-Maritime's coastal charm."history:"Matha, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Halle_de_Matha.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Chateau_de_Matha.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-saint-palais-sur-mer"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Saint-Palais-sur-Mer"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-saint-palais-sur-mer"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Saint-Palais-sur-Mer"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-saint-palais-sur-mer"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Saint-Palais-sur-Mer"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-saint-palais-sur-mer"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-saint-palais-sur-mer"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-saint-palais-sur-mer"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-saint-palais-sur-mer"category:"visite"dept:"17"name:"Église et centre historique"city:"Saint-Palais-sur-Mer"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Saint-Palais-sur-Mer, une adresse représentative du charme de la Charente-Maritime."history:"Saint-Palais-sur-Mer, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Saint-Palais-sur-Mer, a fine example of Charente-Maritime's coastal charm."history:"Saint-Palais-sur-Mer, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Saint-Palais-sur-Mer.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Sentier_des_douaniers_Saint-Palais.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Conche_du_Platin_Saint-Palais.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-la-tremblade"category:"hotel"dept:"17"name:"Hôtel du Port"city:"La Tremblade"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-la-tremblade"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"La Tremblade"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-la-tremblade"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"La Tremblade"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-la-tremblade"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"La Tremblade"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-la-tremblade"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"La Tremblade"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-la-tremblade"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"La Tremblade"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-la-tremblade"category:"visite"dept:"17"name:"Église et centre historique"city:"La Tremblade"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à La Tremblade, une adresse représentative du charme de la Charente-Maritime."history:"La Tremblade, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in La Tremblade, a fine example of Charente-Maritime's coastal charm."history:"La Tremblade, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_La_Tremblade.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Cabanes_ostreicoles_La_Tremblade.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-ronce-les-bains"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Ronce-les-Bains"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-ronce-les-bains"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Ronce-les-Bains"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-ronce-les-bains"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Ronce-les-Bains"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-ronce-les-bains"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Ronce-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-ronce-les-bains"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Ronce-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-ronce-les-bains"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Ronce-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-ronce-les-bains"category:"visite"dept:"17"name:"Église et centre historique"city:"Ronce-les-Bains"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Ronce-les-Bains, une adresse représentative du charme de la Charente-Maritime."history:"Ronce-les-Bains, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Ronce-les-Bains, a fine example of Charente-Maritime's coastal charm."history:"Ronce-les-Bains, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Ronce-les-Bains.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Foret_de_la_Coubre_Ronce.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Ronce-les-Bains.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-dolus-d-oleron"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Dolus-d'Oléron"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-dolus-d-oleron"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Dolus-d'Oléron"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-dolus-d-oleron"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Dolus-d'Oléron"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-dolus-d-oleron"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Dolus-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-dolus-d-oleron"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Dolus-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-dolus-d-oleron"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Dolus-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-dolus-d-oleron"category:"visite"dept:"17"name:"Église et centre historique"city:"Dolus-d'Oléron"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Dolus-d'Oléron, une adresse représentative du charme de la Charente-Maritime."history:"Dolus-d'Oléron, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Dolus-d'Oléron, a fine example of Charente-Maritime's coastal charm."history:"Dolus-d'Oléron, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Dolus-d_Oleron.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_la_Baudissiere_Dolus.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Moulin_de_Dolus-d_Oleron.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-rivedoux-plage"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Rivedoux-Plage"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-rivedoux-plage"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Rivedoux-Plage"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-rivedoux-plage"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Rivedoux-Plage"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-rivedoux-plage"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Rivedoux-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-rivedoux-plage"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Rivedoux-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-rivedoux-plage"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Rivedoux-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-rivedoux-plage"category:"visite"dept:"17"name:"Église et centre historique"city:"Rivedoux-Plage"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Rivedoux-Plage, une adresse représentative du charme de la Charente-Maritime."history:"Rivedoux-Plage, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Rivedoux-Plage, a fine example of Charente-Maritime's coastal charm."history:"Rivedoux-Plage, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Pont_de_l_ile_de_Re_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Plage_de_Rivedoux.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Eglise_de_Rivedoux-Plage.jpg?width=1200"],
 },
 {
 slug:"hotel-du-port-loix"category:"hotel"dept:"17"name:"Hôtel du Port"city:"Loix"stars: 3,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 3 étoiles"en:"3-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel du Port à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel du Port in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
 {
 slug:"hotel-de-la-plage-loix"category:"hotel"dept:"17"name:"Hôtel de la Plage"city:"Loix"stars: 2,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 2 étoiles"en:"2-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel de la Plage à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel de la Plage in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
 {
 slug:"hotel-le-relais-atlantique-loix"category:"hotel"dept:"17"name:"Hôtel Le Relais Atlantique"city:"Loix"stars: 4,
 facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Hôtel 4 étoiles"en:"4-star hotel" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Hôtel Le Relais Atlantique à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Hôtel Le Relais Atlantique in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
 {
 slug:"la-table-du-pertuis-loix"category:"restaurant"dept:"17"name:"La Table du Pertuis"city:"Loix"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"La Table du Pertuis à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"La Table du Pertuis in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
 {
 slug:"le-comptoir-des-huitres-loix"category:"restaurant"dept:"17"name:"Le Comptoir des Huîtres"city:"Loix"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Cuisine régionale et produits de la mer"en:"Regional cuisine and seafood" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Le Comptoir des Huîtres à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Le Comptoir des Huîtres in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
 {
 slug:"sentier-du-littoral-loix"category:"randonnee"dept:"17"name:"Sentier du littoral"city:"Loix"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Balade familiale, terrain plat"en:"Family walk, flat terrain" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Sentier du littoral à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Coastal footpath in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
 {
 slug:"eglise-et-centre-historique-loix"category:"visite"dept:"17"name:"Église et centre historique"city:"Loix"facts: [
 { fr:"Commune de Charente-Maritime"en:"Town in Charente-Maritime" },
 { fr:"Ouvert toute l'année"en:"Open all year" },
 { fr:"Proche du littoral atlantique"en:"Close to the Atlantic coast" },
 ],
 fr: {
 teaser:"Église et centre historique à Loix, une adresse représentative du charme de la Charente-Maritime."history:"Loix, en Charente-Maritime, conjugue patrimoine littoral et art de vivre atlantique: ruelles anciennes, marché local et proximité de l'océan façonnent depuis des siècles l'identité de la commune, entre pêche, ostréiculture et tourisme balnéaire."tips:"Renseignez-vous sur les horaires saisonniers avant de vous déplacer, ils varient fortement entre l'été et l'hiver sur la côte."},
 en: {
 teaser:"Church and historic centre in Loix, a fine example of Charente-Maritime's coastal charm."history:"Loix, in Charente-Maritime, blends coastal heritage with Atlantic living: old streets, a local market and closeness to the ocean have shaped the town's identity for centuries, between fishing, oyster farming and seaside tourism."tips:"Check seasonal opening hours before visiting, as they vary greatly between summer and winter along the coast."},
 photos: ["https://commons.wikimedia.org/wiki/Special:FilePath/Village_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Marais_salants_de_Loix.jpg?width=1200""https://commons.wikimedia.org/wiki/Special:FilePath/Port_de_Loix.jpg?width=1200"],
 },
];

export const GUIDE_CATEGORIES: { key: GuideCategory; fr: string; en: string }[] = [
 { key:"restaurant"fr:"Restaurants"en:"Restaurants" },
 { key:"hotel"fr:"Hôtels"en:"Hotels" },
 { key:"randonnee"fr:"Randonnées"en:"Hikes" },
 { key:"visite"fr:"À visiter"en:"To visit" },
];

export const DEPTS: { key: Dept; fr: string; en: string }[] = [
 { key:"17"fr:"Charente-Maritime"en:"Charente-Maritime" },
];

/** Toutes les villes et villages couverts par le guide, triés alphabétiquement. */
export const GUIDE_CITIES: string[] = Array.from(new Set(GUIDE_ENTRIES.map((e) => e.city))).sort((a, b) =>
 a.localeCompare(b"fr"),
);

export function getGuideEntry(slug: string): GuideEntry | undefined {
 return GUIDE_ENTRIES.find((e) => e.slug === slug);
}
