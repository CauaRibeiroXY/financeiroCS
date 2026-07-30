import type { AccountRecord, CreditCardBillRecord, TransactionRecord } from '@/app/types/pluggy';
import { addMonths, monthsBetween, parseYmd, periodOf } from './commitments';

/**
 * A que fatura pertence cada compra de cartão.
 *
 * "Quanto gastei em julho" e "quanto vou pagar na fatura de julho" são perguntas
 * diferentes: uma compra do dia 25 entra na fatura do mês seguinte. Este módulo
 * responde a segunda.
 *
 * O rótulo do ciclo é sempre o **mês de vencimento** (`YYYY-MM`) — é o que a
 * pessoa quer dizer com "fatura de agosto", e é o que `credit_card_bills.due_date`
 * dá direto.
 */

/** Como o ciclo de uma transação foi determinado. */
export type CycleSource =
  /** `credit_card_metadata.billId` cruzado com a fatura sincronizada */
  | 'billId'
  /** `credit_card_metadata.billForecastDate`, ajustado pelo offset da conta */
  | 'forecast'
  /** Sem metadado de fatura — caiu no mês civil da compra */
  | 'calendar';

export interface CycleAssignment {
  period: string;
  source: CycleSource;
}

export interface CycleDiagnostics {
  byBillId: number;
  byForecast: number;
  /** Transações de cartão que caíram no mês civil por falta de metadado */
  unresolved: number;
  /**
   * Deslocamento aplicado ao `billForecastDate` de cada conta, em meses.
   * Diferente de zero significa que o conector rotula a previsão pelo mês de
   * fechamento, não pelo de vencimento.
   */
  offsetByAccount: Record<string, number>;
}

export interface CycleResolver {
  resolve(tx: TransactionRecord): CycleAssignment;
  diagnostics: CycleDiagnostics;
}

function readMeta(tx: TransactionRecord): Record<string, unknown> {
  return (tx.credit_card_metadata ?? {}) as Record<string, unknown>;
}

function readForecast(meta: Record<string, unknown>): string | null {
  const raw = meta.billForecastDate;
  if (typeof raw !== 'string') return null;
  return /^\d{4}-\d{2}/.test(raw) ? raw.slice(0, 7) : null;
}

function readBillId(meta: Record<string, unknown>): string | null {
  const raw = meta.billId;
  return typeof raw === 'string' && raw ? raw : null;
}

/** Valor mais frequente de uma lista. Empate resolve pelo menor, para ser determinístico. */
function mode(values: number[]): number {
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  let best = 0;
  let bestCount = -1;
  for (const [value, count] of [...counts.entries()].sort((a, b) => a[0] - b[0])) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Monta o resolvedor a partir das faturas sincronizadas e das próprias transações.
 *
 * A calibração do offset existe porque nada garante que `billForecastDate` seja
 * o mês de vencimento — poderia ser o de fechamento, e aí um mês inteiro de
 * gastos iria para o balde errado. Em vez de assumir, mede: nas transações que
 * trazem `billId` **e** `billForecastDate`, a distância entre a previsão e o
 * vencimento real da fatura é o offset daquela conta.
 */
export function buildCycleResolver(
  accounts: AccountRecord[],
  bills: CreditCardBillRecord[],
  transactions: TransactionRecord[]
): CycleResolver {
  const creditAccounts = new Set(
    accounts.filter((a) => a.type === 'CREDIT').map((a) => a.account_id)
  );

  const billPeriodById = new Map<string, string>();
  for (const bill of bills) {
    if (!bill.bill_id || !bill.due_date) continue;
    billPeriodById.set(bill.bill_id, periodOf(String(bill.due_date)));
  }

  // Calibração por conta
  const samples = new Map<string, number[]>();
  for (const tx of transactions) {
    if (!creditAccounts.has(tx.account_id)) continue;
    const meta = readMeta(tx);
    const forecast = readForecast(meta);
    const billId = readBillId(meta);
    if (!forecast || !billId) continue;

    const actual = billPeriodById.get(billId);
    if (!actual) continue;

    const list = samples.get(tx.account_id) ?? [];
    list.push(monthsBetween(forecast, actual));
    samples.set(tx.account_id, list);
  }

  const offsetByAccount: Record<string, number> = {};
  for (const [accountId, deltas] of samples) {
    offsetByAccount[accountId] = mode(deltas);
  }

  const diagnostics: CycleDiagnostics = {
    byBillId: 0,
    byForecast: 0,
    unresolved: 0,
    offsetByAccount,
  };

  return {
    diagnostics,

    resolve(tx: TransactionRecord): CycleAssignment {
      const meta = readMeta(tx);

      const billId = readBillId(meta);
      if (billId) {
        const period = billPeriodById.get(billId);
        if (period) {
          diagnostics.byBillId++;
          return { period, source: 'billId' };
        }
      }

      const forecast = readForecast(meta);
      if (forecast) {
        diagnostics.byForecast++;
        const offset = offsetByAccount[tx.account_id] ?? 0;
        return { period: addMonths(forecast, offset), source: 'forecast' };
      }

      // Sem metadado de fatura não há como saber o ciclo. Cair no mês civil é
      // menos errado do que chutar um dia de fechamento — e fica contabilizado
      // para a interface poder avisar.
      diagnostics.unresolved++;
      return { period: periodOf(tx.date), source: 'calendar' };
    },
  };
}

/**
 * Dia do mês em que o cartão vence, para exibição.
 *
 * Prefere a moda dos vencimentos reais das faturas — `credit_data.balance_due_date`
 * é uma foto do ciclo atual, gravada via `toISOString()`, e pode escorregar um dia.
 */
export function dueDayOf(
  account: AccountRecord,
  bills: CreditCardBillRecord[]
): number | null {
  const own = bills
    .filter((b) => b.account_id === account.account_id && b.due_date)
    .map((b) => parseYmd(String(b.due_date)).d)
    .filter((d) => d >= 1 && d <= 31);

  if (own.length > 0) return mode(own);

  const snapshot = account.credit_data?.balance_due_date;
  if (snapshot) {
    const { d } = parseYmd(String(snapshot));
    if (d >= 1 && d <= 31) return d;
  }
  return null;
}
