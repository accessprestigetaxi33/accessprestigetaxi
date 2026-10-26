// Firebase Cloud Messaging — client integration
// Projet Firebase : access-prestige-taxi
// Les credentials Web Firebase sont PUBLICS par design (comme sur Taxi City
// Bordeaux, où le push fonctionne) : on les fige ici pour éviter toute
// dépendance réseau/cache. ⚠️ Ne jamais remettre la clé Google Maps ici :
// elle vient d'un autre projet GCP et provoque un 403 API_KEY_SERVICE_BLOCKED
// sur firebaseinstallations → aucun token FCM possible.
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

async function loadFirebaseConfig(): Promise<FirebaseOptions> {
  return firebaseConfig;
}


// Clé VAPID *Web Push* de Firebase (Console → Cloud Messaging → Web configuration)
export const FCM_VAPID_KEY = "BBQRPJr-QmMck_pEZaFG40c9Xbkx_H-ainAbURLLURKRGKs5p9qQgRvA69FS7buRut0WuW5gCI0g1VtEFMss18Y";

// FCM révoque les tokens après ~60 jours d'inactivité.
// On force un refresh silencieux tous les 50 jours pour garder le token vivant indéfiniment.
const TOKEN_MAX_AGE_MS = 50 * 24 * 60 * 60 * 1000; // 50 jours
// Keep the Firebase worker at the root scope, as required by the installed
// PWA on iOS/iPadOS and by the working Taxi City deployment.
const FCM_SCOPE = "/";

/**
 * Raison du dernier échec de getFcmToken(). Permet à l'UI de dire POURQUOI
 * l'activation a échoué au lieu d'afficher un « unsupported » trompeur
 * (l'app peut être parfaitement installée en PWA et échouer pour une toute
 * autre raison : permission ignorée, service worker KO, VAPID/token vide…).
 */
export type FcmFailureReason =
  | "no-window"
  | "no-api"
  | "permission-denied"
  | "permission-dismissed"
  | "not-supported"
  | "sw-failed"
  | "empty-token"
  | "error";

let lastFcmFailure: { reason: FcmFailureReason; detail?: string } | null = null;
export function getLastFcmFailure() {
  return lastFcmFailure;
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function initFirebase(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("[FCM] Not supported in this browser");
      lastFcmFailure = { reason: "not-supported" };
      return null;
    }
    if (!app) app = initializeApp(await loadFirebaseConfig());
    if (!messaging) messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.error("[FCM] init failed", err);
    lastFcmFailure = { reason: "error", detail: (err as Error)?.message };
    return null;
  }
}

export async function getFcmToken(options: { forceRefresh?: boolean } = {}): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    lastFcmFailure = { reason: "no-api" };
    return null;
  }
  lastFcmFailure = null;

  // ⚠️ CORRECTIF : sur Safari iOS (surtout en PWA installée), l'activation
  // utilisateur (le clic) expire dès qu'un await réseau intervient avant
  // Notification.requestPermission(). initFirebase() fait un fetch de config
  // + isSupported() ; si on l'attend d'abord, le clic n'est plus "frais" et
  // Safari ignore/refuse silencieusement la demande (aucune popup, aucune
  // erreur visible). On demande donc la permission EN PREMIER, dans la
  // continuité directe du clic, avant tout autre await.
  if (Notification.permission === "denied") {
    console.warn("[FCM] Permission déjà refusée");
    lastFcmFailure = { reason: "permission-denied" };
    return null;
  }
  let perm: NotificationPermission = Notification.permission;
  if (perm !== "granted") {
    perm = await Notification.requestPermission();
  }
  if (perm !== "granted") {
    console.warn("[FCM] Permission refusée :", perm);
    lastFcmFailure = { reason: perm === "denied" ? "permission-denied" : "permission-dismissed" };
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
      lastFcmFailure = { reason: "empty-token" };
    }

    return token || null;
  } catch (err) {
    console.error("[FCM] getFcmToken failed", err);
    const message = (err as Error)?.message ?? "";
    lastFcmFailure = {
      reason: /service ?worker|registration|scope/i.test(message) ? "sw-failed" : "error",
      detail: message,
    };
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

/** Vrai si la configuration Firebase Web minimale est présente. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && FCM_VAPID_KEY,
  );
}

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let notificationAudioContext: AudioContext | null = null;
let notificationAudioEl: HTMLAudioElement | null = null;
let audioElPrimed = false;

// Son d'alerte généré en WAV (2 séries de 3 bips). Un vrai fichier audio joué
// par un élément <audio> est plus fiable sur iPhone que l'audio "synthétisé" :
// une fois débloqué par un toucher, il peut être rejoué sans nouveau geste.
function buildAlertWavUrl(): string {
  const rate = 22_050;
  const notes = [880, 1_100, 1_320, 0, 880, 1_100, 1_320];
  const noteLen = Math.floor(rate * 0.18);
  const samples = new Int16Array(noteLen * notes.length);
  notes.forEach((freq, n) => {
    for (let i = 0; i < noteLen; i++) {
      const env = Math.min(1, i / 200, (noteLen - i) / 400);
      const v = freq ? Math.sign(Math.sin((2 * Math.PI * freq * i) / rate)) * 0.45 * Math.max(0, env) : 0;
      samples[n * noteLen + i] = Math.round(v * 32_767);
    }
  });
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const dv = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  dv.setUint32(4, 36 + samples.length * 2, true);
  w(8, "WAVEfmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, rate, true);
  dv.setUint32(28, rate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  w(36, "data");
  dv.setUint32(40, samples.length * 2, true);
  new Int16Array(buf, 44).set(samples);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

function getNotificationAudioEl(): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") return null;
  if (!notificationAudioEl) {
    notificationAudioEl = new Audio(buildAlertWavUrl());
    notificationAudioEl.preload = "auto";
    notificationAudioEl.setAttribute("playsinline", "");
  }
  return notificationAudioEl;
}

/** À appeler sur un geste utilisateur : débloque le son pour la suite. */
export function primeNotificationAudio(): void {
  try {
    // iOS 17+ : lire comme un média => le son passe même en mode silencieux.
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
  } catch {
    /* ignore */
  }
  const el = getNotificationAudioEl();
  if (el && !audioElPrimed) {
    el.muted = true;
    void el
      .play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
        el.muted = false;
        audioElPrimed = true;
      })
      .catch(() => {
        el.muted = false;
      });
  }
  const context = getNotificationAudioContext();
  if (context && context.state !== "running") void context.resume().catch(() => {});
}

function getNotificationAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  notificationAudioContext ??= new AudioContextConstructor();
  return notificationAudioContext;
}

async function playSynthBeeps(): Promise<void> {
  const context = getNotificationAudioContext();
  if (!context) return;
  // iOS met le contexte en "interrupted" après un passage en arrière-plan.
  if (context.state !== "running") await context.resume();

  const t0 = context.currentTime + 0.02;
  const notes = [880, 1_100, 1_320, 880, 1_100, 1_320];
  notes.forEach((freq, i) => {
    const start = t0 + i * 0.18 + (i >= 3 ? 0.35 : 0);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.17);
  });
}

export async function playForegroundNotificationSound(): Promise<void> {
  // Vibration aussi quand l'app est ouverte (Android ; ignoré sur iOS).
  try {
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  } catch {
    /* ignore */
  }
  const el = getNotificationAudioEl();
  if (el) {
    try {
      el.currentTime = 0;
      el.muted = false;
      el.volume = 1;
      await el.play();
      return;
    } catch {
      /* repli sur les bips synthétisés */
    }
  }
  await playSynthBeeps();
}
