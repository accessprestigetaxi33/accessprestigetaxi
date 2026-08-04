// Sessions client (auth maison) — vérifiées côté serveur.
// Le navigateur ne détient qu'un jeton opaque; l'identité (account_id) est
// TOUJOURS dérivée du jeton côté serveur, jamais envoyée par le client.

const SESSION_TTL_DAYS = 30;

function genToken(): string {
 const bytes = new Uint8Array(32);
 crypto.getRandomValues(bytes);
 return Array.from(bytes, (b) => b.toString(16).padStart(2"0")).join("");
}

async function hashToken(token: string): Promise<string> {
 const buf = await crypto.subtle.digest("SHA-256"new TextEncoder().encode(token));
 return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2"0")).join("");
}

export type ClientIdentity = {
 account_id: string;
 email: string;
 name: string;
 phone: string;
};

/** Crée une session serveur pour un compte client et renvoie le jeton en clair. */
export async function createClientSession(accountId: string): Promise<string> {
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const token = genToken();
 const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 3600_000).toISOString();
 const { error } = await supabaseAdmin.from("client_sessions" as any).insert({
 client_account_id: accountId,
 token_hash: await hashToken(token),
 expires_at: expires,
 });
 if (error) throw new Error("SESSION_CREATE_FAILED");
 return token;
}

/** Vérifie un jeton de session et renvoie l'identité du compte. Lève UNAUTHORIZED sinon. */
export async function requireClientSession(token: string): Promise<ClientIdentity> {
 if (!token || token.length < 32 || token.length > 128) throw new Error("UNAUTHORIZED");
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const { data: session } = await supabaseAdmin.from("client_sessions" as any).select("client_account_id, expires_at").eq("token_hash"await hashToken(token)).maybeSingle();
 if (!session) throw new Error("UNAUTHORIZED");
 if (new Date((session as any).expires_at).getTime() < Date.now()) throw new Error("UNAUTHORIZED");

 const accountId = (session as any).client_account_id as string;
 const { data: acct } = await supabaseAdmin.from("client_accounts").select("id, email, client_name, phone").eq("id"accountId).maybeSingle();
 if (!acct) throw new Error("UNAUTHORIZED");

 return {
 account_id: acct.id,
 email: acct.email??""name: acct.client_name??""phone: acct.phone??""};
}

export async function revokeClientSession(token: string): Promise<void> {
 if (!token) return;
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 await supabaseAdmin.from("client_sessions" as any).delete().eq("token_hash"await hashToken(token));
}
