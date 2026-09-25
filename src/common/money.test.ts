import { describe, expect, it } from 'vitest';
import { contractMessage } from '../i18n';
import { CopAmountSchema, CopTotalSchema, MAX_COP_AMOUNT, PositiveCopAmountSchema } from './money';

describe('CopAmountSchema', () => {
  it('acepta enteros desde 0 hasta el máximo de una columna INTEGER', () => {
    expect(CopAmountSchema.safeParse(0).success).toBe(true);
    expect(CopAmountSchema.safeParse(35_000).success).toBe(true);
    expect(CopAmountSchema.safeParse(MAX_COP_AMOUNT).success).toBe(true);
  });

  it('rechaza centavos, negativos y valores fuera de rango', () => {
    expect(CopAmountSchema.safeParse(35_000.5).success).toBe(false);
    expect(CopAmountSchema.safeParse(-1).success).toBe(false);
    expect(CopAmountSchema.safeParse(MAX_COP_AMOUNT + 1).success).toBe(false);
    expect(CopAmountSchema.safeParse('35000').success).toBe(false);
  });
});

describe('PositiveCopAmountSchema', () => {
  it('exige un valor mayor a cero con el mensaje del formulario', () => {
    const result = PositiveCopAmountSchema.safeParse(0);
    expect(result.success).toBe(false);
    const message = result.error?.issues[0]?.message ?? '';
    expect(message).toBe('contracts.money.not_positive');
    expect(contractMessage('es', message)).toBe('Ingresa un valor mayor a $0.');
  });
});

describe('CopTotalSchema', () => {
  it('admite sumas mayores que el límite de un registro', () => {
    expect(CopTotalSchema.safeParse(5_000_000_000).success).toBe(true);
  });
});
