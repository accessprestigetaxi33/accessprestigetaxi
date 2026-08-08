import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceStrip } from "@/components/ServiceStrip";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Access Prestige Taxi | Taxi & transport conventionné (17)" },
      {
        name: "description",
        content:
          "Taxi de prestige en Charente-Maritime, BMW iX1 100 % électrique et van Mercedes 7 places. Réservation rapide.",
      },
      { name: "author", content: "Access Prestige Taxi" },
      { property: "og:site_name", content: "Access Prestige Taxi" },
      { property: "og:title", content: "Access Prestige Taxi — Taxi électrique en Charente-Maritime" },
      {
        property: "og:description",
        content: "L'excellence à chaque trajet — taxi 100 % électrique en Charente-Maritime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://accessprestigetaxi.fr/#organization",
              name: "Access Prestige Taxi",
              url: "https://accessprestigetaxi.fr",
              slogan: "L'excellence à chaque trajet",
              logo: "https://accessprestigetaxi.fr/favicon.png",
            },
            {
              "@type": "WebSite",
              "@id": "https://accessprestigetaxi.fr/#website",
              name: "Access Prestige Taxi",
              url: "https://accessprestigetaxi.fr",
              publisher: { "@id": "https://accessprestigetaxi.fr/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // L'espace chauffeur est une application plein écran (PWA) : pas de header
  // ni de footer du site public, comme sur la version d'origine.
  // Pages immersives (chauffeur, admin, réservation par chat) : pas de header/footer public.
  const standalone = pathname.startsWith("/driver") || pathname.startsWith("/reserver");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {standalone ? (
          <Outlet />
        ) : (
          <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <ServiceStrip />
            <div className="flex-1">
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </div>
            <SiteFooter />
          </div>
        )}
        <Toaster />
        <AnalyticsTracker />
      </I18nProvider>
    </QueryClientProvider>
  );
}
