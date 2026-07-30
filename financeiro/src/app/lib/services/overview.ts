import type {
  AccountRecord,
  CreditCardBillRecord,
  InvestmentRecord,
  TransactionRecord,
} from '@/app/types/pluggy';
import {
  addMonths,
  currentPeriod,
  normalizeCashflow,
  parseYmd,
  periodOf,
  type NormalizedTx,
} from './commitments';
import { buildCycleResolver, dueDayOf, type CycleDiagnostics } from './billing-cycle';
import { colorFor, translateCategory } from './categories-pt';

/**
 * Números da Visão Geral, separados por tipo de conta.
 *
 * Responde as três perguntas juntas — "quanto no total", "quanto na conta
 * corrente", "quanto no cartão" — a partir de uma única normalização. Calcular
 * os escopos separadamente quebraria a única garantia que importa aqui:
 * `banco + cartão = tudo`.
 */

// ============================================================================
// TIPOS
// ============================================================================

export type OverviewScope = 'all' | 'bank' | 'credit';
export type CreditMode = 'month' | 'cycle';

export interface OverviewCategory {
  key: string;
  label: string;
  current: number;
  previous: number;
  color: string;
}

export interface DailyPoint {
  /** Dia do mês, ou dia dentro do ciclo quando o recorte é por fatura */
  day: number;
  /** null quando o dia ainda não chegou */
  current: number | null;
  previous: number;
}

export interface OverviewSlice {
  period: string;
  previousPeriod: string;
  /** "mês passado" ou "fatura anterior" — a interface não deve montar esse texto */
  comparisonLabel: string;
  /** "Dia" ou "Dia do ciclo" — o eixo muda de significado no modo fatura */
  dayLabel: string;
  totalExpenses: number;
  previousExpenses: number;
  /**
   * Quanto o período anterior somava **até este mesmo ponto**.
   *
   * Comparar o mês em andamento com o mês anterior inteiro faz todo dia 5
   * parecer economia. Esta é a base honesta da comparação.
   */
  previousExpensesToDate: number;
  /** Dias decorridos do período, 0 quando ainda não começou */
  elapsedDays: number;
  /** null quando a métrica não se aplica ao escopo — nunca 0 */
  totalIncome: number | null;
  previousIncome: number | null;
  partialResult: number | null;
  transactions: number;
  categories: OverviewCategory[];
  spendingByDay: DailyPoint[];
  timeline: Array<{ period: string; total: number }>;
}

export interface OverviewCard {
  accountId: string;
  name: string;
  dueDay: number | null;
  /** null quando o conector não informa — não confundir com zero */
  creditLimit: number | null;
  availableCredit: number | null;
  usedCredit: number | null;
  /** Soma das compras do ciclo, calculada aqui */
  cycleTotal: number;
  /** Total oficial da fatura, quando ela já foi sincronizada */
  billTotal: number | null;
  billDueDate: string | null;
}

export interface OverviewResult {
  period: string;
  slices: {
    all: OverviewSlice;
    bank: OverviewSlice;
    creditMonth: OverviewSlice;
    creditCycle: OverviewSlice;
  };
  balances: {
    patrimony: number;
    totalInvestments: number;
    creditLimit: number | null;
    availableCredit: number | null;
    openBillsTotal: number;
    /** Fatura paga saindo da conta no período — contexto do escopo bancário */
    cardBillPayments: number;
  };
  cards: OverviewCard[];
  diagnostics: {
    transactionsScanned: number;
    accountsSkipped: number;
    duplicatesRemoved: number;
    internalTransfersRemoved: number;
    internalInflowsRemoved: number;
    /** bank + creditMonth − all. Deve ser 0; diferente disso é bug de partição. */
    additivityDelta: number;
    cycle: CycleDiagnostics;
  };
}

export interface OverviewOptions {
  period?: string;
  /** Meses da linha do tempo, terminando no período. Default: 6. */
  windowMonths?: number;
  /** Categorias por escopo. Default: 10. */
  limit?: number;
  /** Injetável para teste do "hoje". */
  now?: Date;
}

// ============================================================================
// AGREGAÇÃO DE UM ESCOPO
// ============================================================================

/**
 * Dias de `from` até `to`, com sinal (negativo quando `to` é anterior).
 *
 * Lê a data civil, sem `new Date` na string do banco: `2026-07-01 03:00:00+00`
 * vira 30 de junho no fuso de São Paulo.
 */
function daysFrom(from: string, to: string): number {
  const a = parseYmd(from);
  const b = parseYmd(to);
  return (
    (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000
  );
}

interface SliceInput {
  outflows: NormalizedTx[];
  inflows: NormalizedTx[] | null;
  /** Período de cada saída — civil ou de fatura */
  periodOfOutflow: (o: NormalizedTx) => string;
  /** Posição da compra dentro do período: dia do mês, ou dia do ciclo */
  dayOf: (o: NormalizedTx, period: string) => number;
  /** Dias já decorridos do período. 0 = ainda não começou. */
  elapsedIn: (period: string) => number;
  period: string;
  windowMonths: number;
  limit: number;
  comparisonLabel: string;
  dayLabel: string;
}

/** Tamanho mínimo do eixo. Um ciclo de fatura pode passar de 31 dias. */
const MIN_AXIS_DAYS = 31;
const MAX_AXIS_DAYS = 62;

function buildSlice(input: SliceInput): OverviewSlice {
  const { outflows, inflows, periodOfOutflow, dayOf, period, windowMonths, limit } = input;
  const previousPeriod = addMonths(period, -1);

  const periods = Array.from({ length: windowMonths }, (_, i) =>
    addMonths(period, -(windowMonths - 1 - i))
  );
  const inWindow = new Set(periods);

  const timeline = new Map<string, number>(periods.map((p) => [p, 0]));
  const categories = new Map<string, { current: number; previous: number }>();

  let totalExpenses = 0;
  let previousExpenses = 0;
  let transactions = 0;

  const currentDaily = new Map<number, number>();
  const previousDaily = new Map<number, number>();

  for (const outflow of outflows) {
    const target = periodOfOutflow(outflow);
    if (inWindow.has(target)) {
      timeline.set(target, (timeline.get(target) ?? 0) + outflow.amount);
    }

    const isCurrent = target === period;
    const isPrevious = target === previousPeriod;
    if (!isCurrent && !isPrevious) continue;

    const label = translateCategory(outflow.tx.category);
    const bucket = categories.get(label) ?? { current: 0, previous: 0 };

    const day = dayOf(outflow, target);

    if (isCurrent) {
      totalExpenses += outflow.amount;
      transactions++;
      bucket.current += outflow.amount;
      currentDaily.set(day, (currentDaily.get(day) ?? 0) + outflow.amount);
    } else {
      previousExpenses += outflow.amount;
      bucket.previous += outflow.amount;
      previousDaily.set(day, (previousDaily.get(day) ?? 0) + outflow.amount);
    }

    categories.set(label, bucket);
  }

  let totalIncome: number | null = null;
  let previousIncome: number | null = null;
  if (inflows) {
    totalIncome = 0;
    previousIncome = 0;
    for (const inflow of inflows) {
      if (inflow.period === period) totalIncome += inflow.amount;
      else if (inflow.period === previousPeriod) previousIncome += inflow.amount;
    }
  }

  // O eixo se estica até o maior dia observado: um ciclo de fatura pode passar
  // de 31 dias, e cortar em 31 esconderia lançamentos.
  const observedDays = [...currentDaily.keys(), ...previousDaily.keys()];
  const axisDays = Math.min(
    MAX_AXIS_DAYS,
    Math.max(MIN_AXIS_DAYS, ...(observedDays.length ? observedDays : [0]))
  );

  const elapsed = Math.max(0, Math.min(axisDays, input.elapsedIn(period)));
  const isOngoing = elapsed > 0 && elapsed < axisDays;

  const spendingByDay: DailyPoint[] = [];
  let cumulativeCurrent = 0;
  let cumulativePrevious = 0;
  let previousToDate = 0;

  for (let day = 1; day <= axisDays; day++) {
    cumulativeCurrent += currentDaily.get(day) ?? 0;
    cumulativePrevious += previousDaily.get(day) ?? 0;

    // Onde o período atual chegou, é aqui que o anterior deve ser lido
    if (day <= elapsed) previousToDate = cumulativePrevious;

    spendingByDay.push({
      day,
      current: isOngoing && day > elapsed ? null : cumulativeCurrent,
      previous: cumulativePrevious,
    });
  }

  // Período não iniciado: sem ponto de corte, compara com o total anterior
  if (elapsed === 0) previousToDate = cumulativePrevious;


  const categoryList: OverviewCategory[] = Array.from(categories.entries())
    .map(([label, values]) => ({
      key: label,
      label,
      current: Number(values.current.toFixed(2)),
      previous: Number(values.previous.toFixed(2)),
      color: colorFor(label),
    }))
    .sort((a, b) => b.current - a.current || b.previous - a.previous)
    .slice(0, limit);

  return {
    period,
    previousPeriod,
    comparisonLabel: input.comparisonLabel,
    dayLabel: input.dayLabel,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    previousExpenses: Number(previousExpenses.toFixed(2)),
    previousExpensesToDate: Number(previousToDate.toFixed(2)),
    elapsedDays: elapsed,
    totalIncome: totalIncome !== null ? Number(totalIncome.toFixed(2)) : null,
    previousIncome: previousIncome !== null ? Number(previousIncome.toFixed(2)) : null,
    partialResult:
      totalIncome !== null ? Number((totalIncome - totalExpenses).toFixed(2)) : null,
    transactions,
    categories: categoryList,
    spendingByDay,
    timeline: periods.map((p) => ({
      period: p,
      total: Number((timeline.get(p) ?? 0).toFixed(2)),
    })),
  };
}

// ============================================================================
// ENTRADA PRINCIPAL
// ============================================================================

export function buildOverview(
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  bills: CreditCardBillRecord[],
  investments: InvestmentRecord[],
  options: OverviewOptions = {}
): OverviewResult {
  const now = options.now ?? new Date();
  const period = options.period ?? currentPeriod(now);
  const windowMonths = Math.max(2, options.windowMonths ?? 6);
  const limit = Math.max(1, options.limit ?? 10);
  const today = { period: currentPeriod(now), day: now.getDate() };

  const { outflows, inflows, diagnostics } = normalizeCashflow(transactions, accounts, {
    includeInflows: true,
  });

  // Parcelas futuras que a Pluggy projeta não são gasto realizado.
  const realized = outflows.filter((o) => o.period <= period);

  const cycles = buildCycleResolver(accounts, bills, transactions);
  const cyclePeriodOf = new Map<string, string>();
  for (const outflow of realized) {
    if (outflow.accountType !== 'CREDIT') continue;
    cyclePeriodOf.set(outflow.tx.transaction_id, cycles.resolve(outflow.tx).period);
  }

  const byCalendar = (o: NormalizedTx) => o.period;
  const byCycle = (o: NormalizedTx) =>
    cyclePeriodOf.get(o.tx.transaction_id) ?? o.period;

  const bankOutflows = realized.filter((o) => o.accountType !== 'CREDIT');
  const creditOutflows = realized.filter((o) => o.accountType === 'CREDIT');

  // --- Eixo de dias --------------------------------------------------------
  // No mês civil o eixo é o dia do mês. No ciclo de fatura isso não funciona:
  // um ciclo atravessa dois meses, então uma compra de 25/07 e outra de 03/08
  // cairiam nos dias 25 e 3 e a curva acumulada sairia fora de ordem.
  //
  // A origem de cada ciclo é a primeira compra que ele contém. Sem dia de
  // fechamento confiável nos dados, é a única âncora que não depende de chute —
  // e serve ao propósito do gráfico, que é comparar o ritmo de duas faturas no
  // mesmo ponto do ciclo.
  const cycleOrigin = new Map<string, string>();
  for (const outflow of creditOutflows) {
    const cyclePeriod = byCycle(outflow);
    const known = cycleOrigin.get(cyclePeriod);
    if (!known || outflow.date < known) cycleOrigin.set(cyclePeriod, outflow.date);
  }

  const todayIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const dayOfMonth = (o: NormalizedTx) => parseYmd(o.date).d;
  const dayOfCycle = (o: NormalizedTx, targetPeriod: string) => {
    const origin = cycleOrigin.get(targetPeriod);
    if (!origin) return parseYmd(o.date).d;
    return daysFrom(origin, o.date) + 1;
  };

  const elapsedInMonth = (target: string) => {
    if (target < today.period) return Number.MAX_SAFE_INTEGER; // mês fechado
    if (target > today.period) return 0;
    return today.day;
  };
  const elapsedInCycle = (target: string) => {
    const origin = cycleOrigin.get(target);
    if (!origin) return Number.MAX_SAFE_INTEGER;
    return Math.max(0, daysFrom(origin, todayIso) + 1);
  };

  const base = { period, windowMonths, limit };

  const slices = {
    all: buildSlice({
      ...base,
      outflows: realized,
      inflows,
      periodOfOutflow: byCalendar,
      dayOf: dayOfMonth,
      elapsedIn: elapsedInMonth,
      comparisonLabel: 'mês passado',
      dayLabel: 'Dia',
    }),
    bank: buildSlice({
      ...base,
      outflows: bankOutflows,
      inflows,
      periodOfOutflow: byCalendar,
      dayOf: dayOfMonth,
      elapsedIn: elapsedInMonth,
      comparisonLabel: 'mês passado',
      dayLabel: 'Dia',
    }),
    creditMonth: buildSlice({
      ...base,
      outflows: creditOutflows,
      inflows: null,
      periodOfOutflow: byCalendar,
      dayOf: dayOfMonth,
      elapsedIn: elapsedInMonth,
      comparisonLabel: 'mês passado',
      dayLabel: 'Dia',
    }),
    creditCycle: buildSlice({
      ...base,
      outflows: creditOutflows,
      inflows: null,
      periodOfOutflow: byCycle,
      dayOf: dayOfCycle,
      elapsedIn: elapsedInCycle,
      comparisonLabel: 'fatura anterior',
      dayLabel: 'Dia do ciclo',
    }),
  };

  // --- Saldos ---------------------------------------------------------------
  const bankAccounts = accounts.filter(
    (a) => a.type === 'BANK' || a.type === 'PAYMENT_ACCOUNT'
  );
  const creditAccounts = accounts.filter((a) => a.type === 'CREDIT');

  const patrimony = bankAccounts.reduce((sum, a) => sum + Number(a.balance ?? 0), 0);

  const totalInvestments = investments
    .filter((i) => i.status !== 'TOTAL_WITHDRAWAL')
    .reduce((sum, i) => sum + Number(i.balance ?? i.amount ?? 0), 0);

  const readLimit = (account: AccountRecord, key: 'credit_limit' | 'available_credit_limit') => {
    const data = account.credit_data as Record<string, unknown> | null | undefined;
    // Alguns conectores gravam em camelCase
    const camel = key === 'credit_limit' ? 'creditLimit' : 'availableCreditLimit';
    const raw = data?.[key] ?? data?.[camel];
    const value = Number(raw);
    return Number.isFinite(value) && raw !== null && raw !== undefined ? value : null;
  };

  const limitValues = creditAccounts.map((a) => readLimit(a, 'credit_limit'));
  const availableValues = creditAccounts.map((a) => readLimit(a, 'available_credit_limit'));
  const sumOrNull = (values: Array<number | null>) =>
    values.some((v) => v !== null)
      ? values.reduce<number>((s, v) => s + (v ?? 0), 0)
      : null;

  // --- Cartões --------------------------------------------------------------
  const cycleTotals = new Map<string, number>();
  for (const outflow of creditOutflows) {
    if (byCycle(outflow) !== period) continue;
    const accountId = outflow.tx.account_id;
    cycleTotals.set(accountId, (cycleTotals.get(accountId) ?? 0) + outflow.amount);
  }

  const cards: OverviewCard[] = creditAccounts.map((account) => {
    const bill = bills.find(
      (b) => b.account_id === account.account_id && b.due_date && periodOf(String(b.due_date)) === period
    );
    const creditLimit = readLimit(account, 'credit_limit');
    const availableCredit = readLimit(account, 'available_credit_limit');

    return {
      accountId: account.account_id,
      name: account.name || account.marketing_name || 'Cartão',
      dueDay: dueDayOf(account, bills),
      creditLimit,
      availableCredit,
      usedCredit:
        creditLimit !== null && availableCredit !== null ? creditLimit - availableCredit : null,
      cycleTotal: Number((cycleTotals.get(account.account_id) ?? 0).toFixed(2)),
      billTotal: bill ? Number(bill.total_amount) : null,
      billDueDate: bill?.due_date ? String(bill.due_date).slice(0, 10) : null,
    };
  });

  const openBillsTotal = cards.reduce((sum, c) => sum + (c.billTotal ?? 0), 0);

  // Fatura paga no período: sai da conta corrente, mas não é consumo novo. Fica
  // fora das despesas e aparece como contexto para o total não parecer baixo.
  const cardBillPayments = transactions
    .filter((tx) => {
      if (tx.type !== 'DEBIT') return false;
      if (periodOf(tx.date) !== period) return false;
      const account = accounts.find((a) => a.account_id === tx.account_id);
      if (!account || account.type === 'CREDIT') return false;
      const text = `${tx.description ?? ''} ${tx.category ?? ''}`.toLowerCase();
      return text.includes('fatura') || text.includes('credit card payment');
    })
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);

  const additivityDelta = Number(
    (
      slices.bank.totalExpenses +
      slices.creditMonth.totalExpenses -
      slices.all.totalExpenses
    ).toFixed(2)
  );

  return {
    period,
    slices,
    balances: {
      patrimony: Number(patrimony.toFixed(2)),
      totalInvestments: Number(totalInvestments.toFixed(2)),
      creditLimit: sumOrNull(limitValues),
      availableCredit: sumOrNull(availableValues),
      openBillsTotal: Number(openBillsTotal.toFixed(2)),
      cardBillPayments: Number(cardBillPayments.toFixed(2)),
    },
    cards,
    diagnostics: {
      transactionsScanned: transactions.length,
      ...diagnostics,
      additivityDelta,
      cycle: cycles.diagnostics,
    },
  };
}
