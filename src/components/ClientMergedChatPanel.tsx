import { useCallback, useEffect, useRef, useState } from "react";
import { Send, WifiOff, Loader2 } from "lucide-react";
import {
  listClientMergedMessages,
  sendClientMergedMessage,
  markClientMergedRead,
  type ClientMergedMessage,
} from "@/lib/chat.functions";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Fil de discussion client ↔ chauffeur — branché sur EXACTEMENT les mêmes
 * données que l'onglet « Messages » du dashboard chauffeur : messages directs
 * (direct_messages) + messages liés aux courses (reservation_messages), fusionnés
 * et triés. L'envoi cible la course active quand il y en a une, comme la réponse
 * chauffeur, pour que les deux côtés restent synchronisés en temps réel.
 */

const OFFLINE_QUEUE_KEY = "apt_client_msg_queue_v1";
type Pending = { id: string; content: string; created_at: string };

function readQueue(): Pending[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Pending[]) : [];
  } catch {
    return [];
  }
}
function writeQueue(q: Pending[]) {
  try {
    if (q.length === 0) localStorage.removeItem(OFFLINE_QUEUE_KEY);
    else localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* mode privé / quota : la file reste en mémoire */
  }
}

const COPY = {
  fr: {
    peer: "Access Prestige Taxi",
    subtitle: "Patricia & Alain — réponse rapide",
    loading: "Chargement de la conversation…",
    empty: "Aucun message pour le moment. Écrivez à votre chauffeur.",
    placeholder: "Votre message…",
    send: "Envoyer",
    offline: "Hors ligne — vos messages partiront au retour du réseau.",
    pending: "En attente d'envoi…",
    ride: "Course",
    direct: "Message direct",
  },
  en: {
    peer: "Access Prestige Taxi",
    subtitle: "Patricia & Alain — quick reply",
    loading: "Loading conversation…",
    empty: "No message yet. Write to your driver.",
    placeholder: "Your message…",
    send: "Send",
    offline: "Offline — your messages will be sent when back online.",
    pending: "Waiting to be sent…",
    ride: "Ride",
    direct: "Direct message",
  },
} as const;

const css = `
.cmp{display:flex;flex-direction:column;height:100%;min-height:0;background:#07101a;font-family:Inter,system-ui,sans-serif}
.cmp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(214,168,61,.4);color:#f4f4f1}
.cmp-head strong{display:block;font-size:13px;color:#f6f1e6}
.cmp-head small{display:block;font-size:10px;color:rgba(255,255,255,.5)}
.cmp-head b{color:#d6a83d;font-size:10px;letter-spacing:.06em;text-transform:uppercase}
.cmp-scroll{flex:1;min-height:0;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
.cmp-bubble{max-width:82%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.45;word-break:break-word}
.cmp-bubble.peer{align-self:flex-start;background:#16232e;color:#eef2f5}
.cmp-bubble.me{align-self:flex-end;background:#d6a83d;color:#07101a}
.cmp-bubble.pending{align-self:flex-end;background:rgba(214,168,61,.35);color:#f4f4f1}
.cmp-bubble span{display:block;margin-top:4px;font-size:10px;opacity:.72}
.cmp-empty{margin:auto;padding:22px 12px;text-align:center;font-size:12px;color:#93a0aa}
.cmp-offline{margin:10px 14px 0;padding:8px 10px;border-radius:10px;font-size:11px;background:rgba(255,90,90,.14);color:#ffb4b4;border:1px solid rgba(255,90,90,.4);display:flex;align-items:center;gap:6px}
.cmp-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(214,168,61,.4)}
.cmp-form input{flex:1;min-width:0;background:#040b13;border:1px solid rgba(214,168,61,.7);border-radius:10px;color:#fff;padding:11px 12px;font-size:13px}
.cmp-form input::placeholder{color:rgba(255,255,255,.4)}
.cmp-form button{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(#f6cd6b,#cf962a);color:#171006;border:0;border-radius:10px;padding:0 16px;min-height:42px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;cursor:pointer}
.cmp-form button:disabled{opacity:.55;cursor:not-allowed}
`;

export function ClientMergedChatPanel({ token }: { token: string }) {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const locale = lang === "en" ? "en-US" : "fr-FR";

  const [messages, setMessages] = useState<ClientMergedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<Pending[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fmtTime = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      const sameDay = d.toDateString() === new Date().toDateString();
      return sameDay
        ? d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
        : `${d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
    },
    [locale],
  );

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const rows = (await listClientMergedMessages({ data: { role: "client", token, limit: 200 } })) as ClientMergedMessage[];
      setMessages(rows);
      if (rows.some((m) => m.sender === "chauffeur" && !m.read_by_client)) {
        await markClientMergedRead({ data: { role: "client", token } });
      }
    } catch {
      /* hors ligne : on garde le dernier état connu */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 5000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    setQueue(readQueue());
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, queue.length]);

  const flushQueue = useCallback(async () => {
    const pending = readQueue();
    if (pending.length === 0 || !navigator.onLine || !token) return;
    const rest: Pending[] = [];
    let sent = 0;
    for (const p of pending) {
      try {
        await sendClientMergedMessage({ data: { role: "client", token, content: p.content } });
        sent++;
      } catch {
        rest.push(p);
      }
    }
    writeQueue(rest);
    setQueue(rest);
    if (sent > 0) void load();
  }, [token, load]);

  useEffect(() => {
    if (online) void flushQueue();
  }, [online, flushQueue]);

  const send = async () => {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    if (!navigator.onLine) {
      const q = [...readQueue(), { id: `q-${Date.now()}`, content, created_at: new Date().toISOString() }];
      writeQueue(q);
      setQueue(q);
      return;
    }
    setSending(true);
    try {
      const msg = (await sendClientMergedMessage({ data: { role: "client", token, content } })) as ClientMergedMessage;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      void load();
    } catch {
      const q = [...readQueue(), { id: `q-${Date.now()}`, content, created_at: new Date().toISOString() }];
      writeQueue(q);
      setQueue(q);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cmp">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cmp-head">
        <div>
          <strong>{c.peer}</strong>
          <small>{c.subtitle}</small>
        </div>
        <b>{messages.some((m) => m.source === "reservation") ? c.ride : c.direct}</b>
      </div>
      {!online && (
        <div className="cmp-offline">
          <WifiOff size={13} /> {c.offline}
        </div>
      )}
      <div className="cmp-scroll">
        {loading && <div className="cmp-empty">{c.loading}</div>}
        {!loading && messages.length === 0 && queue.length === 0 && <div className="cmp-empty">{c.empty}</div>}
        {messages.map((m) => (
          <div key={m.id} className={`cmp-bubble ${m.sender === "client" ? "me" : "peer"}`}>
            {m.content}
            <span>
              {fmtTime(m.created_at)}
              {m.reservation_label ? ` · ${c.ride} ${m.reservation_label}` : ""}
            </span>
          </div>
        ))}
        {queue.map((q) => (
          <div key={q.id} className="cmp-bubble pending">
            {q.content}
            <span>{c.pending}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        className="cmp-form"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={c.placeholder}
          aria-label={c.placeholder}
          disabled={sending}
        />
        <button type="submit" disabled={sending || draft.trim().length === 0}>
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {c.send}
        </button>
      </form>
    </div>
  );
}
