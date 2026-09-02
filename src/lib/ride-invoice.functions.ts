import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Envoi de la facture de course au client une fois la course terminée.
 * Protégé par le jeton chauffeur. Idempotent : `invoice_sent_at` est écrit
 * après l'envoi et un second appel ne renvoie pas d'e-mail.
 */
export const sendRideInvoice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().trim().min(1).max(200),
        reservation_id: z.string().uuid(),
        force: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: resa, error } = await supabaseAdmin
      .from("reservations")
      .select(
        "id,nom,client_name,email,client_email,depart,arrivee,destination,pickup_datetime,date_heure,distance_km,prix_estime,final_price,suivi_id,tracking_id,lang,invoice_sent_at",
      )
      .eq("id", data.reservation_id)
      .maybeSingle();

    if (error) throw new Error(`invoice_load_failed: ${error.message}`);
    if (!resa) return { sent: false as const, reason: "not_found" as const };
    if (resa.invoice_sent_at && !data.force) {
      return { sent: false as const, reason: "already_sent" as const };
    }

    const to = (resa.client_email || resa.email || "").trim();
    if (!to) return { sent: false as const, reason: "no_email" as const };

    const lang = resa.lang === "en" ? "en" : "fr";
    const amount = resa.final_price ?? resa.prix_estime ?? null;
    const key = resa.suivi_id || resa.tracking_id || resa.id;
    const suiviUrl = `https://www.accessprestigetaxi.fr/suivi/${key}`;

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const result = await sendTemplateEmail("ride-invoice", to, {
      idempotencyKey: `ride-invoice-${resa.id}`,
      templateData: {
        lang,
        nom: resa.client_name || resa.nom || "",
        depart: resa.depart ?? "",
        arrivee: resa.arrivee || resa.destination || "",
        pickup_datetime: resa.pickup_datetime || resa.date_heure || "",
        distance_km: resa.distance_km != null ? `${Number(resa.distance_km).toFixed(1)} km` : "",
        prix:
          amount != null
            ? new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(Number(amount))
            : "",
        reservation_id: resa.id,
        suivi_url: suiviUrl,
      },
    });

    await supabaseAdmin
      .from("reservations")
      .update({ invoice_sent_at: new Date().toISOString() })
      .eq("id", resa.id);

    return { sent: result.sent, reason: result.sent ? null : result.reason };
  });
