import { z } from 'zod';
import { TimestampSchema } from './dates';

/**
 * Códigos de error generales. Cada módulo agrega los suyos (`LOAN_NOT_FOUND`,
 * `CLIENT_NATIONAL_ID_TAKEN`...) a medida que se construye. Las apps reaccionan al código,
 * nunca al texto del mensaje.
 */
export const ErrorCodeSchema = z.enum([
  /** 400: el body, los parámetros o la ruta no cumplen el contrato. */
  'VALIDATION_FAILED',
  /** 401: no hay sesión o expiró. */
  'UNAUTHENTICATED',
  /** 403: la sesión no tiene permiso para esta acción o recurso. */
  'FORBIDDEN',
  /** 403: la cuenta debe cambiar su contraseña temporal antes de continuar. */
  'PASSWORD_CHANGE_REQUIRED',
  /** 403: la suscripción está en solo lectura; solo se permiten lecturas y registrar cobros. */
  'SUBSCRIPTION_READ_ONLY',
  /** 404: el recurso no existe o no pertenece al prestamista de la sesión. */
  'NOT_FOUND',
  /** 409: el cambio choca con el estado actual (duplicado, ya procesado). */
  'CONFLICT',
  /** 429: demasiadas solicitudes (por ejemplo, intentos de inicio de sesión). */
  'RATE_LIMITED',
  /** 503: el servicio está en mantenimiento. */
  'MAINTENANCE',
  /** 500: error inesperado del servidor. */
  'INTERNAL_ERROR',
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

/** Detalle de un campo inválido cuando el código es `VALIDATION_FAILED`. */
export const ValidationIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

/**
 * Cuerpo de toda respuesta de error de la API. `code` se valida como texto libre para que una
 * app desactualizada no falle al recibir un código nuevo.
 */
export const ApiErrorSchema = z.object({
  statusCode: z.int(),
  code: z.string(),
  message: z.string(),
  path: z.string(),
  timestamp: TimestampSchema,
  issues: z.array(ValidationIssueSchema).nullable(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
