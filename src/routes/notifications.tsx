import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff, BellRing, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { unsubscribePush } from "@/lib/push.functions";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Access Prestige Taxi" },
      {
        name: "description",
        content:
          "Activez ou désactivez les notifications de suivi de course Access Prestige Taxi (iPhone et Android). Repli e-mail automatique si les notifications sont refusées.",
      },
      { property: "og:title", content: "Réglages des notifications — Access Prestige Taxi" },
      {
        property: "og:description",
        content: "Gérez les alertes de réservation et de suivi en temps réel de votre chauffeur en Charente-Maritime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: NotificationsPage,
});

const COPY = {
  fr: {
    kicker: "Réglages",
    title: "Notifications",
    intro:
      "Recevez l'acceptation de votre course, l'arrivée du chauffeur et les messages en direct. Si vous refusez les notifications, la confirmation vous est envoyée par e-mail.",
    enable: "Activer les notifications",
    disable: "Désactiver sur cet appareil",
    test: "Envoyer une notification de test",
    working: "Patientez…",
    enabled: "Notifications activées sur cet appareil",
    denied: "Notifications bloquées dans les réglages du navigateur. Autorisez-les puis rechargez la page.",
    unsupported: "Cet appareil ou ce navigateur ne prend pas en charge les notifications web.",
    iosTitle: "Installation requise sur iPhone",
    iosDesc: "Safari → Partager → Sur l'écran d'accueil, puis rouvrez le site depuis l'icône.",
    fallbackTitle: "Repli e-mail",
    fallbackDesc:
      "Sans notification autorisée, la confirmation de réservation et le lien de suivi partent automatiquement par e-mail à l'adresse indiquée lors de la réservation.",
    okToast: "Notifications activées.",
    offToast: "Notifications désactivées sur cet appareil.",
    errToast: "Impossible d'activer les notifications.",
  },
  en: {
    kicker: "Settings",
    title: "Notifications",
    intro:
      "Get alerts when your ride is accepted, when the chauffeur arrives and for live messages. If you decline notifications, your confirmation is emailed instead.",
    enable: "Enable notifications",
    disable: "Disable on this device",
    test: "Send a test notification",
    working: "Please wait…",
    enabled: "Notifications enabled on this device",
    denied: "Notifications are blocked in your browser settings. Allow them, then reload this page.",
    unsupported: "This device or browser does not support web notifications.",
    iosTitle: "Installation required on iPhone",
    iosDesc: "Safari → Share → Add to Home Screen, then reopen the site from the icon.",
    fallbackTitle: "Email fallback",
    fallbackDesc:
      "Without push permission, your booking confirmation and tracking link are sent automatically by email to the address given at booking.",
    okToast: "Notifications enabled.",
    offToast: "Notifications disabled on this device.",
    errToast: "Could not enable notifications.",
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
  return window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
}

function NotificationsPage() {
  const { lang } = useI18n();
  const c = COPY[lang === "en" ? "en" : "fr"];
  const { status, subscribe, testNotification } = usePushNotifications();
  const unsubscribe = useServerFn(unsubscribePush);
  const [busy, setBusy] = useState(false);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    setIos(detectIOS());
    setStandalone(isStandalone());
  }, []);

  const iosNeedsInstall = ios && !standalone;
  const isGranted = status === "granted";
  const isDenied = status === "denied";
  const isUnsupported = status === "unsupported";

  async function enable() {
    setBusy(true);
    try {
      const ok = await subscribe("client", null, null);
      toast[ok ? "success" : "error"](ok ? c.okToast : c.errToast);
    } catch {
      toast.error(c.errToast);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("fcm_token") : null;
      if (token) await unsubscribe({ data: { audience: "client", fcm_token: token } });
      window.localStorage.removeItem("fcm_token");
      window.localStorage.removeItem("fcm_token_last_refresh");
      toast.success(c.offToast);
    } catch {
      toast.error(c.errToast);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{c.kicker}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.intro}</p>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12">
            {isGranted ? (
              <BellRing className="h-5 w-5 text-primary" />
            ) : isDenied || isUnsupported ? (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Bell className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {iosNeedsInstall ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs">
                <Smartphone className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">{c.iosTitle}</div>
                  <div className="mt-0.5 opacity-80">{c.iosDesc}</div>
                </div>
              </div>
            ) : isUnsupported ? (
              <p className="text-sm text-muted-foreground">{c.unsupported}</p>
            ) : isDenied ? (
              <p className="text-sm text-red-500">{c.denied}</p>
            ) : (
              <>
                {isGranted && <p className="text-sm font-semibold text-emerald-600">{c.enabled}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {!isGranted && (
                    <button
                      type="button"
                      onClick={() => void enable()}
                      disabled={busy}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                      {busy ? c.working : c.enable}
                    </button>
                  )}
                  {isGranted && (
                    <>
                      <button
                        type="button"
                        onClick={() => void testNotification()}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold"
                      >
                        <BellRing className="h-4 w-4" /> {c.test}
                      </button>
                      <button
                        type="button"
                        onClick={() => void disable()}
                        disabled={busy}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold disabled:opacity-60"
                      >
                        <BellOff className="h-4 w-4" /> {c.disable}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-muted/30 p-5">
        <h2 className="text-sm font-bold">{c.fallbackTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.fallbackDesc}</p>
      </section>
    </main>
  );
}
