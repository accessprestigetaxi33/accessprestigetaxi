/**
 * Sécurité des webhooks publics (`/api/public/*`).
 *
 * Trois niveaux de contrôle, tous obligatoires :
 *  1. Hôte : la requête doit viser un domaine du projet (anti-relais).
 *  2. Signature : HMAC-SHA256 sur `<timestamp>.<corps brut>` avec
 *     `WEBHOOK_SIGNING_SECRET`, comparée en temps constant.
 *  3. Anti-rejeu : horodatage dans une fenêtre de ±5 min + signature
 *     consommée une seule fois (`push_dedup`).
 *
 * Le bearer service-role reste accepté pour les appels internes serveur→serveur.
 */

const SIGNATURE_HEADER = "x-apt-signature";
const TIMESTAMP_HEADER = "x-apt-timestamp";
const MAX_SKEW_SECONDS = 300;

const ALLOWED_HOSTS = new Set([
  "accessprestigetaxi.fr",
  "www.accessprestigetaxi.fr",
  "accessprestigetaxi.lovable.app",
  "localhost:8080",
  "localhost:3000",
]);

/** Hôtes dynamiques autorisés (preview / URLs stables du projet). */
function isAllowedHost(host: string): boolean {
  if (!host) return false;
  const h = host.toLowerCase();
  if (ALLOWED_HOSTS.has(h)) return true;
  return /^[a-z0-9-]+--[a-z0-9-]+(-dev)?\.lovable\.app$/.test(h) || /\.lovable\.app$/.test(h);
}

export type WebhookAuthResult =
  | { ok: true; mode: "signature" | "service-bearer"; body: string }
  | { ok: false; status: number; error: string };

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Vérifie hôte + signature + fraîcheur + unicité. Retourne le corps brut lu
 * (le corps ne peut être lu qu'une fois : réutiliser `result.body`).
 */
export async function verifyWebhookRequest(
  request: Request,
  opts: { serviceKey?: string; scope: string } = { scope: "webhook" },
): Promise<WebhookAuthResult> {
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (!isAllowedHost(host)) {
    return { ok: false, status: 403, error: "host_not_allowed" };
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return { ok: false, status: 400, error: "invalid_body" };
  }
  if (body.length > 100_000) return { ok: false, status: 413, error: "body_too_large" };

  // Appel interne serveur→serveur (service role) : pas de signature requise.
  const serviceKey = opts.serviceKey ?? "";
  if (serviceKey && request.headers.get("Authorization") === `Bearer ${serviceKey}`) {
    return { ok: true, mode: "service-bearer", body };
  }

  const secret = process.env["WEBHOOK_SIGNING_SECRET"] ?? "";
  if (!secret) return { ok: false, status: 500, error: "signing_secret_missing" };

  const provided = (request.headers.get(SIGNATURE_HEADER) ?? "").replace(/^sha256=/i, "").trim();
  const timestamp = (request.headers.get(TIMESTAMP_HEADER) ?? "").trim();
  if (!provided || !timestamp) return { ok: false, status: 401, error: "signature_missing" };

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, status: 401, error: "timestamp_invalid" };
  const skew = Math.abs(Date.now() / 1000 - ts);
  if (skew > MAX_SKEW_SECONDS) return { ok: false, status: 401, error: "timestamp_expired" };

  const expected = await hmacHex(secret, `${timestamp}.${body}`);
  if (!constantTimeEqual(provided.toLowerCase(), expected)) {
    return { ok: false, status: 401, error: "signature_invalid" };
  }

  // Anti-rejeu : une signature n'est acceptée qu'une seule fois.
  const { claimNotificationOnce } = await import("@/lib/push.server");
  const fresh = await claimNotificationOnce(`sig-${expected.slice(0, 40)}`, opts.scope, 15);
  if (!fresh) return { ok: false, status: 409, error: "replayed_signature" };

  return { ok: true, mode: "signature", body };
}

/** Signe une requête sortante vers un webhook interne (utilitaire serveur). */
export async function signWebhookPayload(
  body: string,
): Promise<{ [SIGNATURE_HEADER]: string; [TIMESTAMP_HEADER]: string } | null> {
  const secret = process.env["WEBHOOK_SIGNING_SECRET"] ?? "";
  if (!secret) return null;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await hmacHex(secret, `${timestamp}.${body}`);
  return { [SIGNATURE_HEADER]: `sha256=${signature}`, [TIMESTAMP_HEADER]: timestamp };
}

/** Chauffeurs valides du site (bi-chauffeur). */
export const VALID_DRIVERS = ["alain", "patricia"] as const;
export type DriverKey = (typeof VALID_DRIVERS)[number];

/** Normalise et valide une clé chauffeur ; renvoie null si inconnue. */
export function normalizeDriverKey(value: unknown): DriverKey | null {
  const key = String(value ?? "").toLowerCase().trim();
  return (VALID_DRIVERS as readonly string[]).includes(key) ? (key as DriverKey) : null;
}
