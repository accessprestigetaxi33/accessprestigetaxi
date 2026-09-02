import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Borne la durée d'une opération annexe (push, e-mail, géocodage externe) pour
 * qu'elle ne puisse jamais retarder indéfiniment la réponse HTTP — vécu en
 * pratique quand un service tiers (FCM, SMTP…) reste en suspens sans jamais
 * résoudre ni rejeter. `label` sert uniquement au diagnostic dans les logs.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`TIMEOUT:${label}`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

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
      const q = await withTimeout(
        computeQuote({
          depart: data.depart,
          departCoord: data.depart_coord ?? null,
          arrivee: data.arrivee,
          arriveeCoord: data.arrivee_coord ?? null,
          pickupIso: data.pickup_datetime,
          passagers: data.passagers,
          bagages: data.bagages,
        }),
        15_000,
        "quote",
      );
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
  /** Modèle choisi explicitement par le client sur la carte véhicule (BookingStudio).
   * Optionnel/nullable pour rester compatible avec d'anciens clients qui
   * n'enverraient pas ce champ. Le tarif n'en dépend pas (identique pour bmw
   * et q6) ; seul "van" peut faire basculer `service_type` — voir plus bas. */
  vehicule_prefere: z.enum(["bmw", "q6", "van"]).nullable().optional(),
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
      q = await withTimeout(
        computeQuote({
          depart: data.depart,
          departCoord: data.depart_coord ?? null,
          arrivee: data.arrivee,
          arriveeCoord: data.arrivee_coord ?? null,
          pickupIso: data.pickup_datetime,
          passagers: data.passagers,
          bagages: data.bagages,
        }),
        12_000,
        "quote",
      );
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? "QUOTE_FAILED") };
    }

    const suiviId = newSuiviId();
    const email = data.email || null;
    // Libellé lisible du modèle souhaité, pour le chauffeur et l'admin — le
    // véhicule précis (BMW iX1 / Audi Q6 e-tron) n'existe pas comme colonne
    // dédiée ; seul le van a un impact sur `service_type` (voir ci-dessous).
    const vehiculeLabel =
      data.vehicule_prefere === "van"
        ? "Van"
        : data.vehicule_prefere === "bmw"
          ? "BMW iX1"
          : data.vehicule_prefere === "q6"
            ? "Audi Q6 e-tron"
            : null;
    const message =
      [
        vehiculeLabel ? `Véhicule souhaité : ${vehiculeLabel}` : null,
        data.options.join(" · ") || null,
        data.note || null,
      ]
        .filter(Boolean)
        .join(" — ") || null;
    // `service_type` ne connaît que "van" / "standard" (valeur déjà lue
    // ailleurs, ex. tableau chauffeur) : on le bascule sur "van" si le calcul
    // serveur l'impose (>5 passagers) OU si le client l'a demandé explicitement,
    // même pour un trajet qui tiendrait en berline (confort). On ne touche pas
    // au tarif calculé par `computeQuote`, qui reste basé sur le trajet réel.
    const serviceType = q.vehicule === "van" || data.vehicule_prefere === "van" ? "van" : "standard";

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
        service_type: serviceType,
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
    // Bornées dans le temps : la réservation est déjà en base à ce stade,
    // aucun de ces envois annexes ne doit pouvoir retarder indéfiniment la
    // réponse renvoyée au client.
    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      await withTimeout(
        sendPushToAudience(
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
        ),
        5_000,
        "push",
      );
    } catch (err) {
      console.warn("[bookRide] push failed", err);
    }

    const emailResults = await Promise.allSettled([
      withTimeout(
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
        8_000,
        "client-email",
      ),
      withTimeout(
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
              vehicule: vehiculeLabel ?? (serviceType === "van" ? "Van" : undefined),
              admin_url: "https://accessprestigetaxi.fr/driver",
            },
          });
        })(),
        8_000,
        "admin-email",
      ),
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
