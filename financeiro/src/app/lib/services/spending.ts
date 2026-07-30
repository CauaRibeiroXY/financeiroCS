import type { AccountRecord, TransactionRecord } from '@/app/types/pluggy';
import {
  addMonths,
  currentPeriod,
  displayTitle,
  normalizeOutflows,
  type NormalizedTx,
} from './commitments';
import { colorFor, translateCategory } from './categories-pt';

/**
 * Agregação de gastos para a página de análise.
 *
 * Responde "quanto gastei com X neste mês", em dois eixos:
 * - `category` — supermercado, delivery, farmácia...
 * - `merchant` — iFood, Uber, o bar da esquina, a pessoa para quem eu sempre
 *   mando PIX.
 *
 * Reaproveita `normalizeOutflows` para partir das mesmas saídas de dinheiro que
 * o detector de compromissos usa — sem isso o cartão espelhado pelo banco
 * dobraria todos os totais.
 */

// ============================================================================
// TIPOS
// ============================================================================

export type GroupBy = 'category' | 'merchant';

export interface SpendingGroup {
  /** Chave estável do grupo */
  key: string;
  label: string;
  /** Total no período de referência */
  amount: number;
  /** Total no período anterior, para comparação */
  previousAmount: number;
  /** Variação relativa vs. período anterior (null quando não havia base) */
  change: number | null;
  /** Fatia do gasto total do período (0..1) */
  share: number;
  transactions: number;
  /** Média mensal considerando todos os meses da janela analisada */
  monthlyAverage: number;
  /** Maior lançamento isolado do período */
  largest: { description: string; amount: number; date: string } | null;
  /** Série do grupo mês a mês, na ordem da janela */
  series: Array<{ period: string; amount: number }>;
  color: string;
}

export interface SpendingAnalysis {
  period: string;
  groupBy: GroupBy;
  total: number;
  previousTotal: number;
  /** Média mensal da janela, ignorando o mês corrente se ainda não fechou */
  monthlyAverage: number;
  groups: SpendingGroup[];
  /** Total geral mês a mês, para o gráfico de evolução */
  timeline: Array<{ period: string; total: number }>;
  diagnostics: {
    transactionsScanned: number;
    accountsSkipped: number;
    duplicatesRemoved: number;
    internalTransfersRemoved: number;
    internalInflowsRemoved: number;
  };
}

export interface SpendingOptions {
  /** Período de referência (YYYY-MM). Default: mês corrente. */
  period?: string;
  groupBy?: GroupBy;
  /** Meses da janela analisada, terminando no período. Default: 6. */
  windowMonths?: number;
  /** Quantos grupos retornar. Default: 20. */
  limit?: number;
}

// ============================================================================
// EMPRESAS
// ============================================================================

/**
 * Agrupadores de estabelecimento.
 *
 * A descrição do adquirente não é o nome da empresa: cada pedido de iFood chega
 * como `IFD <nome do restaurante>`, então sem este catálogo o gasto com iFood
 * aparece pulverizado em dezenas de linhas de R$ 40.
 */
const MERCHANT_GROUPS: Array<{ id: string; pattern: RegExp; label: string }> = [
  { id: 'ifood', pattern: /^ifd\b|ifood/, label: 'iFood' },
  { id: 'uber', pattern: /uber\s?rides|^uber\b|uber\s?eats|uber\s?trip/, label: 'Uber' },
  { id: '99', pattern: /^99\b|99app|99\s?pop/, label: '99' },
  { id: 'rappi', pattern: /rappi/, label: 'Rappi' },
  { id: 'mercadolivre', pattern: /mercadolivre|mercado\s?livre|mercadolibre/, label: 'Mercado Livre' },
  { id: 'mercadopago', pattern: /mercado\s?pago|mercadopago/, label: 'Mercado Pago' },
  { id: 'amazon', pattern: /amazon/, label: 'Amazon' },
  { id: 'magalu', pattern: /magazine\s?luiza|magalu/, label: 'Magalu' },
  { id: 'shopee', pattern: /shopee/, label: 'Shopee' },
  { id: 'aliexpress', pattern: /aliexpress/, label: 'AliExpress' },
  { id: 'netflix', pattern: /netflix/, label: 'Netflix' },
  { id: 'hbomax', pattern: /hbo\s?max|helphbomax|hbomax|maxcom/, label: 'HBO Max' },
  { id: 'spotify', pattern: /spotify/, label: 'Spotify' },
  { id: 'google', pattern: /google/, label: 'Google' },
  { id: 'apple', pattern: /apple|itunes|icloud/, label: 'Apple' },
  { id: 'oboticario', pattern: /oboticario|o\s?boticario/, label: 'O Boticário' },
  { id: 'supermercadosbh', pattern: /supermercados?\s?bh/, label: 'Supermercados BH' },
  { id: 'shell', pattern: /\bshell\b|posto\s?shell/, label: 'Shell' },
  { id: 'ipiranga', pattern: /ipiranga/, label: 'Ipiranga' },
  { id: 'petrobras', pattern: /petrobras|\bbr\s?mania\b/, label: 'Petrobras' },
];

/**
 * Identidade da "empresa" por trás do lançamento.
 *
 * Para PIX o beneficiário já é a identidade certa — `merchantKey` extrai o nome
 * da pessoa, e é exatamente isso que responde "quanto eu mando para o fulano
 * todo mês".
 */
function merchantGroupOf(outflow: NormalizedTx): { key: string; label: string } {
  const brand = MERCHANT_GROUPS.find((g) => g.pattern.test(outflow.key));
  if (brand) return { key: brand.id, label: brand.label };

  const key = outflow.key || 'outros';
  return { key, label: displayTitle(outflow.tx.description) };
}

// ============================================================================
// AGREGAÇÃO
// ============================================================================

interface Accumulator {
  key: string;
  label: string;
  byPeriod: Map<string, number>;
  transactions: number;
  largest: { description: string; amount: number; date: string } | null;
}

export function analyzeSpending(
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  options: SpendingOptions = {}
): SpendingAnalysis {
  const period = options.period ?? currentPeriod();
  const groupBy = options.groupBy ?? 'category';
  const windowMonths = Math.max(1, options.windowMonths ?? 6);
  const limit = Math.max(1, options.limit ?? 20);

  const windowStart = addMonths(period, -(windowMonths - 1));
  const previousPeriod = addMonths(period, -1);

  const { outflows, diagnostics } = normalizeOutflows(transactions, accounts);

  // A janela termina no período de referência: gastos futuros (parcelas que a
  // Pluggy já projeta) não são "quanto gastei", e inflariam a média.
  const inWindow = outflows.filter(
    (o) => o.period >= windowStart && o.period <= period
  );

  const groups = new Map<string, Accumulator>();
  const timeline = new Map<string, number>();

  for (const outflow of inWindow) {
    const { key, label } =
      groupBy === 'category'
        ? { key: translateCategory(outflow.tx.category), label: translateCategory(outflow.tx.category) }
        : merchantGroupOf(outflow);

    let acc = groups.get(key);
    if (!acc) {
      acc = { key, label, byPeriod: new Map(), transactions: 0, largest: null };
      groups.set(key, acc);
    }

    acc.byPeriod.set(outflow.period, (acc.byPeriod.get(outflow.period) ?? 0) + outflow.amount);
    timeline.set(outflow.period, (timeline.get(outflow.period) ?? 0) + outflow.amount);

    if (outflow.period === period) {
      acc.transactions++;
      if (!acc.largest || outflow.amount > acc.largest.amount) {
        acc.largest = {
          description: displayTitle(outflow.tx.description),
          amount: outflow.amount,
          date: outflow.date.slice(0, 10),
        };
      }
    }
  }

  const periods = Array.from({ length: windowMonths }, (_, i) => addMonths(windowStart, i));
  const total = timeline.get(period) ?? 0;
  const previousTotal = timeline.get(previousPeriod) ?? 0;

  // Meses já fechados: o mês corrente ainda está incompleto e puxaria a média
  // para baixo se entrasse no divisor.
  const thisMonth = currentPeriod();
  const closedPeriods = periods.filter((p) => p < thisMonth);
  const averageDivisor = Math.max(1, closedPeriods.length);

  const result: SpendingGroup[] = [];

  for (const acc of groups.values()) {
    const amount = acc.byPeriod.get(period) ?? 0;
    const previousAmount = acc.byPeriod.get(previousPeriod) ?? 0;
    const closedSum = closedPeriods.reduce((s, p) => s + (acc.byPeriod.get(p) ?? 0), 0);

    // Um grupo sem gasto no mês de referência nem no anterior não interessa
    if (amount === 0 && previousAmount === 0) continue;

    result.push({
      key: acc.key,
      label: acc.label,
      amount: Number(amount.toFixed(2)),
      previousAmount: Number(previousAmount.toFixed(2)),
      change: previousAmount > 0 ? (amount - previousAmount) / previousAmount : null,
      share: total > 0 ? amount / total : 0,
      transactions: acc.transactions,
      monthlyAverage: Number((closedSum / averageDivisor).toFixed(2)),
      largest: acc.largest,
      series: periods.map((p) => ({
        period: p,
        amount: Number((acc.byPeriod.get(p) ?? 0).toFixed(2)),
      })),
      color: colorFor(acc.key),
    });
  }

  result.sort((a, b) => b.amount - a.amount || b.previousAmount - a.previousAmount);

  const closedTotal = closedPeriods.reduce((s, p) => s + (timeline.get(p) ?? 0), 0);

  return {
    period,
    groupBy,
    total: Number(total.toFixed(2)),
    previousTotal: Number(previousTotal.toFixed(2)),
    monthlyAverage: Number((closedTotal / averageDivisor).toFixed(2)),
    groups: result.slice(0, limit),
    timeline: periods.map((p) => ({
      period: p,
      total: Number((timeline.get(p) ?? 0).toFixed(2)),
    })),
    diagnostics: {
      transactionsScanned: transactions.length,
      ...diagnostics,
    },
  };
}
