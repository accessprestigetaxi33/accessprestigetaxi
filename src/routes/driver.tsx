import { Textarea } from "@/components/ui/textarea";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createFileRoute, useSearch, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarClock,
  Contact,
  MapPin,
  MessageSquarePlus,
  Phone,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { getLastFcmFailure, isFirebaseConfigured } from "@/lib/firebase";
import { useReservationsRealtime } from "@/hooks/useReservationsRealtime";
import { ClientCardsPage } from "@/components/driver/ClientCardsPage";
import { SoundDebugPage } from "@/components/driver/SoundDebugPage";
import { StatsPage, PlanningPage, BackupsPage } from "@/components/driver/OpsPages";
import { driverUnavailList } from "@/lib/driver-ops.functions";
import { driverShellCss } from "@/lib/driver-shell-css";
import { MessagesTab, PlanningTab } from "@/components/driver/tabs";
import {
  driverThreads,
  driverGpsState,
  driverGpsPush,
  driverTeamChat,
  driverTeamChatSend,
} from "@/lib/driver-extra.functions";
import { TeamMap } from "@/components/driver/TeamMap";
import logoHero from "@/assets/logo-access-taxi-medallion.png";
import { useLiveGps, startLiveGps, stopLiveGps } from "@/hooks/useLiveGps";
import { useAutoStatus } from "@/hooks/useAutoStatus";
import { getRouteAlternatives, getDistanceAndDurationKm, type RouteAlternative } from "@/lib/osrm";
import { placesGeocode } from "@/lib/places";
import { detaillerPrix } from "@/lib/tarif";
import {
  driverAcceptRide,
  driverUpdateRideRoute,
  driverClaimRide,
  driverCreateManualReservation,
  driverLogin,
  driverAutoEnter,
  driverRides,
  driverCompletedRides,
  driverDeleteRide,
  driverRescheduleRide,
  driverSetStatus,
  driverTransferRide,
  driverOverflowRide,
  driverOverflowRides,
  driverTakeOverflowRide,
  driverReclaimOverflowRide,
  type DriverRide,
} from "@/lib/driver.functions";
import { driverMonthAccounting, driverUpdateAccountingSettings } from "@/lib/driver-accounting.functions";
import {
  getProfile,
  setProfile,
  fetchDriverProfiles,
  cachedDriverProfiles,
  type DriverProfileEntry,
} from "@/lib/driverProfile";

const STORAGE_KEY = "nova_driver_token";

/** Erreur passagère (réseau coupé, serveur injoignable) : ne doit JAMAIS déconnecter
 * le chauffeur. Seul un vrai refus du serveur (jeton révoqué/invalide) le fait. */
function isTransientError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  const msg = (error instanceof Error ? error.message : String(error ?? "")).toLowerCase();
  return [
    "lookup_failed",
    "failed to fetch",
    "load failed",
    "networkerror",
    "network",
    "timeout",
    "timed out",
    "fetch",
  ].some((k) => msg.includes(k));
}
const NOVA_LOGO = logoHero;

const NOVA_SHELL_EXTRA = `
  .drv-brand-mark img { height:34px; width:auto; display:block; }
  .drv-header-title { display:flex; flex-direction:column; min-width:0; flex:1; }
  .drv-header-title strong { color:#f6f0e5; font-size:14px; font-weight:700; line-height:1.2; }
  .drv-header-title span { color:rgba(246,240,229,.55); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
  .drv-header-notif {
    display:inline-flex; align-items:center; gap:7px; flex:0 0 auto;
    border:1px solid #c99b4a; border-radius:999px; padding:7px 12px;
    background:linear-gradient(180deg,#0a1118,#050a10); color:#e0b866;
    font-size:11px; font-weight:800; cursor:pointer; white-space:nowrap;
  }
  .drv-header-notif svg { width:15px; height:15px; }
  .drv-header-notif:disabled { opacity:.6; }
  .drv-header-back { display:inline-flex; align-items:center; gap:6px; color:#e0b866; text-decoration:none;
    border:1px solid rgba(201,155,74,.5); border-radius:999px; padding:7px 12px; font-size:11px; font-weight:700; }
  .drv-header-back svg { width:15px; height:15px; }
  @media (max-width:1023px) { .drv-tabs { display:none !important; } }
  .drv-body { padding-bottom:24px !important; }
  .drv-dash-back {
    display:inline-flex; align-items:center; gap:6px; margin-bottom:14px;
    color:#e0b866; background:none; border:1px solid rgba(201,155,74,.5); border-radius:999px;
    padding:8px 14px; font-size:12px; font-weight:700; cursor:pointer;
  }
  .drv-dash-back svg { width:15px; height:15px; }
  @media (min-width:1024px) { .drv-dash-back { display:none !important; } }
  @media (max-width:600px) {
    .drv-header-datetime { display:none !important; }
  }
  @media (max-width:520px) {
    .drv-header-notif span.drv-header-notif-label { display:none; }
    .drv-header-notif { padding:7px; }
    .drv-header-back span.drv-header-back-label { display:none; }
    .drv-header-back { padding:7px; }
    .drv-header-live span.drv-header-live-label { display:none; }
    .drv-header-live { padding:6px 8px; }
  }
  .drv-card + .drv-card { margin-top:12px; }
  .drv-btns { display:flex; flex-wrap:wrap; gap:8px; }
  /* iPhone : la barre d'état est translucide (black-translucent). Sans ça, l'en-tête de 78 px
     fixe écrasait son contenu sous l'heure / l'îlot dynamique, et au défilement la page
     passait dessous. L'en-tête grandit de la zone sûre et reste collé en haut. */
  .drv-root .drv-header {
    position:sticky !important; top:0 !important; z-index:45;
    height:auto !important;
    min-height:calc(78px + env(safe-area-inset-top,0px)) !important;
    padding-top:calc(10px + env(safe-area-inset-top,0px)) !important;
    padding-left:calc(env(safe-area-inset-left,0px)) !important;
    padding-right:calc(env(safe-area-inset-right,0px)) !important;
    flex-wrap:wrap !important; row-gap:8px;
  }
  /* Sélecteur Ayoub / Adam : bouton lisible dans l'en-tête (l'ancien style « pastille live »
     était réduit à 7 px sur mobile, donc introuvable). */
  .drv-root .drv-header .drv-header-who {
    display:inline-block !important; flex:0 0 auto !important; margin-left:auto !important;
    max-width:128px; min-height:34px; padding:6px 12px !important;
    border:1px solid rgba(224,184,102,.65) !important; border-radius:999px !important;
    background:rgba(224,184,102,.14) !important; color:#f6f0e5 !important;
    font-size:13px !important; font-weight:700 !important; line-height:1.2; cursor:pointer;
    text-overflow:ellipsis;
  }
  .drv-root .drv-header-who option { color:#111; background:#fff; }
  .drv-root .drv-header-back { display:inline-flex !important; }
  .drv-root .drv-header-title { display:flex !important; }
  @media (max-width:460px) { .drv-root .drv-header-title { display:none !important; } }
  .drv-btns button { flex:1 1 140px; border-radius:10px; padding:11px 14px; font-size:12px; font-weight:800; cursor:pointer; }
  .drv-quick-notif { width:100%; display:flex; align-items:center; justify-content:center; gap:7px; border-radius:10px; padding:11px 14px; font-size:12px; font-weight:800; cursor:pointer; }
  .drv-quick-notif svg { width:15px; height:15px; }
  /* Grille d'icônes carrées (accueil chauffeur), optimisée toutes tailles mobile. */
  .drv-dash-grid {
    display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-top:18px;
  }
  @media (min-width:640px) { .drv-dash-grid { grid-template-columns:repeat(3, 1fr); gap:12px; } }
  @media (min-width:1024px) { .drv-dash-grid { grid-template-columns:repeat(5, 1fr); gap:14px; } }
  .drv-tile {
    position:relative; aspect-ratio:1/1; display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:8px; text-align:center; cursor:pointer; color:inherit;
    border:1px solid rgba(246,240,229,.12); border-radius:16px; background:rgba(255,255,255,.03);
    padding:8px; min-height:0;
  }
  .drv-tile:active { background:rgba(255,255,255,.07); }
  .drv-tile-ico {
    flex:0 0 auto; width:42px; height:42px; border-radius:13px; display:flex; align-items:center;
    justify-content:center; color:#0a1118;
  }
  .drv-tile-ico svg { width:19px; height:19px; }
  @media (max-width:359px) {
    .drv-tile { border-radius:13px; gap:6px; padding:6px; }
    .drv-tile-ico { width:34px; height:34px; border-radius:10px; }
    .drv-tile-ico svg { width:16px; height:16px; }
  }
  @media (min-width:1024px) {
    .drv-tile-ico { width:48px; height:48px; border-radius:14px; }
    .drv-tile-ico svg { width:21px; height:21px; }
  }
  .drv-tile-label {
    font-size:11.5px; font-weight:700; line-height:1.2; display:-webkit-box;
    -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;
  }
  .drv-tile-badge {
    position:absolute; top:6px; right:6px; min-width:18px; height:18px; border-radius:9px;
    background:#e11d48; color:#fff; font-size:10px; font-weight:800; display:flex;
    align-items:center; justify-content:center; padding:0 5px;
  }
  .drv-tile-dot {
    position:absolute; top:8px; right:8px; width:9px; height:9px; border-radius:50%;
    background:#16a34a; box-shadow:0 0 0 2px #0a1118;
  }
  .drv-dash-map { margin-top:14px; border-radius:16px; overflow:hidden; border:1px solid rgba(246,240,229,.12); }
  /* Page des courses : plein écran. */
  .drv-rides-page {
    position:fixed; inset:0; z-index:80; overflow-y:auto; overscroll-behavior:contain;
    background:#0a1118; color:inherit;
    padding:calc(14px + env(safe-area-inset-top,0px)) 14px calc(24px + env(safe-area-inset-bottom,0px));
  }
  /* En-tête collant : il couvre aussi la zone sûre du haut (encoche / barre d'état iPhone),
     sinon le titre passe sous l'heure et l'îlot dynamique quand on fait défiler. */
  .drv-rides-head {
    position:sticky; top:0; z-index:2; display:flex; align-items:center; gap:10px;
    background:#0a1118;
    margin-top:calc(-14px - env(safe-area-inset-top,0px));
    padding:calc(20px + env(safe-area-inset-top,0px)) 0 12px;
  }
  /* Bloc collant « en-tête + onglets » : les deux restent ensemble, sans chevauchement. */
  .drv-rides-stick {
    position:sticky; top:0; z-index:2; background:#0a1118;
    margin-top:calc(-14px - env(safe-area-inset-top,0px));
    padding-top:calc(20px + env(safe-area-inset-top,0px));
  }
  .drv-rides-stick .drv-rides-head { position:static; margin:0; padding:0 0 12px; }
  .drv-rides-back {
    display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px;
    border-radius:11px; border:1px solid rgba(246,240,229,.16); background:rgba(255,255,255,.05);
    color:inherit; cursor:pointer;
  }
  .drv-rides-back svg { width:16px; height:16px; }
  .drv-rides-head h2 { margin:0; font-size:17px; font-weight:800; }
  .drv-rides-sec { margin-top:16px; }
  .drv-rides-sec-title {
    display:flex; align-items:center; gap:8px; margin:0; font-size:11px; font-weight:800;
    letter-spacing:.12em; text-transform:uppercase; color:#c99b4a;
  }
  .drv-rides-sec-count {
    min-width:20px; height:20px; border-radius:10px; padding:0 6px; display:inline-flex;
    align-items:center; justify-content:center; background:rgba(224,184,102,.16);
    color:#c99b4a; font-size:11px; font-weight:800; letter-spacing:0;
  }
  .drv-rides-sec-empty {
    margin:8px 0 0; border:1px dashed rgba(246,240,229,.16); border-radius:14px;
    padding:14px 12px; font-size:12.5px; color:rgba(246,240,229,.55);
  }
  .drv-rides-item {
    margin-top:8px; cursor:pointer; border-radius:14px; padding:12px;
    border:1px solid rgba(246,240,229,.12); background:rgba(255,255,255,.03);
  }
  .drv-rides-item:active { background:rgba(255,255,255,.07); }
  .drv-rides-actions { display:flex; gap:8px; margin-top:8px; }
  .drv-rides-btn {
    flex:1; padding:8px 10px; border-radius:10px; font-size:12px; font-weight:600;
    border:1px solid rgba(246,240,229,.16); background:rgba(255,255,255,.05); color:inherit;
    display:flex; align-items:center; justify-content:center; gap:6px; text-decoration:none;
  }
  .drv-rides-btn:active { transform:scale(.97); }
  .drv-rides-btn:disabled { opacity:.5; }
  .drv-rides-btn-done { border-color:rgba(74,222,128,.4); color:#4ade80; }
  .drv-rides-btn-spill { border-color:rgba(201,155,74,.45); color:#c99b4a; }
  .drv-rides-btn-sms { border-color:rgba(14,165,233,.45); color:#38bdf8; }
  .drv-rides-btn-cancel { border-color:rgba(248,113,113,.5); color:#f87171; }
  .drv-call-row {
    width:100%; display:flex; align-items:center; gap:12px; text-align:left; text-decoration:none;
    border-bottom:1px solid rgba(246,240,229,.08); padding:10px 4px; color:inherit;
  }
  .drv-call-row:last-child { border-bottom:none; }
  .drv-call-ico {
    flex:0 0 34px; height:34px; border-radius:10px; display:flex; align-items:center;
    justify-content:center; background:#16a34a; color:#0a1118; text-decoration:none;
  }
  .drv-call-ico-sms { background:#0ea5e9; }
  .drv-call-txt {
    flex:1 1 auto; min-width:0; text-decoration:none; color:inherit; cursor:pointer;
    background:none; border:none; padding:0; margin:0; text-align:left; font:inherit;
  }
  .drv-call-txt strong { display:block; font-size:13px; font-weight:700; }
  .drv-call-txt span { display:block; font-size:11.5px; color:rgba(246,240,229,.6); }
  .drv-real-box { margin-top:16px; border:1px solid rgba(224,184,102,.35); border-radius:14px; padding:14px; background:rgba(224,184,102,.06); }
  .drv-real-title { font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#c99b4a; }
  .drv-real-grid { margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .drv-real-grid label { display:flex; flex-direction:column; gap:6px; font-size:12px; color:rgba(246,240,229,.7); }
  .drv-real-grid input {
    border-radius:10px; border:1px solid rgba(246,240,229,.2); background:rgba(0,0,0,.25);
    padding:10px 12px; font-size:16px; color:inherit; min-height:44px;
  }
  .drv-real-hint { margin-top:8px; font-size:11px; color:rgba(246,240,229,.55); }
  .drv-addr-wrap { position:relative; }
  .drv-addr-list {
    position:absolute; z-index:70; top:calc(100% + 4px); left:0; right:0;
    background:#0a1118; border:1px solid rgba(201,155,74,.4); border-radius:10px;
    max-height:220px; overflow-y:auto; box-shadow:0 12px 30px rgba(0,0,0,.5);
  }
  .drv-addr-item {
    padding:10px 12px; font-size:13px; color:#f6f0e5; cursor:pointer;
    border-bottom:1px solid rgba(246,240,229,.08);
  }
  .drv-addr-item:last-child { border-bottom:none; }
  .drv-addr-item:hover, .drv-addr-item:active { background:rgba(224,184,102,.12); }
  .drv-addr-empty { padding:10px 12px; font-size:12px; color:rgba(246,240,229,.55); }
  .drv-real-done { margin-top:6px; font-size:15px; font-weight:700; }
  .drv-popup-backdrop {
    position:fixed; inset:0; z-index:60; background:rgba(3,7,13,.82);
    display:flex; align-items:center; justify-content:center; padding:18px;
    padding-bottom:calc(18px + env(safe-area-inset-bottom,0px));
  }
  .drv-popup {
    width:100%; max-width:380px; background:#0a1118; border:1px solid #c99b4a; border-radius:18px;
    padding:20px; box-shadow:0 20px 60px rgba(0,0,0,.6); color:#f6f0e5;
  }
  .drv-popup-kicker { color:#e0b866; font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
  .drv-popup-when { margin-top:8px; font-size:15px; font-weight:700; }
  .drv-popup-route { margin-top:12px; display:flex; flex-direction:column; gap:4px; font-size:14px; }
  .drv-popup-meta { margin-top:12px; display:flex; align-items:center; justify-content:space-between; font-size:13px; color:rgba(246,240,229,.7); }
  .drv-popup-meta b { color:#e0b866; font-size:15px; }
  .drv-popup-actions { margin-top:18px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .drv-popup-actions button { border-radius:12px; padding:14px; font-size:14px; font-weight:800; cursor:pointer; min-height:48px; }
  .drv-popup-refuse { background:transparent; border:1px solid rgba(246,240,229,.3); color:rgba(246,240,229,.8); }
  .drv-popup-accept { background:linear-gradient(180deg,#e0b866,#c99b4a); border:0; color:#0a1118; }
  .drv-popup-accept:disabled { opacity:.6; }

  /* ===== Anti-débordement iPhone (Dynamic Island / Pro Max), Android & tablette ===== */
  html, body {
    background:#03070d;
    overflow-x:hidden;
    overscroll-behavior-y:none; /* empêche le "rebond" élastique qui révèle un bord blanc/gris en haut ou en bas */
  }
  .drv-root {
    min-height:100vh;
    min-height:100dvh; /* hauteur réelle sur mobile, indépendante de la barre d'adresse */
    width:100%;
    max-width:100vw;
    overflow-x:hidden;
    background:#03070d;
    overscroll-behavior-y:contain;
    box-sizing:border-box;
  }
  .drv-root *, .drv-root *::before, .drv-root *::after { box-sizing:border-box; }
  .drv-main, .drv-content, .drv-body { max-width:100%; overflow-x:hidden; }
  /* Espace garanti sous le contenu pour respecter l'encoche du bas (home indicator) */
  @media (max-width:1023px) {
    .drv-content {
      padding-bottom:calc(24px + env(safe-area-inset-bottom,0px)) !important;
    }
  }
  @media (min-width:1024px) {
    .drv-root { overscroll-behavior-y:auto; }
  }
  /* Sécurise la zone du haut (encoche / île dynamique) pour tout élément plein écran */
  .drv-popup-backdrop {
    padding-top:calc(18px + env(safe-area-inset-top,0px));
  }
  /* Grands écrans (iPhone Pro Max, ~430–440px de large) : header sur une seule ligne propre */
  @media (min-width:431px) and (max-width:600px) {
    .drv-root .drv-header-title { display:flex !important; }
  }
`;

export const Route = createFileRoute("/driver")({
  staticData: { sitemap: false },
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    t: typeof search["t"] === "string" ? (search["t"] as string) : undefined,
    ride: typeof search["ride"] === "string" ? (search["ride"] as string) : undefined,
    act: search["act"] === "accept" || search["act"] === "refuse" ? (search["act"] as string) : undefined,
    tab: typeof search["tab"] === "string" ? (search["tab"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Espace chauffeur — Access Taxi PBR" },
      {
        name: "description",
        content: "Courses du jour, statuts et comptabilité des chauffeurs Access Taxi PBR.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Espace chauffeur — Access Taxi PBR" },
      { property: "og:description", content: "Accès réservé aux chauffeurs Access Taxi PBR." },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#03070d" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Access Taxi" },
      { name: "format-detection", content: "telephone=yes" },
    ],
    links: [{ rel: "manifest", href: "/manifest-chauffeur.webmanifest", id: "app-manifest" }],
  }),
  component: DriverApp,
});

/**
 * Glisser vers la gauche OU vers la droite pour supprimer.
 * Geste pur : aucun bouton "Supprimer" ne s'affiche. Une fois le seuil franchi
 * (et relâché), une confirmation est demandée puis la carte glisse hors écran.
 * En dessous du seuil, la carte revient simplement à sa place.
 */
function SwipeRow({
  children,
  onDelete,
  label,
  as = "li",
}: {
  children: React.ReactNode;
  onDelete: () => void;
  label?: string;
  /** Balise racine : "li" dans une <ul> (comportement par défaut, inchangé), "div" ailleurs. */
  as?: "li" | "div";
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef(false);
  // Distance à parcourir (dans un sens ou l'autre) pour déclencher la suppression.
  const THRESHOLD = 88;
  // Résistance : la carte ne suit pas le doigt au-delà de cette distance.
  const MAX = 140;

  const onStart = (x: number, y: number) => {
    if (leaving) return;
    start.current = { x, y };
    locked.current = false;
  };
  const onMove = (x: number, y: number) => {
    if (!start.current || leaving) return;
    const mx = x - start.current.x;
    const my = y - start.current.y;
    if (!locked.current) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (Math.abs(my) > Math.abs(mx)) {
        start.current = null;
        return;
      }
      locked.current = true;
      setDragging(true);
    }
    setDx(Math.max(-MAX, Math.min(MAX, mx)));
  };
  const onEnd = () => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    const wasDragging = locked.current;
    locked.current = false;
    if (!wasDragging) return;

    if (Math.abs(dx) >= THRESHOLD) {
      if (window.confirm(`Supprimer définitivement ${label ?? "cet élément"} ?`)) {
        // Seuil franchi et confirmé : la carte termine sa course hors écran puis
        // la suppression s'exécute une fois l'animation jouée.
        setLeaving(true);
        setDx(dx > 0 ? 600 : -600);
        window.setTimeout(() => onDelete(), 200);
        return;
      }
    }
    // Sous le seuil, ou suppression annulée : retour à la position initiale.
    setDx(0);
  };

  const progress = Math.min(1, Math.abs(dx) / THRESHOLD);
  const Root = as;
  return (
    <Root
      className="drv-swipe"
      style={{
        background: `rgba(225,29,72,${(progress * 0.22).toFixed(2)})`,
        borderRadius: 14,
        overflow: "hidden",
        transition: dragging ? "none" : "background .18s ease",
      }}
    >
      <div
        className="drv-swipe-content"
        style={{
          transform: `translateX(${dx}px)`,
          opacity: leaving ? 0 : 1,
          transition: dragging ? "none" : "transform .22s ease, opacity .18s ease",
          touchAction: "pan-y",
        }}
        onTouchStart={(e) => onStart(e.touches[0]!.clientX, e.touches[0]!.clientY)}
        onTouchMove={(e) => onMove(e.touches[0]!.clientX, e.touches[0]!.clientY)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (e.buttons === 1) onMove(e.clientX, e.clientY);
        }}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
      >
        {children}
      </div>
    </Root>
  );
}

/** Une ligne du panneau de diagnostic notif/son : libellé, valeur, pastille ok/ko. */
function DiagRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ opacity: 0.75 }}>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ok ? "#22c55e" : "#f87171",
            flex: "0 0 auto",
          }}
        />
        {value}
      </span>
    </div>
  );
}

function eur(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const IconBell = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconHome = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
);
const IconCar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    <path d="M3 17V11l2-5h14l2 5v6" />
    <path d="M5 11h14" />
  </svg>
);
const IconCalc = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="11" x2="8" y2="11.01" />
    <line x1="12" y1="11" x2="12" y2="11.01" />
    <line x1="16" y1="11" x2="16" y2="11.01" />
    <line x1="8" y1="15" x2="8" y2="15.01" />
    <line x1="12" y1="15" x2="12" y2="15.01" />
    <line x1="16" y1="15" x2="16" y2="15.01" />
  </svg>
);

type Tab = "dashboard" | "rides" | "completed" | "overflow" | "planning" | "messages" | "accounting";

const IconGeneric = (d: string) => () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const IconCalendar = IconGeneric(
  "M7 3v4M17 3v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
);
const IconMessage = IconGeneric("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z");
const IconSwap = IconGeneric("M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8");
const IconGrid = IconGeneric("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z");
const IconMapPin = IconGeneric(
  "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
);
const IconCheck = IconGeneric("M20 6 9 17l-5-5");

// Espace chauffeur simplifié : uniquement le strict nécessaire.
const TABS: { key: Tab; label: string; short: string; icon: () => React.ReactElement }[] = [
  { key: "dashboard", label: "TABLEAU DE BORD", short: "Accueil", icon: IconGrid },
  { key: "rides", label: "COURSES", short: "Courses", icon: IconCar },
  { key: "completed", label: "TERMINÉES", short: "Terminées", icon: IconCheck },
  { key: "overflow", label: "DÉBORDEMENT", short: "Débord.", icon: IconSwap },
  { key: "planning", label: "PLANNING", short: "Planning", icon: IconCalendar },
  { key: "messages", label: "MESSAGES", short: "Messages", icon: IconMessage },
  { key: "accounting", label: "COMPTABILITÉ", short: "Compta", icon: IconCalc },
];

function NotifButton({ className }: { className?: string }) {
  const { status, lastError, subscribe } = usePushNotifications();
  if (status === "unsupported")
    return (
      <button
        type="button"
        className={className}
        onClick={() =>
          toast.error(
            "Notifications indisponibles dans ce navigateur. Si vous avez ouvert ce lien depuis WhatsApp, Messenger ou SMS, appuyez sur « ⋮ » puis « Ouvrir dans Chrome ».",
            { duration: 9000 },
          )
        }
      >
        <IconBell />
        <span className="drv-header-notif-label">Notifications indisponibles</span>
      </button>
    );
  if (status === "granted")
    return (
      <span className={className} style={{ opacity: 0.65 }}>
        <IconBell />
        <span className="drv-header-notif-label">Notifications activées</span>
      </span>
    );
  return (
    <button
      type="button"
      className={className}
      disabled={status === "loading"}
      onClick={async () => {
        const token = await subscribe("chauffeur");
        if (token) toast.success("Notifications activées");
        else toast.error(lastError ?? "Activation impossible");
      }}
    >
      <IconBell />
      <span className="drv-header-notif-label">{status === "loading" ? "…" : "Activer les notifications"}</span>
    </button>
  );
}

function DriverApp() {
  const search = useSearch({ from: "/driver" });
  const [token, setToken] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const qc = useQueryClient();
  // Horloge de l'en-tête : mise à jour automatique (toutes les 30 s).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // Espace commun sans mot de passe ni choix de prénom : un seul profil
  // partagé « equipe » pour toute l'équipe, sur tous les appareils.
  useEffect(() => {
    setProfile("equipe");
    if (search.t) window.history.replaceState(null, "", "/driver");
  }, [search.t]);

  // Ouverture automatique de la session : au premier accès (ou si le jeton
  // a été perdu ou révoqué), le serveur ouvre une session sur le compte
  // commun — aucun écran de connexion, aucun choix de prénom.
  useEffect(() => {
    if (token || entering) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setToken(stored);
      return;
    }
    setEntering(true);
    driverAutoEnter({ data: {} })
      .then((res) => {
        localStorage.setItem(STORAGE_KEY, res.token);
        setToken(res.token);
      })
      .catch(() => setEntering(false));
  }, [token, entering]);

  // Notification de message client : ouvre directement l'onglet Messages.
  useEffect(() => {
    if (search.tab === "messages") setTab("messages");
  }, [search.tab]);

  const session = useQuery({
    queryKey: ["driver-login", token],
    enabled: !!token,
    // Coupure réseau : on réessaie au lieu de déconnecter. Un vrai refus n'est pas rejoué.
    retry: (failureCount, error) => isTransientError(error) && failureCount < 3,
    retryDelay: 1000,
    queryFn: () => driverLogin({ data: { as: getProfile(), token: token! } }),
  });

  // Jeton réellement refusé par le serveur (session révoquée) : on l'oublie et on revient
  // à l'écran de connexion. Une erreur réseau passagère ne déconnecte plus personne.
  const authFailed = session.isError && !isTransientError(session.error);
  useEffect(() => {
    if (authFailed && token) {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [authFailed, token]);

  // Compteur global de messages clients non lus (badge sur l'onglet Messages).
  const threadsQuery = useQuery({
    queryKey: ["driver-threads", token],
    enabled: !!token && !authFailed,
    queryFn: () => driverThreads({ data: { as: getProfile(), token: token! } }),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
  const unreadTotal = (threadsQuery.data?.threads ?? []).reduce((s, t) => s + (t.unread || 0), 0);

  // Temps réel : toute création ou changement de statut d'une course en base
  // rafraîchit immédiatement les écrans chauffeur, sans attendre le sondage.
  useReservationsRealtime({
    enabled: !!token && !authFailed,
    channel: "driver",
    queryKeys: [
      ["driver-rides", token],
      ["driver-completed-rides", token],
      ["driver-overflow", token],
      ["driver-threads", token],
      ["driver-accounting", token],
    ],
  });

  // Filet de sécurité mobile (iOS/Android) : au retour dans l'app (onglet
  // visible, focus fenêtre, retour depuis le cache bfcache ou reprise réseau),
  // les données affichées sont resynchronisées immédiatement — les minuteries
  // sont gelées en arrière-plan sur iPhone.
  useEffect(() => {
    if (!token) return;
    let last = 0;
    const refresh = () => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - last < 2000) return;
      last = now;
      // La vérification de session est exclue : inutile de la rejouer à chaque retour
      // dans l'app, et une coupure réseau à cet instant ne doit pas la faire échouer.
      void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "driver-login" });
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("online", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [token, qc]);

  // Ouverture de la session en cours (premier accès ou jeton révoqué) :
  // écran d'attente simple, sans mot de passe.
  if (!token || authFailed) {
    return (
      <Section className="max-w-md">
        <p className="eyebrow">Access Taxi PBR</p>
        <h1 className="mt-3 text-2xl font-semibold">Espace chauffeur</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ouverture de l'espace chauffeur…</p>
      </Section>
    );
  }

  return (
    <>
      <style>{driverShellCss}</style>
      <style>{NOVA_SHELL_EXTRA}</style>
      <div className="drv-root">
        <header className="drv-header">
          <div className="drv-brand-mark" aria-label="Access Taxi PBR">
            <img src={NOVA_LOGO} alt="Access Taxi PBR" />
          </div>
          <div className="drv-header-title">
            <strong>Espace chauffeur</strong>
            <span>Access Taxi PBR</span>
          </div>
          <span className="drv-header-datetime">
            <strong>
              {now.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </strong>
            {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <NotifButton className="drv-header-notif" />
          <Link className="drv-header-back" to="/" aria-label="Retour au site">
            <IconHome />
            <span className="drv-header-back-label">Retour au site</span>
          </Link>
        </header>

        <div className="drv-main">
          <aside className="drv-tabs" aria-label="Navigation chauffeur">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`drv-tab${tab === key ? " active" : ""}`}
                onClick={() => setTab(key)}
              >
                <span className="drv-tab-icon">
                  <Icon />
                </span>
                <span className="drv-tab-label">{label}</span>
                {key === "messages" && unreadTotal > 0 ? <span className="drv-tab-count">{unreadTotal}</span> : null}
              </button>
            ))}
          </aside>

          <div className="drv-content">
            <div className="drv-body">
              {tab !== "dashboard" ? (
                <button type="button" className="drv-dash-back" onClick={() => setTab("dashboard")}>
                  <ArrowLeft />
                  <span>Tableau de bord</span>
                </button>
              ) : null}
              {tab === "dashboard" ? <DashboardTab token={token} unread={unreadTotal} onGo={setTab} /> : null}
              {tab === "rides" ? <RidesTab token={token} /> : null}
              {tab === "completed" ? <CompletedRidesTab token={token} /> : null}
              {tab === "overflow" ? <OverflowTab token={token} /> : null}
              {tab === "planning" ? <PlanningTab token={token} /> : null}
              {tab === "messages" ? <MessagesTab token={token} /> : null}
              {tab === "accounting" ? <AccountingTab token={token} /> : null}
            </div>
          </div>
        </div>

        <IncomingRidePopup
          token={token}
          focusId={search.ride ?? null}
          action={search.act ?? null}
          onOpenRides={() => setTab("rides")}
        />
        <DriverBackgroundTasks token={token} />
      </div>
    </>
  );
}

/**
 * Tâches de fond, montées en permanence dès que le chauffeur est connecté (quel que soit
 * l'onglet ouvert, tableau de bord compris) et branchées sur l'UNIQUE suivi GPS partagé :
 *  - statut automatique (arrivé / terminée) d'après la position,
 *  - pause automatique après un arrêt prolongé,
 *  - alerte « Il est temps de partir » : heure de rdv − trajet réel − 15 min d'avance,
 *    calculée dans les 3 h qui précèdent la prochaine course acceptée, une seule fois.
 * Ces trois mécanismes ne tournent plus dans RidesTab / RideDetailPage (pas de doublons).
 */
function DriverBackgroundTasks({ token }: { token: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const gps = useLiveGps(token);
  const coordsRef = useRef(gps.coords);
  coordsRef.current = gps.coords;
  const { paused, setPausedIds } = usePausedRides();

  const { data } = useQuery({
    queryKey: ["driver-rides", token],
    queryFn: () => driverRides({ data: { as: getProfile(), token } }),
  });
  const me = data?.driver.slug;
  const rides = useMemo(() => data?.rides ?? [], [data]);

  // --- Statut automatique + pause automatique ---
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "arrived" | "completed" }) =>
      driverSetStatus({ data: { as: getProfile(), token, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["driver-rides", token] });
      qc.invalidateQueries({ queryKey: ["driver-accounting", token] });
    },
    onError: (e) => toast.error((e as Error)?.message || "Changement de statut impossible"),
  });
  const mutateRef = useRef(setStatus.mutate);
  mutateRef.current = setStatus.mutate;
  // « En route » (in_progress) est MANUEL : jamais déclenché automatiquement.
  const advance = useCallback((id: string, status: "in_progress" | "arrived" | "completed") => {
    if (status === "in_progress") return;
    mutateRef.current({ id, status });
    toast.info(`Statut mis à jour : ${STATUS_META[status]?.label ?? status}`);
  }, []);
  const autoRides = useMemo(() => rides.filter((r) => !paused.includes(r.id)), [rides, paused]);
  useAutoStatus(autoRides, me, gps.coords, advance);
  useAutoPause(rides, gps.coords, paused, setPausedIds);

  // --- Alerte « Il est temps de partir » ---
  // Course acceptée la plus proche dans le temps, assignée à ce chauffeur.
  const nextConfirmed = useMemo(() => {
    const now = Date.now();
    return rides
      .filter(
        (r) =>
          r.driver_slug != null &&
          (r.driver_slug === me || r.driver_slug === "equipe" || me === "equipe") &&
          ["accepted", "confirmed", "assigned"].includes(r.status) &&
          r.tracking_id &&
          r.depart &&
          new Date(r.pickup_datetime).getTime() > now - 30 * 60_000,
      )
      .sort((a, b) => +new Date(a.pickup_datetime) - +new Date(b.pickup_datetime))[0];
  }, [rides, me]);

  const { data: pickupPoint } = useQuery({
    queryKey: ["driver-next-pickup", nextConfirmed?.depart ?? null],
    enabled: Boolean(nextConfirmed?.depart),
    staleTime: Infinity,
    queryFn: () => placesGeocode(nextConfirmed!.depart as string),
  });

  const alerted = useRef<Set<string>>(new Set());
  const inFlight = useRef(false);

  const rideId = nextConfirmed?.id ?? null;
  const trackingRef = (nextConfirmed?.tracking_id as string | null | undefined) ?? null;
  const pickupIso = nextConfirmed?.pickup_datetime ?? null;
  const pickupLat = pickupPoint?.lat ?? null;
  const pickupLng = pickupPoint?.lng ?? null;

  useEffect(() => {
    if (!rideId || !trackingRef || !pickupIso || pickupLat == null || pickupLng == null) return;
    if (alerted.current.has(rideId)) return;
    const pickupAt = new Date(pickupIso).getTime();
    let stopped = false;

    const check = async () => {
      if (stopped || inFlight.current || alerted.current.has(rideId)) return;
      // Plus de 3 h avant le rdv : inutile de calculer.
      if (pickupAt - Date.now() > 3 * 3600_000) return;
      const pos = coordsRef.current;
      if (!pos) return;
      inFlight.current = true;
      try {
        const eta = await getDistanceAndDurationKm([pos.longitude, pos.latitude], [pickupLng, pickupLat]);
        if (stopped || !eta) return;
        const leaveAt = pickupAt - eta.dureeS * 1000 - 15 * 60_000;
        if (Date.now() >= leaveAt && !alerted.current.has(rideId)) {
          alerted.current.add(rideId);
          toast.info(`Il est temps de partir — ${Math.round(eta.dureeS / 60)} min jusqu'au client`, {
            duration: 60_000,
            action: {
              label: "Ouvrir le suivi",
              onClick: () => {
                void startLiveGps();
                navigate({ to: "/suivi/$id", params: { id: trackingRef }, search: {} });
              },
            },
          });
        }
      } catch {
        /* réseau indisponible : on réessaie au prochain passage */
      } finally {
        inFlight.current = false;
      }
    };

    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [rideId, trackingRef, pickupIso, pickupLat, pickupLng, navigate, token]);

  return null;
}

const PAUSED_KEY = "nova-paused-rides";

/** Courses mises en pause : UN SEUL état partagé entre tous les écrans (et mémorisé sur
 * l'appareil). Avant, chaque écran avait sa propre copie : une pause posée dans l'un
 * n'était pas vue par les autres. */
let pausedState: string[] | null = null;
const EMPTY_PAUSED: string[] = [];
const pausedListeners = new Set<() => void>();

function getPausedSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_PAUSED;
  if (pausedState === null) {
    try {
      pausedState = JSON.parse(localStorage.getItem(PAUSED_KEY) ?? "[]") as string[];
    } catch {
      pausedState = [];
    }
  }
  return pausedState;
}

function subscribePaused(listener: () => void) {
  pausedListeners.add(listener);
  return () => {
    pausedListeners.delete(listener);
  };
}

function setPausedIds(fn: (p: string[]) => string[]) {
  const prev = getPausedSnapshot();
  const next = fn(prev);
  if (next.length === prev.length && next.every((id, i) => id === prev[i])) return;
  pausedState = next;
  try {
    localStorage.setItem(PAUSED_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible */
  }
  pausedListeners.forEach((l) => l());
}

function usePausedRides() {
  const paused = useSyncExternalStore(subscribePaused, getPausedSnapshot, () => EMPTY_PAUSED);
  return { paused, setPausedIds };
}

function distanceM(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const AUTO_PAUSE_AFTER_MS = 5 * 60_000; // arrêt continu avant mise en pause
const AUTO_PAUSE_RADIUS_M = 40; // en dessous : on considère le taxi à l'arrêt (bruit GPS)

/**
 * Pause AUTOMATIQUE : course démarrée + taxi immobile plus de 5 min → mise en pause.
 * Reprise automatique dès que le taxi repart (seulement pour les pauses automatiques ;
 * une pause manuelle reste en pause jusqu'à « Reprendre »).
 */
function useAutoPause(
  rides: DriverRide[],
  coords: { latitude: number; longitude: number } | null | undefined,
  paused: string[],
  setPausedIds: (fn: (p: string[]) => string[]) => void,
) {
  const anchor = useRef<{ latitude: number; longitude: number; since: number } | null>(null);
  const autoPaused = useRef<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const runningIds = useMemo(
    () => rides.filter((r) => ["in_progress", "arrived", "en_route"].includes(r.status)).map((r) => r.id),
    [rides],
  );

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!coords || runningIds.length === 0) {
      anchor.current = null;
      return;
    }
    const now = Date.now();
    const a = anchor.current;
    if (!a || distanceM(a, coords) > AUTO_PAUSE_RADIUS_M) {
      anchor.current = { latitude: coords.latitude, longitude: coords.longitude, since: now };
      if (a && autoPaused.current.size > 0) {
        const ids = [...autoPaused.current];
        autoPaused.current.clear();
        setPausedIds((p) => p.filter((x) => !ids.includes(x)));
        toast.info("Course reprise automatiquement");
      }
      return;
    }
    if (now - a.since >= AUTO_PAUSE_AFTER_MS) {
      const toPause = runningIds.filter((id) => !paused.includes(id));
      anchor.current = { ...a, since: now };
      if (toPause.length > 0) {
        toPause.forEach((id) => autoPaused.current.add(id));
        setPausedIds((p) => [...new Set([...p, ...toPause])]);
        toast.info("Course mise en pause automatiquement (arrêt prolongé)");
      }
    }
  }, [coords, runningIds, paused, setPausedIds, tick]);
}

function RidesTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["driver-rides", token],
    queryFn: () => driverRides({ data: { as: getProfile(), token } }),
    refetchInterval: 60_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["driver-rides", token] });
    qc.invalidateQueries({ queryKey: ["driver-accounting", token] });
  };

  const claim = useMutation({
    mutationFn: (v: { id: string; claim: boolean }) => driverClaimRide({ data: { as: getProfile(), token, ...v } }),
    onSuccess: invalidate,
  });
  const transfer = useMutation({
    mutationFn: (v: { id: string; to: string }) => driverTransferRide({ data: { as: getProfile(), token, ...v } }),
    onSuccess: (res) => {
      toast.success(`Course passée à ${res.to}`);
      invalidate();
    },
    onError: () => toast.error("Transfert impossible"),
  });
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "confirmed" | "in_progress" | "arrived" | "completed" | "cancelled" }) =>
      driverSetStatus({ data: { as: getProfile(), token, ...v } }),
    onSuccess: invalidate,
    onError: (e) => toast.error((e as Error)?.message || "Changement de statut impossible"),
  });
  // Acceptation : attribution + statut confirmé + envoi de la position.
  // Ni le GPS ni la redirection vers /suivi ne se déclenchent plus ici : les
  // deux se déclenchent automatiquement plus bas (effet dédié) dès que le
  // chauffeur est à ≤15 min réelles (distance/circulation) du point de rdv.
  const gps = useLiveGps(token);
  const accept = useMutation({
    mutationFn: async (v: { id: string; trackingId?: string | null; route?: RouteAlternative | null }) => {
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
        );
      });
      return driverAcceptRide({
        data: {
          // Sans « as », l'acceptation s'enregistre sur le compte partagé et la
          // course reste affichée « non attribuée ».
          as: getProfile(),
          token,
          id: v.id,
          latitude: pos?.coords.latitude ?? null,
          longitude: pos?.coords.longitude ?? null,
          accuracy: pos?.coords.accuracy ?? null,
          heading: pos?.coords.heading ?? null,
          speed: pos?.coords.speed ?? null,
          route: v.route ? { label: v.route.label, km: v.route.km, min: v.route.min, coords: v.route.coords } : null,
        },
      });
    },
    onSuccess: () => {
      // Plus de redirection immédiate ici : le chauffeur reste sur son
      // tableau de bord, il sera envoyé sur /suivi automatiquement à
      // l'approche du point de rdv (≤15 min réelles).
      toast.success("Course acceptée");
      invalidate();
    },
    onError: () => toast.error("Impossible d'accepter la course"),
  });

  // Modification de l'itinéraire pendant la course (notifie le client).
  const updateRoute = useMutation({
    mutationFn: (v: { id: string; route: RouteAlternative }) =>
      driverUpdateRideRoute({
        data: {
          as: getProfile(),
          token,
          id: v.id,
          label: v.route.label,
          km: v.route.km,
          min: v.route.min,
          coords: v.route.coords,
        },
      }),
    onSuccess: (res) => {
      toast.success(res.notified > 0 ? "Itinéraire mis à jour — client prévenu" : "Itinéraire mis à jour");
      invalidate();
    },
    onError: () => toast.error("Mise à jour de l'itinéraire impossible"),
  });

  const overflow = useMutation({
    mutationFn: (v: { id: string }) => driverOverflowRide({ data: { as: getProfile(), token, ...v } }),
    onSuccess: (res) => {
      toast.success(
        res.notified > 0 ? "Course proposée à l'équipe — chauffeur(s) prévenu(s)" : "Course mise en débordement",
      );
      invalidate();
      qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
    },
    onError: () => toast.error("Mise en débordement impossible"),
  });
  const reclaim = useMutation({
    mutationFn: (v: { id: string }) => driverReclaimOverflowRide({ data: { as: getProfile(), token, ...v } }),
    onSuccess: () => {
      toast.success("Course reprise");
      invalidate();
      qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
    },
    onError: () => toast.error("Reprise impossible — la course a déjà démarré"),
  });

  const remove = useMutation({
    mutationFn: (v: { id: string }) => driverDeleteRide({ data: { as: getProfile(), token, ...v } }),
    onSuccess: () => {
      toast.success("Course supprimée");
      invalidate();
    },
    onError: () => toast.error("Suppression impossible"),
  });

  const rides = data?.rides ?? [];
  const me = data?.driver.slug;
  const drivers = data?.drivers ?? [];

  // Courses mises en pause : statut automatique suspendu (et GPS coupé si pause manuelle).
  const { paused, setPausedIds } = usePausedRides();

  // Statut automatique, pause automatique et alerte de départ : voir DriverBackgroundTasks
  // (montée en permanence, sur le suivi GPS partagé).

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Courses (7 derniers jours et à venir)</h2>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      </div>

      {gps.active ? (
        <div className="surface-card mt-5 flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>
            <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-400 align-middle" />
            Position partagée en direct
            {gps.lastSentAt ? ` — mise à jour ${new Date(gps.lastSentAt).toLocaleTimeString("fr-FR")}` : ""}
            {gps.error ? ` — ${gps.error}` : ""}
          </span>
          <Button size="sm" variant="outline" onClick={() => void gps.stop()}>
            Arrêter le partage
          </Button>
        </div>
      ) : null}

      {rides.length === 0 ? (
        <p className="surface-card mt-5 p-8 text-sm text-muted-foreground">Aucune course pour le moment.</p>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {rides.map((r) => (
            <SwipeRow key={r.id} onDelete={() => remove.mutate({ id: r.id })} label={`Course ${r.tracking_id ?? ""}`}>
              <RideCard
                ride={r}
                mine={r.driver_slug != null && (r.driver_slug === me || r.driver_slug === "equipe" || me === "equipe")}
                drivers={drivers}
                transferring={transfer.isPending}
                accepting={accept.isPending}
                updatingRoute={updateRoute.isPending}
                onAccept={(route) => accept.mutate({ id: r.id, trackingId: r.tracking_id, route })}
                onUpdateRoute={(route) => updateRoute.mutate({ id: r.id, route })}
                onClaim={(v) => claim.mutate({ id: r.id, claim: v })}
                onTransfer={(to) => transfer.mutate({ id: r.id, to })}
                onStatus={(s, real) => setStatus.mutate({ id: r.id, status: s, ...(real ?? {}) })}
                overflowing={overflow.isPending || reclaim.isPending}
                canReclaim={r.overflow_from_slug === me && r.status === "en_debordement"}
                onOverflow={() => overflow.mutate({ id: r.id })}
                onReclaim={() => reclaim.mutate({ id: r.id })}
                paused={paused.includes(r.id)}
                onStart={() => {
                  void gps.start();
                  setStatus.mutate({ id: r.id, status: "in_progress" });
                  // « En route » ramène le taxi sur la page de suivi.
                  if (r.tracking_id) {
                    navigate({ to: "/suivi/$id", params: { id: r.tracking_id as string }, search: {} });
                  }
                }}
                onPause={() => {
                  setPausedIds((p) => [...p.filter((x) => x !== r.id), r.id]);
                  void gps.stop();
                  toast.info("Course en pause");
                }}
                onResume={() => {
                  setPausedIds((p) => p.filter((x) => x !== r.id));
                  void gps.start();
                  toast.success("Course reprise");
                }}
              />
            </SwipeRow>
          ))}
        </ul>
      )}
    </div>
  );
}

type RideStatus = "confirmed" | "in_progress" | "arrived" | "completed" | "cancelled";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "drv-badge-gray" },
  confirmed: { label: "Acceptée", cls: "drv-badge-blue" },
  accepted: { label: "Acceptée", cls: "drv-badge-blue" },
  assigned: { label: "Attribuée", cls: "drv-badge-blue" },
  en_route: { label: "En route", cls: "drv-badge-amber" },
  in_progress: { label: "En route", cls: "drv-badge-amber" },
  arrived: { label: "Arrivé", cls: "drv-badge-green" },
  completed: { label: "Terminée", cls: "drv-badge-green" },
  cancelled: { label: "Annulée", cls: "drv-badge-red" },
  en_debordement: { label: "En débordement", cls: "drv-badge-amber" },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, cls: "drv-badge-gray" };
  return <span className={`drv-badge-pill ${meta.cls}`}>{meta.label}</span>;
}

function waLink(phone: string) {
  const raw = phone.replace(/[^0-9+]/g, "");
  // Numéro déjà international (+33... ou 0033...) : on ne touche pas au
  // préfixe — l'ancienne version remplaçait systématiquement le premier "0",
  // ce qui doublait l'indicatif d'un numéro "0033..." (donnait "+330033...").
  let digits: string;
  if (raw.startsWith("+")) digits = raw.slice(1);
  else if (raw.startsWith("00")) digits = raw.slice(2);
  else if (raw.startsWith("0")) digits = `33${raw.slice(1)}`;
  else digits = raw;
  return `https://wa.me/${digits}`;
}

/** Lien "sms:" natif (pas d'API externe) — ouvre directement l'appli SMS du téléphone
 * avec le numéro et le message pré-remplis. iOS exige "&" avant "body=" alors qu'Android
 * (et la plupart des navigateurs desktop) attendent "?" ; sans cette distinction le corps
 * du message n'est tout simplement pas repris sur l'un des deux systèmes. */
function smsLink(phone: string, body: string) {
  const clean = phone.replace(/\s/g, "");
  const sep = isIOS() ? "&" : "?";
  return `sms:${clean}${sep}body=${encodeURIComponent(body)}`;
}

/** Message SMS pré-rédigé envoyé au client : rappel de l'heure de prise en charge
 * et lien de suivi en direct du chauffeur. */
function buildRideSmsMessage({
  nom,
  pickup,
  trackingId,
}: {
  nom?: string | null;
  pickup: Date;
  trackingId?: string | null;
}) {
  const prenom = (nom ?? "").trim().split(/\s+/)[0] || "";
  const heure = pickup.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const lien = trackingId ? `${window.location.origin}/suivi/${trackingId}` : "";
  return [
    `Bonjour${prenom ? " " + prenom : ""}, votre course est confirmée pour le ${heure}.`,
    lien ? `Suivez votre chauffeur en direct : ${lien}` : null,
    "Merci de votre confiance.",
    "L'équipe Access Taxi PBR",
  ]
    .filter(Boolean)
    .join("\n");
}

/** iOS (Safari/Chrome/Firefox y tournent tous sur WebKit) a besoin d'un traitement différent
 * d'Android : l'attribut "download" y fait télécharger le fichier dans Fichiers au lieu
 * d'ouvrir l'écran natif "Ajouter aux contacts". */
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Nom sûr pour un contact enregistré sur le téléphone. Sans ça, tout client
 * sans nom renseigné (réservation reçue sans nom) était enregistré sous le
 * même nom générique « Client » — le carnet d'adresses d'iPhone/Android
 * reconnaît alors un contact « Client » déjà existant et propose de le
 * mettre à jour au lieu d'en créer un nouveau : le numéro du dernier client
 * enregistré écrase celui du précédent sous cette même fiche, d'où des
 * numéros qui semblent « mélangés » entre deux courses. On distingue donc
 * chaque client sans nom par les 4 derniers chiffres de son numéro. */
function safeContactName(nom: string, telephone: string) {
  const trimmed = (nom || "").replace(/[\r\n]/g, " ").trim();
  if (trimmed) return trimmed;
  const digits = telephone.replace(/\D/g, "");
  return digits.length >= 4 ? `Client ${digits.slice(-4)}` : "Client";
}

function buildVcard(nom: string, telephone: string) {
  const safeName = safeContactName(nom, telephone);
  const cleanPhone = telephone.replace(/\s/g, "");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${safeName};;;;`,
    `FN:${safeName}`,
    `TEL;TYPE=CELL:${cleanPhone}`,
    "END:VCARD",
    "",
  ].join("\r\n");
}

function vcardFilename(nom: string, telephone: string) {
  return `${safeContactName(nom, telephone).replace(/\s+/g, "_")}.vcf`;
}

/** Enregistre un client dans les contacts du téléphone : ouverture directe du blob sur iOS
 * (Safari affiche alors "Ajouter aux contacts"), téléchargement nommé sur Android/desktop
 * (à ouvrir ensuite avec l'appli Contacts). */
function saveContactVcard(nom: string, telephone: string) {
  if (!telephone) return;
  const blob = new Blob([buildVcard(nom, telephone)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  if (isIOS()) {
    window.location.href = url;
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = vcardFilename(nom, telephone);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Navigation externe : OpenStreetMap (même socle cartographique que le site). */
function navLink(address: string | null) {
  if (!address) return null;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
}

type GeoPoint = { lat: number; lng: number };

/** Point d'arrivée d'un itinéraire (dernier point du tracé) : coordonnées GPS exactes de la destination.
 * Le tracé est en [lng, lat] (GeoJSON) ; on détecte quand même une inversion (France : lat 41–51, lng −5–10). */
function routeEndPoint(route: RouteAlternative | null | undefined): GeoPoint | null {
  const last = route?.coords?.[route.coords.length - 1];
  if (!last) return null;
  const [a, b] = last;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.abs(a) > 20 && Math.abs(b) <= 20 ? { lat: a, lng: b } : { lat: b, lng: a };
}

/** Navigation Google Maps (l'appli s'ouvre directement sur mobile) : coordonnées GPS si connues, sinon l'adresse. */
function navLinkGoogle(address: string, pt?: GeoPoint | null) {
  const dest = pt ? `${pt.lat},${pt.lng}` : encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

/** Navigation Waze : coordonnées GPS si connues, sinon l'adresse. */
function navLinkWaze(address: string, pt?: GeoPoint | null) {
  const target = pt ? `ll=${pt.lat},${pt.lng}` : `q=${encodeURIComponent(address)}`;
  return `https://waze.com/ul?${target}&navigate=yes`;
}

/** Navigation vers une position GPS partagée, sur OpenStreetMap. */
function navLinkCoords(lat: number, lng: number) {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${lat}%2C${lng}#map=15/${lat}/${lng}`;
}

function RideCard({
  ride,
  mine,
  drivers,
  transferring,
  accepting,
  updatingRoute,
  onAccept,
  onUpdateRoute,
  onClaim,
  onTransfer,
  onStatus,
  overflowing,
  canReclaim,
  onOverflow,
  onReclaim,
  paused,
  onStart,
  onPause,
  onResume,
}: {
  ride: DriverRide;
  mine: boolean;
  drivers: { slug: string; name: string }[];
  transferring: boolean;
  accepting: boolean;
  updatingRoute: boolean;
  onAccept: (route: RouteAlternative | null) => void;
  onUpdateRoute: (route: RouteAlternative) => void;
  onClaim: (v: boolean) => void;
  onTransfer: (to: string) => void;
  onStatus: (s: RideStatus, real?: { realDistanceKm: number | null; realPrice: number | null }) => void;
  overflowing: boolean;
  canReclaim: boolean;
  onOverflow: () => void;
  onReclaim: () => void;
  paused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const when = useMemo(() => new Date(ride.pickup_datetime).toLocaleString("fr-FR"), [ride.pickup_datetime]);
  const assigned = drivers.find((d) => d.slug === ride.driver_slug) ?? null;
  const other = drivers.find((d) => d.slug !== ride.driver_slug) ?? null;
  // Une course peut être passée à l'autre chauffeur seulement une fois prise.
  const canTransfer = assigned && other && !["completed", "cancelled"].includes(ride.status);
  const destination = ride.arrivee ?? ride.destination;
  const done = ["completed", "cancelled"].includes(ride.status);

  // Itinéraires alternatifs OSRM / OpenStreetMap (3 max) pour la course.
  const [routes, setRoutes] = useState<RouteAlternative[] | null>(null);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<number>(0);

  // Prix recalculé pour l'itinéraire actuellement sélectionné (km/min propres à
  // chaque alternative) — évite d'afficher le prix figé de la course d'origine.
  const priceFor = useCallback(
    (r: RouteAlternative) => detaillerPrix(r.km, ride.pickup_datetime, r.min).total,
    [ride.pickup_datetime],
  );
  const chosenRoute = routes?.find((r) => r.id === chosen) ?? null;
  const displayedPrice = chosenRoute
    ? priceFor(chosenRoute)
    : ride.prix_estime != null
      ? Number(ride.prix_estime)
      : null;
  // Coordonnées GPS de la destination (fin de l'itinéraire choisi) pour Google Maps / Waze.
  const destPoint = useMemo(() => routeEndPoint(chosenRoute ?? routes?.[0]), [chosenRoute, routes]);

  useEffect(() => {
    if (done || !ride.depart || !destination) return;
    let cancelled = false;
    setRoutesError(null);
    getRouteAlternatives(ride.depart, destination)
      .then((r) => {
        if (cancelled) return;
        setRoutes(r);
        setChosen(r[0]?.id ?? 0);
      })
      .catch(() => {
        if (!cancelled) setRoutesError("Itinéraires indisponibles pour le moment.");
      });
    return () => {
      cancelled = true;
    };
  }, [ride.depart, destination, done]);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs tracking-widest text-gold">{ride.tracking_id ?? "—"}</span>
        <StatusBadge status={ride.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold">
          {assigned ? `👤 ${assigned.name}${mine ? " (vous)" : ""}` : "👤 Non attribuée"}
        </span>
        {canTransfer ? (
          <Button
            size="sm"
            variant="outline"
            disabled={transferring}
            onClick={() => onTransfer(other!.slug)}
            title="Passer la course à l'autre chauffeur"
          >
            <ArrowLeftRight className="size-4" aria-hidden /> Passer à {other!.name}
          </Button>
        ) : null}
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarClock className="size-4 text-gold" aria-hidden /> {when}
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm">
        <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        {ride.depart} → {destination}
      </p>
      <p className="mt-3 flex items-center gap-4 text-sm">
        {ride.telephone ? (
          <a href={`tel:${ride.telephone}`} className="inline-flex items-center gap-2 text-gold">
            <Phone className="size-4" aria-hidden /> {ride.nom ?? ride.telephone}
          </a>
        ) : (
          <span className="text-muted-foreground">{ride.nom ?? "Client"}</span>
        )}
        {displayedPrice != null ? <span className="ms-auto font-semibold">{eur(displayedPrice)}</span> : null}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ride.telephone ? (
          <Button size="sm" variant="outline" asChild>
            <a href={`tel:${ride.telephone}`}>
              <Phone className="size-4" aria-hidden /> Appeler
            </a>
          </Button>
        ) : null}
        {ride.telephone ? (
          <Button size="sm" variant="outline" asChild>
            <a href={waLink(ride.telephone)} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </Button>
        ) : null}
        {ride.telephone ? (
          <Button size="sm" variant="outline" asChild>
            <a
              href={smsLink(
                ride.telephone,
                buildRideSmsMessage({
                  nom: ride.nom,
                  pickup: new Date(ride.pickup_datetime),
                  trackingId: ride.tracking_id,
                }),
              )}
            >
              <MessageSquarePlus className="size-4" aria-hidden /> SMS
            </a>
          </Button>
        ) : null}
        {navLink(destination) ? (
          <>
            <Button size="sm" variant="outline" asChild>
              <a href={navLinkGoogle(destination!, destPoint)} target="_blank" rel="noreferrer">
                🧭 Google Maps
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={navLinkWaze(destination!, destPoint)} target="_blank" rel="noreferrer">
                Waze
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={destPoint ? navLinkCoords(destPoint.lat, destPoint.lng) : navLink(destination)!}
                target="_blank"
                rel="noreferrer"
              >
                OpenStreetMap
              </a>
            </Button>
          </>
        ) : null}
        {ride.client_lat != null && ride.client_lng != null ? (
          <Button size="sm" variant="gold" asChild title="Position partagée par le client">
            <a href={navLinkCoords(ride.client_lat, ride.client_lng)} target="_blank" rel="noreferrer">
              📍 Position client
            </a>
          </Button>
        ) : null}
      </div>

      {!done ? (
        <div className="mt-4 rounded-xl border border-border/70 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Itinéraires proposés</p>
          {routesError ? (
            <p className="mt-2 text-xs text-amber-300">{routesError}</p>
          ) : !routes ? (
            <p className="mt-2 text-xs text-muted-foreground">Calcul des itinéraires…</p>
          ) : routes.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">Aucun itinéraire trouvé.</p>
          ) : (
            <div className="mt-2 grid gap-2">
              {routes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setChosen(r.id)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs ${
                    chosen === r.id ? "border-gold/60 bg-gold/10 text-gold" : "border-border text-muted-foreground"
                  }`}
                >
                  <span className="font-medium">{r.label}</span>
                  <span>
                    {r.km} km · {r.min} min · {eur(priceFor(r))}
                  </span>
                </button>
              ))}
            </div>
          )}
          {mine &&
          chosenRoute &&
          ["accepted", "confirmed", "assigned", "en_route", "in_progress", "arrived"].includes(ride.status) ? (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={updatingRoute}
              onClick={() => onUpdateRoute(chosenRoute)}
            >
              {updatingRoute ? "Mise à jour…" : "Appliquer cet itinéraire (client prévenu)"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {["confirmed", "in_progress", "arrived"].includes(ride.status) ? (
        <div className="drv-real-box">
          <p className="drv-real-title">Statut automatique</p>
          <p className="drv-real-hint">
            {ride.status === "confirmed"
              ? "Appuyez sur « En route » quand vous partez vers le client (manuel). La suite est automatique."
              : ride.status === "in_progress"
                ? "Passage en « Arrivé » à l'approche du point de prise en charge."
                : "Course clôturée automatiquement à l'arrivée à destination."}
          </p>
        </div>
      ) : null}

      {ride.status === "completed" ? (
        <div className="drv-real-box">
          <p className="drv-real-title">Course réalisée</p>
          <p className="drv-real-done">
            {ride.distance_reelle_km != null ? `${Number(ride.distance_reelle_km).toFixed(1)} km` : "— km"}
            {" · "}
            {ride.duree_reelle_s != null ? `${Math.round(ride.duree_reelle_s / 60)} min` : "— min"}
            {" · "}
            {ride.prix_final != null ? eur(Number(ride.prix_final)) : "—"}
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {mine &&
        !done &&
        ["accepted", "confirmed", "assigned", "en_route", "in_progress", "arrived"].includes(ride.status) ? (
          <>
            {paused ? (
              <p className="w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Course en pause — position non partagée, statut automatique suspendu.
              </p>
            ) : null}
            {!["in_progress", "arrived", "en_route"].includes(ride.status) ? (
              <Button
                size="sm"
                variant="gold"
                onClick={() => onStart()}
                title="Active le GPS, passe la course « En route » et ouvre la page de suivi"
              >
                En route
              </Button>
            ) : paused ? (
              <Button size="sm" variant="gold" onClick={() => onResume()}>
                Reprendre
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onPause()}>
                Mettre en pause
              </Button>
            )}
            <Button
              size="sm"
              variant="gold"
              onClick={() => {
                if (window.confirm("Clôturer la course ? Le client verra qu'elle est terminée.")) onStatus("completed");
              }}
              title="Clôturer la course — actualise aussitôt la page de suivi du client"
            >
              Course terminée
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={overflowing}
              onClick={() => onOverflow()}
              title="Libérer la course : elle passe en débordement pour l'autre chauffeur"
            >
              {overflowing ? "…" : "Libérer"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm("Annuler cette course ?")) onStatus("cancelled");
              }}
            >
              Annuler
            </Button>
          </>
        ) : (
          <>
            {ride.status === "pending" || ride.status === "en_debordement" ? (
              <Button
                size="sm"
                variant="gold"
                disabled={accepting}
                onClick={() => onAccept(routes?.find((r) => r.id === chosen) ?? null)}
              >
                {accepting ? "Acceptation…" : "Accepter la course"}
              </Button>
            ) : null}
            {!assigned && ride.status !== "pending" && ride.status !== "en_debordement" ? (
              <Button size="sm" variant="gold" onClick={() => onClaim(true)}>
                Prendre
              </Button>
            ) : null}
            {canReclaim ? (
              <Button size="sm" variant="gold" disabled={overflowing} onClick={() => onReclaim()}>
                Reprendre la course
              </Button>
            ) : null}
            {!["completed", "cancelled"].includes(ride.status) ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Annuler cette course ?")) onStatus("cancelled");
                }}
              >
                Annuler
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function AccountingTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const [month, setMonth] = useState(currentMonth());
  const [showSettings, setShowSettings] = useState(false);

  const key = ["driver-accounting", token, month] as const;
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => driverMonthAccounting({ data: { as: getProfile(), token, month } }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["driver-accounting", token] });

  const kpis = [
    {
      label: "Chiffre d'affaires du mois",
      value: data?.revenue ?? 0,
      hint: `${data?.rides ?? 0} course(s)`,
    },
    {
      label: "URSSAF à provisionner",
      value: data?.urssaf ?? 0,
      hint: `${(data?.urssafRate ?? 0).toString().replace(".", ",")} % du CA`,
    },
    { label: "Reste net", value: data?.net ?? 0, hint: "CA − URSSAF" },
  ];

  return (
    <div className="mt-8 space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Comptabilité</h2>
          <p className="mt-1 text-sm text-muted-foreground">Calcul automatique de l'URSSAF et du reste net.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value || currentMonth())}
            className="w-[11rem]"
            aria-label="Mois"
          />
          <Button variant="ghost" size="sm" onClick={() => setShowSettings((v) => !v)}>
            <Settings2 className="size-4" aria-hidden /> Taux
          </Button>
        </div>
      </div>

      {showSettings ? (
        // Le formulaire n'est monté qu'une fois les vrais taux chargés : ses champs
        // sont initialisés une seule fois, sinon on enregistrerait les valeurs par
        // défaut à la place des taux réels. La clé le réinitialise si les taux changent.
        data ? (
          <SettingsForm
            key={`${data.urssafRate}-${data.driverShareRate}`}
            token={token}
            urssafRate={data.urssafRate}
            driverShareRate={data.driverShareRate}
            onSaved={invalidate}
          />
        ) : (
          <div className="surface-card p-6 text-sm text-muted-foreground">Chargement des taux…</div>
        )
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className="surface-card p-6">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-2xl font-semibold">{isLoading ? "…" : eur(k.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
          </li>
        ))}
      </ul>

      {(data?.drivers ?? []).length > 1 ? (
        <section>
          <h3 className="text-base font-semibold">Répartition entre les chauffeurs — {monthLabel(month)}</h3>
          <div className="surface-card mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Chauffeur</th>
                  <th className="px-5 py-3 font-medium">Courses</th>
                  <th className="px-5 py-3 font-medium">Chiffre d'affaires</th>
                  <th className="px-5 py-3 font-medium">Part reversée</th>
                </tr>
              </thead>
              <tbody>
                {(data?.drivers ?? []).map((d) => (
                  <tr key={d.slug} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">{d.name}</td>
                    <td className="px-5 py-3">{d.rides}</td>
                    <td className="px-5 py-3 font-medium">{eur(d.revenue)}</td>
                    <td className="px-5 py-3">{eur(d.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-base font-semibold">Historique sur 12 mois</h3>
        <div className="surface-card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Mois</th>
                <th className="px-5 py-3 font-medium">Courses</th>
                <th className="px-5 py-3 font-medium">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody>
              {(data?.months ?? []).map((m) => (
                <tr key={m.month} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">{monthLabel(m.month)}</td>
                  <td className="px-5 py-3">{m.rides}</td>
                  <td className="px-5 py-3 font-medium">{eur(m.revenue)}</td>
                </tr>
              ))}
              {(data?.months ?? []).length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-muted-foreground" colSpan={3}>
                    Aucune course enregistrée.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SettingsForm({
  token,
  urssafRate,
  driverShareRate,
  onSaved,
}: {
  token: string;
  urssafRate: number;
  driverShareRate: number;
  onSaved: () => void;
}) {
  const [urssaf, setUrssaf] = useState(String(urssafRate));
  const [share, setShare] = useState(String(driverShareRate));

  const save = useMutation({
    mutationFn: () =>
      driverUpdateAccountingSettings({
        data: {
          token,
          urssaf_rate: Number(urssaf.replace(",", ".")) || 0,
          driver_share_rate: Number(share.replace(",", ".")) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Taux mis à jour");
      onSaved();
    },
    onError: () => toast.error("Enregistrement impossible"),
  });

  return (
    <form
      className="surface-card grid gap-4 p-6 sm:grid-cols-3 sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <label className="text-sm">
        <span className="text-xs text-muted-foreground">Taux URSSAF (%)</span>
        <Input className="mt-2" value={urssaf} onChange={(e) => setUrssaf(e.target.value)} inputMode="decimal" />
      </label>
      <label className="text-sm">
        <span className="text-xs text-muted-foreground">Part reversée au chauffeur (%)</span>
        <Input className="mt-2" value={share} onChange={(e) => setShare(e.target.value)} inputMode="decimal" />
      </label>
      <Button type="submit" variant="gold" disabled={save.isPending}>
        Enregistrer
      </Button>
    </form>
  );
}

/** Onglet « Courses en débordement disponibles » : chacun peut récupérer une course laissée par l'autre. */
function OverflowTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["driver-overflow", token],
    queryFn: () => driverOverflowRides({ data: { as: getProfile(), token } }),
    refetchInterval: 30_000,
  });

  const take = useMutation({
    mutationFn: (id: string) => driverTakeOverflowRide({ data: { as: getProfile(), token, id } }),
    onSuccess: () => {
      toast.success("Course récupérée — elle est dans votre planning");
      qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
      qc.invalidateQueries({ queryKey: ["driver-rides", token] });
    },
    onError: () => toast.error("Course déjà reprise par un autre chauffeur"),
  });

  const rides = data?.rides ?? [];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Courses en débordement</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Courses qu'un chauffeur ne peut pas assurer : le premier qui accepte la récupère.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      </div>

      {rides.length === 0 ? (
        <p className="surface-card mt-5 p-8 text-sm text-muted-foreground">Aucune course en débordement.</p>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {rides.map((r) => (
            <li key={r.id} className="surface-card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs tracking-widest text-gold">{r.tracking_id ?? "—"}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="size-4 text-gold" aria-hidden />
                {new Date(r.pickup_datetime).toLocaleString("fr-FR")}
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                {r.depart} → {r.arrivee ?? r.destination}
              </p>
              <p className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.nom ?? "Client"}</span>
                {r.prix_estime != null ? <span className="font-semibold">{eur(Number(r.prix_estime))}</span> : null}
              </p>
              <div className="mt-4">
                <Button size="sm" variant="gold" disabled={take.isPending} onClick={() => take.mutate(r.id)}>
                  Accepter cette course
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Fenêtre « Accepter / Refuser » : dès qu'une course arrive (nouvelle réservation
 * non attribuée ou course laissée par l'autre chauffeur), elle s'affiche par-dessus
 * l'écran, sans avoir à chercher dans les onglets.
 */
/** Délai d'affichage du popup : à 0 s il se ferme (le débordement automatique est géré côté serveur, cron). */
const ACCEPT_DEADLINE_S = 60;

function IncomingRidePopup({
  token,
  focusId,
  action,
  onOpenRides,
}: {
  token: string;
  focusId: string | null;
  action: string | null;
  onOpenRides: () => void;
}) {
  const qc = useQueryClient();
  const unavailQuery = useQuery({
    queryKey: ["driver-unavail", token],
    queryFn: () => driverUnavailList({ data: { token } }),
    staleTime: 60_000,
  });
  const [refused, setRefused] = useState<string[]>([]);
  // Réservations venues du site : personne n'est encore désigné. Le chauffeur
  // choisit ici à qui la course est attribuée (par défaut le profil actif).
  const [profiles, setProfiles] = useState<DriverProfileEntry[]>(() => cachedDriverProfiles());
  const [assignTo, setAssignTo] = useState<string | undefined>(() => getProfile());
  useEffect(() => {
    let cancelled = false;
    void fetchDriverProfiles()
      .then((list) => {
        if (cancelled || list.length === 0) return;
        setProfiles(list);
        setAssignTo((cur) => cur ?? list[0]?.slug);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["driver-rides", token],
    queryFn: () => driverRides({ data: { as: getProfile(), token } }),
    refetchInterval: 15_000,
  });
  const { data: overflow } = useQuery({
    queryKey: ["driver-overflow", token],
    queryFn: () => driverOverflowRides({ data: { as: getProfile(), token } }),
    refetchInterval: 15_000,
  });

  const me = data?.driver.slug;
  const candidates = useMemo(() => {
    const all = [...(data?.rides ?? []), ...(overflow?.rides ?? [])];
    const seen = new Set<string>();
    return all.filter((r) => {
      if (seen.has(r.id) || refused.includes(r.id)) return false;
      seen.add(r.id);
      if (new Date(r.pickup_datetime).getTime() < Date.now() - 3600_000) return false;
      const free = r.status === "pending" && !r.driver_slug;
      const spill = r.status === "en_debordement" && r.overflow_from_slug !== me;
      return free || spill;
    });
  }, [data, overflow, refused, me]);

  const ride = candidates.find((r) => r.id === focusId) ?? candidates[0] ?? null;
  const destination = ride?.arrivee ?? ride?.destination ?? null;

  // --- Itinéraires (3 alternatives) ---
  const [routes, setRoutes] = useState<RouteAlternative[] | null>(null);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<number>(0);

  const priceFor = useCallback(
    (r: RouteAlternative) => (ride ? detaillerPrix(r.km, ride.pickup_datetime, r.min).total : null),
    [ride?.pickup_datetime],
  );
  const chosenRoute = routes?.find((r) => r.id === chosen) ?? null;
  const displayedPrice = chosenRoute
    ? priceFor(chosenRoute)
    : ride?.prix_estime != null
      ? Number(ride.prix_estime)
      : null;

  useEffect(() => {
    if (!ride?.depart || !destination) return;
    let cancelled = false;
    setRoutes(null);
    setRoutesError(null);
    getRouteAlternatives(ride.depart, destination)
      .then((r) => {
        if (cancelled) return;
        setRoutes(r);
        setChosen(r[0]?.id ?? 0);
      })
      .catch(() => {
        if (!cancelled) setRoutesError("Itinéraires indisponibles.");
      });
    return () => {
      cancelled = true;
    };
  }, [ride?.id, ride?.depart, destination]);

  const accept = useMutation({
    mutationFn: async (r: DriverRide) => {
      const who = assignTo ?? getProfile();
      if (r.status === "en_debordement") return driverTakeOverflowRide({ data: { as: who, token, id: r.id } });
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
        );
      });
      const r2 = routes?.find((x) => x.id === chosen) ?? null;
      return driverAcceptRide({
        data: {
          // Course attribuée au chauffeur choisi dans le popup (par défaut le profil actif).
          as: who,
          token,
          id: r.id,
          latitude: pos?.coords.latitude ?? null,
          longitude: pos?.coords.longitude ?? null,
          accuracy: pos?.coords.accuracy ?? null,
          heading: pos?.coords.heading ?? null,
          speed: pos?.coords.speed ?? null,
          route: r2 ? { label: r2.label, km: r2.km, min: r2.min, coords: r2.coords } : null,
        },
      });
    },
    onSuccess: () => {
      // Idem : plus de redirection immédiate, elle se fera automatiquement
      // à l'approche du point de rdv (≤15 min réelles).
      toast.success("Course acceptée");
      qc.invalidateQueries({ queryKey: ["driver-rides", token] });
      qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
      onOpenRides();
    },
    onError: () => toast.error("Course déjà prise"),
  });

  const rideId = ride?.id ?? null;
  const rideStatus = ride?.status ?? null;

  // Refs : gardent `decline` stable (le minuteur n'est plus recréé à chaque rendu).
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const declining = useRef<Set<string>>(new Set());

  /**
   * Refus d'une course (manuel ou temps écoulé) → elle part en débordement pour l'équipe.
   * Garde-fous contre les courses concurrentes entre les deux chauffeurs :
   *  1. Le popup se ferme tout de suite en local, mais la course n'est envoyée en débordement
   *     qu'après une revérification FRAÎCHE : si elle a été acceptée ou déjà mise en
   *     débordement par l'autre chauffeur entre-temps, on ne touche à rien.
   *  2. Sur temps écoulé, les appareils sont décalés selon le rang du profil (3 s par rang) :
   *     le premier passe, le suivant voit alors la course déjà en débordement et s'abstient.
   *  3. Une course déjà en débordement n'est jamais renvoyée en débordement.
   *  4. Un temps écoulé sans réseau ne met JAMAIS la course en débordement.
   */
  const decline = useCallback(
    async (id: string, status: string | null, auto: boolean) => {
      if (declining.current.has(id)) return;
      declining.current.add(id);
      setRefused((v) => (v.includes(id) ? v : [...v, id]));
      try {
        if (status === "en_debordement") {
          toast.message(auto ? "Temps écoulé" : "Course refusée");
          return;
        }
        if (auto) {
          const rank = Math.max(
            0,
            profilesRef.current.findIndex((p) => p.slug === getProfile()),
          );
          if (rank > 0) await new Promise((r) => setTimeout(r, rank * 3000));
        }
        const fresh = await qc
          .fetchQuery({
            queryKey: ["driver-rides", token],
            queryFn: () => driverRides({ data: { as: getProfile(), token } }),
            staleTime: 0,
          })
          .catch(() => null);
        if (fresh) {
          const current = fresh.rides.find((r) => r.id === id);
          if (!current || current.status !== "pending" || current.driver_slug) {
            toast.message("Course déjà prise en charge par l'équipe");
            return;
          }
        } else if (auto) {
          toast.message("Temps écoulé");
          return;
        }
        try {
          await driverOverflowRide({ data: { as: getProfile(), token, id } });
          toast.message(auto ? "Temps écoulé — course proposée à l'équipe" : "Course refusée");
        } catch (e) {
          if (e instanceof Error && e.message.includes("ride_unavailable")) {
            toast.message("Course déjà prise en charge par l'équipe");
          } else {
            toast.error("Impossible de proposer la course à l'équipe");
          }
        }
        qc.invalidateQueries({ queryKey: ["driver-rides", token] });
        qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
      } finally {
        declining.current.delete(id);
      }
    },
    [qc, token],
  );

  // Deadline calculée à partir d'un instant fixe (le premier instant où ce popup a vu
  // la course), et non plus depuis le montage du composant : rouvrir l'app depuis la
  // notification (tap, 40 s plus tard par ex.) affiche le temps réellement restant.
  // Dès que le backend expose offered_at/assigned_at, on bascule sur cette valeur
  // serveur — la source de vérité pour le débordement reste de toute façon le job
  // planifié côté serveur (voir note plus bas), le popup n'étant que l'UI.
  const firstSeenRef = useRef<Map<string, number>>(new Map());
  const deadline = useMemo(() => {
    if (!ride) return null;
    const serverRide = ride as unknown as { offered_at?: string; assigned_at?: string };
    // Une course qui passe en débordement repart sur une NOUVELLE fenêtre de 60 s pour l'autre
    // chauffeur : on ne réutilise ni la date d'offre d'origine ni l'ancien instant « vu la
    // première fois » (sinon son popup se fermait aussitôt, avant qu'il puisse répondre).
    const serverBase = ride.status === "en_debordement" ? undefined : (serverRide.offered_at ?? serverRide.assigned_at);
    if (serverBase) return new Date(serverBase).getTime() + ACCEPT_DEADLINE_S * 1000;
    const key = `${ride.id}:${ride.status}`;
    if (!firstSeenRef.current.has(key)) firstSeenRef.current.set(key, Date.now());
    return (firstSeenRef.current.get(key) ?? Date.now()) + ACCEPT_DEADLINE_S * 1000;
  }, [ride]);

  const [left, setLeft] = useState(ACCEPT_DEADLINE_S);

  useEffect(() => {
    if (!rideId || !deadline) return;
    // `timer` doit être déclaré avant `tick` (avec `let`, pas `const` défini
    // plus bas) : `tick()` est appelée immédiatement, avant que l'intervalle
    // ne soit créé, et peut donc referencer un délai déjà écoulé (ex. app
    // rouverte depuis une notification reçue 40 s plus tôt) — dans ce cas
    // `window.clearInterval(timer)` était appelé sur une variable `const`
    // pas encore initialisée, ce qui plantait le composant (ReferenceError).
    let timer: number | undefined;
    const tick = () => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      setLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        if (timer != null) window.clearInterval(timer);
        // Temps écoulé : on ferme seulement le popup en local. Le passage en
        // débordement est géré côté serveur (cron automations : 10 min sans
        // chauffeur ou départ dans moins de 60 min).
        setRefused((v) => (v.includes(rideId) ? v : [...v, rideId]));
      }
    };
    tick();
    timer = Number(window.setInterval(tick, 1000));
    return () => {
      if (timer != null) window.clearInterval(timer);
    };
  }, [rideId, rideStatus, deadline]);

  // Tap sur la notification : ouvre le popup sur la bonne course, mais ne valide
  // plus rien tout seul pour "accept" — le chauffeur doit choisir un itinéraire
  // et taper "Accepter" lui-même. Seul "refuse" reste automatique.
  const handledAction = useRef<string | null>(null);
  useEffect(() => {
    if (!ride || !action || !focusId || ride.id !== focusId) return;
    if (handledAction.current === `${focusId}:${action}`) return;
    handledAction.current = `${focusId}:${action}`;
    if (action === "refuse") void decline(ride.id, ride.status, false);
    if (typeof window !== "undefined") window.history.replaceState(null, "", "/driver");
  }, [ride, action, focusId, decline]);

  if (!ride) return null;

  const absentNow = unavailQuery.data?.absentNow ?? [];
  return (
    <div className="drv-popup-backdrop" role="dialog" aria-modal="true" aria-label="Nouvelle course">
      <div className="drv-popup">
        <p className="drv-popup-kicker">
          {ride.status === "en_debordement" ? "Course en débordement" : "Nouvelle course"}
          <span style={{ float: "right", fontVariantNumeric: "tabular-nums" }}>{left} s</span>
        </p>
        <div
          aria-hidden
          style={{
            height: 4,
            borderRadius: 999,
            background: "rgba(255,255,255,.15)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(left / ACCEPT_DEADLINE_S) * 100}%`,
              background: left > 15 ? "#e8b84b" : "#ef4444",
              transition: "width 1s linear",
            }}
          />
        </div>
        <p className="drv-popup-when">{new Date(ride.pickup_datetime).toLocaleString("fr-FR")}</p>
        <p className="drv-popup-route">
          <span>↑ {ride.depart}</span>
          <span>↓ {destination}</span>
        </p>
        <p className="drv-popup-meta">
          <span>{ride.nom ?? "Client"}</span>
          {displayedPrice != null ? <b>{eur(displayedPrice)}</b> : null}
        </p>

        <div className="mt-3" style={{ borderTop: "1px solid rgba(246,240,229,.12)", paddingTop: 10 }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              color: "rgba(246,240,229,.55)",
            }}
          >
            Itinéraire
          </p>
          {routesError ? (
            <p style={{ fontSize: 12, color: "#e0b866" }}>{routesError}</p>
          ) : !routes ? (
            <p style={{ fontSize: 12, opacity: 0.7 }}>Calcul…</p>
          ) : (
            <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
              {routes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setChosen(r.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    textAlign: "left",
                    border: chosen === r.id ? "1px solid #c99b4a" : "1px solid rgba(246,240,229,.15)",
                    background: chosen === r.id ? "rgba(201,155,74,.12)" : "transparent",
                    color: chosen === r.id ? "#e0b866" : "#f6f0e5",
                  }}
                >
                  <span>{r.label}</span>
                  <span>
                    {r.km} km · {r.min} min · {eur(priceFor(r) ?? 0)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {profiles.length > 1 ? (
          <div className="mt-3" style={{ borderTop: "1px solid rgba(246,240,229,.12)", paddingTop: 10 }}>
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                color: "rgba(246,240,229,.55)",
              }}
            >
              Chauffeur assigné
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {profiles.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  disabled={absentNow.includes(p.slug)}
                  title={absentNow.includes(p.slug) ? "Absent (planning)" : undefined}
                  onClick={() => setAssignTo(p.slug)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    border: assignTo === p.slug ? "1px solid #c99b4a" : "1px solid rgba(246,240,229,.15)",
                    background: assignTo === p.slug ? "rgba(201,155,74,.12)" : "transparent",
                    color: assignTo === p.slug ? "#e0b866" : "#f6f0e5",
                  }}
                >
                  {p.name}
                  {absentNow.includes(p.slug) ? " · absent" : ""}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="drv-popup-actions">
          <button type="button" className="drv-popup-refuse" onClick={() => void decline(ride.id, ride.status, false)}>
            Refuser
          </button>
          <button
            type="button"
            className="drv-popup-accept"
            disabled={accept.isPending}
            onClick={() => accept.mutate(ride)}
          >
            {accept.isPending ? "…" : "Accepter"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Tableau de bord chauffeur (style maquette flotte) : statut, disponibilité,
 * course en cours, calendrier, messages et carte de l'équipe, en une seule
 * page tactile.
 */
/** Lit la version active du service worker FCM via postMessage (même méthode que firebase.ts). */
function readSwVersion(reg: ServiceWorkerRegistration): Promise<string | null> {
  return new Promise((resolve) => {
    const active = reg.active;
    if (!active) {
      resolve(null);
      return;
    }
    const channel = new MessageChannel();
    const timeout = setTimeout(() => resolve(null), 2000);
    channel.port1.onmessage = (ev) => {
      clearTimeout(timeout);
      resolve((ev.data as { version?: string })?.version ?? null);
    };
    active.postMessage({ type: "FCM_SW_VERSION" }, [channel.port2]);
  });
}

type NotifDiag = {
  permission: string;
  standalone: boolean;
  configured: boolean;
  registeredToken: boolean;
  tokenSuffix: string | null;
  tokenAgeDays: number | null;
  failureReason: string | null;
  failureDetail: string | null;
  swCount: number;
  swVersion: string | null;
  swScopes: string[];
};

function rideExtra(r: DriverRide, keys: string[]): string | null {
  const o = r as unknown as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if ((typeof v === "string" && v.trim()) || typeof v === "number") return String(v).trim();
  }
  return null;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(246,240,229,.08)" }}>
      <div
        style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#c99b4a", fontWeight: 800 }}
      >
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, wordBreak: "break-word" }}>{children}</div>
    </div>
  );
}

/** Détail d'UNE course (ouvert depuis « Prochaines courses ») : coordonnées client + 3 boutons. */
function RideDetailPage({
  ride,
  mine,
  token,
  driverName,
  onClose,
  onChanged,
}: {
  ride: DriverRide;
  mine: boolean;
  me: string | undefined;
  token: string;
  driverName: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const gps = useLiveGps(token);
  const { paused, setPausedIds } = usePausedRides();
  const isPaused = paused.includes(ride.id);
  const destination = ride.arrivee ?? ride.destination;
  const email = rideExtra(ride, ["email", "client_email", "mail"]);
  const passagers = rideExtra(ride, ["passagers"]);
  const bagages = rideExtra(ride, ["bagages"]);
  const started = ["in_progress", "arrived", "en_route"].includes(ride.status);
  const canAct =
    mine && ["accepted", "confirmed", "assigned", "en_route", "in_progress", "arrived"].includes(ride.status);

  const setStatus = useMutation({
    mutationFn: (status: "in_progress" | "arrived" | "completed") =>
      driverSetStatus({ data: { as: getProfile(), token, id: ride.id, status } }),
    onSuccess: (_d, status) => {
      if (status === "completed") toast.success("Course terminée");
      onChanged();
    },
    onError: (e) => toast.error((e as Error)?.message || "Changement de statut impossible"),
  });

  const cancel = useMutation({
    mutationFn: () => driverSetStatus({ data: { as: getProfile(), token, id: ride.id, status: "cancelled" } }),
    onSuccess: () => {
      toast.success("Course annulée");
      onChanged();
      onClose();
    },
    onError: (e) => toast.error((e as Error)?.message || "Annulation impossible"),
  });
  const cancellable = !["completed", "cancelled"].includes(ride.status);

  // Arrivée / fin / pause automatiques : gérées par DriverBackgroundTasks (« En route »
  // reste manuel : uniquement par le bouton).

  const onEnRoute = () => {
    void gps.start();
    setPausedIds((p) => p.filter((x) => x !== ride.id));
    if (!started) setStatus.mutate("in_progress");
    if (ride.tracking_id) {
      navigate({ to: "/suivi/$id", params: { id: ride.tracking_id as string }, search: {} });
    } else {
      toast.error("Lien de suivi indisponible pour cette course");
    }
  };
  const onPause = () => {
    setPausedIds((p) => [...p.filter((x) => x !== ride.id), ride.id]);
    void gps.stop();
    toast.info("Course en pause");
  };
  const onResume = () => {
    setPausedIds((p) => p.filter((x) => x !== ride.id));
    void gps.start();
    toast.success("Course reprise");
  };

  const btn: React.CSSProperties = { flex: "1 1 0", minWidth: 0, padding: "12px 6px", fontSize: 12.5 };

  return (
    <div className="drv-rides-page" style={{ zIndex: 90 }}>
      <div className="drv-rides-head">
        <button type="button" className="drv-rides-back" onClick={onClose} aria-label="Retour">
          <ArrowLeft />
        </button>
        <h2>Détail de la course</h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs tracking-widest text-gold">{ride.tracking_id ?? "—"}</span>
        <StatusBadge status={ride.status} />
      </div>

      <DetailRow label="Client">{ride.nom ?? "Client"}</DetailRow>
      <DetailRow label="Téléphone">
        {ride.telephone ? (
          <a href={`tel:${ride.telephone.replace(/\s/g, "")}`} className="text-gold">
            {ride.telephone}
          </a>
        ) : (
          "—"
        )}
      </DetailRow>
      <DetailRow label="E-mail">
        {email ? (
          <a href={`mailto:${email}`} className="text-gold">
            {email}
          </a>
        ) : (
          "—"
        )}
      </DetailRow>
      <DetailRow label="Prise en charge">
        {new Date(ride.pickup_datetime).toLocaleString("fr-FR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </DetailRow>
      <DetailRow label="Départ">{ride.depart ?? "—"}</DetailRow>
      <DetailRow label="Arrivée">{destination ?? "—"}</DetailRow>
      {passagers || bagages ? (
        <DetailRow label="Passagers / bagages">
          {passagers ?? "—"} / {bagages ?? "—"}
        </DetailRow>
      ) : null}
      {ride.prix_estime != null ? <DetailRow label="Prix estimé">{eur(Number(ride.prix_estime))}</DetailRow> : null}
      <DetailRow label="Chauffeur">{driverName ?? "Non attribuée"}</DetailRow>

      {ride.telephone ? (
        <div className="drv-rides-actions" style={{ marginTop: 14 }}>
          <a className="drv-rides-btn" href={`tel:${ride.telephone.replace(/\s/g, "")}`}>
            <Phone size={14} aria-hidden /> Appeler
          </a>
          <a
            className="drv-rides-btn drv-rides-btn-sms"
            href={smsLink(
              ride.telephone,
              buildRideSmsMessage({
                nom: ride.nom,
                pickup: new Date(ride.pickup_datetime),
                trackingId: ride.tracking_id,
              }),
            )}
          >
            <MessageSquarePlus size={14} aria-hidden /> SMS
          </a>
          <a className="drv-rides-btn" href={waLink(ride.telephone)} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      ) : null}

      {canAct ? (
        <>
          {isPaused ? (
            <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Course en pause — statut automatique suspendu.
            </p>
          ) : null}
          <div className="drv-rides-actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="drv-rides-btn"
              style={{
                ...btn,
                background: "linear-gradient(180deg,#e0b866,#c99b4a)",
                color: "#0a1118",
                border: 0,
                fontWeight: 800,
              }}
              onClick={onEnRoute}
              disabled={setStatus.isPending}
            >
              En route
            </button>
            <button
              type="button"
              className="drv-rides-btn drv-rides-btn-spill"
              style={btn}
              onClick={isPaused ? onResume : onPause}
              disabled={!started}
            >
              {isPaused ? "Reprendre" : "Mettre en pause"}
            </button>
            <button
              type="button"
              className="drv-rides-btn drv-rides-btn-done"
              style={btn}
              onClick={() => {
                if (window.confirm("Clôturer la course ? Le client verra qu'elle est terminée."))
                  setStatus.mutate("completed");
              }}
              disabled={setStatus.isPending}
            >
              Course terminée
            </button>
          </div>
          <p className="drv-real-hint" style={{ marginTop: 8 }}>
            « En route » est manuel. Pause (arrêt de plus de 5 min) et fin de course (arrivée à destination) se
            déclenchent automatiquement ; les boutons restent disponibles en secours.
          </p>
        </>
      ) : null}

      {cancellable ? (
        <div className="drv-rides-actions" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="drv-rides-btn drv-rides-btn-cancel"
            style={{ padding: "12px 6px", fontSize: 12.5 }}
            disabled={cancel.isPending}
            onClick={() => {
              if (window.confirm("Annuler cette course ? Vous ne pouvez pas l'assurer.")) cancel.mutate();
            }}
          >
            {cancel.isPending ? "Annulation…" : "Annuler la course"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CompletedRidesTab({ token }: { token: string }) {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<DriverRide[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const qc = useQueryClient();
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["driver-completed-rides", token, page],
    queryFn: () => driverCompletedRides({ data: { as: getProfile(), token, page } }),
  });

  useEffect(() => {
    if (!data) return;
    setRows((previous) =>
      page === 0
        ? data.rides
        : [...previous.filter((ride) => !data.rides.some((next) => next.id === ride.id)), ...data.rides],
    );
  }, [data, page]);

  const detail = rows.find((ride) => ride.id === detailId);
  return (
    <div>
      <h2 className="mt-6 text-2xl font-semibold">Courses terminées</h2>
      {isPending && rows.length === 0 ? <p className="drv-rides-sec-empty">Chargement des courses…</p> : null}
      {isError ? <p className="drv-rides-sec-empty">Impossible de charger les courses terminées.</p> : null}
      {!isPending && !isError && rows.length === 0 ? (
        <p className="drv-rides-sec-empty">Aucune course terminée.</p>
      ) : null}
      <div className="drv-rides-sec">
        {rows.map((ride) => (
          <Button
            key={ride.id}
            type="button"
            variant="outline"
            className="drv-rides-item flex h-auto w-full flex-col items-start gap-1 text-left"
            onClick={() => setDetailId(ride.id)}
          >
            <span className="w-full truncate text-sm font-semibold">
              {ride.nom ?? "Client"} · {ride.tracking_id ?? "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(ride.pickup_datetime).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
            </span>
            <span className="w-full truncate text-xs">
              {ride.depart} → {ride.arrivee ?? ride.destination}
            </span>
            <span className="text-xs text-muted-foreground">{ride.driver_slug ?? "Non attribuée"}</span>
          </Button>
        ))}
      </div>
      {data?.hasMore ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          disabled={isFetching}
          onClick={() => setPage((current) => current + 1)}
        >
          Voir plus de courses
        </Button>
      ) : null}
      {detail ? (
        <RideDetailPage
          key={detail.id}
          ride={detail}
          mine={false}
          me={getProfile()}
          token={token}
          driverName={detail.driver_slug}
          onClose={() => setDetailId(null)}
          onChanged={() => {
            qc.invalidateQueries({ queryKey: ["driver-completed-rides", token] });
            qc.invalidateQueries({ queryKey: ["driver-rides", token] });
          }}
        />
      ) : null}
    </div>
  );
}

function DashboardTab({ token, unread, onGo }: { token: string; unread: number; onGo: (t: Tab) => void }) {
  const qc = useQueryClient();
  const [mapOpen, setMapOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"clients" | "drivers">("clients");
  const [manualOpen, setManualOpen] = useState(false);
  const [ridesOpen, setRidesOpen] = useState(false);
  const [ridesMode, setRidesMode] = useState<"upcoming" | "completed">("upcoming");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [clientsMode, setClientsMode] = useState<"cards" | "calls">("cards");
  const [financeOpen, setFinanceOpen] = useState(false);
  const [financeMode, setFinanceMode] = useState<"accounting" | "stats">("accounting");
  const [diagMode, setDiagMode] = useState<"debug" | "sound" | "backups">("debug");
  const [planningOpen, setPlanningOpen] = useState(false);
  const [planningMode, setPlanningMode] = useState<"calendar" | "absences">("calendar");
  const [notifDebugOpen, setNotifDebugOpen] = useState(false);
  const [diag, setDiag] = useState<NotifDiag | null>(null);
  const notifPush = usePushNotifications();

  const refreshDiag = useCallback(() => {
    if (typeof window === "undefined") return;
    const permission = "Notification" in window ? Notification.permission : "n/a";
    const standalone = Boolean(
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true,
    );
    const cachedToken = window.localStorage.getItem("fcm_token");
    const registeredToken = Boolean(window.localStorage.getItem("npr_push_registered:v1:chauffeur"));
    const lastRefresh = parseInt(window.localStorage.getItem("fcm_token_last_refresh") ?? "0", 10);
    const tokenAgeDays = cachedToken && lastRefresh ? Math.floor((Date.now() - lastRefresh) / 86400000) : null;
    const failure = getLastFcmFailure();
    setDiag({
      permission,
      standalone,
      configured: isFirebaseConfigured(),
      registeredToken,
      tokenSuffix: cachedToken ? cachedToken.slice(-8) : null,
      tokenAgeDays,
      failureReason: failure?.reason ?? null,
      failureDetail: failure?.detail ?? null,
      swCount: 0,
      swVersion: null,
      swScopes: [],
    });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(async (regs) => {
        const fcmReg = regs.find((r) =>
          [r.active, r.installing, r.waiting].some((w) => w?.scriptURL.includes("/firebase-messaging-sw.js")),
        );
        const swVersion = fcmReg ? await readSwVersion(fcmReg) : null;
        setDiag((d) =>
          d
            ? {
                ...d,
                swCount: regs.length,
                swVersion,
                swScopes: regs.map((r) => `${r.scope} → ${r.active?.scriptURL.split("/").pop() ?? "inactif"}`),
              }
            : d,
        );
      });
    }
  }, []);

  useEffect(() => {
    if (notifDebugOpen) refreshDiag();
  }, [notifDebugOpen, refreshDiag]);

  const ridesQuery = useQuery({
    queryKey: ["driver-rides", token],
    queryFn: () => driverRides({ data: { as: getProfile(), token } }),
    refetchInterval: 30_000,
  });
  const gpsQuery = useQuery({
    queryKey: ["driver-gps", token],
    queryFn: () => driverGpsState({ data: { as: getProfile(), token } }),
    refetchInterval: 20_000,
  });

  const me = ridesQuery.data?.driver.slug;
  const rides = ridesQuery.data?.rides ?? [];
  const drivers = ridesQuery.data?.drivers ?? [];

  // Badge « non lus » du chat d'équipe : les messages des autres arrivés après la
  // dernière ouverture du chat (repère gardé localement, par profil).
  const teamChatQuery = useQuery({
    queryKey: ["driver-team-chat", token],
    queryFn: () => driverTeamChat({ data: { as: getProfile(), token } }),
    refetchInterval: 15_000,
  });
  const chatSeenKey = `nova_team_chat_seen_${me ?? getProfile() ?? ""}`;
  const [chatSeen, setChatSeen] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    try {
      const v = localStorage.getItem(chatSeenKey);
      setChatSeen(v ? Number(v) : null);
    } catch {
      setChatSeen(null);
    }
  }, [chatSeenKey]);
  const chatRows = teamChatQuery.data ?? [];
  const lastChatAt = chatRows.length ? new Date(chatRows[chatRows.length - 1]!.created_at).getTime() : null;
  const markChatSeen = useCallback(() => {
    if (lastChatAt == null) return;
    setChatSeen(lastChatAt);
    try {
      localStorage.setItem(chatSeenKey, String(lastChatAt));
    } catch {
      /* stockage indisponible */
    }
  }, [lastChatAt, chatSeenKey]);
  useEffect(() => {
    // Ouvert : tout est lu. Premier lancement : pas de badge sur l'historique existant.
    if ((chatOpen && chatMode === "drivers") || chatSeen === null) markChatSeen();
  }, [chatOpen, chatMode, chatSeen, markChatSeen]);
  const chatUnread =
    chatSeen == null
      ? 0
      : chatRows.filter((m) => m.sender_slug !== (me ?? getProfile()) && new Date(m.created_at).getTime() > chatSeen)
          .length;
  const names = useMemo(() => Object.fromEntries(drivers.map((d) => [d.slug, d.name])), [drivers]);

  const invalidateRides = () => {
    qc.invalidateQueries({ queryKey: ["driver-rides", token] });
    qc.invalidateQueries({ queryKey: ["driver-accounting", token] });
    qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
    qc.invalidateQueries({ queryKey: ["driver-completed-rides", token] });
  };
  // Depuis la page « Prochaines courses » : clôturer une course acceptée (même non démarrée)
  // ou la passer en débordement pour l'équipe.
  const completeRide = useMutation({
    mutationFn: (id: string) => driverSetStatus({ data: { as: getProfile(), token, id, status: "completed" } }),
    onSuccess: () => {
      toast.success("Course terminée");
      invalidateRides();
    },
    onError: () => toast.error("Clôture impossible"),
  });
  const spillRide = useMutation({
    mutationFn: (id: string) => driverOverflowRide({ data: { as: getProfile(), token, id } }),
    onSuccess: (res) => {
      toast.success(res.notified > 0 ? "Course proposée à l'équipe" : "Course mise en débordement");
      invalidateRides();
    },
    onError: () => toast.error("Mise en débordement impossible"),
  });
  // Annulation : le chauffeur ne peut pas assurer la course.
  const cancelRide = useMutation({
    mutationFn: (id: string) => driverSetStatus({ data: { as: getProfile(), token, id, status: "cancelled" } }),
    onSuccess: () => {
      toast.success("Course annulée");
      invalidateRides();
    },
    onError: (e) => toast.error((e as Error)?.message || "Annulation impossible"),
  });
  const [timeEdit, setTimeEdit] = useState<{ id: string; value: string } | null>(null);
  const rescheduleRide = useMutation({
    mutationFn: (v: { id: string; value: string }) =>
      driverRescheduleRide({
        data: { as: getProfile(), token, id: v.id, pickup_datetime: new Date(v.value).toISOString() },
      }),
    onSuccess: () => {
      toast.success("Horaire modifié, client prévenu");
      setTimeEdit(null);
      invalidateRides();
    },
    onError: () => toast.error("Modification de l'horaire impossible"),
  });
  const deleteRide = useMutation({
    mutationFn: (id: string) => driverDeleteRide({ data: { as: getProfile(), token, id } }),
    onSuccess: () => {
      toast.success("Course supprimée");
      invalidateRides();
    },
    onError: () => toast.error("Suppression impossible"),
  });

  // « En course » = course réellement démarrée (en route / arrivé). Une course simplement
  // acceptée (« confirmed ») reste « Prochaine course » jusqu'à son départ, même si elle est
  // prévue dans plusieurs jours.
  // Compte partagé : une course attribuée au profil commun « equipe » (ou à l'autre
  // profil quand on est connecté en « equipe ») compte aussi pour le chauffeur affiché,
  // sinon les compteurs affichent 0 alors que les courses sont bien listées.
  const isMine = useCallback(
    (slug: string | null) => slug != null && (slug === me || slug === "equipe" || me === "equipe"),
    [me],
  );

  const active = rides.find((r) => isMine(r.driver_slug) && ["en_route", "in_progress", "arrived"].includes(r.status));
  const todayCount = rides.filter(
    (r) =>
      isMine(r.driver_slug) &&
      new Date(r.pickup_datetime).toDateString() === new Date().toDateString() &&
      r.status !== "cancelled",
  ).length;
  const openRideCount = rides.filter(
    (r) =>
      (isMine(r.driver_slug) && !["completed", "cancelled", "refused"].includes(r.status)) ||
      (!r.driver_slug && r.status === "pending") ||
      (r.status === "en_debordement" && r.overflow_from_slug === me),
  ).length;

  // Sections de la page « Prochaines courses » : en attente / acceptées / en cours.
  const pendingRides = rides
    .filter(
      (r) =>
        (isMine(r.driver_slug) && ["pending", "en_debordement"].includes(r.status)) ||
        // Courses du site pas encore attribuées, et courses que j'ai moi-même mises en débordement
        // (driver_slug vide) : sinon elles n'apparaissaient nulle part sur cette page.
        (!r.driver_slug && r.status === "pending") ||
        (r.status === "en_debordement" && r.overflow_from_slug === me),
    )
    .sort((a, b) => +new Date(a.pickup_datetime) - +new Date(b.pickup_datetime));
  const acceptedRides = rides
    .filter((r) => isMine(r.driver_slug) && ["accepted", "confirmed", "assigned"].includes(r.status))
    .sort((a, b) => +new Date(a.pickup_datetime) - +new Date(b.pickup_datetime));
  const inProgressRides = rides
    .filter((r) => isMine(r.driver_slug) && ["en_route", "in_progress", "arrived"].includes(r.status))
    .sort((a, b) => +new Date(a.pickup_datetime) - +new Date(b.pickup_datetime));

  const recentCalls = useMemo(
    () =>
      rides
        .filter((r) => (isMine(r.driver_slug) || !r.driver_slug) && r.telephone && r.status !== "cancelled")
        .sort((a, b) => +new Date(b.pickup_datetime) - +new Date(a.pickup_datetime))
        .slice(0, 8),
    [rides, isMine],
  );

  const myGps = (gpsQuery.data?.rows ?? []).find((g) => g.id === me);
  const online = Boolean(myGps?.is_active);

  const setAvailability = useMutation({
    mutationFn: async (next: boolean) => {
      // Arrêt : passe par le suivi partagé, qui coupe aussi le battement de cœur en cours
      // (sinon la position continuerait d'être renvoyée juste après l'arrêt).
      if (!next) return stopLiveGps();
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
        );
      });
      if (!pos) throw new Error("no_position");
      return driverGpsPush({
        data: {
          as: getProfile(),
          token,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
        },
      });
    },
    onSuccess: (_d, next) => {
      toast.success(next ? "Vous êtes disponible" : "Vous n'êtes plus disponible");
      qc.invalidateQueries({ queryKey: ["driver-gps", token] });
    },
    onError: () => {
      toast.error("Position indisponible — autorisez la localisation");
    },
  });

  const teamRows = (gpsQuery.data?.rows ?? []).map((g) => ({
    id: g.id,
    latitude: g.latitude,
    longitude: g.longitude,
    is_active: g.is_active,
  }));

  return (
    <div>
      <h2 className="mt-6 text-2xl font-semibold">Tableau de bord</h2>

      {/* Icônes carrées, ordre fixe, grille responsive (2 col. très petit mobile → 5 col. desktop). */}
      <div className="drv-dash-grid">
        <button type="button" className="drv-tile" onClick={() => setManualOpen(true)}>
          <span className="drv-tile-ico" style={{ background: "#f97316" }}>
            <MessageSquarePlus />
          </span>
          <span className="drv-tile-label">Formulaire résa</span>
        </button>

        <button
          type="button"
          className="drv-tile"
          onClick={() => {
            setRidesOpen(true);
          }}
        >
          <span className="drv-tile-ico" style={{ background: active ? "#e11d48" : "#3f3f46" }}>
            <IconCar />
          </span>
          <span className="drv-tile-label">Prochaines courses</span>
          {openRideCount > 0 ? <span className="drv-tile-badge">{openRideCount}</span> : null}
        </button>

        <button type="button" className="drv-tile" onClick={() => onGo("overflow")}>
          <span className="drv-tile-ico" style={{ background: "#f59e0b" }}>
            <IconSwap />
          </span>
          <span className="drv-tile-label">Débordement</span>
        </button>

        <button type="button" className="drv-tile" onClick={() => setClientsOpen(true)}>
          <span className="drv-tile-ico" style={{ background: "#0d9488" }}>
            <Contact />
          </span>
          <span className="drv-tile-label">Clients</span>
          {recentCalls.length > 0 ? <span className="drv-tile-badge">{recentCalls.length}</span> : null}
        </button>

        <button type="button" className="drv-tile" onClick={() => setChatOpen(true)}>
          <span className="drv-tile-ico" style={{ background: "#db2777" }}>
            <IconMessage />
          </span>
          <span className="drv-tile-label">Chat</span>
          {unread + chatUnread > 0 ? <span className="drv-tile-badge">{unread + chatUnread}</span> : null}
        </button>

        <button type="button" className="drv-tile" onClick={() => setPlanningOpen(true)}>
          <span className="drv-tile-ico" style={{ background: "#2563eb" }}>
            <IconCalendar />
          </span>
          <span className="drv-tile-label">Calendrier</span>
          {todayCount > 0 ? <span className="drv-tile-badge">{todayCount}</span> : null}
        </button>

        <button type="button" className="drv-tile" onClick={() => setFinanceOpen(true)}>
          <span className="drv-tile-ico" style={{ background: "#8b5cf6" }}>
            <IconCalc />
          </span>
          <span className="drv-tile-label">Compta &amp; stats</span>
        </button>

        <button type="button" className="drv-tile" onClick={() => setMapOpen((v) => !v)}>
          <span className="drv-tile-ico" style={{ background: "#0ea5e9" }}>
            <IconMapPin />
          </span>
          <span className="drv-tile-label">Carte équipe</span>
          {teamRows.some((r) => r.is_active) ? <span className="drv-tile-dot" /> : null}
        </button>

        <button
          type="button"
          className="drv-tile"
          disabled={setAvailability.isPending}
          onClick={() => setAvailability.mutate(!online)}
        >
          <span className="drv-tile-ico" style={{ background: online ? "#16a34a" : "#3f3f46" }}>
            <IconMapPin />
          </span>
          <span className="drv-tile-label">{online ? "Disponible" : "Indisponible"}</span>
          {online ? <span className="drv-tile-dot" /> : null}
        </button>

        <button type="button" className="drv-tile" onClick={() => setNotifDebugOpen(true)}>
          <span className="drv-tile-ico" style={{ background: "#64748b" }}>
            <Settings2 size={18} />
          </span>
          <span className="drv-tile-label">Diagnostic &amp; sauvegardes</span>
        </button>
      </div>

      {manualOpen ? (
        <ManualBookingDialog
          token={token}
          drivers={drivers}
          onClose={() => setManualOpen(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ["driver-rides", token] })}
        />
      ) : null}

      {notifDebugOpen ? (
        <FullPage
          title="Diagnostic & sauvegardes"
          onClose={() => setNotifDebugOpen(false)}
          tabs={
            <SubTabs
              value={diagMode}
              onChange={setDiagMode}
              options={[
                { key: "debug", label: "Diagnostic" },
                { key: "sound", label: "Test son" },
                { key: "backups", label: "Sauvegardes" },
              ]}
            />
          }
        >
          {diagMode === "backups" ? (
            <BackupsPage embedded token={token} onClose={() => setNotifDebugOpen(false)} />
          ) : diagMode === "sound" ? (
            <SoundDebugPage embedded onClose={() => setDiagMode("debug")} />
          ) : (
            <div className="drv-dash-map" style={{ padding: 12, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ fontSize: 13 }}>Diagnostic notifications / son</strong>
                <Button variant="ghost" size="sm" onClick={refreshDiag}>
                  <RefreshCw className="size-4" /> Rafraîchir
                </Button>
              </div>

              {diag ? (
                <div style={{ display: "grid", gap: 4, fontSize: 12.5 }}>
                  <DiagRow label="Permission navigateur" value={diag.permission} ok={diag.permission === "granted"} />
                  <DiagRow
                    label="App installée (standalone)"
                    value={diag.standalone ? "oui" : "non"}
                    ok={diag.standalone}
                  />
                  <DiagRow
                    label="Config Firebase (clé VAPID incluse)"
                    value={diag.configured ? "ok" : "incomplète"}
                    ok={diag.configured}
                  />
                  <DiagRow
                    label="Abonnement chauffeur enregistré (serveur)"
                    value={diag.registeredToken ? "oui" : "non"}
                    ok={diag.registeredToken}
                  />
                  <DiagRow
                    label="Jeton FCM en cache"
                    value={diag.tokenSuffix ? `…${diag.tokenSuffix} (${diag.tokenAgeDays ?? "?"}j)` : "aucun"}
                    ok={Boolean(diag.tokenSuffix)}
                  />
                  <DiagRow
                    label="Service worker(s) enregistré(s)"
                    value={diag.swCount > 0 ? String(diag.swCount) : "aucun"}
                    ok={diag.swCount > 0}
                  />
                  <DiagRow
                    label="Version du SW actif (firebase-messaging-sw.js)"
                    value={diag.swVersion ?? "introuvable / pas encore répondu"}
                    ok={Boolean(diag.swVersion?.includes("push5-sound"))}
                  />
                  {diag.swScopes.length > 0 ? (
                    <p style={{ margin: "2px 0 0", opacity: 0.6, fontSize: 11 }}>{diag.swScopes.join(" · ")}</p>
                  ) : null}
                  <DiagRow
                    label="Dernière erreur FCM connue"
                    value={
                      diag.failureReason
                        ? `${diag.failureReason}${diag.failureDetail ? " — " + diag.failureDetail : ""}`
                        : "aucune"
                    }
                    ok={!diag.failureReason}
                  />
                  <DiagRow
                    label="Statut du hook (usePushNotifications)"
                    value={notifPush.status}
                    ok={notifPush.status === "granted"}
                  />
                  {notifPush.lastError ? (
                    <p style={{ margin: "2px 0 0", color: "#f87171", fontSize: 11.5 }}>{notifPush.lastError}</p>
                  ) : null}
                </div>
              ) : (
                <p style={{ fontSize: 12.5, opacity: 0.7, margin: 0 }}>Chargement du diagnostic…</p>
              )}

              <div className="drv-btns" style={{ marginTop: 4 }}>
                <Button
                  size="sm"
                  onClick={async () => {
                    await notifPush.subscribe("chauffeur");
                    refreshDiag();
                  }}
                >
                  Réactiver / renouveler l'abonnement
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void notifPush.testNotification();
                    toast.info("Notif de test envoyée — regarde si elle arrive, avec son");
                  }}
                >
                  Envoyer une notif de test
                </Button>
              </div>
            </div>
          )}
        </FullPage>
      ) : null}

      {chatOpen ? (
        <FullPage
          title="Chat"
          onClose={() => setChatOpen(false)}
          tabs={
            <SubTabs
              value={chatMode}
              onChange={setChatMode}
              options={[
                { key: "clients", label: "Clients", badge: unread },
                { key: "drivers", label: "Chauffeurs", badge: chatUnread },
              ]}
            />
          }
        >
          {chatMode === "clients" ? (
            <MessagesTab token={token} />
          ) : (
            <TeamChat token={token} names={names} me={me ?? getProfile() ?? ""} />
          )}
        </FullPage>
      ) : null}

      {mapOpen ? (
        <FullPage title="Carte équipe" onClose={() => setMapOpen(false)}>
          <div className="drv-dash-map">
            <TeamMap rows={teamRows} names={names} />
          </div>
        </FullPage>
      ) : null}

      {clientsOpen ? (
        <FullPage
          title="Clients"
          onClose={() => setClientsOpen(false)}
          tabs={
            <SubTabs
              value={clientsMode}
              onChange={setClientsMode}
              options={[
                { key: "cards", label: "Fiches clients" },
                { key: "calls", label: "Appels", badge: recentCalls.length },
              ]}
            />
          }
        >
          {clientsMode === "cards" ? (
            <ClientCardsPage embedded token={token} onClose={() => setClientsOpen(false)} />
          ) : (
            <>
              {recentCalls.length === 0 ? (
                <p className="drv-rides-sec-empty">Les numéros apparaîtront dès votre prochaine course.</p>
              ) : (
                recentCalls.map((r) => (
                  <SwipeRow
                    key={r.id}
                    as="div"
                    onDelete={() => deleteRide.mutate(r.id)}
                    label={`Course ${r.tracking_id ?? ""}`}
                  >
                    <div className="drv-call-row">
                      <a
                        href={`tel:${(r.telephone ?? "").replace(/\s/g, "")}`}
                        className="drv-call-ico"
                        aria-label="Appeler"
                        title="Appeler"
                      >
                        <Phone size={16} />
                      </a>
                      <a
                        href={smsLink(
                          r.telephone ?? "",
                          buildRideSmsMessage({
                            nom: r.nom,
                            pickup: new Date(r.pickup_datetime),
                            trackingId: r.tracking_id,
                          }),
                        )}
                        className="drv-call-ico drv-call-ico-sms"
                        aria-label="Envoyer un SMS"
                        title="Envoyer un SMS"
                      >
                        <MessageSquarePlus size={16} />
                      </a>
                      <button
                        type="button"
                        className="drv-call-txt"
                        title="Enregistrer dans les contacts"
                        onClick={() => saveContactVcard(r.nom ?? "Client", r.telephone ?? "")}
                      >
                        <strong>{r.nom ?? "Client"}</strong>
                        <span>
                          {r.telephone} · {new Date(r.pickup_datetime).toLocaleString("fr-FR")}
                        </span>
                      </button>
                    </div>
                  </SwipeRow>
                ))
              )}
            </>
          )}
        </FullPage>
      ) : null}
      {financeOpen ? (
        <FullPage
          title="Compta & stats"
          onClose={() => setFinanceOpen(false)}
          tabs={
            <SubTabs
              value={financeMode}
              onChange={setFinanceMode}
              options={[
                { key: "accounting", label: "Compta" },
                { key: "stats", label: "Stats équipe" },
              ]}
            />
          }
        >
          {financeMode === "accounting" ? (
            <AccountingTab token={token} />
          ) : (
            <StatsPage embedded token={token} onClose={() => setFinanceOpen(false)} />
          )}
        </FullPage>
      ) : null}
      {planningOpen ? (
        <FullPage
          title="Calendrier"
          onClose={() => setPlanningOpen(false)}
          tabs={
            <SubTabs
              value={planningMode}
              onChange={setPlanningMode}
              options={[
                { key: "calendar", label: "Calendrier" },
                { key: "absences", label: "Absences" },
              ]}
            />
          }
        >
          {planningMode === "calendar" ? (
            <PlanningTab token={token} />
          ) : (
            <PlanningPage embedded token={token} onClose={() => setPlanningOpen(false)} />
          )}
        </FullPage>
      ) : null}

      {ridesOpen ? (
        <div id="drv-panel-rides" className="drv-rides-page">
          <div className="drv-rides-stick">
            <div className="drv-rides-head">
              <button type="button" className="drv-rides-back" onClick={() => setRidesOpen(false)} aria-label="Retour">
                <ArrowLeft />
              </button>
              <h2>Courses</h2>
            </div>
            <SubTabs
              value={ridesMode}
              onChange={setRidesMode}
              options={[
                { key: "upcoming", label: "Prochaines", badge: openRideCount },
                { key: "completed", label: "Terminées" },
              ]}
            />
          </div>
          {ridesMode === "completed" ? (
            <CompletedRidesTab token={token} />
          ) : (
            [
              { title: "Courses en attente", list: pendingRides, actions: false },
              { title: "Courses acceptées", list: acceptedRides, actions: true },
              { title: "Courses en cours", list: inProgressRides, actions: true },
            ].map((sec) => (
              <section key={sec.title} className="drv-rides-sec">
                <p className="drv-rides-sec-title">
                  {sec.title}
                  <span className="drv-rides-sec-count">{sec.list.length}</span>
                </p>
                {sec.list.length === 0 ? (
                  <p className="drv-rides-sec-empty">Aucune course.</p>
                ) : (
                  sec.list.map((r) => (
                    <SwipeRow
                      key={r.id}
                      as="div"
                      onDelete={() => deleteRide.mutate(r.id)}
                      label={`Course ${r.tracking_id ?? ""}`}
                    >
                      <div className="drv-rides-item" onClick={() => setDetailId(r.id)}>
                        <p className="m-0 truncate text-sm font-semibold">{r.nom ?? "Client"}</p>
                        <p className="m-0 truncate text-xs text-muted-foreground">
                          {new Date(r.pickup_datetime).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="m-0 truncate text-xs text-muted-foreground">
                          {r.depart} → {r.arrivee ?? r.destination}
                        </p>
                        <p className="m-0 truncate text-xs font-medium">
                          {r.driver_slug ? (names[r.driver_slug] ?? r.driver_slug) : "Non attribuée"}
                        </p>
                        {r.telephone ? (
                          <div className="drv-rides-actions" onClick={(e) => e.stopPropagation()}>
                            <a
                              className="drv-rides-btn drv-rides-btn-sms"
                              href={smsLink(
                                r.telephone,
                                buildRideSmsMessage({
                                  nom: r.nom,
                                  pickup: new Date(r.pickup_datetime),
                                  trackingId: r.tracking_id,
                                }),
                              )}
                            >
                              <MessageSquarePlus size={14} aria-hidden /> SMS
                            </a>
                          </div>
                        ) : null}
                        <div className="drv-rides-actions" onClick={(e) => e.stopPropagation()}>
                          {timeEdit?.id === r.id ? (
                            <>
                              <input
                                type="datetime-local"
                                value={timeEdit.value}
                                onChange={(e) => setTimeEdit({ id: r.id, value: e.target.value })}
                                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                                aria-label="Nouvel horaire"
                              />
                              <button
                                type="button"
                                className="drv-rides-btn drv-rides-btn-done"
                                disabled={!timeEdit.value || rescheduleRide.isPending}
                                onClick={() => rescheduleRide.mutate(timeEdit)}
                              >
                                Valider
                              </button>
                              <button type="button" className="drv-rides-btn" onClick={() => setTimeEdit(null)}>
                                Annuler
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="drv-rides-btn"
                              onClick={() => {
                                const d = new Date(r.pickup_datetime);
                                const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16);
                                setTimeEdit({ id: r.id, value: local });
                              }}
                            >
                              <CalendarClock size={14} aria-hidden /> Modifier l'horaire
                            </button>
                          )}
                        </div>
                        {sec.actions ? (
                          <div className="drv-rides-actions">
                            <button
                              type="button"
                              className="drv-rides-btn drv-rides-btn-done"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Clôturer la course ? Le client verra qu'elle est terminée.")) {
                                  completeRide.mutate(r.id);
                                }
                              }}
                              disabled={completeRide.isPending || spillRide.isPending || cancelRide.isPending}
                            >
                              Course terminée
                            </button>
                            <button
                              type="button"
                              className="drv-rides-btn drv-rides-btn-spill"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Proposer cette course à l'équipe (débordement) ?")) {
                                  spillRide.mutate(r.id);
                                }
                              }}
                              disabled={completeRide.isPending || spillRide.isPending || cancelRide.isPending}
                            >
                              Débordement
                            </button>
                          </div>
                        ) : null}
                        <div className="drv-rides-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="drv-rides-btn drv-rides-btn-cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Annuler cette course ? Vous ne pouvez pas l'assurer.")) {
                                cancelRide.mutate(r.id);
                              }
                            }}
                            disabled={completeRide.isPending || spillRide.isPending || cancelRide.isPending}
                          >
                            Annuler la course
                          </button>
                        </div>
                      </div>
                    </SwipeRow>
                  ))
                )}
              </section>
            ))
          )}
        </div>
      ) : null}

      {(() => {
        const detail = detailId ? rides.find((r) => r.id === detailId) : null;
        if (!detail) return null;
        return (
          <RideDetailPage
            key={detail.id}
            ride={detail}
            mine={isMine(detail.driver_slug)}
            me={me}
            token={token}
            driverName={detail.driver_slug ? (names[detail.driver_slug] ?? detail.driver_slug) : null}
            onClose={() => setDetailId(null)}
            onChanged={invalidateRides}
          />
        );
      })()}
    </div>
  );
}

/** Autocomplétion d'adresse (Nominatim/OpenStreetMap), biaisée sur la Charente-Maritime. */
type AddrSuggestion = { label: string; lat: number; lon: number };

function AddressAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<AddrSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Libellé choisi dans la liste : la valeur qui en découle ne relance pas de recherche.
  const pickedRef = useRef<string | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // La liste de suggestions est en position absolue et recouvre les champs situés
  // dessous (date / heure) : le premier tap tombait sur la liste au lieu du champ.
  // On la ferme dès le début de n'importe quel appui hors du composant.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && e.target instanceof Node && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (pickedRef.current !== null && pickedRef.current === value) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    if (q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    // Chaque frappe annule la requête précédente : une réponse lente ne peut plus
    // écraser une réponse plus récente.
    const controller = new AbortController();
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          q,
          addressdetails: "0",
          limit: "6",
          countrycodes: "fr",
          "accept-language": "fr",
          viewbox: "-1.6,46.4,0.4,45.0", // biais large Charente-Maritime (Marennes, Oléron, La Rochelle, Royan)
          bounded: "0",
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const rows = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
        if (controller.signal.aborted) return;
        setSuggestions(rows.map((r) => ({ label: r.display_name, lat: Number(r.lat), lon: Number(r.lon) })));
      } catch {
        if (controller.signal.aborted) return;
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <div className="drv-addr-wrap" ref={wrapRef}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          pickedRef.current = null;
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimeoutRef.current = setTimeout(() => setOpen(false), 80);
        }}
      />
      {open && value.trim().length >= 3 ? (
        <div className="drv-addr-list">
          {loading ? (
            <div className="drv-addr-empty">Recherche…</div>
          ) : suggestions.length === 0 ? (
            <div className="drv-addr-empty">Aucune adresse trouvée</div>
          ) : (
            suggestions.map((s, i) => (
              <div
                key={`${s.lat}-${s.lon}-${i}`}
                className="drv-addr-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  // Numéro de rue tapé mais absent de la suggestion (Nominatim
                  // renvoie souvent la rue sans le numéro) : on conserve le
                  // texte tapé pour ne pas perdre le numéro dans la résa.
                  const typed = value.trim();
                  const num = typed.match(/^\d{1,4}(?:\s?(?:bis|ter|quater))?/i)?.[0];
                  const label = num && !s.label.toLowerCase().includes(num.trim().toLowerCase()) ? typed : s.label;
                  pickedRef.current = label;
                  onChange(label);
                  setSuggestions([]);
                  setOpen(false);
                }}
              >
                {s.label}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Page plein écran (même gabarit que « Prochaines courses ») : évite d'ouvrir un panneau tout en bas de la grille. */
/** Petit sélecteur à onglets pour les pages fusionnées (ex. Chat : Clients / Chauffeurs). */
function SubTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { key: T; label: string; badge?: number }[];
}) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 0 12px" }} role="tablist">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.key)}
            style={{
              flex: 1,
              padding: "9px 10px",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.14)",
              background: on ? "#e11d48" : "transparent",
              color: on ? "#fff" : "inherit",
              opacity: on ? 1 : 0.75,
            }}
          >
            {o.label}
            {o.badge && o.badge > 0 ? ` (${o.badge})` : ""}
          </button>
        );
      })}
    </div>
  );
}

function FullPage({
  title,
  onClose,
  tabs,
  children,
}: {
  title: string;
  onClose: () => void;
  tabs?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="drv-rides-page">
      <div className="drv-rides-stick">
        <div className="drv-rides-head">
          <button type="button" className="drv-rides-back" onClick={onClose} aria-label="Retour">
            <ArrowLeft />
          </button>
          <h2>{title}</h2>
        </div>
        {tabs}
      </div>
      {children}
    </div>
  );
}

/** Ouvre le sélecteur natif date/heure dès le premier appui (sinon il faut toucher deux fois). */
function openNativePicker(e: React.MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* showPicker indisponible ou refusé : le comportement natif reste actif */
  }
}

/** Saisie d'une réservation reçue en direct par le chauffeur (SMS/e-mail/WhatsApp/appel). */
function ManualBookingDialog({
  token,
  drivers,
  onClose,
  onCreated,
}: {
  token: string;
  drivers: { slug: string; name: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  // Par défaut : dans une heure, arrondi au quart d'heure suivant.
  const defaultWhen = useMemo(() => {
    const d = new Date(Date.now() + 60 * 60_000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      heure: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  }, []);
  const [date, setDate] = useState(defaultWhen.date);
  const [heure, setHeure] = useState(defaultWhen.heure);
  const [passagers, setPassagers] = useState("1");
  const [bagages, setBagages] = useState("0");
  const [prix, setPrix] = useState("");
  const [source, setSource] = useState<"sms" | "email" | "whatsapp" | "telephone" | "autre">("sms");
  const [prisePar, setPrisePar] = useState<string>("");
  const [obs1, setObs1] = useState("");
  const [obs2, setObs2] = useState("");

  const create = useMutation({
    mutationFn: () =>
      driverCreateManualReservation({
        data: {
          as: getProfile(),
          token,
          nom: nom.trim().slice(0, 100),
          telephone: telephone.trim().length >= 4 ? telephone.trim().slice(0, 30) : undefined,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? email.trim() : undefined,
          depart: depart.trim().slice(0, 200),
          arrivee: arrivee.trim().slice(0, 200),
          pickup_datetime: new Date(`${date}T${heure}:00`).toISOString(),
          passagers: Math.min(9, Math.max(1, Math.round(Number(passagers)) || 1)),
          bagages: Math.min(9, Math.max(0, Math.round(Number(bagages)) || 0)),
          prix_estime: (() => {
            const n = Number(prix.replace(",", ".").replace(/[^\d.]/g, ""));
            return prix.trim() && Number.isFinite(n) ? Math.min(5000, n) : undefined;
          })(),
          source,
          prise_par: prisePar || undefined,
          observation1: obs1.trim().slice(0, 1000) || undefined,
          observation2: obs2.trim().slice(0, 1000) || undefined,
        },
      }),
    onSuccess: (res) => {
      toast.success(`Réservation créée — suivi : /suivi/${res.tracking_id}`);
      onCreated();
      // Validation de la résa = redirection directe vers l'appli SMS native (Android
      // ou iPhone) avec le bon numéro et le message pré-rempli (resa + lien de suivi +
      // heure) : il ne reste plus qu'à appuyer sur "Envoyer" dans l'appli Messages.
      const phone = telephone.trim();
      if (phone) {
        const info = {
          trackingId: res.tracking_id as string,
          telephone: phone,
          nom: nom.trim(),
          pickup: new Date(`${date}T${heure}:00`),
        };
        window.location.href = smsLink(info.telephone, buildRideSmsMessage(info));
      }
      onClose();
    },
    onError: () => toast.error("Impossible de créer la réservation"),
  });

  const pickupMs = date && heure ? new Date(`${date}T${heure}:00`).getTime() : NaN;
  // Une course dans le passé est presque toujours une erreur de saisie (tolérance 5 min).
  const isPast = Number.isFinite(pickupMs) && pickupMs < Date.now() - 5 * 60_000;
  const canSubmit = Boolean(nom.trim() && depart.trim() && arrivee.trim() && date && heure) && !isPast;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      {/* Tout le formulaire (observations comprises) + les boutons dans un seul bloc défilant :
          sur mobile, rien ne peut passer « après » le bouton ni rester hors écran. */}
      <DialogContent style={{ maxHeight: "92dvh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
          <DialogDescription>Client reçu en direct (hors site) — SMS, e-mail, WhatsApp ou appel.</DialogDescription>
        </DialogHeader>

        <div style={{ display: "grid", gap: 10 }}>
          <Input placeholder="Nom du client" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={100} />
          <Input placeholder="Téléphone (optionnel)" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          <Input placeholder="E-mail (optionnel)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <AddressAutocomplete placeholder="Adresse de départ" value={depart} onChange={setDepart} />
          <AddressAutocomplete placeholder="Adresse d'arrivée" value={arrivee} onChange={setArrivee} />
          <Textarea
            placeholder="Observation 1 (optionnel)"
            rows={2}
            value={obs1}
            onChange={(e) => setObs1(e.target.value)}
            maxLength={1000}
          />
          <Textarea
            placeholder="Observation 2 (optionnel)"
            rows={2}
            value={obs2}
            onChange={(e) => setObs2(e.target.value)}
            maxLength={1000}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type="date"
              value={date}
              min={defaultWhen.date}
              onChange={(e) => setDate(e.target.value)}
              onClick={openNativePicker}
            />
            <Input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} onClick={openNativePicker} />
          </div>
          {isPast ? (
            <p style={{ margin: 0, fontSize: 12, color: "#f87171" }}>
              Cette date est déjà passée : corrigez la date ou l'heure pour enregistrer.
            </p>
          ) : null}
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type="number"
              min={1}
              max={9}
              placeholder="Passagers"
              value={passagers}
              onChange={(e) => setPassagers(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              max={9}
              placeholder="Bagages"
              value={bagages}
              onChange={(e) => setBagages(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              placeholder="Prix € (optionnel)"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
            />
          </div>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as typeof source)}
            style={{
              borderRadius: 10,
              padding: "10px 12px",
              background: "rgba(0,0,0,.25)",
              color: "inherit",
              border: "1px solid rgba(246,240,229,.2)",
              fontSize: 14,
            }}
          >
            <option value="sms">Reçue par SMS</option>
            <option value="email">Reçue par e-mail</option>
            <option value="whatsapp">Reçue par WhatsApp</option>
            <option value="telephone">Reçue par téléphone</option>
            <option value="autre">Autre</option>
          </select>
          <select
            value={prisePar}
            onChange={(e) => setPrisePar(e.target.value)}
            style={{
              borderRadius: 10,
              padding: "10px 12px",
              background: "rgba(0,0,0,.25)",
              color: "inherit",
              border: "1px solid rgba(246,240,229,.2)",
              fontSize: 14,
            }}
          >
            <option value="">Réservation prise par…</option>
            {drivers.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
          {/* Boutons en dernier, dans le formulaire (ordre fixe : Annuler puis Créer). */}
          <div style={{ display: "flex", flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button disabled={!canSubmit || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? "Création…" : "Créer la réservation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Discussion interne entre les chauffeurs (remplace la radio de la maquette). */
function TeamChat({ token, names, me }: { token: string; names: Record<string, string>; me: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const chat = useQuery({
    queryKey: ["driver-team-chat", token],
    queryFn: () => driverTeamChat({ data: { as: getProfile(), token } }),
    refetchInterval: 15_000,
  });
  // Chat interne en direct entre chauffeurs.
  useReservationsRealtime({
    queryKeys: [["driver-team-chat", token]],
    tables: ["driver_chat"],
    channel: "driver-team-chat",
  });
  const send = useMutation({
    mutationFn: (content: string) => driverTeamChatSend({ data: { as: getProfile(), token, content } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["driver-team-chat", token] });
    },
    onError: () => toast.error("Message non envoyé"),
  });

  const rows = chat.data ?? [];

  // Défile vers le dernier message à l'ouverture et à chaque nouveau message.
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows.length, rows[rows.length - 1]?.id]);

  return (
    <div className="drv-dash-map" style={{ padding: 12 }}>
      <div
        ref={listRef}
        style={{ display: "grid", gap: 8, maxHeight: "calc(100dvh - 220px)", minHeight: 160, overflowY: "auto" }}
      >
        {rows.length === 0 ? (
          <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>Aucun message pour le moment.</p>
        ) : (
          rows.map((m) => (
            <div
              key={m.id}
              style={{
                justifySelf: m.sender_slug === me ? "end" : "start",
                maxWidth: "85%",
                background: m.sender_slug === me ? "#e0b866" : "#3f3f46",
                color: m.sender_slug === me ? "#1c1917" : "#f6f0e5",
                borderRadius: 12,
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              <strong style={{ display: "block", fontSize: 11, opacity: 0.8 }}>
                {names[m.sender_slug] ?? m.sender_slug} ·{" "}
                {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              {m.content}
            </div>
          ))
        )}
      </div>
      <form
        style={{ display: "flex", gap: 8, marginTop: 10 }}
        onSubmit={(e) => {
          e.preventDefault();
          const v = text.trim();
          if (v) send.mutate(v);
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Votre message…" maxLength={1000} />
        <Button type="submit" disabled={send.isPending || text.trim().length === 0}>
          {send.isPending ? "…" : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
