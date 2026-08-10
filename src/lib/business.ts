// Entité métier unique partagée par tout le site (cohérence schema.org).
// Toutes les pages référencent le même @id afin que Google consolide
// l'entreprise en une seule entité.
import { DRIVERS } from "@/data/drivers";
import { SITE_URL } from "@/lib/seo-hreflang";
import socialImage from "@/assets/apt-hero-fr.webp.asset.json";

export const BUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const BUSINESS_EMAIL = "accessprestigetaxi@gmail.com";
export const BUSINESS_NAME = "Access Prestige Taxi";

/** Image de partage social par défaut (absolue, requise par Open Graph). */
export const SOCIAL_IMAGE = `${SITE_URL}${socialImage.url}`;
export const SOCIAL_IMAGE_WIDTH = "1376";
export const SOCIAL_IMAGE_HEIGHT = "768";

/**
 * Adresse de rattachement du service. Le service est itinérant :
 * l'adresse postale décrit la commune de base, les coordonnées géographiques
 * servent de point d'ancrage local pour Google.
 */
export const BUSINESS_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Saintes",
  postalCode: "17100",
  addressRegion: "Charente-Maritime",
  addressCountry: "FR",
} as const;

export const BUSINESS_GEO = {
  "@type": "GeoCoordinates",
  latitude: 45.7460,
  longitude: -0.6337,
} as const;

export const OPENING_HOURS = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  opens: "08:00",
  closes: "20:00",
} as const;

/** Nœud LocalBusiness complet, réutilisable ou référençable par @id. */
export function localBusinessNode() {
  return {
    "@type": ["LocalBusiness", "TaxiService"],
    "@id": BUSINESS_ID,
    name: BUSINESS_NAME,
    alternateName: "Access Prestige Taxi — Charente-Maritime",
    url: `${SITE_URL}/`,
    image: SOCIAL_IMAGE,
    logo: `${SITE_URL}/favicon.png`,
    email: BUSINESS_EMAIL,
    telephone: DRIVERS[0]?.intl,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Espèces, Carte bancaire, Virement, Tiers payant (transport conventionné)",
    address: BUSINESS_ADDRESS,
    geo: BUSINESS_GEO,
    hasMap: `https://www.google.com/maps/search/?api=1&query=${BUSINESS_GEO.latitude},${BUSINESS_GEO.longitude}`,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Charente-Maritime" },
      { "@type": "Country", name: "France" },
    ],
    availableLanguage: ["fr", "en"],
    openingHoursSpecification: [OPENING_HOURS],
    contactPoint: DRIVERS.map((d) => ({
      "@type": "ContactPoint",
      name: d.name,
      telephone: d.intl,
      email: BUSINESS_EMAIL,
      contactType: "reservations",
      areaServed: "FR",
      availableLanguage: ["fr", "en"],
    })),
    // Pages équivalentes FR / EN (même URL, langue choisie côté client).
    sameAs: [`${SITE_URL}/?lang=fr`, `${SITE_URL}/?lang=en`],
  };
}

/** Référence courte vers l'entité (à utiliser dans provider/publisher). */
export const businessRef = { "@id": BUSINESS_ID } as const;
