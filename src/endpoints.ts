import { systemEndpoints } from './system';

/**
 * Todos los endpoints de la API, agrupados por módulo. Cada módulo agrega los suyos al
 * construirse; la API puede recorrer este registro para verificar que ninguno quede sin
 * implementar.
 */
export const endpoints = {
  system: systemEndpoints,
} as const;
