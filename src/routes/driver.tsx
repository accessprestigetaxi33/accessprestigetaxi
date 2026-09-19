import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useSearch, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowLeftRight, CalendarClock, MapPin, Phone, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { openDriverSession } from "@/lib/driver-auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { driverShellCss } from "@/lib/driver-shell-css";
import { MessagesTab, PlanningTab } from "@/components/driver/tabs";
import {
  driverThreads,
  driverGpsState,
  driverGpsStop,
  driverGpsPush,
  driverTeamChat,
  driverTeamChatSend,
} from "@/lib/driver-extra.functions";
import { TeamMap } from "@/components/driver/TeamMap";
import aptLogoAsset from "@/assets/apt-logo-lockup.webp.asset.json";
import { ogImageUrl, ogPageUrl } from "@/lib/og";
import ogDriverFr from "@/assets/apt-og-driver-fr.jpg.asset.json";
import ogDriverEn from "@/assets/apt-og-driver-en.jpg.asset.json";
import { useLiveGps } from "@/hooks/useLiveGps";
import { useAutoStatus } from "@/hooks/useAutoStatus";
import { getRouteAlternatives, type RouteAlternative } from "@/lib/osrm";
import { detaillerPrix } from "@/lib/tarif";
import {
  driverAcceptRide,
  driverUpdateRideRoute,
  driverClaimRide,
  driverLogin,
  driverLogout,
  driverRides,
  driverDeleteRide,
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
  profileName,
  fetchDriverProfiles,
  cachedDriverProfiles,
  type DriverProfile,
  type DriverProfileEntry,
} from "@/lib/driverProfile";

const STORAGE_KEY = "apt_driver_token";
const APT_LOGO = aptLogoAsset.url;

// Visuels de partage localisés (page privée : noindex, mais le lien est partagé
// par SMS/WhatsApp aux chauffeurs).
const DRIVER_SOCIAL_FR = {
  title: "Espace Chauffeur — Access Prestige Taxi",
  description: "Application privée Access Prestige Taxi : courses, GPS, messagerie et notifications.",
  image: ogImageUrl(ogDriverFr.url),
  alt: "Espace Chauffeur Access Prestige Taxi",
  url: ogPageUrl("/driver", "fr"),
};
const DRIVER_SOCIAL_EN = {
  title: "Driver App — Access Prestige Taxi",
  description: "Private Access Prestige Taxi app: rides, GPS, messaging and notifications.",
  image: ogImageUrl(ogDriverEn.url),
  alt: "Access Prestige Taxi Driver App",
  url: ogPageUrl("/driver", "en"),
};

const APT_SHELL_EXTRA = `
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
  .drv-root .drv-header {
    padding-top:calc(10px + env(safe-area-inset-top,0px)) !important;
    padding-left:calc(env(safe-area-inset-left,0px)) !important;
    padding-right:calc(env(safe-area-inset-right,0px)) !important;
    flex-wrap:wrap !important; row-gap:8px;
  }
  .drv-root .drv-header-back { display:inline-flex !important; }
  .drv-root .drv-header-title { display:flex !important; }
  @media (max-width:460px) { .drv-root .drv-header-title { display:none !important; } }
  .drv-btns button { flex:1 1 140px; border-radius:10px; padding:11px 14px; font-size:12px; font-weight:800; cursor:pointer; }
  .drv-quick-notif { width:100%; display:flex; align-items:center; justify-content:center; gap:7px; border-radius:10px; padding:11px 14px; font-size:12px; font-weight:800; cursor:pointer; }
  .drv-quick-notif svg { width:15px; height:15px; }
  .drv-dash-list { display:grid; gap:12px; margin-top:20px; }
  .drv-dash-row {
    width:100%; display:flex; align-items:center; gap:14px; text-align:left; cursor:pointer;
    border:1px solid rgba(246,240,229,.12); border-radius:16px; background:rgba(255,255,255,.03);
    padding:14px 16px; min-height:64px; color:inherit;
  }
  .drv-dash-row:active { background:rgba(255,255,255,.06); }
  .drv-dash-ico {
    flex:0 0 40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    color:#0a1118;
  }
  .drv-dash-ico svg { width:18px; height:18px; }
  .drv-dash-txt { min-width:0; flex:1; }
  .drv-dash-txt strong { display:block; font-size:14px; font-weight:700; }
  .drv-dash-txt span { display:block; font-size:12px; color:rgba(246,240,229,.6); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .drv-dash-plus { font-size:20px; color:rgba(246,240,229,.45); }
  .drv-dash-badge {
    min-width:20px; height:20px; border-radius:10px; background:#e11d48; color:#fff;
    font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; padding:0 6px;
  }
  .drv-dash-map { margin-top:14px; border-radius:16px; overflow:hidden; border:1px solid rgba(246,240,229,.12); }
  .drv-real-box { margin-top:16px; border:1px solid rgba(224,184,102,.35); border-radius:14px; padding:14px; background:rgba(224,184,102,.06); }
  .drv-real-title { font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#c99b4a; }
  .drv-real-grid { margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .drv-real-grid label { display:flex; flex-direction:column; gap:6px; font-size:12px; color:rgba(246,240,229,.7); }
  .drv-real-grid input {
    border-radius:10px; border:1px solid rgba(246,240,229,.2); background:rgba(0,0,0,.25);
    padding:10px 12px; font-size:16px; color:inherit; min-height:44px;
  }
  .drv-real-hint { margin-top:8px; font-size:11px; color:rgba(246,240,229,.55); }
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
    lang: search["lang"] === "en" ? ("en" as const) : search["lang"] === "fr" ? ("fr" as const) : undefined,
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
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: "APT Chauffeur" },
        { name: "format-detection", content: "telephone=yes" },
      ],
      links: [{ rel: "manifest", href: "/api/manifest?role=driver", id: "app-manifest" }],
    };
  },
  component: DriverApp,
});

/** Glisser vers la gauche pour révéler la suppression . */
function SwipeRow({ children, onDelete, label }: { children: React.ReactNode; onDelete: () => void; label?: string }) {
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef(false);
  const MAX = 96;

  const onStart = (x: number, y: number) => {
    start.current = { x, y };
    locked.current = false;
  };
  const onMove = (x: number, y: number) => {
    if (!start.current) return;
    const mx = x - start.current.x;
    const my = y - start.current.y;
    if (!locked.current) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (Math.abs(my) > Math.abs(mx)) {
        start.current = null;
        return;
      }
      locked.current = true;
    }
    const base = open ? -MAX : 0;
    setDx(Math.max(-MAX, Math.min(0, base + mx)));
  };
  const onEnd = () => {
    if (!start.current) return;
    start.current = null;
    const shouldOpen = dx < -MAX / 2;
    setOpen(shouldOpen);
    setDx(shouldOpen ? -MAX : 0);
  };

  const confirm = () => {
    if (window.confirm(`Supprimer définitivement ${label ?? "cet élément"} ?`)) {
      onDelete();
    }
    setOpen(false);
    setDx(0);
  };

  return (
    <li className="drv-swipe">
      <button type="button" className="drv-swipe-action" onClick={confirm} aria-label="Supprimer">
        🗑<span>Supprimer</span>
      </button>
      <div
        className="drv-swipe-content"
        style={{
          transform: `translateX(${dx}px)`,
          transition: start.current ? "none" : "transform .22s ease",
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
    </li>
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

type Tab = "dashboard" | "rides" | "overflow" | "planning" | "messages" | "accounting";

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

// Espace chauffeur simplifié : uniquement le strict nécessaire.
const TABS: { key: Tab; label: string; short: string; icon: () => React.ReactElement }[] = [
  { key: "dashboard", label: "TABLEAU DE BORD", short: "Accueil", icon: IconGrid },
  { key: "rides", label: "COURSES", short: "Courses", icon: IconCar },
  { key: "overflow", label: "DÉBORDEMENT", short: "Débord.", icon: IconSwap },
  { key: "planning", label: "PLANNING", short: "Planning", icon: IconCalendar },
  { key: "messages", label: "MESSAGES", short: "Messages", icon: IconMessage },
  { key: "accounting", label: "COMPTABILITÉ", short: "Compta", icon: IconCalc },
];

function NotifButton({ className }: { className?: string }) {
  const { status, lastError, subscribe } = usePushNotifications({ audience: "chauffeur" });
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
        const token = await subscribe();
        if (token) toast.success("Notifications activées");
        else toast.error(lastError ?? "Activation impossible");
      }}
    >
      <IconBell />
      <span className="drv-header-notif-label">{status === "loading" ? "…" : "Activer les notifications"}</span>
    </button>
  );
}

/** Écran de connexion sans mot de passe : le chauffeur touche simplement son
 * prénom, le serveur ouvre une session pour ce profil (aucun email, aucun
 * mot de passe). Le reste du flux (jeton en localStorage, vérification via
 * driverLogin, déconnexion) est identique à Nova Taxi. */
function DriverIdentityGate({
  profiles,
  onLoggedIn,
}: {
  profiles: DriverProfileEntry[];
  onLoggedIn: (token: string) => void;
}) {
  const openSession = useServerFn(openDriverSession);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const list =
    profiles.length > 0
      ? profiles
      : [
          { slug: "alain", name: "Alain" },
          { slug: "patricia", name: "Patricia" },
        ];

  const onPick = async (slug: string) => {
    setError(null);
    setBusy(slug);
    try {
      const res: any = await openSession({ data: { driver: slug as "alain" | "patricia" } });
      if (res?.ok && res.token) onLoggedIn(res.token);
      else setError("Accès indisponible, réessayez.");
    } catch {
      setError("Accès indisponible, réessayez.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#03070d",
        color: "#f6f0e5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "24px 20px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <img src={APT_LOGO} alt="Access Prestige Taxi" style={{ width: "min(260px,70vw)", height: "auto" }} />
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Espace chauffeur</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(246,240,229,.65)" }}>
          Touchez votre prénom pour accéder à l'application.
        </p>
      </div>
      <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 340 }}>
        {list.map((p) => (
          <button
            key={p.slug}
            type="button"
            disabled={busy !== null}
            onClick={() => onPick(p.slug)}
            style={{
              minHeight: 54,
              borderRadius: 14,
              border: 0,
              background: "linear-gradient(180deg,#e0b866,#c99b4a)",
              color: "#0a1118",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              opacity: busy !== null && busy !== p.slug ? 0.5 : 1,
            }}
          >
            {busy === p.slug ? "Connexion…" : p.name}
          </button>
        ))}
      </div>
      {error ? <p style={{ color: "#fca5a5", fontSize: 13, margin: 0 }}>{error}</p> : null}
      <Link to="/" style={{ color: "#e0b866", fontSize: 13, textDecoration: "none" }}>
        ← Retour au site
      </Link>
    </div>
  );
}

function DriverApp() {
  const search = useSearch({ from: "/driver" });
  const [token, setToken] = useState<string | null>(null);
  // Liste des profils (nombre illimité) : cache local pour un affichage
  // instantané, mise à jour dès que le serveur répond.
  const [profiles, setProfiles] = useState<DriverProfileEntry[]>(() => cachedDriverProfiles());
  const [profile, setProfileState] = useState<DriverProfile | undefined>(
    () => getProfile() ?? cachedDriverProfiles()[0]?.slug,
  );
  const [tab, setTab] = useState<Tab>("dashboard");
  const qc = useQueryClient();

  // Accès uniquement par jeton de session obtenu après connexion : plus aucun
  // accès par lien magique (?t=), le paramètre éventuel est ignoré et effacé.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setToken(stored);
    // Simple par défaut : le premier profil tant que rien n'est enregistré,
    // pas d'écran de choix imposé — le nom se change directement dans l'en-tête.
    setProfileState(getProfile() ?? cachedDriverProfiles()[0]?.slug);
    if (search.t) window.history.replaceState(null, "", "/driver");
  }, [search.t]);

  // Notification de message client : ouvre directement l'onglet Messages.
  useEffect(() => {
    if (search.tab === "messages") setTab("messages");
  }, [search.tab]);

  // Liste des profils toujours à jour : ajouter/retirer un chauffeur en base
  // se répercute sans changement de code ni redéploiement.
  useEffect(() => {
    let cancelled = false;
    void fetchDriverProfiles().then((list) => {
      if (cancelled || list.length === 0) return;
      setProfiles(list);
      setProfileState((cur) => cur ?? list[0]?.slug);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const chooseProfile = (p: DriverProfile) => {
    setProfile(p);
    setProfileState(p);
    qc.invalidateQueries();
  };

  const session = useQuery({
    queryKey: ["driver-login", token],
    enabled: !!token,
    retry: false,
    queryFn: () => driverLogin({ data: { as: getProfile(), token: token! } }),
  });

  // Jeton devenu invalide (session révoquée) : on l'oublie et on revient à
  // l'écran de connexion au lieu de rejouer des appels refusés.
  useEffect(() => {
    if (session.isError && token) {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [session.isError, token]);

  // Compteur global de messages clients non lus (badge sur l'onglet Messages).
  const threadsQuery = useQuery({
    queryKey: ["driver-threads", token],
    enabled: !!token && !session.isError,
    queryFn: () => driverThreads({ data: { as: getProfile(), token: token! } }),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
  const unreadTotal = (threadsQuery.data?.threads ?? []).reduce((s, t) => s + (t.unread || 0), 0);

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
      void qc.invalidateQueries();
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
    const titleTag = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (titleTag) titleTag.setAttribute("content", "APT Chauffeur");
    return () => {
      const el = document.querySelector('link[rel="manifest"]');
      if (el) el.setAttribute("href", "/api/manifest");
      const t = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (t) t.setAttribute("content", "Access Taxi");
    };
  }, []);

  const logout = () => {
    const current = token;
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    qc.clear();
    // Le jeton est aussi détruit côté serveur : il devient inutilisable.
    if (current) void driverLogout({ data: { as: getProfile(), token: current } }).catch(() => {});
  };

  // Jeton invalide ou expiré : on nettoie et on redemande la connexion.
  if (session.isError && typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);

  if (!token || session.isError) {
    return (
      <DriverIdentityGate
        profiles={profiles}
        onLoggedIn={(t) => {
          localStorage.setItem(STORAGE_KEY, t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <>
      <style>{driverShellCss}</style>
      <style>{APT_SHELL_EXTRA}</style>
      <div className="drv-root">
        <header className="drv-header">
          <div className="drv-brand-mark" aria-label="Access Prestige Taxi">
            <img src={APT_LOGO} alt="Access Prestige Taxi" />
          </div>
          <div className="drv-header-title">
            <strong>Bonjour {profiles.map((p) => p.name).join(" et ") || "l'équipe"}</strong>
            <span>Espace chauffeur · {profileName(profile, profiles)}</span>
          </div>
          <select
            className="drv-live-pill drv-header-live"
            value={profile}
            onChange={(e) => chooseProfile(e.target.value)}
            title="Changer de chauffeur"
            style={{ cursor: "pointer" }}
          >
            {profiles.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
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
          <NotifButton className="drv-header-notif" />
          <Link className="drv-header-back" to="/" aria-label="Retour au site">
            <IconHome />
            <span className="drv-header-back-label">Retour au site</span>
          </Link>
          <button type="button" className="drv-header-bell" aria-label="Quitter" onClick={logout}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 16, height: 16 }}
            >
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          </button>
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
      </div>
    </>
  );
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
  });
  // Acceptation : attribution + statut confirmé + envoi de la position.
  // Le GPS n'est plus auto-démarré ici : le chauffeur est renvoyé sur la page
  // de suivi de la course, où un bouton dédié (visible de lui seul, via le
  // paramètre ?token) lui permet de l'activer manuellement.
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
    onSuccess: (_res, variables) => {
      toast.success("Course acceptée");
      invalidate();
      if (variables.trackingId) {
        navigate({ to: "/suivi/$ref", params: { ref: variables.trackingId }, search: { token } });
      }
    },
    onError: () => toast.error("Impossible d'accepter la course"),
  });

  // Modification de l'itinéraire pendant la course (notifie le client).
  const updateRoute = useMutation({
    mutationFn: (v: { id: string; route: RouteAlternative }) =>
      driverUpdateRideRoute({
        data: {
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

  // Progression automatique des statuts d'après la position réelle du chauffeur.
  const advance = useCallback(
    (id: string, status: "in_progress" | "arrived" | "completed") => {
      setStatus.mutate({ id, status });
      toast.info(`Statut mis à jour : ${STATUS_META[status]?.label ?? status}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useAutoStatus(rides, me, gps.coords, advance);

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
                mine={r.driver_slug === me}
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

/** Ordre de progression du statut d'une course, comme dans la référence. */
const STATUS_FLOW: RideStatus[] = ["confirmed", "in_progress", "arrived", "completed"];

function nextStatus(status: string): RideStatus | null {
  const idx = STATUS_FLOW.indexOf(status as RideStatus);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1] ?? null;
}

function waLink(phone: string) {
  const digits = phone.replace(/[^0-9+]/g, "").replace(/^0/, "+33");
  return `https://wa.me/${digits.replace("+", "")}`;
}

/** Navigation externe : OpenStreetMap (même socle cartographique que le site). */
function navLink(address: string | null) {
  if (!address) return null;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
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
}) {
  const when = useMemo(() => new Date(ride.pickup_datetime).toLocaleString("fr-FR"), [ride.pickup_datetime]);
  const assigned = drivers.find((d) => d.slug === ride.driver_slug) ?? null;
  const other = drivers.find((d) => d.slug !== ride.driver_slug) ?? null;
  // Une course peut être passée à l'autre chauffeur seulement une fois prise.
  const canTransfer = assigned && other && !["completed", "cancelled"].includes(ride.status);
  const destination = ride.arrivee ?? ride.destination;
  const step = nextStatus(ride.status);
  const stepLabel = step ? (STATUS_META[step]?.label ?? step) : null;
  const done = ["completed", "cancelled"].includes(ride.status);

  // Itinéraires alternatifs OSRM / OpenStreetMap (3 max) pour la course.
  const [realKm, setRealKm] = useState("");
  const [realPrice, setRealPrice] = useState("");
  const [routes, setRoutes] = useState<RouteAlternative[] | null>(null);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<number>(0);
  const [actionsOpen, setActionsOpen] = useState(false);

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

  useEffect(() => {
    if (done || !ride.depart || !destination) return;
    let cancelled = false;
    setRoutesError(null);
    getRouteAlternatives(ride.depart, destination)
      .then((r) => {
        if (cancelled) return;
        setRoutes(r);
        setChosen(0);
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
        {navLink(destination) ? (
          <Button size="sm" variant="outline" asChild>
            <a href={navLink(destination)!} target="_blank" rel="noreferrer">
              🧭 Naviguer
            </a>
          </Button>
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
        </div>
      ) : null}

      {["confirmed", "in_progress", "arrived"].includes(ride.status) ? (
        <div className="drv-real-box">
          <p className="drv-real-title">Statut automatique</p>
          <p className="drv-real-hint">
            {ride.status === "confirmed"
              ? "Passage en « En route » dès que vous roulez vers le client."
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
        {!done && ["confirmed", "in_progress", "arrived"].includes(ride.status) ? (
          <Button
            size="sm"
            variant="outline"
            disabled={updatingRoute || !routes || routes.length === 0}
            onClick={() => {
              const r = routes?.find((x) => x.id === chosen);
              if (r) onUpdateRoute(r);
            }}
            title="Changer l'itinéraire pendant la course et prévenir le client"
          >
            {updatingRoute ? "Envoi…" : "Modifier l'itinéraire"}
          </Button>
        ) : null}
        {!assigned || mine || ride.status === "en_debordement" ? (
          <Button size="sm" variant={mine ? "outline" : "gold"} onClick={() => onClaim(!mine)}>
            {mine ? "Libérer" : "Prendre"}
          </Button>
        ) : null}
        {mine && !done && ride.status !== "en_debordement" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={overflowing}
            onClick={() => onOverflow()}
            title="Proposer la course à l'autre chauffeur"
          >
            Je ne peux pas assurer cette course
          </Button>
        ) : null}
        {canReclaim ? (
          <Button size="sm" variant="gold" disabled={overflowing} onClick={() => onReclaim()}>
            Reprendre la course
          </Button>
        ) : null}
        {!["completed", "cancelled"].includes(ride.status) ? (
          <Button size="sm" variant="destructive" onClick={() => onStatus("cancelled")}>
            Annuler
          </Button>
        ) : null}
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
        <SettingsForm
          token={token}
          urssafRate={data?.urssafRate ?? 21.2}
          driverShareRate={data?.driverShareRate ?? 0}
          onSaved={invalidate}
        />
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
/** Délai laissé au chauffeur pour accepter avant passage automatique en débordement. */
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
  const navigate = useNavigate();
  const [refused, setRefused] = useState<string[]>([]);

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
      if (r.status === "en_debordement") return driverTakeOverflowRide({ data: { as: getProfile(), token, id: r.id } });
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
    onSuccess: (_res, variables) => {
      toast.success("Course acceptée");
      qc.invalidateQueries({ queryKey: ["driver-rides", token] });
      qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
      if (variables.tracking_id) {
        navigate({ to: "/suivi/$ref", params: { ref: variables.tracking_id }, search: { token } });
      } else {
        onOpenRides();
      }
    },
    onError: () => toast.error("Course déjà prise"),
  });

  // Refus : la course part en débordement pour l'autre chauffeur.
  const spill = useMutation({
    mutationFn: (id: string) => driverOverflowRide({ data: { as: getProfile(), token, id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["driver-rides", token] });
      qc.invalidateQueries({ queryKey: ["driver-overflow", token] });
    },
  });

  const rideId = ride?.id ?? null;
  const rideStatus = ride?.status ?? null;

  const decline = useCallback(
    (id: string, status: string | null, auto: boolean) => {
      setRefused((v) => (v.includes(id) ? v : [...v, id]));
      if (status !== "en_debordement") spill.mutate(id);
      toast.message(auto ? "Temps écoulé — course proposée à l'équipe" : "Course refusée");
    },
    [spill],
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
    const serverBase = serverRide.offered_at ?? serverRide.assigned_at;
    if (serverBase) return new Date(serverBase).getTime() + ACCEPT_DEADLINE_S * 1000;
    if (!firstSeenRef.current.has(ride.id)) firstSeenRef.current.set(ride.id, Date.now());
    return (firstSeenRef.current.get(ride.id) ?? Date.now()) + ACCEPT_DEADLINE_S * 1000;
  }, [ride]);

  const [left, setLeft] = useState(ACCEPT_DEADLINE_S);

  useEffect(() => {
    if (!rideId || !deadline) return;
    const tick = () => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      setLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        window.clearInterval(timer);
        decline(rideId, rideStatus, true);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [rideId, rideStatus, deadline, decline]);

  // Tap sur la notification : ouvre le popup sur la bonne course, mais ne valide
  // plus rien tout seul pour "accept" — le chauffeur doit choisir un itinéraire
  // et taper "Accepter" lui-même. Seul "refuse" reste automatique.
  const handledAction = useRef<string | null>(null);
  useEffect(() => {
    if (!ride || !action || !focusId || ride.id !== focusId) return;
    if (handledAction.current === `${focusId}:${action}`) return;
    handledAction.current = `${focusId}:${action}`;
    if (action === "refuse") decline(ride.id, ride.status, false);
    if (typeof window !== "undefined") window.history.replaceState(null, "", "/driver");
  }, [ride, action, focusId, decline]);

  if (!ride) return null;

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

        <div className="drv-popup-actions">
          <button type="button" className="drv-popup-refuse" onClick={() => decline(ride.id, ride.status, false)}>
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
function DashboardTab({ token, unread, onGo }: { token: string; unread: number; onGo: (t: Tab) => void }) {
  const qc = useQueryClient();
  const [mapOpen, setMapOpen] = useState(false);
  const [callsOpen, setCallsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
  const names = useMemo(() => Object.fromEntries(drivers.map((d) => [d.slug, d.name])), [drivers]);

  const active = rides.find((r) => r.driver_slug === me && ["confirmed", "in_progress", "arrived"].includes(r.status));
  const nextRide = rides
    .filter((r) => r.driver_slug === me && new Date(r.pickup_datetime).getTime() >= Date.now())
    .sort((a, b) => +new Date(a.pickup_datetime) - +new Date(b.pickup_datetime))[0];
  const todayCount = rides.filter(
    (r) =>
      r.driver_slug === me &&
      new Date(r.pickup_datetime).toDateString() === new Date().toDateString() &&
      r.status !== "cancelled",
  ).length;

  const recentCalls = useMemo(
    () =>
      rides
        .filter((r) => r.driver_slug === me && r.telephone)
        .sort((a, b) => +new Date(b.pickup_datetime) - +new Date(a.pickup_datetime))
        .slice(0, 6),
    [rides, me],
  );

  const myGps = (gpsQuery.data?.rows ?? []).find((g) => g.id === me);
  const online = Boolean(myGps?.is_active);

  const setAvailability = useMutation({
    mutationFn: async (next: boolean) => {
      if (!next) return driverGpsStop({ data: { as: getProfile(), token } });
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

      <div className="drv-dash-list">
        <button type="button" className="drv-dash-row" onClick={() => onGo("rides")}>
          <span className="drv-dash-ico" style={{ background: active ? "#e11d48" : "#3f3f46" }}>
            <IconCar />
          </span>
          <span className="drv-dash-txt">
            <strong>{active ? "En course" : "Aucune course en cours"}</strong>
            <span>
              {active ? `${active.depart} → ${active.arrivee ?? active.destination}` : "Appuyez pour voir vos courses"}
            </span>
          </span>
          <span className="drv-dash-plus">›</span>
        </button>

        <button
          type="button"
          className="drv-dash-row"
          disabled={setAvailability.isPending}
          onClick={() => setAvailability.mutate(!online)}
        >
          <span className="drv-dash-ico" style={{ background: online ? "#16a34a" : "#3f3f46" }}>
            <IconMapPin />
          </span>
          <span className="drv-dash-txt">
            <strong>{online ? "Disponible · position partagée" : "Indisponible"}</strong>
            <span>Appuyez pour changer d'état</span>
          </span>
          <span className="drv-dash-plus">{setAvailability.isPending ? "…" : "＋"}</span>
        </button>

        {active || nextRide ? (
          <button type="button" className="drv-dash-row" onClick={() => onGo("rides")}>
            <span className="drv-dash-ico" style={{ background: "#e0b866" }}>
              <IconCalendar />
            </span>
            <span className="drv-dash-txt">
              <strong>{active ? "Course en cours" : "Prochaine course"}</strong>
              <span>
                {new Date((active ?? nextRide)!.pickup_datetime).toLocaleString("fr-FR")} ·{" "}
                {(active ?? nextRide)!.nom ?? "Client"}
                {(active ?? nextRide)!.prix_estime != null
                  ? ` · ${eur(Number((active ?? nextRide)!.prix_estime))}`
                  : ""}
              </span>
            </span>
            <span className="drv-dash-plus">›</span>
          </button>
        ) : null}

        <button type="button" className="drv-dash-row" onClick={() => onGo("planning")}>
          <span className="drv-dash-ico" style={{ background: "#2563eb" }}>
            <IconCalendar />
          </span>
          <span className="drv-dash-txt">
            <strong>Calendrier</strong>
            <span>{todayCount > 0 ? `${todayCount} course(s) aujourd'hui` : "Aucune course aujourd'hui"}</span>
          </span>
          <span className="drv-dash-plus">›</span>
        </button>

        <button type="button" className="drv-dash-row" onClick={() => onGo("accounting")}>
          <span className="drv-dash-ico" style={{ background: "#8b5cf6" }}>
            <IconCalc />
          </span>
          <span className="drv-dash-txt">
            <strong>Comptabilité</strong>
            <span>Voir vos courses et revenus du mois</span>
          </span>
          <span className="drv-dash-plus">›</span>
        </button>

        <button type="button" className="drv-dash-row" onClick={() => setMapOpen((v) => !v)}>
          <span className="drv-dash-ico" style={{ background: "#0ea5e9" }}>
            <IconMapPin />
          </span>
          <span className="drv-dash-txt">
            <strong>Carte équipe · OpenStreetMap</strong>
            <span>{teamRows.filter((r) => r.is_active).length} chauffeur(s) en ligne dans l'équipe</span>
          </span>
          <span className="drv-dash-plus">{mapOpen ? "−" : "＋"}</span>
        </button>

        {mapOpen ? (
          <div className="drv-dash-map">
            <TeamMap rows={teamRows} names={names} />
          </div>
        ) : null}

        <button type="button" className="drv-dash-row" onClick={() => onGo("messages")}>
          <span className="drv-dash-ico" style={{ background: "#db2777" }}>
            <IconMessage />
          </span>
          <span className="drv-dash-txt">
            <strong>Messages</strong>
            <span>{unread > 0 ? `${unread} message(s) non lus` : "Aucun nouveau message"}</span>
          </span>
          {unread > 0 ? <span className="drv-dash-badge">{unread}</span> : <span className="drv-dash-plus">›</span>}
        </button>

        <button type="button" className="drv-dash-row" onClick={() => onGo("overflow")}>
          <span className="drv-dash-ico" style={{ background: "#f59e0b" }}>
            <IconSwap />
          </span>
          <span className="drv-dash-txt">
            <strong>Courses en débordement</strong>
            <span>Reprendre une course laissée par l'autre chauffeur</span>
          </span>
          <span className="drv-dash-plus">›</span>
        </button>

        <button type="button" className="drv-dash-row" onClick={() => setCallsOpen((v) => !v)}>
          <span className="drv-dash-ico" style={{ background: "#22c55e" }}>
            <Phone size={16} />
          </span>
          <span className="drv-dash-txt">
            <strong>Appels récents</strong>
            <span>
              {recentCalls.length > 0 ? `${recentCalls.length} client(s) à rappeler` : "Aucun numéro client récent"}
            </span>
          </span>
          <span className="drv-dash-plus">{callsOpen ? "−" : "＋"}</span>
        </button>

        {callsOpen ? (
          <div className="drv-dash-map" style={{ padding: 12, display: "grid", gap: 8 }}>
            {recentCalls.length === 0 ? (
              <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
                Les numéros apparaîtront dès votre prochaine course.
              </p>
            ) : (
              recentCalls.map((r) => (
                <a
                  key={r.id}
                  href={`tel:${(r.telephone ?? "").replace(/\s/g, "")}`}
                  className="drv-dash-row"
                  style={{ textDecoration: "none" }}
                >
                  <span className="drv-dash-ico" style={{ background: "#16a34a" }}>
                    <Phone size={16} />
                  </span>
                  <span className="drv-dash-txt">
                    <strong>{r.nom ?? "Client"}</strong>
                    <span>
                      {r.telephone} · {new Date(r.pickup_datetime).toLocaleString("fr-FR")}
                    </span>
                  </span>
                  <span className="drv-dash-plus">›</span>
                </a>
              ))
            )}
          </div>
        ) : null}

        <button type="button" className="drv-dash-row" onClick={() => setChatOpen((v) => !v)}>
          <span className="drv-dash-ico" style={{ background: "#7c3aed" }}>
            <IconMessage />
          </span>
          <span className="drv-dash-txt">
            <strong>Discussion chauffeurs</strong>
            <span>Parler directement avec l'autre chauffeur</span>
          </span>
          <span className="drv-dash-plus">{chatOpen ? "−" : "＋"}</span>
        </button>

        {chatOpen ? <TeamChat token={token} names={names} me={me ?? ""} /> : null}
      </div>
    </div>
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
  const send = useMutation({
    mutationFn: (content: string) => driverTeamChatSend({ data: { as: getProfile(), token, content } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["driver-team-chat", token] });
    },
    onError: () => toast.error("Message non envoyé"),
  });

  const rows = chat.data ?? [];

  return (
    <div className="drv-dash-map" style={{ padding: 12 }}>
      <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
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
