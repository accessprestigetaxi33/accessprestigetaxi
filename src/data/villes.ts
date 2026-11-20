// Pages locales : uniquement Hiers-Brouage et Ciré-d'Aunis (zone SEO recentrée).
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
    "slug": "hiers-brouage",
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
      "metaTitle": "Taxi Hiers-Brouage ☎ 06 03 44 48 63 · 5j/7 8h-20h",
      "metaDescription": "Taxi à Hiers-Brouage et Brouage : appelez le 06 03 44 48 63 ou réservez en ligne, 5j/7 de 8h à 20h. Citadelle, gares, aéroports, transport médical, van 7 places.",
      "h1": "Taxi à Hiers-Brouage",
      "lead": "Appelez le 06 03 44 48 63 ou réservez en ligne : Access Prestige Taxi dessert Hiers-Brouage et tout le bassin de Marennes 5 jours sur 7, de 8h à 20h, avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers. Comptez 10 minutes depuis Marennes.",
      "sections": [
        {
          "h": "Un taxi qui connaît Hiers-Brouage",
          "p": "Nous vous prenons en charge à votre adresse, à l'hôtel, au camping ou au port, aussi bien pour la citadelle de Brouage, les marais et les cabanes ostréicoles que pour un rendez-vous, un train ou un avion. Nos chauffeurs circulent ici toute l'année, saison estivale comprise."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,70 €, 2,28 €/km en journée, 3,22 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
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
          "a": "Nous appliquons les tarifs officiels : 2,70 € de prise en charge, 2,28 €/km en journée et 3,22 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Hiers-Brouage depuis Marennes ?",
          "a": "Oui : comptez 10 minutes depuis Marennes. Nous assurons aussi les transferts vers les gares et aéroports, ainsi que les longues distances en France et en Europe, sur réservation."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Hiers-Brouage ☎ 06 03 44 48 63 · Mon-Fri 8am-8pm",
      "metaDescription": "Taxi in Hiers-Brouage and Brouage: call 06 03 44 48 63 or book online, 5 days a week 8am-8pm. Citadel, stations, airports, medical transport, 7-seat van.",
      "h1": "Taxi in Hiers-Brouage",
      "lead": "Call 06 03 44 48 63 or book online: Access Prestige Taxi serves Hiers-Brouage and the whole Marennes area 5 days a week, 8am to 8pm, with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers. Allow 10 minutes from Marennes.",
      "sections": [
        {
          "h": "A driver who knows Hiers-Brouage",
          "p": "We pick you up at your address, hotel, campsite or harbour, whether you are heading to the Brouage citadel, the marshes and the oyster huts or to an appointment, a train or a flight. Our drivers work here all year round, summer season included."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.70 pick-up charge, €2.28/km in the daytime, €3.22/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
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
          "a": "We apply official fares: €2.70 pick-up charge, €2.28/km in the daytime and €3.22/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Hiers-Brouage from Marennes?",
          "a": "Yes: allow 10 minutes from Marennes. We also handle station and airport transfers, plus long-distance trips across France and Europe, by appointment."
        }
      ]
    }
  },
  {
    "slug": "cire-d-aunis",
    "name": "Ciré-d'Aunis",
    "postal": "17290",
    "lat": 46.0569,
    "lng": -0.9325,
    "around": [],
    "fr": {
      "metaTitle": "Taxi Ciré-d'Aunis ☎ 06 03 44 48 63 · 5j/7 8h-20h",
      "metaDescription": "Taxi à Ciré-d'Aunis : appelez le 06 03 44 48 63 ou réservez en ligne, 5j/7 de 8h à 20h. Gares, aéroports, transport médical conventionné, van 7 places.",
      "h1": "Taxi à Ciré-d'Aunis",
      "lead": "Appelez le 06 03 44 48 63 ou réservez en ligne : Access Prestige Taxi dessert Ciré-d'Aunis et ses environs 5 jours sur 7, de 8h à 20h, avec deux chauffeurs indépendants : BMW iX1 et Audi Q6 e-tron 100 % électriques, van Mercedes Classe V jusqu'à 7 passagers.",
      "sections": [
        {
          "h": "Un taxi qui connaît Ciré-d'Aunis",
          "p": "Nous vous prenons en charge à votre adresse, au bourg comme dans les hameaux, pour un rendez-vous médical, une sortie, un train ou un avion. Nos chauffeurs connaissent les routes de l'Aunis et circulent ici toute l'année."
        },
        {
          "h": "Horaires et tarifs",
          "p": "Nous roulons 5 jours sur 7, de 8h à 20h, et la réservation en ligne reste ouverte 24h/24. Nous appliquons les tarifs taxi officiels : prise en charge 2,70 €, 2,28 €/km en journée, 3,22 €/km la nuit, le dimanche et les jours fériés. Le prix estimé vous est annoncé avant le départ ; seul le compteur fait foi en fin de course."
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
        "Prise en charge au départ de Marennes-Hiers-Brouage"
      ],
      "faq": [
        {
          "q": "Quels sont vos horaires à Ciré-d'Aunis ?",
          "a": "Nous assurons les courses 5 jours sur 7, de 8h à 20h. La réservation en ligne est possible 24h/24 et les longues distances s'organisent sur rendez-vous."
        },
        {
          "q": "Combien coûte un taxi à Ciré-d'Aunis ?",
          "a": "Nous appliquons les tarifs officiels : 2,70 € de prise en charge, 2,28 €/km en journée et 3,22 €/km la nuit, le dimanche et les jours fériés. L'estimation ne tient pas compte des bouchons : seul le compteur du taxi fait foi."
        },
        {
          "q": "Venez-vous à Ciré-d'Aunis depuis Marennes ?",
          "a": "Oui, nous venons vous chercher à Ciré-d'Aunis sur réservation.  Nous assurons aussi les transferts vers les gares et aéroports, ainsi que les longues distances en France et en Europe, sur réservation."
        }
      ]
    },
    "en": {
      "metaTitle": "Taxi Ciré-d'Aunis ☎ 06 03 44 48 63 · Mon-Fri 8am-8pm",
      "metaDescription": "Taxi in Ciré-d'Aunis: call 06 03 44 48 63 or book online, 5 days a week 8am-8pm. Stations, airports, approved medical transport, 7-seat van.",
      "h1": "Taxi in Ciré-d'Aunis",
      "lead": "Call 06 03 44 48 63 or book online: Access Prestige Taxi serves Ciré-d'Aunis and the surrounding villages 5 days a week, 8am to 8pm, with two independent drivers: fully electric BMW iX1 and Audi Q6 e-tron, plus a Mercedes V-Class van for up to 7 passengers.",
      "sections": [
        {
          "h": "A driver who knows Ciré-d'Aunis",
          "p": "We pick you up at your address, in the village or the surrounding hamlets, for a medical appointment, an outing, a train or a flight. Our drivers know the Aunis roads and work here all year round."
        },
        {
          "h": "Opening hours and fares",
          "p": "We drive 5 days a week from 8am to 8pm, and online booking stays open 24/7. We apply the official taxi fares: €2.70 pick-up charge, €2.28/km in the daytime, €3.22/km at night, on Sundays and public holidays. The estimated price is confirmed before departure; only the meter is binding at the end of the ride."
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
        "Pick-up from Marennes-Hiers-Brouage"
      ],
      "faq": [
        {
          "q": "What are your opening hours in Ciré-d'Aunis?",
          "a": "We drive 5 days a week, from 8am to 8pm. Online booking is open 24/7 and long-distance trips are arranged by appointment."
        },
        {
          "q": "How much does a taxi cost in Ciré-d'Aunis?",
          "a": "We apply official fares: €2.70 pick-up charge, €2.28/km in the daytime and €3.22/km at night, on Sundays and public holidays. Estimates exclude traffic: only the taximeter is binding."
        },
        {
          "q": "Do you drive to Ciré-d'Aunis from Marennes?",
          "a": "Yes, we pick you up in Ciré-d'Aunis by appointment. We also handle station and airport transfers, plus long-distance trips across France and Europe, by appointment."
        }
      ]
    }
  },
];

export function getVille(slug: string) {
  // Tolère les anciennes adresses /taxi/taxi-<ville> encore partagées ou indexées.
  const clean = slug.startsWith("taxi-") ? slug.slice(5) : slug;
  return VILLES.find((v) => v.slug === slug) ?? VILLES.find((v) => v.slug === clean);
}
