import { describe, expect, it } from 'vitest';
import { NationalIdSchema, normalizeNationalId } from './national-id';

describe('NationalIdSchema', () => {
  it.each(['1020304050', '10234567', '123'])('acepta %s', (nationalId) => {
    expect(NationalIdSchema.safeParse(nationalId).success).toBe(true);
  });

  it.each(['1.020.304.050', '0123456', '12', '12345678901', 'CC123456'])('rechaza %s', (nationalId) => {
    expect(NationalIdSchema.safeParse(nationalId).success).toBe(false);
  });
});

describe('normalizeNationalId', () => {
  it('quita puntos, comas, guiones y espacios', () => {
    expect(normalizeNationalId('1.020.304.050')).toBe('1020304050');
    expect(normalizeNationalId(' 10 234 567 ')).toBe('10234567');
  });

  it('no inventa dígitos: el resultado se sigue validando con el schema', () => {
    expect(NationalIdSchema.safeParse(normalizeNationalId('CC 1.020')).success).toBe(false);
  });
});
