import { z } from 'zod';
import { BusinessDateSchema, CopTotalSchema, IdSchema } from '../common';
import { DailySettlementSchema } from '../settlements';

/** Cuadre `PENDING` tal como lo embebe el resumen: sin los campos de revisión, que aún no existen. */
export const DashboardSettlementSchema = DailySettlementSchema.pick({
  id: true,
  collectorMembershipId: true,
  date: true,
  expectedAmount: true,
  collectedAmount: true,
  collectedByMethod: true,
  status: true,
  collectorNote: true,
});
export type DashboardSettlement = z.infer<typeof DashboardSettlementSchema>;

/**
 * Resumen del negocio del prestamista. Las cifras `*Today` son de hoy; las `*InPeriod` son del
 * período pedido con `from` y `to`, o de solo hoy si no se pidió uno. La cartera, la mora, las
 * alertas y los cuadres son siempre los de este momento.
 */
export const LenderDashboardSchema = z.object({
  /** Suma del saldo pendiente de los préstamos activos. */
  totalPortfolio: CopTotalSchema,
  collectedToday: CopTotalSchema,
  activeCollectors: z.int().nonnegative(),
  totalCollectors: z.int().nonnegative(),
  /** Cobrado sobre lo esperado hoy; `null` si no había nada esperado. */
  effectivenessToday: z.number().min(0).nullable(),
  /** Clientes distintos con al menos un préstamo en mora hoy. */
  clientsInArrears: z.int().nonnegative(),
  /** Alertas de texto ya armadas por la API. */
  alerts: z.array(z.string()),
  pendingSettlements: z.array(DashboardSettlementSchema),
  /** El período de las cifras `*InPeriod`. */
  period: z.object({ from: BusinessDateSchema, to: BusinessDateSchema }),
  collectedInPeriod: CopTotalSchema,
  expectedInPeriod: CopTotalSchema,
  /** `collectedInPeriod / expectedInPeriod`; `null` si no había nada esperado. */
  effectivenessInPeriod: z.number().min(0).nullable(),
});
export type LenderDashboard = z.infer<typeof LenderDashboardSchema>;

/** Los cuatro tramos fijos de antigüedad de la mora, siempre en este orden. */
export const ARREARS_BUCKET_LABELS = ['0-7', '8-15', '16-30', '30+'] as const;

/** Un tramo de antigüedad de la mora. */
export const ArrearsBucketSchema = z.object({
  label: z.enum(ARREARS_BUCKET_LABELS),
  /** Suma del saldo de los préstamos en este tramo. */
  amount: CopTotalSchema,
  /** Clientes distintos con al menos un préstamo en este tramo. */
  clientsCount: z.int().nonnegative(),
});
export type ArrearsBucket = z.infer<typeof ArrearsBucketSchema>;

/** Un cliente con mucha mora. */
export const TopArrearsEntrySchema = z.object({
  clientId: IdSchema,
  clientFullName: z.string(),
  /** El mayor de los días de mora, entre sus préstamos vencidos. */
  overdueDays: z.int().nonnegative(),
  /** La suma de lo vencido y sin pagar, entre sus préstamos vencidos. */
  overdueAmount: CopTotalSchema,
});
export type TopArrearsEntry = z.infer<typeof TopArrearsEntrySchema>;

/** Desempeño de un cobrador dentro de las estadísticas del prestamista. */
export const LenderStatsCollectorPerformanceSchema = z.object({
  collectorMembershipId: IdSchema,
  fullName: z.string(),
  /** Cobrado sobre lo esperado del período; `null` si no había nada esperado. */
  effectiveness: z.number().min(0).nullable(),
  overdueAmount: CopTotalSchema,
});
export type LenderStatsCollectorPerformance = z.infer<typeof LenderStatsCollectorPerformanceSchema>;

/** El período inmediatamente anterior, de la misma duración, para calcular tendencias. */
export const LenderPreviousPeriodSchema = z.object({
  from: BusinessDateSchema,
  to: BusinessDateSchema,
  /** Cartera total al cierre de ese período. */
  totalPortfolio: CopTotalSchema,
  portfolioAtRisk: CopTotalSchema,
  arrearsRate: z.number().min(0).nullable(),
  expectedAmount: CopTotalSchema,
  collectedAmount: CopTotalSchema,
  effectiveness: z.number().min(0).nullable(),
});
export type LenderPreviousPeriod = z.infer<typeof LenderPreviousPeriodSchema>;

/** Estadísticas del prestamista en un período (por defecto, el mes actual). */
export const LenderPeriodStatsSchema = z.object({
  from: BusinessDateSchema,
  to: BusinessDateSchema,
  totalPortfolio: CopTotalSchema,
  /** Saldo de los préstamos con algo vencido y sin pagar hoy. */
  portfolioAtRisk: CopTotalSchema,
  /** `portfolioAtRisk / totalPortfolio`; `null` si la cartera es cero. */
  arrearsRate: z.number().min(0).nullable(),
  arrearsByAge: z.array(ArrearsBucketSchema).length(ARREARS_BUCKET_LABELS.length),
  topArrears: z.array(TopArrearsEntrySchema),
  collectorPerformance: z.array(LenderStatsCollectorPerformanceSchema),
  /** Lo que vencía en el período, entre los cobradores que cumplen los filtros. */
  expectedAmount: CopTotalSchema,
  /** Lo que esos cobradores cobraron, sin los pagos reversados. */
  collectedAmount: CopTotalSchema,
  effectiveness: z.number().min(0).nullable(),
  /** El período anterior; `null` si la petición no pidió `includePrevious`. */
  previous: LenderPreviousPeriodSchema.nullable(),
});
export type LenderPeriodStats = z.infer<typeof LenderPeriodStatsSchema>;
