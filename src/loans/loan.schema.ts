import { z } from 'zod';
import { BusinessDateSchema, IdSchema, PositiveCopAmountSchema, TimestampSchema } from '../common';

/** Límite de cuotas de un préstamo; evita errores de digitación como 10.000 cuotas. */
export const MAX_INSTALLMENT_COUNT = 1000;

/**
 * Cada cuánto se cobra una cuota. Las fechas esperadas se calculan desde `startDate`:
 * - `DAILY`: cada día de cobro del prestamista.
 * - `WEEKLY`: cada 7 días.
 * - `BIWEEKLY`: cada 15 días (quincenal).
 * - `MONTHLY`: el mismo día de cada mes, o el último día si el mes es más corto.
 *
 * Si una fecha cae en un día sin cobro, pasa al siguiente día de cobro.
 */
export const LoanFrequencySchema = z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']);
export type LoanFrequency = z.infer<typeof LoanFrequencySchema>;

/**
 * - `ACTIVE`: tiene saldo pendiente.
 * - `PAID_OFF`: el saldo llegó a cero; se cierra solo al registrar el último pago.
 * - `CANCELED`: el prestamista lo anuló por un error de registro, antes de recibir pagos.
 */
export const LoanStatusSchema = z.enum(['ACTIVE', 'PAID_OFF', 'CANCELED']);
export type LoanStatus = z.infer<typeof LoanStatusSchema>;

/**
 * Acuerdo de pago pactado entre el prestamista y el cliente. Fiaro no calcula intereses: todos
 * los montos los ingresa el prestamista. El saldo es `totalPayable` menos los pagos netos.
 */
export const LoanSchema = z.object({
  id: IdSchema,
  clientId: IdSchema,
  principalAmount: PositiveCopAmountSchema,
  installmentCount: z.int().min(1).max(MAX_INSTALLMENT_COUNT),
  installmentValue: PositiveCopAmountSchema,
  /** Lo pactado. La app sugiere `installmentCount × installmentValue`, pero se respeta lo que se acuerde. */
  totalPayable: PositiveCopAmountSchema,
  frequency: LoanFrequencySchema,
  startDate: BusinessDateSchema,
  status: LoanStatusSchema,
  createdByMembershipId: IdSchema,
  createdAt: TimestampSchema,
  /** Cuándo pasó a `PAID_OFF` o `CANCELED`. */
  closedAt: TimestampSchema.nullable(),
});
export type Loan = z.infer<typeof LoanSchema>;
