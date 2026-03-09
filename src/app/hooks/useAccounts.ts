'use client';

import useSWR from 'swr';
import type { AccountRecord } from '@/app/types/pluggy';

interface AccountsResponse {
  success: boolean;
  data: {
    results: AccountRecord[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
}

export function useAccounts(itemId: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<AccountsResponse>(
    itemId ? `/api/accounts?itemId=${itemId}` : null
  );

  return {
    accounts: data?.data?.results ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
