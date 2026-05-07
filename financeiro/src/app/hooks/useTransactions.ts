'use client';

import useSWR from 'swr';
import type { TransactionRecord } from '@/app/types/pluggy';

interface TransactionsResponse {
  success: boolean;
  data: {
    results: TransactionRecord[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
}

export function useTransactions(
  accountId: string | null | undefined,
  page = 1,
  pageSize = 100
) {
  const { data, error, isLoading, mutate } = useSWR<TransactionsResponse>(
    accountId ? `/api/transactions?accountId=${accountId}&page=${page}&pageSize=${pageSize}` : null
  );

  return {
    transactions: data?.data?.results ?? [],
    totalRecords: data?.data?.totalRecords ?? 0,
    totalPages: data?.data?.totalPages ?? 0,
    currentPage: data?.data?.page ?? page,
    isLoading,
    isError: !!error,
    mutate,
  };
}
