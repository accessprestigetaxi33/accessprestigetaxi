import type { ComponentType } from "react";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

import { template as contactMessage } from "./contact-message";
import { template as reservationClientConfirmation } from "./reservation-client-confirmation";
import { template as courseAccepted } from "./course-accepted";
import { template as newReservationAdmin } from "./new-reservation-admin";
import { template as customPrice } from "./custom-price";
import { template as reservationCancelled } from "./reservation-cancelled";
import { template as reservationTracking } from "./reservation-tracking";
import { template as devisConfirmation } from "./devis-confirmation";
import { template as devisAdmin } from "./devis-admin";
import { template as rideInvoice } from "./ride-invoice";

export const TEMPLATES: Record<string, TemplateEntry> = {
  "contact-message": contactMessage,
  "reservation-client-confirmation": reservationClientConfirmation,
  "course-accepted": courseAccepted,
  "new-reservation-admin": newReservationAdmin,
  "custom-price": customPrice,
  "reservation-cancelled": reservationCancelled,
  "reservation-tracking": reservationTracking,
  "devis-confirmation": devisConfirmation,
  "devis-admin": devisAdmin,
  "ride-invoice": rideInvoice,
};
