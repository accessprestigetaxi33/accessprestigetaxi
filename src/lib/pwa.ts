// Gestion du service worker de l'application (site client + espace chauffeur).
//
//  - En preview Lovable / dev / iframe : aucun service worker applicatif n'est
//    enregistré, et tout SW obsolète est supprimé (le worker Firebase Messaging
//    est toujours préservé : il gère les notifications push).
//  - En production : on enregistre /sw.js (généré par vite-plugin-pwa) pour
//    disposer d'un cache hors-ligne des pages essentielles.
//  - `?sw=off` désinstalle tout, comme interrupteur d'urgence.
import { APP_VERSION } from "@/lib/version";

const VERSION_KEY = "app:version";
const RELOADED_FLAG = "app:version-reloaded";

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

export async function registerPWA(): Promise<void> {
  if (typeof window === "undefined") return;

  const inIframe = window.self !== window.top;
  const previewHost = isLovablePreviewHost(window.location.hostname);
  const killSwitch = new URLSearchParams(window.location.search).get("sw") === "off";
  const blocked = !import.meta.env.PROD || inIframe || previewHost || killSwitch;

  if (blocked) {
    await unregisterAppServiceWorkers();
    await clearAppCaches();
    return;
  }

  // ── Production : cache hors-ligne actif ──
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      // Cherche une nouvelle version à chaque ouverture de l'app.
      void reg.update().catch(() => {});
    } catch {
      /* noop */
    }
  }

  try {
    const stored = window.localStorage.getItem(VERSION_KEY);
    const alreadyReloaded = window.sessionStorage.getItem(RELOADED_FLAG) === APP_VERSION;

    if (stored !== APP_VERSION) {
      window.localStorage.setItem(VERSION_KEY, APP_VERSION);
      if (!alreadyReloaded && stored !== null) {
        window.sessionStorage.setItem(RELOADED_FLAG, APP_VERSION);
        const u = new URL(window.location.href);
        u.searchParams.set("_v", APP_VERSION);
        window.location.replace(u.toString());
      }
    }
  } catch {
    /* noop */
  }
}
