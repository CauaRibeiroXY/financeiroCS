'use client';

import { CreditCard, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import type { OverviewCard } from '@/app/lib/services/overview';

interface CreditLimitCardProps {
  cards: OverviewCard[];
  /** null quando nenhum conector informou o limite — não é o mesmo que zero */
  creditLimit: number | null;
  availableCredit: number | null;
  isLoading: boolean;
}

/** Verde até 70%, amarelo até 90%, vermelho acima. */
function usageColor(ratio: number): string {
  if (ratio >= 0.9) return '#f85149';
  if (ratio >= 0.7) return '#d29922';
  return '#3fb950';
}

export function CreditLimitCard({
  cards,
  creditLimit,
  availableCredit,
  isLoading,
}: CreditLimitCardProps) {
  if (isLoading) return <SkeletonCard />;

  const known = creditLimit !== null && availableCredit !== null && creditLimit > 0;
  const used = known ? creditLimit - availableCredit : null;
  const ratio = known && used !== null ? Math.min(1, Math.max(0, used / creditLimit)) : 0;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
            Limite do Cartão
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

      <div>
        <p className="text-[#8b949e] text-xs">Disponível</p>
        <p className="text-[#e6edf3] text-3xl font-bold leading-none mt-1">
          {availableCredit !== null ? formatCurrency(availableCredit) : '—'}
        </p>
      </div>

      {known ? (
        <>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8b949e]">Utilizado</span>
              <span className="font-medium text-[#e6edf3]">
                {Math.round(ratio * 100)}% de {formatCurrency(creditLimit)}
              </span>
            </div>
            <div className="rounded-full overflow-hidden h-2 bg-[#21262d]">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${ratio * 100}%`, backgroundColor: usageColor(ratio) }}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="text-[#8b949e] text-xs">
          O banco não informou o limite total deste cartão.
        </p>
      )}

      {/* Por cartão */}
      <div className="flex flex-col gap-2 mt-1">
        {cards.length === 0 ? (
          <p className="text-[#8b949e] text-xs text-center py-2">
            Nenhum cartão conectado.
          </p>
        ) : (
          cards.map((card) => (
            <div
              key={card.accountId}
              className="flex items-center justify-between text-sm border-b border-[#21262d] pb-2 last:border-0 last:pb-0"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[#e6edf3] text-xs truncate max-w-[160px]">{card.name}</span>
                <span className="text-[#8b949e] text-[11px]">
                  {card.dueDay ? `Vence dia ${card.dueDay}` : 'Vencimento não informado'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#e6edf3] text-xs font-medium">
                  {card.availableCredit !== null ? formatCurrency(card.availableCredit) : '—'}
                </p>
                <p className="text-[#8b949e] text-[10px]">disponível</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
