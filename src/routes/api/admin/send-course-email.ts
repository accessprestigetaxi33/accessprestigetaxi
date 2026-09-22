import { createFileRoute } from "@tanstack/react-router";

/**
 * Bridge : /api/admin/send-course-email
 *
 * L'admin utilise un PIN custom (pas de session Supabase Auth).
 * Ce bridge tourne côté serveur et a accès à RESEND_API_KEY directement —
 * le secret n'est jamais exposé au navigateur.
 *
 * Auth : le client envoie son code chauffeur/admin réel dans l'en-tête
 * `X-Driver-Token`. Ce code est validé côté serveur contre les secrets
 * DRIVER_CODE_* / DRIVER_PANEL_TOKEN (comparaison en temps constant) avant
 * tout envoi d'e-mail. Aucune sentinelle publique n'est acceptée.
 *
 * Variables d'environnement requises (côté serveur) :
 *   DRIVER_CODE_ALAIN / DRIVER_CODE_PATRICIA / DRIVER_PANEL_TOKEN
 *   SUPABASE_SERVICE_ROLE_KEY — clé service Supabase
 *   VITE_SUPABASE_URL         — URL Supabase
 */
export const Route = createFileRoute("/api/admin/send-course-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getTaxiSupabaseConfig } = await import("@/lib/taxi-supabase.server");
        const { serviceKey } = getTaxiSupabaseConfig();

        if (!serviceKey) {
          console.error("Missing Taxi City backend service key");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Authentification réelle : code chauffeur/admin vérifié côté serveur.
        const { resolveDriverIdentity } = await import("@/lib/driver-auth.server");
        const driverToken =
          request.headers.get("X-Driver-Token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        if (!resolveDriverIdentity(driverToken)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse le body entrant
        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        // Envoi direct via Resend (aucune passerelle externe).
        const templateName = String(body["templateName"] ?? "");
        const recipientEmail = String(body["recipientEmail"] ?? "");
        if (!templateName || !recipientEmail) {
          return Response.json({ error: "templateName and recipientEmail are required" }, { status: 400 });
        }
        try {
          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
          const result = await sendTemplateEmail(templateName, recipientEmail, {
            idempotencyKey: body["idempotencyKey"] ? String(body["idempotencyKey"]) : undefined,
            templateData: (body["templateData"] as Record<string, unknown>) ?? {},
          });
          return Response.json(result);
        } catch (err) {
          console.error("[send-course-email] send failed", err);
          return Response.json({ error: "Send failed" }, { status: 502 });
        }
      },
    },
  },
});
