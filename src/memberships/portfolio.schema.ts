import { z } from 'zod';
import { BusinessNameSchema, IdSchema, TimestampSchema } from '../common';

/** Nombre de la cartera que cada prestamista tiene desde que se crea. */
export const DEFAULT_PORTFOLIO_NAME = 'General';

/**
 * Cartera o zona ("Zona Norte"): agrupa cobradores y, a través de ellos, clientes y préstamos.
 * Es opcional para el negocio: si nadie crea otra, todo queda en la cartera por defecto.
 */
export const PortfolioSchema = z.object({
  id: IdSchema,
  /** Único dentro del prestamista. */
  name: BusinessNameSchema,
  /** La cartera por defecto no se puede eliminar. */
  isDefault: z.boolean(),
  createdAt: TimestampSchema,
});
export type Portfolio = z.infer<typeof PortfolioSchema>;
