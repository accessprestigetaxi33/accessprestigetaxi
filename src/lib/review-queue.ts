import { supabase } from "@/integrations/supabase/client";

export type QueuedReview = {
  id: string;
  author_name: string;
  note: number;
  commentaire: string;
  status: "pending";
  queued_at: string;
};

const DB_NAME = "access-prestige-offline";
const STORE_NAME = "reviews";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function queueReview(review: QueuedReview): Promise<IDBValidKey> {
  return withStore("readwrite", (store) => store.put(review));
}

export function listQueuedReviews(): Promise<QueuedReview[]> {
  return withStore("readonly", (store) => store.getAll());
}

function deleteQueuedReview(id: string): Promise<undefined> {
  return withStore("readwrite", (store) => store.delete(id) as IDBRequest<undefined>);
}

/** État de synchronisation exposé à l'interface. */
export type ReviewSyncState = {
  phase: "idle" | "queued" | "sending" | "sent" | "error";
  pending: number;
  total: number;
  sent: number;
  lastSyncedAt: string | null;
};

let syncState: ReviewSyncState = { phase: "idle", pending: 0, total: 0, sent: 0, lastSyncedAt: null };
const listeners = new Set<(s: ReviewSyncState) => void>();

function setSyncState(patch: Partial<ReviewSyncState>) {
  syncState = { ...syncState, ...patch };
  listeners.forEach((l) => l(syncState));
}

export function getReviewSyncState(): ReviewSyncState {
  return syncState;
}

export function subscribeReviewSync(listener: (s: ReviewSyncState) => void): () => void {
  listeners.add(listener);
  listener(syncState);
  return () => listeners.delete(listener);
}

/** Recalcule le nombre d'avis en attente et met l'état à jour. */
export async function refreshReviewSyncState(): Promise<number> {
  if (typeof indexedDB === "undefined") return 0;
  try {
    const queued = await listQueuedReviews();
    setSyncState({
      pending: queued.length,
      phase: queued.length > 0 ? "queued" : syncState.phase === "sent" ? "sent" : "idle",
    });
    return queued.length;
  } catch {
    return 0;
  }
}

export async function flushQueuedReviews(): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await refreshReviewSyncState();
    return 0;
  }
  const queued = await listQueuedReviews();
  if (queued.length === 0) {
    setSyncState({ pending: 0, total: 0 });
    return 0;
  }
  setSyncState({ phase: "sending", pending: queued.length, total: queued.length, sent: 0 });
  let sent = 0;
  for (const review of queued) {
    const { error } = await (supabase as any).from("avis").insert({
      author_name: review.author_name,
      note: review.note,
      commentaire: review.commentaire,
      status: review.status,
    });
    if (error) {
      setSyncState({ phase: "error" });
      continue;
    }
    await deleteQueuedReview(review.id);
    sent += 1;
    setSyncState({ sent, pending: queued.length - sent });
  }
  const remaining = queued.length - sent;
  setSyncState({
    phase: remaining > 0 ? (sent > 0 ? "queued" : "error") : "sent",
    pending: remaining,
    lastSyncedAt: sent > 0 ? new Date().toISOString() : syncState.lastSyncedAt,
  });
  return sent;
}

export function startReviewQueueSync(onSynced?: (count: number) => void): () => void {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return () => {};
  let active = true;
  const sync = () => {
    void flushQueuedReviews().then((count) => {
      if (active && count > 0) onSynced?.(count);
    }).catch(() => {});
  };
  void refreshReviewSyncState();
  sync();

  window.addEventListener("online", sync);
  window.addEventListener("focus", sync);
  document.addEventListener("visibilitychange", sync);
  return () => {
    active = false;
    window.removeEventListener("online", sync);
    window.removeEventListener("focus", sync);
    document.removeEventListener("visibilitychange", sync);
  };
}