'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Flame, ArrowRight, AlertTriangle, Coffee, DollarSign, Bike, Tv, Plane } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';
import type { MoneyLeaksAnalysis, LeakCategory } from '@/app/lib/services/money-leaks';

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as MoneyLeaksAnalysis) : null));

function categoryIcon(cat: LeakCategory) {
  switch (cat) {
    case 'BANK_FEES':
      return <DollarSign size={13} className="text-[#f85149]" />;
    case 'MICRO_EXPENSES':
      return <Coffee size={13} className="text-[#d29922]" />;
    case 'DELIVERY_TRANSPORT':
      return <Bike size={13} className="text-[#f0883e]" />;
    case 'SUBSCRIPTIONS':
      return <Tv size={13} className="text-[#a371f7]" />;
    default:
      return <AlertTriangle size={13} className="text-[#58a6ff]" />;
  }
}

export function MoneyLeaksWidget() {
  const { data, isLoading } = useSWR('/api/money-leaks', fetcher);

  if (isLoading || !data) return null;

  const totalLeaking = data.totalLeakingAmount;
  const items = data.items || [];
  const occasionalEvents = data.occasionalEvents || [];
  const topItems = items.slice(0, 3);

  if (items.length === 0 && totalLeaking === 0 && occasionalEvents.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#f85149]/40 bg-gradient-to-br from-[#161b22] via-[#1c181b] to-[#211417] p-4 sm:p-5 shadow-sm space-y-3.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f85149]/20 border border-[#f85149]/40 flex items-center justify-center text-[#f85149] shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#e6edf3]">
                Módulo: Onde Estou Perdendo Dinheiro
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40">
                {items.length} ralo(s) crônico(s)
              </span>
              {occasionalEvents.length > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40 flex items-center gap-1">
                  <Plane size={11} /> {occasionalEvents.length} viagem/evento isolado
                </span>
              )}
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5">
              Identificamos{' '}
              <strong className="text-[#f85149]">{formatCurrency(totalLeaking)}</strong> ({data.leakingPercentage}% das despesas) saindo em vazamentos evitáveis este mês.
            </p>
          </div>
        </div>

        <Link
          href="/money-leaks"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f85149] hover:bg-[#da3633] text-white text-xs font-semibold transition-colors shadow-sm shrink-0 self-end sm:self-auto"
        >
          Diagnóstico Completo <ArrowRight size={13} />
        </Link>
      </div>

      {/* Lista rápida dos principais ralos detectados no dashboard */}
      {topItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-[#30363d]/60">
          {topItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0d1117]/80 border border-[#30363d]/80 rounded-lg p-2.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-[#21262d] shrink-0">
                  {categoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#e6edf3] truncate">{item.title}</p>
                  <p className="text-[10px] text-[#8b949e]">{item.occurrences}x transações</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#f85149] shrink-0 tabular-nums">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
