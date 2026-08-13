import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "@tanstack/react-router";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { useReservationDraft } from "@/lib/reservation-draft";
import { buildReservationMessage, whatsappLink } from "@/lib/whatsapp";
import { useI18n } from "@/i18n/I18nProvider";
import { trackCtaClick } from "@/lib/analytics";
import { DRIVERS } from "@/data/drivers";
import { BUSINESS_EMAIL } from "@/lib/business";

export function WhatsAppFloat() {
  const { t, lang } = useI18n();
  const location = useLocation();

  // Uniquement sur la page d'accueil
  const isHomePage = location.pathname === "/";

  const draft = useReservationDraft();
  const message = draft ? buildReservationMessage(draft, lang) : t("wa.default");
  const waHref = whatsappLink(message);

  const handleClick =
    (action: "whatsapp" | "call" | "email", variant: "mobile_sticky" | "desktop_float") => () => {
      trackCtaClick({
        event_type:
          action === "whatsapp" ? "whatsapp_click" : action === "call" ? "call_click" : "quote_click",
        variant,
        has_draft: Boolean(draft),
        lang,
      });
    };

  const barRef = useRef<HTMLDivElement | null>(null);
  const [barHeight, setBarHeight] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setBarHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--mobile-action-bar-h",
      `${isHomePage ? barHeight : 0}px`,
    );
  }, [barHeight, isHomePage]);

  // Ne rien rendre côté serveur ni avant hydratation
  if (!mounted || typeof document === "undefined" || !isHomePage) return null;

  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center font-bold leading-tight text-white no-underline transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 min-h-[54px] sm:min-h-[58px] sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5";

  const content = (
    <div
      ref={barRef}
      role="navigation"
      aria-label={t("wa.aria.nav")}
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-white/10 bg-[rgba(15,23,42,0.96)] px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:px-4 sm:pb-[calc(10px+env(safe-area-inset-bottom))] sm:pt-2.5"
    >
      <div className="mx-auto flex w-full max-w-3xl items-stretch gap-1.5 sm:gap-3 lg:max-w-4xl">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick("whatsapp", "mobile_sticky")}
          aria-label={t("wa.aria.whatsapp")}
          className={`${itemClass} bg-[#25D366]`}
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-[11px] sm:text-sm">{t("wa.btn.whatsapp")}</span>
        </a>

        {DRIVERS.map((d, i) => (
          <a
            key={d.tel}
            href={`tel:${d.tel}`}
            onClick={handleClick("call", "mobile_sticky")}
            aria-label={`${t("wa.aria.call")} ${d.name} — ${d.display}`}
            className={`${itemClass} ${i === 0 ? "bg-[#1d4ed8]" : "bg-[#0f766e]"}`}
          >
            <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="flex flex-col items-center sm:items-start">
              <span className="text-[11px] sm:text-sm">{d.name}</span>
              <span className="hidden text-[11px] font-semibold tabular-nums opacity-90 md:block">
                {d.display}
              </span>
            </span>
          </a>
        ))}

        <a
          href={`mailto:${BUSINESS_EMAIL}`}
          onClick={handleClick("email", "mobile_sticky")}
          aria-label={`${t("wa.aria.email")} — ${BUSINESS_EMAIL}`}
          className={`${itemClass} bg-[#b45309]`}
        >
          <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-[11px] sm:text-sm">{t("wa.btn.email")}</span>
        </a>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
