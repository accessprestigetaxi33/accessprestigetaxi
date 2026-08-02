export type DestinationCopy = {
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  lead: string;
  sections: { h: string; p: string }[];
  faq: { q: string; a: string }[];
  bullets: string[];
};

export type Destination = {
  slug: string;
  from: string;
  to: string;
  dept: "Charente-Maritime";
  distanceKm: number;
  durationMin: number;
  priceFrom: number;
  fr: DestinationCopy;
  en: DestinationCopy;
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "taxi-la-rochelle-aeroport",
    from: "La Rochelle",
    to: "Aéroport La Rochelle-Île de Ré",
    dept: "Charente-Maritime",
    distanceKm: 5,
    durationMin: 12,
    priceFrom: 20,
    fr: {
      title: "La Rochelle → Aéroport",
      h1: "Taxi La Rochelle – Aéroport La Rochelle-Île de Ré",
      metaTitle: "Taxi aéroport La Rochelle-Île de Ré — Access Prestige Taxi",
      metaDescription:
        "Transfert taxi entre La Rochelle et l\u2019aéroport La Rochelle-Île de Ré : suivi des vols, prix annoncé, BMW iX1 électrique ou van 7 places. 5j/7, 8h-20h.",
      lead:
        "L\u2019aéroport La Rochelle-Île de Ré est à douze minutes du Vieux-Port. Nous suivons l\u2019horaire réel de votre vol et vous déposons devant le hall départ, bagages portés.",
      sections: [
        {
          h: "Vols suivis en temps réel",
          p: "Londres, Dublin, Bruxelles, Lyon ou Porto : nous contrôlons l\u2019horaire d\u2019atterrissage avant de partir, et l\u2019attente est offerte pendant les trente premières minutes après l\u2019heure d\u2019arrivée réelle.",
        },
        {
          h: "Deux véhicules, deux usages",
          p: "La BMW iX1 100 % électrique de Patricia pour quatre passagers, le van Mercedes d\u2019Alain jusqu\u2019à sept personnes avec valises, planches ou matériel professionnel.",
        },
        {
          h: "Toute l\u2019agglomération",
          p: "Lagord, Puilboreau, Aytré, Angoulins, Châtelaillon, Nieul-sur-Mer ou Dompierre : nous venons vous chercher à domicile, à l\u2019hôtel ou au bureau.",
        },
      ],
      bullets: [
        "Suivi du vol et attente offerte 30 minutes",
        "Sièges bébé et rehausseurs enfants sur demande",
        "Van jusqu\u2019à 7 personnes pour les groupes",
        "Facture entreprise et paiement par carte",
      ],
      faq: [
        {
          q: "Prenez-vous les vols très matinaux ?",
          a: "Nous roulons de 8h à 20h, du lundi au vendredi. Pour un vol plus tôt, appelez-nous : nous cherchons une solution avec vous.",
        },
        {
          q: "Combien de bagages puis-je emporter ?",
          a: "Quatre valises en BMW iX1, jusqu\u2019à sept passagers et leurs bagages dans le van Mercedes.",
        },
      ],
    },
    en: {
      title: "La Rochelle → Airport",
      h1: "Taxi La Rochelle – La Rochelle-Île de Ré airport",
      metaTitle: "La Rochelle-Île de Ré airport taxi — Access Prestige Taxi",
      metaDescription:
        "Taxi transfer between La Rochelle and La Rochelle-Île de Ré airport: flight tracking, quoted price, electric BMW iX1 or 7-seat van. 5 days a week, 8am-8pm.",
      lead:
        "La Rochelle-Île de Ré airport is twelve minutes from the Old Port. We track your actual flight time and drop you at the departures hall, luggage carried.",
      sections: [
        {
          h: "Flights tracked live",
          p: "London, Dublin, Brussels, Lyon or Porto: we check the landing time before leaving, and the first thirty minutes of waiting after the actual arrival time are free.",
        },
        {
          h: "Two vehicles, two uses",
          p: "Patricia\u2019s fully electric BMW iX1 for four passengers, Alain\u2019s Mercedes van for up to seven people with suitcases, boards or work equipment.",
        },
        {
          h: "The whole urban area",
          p: "Lagord, Puilboreau, Aytré, Angoulins, Châtelaillon, Nieul-sur-Mer or Dompierre: we collect you at home, at your hotel or at the office.",
        },
      ],
      bullets: [
        "Flight tracking with 30 minutes of free waiting",
        "Baby and booster seats on request",
        "Van for up to 7 passengers",
        "Company invoicing and card payment",
      ],
      faq: [
        {
          q: "Do you cover very early flights?",
          a: "We drive from 8am to 8pm, Monday to Friday. For an earlier flight, call us and we will look for a solution.",
        },
        {
          q: "How much luggage can I bring?",
          a: "Four suitcases in the BMW iX1; up to seven passengers and their luggage in the Mercedes van.",
        },
      ],
    },
  },
  {
    slug: "taxi-rochefort-gare-la-rochelle",
    from: "Rochefort",
    to: "Gare de La Rochelle",
    dept: "Charente-Maritime",
    distanceKm: 32,
    durationMin: 35,
    priceFrom: 65,
    fr: {
      title: "Rochefort → Gare de La Rochelle",
      h1: "Taxi Rochefort – Gare TGV de La Rochelle",
      metaTitle: "Taxi Rochefort gare de La Rochelle — transfert TGV 5j/7",
      metaDescription:
        "Taxi entre Rochefort, Tonnay-Charente, Fouras et la gare TGV de La Rochelle. Suivi du train, prix ferme annoncé, van 7 places disponible. 8h-20h.",
      lead:
        "Trente-cinq minutes séparent l\u2019arsenal de Rochefort du hall de la gare de La Rochelle, d\u2019où partent les TGV pour Poitiers, Paris et Nantes. Nous surveillons l\u2019horaire réel du train.",
      sections: [
        {
          h: "Départ à l\u2019heure, même à l\u2019heure de pointe",
          p: "Nous intégrons le trafic de la rocade et le pont de Tonnay-Charente dans le calcul du départ : vous arrivez quinze minutes avant le train, pas deux minutes après.",
        },
        {
          h: "Tout le bassin de Rochefort",
          p: "Tonnay-Charente, Échillais, Soubise, Fouras, Saint-Agnant, Port-des-Barques et Vergeroux sont desservis au même tarif annoncé à l\u2019avance.",
        },
        {
          h: "Groupes et familles",
          p: "Le van Mercedes emmène jusqu\u2019à sept personnes avec leurs valises : idéal pour les départs en famille ou les équipes en déplacement.",
        },
      ],
      bullets: [
        "Suivi du TGV et ajustement de l\u2019heure de départ",
        "Prix ferme annoncé à la réservation",
        "Sièges bébé et rehausseurs enfants sur demande",
        "Van jusqu\u2019à 7 personnes pour les groupes",
      ],
      faq: [
        {
          q: "Et si mon train a du retard au retour ?",
          a: "Nous suivons l\u2019horaire réel : le chauffeur se présente à l\u2019arrivée effective, sans supplément d\u2019attente.",
        },
        {
          q: "Peut-on réserver un aller-retour ?",
          a: "Oui, dans le même formulaire : indiquez l\u2019heure du retour, nous bloquons le créneau.",
        },
      ],
    },
    en: {
      title: "Rochefort → La Rochelle station",
      h1: "Taxi Rochefort – La Rochelle TGV station",
      metaTitle: "Rochefort to La Rochelle station taxi — TGV transfer, 5 days a week",
      metaDescription:
        "Taxi between Rochefort, Tonnay-Charente, Fouras and La Rochelle TGV station. Train tracking, fixed quoted price, 7-seat van available. 8am-8pm.",
      lead:
        "Thirty-five minutes separate the Rochefort arsenal from La Rochelle station, where TGV trains leave for Poitiers, Paris and Nantes. We track the real train time.",
      sections: [
        {
          h: "On time, even at rush hour",
          p: "We factor in ring-road traffic and the Tonnay-Charente bridge: you arrive fifteen minutes before the train, not two minutes after it.",
        },
        {
          h: "The whole Rochefort area",
          p: "Tonnay-Charente, Échillais, Soubise, Fouras, Saint-Agnant, Port-des-Barques and Vergeroux are served at the same pre-quoted fare.",
        },
        {
          h: "Groups and families",
          p: "The Mercedes van carries up to seven people with luggage — ideal for family departures or teams travelling together.",
        },
      ],
      bullets: [
        "TGV tracking with adjusted departure time",
        "Fixed price quoted at booking",
        "Baby and booster seats on request",
        "Van for up to 7 passengers",
      ],
      faq: [
        {
          q: "What if my return train is late?",
          a: "We follow the live schedule: your driver is there at the actual arrival, with no waiting surcharge.",
        },
        {
          q: "Can I book a return trip?",
          a: "Yes, in the same form: give us the return time and we hold the slot.",
        },
      ],
    },
  },
  {
    slug: "taxi-la-rochelle-ile-de-re",
    from: "La Rochelle",
    to: "Île de Ré",
    dept: "Charente-Maritime",
    distanceKm: 25,
    durationMin: 35,
    priceFrom: 60,
    fr: {
      title: "La Rochelle → Île de Ré",
      h1: "Taxi La Rochelle – Île de Ré (pont inclus)",
      metaTitle: "Taxi La Rochelle Île de Ré — transfert électrique, pont inclus",
      metaDescription:
        "Taxi entre La Rochelle (gare, aéroport, Vieux-Port) et l'île de Ré : Saint-Martin, La Flotte, Ars-en-Ré. Véhicule 100 % électrique, péage du pont inclus.",
      lead:
        "De la gare de La Rochelle à Saint-Martin-de-Ré, comptez 35 minutes, pont compris. Nous desservons les dix villages de l'île, du Bois-Plage aux Portes-en-Ré.",
      sections: [
        {
          h: "Tous les villages de l'île",
          p: "Rivedoux, La Flotte, Saint-Martin, Le Bois-Plage, Sainte-Marie, La Couarde, Loix, Ars-en-Ré, Saint-Clément et Les Portes : dépose devant la location, l'hôtel ou le port.",
        },
        {
          h: "Arrivées gare, aéroport et Vieux-Port",
          p: "Nous récupérons les passagers du TGV Paris–La Rochelle, les vols de l'aéroport Île de Ré ainsi que les plaisanciers du port des Minimes, vélos et bagages compris.",
        },
        {
          h: "Été comme hiver",
          p: "En haute saison, le pont se sature : nous adaptons l'horaire de départ et privilégions les créneaux fluides pour tenir l'heure annoncée.",
        },
      ],
      bullets: [
        "Péage du pont de Ré inclus dans le prix annoncé",
        "Transport de vélos et planches sur demande",
        "Sièges enfant et rehausseurs gratuits",
        "Courses de nuit vers les restaurants de Saint-Martin",
      ],
      faq: [
        {
          q: "Le péage du pont est-il facturé en supplément ?",
          a: "Non, il est intégré à l'estimation affichée lors de la réservation.",
        },
        {
          q: "Pouvez-vous transporter des vélos ?",
          a: "Oui, sur demande à la réservation, dans la limite de la capacité du coffre.",
        },
      ],
    },
    en: {
      title: "La Rochelle → Île de Ré",
      h1: "Taxi La Rochelle – Île de Ré (bridge included)",
      metaTitle: "Taxi La Rochelle to Île de Ré — electric transfer, bridge toll included",
      metaDescription:
        "Taxi from La Rochelle (station, airport, Old Port) to Île de Ré: Saint-Martin, La Flotte, Ars-en-Ré. Fully electric vehicle, bridge toll included.",
      lead:
        "From La Rochelle station to Saint-Martin-de-Ré is about 35 minutes, bridge included. We serve all ten villages, from Le Bois-Plage to Les Portes-en-Ré.",
      sections: [
        {
          h: "Every village on the island",
          p: "Rivedoux, La Flotte, Saint-Martin, Le Bois-Plage, Sainte-Marie, La Couarde, Loix, Ars-en-Ré, Saint-Clément and Les Portes: dropped off at your rental, hotel or harbour.",
        },
        {
          h: "Station, airport and Old Port arrivals",
          p: "We collect passengers off the Paris–La Rochelle TGV, flights at Île de Ré airport and sailors at Les Minimes marina, bikes and luggage included.",
        },
        {
          h: "Summer and winter",
          p: "In peak season the bridge gets congested, so we adjust departure times to keep the promised arrival.",
        },
      ],
      bullets: [
        "Ré bridge toll included in the quoted price",
        "Bikes and boards carried on request",
        "Free child seats and boosters",
        "Evening rides to Saint-Martin restaurants",
      ],
      faq: [
        {
          q: "Is the bridge toll charged separately?",
          a: "No, it is already part of the estimate shown when you book.",
        },
        {
          q: "Can you carry bicycles?",
          a: "Yes, on request at booking and subject to boot capacity.",
        },
      ],
    },
  },
  {
    slug: "taxi-saintes-royan",
    from: "Saintes",
    to: "Royan",
    dept: "Charente-Maritime",
    distanceKm: 40,
    durationMin: 45,
    priceFrom: 85,
    fr: {
      title: "Saintes → Royan",
      h1: "Taxi Saintes – Royan et côte de Beauté",
      metaTitle: "Taxi Saintes Royan — transfert électrique côte de Beauté",
      metaDescription:
        "Taxi entre Saintes et Royan, Saint-Palais-sur-Mer, Vaux-sur-Mer et Meschers. Véhicule électrique, prix annoncé, suivi de course en temps réel.",
      lead:
        "Quarante minutes séparent l'amphithéâtre romain de Saintes des plages de la côte de Beauté. Un trajet régulier pour les vacanciers, les curistes et les résidences secondaires.",
      sections: [
        {
          h: "Toute la côte de Beauté",
          p: "Royan centre, Pontaillac, Saint-Palais-sur-Mer, Vaux-sur-Mer, Saint-Georges-de-Didonne et Meschers-sur-Gironde : dépose au plus près de la plage ou du logement.",
        },
        {
          h: "Correspondances et embarquements",
          p: "Gare de Saintes, bac Royan–Le Verdon, port de plaisance : nous calons l'horaire sur votre traversée ou votre train, avec marge d'embarquement.",
        },
        {
          h: "Trajets réguliers et cures",
          p: "Pour les rendez-vous répétés (kiné, thalasso, dialyse), nous programmons une course récurrente à la même heure chaque semaine.",
        },
      ],
      bullets: [
        "Dépose au plus près des plages et des ports",
        "Trajets récurrents programmables",
        "Transport médical conventionné sur prescription",
        "Coffre adapté aux valises et matériel de plage",
      ],
      faq: [
        {
          q: "Desservez-vous le bac Royan – Le Verdon ?",
          a: "Oui, nous déposons directement à l'embarcadère avec une marge suffisante avant la traversée.",
        },
        {
          q: "Peut-on réserver un aller-retour dans la journée ?",
          a: "Oui, l'aller et le retour se réservent en une fois, avec attente sur place possible.",
        },
      ],
    },
    en: {
      title: "Saintes → Royan",
      h1: "Taxi Saintes – Royan and the Côte de Beauté",
      metaTitle: "Taxi Saintes to Royan — electric transfer on the Côte de Beauté",
      metaDescription:
        "Taxi between Saintes and Royan, Saint-Palais-sur-Mer, Vaux-sur-Mer and Meschers. Electric vehicle, quoted price, live ride tracking.",
      lead:
        "Forty minutes separate the Roman amphitheatre of Saintes from the beaches of the Côte de Beauté — a regular run for holidaymakers and second-home owners.",
      sections: [
        {
          h: "The whole Côte de Beauté",
          p: "Royan centre, Pontaillac, Saint-Palais-sur-Mer, Vaux-sur-Mer, Saint-Georges-de-Didonne and Meschers-sur-Gironde: dropped as close as possible to the beach or your rental.",
        },
        {
          h: "Connections and ferries",
          p: "Saintes station, the Royan–Le Verdon ferry, the marina: we time the ride to your crossing or train with boarding margin.",
        },
        {
          h: "Recurring trips and treatments",
          p: "For repeat appointments (physio, thalassotherapy, dialysis) we schedule a recurring ride at the same time each week.",
        },
      ],
      bullets: [
        "Drop-off close to beaches and harbours",
        "Recurring rides can be scheduled",
        "Covered medical transport with a prescription",
        "Boot sized for luggage and beach gear",
      ],
      faq: [
        {
          q: "Do you serve the Royan – Le Verdon ferry?",
          a: "Yes, we drop you at the terminal with enough margin before the crossing.",
        },
        {
          q: "Can I book a same-day return?",
          a: "Yes, outbound and return are booked together and we can wait on site.",
        },
      ],
    },
  },
  {
    slug: "taxi-groupe-7-places-charente-maritime",
    from: "Groupe",
    to: "Van 7 places",
    dept: "Charente-Maritime",
    distanceKm: 0,
    durationMin: 60,
    priceFrom: 0,
    fr: {
      title: "Groupes → Van 7 places",
      h1: "Transport de groupe jusqu\u2019à 7 personnes en Charente-Maritime",
      metaTitle: "Taxi van 7 places Charente-Maritime — transport de groupe",
      metaDescription:
        "Transport de groupe en Charente-Maritime : van Mercedes jusqu\u2019à 7 passagers avec bagages. Mariages, séminaires, familles, aéroport. 5j/7, 8h-20h.",
      lead:
        "Le van Mercedes d\u2019Alain accueille jusqu\u2019à sept passagers avec leurs bagages : un seul véhicule, un seul tarif, pas de convoi de voitures à coordonner.",
      sections: [
        {
          h: "Familles, amis, équipes",
          p: "Départ en vacances vers l\u2019île de Ré ou Oléron, séminaire à La Rochelle, mariage à Saintes, sortie de groupe sur la côte : sept places assises et une soute pour les valises.",
        },
        {
          h: "Enfants bienvenus",
          p: "Sièges bébé, sièges enfant et rehausseurs sont fournis gratuitement sur demande à la réservation, dans les deux véhicules.",
        },
        {
          h: "Mise à disposition à l\u2019heure",
          p: "Pour une journée de visites, un salon professionnel ou une tournée de dégustation, le van reste à votre disposition avec chauffeur, itinéraire libre.",
        },
      ],
      bullets: [
        "Jusqu\u2019à 7 passagers et leurs bagages",
        "Sièges bébé et rehausseurs enfants gratuits",
        "Devis groupe annoncé avant le départ",
        "Mise à disposition à l\u2019heure ou à la journée",
      ],
      faq: [
        {
          q: "Peut-on transporter plus de sept personnes ?",
          a: "Au-delà de sept passagers, nous organisons deux véhicules : appelez-nous pour caler les horaires.",
        },
        {
          q: "Les sièges enfants sont-ils facturés ?",
          a: "Non, sièges bébé et rehausseurs sont fournis gratuitement, il suffit de les demander à la réservation.",
        },
      ],
    },
    en: {
      title: "Groups → 7-seat van",
      h1: "Group transport for up to 7 people in Charente-Maritime",
      metaTitle: "7-seat van taxi Charente-Maritime — group transport",
      metaDescription:
        "Group transport in Charente-Maritime: Mercedes van for up to 7 passengers with luggage. Weddings, conferences, families, airport. 5 days a week, 8am-8pm.",
      lead:
        "Alain\u2019s Mercedes van carries up to seven passengers with luggage: one vehicle, one fare, no convoy of cars to coordinate.",
      sections: [
        {
          h: "Families, friends, teams",
          p: "Holiday departures to Île de Ré or Oléron, a conference in La Rochelle, a wedding in Saintes, a group day on the coast: seven seats and a boot for the suitcases.",
        },
        {
          h: "Children welcome",
          p: "Baby seats, child seats and boosters are provided free on request at booking, in both vehicles.",
        },
        {
          h: "Hourly hire",
          p: "For a day of visits, a trade show or a tasting tour, the van stays at your disposal with its driver and a free itinerary.",
        },
      ],
      bullets: [
        "Up to 7 passengers and their luggage",
        "Free baby and booster seats",
        "Group quote confirmed before departure",
        "Hourly or full-day hire",
      ],
      faq: [
        {
          q: "Can you carry more than seven people?",
          a: "Beyond seven passengers we arrange two vehicles — call us to set the timings.",
        },
        {
          q: "Are child seats charged?",
          a: "No, baby seats and boosters are provided free; just ask when booking.",
        },
      ],
    },
  },
  {
    slug: "taxi-conventionne-charente-maritime",
    from: "Domicile",
    to: "Hôpital / clinique",
    dept: "Charente",
    distanceKm: 30,
    durationMin: 40,
    priceFrom: 0,
    fr: {
      title: "Domicile → Hôpital / clinique",
      h1: "Taxi conventionné CPAM en Charente-Maritime",
      metaTitle: "Taxi conventionné CPAM Charente-Maritime — transport médical assis",
      metaDescription:
        "Transport médical assis conventionné CPAM : dialyse, chimiothérapie, consultations. Prise en charge à domicile en véhicule électrique, tiers payant.",
      lead:
        "Sur prescription médicale, votre transport assis est pris en charge par l'Assurance Maladie. Nous appliquons le tiers payant : vous n'avancez rien.",
      sections: [
        {
          h: "Établissements desservis",
          p: "CH d'Angoulême-Girac, clinique Saint-Joseph, centres de dialyse, CHU de Poitiers et de Bordeaux, hôpital de Saintes, de Cognac et de La Rochelle.",
        },
        {
          h: "Traitements réguliers",
          p: "Dialyse, chimiothérapie, radiothérapie, rééducation : nous fixons les mêmes horaires chaque semaine et le même chauffeur autant que possible, pour des repères stables.",
        },
        {
          h: "Confort adapté",
          p: "Aide à la montée et à la descente, accompagnement jusqu'à l'accueil du service, température réglée, roulage électrique sans vibration ni odeur.",
        },
      ],
      bullets: [
        "Tiers payant : aucune avance de frais",
        "Prescription médicale de transport obligatoire",
        "Accompagnant accepté sans supplément",
        "Retour à domicile après la consultation",
      ],
      faq: [
        {
          q: "Quels documents dois-je fournir ?",
          a: "La prescription médicale de transport, votre carte Vitale et votre attestation de mutuelle si nécessaire.",
        },
        {
          q: "Puis-je être accompagné ?",
          a: "Oui, un accompagnant est accepté sans supplément lorsque la place est disponible.",
        },
      ],
    },
    en: {
      title: "Home → Hospital / clinic",
      h1: "Covered medical taxi in Charente-Maritime",
      metaTitle: "Covered medical taxi Charente-Maritime — seated patient transport",
      metaDescription:
        "Seated medical transport covered by French health insurance: dialysis, chemotherapy, appointments. Door-to-door electric vehicle, no upfront payment.",
      lead:
        "With a medical prescription, seated transport is covered by the French health service. We bill them directly, so you pay nothing upfront.",
      sections: [
        {
          h: "Facilities we serve",
          p: "Angoulême-Girac hospital, Saint-Joseph clinic, dialysis centres, Poitiers and Bordeaux teaching hospitals, Saintes, Cognac and La Rochelle hospitals.",
        },
        {
          h: "Regular treatments",
          p: "Dialysis, chemotherapy, radiotherapy, rehab: we keep the same weekly times and, wherever possible, the same driver.",
        },
        {
          h: "Adapted comfort",
          p: "Help getting in and out, escort to the reception desk, controlled temperature and smooth electric driving with no fumes.",
        },
      ],
      bullets: [
        "Direct billing: nothing to pay upfront",
        "Medical transport prescription required",
        "A companion travels at no extra cost",
        "Return home after the appointment",
      ],
      faq: [
        {
          q: "Which documents do I need?",
          a: "The medical transport prescription, your Carte Vitale and your top-up insurance certificate if needed.",
        },
        {
          q: "Can someone come with me?",
          a: "Yes, a companion travels free of charge when a seat is available.",
        },
      ],
    },
  },
];

export function getDestination(slug: string) {
  return DESTINATIONS.find((d) => d.slug === slug);
}
