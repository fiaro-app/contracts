import { z } from 'zod';
import { messageKey } from '../i18n/message-key';

/** Indicativo internacional de Colombia. */
export const COLOMBIA_DIAL_CODE = '+57';

/** Celular: 3 seguido de 9 dígitos (10 en total). */
const MOBILE_PHONE_REGEX = /^\+573\d{9}$/;

/** Celular, o fijo con el formato de 10 dígitos vigente desde 2021: 60 + indicativo (1-8) + 7 dígitos. */
const PHONE_REGEX = /^\+57(?:3\d{9}|60[1-8]\d{7})$/;

/**
 * Teléfono colombiano, celular o fijo, en formato internacional E.164: `+57` seguido de los
 * 10 dígitos nacionales (`+573001234567`, `+576012345678`). Es el formato que exige WhatsApp.
 */
export const PhoneSchema = z
  .string()
  .regex(PHONE_REGEX, { error: messageKey('contracts.phone.invalid') });
export type Phone = z.infer<typeof PhoneSchema>;

/**
 * Celular colombiano en formato E.164 (`+573001234567`). Identifica a cada usuario al iniciar
 * sesión, por eso es único en todo el sistema.
 */
export const MobilePhoneSchema = z
  .string()
  .regex(MOBILE_PHONE_REGEX, { error: messageKey('contracts.phone.invalid_mobile') });
export type MobilePhone = z.infer<typeof MobilePhoneSchema>;

/**
 * Convierte lo que escribe una persona (`"300 123 4567"`, `"+57 300-123-4567"`,
 * `"573001234567"`) al formato E.164 del contrato. Devuelve `null` si no es un número
 * colombiano válido.
 */
export function toColombianE164(input: string): Phone | null {
  const digits = input.replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
  const candidate = `${COLOMBIA_DIAL_CODE}${national}`;
  return PHONE_REGEX.test(candidate) ? candidate : null;
}
