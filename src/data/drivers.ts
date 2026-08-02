export type Driver = {
  name: string;
  tel: string;
  display: string;
  intl: string;
  bio: { fr: string; en: string };
};

export const DRIVERS: Driver[] = [
  {
    name: "Patricia",
    tel: "0650260015",
    display: "06 50 26 00 15",
    intl: "+33650260015",
    bio: {
      fr: "Chauffeure de taxi conventionnée, Patricia accompagne au quotidien les trajets médicaux, les gares et les aéroports avec douceur et ponctualité, au volant de son BMW iX1 100 % électrique.",
      en: "A licensed taxi driver, Patricia handles medical transfers, station and airport runs every day with care and punctuality, at the wheel of her fully electric BMW iX1.",
    },
  },
  {
    name: "Alain",
    tel: "0650321923",
    display: "06 50 32 19 23",
    intl: "+33650321923",
    bio: {
      fr: "Alain assure les déplacements professionnels, les longues distances et les mises à disposition. Discrétion, confort et conduite souple en BMW iX1 électrique ou van Mercedes 7 places, 5j/7, de 8h à 20h.",
      en: "Alain covers business travel, long distances and chauffeur hours. Discretion, comfort and smooth driving in an electric BMW iX1 or a 7-seat Mercedes van, 5j/7 · 8h-20h.",
    },
  },
];
