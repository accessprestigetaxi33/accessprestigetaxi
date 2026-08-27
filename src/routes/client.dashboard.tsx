import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Phone,
  Eye,
  Car,
  MessageCircle,
  History,
  User,
  ChevronRight,
  CalendarDays,
  FileText,
  MapPin,
  Headphones,
  LogOut,
  Home,
} from "lucide-react";
import { ClientBottomNav } from "@/components/ClientBottomNav";
import { ClientPushOptInCard } from "@/components/ClientPushOptInCard";

import { BrandLoader } from "@/components/BrandLoader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getClientSession, clearClientSession } from "@/lib/client-session";
import type { ClientSession } from "@/lib/client-auth.functions";
import { listClientReservations, type ClientReservation } from "@/lib/client-reservations.functions";
import { useI18n, useT } from "@/i18n/I18nProvider";
import { DRIVERS } from "@/data/drivers";
import logo from "@/assets/tcb-logo-badge.webp";
import { supabase } from "@/integrations/supabase/client";
import photoVanReal from "@/assets/apt-van-real.webp.asset.json";

const ACTIVE_STATUSES = new Set(["nouvelle", "pending", "accepted", "en_route", "arrived"]);

const STATUS_META: Record<string, { label: { fr: string; en: string }; bg: string; fg: string }> = {
  nouvelle: {
    label: { fr: "En attente", en: "Pending" },
    bg: "rgba(234,179,8,0.15)",
    fg: "#facc15",
  },
  pending: {
    label: { fr: "En attente", en: "Pending" },
    bg: "rgba(234,179,8,0.15)",
    fg: "#facc15",
  },
  accepted: {
    label: { fr: "Confirmée", en: "Confirmed" },
    bg: "rgba(34,197,94,0.15)",
    fg: "#4ade80",
  },
  en_route: {
    label: { fr: "En route", en: "On the way" },
    bg: "rgba(59,130,246,0.18)",
    fg: "#60a5fa",
  },
  arrived: { label: { fr: "Arrivé", en: "Arrived" }, bg: "rgba(99,102,241,0.18)", fg: "#a5b4fc" },
  completed: {
    label: { fr: "Terminée", en: "Completed" },
    bg: "rgba(148,163,184,0.18)",
    fg: "#cbd5e1",
  },
  cancelled: {
    label: { fr: "Annulée", en: "Cancelled" },
    bg: "rgba(239,68,68,0.18)",
    fg: "#fca5a5",
  },
  refused: { label: { fr: "Refusée", en: "Refused" }, bg: "rgba(239,68,68,0.18)", fg: "#fca5a5" },
};

const COPY = {
  fr: {
    eyebrow: "Espace client",
    hello: (n: string) => `Bonjour ${n} 👋`,
    activeRide: "Course en cours",
    nextRide: "Prochaine course",
    track: "Suivre en direct",
    details: "Détails",
    book: "Réserver une course",
    call: (n: string, p: string) => `Appeler ${n} — ${p}`,
    trips: "Mes trajets actifs",
    history: "Historique des courses",
    chat: "Écrire à mon chauffeur",
    profile: "Mon profil",
    backSite: "← Site",
    logout: "Déconnexion",
    you: "vous",
  },
  en: {
    eyebrow: "Client area",
    hello: (n: string) => `Hello ${n} 👋`,
    activeRide: "Ride in progress",
    nextRide: "Next ride",
    track: "Track live",
    details: "Details",
    book: "Book a ride",
    call: (n: string, p: string) => `Call ${n} — ${p}`,
    trips: "My active rides",
    history: "Ride history",
    chat: "Message my driver",
    profile: "My profile",
    backSite: "← Website",
    logout: "Log out",
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
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; min-height: 100%; background: #03070d; }
  body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #f6f0e5; }
  a, button { -webkit-tap-highlight-color: transparent; }
  .cd-root { min-height: 100dvh; display: grid; grid-template-rows: 72px 1fr; background: radial-gradient(circle at 55% 0%, rgba(201,168,76,.08), transparent 34%), #03070d; }
  .cd-header { display:flex; align-items:center; justify-content:space-between; padding: 0 28px; border-bottom:1px solid rgba(224,184,102,.65); background:#050a10; }
  .cd-brand { display:flex; align-items:center; gap:12px; min-width:0; }
  .cd-brand img { width:150px; height:auto; max-height:58px; object-fit:contain; }
  .cd-header-actions { display:flex; align-items:center; gap:12px; }
  .cd-phone { color:#f6f0e5; font-size:13px; white-space:nowrap; }
  .cd-outline-btn { display:inline-flex; align-items:center; gap:7px; min-height:38px; padding:8px 13px; border:1px solid #c99b4a; border-radius:8px; color:#f0c069; background:transparent; font-size:12px; font-weight:700; text-decoration:none; cursor:pointer; }
  .cd-layout { min-height:0; display:grid; grid-template-columns: 168px minmax(0,1fr); }
  .cd-sidebar { border-right:1px solid rgba(224,184,102,.55); background:linear-gradient(180deg,#07111b 0%,#03070d 100%); padding:22px 14px; display:flex; flex-direction:column; gap:8px; }
  .cd-side-link { display:flex; align-items:center; gap:10px; min-height:44px; padding:9px 11px; border:1px solid transparent; border-radius:8px; color:rgba(246,240,229,.82); text-decoration:none; font-size:12px; font-weight:600; }
  .cd-side-link:hover, .cd-side-link.active { border-color:#c99b4a; color:#f0c069; background:rgba(201,155,74,.06); }
  .cd-main { min-width:0; overflow:auto; padding:28px; }
  .cd-main-inner { max-width:1180px; margin:0 auto; }
  .cd-hero { position:relative; min-height:235px; overflow:hidden; border:1px solid #c99b4a; border-radius:12px; background:#07111b; }
  .cd-hero::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,rgba(3,8,14,.98) 0%,rgba(3,8,14,.88) 36%,rgba(3,8,14,.18) 74%,rgba(3,8,14,.35) 100%); pointer-events:none; }
  .cd-hero img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 58%; opacity:.82; }
  .cd-hero-content { position:relative; z-index:1; max-width:620px; padding:34px 28px; }
  .cd-eyebrow { color:#e0b866; font-size:11px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; margin:0 0 8px; }
  .cd-title { font-family:'Playfair Display',Georgia,serif; font-size:25px; margin:0 0 10px; color:#fff; }
  .cd-lead { color:rgba(246,240,229,.76); font-size:12px; line-height:1.7; max-width:450px; margin:0 0 18px; }
  .cd-gold-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:40px; padding:9px 16px; border:1px solid #c99b4a; border-radius:8px; background:#e0b866; color:#090b0d; text-decoration:none; font-size:12px; font-weight:800; }
  .cd-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:9px; margin-top:10px; }
  .cd-tile { min-height:102px; border:1px solid #c99b4a; border-radius:9px; background:linear-gradient(180deg,#08131e,#050a10); padding:13px; color:#fff; text-decoration:none; }
  .cd-tile-icon { color:#e0b866; margin-bottom:8px; }
  .cd-tile-title { font-size:12px; font-weight:800; margin-bottom:5px; }
  .cd-tile-text { font-size:10.5px; line-height:1.45; color:rgba(246,240,229,.62); }
  .cd-section { margin-top:22px; }
  .cd-section-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:9px; }
  .cd-section-title { font-family:'Playfair Display',Georgia,serif; font-size:17px; margin:0; color:#f6f0e5; }
  .cd-view { color:#e0b866; font-size:11px; text-decoration:none; }
  .cd-ride { display:grid; grid-template-columns:92px minmax(0,1.35fr) minmax(120px,.8fr) minmax(100px,.65fr) 22px; gap:14px; align-items:center; padding:14px 12px; border:1px solid #c99b4a; border-radius:9px; background:#06101a; margin-bottom:8px; }
  .cd-date { border-right:1px solid rgba(224,184,102,.25); padding-right:12px; }
  .cd-date strong { display:block; font-size:12px; color:#fff; }
  .cd-date span { display:block; font-size:10px; color:#e0b866; margin-top:3px; }
  .cd-route { font-size:11px; line-height:1.9; }
  .cd-route div:first-child::before, .cd-route div:last-child::before { content:""; display:inline-block; width:6px; height:6px; border-radius:50%; border:1px solid #e0b866; margin-right:7px; vertical-align:1px; }
  .cd-meta { font-size:10px; color:rgba(246,240,229,.62); line-height:1.5; }
  .cd-meta strong { display:block; color:#fff; font-size:11px; }
  .cd-status { font-size:10px; border:1px solid rgba(74,222,128,.55); color:#6ee7a0; border-radius:999px; padding:5px 8px; text-align:center; white-space:nowrap; }
  .cd-price { font-size:12px; color:#f0c069; font-weight:800; }
  .cd-help { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; border:1px solid #c99b4a; border-radius:9px; padding:12px; background:#06101a; }
  .cd-help-intro { display:flex; align-items:center; gap:10px; }
  .cd-help-intro strong { display:block; font-size:11px; }
  .cd-help-intro span { display:block; font-size:10px; color:rgba(246,240,229,.58); margin-top:2px; }
  .cd-help-btn { display:flex; align-items:center; justify-content:center; gap:7px; min-height:42px; border:1px solid #c99b4a; border-radius:8px; color:#e0b866; text-decoration:none; font-size:11px; font-weight:800; background:#050a10; }
  .cd-empty { padding:22px; border:1px dashed rgba(201,155,74,.5); border-radius:9px; color:rgba(246,240,229,.55); font-size:11px; text-align:center; }
  @media (max-width: 900px) {
    .cd-root { grid-template-rows:64px 1fr; }
    .cd-header { padding:0 14px; }
    .cd-brand img { width:125px; }
    .cd-phone { display:none; }
    .cd-layout { grid-template-columns:1fr; }
    .cd-sidebar { display:none; }
    .cd-main { padding:14px 12px 88px; }
    .cd-hero { min-height:290px; }
    .cd-hero-content { padding:28px 20px; max-width:72%; }
    .cd-grid4 { grid-template-columns:repeat(2,1fr); }
    .cd-ride { grid-template-columns:70px 1fr; gap:10px; }
    .cd-date { grid-row:span 2; }
    .cd-meta, .cd-status, .cd-price { grid-column:2; }
    .cd-help { grid-template-columns:1fr; }
  }
`;

export const Route = createFileRoute("/client/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon espace client — Access Prestige Taxi" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#000000" },
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

  // Rafraîchissement live — SANS postgres_changes.
  // Lecture de `reservations` volontairement fermée côté RLS (aucune policy
  // SELECT pour anon / authenticated) : un abonnement postgres_changes ne
  // recevrait jamais de ligne. On écoute le broadcast `suivi:<id>` du chauffeur.
  //
  // On ne dépend plus de `rows` (référence qui change à chaque reload) mais
  // de la liste d'ids sous forme de string stable, sinon les canaux étaient
  // détruits/recréés en boucle. Sur iPhone, Safari coupe le WebSocket quand
  // l'app passe en arrière-plan (changement d'onglet, verrouillage, etc.) ;
  // sans réabonnement au retour au premier plan, la page restait figée avec
  // des données périmées, ce qui donnait l'impression d'un blocage.
  const rideIdsKey = useMemo(() => (rows ?? []).map((r) => r.id).join(","), [rows]);

  useEffect(() => {
    if (!session || !rideIdsKey) return;
    const token = session.token;
    const ids = rideIdsKey.split(",");

    const reload = () => {
      listClientReservations({ data: { token } })
        .then(setRows)
        .catch(() => {});
    };

    const subscribe = () =>
      ids.map((id) => {
        const ch = (supabase as any).channel(`suivi:${id}`, {
          config: { broadcast: { self: false } },
        });
        ch.on("broadcast", { event: "update" }, reload).subscribe();
        return ch;
      });

    let channels = subscribe();

    // Au retour au premier plan (iPhone verrouillé / app en arrière-plan),
    // on force un rechargement et on ré-ouvre les canaux au cas où le
    // WebSocket ait été fermé silencieusement par iOS.
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      reload();
      channels.forEach((ch) => supabase.removeChannel(ch));
      channels = subscribe();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [session, rideIdsKey]);

  const greeting = useMemo(() => session?.name?.split(" ")[0] || c.you, [session]);
  const activeRide = rows?.find((r) => ACTIVE_STATUSES.has(r.status));
  const nextRide = rows?.find((r) => ["pending", "accepted"].includes(r.status) && r.id !== activeRide?.id);

  const handleLogout = () => {
    clearClientSession();
    navigate({ to: "/client/login" });
  };

  if (!ready || !session) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="cd-root" style={{ alignItems: "center", justifyContent: "center" }}>
          <BrandLoader />
        </div>
      </>
    );
  }

  const upcoming = (rows ?? []).filter((r) => ACTIVE_STATUSES.has(r.status)).slice(0, 3);
  const recent = (rows ?? []).filter((r) => !ACTIVE_STATUSES.has(r.status)).slice(0, 3);
  const fmtShort = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Paris",
      });
    } catch {
      return iso;
    }
  };
  const fmtTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris",
      });
    } catch {
      return "—";
    }
  };
  const renderRide = (ride: ClientReservation, past = false) => {
    const x = ride as any;
    const status = STATUS_META[ride.status];
    const price = x.prix_estime ?? x.prix_final ?? x.total_ttc;
    return (
      <div className="cd-ride" key={ride.id}>
        <div className="cd-date">
          <strong>{fmtShort(ride.pickup_datetime).split(" ")[0]}</strong>
          <span>{fmtTime(ride.pickup_datetime)}</span>
        </div>
        <div className="cd-route">
          <div>{ride.depart}</div>
          <div>{ride.arrivee || ride.destination || "—"}</div>
        </div>
        <div className="cd-meta">
          <strong>{x.driver_name || (lang === "en" ? "Driver" : "Chauffeur")}</strong>
          {x.vehicle_model || x.vehicule || "Véhicule premium"}
        </div>
        <div>
          {past ? (
            <>
              <div
                className="cd-status"
                style={{ borderColor: status?.fg || "#c99b4a", color: status?.fg || "#e0b866" }}
              >
                {status?.label[lang === "en" ? "en" : "fr"] || ride.status}
              </div>
              {price != null && (
                <div className="cd-price" style={{ marginTop: 5 }}>
                  {new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(Number(price))}
                </div>
              )}
            </>
          ) : (
            <>
              {status && (
                <div className="cd-status" style={{ borderColor: status.fg, color: status.fg }}>
                  {status.label[lang === "en" ? "en" : "fr"]}
                </div>
              )}
            </>
          )}
        </div>
        {ride.suivi_id ? (
          <Link
            to="/suivi/$id"
            params={{ id: String(ride.suivi_id) }}
            style={{ color: "#e0b866", textDecoration: "none" }}
          >
            <ChevronRight size={17} />
          </Link>
        ) : (
          <span />
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cd-root">
        <header className="cd-header">
          <div className="cd-brand">
            <a href="/">
              <img src={logo} alt="Access Prestige Taxi" />
            </a>
          </div>
          <div className="cd-header-actions">
            <span className="cd-phone">☎ 06 03 44 48 63</span>
            <LanguageSwitcher />
            <button className="cd-outline-btn" type="button" onClick={handleLogout}>
              <LogOut size={14} />
              {c.logout}
            </button>
          </div>
        </header>
        <div className="cd-layout">
          <aside className="cd-sidebar">
            <Link className="cd-side-link active" to="/client/dashboard">
              <Home size={16} />
              {lang === "en" ? "Dashboard" : "Tableau de bord"}
            </Link>
            <Link className="cd-side-link" to="/client/trajets">
              <CalendarDays size={16} />
              {lang === "en" ? "My bookings" : "Mes réservations"}
            </Link>
            <Link className="cd-side-link" to="/client/historique">
              <FileText size={16} />
              {lang === "en" ? "My invoices" : "Mes factures"}
            </Link>
            <Link className="cd-side-link" to="/client/trajets">
              <MapPin size={16} />
              {lang === "en" ? "My addresses" : "Mes adresses"}
            </Link>
            <Link className="cd-side-link" to="/client/profil">
              <User size={16} />
              {c.profile}
            </Link>
            <Link className="cd-side-link" to="/client/chat">
              <Headphones size={16} />
              {lang === "en" ? "Help & Contact" : "Aide & Contact"}
            </Link>
          </aside>
          <main className="cd-main">
            <div className="cd-main-inner">
              <section className="cd-hero">
                <img src={photoVanReal.url} alt="Mercedes van Access Prestige Taxi" />
                <div className="cd-hero-content">
                  <p className="cd-eyebrow">{c.eyebrow}</p>
                  <h1 className="cd-title">{c.hello(greeting)}</h1>
                  <p className="cd-lead">
                    {t("client.dashboard.welcome_intro")} <strong>Access Prestige Taxi</strong>.{" "}
                    {t("client.dashboard.welcome_centralized")}
                  </p>
                  <Link className="cd-gold-btn" to="/reserver">
                    <Plus size={17} />
                    {c.book}
                  </Link>
                </div>
              </section>
              <div className="cd-grid4">
                <Link className="cd-tile" to="/client/trajets">
                  <div className="cd-tile-icon">
                    <CalendarDays size={20} />
                  </div>
                  <div className="cd-tile-title">{lang === "en" ? "My bookings" : "Mes réservations"}</div>
                  <div className="cd-tile-text">
                    {lang === "en"
                      ? "View and manage your upcoming rides."
                      : "Consultez et gérez vos prochaines courses."}
                  </div>
                </Link>
                <Link className="cd-tile" to="/client/historique">
                  <div className="cd-tile-icon">
                    <FileText size={20} />
                  </div>
                  <div className="cd-tile-title">{lang === "en" ? "My invoices" : "Mes factures"}</div>
                  <div className="cd-tile-text">
                    {lang === "en"
                      ? "Find your trip receipts and documents."
                      : "Retrouvez vos factures et justificatifs."}
                  </div>
                </Link>
                <Link className="cd-tile" to="/client/trajets">
                  <div className="cd-tile-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="cd-tile-title">{lang === "en" ? "My addresses" : "Mes adresses"}</div>
                  <div className="cd-tile-text">
                    {lang === "en"
                      ? "Manage your pickup and favourite addresses."
                      : "Gérez vos adresses de prise en charge."}
                  </div>
                </Link>
                <Link className="cd-tile" to="/client/profil">
                  <div className="cd-tile-icon">
                    <User size={20} />
                  </div>
                  <div className="cd-tile-title">{c.profile}</div>
                  <div className="cd-tile-text">
                    {lang === "en"
                      ? "Your personal information and preferences."
                      : "Vos informations personnelles et préférences."}
                  </div>
                </Link>
              </div>

              <section className="cd-section">
                <div className="cd-section-head">
                  <h2 className="cd-section-title">{lang === "en" ? "My upcoming rides" : "Mes prochaines courses"}</h2>
                  <Link className="cd-view" to="/client/trajets">
                    {lang === "en" ? "View all" : "Voir toutes"} ›
                  </Link>
                </div>
                {upcoming.length ? (
                  upcoming.map((r) => renderRide(r))
                ) : (
                  <div className="cd-empty">
                    {lang === "en" ? "No upcoming ride." : "Aucune prochaine course pour le moment."}
                  </div>
                )}
              </section>

              <section className="cd-section">
                <div className="cd-section-head">
                  <h2 className="cd-section-title">{lang === "en" ? "Recent history" : "Historique récent"}</h2>
                  <Link className="cd-view" to="/client/historique">
                    {lang === "en" ? "View history" : "Voir tout l'historique"} ›
                  </Link>
                </div>
                {recent.length ? (
                  recent.map((r) => renderRide(r, true))
                ) : (
                  <div className="cd-empty">
                    {lang === "en"
                      ? "Your completed rides will appear here."
                      : "Vos courses terminées apparaîtront ici."}
                  </div>
                )}
              </section>

              <section className="cd-section cd-help">
                <div className="cd-help-intro">
                  <Headphones size={25} color="#e0b866" />
                  <div>
                    <strong>{lang === "en" ? "Need help?" : "Besoin d'aide ?"}</strong>
                    <span>
                      {lang === "en" ? "Our team is available 7/7." : "Notre équipe est à votre écoute 7j/7."}
                    </span>
                  </div>
                </div>
                <a className="cd-help-btn" href={`tel:${DRIVERS[0].tel}`}>
                  <Phone size={16} />
                  {lang === "en" ? `Call ${DRIVERS[0].name}` : `Appeler ${DRIVERS[0].name}`}
                  <span>{DRIVERS[0].display}</span>
                </a>
                <a className="cd-help-btn" href={`tel:${DRIVERS[1]?.tel || DRIVERS[0].tel}`}>
                  <Phone size={16} />
                  {lang === "en"
                    ? `Call ${DRIVERS[1]?.name || "Patricia"}`
                    : `Appeler ${DRIVERS[1]?.name || "Patricia"}`}
                  <span>{DRIVERS[1]?.display || "06 50 26 00 15"}</span>
                </a>
              </section>
            </div>
          </main>
        </div>
        <ClientBottomNav />
      </div>
    </>
  );
}
