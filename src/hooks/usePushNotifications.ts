// FCM-only hook — auto-subscribe au montage si autoAudience est fourni.
// Usage client  : usePushNotifications({ autoAudience: "client", reservationId })
// Usage chauffeur : usePushNotifications({ autoAudience: "chauffeur" })
// Usage manuel  : usePushNotifications() puis appeler subscribe(audience, reservationId)
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribePush, type PushAudience } from "@/lib/push.functions";
import { getFcmToken, getLastFcmFailure, type FcmFailureReason } from "@/lib/firebase";
import { getDriverToken } from "@/lib/driver-token";

export type PushStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

/**
 * Ne pas tester `"PushManager" in window` ici. Sur certains Chrome Android
 * lancés en WebAPK/PWA, PushManager n'est exposé que par
 * ServiceWorkerRegistration.pushManager. Firebase sait gérer ce cas et son
 * propre `isSupported()` reste l'autorité au moment d'obtenir le token.
 */
function hasBrowserPushApis(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

// Identifiant de device stable, généré une fois et conservé en localStorage.
// Préféré au hash du user_agent côté serveur : deux iPhones du même modèle
// ont un UA quasi identique, ce qui les fait collisionner. Un uuid généré et
// stocké localement identifie fiablement CE navigateur/device, y compris
// quand plusieurs identités (Alain/Patricia) se relaient dessus.
const DEVICE_ID_KEY = "apt_device_id:v1";
function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, fresh);
    return fresh;
  } catch {
    // Stockage privé/indisponible : pas de persistance possible, on retombe
    // sur le fallback hash-UA côté serveur (device_id absent).
    return "";
  }
}

interface UsePushOptions {
  /** Si fourni, souscrit automatiquement au montage avec cette audience. */
  autoAudience?: PushAudience;
  /** reservation_id à associer (pour audience "client"). */
  reservationId?: string;
  /** client_account_id à associer (chat direct + espace client). */
  clientAccountId?: string | null;
  clientSessionToken?: string;
  /** Identifiant chauffeur (patricia / alain / admin) pour l'audience "chauffeur". */
  driverId?: string | null;
}

/** Message lisible expliquant pourquoi l'obtention du token FCM a échoué. */
function describeFcmFailure(reason?: FcmFailureReason, detail?: string): string {
  switch (reason) {
    case "permission-dismissed":
      return "La demande d'autorisation a été fermée sans réponse. Touchez à nouveau le bouton puis choisissez « Autoriser ».";
    case "permission-denied":
      return "Les notifications sont bloquées pour ce site. Réglages iPhone › Notifications › Access Prestige Taxi (ou Réglages du site sur Android) pour les réautoriser.";
    case "not-supported":
      return "Le service de notifications n'est pas disponible sur ce navigateur.";
    case "no-api":
      return "Ce contexte ne fournit pas l'API de notifications (aperçu intégré ou navigateur d'application).";
    case "sw-failed":
      return `Le service worker de notification n'a pas pu démarrer${detail ? ` (${detail})` : ""}. Fermez complètement l'app installée puis rouvrez-la.`;
    case "empty-token":
      return "Aucun jeton de notification n'a été délivré par le serveur push. Réessayez dans quelques secondes.";
    default:
      return detail ? `Échec de l'activation : ${detail}` : "Échec de l'activation des notifications.";
  }
}

export function usePushNotifications(opts: UsePushOptions = {}) {
  const { autoAudience, reservationId, clientAccountId, clientSessionToken, driverId } = opts;
  const [status, setStatus] = useState<PushStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const subscribeFn = useServerFn(subscribePush);

  const persistenceKey = useCallback(
    (audience: PushAudience) =>
      `apt_push_registered:v2:${audience}:${audience === "chauffeur" ? (driverId ?? "") : (clientAccountId ?? reservationId ?? "generic")}`,
    [clientAccountId, driverId, reservationId],
  );

  const rememberRegistration = useCallback(
    (audience: PushAudience, fcm: string) => {
      try {
        window.localStorage.setItem(
          persistenceKey(audience),
          JSON.stringify({
            token: fcm,
            registeredAt: Date.now(),
            // On mémorise l'état d'autorisation accordé sur CET appareil :
            // tant qu'il ne change pas, aucune nouvelle demande n'est faite,
            // même après un rafraîchissement du navigateur.
            permission: typeof Notification !== "undefined" ? Notification.permission : "granted",
          }),
        );
      } catch {
        /* Le navigateur peut interdire le stockage privé : la souscription reste active. */
      }
    },
    [persistenceKey],
  );

  /** Lit la souscription persistée pour cet appareil (token + permission). */
  const readRegistration = useCallback(
    (audience: PushAudience): { token: string | null; permission: string | null } => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(persistenceKey(audience)) ?? "null") as {
          token?: unknown;
          permission?: unknown;
        } | null;
        return {
          token: typeof saved?.token === "string" ? saved.token : null,
          permission: typeof saved?.permission === "string" ? saved.permission : null,
        };
      } catch {
        return { token: null, permission: null };
      }
    },
    [persistenceKey],
  );

  // ── Détection support initial ──
  useEffect(() => {
    if (!hasBrowserPushApis()) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") setStatus("denied");
    else if (perm === "granted") setStatus("granted");
  }, []);

  // ── Auto-subscribe au montage ──
  useEffect(() => {
    if (!autoAudience) return;
    if (!hasBrowserPushApis()) return;
    // Pas de jeton chauffeur => l'inscription serveur serait rejetée (validation).
    if (autoAudience === "chauffeur" && getDriverToken().length < 8) return;

    // Une autorisation accordée reste valable sans limite sur cet appareil.
    // Le stockage est propre au navigateur/appareil : un nouvel appareil n'a
    // pas ce marqueur et sera inscrit une seule fois.
    const { token: registeredToken } = readRegistration(autoAudience);
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    if (Notification.permission === "default") {
      // Ne jamais déclencher la boîte de permission au simple chargement.
      setStatus("idle");
      return;
    }

    // ⚠️ CORRECTIF : le serveur exige client_session_token dès qu'un
    // client_account_id est fourni. Si ce hook est monté avant que le token
    // de session soit chargé côté parent, l'auto-subscribe échouait de façon
    // silencieuse (throw "client_session_required" avalé par le catch plus
    // bas, jamais retenté). On attend que le token soit là avant de lancer
    // l'inscription ; clientSessionToken est maintenant dans les deps donc
    // l'effet se relance dès qu'il devient disponible.
    if (autoAudience === "client" && clientAccountId && !clientSessionToken) {
      return;
    }

    // Même avec un token local, réinscrire côté serveur: la ligne Supabase
    // peut avoir été supprimée après un token FCM invalide ou une migration.
    if (registeredToken) setToken(registeredToken);

    let cancelled = false;

    const run = async () => {
      try {
        const fcm = await getFcmToken(); // rotation auto si token > 50 jours
        if (!fcm || cancelled) return;
        await subscribeFn({
          data: {
            audience: autoAudience,
            fcm_token: fcm,
            reservation_id: reservationId ?? null,
            client_account_id: clientAccountId ?? null,
            driver_id: driverId ?? null,
            client_session_token: clientSessionToken,
            driver_token: autoAudience === "chauffeur" ? getDriverToken() : undefined,
            user_agent: navigator.userAgent.slice(0, 500),
            device_id: getOrCreateDeviceId(),
          },
        });
        if (!cancelled) {
          try {
            rememberRegistration(autoAudience, fcm);
          } catch {}
          setToken(fcm);
          setStatus("granted");
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("[push] auto-subscribe failed", autoAudience, e);
          setStatus(
            typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied"
              ? "denied"
              : "idle",
          );
        }
      }
    };
    run();

    return () => {
      cancelled = true;
    };
    // reservationId volontairement exclu : on ne re-subscribe pas si l'id change après le montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoAudience,
    clientAccountId,
    clientSessionToken, // ⚠️ CORRECTIF : relance l'effet quand le token de session arrive après le montage
    driverId,
    persistenceKey,
    readRegistration,
    rememberRegistration,
  ]);

  // ── Subscribe manuel (pour les appels explicites) ──
  const subscribe = useCallback(
    async (
      audience: PushAudience = "client",
      resId?: string | null,
      accountId?: string | null,
      sessionToken?: string,
      // ⚠️ Permet de forcer le driver_id explicitement au lieu de retomber sur
      // celui capturé en closure via les options du hook (opts.driverId).
      // Nécessaire quand identification + abonnement sont déclenchés dans le
      // même clic : setDriverId() côté appelant est asynchrone, donc le
      // driverId du hook peut encore valoir l'ancienne valeur (souvent null)
      // au moment de cet appel. undefined = comportement inchangé (fallback
      // sur driverId de closure) ; toute autre valeur (y compris null) prime.
      driverIdOverride?: string | null,
    ): Promise<boolean> => {
      // Le serveur exige un jeton chauffeur valide : sans lui la requête part
      // et échoue en validation (driver_token trop court). On le signale
      // clairement au lieu d'une erreur technique silencieuse.
      if (audience === "chauffeur" && getDriverToken().length < 8) {
        setLastError("Session chauffeur expirée : reconnectez-vous à l'espace chauffeur puis réactivez les notifications.");
        setStatus("idle");
        return false;
      }
      setStatus("loading");
      try {
        const fcm = await getFcmToken();
        if (!fcm) {
          const failure = getLastFcmFailure();
          setLastError(describeFcmFailure(failure?.reason, failure?.detail));
          // « unsupported » uniquement quand l'API push est réellement absente.
          // Toute autre panne (permission ignorée, SW KO, token vide) garde un
          // statut réessayable au lieu de faire croire à un appareil incompatible.
          if (Notification.permission === "denied" || failure?.reason === "permission-denied") setStatus("denied");
          else if (failure?.reason === "not-supported" || failure?.reason === "no-api") setStatus("unsupported");
          else setStatus("idle");
          return false;
        }
        setLastError(null);
        await subscribeFn({
          data: {
            audience,
            fcm_token: fcm,
            reservation_id: resId ?? reservationId ?? null,
            client_account_id: accountId ?? clientAccountId ?? null,
            driver_id: (driverIdOverride !== undefined ? driverIdOverride : driverId) ?? null,
            client_session_token: sessionToken ?? clientSessionToken,
            driver_token: audience === "chauffeur" ? getDriverToken() : undefined,
            user_agent: navigator.userAgent.slice(0, 500),
            device_id: getOrCreateDeviceId(),
          },
        });
        rememberRegistration(audience, fcm);
        setToken(fcm);
        setStatus("granted");
        return true;
      } catch (err) {
        console.error("[push] subscribe error", err);
        setStatus(
          typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied"
            ? "denied"
            : "idle",
        );
        return false;
      }
    },
    [subscribeFn, reservationId, clientAccountId, clientSessionToken, driverId, rememberRegistration],
  );

  const testNotification = useCallback(async () => {
    if (status !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification("🚕 Test — Access Prestige Taxi", {
      body: "Les notifications sont bien activées !",
      icon: "/favicon.ico",
    });
  }, [status]);

  // Force un nouveau token FCM et re-subscribe (utile au visibilitychange sur iOS)
  const refreshToken = useCallback(
    async (audience: PushAudience = "chauffeur") => {
      try {
        const fcm = await getFcmToken({ forceRefresh: true });
        if (!fcm) return;
        await subscribeFn({
          data: {
            audience,
            fcm_token: fcm,
            reservation_id: reservationId ?? null,
            client_account_id: clientAccountId ?? null,
            driver_id: driverId ?? null,
            client_session_token: clientSessionToken,
            driver_token: audience === "chauffeur" ? getDriverToken() : undefined,
            user_agent: navigator.userAgent.slice(0, 500),
            device_id: getOrCreateDeviceId(),
          },
        });
        rememberRegistration(audience, fcm);
        setToken(fcm);
        setStatus("granted");
      } catch (e) {
        console.warn("[push] refreshToken failed", e);
      }
    },
    [subscribeFn, reservationId, clientAccountId, clientSessionToken, driverId, rememberRegistration],
  );

  // ── Reconfirmation au retour sur l'app (visibilitychange) ──
  // Objectif : maintenir l'abonnement serveur "vivant" pendant 50 jours.
  // Si l'utilisateur revient sur l'app, on rafraîchit silencieusement le token
  // et on met à jour expires_at, sans re-demander la permission. C'est limité
  // à une fois toutes les 12h pour ne pas spammer le serveur.
  useEffect(() => {
    if (!autoAudience) return;
    if (!hasBrowserPushApis()) return;
    if (Notification.permission !== "granted") return;
    if (autoAudience === "chauffeur" && getDriverToken().length < 8) return;

    const VISIBILITY_REFRESH_KEY = `apt_push_visibility_refresh:${autoAudience}`;
    const THROTTLE_MS = 12 * 60 * 60 * 1000; // 12h
    function shouldRefresh(): boolean {
      try {
        const last = parseInt(window.localStorage.getItem(VISIBILITY_REFRESH_KEY) ?? "0", 10);
        return Date.now() - last > THROTTLE_MS;
      } catch {
        return true;
      }
    }
    function markRefreshed() {
      try {
        window.localStorage.setItem(VISIBILITY_REFRESH_KEY, String(Date.now()));
      } catch {}
    }

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!shouldRefresh()) return;
      markRefreshed();
      refreshToken(autoAudience).catch((e) => console.warn("[push] visibility refresh failed", e));
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [autoAudience, refreshToken]);

  return { status, subscription: token, subscribe, testNotification, refreshToken, lastError };
}
