// Chargement paresseux de Leaflet (navigateur uniquement) + fond de carte OSM.
// Aucune clé, aucune restriction de domaine — fonctionne en PWA iOS/Android.

import type * as LeafletNS from "leaflet";

let cached: typeof LeafletNS | null = null;
let pending: Promise<typeof LeafletNS> | null = null;

export type L = typeof LeafletNS;

export async function loadLeaflet(): Promise<L> {
  if (typeof window === "undefined") throw new Error("Leaflet: navigateur requis");
  if (cached) return cached;
  if (!pending) {
    pending = (async () => {
      await import("leaflet/dist/leaflet.css");
      const mod = await import("leaflet");
      cached = (mod.default ?? mod) as unknown as L;
      return cached;
    })();
  }
  return pending;
}

/** Fond de carte OpenStreetMap (sans clé), assombri en CSS pour le thème. */
export function addTiles(L: L, map: LeafletNS.Map) {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    className: "nova-tiles",
    attribution: '&copy; OpenStreetMap',
    crossOrigin: true,
  }).addTo(map);
}

/** Marqueur circulaire coloré (départ, arrivée, chauffeur d'équipe). */
export function dotIcon(L: L, color: string, label?: string): LeafletNS.DivIcon {
  return L.divIcon({
    className: "nova-dot",
    html: `<span style="display:grid;place-items:center;width:22px;height:22px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.5);color:#fff;font:700 11px/1 system-ui">${label ?? ""}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

/** Flèche véhicule orientable (rotation appliquée en CSS). */
export function carIcon(L: L, heading: number, dimmed = false): LeafletNS.DivIcon {
  return L.divIcon({
    className: "nova-car",
    html: `<span style="display:block;width:28px;height:28px;transform:rotate(${heading}deg);opacity:${dimmed ? 0.55 : 1};transition:transform .4s linear">
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="rgba(37,99,235,.25)"/>
        <path d="M12 3l6 16-6-4-6 4z" fill="#2563eb" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
      </svg></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}
