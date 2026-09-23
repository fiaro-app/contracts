import { z } from 'zod';

/** Tamaño máximo de página que acepta la API. */
export const MAX_PAGE_SIZE = 100;

/**
 * Paginación para el body de un `QUERY`. Cada búsqueda la extiende con sus filtros:
 * `PageQuerySchema.extend({ search: ... })`.
 */
export const PageQuerySchema = z.strictObject({
  page: z.int().min(1).default(1),
  pageSize: z.int().min(1).max(MAX_PAGE_SIZE).default(20),
});
export type PageQuery = z.infer<typeof PageQuerySchema>;

/** Metadatos de una página de resultados. */
export const PageMetaSchema = z.object({
  page: z.int().min(1),
  pageSize: z.int().min(1),
  total: z.int().nonnegative(),
});
export type PageMeta = z.infer<typeof PageMetaSchema>;

/** Respuesta paginada: `{ data: [...], meta: { page, pageSize, total } }`. */
export function paginated<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    data: z.array(item),
    meta: PageMetaSchema,
  });
}
