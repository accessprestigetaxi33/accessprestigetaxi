// Server-side Google Maps helpers — Geocoding + Routes API via connector gateway.
// Google Maps server helpers for reserver-chat.functions.ts.

import { parseAsParisTime } from"@/lib/tarif";

const GATEWAY ="https://connector-gateway.lovable.dev/google_maps";

function creds() {
 const lovable = process.env.LOVABLE_API_KEY;
 const google = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY2 || process.env.GOOGLE_API_KEY;
 if (!lovable ||!google) throw new Error("Missing Google Maps connector credentials");
 return { lovable, google };
}

/* ------------------------------------------------------------------ */
/* Cache serveur (in-memory) + dedupe + circuit breaker + garde-fous. */
/* ------------------------------------------------------------------ */

type CacheEntry<T> = { at: number; value: T | null; negative: boolean };
function makeCache<T>(opts: { ttlMs: number; negativeTtlMs: number; max: number }) {
 const { ttlMs, negativeTtlMs, max } = opts;
 const store = new Map<string, CacheEntry<T>>();
 const inflight = new Map<string, Promise<T | null>>();
 return {
 async run(key: string, fn: () => Promise<T | null>): Promise<T | null> {
 const hit = store.get(key);
 if (hit) {
 const ttl = hit.negative? negativeTtlMs: ttlMs;
 if (Date.now() - hit.at <= ttl) {
 store.delete(key);
 store.set(key, hit); // LRU touch
 return hit.value;
 }
 store.delete(key);
 }
 const pending = inflight.get(key);
 if (pending) return pending;
 const p = (async () => {
 try {
 const v = await fn();
 store.set(key, { at: Date.now(), value: v?? null, negative: v == null });
 while (store.size > max) {
 const first = store.keys().next().value;
 if (!first) break;
 store.delete(first);
 }
 return v;
 } finally {
 inflight.delete(key);
 }
 })();
 inflight.set(key, p);
 return p;
 },
 };
}

const geocodeCache = makeCache<GoogleGeocode>({
 ttlMs: 24 * 60 * 60_000,
 negativeTtlMs: 30_000,
 max: 500,
});
const routeCache = makeCache<GoogleRoute>({
 ttlMs: 120_000,
 negativeTtlMs: 15_000,
 max: 200,
});

/* ---------- Circuit breaker + garde-fous fetch --------------------- */

const FETCH_TIMEOUT_MS = 6_000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_POLYLINE_POINTS = 5_000;

type Breaker = { openUntil: number; consecutiveFailures: number };
const breakers = new Map<string, Breaker>();
function breakerFor(name: string): Breaker {
 let b = breakers.get(name);
 if (!b) {
 b = { openUntil: 0, consecutiveFailures: 0 };
 breakers.set(name, b);
 }
 return b;
}
function isOpen(name: string) {
 return breakerFor(name).openUntil > Date.now();
}
function noteFailure(name: string) {
 const b = breakerFor(name);
 b.consecutiveFailures = Math.min(b.consecutiveFailures + 1, 8);
 const backoff = Math.min(1000 * 2 ** (b.consecutiveFailures - 1), 60_000);
 b.openUntil = Date.now() + backoff;
}
function noteSuccess(name: string) {
 const b = breakerFor(name);
 b.consecutiveFailures = 0;
 b.openUntil = 0;
}

async function safeFetchJson(name: string, url: string, init: RequestInit): Promise<any | null> {
 if (isOpen(name)) return null;
 const controller = new AbortController();
 const to = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
 try {
 const r = await fetch(url, {...init, signal: controller.signal });
 if (r.status === 429 || r.status >= 500) {
 noteFailure(name);
 console.error(`[${name}] fetch failed ${r.status}`, url, await r.text().catch(() =>""));
 return null;
 }
 if (!r.ok) {
 console.error(`[${name}] fetch failed ${r.status}`, url, await r.text().catch(() =>""));
 return null;
 }
 const len = Number(r.headers.get("content-length")?? 0);
 if (len && len > MAX_RESPONSE_BYTES) {
 noteFailure(name);
 return null;
 }
 const text = await r.text();
 if (text.length > MAX_RESPONSE_BYTES) {
 noteFailure(name);
 return null;
 }
 noteSuccess(name);
 try {
 return JSON.parse(text);
 } catch {
 return null;
 }
 } catch {
 noteFailure(name);
 return null;
 } finally {
 clearTimeout(to);
 }
}

/* ---------- Normalisation des adresses ----------------------------- */

function normalizeGeocodeKey(q: string) {
 let k = q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g"").replace(/[.,;:!?"'`()\[\]]/g"").replace(/\bst\b/g"saint").replace(/\bste\b/g"sainte").replace(/\bav\b\.?/g"avenue").replace(/\bave\b\.?/g"avenue").replace(/\bbd\b\.?/g"boulevard").replace(/\bblvd\b\.?/g"boulevard").replace(/\bpl\b\.?/g"place").replace(/\brte\b\.?/g"route").replace(/\brue\s+de\s+la\b/g"rue de la").replace(/\s*-\s*/g"").replace(/\bfrance\b/g"").replace(/\bcharente\s*maritime\b/g"").replace(/\b17\d{3}\b/g"").replace(/\s+/g"").trim();
 if (ALIASES[k]) return normalizeSimple(ALIASES[k]);
 for (const alias of Object.keys(ALIASES)) {
 if (k === alias || k.startsWith(alias +"") || k.endsWith("" + alias) || k.includes("" + alias +"")) {
 return normalizeSimple(ALIASES[alias]);
 }
 }
 return k;
}
function normalizeSimple(s: string) {
 return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g"").replace(/[.,;:!?"'`()\[\]]/g"").replace(/\s+/g"").trim();
}
function roundCoord(n: number) {
 return Number(n.toFixed(4));
}
function routeKey(from: { lat: number; lng: number }, to: { lat: number; lng: number }, departureIso?: string) {
 const t = departureIso? parseAsParisTime(departureIso).getTime(): Date.now();
 const bucket = Number.isFinite(t)? Math.floor(t / (15 * 60_000)):"now";
 return `${from.lat.toFixed(4)}|${from.lng.toFixed(4)}>${to.lat.toFixed(4)}|${to.lng.toFixed(4)}@${bucket}`;
}

// Bbox Charente-Maritime + marges (La Rochelle centre, rayon ~80 km)
const CHARENTE_MARITIME_BBOX = { south: 45.0, west: -1.6, north: 46.5, east: -0.1 };

function normalizeAddressText(value: string): string {
 return value.normalize("NFD").replace(/[\u0300-\u036f]/g"").toLowerCase().replace(/[^a-z0-9]+/g"").trim();
}

// Lieux incontournables de Charente-Maritime — court-circuités AVANT Google.
const CANONICAL_PLACES: Array<{ match: RegExp; label: string; lat: number; lng: number }> = [
 {
 match: /(^|\s)(aeroport|airport|lrh)(\s|$).*(la\s+rochelle|ile\s+de\s+re|iledere|ile\s+dere)|^lrh$|^aeroport$|^airport$/,
 label:"Aéroport La Rochelle-Île de Ré (LRH), 17000 La Rochelle"lat: 46.1792,
 lng: -1.1953,
 },
 {
 match: /gare.*(la\s+rochelle|rochelle)|la\s+rochelle.*gare|^gare\s+la\s+rochelle$/,
 label:"Gare de La Rochelle, Place de la Gare, 17000 La Rochelle"lat: 46.1531,
 lng: -1.1458,
 },
 {
 match: /gare.*royan|royan.*gare|^gare\s+royan$/,
 label:"Gare de Royan, 17200 Royan"lat: 45.6256,
 lng: -1.0275,
 },
 {
 match: /gare.*saintes|saintes.*gare|^gare\s+saintes$/,
 label:"Gare de Saintes, 17100 Saintes"lat: 45.7486,
 lng: -0.6236,
 },
 {
 match: /gare.*rochefort|rochefort.*gare|^gare\s+rochefort$/,
 label:"Gare de Rochefort, 17300 Rochefort"lat: 45.9447,
 lng: -0.9636,
 },
 {
 match: /vieux\s*port.*(la\s+rochelle|rochelle)|port\s*vieux.*rochelle/,
 label:"Vieux-Port de La Rochelle, 17000 La Rochelle"lat: 46.1558,
 lng: -1.1528,
 },
 {
 match: /port.*royan|royan.*port/,
 label:"Port de Royan, 17200 Royan"lat: 45.6233,
 lng: -1.005,
 },
 {
 match: /aquarium.*(la\s+rochelle|rochelle)/,
 label:"Aquarium de La Rochelle, Avenue Saint-Jean-Baptiste, 17000 La Rochelle"lat: 46.1539,
 lng: -1.1508,
 },
 {
 match: /zoo.*(la\s+palmyre|palmyre)|la\s+palmyre.*zoo/,
 label:"Zoo de La Palmyre, 17570 Les Mathes"lat: 45.6828,
 lng: -1.1675,
 },
 {
 match: /fort\s*boyard/,
 label:"Fort Boyard, Boyardville"lat: 45.9992,
 lng: -1.2133,
 },
 {
 match: /(\bile\s+de\s+re\b|\biledere\b|\bile\s+dere\b)/,
 label:"Île de Ré"lat: 46.2,
 lng: -1.35,
 },
 {
 match: /(\bile\s+d\s*oleron\b|\boeleron\b|\bile\s+oleron\b)/,
 label:"Île d'Oléron"lat: 45.95,
 lng: -1.25,
 },
 {
 match: /(\bchatelaillon\b|\bchâtelaillon\b|\bchatelaillon\s+plage\b)/,
 label:"Châtelaillon-Plage, 17340"lat: 46.0731,
 lng: -1.0892,
 },
 {
 match: /(\broyan\s+plage\b|\bplage\s+royan\b|\bsaint\s+georges\s+de\s+didonne\b|\bsaint\s+georges\b)/,
 label:"Saint-Georges-de-Didonne, 17110"lat: 45.6286,
 lng: -0.9986,
 },
 {
 match: /(\bplage\s+de\s+la\s+palmyre\b|\bla\s+palmyre\b)/,
 label:"La Palmyre, 17570 Les Mathes"lat: 45.69,
 lng: -1.175,
 },
];

function findCanonicalGeocode(query: string): GoogleGeocode | null {
 const normalized = normalizeAddressText(query);
 const place = CANONICAL_PLACES.find((p) => p.match.test(normalized));
 if (!place) return null;
 return { lat: place.lat, lng: place.lng, label: place.label, confidence: 1 };
}

const ALIASES: Record<string, string> = {
 aeroport:"Aéroport La Rochelle-Île de Ré""aeroport la rochelle":"Aéroport La Rochelle-Île de Ré"lrh:"Aéroport La Rochelle-Île de Ré"gare:"Gare de La Rochelle""gare la rochelle":"Gare de La Rochelle""gare de la rochelle":"Gare de La Rochelle""vieux port":"Vieux-Port de La Rochelle"aquarium:"Aquarium de La Rochelle"zoo:"Zoo de La Palmyre""zoo de la palmyre":"Zoo de La Palmyre""la palmyre":"Zoo de La Palmyre""fort boyard":"Fort Boyard""ile de re":"Île de Ré"iledere:"Île de Ré""ile doleron":"Île d'Oléron"oleron:"Île d'Oléron"royan:"Royan"saintes:"Saintes"rochefort:"Rochefort""chatelaillon plage":"Châtelaillon-Plage""châtelaillon plage":"Châtelaillon-Plage""saint georges de didonne":"Saint-Georges-de-Didonne"};

function normalize(q: string): string[] {
 const cleaned = q.replace(/\s+/g"").trim();
 const lower = normalizeAddressText(cleaned);
 const variants: string[] = [];
 const canonical = findCanonicalGeocode(cleaned);
 if (canonical) variants.push(canonical.label);
 if (ALIASES[lower]) variants.push(ALIASES[lower]);
 for (const key of Object.keys(ALIASES)) {
 if (
 lower!== key &&
 (lower.startsWith(key +"") || lower.endsWith("" + key) || lower.includes("" + key +""))
 ) {
 variants.push(ALIASES[key]);
 }
 }
 if (/aeroport|airport/.test(lower)) {
 if (/la\s+rochelle|ile\s+de\s+re|iledere/.test(lower) || lower ==="aeroport" || lower ==="airport") {
 variants.push("Aéroport La Rochelle-Île de Ré");
 } else {
 const cityToken = lower.replace(/aeroport|airport|de|du|d/g"").trim().split(/\s+/)[0];
 if (cityToken && cityToken.length > 2) {
 variants.push(`aéroport ${cityToken}, France`, `${cityToken} airport, France`);
 }
 }
 }
 if (/gare/.test(lower)) {
 if (/la\s+rochelle|rochelle/.test(lower) || lower ==="gare") {
 variants.push("Gare de La Rochelle");
 } else {
 const cityToken = lower.replace(/gare|de|du|d/g"").trim().split(/\s+/)[0];
 if (cityToken && cityToken.length > 2) {
 variants.push(`gare ${cityToken}, France`);
 }
 }
 }
 variants.push(cleaned);
 const hasHint = /la\s+rochelle|royan|saintes|rochefort|oleron|ile\s+de\s+re|iledere|chatelaillon|châtelaillon|saint\s+georges|la\s+palmyre|fort\s+boyard|charente\s*maritime|17\d{3}/i.test(cleaned);
 if (!hasHint) {
 variants.push(`${cleaned}, La Rochelle`);
 variants.push(`${cleaned}, Charente-Maritime, France`);
 }
 return Array.from(new Set(variants.filter(Boolean)));
}

export type GoogleGeocode = { lng: number; lat: number; label: string; confidence: number };

async function geocodeOnce(q: string): Promise<GoogleGeocode | null> {
 const { lovable, google } = creds();
 const bounds = `${CHARENTE_MARITIME_BBOX.south},${CHARENTE_MARITIME_BBOX.west}|${CHARENTE_MARITIME_BBOX.north},${CHARENTE_MARITIME_BBOX.east}`;
 const url = `${GATEWAY}/maps/api/geocode/json?address=${encodeURIComponent(q)}&region=fr&bounds=${encodeURIComponent(bounds)}`;
 const d = await safeFetchJson("geocode"url, {
 headers: { Authorization: `Bearer ${lovable}`"X-Connection-Api-Key": google },
 });
 if (d?.status && d.status!=="OK" && d.status!=="ZERO_RESULTS") {
 console.error("[geocode] google status"d.status, d.error_message??"""for"q);
 }
 const res = d?.results?.[0];
 if (!res?.geometry?.location) return null;
 return {
 lng: res.geometry.location.lng,
 lat: res.geometry.location.lat,
 label: res.formatted_address?? q,
 confidence: res.geometry.location_type ==="ROOFTOP"? 1: 0.6,
 };
}

async function placesTextSearch(q: string): Promise<GoogleGeocode | null> {
 const { lovable, google } = creds();
 const body = {
 textQuery: q,
 languageCode:"fr"regionCode:"fr"maxResultCount: 1,
 locationBias: {
 rectangle: {
 low: { latitude: CHARENTE_MARITIME_BBOX.south, longitude: CHARENTE_MARITIME_BBOX.west },
 high: { latitude: CHARENTE_MARITIME_BBOX.north, longitude: CHARENTE_MARITIME_BBOX.east },
 },
 },
 };
 const d = await safeFetchJson("places"`${GATEWAY}/places/v1/places:searchText`, {
 method:"POST"headers: {
 Authorization: `Bearer ${lovable}`"X-Connection-Api-Key": google"Content-Type":"application/json""X-Goog-FieldMask":"places.displayName,places.formattedAddress,places.location"},
 body: JSON.stringify(body),
 });
 const p = d?.places?.[0];
 const loc = p?.location;
 if (!loc?.latitude ||!loc?.longitude) return null;
 return {
 lat: loc.latitude,
 lng: loc.longitude,
 label: p.formattedAddress?? p.displayName?.text?? q,
 confidence: 0.8,
 };
}

export async function geocodeGoogle(query: string): Promise<GoogleGeocode | null> {
 const q = query?.trim();
 if (!q || q.length < 2) return null;
 const canonical = findCanonicalGeocode(q);
 if (canonical) return canonical;
 return geocodeCache.run(normalizeGeocodeKey(q), async () => {
 for (const v of normalize(q)) {
 const c = findCanonicalGeocode(v);
 if (c) return c;
 const g = await geocodeOnce(v);
 if (g) return g;
 }
 for (const v of normalize(q)) {
 const g = await placesTextSearch(v);
 if (g) return g;
 }
 return null;
 });
}

export type GoogleRoute = {
 distanceKm: number;
 dureeS: number;
 coords: [number, number][]; // [lat, lng]
};

function decodePolyline(encoded: string, maxPoints = MAX_POLYLINE_POINTS): [number, number][] {
 let index = 0,
 lat = 0,
 lng = 0;
 const out: [number, number][] = [];
 while (index < encoded.length && out.length < maxPoints) {
 let b: number,
 shift = 0,
 result = 0;
 do {
 b = encoded.charCodeAt(index++) - 63;
 result |= (b & 0x1f) << shift;
 shift += 5;
 } while (b >= 0x20);
 lat += result & 1? ~(result >> 1): result >> 1;
 shift = 0;
 result = 0;
 do {
 b = encoded.charCodeAt(index++) - 63;
 result |= (b & 0x1f) << shift;
 shift += 5;
 } while (b >= 0x20);
 lng += result & 1? ~(result >> 1): result >> 1;
 out.push([lat / 1e5, lng / 1e5]);
 }
 return out;
}

export async function routeGoogle(
 from: { lng: number; lat: number },
 to: { lng: number; lat: number },
 departureIso?: string,
): Promise<GoogleRoute | null> {
 const key = routeKey({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }, departureIso);
 return routeCache.run(key, async () => {
 const { lovable, google } = creds();
 const requestedDeparture = departureIso? parseAsParisTime(departureIso).getTime(): NaN;
 const nowPlus5 = Date.now() + 5 * 60_000;
 const useFutureDeparture = Number.isFinite(requestedDeparture) && requestedDeparture >= nowPlus5;
 const body: any = {
 origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
 destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
 travelMode:"DRIVE"routingPreference:"TRAFFIC_AWARE"computeAlternativeRoutes: true,
 routeModifiers: { avoidFerries: true, avoidTolls: false, avoidHighways: false },
 languageCode:"fr"regionCode:"fr"units:"METRIC"};
 if (useFutureDeparture) {
 body.departureTime = new Date(requestedDeparture).toISOString();
 }
 const d = await safeFetchJson("routes"`${GATEWAY}/routes/directions/v2:computeRoutes`, {
 method:"POST"headers: {
 Authorization: `Bearer ${lovable}`"X-Connection-Api-Key": google"Content-Type":"application/json""X-Goog-FieldMask":"routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline"},
 body: JSON.stringify(body),
 });
 const routes: any[] = d?.routes?? [];
 if (!routes.length) return null;
 const parseSec = (s: unknown) => Number(String(s??"0s").replace("s""")) || 0;
 const best = routes.reduce((a, b) => ((a.distanceMeters?? Infinity) <= (b.distanceMeters?? Infinity)? a: b));
 const distanceKm = (best.distanceMeters?? 0) / 1000;
 const dureeS = parseSec(best.duration);
 const coords = best.polyline?.encodedPolyline? decodePolyline(best.polyline.encodedPolyline): [];
 return { distanceKm, dureeS, coords };
 });
}
