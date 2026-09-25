import { es } from './es';

/** La forma que cumple el catálogo de cada idioma: los mismos grupos y claves, con un texto por clave. */
type MessageShape<T> = { readonly [K in keyof T]: T[K] extends string ? string : MessageShape<T[K]> };

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/**
 * Todas las claves de mensaje que escriben los schemas del contrato, como ruta con puntos
 * (`contracts.money.not_positive`). Es lo que trae `issue.message` cuando un schema del
 * contrato rechaza un dato.
 */
export type ContractMessageKey = Leaves<(typeof CONTRACT_MESSAGES)['es']>;

/**
 * Los textos de los mensajes del contrato, por idioma. Para agregar un idioma: un archivo
 * `src/i18n/<idioma>.ts` con la misma forma que `es` y una línea aquí; si le falta una clave,
 * no compila.
 */
export const CONTRACT_MESSAGES = { es } as const satisfies Record<string, MessageShape<typeof es>>;

/** Los idiomas en que el contrato tiene sus mensajes. */
export type ContractLanguage = keyof typeof CONTRACT_MESSAGES;

/** Idioma que se usa cuando piden uno que el contrato no tiene. */
export const DEFAULT_CONTRACT_LANGUAGE: ContractLanguage = 'es';

/** Busca una clave con puntos dentro de un catálogo; `undefined` si no existe o no es un texto. */
function textFor(catalog: object, key: string): string | undefined {
  let node: unknown = catalog;
  for (const segment of key.split('.')) {
    if (typeof node !== 'object' || node === null || !Object.hasOwn(node, segment)) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

/** El catálogo del idioma pedido (`es-CO` sirve el de `es`), o el de por defecto. */
function catalogFor(language: string): object {
  const [primary = ''] = language.toLowerCase().split('-');
  return Object.hasOwn(CONTRACT_MESSAGES, primary)
    ? CONTRACT_MESSAGES[primary as ContractLanguage]
    : CONTRACT_MESSAGES[DEFAULT_CONTRACT_LANGUAGE];
}

/**
 * El texto en un idioma de un mensaje de validación del contrato.
 *
 * Lo que no es una clave del contrato (el mensaje de otro schema, o el texto que la propia app
 * escribió) se devuelve tal cual, así que es seguro pasar por aquí cualquier `issue.message`.
 * Si el idioma no tiene la clave, se usa el idioma de por defecto.
 *
 * @param language - Idioma en que se quiere el texto (`es`, o una región como `es-CO`).
 * @param message - El `message` de una falla de validación.
 * @returns El texto de la clave en ese idioma, o `message` sin cambios si no es una clave.
 *
 * @example
 * ```ts
 * const result = MobilePhoneSchema.safeParse('300');
 * if (!result.success) showError(contractMessage('es', result.error.issues[0]!.message));
 * ```
 */
export function contractMessage(language: string, message: string): string {
  return (
    textFor(catalogFor(language), message) ??
    textFor(CONTRACT_MESSAGES[DEFAULT_CONTRACT_LANGUAGE], message) ??
    message
  );
}
