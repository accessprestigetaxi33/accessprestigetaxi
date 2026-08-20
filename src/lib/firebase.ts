// Firebase Cloud Messaging — client integration
// Projet Firebase : access-prestige-taxi
// Les credentials Web Firebase sont publics par design ; l'apiKey est servie
// par /api/public/firebase-config (secret GOOGLE_API_KEY) pour rester hors dépôt.
import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { deleteToken, getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";

export const firebaseConfig: FirebaseOptions = {
  authDomain: "access-prestige-taxi.firebaseapp.com",
  projectId: "access-prestige-taxi",
  storageBucket: "access-prestige-taxi.firebasestorage.app",
  messagingSenderId: "214617543164",
  appId: "1:214617543164:web:8094538b9f17694aa5e279",
  measurementId: "G-LFXHZHLHKE",
};

let configPromise: Promise<FirebaseOptions> | null = null;

/** Récupère la config complète (avec apiKey) depuis le serveur, une seule fois. */
async function loadFirebaseConfig(): Promise<FirebaseOptions> {
  if (!configPromise) {
    configPromise = fetch("/api/public/firebase-config")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`config ${r.status}`))))
      .then((remote) => ({ ...firebaseConfig, ...remote }) as FirebaseOptions)
      .catch((err) => {
        console.error("[FCM] config fetch failed", err);
        configPromise = null;
        throw err;
      });
  }
  return configPromise;
}

// Clé VAPID *Web Push* de Firebase (Console → Cloud Messaging → Web configuration)
export const FCM_VAPID_KEY = "BBQRPJr-QmMck_pEZaFG40c9Xbkx_H-ainAbURLLURKRGKs5p9qQgRvA69FS7buRut0WuW5gCI0g1VtEFMss18Y";

// FCM révoque les tokens après ~60 jours d'inactivité.
// On force un refresh silencieux tous les 50 jours pour garder le token vivant indéfiniment.
const TOKEN_MAX_AGE_MS = 50 * 24 * 60 * 60 * 1000; // 50 jours
// Keep the Firebase worker at the root scope, as required by the installed
// PWA on iOS/iPadOS and by the working Taxi City deployment.
const FCM_SCOPE = "/";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function initFirebase(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("[FCM] Not supported in this browser");
      return null;
    }
    if (!app) app = initializeApp(await loadFirebaseConfig());
    if (!messaging) messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.error("[FCM] init failed", err);
    return null;
  }
}

export async function getFcmToken(options: { forceRefresh?: boolean } = {}): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

  // ⚠️ CORRECTIF : sur Safari iOS (surtout en PWA installée), l'activation
  // utilisateur (le clic) expire dès qu'un await réseau intervient avant
  // Notification.requestPermission(). initFirebase() fait un fetch de config
  // + isSupported() ; si on l'attend d'abord, le clic n'est plus "frais" et
  // Safari ignore/refuse silencieusement la demande (aucune popup, aucune
  // erreur visible). On demande donc la permission EN PREMIER, dans la
  // continuité directe du clic, avant tout autre await.
  if (Notification.permission === "denied") {
    console.warn("[FCM] Permission déjà refusée");
    return null;
  }
  let perm: NotificationPermission = Notification.permission;
  if (perm !== "granted") {
    perm = await Notification.requestPermission();
  }
  if (perm !== "granted") {
    console.warn("[FCM] Permission refusée :", perm);
    return null;
  }

  const msg = await initFirebase();
  if (!msg) return null;

  try {
    // On cherche le SW Firebase par son scriptURL exact parmi tous les SW enregistrés.
    // getRegistration("/") retourne n'importe quel SW sur le scope "/" (ex: Vite HMR)
    // ce qui fait que FCM reçoit le mauvais SW → token OK sur desktop mais notifs silencieuses sur mobile.
    const SW_URL = "/firebase-messaging-sw.js";
    const allRegs = await navigator.serviceWorker.getRegistrations();
    const oldMessagingRegs = allRegs.filter(
      (r) =>
        r.scope !== new URL(FCM_SCOPE, window.location.origin).href &&
        (r.active?.scriptURL.includes(SW_URL) ||
          r.installing?.scriptURL.includes(SW_URL) ||
          r.waiting?.scriptURL.includes(SW_URL)),
    );
    await Promise.all(oldMessagingRegs.map((r) => r.unregister()));
    const rootScope = new URL(FCM_SCOPE, window.location.origin).href;
    const isFirebaseRegistration = (r: ServiceWorkerRegistration) =>
      [r.active, r.installing, r.waiting].some((worker) => worker?.scriptURL.includes(SW_URL));
    let swReg = allRegs.find((r) => r.scope === rootScope && isFirebaseRegistration(r));
    const wrongRootReg = allRegs.find((r) => r.scope === rootScope && !isFirebaseRegistration(r));
    // ⚠️ CORRECTIF : on ne désenregistre plus aveuglément un SW au scope "/"
    // qui n'est pas Firebase — ça pouvait supprimer un autre SW applicatif
    // (cache offline, PWA) partageant le même scope. On se contente de
    // logger pour diagnostic ; register() ci-dessous coexistera avec lui.
    if (wrongRootReg) {
      console.warn("[FCM] Autre SW détecté au scope racine (non désenregistré) :", wrongRootReg.active?.scriptURL);
    }
    if (!swReg) {
      swReg = await navigator.serviceWorker.register(SW_URL, {
        scope: FCM_SCOPE,
        updateViaCache: "none",
      });
    } else {
      await swReg.update().catch((err) => console.warn("[FCM] SW update check failed", err));
      // Si une nouvelle version est en attente, force la prise de contrôle.
      if (swReg.waiting) {
        swReg.waiting.postMessage({ type: "FCM_SW_SKIP_WAITING" });
      }
    }

    // Log de la version active du SW pour debug clic notif
    try {
      const active = swReg.active;
      if (active) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (ev) => console.log("[FCM] SW version active:", ev.data?.version);
        active.postMessage({ type: "FCM_SW_VERSION" }, [channel.port2]);
      }
    } catch (_) {}

    // Attendre que le SW Firebase soit actif avant de demander le token
    // Timeout de 15s (augmenté de 8s) pour accommoder les connexions 4G/3G
    if (swReg.installing || swReg.waiting) {
      await new Promise<void>((resolve) => {
        const sw = swReg!.installing ?? swReg!.waiting!;
        const timeout = setTimeout(resolve, 15000); // Augmenté de 8s à 15s
        sw.addEventListener("statechange", function handler() {
          if (sw.state === "activated" || sw.state === "redundant") {
            clearTimeout(timeout);
            sw.removeEventListener("statechange", handler);
            resolve();
          }
        });
      });
    }

    // Vérification finale : si le SW est toujours pas actif, on attend navigator.serviceWorker.ready
    if (!swReg.active) {
      const readyReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((r) => setTimeout(() => r(null), 5000)),
      ]);
      if (!readyReg) {
        console.warn("[FCM] SW not ready after timeout, proceeding anyway");
      }
    }

    // Un token obtenu avec un autre service worker ne doit pas etre reutilise
    // apres une migration de scope : FCM l'associe a l'enregistrement fourni.
    const cachedToken = window.localStorage.getItem("fcm_token");
    const cachedScope = window.localStorage.getItem("fcm_registration_scope");
    const lastRefresh = parseInt(window.localStorage.getItem("fcm_token_last_refresh") ?? "0", 10);
    const tokenAge = Date.now() - lastRefresh;
    const tokenExpired = tokenAge > TOKEN_MAX_AGE_MS;

    if (!options.forceRefresh && cachedToken && cachedScope === FCM_SCOPE && !tokenExpired) {
      console.log("[FCM] Token en cache utilisé :", cachedToken.slice(-8), `(${Math.floor(tokenAge / 86400000)}j)`);
      return cachedToken;
    }

    // Token absent, expiré (>50j) ou forceRefresh explicite → rotation silencieuse
    if (cachedToken) {
      await deleteToken(msg).catch((err) => console.warn("[FCM] old token delete skipped", err));
      window.localStorage.removeItem("fcm_token");
    }

    const token = await getToken(msg, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      console.log("[FCM] Token obtenu :", token);
      window.localStorage.setItem("fcm_token", token);
      window.localStorage.setItem("fcm_token_last_refresh", String(Date.now()));
      window.localStorage.setItem("fcm_registration_scope", FCM_SCOPE);
    } else {
      console.warn("[FCM] Token vide — vérifier VAPID key et SW");
    }

    return token || null;
  } catch (err) {
    console.error("[FCM] getFcmToken failed", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void): () => void {
  let unsub: (() => void) | null = null;
  initFirebase().then((msg) => {
    if (!msg) return;
    unsub = onMessage(msg, (payload) => {
      console.log("[FCM] Message foreground reçu :", payload);
      try {
        callback(payload);
      } catch (err) {
        console.error("[FCM] onForegroundMessage callback error", err);
      }
    });
  });
  return () => {
    if (unsub) unsub();
  };
}

/**
 * Affiche une notification native quand l'app est en foreground.
 * À appeler dans ton composant racine (App.tsx ou _app.tsx) :
 *
 *   useEffect(() => {
 *     return setupForegroundNotifications();
 *   }, []);
 */
export function setupForegroundNotifications(): () => void {
  return onForegroundMessage((payload) => {
    const title = payload.notification?.title ?? "Access Prestige Taxi";
    const options = {
      body: payload.notification?.body ?? "",
      icon: payload.notification?.icon ?? "/favicon.ico",
      badge: "/favicon.ico",
      tag: payload.data?.tag ?? "taxi-fcm",
      data: payload.data ?? {},
      vibrate: [200, 100, 200],
      requireInteraction: true,
    } as NotificationOptions;

    // Afficher via le Service Worker pour garantir l'affichage même en foreground
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options);
    });
  });
}
