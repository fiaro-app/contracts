import { z } from 'zod';
import { CopTotalSchema } from '../common';
import { ClientSchema } from './client.schema';

/**
 * Fila de la lista de clientes: el cliente (la API no entrega `updatedAt`) más lo que debe hoy,
 * sumado sobre sus préstamos activos con el mismo cálculo que el saldo de cada préstamo.
 */
export const ClientListItemSchema = ClientSchema.omit({ updatedAt: true }).extend({
  balance: CopTotalSchema,
  overdueAmount: CopTotalSchema,
  /** El mayor atraso entre sus préstamos activos; cero si está al día. */
  overdueDays: z.int().nonnegative(),
  activeLoans: z.int().nonnegative(),
});
export type ClientListItem = z.infer<typeof ClientListItemSchema>;
