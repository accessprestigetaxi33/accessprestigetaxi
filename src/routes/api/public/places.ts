import { createFileRoute } from "@tanstack/react-router";

/**
 * Adresses, géocodage et itinéraires — 100 % OpenStreetMap, sans aucune clé :
 *
 *  - action "autocomplete" : suggestions pendant la saisie (Photon + Nominatim)
 *  - action "details"      : identifiant de suggestion → coordonnées + libellé
 *  - action "geocode"      : texte libre → coordonnées
 *  - action "reverse"      : coordonnées → adresse formatée
 *  - action "route"        : itinéraire(s) OSRM entre deux points [lng, lat]
 *  - action "geolocate"    : position approximative déduite du réseau (edge)
 *
 * Tout passe par le serveur : pas de CORS, pas de clé exposée, cache partagé.
 */

const json = (body: unknown, status = 200, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

export const Route = createFileRoute("/api/public/places")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "invalid_json" }, 400);
        }
        const action = String(payload?.action ?? "autocomplete");
        const lang = String(payload?.lang ?? "fr").slice(0, 2);

        const osm = await import("@/lib/osm.server");

        try {
          if (action === "autocomplete") {
            const q = String(payload?.query ?? payload?.input ?? "").trim().slice(0, 200);
            if (q.length < 3) return json({ suggestions: [] });
            return json({ suggestions: await osm.osmAutocomplete(q, lang) });
          }

          if (action === "details") {
            // Les sources OSM ne fournissent pas d'identifiant stable : le
            // "place_id" transporté par le client est le libellé lui-même.
            const id = String(payload?.place_id ?? "").slice(0, 300);
            if (!id) return json({ error: "missing_place_id" }, 400);
            const d = await osm.osmGeocode(id, lang);
            return d ? json(d) : json({ error: "not_found" }, 404);
          }

          if (action === "geocode") {
            const q = String(payload?.query ?? "").trim().slice(0, 300);
            if (q.length < 3) return json({ error: "too_short" }, 400);
            const g = await osm.osmGeocode(q, lang);
            return g ? json(g) : json({ error: "not_found" }, 404);
          }

          if (action === "reverse") {
            const lat = Number(payload?.lat);
            const lng = Number(payload?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return json({ error: "bad_coords" }, 400);
            const label = await osm.osmReverse(lat, lng, lang);
            return label ? json({ label }) : json({ error: "not_found" }, 404);
          }

          if (action === "route") {
            const from = payload?.from;
            const to = payload?.to;
            const ok = (v: unknown): v is [number, number] =>
              Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(Number(n)));
            if (!ok(from) || !ok(to)) return json({ error: "bad_coords" }, 400);
            const routes = await osm.osmRoutes(
              [Number(from[0]), Number(from[1])],
              [Number(to[0]), Number(to[1])],
              Boolean(payload?.alternatives),
            );
            return json({ routes });
          }

          if (action === "geolocate") {
            // Position approximative fournie par l'hébergement (en-têtes edge).
            const lat = Number(request.headers.get("cf-iplatitude"));
            const lng = Number(request.headers.get("cf-iplongitude"));
            if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
              return json({ lat, lng, accuracy: 20_000 });
            }
            return json({ error: "not_found" }, 404);
          }

          return json({ error: "unknown_action" }, 400);
        } catch (err) {
          console.error("[places] handler error", err);
          return json({ error: "server_error" }, 500);
        }
      },
    },
  },
});
