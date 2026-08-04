// Authentification du panneau chauffeur / admin.
// Les codes vivent UNIQUEMENT côté serveur : aucune valeur par défaut n'est
// embarquée dans le bundle navigateur.
//
// Secrets pris en charge :
//   DRIVER_CODE_PATRICIA → compte chauffeur Patricia
//   DRIVER_CODE_ALAIN    → compte chauffeur Alain
//   DRIVER_PANEL_TOKEN   → code d'administration (accès complet, secours)

export type DriverIdentity = { id: "patricia" | "alain" | "admin"; name: string };

const ACCOUNTS: Array<{ env: string; identity: DriverIdentity }> = [
  { env: "DRIVER_CODE_PATRICIA", identity: { id: "patricia", name: "Patricia" } },
  { env: "DRIVER_CODE_ALAIN", identity: { id: "alain", name: "Alain" } },
  { env: "DRIVER_PANEL_TOKEN", identity: { id: "admin", name: "Administration" } },
];

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Renvoie le compte chauffeur correspondant au code, ou null. */
export function resolveDriverIdentity(token: unknown): DriverIdentity | null {
  if (typeof token !== "string") return null;
  const candidate = token.trim();
  if (!candidate) return null;

  let found: DriverIdentity | null = null;
  // On parcourt tous les comptes (pas de court-circuit) pour rester en temps constant.
  for (const account of ACCOUNTS) {
    const expected = (process.env[account.env] || "").trim();
    if (!expected) continue;
    if (constantTimeEqual(candidate, expected) && !found) found = account.identity;
  }
  return found;
}

export function isDriverToken(token: unknown): boolean {
  return resolveDriverIdentity(token) !== null;
}

export function assertDriverToken(token: unknown): DriverIdentity {
  const identity = resolveDriverIdentity(token);
  if (!identity) throw new Error("UNAUTHORIZED");
  return identity;
}
