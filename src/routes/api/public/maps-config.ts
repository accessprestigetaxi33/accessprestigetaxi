import { createFileRoute } from "@tanstack/react-router";

/**
 * Configuration Google Maps servie au navigateur.
 *
 * La clé navigateur n'est pas figée dans le dépôt : elle provient du secret
 * `GOOGLE_MAPS_API_KEY` (ou `GOOGLE_API_KEY`) côté serveur, exactement comme
 * la clé Firebase (/api/public/firebase-config). Le client la récupère au
 * premier chargement de carte puis la met en cache mémoire.
 *
 * Une clé navigateur Google Maps est publique par nature (elle part dans
 * l'URL du script) : la protection repose sur les restrictions HTTP referrer
 * configurées côté Google Cloud, pas sur le secret.
 *
 * Preview / localhost : la clé de production est restreinte au domaine public,
 * donc Google renvoie `RefererNotAllowedMapError` en développement. On sert
 * alors en priorité `GOOGLE_MAPS_DEV_API_KEY` si ce secret existe (clé de test
 * autorisée sur localhost + *.lovable.app), et on renvoie dans tous les cas la
 * liste exacte des référents à autoriser pour l'hôte courant — l'interface
 * affiche ce message au lieu d'une carte vide.
 */
const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function isDevHost(host: string): boolean {
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovable.app")
  );
}

export const Route = createFileRoute("/api/public/maps-config")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const prodKey =
          clean(process.env["GOOGLE_MAPS_API_KEY"]) ||
          clean(process.env["GOOGLE_MAPS_API_KEY2"]) ||
          clean(process.env["GOOGLE_API_KEY"]);
        const devKey = clean(process.env["GOOGLE_MAPS_DEV_API_KEY"]);

        let host = "";
        try {
          host = new URL(request.url).host;
        } catch {
          host = "";
        }
        const dev = isDevHost(host);
        // En dev, la clé de test passe en premier ; la clé de prod reste en
        // repli (elle fonctionne si le domaine a été ajouté aux référents).
        const keys = (dev ? [devKey, prodKey] : [prodKey, devKey]).filter(Boolean);

        const scheme = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
        const allowlist = Array.from(
          new Set(
            [
              host ? `${scheme}://${host}/*` : null,
              "http://localhost:8080/*",
              "https://*.lovable.app/*",
              "https://*.lovableproject.com/*",
              "https://accessprestigetaxi.fr/*",
              "https://*.accessprestigetaxi.fr/*",
            ].filter(Boolean) as string[],
          ),
        );

        return new Response(
          JSON.stringify({
            key: keys[0] ?? "",
            keys,
            dev,
            host,
            allowlist,
            libraries: "places,geometry",
            language: "fr",
            region: "FR",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": dev ? "no-store" : "public, max-age=3600",
            },
          },
        );
      },
    },
  },
});
