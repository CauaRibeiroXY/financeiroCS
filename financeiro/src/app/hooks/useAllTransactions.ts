'use client';

/**
 * React Hook: useAllTransactions
 * 
 * Fetches ALL transactions for an account with automatic pagination
 * Returns transactions in a single hook call
 * 
 * Usage:
 * const { transactions, isLoading, isError, refetch } = useAllTransactions(accountId, '2026-01-01', '2026-02-28');
 */

import useSWR from 'swr';
import type { TransactionRecord } from '@/app/types/pluggy';

interface AllTransactionsResponse {
  success: boolean;
  data: {
    results: TransactionRecord[];
    totalRecords: number;
    dateRange: {
      from: string;
      to: string;
    };
    metadata: {
      itemId: string;
      accountId: string;
      pageSize: number;
      fetchedAt: string;
    };
  };
}

interface UseAllTransactionsOptions {
  pageSize?: number;
  onSuccess?: (data: AllTransactionsResponse) => void;
  onError?: (error: Error) => void;
}

export function useAllTransactions(
  accountId: string | null | undefined,
  from?: string,
  to?: string,
  options?: UseAllTransactionsOptions
) {
  const pageSize = options?.pageSize || 100;

  // Build query string
  const queryParams = new URLSearchParams();
  if (accountId) queryParams.append('accountId', accountId);
  if (from) queryParams.append('from', from);
  if (to) queryParams.append('to', to);
  if (pageSize !== 100) queryParams.append('pageSize', String(pageSize));

  const url = accountId ? `/api/transactions/full?${queryParams.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<AllTransactionsResponse>(
    url,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Call success handler if provided
  if (data && options?.onSuccess) {
    options.onSuccess(data);
  }

  // Call error handler if provided
  if (error && options?.onError) {
    options.onError(error);
  }

  return {
    // Transactions data
    transactions: data?.data?.results ?? [],
    totalRecords: data?.data?.totalRecords ?? 0,
    dateRange: data?.data?.dateRange,
    metadata: data?.data?.metadata,
    
    // Loading states
    isLoading,
    isError: !!error,
    error,
    
    // Refresh data
    refetch: mutate,
    
    // Raw response
    rawData: data,
  };
}
