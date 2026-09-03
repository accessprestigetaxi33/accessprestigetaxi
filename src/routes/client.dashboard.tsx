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
  Bell,
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
    subtitle: "Voici un aperçu de vos courses.",
    hello: (n: string) => `Bonjour ${n} 👋`,
    activeRide: "Course en cours",
    nextRide: "Prochaine course",
    example: "Exemple",
    track: "Suivre en direct",
    details: "Détails",
    invoice: "Facture",
    bookShort: "Réserver",
    book: "Réserver une course",
    call: (n: string, p: string) => `Appeler ${n} — ${p}`,
    trips: "Mes trajets actifs",
    seeAll: "Voir tout",
    noUpcoming: "Aucune prochaine course pour le moment.",
    history: "Historique",
    chat: "Mon chauffeur",
    profile: "Mon profil",
    backSite: "Retour au site",
    logout: "Déconnexion",
    tagline: "L'excellence à chaque trajet",
    you: "vous",
  },
  en: {
    eyebrow: "Client area",
    subtitle: "Here's an overview of your rides.",
    hello: (n: string) => `Hello ${n} 👋`,
    activeRide: "Ride in progress",
    nextRide: "Next ride",
    example: "Example",
    track: "Track live",
    details: "Details",
    invoice: "Invoice",
    bookShort: "Book",
    book: "Book a ride",
    call: (n: string, p: string) => `Call ${n} — ${p}`,
    trips: "My active rides",
    seeAll: "See all",
    noUpcoming: "No upcoming ride for now.",
    history: "History",
    chat: "My driver",
    profile: "My profile",
    backSite: "Back to website",
    logout: "Log out",
    tagline: "Excellence on every journey",
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

// "Demain à 08:30" / "Tomorrow at 08:30" — libellé relatif utilisé sur les
// cartes de trajet, conforme à la maquette (au lieu d'une date complète).
function fmtRelative(iso: string, lang: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const startOf = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
    const diffDays = Math.round((startOf(d) - startOf(now)) / 86400000);
    const time = d.toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    });
    const dayLabel =
      diffDays === 0
        ? lang === "en"
          ? "Today"
          : "Aujourd'hui"
        : diffDays === 1
          ? lang === "en"
            ? "Tomorrow"
            : "Demain"
          : d.toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
              day: "2-digit",
              month: "short",
              timeZone: "Europe/Paris",
            });
    return lang === "en" ? `${dayLabel} at ${time}` : `${dayLabel} à ${time}`;
  } catch {
    return iso;
  }
}

const css = `
.cd-root{min-height:100dvh;background:#030a13;color:#f5f1e8;font-family:Inter,system-ui,sans-serif;padding:0 0 82px}.cd-header{display:none}.cd-layout{display:block}.cd-sidebar{display:none}.cd-main{padding:12px}.cd-main-inner{max-width:390px;margin:0 auto}.cd-hero{display:none}.cd-grid4{display:none}.cd-section{margin-top:18px}.cd-section-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 8px}.cd-section-title{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f0e6d0}.cd-view{font-size:10px;color:#e6b95a;text-decoration:none}.cd-ride{position:relative;border:1px solid rgba(214,168,61,.45);border-radius:12px;padding:12px;background:linear-gradient(145deg,#111b26,#07101a);margin-bottom:8px}.cd-ride-top{display:flex;align-items:center;gap:8px}.cd-ride-icon{display:grid;place-items:center;width:30px;height:30px;flex-shrink:0;border-radius:999px;border:1px solid rgba(214,168,61,.5);color:#e7bd5d}.cd-ride-when{flex:1;font-size:10px;color:rgba(255,255,255,.65)}.cd-route{margin-top:8px;padding-left:38px;font-size:12px;line-height:1.7;color:#fff}.cd-route-sub{margin-left:4px;font-size:10px;font-weight:400;color:rgba(255,255,255,.55)}.cd-status{font-size:9px;font-weight:700;border-radius:999px;padding:4px 8px;flex-shrink:0}.cd-price{font-size:11px;color:#e7bd5d;margin-top:6px;padding-left:38px}.cd-ride-chevron{color:#e0b866;flex-shrink:0}.cd-empty{padding:16px;border:1px dashed rgba(214,168,61,.45);border-radius:12px;text-align:center;color:rgba(255,255,255,.55);font-size:11px}.cd-help{border:1px solid rgba(214,168,61,.45);border-radius:14px;padding:13px;background:#07101a}.cd-help-intro{display:flex;gap:10px;align-items:center}.cd-help-intro strong{font-size:12px}.cd-help-intro span{font-size:10px;color:rgba(255,255,255,.6)}.cd-help-btn{display:none}.cd-mobile-shell{border-radius:24px;padding:13px;background:#030a13;box-shadow:0 0 40px rgba(214,168,61,.06)}.cd-back{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid rgba(214,168,61,.45);background:#07101a;font-size:11px;font-weight:700;color:#e7bd5d;text-decoration:none}.cd-back:hover{background:#111b26}.cd-top-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.cd-mobile-top{display:flex;justify-content:space-between;align-items:flex-start}.cd-mobile-kicker{font-size:10px;color:rgba(255,255,255,.65)}.cd-mobile-hello{font-family:Georgia,serif;font-size:20px;margin:4px 0 0}.cd-mobile-bell{position:relative;color:#e7bd5d;display:inline-flex}.cd-bell-dot{position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:999px;background:#ef4444;border:2px solid #030a13}.cd-next{margin-top:12px;border:1px solid rgba(214,168,61,.45);border-radius:13px;background:linear-gradient(145deg,#111b26,#07101a);padding:12px}.cd-next-head{display:flex;justify-content:space-between;font-size:9px;text-transform:uppercase;letter-spacing:.04em}.cd-next-status{color:#80b7ff;border:1px solid rgba(214,168,61,.4);border-radius:999px;padding:3px 8px}.cd-next-body{margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px}.cd-route-preview{flex:1;font-size:11px}.cd-route-point{display:flex;align-items:flex-start;gap:8px}.cd-route-point b{display:block;color:#fff;font-size:12px}.cd-route-dot{margin-top:4px;width:8px;height:8px;border-radius:999px;flex-shrink:0}.cd-route-dot--from{background:#60a5fa}.cd-route-dot--to{background:#e7bd5d}.cd-route-line{margin:2px 0 2px 3px;width:1px;height:14px;border-left:1px dashed rgba(214,168,61,.4)}.cd-next-car{width:78px;height:56px;object-fit:cover;border-radius:10px;flex-shrink:0}.cd-next-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.cd-next-actions a{min-height:34px;display:flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid rgba(214,168,61,.7);color:#e7bd5d;text-decoration:none;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.03em}.cd-next-actions a:first-child{background:linear-gradient(#f6cd6b,#cf962a);color:#171006}.cd-quick{margin-top:12px;border:1px solid rgba(214,168,61,.45);border-radius:12px;overflow:hidden}.cd-quick a,.cd-quick button{display:flex;width:100%;align-items:center;gap:12px;padding:12px;border-bottom:1px solid rgba(214,168,61,.25);color:#f5f1e8;text-decoration:none;font-size:11px;background:none;border-left:none;border-right:none;border-top:none;text-align:left;font-family:inherit;cursor:pointer}.cd-quick a:last-child,.cd-quick button:last-child{border-bottom:0}.cd-quick svg{color:#e7bd5d}.cd-quick span{flex:1}.cd-quick .cd-logout{color:#f0a0a0}.cd-quick .cd-logout svg{color:#f0a0a0}.cd-bottom-note{font-size:9px;color:rgba(255,255,255,.45);text-align:center;margin-top:10px}@media(min-width:700px){.cd-main-inner{max-width:720px}.cd-mobile-shell{padding:20px}.cd-grid4{display:grid}}
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

  // Le trajet à afficher dans le bandeau "PROCHAINE COURSE" : course active
  // en priorité, sinon la prochaine réservée. Sans course réelle, on retombe
  // sur le libellé d'exemple de la maquette (La Rochelle → Aéroport de
  // Bordeaux) plutôt que sur un tiret vide.
  const heroRide = (activeRide || nextRide) as any;
  const heroDepMain = heroRide ? heroRide.depart || "—" : "La Rochelle";
  const heroDepSub = heroRide ? heroRide.depart_detail || heroRide.adresse_depart || "" : "Quai Louis Prunier, 17000";
  const heroArrMain = heroRide ? heroRide.arrivee || heroRide.destination || "—" : "Aéroport de Bordeaux (BOD)";
  const heroArrSub = heroRide ? heroRide.arrivee_detail || heroRide.adresse_arrivee || "" : "33700 Mérignac";
  // Titre du bandeau : "Course en cours" si une course est déjà active, sinon
  // "Prochaine course" (y compris pour l'aperçu d'exemple sans course réelle).
  const heroTitle = activeRide ? c.activeRide : c.nextRide;
  // Badge de statut : reflète le vrai statut de la course affichée, ou
  // "Exemple"/"Example" tant qu'il n'y a aucune course réelle (au lieu du
  // texte "EN ROUTE" fixe précédent, trompeur en dehors de ce cas précis).
  const heroStatusMeta = heroRide ? STATUS_META[heroRide.status] : null;
  const heroStatusLabel = heroStatusMeta ? heroStatusMeta.label[lang === "en" ? "en" : "fr"] : c.example;

  const renderRide = (ride: ClientReservation, past = false) => {
    const x = ride as any;
    const status = STATUS_META[ride.status];
    const price = x.prix_estime ?? x.prix_final ?? x.total_ttc;
    const depMain = ride.depart || "—";
    const depSub = x.depart_detail || x.adresse_depart || "";
    const arrMain = ride.arrivee || ride.destination || "—";
    const arrSub = x.arrivee_detail || x.adresse_arrivee || "";
    return (
      <div className="cd-ride" key={ride.id}>
        <div className="cd-ride-top">
          <span className="cd-ride-icon">
            <Car size={16} />
          </span>
          <div className="cd-ride-when">{fmtRelative(ride.pickup_datetime, lang)}</div>
          {status && (
            <div
              className="cd-status"
              style={{ borderColor: status.fg, color: status.fg, background: status.bg, border: "1px solid" }}
            >
              {status.label[lang === "en" ? "en" : "fr"]}
            </div>
          )}
          {ride.suivi_id && (
            <Link to="/suivi/$id" params={{ id: String(ride.suivi_id) }} className="cd-ride-chevron">
              <ChevronRight size={17} />
            </Link>
          )}
        </div>
        <div className="cd-route">
          <div>
            <b>{depMain}</b>
            {depSub && <span className="cd-route-sub">{depSub}</span>}
          </div>
          <div>
            <b>{arrMain}</b>
            {arrSub && <span className="cd-route-sub">{arrSub}</span>}
          </div>
        </div>
        {past && price != null && (
          <div className="cd-price">
            {new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(Number(price))}
          </div>
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
              <div className="cd-top-row">
                <Link to="/" className="cd-back">
                  <Home size={13} />
                  {c.backSite}
                </Link>
                <LanguageSwitcher />
              </div>
              <div className="cd-mobile-top">
                <div>
                  <div className="cd-mobile-kicker">{c.eyebrow}</div>
                  <h1 className="cd-mobile-hello">{c.hello(greeting)}</h1>
                  <div className="cd-mobile-kicker">{c.subtitle}</div>
                </div>
                <span className="cd-mobile-bell">
                  <Bell size={20} />
                  <span className="cd-bell-dot" />
                </span>
              </div>
              <section className="cd-next">
                <div className="cd-next-head">
                  <b>{heroTitle}</b>
                  <span
                    className="cd-next-status"
                    style={
                      heroStatusMeta
                        ? { color: heroStatusMeta.fg, borderColor: heroStatusMeta.fg, background: heroStatusMeta.bg }
                        : undefined
                    }
                  >
                    {heroStatusLabel}
                  </span>
                </div>
                <div className="cd-next-body">
                  <div className="cd-route-preview">
                    <div className="cd-route-point">
                      <span className="cd-route-dot cd-route-dot--from" />
                      <div>
                        <b>{heroDepMain}</b>
                        {heroDepSub && <span className="cd-route-sub">{heroDepSub}</span>}
                      </div>
                    </div>
                    <div className="cd-route-line" />
                    <div className="cd-route-point">
                      <span className="cd-route-dot cd-route-dot--to" />
                      <div>
                        <b>{heroArrMain}</b>
                        {heroArrSub && <span className="cd-route-sub">{heroArrSub}</span>}
                      </div>
                    </div>
                  </div>
                  <img src={photoVanReal.url} alt="" className="cd-next-car" />
                </div>
                <div className="cd-next-actions">
                  <Link to="/client/trajets">{c.track}</Link>
                  <Link to="/client/trajets">{c.details}</Link>
                </div>
              </section>
              <section className="cd-section">
                <div className="cd-section-head">
                  <h2 className="cd-section-title">{c.trips}</h2>
                  <Link className="cd-view" to="/client/trajets">
                    {c.seeAll} ›
                  </Link>
                </div>
                {upcoming.length ? (
                  upcoming.slice(0, 1).map((r) => renderRide(r))
                ) : (
                  <div className="cd-empty">{c.noUpcoming}</div>
                )}
              </section>
              <div className="cd-section">
                <ClientPushOptInCard
                  clientAccountId={session?.id}
                  clientSessionToken={session?.token ?? ""}
                />
              </div>
              <nav className="cd-quick" aria-label={c.eyebrow}>
                <Link to="/reserver">
                  <Plus size={18} />
                  <span>{c.bookShort}</span>
                </Link>
                <Link to="/client/trajets">
                  <Car size={18} />
                  <span>{c.trips}</span>
                </Link>
                <Link to="/client/historique">
                  <History size={18} />
                  <span>{c.history}</span>
                </Link>
                <Link to="/client/chat">
                  <MessageCircle size={18} />
                  <span>{c.chat}</span>
                </Link>
                <Link to="/client/profil">
                  <User size={18} />
                  <span>{c.profile}</span>
                </Link>
                <button type="button" className="cd-logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>{c.logout}</span>
                </button>
              </nav>
              <div className="cd-bottom-note">Access Prestige Taxi · {c.tagline}</div>
            </div>
          </div>
        </main>
        <ClientBottomNav />
      </div>
    </>
  );
}
