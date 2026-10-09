import { z } from 'zod';

/**
 * Hasta cuántos días de vencido un préstamo está en "atraso"; con más es "mora". La misma frontera
 * la usan la web y la app móvil para que un cliente se vea igual en ambas, y coincide con el primer
 * rango del dashboard del Lender (0-7, 8-15, 16-30 y más de 30 días, D-100 del API). Confirmada por
 * producto el 2026-10-09.
 */
export const LATE_MAX_DAYS = 7;

/**
 * Situación de un préstamo para quien cobra o administra, la que muestra el chip de estado:
 * - `PAID` (PAGADO): saldo cero.
 * - `CURRENT` (AL DÍA): sin días de vencido; una cuota que vence hoy todavía no está atrasada.
 * - `LATE` (ATRASO): de 1 a `LATE_MAX_DAYS` días de vencido.
 * - `DELINQUENT` (MORA): más de `LATE_MAX_DAYS` días de vencido.
 */
export const OverdueStatusSchema = z.enum(['PAID', 'CURRENT', 'LATE', 'DELINQUENT']);
export type OverdueStatus = z.infer<typeof OverdueStatusSchema>;

/**
 * Clasifica un préstamo a partir de su saldo y de sus días de vencido (`balance` y `overdueDays` de
 * `GET /loans/:id/balance` y de la ruta del día). `PAID` gana sobre lo demás: un saldo cero no puede
 * estar en mora. La web y el móvil traducen estos valores a los suyos de presentación (`paid`, `current`,
 * `late`, `delinquent`), que son los del `StatusChip` de la web.
 *
 * @param loan - Saldo pendiente en pesos y días desde la cuota impaga más antigua.
 */
export function overdueStatus(loan: { readonly balance: number; readonly overdueDays: number }): OverdueStatus {
  if (loan.balance <= 0) return 'PAID';
  if (loan.overdueDays <= 0) return 'CURRENT';
  return loan.overdueDays > LATE_MAX_DAYS ? 'DELINQUENT' : 'LATE';
}
