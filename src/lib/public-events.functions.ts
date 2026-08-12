import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Points d'entrée publics (analytics, ouverture d'un lien de suivi, demande de
 * trajet récurrent) exécutés côté serveur.
 *
 * Les fonctions SQL correspondantes sont `SECURITY DEFINER` : elles ne sont plus
 * exécutables par les rôles `anon` / `authenticated` via la Data API. Le
 * navigateur passe désormais par ces fonctions serveur, qui valident les
 * entrées puis appellent la RPC avec le client de service.
 */

export const logSiteEvent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        event: z.string().trim().min(1).max(100),
        session_id: z.string().trim().min(1).max(100),
        page: z.string().max(500).default(""),
        referrer: z.string().max(1000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("log_site_event", {
      p_event: data.event,
      p_session_id: data.session_id,
      p_page: data.page,
      p_referrer: data.referrer,
    });
    return { ok: !error };
  });

export const logTrackingEvent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        key: z.string().trim().min(6).max(200),
        event_type: z.string().trim().min(1).max(60),
        source: z.string().trim().max(60).default("direct"),
        user_agent: z.string().max(200).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("log_tracking_event", {
      p_key: data.key,
      p_event_type: data.event_type,
      p_source: data.source,
      p_user_agent: data.user_agent,
    });
    return { ok: !error };
  });

export const requestRecurringRide = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        key: z.string().trim().min(6).max(200),
        frequency: z.enum(["weekly", "biweekly", "monthly"]),
        day_of_week: z.number().int().min(0).max(6),
        time_hhmm: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("request_recurring_ride", {
      p_key: data.key,
      p_frequency: data.frequency,
      p_day_of_week: data.day_of_week,
      p_time_hhmm: data.time_hhmm,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: ok !== false };
  });
