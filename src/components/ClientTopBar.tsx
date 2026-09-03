import { Link } from "@tanstack/react-router";
import { Home, Bell } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { useClientUnreadMessages } from "@/hooks/useClientUnreadMessages";

const css = `
.ctb{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.ctb-left,.ctb-right{display:flex;align-items:center;gap:8px;min-width:0}
.ctb-btn{display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:8px 12px;border-radius:999px;border:1px solid rgba(214,168,61,.45);background:#07101a;font-size:11px;font-weight:700;color:#e7bd5d;text-decoration:none;line-height:1}
.ctb-btn:hover{background:#111b26}
.ctb-btn span{white-space:nowrap}
.ctb-bell{position:relative;width:38px;height:38px;padding:0;justify-content:center}
.ctb-dot{position:absolute;top:4px;right:4px;min-width:16px;height:16px;padding:0 4px;display:grid;place-items:center;border-radius:999px;background:#ef4444;color:#fff;font-size:9px;font-weight:800;border:2px solid #030a13}
@media(max-width:359px){.ctb-btn span{display:none}}
`;

/**
 * Barre supérieure commune à l'espace client : retour au site public,
 * accès aux notifications (avec badge de messages non lus) et sélecteur
 * de langue. Présente sur toutes les pages /client/* de la maquette.
 */
export function ClientTopBar() {
  const { lang } = useI18n();
  const unread = useClientUnreadMessages();
  const back = lang === "en" ? "Back to website" : "Retour au site";
  const notif = lang === "en" ? "Notifications" : "Notifications";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ctb">
        <div className="ctb-left">
          <Link to="/" className="ctb-btn">
            <Home size={14} />
            <span>{back}</span>
          </Link>
        </div>
        <div className="ctb-right">
          <Link to="/notifications" className="ctb-btn ctb-bell" aria-label={notif}>
            <Bell size={16} />
            {unread > 0 && <span className="ctb-dot">{unread > 9 ? "9+" : unread}</span>}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
