// Jeton du panneau chauffeur, stocké côté navigateur uniquement après
// validation par le serveur (le secret lui-même ne figure jamais dans le code).
const KEY = "driver_token";

export function getDriverToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setDriverToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
}

export function clearDriverToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
