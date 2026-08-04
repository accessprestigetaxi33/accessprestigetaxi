import { createServerFn } from"@tanstack/react-start";
import { z } from"zod";


// Session token = chaîne opaque aléatoire, persistée (hachée) côté serveur
// dans public.client_sessions. Le navigateur ne stocke QUE ce jeton;
// l'identité du compte est toujours re-dérivée du jeton côté serveur.

const emailSchema = z.string().trim().toLowerCase().email("Email invalide").max(255);
const passwordSchema = z.string().min(6"Mot de passe: 6 caractères minimum").max(200);

const RegisterSchema = z.object({
 email: emailSchema,
 password: passwordSchema,
 name: z.string().trim().min(1"Nom requis").max(120),
 phone: z.string().trim().min(6"Téléphone requis").max(40),
});

const LoginSchema = z.object({
 email: emailSchema,
 password: passwordSchema,
});

export type ClientSession = {
 id: string;
 email: string;
 name: string;
 phone: string;
 token: string;
};

export const clientRegister = createServerFn({ method:"POST" }).inputValidator((input: unknown) => RegisterSchema.parse(input)).handler(async ({ data }): Promise<ClientSession> => {
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

 const { data: existing } = await supabaseAdmin.from("client_accounts").select("id").eq("email"data.email).maybeSingle();
 if (existing) throw new Error("EMAIL_TAKEN");

 const { default: bcrypt } = await import("bcryptjs");
 const hash = await bcrypt.hash(data.password, 10);

 const { data: row, error } = await supabaseAdmin.from("client_accounts").insert({
 email: data.email,
 client_name: data.name,
 phone: data.phone,
 }).select("id, email, client_name, phone").single();
 if (error ||!row) throw new Error("CREATE_FAILED");

 const { error: secretErr } = await supabaseAdmin.from("client_account_secrets" as any).insert({ client_account_id: row.id, password_hash: hash });
 if (secretErr) {
 // best-effort rollback
 await supabaseAdmin.from("client_accounts").delete().eq("id"row.id);
 throw new Error("CREATE_FAILED");
 }

 const { createClientSession } = await import("@/lib/client-session.server");
 const token = await createClientSession(row.id);

 return {
 id: row.id,
 email: row.email,
 name: row.client_name?? data.name,
 phone: row.phone?? data.phone,
 token,
 };
 });

export const clientLogin = createServerFn({ method:"POST" }).inputValidator((input: unknown) => LoginSchema.parse(input)).handler(async ({ data }): Promise<ClientSession> => {
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

 const { data: row } = await supabaseAdmin.from("client_accounts").select("id, email, client_name, phone").eq("email"data.email).maybeSingle();
 if (!row) throw new Error("INVALID_CREDENTIALS");

 const { data: secret } = await supabaseAdmin.from("client_account_secrets" as any).select("password_hash").eq("client_account_id"row.id).maybeSingle();
 if (!secret) throw new Error("INVALID_CREDENTIALS");

 const { default: bcrypt } = await import("bcryptjs");
 const ok = await bcrypt.compare(data.password, (secret as any).password_hash);
 if (!ok) throw new Error("INVALID_CREDENTIALS");

 const { createClientSession } = await import("@/lib/client-session.server");

 return {
 id: row.id,
 email: row.email,
 name: row.client_name??""phone: row.phone??""token: await createClientSession(row.id),
 };
 });

export const clientLogout = createServerFn({ method:"POST" }).inputValidator((input: unknown) => z.object({ token: z.string().max(200) }).parse(input)).handler(async ({ data }) => {
 const { revokeClientSession } = await import("@/lib/client-session.server");
 await revokeClientSession(data.token);
 return { ok: true };
 });
