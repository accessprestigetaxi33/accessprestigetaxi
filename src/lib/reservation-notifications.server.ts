// Notifications de réservation — push (FCM) + repli e-mail
// Site bi-chauffeur : les deux chauffeurs (Patricia, Alain) partagent
// l'audience "chauffeur" ; le repli e-mail sert quand le client n'a pas
// autorisé les notifications push.

const SITE_NAME = "Access Prestige Taxi";
const SENDER_DOMAIN = "accessprestigetaxi.fr";
const ADMIN_EMAIL = "taxipatricia@gmail.com";

/**
 * Notifie les chauffeurs d'une nouvelle course (audience partagée "chauffeur").
 * Conservé sous ce nom pour compatibilité des appels existants.
 */
export async function sendDriverPush(
  _driver: string,
  title: string,
  body: string,
  link: string,
  reservationId?: string,
) {
  const { sendPushToAudience } = await import("@/lib/push.server");
  try {
    return await sendPushToAudience(
      "chauffeur",
      {
        title,
        body,
        url: link,
        tag: reservationId ? `res-${reservationId}-new` : "res-new",
        requireInteraction: true,
      },
      { reservationId },
    );
  } catch (err) {
    console.error("[push] driver notify failed", err);
    return { sent: 0, removed: 0 };
  }
}

/** Nombre d'appareils client abonnés au push pour cette réservation. */
export async function countClientPushDevices(reservationId: string): Promise<number> {
  const supabaseAdmin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  const { count } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("audience", "client")
    .eq("reservation_id", reservationId)
    .not("fcm_token", "is", null);
  return count ?? 0;
}

type ConfirmationPayload = {
  clientName: string;
  pickupDatetime: string;
  depart: string;
  arrivee: string;
  priceEstimate?: number;
  trackingId: string;
  trackingLink?: string;
};

const SITE_URL = "https://accessprestigetaxi.fr";

function normLang(lang?: string | null): "fr" | "en" {
  return lang === "en" ? "en" : "fr";
}

/**
 * Confirmation client par e-mail (modèle bilingue FR/EN, envoi géré par
 * l'infrastructure e-mail Lovable — suppression/rebonds gérés côté serveur).
 */
export async function sendClientConfirmationEmail(
  reservationId: string,
  email: string,
  lang: string,
  payload: ConfirmationPayload,
) {
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const { logPushSend } = await import("@/lib/push-log.server");
  const trackingLink = payload.trackingLink ?? `${SITE_URL}/suivi/${payload.trackingId}`;

  try {
    const result = await sendTemplateEmail("reservation-client-confirmation", email, {
      idempotencyKey: `reservation-client-confirmation-${reservationId}`,
      replyTo: ADMIN_EMAIL,
      templateData: {
        lang: normLang(lang),
        nom: payload.clientName,
        pickup_datetime: payload.pickupDatetime,
        depart: payload.depart,
        arrivee: payload.arrivee,
        reservation_id: reservationId,
        suivi_url: trackingLink,
      },
    });

    await logPushSend({
      channel: "email",
      audience: "client",
      status: result.sent ? "sent" : "skipped",
      reservationId,
      recipient: email,
      title: `confirmation (${normLang(lang)})`,
      errorCode: result.sent ? null : result.reason,
    });
    return result;
  } catch (err: any) {
    console.error("[email] confirmation send failed", err);
    await logPushSend({
      channel: "email",
      audience: "client",
      status: "failed",
      reservationId,
      recipient: email,
      errorCode: String(err?.code ?? err?.message ?? err).slice(0, 200),
    });
    return { sent: false as const, reason: "error" };
  }
}

/** Alias historique — conservé pour les appels existants. */
export const enqueueClientConfirmationEmail = sendClientConfirmationEmail;

/** E-mail d'annulation de réservation (FR/EN). */
export async function sendClientCancellationEmail(args: {
  reservationId: string;
  email: string;
  lang?: string | null;
  clientName?: string | null;
  pickupDatetime?: string | null;
  depart?: string | null;
  arrivee?: string | null;
  reason?: string | null;
}) {
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const { logPushSend } = await import("@/lib/push-log.server");
  try {
    const result = await sendTemplateEmail("reservation-cancelled", args.email, {
      idempotencyKey: `reservation-cancelled-${args.reservationId}`,
      replyTo: ADMIN_EMAIL,
      templateData: {
        lang: normLang(args.lang),
        nom: args.clientName ?? "",
        pickup_datetime: args.pickupDatetime ?? undefined,
        depart: args.depart ?? undefined,
        arrivee: args.arrivee ?? undefined,
        reservation_id: args.reservationId,
        reason: args.reason ?? undefined,
        rebook_url: `${SITE_URL}/reserver`,
      },
    });
    await logPushSend({
      channel: "email",
      audience: "client",
      status: result.sent ? "sent" : "skipped",
      reservationId: args.reservationId,
      recipient: args.email,
      title: `annulation (${normLang(args.lang)})`,
      errorCode: result.sent ? null : result.reason,
    });
    return result;
  } catch (err: any) {
    console.error("[email] cancellation send failed", err);
    await logPushSend({
      channel: "email",
      audience: "client",
      status: "failed",
      reservationId: args.reservationId,
      recipient: args.email,
      errorCode: String(err?.code ?? err?.message ?? err).slice(0, 200),
    });
    return { sent: false as const, reason: "error" };
  }
}

/** E-mail de suivi de course (confirmée / en route / arrivé / terminée). */
export async function sendClientTrackingEmail(args: {
  reservationId: string;
  email: string;
  stage: "accepted" | "en_route" | "arrived" | "completed";
  lang?: string | null;
  clientName?: string | null;
  depart?: string | null;
  arrivee?: string | null;
  pickupDatetime?: string | null;
  driverName?: string | null;
  etaMinutes?: number | null;
  trackingId?: string | null;
}) {
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const { logPushSend } = await import("@/lib/push-log.server");
  const suiviUrl = `${SITE_URL}/suivi/${args.trackingId ?? args.reservationId}`;
  try {
    const result = await sendTemplateEmail("reservation-tracking", args.email, {
      idempotencyKey: `reservation-tracking-${args.stage}-${args.reservationId}`,
      replyTo: ADMIN_EMAIL,
      templateData: {
        lang: normLang(args.lang),
        stage: args.stage,
        nom: args.clientName ?? "",
        depart: args.depart ?? undefined,
        arrivee: args.arrivee ?? undefined,
        pickup_datetime: args.pickupDatetime ?? undefined,
        driver_name: args.driverName ?? undefined,
        eta_minutes: args.etaMinutes ?? undefined,
        reservation_id: args.reservationId,
        suivi_url: suiviUrl,
      },
    });
    await logPushSend({
      channel: "email",
      audience: "client",
      status: result.sent ? "sent" : "skipped",
      reservationId: args.reservationId,
      recipient: args.email,
      title: `suivi ${args.stage} (${normLang(args.lang)})`,
      errorCode: result.sent ? null : result.reason,
    });
    return result;
  } catch (err: any) {
    console.error("[email] tracking send failed", err);
    await logPushSend({
      channel: "email",
      audience: "client",
      status: "failed",
      reservationId: args.reservationId,
      recipient: args.email,
      errorCode: String(err?.code ?? err?.message ?? err).slice(0, 200),
    });
    return { sent: false as const, reason: "error" };
  }
}

/**
 * Confirmation client : push (si abonné) ET e-mail systématique dès qu'une
 * adresse est fournie — le client doit toujours recevoir son récapitulatif
 * et son lien de suivi.
 */
export async function deliverClientConfirmation(args: {
  reservationId: string;
  email?: string | null;
  lang: string;
  payload: ConfirmationPayload;
}) {
  const { reservationId, email, lang, payload } = args;
  const en = lang === "en";
  let pushSent = 0;

  try {
    const devices = await countClientPushDevices(reservationId);
    if (devices > 0) {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const res = await sendPushToAudience(
        "client",
        {
          title: en ? "Booking confirmed" : "Réservation confirmée",
          body: `${payload.pickupDatetime} · ${payload.depart} → ${payload.arrivee}`,
          url: payload.trackingLink ?? `/suivi/${payload.trackingId}`,
          tag: `res-${reservationId}-confirmed`,
          requireInteraction: true,
        },
        { reservationId },
      );
      pushSent = res.sent;
    }
  } catch (err) {
    console.error("[push] client confirmation failed", err);
  }

  let emailSent = false;
  if (email) {
    const result = await sendClientConfirmationEmail(reservationId, email, lang, payload);
    emailSent = result.sent === true;
  }

  return { push: pushSent, email: emailSent };
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
