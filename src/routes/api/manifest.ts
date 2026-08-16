import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/manifest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const isDriver = url.searchParams.get("role") === "driver";

        const manifest = {
          id: isDriver ? "/driver" : "/",
          name: isDriver ? "Access Prestige Taxi — Chauffeur" : "Access Prestige Taxi",
          short_name: isDriver ? "APT Chauffeur" : "Access Taxi",
          description: isDriver
            ? "Espace chauffeur Access Prestige Taxi (Alain & Patricia)"
            : "Réservez votre taxi 100 % électrique en Charente-Maritime : réservation vocale ou écrite, suivi en direct, factures et reçus.",
          lang: "fr",
          dir: "ltr",
          categories: ["travel", "business"],
          start_url: isDriver ? "/driver" : "/?source=pwa",
          scope: "/",
          display: "standalone",
          // Espace chauffeur : thème beige (splash iOS cohérent avec l'UI).
          background_color: isDriver ? "#FDFBF7" : "#0B0B0D",
          theme_color: isDriver ? "#0f172a" : "#0B0B0D",
          orientation: "portrait",
          icons: [
            { src: "/favicon.png", sizes: "48x48", type: "image/png" },
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
          shortcuts: isDriver
            ? []
            : [
                { name: "Réserver", short_name: "Réserver", url: "/reserver" },
                { name: "Espace client", short_name: "Client", url: "/client/dashboard" },
                { name: "Contact", short_name: "Contact", url: "/contact" },
              ],
        };

        return new Response(JSON.stringify(manifest), {
          headers: {
            "Content-Type": "application/manifest+json",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
