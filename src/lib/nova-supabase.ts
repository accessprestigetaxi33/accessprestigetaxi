// Client Supabase navigateur — projet Access Prestige Taxi DÉDIÉ (indépendant de Lovable Cloud).
//
// L'URL et la clé « publishable » sont des valeurs publiques (elles transitent de
// toute façon dans le navigateur) : les écrire ici garantit que le site continue
// de fonctionner même si l'infrastructure de développement Lovable est coupée.
// La sécurité repose sur les policies RLS de la base, jamais sur le secret de
// cette clé. La clé de service (secrète) n'apparaît QUE côté serveur.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { brokeredPreviewStorage } from "@/integrations/supabase/previewAuthStorage";

export const NOVA_SUPABASE_URL =
  (import.meta.env.VITE_NOVA_SUPABASE_URL as string | undefined) ||
  "https://ndclargxvgpgifkmsruv.supabase.co";

export const NOVA_SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_NOVA_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  "sb_publishable_7Yg1VIkIth0PM-P2yFppyQ_i3kvuCAk";

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
    // Les nouvelles clés Supabase sont opaques, pas des JWT bearer.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createNovaClient() {
  return createClient<Database>(NOVA_SUPABASE_URL, NOVA_SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: createSupabaseFetch(NOVA_SUPABASE_PUBLISHABLE_KEY) },
    auth: {
      storage: typeof window === "undefined" ? undefined : brokeredPreviewStorage(),
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
    },
  });
}

let _client: ReturnType<typeof createNovaClient> | undefined;

/** Client Supabase public (anon) du projet dédié Access Prestige Taxi. */
export const supabase = new Proxy({} as ReturnType<typeof createNovaClient>, {
  get(_, prop, receiver) {
    if (!_client) _client = createNovaClient();
    return Reflect.get(_client, prop, receiver);
  },
});
