import { z } from 'zod';
import { BusinessDateSchema, CopTotalSchema } from '../common';

/** Desempeño de un cobrador en un período. */
export const CollectorPeriodStatsSchema = z.object({
  from: BusinessDateSchema,
  to: BusinessDateSchema,
  /** Lo que el calendario decía que vencía en el período, de los préstamos que tiene asignados hoy. */
  expectedAmount: CopTotalSchema,
  /** Lo que de verdad cobró, sin los pagos reversados. */
  collectedAmount: CopTotalSchema,
  /** `collectedAmount / expectedAmount`; `null` si no había nada que vencer. */
  effectiveness: z.number().min(0).nullable(),
  visitsCount: z.int().nonnegative(),
  /** Lo vencido y sin pagar hoy, de su cartera. */
  overdueAmount: CopTotalSchema,
});
export type CollectorPeriodStats = z.infer<typeof CollectorPeriodStatsSchema>;
