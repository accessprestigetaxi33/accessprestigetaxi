import { createFileRoute, redirect } from "@tanstack/react-router";

// Ancienne page Taxi Oléron : page retirée (SEO recentré sur Marennes-Hiers-Brouage et Ciré-d'Aunis).
// L'ancienne adresse redirige définitivement vers la page Taxi Marennes.
export const Route = createFileRoute("/taxi-oleron")({
  beforeLoad: () => {
    throw redirect({ to: "/taxi-marennes", statusCode: 301 });
  },
});
