'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Tags,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';

type GroupBy = 'category' | 'merchant';

interface SpendingGroup {
  key: string;
  label: string;
  amount: number;
  previousAmount: number;
  change: number | null;
  share: number;
  transactions: number;
  monthlyAverage: number;
  largest: { description: string; amount: number; date: string } | null;
  series: Array<{ period: string; amount: number }>;
  color: string;
}

interface SpendingAnalysis {
  period: string;
  groupBy: GroupBy;
  total: number;
  previousTotal: number;
  monthlyAverage: number;
  groups: SpendingGroup[];
  timeline: Array<{ period: string; total: number }>;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as SpendingAnalysis) : null));

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTHS[Number(month) - 1]}/${year.slice(2)}`;
}

function shiftPeriod(period: string, delta: number) {
  const [year, month] = period.split('-').map(Number);
  const total = year * 12 + (month - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function compactCurrency(value: number) {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1).replace('.0', '')}k`;
  return `R$${Math.round(value)}`;
}

/** Variação vs. mês anterior, com a cor certa: gastar mais é ruim. */
function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-[#8b949e]">
        <Minus size={10} /> novo
      </span>
    );
  }

  const pct = Math.abs(change * 100);
  if (pct < 1) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-[#8b949e]">
        <Minus size={10} /> estável
      </span>
    );
  }

  const up = change > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-medium ${
        up ? 'text-[#f85149]' : 'text-[#3fb950]'
      }`}
    >
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {pct.toFixed(0)}%
    </span>
  );
}

function TimelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { period: string; total: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 shadow-lg">
      <p className="text-[10px] text-[#8b949e]">{formatPeriod(point.period)}</p>
      <p className="text-xs font-semibold text-[#e6edf3]">{formatCurrency(point.total)}</p>
    </div>
  );
}

export function SpendingBreakdown() {
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [period, setPeriod] = useState(currentPeriod());
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useSWR(
    `/api/spending?period=${period}&groupBy=${groupBy}&window=6&limit=25`,
    fetcher
  );

  if (isLoading) return <SkeletonCard />;

  const groups = data?.groups ?? [];
  const timeline = data?.timeline ?? [];
  const total = data?.total ?? 0;
  const previousTotal = data?.previousTotal ?? 0;
  const monthlyAverage = data?.monthlyAverage ?? 0;

  const totalChange = previousTotal > 0 ? (total - previousTotal) / previousTotal : null;
  const maxAmount = Math.max(...groups.map((g) => g.amount), 1);

  // O donut fica ilegível com uma cauda longa: as menores viram "Outros".
  const donutData = (() => {
    const top = groups.slice(0, 7).filter((g) => g.amount > 0);
    const rest = groups.slice(7).reduce((s, g) => s + g.amount, 0);
    return rest > 0
      ? [...top, { key: '__rest', label: 'Outros', amount: rest, color: '#6b7280' }]
      : top;
  })();

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho: navegação + alternador de agrupamento */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod(shiftPeriod(period, -1))}
            className="rounded-lg border border-[#30363d] p-1 text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-medium text-[#e6edf3] min-w-[70px] text-center">
            {formatPeriod(period)}
          </span>
          <button
            onClick={() => setPeriod(shiftPeriod(period, 1))}
            className="rounded-lg border border-[#30363d] p-1 text-[#8b949e] hover:text-[#e6edf3] hover:border-[#484f58] transition-colors"
            title="Próximo mês"
          >
            <ChevronRight size={14} />
          </button>
          {period !== currentPeriod() && (
            <button
              onClick={() => setPeriod(currentPeriod())}
              className="text-[11px] text-[#58a6ff] hover:underline ml-1"
            >
              hoje
            </button>
          )}
        </div>

        <div className="flex rounded-lg border border-[#30363d] overflow-hidden">
          <button
            onClick={() => setGroupBy('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              groupBy === 'category'
                ? 'bg-[#238636] text-white'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <Tags size={13} /> Categoria
          </button>
          <button
            onClick={() => setGroupBy('merchant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              groupBy === 'merchant'
                ? 'bg-[#238636] text-white'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <Building2 size={13} /> Empresa
          </button>
        </div>
      </div>

      {/* Resumo + evolução */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-[#8b949e] text-xs">Gasto em {formatPeriod(period)}</p>
          <p className="text-[#e6edf3] text-2xl font-bold mt-1">{formatCurrency(total)}</p>
          <div className="flex items-center gap-2 mt-2">
            <ChangeBadge change={totalChange} />
            <span className="text-[#8b949e] text-[11px]">
              vs {formatCurrency(previousTotal)} em {formatPeriod(shiftPeriod(period, -1))}
            </span>
          </div>
          <p className="text-[#8b949e] text-[11px] mt-3 pt-3 border-t border-[#21262d]">
            Média dos meses fechados:{' '}
            <span className="text-[#e6edf3] font-medium">{formatCurrency(monthlyAverage)}</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 lg:col-span-2">
          <p className="text-[#8b949e] text-xs mb-3">Evolução dos últimos meses</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <XAxis
                  dataKey="period"
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatPeriod}
                />
                <YAxis
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactCurrency}
                />
                <Tooltip content={<TimelineTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {timeline.map((point) => (
                    <Cell
                      key={point.period}
                      fill={point.period === period ? '#58a6ff' : '#30363d'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Composição + ranking */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-[#8b949e] text-xs mb-2">
            Composição por {groupBy === 'category' ? 'categoria' : 'empresa'}
          </p>
          {donutData.length === 0 ? (
            <p className="text-[#8b949e] text-xs py-8 text-center">Sem gastos no período.</p>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="amount"
                      nameKey="label"
                      innerRadius="58%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {donutData.map((slice) => (
                        <Cell key={slice.key} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const slice = payload[0].payload as { label: string; amount: number };
                        return (
                          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 shadow-lg">
                            <p className="text-[10px] text-[#8b949e]">{slice.label}</p>
                            <p className="text-xs font-semibold text-[#e6edf3]">
                              {formatCurrency(slice.amount)}
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-3">
                {donutData.map((slice) => (
                  <div key={slice.key} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-[#8b949e] truncate flex-1">{slice.label}</span>
                    <span className="text-[#e6edf3] font-medium">
                      {total > 0 ? `${Math.round((slice.amount / total) * 100)}%` : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#30363d]">
            <h2 className="text-sm font-medium text-[#e6edf3]">Principais gastos</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">
              {groupBy === 'category'
                ? 'Quanto foi para cada tipo de gasto no mês'
                : 'Quanto foi para cada estabelecimento, app ou pessoa'}
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {groups.length === 0 ? (
              <p className="text-[#8b949e] text-xs text-center py-10">
                Nenhum gasto registrado em {formatPeriod(period)}.
              </p>
            ) : (
              groups.map((group) => {
                const isOpen = expanded === group.key;
                return (
                  <div key={group.key} className="border-b border-[#21262d] last:border-0">
                    <button
                      onClick={() => setExpanded(isOpen ? null : group.key)}
                      className="w-full px-5 py-3 text-left hover:bg-[#1c2128] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="text-xs font-medium text-[#e6edf3] truncate">
                            {group.label}
                          </span>
                          <span className="text-[10px] text-[#8b949e] shrink-0">
                            {group.transactions}x
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <ChangeBadge change={group.change} />
                          <span className="text-xs font-semibold text-[#e6edf3] tabular-nums">
                            {formatCurrency(group.amount)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 h-1 w-full rounded-full bg-[#21262d] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(group.amount / maxAmount) * 100}%`,
                            backgroundColor: group.color,
                          }}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 bg-[#0d1117]/40">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] mb-3">
                          <div>
                            <p className="text-[#8b949e]">Fatia do mês</p>
                            <p className="text-[#e6edf3] font-medium">
                              {Math.round(group.share * 100)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8b949e]">Média mensal</p>
                            <p className="text-[#e6edf3] font-medium">
                              {formatCurrency(group.monthlyAverage)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8b949e]">Mês anterior</p>
                            <p className="text-[#e6edf3] font-medium">
                              {formatCurrency(group.previousAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8b949e]">Maior lançamento</p>
                            <p className="text-[#e6edf3] font-medium">
                              {group.largest ? formatCurrency(group.largest.amount) : '--'}
                            </p>
                          </div>
                        </div>

                        {group.largest && (
                          <p className="text-[10px] text-[#8b949e] mb-3 truncate">
                            Maior: {group.largest.description} em{' '}
                            {group.largest.date.split('-').reverse().join('/')}
                          </p>
                        )}

                        <div className="h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={group.series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                              <XAxis
                                dataKey="period"
                                tick={{ fill: '#8b949e', fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatPeriod}
                              />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const point = payload[0].payload as {
                                    period: string;
                                    amount: number;
                                  };
                                  return (
                                    <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-2 py-1 shadow-lg">
                                      <p className="text-[10px] text-[#e6edf3]">
                                        {formatPeriod(point.period)}:{' '}
                                        {formatCurrency(point.amount)}
                                      </p>
                                    </div>
                                  );
                                }}
                                cursor={{ fill: '#ffffff08' }}
                              />
                              <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                                {group.series.map((point) => (
                                  <Cell
                                    key={point.period}
                                    fill={point.period === period ? group.color : '#30363d'}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
