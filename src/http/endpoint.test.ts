import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import {
  buildPath,
  defineEndpoint,
  type EndpointParams,
  type EndpointParsedBody,
  type EndpointRequestBody,
  type EndpointResponse,
  type PathParams,
} from './endpoint';

const ItemSchema = z.object({ id: z.string(), name: z.string() });
const SearchSchema = z.strictObject({
  search: z.string().optional(),
  pageSize: z.int().default(20),
});

const getItem = defineEndpoint({
  method: 'GET',
  path: '/items/:id',
  summary: 'Detalle de un ítem.',
  response: ItemSchema,
});

const searchItems = defineEndpoint({
  method: 'QUERY',
  path: '/items',
  summary: 'Búsqueda de ítems.',
  body: SearchSchema,
  response: z.array(ItemSchema),
});

describe('defineEndpoint', () => {
  it('conserva la definición tal cual', () => {
    expect(getItem.method).toBe('GET');
    expect(searchItems.body).toBe(SearchSchema);
  });

  it('rechaza un GET con body', () => {
    expect(() =>
      // @ts-expect-error: el tipo tampoco permite body en GET.
      defineEndpoint({ method: 'GET', path: '/x', summary: 'x', body: SearchSchema, response: ItemSchema }),
    ).toThrow('GET /x no puede tener body.');
  });

  it('rechaza un QUERY sin body', () => {
    expect(() =>
      // @ts-expect-error: el tipo exige body en QUERY.
      defineEndpoint({ method: 'QUERY', path: '/x', summary: 'x', response: ItemSchema }),
    ).toThrow('QUERY /x necesita un body.');
  });

  it('deriva los tipos de parámetros, body y respuesta', () => {
    expectTypeOf<EndpointParams<typeof getItem>>().toEqualTypeOf<{ id: string }>();
    expectTypeOf<EndpointRequestBody<typeof getItem>>().toEqualTypeOf<undefined>();
    expectTypeOf<EndpointResponse<typeof getItem>>().toEqualTypeOf<{ id: string; name: string }>();

    expectTypeOf<EndpointRequestBody<typeof searchItems>>().toEqualTypeOf<{
      search?: string | undefined;
      pageSize?: number | undefined;
    }>();
    expectTypeOf<EndpointParsedBody<typeof searchItems>>().toEqualTypeOf<{
      search?: string | undefined;
      pageSize: number;
    }>();
  });
});

describe('buildPath', () => {
  it('reemplaza y codifica los parámetros', () => {
    expect(buildPath('/items/:id', { id: 'a b' })).toBe('/items/a%20b');
    expect(buildPath('/loans/:loanId/payments/:paymentId', { loanId: 'L1', paymentId: 'P2' })).toBe(
      '/loans/L1/payments/P2',
    );
    expect(buildPath('/health', {})).toBe('/health');
  });

  it('extrae los nombres de parámetros desde la ruta', () => {
    expectTypeOf<PathParams<'/loans/:loanId/payments/:paymentId'>>().toEqualTypeOf<{
      loanId: string;
      paymentId: string;
    }>();
  });

  it('falla con un mensaje claro si falta un parámetro', () => {
    const params = {} as PathParams<'/items/:id'>;
    expect(() => buildPath('/items/:id', params)).toThrow('Falta el parámetro de ruta "id" para /items/:id.');
  });
});
