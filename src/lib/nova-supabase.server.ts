// Client Supabase serveur (clé de service) — projet Access Prestige Taxi DÉDIÉ.
//
// Indépendant de Lovable Cloud : on lit d'abord les variables NOVA_*, avec un
// repli sur les variables historiques SUPABASE_* pour ne jamais casser un
// environnement de développement qui ne les aurait pas encore.
// SECURITY : ce module est server-only (suffixe .server.ts). Ne jamais l'importer
// depuis un composant ; dans un *.functions.ts, l'importer DANS le handler.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export function getNovaSupabaseConfig() {
  const url = process.env["NOVA_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const serviceKey =
    process.env["NOVA_SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const publishableKey =
    process.env["NOVA_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NOVA_SUPABASE_URL / NOVA_SUPABASE_SERVICE_ROLE_KEY (backend Access Prestige Taxi)",
    );
  }
  return { url, serviceKey, publishableKey: publishableKey ?? null };
}

function createNovaAdminClient() {
  const { url, serviceKey } = getNovaSupabaseConfig();
  return createClient<Database>(url, serviceKey, {
    global: { fetch: createSupabaseFetch(serviceKey) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

let _admin: ReturnType<typeof createNovaAdminClient> | undefined;

/** Client service-role (contourne RLS) du projet dédié Access Prestige Taxi. */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createNovaAdminClient>, {
  get(_, prop, receiver) {
    if (!_admin) _admin = createNovaAdminClient();
    return Reflect.get(_admin, prop, receiver);
  },
});
