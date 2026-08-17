// Firebase Cloud Messaging — client integration
// Projet Firebase : access-prestige-taxi
// Les credentials Web Firebase sont publics par design (ils ne protègent
// aucune ressource backend — seules les Règles de sécurité Firebase le font).
// Alignement sur l'approche de José (Taxi City) : config codée en dur, pas de
// fetch réseau avant initializeApp — ça évite tout délai async entre le clic
// utilisateur et Notification.requestPermission() (bug Safari iOS).
import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { deleteToken, getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";

export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAFZbm2eneX6wwScKtDv4w_h6bpoq6YvkY",
  authDomain: "access-prestige-taxi.firebaseapp.com",
  projectId: "access-prestige-taxi",
  storageBucket: "access-prestige-taxi.firebasestorage.app",
  messagingSenderId: "214617543164",
  appId: "1:214617543164:web:8094538b9f17694aa5e279",
  measurementId: "G-LFXHZHLHKE",
};

// Clé VAPID *Web Push* de Firebase (Console → Cloud Messaging → Web configuration)
export const FCM_VAPID_KEY = "BBQRPJr-QmMck_pEZaFG40c9Xbkx_H-ainAbURLLURKRGKs5p9qQgRvA69FS7buRut0WuW5gCI0g1VtEFMss18Y";

// FCM révoque les tokens après ~60 jours d'inactivité.
// On force un refresh silencieux tous les 50 jours pour garder le token vivant indéfiniment.
const TOKEN_MAX_AGE_MS = 50 * 24 * 60 * 60 * 1000; // 50 jours

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
    if (!app) app = initializeApp(firebaseConfig);
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

  const msg = await initFirebase();
  if (!msg) return null;

  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      console.warn("[FCM] Permission refusée :", perm);
      return null;
    }

    // On cherche le SW Firebase par son scriptURL exact parmi tous les SW enregistrés.
    // getRegistration("/") retourne n'importe quel SW sur le scope "/" (ex: Vite HMR)
    // ce qui fait que FCM reçoit le mauvais SW → token OK sur desktop mais notifs silencieuses sur mobile.
    const SW_URL = "/firebase-messaging-sw.js";
    const allRegs = await navigator.serviceWorker.getRegistrations();
    let swReg = allRegs.find(
      (r) =>
        r.active?.scriptURL.includes(SW_URL) ||
        r.installing?.scriptURL.includes(SW_URL) ||
        r.waiting?.scriptURL.includes(SW_URL),
    );
    if (!swReg) {
      swReg = await navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" });
    } else {
      await swReg.update().catch((err) => console.warn("[FCM] SW update check failed", err));
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
    if (swReg.installing || swReg.waiting) {
      await new Promise<void>((resolve) => {
        const sw = swReg!.installing ?? swReg!.waiting!;
        const timeout = setTimeout(resolve, 8000);
        sw.addEventListener("statechange", function handler() {
          if (sw.state === "activated" || sw.state === "redundant") {
            clearTimeout(timeout);
            sw.removeEventListener("statechange", handler);
            resolve();
          }
        });
      });
    }

    if (!swReg.active) {
      const readyReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((r) => setTimeout(() => r(null), 5000)),
      ]);
      if (!readyReg) {
        console.warn("[FCM] SW not ready after timeout, proceeding anyway");
      }
    }

    const cachedToken = window.localStorage.getItem("fcm_token");
    const lastRefresh = parseInt(window.localStorage.getItem("fcm_token_last_refresh") ?? "0", 10);
    const tokenAge = Date.now() - lastRefresh;
    const tokenExpired = tokenAge > TOKEN_MAX_AGE_MS;

    if (!options.forceRefresh && cachedToken && !tokenExpired) {
      console.log("[FCM] Token en cache utilisé :", cachedToken.slice(-8), `(${Math.floor(tokenAge / 86400000)}j)`);
      return cachedToken;
    }

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
      icon: payload.notification?.icon ?? "/favicon.png",
      badge: "/favicon.png",
      tag: payload.data?.tag ?? "taxi-fcm",
      data: payload.data ?? {},
      vibrate: [200, 100, 200],
      requireInteraction: true,
    } as NotificationOptions;

    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options);
    });
  });
}
