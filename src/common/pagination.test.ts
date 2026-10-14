import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PageQuerySchema, paginated } from './pagination';

describe('PageQuerySchema', () => {
  it('aplica los valores por defecto', () => {
    expect(PageQuerySchema.parse({})).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  });

  it('limita el tamaño de página y rechaza campos desconocidos', () => {
    expect(PageQuerySchema.safeParse({ pageSize: MAX_PAGE_SIZE }).success).toBe(true);
    expect(PageQuerySchema.safeParse({ pageSize: MAX_PAGE_SIZE + 1 }).success).toBe(false);
    expect(PageQuerySchema.safeParse({ page: 1, sort: 'name' }).success).toBe(false);
  });

  it('se extiende con filtros sin perder la validación estricta', () => {
    const SearchSchema = PageQuerySchema.extend({ search: z.string().optional() });
    expect(SearchSchema.parse({ search: 'Marta' })).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE, search: 'Marta' });
    expect(SearchSchema.safeParse({ unknown: true }).success).toBe(false);
  });
});

describe('paginated', () => {
  it('envuelve los resultados con sus metadatos', () => {
    const Page = paginated(z.object({ name: z.string() }));
    const page = Page.parse({ data: [{ name: 'Ana' }], meta: { page: 1, pageSize: 20, total: 1 } });
    expect(page.data).toHaveLength(1);
  });
});
