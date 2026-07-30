import type { InvestmentRecord } from '@/app/types/pluggy';
import { addMonths, currentPeriod, parseYmd } from './commitments';

/**
 * Análise da carteira de investimentos.
 *
 * Duas partes independentes:
 * - Fotografia do que existe hoje (posições, alocação, resultado, vencimentos).
 * - Projeção do que essa carteira vira ao longo do tempo, a partir das taxas
 *   contratadas de cada posição e de premissas explícitas para os indexadores.
 *
 * A projeção é uma estimativa determinística, não uma previsão de mercado — o
 * `basis` de cada posição diz de onde veio a taxa usada, para que a interface
 * consiga mostrar o quanto do resultado é contratado e o quanto é suposto.
 */

// ============================================================================
// TIPOS
// ============================================================================

/** De onde saiu a taxa usada na projeção de uma posição. */
export type RateBasis =
  /** Taxa contratada, lida do próprio título (CDB, LCI, Tesouro) */
  | 'contracted'
  /** Rentabilidade observada nos últimos 12 meses da própria posição */
  | 'historical'
  /** Premissa por classe de ativo — não há taxa nem histórico na posição */
  | 'assumed';

export interface Position {
  id: string;
  name: string;
  /** Classe traduzida: Renda fixa, Ações, Fundos... */
  type: string;
  rawType: string;
  subtype?: string;
  institution: string;
  /** Valor atual da posição */
  value: number;
  /** Valor originalmente aplicado, quando o conector informa */
  invested: number | null;
  /** Resultado acumulado (valor − aplicado) */
  profit: number | null;
  /** Rentabilidade acumulada sobre o aplicado */
  profitRate: number | null;
  /** Parcela resgatável hoje */
  withdrawable: number | null;
  /** Como o papel remunera: "110% do CDI", "IPCA + 5,5%", "Prefixado 12%" */
  rateLabel: string | null;
  rateType: string | null;
  /** Taxa anual nominal estimada, usada na projeção */
  annualRate: number;
  rateBasis: RateBasis;
  dueDate: string | null;
  /** Meses até o vencimento (null quando não vence) */
  monthsToDue: number | null;
  share: number;
  color: string;
}

export interface AllocationSlice {
  key: string;
  label: string;
  value: number;
  share: number;
  count: number;
  color: string;
}

export interface MaturityBucket {
  key: string;
  label: string;
  value: number;
  count: number;
}

export interface ProjectionAssumptions {
  /** CDI anual, em decimal (0.105 = 10,5% a.a.) */
  cdi: number;
  /** IPCA anual, em decimal */
  ipca: number;
  /** Retorno anual assumido para renda variável sem histórico */
  equity: number;
  /** Aporte mensal considerado na projeção */
  monthlyContribution: number;
  /** Meses projetados */
  months: number;
  /** Largura da banda de cenários, relativa à taxa (0.25 = ±25%) */
  scenarioSpread: number;
}

export interface ProjectionPoint {
  /** YYYY-MM */
  period: string;
  monthIndex: number;
  /** Total aportado acumulado (posição inicial + aportes) */
  contributed: number;
  /** Cenário base, em reais nominais */
  nominal: number;
  /** Cenário base descontada a inflação — poder de compra de hoje */
  real: number;
  /** Cenário conservador */
  low: number;
  /** Cenário otimista */
  high: number;
}

export interface PortfolioAnalysis {
  total: number;
  totalInvested: number | null;
  totalProfit: number | null;
  totalProfitRate: number | null;
  totalWithdrawable: number | null;
  positions: Position[];
  byType: AllocationSlice[];
  byInstitution: AllocationSlice[];
  byIndexer: AllocationSlice[];
  maturities: MaturityBucket[];
  /** Taxa anual da carteira, ponderada pelo valor de cada posição */
  weightedAnnualRate: number;
  /** Quanto do valor tem taxa contratada, histórico ou premissa */
  rateCoverage: Record<RateBasis, number>;
  projection: {
    assumptions: ProjectionAssumptions;
    series: ProjectionPoint[];
    /** Valor no fim do horizonte, cenário base */
    finalNominal: number;
    finalReal: number;
    totalContributed: number;
    /** Rendimento acumulado no horizonte (nominal − aportado) */
    totalYield: number;
  };
}

export const DEFAULT_ASSUMPTIONS: ProjectionAssumptions = {
  cdi: 0.105,
  ipca: 0.045,
  equity: 0.1,
  monthlyContribution: 0,
  months: 60,
  scenarioSpread: 0.25,
};

// ============================================================================
// CLASSIFICAÇÃO
// ============================================================================

const TYPE_PT: Record<string, string> = {
  FIXED_INCOME: 'Renda fixa',
  EQUITY: 'Ações',
  ETF: 'ETF',
  MUTUAL_FUND: 'Fundos',
  SECURITY: 'Títulos',
  COE: 'COE',
  OTHER: 'Outros',
};

/** Classes sem taxa contratada — a projeção depende de histórico ou premissa. */
const VARIABLE_INCOME = new Set(['EQUITY', 'ETF', 'MUTUAL_FUND']);

const PALETTE = [
  '#58a6ff',
  '#3fb950',
  '#f0883e',
  '#a371f7',
  '#db61a2',
  '#e3b341',
  '#39c5cf',
  '#ff7b72',
  '#7ee787',
  '#d2a8ff',
];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function translateType(raw?: string | null): string {
  if (!raw) return 'Outros';
  return TYPE_PT[raw] ?? raw;
}

function num(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Valor atual da posição, com os fallbacks que os conectores usam. */
function positionValue(inv: InvestmentRecord): number {
  const balance = num(inv.balance);
  if (balance !== null && balance !== 0) return balance;

  const amount = num(inv.amount);
  if (amount !== null && amount !== 0) return amount;

  const unit = num(inv.value);
  const qty = num(inv.quantity);
  if (unit !== null && qty !== null) return unit * qty;

  return unit ?? 0;
}

// ============================================================================
// TAXAS
// ============================================================================

/**
 * Estima a taxa anual nominal de uma posição.
 *
 * Ordem de preferência — da informação mais firme para a mais frágil:
 * 1. Taxa contratada do papel (`rate` + `rate_type`, ou `fixed_annual_rate`).
 * 2. `annual_rate` informado pelo conector.
 * 3. Rentabilidade dos últimos 12 meses da própria posição.
 * 4. Premissa da classe de ativo.
 *
 * Sobre a leitura de `rate`: em papéis indexados o conector manda o percentual
 * do índice (`110` = 110% do CDI); em papéis com spread manda os pontos
 * percentuais (`IPCA + 5,5` chega como `5.5`). O corte em 20 separa os dois
 * casos — nenhum spread real de IPCA chega a 20 p.p., e nenhum CDB paga 20% do
 * CDI.
 */
function estimateRate(
  inv: InvestmentRecord,
  assumptions: ProjectionAssumptions
): { annualRate: number; basis: RateBasis; label: string | null } {
  const rateType = (inv.rate_type ?? '').toUpperCase();
  const rate = num(inv.rate);
  const fixed = num(inv.fixed_annual_rate);

  if (rateType === 'CDI' || rateType === 'SELIC') {
    const index = assumptions.cdi;
    if (rate !== null && rate > 0) {
      if (rate > 20) {
        return {
          annualRate: index * (rate / 100),
          basis: 'contracted',
          label: `${rate.toFixed(0)}% do ${rateType}`,
        };
      }
      return {
        annualRate: index + rate / 100,
        basis: 'contracted',
        label: `${rateType} + ${rate.toFixed(2).replace('.', ',')}%`,
      };
    }
    return { annualRate: index, basis: 'contracted', label: `100% do ${rateType}` };
  }

  if (rateType === 'IPCA') {
    const spread = rate !== null && rate > 0 ? rate / 100 : 0;
    return {
      annualRate: assumptions.ipca + spread,
      basis: 'contracted',
      label: spread > 0 ? `IPCA + ${(spread * 100).toFixed(2).replace('.', ',')}%` : 'IPCA',
    };
  }

  if (rateType === 'PRE_FIXADO' || rateType === 'PREFIXADO') {
    const value = fixed ?? rate;
    if (value !== null && value > 0) {
      return {
        annualRate: value / 100,
        basis: 'contracted',
        label: `Prefixado ${value.toFixed(2).replace('.', ',')}%`,
      };
    }
  }

  if (fixed !== null && fixed > 0) {
    return {
      annualRate: fixed / 100,
      basis: 'contracted',
      label: `Prefixado ${fixed.toFixed(2).replace('.', ',')}%`,
    };
  }

  const annual = num(inv.annual_rate);
  if (annual !== null && annual > 0) {
    return {
      annualRate: annual / 100,
      basis: 'contracted',
      label: `${annual.toFixed(2).replace('.', ',')}% a.a.`,
    };
  }

  const trailing = num(inv.last_twelve_months_rate);
  if (trailing !== null && trailing !== 0) {
    return {
      annualRate: trailing / 100,
      basis: 'historical',
      label: `${trailing.toFixed(2).replace('.', ',')}% em 12m`,
    };
  }

  const type = (inv.type ?? '').toUpperCase();
  if (VARIABLE_INCOME.has(type)) {
    return { annualRate: assumptions.equity, basis: 'assumed', label: null };
  }
  return { annualRate: assumptions.cdi, basis: 'assumed', label: null };
}

// ============================================================================
// AGREGAÇÃO
// ============================================================================

function groupBy(
  positions: Position[],
  total: number,
  pick: (p: Position) => string
): AllocationSlice[] {
  const map = new Map<string, { value: number; count: number }>();

  for (const position of positions) {
    const key = pick(position) || 'Outros';
    const acc = map.get(key) ?? { value: 0, count: 0 };
    acc.value += position.value;
    acc.count++;
    map.set(key, acc);
  }

  return Array.from(map.entries())
    .map(([key, acc]) => ({
      key,
      label: key,
      value: Number(acc.value.toFixed(2)),
      share: total > 0 ? acc.value / total : 0,
      count: acc.count,
      color: colorFor(key),
    }))
    .sort((a, b) => b.value - a.value);
}

/** Meses entre hoje e uma data, ou null se a data não existe. */
function monthsUntil(dueDate: string | null | undefined, from: string): number | null {
  if (!dueDate) return null;
  const { y, m } = parseYmd(dueDate);
  if (!y) return null;
  const [fy, fm] = from.split('-').map(Number);
  return (y - fy) * 12 + (m - fm);
}

const MATURITY_BUCKETS: Array<{ key: string; label: string; max: number | null }> = [
  { key: 'liquid', label: 'Liquidez diária', max: 0 },
  { key: '12m', label: 'Até 12 meses', max: 12 },
  { key: '24m', label: '1 a 2 anos', max: 24 },
  { key: '60m', label: '2 a 5 anos', max: 60 },
  { key: 'long', label: 'Mais de 5 anos', max: null },
];

// ============================================================================
// PROJEÇÃO
// ============================================================================

/** Converte taxa anual em taxa mensal equivalente (juros compostos). */
export function monthlyRate(annual: number): number {
  return Math.pow(1 + annual, 1 / 12) - 1;
}

/**
 * Projeta a carteira mês a mês.
 *
 * Modelo: juros compostos sobre o saldo, mais o aporte mensal aplicado ao fim
 * de cada mês.
 *
 *     saldo(m) = saldo(m-1) × (1 + i) + aporte
 *
 * Onde `i` é a taxa mensal equivalente à taxa anual ponderada da carteira.
 *
 * O que o modelo NÃO faz, e por quê:
 * - Não modela imposto de renda nem IOF — a alíquota depende do prazo de cada
 *   resgate, que só se sabe na hora de resgatar.
 * - Não modela vencimento: assume que o papel que vence é reinvestido à mesma
 *   taxa média da carteira.
 * - Não modela volatilidade. A renda variável entra pela taxa média, então a
 *   linha é lisa mesmo onde o retorno real oscila. É para isso que existe a
 *   banda de cenários.
 */
export function projectPortfolio(
  startingValue: number,
  weightedAnnualRate: number,
  assumptions: ProjectionAssumptions,
  startPeriod: string = currentPeriod()
): { series: ProjectionPoint[]; finalNominal: number; finalReal: number; totalContributed: number } {
  const base = monthlyRate(weightedAnnualRate);
  const low = monthlyRate(weightedAnnualRate * (1 - assumptions.scenarioSpread));
  const high = monthlyRate(weightedAnnualRate * (1 + assumptions.scenarioSpread));
  const inflation = monthlyRate(assumptions.ipca);

  const series: ProjectionPoint[] = [];

  let nominal = startingValue;
  let lowValue = startingValue;
  let highValue = startingValue;
  let contributed = startingValue;

  for (let month = 0; month <= assumptions.months; month++) {
    if (month > 0) {
      nominal = nominal * (1 + base) + assumptions.monthlyContribution;
      lowValue = lowValue * (1 + low) + assumptions.monthlyContribution;
      highValue = highValue * (1 + high) + assumptions.monthlyContribution;
      contributed += assumptions.monthlyContribution;
    }

    series.push({
      period: addMonths(startPeriod, month),
      monthIndex: month,
      contributed: Number(contributed.toFixed(2)),
      nominal: Number(nominal.toFixed(2)),
      // Deflaciona para o poder de compra de hoje
      real: Number((nominal / Math.pow(1 + inflation, month)).toFixed(2)),
      low: Number(lowValue.toFixed(2)),
      high: Number(highValue.toFixed(2)),
    });
  }

  const last = series[series.length - 1];
  return {
    series,
    finalNominal: last.nominal,
    finalReal: last.real,
    totalContributed: last.contributed,
  };
}

// ============================================================================
// ENTRADA PRINCIPAL
// ============================================================================

export function analyzePortfolio(
  investments: InvestmentRecord[],
  options: Partial<ProjectionAssumptions> = {},
  now: string = currentPeriod()
): PortfolioAnalysis {
  const assumptions: ProjectionAssumptions = { ...DEFAULT_ASSUMPTIONS, ...options };

  // Posições encerradas continuam no banco com saldo zero; não são carteira.
  const active = investments.filter(
    (inv) => inv.status !== 'TOTAL_WITHDRAWAL' && positionValue(inv) > 0
  );

  const total = active.reduce((sum, inv) => sum + positionValue(inv), 0);

  const positions: Position[] = active.map((inv) => {
    const value = positionValue(inv);
    const invested = num(inv.amount_original);
    const profitField = num(inv.amount_profit);
    // Alguns conectores mandam o lucro; outros só o aplicado. Deriva o que faltar.
    const profit = profitField ?? (invested !== null ? value - invested : null);
    const { annualRate, basis, label } = estimateRate(inv, assumptions);

    return {
      id: inv.investment_id,
      name: inv.name || inv.code || 'Investimento',
      type: translateType(inv.type),
      rawType: (inv.type ?? 'OTHER').toUpperCase(),
      subtype: inv.subtype ?? undefined,
      institution: inv.institution?.name || inv.issuer || 'Não informado',
      value: Number(value.toFixed(2)),
      invested: invested !== null ? Number(invested.toFixed(2)) : null,
      profit: profit !== null ? Number(profit.toFixed(2)) : null,
      profitRate: invested !== null && invested > 0 && profit !== null ? profit / invested : null,
      withdrawable: num(inv.amount_withdrawable),
      rateLabel: label,
      rateType: inv.rate_type ?? null,
      annualRate,
      rateBasis: basis,
      dueDate: inv.due_date ?? null,
      monthsToDue: monthsUntil(inv.due_date, now),
      share: total > 0 ? value / total : 0,
      color: colorFor(inv.investment_id),
    };
  });

  positions.sort((a, b) => b.value - a.value);

  const investedPositions = positions.filter((p) => p.invested !== null);
  const totalInvested = investedPositions.length
    ? investedPositions.reduce((s, p) => s + (p.invested ?? 0), 0)
    : null;
  const totalProfit = positions.some((p) => p.profit !== null)
    ? positions.reduce((s, p) => s + (p.profit ?? 0), 0)
    : null;
  const withdrawablePositions = positions.filter((p) => p.withdrawable !== null);
  const totalWithdrawable = withdrawablePositions.length
    ? withdrawablePositions.reduce((s, p) => s + (p.withdrawable ?? 0), 0)
    : null;

  // Taxa da carteira ponderada pelo valor: uma posição de R$ 50 mil a 10% pesa
  // mais que uma de R$ 500 a 20%.
  const weightedAnnualRate =
    total > 0 ? positions.reduce((s, p) => s + p.annualRate * p.value, 0) / total : 0;

  const rateCoverage: Record<RateBasis, number> = {
    contracted: 0,
    historical: 0,
    assumed: 0,
  };
  for (const position of positions) rateCoverage[position.rateBasis] += position.value;

  const maturities: MaturityBucket[] = MATURITY_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    value: 0,
    count: 0,
  }));

  for (const position of positions) {
    const months = position.monthsToDue;
    // Sem vencimento (fundo, ação, poupança) conta como liquidez imediata
    const index =
      months === null || months <= 0
        ? 0
        : MATURITY_BUCKETS.findIndex((b) => b.max !== null && months <= b.max);
    const target = index === -1 ? maturities.length - 1 : index;
    maturities[target].value = Number((maturities[target].value + position.value).toFixed(2));
    maturities[target].count++;
  }

  const projection = projectPortfolio(total, weightedAnnualRate, assumptions, now);

  return {
    total: Number(total.toFixed(2)),
    totalInvested: totalInvested !== null ? Number(totalInvested.toFixed(2)) : null,
    totalProfit: totalProfit !== null ? Number(totalProfit.toFixed(2)) : null,
    totalProfitRate:
      totalInvested !== null && totalInvested > 0 && totalProfit !== null
        ? totalProfit / totalInvested
        : null,
    totalWithdrawable:
      totalWithdrawable !== null ? Number(totalWithdrawable.toFixed(2)) : null,
    positions,
    byType: groupBy(positions, total, (p) => p.type),
    byInstitution: groupBy(positions, total, (p) => p.institution),
    byIndexer: groupBy(positions, total, (p) => p.rateType || p.type),
    maturities: maturities.filter((b) => b.count > 0),
    weightedAnnualRate,
    rateCoverage,
    projection: {
      assumptions,
      series: projection.series,
      finalNominal: projection.finalNominal,
      finalReal: projection.finalReal,
      totalContributed: projection.totalContributed,
      totalYield: Number((projection.finalNominal - projection.totalContributed).toFixed(2)),
    },
  };
}
