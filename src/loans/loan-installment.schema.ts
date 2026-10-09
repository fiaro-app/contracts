import { z } from 'zod';
import { BusinessDateSchema, CopAmountSchema, IdSchema, PositiveCopAmountSchema } from '../common';

/**
 * Estado de una cuota del calendario, al día de hoy:
 * - `PAID`: cubierta por completo.
 * - `PARTIAL`: con algo imputado, pero no todo.
 * - `OVERDUE`: sin nada pagado y con la fecha ya cumplida.
 * - `PENDING`: sin pagar y aún no vence, o de un préstamo ya cerrado.
 */
export const InstallmentStatusSchema = z.enum(['PAID', 'PARTIAL', 'OVERDUE', 'PENDING']);
export type InstallmentStatus = z.infer<typeof InstallmentStatusSchema>;

/** Una cuota del calendario de un préstamo. */
export const LoanInstallmentSchema = z.object({
  /** Número de cuota, desde 1. */
  number: z.int().positive(),
  /** Fecha en que se espera el pago. */
  dueDate: BusinessDateSchema,
  expectedAmount: PositiveCopAmountSchema,
  /** Lo que ya se le imputó; los pagos se aplican de la cuota más antigua a la más nueva y nunca pasa de `expectedAmount`. */
  paidAmount: CopAmountSchema,
  status: InstallmentStatusSchema,
});
export type LoanInstallment = z.infer<typeof LoanInstallmentSchema>;

/** Calendario de cuotas de un préstamo, calculado con el mismo motor que el saldo y la mora. */
export const LoanInstallmentsSchema = z.object({
  loanId: IdSchema,
  /** Fecha con la que se calculó (hoy, en hora de Colombia). */
  asOf: BusinessDateSchema,
  installments: z.array(LoanInstallmentSchema),
});
export type LoanInstallments = z.infer<typeof LoanInstallmentsSchema>;
