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
 */
export const Route = createFileRoute("/api/public/maps-config")({
  server: {
    handlers: {
      GET: () => {
        const key = (
          process.env["GOOGLE_MAPS_API_KEY"] ||
          process.env["GOOGLE_MAPS_API_KEY2"] ||
          process.env["GOOGLE_API_KEY"] ||
          ""
        ).trim();
        return new Response(
          JSON.stringify({
            key,
            libraries: "places,geometry",
            language: "fr",
            region: "FR",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=3600",
            },
          },
        );
      },
    },
  },
});
