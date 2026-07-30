'use client';

import { RefreshCw } from 'lucide-react';
import { FixedExpensesCard } from '@/app/components/dashboard/FixedExpensesCard';
import { SpendingBreakdown } from '@/app/components/recurrences/SpendingBreakdown';

export default function RecurrencesPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <RefreshCw size={18} className="text-[#8b949e]" />
          <h1 className="text-[#e6edf3] font-semibold text-base">Recorrências e Gastos</h1>
        </div>
        <p className="text-xs text-[#8b949e]">
          Compromissos detectados e para onde o dinheiro está indo
        </p>
      </header>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Compromissos: o mesmo card da visão geral */}
        <section className="grid gap-6 lg:grid-cols-2">
          <FixedExpensesCard />

          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col justify-center gap-3">
            <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
              Como a detecção funciona
            </h2>
            <ul className="text-xs text-[#8b949e] space-y-2 leading-relaxed">
              <li>
                <span className="text-[#f0883e] font-medium">Parcela</span> — lida do próprio
                cartão. Sabe quantas faltam e em que mês termina, sem estimativa.
              </li>
              <li>
                <span className="text-[#a371f7] font-medium">Assinatura</span> — valor fixo que
                repete todo mês por volta do mesmo dia.
              </li>
              <li>
                <span className="text-[#58a6ff] font-medium">Recorrente</span> — conta de valor
                variável: energia, água, prestação.
              </li>
              <li>
                <span className="text-[#8b949e] font-medium">Manual</span> — o que você cadastrou
                à mão. Sempre tem prioridade sobre o detectado.
              </li>
            </ul>
            <p className="text-[11px] text-[#8b949e] pt-2 border-t border-[#21262d]">
              Itens marcados com <span className="text-[#e6edf3]">confirmar</span> foram detectados
              com pouca evidência — vale revisar antes de confiar no total.
            </p>
          </div>
        </section>

        {/* Para onde o dinheiro foi */}
        <section>
          <SpendingBreakdown />
        </section>
      </div>
    </div>
  );
}
