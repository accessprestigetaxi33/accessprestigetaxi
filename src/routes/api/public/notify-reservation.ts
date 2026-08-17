import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { getPushClientStrings, normalizePushLang } from "@/lib/push-i18n.server";

const TEMPLATE_NAME = "new-reservation-admin";

const schema = z.object({
  reservation_id: z.string().uuid(),
});

export const Route = createFileRoute("/api/public/notify-reservation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const [{ getTaxiSupabaseAdmin, getTaxiSupabaseConfig }, { sendPushToAudience, claimNotificationOnce }] =
          await Promise.all([import("@/lib/taxi-supabase.server"), import("@/lib/push.server")]);
        let serviceKey = "";
        try {
          const cfg = getTaxiSupabaseConfig();
          serviceKey = cfg.serviceKey;
          console.log(
            "[notify-reservation] backend:",
            cfg.targetRef,
            "key:",
            cfg.selectedKeyName,
            "keyRef:",
            cfg.selectedRef,
          );
        } catch (err) {
          console.error("[notify-reservation] backend config failed", err);
        }

        if (!serviceKey) {
          return Response.json({ error: "Server config error" }, { status: 500 });
        }

        // Sécurité webhook : hôte autorisé + signature HMAC horodatée
        // (ou bearer service-role pour les appels internes), anti-rejeu inclus.
        const { verifyWebhookRequest, normalizeDriverKey } = await import("@/lib/webhook-security.server");
        const auth = await verifyWebhookRequest(request, { serviceKey, scope: "webhook:reservation" });
        if (!auth.ok) {
          console.warn("[notify-reservation] rejeté:", auth.error);
          return Response.json({ error: auth.error }, { status: auth.status });
        }

        let raw: unknown;
        try {
          raw = JSON.parse(auth.body);
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = schema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }
        const reservationId = parsed.data.reservation_id;
        console.log("[notify-reservation] reservationId:", reservationId);

        // Idempotence au niveau du webhook : un rejeu (retry HTTP, double
        // trigger Postgres, redelivery) ne doit jamais renvoyer l'e-mail admin
        // ni les push. Le premier appel réserve la clé pour 24 h.
        const { buildIdempotencyKey } = await import("@/lib/idempotency");
        const firstDelivery = await claimNotificationOnce(
          buildIdempotencyKey({
            event: "reservation.created",
            entity: "res",
            id: reservationId,
            channel: "webhook",
          }),
          "webhook",
          24 * 60,
        );
        if (!firstDelivery) {
          console.log("[notify-reservation] duplicate ignoré:", reservationId);
          return Response.json({ success: true, duplicate: true, emailQueued: false });
        }

        const supabase = getTaxiSupabaseAdmin();

        const BASE_COLUMNS =
          "id, nom, client_name, telephone, client_phone, email, pickup_datetime, depart, arrivee, destination, passagers, bagages, service_type, suivi_id, client_account_id, assigned_driver";

        let reservation: any = null;
        let lookupError: any = null;
        {
          // On tente d'abord avec la colonne "lang" (préférence de langue du
          // client au moment de la résa). Si la migration n'a pas encore été
          // appliquée, Postgres renvoie 42703 (colonne inconnue) → on retombe
          // sur la requête sans "lang" et on traduit en français par défaut.
          const withLang = await supabase
            .from("reservations")
            .select(`${BASE_COLUMNS}, lang`)
            .eq("id", reservationId)
            .maybeSingle();
          if (withLang.error && (withLang.error as any).code === "42703") {
            console.warn(
              "[notify-reservation] colonne 'lang' absente sur reservations — fallback fr. " +
                "Ajouter une migration: ALTER TABLE reservations ADD COLUMN lang text DEFAULT 'fr';",
            );
            const withoutLang = await supabase
              .from("reservations")
              .select(BASE_COLUMNS)
              .eq("id", reservationId)
              .maybeSingle();
            reservation = withoutLang.data;
            lookupError = withoutLang.error;
          } else {
            reservation = withLang.data;
            lookupError = withLang.error;
          }
        }
        if (lookupError) {
          console.error("[notify-reservation] lookupError:", JSON.stringify(lookupError));
          return Response.json({ error: "lookup" }, { status: 500 });
        }
        if (!reservation) return Response.json({ error: "not_found" }, { status: 404 });

        const data = {
          ...reservation,
          lang: normalizePushLang((reservation as any).lang),
          phone: reservation.telephone,
          admin_url: "https://accessprestigetaxi.lovable.app/admin/dashboard",
        };
        const template = TEMPLATES[TEMPLATE_NAME];
        if (!template || !template.to) {
          return Response.json({ error: "Template not configured" }, { status: 500 });
        }
        const recipient = template.to;
        const idempotencyKey = buildIdempotencyKey({
          event: "reservation.created",
          entity: "res",
          id: reservationId,
          channel: "email",
          discriminator: "admin",
        });

        const EMAIL_BRIDGE_URL = "https://accessprestigetaxi.lovable.app/lovable/email/transactional/send";
        console.log("[notify-reservation] → bridge:", EMAIL_BRIDGE_URL, "reservation:", reservationId);

        let emailQueued = false;
        try {
          const sendResp = await fetch(EMAIL_BRIDGE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              templateName: TEMPLATE_NAME,
              recipientEmail: recipient,
              idempotencyKey,
              templateData: data,
            }),
          });

          emailQueued = sendResp.ok;
          if (!sendResp.ok) {
            const errBody = await sendResp.text().catch(() => "");
            console.error("[notify-reservation] bridge error", sendResp.status, errBody);
          } else {
            console.log("[notify-reservation] email queued ok, reservation:", reservationId);
          }
        } catch (emailErr) {
          console.error("[notify-reservation] email bridge threw", emailErr);
        }

        // Push chauffeur — envoyé ici (côté serveur, à la création de
        // la résa) pour ne plus dépendre d'un onglet dashboard ouvert.
        const clientName = reservation.client_name || reservation.nom || "Client";
        // Validation stricte du chauffeur : seules les clés connues du site
        // bi-chauffeur sont acceptées, toute autre valeur est ignorée (broadcast).
        const assignedKey = normalizeDriverKey((reservation as any).assigned_driver);
        // Log d'audit : permet de confirmer en prod qu'une résa non assignée
        // produit bien assignedKey === null → broadcast Alain + Patricia.
        console.log(
          "[notify-reservation] assigned_driver brut:",
          JSON.stringify((reservation as any).assigned_driver ?? null),
          "→ normalizeDriverKey:",
          JSON.stringify(assignedKey),
          assignedKey ? "(ciblage chauffeur)" : "(BROADCAST tous chauffeurs)",
        );
        const assignedLabel = assignedKey ? assignedKey[0]!.toUpperCase() + assignedKey.slice(1) : "";
        const trajet = `${reservation.depart} → ${reservation.arrivee || reservation.destination || "—"}`;
        try {
          const chauffeurResult = await sendPushToAudience(
            "chauffeur",
            {
              title: assignedLabel ? `🚕 Nouvelle résa — ${assignedLabel}` : "🚕 Nouvelle résa",
              body: `${clientName} — ${trajet}`,
              url: "/driver",
              tag: buildIdempotencyKey({
                event: "reservation.created",
                entity: "res",
                id: reservationId,
                channel: "push",
                discriminator: "chauffeur",
              }),
              requireInteraction: true,
              data: { reservation_id: reservationId, kind: "new_reservation" },
            },
            { driverId: assignedKey, dedupTtlMinutes: 24 * 60 },
          );

          console.log("[notify-reservation] push chauffeur:", JSON.stringify(chauffeurResult));
        } catch (pushErr) {
          console.error("[notify-reservation] push failed", pushErr);
          // On ne fait pas échouer la requête si le push échoue — l'email est déjà parti.
        }

        // Push CLIENT — accusé de réception "en attente de validation par le taxi"
        try {
          const clientLang = normalizePushLang((reservation as any).lang);
          const push = getPushClientStrings(clientLang);
          const suiviUrl = `/suivi/${(reservation as any).suivi_id || reservationId}`;
          const clientResult = await sendPushToAudience(
            "client",
            {
              title: push.pending_title,
              body: push.pending_body(trajet),
              url: suiviUrl,
              tag: buildIdempotencyKey({
                event: "reservation.created",
                entity: "res",
                id: reservationId,
                channel: "push",
                discriminator: "client",
              }),
              requireInteraction: false,
              data: { reservation_id: reservationId, status: "pending" },
            },
            {
              reservationId,
              accountId: (reservation as any).client_account_id ?? undefined,
              dedupTtlMinutes: 24 * 60,
            },
          );
          console.log("[notify-reservation] push client:", JSON.stringify(clientResult), "lang:", clientLang);
        } catch (pushErr) {
          console.error("[notify-reservation] push client failed", pushErr);
        }

        return Response.json({ success: true, emailQueued });
      },
    },
  },
});
