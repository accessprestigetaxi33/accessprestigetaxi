import { createFileRoute } from "@tanstack/react-router";
import { ogImageUrl, ogPageUrl } from "@/lib/og";
import ogDriverFr from "@/assets/apt-og-driver-fr.jpg.asset.json";
import ogDriverEn from "@/assets/apt-og-driver-en.jpg.asset.json";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMapsWhenVisible } from "@/lib/googleMaps";
import { geocodeAddress } from "@/lib/googleGeocode";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import PushDiagnosticsCard from "@/components/PushDiagnosticsCard";
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
import { getDriverStats, listReservationEvents, getTrackingAnalytics } from "@/lib/driver-stats.functions";
import { listDriverDevices, revokeDriverDevice, driverPushLog } from "@/lib/driver-devices.functions";
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
type Tab = "courses" | "planning" | "avis" | "clients" | "stats" | "historique" | "simulateur" | "gps";

// (ChatRealtimeStatusPill retiré : plus de canal Realtime global à surveiller.)

interface Resa {
  id: string;
  depart: string;
  destination: string;
  date_heure: string;
  pickup_datetime: string;
  status: string;
  prix_estime?: number | null;
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
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#FDFBF7" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "APT Chauffeur" },
      ],
      links: [{ rel: "manifest", href: "/api/manifest?role=driver" }],
    };
  },

  component: DriverPage,
});

// ── Styles globaux ─────────────────────────────────────────────────────────
const css = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; touch-action: manipulation; }
  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    overscroll-behavior-y: contain; background: #FDFBF7;
    font-family: 'DM Sans', sans-serif;
  }
  input, textarea, select { font-size: 16px; }
  .drv-root {
    position: fixed; inset: 0;
    max-width: 480px; margin: 0 auto;
    display: flex; flex-direction: column;
    background: #FDFBF7;
  }
  /* Tablette (iPad portrait et paysage) : colonne élargie, toujours centrée,
     avec un liseré pour la distinguer du fond beige plus soutenu de l'écran. */
  @media (min-width: 700px) {
    html, body { background: #EFE6D8; }
    .drv-root {
      max-width: 620px;
      box-shadow: 0 0 0 1px #e2e8f0, 0 20px 60px -20px rgba(15, 23, 42, 0.25);
    }
  }
  /* Desktop / grand écran : colonne encore plus large, texte légèrement agrandi. */
  @media (min-width: 1024px) {
    .drv-root { max-width: 760px; }
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
    .drv-card:hover, .drv-route-opt:hover, .drv-chat-thread:hover { border-color: #cbd5e1; }
  }
  .drv-header {
    background: #0f172a; color: #FDFBF7; display: flex; align-items: center; gap: 10px;
    padding: max(calc(env(safe-area-inset-top, 0px) + 14px), 54px) calc(env(safe-area-inset-right, 0px) + 16px) 10px calc(env(safe-area-inset-left, 0px) + 16px);
    flex-shrink: 0;
  }
  .drv-header h1 { margin: 0; font-size: 17px; font-weight: 700; flex: 1; font-family: 'DM Sans', sans-serif; }
  .drv-tabs {
    display: flex; border-bottom: 1px solid #e2e8f0; background: #FDFBF7;
    padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px);
    flex-shrink: 0;
  }
  .drv-tab {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 12px 4px 10px; min-height: 48px; border: none; background: none; color: #94a3b8;
    font-size: 10px; font-family: 'DM Sans', sans-serif; cursor: pointer; border-bottom: 2px solid transparent;
    transition: color 0.15s; -webkit-user-select: none; user-select: none;
  }
  .drv-tab:active { background: #f8fafc; }
  .drv-tab.active { color: #0f172a; border-bottom-color: #0f172a; }
  .drv-tab svg { width: 22px; height: 22px; }
  .drv-badge { background: #ef4444; color: #FDFBF7; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 1px 5px; position: absolute; top: -3px; right: -5px; }
  .drv-body {
    flex: 1; min-height: 0; padding: 16px;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain;
  }
  .drv-section { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; }
  .drv-card { background: #FDFBF7; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; margin-bottom: 10px; }
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
  .drv-btn-secondary { flex: 1; min-height: 46px; background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
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
  .drv-route-opt { border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; min-height: 44px; }
  .drv-route-opt:active { background: #f8fafc; }
  .drv-route-opt.selected { border-color: #0f172a; background: #f8fafc; }
  .drv-route-opt-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .drv-route-label { font-size: 13px; font-weight: 700; color: #0f172a; }
  .drv-route-price { font-size: 16px; font-weight: 800; color: #0f172a; }
  .drv-route-meta { display: flex; gap: 10px; font-size: 12px; color: #64748b; }
  .drv-map { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 14px; border: 1px solid #e2e8f0; touch-action: pan-x pan-y; }
  .drv-divider { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
  .drv-planning-slot { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
  .drv-planning-time { font-size: 12px; color: #64748b; min-width: 40px; padding-top: 3px; }
  .drv-planning-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
  .drv-planning-card { flex: 1; background: #FDFBF7; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; }
  @media (max-width: 380px) {
    .drv-time { font-size: 18px; }
    .drv-stat-val { font-size: 20px; }
  }
  .drv-chat-thread { border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; margin-bottom: 8px; cursor: pointer; background: #FDFBF7; display: flex; align-items: center; gap: 10; }
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

const IconChat = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

const IconGps = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s7-7.58 7-13a7 7 0 0 0-14 0c0 5.42 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
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
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
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

  // ── Fix conflit manifest PWA ────────────────────────────────────────────
  useEffect(() => {
    const links = Array.from(document.querySelectorAll('link[rel="manifest"]')) as HTMLLinkElement[];
    const keep = links.find((l) => l.href.includes("/api/manifest"));
    links.forEach((l) => {
      if (l !== keep) l.remove();
    });
  }, []);

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
          fontFamily: "DM Sans,sans-serif",
          color: "#64748b",
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
  const [tab, setTab] = useState<Tab>("courses");

  // Suivi GPS en continu, indépendant de l'onglet affiché (démarre seul dès
  // l'identification, comme avant) — seul l'affichage vit désormais dans
  // l'onglet "GPS".
  const gps = useDriverGpsTracking(driverId);

  const [newCount, setNewCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const [pendingAvis, setPendingAvis] = useState(0);
  const [pushBusy, setPushBusy] = useState(false);
  const { status: pushStatus, subscribe: subscribePush } = usePushNotifications({
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
        const res: any = await listCoursesFn({ data: { token: getDriverToken() } });
        if (cancelled) return;
        const mine = (res?.courses ?? []).filter(
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

  // (Badge global d'unread chat retiré : le compteur par course est géré
  // localement par CoursesTab via getUnreadCountsForReservations.)

  return (
    <>
      <style>{css}</style>
      <div className="drv-root">
        <div className="drv-header">
          <span style={{ fontSize: 26 }}>🚕</span>
          <h1 style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Espace chauffeur</span>
            <DriverIdentitySwitcher
              driverId={driverId}
              onIdentify={onIdentify}
              busy={identifyBusy}
              error={identifyError}
            />
          </h1>

          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "var(--border)",
              fontSize: 11,
              textDecoration: "none",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 10px",
              flexShrink: 0,
              minHeight: 30,
            }}
          >
            ↩ Retour au site
          </a>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Bandeau activation / reconfirmation notifications */}
        {(pushStatus === "idle" || pushStatus === "denied" || pushStatus === "granted" || pushStatus === "loading") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              background:
                pushStatus === "denied" ? "#fef2f2" : pushStatus === "granted" ? "#F4EFE4" : "#FDFBF7",
              borderBottom: "1px solid #e6ddc9",
              padding: "10px 16px",
              fontSize: 12.5,
              color: pushStatus === "denied" ? "#b91c1c" : pushStatus === "granted" ? "#5b4a22" : "#7a6320",
            }}
          >
            <span>
              {pushStatus === "denied"
                ? "🔕 Notifications bloquées — Réglages iPhone → Notifications → « APT Chauffeur » → Autoriser les notifications, puis rouvrez l'app."
                : pushStatus === "granted"
                  ? "🔔 Notifications actives"
                  : "🔔 Recevez une alerte à chaque nouvelle course, sans garder l'app ouverte."}
            </span>
            {pushStatus !== "denied" && (
              <button
                onClick={async () => {
                  setPushBusy(true);
                  try {
                    const ok = await subscribePush("chauffeur", null, null);
                    if (ok) toast.success("Notifications activées sur cet appareil.");
                    else toast.error("Impossible d'activer les notifications sur cet appareil.");
                  } catch {
                    toast.error("Impossible d'activer les notifications sur cet appareil.");
                  } finally {
                    setPushBusy(false);
                  }
                }}
                disabled={pushBusy}
                style={{
                  flexShrink: 0,
                  background: "#0f172a",
                  color: "#FDFBF7",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: pushBusy ? "wait" : "pointer",
                  opacity: pushBusy ? 0.6 : 1,
                  minHeight: 32,
                }}
              >
                {pushBusy ? "Activation…" : pushStatus === "granted" ? "🔄 Ré-activer" : "Activer"}
              </button>
            )}
          </div>
        )}

        <div style={{ padding: "0 16px" }}>
          <PushDiagnosticsCard driverId={driverId} pushStatus={pushStatus} />
        </div>




        {/* Tabs */}
        <div className="drv-tabs">
          {(["courses", "planning", "avis", "clients", "stats", "historique", "simulateur"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`drv-tab${tab === t ? " active" : ""}`}
              onClick={() => {
                setTab(t);
                gaEvent("driver_tab_view", { tab: t, driver: driverLabel });
                // Reset optimiste du badge chat à l'ouverture de l'onglet ;
                // le prochain refresh Realtime/reconcile remettra la vraie valeur.
                if (t === "courses") setUnreadChat(0);
              }}
            >
              <div style={{ position: "relative", display: "inline-block" }}>
                {t === "courses" && (
                  <>
                    <IconBell />
                    {newCount + unreadChat > 0 && <span className="drv-badge">{newCount + unreadChat}</span>}
                  </>
                )}
                {t === "planning" && <IconCalendar />}
                {t === "avis" && (
                  <>
                    <IconStar />
                    {pendingAvis > 0 && <span className="drv-badge">{pendingAvis}</span>}
                  </>
                )}
                {t === "clients" && <IconUsers />}
                {t === "stats" && <IconChart />}
                {t === "historique" && <IconCalendar />}
                {t === "simulateur" && <IconCalc />}
                {t === "gps" && <IconGps />}
              </div>
              <span>
                {
                  {
                    courses: "Course + chat client",
                    planning: "Planning",
                    avis: "Avis",
                    clients: "Clients",
                    stats: "Stats",
                    historique: "Historique",
                    simulateur: "Simu",
                    gps: "GPS",
                  }[t]
                }
              </span>
            </button>
          ))}
        </div>

        <div className="drv-body">
          {/* Position et GPS de l'équipe regroupés au même endroit. Placé ICI
              (dans la zone scrollable .drv-body, au-dessus du contenu de
              l'onglet actif) plutôt qu'au-dessus de la barre d'onglets :
              sinon, sur un écran court, ces deux cartes GPS pouvaient à elles
              seules dépasser la hauteur de l'écran et rendre la barre
              d'onglets + tout le contenu (avis, clients…) inaccessibles,
              sans aucun moyen de scroller pour les atteindre. */}
          {(driverId === "alain" || driverId === "patricia") && <TeamMapCard driverId={driverId} gps={gps} />}

          {tab === "courses" && (
            <CoursesTab onBadgeChange={setNewCount} onChatBadge={setUnreadChat} driverId={driverId} />
          )}

          {tab === "planning" && <PlanningTab />}
          {tab === "avis" && <AvisTab onBadgeChange={setPendingAvis} />}
          {tab === "clients" && <ClientsTab />}
          {tab === "stats" && <StatsTab />}
          {tab === "historique" && <HistoriqueTab driverId={driverId} />}
          {tab === "simulateur" && <SimulateurTab />}
        </div>
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
    <div ref={rootRef} style={{ position: "relative", flexShrink: 0 }}>
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
            zIndex: 50,
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
                border: "1px solid " + (driverId === d.id ? "#0f172a" : "#e2e8f0"),
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

  const [pos, setPos] = useState<{ lat: number; lng: number; acc: number | null; speed: number | null } | null>(null);
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
    stopPos({ data: { token: getDriverToken() ?? "" } }).catch(() => {});
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
    try {
      const res: any = await listPos({ data: { token: getDriverToken() ?? "" } });
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
      style={{
        margin: "10px 16px 0",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        background: "#FDFBF7",
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
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Équipe</span>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#64748b" }}>
          {distKm != null ? `${distKm.toFixed(1)} km entre vous` : `${pts.length}/2 en ligne`} {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {pts.length > 0 ? (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 10 }}>
              <div ref={mapRef} style={{ width: "100%", height: 220 }} />
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 10 }}>
              Aucune position partagée pour l'instant.
            </div>
          )}

          {(["alain", "patricia"] as const).map((id) => {
            const r = rows.find((x) => x.id === id);
            const isMe = id === driverId;
            const myLastSync = gps.lastSync
              ? gps.lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : null;
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: "#334155",
                  padding: "4px 0",
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: (isMe ? gps.state === "on" : r?.is_active) ? TEAM_COLORS[id] : "#cbd5e1",
                    flexShrink: 0,
                  }}
                />
                <b style={{ minWidth: 60 }}>{TEAM_NAMES[id]}</b>
                <span style={{ color: "#64748b" }}>
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
                      background: gps.state === "on" ? "#fff" : "#0f172a",
                      color: gps.state === "on" ? "#b91c1c" : "#FDFBF7",
                      border: gps.state === "on" ? "1px solid #fecaca" : "none",
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
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
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
    const unreadIds = await listUnreadResasFn({ data: { driver_token: getDriverToken() } }).catch(() => [] as string[]);
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
      const map = await getUnreadFn({ data: { reservation_ids: ids, driver_token: getDriverToken() } });
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
    return () => {
      unsubBc();
      clearInterval(reconcile);
      supabase.removeChannel(feed);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.removeEventListener("storage", onStorage);
      if (scheduleRef.current.timer) clearTimeout(scheduleRef.current.timer);
    };
  }, [scheduleLoad, applyDelta]);

  // Canal Realtime dédié aux réservations visibles — recréé quand la liste
  // change (visibleKey). Filtre `reservation_id=in.(...)` côté serveur.
  useEffect(() => {
    if (visibleIds.length === 0) return;
    const idFilter = `reservation_id=in.(${visibleIds.join(",")})`;
    const ch = (supabase as any)
      .channel(`drv-courses-${visibleIds.length}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations", filter: `id=in.(${visibleIds.join(",")})` },
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
  }, [visibleKey, scheduleLoad, applyDelta]);

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
  }, [expanded, resa]);

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
        data: { token: getDriverToken(), reservation_id: resa.id, patch: updates, not_status: "accepted" },
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
    if (!confirm("Marquer cette course comme terminée ?")) return;
    const actionKey = `${resa.id}:completed`;
    if (!claimAction(actionKey)) return;
    setCompleting(true);
    try {
      const cRes = await driverUpdateReservation({
        data: {
          token: getDriverToken(),
          reservation_id: resa.id,
          patch: { status: "completed" },
          not_status: "completed",
        },
      });
      if (!cRes.changed) {
        toast("Action déjà prise en compte");
        onRefresh();
        return;
      }
      broadcastSuiviUpdate(resa.id, "completed");
      try {
        await notifyStatus({ data: { reservation_id: resa.id, status: "completed" } });
      } catch (pushErr) {
        console.warn("[driver] client completed push failed", pushErr);
      }
      toast.success("🏁 Course terminée");
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

  // ── Supprimer la course ──
  const [deleting, setDeleting] = useState(false);
  const handleDeleteResa = async () => {
    if (!confirm("Supprimer définitivement cette course ? Action irréversible.")) return;
    setDeleting(true);
    try {
      await driverDeleteReservation({ data: { token: getDriverToken(), reservation_id: resa.id } });
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
                      style={{ ...qb, background: "#FDFBF7", border: "2px solid #fecaca", color: "#b91c1c" }}
                    >
                      ✖ Refuser
                    </button>
                  </>
                )}
                {resa.status === "accepted" && (
                  <button
                    onClick={() => handleProgressStatus("en_route", "🚖 Statut : chauffeur en route vers le client")}
                    disabled={progressing}
                    style={{ ...qb, background: "#eff6ff", border: "2px solid #2563eb", color: "#1d4ed8" }}
                  >
                    {progressing ? "…" : "🚕 Votre taxi arrive"}
                  </button>
                )}
                {(resa.status === "accepted" || resa.status === "en_route") && (
                  <button
                    onClick={() => handleProgressStatus("arrived", "📍 Statut : arrivé devant chez le client")}
                    disabled={progressing}
                    style={{ ...qb, background: "#f5f3ff", border: "2px solid #7c3aed", color: "#6d28d9" }}
                  >
                    {progressing ? "…" : "📍 Votre taxi est arrivé"}
                  </button>
                )}
                {(resa.status === "accepted" || resa.status === "en_route" || resa.status === "arrived") && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    style={{ ...qb, background: "#f0fdf4", border: "2px solid #16a34a", color: "#15803d" }}
                  >
                    {completing ? "…" : "✓ Terminée"}
                  </button>
                )}
              </div>
            );
          })()}

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
                <span style={{ color: routes[selectedRoute].tarifLabel.includes("nuit") ? "#1d4ed8" : "#15803d" }}>
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
                    onClick={async () => {
                      setSelectedRoute(i);
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
                        toast.success(`✓ ${r.distanceKm} km · ${r.prix_estime.toFixed(2)} €`);
                        onRefresh();
                      } catch (e: any) {
                        toast.error("Erreur mise à jour itinéraire : " + (e.message ?? e));
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
                      <span style={{ color: r.tarifLabel === "Tarif jour" ? "#15803d" : "#1d4ed8" }}>
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
                          style={{ ...contactBtn, background: "#eff6ff", borderColor: "#bfdbfe", color: "#0369a1" }}
                        >
                          📞 Appeler
                        </a>
                        <a
                          href={`sms:${phone}?body=${encodeURIComponent(body)}`}
                          style={{ ...contactBtn, background: "#faf5ff", borderColor: "#e9d5ff", color: "#7e22ce" }}
                        >
                          💬 SMS
                        </a>
                        <a
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "33")}?text=${encodeURIComponent(body)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...contactBtn, background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}
                        >
                          🟢 WhatsApp
                        </a>
                      </>
                    )}
                    {mail && (
                      <a
                        href={`mailto:${mail}?subject=${encodeURIComponent("Votre course Access Prestige Taxi")}&body=${encodeURIComponent(mailBody)}`}
                        style={{ ...contactBtn, background: "#FDFBF7beb", borderColor: "#fde68a", color: "#92400e" }}
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res: any = await driverListReservations({ data: { token: getDriverToken(), scope: "planning" } });
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
                {r.prix_estime ? `${r.prix_estime.toFixed(2)} €` : ""}
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
            <div style={{ textAlign: "center", marginTop: 20, padding: "16px 0", borderTop: "1px solid #f1f5f9" }}>
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

// ── Onglet Clients ──────────────────────────────────────────────────────────
function ClientsTab() {
  const [clients, setClients] = useState<ClientAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const res: any = await driverListReservations({ data: { token: getDriverToken(), scope: "clients" } });
    const data: any[] = res?.rows ?? [];
    const clientsRows: any[] = res?.clients ?? [];

    const normalize = (p: string) => p.replace(/[^0-9]/g, "").replace(/^0/, "33");
    const idByPhone = new Map<string, string>();
    for (const c of (clientsRows ?? []) as any[]) {
      if (c.phone) idByPhone.set(normalize(c.phone), c.id);
    }

    const rows: any[] = data ?? [];
    const byPhone = new Map<string, ClientAgg>();
    for (const r of rows) {
      const phone = r.client_phone;
      if (!phone) continue;
      const existing = byPhone.get(phone);
      const isCompleted = ["terminee", "completed"].includes(r.status);
      if (!existing) {
        byPhone.set(phone, {
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
      await driverDeleteClient({ data: { token: getDriverToken(), phone: c.phone, client_id: c.id ?? null } });
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
    dernierEvents: { reservation_id: string; client_name: string | null; created_at: string; source: string | null }[];
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const since30j = new Date();
      since30j.setDate(since30j.getDate() - 30);

      const { events, totalCourses } = await trackingAnalyticsFn({
        data: { token: getDriverToken() ?? "", days: 30 },
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{data.totalOuvertures}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Ouvertures</div>
                </div>
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>{data.tauxOuverture}%</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Taux suivi</div>
                </div>
                <div style={{ background: "#eff6ff", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
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
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56, marginBottom: 4 }}>
                {data.parJour.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
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
                            style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, overflow: "hidden", height: 8 }}
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
                            style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", width: 32, textAlign: "right" }}
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
    const CUTOFF_MS = 90_000;

    const fetchCount = async () => {
      if (scope === "site") {
        const cutoff = new Date(Date.now() - CUTOFF_MS).toISOString();
        await (supabase as any).from("active_visitors").delete().lt("last_seen", cutoff);
      }
      try {
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
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 4 }}
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
        <div style={{ border: "2px solid #0b1224", borderRadius: 14, padding: 16, background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
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
                  <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    {c.l}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${d.acceptanceRate}%`, height: "100%", background: "#16a34a" }} />
            </div>
          </div>
        ))}

      <p className="drv-section">7 derniers jours</p>
      <div className="drv-card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 6 }}>
          {data.byDay.map((d: any) => (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
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
      const res = await listEvents({ data: { token: getDriverToken(), limit: 120, driver: filter } });
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
      const res = await fetchFailures({ data: { pin: getDriverToken(), only_price_update: false, limit: 30 } });
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
                <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontWeight: 600 }}>
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
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
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
            {DRIVER_LABELS[driver] ?? "Chauffeur inconnu"} — {list.length} appareil{list.length > 1 ? "s" : ""}
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
