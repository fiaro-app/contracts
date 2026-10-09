import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  AccountSessionSchema,
  ArrearsBucketSchema,
  ClientListItemSchema,
  ClientSchema,
  CollectionAssignmentSchema,
  CollectionVisitReportSchema,
  CollectionVisitSchema,
  CollectorPeriodStatsSchema,
  CreateLeadRequestSchema,
  DailySettlementSchema,
  LenderDashboardSchema,
  LenderPeriodStatsSchema,
  LenderSchema,
  LoanInstallmentsSchema,
  LoanListItemSchema,
  LoanSchema,
  MarkAllReadResultSchema,
  MembershipSchema,
  NonWorkingDaySchema,
  NotificationSchema,
  PaymentReversalSchema,
  PaymentSchema,
  PortfolioSchema,
  SubscriptionDetailsSchema,
  SubscriptionSchema,
  TenantSchema,
  UnreadCountSchema,
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
      brandColor: null,
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
  [
    'LoanInstallments',
    LoanInstallmentsSchema,
    {
      loanId: id(9),
      asOf: '2026-09-25',
      installments: [
        { number: 1, dueDate: '2026-09-22', expectedAmount: 30_000, paidAmount: 30_000, status: 'PAID' },
        { number: 2, dueDate: '2026-09-23', expectedAmount: 30_000, paidAmount: 10_000, status: 'PARTIAL' },
        { number: 3, dueDate: '2026-09-24', expectedAmount: 30_000, paidAmount: 0, status: 'OVERDUE' },
        { number: 4, dueDate: '2026-09-26', expectedAmount: 30_000, paidAmount: 0, status: 'PENDING' },
      ],
    },
  ],
  [
    'LoanListItem',
    LoanListItemSchema,
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
      balance: 380_000,
      overdueAmount: 60_000,
      overdueDays: 2,
      nextDueDate: '2026-09-26',
      collector: { membershipId: id(6), fullName: 'Alejo Zuleta' },
    },
  ],
  [
    'ClientListItem',
    ClientListItemSchema,
    {
      id: id(8),
      nationalId: '1020304050',
      fullName: 'María Gómez',
      occupation: 'Vendedora ambulante',
      phone: '+573001234567',
      address: 'Calle 45 #12-30, Barrio Bolívar',
      createdAt: at,
      balance: 380_000,
      overdueAmount: 60_000,
      overdueDays: 2,
      activeLoans: 1,
    },
  ],
  [
    'CollectionVisitReport',
    CollectionVisitReportSchema,
    {
      data: [
        {
          visitId: id(11),
          occurredAt: '2026-09-23T10:15:00-05:00',
          outcome: 'PAID',
          expectedAmount: 30_000,
          promisedDate: null,
          loan: { id: id(9) },
          client: { id: id(8), fullName: 'María Gómez' },
          collector: { membershipId: id(6), fullName: 'Alejo Zuleta' },
          payment: { id: id(12), amount: 30_000, method: 'CASH', reversed: false },
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
      range: { from: '2026-09-23', to: '2026-09-23' },
    },
  ],
  [
    'CollectorPeriodStats',
    CollectorPeriodStatsSchema,
    { from: '2026-09-01', to: '2026-09-23', expectedAmount: 1_000_000, collectedAmount: 900_000, effectiveness: 0.9, visitsCount: 40, overdueAmount: 0 },
  ],
  [
    'LenderDashboard',
    LenderDashboardSchema,
    {
      totalPortfolio: 18_400_000,
      collectedToday: 3_200_000,
      activeCollectors: 7,
      totalCollectors: 9,
      effectivenessToday: 0.84,
      clientsInArrears: 23,
      alerts: ['3 cobradores aún no han iniciado su ruta hoy.'],
      pendingSettlements: [],
      period: { from: '2026-09-01', to: '2026-09-23' },
      collectedInPeriod: 9_000_000,
      expectedInPeriod: 10_000_000,
      effectivenessInPeriod: 0.9,
    },
  ],
  [
    'LenderPeriodStats',
    LenderPeriodStatsSchema,
    {
      from: '2026-09-01',
      to: '2026-09-23',
      totalPortfolio: 18_400_000,
      portfolioAtRisk: 7_050_000,
      arrearsRate: 0.18,
      arrearsByAge: ['0-7', '8-15', '16-30', '30+'].map((label) => ({ label, amount: 0, clientsCount: 0 })),
      topArrears: [{ clientId: id(8), clientFullName: 'María Gómez', overdueDays: 32, overdueAmount: 900_000 }],
      collectorPerformance: [{ collectorMembershipId: id(6), fullName: 'Alejo Zuleta', effectiveness: 0.92, overdueAmount: 300_000 }],
      expectedAmount: 5_000_000,
      collectedAmount: 4_000_000,
      effectiveness: 0.8,
      previous: {
        from: '2026-08-09',
        to: '2026-08-31',
        totalPortfolio: 17_000_000,
        portfolioAtRisk: 5_000_000,
        arrearsRate: 0.29,
        expectedAmount: 4_500_000,
        collectedAmount: 3_000_000,
        effectiveness: 0.67,
      },
    },
  ],
  [
    'AccountSession',
    AccountSessionSchema,
    {
      id: id(16),
      isCurrent: true,
      device: { client: 'Chrome', os: 'Windows', label: 'Chrome en Windows' },
      ipAddress: null,
      createdAt: at,
      lastUsedAt: at,
      expiresAt: '2026-10-23T15:00:00Z',
    },
  ],
  ['CreateLeadRequest', CreateLeadRequestSchema, { name: 'Ana Pérez', email: 'ana@ejemplo.co', message: 'Quiero probar Fiaro.' }],
  [
    'SubscriptionDetails',
    SubscriptionDetailsSchema,
    {
      planCode: 'TRIAL',
      status: 'ACTIVE',
      currentPeriodEndsAt: '2026-10-23T05:00:00Z',
      graceEndsAt: '2026-10-30T05:00:00Z',
      daysRemaining: 30,
      graceDaysRemaining: 0,
      isReadOnly: false,
      limits: { maxActiveLenders: 1, maxCollectors: 5 },
      usage: { activeLenders: 1, activeCollectors: 2 },
      createdAt: at,
    },
  ],
  ['UnreadCount', UnreadCountSchema, { count: 4 }],
  ['MarkAllReadResult', MarkAllReadResultSchema, { marked: 3 }],
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

  it('el calendario de cuotas solo usa los cuatro estados conocidos', () => {
    const calendar = fixtures.find(([name]) => name === 'LoanInstallments')?.[2] as { installments: Record<string, unknown>[] };
    const withUnknownStatus = { ...calendar, installments: [{ ...calendar.installments[0], status: 'LATE' }] };
    expect(LoanInstallmentsSchema.safeParse(withUnknownStatus).success).toBe(false);
  });

  it('las estadísticas traen siempre los cuatro tramos de mora, ni más ni menos', () => {
    const stats = fixtures.find(([name]) => name === 'LenderPeriodStats')?.[2] as { arrearsByAge: unknown[] };
    expect(LenderPeriodStatsSchema.safeParse({ ...stats, arrearsByAge: stats.arrearsByAge.slice(0, 3) }).success).toBe(false);
    expect(ArrearsBucketSchema.safeParse({ label: '60+', amount: 0, clientsCount: 0 }).success).toBe(false);
  });

  it('un contacto de ventas rechaza campos desconocidos pero acepta el señuelo vacío', () => {
    expect(CreateLeadRequestSchema.safeParse({ name: 'Ana', message: 'Hola', website: '' }).success).toBe(true);
    expect(CreateLeadRequestSchema.safeParse({ name: 'Ana', message: 'Hola', admin: true }).success).toBe(false);
  });

  it('el color de marca es un #RRGGBB o nada', () => {
    const lender = fixtures.find(([name]) => name === 'Lender')?.[2];
    expect(LenderSchema.safeParse({ ...lender, brandColor: '#0F766E' }).success).toBe(true);
    expect(LenderSchema.safeParse({ ...lender, brandColor: 'rojo' }).success).toBe(false);
    expect(LenderSchema.safeParse({ ...lender, brandColor: undefined }).success).toBe(false);
  });

  it('la fila de cliente no exige updatedAt, que la API no entrega en las listas', () => {
    const client = fixtures.find(([name]) => name === 'ClientListItem')?.[2];
    expect(ClientListItemSchema.safeParse(client).success).toBe(true);
  });
});
