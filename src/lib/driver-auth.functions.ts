import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TokenSchema = z.object({ token: z.string().trim().min(1).max(200) });

/** Vérifie le jeton chauffeur côté serveur (le secret ne quitte jamais le serveur). */
export const verifyDriverToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { resolveDriverIdentity } = await import("@/lib/driver-auth.server");
    const identity = resolveDriverIdentity(data.token);
    return { ok: identity !== null, driver: identity?.name ?? null, driverId: identity?.id ?? null };
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
    // Purge des sessions périmées (>90 s sans battement) : côté serveur uniquement,
    // le navigateur n'a pas le droit de supprimer des lignes active_visitors.
    if (data.scope === "site") {
      const cutoff = new Date(Date.now() - 90_000).toISOString();
      await supabaseAdmin.from("active_visitors").delete().lt("last_seen", cutoff);
    }
    const { data: count } = await supabaseAdmin.rpc("get_active_visitor_count" as any, {
      p_scope: data.scope,
    });
    return { count: Number(count ?? 0) };
  });


/**
 * Ouverture de session chauffeur sans mot de passe : Alain ou Patricia
 * choisissent simplement leur profil, le serveur renvoie le jeton technique
 * utilisé ensuite par toutes les fonctions du panneau.
 */
export const openDriverSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ driver: z.enum(["patricia", "alain"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { tokenForDriver } = await import("@/lib/driver-auth.server");
    const token = tokenForDriver(data.driver);
    if (!token) return { ok: false as const, token: null, driver: null };
    return {
      ok: true as const,
      token,
      driver: data.driver === "patricia" ? "Patricia" : "Alain",
    };
  });
