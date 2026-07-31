/**
 * Google Analytics 4 (gtag.js) — chargement paresseux côté navigateur.
 *
 * L'ID de mesure provient du connecteur Google Analytics
 * (VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY). Si aucun ID n'est
 * configuré, toutes les fonctions sont des no-op : le site fonctionne
 * normalement et les événements restent enregistrés dans la base interne.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID: string | undefined =
  (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined) ||
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  undefined;

let initialized = false;

export function isGaEnabled(): boolean {
  return typeof window !== "undefined" && !!GA_MEASUREMENT_ID;
}

/** Charge gtag.js une seule fois. Sans effet en SSR ou sans ID configuré. */
export function initGA(): void {
  if (initialized || !isGaEnabled()) return;
  initialized = true;

  const id = GA_MEASUREMENT_ID as string;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // On envoie les page_view manuellement (SPA).
  window.gtag("config", id, { send_page_view: false });
}

/** Envoie un événement GA4. No-op si GA n'est pas configuré. */
export function gaEvent(name: string, params?: Record<string, unknown>): void {
  if (!isGaEnabled()) return;
  initGA();
  try {
    window.gtag?.("event", name, params ?? {});
  } catch {
    /* noop */
  }
}

/** Envoie une vue de page SPA. */
export function gaPageView(path: string, title?: string): void {
  if (!isGaEnabled()) return;
  initGA();
  try {
    window.gtag?.("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: title ?? document.title,
    });
  } catch {
    /* noop */
  }
}
