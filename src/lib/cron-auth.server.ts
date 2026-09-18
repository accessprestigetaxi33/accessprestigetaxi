/**
 * Authentification des tâches planifiées (`/api/public/hooks/*`).
 *
 * Les hooks cron étaient auparavant protégés par la clé Supabase
 * anon/publishable — valeur publique embarquée dans le bundle navigateur,
 * donc sans aucune valeur de protection. On utilise désormais `CRON_SECRET`,
 * un secret privé connu uniquement du planificateur et du serveur.
 *
 * Le bearer service-role reste accepté pour les appels internes serveur→serveur.
 */

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Renvoie `null` si l'appelant est autorisé, sinon la réponse d'erreur à
 * retourner immédiatement.
 */
export function requireCronSecret(request: Request): Response | null {
  const secret = (process.env["CRON_SECRET"] || "").trim();
  if (!secret) {
    console.error("[cron-auth] CRON_SECRET manquant — hook refusé");
    return new Response(JSON.stringify({ error: "cron_secret_missing" }), { status: 500 });
  }

  const provided = (
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  ).trim();

  const serviceKey = (process.env["SUPABASE_SERVICE_ROLE_KEY"] || "").trim();
  const authorized =
    (!!provided && constantTimeEqual(provided, secret)) ||
    (!!provided && !!serviceKey && constantTimeEqual(provided, serviceKey));

  if (!authorized) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  return null;
}
