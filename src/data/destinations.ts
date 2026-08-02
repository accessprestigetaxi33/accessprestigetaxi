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
  dept: "Charente" | "Charente-Maritime";
  distanceKm: number;
  durationMin: number;
  priceFrom: number;
  fr: DestinationCopy;
  en: DestinationCopy;
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "taxi-angouleme-gare-tgv",
    from: "Angoulême",
    to: "Gare TGV d'Angoulême",
    dept: "Charente",
    distanceKm: 4,
    durationMin: 10,
    priceFrom: 15,
    fr: {
      title: "Angoulême → Gare TGV",
      h1: "Taxi Angoulême – Gare TGV d'Angoulême",
      metaTitle: "Taxi Angoulême Gare TGV — Access Prestige Taxi 100 % électrique",
      metaDescription:
        "Transfert taxi entre Angoulême et la gare TGV en BMW iX1 électrique ou van Mercedes 7 places. Prise en charge à domicile, suivi du train, prix annoncé à l'avance. Réservation en 1 minute.",
      lead:
        "La gare d'Angoulême place Paris à 1 h 45 et Bordeaux à 35 minutes : autant dire que la moindre minute compte. Nous surveillons l'horaire réel de votre train et nous vous déposons au plus près du hall départ.",
      sections: [
        {
          h: "Un transfert calé sur votre train",
          p: "Vous nous donnez le numéro ou l'heure de votre TGV : nous calculons l'heure de prise en charge, marge bagages comprise. En cas de retard annoncé, le créneau est ajusté sans frais et vous êtes prévenu par SMS ou e-mail.",
        },
        {
          h: "Angoulême intra-muros et communes voisines",
          p: "Plateau, Saint-Cybard, Ma Campagne, L'Houmeau, mais aussi Soyaux, Gond-Pontouvre, La Couronne, Saint-Yrieix et Champniers : la course reste courte, le confort identique.",
        },
        {
          h: "Silence électrique dès le matin",
          p: "Nos une BMW iX1 électrique et un van Mercedes 7 places partent chargées, chauffées ou climatisées avant votre arrivée. Aucun bruit de moteur pour un départ à 6 h, et zéro émission dans la ville classée patrimoine.",
        },
      ],
      bullets: [
        "Prise en charge à domicile, à l'hôtel ou en entreprise",
        "Suivi du train en temps réel, attente incluse",
        "Aide aux bagages et accès quai facilité",
        "Paiement carte, espèces ou facture entreprise",
      ],
      faq: [
        {
          q: "Combien de temps faut-il prévoir entre le centre d'Angoulême et la gare ?",
          a: "Comptez 8 à 12 minutes selon l'heure. Nous prévoyons systématiquement une marge de 10 minutes avant l'ouverture des portes du train.",
        },
        {
          q: "Puis-je réserver un taxi de nuit pour un premier train ?",
          a: "Oui, nos deux chauffeurs assurent les départs très tôt le matin sur réservation la veille.",
        },
      ],
    },
    en: {
      title: "Angoulême → TGV station",
      h1: "Taxi Angoulême – Angoulême TGV station",
      metaTitle: "Taxi Angoulême to TGV station — Access Prestige Taxi, all electric",
      metaDescription:
        "Electric taxi transfer between Angoulême and the TGV station. Door-to-door pickup, live train tracking and a price quoted upfront. Book in one minute.",
      lead:
        "Angoulême station puts Paris 1 h 45 away and Bordeaux 35 minutes away, so every minute counts. We track your actual train time and drop you right by the departure hall.",
      sections: [
        {
          h: "A transfer built around your train",
          p: "Give us your train number or departure time and we work backwards to the pickup slot, luggage margin included. If the train is delayed we shift the slot at no extra cost and let you know.",
        },
        {
          h: "Angoulême and nearby towns",
          p: "Plateau, Saint-Cybard, Ma Campagne, L'Houmeau, plus Soyaux, Gond-Pontouvre, La Couronne, Saint-Yrieix and Champniers: a short ride with the same level of comfort.",
        },
        {
          h: "Electric silence, even at dawn",
          p: "Both BMW iX1 électrique / van Mercedes 7 places leave fully charged and pre-conditioned. No engine noise for a 6 a.m. departure and zero emissions in the heritage city centre.",
        },
      ],
      bullets: [
        "Pickup at home, hotel or office",
        "Live train tracking, waiting time included",
        "Luggage assistance to the platform",
        "Card, cash or company invoice",
      ],
      faq: [
        {
          q: "How long from Angoulême city centre to the station?",
          a: "Between 8 and 12 minutes depending on traffic. We always add a 10-minute buffer before boarding closes.",
        },
        {
          q: "Can I book a night taxi for the first train?",
          a: "Yes — both drivers cover very early departures when booked the day before.",
        },
      ],
    },
  },
  {
    slug: "taxi-cognac-aeroport-bordeaux",
    from: "Cognac",
    to: "Aéroport Bordeaux-Mérignac",
    dept: "Charente",
    distanceKm: 135,
    durationMin: 100,
    priceFrom: 210,
    fr: {
      title: "Cognac → Aéroport Bordeaux-Mérignac",
      h1: "Taxi Cognac – Aéroport de Bordeaux-Mérignac",
      metaTitle: "Taxi Cognac Aéroport Bordeaux-Mérignac — transfert 100 % électrique",
      metaDescription:
        "Transfert taxi Cognac ↔ aéroport Bordeaux-Mérignac en BMW iX1 électrique ou van Mercedes 7 places : vol suivi, accueil pancarte, tarif ferme annoncé avant le départ.",
      lead:
        "Environ 1 h 40 de route entre les chais de Cognac et le hall B de Mérignac. Nous suivons votre numéro de vol : si l'avion prend du retard, nous décalons l'accueil sans supplément.",
      sections: [
        {
          h: "Longue distance sans stress",
          p: "Le trajet passe par la N10 puis la rocade bordelaise. Nous partons avec la marge nécessaire aux heures de pointe et vous déposons au terminal exact de votre compagnie.",
        },
        {
          h: "Voyage d'affaires et maisons de cognac",
          p: "Accueil pancarte au niveau arrivées, prise en charge de vos visiteurs, facturation entreprise mensuelle : les maisons de négoce et leurs invités internationaux voyagent en discrétion.",
        },
        {
          h: "Autonomie et confort",
          p: "La BMW iX1 couvre l'aller-retour sans recharge intermédiaire. À bord : Wi-Fi, chargeurs USB-C, eau et sièges chauffants pour arriver reposé.",
        },
      ],
      bullets: [
        "Suivi du vol en temps réel, attente offerte 45 min",
        "Grand coffre : valises, golf, matériel professionnel",
        "Tarif ferme communiqué avant la réservation",
        "Également au départ de Jarnac, Segonzac et Châteaubernard",
      ],
      faq: [
        {
          q: "Combien coûte un taxi Cognac – aéroport de Bordeaux ?",
          a: "Le tarif dépend de l'heure (jour/nuit) et du jour de la semaine. L'estimation exacte s'affiche pendant la réservation et reste ferme.",
        },
        {
          q: "Que se passe-t-il si mon vol atterrit en retard ?",
          a: "Nous suivons le vol : l'accueil est décalé automatiquement, avec 45 minutes d'attente incluses après l'atterrissage.",
        },
      ],
    },
    en: {
      title: "Cognac → Bordeaux-Mérignac airport",
      h1: "Taxi Cognac – Bordeaux-Mérignac airport",
      metaTitle: "Taxi Cognac to Bordeaux airport — all-electric private transfer",
      metaDescription:
        "Cognac ↔ Bordeaux-Mérignac airport transfer in an electric BMW iX1 or a 7-seat Mercedes van: flight tracking, meet & greet, fixed price confirmed before departure.",
      lead:
        "Roughly 1 h 40 between the Cognac cellars and Mérignac. We track your flight number, so a delayed landing simply shifts the meeting time at no extra charge.",
      sections: [
        {
          h: "Long distance, zero stress",
          p: "The route follows the N10 and the Bordeaux ring road. We leave with enough margin for rush hour and drop you at your airline's terminal.",
        },
        {
          h: "Business travel and cognac houses",
          p: "Name-board welcome in arrivals, guest pickups and monthly company invoicing: trading houses and their international visitors travel discreetly.",
        },
        {
          h: "Range and comfort",
          p: "The BMW iX1 covers the round trip without a charging stop. On board: Wi-Fi, USB-C chargers, water and heated seats.",
        },
      ],
      bullets: [
        "Live flight tracking, 45 minutes of free waiting",
        "Large boot: suitcases, golf bags, professional gear",
        "Fixed price confirmed before you book",
        "Also from Jarnac, Segonzac and Châteaubernard",
      ],
      faq: [
        {
          q: "How much is a taxi from Cognac to Bordeaux airport?",
          a: "It depends on day/night rates and the day of the week. The exact estimate appears during booking and stays firm.",
        },
        {
          q: "What if my flight lands late?",
          a: "We track the flight and shift the meeting time automatically, with 45 minutes of waiting included after landing.",
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
    slug: "taxi-jarnac-vignobles-cognac",
    from: "Jarnac",
    to: "Chais & vignobles",
    dept: "Charente",
    distanceKm: 60,
    durationMin: 240,
    priceFrom: 240,
    fr: {
      title: "Jarnac → Chais & vignobles",
      h1: "Journée vignobles et chais de Cognac avec chauffeur",
      metaTitle: "Mise à disposition chauffeur vignobles Cognac & Jarnac — 100 % électrique",
      metaDescription:
        "Mise à disposition à l'heure pour visiter les chais de Cognac, Jarnac et Segonzac. Chauffeur privé en BMW iX1 électrique ou van Mercedes 7 places, itinéraire libre, dégustation en toute sécurité.",
      lead:
        "Dégustations et conduite ne font pas bon ménage. Nous restons à votre disposition à l'heure : vous choisissez les maisons, nous gérons les routes de vignes.",
      sections: [
        {
          h: "Itinéraire libre, à l'heure",
          p: "Demi-journée ou journée complète : le chauffeur vous attend entre chaque visite, transporte vos achats et adapte le programme si une dégustation s'éternise.",
        },
        {
          h: "Grande Champagne et Borderies",
          p: "Jarnac, Segonzac, Bourg-Charente, Bouteville, Ars, Cherves-Richemont : les grandes maisons comme les propriétés familiales sont accessibles dans la journée.",
        },
        {
          h: "Un véhicule discret et silencieux",
          p: "La BMW iX1 n'émet ni bruit ni odeur d'échappement dans les cours de chais : un détail que les maîtres de chai apprécient.",
        },
      ],
      bullets: [
        "Tarification horaire claire, sans surprise",
        "Transport sécurisé des bouteilles achetées",
        "Prise en charge à l'hôtel, à la gare ou à l'aéroport",
        "Chauffeur francophone et anglophone",
      ],
      faq: [
        {
          q: "Réservez-vous les visites de chais ?",
          a: "Nous pouvons vous orienter vers les maisons ouvertes à la visite, mais les réservations restent à votre nom.",
        },
        {
          q: "Quelle est la durée minimale d'une mise à disposition ?",
          a: "La demi-journée, soit quatre heures, week-ends compris.",
        },
      ],
    },
    en: {
      title: "Jarnac → Cellars & vineyards",
      h1: "Cognac vineyard and cellar day with a private driver",
      metaTitle: "Private driver for Cognac & Jarnac vineyards — fully electric",
      metaDescription:
        "Hourly private driver to visit the cellars of Cognac, Jarnac and Segonzac. BMW iX1 électrique / van Mercedes 7 places, free itinerary, safe tastings.",
      lead:
        "Tasting and driving don't mix. We stay at your disposal by the hour: you pick the houses, we handle the vineyard roads.",
      sections: [
        {
          h: "Free itinerary, by the hour",
          p: "Half day or full day: the driver waits between visits, carries your purchases and adapts if a tasting runs long.",
        },
        {
          h: "Grande Champagne and Borderies",
          p: "Jarnac, Segonzac, Bourg-Charente, Bouteville, Ars, Cherves-Richemont: both big houses and family estates fit into a single day.",
        },
        {
          h: "A quiet, discreet car",
          p: "The BMW iX1 brings no noise and no exhaust fumes into the cellar courtyards — something cellar masters appreciate.",
        },
      ],
      bullets: [
        "Clear hourly pricing, no surprises",
        "Safe transport for the bottles you buy",
        "Pickup at your hotel, station or airport",
        "French and English speaking driver",
      ],
      faq: [
        {
          q: "Do you book the cellar tours?",
          a: "We can point you to houses open to visitors, but bookings stay in your name.",
        },
        {
          q: "What is the minimum hire?",
          a: "Half a day — four hours — weekends included.",
        },
      ],
    },
  },
  {
    slug: "taxi-conventionne-charente",
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
