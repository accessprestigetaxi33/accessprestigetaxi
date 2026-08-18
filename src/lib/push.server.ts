// FCM HTTP v1 sender — utilise FIREBASE_SERVICE_ACCOUNT_JSON
// Cloudflare Workers compatible : signature JWT via Web Crypto API.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
};

export type PushAudience = "chauffeur" | "client";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
  token_uri?: string;
};

const APP_URL = "https://accessprestigetaxi.lovable.app";

let cachedAccount: ServiceAccount | null = null;
let cachedToken: { token: string; exp: number } | null = null;

function getServiceAccount(): ServiceAccount {
  if (cachedAccount) return cachedAccount;
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    (typeof import.meta !== "undefined"
      ? (import.meta as any).env?.FIREBASE_SERVICE_ACCOUNT_JSON
      : undefined) ||
    (typeof import.meta !== "undefined"
      ? (import.meta as any).env?.FIREBASE_SERVICE_ACCOUNT
      : undefined);
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");
  cachedAccount = JSON.parse(raw) as ServiceAccount;
  return cachedAccount;
}

function base64UrlEncode(buf: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof buf === "string") {
    bytes = new TextEncoder().encode(buf);
  } else if (buf instanceof ArrayBuffer) {
    bytes = new Uint8Array(buf);
  } else {
    bytes = buf;
  }
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 30) return cachedToken.token;

  const sa = getServiceAccount();
  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimB64 = base64UrlEncode(JSON.stringify(claim));
  const data = `${headerB64}.${claimB64}`;

  const keyBuf = pemToArrayBuffer(sa.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(data),
  );
  const jwt = `${data}.${base64UrlEncode(sigBuf)}`;

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`FCM token exchange failed: ${res.status} ${txt}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, exp: now + (json.expires_in ?? 3600) };
  return json.access_token;
}

function resolvePushUrl(url?: string): string {
  if (!url) return `${APP_URL}/`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${APP_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

async function sendFcmToToken(
  accessToken: string,
  projectId: string,
  token: string,
  payload: PushPayload,
  audience: PushAudience,
  reservationId?: string,
): Promise<{ ok: boolean; status: number; errorCode?: string }> {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const clickUrl = resolvePushUrl(payload.url);
  // On stocke le chemin RELATIF (ex: /suivi/xxx) pour que notre
  // notificationclick ouvre la même origin que le PWA installé.
  const relativeUrl =
    payload.url && !/^https?:\/\//i.test(payload.url)
      ? payload.url.startsWith("/")
        ? payload.url
        : `/${payload.url}`
      : clickUrl;
  const extraData = {
    url: relativeUrl,
    click_url: clickUrl,
    tag: payload.tag || "taxi-fcm",
    audience,
    // Marqueur unique pour différencier les deux apps en cas de collision
    // Utile en cas de bug où une notif chauffeur arrive au client ou vice-versa
    audience_marker: `${audience}:${Date.now()}`,
    ...(reservationId ? { reservation_id: reservationId } : {}),
  };
  // `notification` racine = requis pour iOS Safari PWA (sinon la notif ne
  // s'affiche pas en background). On évite `webpush.notification` (doublon iOS)
  // ET `webpush.fcm_options.link` : quand le lien est présent, le handler
  // notificationclick par défaut du SDK Firebase déclenche openWindow sur
  // l'URL absolue en parallèle du nôtre → sur iOS PWA le clic finit sur une
  // page externe ou "rien ne se passe". Notre handler lit `data.url` (relatif).
  // Priorité de délivrance :
  // - Android (FCM natif) : "priority": "high" fait sortir l'appareil du mode
  //   Doze / App Standby pour livrer immédiatement.
  // - iOS (APNs, via le pont FCM) : apns-priority: 10 = livraison immédiate.
  //   Nécessite apns-push-type: alert dès qu'on envoie une alerte visible
  //   (obligatoire depuis iOS 13, sinon APNs peut rejeter ou retarder).
  // On force la priorité haute uniquement quand requireInteraction est vrai
  // (courses / évènements qui doivent réveiller l'utilisateur immédiatement) ;
  // sinon on reste sur les priorités par défaut de chaque plateforme.
  const body = {
    message: {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      webpush: {
        headers: payload.requireInteraction ? { Urgency: "high", TTL: "86400" } : { TTL: "3600" },
        data: extraData,
      },
      // Android: "high" réveille l'appareil même en mode doze/deep sleep.
      android: {
        priority: payload.requireInteraction ? "high" : "normal",
        notification: {
          title: payload.title,
          body: payload.body,
          clickAction: clickUrl,
        },
        data: extraData,
      },
      // iOS/APNs : livraison immédiate + fiabilité en arrière-plan.
      apns: {
        headers: {
          "apns-priority": payload.requireInteraction ? "10" : "5",
          "apns-push-type": "alert",
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: "default",
            "content-available": 1,
            badge: 1,
            mutableContent: true,
          },
          customData: extraData,
        },
      },
      data: extraData,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.ok) return { ok: true, status: res.status };
  let errorCode: string | undefined;
  try {
    const j: any = await res.json();
    errorCode = j?.error?.details?.find?.((d: any) => d?.errorCode)?.errorCode || j?.error?.status;
  } catch {}
  return { ok: false, status: res.status, errorCode };
}

type SubRow = {
  id: string;
  fcm_token: string | null;
  user_agent: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  driver_id: string | null;
  reservation_id: string | null;
  client_account_id: string | null;
};

/**
 * Garde-fou d'idempotence générique (push, e-mail, webhooks).
 * Réserve une clé logique dans `push_dedup` : le premier appel obtient `true`,
 * tous les retrys (webhook rejoué, double clic, redelivery FCM) obtiennent
 * `false` tant que la clé n'a pas expiré.
 *
 * @param key    clé logique unique (ex. `notify-reservation-<id>`)
 * @param scope  espace de noms (`client`, `chauffeur`, `email`, `webhook`…)
 * @param ttlMinutes durée de rétention de la clé (défaut 60 min)
 */
export async function claimNotificationOnce(
  key: string,
  scope: string,
  ttlMinutes = 60,
): Promise<boolean> {
  if (!key) return true;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();
  try {
    await supabaseAdmin.from("push_dedup").delete().lt("expires_at", now.toISOString());
  } catch {}
  const { error } = await supabaseAdmin.from("push_dedup").insert({
    tag: key,
    audience: scope,
    first_sent_at: now.toISOString(),
    expires_at: expiresAt,
  });
  if (!error) return true;
  if ((error as any).code === "23505") {
    console.log("[dedup] duplicate suppressed", scope, key);
    return false;
  }
  console.warn("[dedup] claim non-fatal error", error);
  return true;
}

async function claimPushSendOnce(
  audience: PushAudience,
  tag?: string,
  ttlMinutes = 60,
): Promise<boolean> {
  // Les tags volontairement uniques (suffixe horodaté, ex. messages de tchat)
  // ne sont pas dédupliqués : chaque message est une notification distincte.
  if (!tag || /-\d{13}$/.test(tag)) return true;
  return claimNotificationOnce(tag, audience, ttlMinutes);
}

function isLikelyIosWebPush(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && /Mobile|Safari/i.test(userAgent))
  );
}

/**
 * Résout le chauffeur assigné à une réservation (site bi-chauffeur).
 * Retourne la clé (`alain` / `patricia`) et le prénom affichable.
 */
export async function resolveReservationDriver(
  reservationId: string,
): Promise<{ driverId: string | null; driverName: string }> {
  try {
    const { data } = await supabaseAdmin
      .from("reservations")
      .select("assigned_driver")
      .eq("id", reservationId)
      .maybeSingle();
    const { normalizeDriverKey } = await import("@/lib/webhook-security.server");
    const key = normalizeDriverKey((data as any)?.assigned_driver);
    if (key) return { driverId: key, driverName: key[0]!.toUpperCase() + key.slice(1) };
  } catch (e) {
    console.warn("[push] resolveReservationDriver failed", e);
  }
  return { driverId: null, driverName: "Votre chauffeur" };
}

export async function sendPushToAudience(
  audience: PushAudience,
  payload: PushPayload,
  opts: {
    reservationId?: string;
    accountId?: string;
    driverId?: string | null;
    /** Fenêtre d'idempotence du tag (minutes). Défaut : 60. */
    dedupTtlMinutes?: number;
  } = {},
): Promise<{ sent: number; removed: number }> {
  const baseQuery = () =>
    supabaseAdmin
      .from("push_subscriptions")
      .select(
        "id, fcm_token, user_agent, last_seen_at, created_at, driver_id, reservation_id, client_account_id",
      )
      .eq("audience", audience)
      .not("fcm_token", "is", null);

  let q = baseQuery();
  if (audience === "client" && opts.reservationId && opts.accountId) {
    // Un appareil client peut etre inscrit au compte sans reservation_id
    // (espace client), ou a une reservation pour un parcours invite.
    q = q.or(`reservation_id.eq.${opts.reservationId},client_account_id.eq.${opts.accountId}`);
  } else if (audience === "client" && opts.reservationId) {
    q = q.eq("reservation_id", opts.reservationId);
  } else if (audience === "client" && opts.accountId) {
    q = q.eq("client_account_id", opts.accountId);
  }
  // Bi-chauffeur : quand la course est attribuée, seul le chauffeur concerné
  // est notifié. Une absence d'appareil ciblé ne doit pas diffuser la course
  // au mauvais chauffeur.
  if (audience === "chauffeur" && opts.driverId) {
    q = q.eq("driver_id", opts.driverId);
  }

  let { data, error } = await q;
  if (error || !data || data.length === 0) return { sent: 0, removed: 0 };

  const claimed = await claimPushSendOnce(audience, payload.tag, opts.dedupTtlMinutes ?? 60);
  if (!claimed) return { sent: 0, removed: 0 };

  // Dédup device : même fcm_token + cas iOS où plusieurs anciens tokens restent
  // valides pour le même device après rotation Safari/PWA.
  //
  // ⚠️ La clé iOS ne doit JAMAIS être le user_agent seul : Alain et Patricia ont
  // tous deux un iPhone et Safari renvoie une chaîne quasi identique → un des
  // deux chauffeurs était silencieusement écarté du broadcast. On combine donc
  // l'identité du destinataire (driver_id / compte / réservation) au UA, et on
  // ne déduplique pas du tout quand cette identité est inconnue.
  const seenTokens = new Set<string>();
  const seenIosDevices = new Set<string>();
  const sortedSubs = [...(data as SubRow[])].sort((a, b) => {
    const at = Date.parse(a.last_seen_at || a.created_at || "") || 0;
    const bt = Date.parse(b.last_seen_at || b.created_at || "") || 0;
    return bt - at;
  });
  const identityOf = (s: SubRow): string | null =>
    audience === "chauffeur" ? s.driver_id : (s.client_account_id ?? s.reservation_id ?? null);
  const uniqueSubs = sortedSubs.filter((s) => {
    if (!s.fcm_token || seenTokens.has(s.fcm_token)) return false;
    seenTokens.add(s.fcm_token);
    const identity = identityOf(s);
    // Identité inconnue → on préfère un doublon éventuel à une notification perdue.
    if (identity && isLikelyIosWebPush(s.user_agent)) {
      const deviceKey = `${identity}::${s.user_agent || "ios-device"}`;
      if (seenIosDevices.has(deviceKey)) return false;
      seenIosDevices.add(deviceKey);
    }
    return true;
  });

  let accessToken: string;
  let projectId: string;
  try {
    accessToken = await getAccessToken();
    projectId = getServiceAccount().project_id;
  } catch (err) {
    console.error("[push] FCM auth failed", err);
    return { sent: 0, removed: 0 };
  }

  let sent = 0;
  const toRemove: string[] = [];
  const { logPushSend } = await import("@/lib/push-log.server");

  await Promise.all(
    uniqueSubs.map(async (sub) => {
      if (!sub.fcm_token) return;
      const r = await sendFcmToToken(
        accessToken,
        projectId,
        sub.fcm_token,
        payload,
        audience,
        opts.reservationId,
      );
      const base = {
        audience,
        tag: payload.tag ?? null,
        reservationId: opts.reservationId ?? null,
        fcmToken: sub.fcm_token,
        title: payload.title,
        body: payload.body,
        userAgent: sub.user_agent,
        httpStatus: r.status,
        errorCode: r.errorCode ?? null,
      };
      if (r.ok) {
        sent++;
        await logPushSend({ ...base, status: "sent" });
      } else if (
        r.status === 404 ||
        r.status === 400 ||
        r.errorCode === "UNREGISTERED" ||
        r.errorCode === "INVALID_ARGUMENT"
      ) {
        toRemove.push(sub.id);
        await logPushSend({ ...base, status: "removed" });
      } else {
        console.error("[push] FCM send failed", r.status, r.errorCode);
        await logPushSend({ ...base, status: "failed" });
      }
      if (!r.ok) {
        try {
          await supabaseAdmin.from("push_send_failures").insert({
            audience,
            tag: payload.tag ?? null,
            reservation_id: opts.reservationId ?? null,
            fcm_token_suffix: sub.fcm_token.slice(-12),
            http_status: r.status,
            error_code: r.errorCode ?? null,
            title: payload.title,
            body: payload.body?.slice(0, 500) ?? null,
            user_agent: sub.user_agent?.slice(0, 300) ?? null,
          });
        } catch (err) {
          console.warn("[push] failure log insert skipped", err);
        }
      }
    }),
  );

  if (toRemove.length > 0) {
    await supabaseAdmin.from("push_subscriptions").delete().in("id", toRemove);
  }

  return { sent, removed: toRemove.length };
}

// Placeholder de compat — la vérif dedup était utilisée par un endpoint diag.
export type DedupHealth = { ok: boolean; note?: string; error?: string };
export async function checkPushDedupHealth(_force = false): Promise<DedupHealth> {
  return { ok: true, note: "dedup check disabled" };
}
