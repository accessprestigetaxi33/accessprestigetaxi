// lib/googleRoute.ts
// Itinéraires, distances et durées — OSRM (OpenStreetMap) via le proxy serveur
// /api/public/places. Aucune clé, aucun SDK Google. Signatures inchangées
// (drop-in pour tous les composants existants).

type LngLat = [number, number]; // [lng, lat]

export type RouteResult = {
  distanceKm: number;
  coords: [number, number][]; // [lat, lng][]
};

export type DurationResult = {
  dureeS: number;
  distanceKm: number;
};

export type RouteAlternative = {
  id: number;
  label: string;
  km: number;
  min: number;
  coords: [number, number][]; // [lat, lng][]
};

export type OsrmRouteDTO = {
  index: number;
  distanceM: number;
  durationS: number;
  geometry: string; // polyline6
  summary: string;
};

/** Décodage polyline (OSRM : précision 6). */
export function decodePolyline(encoded: string, precision = 6): [number, number][] {
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lng = 0;
  const out: [number, number][] = [];
  while (index < encoded.length) {
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

/** Distance en mètres entre deux points (haversine). */
export function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Cap (degrés) entre deux points — orientation du véhicule sur la carte. */
export function bearingDeg(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const f1 = (a.lat * Math.PI) / 180;
  const f2 = (b.lat * Math.PI) / 180;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Majoration « trafic » appliquée aux durées OSRM (qui ne le modélisent pas) :
 * heures de pointe en semaine +25 %, nuit +0 %, sinon +8 %.
 */
export function trafficFactor(date = new Date()): number {
  const paris = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const day = paris.getDay();
  const h = paris.getHours();
  const weekday = day >= 1 && day <= 5;
  if (weekday && ((h >= 7 && h < 10) || (h >= 16 && h < 19))) return 1.25;
  if (h >= 22 || h < 6) return 1.0;
  return 1.08;
}

async function osrm(from: LngLat, to: LngLat, alternatives: boolean): Promise<OsrmRouteDTO[]> {
  try {
    const res = await fetch("/api/public/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "route", from, to, alternatives }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { routes?: OsrmRouteDTO[] };
    return json.routes ?? [];
  } catch {
    return [];
  }
}

/** Itinéraires bruts OSRM (jusqu'à 3 alternatives) entre deux points [lng, lat]. */
export async function osrmRoutesClient(
  from: LngLat,
  to: LngLat,
  alternatives = false,
): Promise<OsrmRouteDTO[]> {
  return osrm(from, to, alternatives);
}

/** Itinéraire complet (distance + tracé) entre deux points [lng, lat]. */
export async function getRouteGeoCoords(origin: LngLat, dest: LngLat): Promise<RouteResult> {
  const routes = await osrm(origin, dest, false);
  const best = routes[0];
  if (!best) throw new Error("OSRM: aucun itinéraire");
  return {
    distanceKm: Math.round((best.distanceM / 1000) * 100) / 100,
    coords: decodePolyline(best.geometry),
  };
}

/** Distance routière (km) + durée estimée (s), trafic approché. */
export async function getDistanceAndDurationKm(origin: LngLat, dest: LngLat): Promise<DurationResult | null> {
  const routes = await osrm(origin, dest, true);
  if (routes.length === 0) return null;
  const fastest = routes.reduce((a, b) => (b.durationS < a.durationS ? b : a));
  return {
    distanceKm: Math.round((fastest.distanceM / 1000) * 100) / 100,
    dureeS: Math.round(fastest.durationS * trafficFactor()),
  };
}

/** Jusqu'à 3 itinéraires possibles entre deux adresses (texte). */
export async function getRouteAlternatives(depart: string, arrivee: string): Promise<RouteAlternative[]> {
  const { geocodeAddress } = await import("./googleGeocode");
  const [o, d] = await Promise.all([geocodeAddress(depart), geocodeAddress(arrivee)]);
  if (!o || !d) return [];
  const routes = await osrm([o.lng, o.lat], [d.lng, d.lat], true);
  const factor = trafficFactor();
  return routes.map((r, i) => ({
    id: i,
    label: r.summary ? `Via ${r.summary}` : `Itinéraire ${i + 1}`,
    km: Math.round((r.distanceM / 1000) * 10) / 10,
    min: Math.max(1, Math.round((r.durationS * factor) / 60)),
    coords: decodePolyline(r.geometry),
  }));
}

/** Conservé pour compat : la distance OSRM est déjà routière. */
export function calibrateKm(rawKm: number): number {
  return rawKm;
}
