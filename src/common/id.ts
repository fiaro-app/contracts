import { z } from 'zod';
import { messageKey } from '../i18n/message-key';

/**
 * Identificador de cualquier entidad (UUID).
 *
 * La API genera UUIDv7, que se ordenan por fecha de creación y mantienen compactos los índices.
 * La app móvil genera en el dispositivo el `id` de cada visita para poder registrarla sin
 * conexión; ese mismo `id` es la llave de idempotencia al sincronizar.
 */
export const IdSchema = z.uuid({ error: messageKey('contracts.id.invalid') });
export type Id = z.infer<typeof IdSchema>;
