/**
 * Optimisation des images du guide (Wikimedia Commons).
 * Réécrit les URLs de vignettes pour servir la largeur réellement affichée
 * et génère un srcset responsive (mobile / tablette / desktop / retina).
 */

const THUMB_RE = /\/thumb\/(.+)\/(\d+)px-([^/]+)$/;

/** Renvoie l'URL Wikimedia redimensionnée à `width` px (ou l'original si non redimensionnable). */
export function imgAt(url: string, width: number): string {
  if (!url) return url;
  const m = url.match(THUMB_RE);
  if (m) return url.replace(`/${m[2]}px-`, `/${Math.round(width)}px-`);

  // Fichier servi en pleine résolution : on le convertit en vignette Commons.
  const full = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/);
  if (full && !/\.svg$/i.test(full[4])) {
    return `${full[1]}/thumb/${full[2]}/${full[3]}/${full[4]}/${Math.round(width)}px-${full[4]}`;
  }
  return url;
}

/** srcset multi-largeurs pour une image du guide. */
export function imgSrcSet(url: string, widths: number[] = [480, 768, 1024, 1440]): string {
  return widths.map((w) => `${imgAt(url, w)} ${w}w`).join(", ");
}
