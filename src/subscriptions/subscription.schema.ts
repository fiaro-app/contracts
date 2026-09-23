import { z } from 'zod';
import { IdSchema, TimestampSchema } from '../common';

/** Días de gracia después del vencimiento, antes de pasar a solo lectura. */
export const SUBSCRIPTION_GRACE_DAYS = 7;

/**
 * Estado de la suscripción, calculado a partir de las fechas:
 * - `ACTIVE`: el período pagado está vigente.
 * - `GRACE_PERIOD`: venció hace menos de {@link SUBSCRIPTION_GRACE_DAYS} días; todo funciona
 *   y la app muestra el aviso de renovación.
 * - `READ_ONLY`: terminó la gracia; solo se permiten lecturas y registrar visitas y pagos.
 */
export const SubscriptionStatusSchema = z.enum(['ACTIVE', 'GRACE_PERIOD', 'READ_ONLY']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

/** Plan del Tenant. Limita cuántos prestamistas activos puede tener. */
export const SubscriptionSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  status: SubscriptionStatusSchema,
  maxActiveLenders: z.int().min(1),
  currentPeriodEndsAt: TimestampSchema,
  /** `currentPeriodEndsAt` más los días de gracia. */
  graceEndsAt: TimestampSchema,
  createdAt: TimestampSchema,
});
export type Subscription = z.infer<typeof SubscriptionSchema>;
