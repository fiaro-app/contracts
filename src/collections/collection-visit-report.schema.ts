import { z } from 'zod';
import { BusinessDateSchema, CopAmountSchema, IdSchema, TimestampSchema, paginated } from '../common';
import { PaymentMethodSchema } from '../payments';
import { VisitOutcomeSchema } from './collection-visit.schema';

/** Una visita del reporte «Cobros del día»: con el cliente, el cobrador y el pago ya resueltos. */
export const CollectionVisitReportEntrySchema = z.object({
  visitId: IdSchema,
  /** Hora real de la visita según el dispositivo. */
  occurredAt: TimestampSchema,
  outcome: VisitOutcomeSchema,
  /** Cuota que se esperaba cobrar en ese momento. */
  expectedAmount: CopAmountSchema,
  /** Solo con `RESCHEDULED`. */
  promisedDate: BusinessDateSchema.nullable(),
  loan: z.object({ id: IdSchema }),
  client: z.object({ id: IdSchema, fullName: z.string() }),
  collector: z.object({ membershipId: IdSchema, fullName: z.string() }),
  /** El pago que generó, o `null` si el resultado no fue `PAID`. */
  payment: z
    .object({
      id: IdSchema,
      amount: CopAmountSchema,
      method: PaymentMethodSchema,
      /** El pago fue anulado con una reversión: ya no cuenta como cobrado. */
      reversed: z.boolean(),
    })
    .nullable(),
});
export type CollectionVisitReportEntry = z.infer<typeof CollectionVisitReportEntrySchema>;

/** Página del reporte de cobros del negocio y el rango que la API resolvió (hoy si no se pidió uno). */
export const CollectionVisitReportSchema = paginated(CollectionVisitReportEntrySchema).extend({
  range: z.object({ from: BusinessDateSchema, to: BusinessDateSchema }),
});
export type CollectionVisitReport = z.infer<typeof CollectionVisitReportSchema>;
