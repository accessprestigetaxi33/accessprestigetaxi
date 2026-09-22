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

/**
 * Handler construit à la demande : sans LOVABLE_API_KEY (production autonome),
 * la route répond 503 au lieu de faire échouer le démarrage du serveur.
 */
let handler: ((request: Request) => Promise<Response> | Response) | null = null;

function getHandler() {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  if (handler) return handler;
  handler = createEmailWebhookHandler({
    apiKey,
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
  return handler;
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const h = getHandler();
        if (!h) return new Response("email events disabled", { status: 503 });
        return h(request);
      },
    },
  },
});
