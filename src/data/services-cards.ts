/**
 * Prestations Access Prestige Taxi — source unique.
 *
 * Ce catalogue fusionne l'ancienne section "Nos services" de la page d'accueil
 * (visuels photo) et la page /services (détails + puces). La page /services est
 * désormais la seule page qui présente les prestations.
 */
import photoMedical from "@/assets/apt-medical.webp";
import photoAirport from "@/assets/apt-airport.webp";
import photoBusiness from "@/assets/apt-business.webp";
import photoInterior from "@/assets/apt-interior.jpg.asset.json";
import photoVanReal from "@/assets/apt-van-real.webp.asset.json";
import photoAudiReal from "@/assets/apt-audi-real.webp.asset.json";

export type ServiceCard = {
  id: string;
  photo: string;
  title: string;
  desc: string;
  points: string[];
};

export const SERVICE_CARDS_FR: ServiceCard[] = [
  {
    id: "sanitaire",
    photo: photoMedical,
    title: "Transport santé conventionné",
    desc: "Sur prescription médicale, tiers payant CPAM, chauffeur formé à l'accompagnement — vous n'avez qu'à monter.",
    points: [
      "Conventionné CPAM, tiers payant sur présentation du bon de transport",
      "Fauteuil roulant, consultations, dialyses, chimiothérapies",
      "Accompagnement de la porte à la porte, toutes distances",
    ],
  },
  {
    id: "transferts",
    photo: photoAirport,
    title: "Transferts gares & aéroports",
    desc: "Vol ou train suivi en temps réel : votre chauffeur ajuste l'heure de prise en charge, pancarte à votre nom en main.",
    points: [
      "Suivi automatique du vol ou du train : l'heure s'ajuste au réel",
      "Accueil pancarte et aide aux bagages",
      "La Rochelle, Bordeaux, Nantes, Paris… toutes distances",
    ],
  },
  {
    id: "pro",
    photo: photoBusiness,
    title: "Déplacements professionnels & privés",
    desc: "Hôtels, campings, rendez-vous d'affaires : ponctualité et discrétion, facture entreprise sur demande.",
    points: [
      "Navettes entreprises, séminaires et rendez-vous d'affaires",
      "Prise en charge hôtels, campings et résidences de vacances",
      "Facture entreprise et paiement différé possible",
    ],
  },
  {
    id: "mise-a-disposition",
    photo: photoInterior.url,
    title: "Mise à disposition avec chauffeur",
    desc: "Une demi-journée, une journée, un événement : le même chauffeur reste à vos côtés du premier au dernier trajet.",
    points: ["Demi-journée", "Journée complète", "Événementiel : mariage, congrès, tournage, visite œnologique"],
  },
  {
    id: "groupe",
    photo: photoVanReal.url,
    title: "Transport de groupe",
    desc: "Jusqu'à 8 personnes et leurs bagages, dans le même van Mercedes classe V, pour un tarif unique.",
    points: [
      "8 places et grand volume de bagages",
      "Groupe, famille, mariage ou déplacement professionnel",
      "Un seul véhicule, un seul tarif",
    ],
  },
  {
    id: "distances",
    photo: photoAudiReal.url,
    title: "Trajets toutes distances",
    desc: "France, Europe, aucune limite : silence électrique de la BMW iX1 ou de l'Audi Q6 e-tron, quelle que soit la distance.",
    points: [
      "Aucune limite de distance, sur réservation",
      "Confort électrique : habitacle silencieux, eau et chargeurs à bord",
      "Sièges enfant et bébé disponibles sur demande",
    ],
  },
];

export const SERVICE_CARDS_EN: ServiceCard[] = [
  {
    id: "sanitaire",
    photo: photoMedical,
    title: "Covered medical transport",
    desc: "With a medical prescription, direct billing, a driver trained to assist — you just have to get in.",
    points: [
      "French health-insurance approved, direct billing with a transport prescription",
      "Wheelchair, consultations, dialysis, chemotherapy",
      "Door-to-door assistance, any distance",
    ],
  },
  {
    id: "transferts",
    photo: photoAirport,
    title: "Station & airport transfers",
    desc: "Your flight or train tracked in real time: your driver adjusts pickup to the actual arrival, name board in hand.",
    points: [
      "Automatic flight and train tracking: pickup time follows the real arrival",
      "Name-board welcome and luggage assistance",
      "La Rochelle, Bordeaux, Nantes, Paris… any distance",
    ],
  },
  {
    id: "pro",
    photo: photoBusiness,
    title: "Business & private travel",
    desc: "Hotels, campsites, business meetings: punctual, discreet, company invoicing on request.",
    points: [
      "Company shuttles, seminars and business meetings",
      "Pickups at hotels, campsites and holiday residences",
      "Company invoicing and deferred payment available",
    ],
  },
  {
    id: "mise-a-disposition",
    photo: photoInterior.url,
    title: "Chauffeur hire",
    desc: "Half a day, a full day, an event: the same driver stays with you from the first stop to the last.",
    points: ["Half-day hire", "Full-day hire", "Events: weddings, conferences, film shoots, wine tours"],
  },
  {
    id: "groupe",
    photo: photoVanReal.url,
    title: "Group transport",
    desc: "Up to 8 people and their luggage, in the same Mercedes V-Class van, for one single fare.",
    points: [
      "8 seats and generous luggage space",
      "Group, family, wedding or business trip",
      "One vehicle, one single fare",
    ],
  },
  {
    id: "distances",
    photo: photoAudiReal.url,
    title: "Any-distance journeys",
    desc: "France, Europe, no limit: the electric silence of the BMW iX1 or the Audi Q6 e-tron, whatever the distance.",
    points: [
      "No distance limit, on request",
      "Electric comfort: quiet cabin, water and chargers on board",
      "Child and baby seats available on request",
    ],
  },
];
