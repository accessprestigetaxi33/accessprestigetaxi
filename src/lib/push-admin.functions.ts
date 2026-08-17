// Outils d'administration / diagnostic des notifications push.
// Toutes les fonctions sont protégées par le jeton du panneau chauffeur.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

export type PushSubRow = {
  id: string;
  audience: string;
  driver_id: string | null;
  token_suffix: string | null;
  user_agent: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  reservation_id: string | null;
  client_account_id: string | null;
};

/** Liste les abonnements push (token masqué). */
export const listPushSubscriptions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ audience: z.enum(["chauffeur", "client", "all"]).default("chauffeur") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("push_subscriptions")
      .select("id, audience, driver_id, fcm_token, user_agent, last_seen_at, created_at, reservation_id, client_account_id")
      .order("last_seen_at", { ascending: false })
      .limit(100);
    if (data.audience !== "all") q = q.eq("audience", data.audience);

    const { data: rows, error } = await q;
    if (error) {
      console.error("[push-admin] list failed", error);
      throw new Error("list_failed");
    }
    const subs: PushSubRow[] = (rows ?? []).map((r: any) => ({
      id: r.id,
      audience: r.audience,
      driver_id: r.driver_id ?? null,
      token_suffix: r.fcm_token ? String(r.fcm_token).slice(-12) : null,
      user_agent: r.user_agent ?? null,
      last_seen_at: r.last_seen_at ?? null,
      created_at: r.created_at ?? null,
      reservation_id: r.reservation_id ?? null,
      client_account_id: r.client_account_id ?? null,
    }));

    const byDriver: Record<string, number> = {};
    for (const s of subs) {
      if (s.audience !== "chauffeur") continue;
      const key = s.driver_id ?? "(sans driver_id)";
      byDriver[key] = (byDriver[key] ?? 0) + 1;
    }
    return { subs, byDriver };
  });

/** Supprime un abonnement : l'appareil se ré-inscrira au prochain retour sur /driver. */
export const forceResubscribe = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("push_subscriptions").delete().eq("id", data.id);
    if (error) throw new Error("delete_failed");
    return { ok: true };
  });

/** Derniers envois push en échec (diagnostic). */
export const listPushFailures = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ audience: z.enum(["chauffeur", "client", "all"]).default("chauffeur") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("push_send_log" as any)
      .select("id, created_at, audience, status, tag, fcm_token_suffix, http_status, error_code, title, user_agent")
      .neq("status", "sent")
      .order("created_at", { ascending: false })
      .limit(25);
    if (data.audience !== "all") q = q.eq("audience", data.audience);

    const { data: rows, error } = await q;
    if (error) {
      console.error("[push-admin] failures query failed", error);
      return { failures: [] as any[] };
    }
    return { failures: (rows ?? []) as any[] };
  });

/** Derniers envois (tous statuts) — utile pour vérifier qu'un broadcast est bien parti. */
export const listPushSends = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("push_send_log" as any)
      .select("id, created_at, audience, status, tag, fcm_token_suffix, http_status, error_code, title")
      .order("created_at", { ascending: false })
      .limit(25);
    return { sends: (rows ?? []) as any[] };
  });

/**
 * Test manuel : broadcast chauffeur (sans driverId) → doit sonner sur les
 * téléphones d'Alain ET de Patricia en même temps. Avec driverId → ciblage.
 */
export const sendChauffeurTestPush = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ driverId: z.enum(["alain", "patricia"]).nullable().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { sendPushToAudience } = await import("@/lib/push.server");
    const target = data.driverId ?? null;
    const result = await sendPushToAudience(
      "chauffeur",
      {
        title: target ? `🔔 Test — ${target}` : "🔔 Test broadcast",
        body: target
          ? `Notification ciblée pour ${target}.`
          : "Notification envoyée à tous les chauffeurs (Alain + Patricia).",
        url: "/driver",
        tag: `test-push-${target ?? "broadcast"}-${Date.now()}`,
      },
      { driverId: target, dedupTtlMinutes: 1 },
    );
    console.log("[push-admin] test push", JSON.stringify({ target, result }));
    return result;
  });
