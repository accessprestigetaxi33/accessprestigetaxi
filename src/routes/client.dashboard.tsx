import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Phone, Eye, Car, MessageCircle, History, User, ChevronRight } from "lucide-react";
import { ClientBottomNav } from "@/components/ClientBottomNav";
import { ClientPushOptInCard } from "@/components/ClientPushOptInCard";

import { BrandLoader } from "@/components/BrandLoader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getClientSession, clearClientSession } from "@/lib/client-session";
import type { ClientSession } from "@/lib/client-auth.functions";
import { listClientReservations, type ClientReservation } from "@/lib/client-reservations.functions";
import { useI18n, useT } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import logo from "@/assets/tcb-logo-badge.png";
import { supabase } from "@/integrations/supabase/client";

const ACTIVE_STATUSES = new Set(["nouvelle", "pending", "accepted", "en_route", "arrived"]);

const STATUS_META: Record<string, { label: { fr: string; en: string }; bg: string; fg: string }> = {
  nouvelle: { label: { fr: "En attente", en: "Pending" }, bg: "rgba(234,179,8,0.15)", fg: "#facc15" },
  pending: { label: { fr: "En attente", en: "Pending" }, bg: "rgba(234,179,8,0.15)", fg: "#facc15" },
  accepted: { label: { fr: "Confirmée", en: "Confirmed" }, bg: "rgba(34,197,94,0.15)", fg: "#4ade80" },
  en_route: { label: { fr: "En route", en: "On the way" }, bg: "rgba(59,130,246,0.18)", fg: "#60a5fa" },
  arrived: { label: { fr: "Arrivé", en: "Arrived" }, bg: "rgba(99,102,241,0.18)", fg: "#a5b4fc" },
  completed: { label: { fr: "Terminée", en: "Completed" }, bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
  cancelled: { label: { fr: "Annulée", en: "Cancelled" }, bg: "rgba(239,68,68,0.18)", fg: "#fca5a5" },
  refused: { label: { fr: "Refusée", en: "Refused" }, bg: "rgba(239,68,68,0.18)", fg: "#fca5a5" },
};

const COPY = {
  fr: {
    eyebrow: "Espace client",
    hello: (n: string) => `Bonjour ${n} 👋`,
    activeRide: "Course en cours",
    track: "Suivre en direct",
    details: "Détails",
    book: "Réserver une course",
    call: (n: string, p: string) => `Appeler ${n} — ${p}`,
    trips: "Mes trajets actifs",
    history: "Historique des courses",
    chat: "Écrire à mon chauffeur",
    profile: "Mon profil",
    backSite: "← Site",
    you: "vous",
  },
  en: {
    eyebrow: "Client area",
    hello: (n: string) => `Hello ${n} 👋`,
    activeRide: "Ride in progress",
    track: "Track live",
    details: "Details",
    book: "Book a ride",
    call: (n: string, p: string) => `Call ${n} — ${p}`,
    trips: "My active rides",
    history: "Ride history",
    chat: "Message my driver",
    profile: "My profile",
    backSite: "← Website",
    you: "there",
  },
} as const;

function fmtDate(iso: string, lang: string = "fr") {
  try {
    return new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });
  } catch {
    return iso;
  }
}

const css = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; touch-action: manipulation; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; overscroll-behavior-y: contain;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .cd-root { position: fixed; inset: 0; max-width: 640px; margin: 0 auto;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, #0a0a0a 0%, #111827 100%); }
  .cd-header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; background: rgba(10,10,10,0.92);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.06); }
  .cd-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 20px 16px 0; }
`;

export const Route = createFileRoute("/client/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon espace client — Access Prestige Taxi" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0f172a" },
    ],
  }),
  component: ClientDashboard,
});

function ClientDashboard() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();
  const c = lang === "en" ? COPY.en : COPY.fr;
  const [session, setSession] = useState<ClientSession | null>(null);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<ClientReservation[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getClientSession();
    if (!s) {
      navigate({ to: "/client/login" });
      return;
    }
    setSession(s);
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    if (!ready || !session) return;
    setLoading(true);
    listClientReservations({ data: { token: session.token } })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready, session]);

  // Realtime refresh
  useEffect(() => {
    if (!session || !rows || rows.length === 0) return;
    const ids = rows.map((r) => r.id);
    const channel = supabase
      .channel("cd-home-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reservations", filter: `id=in.(${ids.join(",")})` },
        () => {
          if (!session) return;
          listClientReservations({ data: { token: session.token } })
            .then(setRows)
            .catch(() => {});
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, rows]);

  const greeting = useMemo(() => session?.name?.split(" ")[0] || c.you, [session]);
  const activeRide = rows?.find((r) => ACTIVE_STATUSES.has(r.status));
  const nextRide = rows?.find((r) => ["pending", "accepted"].includes(r.status));

  if (!ready || !session) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cd-root">
        {/* Header */}
        <div className="cd-header">
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="Access Prestige Taxi" style={{ height: 36, borderRadius: 6 }} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LanguageSwitcher />
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {c.backSite}
            </a>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="cd-scroll">
          {/* Halo décoratif */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 300,
              borderRadius: "50%",
              pointerEvents: "none",
              background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Salutation */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <p
              style={{
                color: "#E8C96D",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: "0 0 6px",
              }}
            >
              {c.eyebrow}
            </p>
            <h1
              style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 20px", fontFamily: "'Syne', serif" }}
            >
              {c.hello(greeting)}
            </h1>

            {/* Carte présentation */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 16px",
                marginBottom: 16,
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.75, margin: "0 0 10px" }}>
                {t("client.dashboard.welcome_intro")} <strong style={{ color: "#E8C96D" }}>Access Prestige Taxi</strong>.
                {" "}{t("client.dashboard.welcome_centralized")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {[
                  { icon: "🚕", title: t("client.trajets.title"), desc: t("client.dashboard.feat.trips_desc") },
                  { icon: "📋", title: t("client.dashboard.feat.history_title"), desc: t("client.dashboard.feat.history_desc") },
                  { icon: "💬", title: t("client.dashboard.feat.chat_title"), desc: t("client.dashboard.feat.chat_desc") },
                  { icon: "👤", title: t("client.profil.title"), desc: t("client.dashboard.feat.profile_desc") },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>{item.icon}</span>
                    <div>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{item.title}</span>
                      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}> — {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ClientPushOptInCard clientAccountId={session.id} />

          {/* Course active */}
          {activeRide && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                {c.activeRide}
              </p>
              <div
                style={{
                  background: "rgba(232,201,109,0.07)",
                  border: "1px solid rgba(232,201,109,0.22)",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 10px",
                      borderRadius: 20,
                      background: STATUS_META[activeRide.status]?.bg,
                      color: STATUS_META[activeRide.status]?.fg,
                    }}
                  >
                    {STATUS_META[activeRide.status]?.label[lang === "en" ? "en" : "fr"] || activeRide.status}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    {fmtDate(activeRide.pickup_datetime, lang)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}>
                  {activeRide.depart}
                  <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 6px" }}>→</span>
                  {activeRide.arrivee || activeRide.destination}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {activeRide.suivi_id && (
                    <Link
                      to="/suivi/$id"
                      params={{ id: String(activeRide.suivi_id) }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#E8C96D",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "rgba(232,201,109,0.12)",
                        border: "1px solid rgba(232,201,109,0.25)",
                      }}
                    >
                      <Eye style={{ width: 13, height: 13 }} /> {c.track}
                    </Link>
                  )}
                  <Link
                    to="/client/trajets"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {c.details}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <Link
              to="/reserver"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C96D 100%)",
                color: "#000",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <Plus style={{ width: 16, height: 16 }} /> {c.book}
            </Link>
            <a
              href={`tel:${DRIVERS[0].tel}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <Phone style={{ width: 16, height: 16 }} /> {c.call(DRIVERS[0].name, DRIVERS[0].display)}
            </a>
          </div>

          {/* Raccourcis onglets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {[
              { to: "/client/trajets", icon: <Car style={{ width: 16, height: 16 }} />, label: c.trips },
              {
                to: "/client/historique",
                icon: <History style={{ width: 16, height: 16 }} />,
                label: c.history,
              },
              { to: "/client/chat", icon: <MessageCircle style={{ width: 16, height: 16 }} />, label: c.chat },
              { to: "/client/profil", icon: <User style={{ width: 16, height: 16 }} />, label: c.profile },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.8)" }}>
                  <span style={{ color: "#E8C96D" }}>{item.icon}</span>
                  {item.label}
                </div>
                <ChevronRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.25)" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <ClientBottomNav />
      </div>
    </>
  );
}
