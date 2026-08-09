// Helper pour générer les balises hreflang.
// Le site est bilingue avec i18n côté client : la version anglaise d'une page
// est la même URL suffixée de ?lang=en. On déclare donc fr → URL nue,
// en → URL?lang=en, et x-default → URL nue (français).
export function hreflangLinks(url: string) {
  const en = `${url}${url.includes("?") ? "&" : "?"}lang=en`;
  return [
    { rel: "alternate" as const, hrefLang: "fr", href: url },
    { rel: "alternate" as const, hrefLang: "en", href: en },
    { rel: "alternate" as const, hrefLang: "x-default", href: url },
  ];
}


export const SITE_URL = "https://accessprestigetaxi.fr";

/** Canonical absolu + alternates hreflang (fr/en + x-default) pour une page. */
export function seoLinks(path: string) {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  const url = `${SITE_URL}${clean}` || `${SITE_URL}/`;
  return [{ rel: "canonical" as const, href: url }, ...hreflangLinks(url)];
}
