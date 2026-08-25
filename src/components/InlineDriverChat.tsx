import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Send, Loader2, CheckCheck, Check } from "lucide-react";
import { toast } from "sonner";
import {
  listReservationMessages,
  markReservationReadByChauffeur,
  sendChauffeurMessage,
  type ChatMessage,
} from "@/lib/chat.functions";
import { registerChauffeurReader, acquireReadLock, releaseReadLock, broadcastChatBadge } from "@/lib/chat-badge-sync";
import { getDriverToken } from "@/lib/driver-token";

type Props = {
  reservationId: string;
  onUnreadChange?: (n: number) => void;
};

const COPY = {
  fr: {
    empty: "Aucun message pour l'instant.",
    placeholder: "Répondre au client…",
    send: "Envoyer",
    sendFailed: "Envoi impossible, réessaie.",
  },
  en: {
    empty: "No messages yet.",
    placeholder: "Reply to the client…",
    send: "Send",
    sendFailed: "Could not send, please try again.",
  },
} as const;

export function InlineDriverChat({ reservationId, onUnreadChange }: Props) {
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Garde contre les mises à jour d'état après démontage (le composant est
  // monté/démonté à chaque expand/collapse de la carte course sur mobile —
  // sans ça, une réponse réseau tardive après un collapse rapide déclenche
  // un setState sur composant démonté, silencieux mais source d'état
  // incohérent, surtout sur connexions mobiles instables).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const markRead = useCallback(async () => {
    // Verrou cross-onglets : si un autre onglet a déjà lancé le markRead
    // sur cette réservation dans les 3 dernières secondes, on skip l'UPDATE
    // (l'autre onglet diffusera le delta via BroadcastChannel).
    if (!acquireReadLock(reservationId)) {
      onUnreadChange?.(0);
      return;
    }
    try {
      const res = await markReservationReadByChauffeur({
        data: { reservation_id: reservationId, driver_token: getDriverToken() },
      });
      if (!mountedRef.current) return;
      onUnreadChange?.(0);
      if ((res?.updated ?? 0) > 0) {
        broadcastChatBadge({ type: "read", reservationId, at: Date.now() });
      }
    } catch {
      /* ignore */
    } finally {
      releaseReadLock(reservationId);
    }
  }, [reservationId, onUnreadChange]);

  const load = useCallback(async () => {
    try {
      const rows = await listReservationMessages({
        data: { reservation_id: reservationId, limit: 30, driver_token: getDriverToken() },
      });
      if (!mountedRef.current) return;
      setMessages(rows);
    } catch (e) {
      console.warn("[inline-chat] load failed", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    load();
    markRead();
  }, [load, markRead]);

  // Sync badge + auto-refresh
  useEffect(() => {
    const unregister = registerChauffeurReader(`resa:${reservationId}`, markRead);
    // Bug corrigé : le poll ne rappelait que load(), jamais markRead(). Si le
    // chauffeur gardait le chat ouvert (onglet visible, pas de blur/focus),
    // les nouveaux messages client apparaissaient bien dans le fil via load(),
    // mais read_by_client n'était jamais remis à jour et le badge "non lu" sur
    // la carte course ne redescendait jamais à 0 tant que l'utilisateur ne
    // changeait pas d'onglet. On aligne le poll sur le même comportement que
    // onVis ci-dessous.
    const id = setInterval(() => {
      if (!document.hidden) {
        load();
        markRead();
      }
    }, 5000);
    const onVis = () => {
      if (!document.hidden) {
        load();
        markRead();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      unregister();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reservationId, load, markRead]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const msg = await sendChauffeurMessage({
        data: { reservation_id: reservationId, content, driver_token: getDriverToken() },
      });
      if (!mountedRef.current) return;
      setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]));
      setInput("");
    } catch (e) {
      console.error("[inline-chat] send failed", e);
      // toast au lieu de alert() : sur iOS/Android en PWA installée, alert()
      // bloque le thread JS et rend un popup natif disgracieux — le reste de
      // l'app (suivi.tsx, driver.tsx) utilise déjà sonner partout ailleurs.
      toast.error(c.sendFailed);
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        marginTop: 8,
        background: "#FBF7EE",
        border: "1px solid #E8DFCB",
        borderRadius: 12,
        padding: 10,
      }}
    >
      <div
        ref={scrollRef}
        style={{
          maxHeight: 200,
          overflowY: "auto",
          background: "#ffffff",
          border: "1px solid #EEE6D2",
          borderRadius: 8,
          padding: 8,
          marginBottom: 8,
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: 12, color: "#666" }}>
            <Loader2 className="animate-spin" style={{ width: 14, height: 14, display: "inline" }} />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: 12, color: "#888", fontSize: 12 }}>{c.empty}</div>
        )}
        {messages.map((m) => {
          const mine = m.sender === "chauffeur";
          const isRead = mine ? m.read_by_client : false;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  background: mine ? "linear-gradient(135deg,#C9A84C,#E8C96D)" : "#F5EEDC",
                  color: "#0f172a",
                  border: mine ? "none" : "1px solid #E8DFCB",
                  borderRadius: 12,
                  padding: "6px 10px",
                  fontSize: 13,
                  lineHeight: 1.35,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.content}
                <div
                  style={{
                    marginTop: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    color: mine ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.45)",
                  }}
                >
                  {new Date(m.created_at).toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {mine &&
                    (isRead ? (
                      <CheckCheck style={{ width: 12, height: 12, color: "#1d4ed8" }} />
                    ) : (
                      <Check style={{ width: 12, height: 12, opacity: 0.6 }} />
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: 6, alignItems: "flex-end" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={c.placeholder}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            maxHeight: 100,
            background: "#ffffff",
            color: "#000000",
            border: "1px solid #E8DFCB",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg,#C9A84C,#E8C96D)",
            color: "#000",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
            opacity: sending || !input.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
          aria-label={c.send}
        >
          {sending ? (
            <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
          ) : (
            <Send style={{ width: 16, height: 16 }} />
          )}
        </button>
      </form>
    </div>
  );
}
