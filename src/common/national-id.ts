import { z } from 'zod';
import { messageKey } from '../i18n/message-key';

/** Solo dígitos, sin cero inicial, de 3 a 10 dígitos (las cédulas antiguas son más cortas). */
const NATIONAL_ID_REGEX = /^[1-9]\d{2,9}$/;

/**
 * Cédula de ciudadanía colombiana: solo dígitos, sin puntos ni espacios (`"1020304050"`).
 * Es el único documento que acepta el sistema.
 */
export const NationalIdSchema = z
  .string()
  .regex(NATIONAL_ID_REGEX, { error: messageKey('contracts.national_id.invalid') });
export type NationalId = z.infer<typeof NationalIdSchema>;

/**
 * Quita los separadores con los que se suele escribir una cédula (`"1.020.304.050"` →
 * `"1020304050"`). No valida: el resultado se valida con {@link NationalIdSchema}.
 */
export function normalizeNationalId(input: string): string {
  return input.replace(/[\s.,-]/g, '');
}
