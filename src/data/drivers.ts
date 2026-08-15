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
    tel: "0603444863",
    display: "06 03 44 48 63",
    intl: "+33603444863",
    vehicle: { fr: "Van Mercedes — 8 places", en: "Mercedes van — 8 seats" },
    seats: 8,
    electric: false,
    bio: {
      fr: "Alain assure les déplacements professionnels, le transport sanitaire conventionné avec fauteuil roulant, les prestations toutes distances, les transferts de groupe et les mises à disposition à bord de son van Mercedes 8 places. Sièges bébé et rehausseurs enfants sur demande.",
      en: "Alain covers business travel, approved medical transport with wheelchair support, all-distance services, group transfers and hourly hire in his 8-seat Mercedes van. Baby and booster seats on request.",
    },
  },
  {
    name: "Patricia",
    tel: "0650260015",
    display: "06 50 26 00 15",
    intl: "+33650260015",
    vehicle: { fr: "BMW iX1 100 % électrique", en: "BMW iX1 — fully electric" },
    seats: 5,
    electric: true,
    bio: {
      fr: "Chauffeure de taxi conventionnée, Patricia assure le transport sanitaire avec fauteuil roulant, les transferts vers toutes les gares et tous les aéroports et les prestations toutes distances, au volant de sa BMW iX1 100 % électrique 5 places. Sièges bébé et rehausseurs enfants disponibles sur demande.",
      en: "A licensed taxi driver, Patricia provides approved medical transport with wheelchair support, transfers to all stations and airports, and all-distance services in her fully electric 5-seat BMW iX1. Baby and booster seats available on request.",
    },
  },
];

