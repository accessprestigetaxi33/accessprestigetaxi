/* Firebase Cloud Messaging — service worker (notifications en arrière-plan)
 * Projet : access-prestige-taxi
 * La configuration (dont l'apiKey) est chargée depuis /api/public/firebase-config.
 */
/* eslint-disable no-undef */
const SW_VERSION = "apt-fcm-2026-08";

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const ready = fetch("/api/public/firebase-config")
  .then((r) => r.json())
  .then((config) => {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || "Access Prestige Taxi";
      const options = {
        body: (payload.notification && payload.notification.body) || "",
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: (payload.data && payload.data.tag) || "taxi-fcm",
        data: payload.data || {},
        vibrate: [200, 100, 200],
        requireInteraction: true,
      };
      return self.registration.showNotification(title, options);
    });
  })
  .catch((err) => console.error("[FCM SW] init failed", err));

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(ready);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "FCM_SW_SKIP_WAITING") self.skipWaiting();
  if (type === "FCM_SW_VERSION" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && (event.notification.data.link || event.notification.data.url)) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      return self.clients.openWindow(link);
    }),
  );
});
