import { z } from 'zod';
import { messageKey } from '../i18n/message-key';

/** Zona horaria del negocio. Todas las fechas de calendario se interpretan en hora de Colombia. */
export const BUSINESS_TIME_ZONE = 'America/Bogota';

/** Colombia está en UTC-5 todo el año: no usa horario de verano desde 1993. */
const BUSINESS_UTC_OFFSET_MS = -5 * 60 * 60 * 1000;

/**
 * Fecha de calendario del negocio, sin hora: `AAAA-MM-DD` (inicio del préstamo, fecha de
 * compromiso, día del cuadre). Nunca se convierte a otra zona horaria.
 */
export const BusinessDateSchema = z.iso.date({ error: messageKey('contracts.date.invalid') });
export type BusinessDate = z.infer<typeof BusinessDateSchema>;

/**
 * Instante exacto en ISO 8601 con zona horaria (`2026-09-23T10:15:00-05:00` o
 * `2026-09-23T15:15:00Z`). Se usa para `createdAt`, `occurredAt` y demás marcas de tiempo.
 */
export const TimestampSchema = z.iso.datetime({ offset: true, error: messageKey('contracts.timestamp.invalid') });
export type Timestamp = z.infer<typeof TimestampSchema>;

/** Día de la semana, para configurar los días sin cobro de cada prestamista. */
export const WeekdaySchema = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);
export type Weekday = z.infer<typeof WeekdaySchema>;

/** Rango de fechas de calendario, ambos extremos incluidos. */
export const DateRangeSchema = z
  .strictObject({
    from: BusinessDateSchema,
    to: BusinessDateSchema,
  })
  .refine((range) => range.from <= range.to, {
    error: messageKey('contracts.date_range.end_before_start'),
    path: ['to'],
  });
export type DateRange = z.infer<typeof DateRangeSchema>;

/**
 * Fecha de calendario en Colombia para un instante dado. Por ejemplo, las 23:30 del 22 de
 * septiembre en Bogotá (04:30 UTC del día 23) siguen siendo `2026-09-22`.
 */
export function toBusinessDate(instant: Date = new Date()): BusinessDate {
  return new Date(instant.getTime() + BUSINESS_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

/** Días de calendario entre dos fechas `AAAA-MM-DD`, contando ambos extremos (`2026-09-01` a `2026-09-01` = 1). */
export function daysInRange(from: BusinessDate, to: BusinessDate): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1;
}

/** Límites de un rango de fechas que acepta una consulta. */
export interface DateRangeLimits {
  /** Días de calendario que puede abarcar el rango, ambos extremos incluidos. */
  readonly maxDays: number;
  /** Si `to` puede ser posterior a hoy en Colombia. Por defecto no: el historial no tiene futuro. */
  readonly allowFuture?: boolean;
}

/**
 * {@link DateRangeSchema} con un largo máximo y, por defecto, sin fechas posteriores a hoy en
 * Colombia. "Hoy" se calcula al validar, no al definir el schema, así que sirve en un servidor que
 * corre días seguidos.
 *
 * @param limits - El largo máximo y si se aceptan fechas futuras.
 *
 * @example
 * ```ts
 * const StatsRequest = z.strictObject({ dateRange: boundedDateRange({ maxDays: 366 }).optional() });
 * ```
 */
export function boundedDateRange(limits: DateRangeLimits) {
  return DateRangeSchema.superRefine((range, ctx) => {
    if (!limits.allowFuture && range.to > toBusinessDate()) {
      ctx.addIssue({ code: 'custom', message: messageKey('contracts.date_range.in_future'), path: ['to'] });
    }
    if (daysInRange(range.from, range.to) > limits.maxDays) {
      ctx.addIssue({ code: 'custom', message: messageKey('contracts.date_range.too_long'), path: ['from'] });
    }
  });
}
