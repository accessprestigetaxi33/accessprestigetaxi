import { createFileRoute } from "@tanstack/react-router";

/**
 * Aperçu statique de carte — tuiles OpenStreetMap relayées par le serveur
 * (aucune clé, aucune restriction de domaine). Renvoie la tuile qui contient
 * le point demandé ; l'aperçu détaillé est composé côté client.
 */
const num = (v: string | null, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

export const Route = createFileRoute("/api/public/static-map")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const lat = num(url.searchParams.get("lat"), -85, 85, 45.75);
        const lng = num(url.searchParams.get("lng"), -180, 180, -0.63);
        const zoom = Math.round(num(url.searchParams.get("zoom"), 1, 18, 13));

        const n = 2 ** zoom;
        const x = Math.min(Math.max(Math.floor(((lng + 180) / 360) * n), 0), n - 1);
        const latRad = (lat * Math.PI) / 180;
        const y = Math.min(
          Math.max(Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n), 0),
          n - 1,
        );

        try {
          const upstream = await fetch(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`, {
            headers: { "User-Agent": "AccesPrestigeTaxi/1.0 (contact@accessprestigetaxi.fr)" },
          });
          if (upstream.ok) {
            return new Response(await upstream.arrayBuffer(), {
              status: 200,
              headers: {
                "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
                "Cache-Control": "public, max-age=86400",
              },
            });
          }
        } catch {
          /* repli ci-dessous */
        }
        return new Response(JSON.stringify({ error: "static_map_unavailable" }), {
          status: 502,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
