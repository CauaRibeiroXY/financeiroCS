'use client';

import { LayoutDashboard, Eye } from 'lucide-react';
import { useDashboardData } from '@/app/hooks/useDashboardData';
import { SpendingPaceCard } from '@/app/components/dashboard/SpendingPaceCard';
import { PatrimonyCard } from '@/app/components/dashboard/PatrimonyCard';
import { PartialResultCard } from '@/app/components/dashboard/PartialResultCard';
import { CategoryList } from '@/app/components/dashboard/CategoryList';
import { CreditCardBillCard } from '@/app/components/dashboard/CreditCardBillCard';
import { useItems } from '@/app/hooks/useItems';

export default function DashboardPage() {
  const {
    patrimony,
    totalIncome,
    totalExpenses,
    partialResult,
    categories,
    spendingByDay,
    allBills,
    allAccounts,
    isLoading,
  } = useDashboardData();

  const { items } = useItems();

  // Compute previous month spending from spendingByDay last day
  const prevMonthExpenses = spendingByDay[spendingByDay.length - 1]?.previous ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-[#8b949e]" />
          <h1 className="text-[#e6edf3] font-semibold text-base">Dashboard</h1>
        </div>
        <button className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
          <Eye size={18} />
        </button>
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

        {/* Grid layout */}
        {(isLoading || items.length > 0) && (
          <>
            {/* Top row: Ritmo de Gastos + Patrimônio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <SpendingPaceCard
                currentExpenses={totalExpenses}
                previousExpenses={prevMonthExpenses}
                spendingByDay={spendingByDay}
                isLoading={isLoading}
              />
              <PatrimonyCard
                patrimony={patrimony}
                isLoading={isLoading}
                hasData={!isLoading && items.length > 0}
              />
            </div>

            {/* Middle row: Faturas + Principais Categorias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <CreditCardBillCard
                bills={allBills}
                accounts={allAccounts}
                isLoading={isLoading}
              />
              <CategoryList
                categories={categories}
                isLoading={isLoading}
              />
            </div>

            {/* Bottom row: Resultado Parcial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PartialResultCard
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                partialResult={partialResult}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
