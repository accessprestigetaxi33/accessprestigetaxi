/**
 * Optimisation des images du guide (Wikimedia Commons).
 *
 * Wikimedia n'accepte plus que des largeurs de vignettes "standard" :
 * toute autre largeur renvoie une erreur 400 (image cassée).
 * On borne donc chaque demande sur le palier valide le plus proche,
 * et on sert la version WebP (plus légère à qualité égale) quand c'est possible.
 */

/** Paliers de largeur acceptés par Wikimedia (vérifiés en production). */
export const IMG_WIDTHS = [120, 250, 330, 500, 1280, 1920] as const;

const THUMB_RE = /\/thumb\/(.+)\/(\d+)px-([^/]+)$/;
/** Formats pour lesquels Wikimedia génère une vignette WebP. */
const WEBP_OK = /\.(jpe?g|png|tiff?)(\.webp)?$/i;

/** Palier valide le plus proche (au-dessus si possible) de la largeur demandée. */
export function snapWidth(width: number): number {
  const w = Math.round(width);
  return IMG_WIDTHS.find((b) => b >= w) ?? IMG_WIDTHS[IMG_WIDTHS.length - 1];
}

function toWebp(url: string): string {
  if (/\.webp$/i.test(url)) return url;
  return WEBP_OK.test(url) ? `${url}.webp` : url;
}

/** URL Wikimedia redimensionnée sur un palier valide, en WebP quand c'est possible. */
export function imgAt(url: string, width: number, webp = true): string {
  if (!url) return url;
  const w = snapWidth(width);
  const base = url.replace(/\.webp$/i, "");
  let out = base;

  const m = base.match(THUMB_RE);
  if (m) {
    out = base.replace(`/${m[2]}px-`, `/${w}px-`);
  } else {
    // Fichier servi en pleine résolution : on le convertit en vignette Commons.
    const full = base.match(
      /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/,
    );
    if (full && !/\.svg$/i.test(full[4])) {
      out = `${full[1]}/thumb/${full[2]}/${full[3]}/${full[4]}/${w}px-${full[4]}`;
    } else {
      return base;
    }
  }

  return webp ? toWebp(out) : out;
}

/** srcset multi-largeurs (paliers valides uniquement, sans doublon). */
export function imgSrcSet(url: string, widths: number[] = [250, 330, 500, 1280]): string {
  const uniq = Array.from(new Set(widths.map(snapWidth))).sort((a, b) => a - b);
  return uniq.map((w) => `${imgAt(url, w)} ${w}w`).join(", ");
}
