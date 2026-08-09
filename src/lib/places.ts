// Client léger vers /api/public/places (proxy serveur Google Maps).
// Sert d'unique source d'adresses pour l'autocomplétion, le géocodage et le
// géocodage inverse — indépendant des restrictions de référent de la clé
// navigateur (fonctionne en preview, sur le domaine perso et en PWA).

export type PlaceSuggestion = {
  placeId: string | null;
  label: string;
  lat: number | null;
  lng: number | null;
};

async function post<T>(body: Record<string, unknown>, timeoutMs = 9000): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch("/api/public/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function placesAutocomplete(query: string, lang = "fr"): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 3) return [];
  const data = await post<{ suggestions: PlaceSuggestion[] }>({ action: "autocomplete", query, lang });
  return data?.suggestions ?? [];
}

export async function placeDetails(
  placeId: string,
  lang = "fr",
): Promise<{ lat: number; lng: number; label: string } | null> {
  return post({ action: "details", place_id: placeId, lang });
}

export async function placesGeocode(
  query: string,
  lang = "fr",
): Promise<{ lat: number; lng: number; label: string } | null> {
  return post({ action: "geocode", query, lang });
}

export async function placesReverse(lat: number, lng: number, lang = "fr"): Promise<string | null> {
  const data = await post<{ label: string }>({ action: "reverse", lat, lng, lang });
  return data?.label ?? null;
}

export async function placesGeolocate(): Promise<{ lat: number; lng: number; accuracy: number | null } | null> {
  return post({ action: "geolocate" }, 6000);
}
