import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  ClientSchema,
  CollectionAssignmentSchema,
  CollectionVisitSchema,
  DailySettlementSchema,
  LenderSchema,
  LoanSchema,
  MembershipSchema,
  NonWorkingDaySchema,
  NotificationSchema,
  PaymentReversalSchema,
  PaymentSchema,
  PortfolioSchema,
  SubscriptionSchema,
  TenantSchema,
  UserSchema,
} from './index';

const id = (suffix: number) => `0192a0b4-3b5c-7d2e-8f00-${String(suffix).padStart(12, '0')}`;
const at = '2026-09-23T15:00:00Z';

/** Un ejemplo válido de cada entidad: documenta la forma esperada y detecta cambios accidentales. */
const fixtures: Array<[string, z.ZodType, Record<string, unknown>]> = [
  [
    'User',
    UserSchema,
    {
      id: id(1),
      phone: '+573001234567',
      fullName: 'Alejo Zuleta',
      email: null,
      nationalId: '10234567',
      mustChangePassword: true,
      createdAt: at,
    },
  ],
  ['Tenant', TenantSchema, { id: id(2), name: 'Préstamos El Águila', createdAt: at }],
  [
    'Subscription',
    SubscriptionSchema,
    {
      id: id(3),
      tenantId: id(2),
      status: 'GRACE_PERIOD',
      maxActiveLenders: 1,
      currentPeriodEndsAt: '2026-09-20T05:00:00Z',
      graceEndsAt: '2026-09-27T05:00:00Z',
      createdAt: at,
    },
  ],
  [
    'Lender',
    LenderSchema,
    {
      id: id(4),
      tenantId: id(2),
      name: 'Financiera Buen Vecino',
      logoUrl: null,
      nonWorkingWeekdays: ['SUNDAY'],
      skipNationalHolidays: true,
      createdAt: at,
    },
  ],
  ['NonWorkingDay', NonWorkingDaySchema, { id: id(5), date: '2026-12-24', reason: 'Cierre de fin de año', createdAt: at }],
  [
    'Membership',
    MembershipSchema,
    {
      id: id(6),
      userId: id(1),
      lenderId: id(4),
      roles: ['OWNER', 'LENDER', 'COLLECTOR'],
      status: 'ACTIVE',
      portfolioId: id(7),
      createdAt: at,
      deactivatedAt: null,
    },
  ],
  ['Portfolio', PortfolioSchema, { id: id(7), name: 'General', isDefault: true, createdAt: at }],
  [
    'Client',
    ClientSchema,
    {
      id: id(8),
      nationalId: '1020304050',
      fullName: 'María Gómez',
      occupation: 'Vendedora ambulante',
      phone: '+573001234567',
      address: 'Calle 45 #12-30, Barrio Bolívar',
      createdAt: at,
      updatedAt: at,
    },
  ],
  [
    'Loan',
    LoanSchema,
    {
      id: id(9),
      clientId: id(8),
      principalAmount: 500_000,
      installmentCount: 20,
      installmentValue: 30_000,
      totalPayable: 600_000,
      frequency: 'DAILY',
      startDate: '2026-09-22',
      status: 'ACTIVE',
      createdByMembershipId: id(6),
      createdAt: at,
      closedAt: null,
    },
  ],
  [
    'CollectionAssignment',
    CollectionAssignmentSchema,
    {
      id: id(10),
      loanId: id(9),
      collectorMembershipId: id(6),
      effectiveFrom: '2026-09-22',
      effectiveTo: null,
      createdAt: at,
    },
  ],
  [
    'CollectionVisit',
    CollectionVisitSchema,
    {
      id: id(11),
      loanId: id(9),
      collectorMembershipId: id(6),
      outcome: 'RESCHEDULED',
      expectedAmount: 30_000,
      promisedDate: '2026-09-24',
      occurredAt: '2026-09-23T10:15:00-05:00',
      createdAt: at,
    },
  ],
  [
    'Payment',
    PaymentSchema,
    {
      id: id(12),
      loanId: id(9),
      visitId: id(11),
      amount: 25_000,
      method: 'NEQUI',
      occurredAt: '2026-09-23T10:15:00-05:00',
      createdAt: at,
    },
  ],
  [
    'PaymentReversal',
    PaymentReversalSchema,
    { id: id(13), paymentId: id(12), reason: 'Se digitó 250.000 en vez de 25.000.', reversedByMembershipId: id(6), createdAt: at },
  ],
  [
    'DailySettlement',
    DailySettlementSchema,
    {
      id: id(14),
      collectorMembershipId: id(6),
      date: '2026-09-23',
      expectedAmount: 480_000,
      collectedAmount: 450_000,
      collectedByMethod: { CASH: 320_000, NEQUI: 100_000, TRANSFER: 30_000 },
      status: 'PENDING',
      collectorNote: 'Yolanda Pérez no estaba; prometió pagar el jueves.',
      reviewNote: null,
      reviewedByMembershipId: null,
      reviewedAt: null,
      submittedAt: at,
      createdAt: at,
    },
  ],
  [
    'Notification',
    NotificationSchema,
    {
      id: id(15),
      recipientUserId: id(1),
      lenderId: id(4),
      severity: 'WARNING',
      title: 'Cuadre con diferencia',
      body: 'Alejo Zuleta cerró con -$30.000.',
      relatedEntityType: 'DAILY_SETTLEMENT',
      relatedEntityId: id(14),
      readAt: null,
      createdAt: at,
    },
  ],
];

describe('entidades', () => {
  it.each(fixtures)('%s acepta su ejemplo válido', (_name, schema, value) => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it('ignoran campos que no conocen, para que una app vieja tolere respuestas nuevas', () => {
    const loan = fixtures.find(([name]) => name === 'Loan')?.[2];
    const parsed = LoanSchema.parse({ ...loan, campoNuevo: 'x' });
    expect(parsed).not.toHaveProperty('campoNuevo');
  });

  it('un usuario inicia sesión con celular, no con fijo', () => {
    const user = fixtures[0]?.[2];
    expect(UserSchema.safeParse({ ...user, phone: '+576012345678' }).success).toBe(false);
  });

  it('un préstamo necesita al menos una cuota y un valor prestado mayor a cero', () => {
    const loan = fixtures.find(([name]) => name === 'Loan')?.[2];
    expect(LoanSchema.safeParse({ ...loan, installmentCount: 0 }).success).toBe(false);
    expect(LoanSchema.safeParse({ ...loan, principalAmount: 0 }).success).toBe(false);
  });

  it('una membresía tiene al menos un rol', () => {
    const membership = fixtures.find(([name]) => name === 'Membership')?.[2];
    expect(MembershipSchema.safeParse({ ...membership, roles: [] }).success).toBe(false);
  });

  it('el cuadre desglosa todos los medios de pago', () => {
    const settlement = fixtures.find(([name]) => name === 'DailySettlement')?.[2];
    expect(
      DailySettlementSchema.safeParse({ ...settlement, collectedByMethod: { CASH: 450_000 } }).success,
    ).toBe(false);
  });
});
