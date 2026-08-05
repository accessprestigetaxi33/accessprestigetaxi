import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Gestion des appareils chauffeur inscrits aux notifications push.
 * Liste par chauffeur (Patricia / Alain), dernier envoi, dernière erreur,
 * et révocation ciblée d'un appareil.
 */
const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

export type DriverDevice = {
  id: string;
  driver_id: string | null;
  endpoint: string;
  fcm_suffix: string | null;
  user_agent: string | null;
  platform: string;
  created_at: string | null;
  last_seen_at: string | null;
  last_sent_at: string | null;
  last_sent_title: string | null;
  last_error_at: string | null;
  last_error_code: string | null;
  last_error_status: number | null;
  active: boolean;
};

function platformFromUa(ua: string | null): string {
  if (!ua) return "Appareil inconnu";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone / iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Autre";
}

/** Liste des appareils chauffeur, regroupables par chauffeur côté UI. */
export const listDriverDevices = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: subs, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, driver_id, endpoint, fcm_token, user_agent, created_at, last_seen_at")
      .eq("audience", "chauffeur")
      .order("last_seen_at", { ascending: false });
    if (error) throw new Error(`devices_failed: ${error.message}`);

    const { data: logs } = await supabaseAdmin
      .from("push_send_log" as any)
      .select("created_at, status, fcm_token_suffix, title, error_code, http_status")
      .eq("audience", "chauffeur")
      .order("created_at", { ascending: false })
      .limit(600);

    const lastSent = new Map<string, any>();
    const lastError = new Map<string, any>();
    for (const row of ((logs as any[]) ?? [])) {
      const key = row.fcm_token_suffix as string | null;
      if (!key) continue;
      if (row.status === "sent") {
        if (!lastSent.has(key)) lastSent.set(key, row);
      } else if (!lastError.has(key)) {
        lastError.set(key, row);
      }
    }

    const staleMs = 60 * 24 * 60 * 60 * 1000; // 60 j : FCM révoque au-delà
    const now = Date.now();

    const devices: DriverDevice[] = ((subs as any[]) ?? []).map((s) => {
      const suffix = s.fcm_token ? String(s.fcm_token).slice(-12) : null;
      const sent = suffix ? lastSent.get(suffix) : null;
      const err = suffix ? lastError.get(suffix) : null;
      const seen = Date.parse(s.last_seen_at || s.created_at || "") || 0;
      return {
        id: s.id,
        driver_id: s.driver_id ?? null,
        endpoint: s.endpoint,
        fcm_suffix: suffix,
        user_agent: s.user_agent ?? null,
        platform: platformFromUa(s.user_agent ?? null),
        created_at: s.created_at ?? null,
        last_seen_at: s.last_seen_at ?? null,
        last_sent_at: sent?.created_at ?? null,
        last_sent_title: sent?.title ?? null,
        last_error_at: err?.created_at ?? null,
        last_error_code: err?.error_code ?? err?.status ?? null,
        last_error_status: err?.http_status ?? null,
        active: !!s.fcm_token && seen > 0 && now - seen < staleMs,
      };
    });

    return { devices };
  });

/** Révoque (désinscrit) un appareil chauffeur précis. */
export const revokeDriverDevice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ device_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("push_subscriptions").delete().eq("id", data.device_id);
    if (error) throw new Error(`revoke_failed: ${error.message}`);
    return { ok: true };
  });

/** Journal des notifications (push + repli e-mail), consultable depuis /driver. */
export const driverPushLog = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({
      limit: z.number().int().min(10).max(300).optional(),
      status: z.enum(["all", "sent", "failed", "removed", "fallback_email"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("push_send_log" as any)
      .select(
        "id, created_at, channel, audience, status, tag, reservation_id, fcm_token_suffix, http_status, error_code, title, body",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 80);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(`push_log_failed: ${error.message}`);
    const list = ((rows as any[]) ?? []);
    return {
      entries: list,
      stats: {
        total: list.length,
        sent: list.filter((r) => r.status === "sent").length,
        failed: list.filter((r) => r.status === "failed" || r.status === "removed").length,
        email: list.filter((r) => r.status === "fallback_email").length,
      },
    };
  });
