import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { useReservationDraft } from "@/lib/reservation-draft";
import { buildReservationMessage, whatsappLink } from "@/lib/whatsapp";
import { useI18n } from "@/i18n/I18nProvider";
import { trackCtaClick } from "@/lib/analytics";
import { DRIVERS } from "@/data/drivers";
import { BUSINESS_EMAIL } from "@/lib/business";

/**
 * Barre de contact flottante (accueil uniquement).
 * - Rendue dès le SSR (position fixe) : aucun décalage à l'hydratation.
 * - Hauteur exposée via --mobile-action-bar-h pour que le contenu ne soit pas masqué.
 * - Couleurs contrastées AA sur texte blanc, cibles tactiles ≥ 44px, focus clavier visible.
 */
export function WhatsAppFloat() {
  const { t, lang } = useI18n();
  const location = useLocation();
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

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const update = () => setBarHeight(el.getBoundingClientRect().height);
    update();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [isHomePage]);

  useEffect(() => {
    const value = isHomePage ? `${barHeight || 76}px` : "0px";
    document.documentElement.style.setProperty("--mobile-action-bar-h", value);
    return () => {
      document.documentElement.style.setProperty("--mobile-action-bar-h", "0px");
    };
  }, [barHeight, isHomePage]);

  if (!isHomePage) return null;

  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center font-bold leading-tight text-white no-underline transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] min-h-11 sm:min-h-[58px] sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5";

  return (
    <nav
      ref={barRef}
      aria-label={t("wa.aria.nav")}
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-white/10 bg-[rgba(15,23,42,0.96)] px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md contain-layout sm:px-4 sm:pb-[calc(10px+env(safe-area-inset-bottom))] sm:pt-2.5"
    >
      <ul className="mx-auto flex w-full max-w-3xl list-none items-stretch gap-1.5 p-0 sm:gap-3 lg:max-w-4xl">
        <li className="flex flex-1">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick("whatsapp", "mobile_sticky")}
            aria-label={t("wa.aria.whatsapp")}
            className={`${itemClass} bg-[#0f7a3d]`}
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-sm">{t("wa.btn.whatsapp")}</span>
          </a>
        </li>

        {DRIVERS.map((d, i) => (
          <li key={d.tel} className="flex flex-1">
            <a
              href={`tel:${d.tel}`}
              onClick={handleClick("call", "mobile_sticky")}
              aria-label={`${t("wa.aria.call")} ${d.name} — ${d.display}`}
              className={`${itemClass} ${i === 0 ? "bg-[#1d4ed8]" : "bg-[#0f766e]"}`}
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex flex-col items-center sm:items-start">
                <span className="text-[11px] sm:text-sm">{d.name}</span>
                <span className="hidden text-[11px] font-semibold tabular-nums opacity-95 md:block">
                  {d.display}
                </span>
              </span>
            </a>
          </li>
        ))}

        <li className="flex flex-1">
          <a
            href={`mailto:${BUSINESS_EMAIL}`}
            onClick={handleClick("email", "mobile_sticky")}
            aria-label={`${t("wa.aria.email")} — ${BUSINESS_EMAIL}`}
            className={`${itemClass} bg-[#9a4a06]`}
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-sm">{t("wa.btn.email")}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
