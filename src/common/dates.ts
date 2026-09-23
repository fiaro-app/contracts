import { z } from 'zod';

/** Zona horaria del negocio. Todas las fechas de calendario se interpretan en hora de Colombia. */
export const BUSINESS_TIME_ZONE = 'America/Bogota';

/** Colombia está en UTC-5 todo el año: no usa horario de verano desde 1993. */
const BUSINESS_UTC_OFFSET_MS = -5 * 60 * 60 * 1000;

/**
 * Fecha de calendario del negocio, sin hora: `AAAA-MM-DD` (inicio del préstamo, fecha de
 * compromiso, día del cuadre). Nunca se convierte a otra zona horaria.
 */
export const BusinessDateSchema = z.iso.date({ error: 'Fecha inválida: usa el formato AAAA-MM-DD.' });
export type BusinessDate = z.infer<typeof BusinessDateSchema>;

/**
 * Instante exacto en ISO 8601 con zona horaria (`2026-09-23T10:15:00-05:00` o
 * `2026-09-23T15:15:00Z`). Se usa para `createdAt`, `occurredAt` y demás marcas de tiempo.
 */
export const TimestampSchema = z.iso.datetime({ offset: true, error: 'Fecha y hora inválidas.' });
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
    error: 'La fecha final debe ser igual o posterior a la inicial.',
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
