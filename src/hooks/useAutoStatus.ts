import { useEffect, useRef } from "react";
import { geocodeAddress, type GeoCoord } from "@/lib/geocode";

/**
 * Progression automatique du statut d'une course, sans aucun bouton.
 *
 * Règles (basées sur la position GPS réelle du chauffeur) :
 *  - « Acceptée » → « En route » : le chauffeur roule vers le client, mais
 *    seulement dans la fenêtre de démarrage de la course (de 45 min avant
 *    l'heure à 3 h après) : à moins de 3 km du point de départ, ou à moins
 *    de 25 min de l'heure. Une course prévue dans plusieurs jours n'est
 *    jamais démarrée automatiquement.
 *  - « En route » → « Arrivé » : moins de 150 m du point de départ. Cette
 *    étape et la suivante ne sont PAS bornées par la fenêtre de démarrage —
 *    une course déjà en cours doit pouvoir se terminer même largement après
 *    l'heure prévue (long trajet, retard).
 *  - « Arrivé »  → « Terminée » : moins de 200 m de la destination, après
 *    s'être éloigné d'au moins 300 m du point de prise en charge — sauf si
 *    départ et arrivée sont eux-mêmes à moins de 300 m l'un de l'autre (course
 *    courte), auquel cas cette condition d'éloignement est ignorée.
 *
 * Fiabilité GPS (iPhone/Android) :
 *  - Une position dont la précision annoncée dépasse le seuil autorisé pour
 *    l'étape en cours est ignorée (fréquent sur Android tant qu'un vrai fix
 *    GPS n'est pas acquis — position réseau/Wi-Fi à plusieurs centaines de
 *    mètres, voire plusieurs km, d'erreur). Sans `accuracy` connue (API non
 *    supportée), la position est acceptée par défaut.
 *  - Un seul relevé sous le seuil ne suffit pas à déclencher « Arrivé » ou
 *    « Terminée » : il faut deux relevés valides, pour absorber un sursaut
 *    GPS isolé. Le compteur n'est remis à zéro que si le chauffeur est
 *    réellement trop loin — une simple imprécision ponctuelle (fréquente sur
 *    Android, où `accuracy` varie beaucoup d'un relevé à l'autre) le laisse
 *    inchangé au lieu de faire tout perdre.
 */

const PICKUP_NEAR_M = 150;
const DEST_NEAR_M = 200;
const APPROACH_M = 3000;
const LEFT_PICKUP_M = 300;
const BEFORE_PICKUP_MS = 25 * 60 * 1000;
/** Avant cette avance sur l'heure de prise en charge, aucun démarrage automatique. */
const EARLIEST_START_MS = 45 * 60 * 1000;
/** Au-delà de ce retard sur l'heure prévue, la course n'est plus DÉMARRÉE
 * automatiquement (ne s'applique qu'à « confirmed » → « in_progress »). */
const LATEST_START_MS = 3 * 60 * 60 * 1000;

/** Précision GPS maximale tolérée par étape, en mètres. */
const MAX_ACCURACY_APPROACH_M = 800;
const MAX_ACCURACY_NEAR_M = 120;
/** Nombre de relevés valides requis avant « Arrivé »/« Terminée ». */
const CONFIRM_READINGS = 2;

export type AutoStatusRide = {
  id: string;
  status: string;
  driver_slug: string | null;
  pickup_datetime: string;
  depart: string | null;
  arrivee: string | null;
  destination: string | null;
};

export type AutoCoords = { latitude: number; longitude: number; accuracy?: number | null } | null;

function distanceM(a: GeoCoord, b: GeoCoord) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** true si la précision annoncée est utilisable pour ce seuil (accuracy inconnue = acceptée). */
function accurateEnough(accuracy: number | null | undefined, maxM: number) {
  return accuracy == null || accuracy <= maxM;
}

export function useAutoStatus(
  rides: AutoStatusRide[],
  me: string | undefined,
  coords: AutoCoords,
  advance: (id: string, status: "in_progress" | "arrived" | "completed") => void,
) {
  const geo = useRef(new Map<string, GeoCoord | null>());
  const leftPickup = useRef(new Set<string>());
  const sent = useRef(new Set<string>());
  // Compte les relevés valides par course:cible, pour absorber un sursaut GPS
  // isolé avant de déclencher « Arrivé »/« Terminée ».
  const streak = useRef(new Map<string, number>());

  useEffect(() => {
    if (!coords || !me) return;
    const here: GeoCoord = { lat: coords.latitude, lng: coords.longitude };
    const accuracy = coords.accuracy ?? null;
    let cancelled = false;

    const resolve = async (address: string | null): Promise<GeoCoord | null> => {
      const key = (address ?? "").trim().toLowerCase();
      if (!key) return null;
      if (geo.current.has(key)) return geo.current.get(key) ?? null;
      const found = await geocodeAddress(key).catch(() => null);
      geo.current.set(key, found);
      return found;
    };

    // Avance (ou laisse inchangé) le compteur de relevés valides pour une
    // cible donnée, sans jamais le remettre à zéro sur une simple imprécision
    // GPS ponctuelle — seulement quand le chauffeur est réellement trop loin.
    const confirm = (streakKey: string, dist: number | null, nearM: number, maxAccuracyM: number): boolean => {
      if (dist == null) return false; // pas de donnée : on laisse le compteur tel quel
      if (dist > nearM) {
        streak.current.delete(streakKey); // réellement trop loin : on repart de zéro
        return false;
      }
      if (!accurateEnough(accuracy, maxAccuracyM)) return false; // assez proche, mais peu fiable : on attend
      const count = (streak.current.get(streakKey) ?? 0) + 1;
      streak.current.set(streakKey, count);
      return count >= CONFIRM_READINGS;
    };

    const run = async () => {
      for (const ride of rides) {
        if (ride.driver_slug !== me) continue;
        if (!["confirmed", "in_progress", "arrived"].includes(ride.status)) continue;

        const pickup = await resolve(ride.depart);
        if (cancelled) return;
        const dropoff = await resolve(ride.arrivee ?? ride.destination);
        if (cancelled) return;

        const dPickup = pickup ? distanceM(here, pickup) : null;
        const dDrop = dropoff ? distanceM(here, dropoff) : null;
        const shortRide = pickup && dropoff ? distanceM(pickup, dropoff) < LEFT_PICKUP_M : false;

        let next: "in_progress" | "arrived" | "completed" | null = null;

        if (ride.status === "confirmed") {
          // Seule cette étape est bornée par la fenêtre de démarrage : une
          // course prévue plus tard, ou trop en retard, n'est jamais démarrée
          // toute seule.
          const msUntil = new Date(ride.pickup_datetime).getTime() - Date.now();
          const soon = msUntil <= BEFORE_PICKUP_MS;
          const inStartWindow = msUntil <= EARLIEST_START_MS && msUntil >= -LATEST_START_MS;
          if (!inStartWindow) continue;
          const posOk = dPickup != null && accurateEnough(accuracy, MAX_ACCURACY_APPROACH_M) && dPickup <= APPROACH_M;
          // L'échéance horaire (`soon`) reste un déclencheur indépendant de la
          // précision GPS, et immédiat (pas de confirmation par relevés répétés).
          if (soon || posOk) next = "in_progress";
        } else if (ride.status === "in_progress") {
          // Pas de fenêtre horaire ici : une course déjà démarrée doit pouvoir
          // arriver, même très en retard (long trajet, embouteillages).
          if (confirm(`${ride.id}:arrived`, dPickup, PICKUP_NEAR_M, MAX_ACCURACY_NEAR_M)) next = "arrived";
        } else if (ride.status === "arrived") {
          // Éloignement du point de prise en charge, sans exigence de précision
          // particulière : il s'agit juste de savoir que le véhicule a bougé.
          if (dPickup != null && dPickup > LEFT_PICKUP_M) leftPickup.current.add(ride.id);
          const readyToComplete = shortRide || leftPickup.current.has(ride.id);
          if (readyToComplete && confirm(`${ride.id}:completed`, dDrop, DEST_NEAR_M, MAX_ACCURACY_NEAR_M)) {
            next = "completed";
          }
        }

        const key = `${ride.id}:${next}`;
        if (next && !sent.current.has(key)) {
          sent.current.add(key);
          advance(ride.id, next);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [rides, me, coords, advance]);
}
