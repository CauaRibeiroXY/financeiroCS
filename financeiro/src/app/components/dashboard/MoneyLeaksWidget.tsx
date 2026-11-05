'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';
import type { MoneyLeaksAnalysis } from '@/app/lib/services/money-leaks';

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => (res.success ? (res.data as MoneyLeaksAnalysis) : null));

export function MoneyLeaksWidget() {
  const { data, isLoading } = useSWR('/api/money-leaks', fetcher);

  if (isLoading || !data) return null;

  const totalLeaking = data.totalLeakingAmount;
  const itemsCount = data.items.length;

  if (itemsCount === 0 && totalLeaking === 0) return null;

  return (
    <div className="rounded-xl border border-[#f85149]/40 bg-gradient-to-r from-[#161b22] to-[#211417] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#f85149]/20 border border-[#f85149]/40 flex items-center justify-center text-[#f85149] shrink-0">
          <Flame size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#e6edf3]">
              Detector de Ralos Financeiros
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40">
              {itemsCount} ponto(s) de atenção
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Identificamos aproximadamente{' '}
            <strong className="text-[#f85149]">{formatCurrency(totalLeaking)}</strong> em potenciais
            vazamentos (tarifas, efeito cafezinho ou assinaturas) neste mês.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
        <Link
          href="/money-leaks"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#f85149] hover:bg-[#da3633] text-white text-xs font-semibold transition-colors shadow-sm"
        >
          Ver Onde Estou Perdendo Dinheiro <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
