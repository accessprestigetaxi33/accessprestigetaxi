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
.cd-root{min-height:100dvh;background:#030a13;color:#f5f1e8;font-family:Inter,system-ui,sans-serif;padding:0 0 82px}.cd-header{display:none}.cd-layout{display:block}.cd-sidebar{display:none}.cd-main{padding:12px}.cd-main-inner{max-width:390px;margin:0 auto}.cd-hero{display:none}.cd-grid4{display:none}.cd-section{margin-top:18px}.cd-section-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 8px}.cd-section-title{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f0e6d0}.cd-view{font-size:10px;color:#e6b95a;text-decoration:none}.cd-ride{display:grid;grid-template-columns:1fr auto;gap:8px;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px;background:linear-gradient(145deg,#111b26,#07101a);margin-bottom:8px}.cd-date{font-size:10px;color:#e7bd5d}.cd-route{font-size:11px;line-height:1.8}.cd-meta{font-size:10px;color:rgba(255,255,255,.6)}.cd-status{font-size:9px;border:1px solid rgba(110,231,160,.5);border-radius:6px;padding:4px 6px}.cd-price{font-size:11px;color:#e7bd5d}.cd-empty{padding:16px;border:1px dashed rgba(214,168,61,.45);border-radius:12px;text-align:center;color:rgba(255,255,255,.55);font-size:11px}.cd-help{border:1px solid rgba(214,168,61,.45);border-radius:14px;padding:13px;background:#07101a}.cd-help-intro{display:flex;gap:10px;align-items:center}.cd-help-intro strong{font-size:12px}.cd-help-intro span{font-size:10px;color:rgba(255,255,255,.6)}.cd-help-btn{display:none}.cd-mobile-shell{border:1px solid rgba(214,168,61,.65);border-radius:24px;padding:13px;background:#030a13;box-shadow:0 0 40px rgba(214,168,61,.06)}.cd-mobile-top{display:flex;justify-content:space-between;align-items:flex-start}.cd-mobile-kicker{font-size:10px;color:rgba(255,255,255,.65)}.cd-mobile-hello{font-family:Georgia,serif;font-size:20px;margin:4px 0 0}.cd-mobile-bell{color:#e7bd5d}.cd-next{margin-top:12px;border:1px solid rgba(255,255,255,.18);border-radius:13px;background:linear-gradient(145deg,#111b26,#07101a);padding:12px}.cd-next-head{display:flex;justify-content:space-between;font-size:9px}.cd-next-status{color:#80b7ff;border:1px solid rgba(128,183,255,.35);border-radius:7px;padding:3px 6px}.cd-route-preview{margin-top:10px;font-size:11px;line-height:2}.cd-route-preview b{display:block;color:#fff}.cd-next-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.cd-next-actions a{min-height:34px;display:flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid rgba(214,168,61,.7);color:#e7bd5d;text-decoration:none;font-size:9px;font-weight:800}.cd-next-actions a:first-child{background:linear-gradient(#f6cd6b,#cf962a);color:#171006}.cd-quick{margin-top:12px;border:1px solid rgba(255,255,255,.15);border-radius:12px;overflow:hidden}.cd-quick a{display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid rgba(255,255,255,.1);color:#f5f1e8;text-decoration:none;font-size:11px}.cd-quick a:last-child{border-bottom:0}.cd-quick svg{color:#e7bd5d}.cd-quick span{flex:1}.cd-bottom-note{font-size:9px;color:rgba(255,255,255,.45);text-align:center;margin-top:10px}@media(min-width:700px){.cd-main-inner{max-width:720px}.cd-mobile-shell{padding:20px}.cd-grid4{display:grid}}
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
        <main className="cd-main">
          <div className="cd-main-inner">
            <div className="cd-mobile-shell">
              <div className="cd-mobile-top">
                <div>
                  <div className="cd-mobile-kicker">Espace client</div>
                  <h1 className="cd-mobile-hello">Bonjour {greeting} 👋</h1>
                  <div className="cd-mobile-kicker">Voici un aperçu de vos courses.</div>
                </div>
                <span className="cd-mobile-bell">♧</span>
              </div>
              <section className="cd-next">
                <div className="cd-next-head">
                  <b>PROCHAINE COURSE</b>
                  <span className="cd-next-status">EN ROUTE</span>
                </div>
                <div className="cd-route-preview">
                  📍 <b>{activeRide?.depart || nextRide?.depart || "La Rochelle"}</b> ⤓{" "}
                  <b>
                    {activeRide?.arrivee ||
                      activeRide?.destination ||
                      nextRide?.arrivee ||
                      "Aéroport de Bordeaux (BOD)"}
                  </b>
                </div>
                <div className="cd-next-actions">
                  <Link to="/client/trajets">SUIVRE EN DIRECT</Link>
                  <Link to="/client/trajets">DÉTAILS</Link>
                </div>
              </section>
              <section className="cd-section">
                <div className="cd-section-head">
                  <h2 className="cd-section-title">MES TRAJETS ACTIFS</h2>
                  <Link className="cd-view" to="/client/trajets">
                    Voir tout ›
                  </Link>
                </div>
                {upcoming.length ? (
                  upcoming.slice(0, 1).map((r) => renderRide(r))
                ) : (
                  <div className="cd-empty">Aucune prochaine course pour le moment.</div>
                )}
              </section>
              <nav className="cd-quick">
                <Link to="/reserver">
                  <Plus size={16} />
                  <span>Réserver une course</span>
                  <ChevronRight size={15} />
                </Link>
                <Link to="/client/historique">
                  <History size={16} />
                  <span>Historique des courses</span>
                  <ChevronRight size={15} />
                </Link>
                <Link to="/client/chat">
                  <MessageCircle size={16} />
                  <span>Écrire à mon chauffeur</span>
                  <ChevronRight size={15} />
                </Link>
                <Link to="/client/profil">
                  <User size={16} />
                  <span>Mon profil</span>
                  <ChevronRight size={15} />
                </Link>
              </nav>
              <div className="cd-bottom-note">Access Prestige Taxi · L'excellence à chaque trajet</div>
            </div>
          </div>
        </main>
        <ClientBottomNav />
      </div>
    </>
  );
}
