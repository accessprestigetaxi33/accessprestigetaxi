import { createFileRoute } from "@tanstack/react-router";

/**
 * Configuration Web Firebase du projet "access-prestige-taxi".
 * Ces valeurs sont publiques par design (SDK web).
 *
 * ⚠️ L'apiKey DOIT être la clé Web du projet Firebase access-prestige-taxi
 * (Console Firebase → Paramètres du projet → Vos applications → Web → apiKey).
 * On n'utilise SURTOUT PAS GOOGLE_API_KEY : c'est la clé Google Maps, issue
 * d'un autre projet GCP et restreinte aux API Maps → firebaseinstallations
 * répond 403 (API_KEY_SERVICE_BLOCKED) et aucun token FCM ne peut être obtenu.
 */
export const FIREBASE_PUBLIC_CONFIG = {
  authDomain: "access-prestige-taxi.firebaseapp.com",
  projectId: "access-prestige-taxi",
  storageBucket: "access-prestige-taxi.firebasestorage.app",
  messagingSenderId: "214617543164",
  appId: "1:214617543164:web:8094538b9f17694aa5e279",
  measurementId: "G-LFXHZHLHKE",
};

export const Route = createFileRoute("/api/public/firebase-config")({
  server: {
    handlers: {
      GET: () => {
        const apiKey = (process.env["FIREBASE_WEB_API_KEY"] ?? process.env["FIREBASE_API_KEY"] ?? "").trim();
        return new Response(
          JSON.stringify({
            ...FIREBASE_PUBLIC_CONFIG,
            apiKey,
            ...(apiKey ? {} : { error: "missing-firebase-web-api-key" }),
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": apiKey ? "public, max-age=3600" : "no-store",
            },
          },
        );
      },
    },
  },
});
