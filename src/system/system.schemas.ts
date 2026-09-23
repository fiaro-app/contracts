import { z } from 'zod';

/** Versión de la app móvil: `MAYOR.MENOR.PARCHE` (`1.4.0`). */
export const AppVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, { error: 'Versión inválida: usa el formato MAYOR.MENOR.PARCHE.' });
export type AppVersion = z.infer<typeof AppVersionSchema>;

/** Respuesta de `GET /health` cuando el servicio está disponible. */
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  /** Versión desplegada de la API. */
  version: z.string().min(1),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/** Respuesta de `GET /mobile/version`: la app la consulta antes de mostrar cualquier pantalla. */
export const MobileVersionResponseSchema = z.object({
  /** Por debajo de esta versión la app se bloquea y pide actualizar. */
  minimumSupportedVersion: AppVersionSchema,
  latestVersion: AppVersionSchema,
  /** Dónde descargar el APK más reciente. */
  downloadUrl: z.url(),
});
export type MobileVersionResponse = z.infer<typeof MobileVersionResponseSchema>;

/**
 * Compara dos versiones `MAYOR.MENOR.PARCHE`. Devuelve un número negativo si `a` es anterior a
 * `b`, 0 si son iguales y positivo si `a` es posterior.
 */
export function compareAppVersions(a: AppVersion, b: AppVersion): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (partsA[index] ?? 0) - (partsB[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}
