import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/page-indisponible")({
  head: () => ({
    meta: [
      { title: "Page indisponible — Access Taxi PBR" },
      { name: "description", content: "Cette page n'est plus disponible. Access Taxi PBR, votre taxi à Marennes-Hiers-Brouage." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Page indisponible — Access Taxi PBR" },
      { property: "og:description", content: "Cette page n'est plus disponible." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageIndisponible,
});

function PageIndisponible() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-3xl border border-primary/40 bg-card p-8 text-center">
        <span className="inline-block rounded-full border border-primary/40 px-3 py-1 text-xs font-bold tracking-wider text-primary">
          PAGE INDISPONIBLE
        </span>
        <h1 className="mt-4 font-display text-3xl text-foreground">Cette page n'existe plus</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Access Taxi PBR, votre taxi et chauffeur privé à Marennes-Hiers-Brouage.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            Retour à l'accueil
          </Link>
          <Link to="/reserver" className="rounded-full border border-primary/50 px-5 py-2.5 text-sm font-bold text-primary">
            Réserver un taxi
          </Link>
        </div>
      </div>
    </main>
  );
}
