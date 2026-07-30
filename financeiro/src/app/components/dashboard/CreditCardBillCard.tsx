'use client';

import { CreditCard, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import type { OverviewCard } from '@/app/lib/services/overview';

interface CreditCardBillCardProps {
  /** Já filtrado, desduplicado e resolvido no servidor */
  cards: OverviewCard[];
  availableCredit: number | null;
  /** No escopo cartão, mostra o total calculado do ciclo ao lado do oficial */
  showCycleTotal?: boolean;
  isLoading: boolean;
}

function formatDay(isoDate: string | null): string {
  if (!isoDate) return '--';
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

export function CreditCardBillCard({
  cards,
  availableCredit,
  showCycleTotal = false,
  isLoading,
}: CreditCardBillCardProps) {
  if (isLoading) return <SkeletonCard />;

  const withBill = cards.filter((c) => c.billTotal !== null);
  const billsTotal = withBill.reduce((sum, c) => sum + (c.billTotal ?? 0), 0);
  const cycleTotal = cards.reduce((sum, c) => sum + c.cycleTotal, 0);

  // Sem fatura fechada, o melhor número disponível é a soma das compras do ciclo
  const headline = withBill.length > 0 ? billsTotal : cycleTotal;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
            Faturas de Cartão
          </span>
          <CreditCard size={13} className="text-[#8b949e]" />
        </div>
        <Link
          href="/accounts"
          className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline"
        >
          Ver contas <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="flex flex-col">
        <p className="text-[#e6edf3] text-3xl font-bold leading-none">
          {formatCurrency(headline)}
        </p>
        <p className="text-[#8b949e] text-[11px] mt-1">
          {withBill.length > 0 ? 'total das faturas do mês' : 'compras do ciclo — fatura ainda aberta'}
        </p>

        {showCycleTotal && withBill.length > 0 && (
          // Os dois números divergem de propósito: a fatura inclui encargos,
          // IOF e saldo anterior, que não são consumo do mês.
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[#8b949e] text-xs">Compras do ciclo:</span>
            <span className="text-[#e6edf3] text-sm font-medium">
              {formatCurrency(cycleTotal)}
            </span>
          </div>
        )}

        {!showCycleTotal && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[#8b949e] text-xs">Limite disponível:</span>
            <span className="text-[#3fb950] text-sm font-medium">
              {availableCredit !== null ? formatCurrency(availableCredit) : '—'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {cards.length === 0 ? (
          <p className="text-[#8b949e] text-xs text-center py-2">
            Nenhuma fatura encontrada.
          </p>
        ) : (
          cards.slice(0, 3).map((card) => (
            <div
              key={card.accountId}
              className="flex items-center justify-between text-sm border-b border-[#21262d] pb-2 last:border-0 last:pb-0"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[#e6edf3] truncate max-w-[150px]">{card.name}</span>
                <span className="text-[#8b949e] text-xs">
                  {card.billDueDate
                    ? `Vence: ${formatDay(card.billDueDate)}`
                    : card.dueDay
                      ? `Vence dia ${card.dueDay}`
                      : 'Vencimento não informado'}
                </span>
              </div>
              <span className="text-[#e6edf3] font-medium">
                {formatCurrency(card.billTotal ?? card.cycleTotal)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
