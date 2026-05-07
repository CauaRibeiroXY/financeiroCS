'use client';

import { useMemo } from 'react';
import { useDashboardData } from './useDashboardData';
import { detectRecurrences } from '@/app/lib/services/recurrence';
import type { RecurrenceAnalysis } from '@/app/lib/services/recurrence';

export function useRecurrences(): {
    analysis: RecurrenceAnalysis;
    isLoading: boolean;
    isError: boolean;
} {
    const { allTransactions, isLoading, isError } = useDashboardData();

    const analysis = useMemo(
        () => detectRecurrences(allTransactions),
        [allTransactions]
    );

    return { analysis, isLoading, isError };
}
