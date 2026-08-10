// Helpers canonical + hreflang.
//
// Le site est bilingue avec i18n côté client : la version anglaise d'une page
// est la MÊME URL suffixée de `?lang=en`. Deux règles pour éviter que Google
// considère les deux variantes comme du contenu dupliqué :
//
//  1. Chaque variante déclare le même jeu d'alternates (fr, en, x-default),
//     en s'incluant elle-même — c'est ce que demande la spécification hreflang.
//  2. Le canonical est AUTO-RÉFÉRENT : la page FR se canonicalise sur l'URL nue,
//     la page `?lang=en` se canonicalise sur `?lang=en`. Un canonical EN qui
//     pointerait vers l'URL FR ferait ignorer l'alternate anglais par Google.
//
// Tous les autres paramètres (utm_*, fbclid, gclid, ids de session…) sont
// volontairement absents du canonical : ces variantes se replient donc sur la
// page propre, sans duplication.

export const SITE_URL = "https://accessprestigetaxi.fr";

/** Seul paramètre d'URL qui distingue une vraie variante de page. */
export const LANG_PARAM = "lang";

export function hreflangLinks(url: string) {
  const en = `${url}${url.includes("?") ? "&" : "?"}${LANG_PARAM}=en`;
  return [
    { rel: "alternate" as const, hrefLang: "fr", href: url },
    { rel: "alternate" as const, hrefLang: "en", href: en },
    { rel: "alternate" as const, hrefLang: "x-default", href: url },
  ];
}

/** URL absolue et normalisée (sans slash final, sans paramètre) d'un chemin. */
export function absoluteUrl(path: string) {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean}` || `${SITE_URL}/`;
}

/** true si les paramètres d'URL demandent la version anglaise. */
export function isEnglishSearch(search?: Record<string, unknown> | null) {
  const raw = search?.[LANG_PARAM];
  return typeof raw === "string" && raw.toLowerCase().startsWith("en");
}

/**
 * Canonical absolu (auto-référent FR ou EN) + alternates hreflang.
 * Passer `match.search` depuis le `head()` de la route pour que la variante
 * `?lang=en` se canonicalise sur elle-même.
 */
export function seoLinks(path: string, search?: Record<string, unknown> | null) {
  const url = absoluteUrl(path);
  const canonical = isEnglishSearch(search) ? `${url}?${LANG_PARAM}=en` : url;
  return [{ rel: "canonical" as const, href: canonical }, ...hreflangLinks(url)];
}
