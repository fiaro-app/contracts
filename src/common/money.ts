import { z } from 'zod';
import { messageKey } from '../i18n/message-key';

/** Valor máximo de una columna `INTEGER` de Postgres (unos 2.147 millones de pesos). */
export const MAX_COP_AMOUNT = 2_147_483_647;

/**
 * Monto de un solo registro (préstamo, cuota, pago) en pesos colombianos.
 * Entero y sin centavos: el negocio no maneja fracciones de peso.
 */
export const CopAmountSchema = z
  .int({ error: messageKey('contracts.money.not_integer') })
  .nonnegative({ error: messageKey('contracts.money.negative') })
  .max(MAX_COP_AMOUNT, { error: messageKey('contracts.money.too_high') });
export type CopAmount = z.infer<typeof CopAmountSchema>;

/** Monto de un solo registro que debe ser mayor que cero (valor prestado, cuota, pago). */
export const PositiveCopAmountSchema = CopAmountSchema.positive({
  error: messageKey('contracts.money.not_positive'),
});

/**
 * Suma de muchos registros (cartera total, cobrado del mes). Puede superar el límite de un
 * registro individual, por eso solo exige ser un entero seguro de JavaScript.
 */
export const CopTotalSchema = z.int().nonnegative();
export type CopTotal = z.infer<typeof CopTotalSchema>;
