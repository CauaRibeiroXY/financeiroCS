'use client';

import { useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import { cn } from '@/app/lib/utils/cn';

type Period = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL';
const periods: Period[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];

interface PatrimonyCardProps {
  patrimony: number;
  isLoading: boolean;
  hasData?: boolean;
}

export function PatrimonyCard({ patrimony, isLoading, hasData = true }: PatrimonyCardProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('1W');

  if (isLoading) return <SkeletonCard />;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
          Patrimônio
        </span>
        <button className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline">
          Ver todas <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Value */}
      <div>
        <p className="text-[#e6edf3] text-3xl font-bold">
          {formatCurrency(patrimony)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[#8b949e] text-xs px-2 py-0.5 rounded border border-[#30363d]">
            --
          </span>
        </div>
      </div>

      {/* No data info */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Clock size={28} className="text-[#8b949e]" />
          <p className="text-[#8b949e] text-sm text-center">
            Dados disponíveis após 7 dias
          </p>
        </div>
      )}

      {/* Period selector */}
      <div className="flex items-center gap-1 mt-auto flex-wrap">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              activePeriod === p
                ? 'bg-[#58a6ff] text-black'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
