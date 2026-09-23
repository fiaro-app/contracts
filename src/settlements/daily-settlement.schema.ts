import { z } from 'zod';
import {
  BusinessDateSchema,
  CopAmountSchema,
  IdSchema,
  NoteSchema,
  TimestampSchema,
} from '../common';
import type { PaymentMethod } from '../payments';

/**
 * - `PENDING`: enviado por el cobrador, sin revisar.
 * - `APPROVED`: el prestamista lo aprobó.
 * - `REJECTED`: el prestamista lo rechazó. Es informativo: no bloquea la ruta del día siguiente
 *   y el cobrador puede reenviarlo con una aclaración.
 */
export const SettlementStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type SettlementStatus = z.infer<typeof SettlementStatusSchema>;

const collectedByMethodShape = {
  CASH: CopAmountSchema,
  NEQUI: CopAmountSchema,
  TRANSFER: CopAmountSchema,
} satisfies Record<PaymentMethod, typeof CopAmountSchema>;

/** Lo cobrado en el día, separado por medio de pago. */
export const CollectedByMethodSchema = z.object(collectedByMethodShape);
export type CollectedByMethod = z.infer<typeof CollectedByMethodSchema>;

/**
 * Cierre diario de un cobrador: lo esperado contra lo cobrado. Hay uno por cobrador y por día;
 * reenviarlo lo actualiza y lo devuelve a `PENDING`. Los montos son los que declaró el cobrador
 * al cerrar, aunque después se reverse algún pago.
 */
export const DailySettlementSchema = z.object({
  id: IdSchema,
  collectorMembershipId: IdSchema,
  date: BusinessDateSchema,
  expectedAmount: CopAmountSchema,
  collectedAmount: CopAmountSchema,
  collectedByMethod: CollectedByMethodSchema,
  status: SettlementStatusSchema,
  /** Obligatoria cuando `collectedAmount` difiere de `expectedAmount`. */
  collectorNote: NoteSchema.nullable(),
  /** Comentario del prestamista al revisar, sobre todo al rechazar. */
  reviewNote: NoteSchema.nullable(),
  reviewedByMembershipId: IdSchema.nullable(),
  reviewedAt: TimestampSchema.nullable(),
  /** Último envío del cobrador. */
  submittedAt: TimestampSchema,
  createdAt: TimestampSchema,
});
export type DailySettlement = z.infer<typeof DailySettlementSchema>;
