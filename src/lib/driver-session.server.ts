// Vérification unique du jeton de session chauffeur, partagée par tous les
// modules serveur : le jeton reçu est une session (table driver_sessions),
// jamais le jeton permanent du compte.
import { supabaseAdmin } from "@/lib/nova-supabase.server";

export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function resolveDriverSession(
  token: string,
): Promise<{ slug: string; name: string }> {
  const db = supabaseAdmin;
  const { data: session, error: sessionError } = await db
    .from("driver_sessions")
    .select("id, slug, expires_at")
    .eq("token_hash", await hashToken(token))
    .maybeSingle();
  if (sessionError) throw new Error("lookup_failed");
  if (!session) throw new Error("invalid_token");
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await db.from("driver_sessions").delete().eq("id", session.id);
    throw new Error("session_expired");
  }
  const { data, error } = await db
    .from("driver_accounts")
    .select("slug, name, active")
    .eq("slug", session.slug)
    .maybeSingle();
  if (error) throw new Error("lookup_failed");
  if (!data || !data.active) throw new Error("invalid_token");
  return { slug: data.slug, name: data.name };
}
