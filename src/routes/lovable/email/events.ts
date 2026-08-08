import { createFileRoute } from "@tanstack/react-router";
import { createEmailWebhookHandler } from "@lovable.dev/email-js";

/**
 * Webhook d'événements e-mail (rebonds, plaintes, désabonnements).
 * Lovable supprime déjà ces destinataires côté serveur — ce journal sert
 * uniquement au suivi de la réputation d'envoi côté admin/chauffeur.
 */
async function logEmailEvent(status: string, recipient: string, detail?: string) {
  try {
    const { logPushSend } = await import("@/lib/push-log.server");
    await logPushSend({
      channel: "email",
      audience: "client",
      status,
      recipient,
      title: `email:${status}`,
      body: detail ?? null,
    });
  } catch (err) {
    console.error("[email-events] log failed", err);
  }
}

const handler = createEmailWebhookHandler({
  apiKey: process.env["LOVABLE_API_KEY"]!,
  on: {
    "email.bounced": async (event) => {
      console.warn("[email-events] bounce", event.data.recipient);
      await logEmailEvent("bounced", event.data.recipient, event.data.message_id);
    },
    "email.complaint": async (event) => {
      console.warn("[email-events] complaint", event.data.recipient);
      await logEmailEvent("complaint", event.data.recipient, event.data.message_id);
    },
    "email.unsubscribed": async (event) => {
      await logEmailEvent("unsubscribed", event.data.recipient, event.data.message_id);
    },
  },
});

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => handler(request),
    },
  },
});
