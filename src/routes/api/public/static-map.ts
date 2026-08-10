import { createFileRoute } from "@tanstack/react-router";

/**
 * Aperçu statique de carte (repli quand le SDK Google Maps JS est refusé,
 * typiquement RefererNotAllowedMapError en preview ou sur un domaine non
 * autorisé). L'image est demandée côté serveur : on y ajoute un référent
 * autorisé, donc l'aperçu fonctionne même là où la clé navigateur est bloquée.
 */
const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const isBrowserKey = (v: string) => /^AIza[0-9A-Za-z_-]{10,}$/.test(v);

const ALLOWED_REFERERS = ["https://accessprestigetaxi.fr/", "https://accessprestigetaxi.lovable.app/"];

function keysWithReferer(): Array<{ key: string; referer: string }> {
  const userKey = [clean(process.env["GOOGLE_API_KEY"]), clean(process.env["GOOGLE_MAPS_API_KEY2"])].find(isBrowserKey);
  const connectorKey = [
    clean(process.env["GOOGLE_MAPS_BROWSER_KEY"]),
    clean(process.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"]),
  ].find(isBrowserKey);
  const out: Array<{ key: string; referer: string }> = [];
  if (userKey) out.push({ key: userKey, referer: ALLOWED_REFERERS[0] });
  if (connectorKey) out.push({ key: connectorKey, referer: ALLOWED_REFERERS[1] });
  return out;
}

const num = (v: string | null, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

export const Route = createFileRoute("/api/public/static-map")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const lat = num(url.searchParams.get("lat"), -90, 90, 45.75);
        const lng = num(url.searchParams.get("lng"), -180, 180, -0.63);
        const zoom = Math.round(num(url.searchParams.get("zoom"), 1, 20, 13));
        const width = Math.round(num(url.searchParams.get("w"), 100, 640, 640));
        const height = Math.round(num(url.searchParams.get("h"), 100, 640, 320));

        const candidates = keysWithReferer();
        for (const { key, referer } of candidates) {
          const target =
            `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}` +
            `&zoom=${zoom}&size=${width}x${height}&scale=2&language=fr&region=FR` +
            `&markers=color:0x111111%7C${lat},${lng}&key=${encodeURIComponent(key)}`;
          try {
            const upstream = await fetch(target, { headers: { Referer: referer } });
            if (!upstream.ok) continue;
            const body = await upstream.arrayBuffer();
            return new Response(body, {
              status: 200,
              headers: {
                "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
                "Cache-Control": "public, max-age=86400",
              },
            });
          } catch {
            continue;
          }
        }
        return new Response(JSON.stringify({ error: "static_map_unavailable" }), {
          status: 502,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
