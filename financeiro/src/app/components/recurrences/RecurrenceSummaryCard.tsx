'use client';

import type { RecurrenceAnalysis } from '@/app/lib/services/recurrence';
import { TrendingUp } from 'lucide-react';

interface Props {
    analysis: RecurrenceAnalysis;
}

function formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
}

export function RecurrenceSummaryCard({ analysis }: Props) {
    const { totalMonthlyCommitted, items } = analysis;

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex items-start gap-5">
            {/* Icon */}
            <div className="shrink-0 w-12 h-12 rounded-lg bg-[#58a6ff]/10 flex items-center justify-center">
                <TrendingUp size={22} className="text-[#58a6ff]" />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                    Total Mensal Comprometido
                </p>
                <p className="text-3xl font-bold text-[#e6edf3] tabular-nums">
                    {formatBRL(totalMonthlyCommitted)}
                </p>
                <p className="text-sm text-[#8b949e]">
                    {items.length === 0
                        ? 'Nenhuma despesa recorrente detectada'
                        : `${items.length} despesa${items.length === 1 ? '' : 's'} recorrente${items.length === 1 ? '' : 's'} detectada${items.length === 1 ? '' : 's'}`}
                </p>
            </div>
        </div>
    );
}
