import { describe, expect, it } from 'vitest';
import { contractMessage } from '../i18n';
import { MobilePhoneSchema, PhoneSchema, toColombianE164 } from './phone';

describe('PhoneSchema', () => {
  it.each(['+573001234567', '+573509876543', '+576012345678', '+576048765432'])(
    'acepta %s',
    (phone) => {
      expect(PhoneSchema.safeParse(phone).success).toBe(true);
    },
  );

  it.each([
    ['11 dígitos nacionales', '+5730012345678'],
    ['sin indicativo', '3001234567'],
    ['no empieza por 3 ni por 60', '+575012345678'],
    ['indicativo de fijo inexistente', '+576092345678'],
    ['con espacios', '+57 300 123 4567'],
  ])('rechaza un número %s', (_caso, phone) => {
    expect(PhoneSchema.safeParse(phone).success).toBe(false);
  });
});

describe('MobilePhoneSchema', () => {
  it('acepta celulares y rechaza fijos', () => {
    expect(MobilePhoneSchema.safeParse('+573001234567').success).toBe(true);
    expect(MobilePhoneSchema.safeParse('+576012345678').success).toBe(false);
  });

  it('explica el error con una clave de mensaje, que se traduce con contractMessage', () => {
    const result = MobilePhoneSchema.safeParse('300');
    const message = result.error?.issues[0]?.message ?? '';
    expect(message).toBe('contracts.phone.invalid_mobile');
    expect(contractMessage('es', message)).toBe('Ingresa un celular colombiano válido de 10 dígitos.');
  });
});

describe('toColombianE164', () => {
  it.each([
    ['300 123 4567', '+573001234567'],
    ['+57 300-123-4567', '+573001234567'],
    ['573001234567', '+573001234567'],
    ['(601) 234 5678', '+576012345678'],
  ])('convierte "%s" a %s', (input, expected) => {
    expect(toColombianE164(input)).toBe(expected);
  });

  it.each(['300 1234 5678', '301 234', '', 'no es un número'])('devuelve null para "%s"', (input) => {
    expect(toColombianE164(input)).toBeNull();
  });
});
