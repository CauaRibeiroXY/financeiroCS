/**
 * Utility function to fetch ALL transactions from Pluggy API with automatic pagination
 * Implements the official Pluggy pagination algorithm:
 * https://docs.pluggy.ai/docs/transactions#how-to-synchronize-and-merge-transactions
 * 
 * @param itemId - The Pluggy Item ID
 * @param from - Start date (YYYY-MM-DD format)
 * @param to - End date (YYYY-MM-DD format)
 * @param pageSize - Number of records per page (default: 100, max recommended)
 * @returns Array of all transactions across all pages
 */

import { getPluggyClient } from '@/app/lib/pluggy/client';
import type { TransactionRecord } from '@/app/types/pluggy';

interface PluggyTransactionResponse {
  results: TransactionRecord[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage?: boolean;
  nextPage?: number;
}

export async function fetchAllTransactions(
  itemId: string,
  from: string,
  to: string,
  pageSize: number = 100
): Promise<TransactionRecord[]> {
  const client = getPluggyClient();
  const allTransactions: TransactionRecord[] = [];

  let currentPage = 1;
  let hasMorePages = true;

  console.log(`[fetchAllTransactions] Starting pagination for item: ${itemId}, from: ${from}, to: ${to}`);

  while (hasMorePages) {
    try {
      // Fetch current page from Pluggy API
      const response = (await client.fetchTransactions(itemId, {
        from,
        to,
        page: currentPage,
        pageSize,
      })) as unknown as PluggyTransactionResponse;

      console.log(
        `[fetchAllTransactions] Page ${currentPage}: ${response.results?.length || 0} records, ` +
        `hasNextPage: ${response.hasNextPage}, nextPage: ${response.nextPage}`
      );

      if (response.results && Array.isArray(response.results)) {
        allTransactions.push(...response.results);
      }

      // Check for next page using the official algorithm
      // The response.nextPage indicates which page number to fetch next
      if (response.hasNextPage && response.nextPage) {
        currentPage = response.nextPage;
      } else {
        hasMorePages = false;
      }
    } catch (error) {
      console.error(`[fetchAllTransactions] Error fetching page ${currentPage}:`, error);
      throw new Error(
        `Failed to fetch transactions for item ${itemId} at page ${currentPage}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  console.log(`[fetchAllTransactions] Completed. Total transactions fetched: ${allTransactions.length}`);
  return allTransactions;
}
