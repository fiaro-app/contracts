import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as contracts from './index';

const exported = Object.entries(contracts);

describe('@fiaro-app/contracts', () => {
  it('nombra cada schema exportado con el sufijo Schema', () => {
    const misnamed = exported
      .filter(([, value]) => value instanceof z.ZodType)
      .map(([name]) => name)
      .filter((name) => !name.endsWith('Schema'));
    expect(misnamed).toEqual([]);
  });

  it('escribe los valores de todos los enums en MAYÚSCULAS_CON_GUION_BAJO', () => {
    const invalid = exported
      .filter(([, value]) => value instanceof z.ZodEnum)
      .flatMap(([name, value]) =>
        (value as z.ZodEnum).options
          .filter((option) => !/^[A-Z][A-Z0-9_]*$/.test(String(option)))
          .map((option) => `${name}.${String(option)}`),
      );
    expect(invalid).toEqual([]);
  });
});
