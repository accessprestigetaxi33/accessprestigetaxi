// lib/geolocation.ts
// Localisation robuste, partagée par /reserver et la page de vérification
// /diagnostic.
//
// Cascade : GPS haute précision → GPS basse précision (cache autorisé) →
// Google Geolocation (via le proxy serveur /api/public/places) → géo-IP.
// Aucun échec « silencieux » : on renvoie toujours la source, la précision
// estimée en mètres et, quand c'est possible, la ville déduite par
// géocodage inverse — de quoi afficher un message clair à l'utilisateur.

import { placesGeolocate, placesReverse } from "./places";

export type GeoSource = "gps" | "gps_cached" | "network" | "ip";
export type GeoFailure = "denied" | "timeout" | "unavailable";

export type GeoFix = {
  lat: number;
  lng: number;
  /** Rayon d'incertitude en mètres (null si inconnu). */
  accuracy: number | null;
  source: GeoSource;
  /** true dès que la position ne peut pas servir de point de départ exact. */
  approximate: boolean;
  /** true si l'utilisateur a refusé la géolocalisation du navigateur. */
  denied: boolean;
};

export type GeoOutcome = { ok: true; fix: GeoFix } | { ok: false; reason: GeoFailure };

/** Au-delà de ce rayon, la position est présentée comme approximative. */
export const APPROX_ACCURACY_M = 1500;

type Lang = "fr" | "en";

const norm = (l?: string): Lang => (l === "en" ? "en" : "fr");

function browserPosition(options: PositionOptions): Promise<GeolocationPosition | GeolocationPositionError> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ code: 2, message: "unsupported" } as GeolocationPositionError);
      return;
    }
    let settled = false;
    const done = (v: GeolocationPosition | GeolocationPositionError) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    navigator.geolocation.getCurrentPosition(done, done, options);
  });
}

const isError = (v: GeolocationPosition | GeolocationPositionError): v is GeolocationPositionError =>
  typeof (v as GeolocationPositionError).code === "number" && !(v as GeolocationPosition).coords;

async function ipFix(): Promise<GeoFix | null> {
  const g = await placesGeolocate();
  if (g && Number.isFinite(g.lat) && Number.isFinite(g.lng)) {
    return {
      lat: g.lat,
      lng: g.lng,
      accuracy: typeof g.accuracy === "number" ? g.accuracy : null,
      source: "network",
      approximate: true,
      denied: false,
    };
  }
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const j: any = await res.json();
    const lat = Number(j?.latitude);
    const lng = Number(j?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, accuracy: 15000, source: "ip", approximate: true, denied: false };
  } catch {
    return null;
  }
}

/**
 * Tente d'obtenir la meilleure position possible, sans jamais bloquer :
 * l'utilisateur reçoit toujours soit une position (exacte ou estimée),
 * soit une raison d'échec exploitable.
 */
export async function locateUser(
  opts: { highAccuracyTimeout?: number; lowAccuracyTimeout?: number; allowFallback?: boolean } = {},
): Promise<GeoOutcome> {
  const { highAccuracyTimeout = 18000, lowAccuracyTimeout = 8000, allowFallback = true } = opts;

  const first = await browserPosition({ enableHighAccuracy: true, maximumAge: 0, timeout: highAccuracyTimeout });
  let denied = isError(first) && first.code === 1;

  if (!isError(first)) {
    const { latitude, longitude, accuracy } = first.coords;
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const acc = typeof accuracy === "number" ? accuracy : null;
      return {
        ok: true,
        fix: {
          lat: latitude,
          lng: longitude,
          accuracy: acc,
          source: "gps",
          approximate: acc !== null && acc > APPROX_ACCURACY_M,
          denied: false,
        },
      };
    }
  }

  if (!denied) {
    const second = await browserPosition({
      enableHighAccuracy: false,
      maximumAge: 120000,
      timeout: lowAccuracyTimeout,
    });
    if (!isError(second)) {
      const { latitude, longitude, accuracy } = second.coords;
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        const acc = typeof accuracy === "number" ? accuracy : null;
        return {
          ok: true,
          fix: {
            lat: latitude,
            lng: longitude,
            accuracy: acc,
            source: "gps_cached",
            approximate: acc === null || acc > APPROX_ACCURACY_M,
            denied: false,
          },
        };
      }
    } else if (second.code === 1) {
      denied = true;
    }
  }

  if (allowFallback) {
    const fallback = await ipFix();
    if (fallback) return { ok: true, fix: { ...fallback, denied } };
  }

  const reason: GeoFailure = denied ? "denied" : isError(first) && first.code === 3 ? "timeout" : "unavailable";
  return { ok: false, reason };
}

/** Adresse complète + ville déduites par géocodage inverse. */
export async function describePosition(
  lat: number,
  lng: number,
  lang: string = "fr",
): Promise<{ label: string; city: string | null }> {
  const label = (await placesReverse(lat, lng, norm(lang))) ?? "";
  const parts = label
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  // Le dernier segment est souvent le pays, l'avant-dernier « 17000 La Rochelle ».
  const candidate = parts.length >= 2 ? parts[parts.length - 2]! : (parts[0] ?? "");
  const city = candidate.replace(/^\d{4,5}\s*/, "").trim() || null;
  return { label: label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city };
}

/** « ± 45 m (précise) » / « ± 3,2 km (approximative) ». */
export function accuracyLabel(accuracy: number | null, lang: string = "fr"): string {
  const l = norm(lang);
  if (accuracy === null || !Number.isFinite(accuracy)) {
    return l === "en" ? "accuracy unknown" : "précision inconnue";
  }
  const value =
    accuracy >= 1000
      ? `${(accuracy / 1000).toFixed(1).replace(".", l === "en" ? "." : ",")} km`
      : `${Math.round(accuracy)} m`;
  const quality =
    accuracy <= 100
      ? l === "en"
        ? "precise"
        : "précise"
      : accuracy <= APPROX_ACCURACY_M
        ? l === "en"
          ? "usable"
          : "exploitable"
        : l === "en"
          ? "approximate"
          : "approximative";
  return `± ${value} (${quality})`;
}

export function sourceLabel(source: GeoSource, lang: string = "fr"): string {
  const l = norm(lang);
  const map: Record<GeoSource, [string, string]> = {
    gps: ["GPS de l'appareil", "Device GPS"],
    gps_cached: ["Position récente de l'appareil", "Recent device location"],
    network: ["Estimation Wi-Fi / réseau mobile", "Wi-Fi / mobile network estimate"],
    ip: ["Estimation d'après votre connexion Internet", "Estimate from your internet connection"],
  };
  return l === "en" ? map[source][1] : map[source][0];
}

/** Message complet à afficher : d'où vient la position, sa précision et la ville. */
export function positionMessage(fix: GeoFix, city: string | null, lang: string = "fr"): string {
  const l = norm(lang);
  const where = city ? (l === "en" ? ` near ${city}` : ` autour de ${city}`) : "";
  if (!fix.approximate) {
    return l === "en"
      ? `Location detected${where} — ${sourceLabel(fix.source, l)}, ${accuracyLabel(fix.accuracy, l)}.`
      : `Position détectée${where} — ${sourceLabel(fix.source, l)}, ${accuracyLabel(fix.accuracy, l)}.`;
  }
  const base =
    l === "en"
      ? `Approximate location${where} — ${sourceLabel(fix.source, l)}, ${accuracyLabel(fix.accuracy, l)}.`
      : `Position approximative${where} — ${sourceLabel(fix.source, l)}, ${accuracyLabel(fix.accuracy, l)}.`;
  const advice = fix.denied
    ? l === "en"
      ? " Location access was denied, so please type your exact pickup address."
      : " La géolocalisation a été refusée : indiquez votre adresse de départ exacte."
    : l === "en"
      ? " Please confirm or type your exact pickup address (street number + street)."
      : " Merci de confirmer ou de saisir votre adresse de départ exacte (numéro + rue).";
  return base + advice;
}

/** Message d'échec clair, sans jargon. */
export function failureMessage(reason: GeoFailure, lang: string = "fr"): string {
  const l = norm(lang);
  const map: Record<GeoFailure, [string, string]> = {
    denied: [
      "Géolocalisation refusée par votre navigateur. Autorisez-la dans les réglages du site, ou saisissez simplement votre adresse de départ ci-dessous.",
      "Location access was denied by your browser. Allow it in the site settings, or simply type your pickup address below.",
    ],
    timeout: [
      "Votre position met trop de temps à arriver (signal GPS faible). Saisissez votre adresse de départ ci-dessous, la réservation fonctionne normalement.",
      "Your location is taking too long (weak GPS signal). Type your pickup address below, booking works as usual.",
    ],
    unavailable: [
      "Position indisponible sur cet appareil. Saisissez votre adresse de départ ci-dessous, la réservation fonctionne normalement.",
      "Location unavailable on this device. Type your pickup address below, booking works as usual.",
    ],
  };
  return l === "en" ? map[reason][1] : map[reason][0];
}
