import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Clock,
  MapPin,
  Users,
  Package,
  Gauge,
  CreditCard,
  AlertTriangle,
  Send,
  Loader2,
  Phone,
  MessageCircle,
  Star,
  FileText,
  Download,
  PrinterIcon,
  CalendarPlus,
  Share2,
  WifiOff,
  Car,
} from "lucide-react";
import { useI18n, useT } from "@/i18n/I18nProvider";
import { getReservationForFinPublic } from "@/lib/reservation.functions";
import { logTrackingEvent, requestRecurringRide } from "@/lib/public-events.functions";
import { recomputeReservationDuration } from "@/lib/reservation-recompute.functions";
import { durationSecondsToMinutes, durationSecondsToMs } from "@/lib/duration";
import {
  listSuiviMessages,
  sendSuiviClientMessage,
  markReservationMessagesRead,
  countUnreadClientForReservation,
  type ChatMessage,
} from "@/lib/chat.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/suivi/$id")({
  head: () => ({
    meta: [
      { title: "Suivi de votre taxi — Access Prestige Taxi" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { name: "theme-color", content: "#f6f0e5" },
    ],
  }),
  component: SuiviPage,
});

// ─────────────────────────────────────────────────────────────────────────────────
const UI = {
  fr: {
    you: "Vous",
    tbd: "À définir",
  },
  en: {
    you: "You",
    tbd: "To be determined",
  },
} as const;

import { DRIVERS } from "@/data/drivers";

const JOSE_PHONE = "0650260015";
// Délai d'expiration du lien de suivi après la fin de la course (en jours)
const SUIVI_EXPIRY_DAYS = 30;

function isSuiviExpired(reservation: any): boolean {
  if (reservation.status !== "completed" && reservation.status !== "cancelled") return false;
  // Utilise updated_at ou pickup_datetime comme référence
  const ref = reservation.completed_at ?? reservation.updated_at ?? reservation.pickup_datetime;
  if (!ref) return false;
  const refMs = new Date(ref).getTime();
  const expiryMs = refMs + SUIVI_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > expiryMs;
}
const VEHICLE_MODEL = "Mercedes-Benz";
const VEHICLE_COLOR = "Noir";
const VEHICLE_PLATE = "HF-450-JG";

const PREMIUM_CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; overscroll-behavior-y: contain; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  input, textarea { -webkit-tap-highlight-color: transparent; }
  .suivi-root { overscroll-behavior-y: contain; }
  .suivi-root h1, .suivi-root h2, .suivi-root h3 { font-family: "Playfair Display", serif; }
  .suivi-root * { border-style: none !important; }
  .suivi-root input, .suivi-root textarea { background: rgba(255,255,255,0.06); color: #f6f0e5; }
  
  @keyframes gradient-flow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes float-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(29, 78, 216, 0.4), inset 0 1px 0 rgba(255,255,255,0.1); }
    50% { box-shadow: 0 0 30px rgba(29, 78, 216, 0.6), inset 0 1px 0 rgba(255,255,255,0.2); }
  }
  
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .suivi-premium {
    animation: float-up 0.5s ease-out both;
  }
  
  .suivi-pulse-active {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .suivi-slide {
    animation: slide-in-right 0.4s ease-out both;
  }
  
  .suivi-card {
    background: linear-gradient(135deg, #0d1a2b 0%, #07111f 100%);
    border: none;
    border-radius: 22px;
    color: #f6f0e5;
    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.38);
    /* Fix #8 — préfixe webkit pour iOS < 15 */
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .suivi-card:hover {
    box-shadow: 0 20px 55px rgba(0, 0, 0, 0.45);
    transform: translateY(-2px);
  }
  
  .suivi-glass {
    background: rgba(13, 26, 43, 0.75);
    /* Fix #8 — préfixe webkit pour iOS < 15 */
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    border: none;
    border-radius: 14px;
    color: #f6f0e5;
  }
`;

// ─── Types ─────────────────────────────────────────────────────────────────────────
type Reservation = {
  id: string;
  depart: string;
  destination?: string | null;
  arrivee?: string | null;
  pickup_datetime?: string | null;
  completed_at?: string | null;
  updated_at?: string | null;
  status: string;
  prix_estime?: number | null;
  distance_km?: number | null;
  duree_s?: number | null;
  client_name?: string | null;
  nom?: string | null;
  nb_passagers?: number | null;
  nb_bagages?: number | null;
  mode_paiement?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  client_account_id?: string | null;
};

// ─── Status Config ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgGradient: string;
    borderColor: string;
    icon: string;
  }
> = {
  pending: {
    label: "suivi.status.pending",
    color: "#f0c069",
    bgGradient: "linear-gradient(135deg, #241d0e 0%, #2f2513 100%)",
    borderColor: "rgba(217, 119, 6, 0.2)",
    icon: "⏳",
  },
  accepted: {
    label: "suivi.status.accepted",
    color: "#5fd08a",
    bgGradient: "linear-gradient(135deg, #0e2318 0%, #123122 100%)",
    borderColor: "rgba(34, 197, 94, 0.2)",
    icon: "✨",
  },
  en_route: {
    label: "suivi.status.en_route",
    color: "#e0b866",
    bgGradient: "linear-gradient(135deg, #101f33 0%, #16283f 100%)",
    borderColor: "rgba(29, 78, 216, 0.2)",
    icon: "🚕",
  },
  arrived: {
    label: "suivi.status.arrived",
    color: "#c4b5fd",
    bgGradient: "linear-gradient(135deg, #1a1730 0%, #221d3d 100%)",
    borderColor: "rgba(124, 58, 237, 0.2)",
    icon: "📍",
  },
  completed: {
    label: "suivi.status.completed",
    color: "#cfd6df",
    bgGradient: "linear-gradient(135deg, #0c1929 0%, #f6f0e5 100%)",
    borderColor: "rgba(71, 85, 105, 0.2)",
    icon: "✓",
  },
  cancelled: {
    label: "suivi.status.cancelled",
    color: "#f19a9a",
    bgGradient: "linear-gradient(135deg, #2a1212 0%, #3a1a1a 100%)",
    borderColor: "rgba(185, 28, 28, 0.2)",
    icon: "✕",
  },
};

// ─── Timeline Stepper ──────────────────────────────────────────────────────────────
function PremiumTimeline({ status }: { status: string }) {
  const t = useT();
  const steps = ["accepted", "en_route", "arrived", "completed"];
  if (status === "cancelled") return null;

  // "pending" (avant validation chauffeur) → aucune étape encore active
  const currentIdx = steps.indexOf(status as any);

  const stepLabels: Record<string, string> = {
    accepted: t("suivi.timeline.accepted"),
    en_route: t("suivi.status.en_route"),
    arrived: t("suivi.timeline.arrived"),
    completed: t("suivi.timeline.completed"),
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      {steps.map((s, i) => {
        const isDone = i <= currentIdx;
        const isActive = i === currentIdx;
        const config = STATUS_CONFIG[s];

        return (
          <div
            key={s}
            style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}
          >
            {/* Étape + label */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
                flex: "0 0 auto",
                width: "62px",
              }}
            >
              <div
                className={`suivi-premium ${isActive && status === "arrived" ? "suivi-pulse-active" : ""}`}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: isDone ? config.bgGradient : "#f6f0e5",
                  border: `2px solid ${isDone ? config.borderColor : "transparent"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: config.color,
                  flexShrink: 0,
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {isDone && !isActive ? "✓" : config.icon}
              </div>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: isActive ? 700 : 500,
                  color: isDone ? config.color : "#9fb0c2",
                  textAlign: "center",
                  lineHeight: 1.25,
                  width: "100%",
                  whiteSpace: "normal",
                  wordBreak: "normal",
                  overflowWrap: "normal",
                  hyphens: "none",
                  letterSpacing: "-0.1px",
                }}
              >
                {stepLabels[s]}
              </div>
            </div>
            {/* Ligne entre étapes */}
            {i < steps.length - 1 && (
              <div style={{ flex: 1, minWidth: "6px", paddingTop: "14px" }}>
                <div
                  style={{
                    height: "2px",
                    background: isDone ? `linear-gradient(90deg, ${config.color}40, ${config.color}70)` : "#f6f0e5",
                    borderRadius: "1px",
                    transition: "all 0.4s ease",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Chat Component (anonyme, scopé par clé URL /suivi/$id) ──────────────────
function ChatSection({
  suiviKey,
  reservationId,
  driverName,
  t,
}: {
  suiviKey: string;
  reservationId: string;
  driverName: string;
  t: (k: string) => string;
}) {
  const [unread, setUnread] = useState(0);
  return (
    <div
      className="suivi-premium suivi-card"
      style={{ marginBottom: "16px", padding: "16px", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#f6f0e5",
          marginBottom: "12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <MessageCircle size={16} />
        {t("suivi.chat_title")}
        {unread > 0 ? (
          <span
            title={`${unread} message${unread > 1 ? "s" : ""} du taxi non lu${unread > 1 ? "s" : ""} · conversation en cours`}
            aria-label={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}
            style={{
              minWidth: 20,
              height: 20,
              padding: "0 6px",
              borderRadius: 10,
              background: "#ef4444",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "auto",
            }}
          >
            {unread}
          </span>
        ) : (
          <span
            title="Aucun message non lu"
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "#9fb0c2",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            ✓ à jour
          </span>
        )}
      </div>
      <AnonChat suiviKey={suiviKey} reservationId={reservationId} driverName={driverName} onUnreadChange={setUnread} />
    </div>
  );
}

function AnonChat({
  suiviKey,
  reservationId,
  driverName,
  onUnreadChange,
}: {
  suiviKey: string;
  reservationId: string;
  driverName: string;
  onUnreadChange?: (n: number) => void;
}) {
  const t = useT();
  const { lang } = useI18n();
  const u = lang === "en" ? UI.en : UI.fr;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const driverBadgeChannelRef = useRef<any>(null);
  // Le tout premier chargement des messages ne doit jamais déclencher de scroll :
  // sinon endRef.scrollIntoView() fait défiler toute la page (pas seulement la
  // fenêtre de chat interne) jusqu'au bloc chat, plus bas dans la page — la page
  // semble "démarrer en bas". On ne scrolle qu'à partir du 2e changement (un
  // vrai nouveau message reçu/envoyé après le chargement initial).
  const isFirstLoadRef = useRef(true);
  const listFn = useServerFn(listSuiviMessages);
  const sendFn = useServerFn(sendSuiviClientMessage);
  const markReadFn = useServerFn(markReservationMessagesRead);
  const countUnreadFn = useServerFn(countUnreadClientForReservation);
  const [unreadSql, setUnreadSql] = useState(0);

  const load = useCallback(async () => {
    try {
      const rows = await listFn({ data: { suivi_key: suiviKey, limit: 60 } });
      setMessages(rows as ChatMessage[]);
    } catch (e) {
      console.warn("[suivi-chat] load failed", e);
    }
  }, [suiviKey, listFn]);

  useEffect(() => {
    load();
    // Realtime: synchronisation instantanée via Supabase Realtime (sans polling)
    const ch = (supabase as any)
      .channel(`chat_suivi_${reservationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reservation_messages",
          filter: `reservation_id=eq.${reservationId}`,
        },
        (payload: any) => {
          // Bump immédiat du compteur : évite l'aller-retour load() → count().
          const row = payload?.new;
          if (row && !row.read_by_client) setUnreadSql((n) => n + 1);
          load();
        },
      )
      .subscribe();
    const driverBadgeChannel = (supabase as any).channel("drv-chat-badge");
    driverBadgeChannelRef.current = driverBadgeChannel;
    driverBadgeChannel.subscribe();
    // Filet de sécurité : `reservation_messages` reste fermé en lecture aux
    // clients (RLS admin-only), donc postgres_changes peut ne rien livrer.
    // On garde un poll léger via le server function qui valide la clé de suivi.
    const poll = setInterval(() => {
      if (!document.hidden) load();
    }, 7000);
    // Re-sync au retour de l'onglet (filet de sécurité si la connexion realtime a été coupée)
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(ch);
      supabase.removeChannel(driverBadgeChannel);
      driverBadgeChannelRef.current = null;
    };
  }, [reservationId, load]);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  // Compteur non lus : COUNT SQL exact (source de vérité identique à celle du
  // chauffeur), rafraîchi à chaque changement de liste + focus onglet.
  const refreshUnread = useCallback(async () => {
    try {
      const n = await countUnreadFn({ data: { suivi_key: suiviKey } });
      setUnreadSql(Number(n) || 0);
    } catch {}
  }, [countUnreadFn, suiviKey]);
  useEffect(() => {
    refreshUnread();
  }, [messages, refreshUnread]);
  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) refreshUnread();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshUnread]);
  useEffect(() => {
    onUnreadChange?.(unreadSql);
  }, [unreadSql, onUnreadChange]);
  useEffect(() => {
    if (unreadSql === 0) return;
    if (typeof document !== "undefined" && document.hidden) return;
    let cancelled = false;
    (async () => {
      try {
        await markReadFn({ data: { suivi_key: suiviKey, role: "client" } });
        if (!cancelled) {
          setMessages((prev) => prev.map((m) => (!m.read_by_client ? { ...m, read_by_client: true } : m)));
          setUnreadSql(0);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [unreadSql, reservationId, markReadFn]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const row = await sendFn({ data: { suivi_key: suiviKey, content: trimmed } });
      setMessages((prev) =>
        prev.some((m) => m.id === (row as ChatMessage).id) ? prev : [...prev, row as ChatMessage],
      );
      driverBadgeChannelRef.current?.send({
        type: "broadcast",
        event: "new_client_message",
        payload: { at: Date.now() },
      });
      setText("");
    } catch (e: any) {
      console.error("[suivi-chat] send failed", e);
      toast.error(t("suivi.chat_send_error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "min(320px, 40dvh)" }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingRight: "4px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9fb0c2", fontSize: "12px", padding: "20px 0" }}>
            {t("suivi.chat_empty")}
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.sender === "client";
          return (
            <div
              key={msg.id}
              className="suivi-slide"
              style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%" }}
            >
              <div
                style={{
                  background: mine ? "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)" : "#0c1929",
                  color: mine ? "#fff" : "#f6f0e5",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
              <div style={{ fontSize: "10px", color: "#9fb0c2", marginTop: "3px", padding: "0 4px" }}>
                {mine ? t("suivi.chat_you") || u.you : driverName}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder={t("suivi.chat_placeholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={sending}
          style={{
            flex: 1,
            padding: "12px 12px",
            borderRadius: "8px",
            border: "1px solid #f6f0e5",
            fontSize: "16px",
            fontFamily: "inherit",
            transition: "all 0.3s",
            color: "#f6f0e5",
            background: "#0d1a2b",
            minHeight: "44px",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          style={{
            padding: "10px 16px",
            minWidth: "44px",
            minHeight: "44px",
            background: sending || !text.trim() ? "#cbb894" : "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: sending || !text.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.3s",
          }}
        >
          {sending ? <Loader2 size={16} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Calendrier ICS ──────────────────────────────────────────────────────────────
function generateICS(reservation: any, t: (k: string) => string): string {
  // reservation est null au premier rendu (SSR + avant chargement) : sans ce
  // garde-fou la page /suivi/:id plantait immédiatement (erreur "This page
  // didn't load"), notamment en arrivant depuis une notification client.
  if (!reservation?.pickup_datetime) return "#";
  const start = new Date(reservation.pickup_datetime);
  // Utilise duree_s si disponible, sinon 1h par défaut
  const durationMs = reservation.duree_s ? durationSecondsToMs(reservation.duree_s) : 60 * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const labelDepart = t("suivi.depart_label");
  const labelArrivee = t("suivi.arrivee_label");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Access Prestige Taxi//FR",
    "BEGIN:VEVENT",
    `UID:tcb-${reservation.id}@accessprestigetaxi.lovable.app`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:🚕 Access Prestige Taxi`,
    `DESCRIPTION:${labelDepart} : ${reservation.depart}\n${labelArrivee} : ${reservation.destination ?? reservation.arrivee ?? ""}`,
    `LOCATION:${reservation.depart}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([lines], { type: "text/calendar" });
  return URL.createObjectURL(blob);
}

// ─── Facture ──────────────────────────────────────────────────────────────────────
function InvoiceBlock({ reservation, locale, t }: { reservation: any; locale: string; t: (k: string) => string }) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Fix #7 — sur mobile, "Imprimer" ouvre la facture PDF plutôt que window.print() sur toute la page
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);
  const handlePrint = () => {
    if (isMobile) {
      handleDownloadPDF();
    } else {
      window.print();
    }
  };

  const handleSendEmail = async () => {
    const emailAddr =
      (reservation as any).email || (reservation as any).client_email || window.prompt(t("suivi.invoice_email_prompt"));
    if (!emailAddr) return;
    setEmailSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-receipt", {
        body: { reservation_id: reservation.id, email: emailAddr },
      });
      if (error) throw error;
      setEmailSent(true);
      toast.success(t("suivi.invoice_email_sent") + " " + emailAddr);
    } catch (e: any) {
      toast.error(t("suivi.invoice_email_error") + " " + (e?.message ?? t("suivi.error_unknown")));
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownloadPDF = () => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;
    const RECEIPT_LOCALE: Record<string, string> = {
      fr: "fr-FR",
      en: "en-GB",
      es: "es-ES",
      pt: "pt-PT",
      it: "it-IT",
      ar: "ar-SA",
    };
    const intlLocale = RECEIPT_LOCALE[locale] ?? "fr-FR";
    const dateStr = reservation.pickup_datetime
      ? new Date(reservation.pickup_datetime).toLocaleString(intlLocale, {
          dateStyle: "long",
          timeStyle: "short",
          timeZone: "Europe/Paris",
        })
      : new Date().toLocaleDateString(intlLocale);
    const prix = reservation.prix_estime
      ? new Intl.NumberFormat(intlLocale, { style: "currency", currency: "EUR" }).format(reservation.prix_estime)
      : "—";
    // Fix #1 — résoudre les labels i18n avant le template string
    const labelDepart = t("suivi.depart_label");
    const labelArrivee = t("suivi.arrivee_label");
    const labelPassagers = t("suivi.passagers");
    const labelDocTitle = t("suivi.receipt.doc_title");
    const labelReceiptTitle = t("suivi.receipt.title");
    const labelDetailsTitle = t("suivi.receipt.details_title");
    const labelDistance = t("suivi.receipt.distance");
    const labelPayment = t("suivi.receipt.payment");
    const labelTotal = t("suivi.receipt.total");
    const labelPrint = t("suivi.receipt.print");
    const labelClose = t("suivi.receipt.close");
    const labelFooterLegal = t("suivi.receipt.footer_legal");
    const labelFooterThanks = t("suivi.receipt.footer_thanks");
    const dir = locale === "ar" ? "rtl" : "ltr";
    const html = `<!DOCTYPE html><html lang="${locale}" dir="${dir}"><head><meta charset="UTF-8"/>
<title>${labelDocTitle}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #f6f0e5; max-width: 700px; margin: 40px auto; padding: 0 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #e0b866; padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 22px; font-weight: 900; color: #e0b866; letter-spacing: -0.5px; }
  .brand small { display: block; font-size: 12px; font-weight: 400; color: #9fb0c2; margin-top: 2px; }
  .meta { text-align: right; font-size: 12px; color: #9fb0c2; }
  .meta strong { display: block; font-size: 16px; color: #f6f0e5; font-weight: 700; }
  h2 { font-size: 13px; font-weight: 700; color: #9fb0c2; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #0c1929; font-size: 14px; }
  .row:last-child { border: none; }
  .row .label { color: #cfd6df; }
  .row .value { font-weight: 600; }
  .total-box { margin-top: 24px; background: #09141f; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .total-box .label { font-size: 14px; color: #cfd6df; }
  .total-box .amount { font-size: 26px; font-weight: 900; color: #e0b866; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #f6f0e5; font-size: 11px; color: #9fb0c2; text-align: center; }
  .btn { display: inline-block; margin: 20px 8px 0; padding: 10px 24px; background: #e0b866; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style></head><body>
<div class="header">
  <div class="brand">🚕 Access Prestige Taxi<small>accessprestigetaxi.lovable.app · 06 50 26 00 15</small></div>
  <div class="meta"><strong>${labelReceiptTitle}</strong>N° ${reservation.id.slice(-8).toUpperCase()}<br/>${dateStr}</div>
</div>
<h2>${labelDetailsTitle}</h2>
<div class="row"><span class="label">${labelDepart} 🟢</span><span class="value">${reservation.depart ?? "—"}</span></div>
<div class="row"><span class="label">${labelArrivee} 🔴</span><span class="value">${reservation.destination ?? reservation.arrivee ?? "—"}</span></div>
${reservation.distance_km != null ? `<div class="row"><span class="label">${labelDistance}</span><span class="value">${Number(reservation.distance_km).toFixed(1)} km</span></div>` : ""}
${reservation.nb_passagers != null ? `<div class="row"><span class="label">${labelPassagers}</span><span class="value">${reservation.nb_passagers}</span></div>` : ""}
${reservation.mode_paiement ? `<div class="row"><span class="label">${labelPayment}</span><span class="value">${reservation.mode_paiement}</span></div>` : ""}
<div class="total-box"><span class="label">${labelTotal}</span><span class="amount">${prix}</span></div>
<div class="no-print" style="text-align:center">
  <button class="btn" onclick="window.print()">${labelPrint}</button>
  <button class="btn" onclick="window.close()" style="background:#9fb0c2">${labelClose}</button>
</div>
<div class="footer">${labelFooterLegal}<br/>${labelFooterThanks}</div>
</body></html>`;
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
    setTimeout(() => invoiceWindow.print(), 400);
  };

  return (
    <div className="suivi-premium suivi-card" style={{ marginBottom: "16px", padding: "20px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#e0b866",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <FileText size={14} /> {t("suivi.receipt_title")}
      </div>

      {/* Récap trajet */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            paddingBottom: "8px",
            borderBottom: "1px solid #0c1929",
          }}
        >
          <span style={{ color: "#9fb0c2" }}>{t("suivi.depart_label")} 🟢</span>
          <span style={{ fontWeight: 600, color: "#f6f0e5", maxWidth: "60%", textAlign: "right" }}>
            {reservation.depart}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            paddingBottom: "8px",
            borderBottom: "1px solid #0c1929",
          }}
        >
          <span style={{ color: "#9fb0c2" }}>{t("suivi.arrivee_label")} 🔴</span>
          <span style={{ fontWeight: 600, color: "#f6f0e5", maxWidth: "60%", textAlign: "right" }}>
            {reservation.destination ?? reservation.arrivee ?? "—"}
          </span>
        </div>
        {reservation.distance_km != null && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              paddingBottom: "8px",
              borderBottom: "1px solid #0c1929",
            }}
          >
            <span style={{ color: "#9fb0c2" }}>{t("suivi.distance")}</span>
            <span style={{ fontWeight: 600, color: "#f6f0e5" }}>{Number(reservation.distance_km).toFixed(1)} km</span>
          </div>
        )}
        {reservation.mode_paiement && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              paddingBottom: "8px",
              borderBottom: "1px solid #0c1929",
            }}
          >
            <span style={{ color: "#9fb0c2" }}>{t("suivi.paiement")}</span>
            <span style={{ fontWeight: 600, color: "#f6f0e5" }}>{reservation.mode_paiement}</span>
          </div>
        )}
        {reservation.prix_estime != null && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
            <span style={{ fontSize: "13px", color: "#9fb0c2" }}>{t("fin.price_label")}</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#e0b866" }}>
              {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(reservation.prix_estime)}
            </span>
          </div>
        )}
        <div
          style={{
            fontSize: "11px",
            color: "#9fb0c2",
            textAlign: "right",
            marginTop: "2px",
          }}
        >
          {t("suivi.receipt.footer_legal")}
        </div>
      </div>

      {/* Boutons — 2 colonnes sur mobile */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button
          onClick={handlePrint}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px 10px",
            background: "rgba(255,255,255,0.08)",
            color: "#9fb0c2",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <PrinterIcon size={15} /> {t("suivi.print")}
        </button>
        <button
          onClick={handleDownloadPDF}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px 10px",
            background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
          }}
        >
          <Download size={15} /> {t("suivi.download_pdf")}
        </button>
        <button
          onClick={handleSendEmail}
          disabled={emailSending || emailSent}
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px 10px",
            background: emailSent
              ? "linear-gradient(135deg, #5fd08a 0%, #5fd08a 100%)"
              : emailSending
                ? "#cbb894"
                : "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: emailSending || emailSent ? "not-allowed" : "pointer",
            boxShadow: emailSent ? "0 4px 12px rgba(22,163,74,0.3)" : "0 4px 12px rgba(14,165,233,0.3)",
          }}
        >
          {emailSending ? (
            <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          ) : emailSent ? (
            <>{t("suivi.invoice_email_done")}</>
          ) : (
            <>{t("suivi.invoice_email_send")}</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Course récurrente ─────────────────────────────────────────────────────────
function RecurringModal({ reservation, onClose }: { reservation: any; onClose: () => void }) {
  const t = useT();
  const DAYS = [
    t("suivi.day.sun"),
    t("suivi.day.mon"),
    t("suivi.day.tue"),
    t("suivi.day.wed"),
    t("suivi.day.thu"),
    t("suivi.day.fri"),
    t("suivi.day.sat"),
  ];
  const [freq, setFreq] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [dayOfWeek, setDayOfWeek] = useState<number>(() => {
    if (reservation.pickup_datetime) {
      return new Date(reservation.pickup_datetime).getDay();
    }
    return 1;
  });
  const [time, setTime] = useState<string>(() => {
    if (reservation.pickup_datetime) {
      const d = new Date(reservation.pickup_datetime);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "08:00";
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Écriture sécurisée : la fonction serveur vérifie la clé de suivi et
      // recopie elle-même les détails du trajet (aucune donnée client de confiance).
      const res = await requestRecurringRide({
        data: {
          key: String(reservation.suivi_id ?? reservation.tracking_id ?? reservation.id),
          frequency: freq as "weekly" | "biweekly" | "monthly",
          day_of_week: dayOfWeek,
          time_hhmm: time,
        },
      });
      if (!res.ok) throw new Error(res.error ?? "INVALID_REQUEST");
      setSaved(true);
      toast.success(t("suivi.rec_success"));
      setTimeout(onClose, 1800);
    } catch (e: any) {
      toast.error(t("suivi.rec_error") + " " + (e?.message ?? t("suivi.error_unknown")));
    } finally {
      setSaving(false);
    }
  };

  const freqLabel: Record<string, string> = {
    weekly: t("suivi.rec_weekly"),
    biweekly: t("suivi.rec_biweekly"),
    monthly: t("suivi.rec_monthly"),
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 40, height: 4, background: "#f6f0e5", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: "#f6f0e5", marginBottom: 4 }}>{t("suivi.rec_title")}</div>
        <div style={{ fontSize: 13, color: "#9fb0c2", marginBottom: 20 }}>
          {reservation.depart} → {reservation.destination ?? reservation.arrivee ?? "—"}
        </div>

        {/* Fréquence */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9fb0c2",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            {t("suivi.rec_freq")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["weekly", "biweekly", "monthly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "2px solid",
                  borderColor: freq === f ? "#e0b866" : "#f6f0e5",
                  background: freq === f ? "#12212f" : "#fff",
                  color: freq === f ? "#e0b866" : "#9fb0c2",
                  cursor: "pointer",
                }}
              >
                {freqLabel[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Jour */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9fb0c2",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            {t("suivi.rec_day")}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {DAYS.map((label, i) => (
              <button
                key={i}
                onClick={() => setDayOfWeek(i)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "2px solid",
                  borderColor: dayOfWeek === i ? "#e0b866" : "#f6f0e5",
                  background: dayOfWeek === i ? "#12212f" : "#fff",
                  color: dayOfWeek === i ? "#e0b866" : "#9fb0c2",
                  cursor: "pointer",
                }}
              >
                {label.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Heure */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9fb0c2",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            {t("suivi.rec_time")}
          </div>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1.5px solid #f6f0e5",
              fontSize: 16,
              color: "#f6f0e5",
              fontFamily: "inherit",
              boxSizing: "border-box" as const,
            }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          style={{
            width: "100%",
            padding: "15px 16px",
            background: saved
              ? "linear-gradient(135deg, #5fd08a 0%, #5fd08a 100%)"
              : "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            cursor: saving || saved ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(29,78,216,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
          {saved ? t("suivi.rec_saved") : saving ? t("suivi.rec_saving") : t("suivi.rec_activate")}
        </button>
      </div>
    </div>
  );
}

// ─── Avis ──────────────────────────────────────────────────────────────────────────
function ReviewBlock({
  reservationId,
  authorName,
  t,
}: {
  reservationId: string;
  authorName?: string | null;
  t: (k: string) => string;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/public/reviews?reservation_id=${encodeURIComponent(reservationId)}`);
        if (!response.ok) return;
        const state = await response.json();
        if (!cancelled && state.hasReview) setAlreadyReviewed(true);
      } catch {
        // Non bloquant : si la vérification échoue, l'envoi empêchera quand même les doublons côté serveur.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("suivi.review_select"));
      return;
    }
    setSubmitting(true);
    try {
      const cleanedComment = comment.trim();
      const response = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: reservationId,
          author_name: authorName?.trim() || null,
          note: rating,
          commentaire: cleanedComment || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || t("suivi.review_impossible"));
      if (result.alreadySubmitted) setAlreadyReviewed(true);
      setSubmitted(true);
      toast.success(t("suivi.review_thanks"));
    } catch (e: any) {
      toast.error(t("suivi.review_error") + " " + (e.message ?? t("suivi.review_impossible")));
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyReviewed || submitted) {
    return (
      <div className="suivi-premium suivi-card" style={{ marginBottom: "16px", padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>⭐</div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f6f0e5", marginBottom: "4px" }}>
          {t("suivi.review_sent")}
        </div>
        <div style={{ fontSize: "13px", color: "#9fb0c2" }}>{t("suivi.review_sent_sub")}</div>
      </div>
    );
  }

  return (
    <div className="suivi-premium suivi-card" style={{ marginBottom: "16px", padding: "20px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#f59e0b",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Star size={14} /> {t("suivi.review_title")}
      </div>

      {/* Étoiles */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "16px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.15s",
              transform: (hover || rating) >= star ? "scale(1.2)" : "scale(1)",
            }}
          >
            <Star
              size={32}
              fill={(hover || rating) >= star ? "#f59e0b" : "none"}
              stroke={(hover || rating) >= star ? "#f59e0b" : "#cbb894"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b", textAlign: "center", marginBottom: "12px" }}>
          {
            ["", t("fin.star.bad"), t("fin.star.ok"), t("fin.star.good"), t("fin.star.great"), t("fin.star.excellent")][
              rating
            ]
          }
        </div>
      )}

      {/* Commentaire */}
      <textarea
        placeholder={t("fin.rating.comment")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid #f6f0e5",
          fontSize: "16px",
          fontFamily: "inherit",
          resize: "vertical",
          marginBottom: "12px",
          boxSizing: "border-box",
          background: "#09141f",
          color: "#f6f0e5",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: rating === 0 || submitting ? "#f6f0e5" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: rating === 0 || submitting ? "#9fb0c2" : "#fff",
          border: "none",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: rating === 0 || submitting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.3s",
        }}
      >
        {submitting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Star size={15} />}
        {submitting ? t("suivi.review_submitting") : t("suivi.review_submit")}
      </button>
    </div>
  );
}

// ─── Partage de trajet enrichi ────────────────────────────────────────────────
function ShareTrajetButton({ reservation }: { reservation: any }) {
  const t = useT();
  const { lang: locale } = useI18n();
  const [open, setOpen] = useState(false);

  // Arrivée estimée : pickup_datetime + duree_s si dispo, sinon "en cours"
  const getETA = (): string => {
    if (reservation.pickup_datetime && reservation.duree_s) {
      const eta = new Date(new Date(reservation.pickup_datetime).getTime() + durationSecondsToMs(reservation.duree_s));
      const ETA_LOCALE: Record<string, string> = {
        fr: "fr-FR",
        en: "en-GB",
        es: "es-ES",
        pt: "pt-PT",
        it: "it-IT",
        ar: "ar-SA",
      };
      return eta.toLocaleTimeString(ETA_LOCALE[locale] ?? "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris",
      });
    }
    return null as any;
  };

  const eta = getETA();
  const suiviUrl = typeof window !== "undefined" ? window.location.href : "";
  const dest = reservation.destination ?? reservation.arrivee ?? "";

  const buildMessage = (_canal: "sms" | "whatsapp" | "copy"): string => {
    const lines = [
      `${t("suivi.share_msg_route")} ${dest || t("suivi.share_msg_dest_default")}`,
      eta ? `${t("suivi.share_msg_eta")} ${eta}` : null,
      t("suivi.share_msg_follow"),
      suiviUrl,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage("copy"));
      setOpen(false);
      toast.success(t("suivi.share_link_copied"));
    } catch {
      /* noop */
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
          border: "none",
          borderRadius: "8px",
          padding: "8px 12px",
          minHeight: "36px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#fff",
          boxShadow: "0 2px 8px rgba(14,165,233,0.35)",
        }}
      >
        <Share2 size={13} />
        {t("suivi.share")}
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 9998,
          backdropFilter: "blur(3px)",
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "20px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          zIndex: 9999,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          maxWidth: 480,
          maxHeight: "90dvh",
          overflowY: "auto",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 40, height: 4, background: "#f6f0e5", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f6f0e5", marginBottom: 4 }}>{t("suivi.share_title")}</div>
        {/* Aperçu du message */}
        <div
          style={{
            background: "#09141f",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "#e9e2d5",
            lineHeight: 1.6,
            border: "1px solid #f6f0e5",
            whiteSpace: "pre-line",
          }}
        >
          {buildMessage("copy")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(buildMessage("whatsapp"))}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 16px",
              background: "linear-gradient(135deg, #5fd08a 0%, #5fd08a 100%)",
              color: "#fff",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("suivi.share_whatsapp")}
          </a>
          {/* SMS */}
          <a
            href={`sms:?body=${encodeURIComponent(buildMessage("sms"))}`}
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 16px",
              background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
              color: "#fff",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
            }}
          >
            <MessageCircle size={18} />
            {t("suivi.share_sms")}
          </a>
          {/* Copier */}
          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "13px 16px",
              background: "rgba(248,250,252,1)",
              color: "#e9e2d5",
              border: "1px solid #f6f0e5",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {t("suivi.share_copy")}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────
function SuiviPage() {
  const { id } = Route.useParams();
  const { lang: locale } = useI18n();
  const t = useT();
  const u = locale === "en" ? UI.en : UI.fr;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  // ⚠️ IMPORTANT : le vrai id (clé primaire) de la réservation, résolu après
  // chargement. L'URL /suivi/$id peut contenir soit le vrai id, soit le
  // suivi_id (lien public à expiration 30j) — resolvedId est TOUJOURS le
  // vrai id une fois `reservation` chargée, et doit être utilisé pour tout
  // filtre/insert basé sur reservations.id (Realtime, tracking_events...).
  const resolvedId = reservation?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const assignedDriver =
    DRIVERS.find((d) => d.name.toLowerCase() === (reservation?.driver_name ?? "").trim().toLowerCase()) ?? DRIVERS[0];
  const josePhone = assignedDriver?.tel ?? JOSE_PHONE;

  // Filet de sécurité : force la page à démarrer tout en haut au montage.
  // Le vrai bug (scroll auto vers le chat) est corrigé dans AnonChat, mais on
  // garde ça au cas où le navigateur/routeur restaure une position de scroll
  // précédente (retour arrière, bfcache…).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── Lien calendrier (.ics) ──
  // Bug corrigé : generateICS() était appelée directement dans le JSX
  // (href={generateICS(...)}), donc à CHAQUE rendu — soit un nouveau
  // Blob + URL.createObjectURL() à chaque re-render (polling 15s, compteur
  // "stale" toutes les 60s, chat...), sans jamais révoquer les précédentes.
  // Fuite mémoire garantie sur une session longue. On mémoïse l'URL et on
  // révoque l'ancienne à chaque changement / démontage.
  const icsUrl = useMemo(
    () => generateICS(reservation, t),
    [
      reservation?.pickup_datetime,
      reservation?.duree_s,
      reservation?.depart,
      reservation?.destination,
      reservation?.arrivee,
      reservation?.id,
      t,
    ],
  );
  useEffect(() => {
    return () => {
      if (icsUrl && icsUrl !== "#") URL.revokeObjectURL(icsUrl);
    };
  }, [icsUrl]);

  // ── Historique des changements de prix (RPC SECURITY DEFINER, lien public) ──
  const [priceHistory, setPriceHistory] = useState<
    Array<{ id: string; old_price: number | null; new_price: number; motif: string | null; created_at: string }>
  >([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await (supabase as any).rpc("get_price_history_for_suivi", { p_key: id });
        if (!cancelled && !error && Array.isArray(data)) setPriceHistory(data);
      } catch {
        /* silencieux */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, reservation?.prix_estime, reservation?.id]);

  const fetchReservation = useServerFn(getReservationForFinPublic);

  const loadReservation = useCallback(
    async (silent = false, quiet = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const row = await fetchReservation({ data: { key: id } });
        if (!row) {
          setError(t("suivi.not_found"));
        } else {
          const r = row as Reservation;
          // Toasts statut/prix : repris ici (au lieu du payload postgres_changes,
          // qui n'arrive jamais côté client public — voir note plus bas) en
          // comparant à l'état précédent, quelle que soit la source du refresh
          // (broadcast, polling, retour d'onglet, bouton "Rafraîchir").
          setReservation((prev) => {
            if (prev) {
              if (prev.status !== r.status) {
                if (r.status === "accepted") toast.success("✅ " + t("suivi.status.accepted") + " !");
                else if (r.status === "en_route") toast.success("🚕 " + t("suivi.status.en_route") + " !");
                else if (r.status === "arrived") toast.success("📍 " + t("suivi.status.arrived") + " !");
                else if (r.status === "completed")
                  toast.success("🏁 " + t("suivi.status.completed") + " — " + t("suivi.completed_title"));
              }
              if (
                prev.prix_estime != null &&
                r.prix_estime != null &&
                Number(prev.prix_estime) !== Number(r.prix_estime)
              ) {
                toast.success(t("suivi.price_updated"));
              }
            }
            return r;
          });
          isCompletedRef.current = r.status === "completed";
          isCancelledRef.current = r.status === "cancelled";
          if (silent && !quiet) toast.success(t("suivi.status_refreshed"));
          lastUpdateRef.current = Date.now();
          setStaleMinutes(0);
        }
      } catch (e) {
        console.error("Fetch error:", e);
        setError(t("suivi.load_error"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchReservation, id, t],
  );

  useEffect(() => {
    loadReservation(false);
  }, [loadReservation]);

  // ── Recalcul serveur de la durée (à la minute près) pour les anciennes
  // réservations dont `duree_s` avait été calculé sur le trajet le plus long
  // via rocade (inflation). On ne déclenche qu'une fois par id/session.
  const recomputeDuration = useServerFn(recomputeReservationDuration);
  useEffect(() => {
    if (!reservation?.id || !reservation.duree_s) return;
    if (reservation.status === "completed" || reservation.status === "cancelled") return;
    const cacheKey = `dur_rechecked_${reservation.id}`;
    try {
      if (sessionStorage.getItem(cacheKey) === "1") return;
    } catch {
      /* ignore */
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await recomputeDuration({ data: { id: reservation.id } });
        try {
          sessionStorage.setItem(cacheKey, "1");
        } catch {
          /* ignore */
        }
        if (cancelled) return;
        if (res && "changed" in res && res.changed && typeof res.duree_s === "number") {
          setReservation((prev) => (prev ? { ...prev, duree_s: res.duree_s as number } : prev));
        }
      } catch {
        /* silencieux : si Google indisponible on garde la valeur en base */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reservation?.id, reservation?.duree_s, reservation?.status, recomputeDuration]);

  // ── Temps réel via Supabase Broadcast, avec reconnexion + filet de sécurité ──
  // La table `reservations` n'expose aucune policy SELECT à `anon` (PII), donc
  // les événements postgres_changes UPDATE ne sont JAMAIS livrés au client
  // public (RLS bloque anon en lecture) : ce canal-là ne peut pas marcher, on
  // ne l'utilise plus (il servait avant à piloter le bandeau "hors ligne", ce
  // qui le faisait s'afficher en permanence — surtout sur iPhone, où Safari
  // coupe/zombifie les WebSocket en arrière-plan bien plus souvent que sur
  // desktop, donc ce canal cassé passait en erreur beaucoup plus vite et
  // beaucoup plus souvent → page qui semblait "bloquée").
  //
  // Le driver déclenche un broadcast `suivi:<id>` après chaque changement
  // (statut, itinéraire, prix, heure) — on l'écoute ici et on rafraîchit via
  // la RPC SECURITY DEFINER qui contourne RLS. On ajoute :
  //  - une reconnexion automatique si le canal tombe en erreur/timeout,
  //  - un resync (refetch + resubscribe) au retour d'onglet ET à la
  //    restauration bfcache (pageshow), les deux cas où iOS a pu tuer la
  //    connexion silencieusement,
  //  - un polling léger (15s, onglet visible uniquement) en filet de sécurité
  //    si le canal reste mort sans le signaler — même stratégie déjà utilisée
  //    pour le chat plus haut dans ce fichier.
  useEffect(() => {
    if (!resolvedId) return;
    let destroyed = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let channel: any = null;

    function subscribe() {
      if (destroyed) return;
      channel = (supabase as any)
        .channel(`suivi:${resolvedId}`, { config: { broadcast: { self: false } } })
        .on("broadcast", { event: "update" }, () => {
          loadReservation(true, true);
        })
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            setRealtimeOk(true);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setRealtimeOk(false);
            if (!destroyed) {
              retryTimeout = setTimeout(() => {
                try {
                  supabase.removeChannel(channel);
                } catch {}
                subscribe();
              }, 5000);
            }
          }
        });
    }
    subscribe();

    // Throttle commun : pas plus d'un resync toutes les 3s (évite les rafales
    // quand plusieurs événements arrivent d'un coup, ex. verrouillage/déverrouillage
    // rapide de l'iPhone qui déclenche coup sur coup visibilitychange + pageshow).
    const resync = () => {
      if (Date.now() - lastUpdateRef.current < 3000) return;
      loadReservation(true, true);
      // On force aussi une reconnexion du canal : sur iOS, le WebSocket peut
      // rester dans un état "zombie" (ni fermé ni fonctionnel) après une mise
      // en arrière-plan prolongée, sans jamais déclencher CHANNEL_ERROR/CLOSED
      // — un simple refetch de données ne suffit pas à réparer la connexion
      // pour les prochains événements.
      try {
        supabase.removeChannel(channel);
      } catch {}
      subscribe();
    };
    // On n'écoute PAS window.focus : sur mobile, ouvrir le clavier (input chat,
    // sélecteur) déclenche des blur/focus qui rappelaient loadReservation et
    // faisaient "clignoter" les statuts pendant la saisie d'un message.
    const onVisible = () => {
      if (document.hidden) return;
      resync();
    };
    // pageshow avec persisted=true : la page a été restaurée depuis le bfcache
    // de Safari (retour arrière) sans re-exécuter le JS au chargement — sans
    // ça, une réservation ouverte puis mise en arrière-plan longtemps sur
    // iPhone pouvait rester figée sur son dernier état connu.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) resync();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);

    const poll = setInterval(() => {
      if (!document.hidden) loadReservation(true, true);
    }, 15000);

    return () => {
      destroyed = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [resolvedId, loadReservation]);

  // ── Tracking analytics — log l'ouverture du lien de suivi ──
  // Même correctif : on attend resolvedId (vrai id) plutôt que le param URL
  // brut, sinon reservation_id inséré ici peut être le suivi_id au lieu du
  // vrai id — ce qui fausse silencieusement les analytics du dashboard driver.
  useEffect(() => {
    if (!resolvedId) return;
    const src = new URLSearchParams(window.location.search).get("src") ?? "direct";
    void logTrackingEvent({
      data: {
        key: String(resolvedId),
        event_type: "tracking_opened",
        source: src.slice(0, 60),
        user_agent: navigator.userAgent.slice(0, 200),
      },
    }).catch(() => {}); // fire & forget
  }, [resolvedId]);

  // ── Realtime connection state ──
  // realtimeOk/lastUpdateRef sont maintenant pilotés par le canal broadcast
  // (voir plus haut) — le seul canal qui fonctionne réellement côté client
  // public (le postgres_changes direct sur `reservations` est bloqué par RLS
  // et a été retiré : c'est lui qui déclenchait le bandeau "hors ligne" en
  // continu, surtout sur iPhone).
  const [realtimeOk, setRealtimeOk] = useState(true);
  const [staleMinutes, setStaleMinutes] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());

  const isCompletedRef = useRef(false);
  const isCancelledRef = useRef(false);

  // Stale reminder: toutes les 5 min sans update on incrémente le compteur
  // Bug corrigé : isCompletedRef/isCancelledRef n'étaient vérifiées qu'une
  // seule fois, au montage de l'effet — donc toujours `false` puisque la
  // réservation n'est pas encore chargée à ce moment-là. Résultat : le timer
  // continuait de tourner (et de rafraîchir toutes les 8 min) même après la
  // fin de la course. On vérifie maintenant l'état à chaque tick et on
  // s'arrête dès que la course est terminée ou annulée.
  useEffect(() => {
    const staleTimer = setInterval(() => {
      if (isCompletedRef.current || isCancelledRef.current) {
        clearInterval(staleTimer);
        return;
      }
      const elapsed = Math.floor((Date.now() - lastUpdateRef.current) / 60000);
      setStaleMinutes(elapsed);
      // Après 8 min sans update, rafraîchissement silencieux auto
      if (elapsed > 0 && elapsed % 8 === 0) {
        loadReservation(true);
      }
    }, 60000);
    return () => clearInterval(staleTimer);
  }, [loadReservation]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #07111f 0%, #03080d 100%)",
        }}
      >
        <style>{PREMIUM_CSS}</style>
        <Loader2 size={40} style={{ color: "#e0b866", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #07111f 0%, #03080d 100%)",
          padding: "20px",
        }}
      >
        <style>{PREMIUM_CSS}</style>
        <div className="suivi-card" style={{ maxWidth: "400px", padding: "40px 24px", textAlign: "center" }}>
          <AlertTriangle size={48} style={{ color: "#f19a9a", marginBottom: "16px" }} />
          <h1 style={{ fontSize: "13px", fontWeight: 700, color: "#f6f0e5", marginBottom: "8px" }}>
            {error || t("suivi.not_found")}
          </h1>
          <Link
            to="/"
            style={{
              color: "#e0b866",
              textDecoration: "none",
              fontSize: "14px",
              marginTop: "20px",
              display: "inline-block",
            }}
          >
            {t("suivi.back_home_arrow")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Expiration du lien ──
  if (isSuiviExpired(reservation)) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #07111f 0%, #03080d 100%)",
          padding: "20px",
        }}
      >
        <style>{PREMIUM_CSS}</style>
        <div className="suivi-card" style={{ maxWidth: "400px", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔏</div>
          <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#f6f0e5", marginBottom: "8px" }}>
            {t("suivi.expired_title")}
          </h1>
          <p style={{ fontSize: "13px", color: "#9fb0c2", marginBottom: "24px", lineHeight: 1.6 }}>
            {t("suivi.expired_desc").replace("{days}", String(SUIVI_EXPIRY_DAYS))}
          </p>
          <a
            href="/reserver"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
              color: "#fff",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
            }}
          >
            {t("suivi.expired_cta")}
          </a>
        </div>
      </div>
    );
  }

  const isCompleted = reservation.status === "completed";
  const isCancelled = reservation.status === "cancelled";
  const config = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending;

  return (
    <>
      <style>{PREMIUM_CSS}</style>
      <div
        className="suivi-root"
        style={{
          background: "linear-gradient(180deg, #07111f 0%, #03080d 100%)",
          minHeight: "100dvh",
          padding: "16px",
          paddingTop: "calc(16px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#f6f0e5",
          maxWidth: "100vw",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Bouton retour vers site — sticky : toujours visible, même en scrollant */}
        <div
          style={{
            position: "sticky",
            top: "calc(env(safe-area-inset-top, 0px) + 4px)",
            zIndex: 50,
            marginBottom: "12px",
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "rgba(7,17,31,0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              color: "#e0b866",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
            }}
          >
            ← Access Prestige Taxi
          </a>
        </div>

        {/* Bandeau reconnexion */}
        {!realtimeOk && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px 14px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <WifiOff size={14} style={{ color: "#fca5a5", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#fca5a5", fontWeight: 600 }}>{t("suivi.offline_banner")}</span>
          </div>
        )}

        {/* Bandeau page inactive */}
        {staleMinutes >= 5 && !isCompleted && !isCancelled && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px 14px",
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 600 }}>
              {t("suivi.stale_warning")} {staleMinutes} min — {t("suivi.status_up_to_date")}
            </span>
            <button
              onClick={() => loadReservation(true)}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#f59e0b",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              {t("suivi.stale_refresh")}
            </button>
          </div>
        )}

        {/* Push banners removed — push activation handled elsewhere */}

        {/* Header Premium */}
        <div className="suivi-premium" style={{ marginBottom: "24px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(13,26,43,0.96) 0%, rgba(7,17,31,0.92) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              padding: "20px",
              boxShadow: "0 8px 32px rgba(15, 23, 42, 0.1)",
            }}
          >
            {/* Heure de prise en charge — très visible */}
            {reservation.pickup_datetime && !isCompleted && (
              <div
                style={{
                  background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Clock size={18} style={{ color: "#fff", flexShrink: 0 }} />
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {t("suivi.pickup_label")}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                    {new Date(reservation.pickup_datetime).toLocaleString(locale, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Paris",
                    })}
                  </div>
                </div>
                {/* Lien calendrier */}
                <a
                  href={icsUrl}
                  download={`taxi-bordeaux-${reservation.id.slice(-6)}.ics`}
                  title={t("suivi.calendar_add_title")}
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 10px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "11px",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <CalendarPlus size={13} />
                  {t("suivi.add_to_cal")}
                </a>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#f6f0e5", margin: 0, lineHeight: 1.2 }}>
                  {config.icon} {t(config.label)}
                </h1>
                <p style={{ fontSize: "12px", color: "#9fb0c2", margin: "4px 0 0 0" }}>
                  {t("suivi.booking_ref")}
                  {reservation.id.slice(-8).toUpperCase()}
                </p>
                {/* Nom du chauffeur quand acceptée */}
                {["accepted", "en_route", "arrived"].includes(reservation.status) && reservation.driver_name && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 10px",
                      background: "linear-gradient(135deg, #0e2318 0%, #123122 100%)",
                      borderRadius: "20px",
                      border: "1px solid rgba(34,197,94,0.2)",
                      width: "fit-content",
                    }}
                  >
                    <Car size={12} style={{ color: "#5fd08a" }} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#5fd08a" }}>
                      {reservation.driver_name} {t("suivi.driver_label")}
                    </span>
                  </div>
                )}
              </div>
              {/* Bouton partager — enrichi pendant la course */}
              {["en_route", "arrived", "accepted"].includes(reservation.status) ? (
                <ShareTrajetButton reservation={reservation} />
              ) : typeof navigator !== "undefined" && navigator.share ? (
                <button
                  onClick={() => navigator.share({ title: "Suivi de ma course", url: window.location.href })}
                  style={{
                    background: "rgba(148,163,184,0.1)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    minHeight: "36px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#9fb0c2",
                  }}
                >
                  <Share2 size={13} />
                  {t("suivi.share")}
                </button>
              ) : null}
            </div>

            {/* Véhicule — affiché dès accepted */}
            {["accepted", "en_route", "arrived", "completed"].includes(reservation.status) && (
              <div
                className="vehicle-photo-block"
                style={{
                  marginTop: "12px",
                  background: "linear-gradient(135deg, #03080d 0%, #07111f 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                {/* Photo du véhicule */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "clamp(140px, 42vw, 190px)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/vehicle-jose.jpg"
                    alt={t("suivi.car_alt")}
                    onError={(e) => {
                      // Masque le bloc image si le fichier n'existe pas
                      const parent = (e.target as HTMLImageElement).closest(
                        ".vehicle-photo-block",
                      ) as HTMLElement | null;
                      if (parent) parent.style.display = "none";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      // "contain" au lieu de "cover" : la hauteur du cadre était fixe (140px)
                      // alors que la largeur rétrécit sur mobile → "cover" recadrait les
                      // côtés de la voiture. "contain" garde le véhicule entier visible.
                      objectFit: "contain",
                      objectPosition: "center center",
                      display: "block",
                    }}
                  />
                  {/* Overlay gradient bas */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60px",
                      background: "linear-gradient(to top, #07111f, transparent)",
                    }}
                  />
                  {/* Badge Taxi flottant */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    🚕 {t("suivi.your_taxi")}
                  </div>
                </div>

                {/* Infos sous la photo */}
                <div
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                      {VEHICLE_MODEL}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                      {VEHICLE_COLOR}
                    </div>
                  </div>
                  {/* Plaque d'immatriculation */}
                  <div
                    style={{
                      padding: "5px 10px",
                      background: "#fff",
                      borderRadius: "6px",
                      border: "2px solid #003189",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 900,
                        color: "#f6f0e5",
                        letterSpacing: "1px",
                        lineHeight: 1.2,
                      }}
                    >
                      {VEHICLE_PLATE}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <PremiumTimeline status={reservation.status} />
          </div>
        </div>

        {/* Routes Card */}
        <div
          className="suivi-premium suivi-card"
          style={{ marginBottom: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <MapPin size={20} style={{ color: "#e0b866", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9fb0c2",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>🟢</span> {t("suivi.depart_label")}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#f6f0e5", marginTop: "2px" }}>
                {reservation.depart}
              </div>
            </div>
          </div>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, #f6f0e5 50%, transparent 100%)",
            }}
          />
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <MapPin size={20} style={{ color: "#c4b5fd", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9fb0c2",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>🔴</span> {t("suivi.arrivee_label")}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#f6f0e5", marginTop: "2px" }}>
                {reservation.destination || reservation.arrivee || u.tbd}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {reservation.nb_passagers != null && (
            <div className="suivi-premium suivi-card" style={{ padding: "14px", textAlign: "center" }}>
              <Users size={18} style={{ color: "#e0b866", margin: "0 auto 6px", display: "block" }} />
              <div style={{ fontSize: "13px", color: "#9fb0c2", marginBottom: "4px" }}>{t("suivi.passagers")}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f6f0e5" }}>{reservation.nb_passagers}</div>
            </div>
          )}
          <div className="suivi-premium suivi-card" style={{ padding: "14px", textAlign: "center" }}>
            <Package size={18} style={{ color: "#f59e0b", margin: "0 auto 6px", display: "block" }} />
            <div style={{ fontSize: "13px", color: "#9fb0c2", marginBottom: "4px" }}>{t("suivi.bagages")}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#f6f0e5" }}>{reservation.nb_bagages ?? 0}</div>
          </div>
          {reservation.distance_km != null && (
            <div className="suivi-premium suivi-card" style={{ padding: "14px", textAlign: "center" }}>
              <Gauge size={18} style={{ color: "#8b5cf6", margin: "0 auto 6px", display: "block" }} />
              <div style={{ fontSize: "13px", color: "#9fb0c2", marginBottom: "4px" }}>{t("suivi.distance")}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f6f0e5" }}>
                {reservation.distance_km.toFixed(1)} km
              </div>
            </div>
          )}
          {/* Fix #11 — durée estimée si duree_s disponible */}
          {reservation.duree_s != null && (
            <div className="suivi-premium suivi-card" style={{ padding: "14px", textAlign: "center" }}>
              <Clock size={18} style={{ color: "#e0b866", margin: "0 auto 6px", display: "block" }} />
              <div style={{ fontSize: "13px", color: "#9fb0c2", marginBottom: "4px" }}>{t("suivi.duration_label")}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f6f0e5" }}>
                {durationSecondsToMinutes(reservation.duree_s)} {t("suivi.minutes_short")}
              </div>
            </div>
          )}
          {reservation.prix_estime != null &&
            ["accepted", "en_route", "arrived", "completed"].includes(reservation.status) && (
              <div
                className="suivi-premium suivi-card"
                style={{
                  padding: "14px",
                  textAlign: "center",
                  background: "linear-gradient(135deg, #241d0e 0%, #2f2513 100%)",
                }}
              >
                <CreditCard size={18} style={{ color: "#f0c069", margin: "0 auto 6px", display: "block" }} />
                <div style={{ fontSize: "13px", color: "#f0c069", marginBottom: "4px" }}>{t("suivi.tarif_estime")}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0c069" }}>
                  {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
                    reservation.prix_estime,
                  )}
                </div>
              </div>
            )}
          {reservation.mode_paiement && (
            <div className="suivi-premium suivi-card" style={{ padding: "14px", textAlign: "center" }}>
              <CreditCard size={18} style={{ color: "#e0b866", margin: "0 auto 6px", display: "block" }} />
              <div style={{ fontSize: "13px", color: "#9fb0c2", marginBottom: "4px" }}>{t("suivi.paiement")}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f6f0e5" }}>{reservation.mode_paiement}</div>
            </div>
          )}
        </div>

        {/* Historique des changements de prix */}
        {priceHistory.length > 0 &&
          (() => {
            const L: Record<string, { title: string; from: string; to: string; motif: string }> = {
              fr: { title: "Historique des prix", from: "Ancien prix", to: "Nouveau prix", motif: "Motif" },
              en: { title: "Price history", from: "Previous price", to: "New price", motif: "Reason" },
              es: { title: "Historial de precios", from: "Precio anterior", to: "Nuevo precio", motif: "Motivo" },
              it: { title: "Storico prezzi", from: "Prezzo precedente", to: "Nuovo prezzo", motif: "Motivo" },
              pt: { title: "Histórico de preços", from: "Preço anterior", to: "Novo preço", motif: "Motivo" },
              de: { title: "Preisverlauf", from: "Vorheriger Preis", to: "Neuer Preis", motif: "Grund" },
              ar: { title: "سجل الأسعار", from: "السعر السابق", to: "السعر الجديد", motif: "السبب" },
            };
            const s = L[String(locale).slice(0, 2)] ?? L.en;
            const money = (v: number) =>
              new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(v);
            return (
              <div className="suivi-premium suivi-card" style={{ marginBottom: "16px", padding: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#f0c069",
                    marginBottom: 10,
                  }}
                >
                  <CreditCard size={16} /> {s.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {priceHistory.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        border: "1px solid #2f2513",
                        background: "#1c1710",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#a16207", marginBottom: 4 }}>
                        {new Date(h.created_at).toLocaleString(locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Europe/Paris",
                        })}
                      </div>
                      <div style={{ fontSize: 13, color: "#f6f0e5", fontWeight: 600 }}>
                        {h.old_price != null && (
                          <span style={{ color: "#9fb0c2", textDecoration: "line-through", marginRight: 8 }}>
                            {money(Number(h.old_price))}
                          </span>
                        )}
                        <span style={{ color: "#f0c069", fontWeight: 800 }}>{money(Number(h.new_price))}</span>
                      </div>
                      {h.motif && (
                        <div style={{ fontSize: 12, color: "#78350f", marginTop: 4, whiteSpace: "pre-wrap" }}>
                          {s.motif} : {h.motif}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        {/* Contact Jose */}
        {!isCompleted && (
          <div className="suivi-premium suivi-card" style={{ marginBottom: "16px", padding: "16px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#e0b866",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "12px",
              }}
            >
              📞 {t("suivi.contact_title")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a
                href={`tel:${josePhone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
                  color: "#fff",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "none",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
                }}
              >
                <Phone size={16} />
                <span style={{ flex: 1 }}>{`${t("suivi.call_jose").replace(/Patricia/g, assignedDriver.name)}`}</span>
                <span style={{ fontSize: "12px", opacity: 0.8, fontWeight: 400 }}>
                  {josePhone.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}
                </span>
              </a>
              <a
                href={`https://wa.me/${josePhone.replace(/^0/, "33")}?text=${encodeURIComponent(`Bonjour ${assignedDriver.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  background: "linear-gradient(135deg, #5fd08a 0%, #5fd08a 100%)",
                  color: "#fff",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "none",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                }}
              >
                <MessageCircle size={16} />
                {t("suivi.whatsapp_jose").replace(/Patricia/g, assignedDriver.name)}
              </a>
            </div>
          </div>
        )}

        {/* Chat */}
        {!isCompleted && (
          <ChatSection suiviKey={id} reservationId={reservation.id} driverName={assignedDriver.name} t={t} />
        )}

        {/* Bloc Course terminée — Facture + Avis */}
        {isCompleted && (
          <>
            <InvoiceBlock reservation={reservation} locale={locale} t={t} />
            <ReviewBlock
              reservationId={reservation.id}
              authorName={reservation.client_name ?? reservation.nom ?? "Client"}
              t={t}
            />
            {/* Actions post-course */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {/* 🔁 Rebooker le même trajet */}
              <a
                href={`/reserver?depart=${encodeURIComponent(reservation.depart ?? "")}&destination=${encodeURIComponent(reservation.destination ?? reservation.arrivee ?? "")}&passagers=${reservation.nb_passagers ?? 1}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 16px",
                  background: "linear-gradient(135deg, #e0b866 0%, #c99b4a 100%)",
                  color: "#fff",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
                }}
              >
                🔁 {t("suivi.rebook_same").replace("🔁 ", "")}
              </a>
              {/* 🗓️ Trajet récurrent */}
              <button
                onClick={() => setShowRecurring(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 16px",
                  background: "linear-gradient(135deg, #c4b5fd 0%, #6d28d9 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                }}
              >
                <CalendarPlus size={16} /> {t("suivi.rebook_weekly")}
              </button>
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 16px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#9fb0c2",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "1px solid rgba(148,163,184,0.15)",
                }}
              >
                {t("suivi.back_home")}
              </Link>
            </div>
            {/* Modal récurrent */}
            {showRecurring && <RecurringModal reservation={reservation} onClose={() => setShowRecurring(false)} />}
          </>
        )}

        {/* Bouton Rafraîchir — masqué si course terminée ou annulée */}
        {!isCompleted && !isCancelled && (
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => loadReservation(true)}
              disabled={refreshing}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: refreshing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                color: refreshing ? "#9fb0c2" : "#9fb0c2",
                border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: refreshing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s",
                backdropFilter: "blur(10px)",
              }}
            >
              {refreshing ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <span style={{ fontSize: "16px" }}>🔄</span>
              )}
              {refreshing ? t("suivi.refreshing") : t("suivi.refresh")}
            </button>
          </div>
        )}

        {/* Footer — masqué si completed ou cancelled (boutons dans le bloc terminée) */}
        {!isCompleted && !isCancelled && (
          <div style={{ textAlign: "center" }}>
            <Link
              to="/"
              style={{
                fontSize: "12px",
                color: "#9fb0c2",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
            >
              {t("suivi.back_home_arrow")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
