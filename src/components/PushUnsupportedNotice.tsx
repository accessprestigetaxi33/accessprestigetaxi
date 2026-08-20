// Explique POURQUOI les notifications sont indisponibles au lieu d'afficher
// un simple « unsupported » (ou pire, de masquer complètement le bandeau).
// Les 3 causes réelles observées :
//  1. page ouverte dans un iframe (aperçu Lovable) → l'API est bloquée
//  2. iPhone/iPad hors PWA installée → Notification n'existe pas dans Safari
//  3. navigateur/webview sans Push API (Facebook, Instagram, etc.)
import { useEffect, useState } from "react";

export type PushUnsupportedReason =
  | "iframe"
  | "iphone-not-installed"
  | "ios-not-installed"
  | "in-app-browser"
  | "browser";

export function detectPushUnsupportedReason(): PushUnsupportedReason {
  if (typeof window === "undefined") return "browser";
  try {
    if (window.top !== window.self) return "iframe";
  } catch {
    return "iframe";
  }
  const ua = navigator.userAgent;
  const isIPhone = /iPhone|iPod/.test(ua);
  const isIPad = /iPad/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (/FBAN|FBAV|Instagram|Line\/|MicroMessenger/.test(ua)) return "in-app-browser";
  // iPadOS autorise les notifications dans un onglet Safari ; iOS (iPhone) ne
  // les expose QUE dans l'app ajoutée à l'écran d'accueil et ouverte depuis
  // son icône. Un lien ouvert dans Safari rouvre un onglet classique : c'est
  // la cause n°1 du « non supporté » alors que l'app est bien installée.
  if (isIPhone && !standalone) return "iphone-not-installed";
  if (isIPad && !standalone) return "ios-not-installed";
  return "browser";
}

const MESSAGES: Record<PushUnsupportedReason, { fr: string; en: string }> = {
  iframe: {
    fr: "Cette page est affichée dans un aperçu intégré : les navigateurs y interdisent les notifications. Ouvrez le site dans un vrai onglet (ou depuis l'icône installée) puis réessayez.",
    en: "This page runs inside an embedded preview, where browsers block notifications. Open the site in a real tab (or from the installed icon) and try again.",
  },
  "iphone-not-installed": {
    fr: "Sur iPhone, Safari n'autorise les notifications QUE dans l'app installée : ouvrez-la depuis son icône sur l'écran d'accueil (et non par un lien). Si l'icône manque : Safari → Partager → « Sur l'écran d'accueil ». (Sur iPad, Safari les autorise aussi dans un onglet, d'où la différence.)",
    en: "On iPhone, Safari only allows notifications inside the installed app: open it from its Home Screen icon (not from a link). If the icon is missing: Safari → Share → “Add to Home Screen”. (On iPad, Safari also allows them in a tab, hence the difference.)",
  },
  "ios-not-installed": {
    fr: "Sur iPhone/iPad, les notifications ne fonctionnent que si l'app est installée : Safari → Partager → « Sur l'écran d'accueil », puis rouvrez depuis l'icône.",
    en: "On iPhone/iPad, notifications only work once the app is installed: Safari → Share → “Add to Home Screen”, then reopen from the icon.",
  },
  "in-app-browser": {
    fr: "Vous utilisez le navigateur intégré d'une application (Facebook, Instagram…). Ouvrez le site dans Safari ou Chrome pour activer les notifications.",
    en: "You are using an in-app browser (Facebook, Instagram…). Open the site in Safari or Chrome to enable notifications.",
  },
  browser: {
    fr: "Ce navigateur ne prend pas en charge les notifications web. Utilisez Safari (iOS 16.4+ en app installée) ou Chrome à jour.",
    en: "This browser does not support web notifications. Use Safari (iOS 16.4+ as an installed app) or an up-to-date Chrome.",
  },
};

export function usePushUnsupportedMessage(lang: "fr" | "en" = "fr"): string {
  const [reason, setReason] = useState<PushUnsupportedReason>("browser");
  useEffect(() => setReason(detectPushUnsupportedReason()), []);
  return MESSAGES[reason][lang];
}

/** Bandeau d'explication à afficher quand le statut push vaut "unsupported". */
export function PushUnsupportedNotice({
  lang = "fr",
  className,
  style,
}: {
  lang?: "fr" | "en";
  className?: string;
  style?: React.CSSProperties;
}) {
  const message = usePushUnsupportedMessage(lang);
  const [tech, setTech] = useState<string>("");
  // Ligne technique : permet de voir sur l'appareil réel ce qui manque
  // (utile quand l'app est bien installée mais que le statut reste bloqué).
  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setTech(
      `Notification:${"Notification" in window ? "ok" : "absent"} · SW:${"serviceWorker" in navigator ? "ok" : "absent"} · PushManager:${"PushManager" in window ? "ok" : "absent"} · installée:${standalone ? "oui" : "non"}`,
    );
  }, []);
  return (
    <div className={className} style={style}>
      🔕 {message}
      {tech ? <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>{tech}</div> : null}
    </div>
  );
}
