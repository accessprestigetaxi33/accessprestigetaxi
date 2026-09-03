import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, ChevronRight, WifiOff, Clock } from "lucide-react";
import { listClientMergedMessages, type ClientMergedMessage } from "@/lib/chat.functions";
import { useI18n } from "@/i18n/I18nProvider";

const css = `
.cmc{border:1px solid rgba(214,168,61,.45);border-radius:14px;background:linear-gradient(145deg,#111b26,#07101a);padding:13px}
.cmc-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px}
.cmc-title{display:flex;align-items:center;gap:8px;min-width:0}
.cmc-title h3{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f0e6d0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmc-badge{flex-shrink:0;min-width:18px;height:18px;padding:0 5px;display:grid;place-items:center;border-radius:999px;background:#ef4444;color:#fff;font-size:10px;font-weight:800}
.cmc-open{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#e6b95a;text-decoration:none;white-space:nowrap}
.cmc-list{margin-top:10px;display:flex;flex-direction:column;gap:8px}
.cmc-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;border:1px solid rgba(214,168,61,.28);border-radius:10px;padding:9px 10px;background:#07101a}
.cmc-who{font-size:10px;color:#e7bd5d;text-transform:uppercase;letter-spacing:.06em}
.cmc-text{font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmc-when{font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap}
.cmc-empty{margin-top:10px;padding:14px;border:1px dashed rgba(214,168,61,.45);border-radius:10px;text-align:center;font-size:11px;color:rgba(255,255,255,.55)}
.cmc-cta{margin-top:10px;display:flex;min-height:40px;align-items:center;justify-content:center;gap:6px;border-radius:9px;border:1px solid rgba(214,168,61,.7);background:linear-gradient(#f6cd6b,#cf962a);color:#171006;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;text-decoration:none}
.cmc-note{margin-top:8px;display:flex;align-items:center;gap:6px;font-size:10px;color:#facc15}
@media(min-width:700px){.cmc-text{white-space:normal}}
`;

type Props = { clientToken: string };

const COPY = {
  fr: {
    title: "Messagerie",
    open: "Ouvrir",
    driver: "Chauffeur",
    you: "Vous",
    empty: "Aucun message pour le moment. Écrivez à votre chauffeur.",
    cta: "Écrire au chauffeur",
    offline: "Hors ligne — vos messages partiront au retour du réseau.",
    pending: (n: number) => `${n} message(s) en attente d'envoi`,
  },
  en: {
    title: "Messages",
    open: "Open",
    driver: "Driver",
    you: "You",
    empty: "No message yet. Write to your driver.",
    cta: "Message the driver",
    offline: "Offline — your messages will be sent when back online.",
    pending: (n: number) => `${n} message(s) waiting to be sent`,
  },
} as const;

/**
 * Aperçu "Messagerie" du dashboard client : derniers échanges avec le
 * chauffeur, badge de non-lus, état hors-ligne et file d'attente locale
 * (partagée avec DirectChatPanel), puis accès au fil complet.
 */
export function ClientMessagesCard({ clientToken }: Props) {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const [rows, setRows] = useState<ClientMergedMessage[]>([]);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      if (!clientToken || (typeof document !== "undefined" && document.hidden)) return;
      try {
        const list = (await listClientMergedMessages({
          data: { role: "client", token: clientToken, limit: 20 },
        })) as ClientMergedMessage[];
        if (!stop) setRows(list.slice(-3));
      } catch {
        /* garde le dernier état connu */
      }
    };
    void load();
    const id = setInterval(load, 20000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [clientToken]);

  // État réseau + file d'attente hors-ligne écrite par DirectChatPanel.
  useEffect(() => {
    const sync = () => {
      setOnline(navigator.onLine !== false);
      try {
        const keys = Object.keys(localStorage).filter(
          (k) => k.startsWith("chat:offline:client:") || k === "apt_client_msg_queue_v1",
        );
        let total = 0;
        for (const k of keys) {
          const raw = localStorage.getItem(k);
          if (raw) total += (JSON.parse(raw) as unknown[]).length;
        }
        setPending(total);
      } catch {
        setPending(0);
      }
    };
    sync();
    const id = setInterval(sync, 5000);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const unread = rows.filter((m) => m.sender === "chauffeur" && !m.read_by_client).length;
  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="cmc" aria-label={c.title}>
        <div className="cmc-head">
          <div className="cmc-title">
            <MessageCircle size={16} color="#e7bd5d" />
            <h3>{c.title}</h3>
            {unread > 0 && <span className="cmc-badge">{unread > 9 ? "9+" : unread}</span>}
          </div>
          <Link to="/client/chat" className="cmc-open">
            {c.open} <ChevronRight size={13} />
          </Link>
        </div>

        {rows.length ? (
          <div className="cmc-list">
            {rows.map((m) => (
              <div className="cmc-row" key={m.id}>
                <div style={{ minWidth: 0 }}>
                  <div className="cmc-who">{m.sender === "client" ? c.you : c.driver}</div>
                  <div className="cmc-text">{m.content}</div>
                </div>
                <div className="cmc-when">{fmt(m.created_at)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cmc-empty">{c.empty}</div>
        )}

        {!online && (
          <div className="cmc-note">
            <WifiOff size={12} /> {c.offline}
          </div>
        )}
        {pending > 0 && (
          <div className="cmc-note">
            <Clock size={12} /> {c.pending(pending)}
          </div>
        )}

        <Link to="/client/chat" className="cmc-cta">
          <MessageCircle size={14} /> {c.cta}
        </Link>
      </section>
    </>
  );
}
