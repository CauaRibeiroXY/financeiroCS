'use client';

import { CalendarDays, CreditCard, Landmark, Layers, Receipt } from 'lucide-react';
import type { CreditMode, OverviewScope } from '@/app/lib/services/overview';

interface OverviewFiltersProps {
  scope: OverviewScope;
  onScopeChange: (scope: OverviewScope) => void;
  creditMode: CreditMode;
  onCreditModeChange: (mode: CreditMode) => void;
}

const SCOPES: Array<{ value: OverviewScope; label: string; icon: React.ReactNode }> = [
  { value: 'all', label: 'Tudo', icon: <Layers size={13} /> },
  { value: 'bank', label: 'Conta corrente', icon: <Landmark size={13} /> },
  { value: 'credit', label: 'Cartão', icon: <CreditCard size={13} /> },
];

const MODES: Array<{ value: CreditMode; label: string; icon: React.ReactNode; hint: string }> = [
  {
    value: 'month',
    label: 'Mês',
    icon: <CalendarDays size={13} />,
    hint: 'Compras feitas dentro do mês',
  },
  {
    value: 'cycle',
    label: 'Fatura',
    icon: <Receipt size={13} />,
    hint: 'Compras que entram na fatura que vence no mês',
  },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; icon: React.ReactNode; hint?: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-[#30363d] overflow-hidden">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          title={option.hint}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            value === option.value
              ? 'bg-[#238636] text-white'
              : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function OverviewFilters({
  scope,
  onScopeChange,
  creditMode,
  onCreditModeChange,
}: OverviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented value={scope} options={SCOPES} onChange={onScopeChange} />

      {/* Ciclo de fatura só existe em cartão — não faz sentido em conta corrente */}
      {scope === 'credit' && (
        <Segmented value={creditMode} options={MODES} onChange={onCreditModeChange} />
      )}
    </div>
  );
}
