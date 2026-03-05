'use client';

import type { RecurringExpense, RecurrenceFrequency } from '@/app/lib/services/recurrence';
import { Loader2 } from 'lucide-react';

interface Props {
    items: RecurringExpense[];
    isLoading: boolean;
    isError: boolean;
}

function formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
}

function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    annual: 'Anual',
    irregular: 'Irregular',
};

const FREQUENCY_COLORS: Record<RecurrenceFrequency, string> = {
    weekly: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    monthly: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    annual: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    irregular: 'bg-[#30363d] text-[#8b949e] border border-[#30363d]',
};

export function RecurrenceList({ items, isLoading, isError }: Props) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-[#8b949e] gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Analisando transações...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-16 text-center text-red-400 text-sm">
                Erro ao carregar transações. Tente novamente.
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="py-16 text-center text-[#8b949e] text-sm">
                Nenhuma despesa recorrente detectada.
                <br />
                <span className="text-xs mt-1 block opacity-70">
                    Precisamos de pelo menos 2 transações semelhantes em meses diferentes.
                </span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[#30363d]">
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                            Descrição
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                            Frequência
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                            Valor Médio
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                            Custo Mensal
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                            Ocorrências
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                            Última Cobrança
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                    {items.map((item) => (
                        <tr
                            key={item.id}
                            className="hover:bg-[#21262d] transition-colors"
                        >
                            {/* Description */}
                            <td className="px-4 py-3 text-[#e6edf3] font-medium truncate max-w-[220px]">
                                {item.label}
                            </td>

                            {/* Frequency badge */}
                            <td className="px-4 py-3">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${FREQUENCY_COLORS[item.frequency]}`}
                                >
                                    {FREQUENCY_LABELS[item.frequency]}
                                </span>
                            </td>

                            {/* Average amount */}
                            <td className="px-4 py-3 text-right text-[#e6edf3] tabular-nums">
                                {formatBRL(item.averageAmount)}
                            </td>

                            {/* Monthly equivalent */}
                            <td className="px-4 py-3 text-right font-semibold text-[#58a6ff] tabular-nums">
                                {formatBRL(item.monthlyEquivalent)}
                            </td>

                            {/* Occurrences */}
                            <td className="px-4 py-3 text-right text-[#8b949e] tabular-nums">
                                {item.occurrences}×
                            </td>

                            {/* Last date */}
                            <td className="px-4 py-3 text-right text-[#8b949e]">
                                {formatDate(item.lastDate)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
