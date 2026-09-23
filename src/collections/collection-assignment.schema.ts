import { z } from 'zod';
import { BusinessDateSchema, IdSchema, TimestampSchema } from '../common';

/**
 * Qué cobrador cobra un préstamo y durante qué fechas. Nunca se borra: reasignar cierra la
 * asignación vigente (`effectiveTo`) y abre una nueva, así queda el historial de quién cobraba
 * cada día.
 */
export const CollectionAssignmentSchema = z.object({
  id: IdSchema,
  loanId: IdSchema,
  collectorMembershipId: IdSchema,
  effectiveFrom: BusinessDateSchema,
  /** `null`: vigente sin fecha de fin. Igual a `effectiveFrom`: reemplazo de un solo día. */
  effectiveTo: BusinessDateSchema.nullable(),
  createdAt: TimestampSchema,
});
export type CollectionAssignment = z.infer<typeof CollectionAssignmentSchema>;
