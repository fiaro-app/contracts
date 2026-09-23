import { describe, expect, it } from 'vitest';
import { BusinessDateSchema, DateRangeSchema, TimestampSchema, toBusinessDate } from './dates';

describe('BusinessDateSchema', () => {
  it('acepta AAAA-MM-DD y rechaza otros formatos o fechas imposibles', () => {
    expect(BusinessDateSchema.safeParse('2026-09-23').success).toBe(true);
    expect(BusinessDateSchema.safeParse('2028-02-29').success).toBe(true);
    expect(BusinessDateSchema.safeParse('23/09/2026').success).toBe(false);
    expect(BusinessDateSchema.safeParse('2026-9-23').success).toBe(false);
    expect(BusinessDateSchema.safeParse('2026-02-30').success).toBe(false);
  });
});

describe('TimestampSchema', () => {
  it('exige zona horaria explícita', () => {
    expect(TimestampSchema.safeParse('2026-09-23T10:15:00-05:00').success).toBe(true);
    expect(TimestampSchema.safeParse('2026-09-23T15:15:00.123Z').success).toBe(true);
    expect(TimestampSchema.safeParse('2026-09-23T10:15:00').success).toBe(false);
  });
});

describe('DateRangeSchema', () => {
  it('acepta un rango de un solo día y rechaza uno invertido', () => {
    expect(DateRangeSchema.safeParse({ from: '2026-09-01', to: '2026-09-01' }).success).toBe(true);
    const inverted = DateRangeSchema.safeParse({ from: '2026-09-30', to: '2026-09-01' });
    expect(inverted.success).toBe(false);
    expect(inverted.error?.issues[0]?.path).toEqual(['to']);
  });
});

describe('toBusinessDate', () => {
  it('usa la hora de Colombia (UTC-5), no la del servidor', () => {
    // 23:30 del 22 de septiembre en Bogotá = 04:30 UTC del 23.
    expect(toBusinessDate(new Date('2026-09-23T04:30:00Z'))).toBe('2026-09-22');
    // Medianoche en Bogotá = 05:00 UTC.
    expect(toBusinessDate(new Date('2026-09-23T05:00:00Z'))).toBe('2026-09-23');
  });
});
