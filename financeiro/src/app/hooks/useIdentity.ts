'use client';

import useSWR from 'swr';
import type { IdentityRecord } from '@/app/types/pluggy';

interface IdentityResponse {
  success: boolean;
  data: IdentityRecord;
}

export function useIdentity(itemId: string | null | undefined) {
  const { data, error, isLoading } = useSWR<IdentityResponse>(
    itemId ? `/api/identity?itemId=${itemId}` : null
  );

  return {
    identity: data?.data ?? null,
    isLoading,
    isError: !!error,
  };
}
