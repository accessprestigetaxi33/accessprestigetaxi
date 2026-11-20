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

export function goneResponse(): Response {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page retirée — Access Taxi PBR</title></head><body style="font-family:sans-serif;text-align:center;padding:4rem 1rem"><h1>Cette page n'existe plus</h1><p>Access Taxi PBR, votre taxi à Marennes-Hiers-Brouage, Brouage et Ciré-d'Aunis.</p><p><a href="/taxi-marennes">Taxi à Marennes</a> · <a href="/">Accueil</a></p></body></html>`;
  return new Response(html, {
    status: 410,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
      "cache-control": "public, max-age=3600",
    },
  });
}
