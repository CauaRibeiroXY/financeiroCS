'use client';

import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useOverview } from '@/app/hooks/useOverview';
import { useItems } from '@/app/hooks/useItems';
import { SpendingPaceCard } from '@/app/components/dashboard/SpendingPaceCard';
import { PatrimonyCard } from '@/app/components/dashboard/PatrimonyCard';
import { PartialResultCard } from '@/app/components/dashboard/PartialResultCard';
import { CategoryList } from '@/app/components/dashboard/CategoryList';
import { CreditCardBillCard } from '@/app/components/dashboard/CreditCardBillCard';
import { CreditLimitCard } from '@/app/components/dashboard/CreditLimitCard';
import { FixedExpensesCard } from '@/app/components/dashboard/FixedExpensesCard';
import { OverviewFilters } from '@/app/components/dashboard/OverviewFilters';
import type { CreditMode, OverviewScope, OverviewSlice } from '@/app/lib/services/overview';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  return `${MONTHS[Number(month) - 1]}/${year.slice(2)}`;
}

export default function DashboardPage() {
  const [scope, setScope] = useState<OverviewScope>('all');
  const [creditMode, setCreditMode] = useState<CreditMode>('month');

  const { overview, isLoading } = useOverview();
  const { items } = useItems();

  // Os quatro recortes vêm na mesma resposta: trocar de aba é filtro local.
  const slice: OverviewSlice | null = !overview
    ? null
    : scope === 'bank'
      ? overview.slices.bank
      : scope === 'credit'
        ? creditMode === 'cycle'
          ? overview.slices.creditCycle
          : overview.slices.creditMonth
        : overview.slices.all;

  const isCredit = scope === 'credit';
  const isCycle = isCredit && creditMode === 'cycle';
  const periodLabel = slice ? formatPeriod(slice.period) : '';

  const comparisonLabel = isCycle ? 'Fatura anterior' : 'Mês passado';
  const currentLabel = isCycle ? 'Esta fatura' : 'Este mês';

  const categories = (slice?.categories ?? []).map((c) => ({
    name: c.label,
    current: c.current,
    previous: c.previous,
    color: c.color,
  }));

  const cycle = overview?.diagnostics.cycle;
  const unresolvedCycle = isCycle ? (cycle?.unresolved ?? 0) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-[#8b949e]" />
          <h1 className="text-[#e6edf3] font-semibold text-base">Dashboard</h1>
        </div>
        <OverviewFilters
          scope={scope}
          onScopeChange={setScope}
          creditMode={creditMode}
          onCreditModeChange={setCreditMode}
        />
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* No accounts connected */}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-16 h-16 rounded-full bg-[#21262d] flex items-center justify-center">
              <LayoutDashboard size={32} className="text-[#58a6ff]" />
            </div>
            <h2 className="text-[#e6edf3] text-xl font-semibold">
              Nenhuma conta conectada
            </h2>
            <p className="text-[#8b949e] text-sm text-center max-w-sm">
              Conecte sua conta bancária usando o botão &ldquo;Conectar Conta&rdquo; na barra lateral para
              visualizar seu dashboard financeiro.
            </p>
          </div>
        )}

        {(isLoading || items.length > 0) && (
          <>
            {/* Legenda do recorte: sem isso o mesmo número muda de significado
                entre abas sem aviso. */}
            {slice && (
              <p className="text-[#8b949e] text-xs mb-4">
                {scope === 'all' && `Tudo · ${periodLabel}`}
                {scope === 'bank' &&
                  `Conta corrente · ${periodLabel} — pagamento de fatura não entra como gasto`}
                {isCredit &&
                  (isCycle
                    ? `Cartão · compras que entram na fatura que vence em ${periodLabel}`
                    : `Cartão · compras feitas em ${periodLabel}`)}
                {unresolvedCycle > 0 &&
                  ` · ${unresolvedCycle} lançamento(s) sem fatura definida, contados pelo mês`}
              </p>
            )}

            {/* Top row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <SpendingPaceCard
                currentExpenses={slice?.totalExpenses ?? 0}
                previousExpenses={slice?.previousExpenses ?? 0}
                previousExpensesToDate={slice?.previousExpensesToDate}
                spendingByDay={slice?.spendingByDay ?? []}
                title={isCredit ? 'Ritmo da Fatura' : 'Ritmo de Gastos'}
                comparisonLabel={comparisonLabel}
                currentLabel={currentLabel}
                dayLabel={slice?.dayLabel ?? 'Dia'}
                isLoading={isLoading}
              />

              {/* Patrimônio não existe em cartão; limite não existe em conta */}
              {isCredit ? (
                <CreditLimitCard
                  cards={overview?.cards ?? []}
                  creditLimit={overview?.balances.creditLimit ?? null}
                  availableCredit={overview?.balances.availableCredit ?? null}
                  isLoading={isLoading}
                />
              ) : (
                <PatrimonyCard
                  patrimony={overview?.balances.patrimony ?? 0}
                  totalInvestments={overview?.balances.totalInvestments ?? 0}
                  isLoading={isLoading}
                  hasData={!isLoading && items.length > 0}
                />
              )}
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {scope === 'bank' ? (
                // Sem faturas aqui: a categoria ocupa a linha inteira
                <div className="lg:col-span-2">
                  <CategoryList
                    categories={categories}
                    subtitle={periodLabel}
                    isLoading={isLoading}
                  />
                </div>
              ) : (
                <>
                  <CreditCardBillCard
                    cards={overview?.cards ?? []}
                    availableCredit={overview?.balances.availableCredit ?? null}
                    showCycleTotal={isCredit}
                    isLoading={isLoading}
                  />
                  <CategoryList
                    categories={categories}
                    subtitle={isCycle ? `fatura ${periodLabel}` : periodLabel}
                    isLoading={isLoading}
                  />
                </>
              )}
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {isCredit ? (
                // Não existe "sobrou" num cartão — o card de resultado sai
                <div className="lg:col-span-2">
                  <FixedExpensesCard />
                </div>
              ) : (
                <>
                  <PartialResultCard
                    totalIncome={slice?.totalIncome ?? null}
                    totalExpenses={slice?.totalExpenses ?? 0}
                    partialResult={slice?.partialResult ?? null}
                    cardBillPayments={
                      scope === 'bank' ? (overview?.balances.cardBillPayments ?? 0) : 0
                    }
                    isLoading={isLoading}
                  />
                  <FixedExpensesCard />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
