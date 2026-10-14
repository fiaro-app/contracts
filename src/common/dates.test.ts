import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BusinessDateSchema,
  DateRangeSchema,
  TimestampSchema,
  boundedDateRange,
  daysInRange,
  toBusinessDate,
} from './dates';

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

describe('daysInRange', () => {
  it('cuenta ambos extremos, también entre meses y años', () => {
    expect(daysInRange('2026-09-01', '2026-09-01')).toBe(1);
    expect(daysInRange('2026-09-01', '2026-09-30')).toBe(30);
    expect(daysInRange('2026-01-01', '2026-12-31')).toBe(365);
  });
});

describe('boundedDateRange', () => {
  afterEach(() => vi.useRealTimers());

  it('rechaza fechas posteriores a hoy en Colombia salvo que se permitan', () => {
    vi.useFakeTimers({ now: new Date('2026-10-14T15:00:00Z') });
    const past = boundedDateRange({ maxDays: 31 });
    expect(past.safeParse({ from: '2026-10-01', to: '2026-10-14' }).success).toBe(true);
    const future = past.safeParse({ from: '2026-10-01', to: '2026-10-15' });
    expect(future.error?.issues[0]).toMatchObject({ path: ['to'], message: 'contracts.date_range.in_future' });
    expect(boundedDateRange({ maxDays: 31, allowFuture: true }).safeParse({ from: '2026-10-01', to: '2026-10-15' }).success).toBe(true);
  });

  it('rechaza un rango más largo que el máximo y sigue rechazando uno invertido', () => {
    vi.useFakeTimers({ now: new Date('2026-12-31T15:00:00Z') });
    const range = boundedDateRange({ maxDays: 31 });
    expect(range.safeParse({ from: '2026-10-01', to: '2026-10-31' }).success).toBe(true);
    const long = range.safeParse({ from: '2026-10-01', to: '2026-11-01' });
    expect(long.error?.issues[0]).toMatchObject({ path: ['from'], message: 'contracts.date_range.too_long' });
    expect(range.safeParse({ from: '2026-10-02', to: '2026-10-01' }).success).toBe(false);
  });
});
