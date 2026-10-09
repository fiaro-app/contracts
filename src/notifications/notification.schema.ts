import { z } from 'zod';
import { IdSchema, TimestampSchema } from '../common';

/** Nivel de importancia; define el color con que la app muestra la notificación. */
export const NotificationSeveritySchema = z.enum(['ALERT', 'WARNING', 'SUCCESS', 'INFO']);
export type NotificationSeverity = z.infer<typeof NotificationSeveritySchema>;

/** Entidad a la que lleva la notificación al tocarla. */
export const NotificationEntityTypeSchema = z.enum([
  'DAILY_SETTLEMENT',
  'LOAN',
  'CLIENT',
  'MEMBERSHIP',
  'SUBSCRIPTION',
]);
export type NotificationEntityType = z.infer<typeof NotificationEntityTypeSchema>;

/**
 * Aviso para una persona. Lleva `lenderId` porque alguien que trabaja para varios prestamistas
 * recibe notificaciones de todos.
 */
export const NotificationSchema = z.object({
  id: IdSchema,
  recipientUserId: IdSchema,
  lenderId: IdSchema,
  severity: NotificationSeveritySchema,
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(500),
  relatedEntityType: NotificationEntityTypeSchema.nullable(),
  relatedEntityId: IdSchema.nullable(),
  /** `null` mientras no se haya leído. */
  readAt: TimestampSchema.nullable(),
  createdAt: TimestampSchema,
});
export type Notification = z.infer<typeof NotificationSchema>;

/** Cuántas notificaciones sin leer tiene la persona. */
export const UnreadCountSchema = z.object({ count: z.int().nonnegative() });
export type UnreadCount = z.infer<typeof UnreadCountSchema>;

/** Resultado de marcar todas como leídas: cuántas se marcaron (repetirlo da cero). */
export const MarkAllReadResultSchema = z.object({ marked: z.int().nonnegative() });
export type MarkAllReadResult = z.infer<typeof MarkAllReadResultSchema>;
