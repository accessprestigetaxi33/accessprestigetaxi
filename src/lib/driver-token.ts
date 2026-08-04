// Jeton du panneau chauffeur, stocké côté navigateur uniquement après
// validation par le serveur (le secret lui-même ne figure jamais dans le code).
const KEY ="driver_token";

export function getDriverToken(): string {
 if (typeof window ==="undefined") return"";
 try {
 return localStorage.getItem(KEY) ||"";
 } catch {
 return"";
 }
}

export function setDriverToken(token: string) {
 if (typeof window ==="undefined") return;
 localStorage.setItem(KEY, token);
}

export function clearDriverToken() {
 if (typeof window ==="undefined") return;
 localStorage.removeItem(KEY);
 localStorage.removeItem("driver_name");
}

const NAME_KEY ="driver_name";

export function getDriverName(): string {
 if (typeof window ==="undefined") return"";
 try {
 return localStorage.getItem(NAME_KEY) ||"";
 } catch {
 return"";
 }
}

export function setDriverName(name: string) {
 if (typeof window ==="undefined") return;
 try {
 localStorage.setItem(NAME_KEY, name);
 } catch {
 /* ignore */
 }
}
