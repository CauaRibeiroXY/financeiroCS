import { getPluggyClient } from '../pluggy/client';
import { accountsService } from './accounts';
import { investmentsService } from './investments';
import { investmentTransactionsService } from './investment-transactions';
import { loansService } from './loans';
import { identityService } from './identity';
import { creditCardBillsService } from './credit-card-bills';
import { syncCreditCardBillData } from './webhook-handlers/transactions-handler';
import { transactionsService } from './transactions';
import { 
  Account,
  Investment,
  InvestmentTransaction,
  Loan,
} from 'pluggy-sdk';
import type { CreditCardBills } from 'pluggy-sdk/dist/types/creditCardBills';
import type { 
  AccountRecord, 
  InvestmentRecord,
  LoanRecord,
  IdentityRecord,
  TransactionRecord,
} from '@/app/types/pluggy';
import { Transaction } from 'pluggy-sdk';
import { mapAccountFromPluggyToDb } from './mappers/account.mapper';
import { mapInvestmentFromPluggyToDb } from './mappers/investment.mapper';
import { mapInvestmentTransactionFromPluggyToDb } from './mappers/investment-transaction.mapper';
import { mapLoanFromPluggyToDb } from './mappers/loan.mapper';
import { mapIdentityFromPluggyToDb } from './mappers/identity.mapper';
import { mapCreditCardBillFromPluggyToDb } from './mappers/credit-card-bill.mapper';
import { mapTransactionFromPluggyToDb } from './mappers/transaction.mapper';

const pluggyClient = getPluggyClient();

export async function syncItemData(itemId: string): Promise<void> {
  try {
    // First, sync account data and keep the returned list of accounts.
    // this avoids a second call to /accounts when we already have them in memory.
    const accounts = await syncAccountData(itemId);

    // Pull‑on‑sync: iterate through each account and trigger the
    // appropriate follow‑up sync job depending on the account type.
    // The account object is passed along so subscribers don't need to
    // fetch the account again.
    for (const account of accounts) {
      try {
        if (account.type === 'CREDIT' || account.creditData) {
          await syncCreditCardBillData(account);
        } else {
          await syncTransactionData(account);
        }
      } catch (error) {
        const idStr = typeof account.id === 'string' ? account.id : String(account.id);
        console.error(`Error syncing data for account ${idStr}:`, error);
      }
    }

    // Sync investment and loan data
    await syncInvestmentData(itemId);
    await syncLoanData(itemId);
    await syncIdentityData(itemId);
  } catch (error) {
    console.error(`Error syncing data for item ${itemId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      itemId,
    });
    throw error;
  }
}

// return the raw Pluggy Account objects we just pulled so callers can
// iterate without re-fetching from the API.  The migration to a pull-on-\
// sync strategy relies on having these in memory.
export async function syncAccountData(itemId: string): Promise<Account[]> {
  try {
    const accountsResponse = await pluggyClient.fetchAccounts(itemId);
    const results: Account[] = [];

    if (accountsResponse.results && accountsResponse.results.length > 0) {
      // persist to DB
      const accountsToSave = accountsResponse.results
        .filter((account: Account) => account.id)
        .map((account: Account) => mapAccountFromPluggyToDb(account, itemId) as AccountRecord);

      await accountsService.upsertAccounts(accountsToSave);
      // keep a copy of the raw accounts for the caller
      results.push(...accountsResponse.results.filter((a: Account) => a.id));
    }

    return results;
  } catch (error) {
    console.error(`Error syncing accounts for item ${itemId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      itemId,
    });
    throw error;
  }
}

export async function syncInvestmentData(itemId: string): Promise<void> {
  try {
    const investmentsResponse = await pluggyClient.fetchInvestments(itemId);

    if (investmentsResponse.results && investmentsResponse.results.length > 0) {
      const investmentsToSave: InvestmentRecord[] = investmentsResponse.results.map((investment: Investment) => 
        mapInvestmentFromPluggyToDb(investment) as InvestmentRecord
      );

      const savedInvestments = await investmentsService.upsertInvestments(investmentsToSave);

      for (const investment of savedInvestments) {
        try {
          await syncInvestmentTransactionData(investment.investment_id);
        } catch (error) {
          console.error(`Error syncing investment transactions for ${investment.investment_id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error syncing investments for item ${itemId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      itemId,
    });
    throw error;
  }
}

export async function syncInvestmentTransactionData(investmentId: string): Promise<void> {
  try {
    // Some Pluggy SDK responses include pagination fields like `nextPage`, `hasNextPage`,
    // or a `meta.pagination` object. Keep fetching until there is no next page.
    let page = 1;
    const allTxns: ReturnType<typeof mapInvestmentTransactionFromPluggyToDb>[] = [];

    while (true) {
      const invTransactionsResponse: any = await pluggyClient.fetchInvestmentTransactions(investmentId, { page });

      if (invTransactionsResponse?.results && invTransactionsResponse.results.length > 0) {
        const invTransactionsToSave = invTransactionsResponse.results.map((txn: InvestmentTransaction) =>
          mapInvestmentTransactionFromPluggyToDb(txn, investmentId)
        );
        allTxns.push(...invTransactionsToSave);
      }

      // Determine if there is a next page. Support several common shapes.
      const hasNextPage = Boolean(
        invTransactionsResponse?.hasNextPage ||
          invTransactionsResponse?.nextPage ||
          invTransactionsResponse?.meta?.pagination?.nextPage ||
          // some APIs return a `cursor`/`next_cursor` or `meta.next_cursor` — treat absence as end
          invTransactionsResponse?.meta?.pagination?.cursor
      );

      // If `nextPage` is numeric we advance, otherwise break when no indicator
      if (!hasNextPage) break;

      // If nextPage provided as number, use it; otherwise increment page
      if (typeof invTransactionsResponse.nextPage === 'number') {
        page = invTransactionsResponse.nextPage;
      } else if (typeof invTransactionsResponse.meta?.pagination?.nextPage === 'number') {
        page = invTransactionsResponse.meta.pagination.nextPage;
      } else {
        page += 1;
      }
    }

    if (allTxns.length > 0) {
      await investmentTransactionsService.upsertTransactions(allTxns);
    }
  } catch (error) {
    console.error(`Error syncing investment transactions for ${investmentId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      investmentId,
    });
    throw error;
  }
}

export async function syncLoanData(itemId: string): Promise<void> {
  try {
    const loansResponse = await pluggyClient.fetchLoans(itemId);

    if (loansResponse.results && loansResponse.results.length > 0) {
      const loansToSave: LoanRecord[] = loansResponse.results.map((loan: Loan) => 
        mapLoanFromPluggyToDb(loan) as LoanRecord
      );

      await loansService.upsertLoans(loansToSave);
    }
  } catch (error) {
    console.error(`Error syncing loans for item ${itemId}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      itemId,
    });
    throw error;
  }
}

// accountOrId may be an Account object already fetched from Pluggy
// or simply the string id.  callers that already have the account should
// pass the object in order to avoid any additional API/DB lookups.
export async function syncTransactionData(accountOrId: string | Account): Promise<void> {
  const accountId = typeof accountOrId === 'string' ? accountOrId : String(accountOrId.id);

  try {
    let page = 1;
    const allTransactions: TransactionRecord[] = [];
    let hasMore = true;

    while (hasMore) {
      const transactionsResponse: any = await pluggyClient.fetchTransactions(accountId, {
        page,
        pageSize: 500, // Maximum recommended by Pluggy for performance
      });

      if (transactionsResponse?.results && transactionsResponse.results.length > 0) {
        const transactionsToSave = transactionsResponse.results.map((txn: Transaction) =>
          mapTransactionFromPluggyToDb(txn, accountId) as TransactionRecord
        );
        allTransactions.push(...transactionsToSave);
      }

      // Check if there are more pages
      hasMore = transactionsResponse?.results?.length === 500;
      page++;
    }

    if (allTransactions.length > 0) {
      // de‑duplicate by transaction_id to keep the payload smaller and
      // because redundant inserts will be ignored by the database onConflict
      const seen = new Set<string>();
      const uniqueTxns = allTransactions.filter(txn => {
        if (seen.has(txn.transaction_id)) return false;
        seen.add(txn.transaction_id);
        return true;
      });

      await transactionsService.upsertTransactions(uniqueTxns);
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

export async function syncIdentityData(itemId: string): Promise<void> {
  try {
    const identity = await pluggyClient.fetchIdentityByItemId(itemId);

    if (identity) {
      const identityToSave = mapIdentityFromPluggyToDb(identity) as IdentityRecord;
      await identityService.upsertIdentity(identityToSave);
    }
  } catch (error: unknown) {
    const httpError = error as { response?: { status?: number } };
    if (httpError?.response?.status !== 404) {
      console.error(`Error syncing identity for item ${itemId}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        itemId,
      });
      throw error;
    }
  }
}