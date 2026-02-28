'use client';

import { Info, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';

interface PartialResultCardProps {
  totalIncome: number;
  totalExpenses: number;
  partialResult: number;
  previousMonthResult?: number;
  isLoading: boolean;
}

export function PartialResultCard({
  totalIncome,
  totalExpenses,
  partialResult,
  previousMonthResult = 0,
  isLoading,
}: PartialResultCardProps) {
  if (isLoading) return <SkeletonCard />;

  const variation =
    previousMonthResult !== 0
      ? ((partialResult - previousMonthResult) / Math.abs(previousMonthResult)) * 100
      : 0;

  const isPositive = partialResult >= 0;
  const incomeWidth =
    totalIncome + totalExpenses > 0
      ? (totalIncome / (totalIncome + totalExpenses)) * 100
      : 50;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
            Resultado Parcial
          </span>
          <Info size={13} className="text-[#8b949e]" />
        </div>
        <button className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline">
          fluxo de caixa <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Value */}
      <p
        className={`text-3xl font-bold ${
          isPositive ? 'text-[#3fb950]' : 'text-[#f85149]'
        }`}
      >
        {formatCurrency(partialResult)}
      </p>

      {/* Variation */}
      {previousMonthResult !== 0 && (
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              variation >= 0
                ? 'bg-[#3fb950]/20 text-[#3fb950]'
                : 'bg-[#f85149]/20 text-[#f85149]'
            }`}
          >
            {variation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {formatPercentage(variation)}
          </span>
          <span className="text-[#8b949e] text-xs">
            vs {formatCurrency(previousMonthResult)} mês anterior
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="rounded-full overflow-hidden h-2 bg-[#21262d] mt-1">
        <div className="flex h-full">
          <div
            className="bg-[#58a6ff] h-full transition-all"
            style={{ width: `${incomeWidth}%` }}
          />
          <div className="bg-[#30363d] h-full flex-1" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-1">
        <div>
          <p className="text-[#8b949e] text-xs mb-1">Receita</p>
          <p className="text-[#e6edf3] text-sm font-semibold">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-[#8b949e] text-xs mb-1">Gasto</p>
          <p className="text-[#e6edf3] text-sm font-semibold">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-[#8b949e] text-xs mb-1">Excluído</p>
          <p className="text-[#8b949e] text-sm">R$ 0,00</p>
        </div>
      </div>
    </div>
  );
}
