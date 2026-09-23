import { z } from 'zod';
import { IdSchema, PositiveCopAmountSchema, TimestampSchema } from '../common';

/** Medio con el que el cliente pagó. El cuadre usa `CASH` para saber cuánto efectivo entrega el cobrador. */
export const PaymentMethodSchema = z.enum(['CASH', 'NEQUI', 'TRANSFER']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/**
 * Dinero recibido en una visita. Nunca se edita ni se borra: un error se corrige con un
 * `PaymentReversal`.
 */
export const PaymentSchema = z.object({
  id: IdSchema,
  loanId: IdSchema,
  visitId: IdSchema,
  amount: PositiveCopAmountSchema,
  method: PaymentMethodSchema,
  /** Igual al `occurredAt` de la visita. */
  occurredAt: TimestampSchema,
  createdAt: TimestampSchema,
});
export type Payment = z.infer<typeof PaymentSchema>;
