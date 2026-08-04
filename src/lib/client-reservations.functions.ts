import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ClientReservation = {
  id: string;
  pickup_datetime: string;
  depart: string;
  arrivee: string | null;
  destination: string | null;
  status: string;
  prix_estime: number | null;
  nb_passagers: number | null;
  passagers: number | null;
  bagages: number | null;
  suivi_id: string | null;
  tracking_id: string | null;
  paiement: string | null;
  client_account_id: string | null;
  phone_cancel_requested_at: string | null;
  source: string | null;
  created_at: string | null;
};

const IdentitySchema = z.object({
  token: z.string().min(32).max(128),
});

function normalizePhone(p?: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/\D+/g, "");
  return digits.length >= 6 ? digits.slice(-9) : null;
}

export const listClientReservations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdentitySchema.parse(input))
  .handler(async ({ data }): Promise<ClientReservation[]> => {
    const { requireClientSession } = await import("@/lib/client-session.server");
    const identity = await requireClientSession(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cols =
      "id, pickup_datetime, depart, arrivee, destination, status, prix_estime, nb_passagers, passagers, bagages, suivi_id, tracking_id, paiement, client_account_id, phone_cancel_requested_at, source, created_at, client_phone, telephone, client_email, email";

    const { data: byAccount } = await supabaseAdmin
      .from("reservations")
      .select(cols)
      .eq("client_account_id", identity.account_id);

    const phoneTail = normalizePhone(identity.phone);
    let byPhone: any[] = [];
    if (phoneTail) {
      const { data: rows } = await supabaseAdmin
        .from("reservations")
        .select(cols)
        .is("client_account_id", null)
        .or(`client_phone.ilike.%${phoneTail},telephone.ilike.%${phoneTail}`);
      byPhone = rows ?? [];
    }

    let byEmail: any[] = [];
    if (identity.email) {
      const { data: rows } = await supabaseAdmin
        .from("reservations")
        .select(cols)
        .is("client_account_id", null)
        .or(`client_email.eq.${identity.email},email.eq.${identity.email}`);
      byEmail = rows ?? [];
    }

    const all = [...(byAccount ?? []), ...byPhone, ...byEmail];
    const seen = new Set<string>();
    const unique = all.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    unique.sort(
      (a, b) =>
        new Date(b.pickup_datetime).getTime() - new Date(a.pickup_datetime).getTime(),
    );
    return unique.map((r) => ({
      id: r.id,
      pickup_datetime: r.pickup_datetime,
      depart: r.depart,
      arrivee: r.arrivee,
      destination: r.destination,
      status: r.status,
      prix_estime: r.prix_estime,
      nb_passagers: r.nb_passagers,
      passagers: r.passagers,
      bagages: r.bagages,
      suivi_id: r.suivi_id,
      tracking_id: r.tracking_id,
      paiement: r.paiement,
      client_account_id: r.client_account_id,
      phone_cancel_requested_at: r.phone_cancel_requested_at ?? null,
      source: (r as any).source ?? null,
      created_at: (r as any).created_at ?? null,
    }));
  });

async function assertOwnership(
  reservationId: string,
  identity: { account_id: string; phone?: string | null; email?: string | null },
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: r } = await supabaseAdmin
    .from("reservations")
    .select("id, client_account_id, client_phone, telephone, client_email, email, status")
    .eq("id", reservationId)
    .maybeSingle();
  if (!r) throw new Error("NOT_FOUND");
  if (r.client_account_id === identity.account_id) return r;
  const phoneTail = normalizePhone(identity.phone);
  const matchPhone =
    !!phoneTail &&
    (normalizePhone(r.client_phone) === phoneTail ||
      normalizePhone(r.telephone) === phoneTail);
  const matchEmail =
    !!identity.email &&
    ((r.client_email || "").toLowerCase() === identity.email.toLowerCase() ||
      (r.email || "").toLowerCase() === identity.email.toLowerCase());
  if (!matchPhone && !matchEmail) throw new Error("FORBIDDEN");
  return r;
}

const UpdateTimeSchema = IdentitySchema.extend({
  reservation_id: z.string().uuid(),
  pickup_datetime: z.string().datetime({ offset: true }).or(z.string().min(10)),
});

export const updateReservationTime = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UpdateTimeSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireClientSession } = await import("@/lib/client-session.server");
    const identity = await requireClientSession(data.token);
    const r = await assertOwnership(data.reservation_id, identity);
    if (!["nouvelle", "pending", "accepted", "en_route", "arrived"].includes(r.status)) {
      throw new Error("STATUS_LOCKED");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reservations")
      .update({ pickup_datetime: new Date(data.pickup_datetime).toISOString() })
      .eq("id", data.reservation_id);
    if (error) throw new Error("UPDATE_FAILED");

    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      const when = new Date(data.pickup_datetime).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Europe/Paris",
      });
      await sendPushToAudience("chauffeur", {
        title: "⏰ Modification d'heure",
        body: `Le client a modifié l'heure de sa course : ${when}`,
        url: "/admin/dashboard",
        tag: `modif-heure-${data.reservation_id}`,
        requireInteraction: true,
      });
    } catch (e) {
      console.warn("[client] push modif-heure failed", e);
    }

    return { ok: true };
  });

const CancelSchema = IdentitySchema.extend({
  reservation_id: z.string().uuid(),
});

export const cancelClientReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CancelSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireClientSession } = await import("@/lib/client-session.server");
    const identity = await requireClientSession(data.token);
    const r = await assertOwnership(data.reservation_id, identity);
    if (!["nouvelle", "pending", "accepted"].includes(r.status)) {
      throw new Error("STATUS_LOCKED");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", data.reservation_id);
    if (error) throw new Error("CANCEL_FAILED");

    try {
      const { sendPushToAudience } = await import("@/lib/push.server");
      await sendPushToAudience("chauffeur", {
        title: "❌ Course annulée",
        body: "Le client a annulé sa réservation.",
        url: "/admin/dashboard",
        tag: `cancel-${data.reservation_id}`,
      });
    } catch (e) {
      console.warn("[client] push cancel failed", e);
    }

    return { ok: true };
  });

export const requestPhoneCancellation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CancelSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireClientSession } = await import("@/lib/client-session.server");
    const identity = await requireClientSession(data.token);
    await assertOwnership(data.reservation_id, identity);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reservations")
      .update({ phone_cancel_requested_at: new Date().toISOString() })
      .eq("id", data.reservation_id);
    if (error) throw new Error("UPDATE_FAILED");
    return { ok: true };
  });
