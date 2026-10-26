import { useEffect, useMemo, useSyncExternalStore } from "react";
import { driverGpsPush, driverGpsStop } from "@/lib/driver-extra.functions";
import { getProfile } from "@/lib/driverProfile";

/**
 * Suivi GPS temps réel, pensé pour iPhone (Safari / PWA) — ÉTAT PARTAGÉ.
 *
 * Avant : chaque appel de `useLiveGps()` créait son propre état, ses propres
 * `watchPosition` et son propre battement de cœur. Deux écrans montés en même
 * temps poussaient donc la position en double, et `stop()` appelé depuis un écran
 * ne coupait pas le partage démarré par un autre.
 *
 * Maintenant : UN SEUL suivi pour toute l'application (module singleton), lu par
 * tous les écrans via `useSyncExternalStore`. `start()` / `stop()` agissent sur ce
 * suivi unique, quel que soit l'écran qui les appelle.
 *
 * iOS coupe le `watchPosition` dès que l'écran s'éteint ou que l'app passe en
 * arrière-plan. On combine donc :
 *  - un `watchPosition` haute précision (partage actif),
 *  - un battement de cœur qui renvoie la dernière position connue,
 *  - une relance à chaque retour au premier plan (visibilitychange, pageshow,
 *    focus, retour du réseau),
 *  - un Wake Lock pour garder l'écran allumé pendant la course,
 *  - une persistance locale pour reprendre le partage après un redémarrage.
 *
 * Un suivi passif (basse fréquence, rien envoyé au serveur) tourne tant qu'au moins
 * un écran utilise le hook et que le partage n'est pas actif : `coords` est ainsi
 * disponible pour les déclenchements automatiques (alerte de départ, statuts
 * automatiques) avant tout clic sur « Activer le GPS ».
 *
 * Quand plus aucun écran n'utilise le hook (après un court délai, pour absorber une
 * navigation d'une page à l'autre), les ressources locales du navigateur sont
 * libérées. Le partage côté serveur n'est jamais coupé pour autant : il reprend au
 * prochain montage grâce au drapeau en localStorage.
 */

const STORAGE_KEY = "nova-driver-live-gps";
const HEARTBEAT_MS = 20_000; // < fenêtre de 15 min côté suivi client
const MIN_PUSH_MS = 6_000;
const TEARDOWN_GRACE_MS = 3_000; // navigation dashboard → /suivi : pas de coupure

type Coords = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
};

type LiveGpsState = {
  active: boolean;
  coords: Coords | null;
  lastSentAt: number | null;
  error: string | null;
};

type WakeLockSentinelLike = { release: () => Promise<void>; released?: boolean };

const INITIAL_STATE: LiveGpsState = { active: false, coords: null, lastSentAt: null, error: null };

// ---------------------------------------------------------------------------
// État partagé
// ---------------------------------------------------------------------------
let state: LiveGpsState = INITIAL_STATE;
const listeners = new Set<() => void>();

function setState(patch: Partial<LiveGpsState>) {
  const keys = Object.keys(patch) as (keyof LiveGpsState)[];
  if (keys.every((k) => Object.is(state[k], patch[k]))) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const getSnapshot = () => state;
const getServerSnapshot = () => INITIAL_STATE;

// ---------------------------------------------------------------------------
// Ressources locales (uniques pour toute l'application)
// ---------------------------------------------------------------------------
let currentToken: string | null = null;
let consumers = 0;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;

let watchId: number | null = null;
let idleWatchId: number | null = null;
let heartbeat: ReturnType<typeof setInterval> | null = null;
let activeListenersAttached = false;
let lastKnown: Coords | null = null;
let lastPush = 0;
let wakeLock: WakeLockSentinelLike | null = null;

const hasGeo = () => typeof navigator !== "undefined" && !!navigator.geolocation;

function toCoords(p: GeolocationPosition): Coords {
  return {
    latitude: p.coords.latitude,
    longitude: p.coords.longitude,
    accuracy: p.coords.accuracy ?? null,
    heading: Number.isFinite(p.coords.heading) ? p.coords.heading : null,
    speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null,
  };
}

async function push(coords: Coords, force = false) {
  // Jamais d'envoi hors partage actif : évite qu'une mise à jour tardive ne
  // réactive la position côté serveur juste après un « stop ».
  if (!currentToken || !state.active) return;
  const now = Date.now();
  if (!force && now - lastPush < MIN_PUSH_MS) return;
  lastPush = now;
  try {
    await driverGpsPush({ data: { token: currentToken, as: getProfile(), ...coords, active: true } });
    setState({ lastSentAt: Date.now(), error: null });
  } catch {
    // Réseau instable en voiture : on réessaiera au prochain battement.
    setState({ error: "Réseau instable — nouvelle tentative en cours" });
  }
}

async function requestWakeLock() {
  try {
    if (wakeLock && !wakeLock.released) return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock) return;
    wakeLock = await nav.wakeLock.request("screen");
  } catch {
    /* non bloquant */
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    void wakeLock.release().catch(() => undefined);
    wakeLock = null;
  }
}

function startWatch() {
  if (!hasGeo()) {
    setState({ error: "GPS indisponible sur cet appareil" });
    return;
  }
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    (p) => {
      const c = toCoords(p);
      lastKnown = c;
      setState({ coords: c });
      void push(c);
    },
    (e) => {
      setState({
        error:
          e.code === e.PERMISSION_DENIED
            ? "Localisation refusée — autorisez « Toujours » dans Réglages"
            : "Signal GPS faible",
      });
    },
    { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
  );
}

function stopWatch() {
  if (watchId != null && hasGeo()) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

// Suivi passif : basse fréquence, basse précision, ne pousse rien au serveur.
function startIdleWatch() {
  if (!hasGeo() || idleWatchId != null) return;
  idleWatchId = navigator.geolocation.watchPosition(
    (p) => {
      const c = toCoords(p);
      lastKnown = c;
      setState({ coords: c });
    },
    () => {
      // On ne remonte pas d'erreur au chauffeur : le bouton manuel reste le filet
      // de sécurité si la géolocalisation est refusée.
    },
    { enableHighAccuracy: false, maximumAge: 60_000, timeout: 20_000 },
  );
}

function stopIdleWatch() {
  if (idleWatchId != null && hasGeo()) navigator.geolocation.clearWatch(idleWatchId);
  idleWatchId = null;
}

// Relance au retour au premier plan (iOS coupe le watch en arrière-plan).
function revive() {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  if (!state.active) return;
  startWatch();
  void requestWakeLock();
  if (lastKnown) void push(lastKnown, true);
}

function attachActiveResources() {
  if (activeListenersAttached) return;
  activeListenersAttached = true;
  heartbeat = setInterval(() => {
    if (lastKnown && state.active) void push(lastKnown, true);
  }, HEARTBEAT_MS);
  document.addEventListener("visibilitychange", revive);
  window.addEventListener("pageshow", revive);
  window.addEventListener("focus", revive);
  window.addEventListener("online", revive);
}

function detachActiveResources() {
  if (!activeListenersAttached) return;
  activeListenersAttached = false;
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
  document.removeEventListener("visibilitychange", revive);
  window.removeEventListener("pageshow", revive);
  window.removeEventListener("focus", revive);
  window.removeEventListener("online", revive);
}

// ---------------------------------------------------------------------------
// Actions publiques (identiques quel que soit l'écran appelant)
// ---------------------------------------------------------------------------
async function startSharing() {
  if (!currentToken || state.active) return;
  setState({ active: true, error: null });
  try {
    localStorage.setItem(STORAGE_KEY, currentToken);
  } catch {
    /* stockage indisponible */
  }
  stopIdleWatch();
  startWatch();
  attachActiveResources();
  await requestWakeLock();
}

async function stopSharing() {
  const token = currentToken;
  setState({ active: false });
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* stockage indisponible */
  }
  stopWatch();
  detachActiveResources();
  releaseWakeLock();
  // Le suivi passif reprend aussitôt : `coords` reste disponible pour les écrans.
  if (consumers > 0) startIdleWatch();
  if (token) {
    try {
      await driverGpsStop({ data: { token, as: getProfile() } });
    } catch {
      /* ignoré */
    }
  }
}

/** Libère uniquement les ressources du navigateur — jamais le partage côté serveur
 * ni le drapeau localStorage : le partage reprendra au prochain montage. */
function releaseLocalResources() {
  stopIdleWatch();
  stopWatch();
  detachActiveResources();
  releaseWakeLock();
  lastKnown = null;
  setState({ active: false, coords: null });
}

function ensureRunning() {
  if (state.active) return;
  let resume = false;
  try {
    resume = !!currentToken && localStorage.getItem(STORAGE_KEY) === currentToken;
  } catch {
    /* stockage indisponible */
  }
  if (resume) void startSharing();
  else startIdleWatch();
}

/** Démarre le partage en direct (à appeler depuis n'importe quel écran). */
export function startLiveGps(): Promise<void> {
  return startSharing();
}

/** Arrête le partage en direct, côté navigateur ET côté serveur. */
export function stopLiveGps(): Promise<void> {
  return stopSharing();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useLiveGps(token: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    consumers += 1;
    if (teardownTimer) {
      clearTimeout(teardownTimer);
      teardownTimer = null;
    }
    if (currentToken !== token) {
      // Autre session : on abandonne le suivi local de l'ancienne, sans toucher au serveur.
      if (currentToken !== null) releaseLocalResources();
      currentToken = token;
    }
    ensureRunning();

    return () => {
      consumers -= 1;
      if (consumers === 0) {
        teardownTimer = setTimeout(() => {
          teardownTimer = null;
          if (consumers === 0) releaseLocalResources();
        }, TEARDOWN_GRACE_MS);
      }
    };
  }, [token]);

  return useMemo(
    () => ({
      active: snapshot.active,
      lastSentAt: snapshot.lastSentAt,
      error: snapshot.error,
      coords: snapshot.coords,
      start: startLiveGps,
      stop: stopLiveGps,
    }),
    [snapshot],
  );
}
