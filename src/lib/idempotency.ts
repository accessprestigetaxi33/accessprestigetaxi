/**
 * Clés d'idempotence normalisées.
 *
 * Format : `<version>:<domaine>.<événement>:<entité>:<id>[:<discriminant>]`
 * Exemple : `v1:reservation.created:res:8f3c…:email-admin`
 *
 * Pourquoi une structure normalisée ?
 *  - stable dans le temps : la clé ne dépend plus d'une chaîne écrite à la main
 *    à chaque appel (risque de divergence entre deux chemins de code) ;
 *  - versionnée : `SCHEMA_VERSION` permet de faire évoluer le format sans
 *    provoquer de collision avec les clés déjà consommées (un bump de version
 *    invalide proprement l'historique au lieu de le corrompre) ;
 *  - lisible dans les logs et dans `push_dedup` / `email_send_log`.
 */

export const IDEMPOTENCY_SCHEMA_VERSION = "v1" as const;

/** Événements métier pouvant déclencher une notification (push, e-mail, webhook). */
export type IdempotencyEvent =
  | "reservation.created"
  | "reservation.cancelled"
  | "reservation.rescheduled"
  | "reservation.status.accepted"
  | "reservation.status.en_route"
  | "reservation.status.arrived"
  | "reservation.status.completed"
  | "chat.message"
  | "review.created";

/** Type d'entité porteuse de l'identifiant. */
export type IdempotencyEntity = "res" | "client" | "driver" | "msg";

export type IdempotencyChannel = "push" | "email" | "webhook";

export interface IdempotencyKeyInput {
  event: IdempotencyEvent;
  entity: IdempotencyEntity;
  /** Identifiant stable de l'entité (uuid de réservation, id de compte…). */
  id: string;
  /** Canal concerné — évite qu'un push consomme la clé de l'e-mail. */
  channel?: IdempotencyChannel;
  /**
   * Discriminant optionnel pour les événements légitimement répétables
   * (ex. horodatage cible d'un report). Normalisé en minuscules sans espaces.
   */
  discriminator?: string | number | null;
}

function slug(value: string | number): string {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/** Construit une clé d'idempotence normalisée et déterministe. */
export function buildIdempotencyKey(input: IdempotencyKeyInput): string {
  const parts = [
    IDEMPOTENCY_SCHEMA_VERSION,
    input.event,
    input.entity,
    slug(input.id),
  ];
  if (input.channel) parts.push(input.channel);
  if (input.discriminator !== undefined && input.discriminator !== null && input.discriminator !== "") {
    parts.push(slug(input.discriminator));
  }
  return parts.join(":");
}

/** Raccourci pour les événements de statut de course. */
export function reservationStatusEvent(
  status: "accepted" | "en_route" | "arrived" | "completed",
): IdempotencyEvent {
  return `reservation.status.${status}` as IdempotencyEvent;
}
