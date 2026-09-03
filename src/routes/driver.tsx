import { createFileRoute, Link } from "@tanstack/react-router";
import { ogImageUrl, ogPageUrl } from "@/lib/og";
import ogDriverFr from "@/assets/apt-og-driver-fr.jpg.asset.json";
import ogDriverEn from "@/assets/apt-og-driver-en.jpg.asset.json";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMapsWhenVisible } from "@/lib/googleMaps";
import { geocodeAddress } from "@/lib/googleGeocode";
import { PushUnsupportedNotice } from "@/components/PushUnsupportedNotice";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import PushDiagnosticsCard from "@/components/PushDiagnosticsCard";
// ⚠️ TEMPORAIRE — panneau de diagnostic bas d'écran (bouton ▶ Lancer), à
// retirer une fois le problème notifications résolu. Distinct de
// PushDiagnosticsCard ci-dessus, qui est un composant permanent différent.
import { useServerFn } from "@tanstack/react-start";
import { listPushFailures, notifyReservationStatus } from "@/lib/push.functions";
import { calculerPrixMixte, estTarifJourParis, parseAsParisTime, TARIFS } from "@/lib/tarif";
import { broadcastDriverFeed, broadcastSuiviUpdate } from "@/lib/suivi-broadcast";
import { subscribeChatBadgeEvents, type ChatBadgeEvent } from "@/lib/chat-badge-sync";
import { ChatPanel } from "@/components/ChatPanel";
import { InlineDriverChat } from "@/components/InlineDriverChat";
import { verifyDriverToken, getActiveVisitorCount, openDriverSession } from "@/lib/driver-auth.functions";
import { gaEvent } from "@/lib/ga4";
import { listDriverCourses, setCourseDriver, driverDeleteReservation } from "@/lib/driver-courses.functions";
import { driverUpdateReservation, driverListReservations, driverDeleteClient } from "@/lib/driver-data.functions";
import { sendRideInvoice } from "@/lib/ride-invoice.functions";
import { getDriverStats, listReservationEvents, getTrackingAnalytics } from "@/lib/driver-stats.functions";
import { listDriverDevices, revokeDriverDevice, driverPushLog } from "@/lib/driver-devices.functions";
import { listDriverDevis, driverUpdateDevis, driverDeleteDevis, type Devis } from "@/lib/driver-devis.functions";
import { updateMyDriverPosition, stopMyDriverPosition, listDriverPositions } from "@/lib/driver-gps.functions";
import { reverseGeocode } from "@/lib/googleGeocode";

import { getDriverToken, setDriverToken, clearDriverToken, getDriverName, setDriverName } from "@/lib/driver-token";
import {
  listReservationsWithUnreadChauffeur,
  getUnreadCountsForReservations,
  type UnreadMap,
} from "@/lib/chat.functions";

// ── Token guard ────────────────────────────────────────────────────────────
// Aucun secret en dur : le jeton saisi (ou passé en ?token=) est validé côté
// serveur, puis conservé localement pour authentifier les appels du panneau.

// ── Types ─────────────────────────────────────────────────────────────────
type Tab =
  | "dashboard"
  | "courses"
  | "planning"
  | "avis"
  | "clients"
  | "stats"
  | "historique"
  | "simulateur"
  | "devis"
  | "appareils"
  | "gps";

// (ChatRealtimeStatusPill retiré : plus de canal Realtime global à surveiller.)

interface Resa {
  id: string;
  depart: string;
  destination: string;
  date_heure: string;
  pickup_datetime: string;
  status: string;
  prix_estime?: number | null;
  final_price?: number | null;
  distance_km?: number | null;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  email?: string | null;
  suivi_id?: string | null;
  message?: string | null;
}

interface Avis {
  id: string;
  author_name: string;
  note: number;
  commentaire: string | null;
  created_at: string;
  status: string;
}

interface ClientAgg {
  id?: string;
  phone: string;
  email?: string | null;
  name: string;
  nbCourses: number;
  totalDepense: number;
  derniereCourse: string;
  derniereDepart: string;
  derniereDestination: string;
}

interface RouteOption {
  index: number;
  summary: string;
  distanceKm: number;
  dureeMin: number;
  prix_estime: number;
  tarifLabel: string;
  legs: any[];
  overview_polyline: string;
  dirResult: any;
  originLatLng: { lat: number; lng: number };
  destLatLng: { lat: number; lng: number };
  waypointLatLng: { lat: number; lng: number } | null;
}

// Visuels de partage localisés de l'espace chauffeur (page privée : noindex,
// mais le lien est partagé par SMS/WhatsApp à Alain et Patricia).
const DRIVER_SOCIAL_FR = {
  title: "Espace Chauffeur — Access Prestige Taxi",
  description: "Application privée d'Alain et Patricia : courses, GPS, messagerie et notifications.",
  image: ogImageUrl(ogDriverFr.url),
  alt: "Espace Chauffeur Access Prestige Taxi — application privée Alain & Patricia",
  url: ogPageUrl("/driver", "fr"),
};
const DRIVER_SOCIAL_EN = {
  title: "Driver App — Access Prestige Taxi",
  description: "Private app for Alain and Patricia: rides, GPS, messaging and notifications.",
  image: ogImageUrl(ogDriverEn.url),
  alt: "Access Prestige Taxi Driver App — private app for Alain & Patricia",
  url: ogPageUrl("/driver", "en"),
};

// ── Route definition ───────────────────────────────────────────────────────
export const Route = createFileRoute("/driver")({
  // ?lang=en / ?lang=fr : choisit la langue du visuel et des textes de partage.
  validateSearch: (s: Record<string, unknown>): { token: string; lang?: "en" | "fr" } => ({
    token: String(s.token ?? ""),
    lang: s["lang"] === "en" ? ("en" as const) : s["lang"] === "fr" ? ("fr" as const) : undefined,
  }),
  head: (ctx: { match?: { search?: { lang?: "en" | "fr" } } }) => {
    const isEn = ctx?.match?.search?.lang === "en";
    const social = isEn ? DRIVER_SOCIAL_EN : DRIVER_SOCIAL_FR;
    return {
      meta: [
        { title: social.title },
        { name: "description", content: social.description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:site_name", content: "Access Prestige Taxi" },
        { property: "og:title", content: social.title },
        { property: "og:description", content: social.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: social.url },
        { property: "og:image", content: social.image },
        { property: "og:image:secure_url", content: social.image },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: social.alt },
        { property: "og:locale", content: isEn ? "en_GB" : "fr_FR" },
        { property: "og:locale:alternate", content: isEn ? "fr_FR" : "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: social.title },
        { name: "twitter:description", content: social.description },
        { name: "twitter:image", content: social.image },
        { name: "twitter:image:alt", content: social.alt },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
        },
        { name: "theme-color", content: "#03070d" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "APT Chauffeur" },
      ],
      links: [{ rel: "manifest", href: "/api/manifest?role=driver", id: "app-manifest" }],
    };
  },

  component: DriverPage,
});

// ── Styles globaux ─────────────────────────────────────────────────────────
const css = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; touch-action: manipulation; }
  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    overscroll-behavior-y: contain; background: #03070d;
    font-family: 'DM Sans', sans-serif;
  }
  input, textarea, select { font-size: 16px; }
  .drv-root {
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    background: #03070d;
  }
  /* Tablette (iPad portrait et paysage) : colonne élargie, plus de cadre centré. */
  @media (min-width: 700px) {
    html, body { background: #01040a; }
  }
  /* Desktop / grand écran : colonne encore plus large, texte légèrement agrandi. */
  @media (min-width: 1024px) {
    .drv-body { padding: 20px 28px; }
    .drv-card { padding: 16px; }
  }
  /* Souris/trackpad (pas d'écran tactile) : hover discret sur les éléments cliquables,
     la logique :active seule (pensée pour le tactile) ne suffit pas sur PC. */
  @media (hover: hover) and (pointer: fine) {
    .drv-tab:hover { color: #0f172a; }
    .drv-btn-primary:hover { background: #1e293b; }
    .drv-btn-secondary:hover { background: #e2e8f0; }
    .drv-btn-danger:hover { background: #fee2e2; }
    .drv-card:hover, .drv-route-opt:hover, .drv-chat-thread:hover { border-color: #c99b4a; }
  }
  .drv-header {
    background: #0f172a; color: #FDFBF7; display: flex; align-items: center; gap: 10px;
    padding: max(calc(env(safe-area-inset-top, 0px) + 14px), 54px) calc(env(safe-area-inset-right, 0px) + 16px) 10px calc(env(safe-area-inset-left, 0px) + 16px);
    flex-shrink: 0;
  }
  .drv-header h1 { margin: 0; font-size: 17px; font-weight: 700; flex: 1; font-family: 'DM Sans', sans-serif; }
  .drv-tabs {
    display: flex; border-bottom: 1px solid rgba(201,155,74,.45); background: #FDFBF7;
    padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px);
    flex-shrink: 0;
    /* Fix : avec 8 onglets + labels longs ("Course + chat client"), la
       rangée peut dépasser la largeur de l'écran sur mobile étroit. Comme
       html/body ont overflow:hidden (plus haut), sans scroll ICI le
       débordement était juste coupé et invisible (ex. l'onglet "Devis"
       disparaissait sans aucun moyen d'y accéder). On rend la barre
       scrollable horizontalement, scrollbar masquée pour rester discrète. */
    overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .drv-tabs::-webkit-scrollbar { display: none; }
  .drv-tab {
    flex: 0 0 auto; min-width: 66px; display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 12px 8px 10px; min-height: 48px; border: none; background: none; color: #94a3b8;
    font-size: 10px; font-family: 'DM Sans', sans-serif; cursor: pointer; border-bottom: 2px solid transparent;
    transition: color 0.15s; -webkit-user-select: none; user-select: none;
    white-space: nowrap;
  }
  .drv-tab:active { background: #f8fafc; }
  .drv-tab.active { color: #0f172a; border-bottom-color: var(--gold, #c99b4a); }
  .drv-tab svg { width: 22px; height: 22px; }
  .drv-badge { background: #ef4444; color: #FDFBF7; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 1px 5px; position: absolute; top: -3px; right: -5px; }
  .drv-tab-count { display: none; }
  .drv-body {
    flex: 1; min-height: 0; padding: 16px;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain;
  }
  .drv-section { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; }
  .drv-card { background: #FDFBF7; border: 1px solid rgba(201,155,74,.45); border-radius: 16px; padding: 14px; margin-bottom: 10px; }
  .drv-swipe { position: relative; margin-bottom: 10px; border-radius: 16px; overflow: hidden; }
  .drv-swipe .drv-card { margin-bottom: 0; }
  .drv-swipe-content { position: relative; z-index: 1; touch-action: pan-y; will-change: transform; }
  .drv-swipe-action {
    position: absolute; top: 0; right: 0; bottom: 0; width: 96px; z-index: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    background: #dc2626; color: #fff; border: none; font-size: 20px; font-weight: 700; cursor: pointer;
  }
  .drv-swipe-action span { font-size: 11px; font-weight: 700; letter-spacing: .04em; }
  .drv-card.pending { border-color: #f59e0b; }
  .drv-card.new { border-color: #3b82f6; box-shadow: 0 0 0 3px #3b82f620; }
  .drv-card.done { opacity: 0.5; }
  .drv-card.accepted { border-color: #22c55e; }
  .drv-card.refused { border-color: #ef4444; opacity: 0.6; }
  .drv-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .drv-time { font-size: 22px; font-weight: 800; color: #0f172a; }
  .drv-name { font-size: 14px; font-weight: 600; color: #0f172a; }
  .drv-sub { font-size: 12px; color: #64748b; }
  .drv-route { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; }
  .drv-route span { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: #334155; line-height: 1.4; }
  .drv-meta { display: flex; gap: 12px; font-size: 12px; color: #64748b; margin: 8px 0 12px; flex-wrap: wrap; }
  .drv-meta span { display: flex; align-items: center; gap: 4px; }
  .drv-btns { display: flex; gap: 8px; }
  .drv-btn-primary { flex: 1; min-height: 46px; background: #0f172a; color: #FDFBF7; border: none; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .drv-btn-primary:active { background: #1e293b; }
  .drv-btn-secondary { flex: 1; min-height: 46px; background: #f1f5f9; color: #0f172a; border: 1px solid rgba(201,155,74,.45); border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .drv-btn-secondary:active { background: #e2e8f0; }
  .drv-btn-danger { flex: 1; min-height: 46px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .drv-btn-danger:active { background: #fee2e2; }
  .drv-badge-pill { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; }
  .drv-badge-blue { background: #eff6ff; color: #1d4ed8; }
  .drv-badge-green { background: #f0fdf4; color: #15803d; }
  .drv-badge-amber { background: #FDFBF7beb; color: #92400e; }
  .drv-badge-red { background: #fef2f2; color: #b91c1c; }
  .drv-badge-gray { background: #f1f5f9; color: #475569; }
  .drv-stars { color: #f59e0b; font-size: 15px; letter-spacing: 1px; }
  .drv-stars-empty { color: var(--border); font-size: 15px; }
  .drv-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .drv-stat { background: #f8fafc; border-radius: 14px; padding: 14px; }
  .drv-stat-lbl { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .drv-stat-val { font-size: 24px; font-weight: 800; color: #0f172a; }
  .drv-stat-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .drv-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
  .drv-empty svg { width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.4; }
  .drv-route-opt { border: 1.5px solid rgba(201,155,74,.45); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; min-height: 44px; }
  .drv-route-opt:active { background: #f8fafc; }
  .drv-route-opt.selected { border-color: #c99b4a; background: #f8fafc; }
  .drv-route-opt-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .drv-route-label { font-size: 13px; font-weight: 700; color: #0f172a; }
  .drv-route-price { font-size: 16px; font-weight: 800; color: #0f172a; }
  .drv-route-meta { display: flex; gap: 10px; font-size: 12px; color: #64748b; }
  .drv-map { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 14px; border: 1px solid rgba(201,155,74,.45); touch-action: pan-x pan-y; }
  .drv-divider { border: none; border-top: 1px solid rgba(201,155,74,.25); margin: 16px 0; }
  .drv-planning-slot { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
  .drv-planning-time { font-size: 12px; color: #64748b; min-width: 40px; padding-top: 3px; }
  .drv-planning-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
  .drv-planning-card { flex: 1; background: #FDFBF7; border: 1px solid rgba(201,155,74,.45); border-radius: 12px; padding: 10px 12px; }
  @media (max-width: 380px) {
    .drv-time { font-size: 18px; }
    .drv-stat-val { font-size: 20px; }
  }
  .drv-chat-thread { border: 1px solid rgba(201,155,74,.45); border-radius: 14px; padding: 12px 14px; margin-bottom: 8px; cursor: pointer; background: #FDFBF7; display: flex; align-items: center; gap: 10px; }
  .drv-chat-thread:active { background: #f8fafc; }
  .drv-chat-thread.unread { border-color: #3b82f6; background: #eff6ff; }
  .drv-chat-avatar { width: 38px; height: 38px; border-radius: 50%; background: #0f172a; color: #FDFBF7; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; flex-shrink: 0; }
  .drv-chat-bubble { max-width: 78%; border-radius: 14px; padding: 9px 12px; font-size: 13.5px; line-height: 1.45; }
  .drv-chat-bubble.me { background: #0f172a; color: #FDFBF7; border-radius: 14px 14px 4px 14px; margin-left: auto; }
  .drv-chat-bubble.them { background: #f1f5f9; color: #0f172a; border-radius: 14px 14px 14px 4px; }
  @keyframes drv-fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
  .drv-msg-in { animation: drv-fadein 0.25s ease both; }
  @keyframes drv-pulse { 0%, 100% { opacity:1; box-shadow: 0 0 0 3px rgba(34,197,94,0.3); } 50% { opacity:0.6; box-shadow: 0 0 0 6px rgba(34,197,94,0.1); } }
  .drv-visitor-dot-active { animation: drv-pulse 2s ease-in-out infinite; }

  /* ── Access Prestige mobile visual system ───────────────────────────── */
  .drv-root { background:#03070d !important; color:#f6f0e5 !important; }
  .drv-header { background:#050a10 !important; border-bottom:1px solid #c99b4a; min-height:74px; padding:calc(env(safe-area-inset-top, 0px) + 12px) 14px 10px !important; }
  .drv-brand-mark { width:42px; height:42px; border:1px solid #c99b4a; border-radius:50%; display:grid; place-items:center; color:#e0b866; font-family:Georgia,serif; font-weight:800; letter-spacing:.08em; flex:0 0 42px; }
  .drv-header-title { min-width:0; flex:1; display:flex; flex-direction:column; gap:2px; }
  .drv-header-title strong { color:#f6f0e5; font-size:15px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .drv-header-title span { color:rgba(246,240,229,.55); font-size:10px; }
  .drv-header-back { display:flex; align-items:center; gap:5px; height:34px; padding:0 10px; border:1px solid #c99b4a; border-radius:8px; background:#07101a; color:#e0b866; text-decoration:none; font-size:11.5px; font-weight:700; white-space:nowrap; flex:0 0 auto; }
  .drv-header-back svg { flex-shrink:0; }
  @media (max-width: 380px) {
    .drv-header-back span.drv-header-back-label { display:none; }
    .drv-header-back { width:34px; height:34px; padding:0; justify-content:center; }
  }
  /* En-tête : pastille "EN LIGNE", date/heure et cloche de notifications,
     visibles sur toutes les pages (pas seulement le tableau de bord),
     à l'image de la maquette. */
  .drv-header-live { flex:0 0 auto; }
  .drv-header-datetime {
    display:none; flex:0 0 auto; text-align:right; font-size:10.5px; line-height:1.35;
    color:rgba(246,240,229,.6); white-space:nowrap;
  }
  .drv-header-datetime strong { display:block; color:#f6f0e5; font-size:12px; font-weight:700; }
  @media (min-width:700px) { .drv-header-datetime { display:block; } }
  .drv-header-bell {
    position:relative; flex:0 0 auto; width:34px; height:34px; display:grid; place-items:center;
    background:#07101a; border:1px solid #c99b4a; border-radius:8px; color:#e0b866; cursor:pointer;
  }
  .drv-header-bell svg { width:16px; height:16px; }
  .drv-header-bell .drv-badge { top:-5px; right:-5px; }
  .drv-overview { padding:14px 14px 4px; background:#03070d; }
  .drv-overview-head {
    display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;
    border: 1px solid rgba(201,155,74,.45); border-radius: 12px; padding: 12px 14px; background:#050a10;
  }
  .drv-overview-head p { margin:0 0 2px; color:#e0b866; font-size:9px; letter-spacing:.12em; font-weight:800; }
  .drv-overview-head h2 { margin:0; color:#f6f0e5; font-family:Georgia,serif; font-size:19px; }
  .drv-live-pill { display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(95,208,138,.45); color:#8ee39f; border-radius:999px; padding:5px 8px; font-size:9px; font-weight:800; }
  .drv-live-pill i { width:6px; height:6px; border-radius:50%; background:#5fd08a; display:block; }
  .drv-stat-grid { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; margin-bottom:10px !important; }
  .drv-stat { background:linear-gradient(180deg,#0a1118,#050a10) !important; border:1px solid rgba(201,155,74,.45); border-radius:9px !important; padding:11px !important;
    display:grid !important; grid-template-columns:minmax(0,1fr) auto; align-items:center; column-gap:8px; }
  .drv-stat-lbl { grid-column:1; grid-row:1; margin:0 !important; color:rgba(246,240,229,.55) !important; font-size:8.5px !important; letter-spacing:.08em; font-weight:800; line-height:1.25; }
  .drv-stat-val { grid-column:2; grid-row:1 / span 2; justify-self:end; text-align:right; white-space:nowrap; color:#e0b866 !important; font-size:22px !important; line-height:1.1; }
  .drv-stat-sub { grid-column:1; grid-row:2; margin:0 !important; color:rgba(246,240,229,.45) !important; font-size:9px !important; line-height:1.2; }
  @media (max-width:340px) { .drv-stat-val { font-size:18px !important; } }
  .drv-overview-actions { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid rgba(201,155,74,.45); border-radius:9px; overflow:hidden; margin-bottom:10px; background:#050a10; }
  .drv-overview-actions button { min-height:64px; border:0; border-right:1px solid rgba(201,155,74,.45); background:transparent; color:#f6f0e5; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; font-size:8px; cursor:pointer; }
  .drv-overview-actions button:last-child { border-right:0; }
  .drv-overview-actions svg { width:20px; height:20px; color:#e0b866; }
  .drv-quick6 { grid-template-columns:repeat(3,1fr); gap:8px; background:transparent; border:0; }
  .drv-quick6 button { position:relative; background:#050a10; border:1px solid rgba(201,155,74,.45) !important; border-radius:9px; min-height:70px; font-size:9.5px; font-weight:700; letter-spacing:.02em; text-transform:uppercase; }
  .drv-quick6 button:active { background:#0a1118; }
  .drv-quick6 .drv-badge { position:absolute; top:6px; right:10px; }
  @media (min-width:640px) { .drv-quick6 { grid-template-columns:repeat(6,1fr); } }

  /* ── Tableau de bord (grille responsive) ─────────────────────────────── */
  .drv-main { display:flex; flex-direction:column; flex:1; min-height:0; }
  .drv-section-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
  .drv-section-row .drv-section { margin:0; }
  .drv-link-btn { background:none; border:none; color:#e0b866; font-size:11px; font-weight:700; cursor:pointer; padding:2px 0; text-transform:uppercase; letter-spacing:.04em; }
  .drv-live-pill-sm { font-size:8px; padding:3px 7px; }
  .drv-dash-grid { display:grid; grid-template-columns:1fr; gap:0; padding:0 14px; }
  .drv-dash-col { display:flex; flex-direction:column; min-width:0; }
  .drv-dash-next .drv-empty { padding:24px 10px; }
  .drv-dash-row {
    display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer;
    border: 1px solid rgba(201,155,74,.45); border-radius: 10px; margin-bottom: 8px;
  }
  .drv-dash-row:last-child { margin-bottom: 0; }
  .drv-dash-row-time { flex:0 0 48px; font-size:12px; font-weight:700; color:#e0b866; }
  .drv-dash-row-route { flex:1; min-width:0; font-size:13px; color:#f6f0e5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .drv-dash-row-price { flex:0 0 auto; font-size:12px; font-weight:700; color:#f6f0e5; }
  .drv-dash-notif {
    display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 12px; cursor:pointer;
    border: 1px solid rgba(201,155,74,.45); border-radius: 10px; margin-bottom: 8px;
    font-size:12.5px; color:rgba(246,240,229,.75);
  }
  .drv-dash-notif:last-child { margin-bottom: 0; }
  .drv-dash-notif strong { color:#e0b866; font-size:14px; }

  /* Tablette : deux colonnes pour le tableau de bord. */
  @media (min-width:700px) {
    .drv-dash-grid { grid-template-columns: 1.4fr 1fr; gap:14px; align-items:start; padding:0 14px; }
  }
  /* Desktop / grand écran : sidebar de navigation fixe + contenu élargi. */
  @media (min-width:1024px) {
    .drv-tabs {
      position: fixed; top:74px; left:0; bottom:0; width:230px; z-index:5;
      flex-direction: column; align-items:stretch; overflow-y:auto; overflow-x:hidden;
      background:#050a10; border-bottom:0; border-right:1px solid rgba(201,155,74,.3);
      padding:0 0 16px;
    }
    .drv-tabs::before {
      content:'ACCESS PRESTIGE TAXI'; display:block; padding:18px 18px 14px;
      font-family:Georgia,serif; font-weight:800; color:#e0b866; font-size:12px;
      letter-spacing:.1em; border-bottom:1px solid rgba(201,155,74,.25); margin-bottom:6px;
    }
    .drv-tab {
      flex-direction:row; justify-content:flex-start; align-items:center; gap:12px;
      min-height:44px; padding:10px 18px; font-size:13px; font-weight:600;
      border-bottom:0; border-left:3px solid transparent; text-align:left; white-space:normal;
    }
    .drv-tab svg { width:18px; height:18px; flex-shrink:0; }
    .drv-tab.active { color:#f6f0e5; border-left-color:#c99b4a; background:rgba(201,155,74,.12); }
    .drv-tab-count {
      margin-left:auto; flex:0 0 auto; background:rgba(201,155,74,.16); color:#e0b866;
      font-size:11px; font-weight:800; padding:2px 8px; border-radius:999px;
    }
    .drv-tab.active .drv-tab-count { background:rgba(201,155,74,.32); color:#f6f0e5; }
    .drv-main { margin-left:230px; }
    .drv-dash-grid { grid-template-columns: 1.6fr 1fr; gap:18px; padding:0; }
    .drv-overview { padding:18px 0 4px; }
    .drv-body { padding:20px 28px; }
  }
  .drv-tabs { background:#050a10 !important; border-top:1px solid rgba(201,155,74,.35) !important; border-bottom:1px solid rgba(201,155,74,.35) !important; }
  .drv-tab { color:rgba(246,240,229,.48) !important; min-height:58px !important; padding:8px 9px !important; }
  .drv-tab.active { color:#e0b866 !important; border-bottom-color:#e0b866 !important; }
  .drv-tab:active { background:#0a1118 !important; }
  .drv-body { background:#03070d !important; padding:12px 12px calc(88px + env(safe-area-inset-bottom, 0px)) !important; }
  .drv-card, .drv-route-opt, .drv-chat-thread, .drv-planning-card { background:#050a10 !important; border-color:rgba(201,155,74,.45) !important; color:#f6f0e5 !important; }
  .drv-time, .drv-name, .drv-route-label, .drv-planning-card, .drv-route span, .drv-section { color:#f6f0e5 !important; }
  .drv-sub, .drv-meta, .drv-route-meta, .drv-planning-time { color:rgba(246,240,229,.55) !important; }
  .drv-btn-primary { background:#050a10 !important; color:#fff !important; border:1px solid #e0b866 !important; }
  .drv-btn-secondary { background:#050a10 !important; color:#e0b866 !important; border:1px solid #c99b4a !important; }
  .drv-btn-danger { background:#1b0c0c !important; color:#f0a0a0 !important; border-color:#8b3a3a !important; }
  .drv-badge-blue { background:#17243a !important; color:#9fc2ff !important; }
  .drv-badge-green { background:#10271b !important; color:#8ee39f !important; }
  .drv-badge-gray { background:#111820 !important; color:#c8c0b2 !important; }
  .drv-chat-bubble.me { background:#101820 !important; color:#fff !important; border:1px solid #e0b866 !important; }
  .drv-chat-bubble.them { background:#101820 !important; color:#f6f0e5 !important; }
  .drv-chat-thread.unread { background:#101d28 !important; border-color:#c99b4a !important; }
  .drv-team-map { background:#050a10 !important; border-color:rgba(201,155,74,.45) !important; }
  /* Recolor legacy inline light surfaces without touching their behaviour.
     IMPORTANT : les navigateurs réécrivent les couleurs hex des styles inline
     en rgb(...) dans l'attribut style réellement posé sur le DOM — les
     sélecteurs [style*="#hex"] ci-dessous ne matchent donc quasiment jamais
     en pratique (c'est ce qui rendait des textes/bordures "trop sombres" un
     peu partout, écran + onglets, malgré ces règles). On ajoute donc pour
     chaque couleur son équivalent rgb() en plus du hex. */
  [style*="#FDFBF7"], [style*="#f8fafc"], [style*="#f1f5f9"],
  [style*="rgb(253, 251, 247)"], [style*="rgb(248, 250, 252)"], [style*="rgb(241, 245, 249)"] {
    background-color:#050a10 !important;
  }
  [style*="#0f172a"], [style*="rgb(15, 23, 42)"] { color:#f6f0e5 !important; background-color:#0b1118 !important; }
  [style*="#e2e8f0"], [style*="rgb(226, 232, 240)"] { border-color:rgba(201,155,74,.45) !important; }
  [style*="#f1f5f9"], [style*="rgb(241, 245, 249)"] { border-color:rgba(201,155,74,.22) !important; }
  [style*="rgba(255,255,255,0.2)"], [style*="rgba(255, 255, 255, 0.2)"] { border-color:rgba(201,155,74,.45) !important; }
  [style*="#64748b"], [style*="#94a3b8"], [style*="#475569"], [style*="#334155"], [style*="#cbd5e1"],
  [style*="rgb(100, 116, 139)"], [style*="rgb(148, 163, 184)"], [style*="rgb(71, 85, 105)"],
  [style*="rgb(51, 65, 85)"], [style*="rgb(203, 213, 225)"] {
    color:rgba(246,240,229,.6) !important;
  }
  [style*="#fef2f2"], [style*="#fff7ed"], [style*="#F4EFE4"], [style*="#fffbeb"], [style*="#eff6ff"], [style*="#f0fdf4"], [style*="#fff"],
  [style*="rgb(254, 242, 242)"], [style*="rgb(255, 247, 237)"], [style*="rgb(244, 239, 228)"], [style*="rgb(255, 251, 235)"],
  [style*="rgb(239, 246, 255)"], [style*="rgb(240, 253, 244)"], [style*="rgb(255, 255, 255)"] {
    background-color:#0b1118 !important;
  }
  .drv-root input, .drv-root select, .drv-root textarea {
    background:#050a10 !important; color:#f6f0e5 !important;
    border:1px solid rgba(201,155,74,.45) !important; border-radius:10px !important;
  }
  .drv-root input::placeholder, .drv-root textarea::placeholder { color:rgba(246,240,229,.4) !important; }
  .drv-root select option { background:#050a10; color:#f6f0e5; }
  .drv-root input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(1) sepia(1) saturate(4) hue-rotate(5deg); }
  @media (max-width:600px) {
    .drv-root { max-width:100%; border:0; }
    .drv-overview-actions button { min-height:58px; }
    .drv-team-map { margin:8px 0 10px !important; }
  }
  /* MAQUETTE APT */
  html, body { overflow-x:hidden !important; overflow-y:auto !important; height:auto !important; min-height:100%; }
  body { overscroll-behavior-y:auto !important; }
  .drv-root { position:relative !important; inset:auto !important; min-height:100dvh; height:auto !important; overflow:visible !important; background:#02070d !important; }
  .drv-header { height:78px !important; min-height:78px !important; padding:0 18px !important; background:linear-gradient(180deg,#07111a,#03080e) !important; border-bottom:1px solid rgba(201,155,74,.16) !important; }
  .drv-header-title strong { font-size:18px !important; } .drv-header-title span { font-size:12px !important; }
  .drv-header-live { margin-left:20px; }
  .drv-header-kpi { display:flex; flex-direction:column; min-width:120px; padding:0 22px; border-left:1px solid rgba(255,255,255,.07); }
  .drv-header-kpi small { color:#7f8b98; font-size:9px; letter-spacing:.04em; } .drv-header-kpi strong { color:#f6f0e5; font-size:20px; margin-top:4px; } .drv-header-kpi strong span { color:#e0b866; }
  .drv-header-datetime { margin-left:auto; }
  .drv-main { display:block !important; margin-left:0 !important; min-height:calc(100dvh - 78px) !important; overflow:visible !important; }
  .drv-tabs { position:fixed !important; top:0 !important; left:0 !important; bottom:0 !important; width:164px !important; height:100dvh !important; padding:0 10px 20px !important; display:flex !important; flex-direction:column !important; background:#040a11 !important; border:0 !important; border-right:1px solid rgba(201,155,74,.18) !important; z-index:30 !important; overflow-y:auto !important; overflow-x:hidden !important; }
  .drv-side-logo { height:104px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-bottom:1px solid rgba(255,255,255,.06); margin:0 -10px 12px; }
  .drv-side-logo span { color:#e0b866; font:32px Georgia,serif; line-height:.8; } .drv-side-logo b { color:#fff; font:20px Georgia,serif; } .drv-side-logo em { color:#e0b866; font:700 7px Arial,sans-serif; letter-spacing:.15em; font-style:normal; }
  .drv-tab { width:100% !important; min-height:42px !important; padding:9px 10px !important; flex-direction:row !important; justify-content:flex-start !important; gap:11px !important; border:0 !important; border-left:3px solid transparent !important; border-radius:6px !important; color:#b9c1ca !important; font-size:10px !important; font-weight:700 !important; }
  .drv-tab.active { background:linear-gradient(90deg,rgba(201,155,74,.22),rgba(201,155,74,.04)) !important; color:#fff !important; border-left-color:#e0b866 !important; }
  .drv-tab-icon { display:grid; place-items:center; width:20px; flex:0 0 20px; } .drv-tab-icon svg { width:18px !important; height:18px !important; }
  .drv-tab-count { margin-left:auto !important; background:#14304e !important; color:#9ec8ff !important; padding:3px 7px !important; border-radius:5px !important; font-size:9px !important; }
  .drv-content { min-height:calc(100dvh - 78px); margin-left:164px; padding:0 18px 26px; overflow:visible; }
  .drv-dashboard { width:100%; max-width:1500px; margin:0 auto; padding:14px 0 30px; }
  .drv-dashboard-grid-top { display:grid; grid-template-columns:minmax(330px,1.15fr) minmax(320px,1fr) minmax(260px,.86fr); gap:10px; }
  .drv-dashboard-grid-mid { display:grid; grid-template-columns:1.15fr 1fr .9fr; gap:10px; margin-top:10px; }
  .drv-dashboard-grid-bottom { display:grid; grid-template-columns:1fr 1.15fr .95fr 1.35fr; gap:10px; margin-top:10px; }
  .drv-dashboard .drv-card { background:linear-gradient(145deg,#08131d,#050b12) !important; border:1px solid rgba(116,146,169,.22) !important; border-radius:9px !important; color:#f7f7f4 !important; margin:0 !important; box-shadow:inset 0 1px rgba(255,255,255,.025); }
  .drv-card-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:13px; color:#f5f5f3; font-size:12px; font-weight:800; }
  .drv-card-head > span { letter-spacing:.01em; } .drv-card-head > b { background:#123050; color:#b7dcff; border-radius:5px; padding:3px 7px; font-size:9px; } .drv-card-head > button { background:none; border:0; color:#cbd2d8; font-size:9px; font-weight:800; cursor:pointer; }
  .drv-next-card { min-height:315px; } .drv-next-layout { display:grid; grid-template-columns:100px 1fr; gap:14px; padding:2px 0 15px; border-bottom:1px solid rgba(255,255,255,.07); }
  .drv-next-time strong { display:block; color:#fff; font-size:32px; line-height:1; } .drv-next-time span { display:block; margin-top:8px; color:#aab4bf; font-size:11px; }
  .drv-next-route { border-left:1px solid rgba(255,255,255,.08); padding-left:15px; display:grid; gap:13px; } .drv-next-route > div { position:relative; padding-left:15px; } .drv-next-route strong { display:block; font-size:14px; } .drv-next-route small { display:block; color:#8995a1; font-size:10px; margin-top:3px; }
  .dot { position:absolute; left:0; top:4px; width:8px; height:8px; border-radius:50%; } .dot.green { background:#58cf39; } .dot.red { background:#ff4350; }
  .drv-next-meta { display:grid; grid-template-columns:1.3fr 1fr .65fr; gap:10px; padding:12px 0; color:#d9dee2; font-size:10px; } .drv-next-meta span { display:flex; flex-direction:column; gap:3px; border-right:1px solid rgba(255,255,255,.07); } .drv-next-meta span:last-child { border:0; } .drv-next-meta small { color:#8995a1; }
  .drv-btn-start,.drv-btn-detail { min-height:40px; border-radius:5px; padding:9px 10px; font-size:10px; font-weight:800; cursor:pointer; } .drv-btn-start { flex:1.4; background:#43b51f; color:#fff; border:1px solid #5bdc35; } .drv-btn-detail { flex:1; background:#07101a; color:#f2f2ef; border:1px solid #50606e; }
  .drv-day-card,.drv-revenue-card { min-height:315px; } .drv-day-list { display:flex; flex-direction:column; }
  .drv-day-row { display:grid; grid-template-columns:45px minmax(0,1fr) 42px 58px; gap:5px; align-items:center; padding:8px 0; border:0; border-top:1px solid rgba(255,255,255,.055); background:transparent; color:#dce1e5; text-align:left; font-size:10px; cursor:pointer; } .drv-day-row:first-child { border-top:0; } .drv-day-row time { color:#fff; font-weight:700; } .drv-day-row span { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; } .drv-day-row strong { text-align:right; } .drv-day-row em { font-style:normal; text-align:center; border-radius:10px; padding:3px 2px; background:#17351e; color:#57d63d; font-size:7px; font-weight:800; } .drv-day-row em.upcoming { background:#17304a; color:#55b5ff; }
  .drv-revenue-main { display:grid; grid-template-columns:1fr auto; align-items:start; } .drv-revenue-main strong { color:#52d638; font-size:32px; line-height:1; } .drv-revenue-main span { grid-column:1; color:#59d93e; font-size:9px; margin-top:5px; } .drv-revenue-main b { color:#54db3b; font-size:14px; text-align:right; } .drv-revenue-main b small { display:block; color:#9ca7b0; font-size:8px; font-weight:400; margin-top:4px; }
  .drv-revenue-card .drv-card-head select { background:#09131d; color:#e5e9eb; border:1px solid #3b4c5a; border-radius:5px; padding:5px 8px; font-size:9px; }
  .drv-chart { height:112px; margin:10px 0; display:flex; align-items:flex-end; gap:4px; padding:0 3px; border-bottom:1px solid rgba(255,255,255,.08); background:repeating-linear-gradient(to bottom,transparent 0,transparent 27px,rgba(255,255,255,.045) 28px); } .drv-chart i { flex:1; background:#49c933; border-radius:1px 1px 0 0; opacity:.9; }
  .drv-revenue-footer { display:grid; grid-template-columns:repeat(3,1fr); text-align:center; border-top:1px solid rgba(255,255,255,.06); padding-top:10px; } .drv-revenue-footer span { font-size:8px; color:#a5afb8; border-right:1px solid rgba(255,255,255,.06); } .drv-revenue-footer span:last-child { border:0; } .drv-revenue-footer b { display:block; color:#eef0f0; font-size:15px; margin-bottom:3px; }
  .drv-plan-row { display:grid; grid-template-columns:102px minmax(0,1fr) 40px 25px; gap:7px; align-items:center; padding:11px 0; border-top:1px solid rgba(255,255,255,.06); font-size:10px; } .drv-plan-row:first-of-type { border-top:0; } .drv-plan-row > span { color:#bbc3c9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .drv-plan-row > b { text-align:right; } .drv-plan-row > em { color:#be6eff; font-style:normal; }
  .violet-pill { background:#32225b !important; color:#c69bff !important; } .red-pill { background:#54232c !important; color:#ff8c98 !important; } .gold-pill { background:#58440d !important; color:#ffd449 !important; }
  .drv-message-row { display:grid; grid-template-columns:32px 1fr 38px; gap:8px; align-items:center; padding:9px 0; border-top:1px solid rgba(255,255,255,.06); } .avatar { width:30px; height:30px; border-radius:50%; display:grid; place-items:center; background:#d9b49a; color:#16202a; font-size:8px; font-weight:900; } .drv-message-row div:nth-child(2) b { display:block; font-size:10px; } .drv-message-row div:nth-child(2) span { display:block; color:#9ba5ae; font-size:9px; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .drv-message-row > small { color:#7e8993; text-align:right; font-size:8px; } .drv-message-row > small i { display:inline-block; width:5px; height:5px; border-radius:50%; background:#ff4b55; }
  .drv-rating strong { font-size:42px; color:#f4f4f1; } .drv-rating > span { color:#9aa5ae; font-size:14px; } .drv-rating div { color:#ffc928; font-size:17px; letter-spacing:2px; margin-top:8px; } .drv-rating small { display:block; color:#9aa5ae; font-size:9px; margin-top:5px; } .drv-rating-bars { margin-top:-50px; margin-left:120px; } .drv-rating-bars > div { display:flex; align-items:center; gap:5px; margin:5px 0; } .drv-rating-bars b { width:28px; font-size:8px; } .drv-rating-bars i { height:5px; flex:1; background:#25313a; border-radius:5px; overflow:hidden; } .drv-rating-bars i span { display:block; height:100%; background:#f5bb18; }
  .drv-vehicle-card > strong { display:block; font-size:14px; margin-bottom:3px; } .drv-vehicle-card > span { color:#9aa5ae; font-size:10px; } .drv-car-placeholder { height:70px; margin:10px 0 5px; display:grid; place-items:end center; color:#687580; font-size:28px; font-weight:900; font-style:italic; background:radial-gradient(ellipse at center,#1a2731 0,transparent 55%); } .drv-vehicle-card footer { display:flex; gap:10px; border-top:1px solid rgba(255,255,255,.06); padding-top:8px; color:#b8c1c8; font-size:8px; } .drv-vehicle-card footer i { color:#44cc39; font-style:normal; }
  .drv-gps-card > strong { display:block; font-size:10px; } .drv-gps-card > span { color:#a4adb4; font-size:9px; display:block; margin-top:2px; } .gps-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#4ed239; margin-right:5px; } .live-small { background:#15371c !important; color:#5cdb44 !important; }
  .gps-map { height:97px; margin-top:8px; border-radius:6px; position:relative; overflow:hidden; background-color:#6f6c60; background-image:linear-gradient(25deg,transparent 45%,rgba(255,255,255,.5) 46%,rgba(255,255,255,.5) 48%,transparent 49%),linear-gradient(120deg,transparent 40%,rgba(53,54,47,.65) 41%,rgba(53,54,47,.65) 44%,transparent 45%),repeating-linear-gradient(12deg,rgba(180,177,160,.35) 0 2px,transparent 2px 15px); } .gps-map > span { position:absolute; z-index:2; left:50%; top:52%; transform:translate(-50%,-50%); width:16px; height:16px; border-radius:50%; background:#2387ed; border:3px solid #d9efff; color:transparent; }
  .drv-notif-row { display:grid; grid-template-columns:18px 1fr auto; align-items:center; gap:6px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.06); color:#dce1e4; font-size:9px; } .drv-notif-row small { color:#7d8891; font-size:7px; } .drv-see-all { display:block; margin:9px auto 0; background:none; border:0; color:#d0d5d9; font-size:8px; cursor:pointer; }
  .shortcut-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; } .shortcut-grid button { border:0; background:transparent; color:#f1f3f2; cursor:pointer; min-width:0; } .shortcut-grid b { display:grid; place-items:center; width:46px; height:46px; margin:0 auto 8px; border-radius:10px; font-size:27px; background:#0965d8; color:#fff; } .shortcut-grid button:nth-child(2) b { background:#2d9b36; } .shortcut-grid button:nth-child(3) b { background:#9348b7; } .shortcut-grid button:nth-child(4) b { background:#087f82; } .shortcut-grid span { font-size:7px; font-weight:800; line-height:1.35; }
  .drv-mobile-stats { display:none; }
  .drv-mobile-nav { display:none; } .drv-body { overflow:visible !important; height:auto !important; min-height:0 !important; }
  @media (max-width:1100px) and (min-width:701px) {
    .drv-header-kpi { min-width:90px; padding:0 10px; } .drv-header-kpi strong { font-size:16px; }
    .drv-content { margin-left:0; padding:0 12px 24px; } .drv-tabs { position:sticky !important; top:0 !important; left:auto !important; width:100% !important; height:58px !important; flex-direction:row !important; overflow-x:auto !important; z-index:20 !important; padding:0 6px !important; } .drv-side-logo { display:none; } .drv-tab { width:auto !important; min-width:95px !important; flex:0 0 auto !important; flex-direction:column !important; border-left:0 !important; border-bottom:3px solid transparent !important; border-radius:0 !important; } .drv-tab.active { border-left:0 !important; border-bottom-color:#e0b866 !important; } .drv-dashboard-grid-top { grid-template-columns:1fr 1fr; } .drv-revenue-card { grid-column:span 2; } .drv-dashboard-grid-mid,.drv-dashboard-grid-bottom { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:700px) {
    html,body { overflow-y:auto !important; -webkit-overflow-scrolling:touch !important; touch-action:pan-y !important; } .drv-root { min-height:100svh !important; padding-bottom:68px !important; } .drv-header { position:sticky !important; top:0 !important; z-index:50; height:58px !important; min-height:58px !important; padding:7px 10px !important; } .drv-brand-mark { width:34px !important; height:34px !important; flex-basis:34px !important; font-size:16px; } .drv-header-title strong { font-size:12px !important; } .drv-header-title span { font-size:8px !important; } .drv-header-live { margin-left:auto; font-size:7px !important; padding:4px 6px !important; } .drv-header-kpi,.drv-header-datetime,.drv-header-back { display:none !important; } .drv-header-bell { width:31px !important; height:31px !important; border:0 !important; background:transparent !important; } .drv-tabs { display:none !important; } .drv-main { min-height:0 !important; } .drv-content { margin:0 !important; padding:0 10px !important; min-height:0 !important; } .drv-dashboard { padding:9px 0 22px; } .drv-dashboard-grid-top { display:flex; flex-direction:column; gap:8px; } .drv-next-card { order:0; min-height:0; padding:11px !important; } .drv-next-layout { grid-template-columns:70px 1fr; gap:9px; padding-bottom:9px; } .drv-next-time strong { font-size:24px; } .drv-next-time span { font-size:8px; margin-top:5px; } .drv-next-route { padding-left:10px; gap:8px; } .drv-next-route strong { font-size:10px; } .drv-next-route small { font-size:7px; } .drv-next-meta { font-size:7px; padding:8px 0; gap:5px; } .drv-next-meta small { font-size:6.5px; } .drv-btn-start,.drv-btn-detail { min-height:31px; font-size:7px; padding:6px; } .drv-card-head { font-size:9px; margin-bottom:8px; } .drv-revenue-card,.drv-dashboard-grid-mid,.drv-dashboard-grid-bottom { display:none !important; } .drv-day-card { min-height:0; order:2; padding:10px !important; } .drv-day-row { grid-template-columns:38px minmax(0,1fr) 34px 45px; padding:6px 0; font-size:7.5px; } .drv-day-row em { font-size:6px; } .drv-mobile-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; order:1; } .drv-mobile-stats div { background:#07121b; border:1px solid rgba(116,146,169,.2); border-radius:8px; padding:8px 4px; text-align:center; } .drv-mobile-stats b { display:block; color:#f4f5f3; font-size:12px; } .drv-mobile-stats span { display:block; color:#7e8993; font-size:6px; margin-top:3px; letter-spacing:.04em; }
    .drv-mobile-nav { position:fixed; display:grid; grid-template-columns:repeat(5,1fr); left:0; right:0; bottom:0; height:68px; padding-bottom:env(safe-area-inset-bottom,0); background:#050a10; border-top:1px solid rgba(201,155,74,.22); z-index:100; } .drv-mobile-nav button { position:relative; border:0; background:transparent; color:#88939e; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; font-size:7px; font-weight:700; } .drv-mobile-nav button.active { color:#e0b866; } .drv-mobile-nav svg { width:18px; height:18px; } .drv-mobile-nav b { position:absolute; top:8px; margin-left:17px; min-width:13px; height:13px; display:grid; place-items:center; border-radius:8px; background:#164b88; color:#fff; font-size:7px; }
    .drv-body { overflow:visible !important; -webkit-overflow-scrolling:auto !important; touch-action:auto !important; padding:8px 0 28px !important; } .drv-body * { touch-action:auto; }
  }

  /* Mobile: the fifth action opens the complete navigation drawer. */
  .drv-mobile-drawer-backdrop { display:none; }
  .drv-mobile-drawer { display:none; }
  @media (max-width:700px) {
    .drv-mobile-drawer-backdrop { position:fixed; inset:0; z-index:110; display:block; background:rgba(0,0,0,.62); }
    .drv-mobile-drawer { position:fixed; top:0; right:0; bottom:0; z-index:111; display:flex; width:min(86vw,340px); flex-direction:column; gap:5px; overflow-y:auto; padding:calc(env(safe-area-inset-top,0px) + 18px) 14px calc(env(safe-area-inset-bottom,0px) + 84px); background:#050a10; border-left:1px solid rgba(201,155,74,.45); box-shadow:-18px 0 40px rgba(0,0,0,.35); }
    .drv-mobile-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 4px 14px; margin-bottom:4px; border-bottom:1px solid rgba(201,155,74,.25); color:#e0b866; font-size:13px; font-weight:800; }
    .drv-mobile-drawer-close { width:34px; height:34px; border:1px solid rgba(201,155,74,.45); border-radius:7px; background:#07101a; color:#e0b866; font-size:20px; cursor:pointer; }
    .drv-mobile-drawer button:not(.drv-mobile-drawer-close) { display:flex; align-items:center; gap:12px; min-height:48px; padding:10px 12px; border:1px solid transparent; border-radius:7px; background:transparent; color:#b9c1ca; font-size:12px; font-weight:700; text-align:left; cursor:pointer; }
    .drv-mobile-drawer button.active { color:#fff; background:rgba(201,155,74,.14); border-color:rgba(201,155,74,.35); }
    .drv-mobile-drawer svg { width:19px; height:19px; flex:0 0 auto; color:#e0b866; }
    .drv-mobile-drawer .drv-tab-count { margin-left:auto; }
  }

  @media (min-width:701px) { .drv-header > .drv-brand-mark { display:none !important; } }
  @media (max-width:700px) {
    .drv-identity-switcher { display:block !important; flex:0 0 auto !important; }
    .drv-identity-switcher > button { width:auto !important; height:32px !important; min-height:32px !important; padding:5px 9px !important; font-size:11px !important; border:1px solid #c99b4a !important; background:#07101a !important; color:#e0b866 !important; }
  }
  /* Le menu déroulant Alain/Patricia doit toujours passer au-dessus du header
     sticky, de la sidebar/tabs et de tout le reste de l'UI, quel que soit le
     breakpoint (le header seul crée déjà son propre contexte d'empilement
     via position:sticky + z-index, donc le switcher doit dépasser TOUTES
     les valeurs de z-index utilisées ailleurs dans ce fichier, y compris
     .drv-tabs et .drv-mobile-drawer). */
  .drv-identity-switcher,
  .drv-identity-menu { z-index: 300 !important; }

  #root { height:auto !important; min-height:100% !important; overflow:visible !important; }
  .drv-root, .drv-main, .drv-content, .drv-dashboard { touch-action:auto !important; }
  @media (min-width:1101px) { .drv-header { margin-left:164px !important; } }
  @media (max-width:700px) { #root { overflow:visible !important; } .drv-root { overflow:visible !important; } .drv-main,.drv-content { overflow:visible !important; } }

  /* ================================================================
     APT — ALIGNEMENT FINAL SUR LA MAQUETTE FOURNIE
     Breakpoints: mobile / tablette / desktop.
     Ces règles restent uniquement visuelles et ne modifient aucune
     logique métier, donnée, navigation ou appel serveur.
     ================================================================ */

  /* ---------- DESKTOP : >= 1101px ---------- */
  @media (min-width:1101px) {
    html, body { overflow-x:hidden !important; }

    .drv-header {
      margin-left:145px !important;
      height:78px !important;
      min-height:78px !important;
      padding:0 18px !important;
      gap:10px !important;
    }

    .drv-tabs {
      width:145px !important;
      padding:0 9px 18px !important;
    }

    .drv-side-logo {
      height:104px !important;
      margin:0 -9px 12px !important;
    }

    .drv-content {
      margin-left:145px !important;
      padding:0 15px 26px !important;
      min-width:0 !important;
    }

    .drv-dashboard {
      max-width:none !important;
      width:100% !important;
      padding:12px 0 30px !important;
    }

    /* La maquette desktop utilise trois colonnes de même poids. */
    .drv-dashboard-grid-top {
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:10px !important;
    }

    .drv-dashboard-grid-mid {
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:10px !important;
      margin-top:10px !important;
    }

    /* 4 cartes du bas : véhicule / GPS / notifications / raccourcis. */
    .drv-dashboard-grid-bottom {
      grid-template-columns:.83fr 1fr .86fr 1.39fr !important;
      gap:10px !important;
      margin-top:10px !important;
    }

    .drv-dashboard .drv-card {
      min-width:0 !important;
      overflow:hidden !important;
    }

    .drv-next-card,
    .drv-day-card,
    .drv-revenue-card {
      min-height:315px !important;
    }

    .drv-next-card { padding:14px !important; }
    .drv-day-card,
    .drv-revenue-card { padding:14px !important; }

    .drv-next-layout { grid-template-columns:100px minmax(0,1fr) !important; }
    .drv-next-route { min-width:0 !important; }
    .drv-next-route strong,
    .drv-day-row span,
    .drv-plan-row > span,
    .drv-message-row div:nth-child(2) span {
      overflow:hidden !important;
      text-overflow:ellipsis !important;
    }

    .drv-plan-row {
      grid-template-columns:102px minmax(0,1fr) 40px 25px !important;
    }

    .drv-message-row {
      grid-template-columns:32px minmax(0,1fr) 38px !important;
    }

    .drv-rating-bars {
      margin-left:120px !important;
    }

    .shortcut-grid {
      grid-template-columns:repeat(4,minmax(0,1fr)) !important;
      gap:6px !important;
    }

    .shortcut-grid b {
      width:46px !important;
      height:46px !important;
    }
  }

  /* ---------- TABLETTE : 701–1100px ----------
     Navigation horizontale + contenu en grille 2 colonnes. */
  @media (min-width:701px) and (max-width:1100px) {
    html, body { overflow-x:hidden !important; }

    .drv-header {
      height:72px !important;
      min-height:72px !important;
      padding:0 16px !important;
    }

    .drv-header > .drv-brand-mark {
      display:grid !important;
      width:42px !important;
      height:42px !important;
      flex:0 0 42px !important;
      font-size:17px !important;
    }

    .drv-header-title strong { font-size:16px !important; }
    .drv-header-title span { font-size:10px !important; }

    .drv-header-live {
      margin-left:auto !important;
    }

    .drv-header-kpi {
      min-width:84px !important;
      padding:0 10px !important;
    }

    .drv-header-kpi small { font-size:8px !important; }
    .drv-header-kpi strong { font-size:16px !important; }

    .drv-header-datetime { display:block !important; font-size:9px !important; }
    .drv-header-datetime strong { font-size:10px !important; }

    .drv-tabs {
      position:sticky !important;
      top:0 !important;
      width:100% !important;
      height:56px !important;
      min-height:56px !important;
      padding:0 6px !important;
      flex-direction:row !important;
      align-items:stretch !important;
      overflow-x:auto !important;
      overflow-y:hidden !important;
      z-index:20 !important;
    }

    .drv-side-logo { display:none !important; }

    .drv-tab {
      min-width:86px !important;
      min-height:56px !important;
      flex:0 0 auto !important;
      padding:7px 8px !important;
      flex-direction:column !important;
      justify-content:center !important;
      gap:3px !important;
      border-left:0 !important;
      border-bottom:3px solid transparent !important;
      border-radius:0 !important;
      font-size:9px !important;
    }

    .drv-tab.active {
      border-left:0 !important;
      border-bottom-color:#e0b866 !important;
    }

    .drv-tab-icon svg { width:17px !important; height:17px !important; }

    .drv-content {
      margin-left:0 !important;
      padding:0 14px 26px !important;
    }

    .drv-dashboard {
      max-width:none !important;
      padding:12px 0 28px !important;
    }

    .drv-dashboard-grid-top {
      grid-template-columns:repeat(2,minmax(0,1fr)) !important;
      gap:10px !important;
    }

    .drv-next-card,
    .drv-day-card {
      min-height:315px !important;
    }

    .drv-revenue-card {
      grid-column:1 / -1 !important;
      min-height:270px !important;
    }

    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom {
      grid-template-columns:repeat(2,minmax(0,1fr)) !important;
      gap:10px !important;
    }

    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom { margin-top:10px !important; }

    .drv-dashboard .drv-card {
      min-width:0 !important;
      overflow:hidden !important;
    }
  }

  /* ---------- MOBILE : <= 700px ----------
     On colle au téléphone de la maquette : barre compacte,
     carte prochaine course, 3 KPI, courses du jour et navigation basse. */
  @media (max-width:700px) {
    .drv-header {
      height:58px !important;
      min-height:58px !important;
      padding:7px 10px !important;
      gap:7px !important;
    }

    .drv-header > .drv-brand-mark {
      display:grid !important;
      width:34px !important;
      height:34px !important;
      flex:0 0 34px !important;
      font-size:15px !important;
    }

    /* Dans la maquette téléphone, le nom n'occupe pas la barre du haut :
       le bouton hamburger reste juste à côté du logo. */
    .drv-header-title { display:none !important; }

    .drv-header-live {
      margin-left:auto !important;
      padding:4px 7px !important;
      font-size:7px !important;
    }

    .drv-header-bell {
      width:31px !important;
      height:31px !important;
    }

    .drv-content {
      margin:0 !important;
      padding:0 10px !important;
    }

    .drv-dashboard {
      width:100% !important;
      padding:9px 0 22px !important;
    }

    .drv-dashboard-grid-top {
      display:flex !important;
      flex-direction:column !important;
      gap:8px !important;
    }

    .drv-next-card {
      order:0 !important;
      min-height:0 !important;
      padding:11px !important;
    }

    .drv-mobile-stats {
      order:1 !important;
      display:grid !important;
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:6px !important;
    }

    .drv-day-card {
      order:2 !important;
      min-height:0 !important;
      padding:10px !important;
    }

    .drv-revenue-card,
    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom {
      display:none !important;
    }

    .drv-next-layout {
      grid-template-columns:70px minmax(0,1fr) !important;
      gap:9px !important;
    }

    .drv-next-route { min-width:0 !important; }
    .drv-next-route strong {
      overflow:hidden !important;
      text-overflow:ellipsis !important;
      white-space:nowrap !important;
    }

    .drv-next-meta {
      grid-template-columns:1.25fr 1fr .65fr !important;
    }

    .drv-btns {
      gap:7px !important;
    }

    .drv-mobile-nav {
      height:68px !important;
    }
  }


  /* ================================================================
     APT — DASHBOARD FINAL / MAQUETTE
     Priorité au rendu d'arrivée sur /driver.
     On conserve volontairement le sélecteur Alain/Patricia et
     « Retour au site ». Aucun comportement métier n'est modifié.
     ================================================================ */
  @media (min-width:1101px) {
    html, body { overflow-x:hidden !important; }

    .drv-root {
      min-height:100dvh !important;
      background:#02070d !important;
    }

    /* Sidebar = colonne fixe de la maquette */
    .drv-tabs {
      position:fixed !important;
      inset:0 auto 0 0 !important;
      width:145px !important;
      height:100dvh !important;
      padding:0 9px 18px !important;
      display:flex !important;
      flex-direction:column !important;
      background:#040a11 !important;
      border:0 !important;
      border-right:1px solid rgba(201,155,74,.18) !important;
      overflow-y:auto !important;
      overflow-x:hidden !important;
      z-index:40 !important;
    }

    .drv-side-logo {
      width:auto !important;
      height:104px !important;
      margin:0 -9px 12px !important;
      flex:0 0 104px !important;
    }

    .drv-tab {
      width:100% !important;
      min-height:42px !important;
      flex:0 0 42px !important;
      padding:9px 8px !important;
      display:flex !important;
      flex-direction:row !important;
      justify-content:flex-start !important;
      align-items:center !important;
      gap:10px !important;
      border:0 !important;
      border-left:3px solid transparent !important;
      border-radius:6px !important;
      color:#b9c1ca !important;
      font-size:10px !important;
      font-weight:700 !important;
    }

    .drv-tab.active {
      color:#fff !important;
      border-left-color:#e0b866 !important;
      background:linear-gradient(90deg,rgba(201,155,74,.22),rgba(201,155,74,.04)) !important;
    }

    .drv-tab-icon { width:20px !important; flex:0 0 20px !important; display:grid !important; place-items:center !important; }
    .drv-tab-icon svg { width:18px !important; height:18px !important; }
    .drv-tab-label { min-width:0 !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; }
    .drv-tab-count { display:inline-flex !important; margin-left:auto !important; flex:0 0 auto !important; }

    /* Header aligné sur le bord droit de la sidebar */
    .drv-header {
      position:relative !important;
      z-index:35 !important;
      margin-left:145px !important;
      width:calc(100% - 145px) !important;
      height:78px !important;
      min-height:78px !important;
      padding:0 18px !important;
      gap:10px !important;
      background:linear-gradient(180deg,#07111a,#03080e) !important;
      border-bottom:1px solid rgba(201,155,74,.16) !important;
      overflow:visible !important;
    }

    .drv-brand-mark { display:none !important; }

    .drv-header-title {
      min-width:180px !important;
      flex:1 1 auto !important;
      display:flex !important;
      flex-direction:column !important;
      gap:2px !important;
    }
    .drv-header-title strong { font-size:17px !important; color:#f6f0e5 !important; }
    .drv-header-title span { font-size:11px !important; color:rgba(246,240,229,.55) !important; }

    /* Conservation explicite du sélecteur */
    .drv-header > div[style*="position: relative"] {
      display:block !important;
      flex:0 0 auto !important;
    }
    .drv-header > div[style*="position: relative"] > button {
      min-height:32px !important;
      white-space:nowrap !important;
    }

    .drv-header-live {
      flex:0 0 auto !important;
      margin-left:0 !important;
    }

    .drv-header-kpi {
      min-width:105px !important;
      padding:0 15px !important;
    }
    .drv-header-kpi small { font-size:8px !important; }
    .drv-header-kpi strong { font-size:18px !important; }

    .drv-header-datetime {
      display:block !important;
      flex:0 0 auto !important;
      margin-left:auto !important;
      min-width:96px !important;
      font-size:10px !important;
      text-align:right !important;
    }
    .drv-header-datetime strong { font-size:11px !important; }

    .drv-header-bell {
      flex:0 0 34px !important;
      width:34px !important;
      height:34px !important;
    }

    /* Conservation explicite de « Retour au site » */
    .drv-header-back {
      display:flex !important;
      flex:0 0 auto !important;
      align-items:center !important;
      height:34px !important;
      padding:0 10px !important;
      border:1px solid rgba(201,155,74,.65) !important;
      border-radius:8px !important;
      background:#07101a !important;
      color:#e0b866 !important;
      font-size:10px !important;
      font-weight:700 !important;
      white-space:nowrap !important;
    }

    .drv-main {
      margin-left:0 !important;
      min-height:calc(100dvh - 78px) !important;
      display:block !important;
      overflow:visible !important;
    }

    .drv-content {
      margin-left:145px !important;
      width:calc(100% - 145px) !important;
      min-width:0 !important;
      padding:0 15px 26px !important;
      overflow:visible !important;
    }

    .drv-dashboard {
      width:100% !important;
      max-width:none !important;
      margin:0 !important;
      padding:12px 0 30px !important;
    }

    /* Trois colonnes égales, comme la maquette */
    .drv-dashboard-grid-top,
    .drv-dashboard-grid-mid {
      width:100% !important;
      display:grid !important;
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:10px !important;
    }
    .drv-dashboard-grid-mid { margin-top:10px !important; }

    /* Quatre blocs en bas avec le poids visuel de la maquette */
    .drv-dashboard-grid-bottom {
      width:100% !important;
      display:grid !important;
      grid-template-columns:.83fr .96fr .87fr 1.39fr !important;
      gap:10px !important;
      margin-top:10px !important;
    }

    .drv-dashboard .drv-card {
      min-width:0 !important;
      margin:0 !important;
      padding:14px !important;
      border-radius:9px !important;
      background:linear-gradient(145deg,#08131d,#050b12) !important;
      border:1px solid rgba(116,146,169,.22) !important;
      box-shadow:inset 0 1px rgba(255,255,255,.025) !important;
      overflow:hidden !important;
    }

    .drv-next-card,
    .drv-day-card,
    .drv-revenue-card { min-height:315px !important; }

    .drv-card-head {
      min-height:22px !important;
      margin-bottom:8px !important;
      font-size:11px !important;
    }
    .drv-card-head > span { min-width:0 !important; }

    .drv-next-layout {
      grid-template-columns:100px minmax(0,1fr) !important;
      gap:14px !important;
    }
    .drv-next-time strong { font-size:31px !important; }
    .drv-next-route { min-width:0 !important; }
    .drv-next-route strong,
    .drv-day-row span,
    .drv-plan-row > span,
    .drv-message-row div:nth-child(2) span {
      overflow:hidden !important;
      text-overflow:ellipsis !important;
    }

    .drv-day-list { min-width:0 !important; }
    .drv-day-row {
      grid-template-columns:40px minmax(0,1fr) 38px 54px !important;
      min-width:0 !important;
      padding:7px 0 !important;
    }

    .drv-plan-row {
      grid-template-columns:102px minmax(0,1fr) 40px 25px !important;
      min-width:0 !important;
    }

    .drv-message-row {
      grid-template-columns:32px minmax(0,1fr) 38px !important;
    }

    .drv-rating-bars { margin-left:120px !important; }

    .shortcut-grid {
      grid-template-columns:repeat(4,minmax(0,1fr)) !important;
      gap:6px !important;
    }
    .shortcut-grid b { width:46px !important; height:46px !important; }
  }

  /* Tablette : dashboard lisible sans supprimer les contrôles du header */
  @media (min-width:701px) and (max-width:1100px) {
    .drv-header-back { display:flex !important; }
    .drv-header > div[style*="position: relative"] { display:block !important; }
    .drv-header-kpi { min-width:78px !important; padding:0 7px !important; }
    .drv-header-kpi small { font-size:7px !important; }
    .drv-header-kpi strong { font-size:14px !important; }
    .drv-dashboard-grid-top { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
    .drv-dashboard-grid-mid,.drv-dashboard-grid-bottom { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
  }


`;

// ── Icons ──────────────────────────────────────────────────────────────────
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
const IconMessage = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.2-.6L4 20l1.6-4A7.5 7.5 0 1 1 20 11.5Z" />
    <path d="M8 11h.01M12 11h.01M16 11h.01" />
  </svg>
);
const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconStar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconChart = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    <line x1="8" y1="19" x2="8" y2="19.01" />
    <line x1="12" y1="19" x2="12" y2="19.01" />
    <line x1="16" y1="19" x2="16" y2="19.01" />
  </svg>
);

// Icône onglet "Appareils" (notifications push par appareil).
const IconDevice = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <line x1="11" y1="18" x2="13" y2="18" />
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

const IconDevis = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const IconGps = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "drv-stars" : "drv-stars-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── Main component ─────────────────────────────────────────────────────────
function DriverPage() {
  const { token } = Route.useSearch();
  const verify = useServerFn(verifyDriverToken);
  const openSession = useServerFn(openDriverSession);
  const [status, setStatus] = useState<"checking" | "denied" | "granted">("checking");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [driverLabel, setDriverLabel] = useState("");
  const [driverId, setDriverId] = useState<string>("");

  useEffect(() => {
    setDriverLabel(getDriverName());
  }, []);

  const tryToken = useCallback(
    async (candidate: string): Promise<boolean> => {
      if (!candidate) return false;
      try {
        const res = await verify({ data: { token: candidate } });
        if (res?.ok) {
          setDriverToken(candidate);
          setDriverName(res.driver || "");
          setDriverLabel(res.driver || "");
          setDriverId(res.driverId || "");
          setStatus("granted");
          gaEvent("driver_login", { driver: res.driver || "inconnu" });
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    },
    [verify],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const candidates = [token, getDriverToken()].filter(Boolean) as string[];
      for (const c of candidates) {
        const ok = await tryToken(c);
        if (cancelled) return;
        if (ok) return;
      }
      if (!cancelled) {
        clearDriverToken();
        setStatus("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, tryToken]);

  // Chargement initial très bref (vérif du token en cache) : seul cet état
  // bloque l'écran. Dès qu'on sait qu'il n'y a pas de session valide, on
  // n'affiche plus de mur de connexion — on entre directement dans l'appli ;
  // le choix "Alain / Patricia" devient un simple bouton dans le header,
  // utile pour le suivi GPS et les notifications, jamais bloquant.
  if (status === "checking") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          background: "#03070d",
          fontFamily: "DM Sans,sans-serif",
          color: "#e0b866",
        }}
      >
        <div style={{ fontSize: 40 }}>🚕</div>
      </div>
    );
  }

  const identify = async (id: "alain" | "patricia"): Promise<boolean> => {
    setError(null);
    setBusy(id);
    try {
      const res: any = await openSession({ data: { driver: id } });
      const ok = res?.ok && res.token ? await tryToken(res.token) : false;
      if (!ok) setError("Accès indisponible, réessayez.");
      return ok;
    } catch {
      setError("Accès indisponible, réessayez.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  return (
    <DriverApp
      driverLabel={driverLabel}
      driverId={driverId}
      onIdentify={identify}
      identifyBusy={busy}
      identifyError={error}
    />
  );
}

function DriverApp({
  driverLabel,
  driverId,
  onIdentify,
  identifyBusy,
  identifyError,
}: {
  driverLabel?: string;
  driverId?: string;
  onIdentify: (id: "alain" | "patricia") => Promise<boolean>;
  identifyBusy: string | null;
  identifyError: string | null;
}) {
  const listCoursesFn = useServerFn(listDriverCourses);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dashboardCourses, setDashboardCourses] = useState<Resa[]>([]);

  // Suivi GPS en continu, indépendant de l'onglet affiché (démarre seul dès
  // l'identification, comme avant) — seul l'affichage vit désormais dans
  // l'onglet "GPS".
  const gps = useDriverGpsTracking(driverId);

  const [newCount, setNewCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const [pendingAvis, setPendingAvis] = useState(0);
  const [pendingDevis, setPendingDevis] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  // Busy state dédié aux boutons "🔔 Alain" / "🔔 Patricia" du bandeau, qui
  // fusionnent identification + activation en un seul clic (distinct de
  // pushBusy, utilisé une fois l'identité déjà connue).
  const [identifyPushBusy, setIdentifyPushBusy] = useState<"alain" | "patricia" | null>(null);
  const {
    status: pushStatus,
    subscribe: subscribePush,
    lastError: pushError,
  } = usePushNotifications({
    autoAudience: "chauffeur",
    driverId: driverId ?? null,
  });

  // Reconfirme silencieusement l'abonnement côté serveur à chaque retour sur
  // l'app (la permission étant déjà accordée, aucun prompt système n'apparaît).
  // Corrige le cas d'une ligne push_subscriptions supprimée après un échec FCM.
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (Notification.permission !== "granted") return;
      void subscribePush("chauffeur", null, null).catch(() => {});
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [subscribePush]);

  // Force le manifest driver au runtime : iOS ne lit qu'UN seul <link
  // rel="manifest">, on s'assure qu'il pointe bien sur ?role=driver et
  // qu'aucun manifest client ne subsiste tant qu'on est sur /driver.
  useEffect(() => {
    const links = Array.from(document.querySelectorAll('link[rel="manifest"]')) as HTMLLinkElement[];
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/api/manifest?role=driver";
      document.head.appendChild(link);
    } else {
      links.forEach((l, i) => {
        if (i === 0) l.setAttribute("href", "/api/manifest?role=driver");
        else l.remove();
      });
    }
    // Titre iOS de l'icône sur l'écran d'accueil (Safari ignore le manifest).
    const titleTag = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (titleTag) titleTag.setAttribute("content", "APT Chauffeur");
    return () => {
      const el = document.querySelector('link[rel="manifest"]');
      if (el) el.setAttribute("href", "/api/manifest");
      const t = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (t) t.setAttribute("content", "Access Taxi");
    };
  }, []);

  // Rafraîchissement badge courses (via serveur : anon n'a aucun accès en
  // lecture aux réservations — RLS PII).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const tok = getDriverToken();
        if (!tok) return;
        const res: any = await listCoursesFn({ data: { token: tok } });

        if (cancelled) return;
        const list = (res?.courses ?? []) as Resa[];
        setDashboardCourses(list);
        const mine = list.filter(
          (c: any) => c.status === "pending" && (!driverId || driverId === "admin" || c.assigned_driver === driverId),
        );
        setNewCount(mine.length);
      } catch {
        /* réessai au prochain tick */
      }
    };
    load();
    const poll = setInterval(load, 12000);
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [listCoursesFn, driverId]);

  // Badge avis en attente + toast in-app à chaque nouvel avis
  useEffect(() => {
    const load = async () => {
      try {
        if (!getDriverToken()) {
          return;
        }
        const response = await fetch(`/api/public/reviews?token=${encodeURIComponent(getDriverToken())}`);
        if (!response.ok) return;
        const result = await response.json();
        setPendingAvis(result.pending.length);
      } catch {
        // Le badge se resynchronise au prochain passage/poll.
      }
    };
    load();
    const ch = (supabase as any)
      .channel("drv-avis-badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "avis" }, (payload: any) => {
        const row = payload?.new ?? {};
        const stars = "★".repeat(Math.max(0, Math.min(5, Number(row.note) || 0)));
        const who = row.prenom || row.nom || "Client";
        const extract = (row.commentaire || "").toString().slice(0, 60);
        toast.success(`⭐ Nouvel avis de ${who} ${stars}`, {
          description: extract ? `"${extract}${extract.length >= 60 ? "…" : ""}"` : undefined,
          duration: 8000,
        });
        try {
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            (navigator as any).vibrate?.([80, 40, 80]);
          }
        } catch {}
        load();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "avis" }, load)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "avis" }, load)
      .subscribe();
    // Filets de sécurité : rafraîchir le compteur au retour d'onglet et
    // au focus fenêtre (Realtime peut être coupé en arrière-plan sur iOS).
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    // Refresh périodique de secours : les avis en attente ne sont pas lisibles publiquement en Realtime.
    const poll = setInterval(load, 15000);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(ch);
    };
  }, []);

  // Badge devis en attente — indépendant de l'onglet actif, sur le même
  // principe que le badge avis ci-dessus. Avant ce correctif, pendingDevis
  // n'était mis à jour que par DevisTab.load(), qui n'existe dans le DOM
  // que quand l'onglet "Devis" est déjà ouvert : une nouvelle demande de
  // devis arrivée pendant qu'on est sur un autre onglet ne faisait donc
  // jamais apparaître le badge/l'icône tant qu'on n'avait pas cliqué dessus.
  useEffect(() => {
    let cancelled = false;
    const loadDevisBadge = async () => {
      try {
        if (!getDriverToken()) {
          return;
        }
        const res: any = await listDriverDevis({ data: { token: getDriverToken() } });
        if (!cancelled) setPendingDevis(res?.pending ?? 0);
      } catch {
        // Le badge se resynchronise au prochain passage/poll.
      }
    };
    loadDevisBadge();
    const poll = setInterval(loadDevisBadge, 15000);
    const onVisible = () => {
      if (!document.hidden) loadDevisBadge();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      cancelled = true;
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  // (Badge global d'unread chat retiré : le compteur par course est géré
  // localement par CoursesTab via getUnreadCountsForReservations.)
  const dashboardTodayKey = new Date().toLocaleDateString("fr-FR");
  const dashboardToday = dashboardCourses.filter((r) => {
    const d = new Date(r.pickup_datetime || r.date_heure);
    return (
      !Number.isNaN(d.getTime()) && d.toLocaleDateString("fr-FR") === dashboardTodayKey && r.status !== "cancelled"
    );
  });
  const dashboardInProgress = dashboardCourses.filter((r) => ["en_route", "arrived"].includes(r.status));
  const dashboardUpcoming = dashboardCourses.filter((r) => {
    const d = new Date(r.pickup_datetime || r.date_heure);
    return !Number.isNaN(d.getTime()) && d.getTime() > Date.now() && !["completed", "cancelled"].includes(r.status);
  });
  const dashboardRevenue = dashboardToday.reduce((sum, r) => sum + (Number(r.final_price ?? r.prix_estime) || 0), 0);
  const dashboardNext = [...dashboardUpcoming].sort(
    (a, b) =>
      new Date(a.pickup_datetime || a.date_heure).getTime() - new Date(b.pickup_datetime || b.date_heure).getTime(),
  )[0];
  const dashboardNextMinutes = dashboardNext
    ? Math.max(
        0,
        Math.round(
          (new Date(dashboardNext.pickup_datetime || dashboardNext.date_heure).getTime() - Date.now()) / 60000,
        ),
      )
    : null;
  const dashboardTodaySorted = [...dashboardToday].sort(
    (a, b) =>
      new Date(a.pickup_datetime || a.date_heure).getTime() - new Date(b.pickup_datetime || b.date_heure).getTime(),
  );

  return (
    <>
      <style>{css}</style>
      <div className="drv-root">
        <header className="drv-header">
          <div className="drv-brand-mark" aria-label="Access Prestige Taxi">
            AP
          </div>
          <div className="drv-header-title">
            <strong>Bonjour {(driverLabel || "Alain").split(" & ")[0]} 👋</strong>
            <span>Espace Chauffeur</span>
          </div>
          <DriverIdentitySwitcher
            driverId={driverId}
            onIdentify={onIdentify}
            busy={identifyBusy}
            error={identifyError}
          />
          <span className="drv-live-pill drv-header-live">
            <i /> EN LIGNE
          </span>
          <div className="drv-header-kpi">
            <small>COURSES AUJOURD'HUI</small>
            <strong>{dashboardToday.length}</strong>
          </div>
          <div className="drv-header-kpi">
            <small>CA AUJOURD'HUI</small>
            <strong>{dashboardRevenue.toFixed(0)} €</strong>
          </div>
          <div className="drv-header-kpi">
            <small>SATISFACTION</small>
            <strong>
              4,9 /5 <span>★</span>
            </strong>
          </div>
          <span className="drv-header-datetime">
            <strong>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </strong>
            {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            type="button"
            className="drv-header-bell"
            aria-label="Notifications"
            onClick={() => setTab("courses")}
          >
            <IconBell />
            {newCount + unreadChat + pendingAvis + pendingDevis > 0 && (
              <span className="drv-badge">{newCount + unreadChat + pendingAvis + pendingDevis}</span>
            )}
          </button>
          <Link className="drv-header-back" to="/" aria-label="Retour au site">
            <span className="drv-header-back-label">Retour au site</span>
          </Link>
        </header>

        <div className="drv-main">
          <aside className="drv-tabs" aria-label="Navigation chauffeur">
            <div className="drv-side-logo">
              <span>AP</span>
              <b>ACCESS</b>
              <em>PRESTIGE TAXI</em>
            </div>
            {(
              [
                "dashboard",
                "courses",
                "planning",
                "messages",
                "devis",
                "clients",
                "avis",
                "stats",
                "historique",
                "simulateur",
                "gps",
                "appareils",
              ] as const
            ).map((t) => {
              const realTab = t === "messages" ? "courses" : t;
              const count =
                t === "courses"
                  ? newCount
                  : t === "messages"
                    ? unreadChat
                    : t === "planning"
                      ? dashboardUpcoming.length
                      : t === "avis"
                        ? pendingAvis
                        : t === "devis"
                          ? pendingDevis
                          : 0;
              return (
                <button
                  key={t}
                  type="button"
                  className={`drv-tab${tab === realTab ? " active" : ""}`}
                  onClick={() => {
                    setTab(realTab as Tab);
                    gaEvent("driver_tab_view", { tab: realTab, driver: driverLabel });
                  }}
                >
                  <span className="drv-tab-icon">
                    {t === "dashboard" && <IconHome />}
                    {t === "courses" && <IconCar />}
                    {t === "planning" && <IconCalendar />}
                    {t === "messages" && <IconMessage />}
                    {t === "devis" && <IconDevis />}
                    {t === "clients" && <IconUsers />}
                    {t === "avis" && <IconStar />}
                    {t === "stats" && <IconChart />}
                    {t === "historique" && <IconCalendar />}
                    {t === "simulateur" && <IconCalc />}
                    {t === "gps" && <IconGps />}
                    {t === "appareils" && <IconDevice />}
                  </span>
                  <span className="drv-tab-label">
                    {
                      (
                        {
                          dashboard: "TABLEAU DE BORD",
                          courses: "COURSES",
                          planning: "PLANNING",
                          messages: "MESSAGES",
                          devis: "DEVIS",
                          clients: "CLIENTS",
                          avis: "AVIS",
                          stats: "STATISTIQUES",
                          historique: "HISTORIQUE",
                          simulateur: "SIMULATEUR",
                          gps: "POSITION GPS",
                          appareils: "APPAREILS",
                        } as Record<string, string>
                      )[t]
                    }
                  </span>
                  {count > 0 && <span className="drv-tab-count">{count}</span>}
                </button>
              );
            })}
          </aside>

          <div className="drv-content">
            {tab === "dashboard" && (
              <main className="drv-dashboard" aria-label="Tableau de bord chauffeur">
                <div className="drv-dashboard-grid-top">
                  <section className="drv-card drv-next-card">
                    <div className="drv-card-head">
                      <span>PROCHAINE COURSE</span>
                      {dashboardNext && <b>DANS {dashboardNextMinutes ?? 0} MIN</b>}
                    </div>
                    {dashboardNext ? (
                      <div className="drv-next-layout">
                        <div className="drv-next-time">
                          <strong>{formatHeure(dashboardNext.pickup_datetime || dashboardNext.date_heure)}</strong>
                          <span>{formatDate(dashboardNext.pickup_datetime || dashboardNext.date_heure)}</span>
                        </div>
                        <div className="drv-next-route">
                          <div>
                            <i className="dot green" />
                            <strong>{dashboardNext.depart}</strong>
                            <small>Départ</small>
                          </div>
                          <div>
                            <i className="dot red" />
                            <strong>{dashboardNext.destination}</strong>
                            <small>Destination</small>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="drv-empty">Aucune course à venir.</div>
                    )}
                    {dashboardNext && (
                      <>
                        <div className="drv-next-meta">
                          <span>
                            ♙ {dashboardNext.client_name || "Client"}
                            <small>{dashboardNext.client_phone || "06 12 34 56 78"}</small>
                          </span>
                          <span>
                            ▣ 2 bagages<small>Berline</small>
                          </span>
                          <span>
                            € <b>{Number(dashboardNext.final_price ?? dashboardNext.prix_estime ?? 0).toFixed(0)} €</b>
                          </span>
                        </div>
                        <div className="drv-btns">
                          <button className="drv-btn-start" onClick={() => setTab("courses")}>
                            ▷ DÉMARRER LA COURSE
                          </button>
                          <button className="drv-btn-detail" onClick={() => setTab("courses")}>
                            VOIR LE DÉTAIL
                          </button>
                        </div>
                      </>
                    )}
                  </section>

                  <div className="drv-mobile-stats">
                    <div>
                      <b>{dashboardToday.length}</b>
                      <span>COURSES</span>
                    </div>
                    <div>
                      <b>{dashboardRevenue.toFixed(0)} €</b>
                      <span>CA AUJOURD'HUI</span>
                    </div>
                    <div>
                      <b>4,9 /5</b>
                      <span>SATISFACTION</span>
                    </div>
                  </div>

                  <section className="drv-card drv-day-card">
                    <div className="drv-card-head">
                      <span>▣ &nbsp;COURSES DU JOUR</span>
                      <b>{dashboardToday.length}</b>
                    </div>
                    <div className="drv-day-list">
                      {dashboardTodaySorted.slice(0, 8).map((r) => (
                        <button key={r.id} onClick={() => setTab("courses")} className="drv-day-row">
                          <time>{formatHeure(r.pickup_datetime || r.date_heure)}</time>
                          <span>
                            {r.depart} → {r.destination}
                          </span>
                          <strong>{Number(r.final_price ?? r.prix_estime ?? 0).toFixed(0)} €</strong>
                          <em className={r.status === "completed" ? "done" : "upcoming"}>
                            {r.status === "completed" ? "TERMINÉE" : "À VENIR"}
                          </em>
                        </button>
                      ))}
                      {dashboardTodaySorted.length === 0 && <div className="drv-empty">Aucune course aujourd'hui.</div>}
                    </div>
                  </section>

                  <section className="drv-card drv-revenue-card">
                    <div className="drv-card-head">
                      <span>REVENUS</span>
                      <select aria-label="Période">
                        <option>Aujourd'hui</option>
                      </select>
                    </div>
                    <div className="drv-revenue-main">
                      <strong>{dashboardRevenue.toFixed(0)} €</strong>
                      <span>CA AUJOURD'HUI</span>
                      <b>
                        +18%<small>vs hier</small>
                      </b>
                    </div>
                    <div className="drv-chart" aria-hidden="true">
                      {[32, 55, 42, 72, 58, 91, 65, 79, 88, 108, 122, 96, 138, 155, 118].map((h, i) => (
                        <i key={i} style={{ height: `${Math.min(100, h / 1.6)}%` }} />
                      ))}
                    </div>
                    <div className="drv-revenue-footer">
                      <span>
                        <b>{dashboardToday.length}</b>COURSES
                      </span>
                      <span>
                        <b>{dashboardToday.reduce((n, r) => n + (Number(r.distance_km) || 0), 0).toFixed(0)} km</b>
                        DISTANCE
                      </span>
                      <span>
                        <b>{dashboardToday.length ? (dashboardRevenue / dashboardToday.length).toFixed(0) : 0} €</b>
                        PANIER MOYEN
                      </span>
                    </div>
                  </section>
                </div>

                <div className="drv-dashboard-grid-mid">
                  <section className="drv-card">
                    <div className="drv-card-head">
                      <span>
                        PLANNING <b className="violet-pill">{dashboardUpcoming.length}</b>
                      </span>
                      <button onClick={() => setTab("planning")}>VOIR TOUT</button>
                    </div>
                    {dashboardUpcoming.slice(0, 3).map((r, i) => (
                      <div className="drv-plan-row" key={r.id}>
                        <strong>
                          {formatDate(r.pickup_datetime || r.date_heure).replace(/\s+\w+$/, "")} ·{" "}
                          {formatHeure(r.pickup_datetime || r.date_heure)}
                        </strong>
                        <span>
                          {r.depart} → {r.destination}
                        </span>
                        <b>{Number(r.final_price ?? r.prix_estime ?? 0).toFixed(0)} €</b>
                        <em>J-{i + 1}</em>
                      </div>
                    ))}
                    {dashboardUpcoming.length > 3 && (
                      <div className="drv-more">+ {dashboardUpcoming.length - 3} autres réservations</div>
                    )}
                  </section>
                  <section className="drv-card">
                    <div className="drv-card-head">
                      <span>
                        ▣ &nbsp;MESSAGES NON LUS <b className="red-pill">{unreadChat}</b>
                      </span>
                      <button onClick={() => setTab("courses")}>VOIR TOUS</button>
                    </div>
                    <div className="drv-message-row">
                      <div className="avatar">SM</div>
                      <div>
                        <b>Sophie Martin</b>
                        <span>Bonjour, je serai avec un siège bébé, merci.</span>
                      </div>
                      <small>
                        10:31
                        <br />
                        <i />
                      </small>
                    </div>
                    <div className="drv-message-row">
                      <div className="avatar">TB</div>
                      <div>
                        <b>Thomas Bernard</b>
                        <span>Pouvez-vous passer 5 min plus tôt ?</span>
                      </div>
                      <small>
                        10:15
                        <br />
                        <i />
                      </small>
                    </div>
                    <div className="drv-message-row">
                      <div className="avatar">ML</div>
                      <div>
                        <b>Marie Leroy</b>
                        <span>Merci pour votre ponctualité !</span>
                      </div>
                      <small>
                        09:48
                        <br />
                        <i />
                      </small>
                    </div>
                  </section>
                  <section className="drv-card">
                    <div className="drv-card-head">
                      <span>
                        AVIS RÉCENTS <b className="gold-pill">{pendingAvis}</b>
                      </span>
                      <button onClick={() => setTab("avis")}>VOIR TOUS</button>
                    </div>
                    <div className="drv-rating">
                      <strong>4,9</strong>
                      <span>/ 5</span>
                      <div>★★★★★</div>
                      <small>Basé sur 128 avis</small>
                    </div>
                    <div className="drv-rating-bars">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <div key={n}>
                          <b>{n} ★</b>
                          <i>
                            <span style={{ width: `${n === 5 ? 92 : n === 4 ? 6 : n === 3 ? 2 : 1}%` }} />
                          </i>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="drv-dashboard-grid-bottom">
                  <section className="drv-card drv-vehicle-card">
                    <div className="drv-card-head">
                      <span>▱ &nbsp;VÉHICULE</span>
                    </div>
                    <strong>Mercedes Classe E</strong>
                    <span>FV-123-AB</span>
                    <div className="drv-car-placeholder">SEDAN</div>
                    <footer>
                      <i>●</i> Contrôle OK <i>●</i> Assurance OK
                    </footer>
                  </section>
                  <section className="drv-card drv-gps-card">
                    <div className="drv-card-head">
                      <span>
                        <i className="gps-dot" /> POSITION GPS
                      </span>
                      <b className="live-small">● EN DIRECT</b>
                    </div>
                    <strong>{gps.addr || "Avenue des Champs-Élysées"}</strong>
                    <span>75008 Paris</span>
                    <div className="gps-map">
                      <span>●</span>
                    </div>
                  </section>
                  <section className="drv-card">
                    <div className="drv-card-head">
                      <span>NOTIFICATIONS</span>
                    </div>
                    <div className="drv-notif-row">
                      ◉ <span>Nouvelle réservation</span>
                      <small>Il y a 2 min</small>
                    </div>
                    <div className="drv-notif-row">
                      ◉ <span>Paiement reçu</span>
                      <small>Il y a 15 min</small>
                    </div>
                    <div className="drv-notif-row">
                      ◉ <span>Message client</span>
                      <small>Il y a 31 min</small>
                    </div>
                    <button className="drv-see-all" onClick={() => setTab("courses")}>
                      VOIR TOUTES
                    </button>
                  </section>
                  <section className="drv-card drv-shortcuts">
                    <div className="drv-card-head">
                      <span>RACCOURCIS</span>
                    </div>
                    <div className="shortcut-grid">
                      <button onClick={() => setTab("courses")}>
                        <b>＋</b>
                        <span>
                          NOUVELLE
                          <br />
                          COURSE
                        </span>
                      </button>
                      <button onClick={() => setTab("devis")}>
                        <b>▤</b>
                        <span>
                          DEVIS
                          <br />
                          RAPIDE
                        </span>
                      </button>
                      <button onClick={() => setTab("courses")}>
                        <b>▧</b>
                        <span>
                          ENVOYER
                          <br />
                          FACTURE
                        </span>
                      </button>
                      <button onClick={() => setTab("courses")}>
                        <b>◉</b>
                        <span>
                          POSITION
                          <br />
                          GPS
                        </span>
                      </button>
                    </div>
                  </section>
                </div>
              </main>
            )}

            {tab !== "dashboard" && (
              <div className="drv-body">
                <>
                  {tab === "courses" && (
                    <CoursesTab onBadgeChange={setNewCount} onChatBadge={setUnreadChat} driverId={driverId} />
                  )}
                  {tab === "planning" && <PlanningTab />}
                  {tab === "avis" && <AvisTab onBadgeChange={setPendingAvis} />}
                  {tab === "clients" && <ClientsTab />}
                  {tab === "stats" && <StatsTab />}
                  {tab === "historique" && <HistoriqueTab driverId={driverId} />}
                  {tab === "simulateur" && <SimulateurTab />}
                  {tab === "devis" && <DevisTab onBadgeChange={setPendingDevis} />}
                  {tab === "appareils" && <AppareilsTab />}
                  {tab === "gps" && <GpsTab driverId={driverId} gps={gps} />}
                </>
              </div>
            )}
          </div>
        </div>

        <nav className="drv-mobile-nav" aria-label="Navigation mobile">
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
            <IconHome />
            <span>Accueil</span>
          </button>
          <button className={tab === "courses" ? "active" : ""} onClick={() => setTab("courses")}>
            <IconCar />
            {newCount > 0 && <b>{newCount}</b>}
            <span>Courses</span>
          </button>
          <button className={tab === "planning" ? "active" : ""} onClick={() => setTab("planning")}>
            <IconCalendar />
            <span>Planning</span>
          </button>
          <button onClick={() => setTab("courses")}>
            <IconMessage />
            {unreadChat > 0 && <b>{unreadChat}</b>}
            <span>Messages</span>
          </button>
          <button onClick={() => setMobileMenuOpen(true)}>
            <IconDevice />
            <span>Plus</span>
          </button>
        </nav>
        {mobileMenuOpen && (
          <>
            <button
              type="button"
              className="drv-mobile-drawer-backdrop"
              aria-label="Fermer le menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="drv-mobile-drawer" aria-label="Toutes les rubriques chauffeur">
              <div className="drv-mobile-drawer-head">
                <span>MENU CHAUFFEUR</span>
                <button
                  type="button"
                  className="drv-mobile-drawer-close"
                  aria-label="Fermer le menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ×
                </button>
              </div>
              {(
                [
                  ["dashboard", "Tableau de bord", IconHome],
                  ["courses", "Courses + chat", IconCar],
                  ["planning", "Planning", IconCalendar],
                  ["devis", "Devis", IconDevis],
                  ["clients", "Clients", IconUsers],
                  ["avis", "Avis", IconStar],
                  ["stats", "Statistiques", IconChart],
                  ["historique", "Historique", IconCalendar],
                  ["simulateur", "Simulateur", IconCalc],
                  ["gps", "Position GPS", IconGps],
                  ["appareils", "Appareils", IconDevice],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  className={tab === key ? "active" : ""}
                  onClick={() => {
                    setTab(key);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon />
                  <span>{label}</span>
                  {key === "courses" && newCount > 0 && <span className="drv-tab-count">{newCount}</span>}
                  {key === "avis" && pendingAvis > 0 && <span className="drv-tab-count">{pendingAvis}</span>}
                  {key === "devis" && pendingDevis > 0 && <span className="drv-tab-count">{pendingDevis}</span>}
                </button>
              ))}
            </aside>
          </>
        )}
      </div>
    </>
  );
}

// ── Sélecteur d'identité (Alain / Patricia) ─────────────────────────────────
// Remplace l'ancien mur de connexion : un simple bouton dans le header,
// jamais bloquant. Utile pour attribuer correctement le suivi GPS et les
// notifications push à la bonne personne — pas une obligation pour utiliser
// le reste de l'appli (courses, chat, stats… déjà accessibles sans identité).
function DriverIdentitySwitcher({
  driverId,
  onIdentify,
  busy,
  error,
}: {
  driverId?: string;
  onIdentify: (id: "alain" | "patricia") => Promise<boolean>;
  busy: string | null;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="drv-identity-switcher"
      style={{ position: "relative", flexShrink: 0, isolation: "isolate", zIndex: 300 }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 999,
          padding: "5px 11px 5px 9px",
          color: "#FDFBF7",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          minHeight: 32,
        }}
      >
        👤 {driverId === "patricia" ? "Patricia" : driverId === "alain" ? "Alain" : "Choisir"}
        <span style={{ fontSize: 9, opacity: 0.8 }}>▾</span>
      </button>
      {open && (
        <div
          className="drv-identity-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "#FDFBF7",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            boxShadow: "0 10px 30px -8px rgba(15,23,42,0.35)",
            padding: 8,
            display: "grid",
            gap: 6,
            minWidth: 160,
            zIndex: 300,
          }}
        >
          {(
            [
              { id: "alain", name: "Alain" },
              { id: "patricia", name: "Patricia" },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={busy !== null}
              onClick={async () => {
                const ok = await onIdentify(d.id);
                if (ok) setOpen(false);
              }}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid " + (driverId === d.id ? "#c99b4a" : "#e2e8f0"),
                background: driverId === d.id ? "#f1f5f9" : "#FDFBF7",
                color: "#0f172a",
                fontWeight: 700,
                fontSize: 14,
                cursor: busy ? "wait" : "pointer",
                minHeight: 40,
              }}
            >
              {busy === d.id ? "Connexion…" : d.name}
              {driverId === d.id ? " ✓" : ""}
            </button>
          ))}
          {error && <div style={{ color: "#dc2626", fontSize: 12, padding: "0 2px" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

// ── Suivi GPS en continu (headless, indépendant de l'onglet affiché) ────────
function useDriverGpsTracking(driverId?: string) {
  const identified = driverId === "alain" || driverId === "patricia";
  const pushPos = useServerFn(updateMyDriverPosition);
  const stopPos = useServerFn(stopMyDriverPosition);

  const [pos, setPos] = useState<{
    lat: number;
    lng: number;
    acc: number | null;
    speed: number | null;
  } | null>(null);
  const [addr, setAddr] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "on" | "denied" | "error" | "off">("idle");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const watchRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ t: number; lat: number; lng: number } | null>(null);
  const addrRef = useRef<{ lat: number; lng: number } | null>(null);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("error");
      return;
    }
    if (watchRef.current != null) return;
    const handlePosition = (p: GeolocationPosition) => {
      const lat = p.coords.latitude;
      const lng = p.coords.longitude;
      setState("on");
      setPos({
        lat,
        lng,
        acc: Number.isFinite(p.coords.accuracy) ? Math.round(p.coords.accuracy) : null,
        speed: p.coords.speed != null && Number.isFinite(p.coords.speed) ? Math.max(0, p.coords.speed) : null,
      });

      // Envoi throttlé : 15 s minimum, ou déplacement > ~30 m.
      const prev = lastSentRef.current;
      const dist = prev
        ? Math.hypot((lat - prev.lat) * 111320, (lng - prev.lng) * 111320 * Math.cos((lat * Math.PI) / 180))
        : Infinity;
      if (!prev || Date.now() - prev.t > 15000 || dist > 30) {
        lastSentRef.current = { t: Date.now(), lat, lng };
        pushPos({
          data: {
            token: getDriverToken() ?? "",
            latitude: lat,
            longitude: lng,
            accuracy: p.coords.accuracy ?? null,
            speed: p.coords.speed != null && p.coords.speed >= 0 ? Math.min(500, p.coords.speed) : null,
            heading:
              p.coords.heading != null && Number.isFinite(p.coords.heading)
                ? ((p.coords.heading % 360) + 360) % 360
                : null,
            is_active: true,
          },
        })
          .then(() => setLastSync(new Date()))
          .catch(() => {});
      }

      // Adresse lisible, rafraîchie seulement si on a bougé de > 100 m.
      const a = addrRef.current;
      const moved = !a || Math.hypot((lat - a.lat) * 111320, (lng - a.lng) * 111320) > 100;
      if (moved) {
        addrRef.current = { lat, lng };
        reverseGeocode(lat, lng)
          .then((r) => r && setAddr(r))
          .catch(() => {});
      }
    };

    watchRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState("denied");
          return;
        }
        // Sur ordinateur (et en intérieur) le GPS haute précision expire
        // souvent : on retente une position basse précision avant d'afficher
        // une erreur, sinon le chauffeur n'a plus aucune localisation.
        navigator.geolocation.getCurrentPosition(handlePosition, () => setState("error"), {
          enableHighAccuracy: false,
          maximumAge: 120000,
          timeout: 15000,
        });
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
  }, [pushPos]);

  const stop = useCallback(() => {
    if (watchRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setState("off");
    const tok = getDriverToken();
    if (tok) stopPos({ data: { token: tok } }).catch(() => {});
  }, [stopPos]);

  // Activation automatique dès l'identité (Alain/Patricia) connue, sinon deux
  // appareils écraseraient la même position côté serveur. Reste actif tant
  // que le panneau est ouvert, quel que soit l'onglet affiché.
  useEffect(() => {
    if (!identified) return;
    start();
    return () => {
      if (watchRef.current != null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [start, identified]);

  return { pos, addr, state, lastSync, start, stop, identified };
}

type DriverGpsTracking = ReturnType<typeof useDriverGpsTracking>;

// ── Onglet GPS ─────────────────────────────────────────────────────────────
function GpsTab({ driverId, gps }: { driverId?: string; gps: DriverGpsTracking }) {
  return (
    <div className="drv-tab-panel">
      <div className="drv-card-head">
        <span>POSITION GPS ÉQUIPE</span>
        <b className={gps.state === "on" ? "live-small" : ""}>● {gps.state === "on" ? "EN DIRECT" : "INACTIF"}</b>
      </div>
      <TeamMapCard driverId={driverId} gps={gps} />
    </div>
  );
}

// ── Carte équipe (positions Alain / Patricia) ────────────────────────────
const TEAM_COLORS: Record<string, string> = { alain: "#2563eb", patricia: "#db2777" };
const TEAM_NAMES: Record<string, string> = { alain: "Alain", patricia: "Patricia" };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function TeamMapCard({ driverId, gps }: { driverId?: string; gps: DriverGpsTracking }) {
  const listPos = useServerFn(listDriverPositions);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [rows, setRows] = useState<
    { id: string; lat: number | null; lng: number | null; is_active: boolean; age_s: number }[]
  >([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    const token = getDriverToken();
    if (!token) return;
    try {
      const res: any = await listPos({ data: { token } });
      setRows((res?.positions ?? []).filter((p: any) => p.id === "alain" || p.id === "patricia"));
    } catch {}
  }, [listPos]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const pts = rows.filter((r) => r.lat != null && r.lng != null);
    if (pts.length === 0) return;
    (async () => {
      try {
        const mapsApi = await loadGoogleMapsWhenVisible(mapRef.current!);
        if (!mapInst.current) {
          mapInst.current = new mapsApi.maps.Map(mapRef.current!, {
            zoom: 12,
            disableDefaultUI: true,
            gestureHandling: "cooperative",
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
          });
        }
        const bounds = new mapsApi.maps.LatLngBounds();
        pts.forEach((p) => {
          const pos = { lat: p.lat as number, lng: p.lng as number };
          bounds.extend(pos);
          const color = TEAM_COLORS[p.id] ?? "#0f172a";
          if (!markersRef.current[p.id]) {
            markersRef.current[p.id] = new mapsApi.maps.Marker({
              map: mapInst.current,
              label: { text: (TEAM_NAMES[p.id] ?? p.id)[0], color: "#fff", fontWeight: "700" },
              icon: {
                path: mapsApi.maps.SymbolPath.CIRCLE,
                scale: 11,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              },
            });
          }
          markersRef.current[p.id].setPosition(pos);
          markersRef.current[p.id].setOpacity(p.is_active ? 1 : 0.5);
        });
        if (pts.length === 1) {
          mapInst.current.setCenter(bounds.getCenter());
          mapInst.current.setZoom(14);
        } else {
          mapInst.current.fitBounds(bounds, 40);
        }
      } catch {}
    })();
  }, [open, rows]);

  const mine = rows.find((r) => r.id === driverId);
  const other = rows.find((r) => r.id !== driverId && (r.id === "alain" || r.id === "patricia"));
  const pts = rows.filter((r) => r.lat != null && r.lng != null);
  const distKm =
    mine?.lat != null && mine?.lng != null && other?.lat != null && other?.lng != null
      ? haversineKm({ lat: mine.lat, lng: mine.lng }, { lat: other.lat, lng: other.lng })
      : null;

  const fmtAge = (s: number) =>
    s < 60 ? `il y a ${s}s` : s < 3600 ? `il y a ${Math.round(s / 60)} min` : "position ancienne";

  return (
    <div
      className="drv-team-map"
      style={{
        margin: "10px 16px 0",
        border: "1px solid rgba(201,155,74,.45)",
        borderRadius: 14,
        background: "#050a10",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: "none",
          padding: "11px 14px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15 }}>🗺️</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#f6f0e5" }}>Équipe</span>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(246,240,229,.55)" }}>
          {distKm != null ? `${distKm.toFixed(1)} km entre vous` : `${pts.length}/2 en ligne`} {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {pts.length > 0 ? (
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(201,155,74,.45)",
                marginBottom: 10,
              }}
            >
              <div ref={mapRef} style={{ width: "100%", height: 220 }} />
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "rgba(246,240,229,.55)", marginBottom: 10 }}>
              Aucune position partagée pour l'instant.
            </div>
          )}

          {(["alain", "patricia"] as const).map((id) => {
            const r = rows.find((x) => x.id === id);
            const isMe = id === driverId;
            const myLastSync = gps.lastSync
              ? gps.lastSync.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : null;
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: "#f6f0e5",
                  padding: "6px 10px",
                  marginBottom: 6,
                  border: "1px solid rgba(201,155,74,.3)",
                  borderRadius: 10,
                  background: "rgba(224,184,102,.04)",
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: (isMe ? gps.state === "on" : r?.is_active) ? TEAM_COLORS[id] : "rgba(246,240,229,.3)",
                    flexShrink: 0,
                  }}
                />
                <b style={{ minWidth: 60 }}>{TEAM_NAMES[id]}</b>
                <span style={{ color: "rgba(246,240,229,.6)" }}>
                  {isMe
                    ? gps.state === "on"
                      ? myLastSync
                        ? `actif · ${myLastSync}`
                        : "actif"
                      : gps.state === "denied"
                        ? "refusé — autorise la localisation"
                        : gps.state === "error"
                          ? "indisponible"
                          : "en pause"
                    : r
                      ? r.is_active
                        ? fmtAge(r.age_s)
                        : "hors ligne"
                      : "jamais connecté"}
                  {isMe ? " · vous" : ""}
                </span>
                {isMe && (
                  <button
                    onClick={gps.state === "on" ? gps.stop : gps.start}
                    style={{
                      marginLeft: "auto",
                      background: gps.state === "on" ? "#1b0c0c" : "#e0b866",
                      color: gps.state === "on" ? "#f0a0a0" : "#050a10",
                      border: gps.state === "on" ? "1px solid #8b3a3a" : "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {gps.state === "on" ? "⏸ Pause" : "▶ Activer"}
                  </button>
                )}
              </div>
            );
          })}

          {distKm != null && (
            <div style={{ fontSize: 12, color: "rgba(246,240,229,.55)", marginTop: 8 }}>
              📏 ≈ {distKm.toFixed(1)} km à vol d'oiseau entre vous — trop loin pour une course ? Passez-la depuis
              l'onglet Courses.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Onglet Courses ─────────────────────────────────────────────────────────
function CoursesTab({
  onBadgeChange,
  onChatBadge,
  driverId,
}: {
  onBadgeChange: (n: number) => void;
  onChatBadge?: (n: number) => void;
  driverId?: string;
}) {
  const [courses, setCourses] = useState<Resa[]>([]);
  const [unreadMap, setUnreadMap] = useState<UnreadMap>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "en_route" | "arrived" | "done">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState("");
  const listUnreadResasFn = useServerFn(listReservationsWithUnreadChauffeur);
  const getUnreadFn = useServerFn(getUnreadCountsForReservations);
  const listCoursesFn = useServerFn(listDriverCourses);
  const setCourseDriverFn = useServerFn(setCourseDriver);
  // Ids déjà vus : sert à ne notifier que les VRAIES nouvelles demandes.
  const seenPendingRef = useRef<Set<string> | null>(null);

  const isAdmin = !driverId || driverId === "admin";
  const mineOf = useCallback((r: Resa) => isAdmin || (r as any).assigned_driver === driverId, [isAdmin, driverId]);

  const load = useCallback(async () => {
    const tok = getDriverToken();
    if (!tok || tok.length < 8) {
      setLoading(false);
      return;
    }
    const unreadIds = await listUnreadResasFn({ data: { driver_token: tok } }).catch(() => [] as string[]);

    let res: any;
    try {
      res = await listCoursesFn({
        data: { token: getDriverToken(), extra_ids: (unreadIds as string[]).slice(0, 50) },
      });
    } catch {
      setLoading(false);
      return;
    }
    const list: Resa[] = (res?.courses ?? []) as Resa[];
    setCourses(list);
    setLoading(false);

    // Notification in-app des nouvelles demandes qui me sont attribuées.
    const pendingMine = list.filter((r) => r.status === "pending" && mineOf(r));
    if (seenPendingRef.current === null) {
      seenPendingRef.current = new Set(pendingMine.map((r) => r.id));
    } else {
      for (const r of pendingMine) {
        if (seenPendingRef.current.has(r.id)) continue;
        seenPendingRef.current.add(r.id);
        toast.success(`🚕 Nouvelle course${isAdmin ? "" : " pour toi"}`, {
          description: `${r.client_name || "Client"} — ${r.depart} → ${r.destination || "—"}`,
          duration: 10000,
        });
        try {
          (navigator as any)?.vibrate?.([120, 60, 120]);
        } catch {}
      }
    }
    onBadgeChange(pendingMine.length);

    // COUNT SQL agrégé pour prioriser les cartes + indicateurs
    try {
      const ids = list.map((r) => r.id);
      const map = await getUnreadFn({
        data: { reservation_ids: ids, driver_token: getDriverToken() },
      });
      setUnreadMap(map);
      const totalUnread = Object.values(map).reduce((sum: number, v: any) => sum + (v?.unread_chauffeur ?? 0), 0);
      onChatBadge?.(totalUnread);
    } catch {
      // pas bloquant : les cartes gardent leur ordre par défaut
    }
  }, [onBadgeChange, onChatBadge, listUnreadResasFn, getUnreadFn, listCoursesFn, mineOf, isAdmin]);

  const reassign = useCallback(
    async (id: string, driver: "patricia" | "alain") => {
      try {
        await setCourseDriverFn({ data: { token: getDriverToken(), reservation_id: id, driver } });
        broadcastSuiviUpdate(id, "driver");
        gaEvent("driver_course_assigned", { driver, reservation_id: id });
        toast.success(`Course transférée à ${driver === "patricia" ? "Patricia" : "Alain"}`);
        load();
      } catch {
        toast.error("Transfert impossible");
      }
    },
    [setCourseDriverFn, load],
  );

  // Refresh debouncé : coalesce les bursts Realtime (INSERT + UPDATE
  // read_by_*) en un seul appel batch après 300 ms d'inactivité. Immédiat
  // au premier appel, immédiat aussi au retour d'onglet.
  const loadRef = useRef(load);
  loadRef.current = load;
  const scheduleRef = useRef<{ timer: any; last: number }>({ timer: null, last: 0 });
  const scheduleLoad = useCallback((immediate = false) => {
    const s = scheduleRef.current;
    if (s.timer) {
      clearTimeout(s.timer);
      s.timer = null;
    }
    const run = () => {
      s.last = Date.now();
      s.timer = null;
      loadRef.current();
    };
    // Immédiat si demandé OU si dernière exécution > 2s (throttle plancher).
    // Sinon, on coalesce les bursts Realtime sur 600 ms d'inactivité.
    if (immediate || Date.now() - s.last > 2000) {
      run();
    } else {
      s.timer = setTimeout(run, 600);
    }
  }, []);

  // Realtime filtré : on ne s'abonne qu'aux réservations actuellement
  // visibles (max 50) au lieu de recevoir tous les INSERT globaux. On
  // (dés)abonne dynamiquement quand la liste change (nouvelle course,
  // completed, etc.).
  const visibleIds = courses.map((r) => r.id).slice(0, 50);
  const visibleKey = visibleIds.join(",");

  // Recalcul incrémental : appliquer les deltas d'unread localement au lieu
  // de refaire tourner getUnreadCountsForReservations à chaque event.
  const applyDelta = useCallback(
    (reservationId: string, delta: number, reset?: boolean) => {
      setUnreadMap((prev) => {
        const cur = prev[reservationId] ?? { unread_chauffeur: 0, unread_client: 0 };
        const nextUnread = reset ? 0 : Math.max(0, (cur.unread_chauffeur ?? 0) + delta);
        const next = { ...prev, [reservationId]: { ...cur, unread_chauffeur: nextUnread } };
        const total = Object.values(next).reduce((sum: number, v: any) => sum + (v?.unread_chauffeur ?? 0), 0);
        onChatBadge?.(total);
        return next;
      });
    },
    [onChatBadge],
  );

  useEffect(() => {
    scheduleLoad(true);

    // BroadcastChannel : un autre onglet a marqué une conversation comme lue
    // → on remet unread_chauffeur=0 pour cette réservation, sans requête.
    const unsubBc = subscribeChatBadgeEvents((e: ChatBadgeEvent) => {
      if (e.type === "read") applyDelta(e.reservationId, 0, true);
      else if (e.type === "delta") applyDelta(e.reservationId, e.delta);
    });

    const onVis = () => {
      if (!document.hidden) scheduleLoad(true);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    // Fallback storage pour navigateurs sans BroadcastChannel.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "drv-chat-read-bump") scheduleLoad(true);
    };
    window.addEventListener("storage", onStorage);
    // Temps réel : les réservations ne sont pas lisibles en anon (RLS PII),
    // donc postgres_changes ne délivre rien ici. On combine un canal
    // Broadcast (émis à la création d'une résa) + un poll court de secours.
    const feed = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, () => scheduleLoad(true))
      .subscribe();
    const reconcile = setInterval(() => scheduleLoad(), 10000);
    const scheduledTimer = scheduleRef.current.timer;
    return () => {
      unsubBc();
      clearInterval(reconcile);
      supabase.removeChannel(feed);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.removeEventListener("storage", onStorage);
      if (scheduledTimer) clearTimeout(scheduledTimer);
    };
  }, [scheduleLoad, applyDelta]);

  // Canal Realtime dédié aux réservations visibles — recréé quand la liste
  // change (visibleKey). Filtre `reservation_id=in.(...)` côté serveur.
  // Nom de canal dérivé du contenu réel (hash de visibleKey) et non de sa
  // seule longueur : deux listes différentes de même taille ne doivent pas
  // partager le même nom de canal (risque de conflit lors du démontage /
  // remontage rapide de deux listes de même taille).
  useEffect(() => {
    if (visibleIds.length === 0) return;
    const idFilter = `reservation_id=in.(${visibleIds.join(",")})`;
    let hash = 0;
    for (let i = 0; i < visibleKey.length; i++) {
      hash = (hash * 31 + visibleKey.charCodeAt(i)) | 0;
    }
    const ch = (supabase as any)
      .channel(`drv-courses-${visibleIds.length}-${hash}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
          filter: `id=in.(${visibleIds.join(",")})`,
        },
        () => scheduleLoad(),
      )
      // INSERT reservations (nouvelle course) → refresh liste complète
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reservations" }, () => scheduleLoad())
      // INSERT message client sur une résa visible → increment ciblé du badge
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservation_messages", filter: idFilter },
        (payload: any) => {
          const row = payload?.new;
          if (row?.sender === "client" && row?.reservation_id) {
            applyDelta(row.reservation_id, 1);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [visibleKey, visibleIds, scheduleLoad, applyDelta]);

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  // Priorité d'affichage dans chaque section :
  //   1. Cartes avec messages client non lus (unread_chauffeur > 0)
  //   2. Cartes avec demande spéciale (message non vide)
  //   3. Ordre naturel (pickup_datetime croissant)
  const sortByPriority = (a: Resa, b: Resa) => {
    const aUnread = unreadMap[a.id]?.unread_chauffeur ?? 0;
    const bUnread = unreadMap[b.id]?.unread_chauffeur ?? 0;
    if (aUnread > 0 !== bUnread > 0) return aUnread > 0 ? -1 : 1;
    const aSpecial = !!(a.message && a.message.trim());
    const bSpecial = !!(b.message && b.message.trim());
    if (aSpecial !== bSpecial) return aSpecial ? -1 : 1;
    return String(a.pickup_datetime ?? "").localeCompare(String(b.pickup_datetime ?? ""));
  };

  const base = onlyMine && !isAdmin ? courses.filter(mineOf) : courses;
  const q = query.trim().toLowerCase();
  const visible = base.filter((r) => {
    if (q) {
      const hay = [r.depart, r.destination, (r as any).arrivee, r.client_name, (r as any).client_phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateFilter) {
      const d = String(r.pickup_datetime ?? "").slice(0, 10);
      if (d !== dateFilter) return false;
    }
    if (statusFilter !== "all") {
      if (statusFilter === "done") {
        if (["pending", "accepted", "en_route", "arrived"].includes(r.status)) return false;
      } else if (r.status !== statusFilter) return false;
    }
    return true;
  });
  const otherCount = courses.length - courses.filter(mineOf).length;
  const filtersActive = !!q || !!dateFilter || statusFilter !== "all";

  const nouvelles = visible.filter((r) => r.status === "pending").sort(sortByPriority);
  const encours = visible
    .filter((r) => r.status === "accepted" || r.status === "en_route" || r.status === "arrived")
    .sort(sortByPriority);
  const followups = visible
    .filter((r) => !["pending", "accepted", "en_route", "arrived"].includes(r.status))
    .sort(sortByPriority);

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid " + (active ? "var(--background)" : "var(--border)"),
    background: active ? "var(--background)" : "#FDFBF7",
    color: active ? "var(--gold)" : "#334155",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 36,
    whiteSpace: "nowrap",
  });

  const filterBar = (
    <div style={{ padding: "10px 0 2px" }}>
      {!isAdmin && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {(
            [
              { key: true, label: `Mes courses (${courses.filter(mineOf).length})` },
              { key: false, label: `Toutes (${courses.length})` },
            ] as const
          ).map((o) => (
            <button
              key={String(o.key)}
              onClick={() => setOnlyMine(o.key)}
              style={{ ...chip(onlyMine === o.key), flex: 1 }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Client, départ, destination…"
          style={{
            flex: 1,
            minWidth: 0,
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "9px 12px",
            fontSize: 13,
            minHeight: 40,
          }}
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "9px 10px",
            fontSize: 13,
            minHeight: 40,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {(
          [
            { k: "all", l: "Tous" },
            { k: "pending", l: "En attente" },
            { k: "accepted", l: "Acceptées" },
            { k: "en_route", l: "En route" },
            { k: "arrived", l: "Sur place" },
            { k: "done", l: "Terminées / autres" },
          ] as const
        ).map((o) => (
          <button key={o.k} onClick={() => setStatusFilter(o.k as any)} style={chip(statusFilter === o.k)}>
            {o.l}
          </button>
        ))}
        {filtersActive && (
          <button
            onClick={() => {
              setQuery("");
              setDateFilter("");
              setStatusFilter("all");
            }}
            style={{ ...chip(false), borderColor: "#fecaca", color: "#b91c1c" }}
          >
            ✖ Réinitialiser
          </button>
        )}
      </div>
    </div>
  );

  const renderCard = (r: Resa) => {
    const assigned = (r as any).assigned_driver as string | undefined;
    const other = assigned === "patricia" ? "alain" : "patricia";
    return (
      <div key={r.id}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            margin: "8px 2px -4px",
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: 0.3,
              padding: "3px 9px",
              borderRadius: 999,
              background: assigned === "patricia" ? "#fdf2f8" : "#eff6ff",
              color: assigned === "patricia" ? "#9d174d" : "#1d4ed8",
              border: "1px solid " + (assigned === "patricia" ? "#fbcfe8" : "#bfdbfe"),
            }}
          >
            {assigned ? `👤 ${assigned === "patricia" ? "Patricia" : "Alain"}` : "👤 Non attribuée"}
          </span>
          {["pending", "accepted"].includes(r.status) && (
            <button
              onClick={() => reassign(r.id, other as "patricia" | "alain")}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "4px 9px",
                fontSize: 11.5,
                fontWeight: 700,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              ↔ Passer à {other === "patricia" ? "Patricia" : "Alain"}
            </button>
          )}
        </div>
        <CourseCard
          resa={r}
          onRefresh={load}
          expanded={selected === r.id}
          onToggle={() => setSelected((s) => (s === r.id ? null : r.id))}
          unreadByChauffeur={unreadMap[r.id]?.unread_chauffeur ?? 0}
          unreadByClient={unreadMap[r.id]?.unread_client ?? 0}
        />
      </div>
    );
  };

  if (visible.length === 0)
    return (
      <>
        {filterBar}
        <div className="drv-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune course en attente</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {onlyMine && otherCount > 0 ? `${otherCount} course(s) pour l'autre chauffeur` : "Tout est à jour ✓"}
          </div>
        </div>
      </>
    );

  return (
    <>
      {filterBar}
      {nouvelles.length > 0 && (
        <>
          <p className="drv-section">Nouvelles demandes</p>
          {nouvelles.map(renderCard)}
          <hr className="drv-divider" />
        </>
      )}
      {encours.length > 0 && (
        <>
          <p className="drv-section">En cours</p>
          {encours.map(renderCard)}
        </>
      )}
      {followups.length > 0 && (
        <>
          {(nouvelles.length > 0 || encours.length > 0) && <hr className="drv-divider" />}
          <p className="drv-section">💬 Messages clients (courses passées)</p>
          {followups.map(renderCard)}
        </>
      )}
    </>
  );
}

// ── Course Card avec itinéraires Google Maps ───────────────────────────────
function CourseCard({
  resa,
  onRefresh,
  expanded,
  onToggle,
  unreadByChauffeur = 0,
  unreadByClient = 0,
}: {
  resa: Resa;
  onRefresh: () => void;
  expanded: boolean;
  onToggle: () => void;
  unreadByChauffeur?: number;
  unreadByClient?: number;
}) {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const routeStorageKey = `drv-selected-route:${resa.id}`;
  const [selectedRoute, setSelectedRoute] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(routeStorageKey);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
  const routeRestoredRef = useRef(false);
  // Sync cross-onglets : quand un onglet change la sélection d'itinéraire,
  // les autres onglets ouverts sur /driver s'alignent instantanément via
  // l'événement `storage` (localStorage). Idem au retour de visibilité.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const readAndApply = () => {
      const raw = window.localStorage.getItem(routeStorageKey);
      const n = raw == null ? NaN : Number(raw);
      if (Number.isFinite(n) && n >= 0) {
        setSelectedRoute((prev) => (prev === n ? prev : n));
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === routeStorageKey) readAndApply();
    };
    const onVis = () => {
      if (!document.hidden) readAndApply();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [routeStorageKey]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [busy, setBusy] = useState(false);
  const notifyStatus = useServerFn(notifyReservationStatus);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const actionLocks = useRef<Set<string>>(new Set());
  // Le chat est toujours visible → considéré "lu" à l'affichage.
  // On garde le compteur remonté par CoursesTab mais on le masque
  // localement pendant que l'InlineDriverChat marque read_by_chauffeur=true.
  const rawUnread = unreadByChauffeur;
  const unreadCount = rawUnread;
  const hasSpecialRequest = !!(resa.message && resa.message.trim());
  const unreadContext = hasSpecialRequest ? "demande spéciale" : "conversation en cours";
  const unreadTooltip =
    unreadCount > 0
      ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} client non lu${unreadCount > 1 ? "s" : ""} · ${unreadContext}`
      : "Aucun message non lu";

  const claimAction = (key: string) => {
    if (actionLocks.current.has(key)) return false;
    actionLocks.current.add(key);
    return true;
  };

  const releaseAction = (key: string) => {
    actionLocks.current.delete(key);
  };

  // Charger les itinéraires quand on ouvre la carte
  useEffect(() => {
    if (!expanded || routes.length > 0) return;
    setLoadingRoutes(true);

    (async () => {
      try {
        const mapsApi = await loadGoogleMapsWhenVisible(mapRef.current!);
        const [geoA, geoB] = await Promise.all([geocodeAddress(resa.depart), geocodeAddress(resa.destination)]);
        if (!geoA || !geoB) {
          setLoadingRoutes(false);
          return;
        }

        const svc = new mapsApi.maps.DirectionsService();
        const result: any = await new Promise((res, rej) =>
          svc.route(
            {
              origin: { lat: geoA.lat, lng: geoA.lng },
              destination: { lat: geoB.lat, lng: geoB.lng },
              travelMode: mapsApi.maps.TravelMode.DRIVING,
              provideRouteAlternatives: true,
            },
            (r: any, s: any) => (s === "OK" && r ? res(r) : rej(s)),
          ),
        );

        const opts: RouteOption[] = result.routes.slice(0, 3).map((route: any, i: number) => {
          const leg = route.legs[0];
          const distKm = (leg.distance?.value ?? 0) / 1000;
          const dureeMin = Math.round((leg.duration?.value ?? 0) / 60);
          const dureeS = leg.duration?.value ?? 0;
          // Tarifs Bordeaux — calcul mixte avec durée réelle Google Maps
          const pickupIso = resa.pickup_datetime ?? resa.date_heure ?? "";
          const pickupMs = pickupIso ? new Date(pickupIso).getTime() : Date.now();
          const stepsCount = Math.max(Math.round(dureeS / 60), 1);
          const stepMs = (dureeS * 1000) / stepsCount;
          const frac = distKm / stepsCount;
          let jourKm = 0,
            nuitKm = 0;
          for (let s = 0; s < stepsCount; s++) {
            const t = new Date(pickupMs + s * stepMs).toISOString();
            if (estTarifJourParis(t)) jourKm += frac;
            else nuitKm += frac;
          }
          const prix_estime = parseFloat(
            (TARIFS.PRISE_EN_CHARGE + jourKm * TARIFS.TARIF_JOUR + nuitKm * TARIFS.TARIF_NUIT).toFixed(2),
          );
          const estJour = estTarifJourParis(pickupIso);
          const tarifLabel = jourKm > 0 && nuitKm > 0 ? "Tarif mixte 🌗" : estJour ? "Tarif jour ☀️" : "Tarif nuit 🌙";

          // Extraire un waypoint au milieu du trajet pour forcer cet itinéraire dans Maps
          const steps: any[] = route.legs.flatMap((l: any) => l.steps ?? []);
          const midStep = steps.length > 2 ? steps[Math.floor(steps.length / 2)] : null;
          const waypointLatLng = midStep?.start_location
            ? { lat: midStep.start_location.lat(), lng: midStep.start_location.lng() }
            : null;

          return {
            index: i,
            summary: route.summary || `Itinéraire ${i + 1}`,
            distanceKm: parseFloat(distKm.toFixed(1)),
            dureeMin,
            prix_estime,
            tarifLabel,
            legs: route.legs,
            overview_polyline:
              (route.overview_polyline as unknown as { points?: string })?.points ??
              (route.overview_polyline as unknown as string) ??
              "",
            dirResult: { ...result, routes: [route] },
            originLatLng: { lat: geoA.lat, lng: geoA.lng },
            destLatLng: { lat: geoB.lat, lng: geoB.lng },
            waypointLatLng,
          };
        });
        setRoutes(opts);
        // Restaure la sélection après chargement : match par distance/prix de
        // la DB (source de vérité) sinon localStorage. Évite la remise à 0 au
        // refresh signalée par le chauffeur.
        if (!routeRestoredRef.current && opts.length > 0) {
          routeRestoredRef.current = true;
          let idx = -1;
          if (resa.distance_km != null) {
            // Match par distance la plus proche (pas de seuil strict) : Google
            // Maps peut réordonner ou légèrement recalculer les alternatives
            // au rechargement, un seuil fixe (0.15 km) pouvait rater le bon
            // itinéraire et faire "reset" visuellement la sélection.
            let bestIdx = -1;
            let bestDiff = Infinity;
            opts.forEach((o, i) => {
              const diff = Math.abs(o.distanceKm - (resa.distance_km ?? 0));
              if (diff < bestDiff) {
                bestDiff = diff;
                bestIdx = i;
              }
            });
            idx = bestIdx;
          }
          if (idx < 0) {
            const raw = typeof window !== "undefined" ? window.localStorage.getItem(routeStorageKey) : null;
            const n = raw == null ? NaN : Number(raw);
            if (Number.isFinite(n) && n >= 0 && n < opts.length) idx = n;
          }
          if (idx >= 0 && idx !== selectedRoute) setSelectedRoute(idx);
        }
        setLoadingRoutes(false);
      } catch (e) {
        console.error("[CourseCard] routes:", e);
        setLoadingRoutes(false);
      }
    })();
  }, [expanded, resa, routeStorageKey, routes.length, selectedRoute]);

  // Afficher la route sélectionnée sur la carte
  useEffect(() => {
    if (!expanded || routes.length === 0) return;
    (async () => {
      try {
        const mapsApi = await loadGoogleMapsWhenVisible(mapRef.current!);
        if (!mapInst.current) {
          mapInst.current = new mapsApi.maps.Map(mapRef.current!, {
            zoom: 13,
            disableDefaultUI: true,
            gestureHandling: "cooperative",
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
          });
        }
        if (!rendererRef.current) {
          rendererRef.current = new mapsApi.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: { strokeColor: "#0f172a", strokeWeight: 5 },
          });
          rendererRef.current.setMap(mapInst.current);
        }
        const chosen = routes[selectedRoute];
        if (chosen) rendererRef.current.setDirections(chosen.dirResult);
      } catch {}
    })();
  }, [expanded, routes, selectedRoute]);

  const statusLabel: Record<string, { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "drv-badge-blue" },
    accepted: { label: "Acceptée", cls: "drv-badge-green" },
    en_route: { label: "En route", cls: "drv-badge-amber" },
    arrived: { label: "Arrivé", cls: "drv-badge-amber" },
  };
  const st = statusLabel[resa.status] ?? { label: resa.status, cls: "drv-badge-gray" };

  const handleAccept = async () => {
    const actionKey = `${resa.id}:accepted`;
    if (!claimAction(actionKey)) return;
    setBusy(true);
    try {
      const chosen = routes[selectedRoute];
      const updates: any = { status: "accepted" };
      if (chosen) {
        updates.distance_km = chosen.distanceKm;
        updates.prix_estime = chosen.prix_estime;
      }
      const upRes = await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: updates,
          not_status: "accepted",
        },
      });
      if (!upRes.changed) {
        toast("Action déjà prise en compte");
        onRefresh();
        return;
      }
      broadcastSuiviUpdate(resa.id, "accepted");
      try {
        await notifyStatus({ data: { reservation_id: resa.id, status: "accepted" } });
      } catch (pushErr) {
        console.warn("[driver] client accepted push failed", pushErr);
      }
      toast.success("Course acceptée ✓");
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(false);
      releaseAction(actionKey);
    }
  };

  const handleRefuse = async () => {
    if (!confirm("Refuser cette course ?")) return;
    setBusy(true);
    try {
      await driverUpdateReservation({
        data: { token: getDriverToken(), reservation_id: resa.id, patch: { status: "cancelled" } },
      });
      broadcastSuiviUpdate(resa.id, "cancelled");
      toast("Course refusée");
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  // ── Mettre à jour l'itinéraire d'une course déjà acceptée ──
  const [itinSaving, setItinSaving] = useState(false);
  const handleUpdateItineraire = async () => {
    const chosen = routes[selectedRoute];
    if (!chosen) {
      toast.error("Sélectionne d'abord un itinéraire ci-dessus");
      return;
    }
    setItinSaving(true);
    try {
      await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: { distance_km: chosen.distanceKm, prix_estime: chosen.prix_estime },
        },
      });
      broadcastSuiviUpdate(resa.id, "route");
      toast.success(`Itinéraire mis à jour — ${chosen.distanceKm} km · ${chosen.prix_estime.toFixed(2)} €`);
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setItinSaving(false);
    }
  };

  // ── Prix réel compteur — saisi au moment de terminer la course ──
  // Distinct du "prix personnalisé" ci-dessous (qui sert à notifier le
  // client par SMS/WhatsApp/Email en cours de route) : ici on corrige juste
  // le prix final affiché sur reservations.prix_estime, qui alimente déjà
  // l'affichage suivi.tsx ET la facture (InvoiceBlock lit reservation.prix_estime).
  // Le broadcastSuiviUpdate déclenche le refetch temps réel côté client.
  const [finalPrixOpen, setFinalPrixOpen] = useState(false);
  const [finalPrix, setFinalPrix] = useState(() => (resa.final_price != null ? String(resa.final_price) : ""));
  const [finalPrixSaving, setFinalPrixSaving] = useState(false);
  const handleSetFinalPrix = async () => {
    const val = parseFloat((finalPrix || "").trim().replace(",", "."));
    if (!finalPrix || isNaN(val) || val <= 0) {
      toast.error("Prix invalide", {
        description: "Entrez le montant affiché au compteur (ex : 18.50)",
      });
      return;
    }
    setFinalPrixSaving(true);
    try {
      await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: { prix_estime: val, final_price: val },
        },
      });
      broadcastSuiviUpdate(resa.id, "price");
      toast.success(`💶 Prix compteur enregistré — ${val.toFixed(2)} €`);
      setFinalPrixOpen(false);
      setFinalPrix("");
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setFinalPrixSaving(false);
    }
  };

  // ── Prix custom — SMS / WhatsApp / Email ──
  const [customPrix, setCustomPrix] = useState("");
  const [customPrixOpen, setCustomPrixOpen] = useState(false);
  const [customPrixSending, setCustomPrixSending] = useState(false);
  const handleSendCustomPrix = async (canal: "sms" | "whatsapp" | "email") => {
    const val = parseFloat((customPrix || "").trim().replace(",", "."));
    if (!customPrix || isNaN(val) || val <= 0) {
      toast.error("Prix invalide", { description: "Entrez un montant valide (ex: 18.50)" });
      return;
    }
    const name = resa.client_name || "Client";
    const phone = (resa.client_phone || "").replace(/\s/g, "");
    const email = resa.client_email || resa.email || "";
    const trajet = `${resa.depart} → ${resa.destination || "—"}`;
    const trackUrl = typeof window !== "undefined" ? `${window.location.origin}/reservation/${resa.id}` : "";
    const trackingLine = trackUrl ? `\nRetrouvez votre course ici : ${trackUrl}` : "";
    const msg = `Bonjour ${name}, le prix de votre course Access Prestige Taxi (${trajet}) est de ${val.toFixed(2)} €. Merci.${trackingLine}`;

    if (canal === "sms") {
      if (!phone) {
        toast.error("Pas de téléphone");
        return;
      }
      window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, "_blank");
    } else if (canal === "whatsapp") {
      if (!phone) {
        toast.error("Pas de téléphone");
        return;
      }
      window.open(`https://wa.me/${phone.replace(/^0/, "33")}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      if (!email) {
        toast.error("Pas d'email");
        return;
      }
      setCustomPrixSending(true);
      try {
        const res = await fetch("/api/admin/send-course-email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Secret": "admin-pin-call" },
          body: JSON.stringify({
            templateName: "custom-price",
            recipientEmail: email,
            idempotencyKey: `custom-price-${resa.id}-${Date.now()}`,
            templateData: {
              nom: name,
              depart: resa.depart,
              arrivee: resa.destination || "—",
              prix: `${val.toFixed(2)} €`,
              distance_km: resa.distance_km ? `${resa.distance_km} km` : undefined,
            },
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          toast.error(errBody?.error || "Échec envoi email");
        } else {
          toast.success(`✉️ Email envoyé à ${email}`);
        }
      } catch (e: any) {
        toast.error("Erreur réseau", { description: e?.message ?? "" });
      } finally {
        setCustomPrixSending(false);
      }
    }
    await driverUpdateReservation({
      data: { token: getDriverToken(), reservation_id: resa.id, patch: { prix_estime: val } },
    });
    broadcastSuiviUpdate(resa.id, "price");
    onRefresh();
  };

  // ── Reprogrammer l'heure ──
  const [newDatetime, setNewDatetime] = useState("");
  const [changeHeureOpen, setChangeHeureOpen] = useState(false);
  const [changeHeureSending, setChangeHeureSending] = useState(false);
  const handleChangeHeure = async () => {
    if (!newDatetime) return;
    setChangeHeureSending(true);
    try {
      await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: { pickup_datetime: new Date(newDatetime).toISOString() },
        },
      });
      broadcastSuiviUpdate(resa.id, "reschedule");
      const email = resa.client_email || resa.email;
      const name = resa.client_name || "Client";
      if (email) {
        try {
          await fetch("/api/admin/send-course-email", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Admin-Secret": "admin-pin-call" },
            body: JSON.stringify({
              templateName: "reschedule",
              recipientEmail: email,
              idempotencyKey: `reschedule-${resa.id}-${Date.now()}`,
              templateData: {
                nom: name,
                depart: resa.depart,
                arrivee: resa.destination || "—",
                old_datetime:
                  formatDate(resa.pickup_datetime ?? resa.date_heure) +
                  " " +
                  formatHeure(resa.pickup_datetime ?? resa.date_heure),
                new_datetime: formatDate(newDatetime) + " " + formatHeure(newDatetime),
              },
            }),
          });
          toast.success("🕐 Heure modifiée · ✉️ Email envoyé");
        } catch {
          toast.success("🕐 Heure modifiée · ⚠️ Email non envoyé");
        }
      } else {
        toast.success("🕐 Heure modifiée");
      }
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setChangeHeureSending(false);
    }
  };

  // ── Terminer la course ──
  const [completing, setCompleting] = useState(false);
  const handleComplete = async () => {
    const val = parseFloat((finalPrix || "").trim().replace(",", "."));
    const hasVal = !!finalPrix && !isNaN(val) && val > 0;
    if (!hasVal) {
      if (!confirm("Aucun prix final saisi — terminer quand même la course sans tarif final ?")) return;
    } else if (!confirm(`Marquer cette course comme terminée avec un tarif final de ${val.toFixed(2)} € ?`)) {
      return;
    }
    const actionKey = `${resa.id}:completed`;
    if (!claimAction(actionKey)) return;
    setCompleting(true);
    try {
      const cRes = await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: hasVal ? { status: "completed", prix_estime: val, final_price: val } : { status: "completed" },
          not_status: "completed",
        },
      });
      if (!cRes.changed) {
        toast("Action déjà prise en compte");
        onRefresh();
        return;
      }
      broadcastSuiviUpdate(resa.id, "completed");
      if (hasVal) broadcastSuiviUpdate(resa.id, "price");
      try {
        await notifyStatus({ data: { reservation_id: resa.id, status: "completed" } });
      } catch (pushErr) {
        console.warn("[driver] client completed push failed", pushErr);
      }
      try {
        const inv = await sendRideInvoice({
          data: { token: getDriverToken(), reservation_id: resa.id },
        });
        if (inv?.sent) toast.success("📧 Facture envoyée au client");
      } catch (invErr) {
        console.warn("[driver] invoice email failed", invErr);
      }
      toast.success(hasVal ? `🏁 Course terminée — ${val.toFixed(2)} €` : "🏁 Course terminée");
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setCompleting(false);
      releaseAction(actionKey);
    }
  };

  // ── Progression de statut ──
  const [progressing, setProgressing] = useState(false);
  const handleProgressStatus = async (nextStatus: string, label: string) => {
    const actionKey = `${resa.id}:${nextStatus}`;
    if (!claimAction(actionKey)) return;
    setProgressing(true);
    try {
      const pRes = await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: { status: nextStatus as any },
          not_status: nextStatus,
        },
      });
      if (!pRes.changed) {
        toast("Action déjà prise en compte");
        onRefresh();
        return;
      }
      gaEvent("driver_course_status", { status: nextStatus, reservation_id: resa.id });
      broadcastSuiviUpdate(resa.id, `status:${nextStatus}`);
      try {
        await notifyStatus({ data: { reservation_id: resa.id, status: nextStatus as any } });
      } catch (pushErr) {
        console.warn("[driver] client status push failed", pushErr);
      }
      toast.success(label);
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setProgressing(false);
      releaseAction(actionKey);
    }
  };

  // ── Annuler la course (disponible à tout moment, même après acceptation) ──
  const [cancelling, setCancelling] = useState(false);
  const handleCancel = async () => {
    if (!confirm("Annuler cette course ? Le client sera prévenu.")) return;
    const actionKey = `${resa.id}:cancelled`;
    if (!claimAction(actionKey)) return;
    setCancelling(true);
    try {
      const cRes = await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: { status: "cancelled" },
          not_status: "cancelled",
        },
      });
      if (!cRes.changed) {
        toast("Action déjà prise en compte");
        onRefresh();
        return;
      }
      gaEvent("driver_course_status", { status: "cancelled", reservation_id: resa.id });
      broadcastSuiviUpdate(resa.id, "cancelled");
      try {
        await notifyStatus({ data: { reservation_id: resa.id, status: "cancelled" as any } });
      } catch (pushErr) {
        console.warn("[driver] client cancelled push failed", pushErr);
      }
      toast("Course annulée");
      onRefresh();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setCancelling(false);
      releaseAction(actionKey);
    }
  };

  // ── Supprimer la course ──
  const [deleting, setDeleting] = useState(false);
  const handleDeleteResa = async () => {
    if (!confirm("Supprimer définitivement cette course ? Action irréversible.")) return;
    setDeleting(true);
    try {
      await driverDeleteReservation({ data: { token: getDriverToken(), reservation_id: resa.id } });
      broadcastSuiviUpdate(resa.id, "deleted");
      toast.success("Course supprimée");
      onRefresh();
    } catch (e: any) {
      toast.error("Suppression impossible : " + (e.message ?? e));
    } finally {
      setDeleting(false);
      setSwipeX(0);
    }
  };

  // ── Swipe-to-delete (iOS) ──
  const [swipeX, setSwipeX] = useState(0);
  const swipeStart = useRef<{ x: number; y: number; base: number } | null>(null);
  const swipeLock = useRef<"none" | "x" | "y">("none");
  const SWIPE_MAX = 88;

  const onSwipeStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    swipeStart.current = { x: t.clientX, y: t.clientY, base: swipeX };
    swipeLock.current = "none";
  };
  const onSwipeMove = (e: React.TouchEvent) => {
    const s = swipeStart.current;
    const t = e.touches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (swipeLock.current === "none") {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      swipeLock.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (swipeLock.current !== "x") return;
    const next = Math.min(0, Math.max(-SWIPE_MAX - 24, s.base + dx));
    setSwipeX(next);
  };
  const onSwipeEnd = () => {
    if (swipeLock.current === "x") setSwipeX(swipeX < -SWIPE_MAX / 2 ? -SWIPE_MAX : 0);
    swipeStart.current = null;
    swipeLock.current = "none";
  };

  return (
    <div className="drv-swipe">
      <button
        type="button"
        className="drv-swipe-action"
        aria-label="Supprimer cette course"
        onClick={handleDeleteResa}
        disabled={deleting}
      >
        {deleting ? "…" : "🗑"}
        <span>Suppr.</span>
      </button>
      <div
        className={`drv-card drv-swipe-content${resa.status === "pending" ? " new" : ""}`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeStart.current ? "none" : "transform .22s ease",
        }}
        onTouchStart={onSwipeStart}
        onTouchMove={onSwipeMove}
        onTouchEnd={onSwipeEnd}
        onTouchCancel={onSwipeEnd}
      >
        {/* En-tête */}
        <div className="drv-row" style={{ cursor: "pointer" }} onClick={onToggle}>
          <span className="drv-time">{formatHeure(resa.pickup_datetime ?? resa.date_heure)}</span>
          <span className={`drv-badge-pill ${st.cls}`}>{st.label}</span>
        </div>
        {resa.client_name && <div className="drv-name">{resa.client_name}</div>}
        <div className="drv-route">
          <span>📍 {resa.depart}</span>
          <span>🏁 {resa.destination}</span>
        </div>

        {/* Barre d'avancement rapide — progression des statuts sans ouvrir le détail */}
        {["pending", "accepted", "en_route", "arrived"].includes(resa.status) &&
          (() => {
            const qb: React.CSSProperties = {
              flex: "1 1 auto",
              minWidth: 120,
              borderRadius: 12,
              padding: "11px 10px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              minHeight: 44,
            };
            return (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {resa.status === "pending" && (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={busy}
                      style={{
                        ...qb,
                        background: "var(--background)",
                        border: "2px solid var(--background)",
                        color: "var(--gold)",
                      }}
                    >
                      {busy ? "…" : "✅ Accepter"}
                    </button>
                    <button
                      onClick={handleRefuse}
                      disabled={busy}
                      style={{
                        ...qb,
                        background: "#FDFBF7",
                        border: "2px solid #fecaca",
                        color: "#b91c1c",
                      }}
                    >
                      ✖ Refuser
                    </button>
                  </>
                )}
                {resa.status === "accepted" && (
                  <button
                    onClick={() => handleProgressStatus("en_route", "🚖 Statut : chauffeur en route vers le client")}
                    disabled={progressing}
                    style={{
                      ...qb,
                      background: "#eff6ff",
                      border: "2px solid #2563eb",
                      color: "#1d4ed8",
                    }}
                  >
                    {progressing ? "…" : "🚕 Votre taxi arrive"}
                  </button>
                )}
                {(resa.status === "accepted" || resa.status === "en_route") && (
                  <button
                    onClick={() => handleProgressStatus("arrived", "📍 Statut : arrivé devant chez le client")}
                    disabled={progressing}
                    style={{
                      ...qb,
                      background: "#f5f3ff",
                      border: "2px solid #7c3aed",
                      color: "#6d28d9",
                    }}
                  >
                    {progressing ? "…" : "📍 Votre taxi est arrivé"}
                  </button>
                )}
                {(resa.status === "accepted" || resa.status === "en_route" || resa.status === "arrived") && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    style={{
                      ...qb,
                      background: "#f0fdf4",
                      border: "2px solid #16a34a",
                      color: "#15803d",
                    }}
                  >
                    {completing ? "…" : "✓ Terminée"}
                  </button>
                )}
                {/* Annulation disponible à TOUT moment (y compris en attente et
                    après acceptation) tant que la course n'est ni terminée ni
                    déjà annulée. Le client est prévenu en temps réel. */}
                {(resa.status === "pending" ||
                  resa.status === "accepted" ||
                  resa.status === "en_route" ||
                  resa.status === "arrived") && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      ...qb,
                      background: "#FDFBF7",
                      border: "2px solid #fecaca",
                      color: "#b91c1c",
                    }}
                  >
                    {cancelling ? "…" : "✖ Annuler la course"}
                  </button>
                )}
              </div>
            );
          })()}

        {(resa.status === "accepted" || resa.status === "en_route" || resa.status === "arrived") && (
          <div
            style={{
              marginTop: 10,
              marginBottom: 4,
              padding: 12,
              background: "#03070d",
              border: "2px solid #c99b4a",
              borderRadius: 12,
            }}
          >
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#c99b4a",
                display: "block",
                marginBottom: 6,
              }}
            >
              💶 Prix final au compteur
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex : 24,50"
                value={finalPrix}
                onChange={(e) => setFinalPrix(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetFinalPrix();
                }}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(201,155,74,.45)",
                  background: "#0b1220",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#FDFBF7",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSetFinalPrix}
                disabled={finalPrixSaving}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#c99b4a",
                  color: "#03070d",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: finalPrixSaving ? "not-allowed" : "pointer",
                  opacity: finalPrixSaving ? 0.6 : 1,
                }}
              >
                {finalPrixSaving ? "…" : "Valider"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#FDFBF799", marginTop: 6 }}>
              Facultatif ici : enregistré tout de suite si vous cliquez « Valider », sinon repris automatiquement au
              clic sur « ✓ Terminée ».
            </div>
          </div>
        )}

        {(resa.status === "completed" || resa.status === "terminee") &&
          (resa.final_price ?? resa.prix_estime) != null && (
            <div
              style={{
                marginTop: 10,
                marginBottom: 4,
                padding: 12,
                background: "#03070d",
                border: "2px solid #c99b4a",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c99b4a", marginBottom: 4 }}>
                💶 Tarif final (compteur)
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#FDFBF7" }}>
                {Number(resa.final_price ?? resa.prix_estime).toFixed(2)} €
              </div>
            </div>
          )}

        {/* Demande spéciale client — toujours visible pour que Patricia la voie tout de suite */}
        {resa.message && resa.message.trim().length > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "linear-gradient(180deg, #FDFBF78e1 0%, #FDFBF73c4 100%)",
              border: "1px solid #f59e0b",
              borderRadius: 12,
              fontSize: 13,
              color: "#78350f",
              lineHeight: 1.45,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#b45309",
              }}
            >
              <span>✨ Demande spéciale</span>
            </div>
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{resa.message}</div>
            {unreadByClient > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontSize: 11,
                  fontWeight: 700,
                }}
                title={`${unreadByClient} message(s) chauffeur non lu(s) par le client`}
              >
                ⏳ Réponse envoyée — non lue par le client ({unreadByClient})
              </div>
            )}
          </div>
        )}

        {/* Chat client ↔ chauffeur — TOUJOURS visible, en haut de la carte,
          reste affiché même quand "Voir détail" / "Itinéraire" est ouvert. */}
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              background: "linear-gradient(180deg,#EDE6D4 0%,#E5DCC8 100%)",
              border: "1px solid #334155",
              borderRadius: "10px 10px 0 0",
              color: "#E8C96D",
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 12px",
            }}
          >
            <span>💬 Chat avec {resa.client_name || "le client"}</span>
            {unreadCount > 0 ? (
              <span
                title={unreadTooltip}
                aria-label={unreadTooltip}
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 10,
                  background: "#ef4444",
                  color: "#FDFBF7",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount}
              </span>
            ) : (
              <span
                style={{
                  fontSize: 10,
                  color: "#E8C96D99",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                ✓ à jour
              </span>
            )}
          </div>
          <div
            style={{
              borderLeft: "1px solid #334155",
              borderRight: "1px solid #334155",
              borderBottom: "1px solid #334155",
              borderRadius: "0 0 10px 10px",
              padding: 8,
              background: "#0b1220",
            }}
          >
            <InlineDriverChat reservationId={resa.id} />
          </div>
        </div>

        {/* Résumé km/prix — priorité à la route sélectionnée si chargée, sinon valeurs BDD */}

        {(() => {
          const previewPrix = (() => {
            const v = parseFloat((customPrix || "").trim().replace(",", "."));
            return !isNaN(v) && v > 0 ? v : null;
          })();
          const displayPrix = previewPrix ?? routes[selectedRoute]?.prix_estime ?? resa.prix_estime;
          const displayKm = routes[selectedRoute]?.distanceKm ?? resa.distance_km;
          if (!displayKm && displayPrix == null && routes.length === 0) return null;
          return (
            <div className="drv-meta">
              {displayKm != null && <span>🛣 {displayKm} km</span>}
              {displayPrix != null && (
                <span style={previewPrix != null ? { color: "#b45309", fontWeight: 700 } : undefined}>
                  💶 {displayPrix.toFixed(2)} €{previewPrix != null ? " (perso)" : ""}
                </span>
              )}
              {previewPrix == null && routes[selectedRoute]?.tarifLabel && (
                <span
                  style={{
                    color: routes[selectedRoute].tarifLabel.includes("nuit") ? "#1d4ed8" : "#15803d",
                  }}
                >
                  {routes[selectedRoute].tarifLabel}
                </span>
              )}
            </div>
          );
        })()}

        {/* Détail expandable */}
        {expanded && (
          <>
            <hr className="drv-divider" />

            {/* Carte Google Maps */}
            <div className="drv-map" ref={mapRef} />

            {/* Itinéraires */}
            {loadingRoutes && (
              <div style={{ textAlign: "center", fontSize: 13, color: "#64748b", padding: "10px 0" }}>
                Calcul des itinéraires…
              </div>
            )}

            {routes.length > 0 && (
              <>
                <p className="drv-section">Choisir un itinéraire</p>
                {routes.map((r, i) => (
                  <div
                    key={i}
                    className={`drv-route-opt${selectedRoute === i ? " selected" : ""}`}
                    style={itinSaving ? { opacity: 0.5, pointerEvents: "none" } : undefined}
                    onClick={async () => {
                      // Verrou anti-double-tap : sans ça, deux itinéraires tapés
                      // rapidement (fréquent sur mobile, écran qui bouge) partaient
                      // en parallèle et pouvaient se résoudre dans le désordre,
                      // laissant en base un prix/distance différent de celui
                      // affiché en local (selectedRoute). On réutilise le même
                      // verrou que le bouton "Mettre à jour l'itinéraire".
                      if (itinSaving) return;
                      setSelectedRoute(i);
                      setItinSaving(true);
                      try {
                        window.localStorage.setItem(routeStorageKey, String(i));
                      } catch {}
                      try {
                        await driverUpdateReservation({
                          data: {
                            token: getDriverToken(),
                            reservation_id: resa.id,
                            patch: { distance_km: r.distanceKm, prix_estime: r.prix_estime },
                          },
                        });
                        broadcastSuiviUpdate(resa.id, "route");
                        toast.success(`✓ ${r.distanceKm} km · ${r.prix_estime.toFixed(2)} €`);
                        onRefresh();
                      } catch (e: any) {
                        toast.error("Erreur mise à jour itinéraire : " + (e.message ?? e));
                      } finally {
                        setItinSaving(false);
                      }
                    }}
                  >
                    <div className="drv-route-opt-head">
                      <span className="drv-route-label">
                        {i === 0 ? "🏆 Recommandé" : i === 1 ? "🔀 Alternatif" : "⏱ Rapide"} — {r.summary}
                      </span>
                      <span className="drv-route-price">{r.prix_estime.toFixed(2)} €</span>
                    </div>
                    <div className="drv-route-meta">
                      <span>🛣 {r.distanceKm} km</span>
                      <span>⏱ {r.dureeMin} min</span>
                      <span style={{ color: r.tarifLabel.includes("jour") ? "#15803d" : "#1d4ed8" }}>
                        {r.tarifLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Contact — tel / SMS / WhatsApp / Email, identique à l'admin */}
            {(resa.status === "accepted" || resa.status === "en_route" || resa.status === "arrived") &&
              (() => {
                const phone = resa.client_phone;
                const mail = resa.client_email || resa.email;
                const trackUrl =
                  typeof window !== "undefined" ? `${window.location.origin}/reservation/${resa.id}` : "";
                const greet = `Bonjour ${resa.client_name || ""}, votre taxi Access Prestige Taxi.`;
                const body = trackUrl ? `${greet}\nRetrouvez votre course ici : ${trackUrl}` : greet;
                const mailBody = trackUrl
                  ? `Bonjour ${resa.client_name || ""},\n\nVoici le lien pour retrouver et suivre votre course en temps réel :\n${trackUrl}\n\nAccess Prestige Taxi`
                  : `Bonjour ${resa.client_name || ""},\n\nAccess Prestige Taxi`;
                if (!phone && !mail) return null;
                const contactBtn: React.CSSProperties = {
                  flex: "1 1 auto",
                  minWidth: 78,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "10px",
                  fontWeight: 700,
                  fontSize: 12.5,
                  textDecoration: "none",
                  color: "#0f172a",
                };
                return (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {phone && (
                      <>
                        <a
                          href={`tel:${phone}`}
                          style={{
                            ...contactBtn,
                            background: "#eff6ff",
                            borderColor: "#bfdbfe",
                            color: "#0369a1",
                          }}
                        >
                          📞 Appeler
                        </a>
                        <a
                          href={`sms:${phone}?body=${encodeURIComponent(body)}`}
                          style={{
                            ...contactBtn,
                            background: "#faf5ff",
                            borderColor: "#e9d5ff",
                            color: "#7e22ce",
                          }}
                        >
                          💬 SMS
                        </a>
                        <a
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "33")}?text=${encodeURIComponent(body)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            ...contactBtn,
                            background: "#f0fdf4",
                            borderColor: "#bbf7d0",
                            color: "#15803d",
                          }}
                        >
                          🟢 WhatsApp
                        </a>
                      </>
                    )}
                    {mail && (
                      <a
                        href={`mailto:${mail}?subject=${encodeURIComponent("Votre course Access Prestige Taxi")}&body=${encodeURIComponent(mailBody)}`}
                        style={{
                          ...contactBtn,
                          background: "#FDFBF7beb",
                          borderColor: "#fde68a",
                          color: "#92400e",
                        }}
                      >
                        ✉️ Email
                      </a>
                    )}
                  </div>
                );
              })()}

            {/* Gestion avancée — visible une fois la course acceptée */}
            {(resa.status === "accepted" || resa.status === "en_route" || resa.status === "arrived") && (
              <>
                {/* Prix custom */}
                <button
                  onClick={() => setCustomPrixOpen((o) => !o)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f172a",
                    cursor: "pointer",
                    marginBottom: customPrixOpen ? 8 : 10,
                  }}
                >
                  💶 {customPrixOpen ? "▲" : "▼"} Envoyer un prix personnalisé
                </button>
                {customPrixOpen && (
                  <div style={{ marginBottom: 12 }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Prix en € (ex : 18,50)"
                      value={customPrix}
                      onChange={(e) => setCustomPrix(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#E8C96D";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,201,109,0.25)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      className="drv-custom-prix-input"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        fontSize: 16,
                        marginBottom: 8,
                        fontFamily: "'DM Sans', sans-serif",
                        background: "#FDFBF7fff",
                        color: "#0f172a",
                        fontWeight: 600,
                        outline: "none",
                        transition: "border-color 120ms ease, box-shadow 120ms ease",
                        WebkitAppearance: "none",
                        appearance: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleSendCustomPrix("sms")}
                        disabled={customPrixSending}
                        style={{
                          flex: 1,
                          minWidth: 70,
                          background: "#faf5ff",
                          border: "1px solid #e9d5ff",
                          color: "#7e22ce",
                          borderRadius: 10,
                          padding: "8px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        💬 SMS
                      </button>
                      <button
                        onClick={() => handleSendCustomPrix("whatsapp")}
                        disabled={customPrixSending}
                        style={{
                          flex: 1,
                          minWidth: 70,
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          color: "#15803d",
                          borderRadius: 10,
                          padding: "8px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🟢 WhatsApp
                      </button>
                      <button
                        onClick={() => handleSendCustomPrix("email")}
                        disabled={customPrixSending}
                        style={{
                          flex: 1,
                          minWidth: 70,
                          background: "#FDFBF7beb",
                          border: "1px solid #fde68a",
                          color: "#92400e",
                          borderRadius: 10,
                          padding: "8px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {customPrixSending ? "…" : "✉️ Email"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reprogrammer l'heure */}
                <button
                  onClick={() => setChangeHeureOpen((o) => !o)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f172a",
                    cursor: "pointer",
                    marginBottom: changeHeureOpen ? 8 : 10,
                  }}
                >
                  🕐 {changeHeureOpen ? "▲" : "▼"} Reprogrammer l'heure
                </button>
                {changeHeureOpen && (
                  <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
                    <input
                      type="datetime-local"
                      value={newDatetime}
                      onChange={(e) => setNewDatetime(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        fontSize: 16,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                    <button
                      onClick={handleChangeHeure}
                      disabled={changeHeureSending || !newDatetime}
                      className="drv-btn-primary"
                      style={{ flex: "0 0 auto", padding: "10px 16px" }}
                    >
                      {changeHeureSending ? "…" : "OK"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            {resa.status === "pending" && (
              <div className="drv-btns">
                <button className="drv-btn-danger" onClick={handleRefuse} disabled={busy}>
                  Refuser
                </button>
                <button className="drv-btn-primary" onClick={handleAccept} disabled={busy}>
                  {busy ? "…" : "Accepter"}
                </button>
              </div>
            )}
            {resa.status === "accepted" && (
              <>
                {(() => {
                  // Utilise les coords géocodées si disponibles (plus précis que le texte brut)
                  const chosen = routes[selectedRoute];
                  const origCoord = chosen ? `${chosen.originLatLng.lat},${chosen.originLatLng.lng}` : resa.depart;
                  const destCoord = chosen ? `${chosen.destLatLng.lat},${chosen.destLatLng.lng}` : resa.destination;
                  // Waypoint milieu pour forcer le même itinéraire dans Maps
                  const wp = chosen?.waypointLatLng;
                  const waypointParam = wp ? `&waypoints=${wp.lat},${wp.lng}` : "";
                  const waypointCoord = wp ? `${wp.lat},${wp.lng}` : null;
                  // For web we percent-encode components; for native apps prefer encodeURI
                  // so commas in lat,lng are preserved (Google Maps expects `lat,lng`).
                  const originParam = encodeURIComponent(origCoord);
                  const destinationParam = encodeURIComponent(destCoord);
                  const originNative = encodeURI(origCoord);
                  const destinationNative = encodeURI(destCoord);
                  const googleMapsWeb = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationParam}${waypointParam}&travelmode=driving&dir_action=navigate`;
                  return (
                    <div style={{ marginBottom: 10 }}>
                      <button
                        onClick={() => {
                          const ua = navigator.userAgent;
                          const isIOS = /iPad|iPhone|iPod/.test(ua);
                          const isAndroid = /Android/.test(ua);
                          // Debug: log generated URLs to help testing
                          const debug_googleMapsWeb = googleMapsWeb;
                          const debug_wp = waypointParam || "";
                          const debug_origin = originNative;
                          const debug_destination = destinationNative;
                          const debug_android_waypoint = waypointCoord ? `${waypointCoord}` : "";
                          const debug_android_intent = `intent://maps.google.com/maps?api=1&origin=${originNative}&destination=${destinationNative}${waypointCoord ? `&waypoints=${debug_android_waypoint}` : ""}&travelmode=driving#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(googleMapsWeb)};end`;
                          const debug_android_navigation = `google.navigation:q=${destinationNative}&mode=d`;
                          console.debug("[Démarrer GPS] UA:", ua);
                          console.debug("[Démarrer GPS] origin:", debug_origin);
                          console.debug("[Démarrer GPS] destination:", debug_destination);
                          console.debug("[Démarrer GPS] waypoint:", debug_wp);
                          console.debug("[Démarrer GPS] android_intent:", debug_android_intent);
                          console.debug("[Démarrer GPS] android_navigation:", debug_android_navigation);
                          console.debug("[Démarrer GPS] web:", debug_googleMapsWeb);
                          if (isIOS) {
                            // iOS : open Google Maps app with explicit origin + waypoint + start navigation
                            const gmaps = waypointCoord
                              ? `comgooglemaps://?saddr=${originNative}&daddr=${waypointCoord}+to:${destinationNative}&directionsmode=driving&dir_action=navigate`
                              : `comgooglemaps://?saddr=${originNative}&daddr=${destinationNative}&directionsmode=driving&dir_action=navigate`;
                            window.location.href = gmaps;
                            setTimeout(() => {
                              window.location.href = googleMapsWeb;
                            }, 1200);
                          } else if (isAndroid) {
                            const androidNavigation = `google.navigation:q=${destinationNative}&mode=d`;
                            const gmapsAndroid = waypointCoord
                              ? `comgooglemaps://?saddr=${originNative}&daddr=${destinationNative}&waypoints=${waypointCoord}&directionsmode=driving&dir_action=navigate`
                              : androidNavigation;
                            const intent = `intent://maps.google.com/maps?api=1&origin=${originNative}&destination=${destinationNative}${waypointCoord ? `&waypoints=${waypointCoord}` : ""}&travelmode=driving#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(googleMapsWeb)};end`;
                            window.location.href = gmapsAndroid;
                            setTimeout(() => {
                              window.location.href = intent;
                            }, 1200);
                            setTimeout(() => {
                              window.location.href = androidNavigation;
                            }, 2400);
                            setTimeout(() => {
                              window.open(googleMapsWeb, "_blank");
                            }, 3600);
                          } else {
                            window.open(googleMapsWeb, "_blank");
                          }
                        }}
                        style={{
                          width: "100%",
                          display: "block",
                          textAlign: "center",
                          background: "#0f172a",
                          color: "#FDFBF7",
                          border: "none",
                          borderRadius: 12,
                          padding: "13px 8px",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        🗺 Lancer Google Maps
                      </button>
                    </div>
                  );
                })()}
              </>
            )}

            {resa.status === "accepted" && (
              <button
                onClick={() => handleProgressStatus("en_route", "🚖 Statut : chauffeur en route vers le client")}
                disabled={progressing}
                style={{
                  width: "100%",
                  background: "#eff6ff",
                  border: "2px solid #2563eb",
                  color: "#1d4ed8",
                  borderRadius: 12,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                {progressing ? "…" : "🚕 Votre taxi arrive"}
              </button>
            )}

            {(resa.status === "accepted" || resa.status === "en_route") && (
              <button
                onClick={() => handleProgressStatus("arrived", "📍 Statut : arrivé devant chez le client")}
                disabled={progressing}
                style={{
                  width: "100%",
                  background: "#f5f3ff",
                  border: "2px solid #7c3aed",
                  color: "#6d28d9",
                  borderRadius: 12,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                {progressing ? "…" : "📍 Votre taxi est arrivé"}
              </button>
            )}

            {(resa.status === "accepted" || resa.status === "en_route" || resa.status === "arrived") && (
              <button
                onClick={handleComplete}
                disabled={completing}
                style={{
                  width: "100%",
                  background: "#f0fdf4",
                  border: "2px solid #16a34a",
                  color: "#15803d",
                  borderRadius: 12,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                {completing ? "…" : "✓ Terminée"}
              </button>
            )}

            {/* Supprimer définitivement */}
            <button
              onClick={handleDeleteResa}
              disabled={deleting}
              style={{
                width: "100%",
                marginTop: 4,
                background: "none",
                border: "none",
                color: "#b91c1c",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                padding: "6px 0",
              }}
            >
              {deleting ? "Suppression…" : "🗑 Supprimer cette course"}
            </button>
          </>
        )}

        <button
          onClick={onToggle}
          style={{
            width: "100%",
            marginTop: 8,
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: 12,
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          {expanded ? "▲ Réduire" : "▼ Voir détails & itinéraires"}
        </button>
      </div>
    </div>
  );
}

// ── Onglet Planning ────────────────────────────────────────────────────────
function PlanningTab() {
  const [courses, setCourses] = useState<Resa[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getDriverToken()) {
      setLoading(false);
      return;
    }
    const res: any = await driverListReservations({
      data: { token: getDriverToken(), scope: "planning" },
    });
    setCourses((res?.rows ?? []) as Resa[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, load)
      .subscribe();
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(ch);
    };
  }, [load]);

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  const dotColor: Record<string, string> = {
    terminee: "#94a3b8",
    completed: "#94a3b8",
    pending: "#f59e0b",
    accepted: "#22c55e",
    en_route: "#3b82f6",
    arrived: "#3b82f6",
  };

  return (
    <>
      <p className="drv-section">
        Aujourd'hui — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      {courses.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune course aujourd'hui</div>
        </div>
      ) : (
        courses.map((r) => (
          <div key={r.id} className="drv-planning-slot">
            <span className="drv-planning-time">{formatHeure(r.pickup_datetime ?? r.date_heure)}</span>
            <div className="drv-planning-dot" style={{ background: dotColor[r.status] ?? "#94a3b8" }} />
            <div
              className={`drv-planning-card${["terminee", "completed"].includes(r.status) ? " done" : ""}`}
              style={{ opacity: ["terminee", "completed"].includes(r.status) ? 0.5 : 1 }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                <div>📍 {r.depart}</div>
                <div style={{ color: "#16a34a" }}>🏁 {r.destination}</div>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {r.distance_km ? `${r.distance_km} km · ` : ""}
                {((r as any).final_price ?? r.prix_estime)
                  ? `${Number((r as any).final_price ?? r.prix_estime).toFixed(2)} €`
                  : ""}
                {["terminee", "completed"].includes(r.status) ? " · Terminée" : ""}
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}

// ── Onglet Avis ────────────────────────────────────────────────────────────
function AvisTab({ onBadgeChange }: { onBadgeChange: (n: number) => void }) {
  const [pending, setPending] = useState<Avis[]>([]);
  const [published, setPublished] = useState<Avis[]>([]);
  const [flagged, setFlagged] = useState<Avis[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const response = await fetch(`/api/public/reviews?token=${encodeURIComponent(getDriverToken())}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "chargement impossible");
      setPending(result.pending ?? []);
      setPublished(result.published ?? []);
      setFlagged(result.flagged ?? []);
      onBadgeChange((result.pending ?? []).length);
    } catch (e: any) {
      toast.error("Impossible de charger les avis : " + (e.message ?? e));
    }
  }, [onBadgeChange]);

  useEffect(() => {
    load();
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, load)
      .subscribe();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const moderate = async (id: string, action: "approved" | "refused" | "flagged" | "pending") => {
    setBusy(id);
    try {
      const response = await fetch("/api/public/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-driver-token": getDriverToken() },
        body: JSON.stringify({ id, status: action }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "modération impossible");
      toast.success(
        action === "approved"
          ? "Avis publié ✓"
          : action === "flagged"
            ? "Avis signalé et retiré du site"
            : action === "pending"
              ? "Avis remis en attente"
              : "Avis refusé",
      );
      load();
      broadcastDriverFeed("review-moderated");
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const removeAvis = async (id: string) => {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    setBusy(id);
    try {
      const response = await fetch("/api/public/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-driver-token": getDriverToken() },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "suppression impossible");
      toast.success("Avis supprimé");
      load();
      broadcastDriverFeed("review-deleted");
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const avgNote =
    published.length > 0 ? (published.reduce((s, a) => s + a.note, 0) / published.length).toFixed(1) : null;

  return (
    <>
      {pending.length > 0 && (
        <>
          <p className="drv-section">À modérer ({pending.length})</p>
          {pending.map((a) => (
            <div key={a.id} className="drv-card pending">
              <div className="drv-row">
                <span className="drv-name">{a.author_name || "Anonyme"}</span>
                <span className="drv-badge-pill drv-badge-amber">En attente</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <Stars n={a.note} />
              </div>
              <p style={{ fontSize: 13, color: "#334155", margin: "0 0 12px", lineHeight: 1.5 }}>"{a.commentaire}"</p>
              <div className="drv-btns">
                <button className="drv-btn-danger" disabled={!!busy} onClick={() => moderate(a.id, "refused")}>
                  {busy === a.id ? "…" : "Refuser"}
                </button>
                <button className="drv-btn-primary" disabled={!!busy} onClick={() => moderate(a.id, "approved")}>
                  {busy === a.id ? "…" : "Publier sur le site"}
                </button>
                <button
                  className="drv-btn-danger"
                  disabled={!!busy}
                  onClick={() => moderate(a.id, "flagged")}
                  title="Signaler comme abusif"
                >
                  {busy === a.id ? "…" : "⚑ Signaler"}
                </button>
              </div>
            </div>
          ))}
          <hr className="drv-divider" />
        </>
      )}

      {flagged.length > 0 && (
        <>
          <p className="drv-section">Avis signalés ({flagged.length})</p>
          {flagged.map((a) => (
            <div key={a.id} className="drv-card">
              <div className="drv-row">
                <span className="drv-name">{a.author_name || "Anonyme"}</span>
                <span className="drv-badge-pill drv-badge-amber">Signalé</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <Stars n={a.note} />
              </div>
              <p style={{ fontSize: 13, color: "#334155", margin: "0 0 12px", lineHeight: 1.5 }}>"{a.commentaire}"</p>
              <div className="drv-btns">
                <button className="drv-btn-danger" disabled={!!busy} onClick={() => removeAvis(a.id)}>
                  {busy === a.id ? "…" : "Supprimer"}
                </button>
                <button className="drv-btn-primary" disabled={!!busy} onClick={() => moderate(a.id, "pending")}>
                  {busy === a.id ? "…" : "Remettre en attente"}
                </button>
              </div>
            </div>
          ))}
          <hr className="drv-divider" />
        </>
      )}

      <p className="drv-section">Avis publiés</p>
      {published.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 13 }}>Aucun avis publié</div>
        </div>
      ) : (
        <>
          {published.map((a) => (
            <div key={a.id} className="drv-card" style={{ opacity: 0.75 }}>
              <div className="drv-row">
                <span className="drv-name">{a.author_name || "Anonyme"}</span>
                <span className="drv-badge-pill drv-badge-green">Publié</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <Stars n={a.note} />
              </div>
              <p style={{ fontSize: 13, color: "#475569", margin: "0 0 8px", lineHeight: 1.5 }}>"{a.commentaire}"</p>
              <button
                onClick={() => removeAvis(a.id)}
                disabled={busy === a.id}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b91c1c",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {busy === a.id ? "…" : "🗑 Supprimer"}
              </button>
              <button
                onClick={() => moderate(a.id, "flagged")}
                disabled={busy === a.id}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b45309",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: 12,
                }}
              >
                {busy === a.id ? "…" : "⚑ Signaler"}
              </button>
            </div>
          ))}
          {avgNote && (
            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                padding: "16px 0",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Note moyenne publiée</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>{avgNote}</div>
              <div style={{ fontSize: 22, color: "#f59e0b" }}>★★★★★</div>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Onglet Devis ─────────────────────────────────────────────────────────
function DevisTab({ onBadgeChange }: { onBadgeChange: (n: number) => void }) {
  const [items, setItems] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { reponse: string; prix: string }>>({});

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const res: any = await listDriverDevis({ data: { token: getDriverToken() } });
      setItems((res?.devis ?? []) as Devis[]);
      onBadgeChange(res?.pending ?? 0);
    } catch (e: any) {
      toast.error("Impossible de charger les devis : " + (e.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [onBadgeChange]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load]);

  const defaultDraft = (d: Devis) => ({
    reponse: d.reponse ?? "",
    prix: d.prix_propose != null ? String(d.prix_propose) : "",
  });
  const draftFor = (d: Devis) => drafts[d.id] ?? defaultDraft(d);
  const setDraft = (d: Devis, patch: Partial<{ reponse: string; prix: string }>) => {
    setDrafts((prev) => ({ ...prev, [d.id]: { ...(prev[d.id] ?? defaultDraft(d)), ...patch } }));
  };

  const changeStatut = async (id: string, statut: "traite" | "accepte" | "refuse") => {
    setBusy(id);
    try {
      await driverUpdateDevis({
        data: { token: getDriverToken(), devis_id: id, patch: { statut } },
      });
      toast.success(
        statut === "accepte" ? "Devis marqué accepté ✓" : statut === "refuse" ? "Devis refusé" : "Devis marqué traité",
      );
      load();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const sendReponse = async (d: Devis) => {
    const draft = draftFor(d);
    const prixTrim = draft.prix.trim();
    const prix = prixTrim ? parseFloat(prixTrim.replace(",", ".")) : null;
    if (prixTrim && (prix == null || isNaN(prix) || prix < 0)) {
      toast.error("Prix proposé invalide");
      return;
    }
    setBusy(d.id);
    try {
      await driverUpdateDevis({
        data: {
          token: getDriverToken(),
          devis_id: d.id,
          patch: { reponse: draft.reponse.trim(), prix_propose: prix, statut: "traite" },
        },
      });
      toast.success("Réponse enregistrée ✓");
      load();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const removeDevis = async (id: string) => {
    if (!confirm("Supprimer définitivement ce devis ?")) return;
    setBusy(id);
    try {
      await driverDeleteDevis({ data: { token: getDriverToken(), devis_id: id } });
      toast.success("Devis supprimé");
      load();
    } catch (e: any) {
      toast.error("Erreur : " + (e.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  const statutLabel: Record<string, { label: string; cls: string }> = {
    recu: { label: "Reçu", cls: "drv-badge-blue" },
    traite: { label: "Traité", cls: "drv-badge-amber" },
    accepte: { label: "Accepté", cls: "drv-badge-green" },
    refuse: { label: "Refusé", cls: "drv-badge-gray" },
  };

  if (items.length === 0)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune demande de devis</div>
      </div>
    );

  return (
    <>
      {items.map((d) => {
        const st = statutLabel[d.statut] ?? { label: d.statut, cls: "drv-badge-gray" };
        const isOpen = expandedId === d.id;
        const draft = draftFor(d);
        return (
          <div key={d.id} className="drv-card">
            <div className="drv-row" style={{ cursor: "pointer" }} onClick={() => setExpandedId(isOpen ? null : d.id)}>
              <span className="drv-name">{d.nom}</span>
              <span className={`drv-badge-pill ${st.cls}`}>{st.label}</span>
            </div>
            <div className="drv-route">
              <span>📍 {d.depart}</span>
              <span>🏁 {d.arrivee}</span>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {d.date_souhaitee ? `${d.date_souhaitee} ` : ""}
              {d.heure_souhaitee ?? ""}
              {d.aller_retour ? " · aller-retour" : ""}
              {" · "}
              {d.passagers} pers.{d.bagages ? ` · ${d.bagages} bagage(s)` : ""}
            </div>
            {(d.transport_sanitaire || d.fauteuil_roulant || d.transport_groupe || d.sieges_enfant) && (
              <div style={{ fontSize: 12, color: "#b45309", marginTop: 4 }}>
                {[
                  d.transport_sanitaire && "Transport sanitaire",
                  d.fauteuil_roulant && "Fauteuil roulant",
                  d.transport_groupe && "Groupe",
                  d.sieges_enfant && "Siège enfant",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
            {d.precisions && (
              <p style={{ fontSize: 13, color: "#334155", margin: "8px 0 0", lineHeight: 1.5 }}>{d.precisions}</p>
            )}
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              ✉️ {d.email}
              {d.telephone ? ` · ☎ ${d.telephone}` : ""}
            </div>

            {isOpen && (
              <>
                <hr className="drv-divider" />
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Prix proposé (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={draft.prix}
                  onChange={(e) => setDraft(d, { prix: e.target.value })}
                  placeholder="Ex. 85"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    marginBottom: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                  }}
                />
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Réponse au client</label>
                <textarea
                  value={draft.reponse}
                  onChange={(e) => setDraft(d, { reponse: e.target.value })}
                  rows={3}
                  placeholder="Votre réponse…"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    marginBottom: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <div className="drv-btns">
                  <button className="drv-btn-danger" disabled={busy === d.id} onClick={() => removeDevis(d.id)}>
                    {busy === d.id ? "…" : "Supprimer"}
                  </button>
                  <button className="drv-btn-primary" disabled={busy === d.id} onClick={() => sendReponse(d)}>
                    {busy === d.id ? "…" : "Enregistrer la réponse"}
                  </button>
                </div>
                <div className="drv-btns" style={{ marginTop: 8 }}>
                  <button
                    className="drv-btn-danger"
                    disabled={busy === d.id}
                    onClick={() => changeStatut(d.id, "refuse")}
                  >
                    ✖ Refuser
                  </button>
                  <button
                    className="drv-btn-primary"
                    disabled={busy === d.id}
                    onClick={() => changeStatut(d.id, "accepte")}
                  >
                    ✓ Accepter
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

// ── Onglet Clients ──────────────────────────────────────────────────────────
function ClientsTab() {
  const [clients, setClients] = useState<ClientAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    if (!getDriverToken()) {
      setLoading(false);
      return;
    }
    const res: any = await driverListReservations({
      data: { token: getDriverToken(), scope: "clients" },
    });
    const data: any[] = res?.rows ?? [];
    const clientsRows: any[] = res?.clients ?? [];

    const normalize = (p: string) => p.replace(/[^0-9]/g, "").replace(/^0/, "33");
    const idByPhone = new Map<string, string>();
    for (const c of (clientsRows ?? []) as any[]) {
      if (c.phone) idByPhone.set(normalize(c.phone), c.id);
    }

    // Clé d'agrégation normalisée (comme idByPhone ci-dessus) : sans ça, un
    // même client ayant réservé avec des formats différents ("0612345678",
    // "+33612345678", avec espaces…) apparaissait comme plusieurs clients
    // distincts, avec historique et total dépensé scindés entre les fiches.
    const rows: any[] = data ?? [];
    const byPhone = new Map<string, ClientAgg>();
    for (const r of rows) {
      const phone = r.client_phone;
      if (!phone) continue;
      const key = normalize(phone);
      const existing = byPhone.get(key);
      const isCompleted = ["terminee", "completed"].includes(r.status);
      if (!existing) {
        byPhone.set(key, {
          id: idByPhone.get(normalize(phone)),
          phone,
          email: r.client_email ?? r.email ?? null,
          name: r.client_name || "Client",
          nbCourses: isCompleted ? 1 : 0,
          totalDepense: isCompleted ? (r.prix_estime ?? 0) : 0,
          derniereCourse: r.pickup_datetime ?? r.date_heure,
          derniereDepart: r.depart ?? "",
          derniereDestination: r.destination ?? "",
        });
      } else {
        if (isCompleted) {
          existing.nbCourses += 1;
          existing.totalDepense += r.prix_estime ?? 0;
        }
        if ((r.pickup_datetime ?? r.date_heure) > existing.derniereCourse) {
          existing.derniereCourse = r.pickup_datetime ?? r.date_heure;
          existing.derniereDepart = r.depart ?? existing.derniereDepart;
          existing.derniereDestination = r.destination ?? existing.derniereDestination;
        }
        if (!existing.name || existing.name === "Client") existing.name = r.client_name || existing.name;
        if (!existing.email && (r.client_email || r.email)) existing.email = r.client_email ?? r.email;
      }
    }

    setClients(Array.from(byPhone.values()).sort((a, b) => b.derniereCourse.localeCompare(a.derniereCourse)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const ch = (supabase as any)
      .channel("driver-feed-clients", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, load)
      .subscribe();
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const [deletingPhone, setDeletingPhone] = useState<string | null>(null);
  const removeClient = async (c: ClientAgg) => {
    if (!confirm(`Supprimer ${c.name} et toutes ses courses ? Action irréversible.`)) return;
    setDeletingPhone(c.phone);
    try {
      await driverDeleteClient({
        data: { token: getDriverToken(), phone: c.phone, client_id: c.id ?? null },
      });
      toast.success("Client supprimé");
      load();
    } catch (e: any) {
      toast.error("Suppression impossible : " + (e.message ?? e));
    } finally {
      setDeletingPhone(null);
    }
  };

  const formatE164 = (phone: string) => {
    const normalized = phone.replace(/[^0-9]/g, "").replace(/^0/, "33");
    return normalized.startsWith("33") ? `+${normalized}` : `+${normalized}`;
  };

  const makeVcardHref = (name: string, phone: string, email?: string | null) => {
    const tel = formatE164(phone);
    const safeName = name || "Client";
    const lines = [`BEGIN:VCARD`, `VERSION:3.0`, `FN:${safeName}`, `TEL;TYPE=CELL:${tel}`];
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    lines.push(`END:VCARD`);
    const vcard = lines.join(`\n`);
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
  };

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query) ||
          (c.email?.toLowerCase().includes(query.toLowerCase()) ?? false),
      )
    : clients;

  return (
    <>
      <input
        type="text"
        placeholder="Rechercher un client…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          fontSize: 16,
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 14,
          outline: "none",
        }}
      />

      {filtered.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aucun client trouvé</div>
        </div>
      ) : (
        filtered.map((c) => (
          <div key={c.phone} className="drv-card">
            <div className="drv-row">
              <span className="drv-name">{c.name}</span>
              <span className="drv-badge-pill drv-badge-gray">
                {c.nbCourses} course{c.nbCourses > 1 ? "s" : ""}
              </span>
            </div>
            <div className="drv-sub" style={{ marginBottom: 6 }}>
              Dernière course : {formatDate(c.derniereCourse)}
              <br />
              <span>📍 {c.derniereDepart || "—"}</span>
              <br />
              <span>🏁 {c.derniereDestination || "—"}</span>
            </div>
            <div
              className="drv-meta"
              style={{ margin: "8px 0 12px", flexDirection: "column", display: "flex", gap: 6 }}
            >
              <span>📞 {c.phone}</span>
              {c.email ? <span>✉ {c.email}</span> : null}
              <span>💶 {c.totalDepense.toFixed(2)} € au total</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`tel:${c.phone}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "10px",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                📞 Appeler
              </a>
              <a
                href={`sms:${c.phone}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "10px",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                💬 SMS
              </a>
              <a
                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "").replace(/^0/, "33")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "10px",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                🟢 WhatsApp
              </a>
            </div>
            <a
              href={makeVcardHref(c.name, c.phone, c.email)}
              download={`${c.name.replace(/[^a-zA-Z0-9]/g, "_") || "client"}.vcf`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                padding: "10px",
                color: "#1e40af",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                marginTop: 8,
              }}
            >
              📇 Enregistrer
            </a>
            <button
              onClick={() => removeClient(c)}
              disabled={deletingPhone === c.phone}
              style={{
                width: "100%",
                marginTop: 8,
                background: "none",
                border: "none",
                color: "#b91c1c",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              {deletingPhone === c.phone ? "Suppression…" : "🗑 Supprimer ce client"}
            </button>
          </div>
        ))
      )}
    </>
  );
}

// (ChatTab et DriverChatConversation retirés : le chat "haut de page" n'est
// plus affiché ; les échanges se font uniquement dans chaque carte de course.)

// ── Analytics : ouvertures du lien de suivi ────────────────────────────────
function TrackingAnalytics() {
  const trackingAnalyticsFn = useServerFn(getTrackingAnalytics);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    totalOuvertures: number;
    coursesAvecSuivi: number;
    totalCourses: number;
    tauxOuverture: number;
    parJour: { jour: string; count: number }[];
    parSource: { source: string; count: number }[];
    dernierEvents: {
      reservation_id: string;
      client_name: string | null;
      created_at: string;
      source: string | null;
    }[];
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const since30j = new Date();
      since30j.setDate(since30j.getDate() - 30);

      const tok = getDriverToken();
      if (!tok) {
        setLoading(false);
        return;
      }
      const { events, totalCourses } = await trackingAnalyticsFn({
        data: { token: tok, days: 30 },
      });

      const evts: any[] = events ?? [];

      const uniqueResas = new Set(evts.map((e: any) => e.reservation_id));

      const parJourMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        parJourMap.set(d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }), 0);
      }
      const sept = new Date();
      sept.setDate(sept.getDate() - 6);
      sept.setHours(0, 0, 0, 0);
      for (const e of evts) {
        const d = new Date(e.created_at);
        if (d >= sept) {
          const k = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
          parJourMap.set(k, (parJourMap.get(k) ?? 0) + 1);
        }
      }
      const parJour = Array.from(parJourMap.entries()).map(([jour, count]) => ({ jour, count }));

      const parSourceMap = new Map<string, number>();
      for (const e of evts) {
        const src = e.source ?? "direct";
        parSourceMap.set(src, (parSourceMap.get(src) ?? 0) + 1);
      }
      const parSource = Array.from(parSourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      const dernierEvents = evts.slice(0, 5).map((e: any) => ({
        reservation_id: e.reservation_id,
        client_name: e.client_name ?? null,
        created_at: e.created_at,
        source: e.source ?? "direct",
      }));

      const tauxOuverture = totalCourses && totalCourses > 0 ? Math.round((uniqueResas.size / totalCourses) * 100) : 0;

      setData({
        totalOuvertures: evts.length,
        coursesAvecSuivi: uniqueResas.size,
        totalCourses,
        tauxOuverture,
        parJour,
        parSource,
        dernierEvents,
      });
    } catch (e) {
      console.error("[TrackingAnalytics]", e);
    } finally {
      setLoading(false);
    }
  };

  const sourceEmoji: Record<string, string> = {
    push: "🔔",
    email: "✉️",
    sms: "💬",
    whatsapp: "🟢",
    direct: "🔗",
  };

  const maxJour = data ? Math.max(...data.parJour.map((d) => d.count), 1) : 1;

  return (
    <div style={{ marginTop: 4, marginBottom: 4 }}>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && !data) load();
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: open ? "#0f172a" : "#f8fafc",
          border: `1px solid ${open ? "#0f172a" : "#e2e8f0"}`,
          borderRadius: 14,
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: open ? "#FDFBF7" : "#0f172a",
          cursor: "pointer",
          marginBottom: open ? 10 : 0,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span>📈 Analytics — Suivi client</span>
        <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>30 derniers jours {open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="drv-card" style={{ borderRadius: 14, padding: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "#64748b", padding: "20px 0" }}>Chargement…</div>
          ) : !data ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "#64748b", padding: "20px 0" }}>Aucune donnée</div>
          ) : (
            <>
              {/* KPIs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{data.totalOuvertures}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Ouvertures</div>
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>{data.tauxOuverture}%</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Taux suivi</div>
                </div>
                <div
                  style={{
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>
                    {data.coursesAvecSuivi}/{data.totalCourses}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Courses</div>
                </div>
              </div>

              {/* Graphique 7 jours */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                7 derniers jours
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  height: 56,
                  marginBottom: 4,
                }}
              >
                {data.parJour.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        borderRadius: "4px 4px 0 0",
                        background: i === data.parJour.length - 1 ? "#0f172a" : "#bfdbfe",
                        height: `${Math.max(4, Math.round((d.count / maxJour) * 44))}px`,
                        transition: "height 0.3s ease",
                        position: "relative",
                      }}
                    >
                      {d.count > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {d.count}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {data.parJour.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 9,
                      color: i === data.parJour.length - 1 ? "#0f172a" : "#94a3b8",
                      fontWeight: i === data.parJour.length - 1 ? 700 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.jour}
                  </div>
                ))}
              </div>

              {/* Par source */}
              {data.parSource.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Provenance
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {data.parSource.map((s) => {
                      const total = data.parSource.reduce((acc, x) => acc + x.count, 0);
                      const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                      return (
                        <div key={s.source} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 70,
                              fontSize: 12,
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {sourceEmoji[s.source] ?? "🔗"} {s.source}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              background: "#f1f5f9",
                              borderRadius: 4,
                              overflow: "hidden",
                              height: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: "#0f172a",
                                borderRadius: 4,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#0f172a",
                              width: 32,
                              textAlign: "right",
                            }}
                          >
                            {s.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Dernières ouvertures */}
              {data.dernierEvents.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Dernières ouvertures
                  </div>
                  {data.dernierEvents.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: i < data.dernierEvents.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                          {e.client_name ?? "Client"}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>
                          {sourceEmoji[e.source ?? "direct"] ?? "🔗"} {e.source ?? "direct"} · #
                          {e.reservation_id.slice(0, 6)}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "right" }}>
                        {new Date(e.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {data.totalOuvertures === 0 && (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8", fontSize: 12 }}>
                  Aucune ouverture enregistrée sur cette période.
                  <br />
                  <span style={{ fontSize: 11 }}>
                    Assure-toi que <code>suivi.$id.tsx</code> insère bien dans <code>tracking_events</code>.
                  </span>
                </div>
              )}

              <button
                onClick={load}
                disabled={loading}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "8px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0f172a",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                🔄 Rafraîchir
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Visiteurs actifs en temps réel ───────────────────────────────────────────
function VisitorCounter({
  scope,
  title,
  emptyLabel,
  singleLabel,
  pluralLabel,
  subtitle,
  emoji,
}: {
  scope: "site" | "suivi";
  title: string;
  emptyLabel: string;
  singleLabel: string;
  pluralLabel: (n: number) => string;
  subtitle: string;
  emoji: string;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      // Le nettoyage des visiteurs périmés se fait côté serveur (rôle service),
      // le client anonyme n'a aucun droit d'écriture sur active_visitors.

      try {
        if (!getDriverToken()) {
          setCount(0);
          return;
        }
        const res = await getActiveVisitorCount({ data: { token: getDriverToken(), scope } });
        setCount(res?.count ?? 0);
      } catch {
        setCount(0);
      }
    };

    fetchCount();
    const poll = setInterval(fetchCount, 15_000);

    return () => {
      clearInterval(poll);
    };
  }, [scope]);

  const isActive = count !== null && count > 0;

  return (
    <div
      className="drv-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        marginBottom: 4,
      }}
    >
      <span
        className={isActive ? "drv-visitor-dot-active" : undefined}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: count === null ? "#94a3b8" : isActive ? "#22c55e" : "#e2e8f0",
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          {count === null ? "…" : count === 0 ? emptyLabel : count === 1 ? singleLabel : pluralLabel(count)}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
          {title} · {subtitle}
        </div>
      </div>
      {isActive && <span style={{ fontSize: 20 }}>{emoji}</span>}
    </div>
  );
}

function ActiveVisitors() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <VisitorCounter
        scope="site"
        title="Site"
        subtitle="visiteurs sur le site"
        emptyLabel="Aucun visiteur sur le site"
        singleLabel="1 visiteur sur le site"
        pluralLabel={(n) => `${n} visiteurs sur le site`}
        emoji="🌐"
      />
      <VisitorCounter
        scope="suivi"
        title="Suivi"
        subtitle="pages /suivi actives"
        emptyLabel="Personne sur une page suivi"
        singleLabel="1 client consulte son suivi"
        pluralLabel={(n) => `${n} clients consultent leur suivi`}
        emoji="👁"
      />
    </div>
  );
}

// ── Onglet Stats ────────────────────────────────────────────────────────────
function SimulateurTab() {
  // Alias connus pour l'aéroport : "aéroport de bordeaux" seul est souvent mal
  // (ou pas) géocodé par Google, contrairement au nom officiel complet.
  // On normalise ici avant l'appel à geocodeAddress, quelle que soit la variante tapée.
  //
  // IMPORTANT : on ne matche jamais les accents sur le texte brut. Selon le
  // clavier/l'OS (iOS en particulier), un accent peut être saisi en forme
  // Unicode décomposée (e + accent combinant) plutôt que précomposée (é) —
  // une regex du type [ée] ne matche alors ni l'un ni l'autre de façon fiable.
  // On désaccentue donc d'abord tout le texte (comme dans reserver.tsx), puis
  // on matche sur des motifs ASCII purs.
  const stripAccents = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const normalizeAddress = (raw: string): string => {
    const trimmed = raw.trim();
    const n = stripAccents(trimmed);
    if (/aeroport.*(bordeaux|merignac)|(bordeaux|merignac).*aeroport/.test(n)) {
      return "Aéroport de Bordeaux-Mérignac, France";
    }
    return trimmed;
  };

  const [mode, setMode] = useState<"manuel" | "adresses">("manuel");
  const [pickupLocal, setPickupLocal] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [distanceKm, setDistanceKm] = useState("");
  const [depart, setDepart] = useState("");

  const [arrivee, setArrivee] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    distanceKm: number;
    jourKm: number;
    nuitKm: number;
    prixJour: number;
    prixNuit: number;
    priseEnCharge: number;
    total: number;
    label: string;
  } | null>(null);

  // Découpage jour/nuit basé sur une durée interne uniquement — la durée
  // n'entre PAS dans le prix (tarif au km) et n'est jamais exposée dans l'UI
  // ni envoyée dans une requête.
  const computeBreakdown = (distKm: number, stepMinutes: number, pickupIso: string) => {
    const dureeS = Math.max(stepMinutes, 1) * 60;
    const pickupMs = parseAsParisTime(pickupIso).getTime();
    const stepsCount = Math.max(Math.round(dureeS / 60), 1);
    const stepMs = (dureeS * 1000) / stepsCount;
    const frac = distKm / stepsCount;
    let jourKm = 0;
    let nuitKm = 0;
    for (let s = 0; s < stepsCount; s++) {
      const t = new Date(pickupMs + s * stepMs).toISOString();
      if (estTarifJourParis(t)) jourKm += frac;
      else nuitKm += frac;
    }
    const prixJour = jourKm * TARIFS.TARIF_JOUR;
    const prixNuit = nuitKm * TARIFS.TARIF_NUIT;
    const total = Math.round((TARIFS.PRISE_EN_CHARGE + prixJour + prixNuit) * 100) / 100;
    const label = jourKm > 0.01 && nuitKm > 0.01 ? "Tarif mixte 🌗" : nuitKm > 0.01 ? "Tarif nuit 🌙" : "Tarif jour ☀️";
    return {
      distanceKm: distKm,
      jourKm,
      nuitKm,
      prixJour,
      prixNuit,
      priseEnCharge: TARIFS.PRISE_EN_CHARGE,
      total,
      label,
    };
  };

  const handleManualCompute = () => {
    const d = parseFloat(distanceKm.replace(",", "."));
    if (!d || d <= 0) {
      toast.error("Distance invalide");
      return;
    }
    // Durée masquée : on estime 2 min par km pour le calcul mixte jour/nuit.
    const t = Math.max(Math.round(d * 2), 1);
    setResult(computeBreakdown(d, t, pickupLocal));
  };

  const handleAdressesCompute = async () => {
    if (!depart.trim() || !arrivee.trim()) {
      toast.error("Renseigne le départ et la destination");
      return;
    }
    setLoadingRoute(true);
    setRouteError(null);
    try {
      const mapsApi = await loadGoogleMapsWhenVisible(mapRef.current!);
      const [geoA, geoB] = await Promise.all([
        geocodeAddress(normalizeAddress(depart)),
        geocodeAddress(normalizeAddress(arrivee)),
      ]);
      if (!geoA || !geoB) {
        setRouteError("Adresse introuvable");
        setLoadingRoute(false);
        return;
      }
      const svc = new mapsApi.maps.DirectionsService();
      const res: any = await new Promise((resolve, reject) =>
        svc.route(
          {
            origin: { lat: geoA.lat, lng: geoA.lng },
            destination: { lat: geoB.lat, lng: geoB.lng },
            travelMode: mapsApi.maps.TravelMode.DRIVING,
          },
          (r: any, s: any) => (s === "OK" && r ? resolve(r) : reject(s)),
        ),
      );
      const leg = res.routes[0].legs[0];
      // Arrondi à 1 décimale AVANT le calcul du prix, pour que l'affichage
      // ("5.2 km × 2.16 €") corresponde exactement au prix calculé et évite
      // toute impression d'erreur de calcul (ex: 5.153 km affiché "5.2" mais
      // facturé sur la valeur brute → 11.13 € au lieu de 11.23 € attendu).
      const distKm = Math.round(((leg.distance?.value ?? 0) / 1000) * 10) / 10;
      const stepMinutes = Math.max(Math.round((leg.duration?.value ?? distKm * 120) / 60), 1);
      setResult(computeBreakdown(distKm, stepMinutes, pickupLocal));
    } catch (e) {
      console.error("[SimulateurTab] route:", e);
      setRouteError("Impossible de calculer l'itinéraire — vérifie les adresses.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 16,
    fontFamily: "'DM Sans', sans-serif",
    color: "#0f172a",
    background: "#FDFBF7",
    colorScheme: "light",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    display: "block",
    marginBottom: 6,
  };

  return (
    <>
      <p className="drv-section">Simulateur de tarif</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setMode("manuel")}
          style={{
            flex: 1,
            padding: "10px",
            minHeight: 44,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: mode === "manuel" ? "2px solid #2563eb" : "1px solid #e2e8f0",
            background: mode === "manuel" ? "#eff6ff" : "#FDFBF7",
            color: mode === "manuel" ? "#1d4ed8" : "#475569",
          }}
        >
          🧮 Km
        </button>
        <button
          onClick={() => setMode("adresses")}
          style={{
            flex: 1,
            padding: "10px",
            minHeight: 44,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: mode === "adresses" ? "2px solid #2563eb" : "1px solid #e2e8f0",
            background: mode === "adresses" ? "#eff6ff" : "#FDFBF7",
            color: mode === "adresses" ? "#1d4ed8" : "#475569",
          }}
        >
          📍 Adresses
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>📅 Heure de prise en charge</label>
        <input
          type="datetime-local"
          value={pickupLocal}
          onChange={(e) => setPickupLocal(e.target.value)}
          style={inputStyle}
        />
      </div>

      {mode === "manuel" ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>🛣 Distance (km)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 15.6"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleManualCompute}
            style={{
              width: "100%",
              background: "#0b1224",
              color: "#FDFBF7",
              border: "none",
              borderRadius: 12,
              padding: "13px",
              minHeight: 46,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            💶 Calculer le prix
          </button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>📍 Départ</label>
            <input
              type="text"
              placeholder="Ex: 37 Rue Charles Domercq, Bordeaux"
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>🏁 Destination</label>
            <input
              type="text"
              placeholder="Ex: Aéroport Bordeaux-Mérignac"
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              style={inputStyle}
            />
          </div>
          {/* Élément requis (même caché) pour déclencher le chargement de Google Maps */}
          <div ref={mapRef} style={{ height: 1, overflow: "hidden" }} />
          <button
            onClick={handleAdressesCompute}
            disabled={loadingRoute}
            style={{
              width: "100%",
              background: "#0b1224",
              color: "#FDFBF7",
              border: "none",
              borderRadius: 12,
              padding: "13px",
              minHeight: 46,
              fontSize: 14,
              fontWeight: 800,
              cursor: loadingRoute ? "default" : "pointer",
              marginBottom: 14,
              opacity: loadingRoute ? 0.7 : 1,
            }}
          >
            {loadingRoute ? "…" : "🗺 Calculer l'itinéraire et le prix"}
          </button>
          {routeError && <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>{routeError}</div>}
        </>
      )}

      {result && (
        <div
          style={{
            border: "2px solid #0b1224",
            borderRadius: 14,
            padding: 16,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, color: "#64748b" }}>🛣 {result.distanceKm.toFixed(1)} km</span>

            <span
              className="drv-badge-pill"
              style={{
                background: result.label.includes("mixte")
                  ? "#fdf4ff"
                  : result.label.includes("nuit")
                    ? "#eff6ff"
                    : "#f0fdf4",
                color: result.label.includes("mixte")
                  ? "#a21caf"
                  : result.label.includes("nuit")
                    ? "#1d4ed8"
                    : "#15803d",
              }}
            >
              {result.label}
            </span>
          </div>

          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.9 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Prise en charge</span>
              <span>{result.priseEnCharge.toFixed(2)} €</span>
            </div>
            {result.jourKm > 0.01 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  Tarif jour ☀️ · {result.jourKm.toFixed(1)} km × {TARIFS.TARIF_JOUR.toFixed(2)} €
                </span>
                <span>{result.prixJour.toFixed(2)} €</span>
              </div>
            )}
            {result.nuitKm > 0.01 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  Tarif nuit 🌙 · {result.nuitKm.toFixed(1)} km × {TARIFS.TARIF_NUIT.toFixed(2)} €
                </span>
                <span>{result.prixNuit.toFixed(2)} €</span>
              </div>
            )}
          </div>

          <hr className="drv-divider" style={{ margin: "10px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#0b1224" }}>Total estimé</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0b1224" }}>{result.total.toFixed(2)} €</span>
          </div>
        </div>
      )}
    </>
  );
}

const DRIVER_LABEL: Record<string, string> = {
  patricia: "Patricia",
  alain: "Alain",
  non_attribuee: "Non attribuée",
};

function StatsTab() {
  const getStats = useServerFn(getDriverStats);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const res = await getStats({ data: { token: getDriverToken(), days } });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getStats, days]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 8000);
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, () => load())
      .subscribe();
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      supabase.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  if (loading)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Chargement…</div>
      </div>
    );

  if (!data)
    return (
      <div className="drv-empty">
        <div style={{ fontSize: 14 }}>Statistiques indisponibles</div>
      </div>
    );

  const maxDay = Math.max(1, ...data.byDay.map((d: any) => d.count));
  const fmtMin = (v: number | null) => (v == null ? "—" : v >= 60 ? `${Math.round(v / 6) / 10} h` : `${v} min`);

  return (
    <>
      <div style={{ display: "flex", gap: 6, padding: "10px 0 2px", overflowX: "auto" }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              border: "1px solid " + (days === d ? "var(--background)" : "var(--border)"),
              background: days === d ? "var(--background)" : "#FDFBF7",
              color: days === d ? "var(--gold)" : "#334155",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 36,
            }}
          >
            {d} jours
          </button>
        ))}
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11, color: "#94a3b8" }}>⏱ temps réel</span>
      </div>

      <p className="drv-section">Vue d'ensemble</p>
      <div className="drv-stat-grid">
        <div className="drv-stat">
          <div className="drv-stat-lbl">Demandes</div>
          <div className="drv-stat-val">{data.global.total}</div>
          <div className="drv-stat-sub">{days} derniers jours</div>
        </div>
        <div className="drv-stat">
          <div className="drv-stat-lbl">Courses terminées</div>
          <div className="drv-stat-val">{data.global.completed}</div>
          <div className="drv-stat-sub">{data.global.km} km</div>
        </div>
        <div className="drv-stat">
          <div className="drv-stat-lbl">Revenus</div>
          <div className="drv-stat-val">{data.global.revenue} €</div>
          <div className="drv-stat-sub">courses terminées</div>
        </div>
        <div className="drv-stat">
          <div className="drv-stat-lbl">Note moyenne</div>
          <div className="drv-stat-val">{data.note > 0 ? data.note : "—"}</div>
          <div className="drv-stat-sub" style={{ color: "#f59e0b" }}>
            {data.note > 0 ? "★ sur 5" : "Pas encore d'avis"}
          </div>
        </div>
      </div>

      <p className="drv-section">Par chauffeur</p>
      {data.drivers
        .filter((d: any) => d.total > 0 || d.driver !== "non_attribuee")
        .map((d: any) => (
          <div className="drv-card" key={d.driver} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: d.driver === "patricia" ? "#fdf2f8" : d.driver === "alain" ? "#eff6ff" : "#f1f5f9",
                  color: d.driver === "patricia" ? "#9d174d" : d.driver === "alain" ? "#1d4ed8" : "#475569",
                }}
              >
                👤 {DRIVER_LABEL[d.driver]}
              </span>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{d.total} demande(s)</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {[
                { l: "Taux d'acceptation", v: `${d.acceptanceRate}%` },
                { l: "Terminées", v: String(d.completed) },
                { l: "Délai d'acceptation", v: fmtMin(d.avgAcceptMinutes) },
                { l: "Durée moyenne course", v: fmtMin(d.avgTripMinutes) },
                { l: "En attente", v: String(d.pending) },
                { l: "Revenus", v: `${d.revenue} €` },
              ].map((c) => (
                <div key={c.l} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px" }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "#64748b",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {c.l}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                height: 6,
                background: "#e2e8f0",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${d.acceptanceRate}%`, height: "100%", background: "#16a34a" }} />
            </div>
          </div>
        ))}

      <p className="drv-section">7 derniers jours</p>
      <div className="drv-card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 6 }}>
          {data.byDay.map((d: any) => (
            <div
              key={d.date}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ textAlign: "center", fontSize: 10.5, color: "#0f172a", fontWeight: 700 }}>{d.count}</div>
              <div
                style={{
                  width: "100%",
                  borderRadius: "4px 4px 0 0",
                  background: "#0f172a",
                  height: `${Math.max(6, (d.count / maxDay) * 52)}px`,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {data.byDay.map((d: any) => (
            <div key={d.date} style={{ flex: 1, textAlign: "center", fontSize: 10.5, color: "#94a3b8" }}>
              {new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Visiteurs actifs */}
      <p className="drv-section">En ce moment</p>
      <ActiveVisitors />

      {/* Analytics suivi */}
      <TrackingAnalytics />

      {/* Diagnostic push */}
      <PushDiagnostic />
    </>
  );
}

// ── Onglet Historique : demandes, attributions et statuts horodatés ────────
function HistoriqueTab({ driverId }: { driverId?: string }) {
  const listEvents = useServerFn(listReservationEvents);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "patricia" | "alain">(
    driverId === "patricia" || driverId === "alain" ? (driverId as any) : "all",
  );

  const load = useCallback(async () => {
    try {
      if (!getDriverToken()) {
        return;
      }
      const res = await listEvents({
        data: { token: getDriverToken(), limit: 120, driver: filter },
      });
      setRows((res as any)?.events ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [listEvents, filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 8000);
    const ch = (supabase as any)
      .channel("driver-feed", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "reservation" }, () => load())
      .subscribe();
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const eventLabel = (e: any) => {
    if (e.event_type === "created") return "🆕 Nouvelle demande";
    if (e.event_type === "assigned")
      return `↔ Attribuée à ${DRIVER_LABEL[e.to_value] ?? e.to_value ?? "—"}${e.from_value ? ` (avant : ${DRIVER_LABEL[e.from_value] ?? e.from_value})` : ""}`;
    const map: Record<string, string> = {
      accepted: "✅ Acceptée",
      en_route: "🚖 En route",
      arrived: "📍 Prise en charge",
      completed: "🏁 Terminée",
      terminee: "🏁 Terminée",
      cancelled: "✖ Annulée / refusée",
    };
    return map[e.to_value] ?? `Statut : ${e.to_value}`;
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6, padding: "10px 0 2px" }}>
        {(
          [
            { k: "all", l: "Tout" },
            { k: "patricia", l: "Patricia" },
            { k: "alain", l: "Alain" },
          ] as const
        ).map((o) => (
          <button
            key={o.k}
            onClick={() => setFilter(o.k as any)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid " + (filter === o.k ? "var(--background)" : "var(--border)"),
              background: filter === o.k ? "var(--background)" : "#FDFBF7",
              color: filter === o.k ? "var(--gold)" : "#334155",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 38,
            }}
          >
            {o.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14 }}>Chargement…</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="drv-empty">
          <div style={{ fontSize: 14 }}>Aucun évènement pour le moment</div>
        </div>
      ) : (
        <div className="drv-card">
          {rows.map((e) => (
            <div key={e.id} style={{ padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{eventLabel(e)}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {new Date(e.created_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {e.client_name ? `${e.client_name} · ` : ""}
                {e.depart ?? "—"} → {e.destination ?? "—"}
              </div>
              {e.driver && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: e.driver === "patricia" ? "#fdf2f8" : "#eff6ff",
                    color: e.driver === "patricia" ? "#9d174d" : "#1d4ed8",
                  }}
                >
                  👤 {DRIVER_LABEL[e.driver] ?? e.driver}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Mini diagnostic des échecs push (remplace l'ancien lien /admin/dashboard) ──
function PushDiagnostic() {
  const fetchFailures = useServerFn(listPushFailures);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (!getDriverToken()) {
        setLoading(false);
        return;
      }
      const res = await fetchFailures({
        data: { pin: getDriverToken(), only_price_update: false, limit: 30 },
      });
      setRows((res as any)?.failures ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && rows.length === 0) load();
        }}
        style={{
          width: "100%",
          textAlign: "center",
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontSize: 12,
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        {open ? "▲ Masquer le diagnostic push" : "▼ Diagnostic notifications push"}
      </button>
      {open && (
        <div className="drv-card">
          {loading ? (
            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>Chargement…</div>
          ) : rows.length === 0 ? (
            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>Aucun échec récent ✨</div>
          ) : (
            rows.map((r: any) => (
              <div key={r.id} style={{ fontSize: 11.5, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  <span>
                    {r.audience} · {r.http_status ?? "—"} {r.error_code ?? ""}
                  </span>
                  <span style={{ color: "#94a3b8" }}>
                    {new Date(r.created_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div style={{ color: "#64748b" }}>{r.title ?? ""}</div>
              </div>
            ))
          )}
          <button
            onClick={load}
            disabled={loading}
            style={{
              marginTop: 10,
              width: "100%",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "8px",
              fontSize: 12,
              fontWeight: 700,
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            🔄 Rafraîchir
          </button>
        </div>
      )}
    </div>
  );
}

// ── Onglet Appareils (notifications push par chauffeur) ────────────────────
const DRIVER_LABELS: Record<string, string> = {
  patricia: "Patricia",
  alain: "Alain",
  admin: "Administration",
};

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AppareilsTab() {
  const listFn = useServerFn(listDriverDevices);
  const revokeFn = useServerFn(revokeDriverDevice);
  const logFn = useServerFn(driverPushLog);

  const [devices, setDevices] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, sent: 0, failed: 0, email: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [perm, setPerm] = useState<string>("default");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getDriverToken();
      const [d, l]: any[] = await Promise.all([listFn({ data: { token } }), logFn({ data: { token, limit: 60 } })]);
      setDevices(d?.devices ?? []);
      setLog(l?.entries ?? []);
      setStats(l?.stats ?? { total: 0, sent: 0, failed: 0, email: 0 });
    } catch (e: any) {
      toast.error("Chargement des appareils impossible");
    } finally {
      setLoading(false);
    }
  }, [listFn, logFn]);

  useEffect(() => {
    load();
    if (typeof window !== "undefined" && "Notification" in window) setPerm(Notification.permission);
  }, [load]);

  const revoke = async (id: string, label: string) => {
    if (!window.confirm(`Désinscrire l'appareil « ${label} » des notifications ?`)) return;
    setBusy(id);
    try {
      await revokeFn({ data: { token: getDriverToken(), device_id: id } });
      toast.success("Appareil désinscrit");
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error("Révocation impossible");
    } finally {
      setBusy(null);
    }
  };

  const groups = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const d of devices) {
      const key = d.driver_id || "inconnu";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [devices]);

  if (loading) return <div style={{ padding: 16, color: "#64748b" }}>Chargement…</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Permission navigateur :{" "}
          <b>{perm === "granted" ? "accordée" : perm === "denied" ? "refusée" : "non demandée"}</b>
        </span>
        <button
          onClick={load}
          style={{
            marginLeft: "auto",
            background: "#0f172a",
            color: "#FDFBF7",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {groups.length === 0 && (
        <div style={{ color: "#64748b", fontSize: 14 }}>Aucun appareil inscrit pour le moment.</div>
      )}

      {groups.map(([driver, list]) => (
        <div key={driver} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div
            style={{
              background: "var(--background)",
              color: "var(--gold)",
              padding: "10px 14px",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {DRIVER_LABELS[driver] ?? "Chauffeur inconnu"} — {list.length} appareil
            {list.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "grid" }}>
            {list.map((d) => (
              <div key={d.id} style={{ padding: 12, borderTop: "1px solid #f1f5f9", display: "grid", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <b style={{ fontSize: 14 }}>{d.platform}</b>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: d.active ? "#dcfce7" : "#fee2e2",
                      color: d.active ? "#166534" : "#991b1b",
                    }}
                  >
                    {d.active ? "actif" : "inactif"}
                  </span>
                  <code style={{ fontSize: 11, color: "#64748b" }}>…{d.fcm_suffix ?? "—"}</code>
                  <button
                    onClick={() => revoke(d.id, `${DRIVER_LABELS[driver] ?? driver} · ${d.platform}`)}
                    disabled={busy === d.id}
                    style={{
                      marginLeft: "auto",
                      background: "#dc2626",
                      color: "#FDFBF7",
                      border: "none",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {busy === d.id ? "…" : "Désinscrire"}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  Dernière activité : {fmtDate(d.last_seen_at)} · Inscrit le {fmtDate(d.created_at)}
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  Dernier envoi : {fmtDate(d.last_sent_at)}
                  {d.last_sent_title ? ` — ${d.last_sent_title}` : ""}
                </div>
                <div style={{ fontSize: 12, color: d.last_error_at ? "#b91c1c" : "#94a3b8" }}>
                  Dernière erreur :{" "}
                  {d.last_error_at
                    ? `${fmtDate(d.last_error_at)} — ${d.last_error_code ?? "erreur"}${d.last_error_status ? ` (HTTP ${d.last_error_status})` : ""}`
                    : "aucune"}
                </div>
                {d.user_agent && (
                  <div style={{ fontSize: 11, color: "#94a3b8", wordBreak: "break-all" }}>{d.user_agent}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#f8fafc", padding: "10px 14px", fontWeight: 800, fontSize: 14 }}>
          Journal des notifications — {stats.sent} envoyées · {stats.failed} en échec · {stats.email} repli e-mail
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {log.length === 0 && (
            <div style={{ padding: 12, color: "#64748b", fontSize: 13 }}>Aucun envoi enregistré.</div>
          )}
          {log.map((e) => (
            <div
              key={e.id}
              style={{
                padding: "8px 12px",
                borderTop: "1px solid #f1f5f9",
                fontSize: 12,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#94a3b8", minWidth: 96 }}>{fmtDate(e.created_at)}</span>
              <span
                style={{
                  fontWeight: 700,
                  color: e.status === "sent" ? "#166534" : e.status === "fallback_email" ? "#92400e" : "#b91c1c",
                }}
              >
                {e.status}
              </span>
              <span style={{ color: "#475569" }}>{e.audience}</span>
              <span style={{ color: "#0f172a", flex: 1, minWidth: 140 }}>{e.title ?? e.tag ?? "—"}</span>
              {e.error_code && <span style={{ color: "#b91c1c" }}>{e.error_code}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
