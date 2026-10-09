import { z } from 'zod';
import { IdSchema, TimestampSchema } from '../common';

/** Una sesión abierta de la persona, tal como la lista «Mi cuenta». Nunca trae el token. */
export const AccountSessionSchema = z.object({
  id: IdSchema,
  /** Es la sesión desde la que se hizo la consulta. */
  isCurrent: z.boolean(),
  device: z.object({
    /** El navegador o la app (`Chrome`, `App móvil`…); `null` si no se reconoce. */
    client: z.string().nullable(),
    /** El sistema operativo (`Windows`, `Android`…); `null` si no se reconoce. */
    os: z.string().nullable(),
    /** Texto listo para mostrar: «Chrome en Windows». */
    label: z.string(),
  }),
  ipAddress: z.string().nullable(),
  createdAt: TimestampSchema,
  /** Último uso, con precisión de un día: la sesión se renueva como máximo una vez al día. */
  lastUsedAt: TimestampSchema,
  expiresAt: TimestampSchema,
});
export type AccountSession = z.infer<typeof AccountSessionSchema>;
