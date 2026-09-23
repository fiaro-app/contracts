import { z } from 'zod';

/**
 * Métodos HTTP que usa la API. `QUERY` es para búsquedas, filtros y reportes: es seguro e
 * idempotente como `GET`, pero lleva el filtro en el body JSON (ver ARCHITECTURE.md §5).
 */
export const HttpMethodSchema = z.enum(['GET', 'QUERY', 'POST', 'PATCH', 'DELETE']);
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

/** Campos comunes a toda definición de endpoint, sin importar el método. */
export interface EndpointBase {
  /** Ruta con parámetros en formato `:nombre`, por ejemplo `/clients/:id`. */
  readonly path: `/${string}`;
  /** Qué hace el endpoint, en una frase. Alimenta la documentación generada. */
  readonly summary: string;
  /** Valida los parámetros de ruta en la API (por ejemplo, que `:id` sea un UUID). */
  readonly params?: z.ZodType;
  /** Forma de la respuesta exitosa. */
  readonly response: z.ZodType;
}

/**
 * Definición de un endpoint. El tipo impide combinaciones inválidas: `GET` y `DELETE` no llevan
 * body, `QUERY` y `PATCH` siempre lo llevan y en `POST` es opcional (acciones como
 * `POST /collectors/:id/reset-password` no necesitan body).
 */
export type EndpointDefinition =
  | (EndpointBase & { readonly method: 'GET' | 'DELETE'; readonly body?: undefined })
  | (EndpointBase & { readonly method: 'POST'; readonly body?: z.ZodType })
  | (EndpointBase & { readonly method: 'QUERY' | 'PATCH'; readonly body: z.ZodType });

/**
 * Declara un endpoint una sola vez para que la API y las apps compartan método, ruta y
 * schemas. Conserva los tipos literales (`'GET'`, `'/clients/:id'`) para derivar de ellos los
 * tipos de parámetros, body y respuesta.
 */
export function defineEndpoint<const TEndpoint extends EndpointDefinition>(
  endpoint: TEndpoint,
): TEndpoint {
  // El tipo ya impide estas combinaciones; esta validación cubre a quien lo use desde JavaScript.
  const { method, path, body }: { method: HttpMethod; path: string; body?: z.ZodType } = endpoint;
  if ((method === 'GET' || method === 'DELETE') && body !== undefined) {
    throw new Error(`${method} ${path} no puede tener body.`);
  }
  if ((method === 'QUERY' || method === 'PATCH') && body === undefined) {
    throw new Error(`${method} ${path} necesita un body.`);
  }
  return endpoint;
}

/** Nombres de los parámetros de una ruta: `PathParamName<'/loans/:id'>` es `'id'`. */
export type PathParamName<TPath extends string> = TPath extends `${string}:${infer Name}/${infer Rest}`
  ? Name | PathParamName<`/${Rest}`>
  : TPath extends `${string}:${infer Name}`
    ? Name
    : never;

/** Parámetros de una ruta: `PathParams<'/clients/:id'>` es `{ id: string }`. */
export type PathParams<TPath extends string> = { [Name in PathParamName<TPath>]: string };

/** Parámetros de ruta que envía quien llama al endpoint. */
export type EndpointParams<TEndpoint extends EndpointDefinition> = TEndpoint extends {
  readonly params: infer TSchema extends z.ZodType;
}
  ? z.input<TSchema>
  : PathParams<TEndpoint['path']>;

/** Body tal como lo envía la app (los campos con valor por defecto son opcionales). */
export type EndpointRequestBody<TEndpoint extends EndpointDefinition> = TEndpoint extends {
  readonly body: infer TSchema extends z.ZodType;
}
  ? z.input<TSchema>
  : undefined;

/** Body tal como lo recibe la API después de validarlo (con los valores por defecto aplicados). */
export type EndpointParsedBody<TEndpoint extends EndpointDefinition> = TEndpoint extends {
  readonly body: infer TSchema extends z.ZodType;
}
  ? z.output<TSchema>
  : undefined;

/** Respuesta exitosa del endpoint. */
export type EndpointResponse<TEndpoint extends EndpointDefinition> = z.output<TEndpoint['response']>;

/**
 * Arma la URL de un endpoint reemplazando sus parámetros:
 * `buildPath('/clients/:id', { id })` → `/clients/0192…`. Codifica cada valor para la URL.
 */
export function buildPath<TPath extends string>(path: TPath, params: PathParams<TPath>): string {
  const values: Record<string, string | undefined> = params;
  return path.replace(/:([A-Za-z][A-Za-z0-9]*)/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new Error(`Falta el parámetro de ruta "${name}" para ${path}.`);
    }
    return encodeURIComponent(value);
  });
}
