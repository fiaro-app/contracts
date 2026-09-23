import { z } from 'zod';
import {
  AddressSchema,
  IdSchema,
  NationalIdSchema,
  OccupationSchema,
  PersonNameSchema,
  PhoneSchema,
  TimestampSchema,
} from '../common';

/**
 * Persona deudora. No es usuario del sistema. Pertenece a un solo prestamista: si dos
 * prestamistas del mismo dueño atienden a la misma persona, cada uno tiene su propio registro.
 */
export const ClientSchema = z.object({
  id: IdSchema,
  /** Única dentro del prestamista: es la llave para detectar un cliente existente. */
  nationalId: NationalIdSchema,
  fullName: PersonNameSchema,
  occupation: OccupationSchema,
  phone: PhoneSchema,
  address: AddressSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Client = z.infer<typeof ClientSchema>;
