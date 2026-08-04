// Centralized address resolution + assistant-reply sanitization.
// - resolveAddress(): single entry point that normalizes an input address,
//   geocodes it, logs the raw reason server-side, and returns a stable
//   `{ ok, geocode, reason, hint }` shape consumed by the AI tools.
// - sanitizeAssistantReply(): guard that strips technical leakage
//   (error codes, stack traces, provider names, UPPER_SNAKE tokens) from
//   any assistant text before it reaches the client.

import { geocodeGoogle, type GoogleGeocode } from "@/lib/google.server";

export type AddressReason =
  | "OK"
  | "INPUT_EMPTY"
  | "INPUT_TOO_SHORT"
  | "NO_MATCH"
  | "LOW_CONFIDENCE";

export type ResolvedAddress =
  | { ok: true; geocode: GoogleGeocode; reason: "OK" }
  | { ok: false; reason: Exclude<AddressReason, "OK">; hint: string; input: string };

const HINTS_FR: Record<Exclude<AddressReason, "OK">, string> = {
  INPUT_EMPTY:
    "Demande poliment au client l'adresse manquante en une phrase naturelle.",
  INPUT_TOO_SHORT:
    "Demande poliment quelques précisions supplémentaires (numéro, rue, ville, ou un point de repère connu).",
  NO_MATCH:
    "Demande poliment au client de reformuler l'adresse avec un repère plus clair (numéro + rue + ville, ou un lieu connu comme Aéroport La Rochelle, Gare de La Rochelle, Vieux-Port, Zoo de La Palmyre, Aquarium de La Rochelle, Île de Ré, Île d'Oléron, Fort Boyard, plage de Royan…).",
  LOW_CONFIDENCE:
    "Reformule ce que tu as compris et demande une confirmation courte au client.",
};

const HINTS_EN: Record<Exclude<AddressReason, "OK">, string> = {
  INPUT_EMPTY:
    "Politely ask the client for the missing address in one natural sentence.",
  INPUT_TOO_SHORT:
    "Politely ask for a few more details (street number, street, city, or a known landmark).",
  NO_MATCH:
    "Politely ask the client to rephrase the address with a clearer landmark (street number + street + city, or a known place like La Rochelle Airport, La Rochelle train station, Old Port, La Palmyre Zoo, Aquarium, Île de Ré, Île d'Oléron, Fort Boyard, Royan beach…).",
  LOW_CONFIDENCE:
    "Rephrase what you understood and ask the client for a short confirmation.",
};

function hints(lang: string) {
  return lang === "en" ? HINTS_EN : HINTS_FR;
}

function preNormalize(raw: string): string {
  return raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Single source of truth for turning a free-text address into either a
 * usable geocode or a structured, non-technical reason the AI can voice
 * to the client. Provider details stay in server logs.
 */
export async function resolveAddress(
  raw: string | null | undefined,
  role: "depart" | "arrivee",
  lang = "fr",
): Promise<ResolvedAddress> {
  const input = typeof raw === "string" ? preNormalize(raw) : "";
  if (!input) {
    console.info(`[address] empty role=${role}`);
    return { ok: false, reason: "INPUT_EMPTY", hint: hints(lang).INPUT_EMPTY, input: "" };
  }
  if (input.length < 3) {
    console.info(`[address] too_short role=${role} input=${JSON.stringify(input)}`);
    return {
      ok: false,
      reason: "INPUT_TOO_SHORT",
      hint: hints(lang).INPUT_TOO_SHORT,
      input,
    };
  }
  try {
    const g = await geocodeGoogle(input);
    if (!g) {
      console.warn(`[address] no_match role=${role} input=${JSON.stringify(input)}`);
      return { ok: false, reason: "NO_MATCH", hint: hints(lang).NO_MATCH, input };
    }
    if (g.confidence < 0.5) {
      console.warn(
        `[address] low_confidence role=${role} input=${JSON.stringify(input)} label=${JSON.stringify(g.label)} confidence=${g.confidence}`,
      );
    }
    console.info(
      `[address] ok role=${role} input=${JSON.stringify(input)} label=${JSON.stringify(g.label)} confidence=${g.confidence}`,
    );
    return { ok: true, reason: "OK", geocode: g };
  } catch (err) {
    console.error(`[address] exception role=${role} input=${JSON.stringify(input)}`, err);
    return { ok: false, reason: "NO_MATCH", hint: hints(lang).NO_MATCH, input };
  }
}

/* -------------------------------------------------------------------- */
/* Assistant reply sanitizer                                             */
/* -------------------------------------------------------------------- */

// Tokens/words that must NEVER surface to the client. Case-insensitive.
const FORBIDDEN_PATTERNS: Array<{ re: RegExp; replace: string }> = [
  // Internal error codes (UPPER_SNAKE_CASE 4+ letters with underscore)
  { re: /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, replace: "" },
  // Provider / stack / infra words
  {
    re: /\b(google\s*maps?|geocoding|geocode|api\s*key|gateway|supabase|lovable|firebase|fcm|token|jwt|worker|edge\s*function|stack\s*trace|traceback|null|undefined|nan|500\b|502\b|503\b|timeout|econn[a-z]*|enotfound)\b/gi,
    replace: "",
  },
  // "erreur technique", "erreur système", "bug", "invalide"
  {
    re: /\b(erreur\s+(technique|syst[eè]me|serveur|interne|inconnue)|bug|d[eé]bogage|debug|st?acktrace|systeme|le\s+syst[eè]me|introuvable\s+dans\s+le\s+syst[eè]me)\b/gi,
    replace: "",
  },
  // "adresse invalide/introuvable" phrased as tech failure
  {
    re: /\badresse\s+(invalide|non\s+reconnue|non\s+trouv[eé]e\s+dans\s+la\s+base)\b/gi,
    replace: "adresse à préciser",
  },
];

const FALLBACK_REPLY_FR =
  "Un instant s'il vous plaît. Pourriez-vous reformuler votre demande, je souhaite être sûre de bien vous répondre ?";
const FALLBACK_REPLY_EN =
  "One moment please. Could you rephrase your request? I want to make sure I answer you correctly.";

/**
 * Guarantees the client never sees internal error tokens. If the cleaned
 * reply becomes empty or degenerate, returns a safe human fallback.
 * The original message is logged server-side for debugging.
 */
export function sanitizeAssistantReply(raw: string | null | undefined, lang = "fr"): string {
  const original = typeof raw === "string" ? raw : "";
  if (!original.trim()) return lang === "en" ? FALLBACK_REPLY_EN : FALLBACK_REPLY_FR;
  let cleaned = original;
  let mutated = false;
  for (const { re, replace } of FORBIDDEN_PATTERNS) {
    if (re.test(cleaned)) {
      mutated = true;
      cleaned = cleaned.replace(re, replace);
    }
  }
  // Collapse whitespace + orphan punctuation left by removals.
  cleaned = cleaned
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[«»"]\s*[«»"]/g, "")
    .trim();
  if (mutated) {
    console.warn(
      "[assistant-sanitize] leaked_tokens_removed original=",
      JSON.stringify(original),
      "cleaned=",
      JSON.stringify(cleaned),
    );
  }
  if (cleaned.length < 8) return lang === "en" ? FALLBACK_REPLY_EN : FALLBACK_REPLY_FR;
  return cleaned;
}
