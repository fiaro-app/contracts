import type { ContractMessageKey } from './messages';

/**
 * Declara la clave de mensaje de un schema: devuelve la misma clave, pero solo compila si existe
 * en el catálogo. Es interno: no se exporta desde `index.ts`.
 *
 * @param key - Clave del catálogo, por ejemplo `contracts.id.invalid`.
 */
export function messageKey(key: ContractMessageKey): ContractMessageKey {
  return key;
}
