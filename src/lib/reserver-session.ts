// Reprise automatique du formulaire IA de /reserver.
// L'état de la conversation, le devis calculé et les coordonnées saisies sont
// conservés dans sessionStorage : un rafraîchissement (F5) ou un retour arrière
// navigateur restaure exactement l'écran quitté, sans reposer la question au client.
//
// sessionStorage (et non localStorage) : les données de contact sont effacées
// dès la fermeture de l'onglet, et la reprise expire au bout de 2 h.

export type ReserverChatMsg = { role: "user" | "assistant"; content: string };

export type ReserverQuote = {
  distance_km?: number;
  duree_min?: number;
  prix_estime?: number;
  depart_resolu?: string;
  arrivee_resolu?: string;
  pickup_datetime?: string;
};

export type ReserverForm = {
  nom: string;
  telephone: string;
  email: string;
  passagers: string;
  bagages: string;
  note: string;
  agree: boolean;
};

export type ReserverSession = {
  v: 1;
  savedAt: number;
  lang: "fr" | "en";
  messages: ReserverChatMsg[];
  quote: ReserverQuote | null;
  form: ReserverForm;
  manualDepart: string;
  manualDepartCoord: { lat: number; lng: number } | null;
  reservationId: string | null;
  suiviId: string | null;
};

const KEY = "apt_reserver_state_v1";
const TTL_MS = 2 * 60 * 60 * 1000; // 2 h
const MAX_MESSAGES = 40;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveReserverSession(state: Omit<ReserverSession, "v" | "savedAt">): void {
  const s = storage();
  if (!s) return;
  try {
    const payload: ReserverSession = {
      v: 1,
      savedAt: Date.now(),
      ...state,
      messages: state.messages.slice(-MAX_MESSAGES),
    };
    s.setItem(KEY, JSON.stringify(payload));
  } catch {
    // quota plein / mode privé : la reprise est un confort, jamais bloquante.
  }
}

export function loadReserverSession(): ReserverSession | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReserverSession;
    if (parsed?.v !== 1 || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      s.removeItem(KEY);
      return null;
    }
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearReserverSession(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    /* noop */
  }
}
