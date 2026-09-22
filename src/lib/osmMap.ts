// lib/osmMap.ts
// Cartes interactives OpenStreetMap avec MapLibre GL (aucune clé, pas de
// Leaflet). Remplace le SDK Google Maps : chargement paresseux du moteur,
// tuiles OSM, marqueurs et tracés d'itinéraire.

import type { Map as MlMap, Marker as MlMarker } from "maplibre-gl";

export type LatLng = { lat: number; lng: number };
export type OsmMapApi = typeof import("maplibre-gl");

let enginePromise: Promise<OsmMapApi> | null = null;

/** Charge MapLibre + sa feuille de style une seule fois (navigateur only). */
export function loadOsmMapEngine(): Promise<OsmMapApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadOsmMapEngine: appelé côté serveur"));
  }
  if (!enginePromise) {
    enginePromise = (async () => {
      if (!document.getElementById("maplibre-css")) {
        const link = document.createElement("link");
        link.id = "maplibre-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }
      const mod = await import("maplibre-gl");
      return (mod.default ?? mod) as unknown as OsmMapApi;
    })().catch((err) => {
      enginePromise = null;
      throw err;
    });
  }
  return enginePromise;
}

/** Attend que l'élément soit visible avant de charger le moteur (perf / CWV). */
export function loadOsmMapEngineWhenVisible(
  element: Element | null | undefined,
  options: { rootMargin?: string; threshold?: number } = {},
): Promise<OsmMapApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadOsmMapEngineWhenVisible: appelé côté serveur"));
  }
  if (!element || typeof IntersectionObserver === "undefined") return loadOsmMapEngine();
  return new Promise<OsmMapApi>((resolve, reject) => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            loadOsmMapEngine().then(resolve, reject);
            return;
          }
        }
      },
      { rootMargin: options.rootMargin ?? "200px", threshold: options.threshold ?? 0 },
    );
    observer.observe(element);
  });
}

/** Style raster OpenStreetMap standard (attribution obligatoire incluse). */
export function osmStyle(): any {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  };
}

export type CreateMapOptions = {
  center?: LatLng;
  zoom?: number;
  interactive?: boolean;
};

/** Crée une carte OSM dans un conteneur DOM. */
export async function createOsmMap(
  container: HTMLElement,
  options: CreateMapOptions = {},
): Promise<{ api: OsmMapApi; map: MlMap }> {
  const api = await loadOsmMapEngine();
  const center = options.center ?? { lat: 45.8226, lng: -1.1069 }; // Marennes
  const map = new api.Map({
    container,
    style: osmStyle(),
    center: [center.lng, center.lat],
    zoom: options.zoom ?? 11,
    attributionControl: { compact: true },
    interactive: options.interactive ?? true,
  });
  return { api, map };
}

/** Marqueur coloré simple (point ou véhicule orienté). */
export function addOsmMarker(
  api: OsmMapApi,
  map: MlMap,
  point: LatLng,
  opts: { color?: string; label?: string; rotation?: number; size?: number } = {},
): MlMarker {
  const el = document.createElement("div");
  const size = opts.size ?? 16;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background = opts.color ?? "#d4af37";
  el.style.border = "2px solid #0b1520";
  el.style.boxShadow = "0 0 0 2px rgba(212,175,55,.45)";
  if (opts.label) el.title = opts.label;
  const marker = new api.Marker({ element: el, rotation: opts.rotation ?? 0 })
    .setLngLat([point.lng, point.lat])
    .addTo(map);
  return marker;
}

/** Trace (ou remplace) un itinéraire sur la carte. */
export function drawOsmRoute(
  map: MlMap,
  coords: [number, number][], // [lat, lng][]
  opts: { id?: string; color?: string; width?: number } = {},
) {
  const id = opts.id ?? "route";
  const geojson = {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: coords.map(([lat, lng]) => [lng, lat]) },
  };
  const existing = map.getSource(id) as any;
  if (existing?.setData) {
    existing.setData(geojson);
    return;
  }
  map.addSource(id, { type: "geojson", data: geojson } as any);
  map.addLayer({
    id,
    type: "line",
    source: id,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": opts.color ?? "#d4af37", "line-width": opts.width ?? 5, "line-opacity": 0.9 },
  } as any);
}

/** Cadre la carte sur une liste de points. */
export function fitOsmBounds(api: OsmMapApi, map: MlMap, points: LatLng[], padding = 48) {
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length === 0) return;
  if (valid.length === 1) {
    map.easeTo({ center: [valid[0]!.lng, valid[0]!.lat], zoom: Math.max(map.getZoom(), 13) });
    return;
  }
  const bounds = new api.LngLatBounds(
    [valid[0]!.lng, valid[0]!.lat],
    [valid[0]!.lng, valid[0]!.lat],
  );
  for (const p of valid) bounds.extend([p.lng, p.lat]);
  map.fitBounds(bounds, { padding, maxZoom: 15, duration: 400 });
}

// ── Géolocalisation directe (inchangée, sans dépendance externe) ────────────

export type GeoPosition = { lat: number; lng: number; accuracy?: number };

export function getCurrentPositionDirect(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
): Promise<GeoPosition | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => resolve(null),
      options,
    );
  });
}

export function watchPositionDirect(
  onUpdate: (pos: GeoPosition) => void,
  onError?: (err: GeolocationPositionError) => void,
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
    (err) => onError?.(err),
    options,
  );
  return () => navigator.geolocation.clearWatch(id);
}
