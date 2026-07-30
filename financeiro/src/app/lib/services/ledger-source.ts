import { supabaseAdmin } from '@/app/lib/supabase/client';
import type {
  AccountRecord,
  CreditCardBillRecord,
  InvestmentRecord,
  TransactionRecord,
} from '@/app/types/pluggy';

/**
 * Leitura das transações e contas usadas pelas análises de gasto.
 *
 * Compartilhado entre `/api/fixed-expenses` e `/api/spending` para que as duas
 * telas partam exatamente do mesmo conjunto de dados — divergir aqui faz o
 * total de compromissos não bater com o total de gastos.
 */

const PAGE_SIZE = 1000;

const TRANSACTION_COLUMNS =
  'transaction_id, account_id, date, description, amount, category, type, status, credit_card_metadata';

// `balance` é obrigatório aqui: sem ele o patrimônio sai zerado.
const ACCOUNT_COLUMNS =
  'account_id, item_id, type, subtype, number, name, marketing_name, balance, credit_data, icon_url';

/**
 * Busca todas as transações do intervalo, paginando.
 *
 * O PostgREST corta em 1000 linhas por padrão. Com várias contas e 12 meses de
 * histórico o corte silencioso derruba justamente os meses antigos, que são os
 * que provam a recorrência.
 */
export async function fetchAllTransactions(
  fromDate: string,
  toDate: string
): Promise<TransactionRecord[]> {
  const all: TransactionRecord[] = [];

  for (let page = 0; ; page++) {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select(TRANSACTION_COLUMNS)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    if (!data?.length) break;

    all.push(...(data as unknown as TransactionRecord[]));
    if (data.length < PAGE_SIZE) break;
  }

  return all;
}

/**
 * Contas que entram no cálculo.
 *
 * Alguns bancos exportam o mesmo cartão duas vezes com nomes diferentes (no
 * Inter, "THIAGO E SANTOS" e "GOLD" são o mesmo plástico). Cada cópia tem
 * `account_id` próprio e `transaction_id` próprio, então o upsert não resolve —
 * e o ciclo de fatura pode vir defasado, o que faz a dedupe por data falhar.
 * A saída é marcar a cópia com `accounts.is_ignored = true`.
 */
export async function fetchConsideredAccounts(): Promise<AccountRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('accounts')
    .select(`${ACCOUNT_COLUMNS}, is_ignored`)
    .or('is_ignored.is.null,is_ignored.eq.false');

  if (!error) return (data ?? []) as unknown as AccountRecord[];

  // A coluna `is_ignored` vem da migração supabase_fixed_expenses_v2.sql.
  // Sem ela, segue considerando todas as contas.
  const fallback = await supabaseAdmin.from('accounts').select(ACCOUNT_COLUMNS);
  if (fallback.error) throw new Error(fallback.error.message);
  return (fallback.data ?? []) as unknown as AccountRecord[];
}

/**
 * Todas as faturas de cartão, de todas as contas consideradas.
 *
 * `creditCardBillsService.getBillsByAccountId` só busca uma conta por vez, o que
 * obrigaria a um fan-out. Aqui a fatura serve para dois fins: resolver a que
 * ciclo pertence cada compra e alimentar o card de faturas.
 *
 * Recebe as contas já filtradas porque a tabela de faturas não sabe nada sobre
 * `is_ignored` — somar tudo dobraria o valor devido do cartão exportado duas
 * vezes pelo mesmo banco.
 */
export async function fetchAllBills(
  accounts: AccountRecord[]
): Promise<CreditCardBillRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('credit_card_bills')
    .select('bill_id, account_id, due_date, total_amount, minimum_payment_amount')
    .order('due_date', { ascending: false });

  if (error) throw new Error(error.message);

  const considered = new Set(accounts.map((a) => a.account_id));
  const bills = ((data ?? []) as unknown as CreditCardBillRecord[]).filter(
    (b) => considered.has(b.account_id)
  );

  return dedupeMirroredBills(bills);
}

/**
 * Descarta a mesma fatura reportada por duas conexões do mesmo banco.
 *
 * Rede de segurança para quando `accounts.is_ignored` não existe ou não foi
 * preenchida: duas contas com fatura de mesmo vencimento e mesmo valor até o
 * centavo são a mesma fatura, não dois cartões que por acaso fecharam igual.
 */
function dedupeMirroredBills(bills: CreditCardBillRecord[]): CreditCardBillRecord[] {
  const seen = new Map<string, CreditCardBillRecord>();

  for (const bill of bills) {
    // Mesmo dia de vencimento e mesmo valor até o centavo. Um ciclo por conta
    // tem vencimento próprio, então uma colisão aqui é sempre espelho.
    const dueDay = String(bill.due_date ?? '').slice(0, 10);
    const key = `${dueDay}|${Number(bill.total_amount ?? 0).toFixed(2)}`;
    if (!seen.has(key)) seen.set(key, bill);
  }

  return Array.from(seen.values());
}

/** Posições de investimento, para o total consolidado. */
export async function fetchInvestments(): Promise<InvestmentRecord[]> {
  const { data, error } = await supabaseAdmin.from('investments').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []) as InvestmentRecord[];
}
