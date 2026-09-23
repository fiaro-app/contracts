import { defineEndpoint } from '../http';
import { HealthResponseSchema, MobileVersionResponseSchema } from './system.schemas';

/** Endpoints de infraestructura: los usa la app desde el primer arranque. */
export const systemEndpoints = {
  health: defineEndpoint({
    method: 'GET',
    path: '/health',
    summary: 'Estado del servicio. Durante un mantenimiento responde 503 con el código MAINTENANCE.',
    response: HealthResponseSchema,
  }),
  mobileVersion: defineEndpoint({
    method: 'GET',
    path: '/mobile/version',
    summary: 'Versión mínima soportada y más reciente de la app móvil.',
    response: MobileVersionResponseSchema,
  }),
} as const;
