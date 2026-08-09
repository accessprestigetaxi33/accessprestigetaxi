import { createFileRoute } from "@tanstack/react-router";

/**
 * Adresses & géolocalisation — proxy serveur vers Google Maps Platform via le
 * connecteur Lovable (passerelle). C'est LA source unique d'adresses du site :
 *
 *  - action "autocomplete" : suggestions pendant la saisie (Places API New)
 *  - action "details"      : place_id → coordonnées + adresse formatée
 *  - action "geocode"      : texte libre → coordonnées
 *  - action "reverse"      : coordonnées → adresse formatée
 *  - action "geolocate"    : position approximative précise (Geolocation API)
 *
 * Pourquoi côté serveur : la clé navigateur est restreinte par référent HTTP
 * et ne fonctionne pas partout (preview, domaine perso, PWA). La passerelle,
 * elle, marche toujours et n'expose aucune clé au navigateur.
 */

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

// Biais Charente-Maritime (La Rochelle) — sans jamais bloquer les autres villes.
const BIAS = { lat: 46.16, lng: -1.15, radiusM: 50_000 };

/* ------------------------------------------------------------------ */
/* Cache mémoire (par instance serveur) + dédoublonnage des requêtes.  */
/* Les adresses changent très peu : on garde 24 h les résultats positifs */
/* et 60 s les absences, avec fusion des appels concurrents identiques. */
/* ------------------------------------------------------------------ */
type Entry<T> = { at: number; value: T | null };
function makeCache<T>(ttlMs: number, negativeTtlMs: number, max: number) {
  const store = new Map<string, Entry<T>>();
  const inflight = new Map<string, Promise<T | null>>();
  return async function run(key: string, fn: () => Promise<T | null>): Promise<T | null> {
    const hit = store.get(key);
    if (hit && Date.now() - hit.at <= (hit.value == null ? negativeTtlMs : ttlMs)) {
      store.delete(key);
      store.set(key, hit); // LRU touch
      return hit.value;
    }
    if (hit) store.delete(key);
    const pending = inflight.get(key);
    if (pending) return pending;
    const p = (async () => {
      try {
        const v = await fn();
        store.set(key, { at: Date.now(), value: v ?? null });
        while (store.size > max) {
          const first = store.keys().next().value;
          if (!first) break;
          store.delete(first);
        }
        return v ?? null;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
    return p;
  };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?'"`()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Arrondi ~11 m : deux relevés GPS voisins partagent la même adresse.
const coordKey = (lat: number, lng: number) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

const cacheAutocomplete = makeCache<Suggestion[]>(10 * 60_000, 30_000, 400);
const cacheDetails = makeCache<{ lat: number; lng: number; label: string }>(24 * 60 * 60_000, 60_000, 500);
const cacheGeocode = makeCache<{ lat: number; lng: number; label: string }>(24 * 60 * 60_000, 60_000, 800);
const cacheReverse = makeCache<{ label: string }>(24 * 60 * 60_000, 60_000, 800);


const json = (body: unknown, status = 200, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

function creds() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const google =
    process.env["GOOGLE_MAPS_API_KEY"] || process.env["GOOGLE_MAPS_API_KEY2"] || process.env["GOOGLE_API_KEY"];
  if (!lovable || !google) return null;
  return { lovable, google };
}

async function gw(path: string, init: RequestInit & { fieldMask?: string }) {
  const c = creds();
  if (!c) throw new Error("missing_google_credentials");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${c.lovable}`);
  headers.set("X-Connection-Api-Key", c.google);
  if (init.fieldMask) headers.set("X-Goog-FieldMask", init.fieldMask);
  if (init.body) headers.set("Content-Type", "application/json");
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${GATEWAY}${path}`, { ...init, headers, signal: ctrl.signal });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[places] gateway ${res.status} ${path}`, text.slice(0, 500));
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (err) {
    console.error(`[places] gateway error ${path}`, err);
    return null;
  } finally {
    clearTimeout(to);
  }
}

type Suggestion = { placeId: string | null; label: string; lat: number | null; lng: number | null };

async function autocomplete(input: string, lang: string): Promise<Suggestion[]> {
  const body = {
    input,
    languageCode: lang === "en" ? "en" : "fr",
    regionCode: "FR",
    includedRegionCodes: ["fr"],
    locationBias: {
      circle: { center: { latitude: BIAS.lat, longitude: BIAS.lng }, radius: BIAS.radiusM },
    },
  };
  const data = await gw("/places/v1/places:autocomplete", { method: "POST", body: JSON.stringify(body) });
  const raw: any[] = Array.isArray(data?.suggestions) ? data.suggestions : [];
  const out: Suggestion[] = [];
  for (const s of raw.slice(0, 6)) {
    const p = s?.placePrediction;
    if (!p) continue;
    const label: string = p.text?.text ?? p.structuredFormat?.mainText?.text ?? "";
    if (!label) continue;
    out.push({ placeId: p.placeId ?? null, label, lat: null, lng: null });
  }
  if (out.length) return out;

  // Repli : géocodage direct (utile pour « 12 rue X 17000 » que l'autocomplete
  // ne propose pas toujours).
  const g = await geocode(input, lang);
  return g ? [{ placeId: null, label: g.label, lat: g.lat, lng: g.lng }] : [];
}

async function details(placeId: string, lang: string) {
  const data = await gw(`/places/v1/places/${encodeURIComponent(placeId)}?languageCode=${lang === "en" ? "en" : "fr"}`, {
    method: "GET",
    fieldMask: "id,displayName,formattedAddress,location",
  });
  const lat = data?.location?.latitude;
  const lng = data?.location?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const name = data?.displayName?.text as string | undefined;
  const addr = data?.formattedAddress as string | undefined;
  const label = name && addr && !addr.startsWith(name) ? `${name}, ${addr}` : (addr ?? name ?? "");
  return { lat, lng, label };
}

async function geocode(address: string, lang: string) {
  const params = new URLSearchParams({
    address,
    language: lang === "en" ? "en" : "fr",
    region: "FR",
    components: "country:FR",
  });
  const data = await gw(`/maps/api/geocode/json?${params.toString()}`, { method: "GET" });
  const r = data?.results?.[0];
  const lat = r?.geometry?.location?.lat;
  const lng = r?.geometry?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat, lng, label: (r.formatted_address as string) ?? address };
}

async function reverse(lat: number, lng: number, lang: string) {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    language: lang === "en" ? "en" : "fr",
    region: "FR",
  });
  const data = await gw(`/maps/api/geocode/json?${params.toString()}`, { method: "GET" });
  const r = data?.results?.[0];
  if (!r?.formatted_address) return null;
  return { label: r.formatted_address as string };
}

/** Position approximative via l'API Geolocation de Google (plus fine que l'IP brute). */
async function geolocate() {
  const data = await gw("/geolocation/v1/geolocate", { method: "POST", body: JSON.stringify({ considerIp: true }) });
  const lat = data?.location?.lat;
  const lng = data?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat, lng, accuracy: typeof data?.accuracy === "number" ? data.accuracy : null };
}

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

        try {
          if (action === "autocomplete") {
            const q = String(payload?.query ?? "").trim().slice(0, 200);
            if (q.length < 3) return json({ suggestions: [] });
            return json({ suggestions: await autocomplete(q, lang) });
          }
          if (action === "details") {
            const id = String(payload?.place_id ?? "").slice(0, 300);
            if (!id) return json({ error: "missing_place_id" }, 400);
            const d = await details(id, lang);
            return d ? json(d) : json({ error: "not_found" }, 404);
          }
          if (action === "geocode") {
            const q = String(payload?.query ?? "").trim().slice(0, 300);
            if (q.length < 3) return json({ error: "too_short" }, 400);
            const g = await geocode(q, lang);
            return g ? json(g) : json({ error: "not_found" }, 404);
          }
          if (action === "reverse") {
            const lat = Number(payload?.lat);
            const lng = Number(payload?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return json({ error: "bad_coords" }, 400);
            const r = await reverse(lat, lng, lang);
            return r ? json(r) : json({ error: "not_found" }, 404);
          }
          if (action === "geolocate") {
            const g = await geolocate();
            return g ? json(g) : json({ error: "not_found" }, 404);
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
