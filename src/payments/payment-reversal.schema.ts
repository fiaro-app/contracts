import { z } from 'zod';
import { IdSchema, NoteSchema, TimestampSchema } from '../common';

/**
 * Anulación total de un pago registrado por error. Solo la crea alguien con rol `LENDER`, con
 * motivo obligatorio; un pago se puede reversar una sola vez. Si el monto correcto era otro, se
 * registra un pago nuevo.
 */
export const PaymentReversalSchema = z.object({
  id: IdSchema,
  paymentId: IdSchema,
  reason: NoteSchema,
  reversedByMembershipId: IdSchema,
  createdAt: TimestampSchema,
});
export type PaymentReversal = z.infer<typeof PaymentReversalSchema>;
