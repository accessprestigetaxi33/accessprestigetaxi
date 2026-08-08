import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadGoogleMapsWhenVisible } from "@/lib/googleMaps";
import { getSuiviDriverPosition } from "@/lib/driver-position.functions";

type Props = {
  suiviKey: string;
  /** Statut courant : la carte ne s'active que pendant la course. */
  status: string;
  lang?: "fr" | "en";
};

type LatLng = { lat: number; lng: number };

/** Intervalle de sondage serveur — volontairement large : le lissage
 *  client donne l'illusion du temps réel sans marteler la base. */
const POLL_MS = 12_000;
/** Durée d'interpolation entre deux points reçus (légèrement > POLL_MS pour
 *  ne jamais « attendre » à l'arrêt, puis on cale sur la cible). */
const TWEEN_MS = 13_000;
/** Bruit GPS ignoré (mètres) — évite le marqueur qui vibre à l'arrêt. */
const NOISE_M = 8;
/** Saut considéré comme un vrai téléport (mètres) : on repositionne sec. */
const JUMP_M = 3_000;

function distanceM(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Interpolation angulaire (le cap 350° → 10° ne doit pas faire un tour complet). */
function lerpAngle(from: number, to: number, t: number): number {
  const delta = (((to - from + 540) % 360) - 180) * t;
  return (from + delta + 360) % 360;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export default function SuiviLiveMap({ suiviKey, status, lang = "fr" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const trailRef = useRef<any>(null);

  const fromRef = useRef<LatLng | null>(null);
  const targetRef = useRef<LatLng | null>(null);
  const headingRef = useRef<number>(0);
  const targetHeadingRef = useRef<number>(0);
  const tweenStartRef = useRef<number>(0);
  const pathRef = useRef<LatLng[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastPollRef = useRef<number>(0);

  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useServerFn(getSuiviDriverPosition);
  const active = ["accepted", "en_route", "arrived"].includes(status);

  // ── Chargement paresseux du SDK (aucune requête tant que la carte est hors écran)
  useEffect(() => {
    if (!active || !containerRef.current) return;
    let cancelled = false;
    loadGoogleMapsWhenVisible(containerRef.current)
      .then((google: any) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: { lat: 45.75, lng: -0.63 },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          clickableIcons: false,
        });
        markerRef.current = new google.maps.Marker({
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#C6A24A",
            fillOpacity: 1,
            strokeColor: "#0B0B0D",
            strokeWeight: 2,
            rotation: 0,
          },
        });
        trailRef.current = new google.maps.Polyline({
          map: mapRef.current,
          path: [],
          strokeColor: "#C6A24A",
          strokeOpacity: 0.6,
          strokeWeight: 4,
        });
        setReady(true);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [active]);

  // ── Sondage throttlé : pause quand l'onglet est masqué, reprise au retour
  useEffect(() => {
    if (!active || !ready) return;
    let stopped = false;

    const poll = async () => {
      if (stopped || document.hidden) return;
      const now = Date.now();
      if (now - lastPollRef.current < POLL_MS - 1_500) return; // garde-fou anti-rafale
      lastPollRef.current = now;
      try {
        const res = await fetchPosition({ data: { suivi_key: suiviKey } });
        const p = res?.position;
        if (!p) {
          setLive(false);
          return;
        }
        setLive(true);
        const next: LatLng = { lat: p.lat, lng: p.lng };
        const current = targetRef.current;
        if (!current) {
          fromRef.current = next;
          targetRef.current = next;
          headingRef.current = p.heading ?? 0;
          targetHeadingRef.current = p.heading ?? 0;
          mapRef.current?.setCenter(next);
          mapRef.current?.setZoom(15);
        } else {
          const d = distanceM(current, next);
          if (d < NOISE_M) return; // bruit GPS : on n'anime rien
          if (d > JUMP_M) {
            fromRef.current = next; // téléport (perte de signal) : recalage sec
            pathRef.current = [];
          } else {
            fromRef.current = markerPosition() ?? current;
          }
          targetRef.current = next;
          if (typeof p.heading === "number") targetHeadingRef.current = p.heading;
          tweenStartRef.current = performance.now();
        }
      } catch {
        setLive(false);
      }
    };

    const markerPosition = (): LatLng | null => {
      const pos = markerRef.current?.getPosition?.();
      return pos ? { lat: pos.lat(), lng: pos.lng() } : null;
    };

    void poll();
    const timer = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, ready, suiviKey, fetchPosition]);

  // ── Interpolation : le marqueur glisse entre deux relevés au lieu de sauter
  useEffect(() => {
    if (!ready) return;
    const step = () => {
      const from = fromRef.current;
      const to = targetRef.current;
      const marker = markerRef.current;
      if (from && to && marker) {
        const t = Math.min(1, (performance.now() - tweenStartRef.current) / TWEEN_MS);
        const e = easeInOut(t);
        const lat = from.lat + (to.lat - from.lat) * e;
        const lng = from.lng + (to.lng - from.lng) * e;
        marker.setPosition({ lat, lng });
        headingRef.current = lerpAngle(headingRef.current, targetHeadingRef.current, 0.08);
        const icon = marker.getIcon?.();
        if (icon && typeof icon === "object") {
          marker.setIcon({ ...icon, rotation: headingRef.current });
        }
        // Trace allégée : un point tous les ~25 m, 120 points max.
        const last = pathRef.current[pathRef.current.length - 1];
        if (!last || distanceM(last, { lat, lng }) > 25) {
          pathRef.current = [...pathRef.current, { lat, lng }].slice(-120);
          trailRef.current?.setPath(pathRef.current);
        }
        // Recentrage seulement si le véhicule sort du cadre (pas à chaque frame).
        const map = mapRef.current;
        const bounds = map?.getBounds?.();
        if (bounds && !bounds.contains({ lat, lng })) map.panTo({ lat, lng });
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  if (!active) return null;

  const label = lang === "en" ? "Live driver position" : "Position du chauffeur en direct";
  const offline =
    lang === "en" ? "Position not shared yet" : "Position pas encore partagée";

  return (
    <section
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(11,11,13,0.12)",
        background: "#F5F0E6",
      }}
      aria-label={label}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{live ? "● live" : offline}</span>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: 280 }} />
      {error && (
        <p style={{ padding: "8px 14px", fontSize: 12, opacity: 0.7 }}>{error}</p>
      )}
    </section>
  );
}
