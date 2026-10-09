import { describe, expect, it } from 'vitest';
import { LATE_MAX_DAYS, OverdueStatusSchema, overdueStatus } from './overdue-status';

describe('overdueStatus', () => {
  it.each([
    [{ balance: 0, overdueDays: 0 }, 'PAID'],
    [{ balance: 0, overdueDays: 20 }, 'PAID'],
    [{ balance: 100_000, overdueDays: 0 }, 'CURRENT'],
    [{ balance: 100_000, overdueDays: 1 }, 'LATE'],
    [{ balance: 100_000, overdueDays: LATE_MAX_DAYS }, 'LATE'],
    [{ balance: 100_000, overdueDays: LATE_MAX_DAYS + 1 }, 'DELINQUENT'],
    [{ balance: 100_000, overdueDays: 90 }, 'DELINQUENT'],
  ] as const)('%j -> %s', (loan, expected) => {
    expect(overdueStatus(loan)).toBe(expected);
  });

  it('la frontera de atraso y mora es de 7 días', () => {
    expect(LATE_MAX_DAYS).toBe(7);
  });

  it('el schema acepta solo los cuatro estados', () => {
    expect(OverdueStatusSchema.options).toEqual(['paid', 'current', 'late', 'DELINQUENT']);
    expect(OverdueStatusSchema.safeParse('OVERDUE').success).toBe(false);
  });
});
