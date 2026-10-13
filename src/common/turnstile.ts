import { z } from 'zod';

/**
 * Token emitido por Cloudflare Turnstile tras resolver el desafío de seguridad.
 *
 * @remarks
 * Se envía en el cuerpo (`turnstileToken`) o en la cabecera `cf-turnstile-response`.
 */
export const TurnstileTokenSchema = z.string().min(1).meta({
  description:
    'Token de respuesta de Cloudflare Turnstile para verificar que la petición no proviene de un robot.',
  example: '0.xxxxxxxx.xxxxxxxx',
});
export type TurnstileToken = z.infer<typeof TurnstileTokenSchema>;

/** Nombre estándar de la cabecera HTTP de Cloudflare Turnstile. */
export const TURNSTILE_HEADER = 'cf-turnstile-response' as const;
