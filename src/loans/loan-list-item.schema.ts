import { z } from 'zod';
import { BusinessDateSchema, CopTotalSchema, IdSchema } from '../common';
import { LoanSchema } from './loan.schema';

/**
 * Fila de la lista de préstamos: el préstamo más su saldo y mora, que la API calcula con el mismo
 * motor que el saldo de cada préstamo, así que las cifras nunca discrepan.
 */
export const LoanListItemSchema = LoanSchema.extend({
  /** Lo pactado menos lo pagado. Nunca baja de cero. */
  balance: CopTotalSchema,
  /** Lo esperado hasta hoy que sigue sin pagar; cero si está al día o el préstamo cerró. */
  overdueAmount: CopTotalSchema,
  /** Días desde la cuota impaga más antigua; cero si está al día o el préstamo cerró. */
  overdueDays: z.int().nonnegative(),
  /** Próxima fecha esperada de pago; `null` si el préstamo cerró o no le quedan cuotas. */
  nextDueDate: BusinessDateSchema.nullable(),
  /** Quien lo cobra hoy, o `null` si ninguno lo tiene asignado. */
  collector: z.object({ membershipId: IdSchema, fullName: z.string() }).nullable(),
});
export type LoanListItem = z.infer<typeof LoanListItemSchema>;
