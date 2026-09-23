import { describe, expect, it } from 'vitest';
import { ApiErrorSchema, ErrorCodeSchema } from './errors';

const baseError = {
  statusCode: 404,
  message: 'Préstamo no encontrado.',
  path: '/loans/0192a0b4-3b5c-7d2e-8f00-123456789abc',
  timestamp: '2026-09-23T15:00:00Z',
  issues: null,
};

describe('ApiErrorSchema', () => {
  it('acepta códigos que la app todavía no conoce', () => {
    expect(ApiErrorSchema.safeParse({ ...baseError, code: 'LOAN_NOT_FOUND' }).success).toBe(true);
  });

  it('incluye el detalle por campo en los errores de validación', () => {
    const error = ApiErrorSchema.parse({
      ...baseError,
      statusCode: 400,
      code: ErrorCodeSchema.enum.VALIDATION_FAILED,
      issues: [{ path: ['phone'], message: 'Ingresa un celular colombiano válido de 10 dígitos.' }],
    });
    expect(error.issues?.[0]?.path).toEqual(['phone']);
  });
});
