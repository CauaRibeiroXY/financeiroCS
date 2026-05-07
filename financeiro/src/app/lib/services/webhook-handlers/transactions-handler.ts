import { getPluggyClient } from "../../pluggy/client";
import { syncAccountData } from "../item-sync.service";
import { transactionsService } from "../transactions";
import { creditCardBillsService } from "../credit-card-bills";
import { accountsService } from "../accounts";
import { mapTransactionFromPluggyToDb } from "../mappers/transaction.mapper";
import { mapCreditCardBillFromPluggyToDb } from "../mappers/credit-card-bill.mapper";
import { Transaction, Account } from "pluggy-sdk";
import { CreditCardBills } from 'pluggy-sdk/dist/types/creditCardBills';
import { WebhookEventPayload } from 'pluggy-sdk';
import type { 
    TransactionRecord,
    TransactionsWebhookPayload,
    CreditCardBillRecord,
} from "@/app/types/pluggy";

const pluggyClient = getPluggyClient();

// Helper function to fetch all transactions with pagination
async function fetchAllTransactionsWithFilter(
  accountId: string, 
  filters: { createdAtFrom?: string; ids?: string[] }
): Promise<Transaction[]> {
  const allTransactions: Transaction[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await pluggyClient.fetchTransactions(accountId, {
      ...filters,
      page,
      pageSize: 500
    });

    if (response.results && response.results.length > 0) {
      allTransactions.push(...response.results);
    }

    hasMore = response.results.length === 500;
    page++;
  }

  return allTransactions;
}

export async function handleTransactionsCreated({ accountId, itemId, transactionsCreatedAtFrom }: Extract<WebhookEventPayload, { event: 'transactions/created' }>): Promise<void> {
  try {
    // If the account is already in our DB we can hand it off to the
    // sync helper so that the helper doesn't need to ask for it again.
    let accountObj = await accountsService.getAccountById(accountId);

    if (!accountObj) {
      await syncAccountData(itemId);
      accountObj = await accountsService.getAccountById(accountId);
    }

    const transactions = await fetchAllTransactionsWithFilter(accountId, {
      createdAtFrom: transactionsCreatedAtFrom
    });

    if (transactions.length === 0) {
      return;
    }
    
    const transactionsToUpsert: TransactionRecord[] = transactions.map((tx: Transaction) => 
      mapTransactionFromPluggyToDb(tx, accountId) as TransactionRecord
    );

    await transactionsService.upsertTransactions(transactionsToUpsert);
  } catch (error) {
    console.error(`Error handling transactions created for account ${accountId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      itemId,
    });
    throw error;
  }
}

export async function handleTransactionsUpdated({transactionIds = [], accountId = ''}: TransactionsWebhookPayload): Promise<void> {
  try {
    if (transactionIds.length === 0) return;

    // we don't have an account object here, but the sync helper is safe to
    // call with just the id
    const transactions = await fetchAllTransactionsWithFilter(accountId, {
      ids: transactionIds
    });

    if (transactions.length === 0) return;

    const transactionsToUpsert: TransactionRecord[] = transactions.map((tx: Transaction) => 
      mapTransactionFromPluggyToDb(tx, accountId) as TransactionRecord
    );

    await transactionsService.upsertTransactions(transactionsToUpsert);
  } catch (error) {
    console.error(`Error updating transactions for account ${accountId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      transactionIds,
    });
    throw error;
  }
}

export async function handleTransactionsDeleted({transactionIds = []}: TransactionsWebhookPayload): Promise<void> {
  try {
    if (transactionIds.length === 0) return;

    await transactionsService.deleteTransactions(transactionIds);
  } catch (error) {
    console.error(`Error deleting transactions:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      transactionIds,
    });
    throw error;
  }
}

// Accept either a bare accountId or a full Account object.  When
// an Account is supplied callers can skip any preliminary lookup, which is
// useful for the pull‑on‑sync flow where we already have the accounts list
// in memory. The deduplication safety guard is handled at the service layer
// via a unique constraint on `transaction_id` (see transactionsService.upsertTransactions).
export async function syncTransactionData(accountOrId: string | Account): Promise<void> {
  const accountId = typeof accountOrId === 'string' ? accountOrId : String(accountOrId.id);

  try {
    const allTransactions = await pluggyClient.fetchAllTransactions(accountId);

    if (allTransactions.length > 0) {
      const transactions: TransactionRecord[] = allTransactions.map((tx: Transaction) => 
        mapTransactionFromPluggyToDb(tx, accountId) as TransactionRecord
      );

      // dedupe set in memory, but we also rely on the SQL onConflict safety
      const seen = new Set<string>();
      const unique = transactions.filter(t => {
        if (seen.has(t.transaction_id)) return false;
        seen.add(t.transaction_id);
        return true;
      });

      // upsert will ignore duplicates based on pluggy_transaction_id
      await transactionsService.upsertTransactions(unique);
    }
  } catch (error) {
    console.error(`Error syncing transactions for account ${accountId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
    });
    throw error;
  }
}

export async function syncCreditCardBillData(accountOrId: string | Account): Promise<void> {
  const accountId = typeof accountOrId === 'string' ? accountOrId : String(accountOrId.id);

  try {
    const billsResponse = await pluggyClient.fetchCreditCardBills(accountId);
    const billsArray = billsResponse.results || [];

    if (billsArray.length > 0) {
      const billsToSave: CreditCardBillRecord[] = billsArray.map((bill: CreditCardBills) => 
        mapCreditCardBillFromPluggyToDb(bill, accountId) as CreditCardBillRecord
      );

      await creditCardBillsService.upsertBills(billsToSave);
    }
  } catch (error) {
    console.error(`Error syncing credit card bills for account ${accountId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
    });
    throw error;
  }
}