import { createFileRoute } from "@tanstack/react-router";

/**
 * Configuration Web Firebase du projet "access-prestige-taxi".
 * Ces valeurs sont publiques par design (SDK web) ; seule l'apiKey est servie
 * depuis le secret GOOGLE_API_KEY pour éviter de la figer dans le dépôt.
 * Consommée par le client (src/lib/firebase.ts) et par le service worker
 * /firebase-messaging-sw.js.
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
        const apiKey = (process.env["GOOGLE_API_KEY"] ?? "").trim();
        return new Response(JSON.stringify({ ...FIREBASE_PUBLIC_CONFIG, apiKey }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
