'use client';

import useSWR from 'swr';
import type { PluggyItemRecord } from '@/app/types/pluggy';

interface ItemsResponse {
  success: boolean;
  data: {
    results: PluggyItemRecord[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
}

export function useItems() {
  const { data, error, isLoading, mutate } = useSWR<ItemsResponse>('/api/items');

  return {
    items: data?.data?.results ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
