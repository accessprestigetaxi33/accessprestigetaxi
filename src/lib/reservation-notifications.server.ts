import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const PUSH_ENDPOINT = "https://fcm.googleapis.com/fcm/send";

export async function sendDriverPush(
  driver: string,
  title: string,
  body: string,
  link: string,
  reservationId?: string,
) {
  const supabaseAdmin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, fcm_token, audience")
    .eq("audience", "driver")
    .eq("user_id", driver as any)
    .limit(20);

  if (!subs?.length) return;

  const serverKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) {
    console.warn("[push] no FCM server key");
    return;
  }

  const tokens = subs
    .map((s) => s.fcm_token)
    .filter((t): t is string => typeof t === "string" && t.length > 10);

  if (!tokens.length) return;

  try {
    const res = await fetch(PUSH_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `key=${serverKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        registration_ids: tokens.slice(0, 500),
        notification: { title, body, click_action: link },
        data: { reservationId: reservationId ?? "", link },
        priority: "high",
      }),
    });
    const json = await res.json().catch(() => null);
    console.info("[push] fcm response", res.status, json);
  } catch (err) {
    console.error("[push] fcm error", err);
  }
}

export async function enqueueClientConfirmationEmail(
  reservationId: string,
  email: string,
  lang: string,
  payload: {
    clientName: string;
    pickupDatetime: string;
    depart: string;
    arrivee: string;
    priceEstimate?: number;
    trackingId: string;
  },
) {
  const supabaseAdmin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional",
    payload: {
      template_name: lang === "en" ? "reservation-confirmed-en" : "reservation-confirmed-fr",
      to: email,
      data: { ...payload, reservationId },
    },
  });
}

export async function logReservationEvent(
  reservationId: string,
  eventType: string,
  from?: string | null,
  to?: string | null,
  driver?: string | null,
  clientName?: string | null,
  depart?: string | null,
  destination?: string | null,
) {
  const supabaseAdmin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  await supabaseAdmin.from("reservation_events").insert({
    reservation_id: reservationId,
    event_type: eventType,
    from_value: from ?? undefined,
    to_value: to ?? undefined,
    driver: driver ?? undefined,
    client_name: clientName ?? undefined,
    depart: depart ?? undefined,
    destination: destination ?? undefined,
  });
}
