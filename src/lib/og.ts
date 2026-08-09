// Helpers pour les visuels de partage social (Open Graph / Twitter Cards).
//
// Cache-busting : Facebook, X/Twitter, LinkedIn et WhatsApp mettent en cache
// l'image d'une URL pendant plusieurs jours. On suffixe donc chaque og:image
// d'un jeton de version : dès qu'on régénère un visuel, on incrémente
// OG_VERSION et les plateformes voient une URL inédite → re-scrape immédiat.
import { SITE_URL } from "./seo-hreflang";

/** À incrémenter à CHAQUE remplacement d'un visuel og:image / twitter:image. */
export const OG_VERSION = "20260809a";

export type OgLang = "fr" | "en";

/** URL absolue (obligatoire pour og:image) + jeton de cache-busting. */
export function ogImageUrl(path: string, version: string = OG_VERSION) {
  const abs = path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  return `${abs}${abs.includes("?") ? "&" : "?"}v=${version}`;
}

/** URL absolue simple (og:url, canonical…). */
export function absoluteUrl(path: string) {
  return path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Langue sociale déduite du paramètre ?lang= (fr par défaut). */
export function ogLangFromSearch(search?: { lang?: string } | null): OgLang {
  return search?.lang === "en" ? "en" : "fr";
}

/** og:url localisée : ?lang=en pour l'anglais, URL nue pour le français. */
export function ogPageUrl(path: string, lang: OgLang) {
  const base = absoluteUrl(path);
  return lang === "en" ? `${base}${base.includes("?") ? "&" : "?"}lang=en` : base;
}
