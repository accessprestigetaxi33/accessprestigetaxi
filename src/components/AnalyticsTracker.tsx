import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";
import { initGA, gaPageView } from "@/lib/ga4";

const BOOKING_PATHS = ["/reservation", "/reserver"];

/**
 * Global, delegated analytics listener.
 * - page views on every route change
 * - conversion CTAs: booking links/buttons, phone calls, WhatsApp
 * - form submissions (reservation / contact / other)
 */
export function AnalyticsTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    initGA();
    gaPageView(pathname);
    trackEvent("page_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a[href], button[data-analytics]"
      ) as HTMLElement | null;
      if (!el) return;

      const custom = el.getAttribute("data-analytics");
      if (custom) {
        trackEvent(custom);
        return;
      }

      const href = el.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        trackEvent("phone_click", { from: window.location.pathname });
        return;
      }
      if (href.includes("wa.me") || href.includes("whatsapp")) {
        trackEvent("whatsapp_click");
        return;
      }
      if (BOOKING_PATHS.some((p) => href === p || href.startsWith(`${p}?`) || href.startsWith(`${p}/`))) {
        trackEvent("cta_reservation_click", { from: window.location.pathname });
      }
    };

    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const name = form.getAttribute("data-analytics-form");
      const path = window.location.pathname;
      const event =
        name ??
        (path.startsWith("/reservation") || path.startsWith("/reserver")
          ? "reservation_submitted"
          : path.startsWith("/contact")
            ? "contact_submitted"
            : "form_submit");
      trackEvent(event, { path });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
