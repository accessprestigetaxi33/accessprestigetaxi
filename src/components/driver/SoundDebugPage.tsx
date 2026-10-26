// Page de diagnostic du son des notifications (espace chauffeur).
import { useState } from "react";
import { PushDebug } from "@/components/PushDebug";
import { playForegroundNotificationSound } from "@/lib/firebase";

type Log = { ok: boolean; text: string };

function platform(): string {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  return "autre";
}

export function SoundDebugPage({ onClose, embedded = false }: { onClose: () => void; embedded?: boolean }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const add = (ok: boolean, text: string) => setLogs((l) => [{ ok, text }, ...l].slice(0, 12));
  const os = platform();

  async function testAppSound() {
    try {
      await playForegroundNotificationSound();
      add(true, "Bip joué par l'application. Si vous n'avez rien entendu : volume média du téléphone à zéro.");
    } catch (e) {
      add(false, `Impossible de jouer le son : ${String(e)}`);
    }
  }

  async function testSystemNotif(delay: number) {
    try {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        add(false, "Notifications non autorisées sur cet appareil.");
        return;
      }
      const reg =
        (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ??
        (await navigator.serviceWorker.ready);
      if (!reg) {
        add(false, "Service de notifications absent — rechargez la page.");
        return;
      }
      if (delay) add(true, `Notification dans ${delay / 1000} s — fermez ou réduisez l'application maintenant.`);
      window.setTimeout(() => {
        void reg
          .showNotification("Test son Access Taxi", {
            body: "Avez-vous entendu un son ?",
            icon: "/favicon.png",
            badge: "/favicon.png",
            tag: `sound-test:${Date.now()}`,
            silent: false,
            requireInteraction: false,
            data: { url: "/driver" },
            ...({ renotify: true, vibrate: [200, 100, 200] } as object),
          })
          .then(() =>
            add(true, "Notification envoyée par le téléphone. Pas de son = réglage du téléphone (voir ci-dessous)."),
          )
          .catch((e) => add(false, `Échec : ${String(e)}`));
      }, delay);
    } catch (e) {
      add(false, `Échec : ${String(e)}`);
    }
  }

  return (
    <div
      className={embedded ? "text-foreground" : "fixed inset-0 z-50 overflow-y-auto bg-background p-4 text-foreground"}
    >
      <div className="mx-auto grid max-w-xl gap-4">
        {embedded ? null : (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Diagnostic son des notifications</h2>
            <button type="button" onClick={onClose} className="btn-pill btn-pill-outline">
              Retour
            </button>
          </div>
        )}

        <section className="surface-card grid gap-2 p-4">
          <p className="text-sm font-medium">1. Son de l'application</p>
          <button type="button" onClick={() => void testAppSound()} className="btn-pill btn-pill-gold">
            Jouer le bip
          </button>
          <p className="text-sm font-medium mt-3">2. Notification du téléphone</p>
          <button type="button" onClick={() => void testSystemNotif(0)} className="btn-pill btn-pill-gold">
            Notification immédiate
          </button>
          <button type="button" onClick={() => void testSystemNotif(8000)} className="btn-pill btn-pill-outline">
            Notification dans 8 s (app fermée)
          </button>
        </section>

        {logs.length ? (
          <ul className="surface-card grid gap-1 p-4 text-xs">
            {logs.map((l, i) => (
              <li key={i}>
                {l.ok ? "✅" : "❌"} {l.text}
              </li>
            ))}
          </ul>
        ) : null}

        <section className="surface-card grid gap-2 p-4 text-sm">
          <p className="font-medium">Si la notification s'affiche sans son</p>
          {os !== "iphone" ? (
            <p className="text-xs text-muted-foreground">
              <b>Android :</b> Paramètres → Applications → Chrome (ou Access Taxi) → Notifications → catégorie du site
              accessprestigetaxi.fr → choisir « Alerte / Émettre un son » (pas « Silencieux »). Vérifiez aussi le volume «
              Notifications » et que « Ne pas déranger » est coupé.
            </p>
          ) : null}
          {os !== "android" ? (
            <p className="text-xs text-muted-foreground">
              <b>iPhone :</b> Réglages → Notifications → Access Taxi → « Sons » activé. Le bouton Silence sur le côté et
              les modes Concentration coupent le son. L'app doit être installée sur l'écran d'accueil.
            </p>
          ) : null}
        </section>

        <section className="surface-card p-4">
          <p className="mb-2 text-sm font-medium">3. État des notifications</p>
          <PushDebug />
        </section>
      </div>
    </div>
  );
}
