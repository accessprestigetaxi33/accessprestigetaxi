import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

/** Vérifie le jeton chauffeur côté serveur (le secret ne quitte jamais le serveur). */
export const verifyDriverToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { isDriverToken } = await import("@/lib/driver-auth.server");
    return { ok: isDriverToken(data.token) };
  });

/** Compteur de visiteurs actifs — réservé au tableau de bord chauffeur. */
export const getActiveVisitorCount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    TokenSchema.extend({ scope: z.enum(["site", "suivi"]).default("site") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertDriverToken } = await import("@/lib/driver-auth.server");
    assertDriverToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: count } = await supabaseAdmin.rpc("get_active_visitor_count" as any, {
      p_scope: data.scope,
    });
    return { count: Number(count ?? 0) };
  });
