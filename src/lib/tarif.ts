// Tarifs officiels taxi (mêmes bases que Start Fresh Here)
export const PRISE_EN_CHARGE = 2.83;
export const TARIF_JOUR = 2.16; // €/km — tarif A (7h–19h)
export const TARIF_NUIT = 3.24; // €/km — tarif B (19h–7h, dimanche, jours fériés)
export const VITESSE_MOYENNE_KMH = 40; // vitesse moyenne estimée en ville

export const TARIFS = {
  PRISE_EN_CHARGE,
  TARIF_JOUR,
  TARIF_NUIT,
  VITESSE_MOYENNE_KMH,
} as const;

/** Frontière jour/nuit, heure de Paris : jour = [07:00, 19:00[, nuit sinon. */
export const HEURE_DEBUT_JOUR = 7;
export const HEURE_FIN_JOUR = 19;
const DEBUT_JOUR = HEURE_DEBUT_JOUR;
const FIN_JOUR = HEURE_FIN_JOUR;

/**
 * Extrait les composantes Paris d'une date de manière fiable (tous navigateurs,
 * tous runtimes serveur).
 */
/**
 * Parse une ISO datetime en supposant heure Paris si aucune timezone n'est indiquée.
 * Corrige le bug : "2026-06-22T17:00:00" sans Z → new Date() lit UTC → 19h Paris → faux tarif nuit.
 */
export function parseAsParisTime(iso: string): Date {
  if (!iso) return new Date();
  if (/Z|[+-]\d{2}:\d{2}$/.test(iso)) return new Date(iso);
  const provisional = new Date(iso + "Z");
  if (isNaN(provisional.getTime())) return new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(provisional);
  const parisH = parseInt(parts.find((p) => p.type === "hour")!.value, 10) % 24;
  const parisM = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
  const [, h, m] = iso.match(/T(\d{2}):(\d{2})/) ?? ["", "0", "0"];
  const wantedH = parseInt(h, 10);
  const wantedM = parseInt(m, 10);
  const diffMs = (wantedH * 60 + wantedM - (parisH * 60 + parisM)) * 60_000;
  return new Date(provisional.getTime() + diffMs);
}

export function partsParis(iso: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
} {
  const date = parseAsParisTime(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return {
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
    hour: parseInt(get("hour"), 10) % 24,
    minute: parseInt(get("minute"), 10),
    weekday: get("weekday"),
  };
}

// Dimanche de Pâques (Meeus/Jones/Butcher, grégorien).
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function addDays(year: number, month: number, day: number, add: number) {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + add);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

// Jours fériés légaux français (métropole).
export function estJourFerieFR(year: number, month: number, day: number): boolean {
  const fixed: Array<[number, number]> = [
    [1, 1],
    [5, 1],
    [5, 8],
    [7, 14],
    [8, 15],
    [11, 1],
    [11, 11],
    [12, 25],
  ];
  if (fixed.some(([m, d]) => m === month && d === day)) return true;
  const e = easterSunday(year);
  const movable = [
    addDays(year, e.month, e.day, 1), // Lundi de Pâques
    addDays(year, e.month, e.day, 39), // Ascension
    addDays(year, e.month, e.day, 50), // Lundi de Pentecôte
  ];
  return movable.some((f) => f.month === month && f.day === day);
}

/**
 * Tarif nuit : 19h–7h heure de Paris, OU dimanche, OU jour férié (toute la journée).
 */
export function estTarifNuitJournee(iso: string): boolean {
  return !estTarifJourParis(iso);
}

export function estTarifJourParis(iso: string): boolean {
  const p = partsParis(iso);
  if (p.weekday === "Sun") return false;
  if (estJourFerieFR(p.year, p.month, p.day)) return false;
  const h = p.hour + p.minute / 60;
  return h >= DEBUT_JOUR && h < FIN_JOUR;
}

function arrondir(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Calcul simple — tarif uniforme sur toute la course.
 * Conservé pour compatibilité et pour les cas sans datetime.
 */
export function calculerPrix(distanceKm: number, tarifJour: boolean): number {
  const tarifKm = tarifJour ? TARIF_JOUR : TARIF_NUIT;
  return arrondir(PRISE_EN_CHARGE + distanceKm * tarifKm);
}

/**
 * Calcul mixte : prorata jour/nuit selon l'heure de Paris.
 * Règle unique : 7h–19h = jour, 19h–7h = nuit.
 *
 * @param distanceKm  Distance totale de la course
 * @param pickupIso   ISO datetime de prise en charge
 */
export function calculerPrixMixte(distanceKm: number, pickupIso: string): number {
  return detaillerPrix(distanceKm, pickupIso).total;
}

export type DetailPrix = {
  distanceKm: number;
  dureeMin: number;
  priseEnCharge: number;
  tarifKmJour: number;
  tarifKmNuit: number;
  kmJour: number;
  kmNuit: number;
  prixJour: number;
  prixNuit: number;
  total: number;
  /** "jour" | "nuit" | "mixte" — régime tarifaire dominant sur la course. */
  regime: "jour" | "nuit" | "mixte";
  /** Vrai si le départ lui-même est en tarif jour. */
  departJour: boolean;
};

/**
 * Décomposition complète du prix — source unique de vérité partagée par
 * l'assistante de réservation, la page /reserver et les simulateurs.
 *
 * Règle jour/nuit unique : jour = 07:00–19:00 heure de Paris, hors dimanche
 * et jours fériés (nuit toute la journée dans ces cas).
 *
 * @param dureeMinOverride durée réelle du trajet (min) si connue (Google Routes),
 *                         sinon estimée avec VITESSE_MOYENNE_KMH.
 */
export function detaillerPrix(
  distanceKm: number,
  pickupIso: string,
  dureeMinOverride?: number,
): DetailPrix {
  const dist = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0;
  const dureeMin =
    dureeMinOverride && dureeMinOverride > 0
      ? dureeMinOverride
      : Math.max(Math.round((dist / VITESSE_MOYENNE_KMH) * 60), 1);

  const iso = pickupIso || new Date().toISOString();
  const departJour = estTarifJourParis(iso);

  let kmJour = 0;
  let kmNuit = 0;

  if (dist <= 0) {
    // Pas de distance : pas de kilométrage, seule la prise en charge s'applique.
  } else {
    const departMs = parseAsParisTime(iso).getTime();
    const steps = Math.max(Math.ceil(dureeMin), 1);
    const stepMs = (dureeMin * 60_000) / steps;
    const kmSlice = dist / steps;
    for (let i = 0; i < steps; i++) {
      const t = new Date(departMs + i * stepMs).toISOString();
      if (estTarifJourParis(t)) kmJour += kmSlice;
      else kmNuit += kmSlice;
    }
  }

  const prixJour = kmJour * TARIF_JOUR;
  const prixNuit = kmNuit * TARIF_NUIT;
  const regime: DetailPrix["regime"] =
    kmJour > 0.01 && kmNuit > 0.01 ? "mixte" : kmNuit > 0.01 ? "nuit" : "jour";

  return {
    distanceKm: dist,
    dureeMin,
    priseEnCharge: PRISE_EN_CHARGE,
    tarifKmJour: TARIF_JOUR,
    tarifKmNuit: TARIF_NUIT,
    kmJour: arrondir(kmJour),
    kmNuit: arrondir(kmNuit),
    prixJour: arrondir(prixJour),
    prixNuit: arrondir(prixNuit),
    total: arrondir(PRISE_EN_CHARGE + prixJour + prixNuit),
    regime,
    departJour,
  };
}

/**
 * Stub — à remplacer par un vrai appel OSRM/Mapbox si besoin.
 */
export function estimerDistance(_depart: string, _destination: string): number {
  return 5;
}
