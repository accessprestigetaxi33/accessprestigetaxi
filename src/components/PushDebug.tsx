/**
 * PushDebug — panneau de diagnostic push visible directement sur mobile.
 * À ajouter temporairement dans ton layout ou n'importe quelle page :
 *
 *   import { PushDebug } from "@/components/PushDebug";
 *   <PushDebug />
 *
 * Supprime-le une fois le problème résolu.
 */
import { useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFcmToken } from "@/lib/firebase";
import { sendTestPush, subscribePush } from "@/lib/push.functions";
import { listPushSends } from "@/lib/push-admin.functions";
import { getDriverToken } from "@/lib/driver-token";

type LogLine = { time: string; level: "info" | "error" | "ok"; msg: string };

// Doit correspondre à SW_VERSION dans firebase-messaging-sw.js.
// Sert à détecter un SW obsolète (fréquent sur iOS, qui met très mal à jour
// les service workers en cache) qui expliquerait "serveur dit envoyé, rien
// ne s'affiche" sans la moindre erreur applicative.
const EXPECTED_SW_VERSION = "apt-2026-09.push-click-open";

export function PushDebug() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const listSendsFn = useServerFn(listPushSends);

  const log = useCallback((level: LogLine["level"], msg: string) => {
    const time = new Date().toLocaleTimeString("fr-FR", { hour12: false });
    setLogs((prev) => [...prev, { time, level, msg }]);
    console.log(`[PushDebug][${level}]`, msg);
  }, []);

  const runDiag = useCallback(async () => {
    setLogs([]);
    setRunning(true);

    // 1. Support API
    log("info", `Notification in window: ${"Notification" in window}`);
    log("info", `serviceWorker in navigator: ${"serviceWorker" in navigator}`);
    log("info", `PushManager in window: ${"PushManager" in window}`);
    log("info", `Permission actuelle: ${"Notification" in window ? Notification.permission : "N/A"}`);
    log(
      "info",
      `Standalone (PWA installée) : ${(window.navigator as any).standalone === true || window.matchMedia?.("(display-mode: standalone)").matches}`,
    );
    log("info", `UserAgent: ${navigator.userAgent.slice(0, 120)}`);

    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      log("error", "❌ Push non supporté sur ce navigateur/OS");
      setRunning(false);
      return;
    }

    // 2. Service Workers enregistrés
    let fcmReg: ServiceWorkerRegistration | undefined;
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      log("info", `SW enregistrés: ${regs.length}`);
      regs.forEach((r, i) => {
        const state = r.active?.state ?? r.installing?.state ?? r.waiting?.state ?? "?";
        log(
          "info",
          `  SW[${i}]: ${r.active?.scriptURL ?? r.installing?.scriptURL ?? r.waiting?.scriptURL ?? "?"} (${state})`,
        );
      });
      fcmReg = regs.find((r) =>
        [r.active, r.installing, r.waiting].some((w) => w?.scriptURL.includes("firebase-messaging-sw")),
      );
      if (fcmReg) log("ok", "✅ firebase-messaging-sw.js trouvé");
      else log("error", "❌ firebase-messaging-sw.js NON trouvé parmi les SW");
    } catch (e: any) {
      log("error", `getRegistrations failed: ${e?.message}`);
    }

    // 2bis. Version du SW réellement actif sur CET appareil.
    // ⚠️ iOS Safari est notoirement mauvais pour mettre à jour un service
    // worker en cache (même avec updateViaCache:"none"). Si cette version ne
    // correspond pas à EXPECTED_SW_VERSION, le téléphone exécute encore
    // l'ANCIEN firebase-messaging-sw.js — ce qui explique parfaitement
    // "le serveur dit envoyé, rien ne s'affiche, aucune erreur applicative" :
    // le bug est côté device, pas côté code actuel.
    if (fcmReg?.active) {
      try {
        const version = await new Promise<string | null>((resolve) => {
          const channel = new MessageChannel();
          const timeout = setTimeout(() => resolve(null), 3000);
          channel.port1.onmessage = (ev) => {
            clearTimeout(timeout);
            resolve(ev.data?.version ?? null);
          };
          fcmReg!.active!.postMessage({ type: "FCM_SW_VERSION" }, [channel.port2]);
        });
        if (!version) {
          log(
            "error",
            "❌ Pas de réponse du SW actif (version inconnue) — probablement une version très ancienne sans handler FCM_SW_VERSION.",
          );
        } else if (version !== EXPECTED_SW_VERSION) {
          log(
            "error",
            `❌ SW OBSOLÈTE sur cet appareil : actif="${version}" ≠ attendu="${EXPECTED_SW_VERSION}". ` +
              `Ferme complètement l'app (pas juste l'onglet) et rouvre-la, ou désinstalle/réinstalle l'icône écran d'accueil.`,
          );
        } else {
          log("ok", `✅ SW à jour (${version})`);
        }
      } catch (e: any) {
        log("error", `Vérif version SW échouée: ${e?.message}`);
      }
    }

    // 3. Token FCM
    let obtainedToken: string | null = null;
    try {
      log("info", "Demande du token FCM...");
      const token = await getFcmToken({ forceRefresh: true });
      if (token) {
        obtainedToken = token;
        log("ok", `✅ Token obtenu: ${token.slice(0, 20)}…${token.slice(-10)}`);
        const ua = navigator.userAgent.slice(0, 500);
        await Promise.all([
          subscribePush({
            data: { audience: "client", fcm_token: token, reservation_id: null, user_agent: ua },
          }),
          subscribePush({
            data: {
              audience: "chauffeur",
              fcm_token: token,
              reservation_id: null,
              driver_token: getDriverToken(),
              user_agent: ua,
            },
          }),
        ]);
        log("ok", "✅ Token enregistré pour client + chauffeur sur cet appareil");
      } else {
        log("error", "❌ Token vide (null) — permission refusée ou SW introuvable");
      }
    } catch (e: any) {
      log("error", `getFcmToken threw: ${e?.message ?? String(e)}`);
    }

    // 4. Test FCM serveur → téléphone
    try {
      log("info", "Envoi d'une notification FCM serveur vers client...");
      const result: any = await sendTestPush({ data: { audience: "client" } });
      log(
        result.sent > 0 ? "ok" : "error",
        `FCM serveur: sent=${result.sent}, removed=${result.removed}` +
          (result.reason ? ` — reason=${result.reason}` : ""),
      );
      if (result.sent > 0) {
        log(
          "info",
          "⚠️ 'sent' ne veut dire que FCM a ACCEPTÉ l'envoi — pas que la notif s'est affichée. Vérifie le point 6 ci-dessous.",
        );
      }
    } catch (e: any) {
      log("error", `sendTestPush failed: ${e?.message ?? String(e)}`);
    }

    // 5. Test notification locale
    try {
      const reg = await navigator.serviceWorker.ready;
      log("info", "SW ready ✅ — envoi d'une notif locale de test...");
      await reg.showNotification("🧪 PushDebug — Test local", {
        body: "Si tu vois ça, le SW fonctionne !",
        icon: "/favicon.ico",
        tag: "push-debug-test",
      });
      log("ok", "✅ Notif locale envoyée (vérifie ton écran)");
    } catch (e: any) {
      log("error", `showNotification failed: ${e?.message}`);
    }

    // 6. Croise avec push_send_log pour CE token précis (nécessite un jeton
    // chauffeur valide — sinon on saute ce contrôle plutôt que de planter).
    const driverToken = getDriverToken();
    if (driverToken && obtainedToken) {
      try {
        const { sends } = await listSendsFn({ data: { token: driverToken } });
        const suffix = obtainedToken.slice(-12);
        const matches = (sends ?? []).filter((s: any) => s.fcm_token_suffix === suffix);
        if (matches.length === 0) {
          log(
            "error",
            `❌ Aucune ligne dans push_send_log pour ce token (…${suffix}) — le serveur n'a peut-être jamais tenté d'envoyer à CET appareil précis (vérifie qu'il n'y a pas un doublon de subscription plus ancien qui reçoit à sa place).`,
          );
        } else {
          matches.slice(0, 3).forEach((m: any) => {
            log(
              m.status === "sent" ? "ok" : "error",
              `push_send_log : ${m.status} · HTTP ${m.http_status ?? "—"} · ${m.error_code ?? "—"} · ${new Date(m.created_at).toLocaleTimeString("fr-FR")}`,
            );
          });
        }
      } catch (e: any) {
        log("info", `Croisement push_send_log impossible (jeton non-admin ou erreur) : ${e?.message ?? String(e)}`);
      }
    } else {
      log("info", "Pas de jeton chauffeur disponible sur cet appareil — croisement push_send_log ignoré.");
    }

    setRunning(false);
  }, [log, listSendsFn]);

  const levelColor: Record<LogLine["level"], string> = {
    info: "#94a3b8",
    ok: "#4ade80",
    error: "#f87171",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#0f172a",
        color: "#e2e8f0",
        fontFamily: "monospace",
        fontSize: 12,
        maxHeight: "55vh",
        display: "flex",
        flexDirection: "column",
        borderTop: "2px solid #334155",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 10px",
          gap: 8,
          borderBottom: "1px solid #334155",
        }}
      >
        <span style={{ flex: 1, fontWeight: "bold", fontSize: 13 }}>🔍 Push Debug</span>
        <button
          onClick={runDiag}
          disabled={running}
          style={{
            background: running ? "#334155" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "4px 12px",
            cursor: running ? "default" : "pointer",
            fontSize: 12,
          }}
        >
          {running ? "Diagnostic…" : "▶ Lancer"}
        </button>
        <button
          onClick={() => setLogs([])}
          style={{
            background: "#334155",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Effacer
        </button>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: "6px 10px" }}>
        {logs.length === 0 && (
          <div style={{ color: "#475569", paddingTop: 8 }}>
            Appuie sur ▶ Lancer pour diagnostiquer le push sur cet appareil.
          </div>
        )}
        {logs.map((l, i) => (
          <div key={i} style={{ marginBottom: 3, color: levelColor[l.level] }}>
            <span style={{ color: "#475569" }}>{l.time} </span>
            {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
