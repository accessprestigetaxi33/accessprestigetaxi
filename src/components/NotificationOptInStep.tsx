import { useEffect, useState } from "react";
import { Bell, BellRing, Check, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useI18n } from "@/i18n/I18nProvider";

const COPY = {
  fr: {
    step: "Étape guidée",
    title: "Activer les notifications maintenant",
    desc: "Une seule étape : touchez le bouton ci-dessous puis « Autoriser » quand votre téléphone le demande. Vous serez prévenu de la confirmation de votre course, du départ du chauffeur, de son arrivée, des messages et de vos reçus.",
    cta: "Autoriser les notifications",
    working: "Activation…",
    granted: "Notifications activées sur cet appareil",
    denied:
      "Notifications refusées. Ouvrez Réglages › Notifications › Access Prestige Taxi et autorisez-les, puis revenez ici.",
    unsupported: "Cet appareil ou ce navigateur ne prend pas en charge les notifications web.",
    iosTitle: "iPhone / iPad : installez d'abord l'application",
    iosDesc:
      "Safari → Partager → « Sur l'écran d'accueil ». Rouvrez ensuite le site depuis l'icône, puis revenez toucher ce bouton.",
    error: "Impossible d'activer les notifications pour le moment.",
    test: "Vous pouvez désactiver les notifications à tout moment dans les réglages de votre téléphone.",
  },
  en: {
    step: "Guided step",
    title: "Turn notifications on now",
    desc: "One single step: tap the button below, then tap “Allow” when your phone asks. You will be notified when your ride is confirmed, when the driver leaves, when they arrive, and for messages and receipts.",
    cta: "Allow notifications",
    working: "Enabling…",
    granted: "Notifications are enabled on this device",
    denied:
      "Notifications were denied. Open Settings › Notifications › Access Prestige Taxi and allow them, then come back here.",
    unsupported: "This device or browser does not support web notifications.",
    iosTitle: "iPhone / iPad: install the app first",
    iosDesc:
      "Safari → Share → “Add to Home Screen”. Then reopen the site from the icon and come back to tap this button.",
    error: "Notifications could not be enabled right now.",
    test: "You can turn notifications off at any time in your phone settings.",
  },
} as const;

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIPad = /iPad/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  return /iPhone|iPod/.test(ua) || isIPad;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Étape guidée d'autorisation des notifications (section « Application »). */
export function NotificationOptInStep() {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const { status, subscribe } = usePushNotifications();
  const [busy, setBusy] = useState(false);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setIos(detectIOS());
    setStandalone(isStandalone());
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const iosNeedsInstall = ios && !standalone;
  const granted = status === "granted" || permission === "granted";
  const denied = status === "denied" || permission === "denied";
  const unsupported = status === "unsupported" || permission === "unsupported";

  async function enable() {
    if (iosNeedsInstall) {
      toast.error(c.iosDesc);
      return;
    }
    setBusy(true);
    try {
      const ok = await subscribe("client");
      setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
      if (ok) toast.success(c.granted);
      else toast.error(Notification?.permission === "denied" ? c.denied : c.error);
    } catch {
      toast.error(c.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{c.step}</p>
      <h3 className="mt-2 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <BellRing className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        {c.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>

      {iosNeedsInstall && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-background p-4">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">{c.iosTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.iosDesc}</p>
          </div>
        </div>
      )}

      {granted ? (
        <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary/15 px-4 py-3 text-sm font-semibold text-foreground">
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          {c.granted}
        </p>
      ) : unsupported ? (
        <p className="mt-5 text-sm text-muted-foreground">{c.unsupported}</p>
      ) : (
        <>
          <button
            type="button"
            onClick={enable}
            disabled={busy || iosNeedsInstall}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            {busy ? c.working : c.cta}
          </button>
          {denied && <p className="mt-3 text-sm text-destructive">{c.denied}</p>}
        </>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{c.test}</p>
    </article>
  );
}
