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

function renderConfirmation(lang: string, p: ConfirmationPayload) {
  const en = lang === "en";
  const subject = en
    ? `Your ${SITE_NAME} booking is confirmed — ${p.pickupDatetime}`
    : `Réservation confirmée — ${p.pickupDatetime} · ${SITE_NAME}`;
  const rows: Array<[string, string]> = [
    [en ? "Date & time" : "Date et heure", p.pickupDatetime],
    [en ? "Pickup" : "Départ", p.depart],
    [en ? "Drop-off" : "Arrivée", p.arrivee],
    ...(p.priceEstimate ? ([[en ? "Estimated fare" : "Prix estimé", `${p.priceEstimate} €`]] as Array<[string, string]>) : []),
    [en ? "Booking reference" : "Référence", p.trackingId],
  ];
  const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#0B0B0D;">
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;">
    <div style="font-weight:800;letter-spacing:2px;color:#C6A24A;font-size:13px;">ACCESS PRESTIGE TAXI</div>
    <h1 style="font-size:22px;margin:12px 0 6px;">${en ? "Your booking is confirmed" : "Votre réservation est confirmée"}</h1>
    <p style="font-size:14px;line-height:1.6;">${en ? "Hello" : "Bonjour"} ${p.clientName},<br/>${
      en
        ? "Thank you for choosing our electric chauffeur service in Charente-Maritime."
        : "Merci d'avoir choisi notre service de chauffeur électrique en Charente-Maritime."
    }</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;color:#6b7280;">${k}</td><td style="padding:8px 0;text-align:right;font-weight:700;">${v}</td></tr>`,
        )
        .join("")}
    </table>
    ${
      p.trackingLink
        ? `<p style="margin:20px 0;"><a href="${p.trackingLink}" style="background:#C6A24A;color:#0B0B0D;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:800;display:inline-block;">${
            en ? "Track my taxi" : "Suivre mon taxi"
          }</a></p>`
        : ""
    }
    <p style="font-size:12px;color:#6b7280;">${
      en ? "Need a change? Reply to this email or call us." : "Un changement ? Répondez à cet e-mail ou appelez-nous."
    }</p>
  </div></body></html>`;
  const text = [
    en ? "Your booking is confirmed" : "Votre réservation est confirmée",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    p.trackingLink ?? "",
  ].join("\n");
  return { subject, html, text };
}

/**
 * Repli e-mail : envoie (via la file transactionnelle) la confirmation de
 * réservation. Utilisé quand le client n'a pas autorisé le push, ou en doublon
 * volontaire lorsqu'une adresse e-mail est fournie.
 */
export async function enqueueClientConfirmationEmail(
  reservationId: string,
  email: string,
  lang: string,
  payload: ConfirmationPayload,
) {
  const supabaseAdmin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  const { logPushSend } = await import("@/lib/push-log.server");
  const messageId = `resa-${reservationId}`;
  const { subject, html, text } = renderConfirmation(lang, payload);

  try {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: "reservation-client-confirmation",
      recipient_email: email,
      status: "pending",
      idempotency_key: messageId,
    });

    const { error } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: email,
        from: `${SITE_NAME} <noreply@${SENDER_DOMAIN}>`,
        reply_to: ADMIN_EMAIL,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label: "reservation-client-confirmation",
        idempotency_key: messageId,
        queued_at: new Date().toISOString(),
      } as any,
    });

    await logPushSend({
      channel: "email",
      audience: "client",
      status: error ? "failed" : "fallback_email",
      reservationId,
      recipient: email,
      title: subject,
      errorCode: error?.message ?? null,
    });
  } catch (err: any) {
    console.error("[email] confirmation enqueue failed", err);
    await logPushSend({
      channel: "email",
      audience: "client",
      status: "failed",
      reservationId,
      recipient: email,
      errorCode: String(err?.message ?? err).slice(0, 200),
    });
  }
}

/**
 * Confirmation client : push si l'appareil est abonné, sinon repli e-mail.
 * Si une adresse e-mail est fournie et qu'aucun push n'est parti, l'e-mail
 * garantit que le client reçoit bien sa confirmation.
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
          body: en
            ? `${payload.pickupDatetime} · ${payload.depart} → ${payload.arrivee}`
            : `${payload.pickupDatetime} · ${payload.depart} → ${payload.arrivee}`,
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

  if (pushSent === 0 && email) {
    await enqueueClientConfirmationEmail(reservationId, email, lang, payload);
    return { push: 0, email: true };
  }

  if (email) {
    // Push délivré : on garde une trace, sans doubler l'e-mail.
    const { logPushSend } = await import("@/lib/push-log.server");
    await logPushSend({
      audience: "client",
      status: "skipped",
      channel: "email",
      reservationId,
      recipient: email,
      title: en ? "Email fallback skipped (push delivered)" : "Repli e-mail ignoré (push délivré)",
    });
  }

  return { push: pushSent, email: false };
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
