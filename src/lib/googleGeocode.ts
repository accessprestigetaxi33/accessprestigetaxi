// lib/googleGeocode.ts
// Géocodage / recherche d'adresses côté client.
//
// Tout passe désormais par /api/public/places (proxy serveur Google Maps) :
// la clé navigateur est restreinte par référent et échoue en preview, sur le
// domaine personnalisé ou en PWA. Le SDK JS reste réservé à l'affichage des
// cartes. Les signatures sont inchangées (drop-in).

import { placeDetails, placesAutocomplete, placesGeocode, placesReverse } from "./places";

export type GeoCoord = { lat: number; lng: number };
export type SearchResult = { coord: [number, number]; label: string };

// Lieux de Charente-Maritime que le géocodeur résout parfois sur une rue
// homonyme : on court-circuite avec des coordonnées vérifiées.
const CANONICAL_PLACES: Array<{ match: RegExp; label: string; coord: GeoCoord }> = [
  {
    match: /a[ée]roport.*(la\s*rochelle|r[ée]|lrh)|la\s*rochelle.*a[ée]roport/i,
    label: "Aéroport La Rochelle-Île de Ré (LRH)",
    coord: { lat: 46.1792, lng: -1.1953 },
  },
  {
    match: /gare\s*(sncf\s*)?(de\s*)?la\s*rochelle|la\s*rochelle.*gare/i,
    label: "Gare de La Rochelle",
    coord: { lat: 46.1531, lng: -1.1458 },
  },
  { match: /vieux[\s-]?port.*rochelle/i, label: "Vieux-Port de La Rochelle", coord: { lat: 46.1558, lng: -1.1528 } },
  { match: /aquarium.*rochelle/i, label: "Aquarium de La Rochelle", coord: { lat: 46.1539, lng: -1.1508 } },
  { match: /gare\s*(de\s*)?royan/i, label: "Gare de Royan", coord: { lat: 45.6256, lng: -1.0275 } },
  { match: /gare\s*(de\s*)?saintes/i, label: "Gare de Saintes", coord: { lat: 45.7486, lng: -0.6236 } },
  { match: /gare\s*(de\s*)?rochefort/i, label: "Gare de Rochefort", coord: { lat: 45.9447, lng: -0.9636 } },
  { match: /gare\s*(de\s*)?surg[eè]res/i, label: "Gare de Surgères", coord: { lat: 46.1078, lng: -0.7508 } },
  { match: /zoo.*palmyre|palmyre.*zoo/i, label: "Zoo de La Palmyre", coord: { lat: 45.6828, lng: -1.1675 } },
  { match: /fort\s*boyard/i, label: "Fort Boyard", coord: { lat: 45.9992, lng: -1.2133 } },
];

function matchCanonicalPlace(query: string): { label: string; coord: GeoCoord } | null {
  return CANONICAL_PLACES.find((p) => p.match.test(query)) ?? null;
}

/** Géocode une adresse texte → coordonnées. Retourne null si rien trouvé. */
export async function geocodeAddress(query: string): Promise<GeoCoord | null> {
  if (!query?.trim()) return null;
  const canonical = matchCanonicalPlace(query);
  if (canonical) return canonical.coord;
  const g = await placesGeocode(query);
  return g ? { lat: g.lat, lng: g.lng } : null;
}

/** Recherche d'adresses avec plusieurs résultats (autocomplete-like). */
export async function searchAddress(query: string, limit = 5): Promise<SearchResult[]> {
  if (!query?.trim()) return [];
  const out: SearchResult[] = [];
  const canonical = matchCanonicalPlace(query);
  if (canonical) out.push({ coord: [canonical.coord.lat, canonical.coord.lng], label: canonical.label });

  const remote = await placesAutocomplete(query);
  for (const r of remote) {
    if (out.length >= limit) break;
    if (typeof r.lat === "number" && typeof r.lng === "number") {
      out.push({ coord: [r.lat, r.lng], label: r.label });
      continue;
    }
    if (!r.placeId) continue;
    const d = await placeDetails(r.placeId);
    if (d) out.push({ coord: [d.lat, d.lng], label: d.label || r.label });
  }

  if (out.length === 0) {
    const g = await placesGeocode(query);
    if (g) out.push({ coord: [g.lat, g.lng], label: g.label });
  }
  return out.slice(0, limit);
}

/** Reverse geocoding : coordonnées → adresse formatée la plus proche. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  return placesReverse(lat, lng);
}

// ── Autocomplete temps réel (saisie utilisateur) ────────────────────────────

export type PlaceSuggestion = { placeId: string; description: string };

/** Suggestions d'adresses pendant la saisie (debounce côté composant). */
export async function getAddressSuggestions(input: string): Promise<PlaceSuggestion[]> {
  if (!input || input.trim().length < 3) return [];
  const remote = await placesAutocomplete(input);
  return remote
    .filter((r): r is typeof r & { placeId: string } => Boolean(r.placeId))
    .map((r) => ({ placeId: r.placeId, description: r.label }));
}

/** Résout un placeId (choisi dans les suggestions) en coordonnées précises. */
export async function resolvePlaceId(placeId: string): Promise<GeoCoord | null> {
  const d = await placeDetails(placeId);
  return d ? { lat: d.lat, lng: d.lng } : null;
}
