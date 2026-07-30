'use client';

import useSWR from 'swr';
import type { OverviewResult } from '@/app/lib/services/overview';

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as OverviewResult) : null));

/**
 * Números da Visão Geral.
 *
 * Substitui `useDashboardData` apenas nesta página. O hook antigo continua
 * servindo `accounts`, `transactions`, `goals` e `useRecurrences` — trocá-lo
 * de uma vez transformaria uma mudança do dashboard numa regressão de quatro
 * telas.
 *
 * A troca de escopo e de modo do cartão não passa por aqui: os quatro recortes
 * vêm na mesma resposta e o filtro é local.
 */
export function useOverview(period?: string, windowMonths = 6) {
  const query = new URLSearchParams();
  if (period) query.set('period', period);
  if (windowMonths !== 6) query.set('window', String(windowMonths));

  const url = `/api/overview${query.size ? `?${query}` : ''}`;

  const { data, error, isLoading } = useSWR(url, fetcher, { keepPreviousData: true });

  return {
    overview: data ?? null,
    isLoading,
    isError: Boolean(error),
  };
}
