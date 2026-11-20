// Pages retirées du site (SEO recentré sur Marennes-Hiers-Brouage, Brouage et
// Ciré-d'Aunis). Le serveur leur répond « 410 Gone » + noindex pour que Google
// les retire de ses résultats au plus vite.

/** Communes encore servies par /taxi/$ville — toute autre commune est retirée. */
const KEPT_VILLES = new Set(["hiers-brouage", "cire-d-aunis", "taxi-hiers-brouage", "taxi-cire-d-aunis"]);

const REMOVED_EXACT = new Set(["/taxi-oleron", "/taxi-charente-maritime", "/destinations"]);

export function isRemovedPage(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (REMOVED_EXACT.has(path)) return true;
  if (path.startsWith("/destinations/")) return true;
  const ville = /^\/taxi\/([^/]+)$/.exec(path);
  if (ville) return !KEPT_VILLES.has(decodeURIComponent(ville[1]).toLowerCase());
  return false;
}

/** Redirection permanente vers la page « Page indisponible » (noindex). */
export function goneResponse(): Response {
  return new Response(null, {
    status: 301,
    headers: { location: "/page-indisponible", "x-robots-tag": "noindex", "cache-control": "public, max-age=3600" },
  });
}
