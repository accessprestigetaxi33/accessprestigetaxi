// Espace chauffeur commun : un seul compte de connexion, plusieurs profils
// (nombre illimité, ex. Adam / Ayoub / ...). Le profil actif est mémorisé
// sur l'appareil et joint à chaque action pour savoir qui prend ou passe la
// course. La liste des profils vient du serveur (driverAccounts) : ajouter
// ou retirer un chauffeur ne demande plus de changement de code.
import { driverAccounts } from "@/lib/driver.functions";

export type DriverProfile = string;
export type DriverProfileEntry = { slug: DriverProfile; name: string };

const KEY = "nova-driver-profile";
const CACHE_KEY = "nova-driver-profiles-cache";

/** Dernière liste connue (cache local), pour un affichage instantané avant le fetch réseau. */
export function cachedDriverProfiles(): DriverProfileEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as DriverProfileEntry[]) : [];
  } catch {
    return [];
  }
}

function writeCache(list: DriverProfileEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // stockage plein ou indisponible : tant pis, le cache n'est qu'un confort
  }
}

/** Récupère la liste actuelle des profils depuis le serveur. */
export async function fetchDriverProfiles(): Promise<DriverProfileEntry[]> {
  const list = await driverAccounts();
  if (list.length > 0) writeCache(list);
  return list;
}

export function getProfile(): DriverProfile | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = localStorage.getItem(KEY);
  if (stored) return stored;
  // Rien en storage (première connexion, storage vidé…) : on retombe sur le
  // premier profil connu plutôt que de renvoyer undefined, sinon les appels
  // serveur partent sans "as" et l'identité retombe sur le compte partagé
  // "equipe", qui ne matche jamais aucune course assignée à un chauffeur.
  return cachedDriverProfiles()[0]?.slug;
}

export function setProfile(p: DriverProfile) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, p);
}

export function profileName(p: DriverProfile | undefined, list: DriverProfileEntry[] = cachedDriverProfiles()) {
  return list.find((d) => d.slug === p)?.name ?? "Chauffeur";
}
