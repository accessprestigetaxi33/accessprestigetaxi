import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron tick (daily): supprime les abonnements push expirés (expires_at < now).
 * Retourne le nombre de lignes supprimées.
 *
 * Auth : secret privé `CRON_SECRET` (header `x-cron-secret`).
 */
export const Route = createFileRoute("/api/public/hooks/push-cleanup-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronSecret } = await import("@/lib/cron-auth.server");
        const denied = requireCronSecret(request);
        if (denied) return denied;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const before = new Date().toISOString();
        const { data, error } = await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .lt("expires_at", before)
          .select("id");

        if (error) {
          console.error("[push-cleanup-tick] delete failed", error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        const removed = (data ?? []).length;
        console.log("[push-cleanup-tick] removed expired subscriptions", { removed, before });
        return Response.json({ ok: true, removed, before });
      },
    },
  },
});
