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
    title: "Transport sanitaire conventionné",
    desc: "Transport assis professionnalisé et transport avec fauteuil roulant, prise en charge simplifiée.",
    points: [
      "Conventionné CPAM, tiers payant sur présentation du bon de transport",
      "Fauteuil roulant, consultations, dialyses, chimiothérapies",
      "Accompagnement de la porte à la porte, toutes distances",
    ],
  },
  {
    id: "transferts",
    photo: photoAirport,
    title: "Transferts toutes gares & tous aéroports",
    desc: "Suivi des vols et des trains, accueil pancarte et bagages pris en charge, toutes distances.",
    points: [
      "Suivi automatique du vol ou du train : l'heure s'ajuste au réel",
      "Accueil pancarte et aide aux bagages",
      "La Rochelle, Bordeaux, Nantes, Paris… toutes distances",
    ],
  },
  {
    id: "pro",
    photo: photoBusiness,
    title: "Déplacements pro & privés, hôtels et campings",
    desc: "Navettes entreprises, hôtels, campings et résidences : ponctualité, discrétion, facture entreprise.",
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
    desc: "Demi-journée, journée complète ou événementiel : votre chauffeur reste à vos côtés.",
    points: [
      "Demi-journée",
      "Journée complète",
      "Événementiel : mariage, congrès, tournage, visite œnologique",
    ],
  },
  {
    id: "groupe",
    photo: photoVanReal.url,
    title: "Transport de groupe",
    desc: "Voyagez ensemble confortablement à bord du van Mercedes classe V 8 places.",
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
    desc: "Longues distances en France et en Europe, en BMW iX1 ou Audi Q6 e-tron 100 % électriques.",
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
    desc: "Professional seated transport and wheelchair transport, with simplified coverage.",
    points: [
      "French health-insurance approved, direct billing with a transport prescription",
      "Wheelchair, consultations, dialysis, chemotherapy",
      "Door-to-door assistance, any distance",
    ],
  },
  {
    id: "transferts",
    photo: photoAirport,
    title: "All stations & airport transfers",
    desc: "Flight and train tracking, meet & greet, luggage handled — any distance.",
    points: [
      "Automatic flight and train tracking: pickup time follows the real arrival",
      "Name-board welcome and luggage assistance",
      "La Rochelle, Bordeaux, Nantes, Paris… any distance",
    ],
  },
  {
    id: "pro",
    photo: photoBusiness,
    title: "Business & private travel, hotels and campsites",
    desc: "Company shuttles, hotels, campsites and residences: punctual, discreet, company invoicing.",
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
    desc: "Half a day, a full day or an event: your driver stays at your disposal.",
    points: ["Half-day hire", "Full-day hire", "Events: weddings, conferences, film shoots, wine tours"],
  },
  {
    id: "groupe",
    photo: photoVanReal.url,
    title: "Group transport",
    desc: "Travel together in comfort aboard the 8-seat Mercedes V-Class van.",
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
    desc: "Long-distance trips across France and Europe in the fully electric BMW iX1 or Audi Q6 e-tron.",
    points: [
      "No distance limit, on request",
      "Electric comfort: quiet cabin, water and chargers on board",
      "Child and baby seats available on request",
    ],
  },
];
