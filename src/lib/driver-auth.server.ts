// Authentification du panneau chauffeur / admin.
// Le secret vit UNIQUEMENT côté serveur (DRIVER_PANEL_TOKEN) : aucune valeur
// par défaut n'est embarquée dans le bundle navigateur.

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isDriverToken(token: unknown): boolean {
  const expected = (process.env.DRIVER_PANEL_TOKEN || "").trim();
  if (!expected) return false; // pas de secret configuré → accès refusé
  if (typeof token !== "string") return false;
  return constantTimeEqual(token.trim(), expected);
}

export function assertDriverToken(token: unknown): void {
  if (!isDriverToken(token)) throw new Error("UNAUTHORIZED");
}
