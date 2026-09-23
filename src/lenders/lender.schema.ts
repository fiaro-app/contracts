import { z } from 'zod';
import {
  BusinessDateSchema,
  BusinessNameSchema,
  IdSchema,
  NoteSchema,
  TimestampSchema,
  WeekdaySchema,
  type Weekday,
} from '../common';

/** Días sin cobro con los que nace un prestamista. */
export const DEFAULT_NON_WORKING_WEEKDAYS: readonly Weekday[] = ['SUNDAY'];

/**
 * La operación de préstamo: su cartera, cobradores y clientes están aislados de los demás
 * prestamistas, incluso de los del mismo Tenant.
 */
export const LenderSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  name: BusinessNameSchema,
  logoUrl: z.url().nullable(),
  /** Días de la semana en que no se cobra: no generan cuota esperada ni mora. */
  nonWorkingWeekdays: z.array(WeekdaySchema),
  /** Si es `true`, los festivos nacionales de Colombia tampoco cuentan como días de cobro. */
  skipNationalHolidays: z.boolean(),
  createdAt: TimestampSchema,
});
export type Lender = z.infer<typeof LenderSchema>;

/** Fecha puntual sin cobro de un prestamista (por ejemplo, un cierre por vacaciones). */
export const NonWorkingDaySchema = z.object({
  id: IdSchema,
  date: BusinessDateSchema,
  reason: NoteSchema.nullable(),
  createdAt: TimestampSchema,
});
export type NonWorkingDay = z.infer<typeof NonWorkingDaySchema>;
