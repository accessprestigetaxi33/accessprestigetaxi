import { createFileRoute } from "@tanstack/react-router";

/**
 * Proxy Nominatim (recherche d'adresse + géocodage inverse).
 * Évite les blocages CORS depuis le navigateur et garde le trafic sur notre domaine.
 */
const UA = "AccesPrestigeTaxi/1.0 (contact@accesprestigetaxi.fr)";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });

export const Route = createFileRoute("/api/public/geocode")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        const type = String(payload?.type ?? "search");

        try {
          if (type === "reverse") {
            const lat = Number(payload?.lat);
            const lon = Number(payload?.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return json({ error: "bad coords" }, 400);
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=fr`;
            const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
            if (!res.ok) return json({ error: "upstream" }, 502);
            return json(await res.json());
          }

          const query = String(payload?.query ?? "").trim().slice(0, 200);
          if (query.length < 2) return json([]);
          const limit = Math.min(Math.max(Number(payload?.limit) || 5, 1), 10);
          const url =
            `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&accept-language=fr` +
            `&countrycodes=fr&limit=${limit}&q=${encodeURIComponent(query)}`;
          const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
          if (!res.ok) return json([], 200);
          const data = await res.json();
          return json(Array.isArray(data) ? data : []);
        } catch {
          return json(type === "reverse" ? { error: "network" } : [], 200);
        }
      },
    },
  },
});
