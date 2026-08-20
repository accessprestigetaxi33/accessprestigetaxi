import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Coord = z.object({ lat: z.number(), lng: z.number() }).nullable().optional();

const QuoteSchema = z.object({
  depart: z.string().trim().max(300).default(""),
  depart_coord: Coord,
  arrivee: z.string().trim().max(300).default(""),
  arrivee_coord: Coord,
  pickup_datetime: z.string().min(10).max(40),
  passagers: z.number().int().min(1).max(8).default(1),
  bagages: z.number().int().min(0).max(12).default(0),
});

export type QuoteResponse =
  | {
      ok: true;
      depart: { label: string; lat: number; lng: number };
      arrivee: { label: string; lat: number; lng: number };
      distance_km: number;
      duree_s: number;
      prix: number;
      prix_detail: {
        priseEnCharge: number;
        kmJour: number;
        kmNuit: number;
        prixJour: number;
        prixNuit: number;
        regime: "jour" | "nuit" | "mixte";
      };
      vehicule: "berline" | "van";
    }
  | { ok: false; error: string };

/** Devis instantané : géocodage + itinéraire réel + tarif officiel. */
export const quoteRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuoteSchema.parse(input))
  .handler(async ({ data }): Promise<QuoteResponse> => {
    const { computeQuote } = await import("@/lib/booking.server");
    try {
      const q = await computeQuote({
        depart: data.depart,
        departCoord: data.depart_coord ?? null,
        arrivee: data.arrivee,
        arriveeCoord: data.arrivee_coord ?? null,
        pickupIso: data.pickup_datetime,
        passagers: data.passagers,
        bagages: data.bagages,
      });
      return {
        ok: true,
        depart: q.depart,
        arrivee: q.arrivee,
        distance_km: q.distanceKm,
        duree_s: q.dureeS,
        prix: q.prix.total,
        prix_detail: {
          priseEnCharge: q.prix.priseEnCharge,
          kmJour: q.prix.kmJour,
          kmNuit: q.prix.kmNuit,
          prixJour: q.prix.prixJour,
          prixNuit: q.prix.prixNuit,
          regime: q.prix.regime,
        },
        vehicule: q.vehicule,
      };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? "QUOTE_FAILED") };
    }
  });

const BookSchema = QuoteSchema.extend({
  nom: z.string().trim().min(2).max(120),
  telephone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(200).nullable().optional(),
  paiement: z.string().trim().max(40).default("cb"),
  options: z.array(z.string().trim().max(60)).max(12).default([]),
  note: z.string().trim().max(1000).default(""),
  lang: z.enum(["fr", "en"]).default("fr"),
  /** Clé d'idempotence générée par le client (anti double-clic). */
  client_request_id: z.string().trim().min(8).max(80).nullable().optional(),
});

export type BookResponse =
  | { ok: true; reservation_id: string; suivi_id: string; prix: number; distance_km: number }
  | { ok: false; error: string };

/** Confirmation : le serveur recalcule tout (prix, distance) puis enregistre. */
export const bookRide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BookSchema.parse(input))
  .handler(async ({ data }): Promise<BookResponse> => {
    const { computeQuote } = await import("@/lib/booking.server");
    const { newSuiviId } = await import("@/lib/suivi-id");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const reqId = data.client_request_id || null;

    /** Renvoie la réservation déjà créée pour cette clé, si elle existe. */
    const findExisting = async () => {
      if (!reqId) return null;
      const { data: row } = await supabaseAdmin
        .from("reservations")
        .select("id, suivi_id, prix_estime, distance_km")
        .eq("client_request_id" as any, reqId)
        .maybeSingle();
      return (row as any) ?? null;
    };

    const already = await findExisting();
    if (already) {
      return {
        ok: true,
        reservation_id: already.id,
        suivi_id: already.suivi_id,
        prix: Number(already.prix_estime ?? 0),
        distance_km: Number(already.distance_km ?? 0),
      };
    }

    let q;
    try {
      q = await computeQuote({
        depart: data.depart,
        departCoord: data.depart_coord ?? null,
        arrivee: data.arrivee,
        arriveeCoord: data.arrivee_coord ?? null,
        pickupIso: data.pickup_datetime,
        passagers: data.passagers,
        bagages: data.bagages,
      });
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? "QUOTE_FAILED") };
    }

    const suiviId = newSuiviId();
    const email = data.email || null;
    const message = [data.options.join(" · ") || null, data.note || null].filter(Boolean).join(" — ") || null;

    const { data: inserted, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        nom: data.nom,
        telephone: data.telephone,
        email,
        client_name: data.nom,
        client_phone: data.telephone,
        client_email: email,
        depart: q.depart.label,
        arrivee: q.arrivee.label,
        destination: q.arrivee.label,
        pickup_datetime: data.pickup_datetime,
        date_heure: data.pickup_datetime,
        passagers: data.passagers,
        nb_passagers: data.passagers,
        bagages: data.bagages,
        service_type: q.vehicule === "van" ? "van" : "standard",
        status: "pending",
        suivi_id: suiviId,
        distance_km: q.distanceKm,
        duree_s: q.dureeS,
        paiement: data.paiement,
        tarif_jour: q.prix.departJour,
        prix_estime: q.prix.total,
        lang: data.lang,
        message,
        source: "form",
        client_request_id: reqId,
      } as any)
      .select("id, suivi_id")
      .single();

    if (error || !inserted) {
      // Course déjà enregistrée par un clic précédent (index unique) → on renvoie l'existante.
      if ((error as any)?.code === "23505") {
        const dup = await findExisting();
        if (dup) {
          return {
            ok: true,
            reservation_id: dup.id,
            suivi_id: dup.suivi_id,
            prix: Number(dup.prix_estime ?? 0),
            distance_km: Number(dup.distance_km ?? 0),
          };
        }
      }
      console.error("[bookRide] insert failed", error);
      return { ok: false, error: "INSERT_FAILED" };
    }

    // 1) Notifications push d'abord (priorité chauffeurs), 2) e-mails ensuite.
    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      await sendPushToAudience(
        "chauffeur",
        {
          title: "🚕 Nouvelle réservation",
          body: `${q.depart.label} → ${q.arrivee.label}`,
          url: "/driver",
          tag: `new-res-${inserted.id}`,
          requireInteraction: true,
          data: { reservation_id: inserted.id, kind: "new" },
        },
        { dedupTtlMinutes: 24 * 60 },
      );
    } catch (err) {
      console.warn("[bookRide] push failed", err);
    }

    const emailResults = await Promise.allSettled([
      (async () => {
        const { deliverClientConfirmation } = await import("@/lib/reservation-notifications.server");
        const when = new Intl.DateTimeFormat(data.lang === "en" ? "en-GB" : "fr-FR", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Europe/Paris",
        }).format(new Date(data.pickup_datetime));
        await deliverClientConfirmation({
          reservationId: inserted.id,
          email,
          lang: data.lang,
          payload: {
            clientName: data.nom,
            pickupDatetime: when,
            depart: q.depart.label,
            arrivee: q.arrivee.label,
            priceEstimate: q.prix.total,
            trackingId: suiviId,
            trackingLink: `https://accessprestigetaxi.lovable.app/suivi/${suiviId}${data.lang === "en" ? "?lang=en" : ""}`,
          },
        });
      })(),
      (async () => {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const { TEMPLATES } = await import("@/lib/email-templates/registry");
        const adminTemplate = TEMPLATES["new-reservation-admin"];
        if (!adminTemplate?.to) {
          console.warn("[bookRide] admin email template sans destinataire (to) — envoi ignoré");
          return;
        }
        await sendTemplateEmail("new-reservation-admin", adminTemplate.to, {
          idempotencyKey: `admin-new-${inserted.id}`,
          templateData: {
            nom: data.nom,
            phone: data.telephone,
            email,
            depart: q.depart.label,
            arrivee: q.arrivee.label,
            pickup_datetime: data.pickup_datetime,
            passagers: data.passagers,
            bagages: data.bagages,
            admin_url: "https://accessprestigetaxi.fr/driver",
          },
        });
      })(),
    ]);
    for (const result of emailResults) {
      if (result.status === "rejected") console.warn("[bookRide] email failed", result.reason);
    }


    return {
      ok: true,
      reservation_id: inserted.id,
      suivi_id: inserted.suivi_id ?? suiviId,
      prix: q.prix.total,
      distance_km: q.distanceKm,
    };
  });
