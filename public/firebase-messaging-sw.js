/* Firebase Cloud Messaging — Service Worker (notifications en arrière-plan)
 * Projet : access-prestige-taxi (bi-chauffeur)
 * Config chargée depuis /api/public/firebase-config (apiKey hors dépôt).
 */
/* eslint-disable */

const SW_VERSION = "apt-2026-09.push-click-open";
console.log("[FCM SW] boot version =", SW_VERSION);

const DRIVER_URL = "/driver";
const FORBIDDEN_PATH_PREFIXES = ["/admin"];

// Ce listener doit être enregistré AVANT importScripts(Firebase) :
// le SDK ajoute son propre notificationclick et peut court-circuiter le nôtre.
self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation?.();
  event.notification.close();

  const notifData = event.notification.data || {};
  const firebasePayload = firebasePayloadFromNotificationData(notifData);
  const mergedData = mergedDataFromPayload(firebasePayload, notifData);
  const url = sanitizeDeepLink(
    clickUrlFromPayload(firebasePayload, notifData, mergedData),
    mergedData.audience,
    mergedData.reservation_id,
  );

  event.waitUntil(
    (async () => {
      const target = new URL(url, self.location.origin);
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            if ("navigate" in client) {
              const navigated = await client.navigate(target.href).catch(() => null);
              if (navigated && "focus" in navigated) return navigated.focus();
            }
            if ("focus" in client) return client.focus();
          }
        } catch (_) {}
      }
      if (self.clients.openWindow) return self.clients.openWindow(target.href);
    })(),
  );
});

importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const recentlyHandled = new Map();

function claimOnce(key) {
  const now = Date.now();
  for (const [k, ts] of recentlyHandled) if (now - ts > 15000) recentlyHandled.delete(k);
  if (recentlyHandled.has(key)) return false;
  recentlyHandled.set(key, now);
  return true;
}

function dedupeKey(data, notif) {
  return [data.tag || notif.tag || "taxi-fcm", data.reservation_id || "", notif.title || data.title || ""].join("|");
}

function firebasePayloadFromNotificationData(notifData) {
  return notifData?.FCM_MSG || notifData?.fcmMessage || notifData?.firebaseMessagingPayload || null;
}

function mergedDataFromPayload(payload, notifData) {
  return Object.assign({}, payload?.webpush?.data || {}, payload?.data || {}, notifData || {});
}

function clickUrlFromPayload(payload, notifData, data) {
  return (
    notifData?.url ||
    notifData?.click_action ||
    data?.url ||
    data?.click_action ||
    payload?.webpush?.fcm_options?.link ||
    payload?.fcmOptions?.link ||
    payload?.notification?.click_action ||
    payload?.webpush?.notification?.click_action
  );
}

function sanitizeDeepLink(rawUrl, audience, reservationId) {
  let fallback = "/";
  if (audience === "chauffeur") fallback = DRIVER_URL;
  else if (reservationId) fallback = "/suivi/" + reservationId;

  let url;
  try {
    url = new URL(rawUrl || fallback, self.location.origin);
  } catch (_) {
    url = new URL(fallback, self.location.origin);
  }
  if (url.origin !== self.location.origin) url = new URL(fallback, self.location.origin);
  if (FORBIDDEN_PATH_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"))) {
    url = new URL(fallback, self.location.origin);
  }
  if (audience === "chauffeur" && url.pathname !== "/driver") url.pathname = "/driver";
  return url.pathname + url.search + url.hash;
}

function closeExistingNotifications(tag) {
  return self.registration.getNotifications({ tag }).then((existing) => existing.forEach((n) => n.close()));
}

function showFrom(data, notif) {
  const title = notif.title || data.title || "Access Prestige Taxi";
  const body = notif.body || data.body || "";
  const url = sanitizeDeepLink(data.url || data.click_action, data.audience, data.reservation_id);
  const tag = data.tag || "taxi-fcm";
  return closeExistingNotifications(tag).then(() =>
    self.registration.showNotification(title, {
      body,
      icon: notif.icon || "/favicon.png",
      badge: "/favicon.png",
      tag,
      data: { ...data, url, audience: data.audience, reservation_id: data.reservation_id, sw_version: SW_VERSION },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    }),
  );
}

const ready = fetch("/api/public/firebase-config")
  .then((r) => r.json())
  .then((config) => {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const data = Object.assign({}, payload.webpush?.data || {}, payload.data || {});
      const notif = payload.webpush?.notification || payload.notification || {};
      // Payload `notification` présent → l'affichage est géré par le SDK (iOS).
      if (payload.notification || payload.webpush?.notification) {
        claimOnce(dedupeKey(data, notif));
        return;
      }
      if (!claimOnce(dedupeKey(data, notif))) return;
      return showFrom(data, notif);
    });
  })
  .catch((err) => console.error("[FCM SW] init failed", err));

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(ready);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const old = await self.registration.getNotifications();
        old.forEach((n) => n.close());
      } catch (_) {}
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "FCM_SW_SKIP_WAITING") self.skipWaiting();
  if (type === "FCM_SW_VERSION" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

// Filet de sécurité (data-only) pour Android quand le SDK n'a pas encore booté.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    try {
      payload = { notification: { title: event.data?.text() } };
    } catch (_2) {}
  }
  if (payload.notification || payload.webpush?.notification) return;
  const data = payload.data || {};
  if (!data.title && !data.body) return;
  if (!claimOnce(dedupeKey(data, {}))) return;
  event.waitUntil(showFrom(data, {}));
});
