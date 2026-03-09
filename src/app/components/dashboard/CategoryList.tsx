'use client';

import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/app/lib/utils/format';
import { SkeletonCategoryRow } from '@/app/components/shared/Skeleton';
import type { CategoryData } from '@/app/hooks/useDashboardData';

interface CategoryListProps {
  categories: CategoryData[];
  isLoading: boolean;
}

export function CategoryList({ categories, isLoading }: CategoryListProps) {
  const maxAmount = Math.max(...categories.map((c) => c.current), 1);

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
          Principais Categorias
        </span>
        <Link href="/transactions" className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline">
          Ver mais <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Table container for responsiveness */}
      <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
        <div className="min-w-fit w-full lg:min-w-0">
          {/* Table header */}
          <div className="grid grid-cols-[minmax(120px,_1fr)_auto_80px_auto] gap-3 text-[#8b949e] text-xs pb-1 border-b border-[#30363d]">
            <span>Categoria</span>
            <span className="text-right">Atual</span>
            <span className="text-center">Variação</span>
            <span className="text-right">Anterior</span>
          </div>

          {/* Rows */}
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCategoryRow key={i} />)
          ) : categories.length === 0 ? (
            <p className="text-[#8b949e] text-sm py-6 text-center">
              Sem dados de categorias para este mês.
            </p>
          ) : (
            categories.map((cat) => {
              const variation =
                cat.previous > 0
                  ? ((cat.current - cat.previous) / cat.previous) * 100
                  : 0;
              const barWidth = (cat.current / maxAmount) * 100;
              const isUp = variation > 0;

              return (
                <div
                  key={cat.name}
                  className="grid grid-cols-[minmax(120px,_1fr)_auto_80px_auto] gap-3 items-center py-2 border-b border-[#21262d] last:border-0"
                >
                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span className="text-[#e6edf3] text-sm truncate">{cat.name}</span>
                  </div>

                  {/* Current amount */}
                  <span className="text-[#e6edf3] text-sm font-medium whitespace-nowrap text-right">
                    {formatCurrency(cat.current)}
                  </span>

                  {/* Variation */}
                  <div className="flex justify-center">
                    {cat.previous > 0 ? (
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${isUp
                          ? 'bg-[#f85149]/20 text-[#f85149]'
                          : 'bg-[#3fb950]/20 text-[#3fb950]'
                          }`}
                      >
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {formatPercentage(variation)}
                      </span>
                    ) : (
                      <span className="text-[#8b949e] text-xs">--</span>
                    )}
                  </div>

                  {/* Previous amount */}
                  <span className="text-[#8b949e] text-sm whitespace-nowrap text-right">
                    {cat.previous > 0 ? formatCurrency(cat.previous) : '--'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
