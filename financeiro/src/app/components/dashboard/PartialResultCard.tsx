'use client';

import { Info, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';

interface PartialResultCardProps {
  /** null quando o escopo não tem receita (cartão) — diferente de zero */
  totalIncome: number | null;
  totalExpenses: number;
  partialResult: number | null;
  previousMonthResult?: number;
  /** Fatura quitada no período. Não é consumo novo, mas some do saldo. */
  cardBillPayments?: number;
  isLoading: boolean;
}

export function PartialResultCard({
  totalIncome,
  totalExpenses,
  partialResult,
  previousMonthResult = 0,
  cardBillPayments = 0,
  isLoading,
}: PartialResultCardProps) {
  if (isLoading) return <SkeletonCard />;

  // Sem receita não existe "sobrou": o card vira um resumo de gasto.
  const hasIncome = totalIncome !== null;
  const result = partialResult ?? -totalExpenses;

  const variation =
    previousMonthResult !== 0
      ? ((result - previousMonthResult) / Math.abs(previousMonthResult)) * 100
      : 0;

  const isPositive = result >= 0;

  const consumedPercentage =
    hasIncome && totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Limita a barra visualmente a no máximo 100%
  const barWidth = Math.min(100, Math.max(0, consumedPercentage));

  // Fica vermelha se você gastou mais do que ganhou, ou azul se está dentro do orçamento
  const barColor = consumedPercentage > 100 ? '#f85149' : '#58a6ff';

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-help"
          title="Diferença entre todas as receitas e despesas registradas no mês atual."
        >
          <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
            Resultado Parcial
          </span>
          <Info size={13} className="text-[#8b949e]" />
        </div>
        <Link href="/transactions" className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline">
          fluxo de caixa <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Value */}
      <p
        className={`text-3xl font-bold ${
          hasIncome ? (isPositive ? 'text-[#3fb950]' : 'text-[#f85149]') : 'text-[#e6edf3]'
        }`}
      >
        {formatCurrency(hasIncome ? result : totalExpenses)}
      </p>

      {/* Variation */}
      {previousMonthResult !== 0 && (
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              variation >= 0
                ? 'bg-[#3fb950]/20 text-[#3fb950]'
                : 'bg-[#f85149]/20 text-[#f85149]'
            }`}
          >
            {variation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {formatPercentage(variation)}
          </span>
          <span className="text-[#8b949e] text-xs">
            vs {formatCurrency(previousMonthResult)} mês anterior
          </span>
        </div>
      )}

      {/* Barra de renda consumida — só existe onde há receita */}
      {hasIncome && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Renda consumida</span>
            <span className="font-medium text-[#e6edf3]">
              {totalIncome > 0 ? `${consumedPercentage.toFixed(0)}%` : '---'}
            </span>
          </div>
          <div className="rounded-full overflow-hidden h-2 bg-[#21262d]">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${barWidth}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-4 pt-1 ${hasIncome ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {hasIncome && (
          <div>
            <p className="text-[#8b949e] text-xs mb-1">Receita</p>
            <p className="text-[#e6edf3] text-sm font-semibold">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        )}
        <div>
          <p className="text-[#8b949e] text-xs mb-1">Gasto</p>
          <p className="text-[#e6edf3] text-sm font-semibold">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        {hasIncome && (
          <div>
            <p className="text-[#8b949e] text-xs mb-1">Balanço</p>
            <p
              className={`text-sm font-semibold ${isPositive ? 'text-[#3fb950]' : 'text-[#f85149]'}`}
            >
              {isPositive ? 'Positivo' : 'Alerta'}
            </p>
          </div>
        )}
      </div>

      {/* O pagamento da fatura sai da conta mas não é consumo novo — sem esta
          nota, o gasto do mês parece baixo demais para quem olha o extrato. */}
      {cardBillPayments > 0 && (
        <p className="text-[#8b949e] text-[11px] pt-2 border-t border-[#21262d]">
          Pagamento de fatura de {formatCurrency(cardBillPayments)} não entra aqui — as compras
          já aparecem no cartão.
        </p>
      )}
    </div>
  );
}