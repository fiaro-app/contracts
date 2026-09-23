import { z } from 'zod';
import { IdSchema, TimestampSchema } from '../common';

/**
 * Roles dentro de un prestamista. Son acumulables: el operador que trabaja solo tiene los tres.
 * - `OWNER`: dueño; paga la suscripción.
 * - `LENDER`: administra clientes, préstamos, cobradores y cuadres.
 * - `COLLECTOR`: cobra en campo los préstamos que tiene asignados.
 */
export const RoleSchema = z.enum(['OWNER', 'LENDER', 'COLLECTOR']);
export type Role = z.infer<typeof RoleSchema>;

/** `INACTIVE` quita el acceso de inmediato y conserva todo el historial. */
export const MembershipStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

/**
 * Relación entre una persona (`User`) y un prestamista, con sus roles. Los cobros, cuadres y
 * asignaciones apuntan a la membresía, no al usuario, porque una persona puede trabajar para
 * más de un prestamista.
 */
export const MembershipSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  lenderId: IdSchema,
  /** Sin repetidos y con al menos un rol. */
  roles: z.array(RoleSchema).min(1),
  status: MembershipStatusSchema,
  /** Cartera del cobrador. Nunca es `null` si `roles` incluye `COLLECTOR`. */
  portfolioId: IdSchema.nullable(),
  createdAt: TimestampSchema,
  deactivatedAt: TimestampSchema.nullable(),
});
export type Membership = z.infer<typeof MembershipSchema>;
