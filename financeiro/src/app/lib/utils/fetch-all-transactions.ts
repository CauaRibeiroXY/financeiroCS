/**
 * Busca TODAS as transações de uma conta na Pluggy, já mapeadas para o
 * formato do banco.
 *
 * Antes usava `client.fetchTransactions(itemId, { from, to, page, pageSize })`,
 * que tinha dois defeitos: o endpoint foi descontinuado (410 Gone) e recebia um
 * `itemId` onde a API espera um `accountId`. Agora delega para o /v2/transactions,
 * cuja paginação é por cursor e cujos filtros de data são `dateFrom`/`dateTo`.
 */

import { fetchAllTransactionsV2 } from '@/app/lib/pluggy/transactions-v2';
import { mapTransactionFromPluggyToDb } from '@/app/lib/services/mappers/transaction.mapper';
import type { TransactionRecord } from '@/app/types/pluggy';

export async function fetchAllTransactions(
  accountId: string,
  from: string,
  to: string
): Promise<TransactionRecord[]> {
  console.log(
    `[fetchAllTransactions] Buscando transações da conta ${accountId}, de ${from} até ${to}`
  );

  try {
    const raw = await fetchAllTransactionsV2(accountId, { dateFrom: from, dateTo: to });

    console.log(`[fetchAllTransactions] ${raw.length} transações recebidas`);

    return raw.map(
      (txn) => mapTransactionFromPluggyToDb(txn, accountId) as TransactionRecord
    );
  } catch (error) {
    console.error(`[fetchAllTransactions] Erro ao buscar transações de ${accountId}:`, error);
    throw new Error(
      `Failed to fetch transactions for account ${accountId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
