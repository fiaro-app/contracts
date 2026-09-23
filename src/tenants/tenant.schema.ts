import { z } from 'zod';
import { BusinessNameSchema, IdSchema, TimestampSchema } from '../common';

/**
 * Dueño del negocio como cliente de Fiaro: raíz de la facturación. Puede tener uno o varios
 * prestamistas (`Lender`). Al registrarse se crean juntos el Tenant, su primer Lender y la
 * membresía del dueño con los tres roles.
 */
export const TenantSchema = z.object({
  id: IdSchema,
  name: BusinessNameSchema,
  createdAt: TimestampSchema,
});
export type Tenant = z.infer<typeof TenantSchema>;
