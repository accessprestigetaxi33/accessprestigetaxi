import { useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { addTiles, dotIcon, loadLeaflet, type L as LType } from "@/lib/leaflet";

/**
 * Carte équipe — Leaflet + OpenStreetMap : positions Adam / Ayoub,
 * marqueurs colorés, mise à jour en direct.
 */
export type TeamPoint = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
};

const TEAM_COLORS: Record<string, string> = {
  "nova-d1": "#2563eb",
  "nova-d2": "#db2777",
  d1: "#2563eb",
  d2: "#db2777",
  equipe: "#c99b4a",
};


export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function TeamMap({ rows, names }: { rows: TeamPoint[]; names: Record<string, string> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<LType | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markersRef = useRef<Record<string, LeafletNS.Marker>>({});
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const pts = rows.filter((r) => r.latitude != null && r.longitude != null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !wrapRef.current || mapRef.current) return;
        LRef.current = L;
        const map = L.map(wrapRef.current, {
          center: [44.8378, -0.5792],
          zoom: 10,
          zoomControl: false,
          attributionControl: true,
        });
        addTiles(L, map);
        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 200);
        setReady(true);
        setMapError(null);
      } catch {
        if (!cancelled) setMapError("Carte indisponible pour le moment.");
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || pts.length === 0) return;
    const bounds = L.latLngBounds([]);
    pts.forEach((p) => {
      const pos: [number, number] = [p.latitude as number, p.longitude as number];
      bounds.extend(pos);
      const color = TEAM_COLORS[p.id] ?? "#0f172a";
      const initial = (names[p.id] ?? p.id)[0]!.toUpperCase();
      const icon = dotIcon(L, color, initial);
      const existing = markersRef.current[p.id];
      if (existing) {
        existing.setLatLng(pos);
        existing.setIcon(icon);
        existing.setOpacity(p.is_active ? 1 : 0.5);
      } else {
        const m = L.marker(pos, { icon, opacity: p.is_active ? 1 : 0.5, title: names[p.id] ?? p.id }).addTo(map);
        markersRef.current[p.id] = m;
      }
    });
    if (pts.length === 1) map.setView(bounds.getCenter(), 14);
    else map.fitBounds(bounds, { padding: [30, 30] });
  }, [ready, rows, names, pts]);

  return (
    <div>
      <div
        data-map-provider="openstreetmap"
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(201,155,74,.45)",
        }}
      >
        <span
          style={{
            position: "absolute",
            zIndex: 500,
            top: 8,
            left: 8,
            borderRadius: 6,
            padding: "5px 8px",
            background: "rgba(11,21,32,.9)",
            color: "#f8fafc",
            fontSize: 11,
            fontWeight: 700,
            pointerEvents: "none",
          }}
        >
          OpenStreetMap · GPS en direct
        </span>
        <div ref={wrapRef} style={{ width: "100%", height: 240, background: "#0b1520" }} />
      </div>
      {(pts.length === 0 || mapError) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {mapError ?? "Aucune position partagée pour l'instant — activez le partage."}
        </p>
      )}
    </div>
  );
}
