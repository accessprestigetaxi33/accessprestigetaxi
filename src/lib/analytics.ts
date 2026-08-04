import { supabase } from"@/integrations/supabase/client";
import { gaEvent } from"@/lib/ga4";

const SESSION_KEY ="apt.analytics.sid";

/** Persistent-per-tab visitor session id (used to group events into funnels). */
export function getSessionId(): string {
 if (typeof window ==="undefined") return"ssr";
 try {
 const existing = sessionStorage.getItem(SESSION_KEY);
 if (existing) return existing;
 const sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
 sessionStorage.setItem(SESSION_KEY, sid);
 return sid;
 } catch {
 return `s_${Date.now().toString(36)}`;
 }
}

export type AnalyticsEvent =
 |"page_view"
 |"cta_reservation_click"
 |"phone_click"
 |"whatsapp_click"
 |"form_submit"
 |"reservation_submitted"
 |"contact_submitted"
 | (string & {});

/**
 * Fire-and-forget event tracker.
 * Never blocks navigation, never throws, no-op during SSR.
 */
export function trackEvent(event: AnalyticsEvent, meta?: Record<string, unknown>): void {
 if (typeof window ==="undefined") return;

 // Miroir Google Analytics 4 (no-op si GA n'est pas configuré)
 gaEvent(event.slice(0, 40).replace(/[^a-zA-Z0-9_]/g"_"), meta as Record<string, unknown>);

 const page =
 window.location.pathname +
 window.location.search +
 (meta && Object.keys(meta).length? ` ${JSON.stringify(meta)}`:"");

 void supabase.from("site_analytics").insert({
 event: event.slice(0, 100),
 session_id: getSessionId().slice(0, 100),
 page: page.slice(0, 500),
 referrer: (document.referrer || null)?.slice(0, 1000)?? null,
 }).then(({ error }) => {
 if (error && import.meta.env.DEV) {
 // eslint-disable-next-line no-console
 console.warn("[analytics] insert failed:"error.message);
 }
 });
}

export type CtaEvent = {
 event_type: string;
 variant?: string;
 has_draft?: boolean;
 lang?: string;
};

/** Backwards-compatible CTA tracker used by existing components. */
export function trackCtaClick(event: CtaEvent): void {
 trackEvent(event.event_type, {
 variant: event.variant,
 has_draft: event.has_draft,
 lang: event.lang,
 });
}
