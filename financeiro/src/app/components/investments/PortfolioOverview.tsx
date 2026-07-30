'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';

export interface AllocationSlice {
  key: string;
  label: string;
  value: number;
  share: number;
  count: number;
  color: string;
}

export interface MaturityBucket {
  key: string;
  label: string;
  value: number;
  count: number;
}

interface Props {
  total: number;
  totalInvested: number | null;
  totalProfit: number | null;
  totalProfitRate: number | null;
  totalWithdrawable: number | null;
  positionCount: number;
  byType: AllocationSlice[];
  byInstitution: AllocationSlice[];
  byIndexer: AllocationSlice[];
  maturities: MaturityBucket[];
}

function AllocationDonut({ title, slices }: { title: string; slices: AllocationSlice[] }) {
  if (slices.length === 0) {
    return (
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
        <p className="text-[#8b949e] text-xs mb-2">{title}</p>
        <p className="text-[#8b949e] text-xs py-10 text-center">Sem dados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
      <p className="text-[#8b949e] text-xs mb-2">{title}</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const slice = payload[0].payload as AllocationSlice;
                return (
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 shadow-lg">
                    <p className="text-[10px] text-[#8b949e]">{slice.label}</p>
                    <p className="text-xs font-semibold text-[#e6edf3]">
                      {formatCurrency(slice.value)}
                    </p>
                    <p className="text-[10px] text-[#8b949e]">
                      {slice.count} {slice.count === 1 ? 'posição' : 'posições'}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5 mt-3">
        {slices.slice(0, 6).map((slice) => (
          <div key={slice.key} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-[#8b949e] truncate flex-1">{slice.label}</span>
            <span className="text-[#e6edf3] font-medium tabular-nums">
              {Math.round(slice.share * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortfolioOverview({
  total,
  totalInvested,
  totalProfit,
  totalProfitRate,
  totalWithdrawable,
  positionCount,
  byType,
  byInstitution,
  byIndexer,
  maturities,
}: Props) {
  const profitUp = (totalProfit ?? 0) >= 0;
  const maxMaturity = Math.max(...maturities.map((m) => m.value), 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Números principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-[#8b949e] text-xs">Total investido</p>
          <p className="text-[#e6edf3] text-2xl font-bold mt-1">{formatCurrency(total)}</p>
          <p className="text-[#8b949e] text-[11px] mt-1">
            {positionCount} {positionCount === 1 ? 'posição' : 'posições'}
          </p>
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-[#8b949e] text-xs">Aplicado</p>
          <p className="text-[#e6edf3] text-2xl font-bold mt-1">
            {totalInvested !== null ? formatCurrency(totalInvested) : '--'}
          </p>
          <p className="text-[#8b949e] text-[11px] mt-1">
            {totalInvested !== null ? 'quanto saiu do bolso' : 'não informado pelo banco'}
          </p>
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-[#8b949e] text-xs">Resultado</p>
          {totalProfit !== null ? (
            <>
              <p
                className={`text-2xl font-bold mt-1 ${profitUp ? 'text-[#3fb950]' : 'text-[#f85149]'}`}
              >
                {formatCurrency(totalProfit)}
              </p>
              {totalProfitRate !== null && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium mt-1 ${
                    profitUp ? 'text-[#3fb950]' : 'text-[#f85149]'
                  }`}
                >
                  {profitUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {(totalProfitRate * 100).toFixed(2).replace('.', ',')}% sobre o aplicado
                </span>
              )}
            </>
          ) : (
            <>
              <p className="text-[#e6edf3] text-2xl font-bold mt-1">--</p>
              <p className="text-[#8b949e] text-[11px] mt-1">não informado pelo banco</p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-[#8b949e] text-xs">Disponível para resgate</p>
          <p className="text-[#e6edf3] text-2xl font-bold mt-1">
            {totalWithdrawable !== null ? formatCurrency(totalWithdrawable) : '--'}
          </p>
          <p className="text-[#8b949e] text-[11px] mt-1">
            {totalWithdrawable !== null && total > 0
              ? `${Math.round((totalWithdrawable / total) * 100)}% da carteira`
              : 'não informado pelo banco'}
          </p>
        </div>
      </div>

      {/* Alocação */}
      <div className="grid gap-4 lg:grid-cols-3">
        <AllocationDonut title="Por classe de ativo" slices={byType} />
        <AllocationDonut title="Por instituição" slices={byInstitution} />
        <AllocationDonut title="Por indexador" slices={byIndexer} />
      </div>

      {/* Vencimentos */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
        <p className="text-[#e6edf3] text-sm font-medium">Quando o dinheiro fica disponível</p>
        <p className="text-[11px] text-[#8b949e] mt-0.5 mb-4">
          Posições sem data de vencimento — fundos, ações, poupança — entram como liquidez imediata
        </p>

        {maturities.length === 0 ? (
          <p className="text-[#8b949e] text-xs py-6 text-center">Sem dados de vencimento.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {maturities.map((bucket) => (
              <div key={bucket.key}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#8b949e]">
                    {bucket.label}
                    <span className="text-[#484f58] ml-1.5">
                      {bucket.count} {bucket.count === 1 ? 'posição' : 'posições'}
                    </span>
                  </span>
                  <span className="text-[#e6edf3] font-medium tabular-nums">
                    {formatCurrency(bucket.value)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#21262d] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#58a6ff]"
                    style={{ width: `${(bucket.value / maxMaturity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
