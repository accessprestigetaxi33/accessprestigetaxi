// Gestion du service worker de l'application (site client + espace chauffeur).
//
//  - En preview Lovable / dev / iframe : aucun service worker applicatif n'est
//    enregistré, et tout SW obsolète est supprimé (le worker Firebase Messaging
//    est toujours préservé : il gère les notifications push).
//  - En production : on enregistre /sw.js (généré par vite-plugin-pwa) pour
//    disposer d'un cache hors-ligne des pages essentielles.
//  - `?sw=off` désinstalle tout, comme interrupteur d'urgence.
//
//  IMPORTANT : si un ancien service worker (d'un déploiement précédent) est
//  détecté, on le désinscrit ET on force un rechargement unique de la page.
//  Sans ça, la session en cours continue de tourner sur le vieux bundle JS
//  déjà servi par cet ancien SW, même après désinscription (le unregister()
//  n'affecte que les futures navigations, pas la page déjà chargée).
//  Une garde sessionStorage évite toute boucle de rechargement.

const RELOAD_GUARD_KEY = "pwa:reloaded-after-sw-cleanup";

function isLovablePreviewHost(hostname: string): boolean {
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com")) return true;
  if (hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com")) return true;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev")) return true;
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  return false;
}

function isMessagingWorker(url: string): boolean {
  return url.includes("firebase-messaging-sw");
}

async function unregisterAppServiceWorkers(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  let didUnregister = false;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      const url = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || "";
      // Ne jamais toucher au worker de notifications push.
      if (isMessagingWorker(url)) continue;
      const ok = await reg.unregister();
      didUnregister = didUnregister || ok;
    }
  } catch {
    /* noop */
  }
  return didUnregister;
}

async function clearAppCaches(): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  let didClear = false;
  try {
    const names = await caches.keys();
    for (const name of names) {
      if (name.includes("firebase")) continue;
      const ok = await caches.delete(name);
      didClear = didClear || ok;
    }
  } catch {
    /* noop */
  }
  return didClear;
}

/**
 * Désinscrit les anciens SW + vide les caches applicatifs. Si quelque chose
 * a effectivement été nettoyé, recharge la page une seule fois (garde via
 * sessionStorage) pour que la session en cours reparte sur les ressources
 * fraîches, au lieu de continuer à tourner sur l'ancien bundle JS.
 */
async function cleanupStaleServiceWorkerAndReload(): Promise<void> {
  const unregistered = await unregisterAppServiceWorkers();
  const cleared = await clearAppCaches();

  if (!unregistered && !cleared) return;

  let alreadyReloaded = false;
  try {
    alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === "1";
  } catch {
    /* sessionStorage indisponible (mode privé strict, etc.) : on ne reload pas
       pour éviter tout risque de boucle sans garde. */
    return;
  }

  if (alreadyReloaded) return;

  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  } catch {
    return;
  }

  window.location.reload();
}

export function registerPWA(onUpdateReady: (applyUpdate: () => void) => void): () => void {
  void onUpdateReady;
  if (typeof window === "undefined") return () => {};

  const inIframe = window.self !== window.top;
  const previewHost = isLovablePreviewHost(window.location.hostname);
  const killSwitch = new URLSearchParams(window.location.search).get("sw") === "off";
  const blocked = !import.meta.env.PROD || inIframe || previewHost || killSwitch;

  if (blocked) {
    void cleanupStaleServiceWorkerAndReload();
    return () => {};
  }

  if (!("serviceWorker" in navigator)) return () => {};

  // Firebase Messaging owns the root scope so background notifications keep
  // working when the installed PWA is closed or the screen is locked.
  // Workbox cannot share the same root registration with another worker.
  void cleanupStaleServiceWorkerAndReload();
  return () => {};
}
