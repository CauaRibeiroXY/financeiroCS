'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Info, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';

interface SpendingPaceCardProps {
  currentExpenses: number;
  previousExpenses: number;
  spendingByDay: { day: number; current: number | null; previous: number }[];
  isLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2 text-xs shadow-xl">
      <p className="text-[#e6edf3] font-medium mb-1">Dia {data?.day}</p>
      <p className="text-[#f85149]">Este mês: {formatCurrency(data?.current ?? 0)}</p>
      <p className="text-[#8b949e]">Mês passado: {formatCurrency(data?.previous ?? 0)}</p>
    </div>
  );
}

export function SpendingPaceCard({
  currentExpenses,
  previousExpenses,
  spendingByDay,
  isLoading,
}: SpendingPaceCardProps) {
  if (isLoading) return <SkeletonCard />;

  const variation =
    previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0;

  const isAbove = currentExpenses > previousExpenses;
  const differenceAbs = Math.abs(currentExpenses - previousExpenses);
  const lineColor = isAbove ? '#f85149' : '#3fb950';

  let maxCurrent = 0;
  let lastActiveDayIndex = -1;
  spendingByDay.forEach((d, i) => {
    if (d.current !== null && d.current !== undefined) {
      maxCurrent = Math.max(maxCurrent, d.current);
      lastActiveDayIndex = i;
    }
  });

  let maxPreviousUpToActiveDay = 0;
  for (let i = 0; i <= lastActiveDayIndex; i++) {
    if (spendingByDay[i]?.previous) {
      maxPreviousUpToActiveDay = Math.max(maxPreviousUpToActiveDay, spendingByDay[i].previous);
    }
  }

  const dynamicMax = Math.max(maxCurrent, maxPreviousUpToActiveDay, 100);
  const yAxisMax = dynamicMax * 1.2;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
            Ritmo de Gastos
          </span>
          <Info size={13} className="text-[#8b949e]" />
        </div>
        <Link href="/transactions" className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline">
          Ver todas <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Value */}
      <div>
        <p className="text-[#e6edf3] text-3xl font-bold leading-none">
          {formatCurrency(differenceAbs)}{' '}
          <span className="text-base font-normal text-[#8b949e]">
            {isAbove ? 'acima' : 'abaixo'}
          </span>
        </p>
      </div>

      {/* Variation */}
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isAbove
            ? 'bg-[#f85149]/20 text-[#f85149]'
            : 'bg-[#3fb950]/20 text-[#3fb950]'
            }`}
        >
          {isAbove ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {formatPercentage(variation)}
        </span>
        <span className="text-[#8b949e] text-xs">
          vs {formatCurrency(previousExpenses)} mês anterior
        </span>
      </div>

      {/* Chart */}
      <div className="h-28 mt-1 w-full">
        <ResponsiveContainer width="100%" height={112}>
          <AreaChart data={spendingByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fill: '#8b949e', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(1).replace('.0', '')}k` : `R$${v}`}
              domain={[0, yAxisMax]}
              allowDataOverflow={true}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="current"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#currentGrad)"
              activeDot={{ r: 4, fill: lineColor, stroke: '#161b22', strokeWidth: 2 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              dot={(props: any) => {
                const { cx, cy, index } = props;
                if (index !== lastActiveDayIndex) return null;

                const text = `R$ ${formatCurrency(differenceAbs).replace(/^R\$\s*/, '')} ${isAbove ? 'acima' : 'abaixo'}`;
                const textWidth = text.length * 6.5 + 16;
                return (
                  <g key={`dot-${index}`}>
                    <circle cx={cx} cy={cy} r={4} fill={lineColor} stroke="#161b22" strokeWidth={2} />
                    <g transform={`translate(${cx}, ${cy - 24})`}>
                      <rect x={-textWidth / 2} y={-12} width={textWidth} height={24} fill={lineColor} rx={12} />
                      <polygon points="-4,12 4,12 0,16" fill={lineColor} />
                      <text x={0} y={0} fill="#fff" fontSize={10} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                        {text}
                      </text>
                    </g>
                  </g>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#8b949e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5" style={{ backgroundColor: lineColor }} />
          <span className="text-[#8b949e] text-xs">Este mês</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[#8b949e] border-dashed border border-[#8b949e]" />
          <span className="text-[#8b949e] text-xs">Mês passado</span>
        </div>
      </div>
    </div>
  );
}
