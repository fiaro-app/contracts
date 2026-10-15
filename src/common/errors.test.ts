import { describe, expect, it } from 'vitest';
import { ApiErrorSchema, ErrorCodeSchema } from './errors';

const baseError = {
  statusCode: 404,
  message: 'Préstamo no encontrado.',
  path: '/loans/0192a0b4-3b5c-7d2e-8f00-123456789abc',
  timestamp: '2026-09-23T15:00:00Z',
  issues: null,
};

describe('ErrorCodeSchema', () => {
  it('incluye los códigos de los errores de dominio de autenticación', () => {
    expect(ErrorCodeSchema.options).toEqual(
      expect.arrayContaining(['INVALID_PHONE', 'INVALID_PASSWORD_LENGTH', 'PHONE_ALREADY_REGISTERED']),
    );
  });

  it('incluye el bloqueo del inicio de sesión por celular y la contraseña demasiado débil', () => {
    expect(ErrorCodeSchema.options).toEqual(expect.arrayContaining(['SIGN_IN_LOCKED', 'PASSWORD_TOO_WEAK']));
    expect(ErrorCodeSchema.enum.SIGN_IN_LOCKED).toBe('SIGN_IN_LOCKED');
    expect(ErrorCodeSchema.enum.PASSWORD_TOO_WEAK).toBe('PASSWORD_TOO_WEAK');
  });

  it('incluye la recuperación de contraseña, el correo de contacto y la desactivación de cuenta', () => {
    expect(ErrorCodeSchema.options).toEqual(
      expect.arrayContaining([
        'PASSWORD_RESET_CODE_INVALID',
        'PASSWORD_RESET_CODE_EXPIRED',
        'CONTACT_EMAIL_NOT_SET',
        'CONTACT_EMAIL_ALREADY_VERIFIED',
        'CONTACT_EMAIL_VERIFICATION_CODE_INVALID',
        'CONTACT_EMAIL_VERIFICATION_CODE_EXPIRED',
        'ACCOUNT_DEACTIVATED',
      ]),
    );
  });
});

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

  it('conserva el errorCode y el requestId cuando vienen, y no los exige', () => {
    expect(ApiErrorSchema.parse({ ...baseError, code: 'LOAN_NOT_FOUND', errorCode: 'L003A', requestId: 'req-1' })).toMatchObject({ errorCode: 'L003A', requestId: 'req-1' });
    expect(ApiErrorSchema.safeParse({ ...baseError, code: 'LOAN_NOT_FOUND' }).success).toBe(true);
  });
});
