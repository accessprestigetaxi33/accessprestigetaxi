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
import { useT, useI18n } from "@/i18n/I18nProvider";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/i18n/I18nProvider";
import { CanonicalSync } from "@/components/CanonicalSync";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceStrip } from "@/components/ServiceStrip";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { PwaController } from "@/components/PwaController";
import { FirebaseInitializer } from "@/components/FirebaseInitializer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

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
        </main>
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
  head: ({ matches }) => {
    // L'espace chauffeur déclare son propre manifest (/api/manifest?role=driver).
    // iOS ne lit qu'UN seul <link rel="manifest"> : on n'émet donc pas celui du
    // site public sur les routes /driver, sinon il gagne (il est rendu en premier).
    const isDriver = (matches?.[matches.length - 1]?.pathname ?? "").startsWith("/driver");
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Access Prestige Taxi | Taxi & transport conventionné (17)" },
      {
        name: "description",
        content:
          "Taxi en Charente-Maritime : BMW iX1 et Audi Q6 e-tron électriques 5 places, van Mercedes 8 places, transport sanitaire et toutes distances.",
      },
      { name: "author", content: "Access Prestige Taxi" },
      { name: "google-site-verification", content: "Frgz5GIuRTvkgvIxzuUiKebiXzrFSsALSRZTnGckmDA" },
      { property: "og:site_name", content: "Access Prestige Taxi" },
      { property: "og:title", content: "Access Prestige Taxi — Taxi électrique en Charente-Maritime" },
      {
        property: "og:description",
        content: "L'excellence à chaque trajet — taxi 100 % électrique en Charente-Maritime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0B0B0D" },
      { name: "application-name", content: "Access Prestige Taxi" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Access Taxi" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      ...(isDriver ? [] : [{ rel: "manifest", href: "/api/manifest", id: "app-manifest" }]),
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.accessprestigetaxi.fr/#organization",
              name: "Access Prestige Taxi",
              url: "https://www.accessprestigetaxi.fr",
              slogan: "L'excellence à chaque trajet",
              logo: "https://www.accessprestigetaxi.fr/favicon.png",
            },
            {
              "@type": "WebSite",
              "@id": "https://www.accessprestigetaxi.fr/#website",
              name: "Access Prestige Taxi",
              url: "https://www.accessprestigetaxi.fr",
              publisher: { "@id": "https://www.accessprestigetaxi.fr/#organization" },
            },
          ],
        }),
      },
    ],
    };
  },
  shellComponent: (props) => {
    const { lang } = useI18n();
    return <RootShell {...props} lang={lang} />;
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children, lang }: { children: ReactNode; lang: string }) {
  return (
    <html lang={lang}>
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
        {/* canonical + hreflang recalculés à chaque navigation / changement de langue */}
        <CanonicalSync />
        {standalone ? (
          <Outlet />
        ) : (
          <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <ServiceStrip />
            <main id="main-content" className="flex-1 pb-[var(--mobile-action-bar-h,0px)]" aria-label={t("aria.main")}>
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </div>
            <SiteFooter />
            <WhatsAppFloat />
          </div>
        )}
        <Toaster />
        <FirebaseInitializer />
        <PwaController />
        <AnalyticsTracker />
      </I18nProvider>
    </QueryClientProvider>
  );
}
