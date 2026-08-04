import { createServerFn } from"@tanstack/react-start";
import { z } from"zod";

/**
 * Panneau d'administration: gestion des chauffeurs (activation, rotation),
 * journal des événements de réservation et correction rapide des statuts.
 * Réservé au code d'administration (DRIVER_PANEL_TOKEN).
 */
const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

const STATUSES = ["pending""accepted""en_route""arrived""completed""cancelled"] as const;

async function requireAdmin(token: string) {
 const { assertDriverToken } = await import("@/lib/driver-auth.server");
 const identity = assertDriverToken(token);
 if (identity.id!=="admin") throw new Error("FORBIDDEN");
 return identity;
}

/** Vérifie que le code fourni est bien le code d'administration. */
export const verifyAdminToken = createServerFn({ method:"POST" }).inputValidator((input: unknown) => TokenSchema.parse(input)).handler(async ({ data }) => {
 const { resolveDriverIdentity } = await import("@/lib/driver-auth.server");
 const identity = resolveDriverIdentity(data.token);
 return { ok: identity?.id ==="admin" };
 });

/** Vue d'ensemble: chauffeurs, rotation, dernières courses et journal d'événements. */
export const adminOverview = createServerFn({ method:"POST" }).inputValidator((input: unknown) =>
 TokenSchema.extend({ eventLimit: z.number().int().min(10).max(300).optional() }).parse(input),
 ).handler(async ({ data }) => {
 await requireAdmin(data.token);
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

 const [drivers, rotation, events, reservations] = await Promise.all([
 supabaseAdmin.from("driver_profiles" as any).select("id,name,phone,active,sort_order,updated_at").order("sort_order"{ ascending: true }),
 supabaseAdmin.from("driver_rotation" as any).select("last_driver,updated_at").eq("id"1).maybeSingle(),
 supabaseAdmin.from("reservation_events").select("id,reservation_id,event_type,from_value,to_value,driver,client_name,depart,destination,created_at").order("created_at"{ ascending: false }).limit(data.eventLimit?? 100),
 supabaseAdmin.from("reservations").select("id,nom,client_name,telephone,depart,destination,arrivee,pickup_datetime,status,assigned_driver,prix_estime,created_at").order("pickup_datetime"{ ascending: false }).limit(80),
 ]);

 return {
 drivers: ((drivers.data as any[])?? []).map((d) => ({
 id: String(d.id),
 name: String(d.name),
 phone: d.phone?? null,
 active:!!d.active,
 sort_order: Number(d.sort_order?? 0),
 })),
 rotation: {
 last_driver: (rotation.data as any)?.last_driver?? null,
 updated_at: (rotation.data as any)?.updated_at?? null,
 },
 events: (events.data as any[])?? [],
 reservations: (reservations.data as any[])?? [],
 };
 });

/** Active ou désactive un chauffeur (un chauffeur inactif ne reçoit plus de courses). */
export const adminSetDriverActive = createServerFn({ method:"POST" }).inputValidator((input: unknown) =>
 TokenSchema.extend({ driver_id: z.string().trim().min(1).max(40), active: z.boolean() }).parse(input),
 ).handler(async ({ data }) => {
 await requireAdmin(data.token);
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

 if (!data.active) {
 const { data: actives } = await supabaseAdmin.from("driver_profiles" as any).select("id").eq("active"true);
 const remaining = ((actives as any[])?? []).filter((d) => d.id!== data.driver_id);
 if (remaining.length === 0) throw new Error("AU_MOINS_UN_CHAUFFEUR_ACTIF");
 }

 const { error } = await supabaseAdmin.from("driver_profiles" as any).update({ active: data.active } as any).eq("id"data.driver_id);
 if (error) throw new Error(error.message);
 return { ok: true };
 });

/** Force le prochain chauffeur de la rotation (on enregistre le"dernier servi"). */
export const adminSetRotation = createServerFn({ method:"POST" }).inputValidator((input: unknown) =>
 TokenSchema.extend({ last_driver: z.string().trim().min(1).max(40) }).parse(input),
 ).handler(async ({ data }) => {
 await requireAdmin(data.token);
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const { error } = await supabaseAdmin.from("driver_rotation" as any).update({ last_driver: data.last_driver, updated_at: new Date().toISOString() } as any).eq("id"1);
 if (error) throw new Error(error.message);
 return { ok: true };
 });

/** Correction rapide: statut et/ou chauffeur attribué d'une course. */
export const adminFixReservation = createServerFn({ method:"POST" }).inputValidator((input: unknown) =>
 TokenSchema.extend({
 reservation_id: z.string().uuid(),
 status: z.enum(STATUSES).optional(),
 assigned_driver: z.string().trim().min(1).max(40).optional(),
 }).parse(input),
 ).handler(async ({ data }) => {
 await requireAdmin(data.token);
 const patch: Record<string, unknown> = {};
 if (data.status) patch.status = data.status;
 if (data.assigned_driver) patch.assigned_driver = data.assigned_driver;
 if (Object.keys(patch).length === 0) return { changed: false };

 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const { data: updated, error } = await supabaseAdmin.from("reservations").update(patch as any).eq("id"data.reservation_id).select("id").maybeSingle();
 if (error) throw new Error(error.message);
 return { changed:!!updated };
 });

/** Correction en lot: statut et/ou chauffeur attribué pour plusieurs courses. */
export const adminBatchFixReservations = createServerFn({ method:"POST" }).inputValidator((input: unknown) =>
 TokenSchema.extend({
 reservation_ids: z.array(z.string().uuid()).min(1).max(200),
 status: z.enum(STATUSES).optional(),
 assigned_driver: z.string().trim().min(1).max(40).optional(),
 }).parse(input),
 ).handler(async ({ data }) => {
 await requireAdmin(data.token);
 const patch: Record<string, unknown> = {};
 if (data.status) patch.status = data.status;
 if (data.assigned_driver) patch.assigned_driver = data.assigned_driver;
 if (Object.keys(patch).length === 0) return { updated: 0 };

 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const { data: updated, error } = await supabaseAdmin.from("reservations").update(patch as any).in("id"data.reservation_ids).select("id");
 if (error) throw new Error(error.message);
 return { updated: ((updated as any[])?? []).length };
 });
