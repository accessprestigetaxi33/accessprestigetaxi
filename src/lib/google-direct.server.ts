// Accès Google Maps Platform — indépendant de Lovable.
//
// Deux chemins possibles, choisis automatiquement :
//  1. DIRECT (cible) : une clé serveur Google propre au projet
//     (`GOOGLE_MAPS_SERVER_KEY`), appelée directement chez Google. Aucun service
//     Lovable impliqué : fonctionne même à 0 crédit.
//  2. REPLI : la passerelle du connecteur Lovable, comme aujourd'hui, tant que
//     la clé serveur propre n'est pas configurée. Rien ne casse entre-temps.
//
// La clé serveur ne doit avoir AUCUNE restriction de référent HTTP (les clés
// « navigateur » sont refusées par Geocoding/Places/Routes côté serveur) : la
// restreindre par API + quota côté Google Cloud.

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

export function googleServerKey(): string | null {
  return (
    process.env["GOOGLE_MAPS_SERVER_KEY"] ||
    process.env["GOOGLE_MAPS_DIRECT_KEY"] ||
    null
  );
}

export function isDirectGoogle(): boolean {
  return !!googleServerKey();
}

/**
 * Traduit un chemin « passerelle » (/maps/api/..., /places/v1/..., /routes/...,
 * /geolocation/v1/...) en URL Google directe, ou en URL de passerelle en repli.
 */
export function googleUrl(path: string): string {
  const key = googleServerKey();
  if (!key) return `${GATEWAY}${path}`;

  let url: string;
  if (path.startsWith("/maps/")) {
    url = `https://maps.googleapis.com${path}`;
  } else if (path.startsWith("/places/v1/")) {
    url = `https://places.googleapis.com/v1/${path.slice("/places/v1/".length)}`;
  } else if (path.startsWith("/routes/")) {
    url = `https://routes.googleapis.com/${path.slice("/routes/".length)}`;
  } else if (path.startsWith("/geolocation/")) {
    url = `https://www.googleapis.com${path}`;
  } else {
    url = `https://maps.googleapis.com${path}`;
  }

  // Geocoding / Static Maps / Geolocation attendent la clé en query ; Places et
  // Routes l'acceptent en en-tête (voir googleHeaders).
  if (url.includes("maps.googleapis.com") || url.includes("www.googleapis.com")) {
    url += `${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(key)}`;
  }
  return url;
}

/** En-têtes d'authentification adaptés au chemin retenu (direct ou passerelle). */
export function googleHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const key = googleServerKey();
  if (key) {
    headers.delete("Authorization");
    headers.delete("X-Connection-Api-Key");
    headers.set("X-Goog-Api-Key", key);
    return headers;
  }
  const lovable = process.env["LOVABLE_API_KEY"];
  const connection =
    process.env["GOOGLE_MAPS_API_KEY"] ||
    process.env["GOOGLE_MAPS_API_KEY2"] ||
    process.env["GOOGLE_API_KEY"];
  if (lovable) headers.set("Authorization", `Bearer ${lovable}`);
  if (connection) headers.set("X-Connection-Api-Key", connection);
  return headers;
}

/** Vrai si un chemin Google est joignable (clé directe OU passerelle configurée). */
export function hasGoogleAccess(): boolean {
  if (googleServerKey()) return true;
  const lovable = process.env["LOVABLE_API_KEY"];
  const connection =
    process.env["GOOGLE_MAPS_API_KEY"] ||
    process.env["GOOGLE_MAPS_API_KEY2"] ||
    process.env["GOOGLE_API_KEY"];
  return !!lovable && !!connection;
}
