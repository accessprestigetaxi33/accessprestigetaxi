// Journal des envois de notifications (push + repli e-mail).
// Écrit uniquement côté serveur avec le client service-role.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PushLogEntry = {
  channel?: "push" | "email";
  audience: string;
  /** sent | failed | removed | skipped | fallback_email | no_recipient */
  status: string;
  tag?: string | null;
  reservationId?: string | null;
  recipient?: string | null;
  fcmToken?: string | null;
  httpStatus?: number | null;
  errorCode?: string | null;
  title?: string | null;
  body?: string | null;
  userAgent?: string | null;
};

export async function logPushSend(entry: PushLogEntry): Promise<void> {
  try {
    await supabaseAdmin.from("push_send_log" as any).insert({
      channel: entry.channel ?? "push",
      audience: entry.audience,
      status: entry.status,
      tag: entry.tag ?? null,
      reservation_id: entry.reservationId ?? null,
      recipient: entry.recipient ?? null,
      fcm_token_suffix: entry.fcmToken ? entry.fcmToken.slice(-12) : null,
      http_status: entry.httpStatus ?? null,
      error_code: entry.errorCode ?? null,
      title: entry.title ?? null,
      body: entry.body ? entry.body.slice(0, 500) : null,
      user_agent: entry.userAgent ? entry.userAgent.slice(0, 300) : null,
    });
  } catch (err) {
    console.warn("[push-log] insert failed", err);
  }
}
