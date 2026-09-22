// Couche géo 100 % OpenStreetMap — aucune clé, aucune passerelle.
//
//  - Adresses   : Photon (photon.komoot.io) + Nominatim (nominatim.openstreetmap.org)
//  - Itinéraires: OSRM (router.project-osrm.org)
//
// Utilisée par /api/public/places (client) et par google.server.ts (serveur).
// Cache mémoire + cache persistant Supabase (table public.geo_cache) pour
// rester bien en dessous des quotas d'usage des services publics OSM.

const UA = "AccesPrestigeTaxi/1.0 (https://www.accessprestigetaxi.fr; contact@accesprestigetaxi.fr)";

/** Biais Charente-Maritime (Marennes / La Rochelle). */
export const VIEW = { lat: 45.8226, lng: -1.1069 };
export const BBOX = { south: 45.4, west: -1.6, north: 46.45, east: -0.3 };

const OSRM = "https://router.project-osrm.org/route/v1/driving";
const PHOTON = "https://photon.komoot.io";
const NOMINATIM = "https://nominatim.openstreetmap.org";

export type Suggestion = { placeId: string | null; label: string; lat: number | null; lng: number | null };
export type GeoPoint = { lat: number; lng: number; label: string; confidence?: number };

/* ------------------------------------------------------------------ */
/* Cache mémoire + cache persistant Supabase                           */
/* ------------------------------------------------------------------ */

type Entry = { at: number; value: unknown };
const mem = new Map<string, Entry>();
const MEM_TTL = 30 * 60_000;

function memGet(key: string): unknown | undefined {
  const hit = mem.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > MEM_TTL) {
    mem.delete(key);
    return undefined;
  }
  return hit.value;
}

function memSet(key: string, value: unknown) {
  if (mem.size > 800) mem.clear();
  mem.set(key, { at: Date.now(), value });
}

/** Cache partagé (table geo_cache) : survit aux redémarrages et aux instances. */
async function dbGet(key: string): Promise<unknown | undefined> {
  try {
    const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
    const { data } = await supabaseAdmin
      .from("geo_cache")
      .select("payload, expires_at")
      .eq("cache_key", key)
      .maybeSingle();
    if (!data) return undefined;
    if (data.expires_at && new Date(data.expires_at as string).getTime() < Date.now()) return undefined;
    return (data as { payload: unknown }).payload;
  } catch {
    return undefined;
  }
}

async function dbSet(key: string, value: unknown, ttlMs: number) {
  try {
    const { supabaseAdmin } = await import("@/lib/nova-supabase.server");
    await supabaseAdmin.from("geo_cache").upsert(
      {
        cache_key: key,
        payload: value as never,
        expires_at: new Date(Date.now() + ttlMs).toISOString(),
      } as never,
      { onConflict: "cache_key" },
    );
  } catch {
    /* le cache n'est jamais bloquant */
  }
}

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T | null>): Promise<T | null> {
  const hitMem = memGet(key);
  if (hitMem !== undefined) return hitMem as T | null;
  const hitDb = await dbGet(key);
  if (hitDb !== undefined) {
    memSet(key, hitDb);
    return hitDb as T | null;
  }
  const value = await fn();
  memSet(key, value ?? null);
  if (value != null) void dbSet(key, value, ttlMs);
  return value ?? null;
}

/* ------------------------------------------------------------------ */
/* Fetch JSON robuste                                                  */
/* ------------------------------------------------------------------ */

async function getJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Referer: "https://www.accessprestigetaxi.fr", Accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) {
      console.error(`[osm] ${res.status} ${url.slice(0, 120)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[osm] fetch error", String(err).slice(0, 200));
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Libellés & classement                                               */
/* ------------------------------------------------------------------ */

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?'"`()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function photonLabel(p: Record<string, unknown>): string {
  const name = ((p["name"] as string) ?? "").trim();
  const house = (p["housenumber"] as string) ?? "";
  const street = (p["street"] as string) ?? "";
  const city =
    (p["city"] as string) ?? (p["town"] as string) ?? (p["village"] as string) ?? (p["county"] as string) ?? "";
  const postcode = (p["postcode"] as string) ?? "";
  const address = [house, street].filter(Boolean).join(" ");
  const isPoi = Boolean(name) && name.toLowerCase() !== street.toLowerCase();
  const line1 = isPoi ? [name, address].filter(Boolean).join(", ") : address || name;
  const line2 = [postcode, city].filter(Boolean).join(" ");
  const parts = [line1, line2].filter(Boolean);
  return parts.length ? parts.join(", ") : name || ((p["country"] as string) ?? "");
}

function compactLabel(displayName: string): string {
  const parts = displayName.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(", ");
  const pcIndex = parts.findIndex((p) => /^\d{4,5}$/.test(p));
  const head = parts.slice(0, 2);
  if (pcIndex > 0) {
    const city = parts.slice(0, pcIndex).reverse().find((p) => !/^\d/.test(p) && !head.includes(p));
    return [...head, [parts[pcIndex], city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  }
  return head.join(", ");
}

function dedupe(list: Suggestion[]): Suggestion[] {
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const s of list) {
    const k = normalize(s.label);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function distKm(lat: number, lng: number): number {
  const dLat = (lat - VIEW.lat) * 111;
  const dLng = (lng - VIEW.lng) * 78;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/** Classement « grandes cartes en ligne » : préfixe, puis mots, puis proximité. */
function rank(list: Suggestion[], query: string): Suggestion[] {
  const q = normalize(query);
  const words = q.split(" ").filter(Boolean);
  return list
    .map((s) => {
      const l = normalize(s.label);
      let score = 0;
      if (l.startsWith(q)) score += 100;
      else if (l.includes(q)) score += 50;
      score += words.filter((w) => l.includes(w)).length * 8;
      if (s.lat != null && s.lng != null) {
        const d = distKm(s.lat, s.lng);
        score += d < 30 ? 40 : d < 120 ? 20 : d < 400 ? 8 : 0;
      }
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
}

/** Lieux très demandés : réponse immédiate, libellé officiel, coordonnées vérifiées. */
export const CANONICAL: Array<{ match: RegExp; label: string; lat: number; lng: number }> = [
  {
    match: /a[ée]roport.*(la\s*rochelle|île\s*de\s*r[ée]|ile\s*de\s*re|lrh)|la\s*rochelle.*a[ée]roport/i,
    label: "Aéroport La Rochelle-Île de Ré (LRH), 17000 La Rochelle",
    lat: 46.1792,
    lng: -1.1953,
  },
  {
    match: /gare\s*(sncf\s*)?(de\s*)?la\s*rochelle|la\s*rochelle.*gare/i,
    label: "Gare de La Rochelle, 17000 La Rochelle",
    lat: 46.1531,
    lng: -1.1458,
  },
  { match: /gare\s*(de\s*)?rochefort/i, label: "Gare de Rochefort, 17300 Rochefort", lat: 45.9447, lng: -0.9636 },
  { match: /gare\s*(de\s*)?royan/i, label: "Gare de Royan, 17200 Royan", lat: 45.6256, lng: -1.0275 },
  { match: /gare\s*(de\s*)?saintes/i, label: "Gare de Saintes, 17100 Saintes", lat: 45.7486, lng: -0.6236 },
  { match: /gare\s*(de\s*)?surg[eè]res/i, label: "Gare de Surgères, 17700 Surgères", lat: 46.1078, lng: -0.7508 },
  { match: /vieux[\s-]?port.*rochelle/i, label: "Vieux-Port, 17000 La Rochelle", lat: 46.1558, lng: -1.1528 },
  { match: /aquarium.*rochelle/i, label: "Aquarium de La Rochelle, 17000 La Rochelle", lat: 46.1539, lng: -1.1508 },
  { match: /zoo.*palmyre|palmyre.*zoo/i, label: "Zoo de La Palmyre, 17570 Les Mathes", lat: 45.6828, lng: -1.1675 },
  { match: /fort\s*boyard/i, label: "Fort Boyard, Charente-Maritime", lat: 45.9992, lng: -1.2133 },
  {
    match: /(gare|centre)\s*(de\s*)?marennes|marennes\s*centre/i,
    label: "Marennes-Hiers-Brouage, 17320",
    lat: 45.8226,
    lng: -1.1069,
  },
  {
    match: /gare\s*(sncf\s*)?(de\s*)?bordeaux|gare\s*(saint|st)[\s-]*jean/i,
    label: "Gare de Bordeaux Saint-Jean, 33800 Bordeaux",
    lat: 44.8262,
    lng: -0.5561,
  },
  {
    match: /a[ée]roport.*(bordeaux|m[ée]rignac)|bordeaux.*a[ée]roport/i,
    label: "Aéroport de Bordeaux-Mérignac (BOD), 33700 Mérignac",
    lat: 44.8286,
    lng: -0.7156,
  },
  { match: /dune\s*du\s*(pilat|pyla)/i, label: "Dune du Pilat, 33115 La Teste-de-Buch", lat: 44.5892, lng: -1.2136 },
];

export function findCanonical(query: string): { label: string; lat: number; lng: number } | null {
  const hit = CANONICAL.find((c) => c.match.test(query));
  return hit ? { label: hit.label, lat: hit.lat, lng: hit.lng } : null;
}

/* ------------------------------------------------------------------ */
/* Adresses                                                           */
/* ------------------------------------------------------------------ */

async function photonSearch(query: string, lang: string): Promise<Suggestion[]> {
  const url =
    `${PHOTON}/api/?q=${encodeURIComponent(query)}&limit=10` +
    `&lang=${lang === "en" ? "en" : "fr"}&lat=${VIEW.lat}&lon=${VIEW.lng}`;
  const data = await getJson<{
    features?: Array<{ properties: Record<string, unknown>; geometry?: { coordinates?: [number, number] } }>;
  }>(url);
  return (data?.features ?? [])
    .filter((f) => Array.isArray(f.geometry?.coordinates))
    .map((f) => ({
      placeId: photonLabel(f.properties),
      label: photonLabel(f.properties),
      lng: f.geometry!.coordinates![0]!,
      lat: f.geometry!.coordinates![1]!,
    }))
    .filter((s) => Boolean(s.label));
}

async function nominatimSearch(query: string, lang: string): Promise<Suggestion[]> {
  const data = await getJson<Array<{ display_name: string; lat: string; lon: string }>>(
    `${NOMINATIM}/search?format=jsonv2&addressdetails=0&limit=6&accept-language=${lang === "en" ? "en" : "fr"}` +
      `&countrycodes=fr,es,pt,it,be,de,ch,lu,nl,gb&q=${encodeURIComponent(query)}`,
  );
  return (data ?? []).map((r) => ({
    placeId: compactLabel(r.display_name),
    label: compactLabel(r.display_name),
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}

/** Suggestions d'adresses (saisie utilisateur). */
export async function osmAutocomplete(query: string, lang = "fr"): Promise<Suggestion[]> {
  const key = `ac:${lang}:${normalize(query)}`;
  const out = await cached<Suggestion[]>(key, 24 * 60 * 60_000, async () => {
    const [photon, nominatim] = await Promise.all([
      photonSearch(query, lang),
      nominatimSearch(query, lang),
    ]);
    const pinned = CANONICAL.filter((c) => c.match.test(query)).map((c) => ({
      placeId: c.label,
      label: c.label,
      lat: c.lat,
      lng: c.lng,
    }));
    const list = dedupe([...pinned, ...rank(dedupe([...photon, ...nominatim]), query)]).slice(0, 8);
    return list.length ? list : null;
  });
  return out ?? [];
}

/** Texte libre → coordonnées (+ libellé propre). */
export async function osmGeocode(query: string, lang = "fr"): Promise<GeoPoint | null> {
  const q = query?.trim();
  if (!q || q.length < 2) return null;
  const canonical = findCanonical(q);
  if (canonical) return { ...canonical, confidence: 1 };
  const key = `geo:${lang}:${normalize(q)}`;
  return cached<GeoPoint>(key, 24 * 60 * 60_000, async () => {
    const list = await osmAutocomplete(q, lang);
    const first = list.find((s) => s.lat != null && s.lng != null);
    if (!first) return null;
    return { lat: first.lat!, lng: first.lng!, label: first.label, confidence: 0.8 };
  });
}

/** Coordonnées → adresse formatée. */
export async function osmReverse(lat: number, lng: number, lang = "fr"): Promise<string | null> {
  const key = `rev:${lang}:${lat.toFixed(5)},${lng.toFixed(5)}`;
  return cached<string>(key, 24 * 60 * 60_000, async () => {
    const data = await getJson<{ features?: Array<{ properties: Record<string, unknown> }> }>(
      `${PHOTON}/reverse?lat=${lat}&lon=${lng}&lang=${lang === "en" ? "en" : "fr"}`,
    );
    let label = data?.features?.[0] ? photonLabel(data.features[0].properties) : "";
    if (!label) {
      const nom = await getJson<{ display_name?: string }>(
        `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=${lang === "en" ? "en" : "fr"}`,
      );
      label = nom?.display_name ? compactLabel(nom.display_name) : "";
    }
    return label || null;
  });
}

/* ------------------------------------------------------------------ */
/* Itinéraires (OSRM)                                                  */
/* ------------------------------------------------------------------ */

export type OsrmRouteDTO = {
  index: number;
  distanceM: number;
  durationS: number;
  geometry: string; // polyline6
  summary: string;
};

type RawRoute = { distance: number; duration: number; geometry: string; legs?: Array<{ summary?: string }> };

async function osrmRaw(coords: Array<[number, number]>, alternatives: boolean): Promise<RawRoute[]> {
  const path = coords.map((c) => `${c[0]},${c[1]}`).join(";");
  const url =
    `${OSRM}/${path}?overview=full&geometries=polyline6&steps=false&annotations=false` +
    `&alternatives=${alternatives ? "3" : "false"}`;
  const data = await getJson<{ code?: string; routes?: RawRoute[] }>(url, 12_000);
  return data?.routes ?? [];
}

/** Point décalé perpendiculairement, pour obtenir un vrai itinéraire alternatif. */
function detourVia(from: [number, number], to: [number, number], km: number, side: 1 | -1): [number, number] {
  const midLng = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;
  const dLng = to[0] - from[0];
  const dLat = to[1] - from[1];
  const len = Math.hypot(dLng, dLat) || 1;
  const nLng = (-dLat / len) * side;
  const nLat = (dLng / len) * side;
  return [midLng + (nLng * km) / 78, midLat + (nLat * km) / 111];
}

/** Majoration « trafic » appliquée aux durées OSRM (qui l'ignorent). */
export function trafficFactor(date = new Date()): number {
  const paris = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const day = paris.getDay();
  const h = paris.getHours();
  const weekday = day >= 1 && day <= 5;
  if (weekday && ((h >= 7 && h < 10) || (h >= 16 && h < 19))) return 1.25;
  if (h >= 22 || h < 6) return 1.0;
  return 1.08;
}

export async function osmRoutes(
  from: [number, number],
  to: [number, number],
  alternatives = false,
): Promise<OsrmRouteDTO[]> {
  const key = `rt:${alternatives}:${from.map((n) => n.toFixed(4)).join()}:${to.map((n) => n.toFixed(4)).join()}`;
  const out = await cached<OsrmRouteDTO[]>(key, 7 * 24 * 60 * 60_000, async () => {
    const found = await osrmRaw([from, to], alternatives);
    if (found.length === 0) return null;

    const picked: RawRoute[] = [];
    const distinct = (r: RawRoute) =>
      picked.every((p) => Math.abs(p.distance - r.distance) / Math.max(p.distance, 1) > 0.03);
    for (const r of found) if (distinct(r)) picked.push(r);

    if (alternatives && picked.length < 3 && picked[0]) {
      const directKm = picked[0].distance / 1000;
      const spread = Math.min(12, Math.max(2, directKm * 0.18));
      const vias: Array<[number, number]> = [
        detourVia(from, to, spread, 1),
        detourVia(from, to, spread, -1),
        detourVia(from, to, spread * 1.8, 1),
        detourVia(from, to, spread * 1.8, -1),
      ];
      for (const via of vias) {
        if (picked.length >= 3) break;
        const alt = (await osrmRaw([from, via, to], false))[0];
        if (alt && alt.distance < picked[0].distance * 1.7 && distinct(alt)) picked.push(alt);
      }
    }

    picked.sort((a, b) => a.duration - b.duration);
    return picked.slice(0, 3).map((r, i) => ({
      index: i,
      distanceM: r.distance,
      durationS: r.duration,
      geometry: r.geometry,
      summary: r.legs?.[0]?.summary ?? "",
    }));
  });
  return out ?? [];
}

/** Décodage polyline (précision 5 ou 6). */
export function decodePolyline(encoded: string, precision = 6, maxPoints = 4000): [number, number][] {
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lng = 0;
  const out: [number, number][] = [];
  while (index < encoded.length && out.length < maxPoints) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    out.push([lat / factor, lng / factor]);
  }
  return out;
}
