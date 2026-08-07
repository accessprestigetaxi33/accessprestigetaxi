export type Driver = {
  name: string;
  tel: string;
  display: string;
  intl: string;
  /** Véhicule du chauffeur. */
  vehicle: { fr: string; en: string };
  /** Nombre de passagers maximum. */
  seats: number;
  /** Motorisation 100 % électrique ? */
  electric: boolean;
  bio: { fr: string; en: string };
};

export const DRIVERS: Driver[] = [
  {
    name: "Alain",
    tel: "0650321923",
    display: "06 50 32 19 23",
    intl: "+33650321923",
    vehicle: { fr: "Van Mercedes — jusqu'à 7 personnes", en: "Mercedes van — up to 7 people" },
    seats: 7,
    electric: false,
    bio: {
      fr: "Alain assure les déplacements professionnels, le transport sanitaire conventionné, les longues distances sans limite de kilométrage, les transferts de groupe et les mises à disposition à bord de son van Mercedes pouvant accueillir jusqu'à 7 personnes avec leurs bagages. Sièges bébé et rehausseurs enfants sur demande.",
      en: "Alain covers business travel, approved medical transport, long distances with no mileage limit, group transfers and hourly hire in his Mercedes van seating up to 7 people with luggage. Baby and booster seats on request.",
    },
  },
  {
    name: "Patricia",
    tel: "0650260015",
    display: "06 50 26 00 15",
    intl: "+33650260015",
    vehicle: { fr: "BMW iX1 100 % électrique", en: "BMW iX1 — fully electric" },
    seats: 4,
    electric: true,
    bio: {
      fr: "Chauffeure de taxi conventionnée, Patricia accompagne au quotidien le transport sanitaire conventionné, les gares et les aéroports de Charente-Maritime — et bien au-delà, sans limite de distance — avec douceur et ponctualité, au volant de sa BMW iX1 100 % électrique (jusqu'à 4 passagers). Sièges bébé et rehausseurs enfants disponibles sur demande.",
      en: "A licensed taxi driver, Patricia handles approved medical transport, station and airport runs across Charente-Maritime — and far beyond, with no distance limit — with care and punctuality, at the wheel of her fully electric BMW iX1 (up to 4 passengers). Baby and booster seats available on request.",
    },
  },
];

/** Amplitude de service commune aux deux chauffeurs. */
export const SERVICE_HOURS = {
  fr: "",
  en: "",
  /** Format schema.org openingHours. */
  schema: "Mo-Fr 08:00-20:00",
};
