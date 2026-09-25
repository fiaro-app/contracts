import { describe, expect, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';
import { BusinessDateSchema, DateRangeSchema, TimestampSchema } from '../common/dates';
import { IdSchema } from '../common/id';
import { CopAmountSchema, MAX_COP_AMOUNT, PositiveCopAmountSchema } from '../common/money';
import { NationalIdSchema } from '../common/national-id';
import { MobilePhoneSchema, PhoneSchema } from '../common/phone';
import { AppVersionSchema } from '../system/system.schemas';
import {
  CONTRACT_MESSAGES,
  DEFAULT_CONTRACT_LANGUAGE,
  contractMessage,
  type ContractMessageKey,
} from './messages';
import { messageKey } from './message-key';

/** Cada clave del catálogo con un schema del contrato y un dato que lo rechaza con ella. */
const cases: [ContractMessageKey, z.ZodType, unknown][] = [
  ['contracts.app_version.invalid', AppVersionSchema, '1.4'],
  ['contracts.date.invalid', BusinessDateSchema, '23/09/2026'],
  ['contracts.date_range.end_before_start', DateRangeSchema, { from: '2026-09-30', to: '2026-09-01' }],
  ['contracts.id.invalid', IdSchema, 'no-es-un-uuid'],
  ['contracts.money.not_integer', CopAmountSchema, 35_000.5],
  ['contracts.money.negative', CopAmountSchema, -1],
  ['contracts.money.too_high', CopAmountSchema, MAX_COP_AMOUNT + 1],
  ['contracts.money.not_positive', PositiveCopAmountSchema, 0],
  ['contracts.national_id.invalid', NationalIdSchema, '1.020.304.050'],
  ['contracts.phone.invalid', PhoneSchema, '3001234567'],
  ['contracts.phone.invalid_mobile', MobilePhoneSchema, '+576012345678'],
  ['contracts.timestamp.invalid', TimestampSchema, '2026-09-23T10:15:00'],
];

/** Todas las claves de un catálogo, como rutas con puntos. */
function keysOf(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]: [string, unknown]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : keysOf(value as object, `${prefix}${key}.`),
  );
}

describe('mensajes de validación del contrato', () => {
  describe('cada schema que escribe su mensaje usa una clave del catálogo', () => {
    it.each(cases)('%s', (key, schema, input) => {
      const result = schema.safeParse(input);

      expect(result.error?.issues[0]?.message).toBe(key);
    });

    it('no queda ninguna clave sin schema que la use, ni texto sin clave', () => {
      const catalogKeys = keysOf(CONTRACT_MESSAGES[DEFAULT_CONTRACT_LANGUAGE]).sort();

      expect(cases.map(([key]) => key).sort()).toEqual(catalogKeys);
    });
  });

  describe('contractMessage', () => {
    it.each(cases)('traduce %s al español', (key) => {
      const text = contractMessage('es', key);

      expect(text).not.toBe(key);
      expect(text.length).toBeGreaterThan(0);
    });

    it('un mensaje que no es una clave del contrato sale tal cual', () => {
      expect(contractMessage('es', 'Muy corto')).toBe('Muy corto');
      expect(contractMessage('es', 'validation.too_small.string')).toBe('validation.too_small.string');
      expect(contractMessage('es', 'contracts.no.existe')).toBe('contracts.no.existe');
      expect(contractMessage('es', '')).toBe('');
    });

    it('un grupo de claves no es un texto', () => {
      expect(contractMessage('es', 'contracts.money')).toBe('contracts.money');
      expect(contractMessage('es', 'contracts')).toBe('contracts');
    });

    it('los nombres de Object.prototype no son claves', () => {
      for (const name of ['constructor', 'toString', '__proto__', 'contracts.constructor']) {
        expect(contractMessage('es', name)).toBe(name);
      }
    });

    it('una región usa el idioma base', () => {
      expect(contractMessage('es-CO', 'contracts.id.invalid')).toBe('Identificador inválido.');
      expect(contractMessage('ES', 'contracts.id.invalid')).toBe('Identificador inválido.');
    });

    it('un idioma que el contrato no tiene usa el de por defecto', () => {
      expect(contractMessage('fr', 'contracts.id.invalid')).toBe('Identificador inválido.');
      expect(contractMessage('', 'contracts.id.invalid')).toBe('Identificador inválido.');
      expect(contractMessage('constructor', 'contracts.id.invalid')).toBe('Identificador inválido.');
    });
  });

  describe('catálogos por idioma', () => {
    it('el idioma de por defecto existe', () => {
      expect(Object.keys(CONTRACT_MESSAGES)).toContain(DEFAULT_CONTRACT_LANGUAGE);
    });

    it('todos los idiomas tienen las mismas claves que el de por defecto, con texto', () => {
      const expected = keysOf(CONTRACT_MESSAGES[DEFAULT_CONTRACT_LANGUAGE]).sort();

      for (const catalog of Object.values(CONTRACT_MESSAGES)) {
        expect(keysOf(catalog).sort()).toEqual(expected);
      }
      for (const key of expected) {
        expect(contractMessage(DEFAULT_CONTRACT_LANGUAGE, key).trim()).not.toBe('');
      }
    });

    it('un idioma al que le falta una clave no compila', () => {
      // @ts-expect-error el catálogo de un idioma nuevo debe tener toda la forma de `es`
      const incomplete: (typeof CONTRACT_MESSAGES)['es'] = { contracts: {} };

      expect(incomplete).toBeDefined();
    });
  });

  describe('messageKey', () => {
    it('devuelve la misma clave', () => {
      expect(messageKey('contracts.id.invalid')).toBe('contracts.id.invalid');
    });

    it('solo compila con una clave del catálogo', () => {
      // @ts-expect-error la clave no existe
      messageKey('contracts.id.no_existe');

      expectTypeOf(messageKey).parameter(0).toEqualTypeOf<ContractMessageKey>();
    });
  });
});
