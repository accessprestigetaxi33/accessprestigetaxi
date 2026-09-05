// Pages locales (villes de Charente-Maritime).
// Chaque ville possède un contenu unique FR/EN + une FAQ locale servant
// à la fois à l'affichage et au bloc Schema.org FAQPage de la page.

export type VilleCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  sections: { h: string; p: string }[];
  bullets: string[];
  faq: { q: string; a: string }[];
};

export type Ville = {
  slug: string;
  name: string;
  postal: string;
  lat: number;
  lng: number;
  /** Communes desservies autour de la ville (maillage local). */
  around: string[];
  /** Commune de l'île d'Oléron (maillage vers la page /taxi-oleron). */
  island?: boolean;
  /** Commune du bassin de Marennes (maillage vers la page /taxi-marennes). */
  marennes?: boolean;
  fr: VilleCopy;
  en: VilleCopy;
};

export const VILLES: Ville[] = [
  {
    slug: "la-rochelle",
    name: "La Rochelle",
    postal: "17000",
    lat: 46.1591,
    lng: -1.1520,
    around: ["Lagord", "Puilboreau", "Aytré", "Angoulins", "Châtelaillon-Plage", "Nieul-sur-Mer", "Périgny"],
    fr: {
      metaTitle: "Taxi La Rochelle (17) — électrique, conventionné | Access Prestige Taxi",
      metaDescription:
        "Taxi à La Rochelle : transferts gare et aéroport, transport sanitaire conventionné avec fauteuil roulant, transport de groupe 8 places, toutes distances. Réservation en ligne.",
      h1: "Taxi à La Rochelle",
      lead:
        "Access Prestige Taxi dessert La Rochelle et son agglomération avec deux chauffeurs indépendants : une BMW iX1 100 % électrique, un Audi Q6 e-tron et un van Mercedes classe V 8 places. Transferts gare et aéroport, transport sanitaire conventionné et prestations toutes distances.",
      sections: [
        {
          h: "Gare de La Rochelle et aéroport Île de Ré",
          p: "La gare SNCF du boulevard Joffre et l'aéroport La Rochelle-Île de Ré sont à quelques minutes du Vieux-Port. Nous suivons l'horaire réel de votre train ou de votre vol, prenons vos bagages et vous déposons devant le hall.",
        },
        {
          h: "Transport sanitaire conventionné",
          p: "Consultations au groupe hospitalier de La Rochelle, dialyses, séances de radiothérapie ou hospitalisations : le transport assis professionnalisé est pris en charge sur prescription médicale, avec transport en fauteuil roulant possible.",
        },
        {
          h: "Toute l'agglomération rochelaise",
          p: "Lagord, Puilboreau, Aytré, Angoulins, Châtelaillon-Plage, Nieul-sur-Mer, Périgny : nous venons vous chercher à domicile, à l'hôtel, au camping ou au bureau, et nous nous déplaçons partout en France.",
        },
      ],
      bullets: [
        "Transferts gare de La Rochelle et aéroport Île de Ré",
        "Transport sanitaire conventionné, fauteuil roulant possible",
        "Van Mercedes classe V 8 places pour les groupes",
        "Sièges bébé et rehausseurs enfants sur demande",
        "Prestations toutes distances, France et Europe",
      ],
      faq: [
        {
          q: "Comment réserver un taxi à La Rochelle ?",
          a: "Vous pouvez réserver en ligne en moins d'une minute depuis la page Réserver, demander un devis détaillé, ou appeler directement Alain au 06 03 44 48 63 ou Patricia au 06 50 26 00 15.",
        },
        {
          q: "Faites-vous le transfert vers l'aéroport de La Rochelle-Île de Ré ?",
          a: "Oui. Le trajet depuis le centre de La Rochelle dure environ douze minutes. Nous suivons l'horaire réel du vol et l'attente est offerte pendant les trente premières minutes après l'atterrissage.",
        },
        {
          q: "Votre taxi est-il conventionné pour le transport sanitaire à La Rochelle ?",
          a: "Oui, nous sommes conventionnés. Le transport assis professionnalisé vers les établissements de santé de La Rochelle est pris en charge sur prescription médicale, et le transport avec fauteuil roulant est possible.",
        },
        {
          q: "Pouvez-vous transporter un groupe depuis La Rochelle ?",
          a: "Oui, le van Mercedes classe V d'Alain accueille jusqu'à 8 passagers avec un grand volume de bagages : familles, mariages, déplacements professionnels ou transferts de groupe.",
        },
        {
          q: "Acceptez-vous les longues distances au départ de La Rochelle ?",
          a: "Oui, nous assurons toutes distances, partout en France et en Europe, pour tous types de prestations, avec un prix annoncé avant le départ.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi in La Rochelle (17) — electric & covered | Access Prestige Taxi",
      metaDescription:
        "Taxi in La Rochelle: station and airport transfers, covered medical transport with wheelchair, 8-seat group transport, all distances. Book online.",
      h1: "Taxi in La Rochelle",
      lead:
        "Access Prestige Taxi serves La Rochelle and its surroundings with two independent drivers: a fully electric BMW iX1, an Audi Q6 e-tron and an 8-seat Mercedes V-Class van. Station and airport transfers, covered medical transport and all-distance services.",
      sections: [
        {
          h: "La Rochelle station and Île de Ré airport",
          p: "The SNCF station and La Rochelle-Île de Ré airport are minutes from the Old Port. We track your actual train or flight time, handle your luggage and drop you at the terminal door.",
        },
        {
          h: "Covered medical transport",
          p: "Appointments at La Rochelle hospital, dialysis, radiotherapy or hospital stays: professional seated transport is covered with a doctor's prescription, and wheelchair transport is available.",
        },
        {
          h: "The whole La Rochelle area",
          p: "Lagord, Puilboreau, Aytré, Angoulins, Châtelaillon-Plage, Nieul-sur-Mer, Périgny: we pick you up at home, at your hotel, campsite or office, and drive anywhere in France.",
        },
      ],
      bullets: [
        "La Rochelle station and Île de Ré airport transfers",
        "Covered medical transport, wheelchair available",
        "8-seat Mercedes V-Class van for groups",
        "Baby and booster seats on request",
        "All distances, France and Europe",
      ],
      faq: [
        {
          q: "How do I book a taxi in La Rochelle?",
          a: "Book online in under a minute on the Booking page, request a detailed quote, or call Alain on +33 6 03 44 48 63 or Patricia on +33 6 50 26 00 15.",
        },
        {
          q: "Do you transfer to La Rochelle-Île de Ré airport?",
          a: "Yes. The ride from central La Rochelle takes about twelve minutes. We track the actual flight time and the first thirty minutes of waiting after landing are free.",
        },
        {
          q: "Is your taxi covered for medical transport in La Rochelle?",
          a: "Yes, we are approved by the French health service. Seated medical transport to La Rochelle healthcare facilities is covered with a prescription, and wheelchair transport is available.",
        },
        {
          q: "Can you carry a group from La Rochelle?",
          a: "Yes, Alain's Mercedes V-Class van seats up to 8 passengers with generous luggage space: families, weddings, business trips or group transfers.",
        },
        {
          q: "Do you accept long distances from La Rochelle?",
          a: "Yes, we cover all distances anywhere in France and Europe, for every type of journey, with the price quoted before departure.",
        },
      ],
    },
  },
  {
    slug: "rochefort",
    name: "Rochefort",
    postal: "17300",
    lat: 45.9421,
    lng: -0.9611,
    around: ["Tonnay-Charente", "Échillais", "Fouras", "Saint-Agnant", "Soubise", "Port-des-Barques"],
    fr: {
      metaTitle: "Taxi Rochefort (17) — conventionné & électrique | Access Prestige Taxi",
      metaDescription:
        "Taxi à Rochefort : gare, thermes, transport sanitaire conventionné avec fauteuil roulant, transferts aéroports, van 8 places, toutes distances. Devis rapide.",
      h1: "Taxi à Rochefort",
      lead:
        "De la Corderie Royale aux thermes, Access Prestige Taxi assure vos déplacements à Rochefort et dans le pays rochefortais : cures, rendez-vous médicaux, gare, aéroports et trajets longue distance.",
      sections: [
        {
          h: "Cures thermales et rendez-vous médicaux",
          p: "Les curistes des thermes de Rochefort profitent d'un transport ponctuel matin et soir. Pour les hôpitaux et centres de soins, le transport assis professionnalisé conventionné est assuré, fauteuil roulant compris.",
        },
        {
          h: "Gare de Rochefort et aéroports",
          p: "Liaison directe avec la gare de Rochefort, la gare de La Rochelle, les aéroports de La Rochelle-Île de Ré, Bordeaux-Mérignac et Nantes-Atlantique, avec suivi des horaires réels.",
        },
        {
          h: "Autour de Rochefort",
          p: "Tonnay-Charente, Échillais, Fouras, Saint-Agnant, Soubise ou Port-des-Barques : nous couvrons tout le bassin, y compris les liaisons vers l'île d'Aix et l'île d'Oléron.",
        },
      ],
      bullets: [
        "Transport de curistes vers les thermes de Rochefort",
        "Transport sanitaire conventionné, fauteuil roulant possible",
        "Gares et tous aéroports, toutes distances",
        "Van 8 places pour les groupes et les bagages volumineux",
        "Prix annoncé avant le départ",
      ],
      faq: [
        {
          q: "Assurez-vous le transport des curistes à Rochefort ?",
          a: "Oui. Nous organisons des allers-retours réguliers vers les thermes de Rochefort pendant toute la durée de la cure, avec des horaires fixés à l'avance.",
        },
        {
          q: "Le transport sanitaire est-il conventionné à Rochefort ?",
          a: "Oui, nous sommes conventionnés : consultations, hospitalisations, dialyses et séances de soins sont prises en charge sur prescription médicale, avec transport en fauteuil roulant possible.",
        },
        {
          q: "Combien de temps faut-il entre Rochefort et l'aéroport de La Rochelle ?",
          a: "Comptez environ trente-cinq minutes selon le trafic. Nous partons en fonction de l'horaire réel de votre vol et l'attente est offerte trente minutes après l'atterrissage.",
        },
        {
          q: "Pouvez-vous venir nous chercher à Fouras ou Tonnay-Charente ?",
          a: "Oui, nous desservons tout le pays rochefortais, dont Fouras, Tonnay-Charente, Échillais, Soubise et Port-des-Barques, ainsi que l'embarcadère pour l'île d'Aix.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi in Rochefort (17) — covered & electric | Access Prestige Taxi",
      metaDescription:
        "Taxi in Rochefort: station, spa treatments, covered medical transport with wheelchair, airport transfers, 8-seat van, all distances. Fast quote.",
      h1: "Taxi in Rochefort",
      lead:
        "From the Corderie Royale to the thermal spa, Access Prestige Taxi handles your journeys in Rochefort and the surrounding area: spa courses, medical appointments, stations, airports and long-distance trips.",
      sections: [
        {
          h: "Spa courses and medical appointments",
          p: "Spa guests in Rochefort get punctual morning and evening transfers. For hospitals and care centres, covered professional seated transport is available, wheelchair included.",
        },
        {
          h: "Rochefort station and airports",
          p: "Direct links to Rochefort station, La Rochelle station and the La Rochelle-Île de Ré, Bordeaux-Mérignac and Nantes-Atlantique airports, with real-time schedule tracking.",
        },
        {
          h: "Around Rochefort",
          p: "Tonnay-Charente, Échillais, Fouras, Saint-Agnant, Soubise or Port-des-Barques: we cover the whole area, including links to Île d'Aix and Île d'Oléron.",
        },
      ],
      bullets: [
        "Transfers to the Rochefort thermal spa",
        "Covered medical transport, wheelchair available",
        "All stations and airports, all distances",
        "8-seat van for groups and bulky luggage",
        "Price quoted before departure",
      ],
      faq: [
        {
          q: "Do you drive spa guests in Rochefort?",
          a: "Yes. We arrange regular return trips to the Rochefort thermal spa for the whole duration of your course, at times agreed in advance.",
        },
        {
          q: "Is medical transport covered in Rochefort?",
          a: "Yes, we are approved: appointments, hospital stays, dialysis and treatment sessions are covered with a prescription, and wheelchair transport is available.",
        },
        {
          q: "How long is the trip from Rochefort to La Rochelle airport?",
          a: "About thirty-five minutes depending on traffic. We leave according to your actual flight time and the first thirty minutes of waiting after landing are free.",
        },
        {
          q: "Can you pick us up in Fouras or Tonnay-Charente?",
          a: "Yes, we serve the whole Rochefort area, including Fouras, Tonnay-Charente, Échillais, Soubise and Port-des-Barques, as well as the Île d'Aix ferry pier.",
        },
      ],
    },
  },
  {
    slug: "royan",
    name: "Royan",
    postal: "17200",
    lat: 45.6237,
    lng: -1.0281,
    around: ["Saint-Palais-sur-Mer", "Vaux-sur-Mer", "Saint-Georges-de-Didonne", "Pontaillac", "Meschers-sur-Gironde", "La Palmyre"],
    fr: {
      metaTitle: "Taxi Royan (17) — électrique, groupes & sanitaire | Access Prestige Taxi",
      metaDescription:
        "Taxi à Royan : plages, La Palmyre, transferts gares et aéroports, transport sanitaire conventionné, van 8 places pour les groupes. Toutes distances.",
      h1: "Taxi à Royan",
      lead:
        "Access Prestige Taxi vous conduit à Royan et sur toute la Côte de Beauté : plages de Pontaillac et Saint-Palais, zoo de La Palmyre, bac de Royan-Le Verdon, gares et aéroports, en électrique ou en van 8 places.",
      sections: [
        {
          h: "Côte de Beauté et bac du Verdon",
          p: "Saint-Palais-sur-Mer, Vaux-sur-Mer, Saint-Georges-de-Didonne, Meschers ou La Palmyre : nous desservons toutes les stations, y compris les correspondances avec le bac Royan-Le Verdon.",
        },
        {
          h: "Vacances et transport de groupe",
          p: "Arrivées en location saisonnière, hôtels, campings ou résidences : le van Mercedes classe V accueille 8 passagers avec valises, poussettes et matériel de plage en un seul trajet.",
        },
        {
          h: "Rendez-vous médicaux",
          p: "Transport assis professionnalisé conventionné vers l'hôpital de Royan et les cabinets de la région, avec transport en fauteuil roulant possible sur demande.",
        },
      ],
      bullets: [
        "Desserte de toute la Côte de Beauté",
        "Van 8 places pour familles et groupes",
        "Transport sanitaire conventionné, fauteuil roulant possible",
        "Transferts gares, aéroports et longues distances",
        "Sièges bébé et rehausseurs sur demande",
      ],
      faq: [
        {
          q: "Desservez-vous les plages et campings autour de Royan ?",
          a: "Oui, nous desservons Pontaillac, Saint-Palais-sur-Mer, Vaux-sur-Mer, Saint-Georges-de-Didonne, Meschers-sur-Gironde et La Palmyre, ainsi que les campings et résidences de la Côte de Beauté.",
        },
        {
          q: "Pouvez-vous transporter une famille de 7 ou 8 personnes à Royan ?",
          a: "Oui, le van Mercedes classe V 8 places permet de voyager ensemble avec les bagages, en un seul trajet et à un seul tarif.",
        },
        {
          q: "Faites-vous les transferts depuis l'aéroport de Bordeaux vers Royan ?",
          a: "Oui, nous assurons toutes distances, dont les transferts depuis les aéroports de Bordeaux-Mérignac, La Rochelle et Nantes vers Royan, avec suivi des vols.",
        },
        {
          q: "Le transport médical est-il pris en charge à Royan ?",
          a: "Oui, nous sommes conventionnés : sur prescription médicale, vos trajets vers l'hôpital de Royan ou vos centres de soins sont pris en charge, fauteuil roulant possible.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi in Royan (17) — electric, groups & medical | Access Prestige Taxi",
      metaDescription:
        "Taxi in Royan: beaches, La Palmyre, station and airport transfers, covered medical transport, 8-seat van for groups. All distances.",
      h1: "Taxi in Royan",
      lead:
        "Access Prestige Taxi drives you around Royan and the whole Côte de Beauté: Pontaillac and Saint-Palais beaches, La Palmyre zoo, the Royan-Le Verdon ferry, stations and airports, electric or in an 8-seat van.",
      sections: [
        {
          h: "Côte de Beauté and Le Verdon ferry",
          p: "Saint-Palais-sur-Mer, Vaux-sur-Mer, Saint-Georges-de-Didonne, Meschers or La Palmyre: we serve every resort, including connections with the Royan-Le Verdon ferry.",
        },
        {
          h: "Holidays and group transport",
          p: "Arrivals at holiday rentals, hotels, campsites or residences: the Mercedes V-Class van carries 8 passengers with suitcases, pushchairs and beach gear in a single trip.",
        },
        {
          h: "Medical appointments",
          p: "Covered professional seated transport to Royan hospital and local practices, with wheelchair transport available on request.",
        },
      ],
      bullets: [
        "Service across the whole Côte de Beauté",
        "8-seat van for families and groups",
        "Covered medical transport, wheelchair available",
        "Station, airport and long-distance transfers",
        "Baby and booster seats on request",
      ],
      faq: [
        {
          q: "Do you serve the beaches and campsites around Royan?",
          a: "Yes, we serve Pontaillac, Saint-Palais-sur-Mer, Vaux-sur-Mer, Saint-Georges-de-Didonne, Meschers-sur-Gironde and La Palmyre, plus the campsites and residences of the Côte de Beauté.",
        },
        {
          q: "Can you carry a family of 7 or 8 in Royan?",
          a: "Yes, the 8-seat Mercedes V-Class van lets you travel together with your luggage, in one trip and at one fare.",
        },
        {
          q: "Do you transfer from Bordeaux airport to Royan?",
          a: "Yes, we cover all distances, including transfers from Bordeaux-Mérignac, La Rochelle and Nantes airports to Royan, with flight tracking.",
        },
        {
          q: "Is medical transport covered in Royan?",
          a: "Yes, we are approved: with a prescription, your trips to Royan hospital or your care centres are covered, wheelchair available.",
        },
      ],
    },
  },
  {
    slug: "saintes",
    name: "Saintes",
    postal: "17100",
    lat: 45.7460,
    lng: -0.6337,
    around: ["Chaniers", "Fontcouverte", "Les Gonds", "Pons", "Burie", "Saint-Georges-des-Coteaux"],
    fr: {
      metaTitle: "Taxi Saintes (17) — gare, hôpital, toutes distances | Access Prestige Taxi",
      metaDescription:
        "Taxi à Saintes : gare TGV, hôpital de Saintonge, transport sanitaire conventionné avec fauteuil roulant, van 8 places, transferts aéroports et longues distances.",
      h1: "Taxi à Saintes",
      lead:
        "Ville d'art et d'histoire au cœur de la Saintonge, Saintes est un carrefour ferroviaire et médical. Nous y assurons les transferts gare, les trajets vers l'hôpital de Saintonge et les prestations toutes distances.",
      sections: [
        {
          h: "Gare de Saintes et correspondances",
          p: "Départs et arrivées suivis en temps réel, prise en charge sur le parvis de la gare, correspondances vers Bordeaux, Angoulême, Niort, La Rochelle et Royan.",
        },
        {
          h: "Hôpital de Saintonge et transport conventionné",
          p: "Consultations, hospitalisations, dialyses et chimiothérapies : le transport assis professionnalisé est pris en charge sur prescription médicale, avec transport en fauteuil roulant possible.",
        },
        {
          h: "Saintonge et vignoble",
          p: "Chaniers, Fontcouverte, Les Gonds, Pons, Burie ou Saint-Georges-des-Coteaux : mises à disposition à la demi-journée ou à la journée pour vos visites de domaines et d'abbayes.",
        },
      ],
      bullets: [
        "Transferts gare de Saintes, jour et nuit",
        "Transport sanitaire conventionné vers l'hôpital de Saintonge",
        "Mise à disposition demi-journée, journée ou événementiel",
        "Van Mercedes 8 places pour les groupes",
        "Prestations toutes distances en France et en Europe",
      ],
      faq: [
        {
          q: "Peut-on réserver un taxi à l'avance pour la gare de Saintes ?",
          a: "Oui, la réservation en ligne se fait en moins d'une minute et vous pouvez indiquer votre numéro de train : nous suivons son horaire réel le jour du trajet.",
        },
        {
          q: "Le trajet vers l'hôpital de Saintonge est-il remboursé ?",
          a: "Oui, nous sommes conventionnés. Avec une prescription médicale, le transport assis professionnalisé vers l'hôpital de Saintonge est pris en charge, fauteuil roulant possible.",
        },
        {
          q: "Proposez-vous une mise à disposition avec chauffeur à Saintes ?",
          a: "Oui, à la demi-journée, à la journée complète ou pour un événement : votre chauffeur reste à votre disposition, y compris pour les visites de domaines de Saintonge.",
        },
        {
          q: "Allez-vous de Saintes vers Bordeaux ou Angoulême ?",
          a: "Oui, nous assurons toutes distances : Bordeaux, Angoulême, Niort, Poitiers ou plus loin, avec un prix annoncé avant le départ.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi in Saintes (17) — station, hospital, all distances | Access Prestige Taxi",
      metaDescription:
        "Taxi in Saintes: TGV station, Saintonge hospital, covered medical transport with wheelchair, 8-seat van, airport transfers and long distances.",
      h1: "Taxi in Saintes",
      lead:
        "A city of art and history at the heart of Saintonge, Saintes is both a rail and a medical hub. We handle station transfers, trips to Saintonge hospital and all-distance journeys.",
      sections: [
        {
          h: "Saintes station and connections",
          p: "Departures and arrivals tracked in real time, pickup on the station forecourt, connections to Bordeaux, Angoulême, Niort, La Rochelle and Royan.",
        },
        {
          h: "Saintonge hospital and covered transport",
          p: "Appointments, hospital stays, dialysis and chemotherapy: seated medical transport is covered with a prescription, and wheelchair transport is available.",
        },
        {
          h: "Saintonge and its vineyards",
          p: "Chaniers, Fontcouverte, Les Gonds, Pons, Burie or Saint-Georges-des-Coteaux: half-day or full-day chauffeur hire for your estate and abbey visits.",
        },
      ],
      bullets: [
        "Saintes station transfers, day and night",
        "Covered medical transport to Saintonge hospital",
        "Half-day, full-day or event chauffeur hire",
        "8-seat Mercedes van for groups",
        "All distances across France and Europe",
      ],
      faq: [
        {
          q: "Can I book a taxi in advance for Saintes station?",
          a: "Yes, online booking takes under a minute and you can enter your train number: we track its actual schedule on the day.",
        },
        {
          q: "Is the trip to Saintonge hospital reimbursed?",
          a: "Yes, we are approved. With a prescription, seated medical transport to Saintonge hospital is covered, wheelchair available.",
        },
        {
          q: "Do you offer chauffeur hire in Saintes?",
          a: "Yes, by the half-day, the full day or for an event: your driver stays at your disposal, including for Saintonge estate visits.",
        },
        {
          q: "Do you drive from Saintes to Bordeaux or Angoulême?",
          a: "Yes, we cover all distances: Bordeaux, Angoulême, Niort, Poitiers and beyond, with the price quoted before departure.",
        },
      ],
    },
  },
  {
    slug: "saint-jean-d-angely",
    name: "Saint-Jean-d'Angély",
    postal: "17400",
    lat: 45.9447,
    lng: -0.5222,
    around: ["Matha", "Aulnay", "Saint-Savinien", "Tonnay-Boutonne", "Loulay"],
    fr: {
      metaTitle: "Taxi Saint-Jean-d'Angély (17) — conventionné | Access Prestige Taxi",
      metaDescription:
        "Taxi à Saint-Jean-d'Angély : transport sanitaire conventionné avec fauteuil roulant, gares, aéroports, van 8 places et prestations toutes distances.",
      h1: "Taxi à Saint-Jean-d'Angély",
      lead:
        "Au cœur de la vallée de la Boutonne, Saint-Jean-d'Angély et ses communes voisines sont desservies pour les rendez-vous médicaux, les liaisons vers les gares et aéroports et les trajets longue distance.",
      sections: [
        {
          h: "Rendez-vous médicaux et transport conventionné",
          p: "Centre hospitalier de Saint-Jean-d'Angély, consultations à Saintes, Niort ou La Rochelle : le transport assis professionnalisé est pris en charge sur prescription, fauteuil roulant possible.",
        },
        {
          h: "Gares et aéroports",
          p: "Liaisons vers les gares de Saintes, Niort, Surgères et La Rochelle, et vers les aéroports de La Rochelle, Bordeaux et Nantes, avec suivi des horaires réels.",
        },
        {
          h: "Vallée de la Boutonne",
          p: "Matha, Aulnay, Saint-Savinien, Tonnay-Boutonne, Loulay : dans les communes rurales, nous venons vous chercher à domicile, y compris pour des trajets réguliers.",
        },
      ],
      bullets: [
        "Transport sanitaire conventionné, fauteuil roulant possible",
        "Trajets réguliers depuis les communes rurales",
        "Toutes gares et tous aéroports",
        "Van 8 places pour les groupes et les familles",
        "Prestations toutes distances, prix annoncé",
      ],
      faq: [
        {
          q: "Venez-vous chercher les clients dans les villages autour de Saint-Jean-d'Angély ?",
          a: "Oui, nous desservons notamment Matha, Aulnay, Saint-Savinien, Tonnay-Boutonne et Loulay, à domicile, y compris pour des trajets réguliers.",
        },
        {
          q: "Le transport vers l'hôpital est-il conventionné ?",
          a: "Oui. Sur prescription médicale, le transport assis professionnalisé vers le centre hospitalier de Saint-Jean-d'Angély ou vers Saintes, Niort et La Rochelle est pris en charge.",
        },
        {
          q: "Puis-je réserver un taxi tôt le matin pour un train ?",
          a: "Oui, réservez à l'avance en ligne ou par téléphone en précisant votre horaire de train : nous adaptons l'heure de prise en charge au trajet à effectuer.",
        },
        {
          q: "Proposez-vous un véhicule pour un groupe ?",
          a: "Oui, le van Mercedes classe V 8 places est disponible pour les familles, les groupes et les déplacements professionnels avec bagages volumineux.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi in Saint-Jean-d'Angély (17) — covered | Access Prestige Taxi",
      metaDescription:
        "Taxi in Saint-Jean-d'Angély: covered medical transport with wheelchair, stations, airports, 8-seat van and all-distance journeys.",
      h1: "Taxi in Saint-Jean-d'Angély",
      lead:
        "In the heart of the Boutonne valley, Saint-Jean-d'Angély and its neighbouring villages are served for medical appointments, station and airport links and long-distance trips.",
      sections: [
        {
          h: "Medical appointments and covered transport",
          p: "Saint-Jean-d'Angély hospital, appointments in Saintes, Niort or La Rochelle: seated medical transport is covered with a prescription, wheelchair available.",
        },
        {
          h: "Stations and airports",
          p: "Links to Saintes, Niort, Surgères and La Rochelle stations, and to La Rochelle, Bordeaux and Nantes airports, with real-time schedule tracking.",
        },
        {
          h: "Boutonne valley",
          p: "Matha, Aulnay, Saint-Savinien, Tonnay-Boutonne, Loulay: in rural villages we pick you up at home, including for regular journeys.",
        },
      ],
      bullets: [
        "Covered medical transport, wheelchair available",
        "Regular journeys from rural villages",
        "All stations and airports",
        "8-seat van for groups and families",
        "All distances, price quoted upfront",
      ],
      faq: [
        {
          q: "Do you pick up customers in the villages around Saint-Jean-d'Angély?",
          a: "Yes, we serve Matha, Aulnay, Saint-Savinien, Tonnay-Boutonne and Loulay among others, door to door, including for regular journeys.",
        },
        {
          q: "Is hospital transport covered?",
          a: "Yes. With a prescription, seated medical transport to Saint-Jean-d'Angély hospital or to Saintes, Niort and La Rochelle is covered.",
        },
        {
          q: "Can I book a taxi early in the morning for a train?",
          a: "Yes, book ahead online or by phone with your train time: we set the pickup time to match the journey.",
        },
        {
          q: "Do you have a vehicle for a group?",
          a: "Yes, the 8-seat Mercedes V-Class van is available for families, groups and business trips with bulky luggage.",
        },
      ],
    },
  },
  {
    slug: "taxi-le-chateau-d-oleron",
    name: "Le Château-d'Oléron",
    postal: "17480",
    lat: 45.8869,
    lng: -1.1969,
    island: true,
    around: ["Ors", "La Gaconnière", "Bourcefranc-le-Chapus", "Dolus-d'Oléron", "Saint-Trojan-les-Bains"],
    fr: {
      metaTitle: "Taxi Le Château-d'Oléron — horaires, tarifs | Access Prestige Taxi",
      metaDescription:
        "Taxi Le Château-d'Oléron, île d'Oléron : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      h1: "Taxi Le Château-d'Oléron (île d'Oléron)",
      lead:
        "Access Prestige Taxi dessert Le Château-d'Oléron et toute l'île d'Oléron avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 15 minutes depuis Marennes par le viaduc.",
      sections: [
        {
          h: "Un taxi qui connaît Le Château-d'Oléron",
          p: "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour la citadelle et le port aux cabanes colorées que pour un rendez-vous, un train ou un avion. Nos chauffeurs vivent la circulation de l'île toute l'année, y compris en pleine saison.",
        },
        {
          h: "Horaires et tarifs",
          p: "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course.",
        },
        {
          h: "Transferts, santé et groupes",
          p: "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée sur l'île.",
        },
      ],
      bullets: [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Ors, La Gaconnière, Bourcefranc-le-Chapus, Dolus-d'Oléron, Saint-Trojan-les-Bains",
      ],
      faq: [
        {
          q: "Quels sont vos horaires à Le Château-d'Oléron ?",
          a: "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous.",
        },
        {
          q: "Combien coûte un taxi à Le Château-d'Oléron ?",
          a: "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi.",
        },
        {
          q: "Desservez-vous Le Château-d'Oléron depuis le continent ?",
          a: "Oui : 15 minutes depuis Marennes par le viaduc, environ 45 minutes depuis Rochefort et 1 h 15 depuis La Rochelle. Le viaduc est gratuit, aucun péage n'est ajouté à votre course.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi Le Château-d'Oléron — hours, fares | Access Prestige Taxi",
      metaDescription:
        "Taxi in Le Château-d'Oléron, Oléron island: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      h1: "Taxi Le Château-d'Oléron (Oléron island)",
      lead:
        "Access Prestige Taxi serves Le Château-d'Oléron and the whole of Oléron island with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 15 minutes from Marennes over the viaduct.",
      sections: [
        {
          h: "A driver who knows Le Château-d'Oléron",
          p: "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the citadel and the colourful oyster huts harbour or to an appointment, a train or a flight. Our drivers deal with island traffic all year round, peak season included.",
        },
        {
          h: "Opening hours and fares",
          p: "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride.",
        },
        {
          h: "Transfers, healthcare and groups",
          p: "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire on the island.",
        },
      ],
      bullets: [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Ors, La Gaconnière, Bourcefranc-le-Chapus, Dolus-d'Oléron, Saint-Trojan-les-Bains",
      ],
      faq: [
        {
          q: "What are your opening hours in Le Château-d'Oléron?",
          a: "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment.",
        },
        {
          q: "How much does a taxi cost in Le Château-d'Oléron?",
          a: "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding.",
        },
        {
          q: "Do you drive to Le Château-d'Oléron from the mainland?",
          a: "Yes: 15 minutes from Marennes over the viaduct, around 45 minutes from Rochefort and 1h15 from La Rochelle. The viaduct is free, so no toll is added to your fare.",
        },
      ],
    },
  },
  {
    slug: "taxi-saint-trojan-les-bains",
    name: "Saint-Trojan-les-Bains",
    postal: "17370",
    lat: 45.8383,
    lng: -1.205,
    island: true,
    around: ["Grand-Village-Plage", "Le Château-d'Oléron", "Dolus-d'Oléron", "La Giraudière"],
    fr: {
      metaTitle: "Taxi Saint-Trojan-les-Bains — horaires, tarifs | Access Prestige Taxi",
      metaDescription:
        "Taxi Saint-Trojan-les-Bains, île d'Oléron : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      h1: "Taxi Saint-Trojan-les-Bains (île d'Oléron)",
      lead:
        "Access Prestige Taxi dessert Saint-Trojan-les-Bains et toute l'île d'Oléron avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 25 minutes depuis Marennes.",
      sections: [
        {
          h: "Un taxi qui connaît Saint-Trojan-les-Bains",
          p: "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour la forêt domaniale, la plage de Gatseau et le petit train que pour un rendez-vous, un train ou un avion. Nos chauffeurs vivent la circulation de l'île toute l'année, y compris en pleine saison.",
        },
        {
          h: "Horaires et tarifs",
          p: "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course.",
        },
        {
          h: "Transferts, santé et groupes",
          p: "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée sur l'île.",
        },
      ],
      bullets: [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Grand-Village-Plage, Le Château-d'Oléron, Dolus-d'Oléron, La Giraudière",
      ],
      faq: [
        {
          q: "Quels sont vos horaires à Saint-Trojan-les-Bains ?",
          a: "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous.",
        },
        {
          q: "Combien coûte un taxi à Saint-Trojan-les-Bains ?",
          a: "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi.",
        },
        {
          q: "Desservez-vous Saint-Trojan-les-Bains depuis le continent ?",
          a: "Oui : 25 minutes depuis Marennes, environ 45 minutes depuis Rochefort et 1 h 15 depuis La Rochelle. Le viaduc est gratuit, aucun péage n'est ajouté à votre course.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi Saint-Trojan-les-Bains — hours, fares | Access Prestige Taxi",
      metaDescription:
        "Taxi in Saint-Trojan-les-Bains, Oléron island: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      h1: "Taxi Saint-Trojan-les-Bains (Oléron island)",
      lead:
        "Access Prestige Taxi serves Saint-Trojan-les-Bains and the whole of Oléron island with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 25 minutes from Marennes.",
      sections: [
        {
          h: "A driver who knows Saint-Trojan-les-Bains",
          p: "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the state forest, Gatseau beach and the little tourist train or to an appointment, a train or a flight. Our drivers deal with island traffic all year round, peak season included.",
        },
        {
          h: "Opening hours and fares",
          p: "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride.",
        },
        {
          h: "Transfers, healthcare and groups",
          p: "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire on the island.",
        },
      ],
      bullets: [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Grand-Village-Plage, Le Château-d'Oléron, Dolus-d'Oléron, La Giraudière",
      ],
      faq: [
        {
          q: "What are your opening hours in Saint-Trojan-les-Bains?",
          a: "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment.",
        },
        {
          q: "How much does a taxi cost in Saint-Trojan-les-Bains?",
          a: "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding.",
        },
        {
          q: "Do you drive to Saint-Trojan-les-Bains from the mainland?",
          a: "Yes: 25 minutes from Marennes, around 45 minutes from Rochefort and 1h15 from La Rochelle. The viaduct is free, so no toll is added to your fare.",
        },
      ],
    },
  },
  {
    slug: "taxi-dolus-d-oleron",
    name: "Dolus-d'Oléron",
    postal: "17550",
    lat: 45.9036,
    lng: -1.2622,
    island: true,
    around: ["La Rémigeasse", "Grand-Village-Plage", "Le Château-d'Oléron", "Saint-Pierre-d'Oléron"],
    fr: {
      metaTitle: "Taxi Dolus-d'Oléron — horaires, tarifs | Access Prestige Taxi",
      metaDescription:
        "Taxi Dolus-d'Oléron, île d'Oléron : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      h1: "Taxi Dolus-d'Oléron (île d'Oléron)",
      lead:
        "Access Prestige Taxi dessert Dolus-d'Oléron et toute l'île d'Oléron avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 25 minutes depuis Marennes.",
      sections: [
        {
          h: "Un taxi qui connaît Dolus-d'Oléron",
          p: "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour le marais aux oiseaux, la plage de la Rémigeasse et les marchés que pour un rendez-vous, un train ou un avion. Nos chauffeurs vivent la circulation de l'île toute l'année, y compris en pleine saison.",
        },
        {
          h: "Horaires et tarifs",
          p: "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course.",
        },
        {
          h: "Transferts, santé et groupes",
          p: "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée sur l'île.",
        },
      ],
      bullets: [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : La Rémigeasse, Grand-Village-Plage, Le Château-d'Oléron, Saint-Pierre-d'Oléron",
      ],
      faq: [
        {
          q: "Quels sont vos horaires à Dolus-d'Oléron ?",
          a: "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous.",
        },
        {
          q: "Combien coûte un taxi à Dolus-d'Oléron ?",
          a: "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi.",
        },
        {
          q: "Desservez-vous Dolus-d'Oléron depuis le continent ?",
          a: "Oui : 25 minutes depuis Marennes, environ 45 minutes depuis Rochefort et 1 h 15 depuis La Rochelle. Le viaduc est gratuit, aucun péage n'est ajouté à votre course.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi Dolus-d'Oléron — hours, fares | Access Prestige Taxi",
      metaDescription:
        "Taxi in Dolus-d'Oléron, Oléron island: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      h1: "Taxi Dolus-d'Oléron (Oléron island)",
      lead:
        "Access Prestige Taxi serves Dolus-d'Oléron and the whole of Oléron island with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 25 minutes from Marennes.",
      sections: [
        {
          h: "A driver who knows Dolus-d'Oléron",
          p: "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the bird marsh, La Rémigeasse beach and the local markets or to an appointment, a train or a flight. Our drivers deal with island traffic all year round, peak season included.",
        },
        {
          h: "Opening hours and fares",
          p: "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride.",
        },
        {
          h: "Transfers, healthcare and groups",
          p: "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire on the island.",
        },
      ],
      bullets: [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: La Rémigeasse, Grand-Village-Plage, Le Château-d'Oléron, Saint-Pierre-d'Oléron",
      ],
      faq: [
        {
          q: "What are your opening hours in Dolus-d'Oléron?",
          a: "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment.",
        },
        {
          q: "How much does a taxi cost in Dolus-d'Oléron?",
          a: "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding.",
        },
        {
          q: "Do you drive to Dolus-d'Oléron from the mainland?",
          a: "Yes: 25 minutes from Marennes, around 45 minutes from Rochefort and 1h15 from La Rochelle. The viaduct is free, so no toll is added to your fare.",
        },
      ],
    },
  },
  {
    slug: "taxi-saint-pierre-d-oleron",
    name: "Saint-Pierre-d'Oléron",
    postal: "17310",
    lat: 45.9459,
    lng: -1.3086,
    island: true,
    around: ["La Cotinière", "Sauzelle", "Dolus-d'Oléron", "Saint-Georges-d'Oléron"],
    fr: {
      metaTitle: "Taxi Saint-Pierre-d'Oléron — horaires, tarifs | Access Prestige Taxi",
      metaDescription:
        "Taxi Saint-Pierre-d'Oléron, île d'Oléron : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      h1: "Taxi Saint-Pierre-d'Oléron (île d'Oléron)",
      lead:
        "Access Prestige Taxi dessert Saint-Pierre-d'Oléron et toute l'île d'Oléron avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 35 minutes depuis Marennes.",
      sections: [
        {
          h: "Un taxi qui connaît Saint-Pierre-d'Oléron",
          p: "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour le port de La Cotinière, le marché couvert et la lanterne des Morts que pour un rendez-vous, un train ou un avion. Nos chauffeurs vivent la circulation de l'île toute l'année, y compris en pleine saison.",
        },
        {
          h: "Horaires et tarifs",
          p: "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course.",
        },
        {
          h: "Transferts, santé et groupes",
          p: "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée sur l'île.",
        },
      ],
      bullets: [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : La Cotinière, Sauzelle, Dolus-d'Oléron, Saint-Georges-d'Oléron",
      ],
      faq: [
        {
          q: "Quels sont vos horaires à Saint-Pierre-d'Oléron ?",
          a: "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous.",
        },
        {
          q: "Combien coûte un taxi à Saint-Pierre-d'Oléron ?",
          a: "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi.",
        },
        {
          q: "Desservez-vous Saint-Pierre-d'Oléron depuis le continent ?",
          a: "Oui : 35 minutes depuis Marennes, environ 45 minutes depuis Rochefort et 1 h 15 depuis La Rochelle. Le viaduc est gratuit, aucun péage n'est ajouté à votre course.",
        },
      ],
    },
    en: {
      metaTitle: "Taxi Saint-Pierre-d'Oléron — hours, fares | Access Prestige Taxi",
      metaDescription:
        "Taxi in Saint-Pierre-d'Oléron, Oléron island: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      h1: "Taxi Saint-Pierre-d'Oléron (Oléron island)",
      lead:
        "Access Prestige Taxi serves Saint-Pierre-d'Oléron and the whole of Oléron island with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 35 minutes from Marennes.",
      sections: [
        {
          h: "A driver who knows Saint-Pierre-d'Oléron",
          p: "We pick you up at your address, hotel, campsite or harbour, whether you are heading to La Cotinière fishing harbour, the covered market and the Lantern of the Dead or to an appointment, a train or a flight. Our drivers deal with island traffic all year round, peak season included.",
        },
        {
          h: "Opening hours and fares",
          p: "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride.",
        },
        {
          h: "Transfers, healthcare and groups",
          p: "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire on the island.",
        },
      ],
      bullets: [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: La Cotinière, Sauzelle, Dolus-d'Oléron, Saint-Georges-d'Oléron",
      ],
      faq: [
        {
          q: "What are your opening hours in Saint-Pierre-d'Oléron?",
          a: "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment.",
        },
        {
          q: "How much does a taxi cost in Saint-Pierre-d'Oléron?",
          a: "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding.",
        },
        {
          q: "Do you drive to Saint-Pierre-d'Oléron from the mainland?",
          a: "Yes: 35 minutes from Marennes, around 45 minutes from Rochefort and 1h15 from La Rochelle. The viaduct is free, so no toll is added to your fare.",
        },
      ],
    },
  },
  {
    "slug": "taxi-bourcefranc-le-chapus",
    "name": "Bourcefranc-le-Chapus",
    "postal": "17560",
    "lat": 45.8478,
    "lng": -1.1503,
    "marennes": true,
    "around": [
      "Le Chapus",
      "Marennes-Hiers-Brouage",
      "Saint-Just-Luzac",
      "Le Château-d'Oléron"
    ],
    "fr": {
      "metaTitle": "Taxi Bourcefranc-le-Chapus (17560) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Bourcefranc-le-Chapus, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Bourcefranc-le-Chapus",
      "lead": "Access Prestige Taxi dessert Bourcefranc-le-Chapus et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 5 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Bourcefranc-le-Chapus",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour le port du Chapus, l'embarcadère de Fort Boyard et le viaduc d'Oléron que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Le Chapus, Marennes-Hiers-Brouage, Saint-Just-Luzac, Le Château-d'Oléron"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Bourcefranc-le-Chapus ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Bourcefranc-le-Chapus ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Bourcefranc-le-Chapus depuis Marennes ?",
          "a": "Oui : comptez 5 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Bourcefranc-le-Chapus (17560) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Bourcefranc-le-Chapus, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Bourcefranc-le-Chapus",
      "lead": "Access Prestige Taxi serves Bourcefranc-le-Chapus and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 5 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Bourcefranc-le-Chapus",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the Chapus harbour, the Fort Boyard boarding point and the Oléron viaduct or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Le Chapus, Marennes-Hiers-Brouage, Saint-Just-Luzac, Le Château-d'Oléron"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Bourcefranc-le-Chapus?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Bourcefranc-le-Chapus?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Bourcefranc-le-Chapus from Marennes?",
          "a": "Yes: allow 5 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-hiers-brouage",
    "name": "Hiers-Brouage",
    "postal": "17320",
    "lat": 45.8683,
    "lng": -1.0642,
    "marennes": true,
    "around": [
      "Marennes",
      "Saint-Sornin",
      "Saint-Just-Luzac",
      "Moëze"
    ],
    "fr": {
      "metaTitle": "Taxi Hiers-Brouage (17320) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Hiers-Brouage, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Hiers-Brouage",
      "lead": "Access Prestige Taxi dessert Hiers-Brouage et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 10 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Hiers-Brouage",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour la citadelle de Brouage, les marais et les cabanes ostréicoles que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Marennes, Saint-Sornin, Saint-Just-Luzac, Moëze"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Hiers-Brouage ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Hiers-Brouage ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Hiers-Brouage depuis Marennes ?",
          "a": "Oui : comptez 10 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Hiers-Brouage (17320) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Hiers-Brouage, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Hiers-Brouage",
      "lead": "Access Prestige Taxi serves Hiers-Brouage and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 10 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Hiers-Brouage",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the Brouage citadel, the marshes and the oyster huts or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Marennes, Saint-Sornin, Saint-Just-Luzac, Moëze"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Hiers-Brouage?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Hiers-Brouage?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Hiers-Brouage from Marennes?",
          "a": "Yes: allow 10 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-saint-just-luzac",
    "name": "Saint-Just-Luzac",
    "postal": "17320",
    "lat": 45.8069,
    "lng": -1.0292,
    "marennes": true,
    "around": [
      "Marennes",
      "Nieulle-sur-Seudre",
      "Bourcefranc-le-Chapus",
      "Le Gua"
    ],
    "fr": {
      "metaTitle": "Taxi Saint-Just-Luzac (17320) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Saint-Just-Luzac, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Saint-Just-Luzac",
      "lead": "Access Prestige Taxi dessert Saint-Just-Luzac et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 8 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Saint-Just-Luzac",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour le bourg, les campings et les marais de la Seudre que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Marennes, Nieulle-sur-Seudre, Bourcefranc-le-Chapus, Le Gua"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Saint-Just-Luzac ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Saint-Just-Luzac ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Saint-Just-Luzac depuis Marennes ?",
          "a": "Oui : comptez 8 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Saint-Just-Luzac (17320) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Saint-Just-Luzac, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Saint-Just-Luzac",
      "lead": "Access Prestige Taxi serves Saint-Just-Luzac and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 8 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Saint-Just-Luzac",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the village centre, the campsites and the Seudre marshes or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Marennes, Nieulle-sur-Seudre, Bourcefranc-le-Chapus, Le Gua"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Saint-Just-Luzac?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Saint-Just-Luzac?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Saint-Just-Luzac from Marennes?",
          "a": "Yes: allow 8 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-nieulle-sur-seudre",
    "name": "Nieulle-sur-Seudre",
    "postal": "17600",
    "lat": 45.7969,
    "lng": -1.0181,
    "marennes": true,
    "around": [
      "Marennes",
      "Saint-Just-Luzac",
      "Le Gua",
      "Saint-Sornin"
    ],
    "fr": {
      "metaTitle": "Taxi Nieulle-sur-Seudre (17600) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Nieulle-sur-Seudre, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Nieulle-sur-Seudre",
      "lead": "Access Prestige Taxi dessert Nieulle-sur-Seudre et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 10 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Nieulle-sur-Seudre",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour les cabanes de la Seudre et les villages ostréicoles que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Marennes, Saint-Just-Luzac, Le Gua, Saint-Sornin"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Nieulle-sur-Seudre ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Nieulle-sur-Seudre ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Nieulle-sur-Seudre depuis Marennes ?",
          "a": "Oui : comptez 10 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Nieulle-sur-Seudre (17600) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Nieulle-sur-Seudre, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Nieulle-sur-Seudre",
      "lead": "Access Prestige Taxi serves Nieulle-sur-Seudre and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 10 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Nieulle-sur-Seudre",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the Seudre oyster huts and the shellfish villages or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Marennes, Saint-Just-Luzac, Le Gua, Saint-Sornin"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Nieulle-sur-Seudre?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Nieulle-sur-Seudre?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Nieulle-sur-Seudre from Marennes?",
          "a": "Yes: allow 10 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-le-gua",
    "name": "Le Gua",
    "postal": "17600",
    "lat": 45.75,
    "lng": -0.9942,
    "marennes": true,
    "around": [
      "Marennes",
      "Nieulle-sur-Seudre",
      "Saint-Sornin",
      "Sablonceaux"
    ],
    "fr": {
      "metaTitle": "Taxi Le Gua (17600) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Le Gua, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Le Gua",
      "lead": "Access Prestige Taxi dessert Le Gua et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 15 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Le Gua",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour le bourg, la vallée de la Seudre et l'accès rapide vers Royan que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Marennes, Nieulle-sur-Seudre, Saint-Sornin, Sablonceaux"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Le Gua ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Le Gua ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Le Gua depuis Marennes ?",
          "a": "Oui : comptez 15 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Le Gua (17600) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Le Gua, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Le Gua",
      "lead": "Access Prestige Taxi serves Le Gua and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 15 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Le Gua",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the village, the Seudre valley and the quick link towards Royan or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Marennes, Nieulle-sur-Seudre, Saint-Sornin, Sablonceaux"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Le Gua?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Le Gua?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Le Gua from Marennes?",
          "a": "Yes: allow 15 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-saint-sornin",
    "name": "Saint-Sornin",
    "postal": "17600",
    "lat": 45.8072,
    "lng": -0.9908,
    "marennes": true,
    "around": [
      "Marennes",
      "Hiers-Brouage",
      "Le Gua",
      "Nieulle-sur-Seudre"
    ],
    "fr": {
      "metaTitle": "Taxi Saint-Sornin (17600) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Saint-Sornin, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Saint-Sornin",
      "lead": "Access Prestige Taxi dessert Saint-Sornin et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 15 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Saint-Sornin",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour la tour de Broue et les marais de Brouage que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Marennes, Hiers-Brouage, Le Gua, Nieulle-sur-Seudre"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Saint-Sornin ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Saint-Sornin ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Saint-Sornin depuis Marennes ?",
          "a": "Oui : comptez 15 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Saint-Sornin (17600) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Saint-Sornin, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Saint-Sornin",
      "lead": "Access Prestige Taxi serves Saint-Sornin and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 15 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Saint-Sornin",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the Broue tower and the Brouage marshes or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Marennes, Hiers-Brouage, Le Gua, Nieulle-sur-Seudre"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Saint-Sornin?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Saint-Sornin?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Saint-Sornin from Marennes?",
          "a": "Yes: allow 15 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-saint-agnant",
    "name": "Saint-Agnant",
    "postal": "17620",
    "lat": 45.8853,
    "lng": -0.9647,
    "marennes": true,
    "around": [
      "Marennes",
      "Rochefort",
      "Moëze",
      "Échillais"
    ],
    "fr": {
      "metaTitle": "Taxi Saint-Agnant (17620) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à Saint-Agnant, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à Saint-Agnant",
      "lead": "Access Prestige Taxi dessert Saint-Agnant et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 20 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Saint-Agnant",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour le bourg, la zone d'activités et la route de Rochefort que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Marennes, Rochefort, Moëze, Échillais"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Saint-Agnant ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Saint-Agnant ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Saint-Agnant depuis Marennes ?",
          "a": "Oui : comptez 20 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Saint-Agnant (17620) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in Saint-Agnant, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in Saint-Agnant",
      "lead": "Access Prestige Taxi serves Saint-Agnant and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 20 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Saint-Agnant",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the village, the business park and the Rochefort road or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Marennes, Rochefort, Moëze, Échillais"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Saint-Agnant?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Saint-Agnant?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Saint-Agnant from Marennes?",
          "a": "Yes: allow 20 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  },
  {
    "slug": "taxi-la-tremblade",
    "name": "La Tremblade",
    "postal": "17390",
    "lat": 45.7692,
    "lng": -1.1417,
    "marennes": true,
    "around": [
      "Ronce-les-Bains",
      "Arvert",
      "Marennes",
      "Étaules"
    ],
    "fr": {
      "metaTitle": "Taxi La Tremblade (17390) — horaires et tarifs | Access Prestige Taxi",
      "metaDescription": "Taxi à La Tremblade, près de Marennes : 5j/7 de 8h à 20h, tarifs officiels, transferts gares et aéroports, transport médical conventionné, van 7 places. Réservation en ligne.",
      "h1": "Taxi à La Tremblade",
      "lead": "Access Prestige Taxi dessert La Tremblade et tout le bassin de Marennes avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 25 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît La Tremblade",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour Ronce-les-Bains, la forêt de la Coubre et les plages que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,83 €, 2,16 €/km en journée, 3,24 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
        },
        {
          "h": "Transferts, santé et groupes",
          "p": "Gares de Rochefort, Surgères et La Rochelle, aéroports de La Rochelle, Bordeaux et Nantes, transport médical conventionné avec tiers payant, transferts de groupe jusqu'à 7 personnes et mises à disposition à la journée."
        }
      ],
      "bullets": [
        "5j/7 de 8h à 20h, réservation en ligne 24h/24",
        "Tarifs taxi officiels, devis gratuit",
        "Transport médical conventionné, fauteuil roulant possible",
        "Van Mercedes Classe V jusqu'à 7 passagers",
        "Sièges bébé et rehausseurs sans supplément",
        "Communes desservies : Ronce-les-Bains, Arvert, Marennes, Étaules"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à La Tremblade ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à La Tremblade ?",
          "a": "Nous appliquons les tarifs officiels : 2,83 € de prise en charge, 2,16 €/km en journée et 3,24 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à La Tremblade depuis Marennes ?",
          "a": "Oui : comptez 25 minutes depuis Marennes. Nous desservons aussi l'île d'Oléron, Rochefort, Royan et La Rochelle, ainsi que toutes les longues distances en France et en Europe."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi La Tremblade (17390) — hours and fares | Access Prestige Taxi",
      "metaDescription": "Taxi in La Tremblade, near Marennes: 5 days a week 8am-8pm, official fares, station and airport transfers, approved medical transport, 7-seat van. Book online.",
      "h1": "Taxi in La Tremblade",
      "lead": "Access Prestige Taxi serves La Tremblade and the whole Marennes area with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 25 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows La Tremblade",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to Ronce-les-Bains, the Coubre forest and the beaches or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.83 pick-up charge, €2.16/km in the daytime, €3.24/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
        },
        {
          "h": "Transfers, healthcare and groups",
          "p": "Rochefort, Surgères and La Rochelle stations, La Rochelle, Bordeaux and Nantes airports, approved medical transport with direct billing, group transfers for up to 7 people and full-day hire."
        }
      ],
      "bullets": [
        "5 days a week, 8am–8pm, online booking 24/7",
        "Official taxi fares, free quote",
        "Approved medical transport, wheelchair possible",
        "Mercedes V-Class van for up to 7 passengers",
        "Baby and booster seats at no extra cost",
        "Areas served: Ronce-les-Bains, Arvert, Marennes, Étaules"
      ],
      "faq": [
        {
          "q": "What are your opening hours in La Tremblade?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in La Tremblade?",
          "a": "We apply official fares: €2.83 pick-up charge, €2.16/km in the daytime and €3.24/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to La Tremblade from Marennes?",
          "a": "Yes: allow 25 minutes from Marennes. We also serve Oléron island, Rochefort, Royan and La Rochelle, plus long-distance trips across France and Europe."
        }
      ]
    }
  }
];

export function getVille(slug: string) {
  return VILLES.find((v) => v.slug === slug);
}
