'use client';

import { SWRConfig } from 'swr';
import { api } from '@/app/lib/utils/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 10000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
