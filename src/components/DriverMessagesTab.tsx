import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getDriverToken } from "@/lib/driver-token";
import {
  listMergedChauffeurThreads,
  loadMergedConversation,
  markMergedConversationRead,
  sendChauffeurMessage,
  sendDirectChauffeurMessage,
} from "@/lib/chat.functions";

type Thread = {
  thread_key: string;
  client_account_id: string | null;
  client_phone: string | null;
  client_name: string | null;
  reservation_ids: string[];
  active_reservation_id: string | null;
  active_reservation_label: string | null;
  last_message_at: string;
  last_message_content: string;
  last_message_source: "direct" | "reservation";
  unread_chauffeur: number;
};

type Msg = {
  id: string;
  source: "direct" | "reservation";
  reservation_id: string | null;
  reservation_label: string | null;
  sender: string;
  content: string;
  read_by_chauffeur: boolean;
  created_at: string;
};

type Pending = {
  id: string;
  thread_key: string;
  client_account_id: string | null;
  reservation_id: string | null;
  content: string;
  created_at: string;
};

const QUEUE_KEY = "apt_driver_msg_queue_v1";

function readQueue(): Pending[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Pending[]) : [];
  } catch {
    return [];
  }
}
function writeQueue(q: Pending[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* quota / mode privé : la file reste en mémoire */
  }
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) +
        " " +
        d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export type MessageContact = {
  reservation_id: string;
  label: string;
};

export default function DriverMessagesTab({
  onBadgeChange,
  contacts = [],
}: {
  onBadgeChange?: (n: number) => void;
  contacts?: MessageContact[];
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<Pending[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Conversation ouverte manuellement depuis une course (aucun message
  // échangé pour l'instant) : permet d'écrire au client même quand la liste
  // des conversations est vide.
  const [newResaId, setNewResaId] = useState<string>("");

  const active = useMemo(() => {
    const found = threads.find((t) => t.thread_key === activeKey) ?? null;
    if (found) return found;
    if (!newResaId) return null;
    const c = contacts.find((x) => x.reservation_id === newResaId);
    if (!c) return null;
    return {
      thread_key: `resa:${c.reservation_id}`,
      client_account_id: null,
      client_phone: null,
      client_name: c.label,
      reservation_ids: [c.reservation_id],
      active_reservation_id: c.reservation_id,
      active_reservation_label: "Nouvelle conversation",
      last_message_at: new Date().toISOString(),
      last_message_content: "",
      last_message_source: "reservation" as const,
      unread_chauffeur: 0,
    } satisfies Thread;
  }, [threads, activeKey, newResaId, contacts]);

  // Sélectionne automatiquement la première conversation dès qu'elle arrive,
  // pour éviter un champ de saisie inerte tant que le chauffeur n'a pas
  // cliqué manuellement sur un thread. On ne retouche activeKey que si rien
  // n'est encore sélectionné ou si la sélection en cours a disparu (thread
  // supprimé/fusionné) — jamais si le chauffeur a déjà choisi une autre
  // conversation encore présente dans la liste.
  useEffect(() => {
    if (threads.length === 0) return;
    const stillExists = activeKey != null && threads.some((t) => t.thread_key === activeKey);
    if (stillExists) return;
    setActiveKey(threads[0].thread_key);
  }, [threads, activeKey]);

  // ── État réseau (suivi hors-ligne) ───────────────────────────────────────
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

  const loadThreads = useCallback(async () => {
    const token = getDriverToken();
    if (!token) return;
    try {
      const rows = (await listMergedChauffeurThreads({ data: { driver_token: token } })) as Thread[];
      setThreads(rows);
      onBadgeChange?.(rows.reduce((n, t) => n + (t.unread_chauffeur || 0), 0));
    } catch (e: any) {
      if (navigator.onLine) toast.error("Messages indisponibles : " + (e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [onBadgeChange]);

  const loadConversation = useCallback(async (t: Thread) => {
    const token = getDriverToken();
    if (!token) return;
    try {
      const rows = (await loadMergedConversation({
        data: {
          driver_token: token,
          client_account_id: t.client_account_id,
          reservation_ids: t.reservation_ids.slice(0, 50),
          limit: 200,
        },
      })) as Msg[];
      setMessages(rows);
      await markMergedConversationRead({
        data: {
          driver_token: token,
          client_account_id: t.client_account_id,
          reservation_ids: t.reservation_ids.slice(0, 50),
        },
      });
    } catch (e: any) {
      if (navigator.onLine) toast.error("Conversation indisponible : " + (e?.message ?? e));
    }
  }, []);

  useEffect(() => {
    loadThreads();
    const timer = setInterval(loadThreads, 15000);
    return () => clearInterval(timer);
  }, [loadThreads]);

  useEffect(() => {
    if (!active) return;
    loadConversation(active);
    const timer = setInterval(() => loadConversation(active), 10000);
    return () => clearInterval(timer);
  }, [active, loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, queue.length]);

  // ── Envoi (avec repli hors-ligne) ────────────────────────────────────────
  const deliver = useCallback(async (p: Pending) => {
    const token = getDriverToken();
    if (!token) throw new Error("Session chauffeur expirée");
    if (p.reservation_id) {
      await sendChauffeurMessage({
        data: { driver_token: token, reservation_id: p.reservation_id, content: p.content },
      });
    } else if (p.client_account_id) {
      await sendDirectChauffeurMessage({
        data: { role: "chauffeur", token, client_account_id: p.client_account_id, content: p.content },
      });
    } else {
      throw new Error("Ce client n'a pas de canal de messagerie");
    }
  }, []);

  const flushQueue = useCallback(async () => {
    const pending = readQueue();
    if (pending.length === 0 || !navigator.onLine) return;
    const rest: Pending[] = [];
    let sent = 0;
    for (const p of pending) {
      try {
        await deliver(p);
        sent++;
      } catch {
        rest.push(p);
      }
    }
    writeQueue(rest);
    setQueue(rest);
    if (sent > 0) {
      toast.success(`${sent} message${sent > 1 ? "s" : ""} en attente envoyé${sent > 1 ? "s" : ""}`);
      loadThreads();
      if (active) loadConversation(active);
    }
  }, [deliver, loadThreads, loadConversation, active]);

  useEffect(() => {
    if (online) flushQueue();
  }, [online, flushQueue]);

  const send = async () => {
    const content = draft.trim();
    if (!content) return;
    if (!active) {
      toast.info("Aucune conversation disponible pour l'instant.");
      return;
    }
    const p: Pending = {
      id: `q-${Date.now()}`,
      thread_key: active.thread_key,
      client_account_id: active.client_account_id,
      reservation_id: active.active_reservation_id,
      content,
      created_at: new Date().toISOString(),
    };
    setDraft("");
    if (!navigator.onLine) {
      const q = [...readQueue(), p];
      writeQueue(q);
      setQueue(q);
      toast.info("Hors-ligne : le message partira dès le retour du réseau");
      return;
    }
    setSending(true);
    try {
      await deliver(p);
      await loadConversation(active);
      loadThreads();
    } catch (e: any) {
      const q = [...readQueue(), p];
      writeQueue(q);
      setQueue(q);
      toast.error("Envoi impossible, message mis en attente : " + (e?.message ?? e));
    } finally {
      setSending(false);
    }
  };

  const threadQueue = queue.filter((q) => q.thread_key === activeKey);

  return (
    <div className="drv-msg-wrap">
      <style>{`
        .drv-msg-wrap { display:grid; grid-template-columns:300px 1fr; gap:14px; }
        .drv-msg-list, .drv-msg-conv { background:#0d1720; border:1px solid #d6a83d; border-radius:14px; overflow:hidden; }
        .drv-msg-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 14px; border-bottom:1px solid rgba(214,168,61,.4); color:#f4f4f1; font-size:11px; letter-spacing:1px; }
        .drv-msg-head b { color:#d6a83d; }
        .drv-msg-items { max-height:60vh; overflow:auto; }
        .drv-msg-item { display:block; width:100%; text-align:left; padding:12px 14px; background:transparent; border:0; border-bottom:1px solid rgba(255,255,255,.06); color:#cfd6dc; cursor:pointer; }
        .drv-msg-item.active { background:rgba(214,168,61,.12); }
        .drv-msg-item strong { display:flex; justify-content:space-between; gap:8px; color:#f4f4f1; font-size:13px; }
        .drv-msg-item small { display:block; margin-top:3px; color:#93a0aa; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .drv-msg-item i { font-style:normal; background:#d6a83d; color:#07101a; border-radius:20px; padding:1px 7px; font-size:10px; font-weight:700; }
        .drv-msg-body { display:flex; flex-direction:column; height:60vh; }
        .drv-msg-scroll { flex:1; overflow:auto; padding:14px; display:flex; flex-direction:column; gap:8px; }
        .drv-bubble { max-width:78%; padding:9px 12px; border-radius:14px; font-size:13px; line-height:1.4; }
        .drv-bubble.client { align-self:flex-start; background:#16232e; color:#eef2f5; }
        .drv-bubble.me { align-self:flex-end; background:#d6a83d; color:#07101a; }
        .drv-bubble.pending { align-self:flex-end; background:rgba(214,168,61,.35); color:#f4f4f1; }
        .drv-bubble span { display:block; margin-top:4px; font-size:10px; opacity:.7; }
        .drv-msg-form { display:flex; gap:8px; padding:12px; border-top:1px solid rgba(214,168,61,.4); }
        .drv-msg-form input { flex:1; min-width:0; background:#07101a; border:1px solid #d6a83d; border-radius:10px; color:#fff; padding:10px 12px; font-size:13px; }
        .drv-msg-form button { background:#d6a83d; color:#07101a; border:0; border-radius:10px; padding:0 16px; font-weight:700; cursor:pointer; }
        .drv-msg-offline { margin:10px 14px 0; padding:8px 10px; border-radius:10px; font-size:11px; background:rgba(255,90,90,.14); color:#ffb4b4; border:1px solid rgba(255,90,90,.4); }
        .drv-msg-empty { padding:26px 14px; color:#93a0aa; font-size:13px; text-align:center; }
        @media (max-width: 900px) {
          .drv-msg-wrap { grid-template-columns:1fr; }
          .drv-msg-items { max-height:38vh; }
          .drv-msg-body { height:52vh; }
        }
      `}</style>

      <section className="drv-msg-list" aria-label="Conversations clients">
        <div className="drv-msg-head">
          <span>CONVERSATIONS</span>
          <b>{threads.length}</b>
        </div>
        {!online && <div className="drv-msg-offline">Hors-ligne — dernières données affichées</div>}
        {contacts.length > 0 && (
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(214,168,61,.3)" }}>
            <select
              value={newResaId}
              onChange={(e) => {
                setActiveKey(null);
                setNewResaId(e.target.value);
              }}
              aria-label="Écrire au client d'une course"
              style={{
                width: "100%",
                background: "#07101a",
                color: "#fff",
                border: "1px solid #d6a83d",
                borderRadius: 10,
                padding: "9px 10px",
                fontSize: 12,
              }}
            >
              <option value="">+ Nouvelle conversation (depuis une course)</option>
              {contacts.map((c) => (
                <option key={c.reservation_id} value={c.reservation_id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="drv-msg-items">
          {loading && <div className="drv-msg-empty">Chargement…</div>}
          {!loading && threads.length === 0 && <div className="drv-msg-empty">Aucune conversation pour l'instant</div>}
          {threads.map((t) => (
            <button
              type="button"
              key={t.thread_key}
              className={`drv-msg-item${t.thread_key === activeKey ? " active" : ""}`}
              onClick={() => setActiveKey(t.thread_key)}
            >
              <strong>
                <span>{t.client_name || t.client_phone || "Client"}</span>
                {t.unread_chauffeur > 0 && <i>{t.unread_chauffeur}</i>}
              </strong>
              <small>{t.last_message_content}</small>
              <small>{t.last_message_at ? fmtTime(t.last_message_at) : ""}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="drv-msg-conv" aria-label="Conversation">
        <div className="drv-msg-head">
          <span>{active ? active.client_name || active.client_phone || "Client" : "SÉLECTIONNEZ UN CLIENT"}</span>
          <b>{active?.active_reservation_label ?? (active ? "Message direct" : "")}</b>
        </div>
        <div className="drv-msg-body">
          <div className="drv-msg-scroll">
            {!active && (
              <div className="drv-msg-empty">
                Choisissez une conversation, ou démarrez-en une depuis une course.
              </div>
            )}
            {active && messages.length === 0 && <div className="drv-msg-empty">Aucun message échangé.</div>}
            {messages.map((m) => (
              <div key={m.id} className={`drv-bubble ${m.sender === "chauffeur" ? "me" : "client"}`}>
                {m.content}
                <span>
                  {fmtTime(m.created_at)}
                  {m.reservation_label ? ` · ${m.reservation_label}` : ""}
                </span>
              </div>
            ))}
            {threadQueue.map((q) => (
              <div key={q.id} className="drv-bubble pending">
                {q.content}
                <span>En attente d'envoi…</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form
            className="drv-msg-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                active
                  ? "Votre message…"
                  : loading
                    ? "Chargement des conversations…"
                    : "Aucune conversation pour l'instant"
              }
              disabled={sending}
              aria-label="Message au client"
            />
            <button type="submit" disabled={sending || draft.trim().length === 0}>
              {sending ? "…" : "Envoyer"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
