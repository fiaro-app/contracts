import { z } from 'zod';
import { BusinessDateSchema, CopAmountSchema, IdSchema, TimestampSchema } from '../common';

/**
 * Resultado de una visita de cobro. No existe un resultado "parcial": si hubo dinero es `PAID`,
 * y parcial o mayor se deduce comparando el monto del pago con `expectedAmount`.
 */
export const VisitOutcomeSchema = z.enum(['PAID', 'NOT_FOUND', 'REFUSED', 'RESCHEDULED']);
export type VisitOutcome = z.infer<typeof VisitOutcomeSchema>;

/**
 * Cada intento de cobro. Se puede registrar sin conexión: el `id` lo genera el dispositivo y
 * reenviar la misma visita no la duplica. Si hubo dinero, el monto y el medio de pago están en
 * el `Payment` que se crea en la misma operación.
 */
export const CollectionVisitSchema = z.object({
  id: IdSchema,
  loanId: IdSchema,
  collectorMembershipId: IdSchema,
  outcome: VisitOutcomeSchema,
  /** Cuota que se esperaba cobrar en ese momento; se congela para que los reportes no cambien. */
  expectedAmount: CopAmountSchema,
  /** Solo con `RESCHEDULED`: ese día el préstamo vuelve a aparecer en la ruta. */
  promisedDate: BusinessDateSchema.nullable(),
  /** Hora real de la visita según el dispositivo. */
  occurredAt: TimestampSchema,
  /** Hora en que la visita llegó al servidor; difiere de `occurredAt` si se registró sin conexión. */
  createdAt: TimestampSchema,
});
export type CollectionVisit = z.infer<typeof CollectionVisitSchema>;
