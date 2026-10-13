import { z } from 'zod';

/**
 * Contacto de ventas que deja alguien desde el sitio público: hace falta `phone` o `email` (la API
 * lo valida). `website` es un campo señuelo contra robots: debe viajar vacío o ausente; con algo
 * escrito, el contacto se descarta en silencio.
 */
export const CreateLeadRequestSchema = z.strictObject({
  name: z.string().min(1),
  phone: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  message: z.string().min(1),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
});
export type CreateLeadRequest = z.infer<typeof CreateLeadRequestSchema>;

/** El contacto quedó recibido; ventas responderá por el medio que dejó. */
export const LeadReceivedSchema = z.object({ received: z.literal(true) });
export type LeadReceived = z.infer<typeof LeadReceivedSchema>;
