'use client';

import { RefreshCw } from 'lucide-react';
import { useRecurrences } from '@/app/hooks/useRecurrences';
import { RecurrenceSummaryCard } from '@/app/components/recurrences/RecurrenceSummaryCard';
import { RecurrenceList } from '@/app/components/recurrences/RecurrenceList';

export default function RecurrencesPage() {
    const { analysis, isLoading, isError } = useRecurrences();

    return (
        <div className="flex flex-col h-full">
            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
                <div className="flex items-center gap-3">
                    <RefreshCw size={18} className="text-[#8b949e]" />
                    <h1 className="text-[#e6edf3] font-semibold text-base">Recorrências</h1>
                </div>
                <p className="text-xs text-[#8b949e]">
                    Detecção automática de despesas recorrentes
                </p>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto space-y-6">
                {/* Summary card */}
                <RecurrenceSummaryCard analysis={analysis} />

                {/* Recurring list */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#30363d]">
                        <h2 className="text-sm font-medium text-[#e6edf3]">Despesas Recorrentes Detectadas</h2>
                        <p className="text-xs text-[#8b949e] mt-0.5">
                            Agrupadas por descrição similar, com frequência e custo mensal estimados
                        </p>
                    </div>
                    <RecurrenceList
                        items={analysis.items}
                        isLoading={isLoading}
                        isError={isError}
                    />
                </div>
            </div>
        </div>
    );
}
