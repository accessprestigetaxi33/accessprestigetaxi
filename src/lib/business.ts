// Entité métier unique partagée par tout le site (cohérence schema.org).
// Toutes les pages référencent le même @id afin que Google consolide
// l'entreprise en une seule entité.
import { DRIVERS } from "@/data/drivers";
import { SITE_URL } from "@/lib/seo-hreflang";
import socialImage from "@/assets/apt-hero-fr.webp.asset.json";

export const BUSINESS_ID = `${SITE_URL}/#localbusiness`;
export const BUSINESS_EMAIL = "accesstaxiap@gmail.com";
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
  addressLocality: "Marennes-Hiers-Brouage",
  postalCode: "17320",
  addressRegion: "Charente-Maritime",
  addressCountry: "FR",
} as const;

export const BUSINESS_GEO = {
  "@type": "GeoCoordinates",
  latitude: 45.8226,
  longitude: -1.1059,
} as const;

/** Nœud LocalBusiness complet, réutilisable ou référençable par @id. */
export function localBusinessNode() {
  return {
    "@type": ["LocalBusiness", "TaxiService"],
    "@id": BUSINESS_ID,
    name: BUSINESS_NAME,
    alternateName: "Access Taxi PBR — Marennes-Hiers-Brouage & Ciré-d'Aunis",
    description:
      "Access Taxi PBR, taxi et chauffeur privé basé en Charente-Maritime, à Marennes-Hiers-Brouage (17320). Prise en charge à Marennes-Hiers-Brouage, Brouage et Ciré-d'Aunis : transport privé, chauffeur privé et transport médical conventionné, 5j/7 de 8h à 20h.",
    knowsAbout: ["Taxi Marennes-Hiers-Brouage", "Taxi Brouage", "Taxi Ciré-d'Aunis", "Transport médical conventionné", "Chauffeur privé"],
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
    areaServed: ["Marennes-Hiers-Brouage", "Brouage", "Ciré-d'Aunis"].map((name) => ({ "@type": "City", name })),
    availableLanguage: ["fr", "en"],
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
