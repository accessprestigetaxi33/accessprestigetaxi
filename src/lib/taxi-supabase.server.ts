// Backend Access Prestige Taxi — projet Supabase dédié, indépendant de Lovable Cloud.
// Toute la logique serveur (réservations, messages, GPS, analytics, e-mails) passe
// par ce backend, cf. src/lib/nova-supabase.server.ts.
import { getNovaSupabaseConfig, supabaseAdmin } from "@/lib/nova-supabase.server";

export function getTaxiSupabaseConfig() {
  const { url: supabaseUrl, serviceKey } = getNovaSupabaseConfig();
  const targetRef = (() => {
    try {
      return new URL(supabaseUrl).hostname.split(".")[0] || null;
    } catch {
      return null;
    }
  })();
  return {
    supabaseUrl,
    serviceKey,
    targetRef,
    selectedKeyName: "NOVA_SUPABASE_SERVICE_ROLE_KEY",
    selectedRef: targetRef,
  };
}


export function getTaxiSupabaseAdmin() {
  return supabaseAdmin;
}
