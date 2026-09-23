import { z } from 'zod';
import {
  IdSchema,
  MobilePhoneSchema,
  NationalIdSchema,
  PersonNameSchema,
  TimestampSchema,
} from '../common';

/**
 * Persona que inicia sesión. Hay una sola cuenta por persona, identificada por su celular.
 * No tiene rol propio: sus roles vienen de cada `Membership` que tenga con un prestamista.
 */
export const UserSchema = z.object({
  id: IdSchema,
  /** Celular de inicio de sesión, único en todo el sistema. */
  phone: MobilePhoneSchema,
  fullName: PersonNameSchema,
  /** Opcional: sirve para recuperar la contraseña. Único cuando existe. */
  email: z.email().nullable(),
  /** Cédula de la persona. Obligatoria para cobradores; único cuando existe. */
  nationalId: NationalIdSchema.nullable(),
  /** `true` mientras la cuenta use una contraseña temporal: bloquea la app hasta cambiarla. */
  mustChangePassword: z.boolean(),
  createdAt: TimestampSchema,
});
export type User = z.infer<typeof UserSchema>;
