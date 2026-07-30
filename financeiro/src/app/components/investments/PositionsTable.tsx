'use client';

import { useState } from 'react';
import { ArrowUpDown, ShieldCheck, History, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils/format';

export type RateBasis = 'contracted' | 'historical' | 'assumed';

export interface Position {
  id: string;
  name: string;
  type: string;
  institution: string;
  value: number;
  invested: number | null;
  profit: number | null;
  profitRate: number | null;
  withdrawable: number | null;
  rateLabel: string | null;
  annualRate: number;
  rateBasis: RateBasis;
  dueDate: string | null;
  monthsToDue: number | null;
  share: number;
  color: string;
}

type SortKey = 'value' | 'profit' | 'rate' | 'due';

const BASIS_META: Record<RateBasis, { label: string; hint: string; icon: React.ReactNode; className: string }> = {
  contracted: {
    label: 'Contratada',
    hint: 'Taxa do próprio papel',
    icon: <ShieldCheck size={10} />,
    className: 'bg-[#3fb950]/10 text-[#3fb950]',
  },
  historical: {
    label: 'Histórica',
    hint: 'Retorno dos últimos 12 meses',
    icon: <History size={10} />,
    className: 'bg-[#e3b341]/10 text-[#e3b341]',
  },
  assumed: {
    label: 'Presumida',
    hint: 'Premissa da classe de ativo',
    icon: <HelpCircle size={10} />,
    className: 'bg-[#f0883e]/10 text-[#f0883e]',
  },
};

function formatDue(position: Position) {
  if (!position.dueDate) return 'Sem vencimento';
  const [year, month, day] = position.dueDate.slice(0, 10).split('-');
  const date = `${day}/${month}/${year}`;
  if (position.monthsToDue === null) return date;
  if (position.monthsToDue <= 0) return `${date} · vencido`;
  return `${date} · ${position.monthsToDue}m`;
}

export function PositionsTable({ positions }: { positions: Position[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('value');

  const sorted = [...positions].sort((a, b) => {
    switch (sortKey) {
      case 'profit':
        return (b.profit ?? -Infinity) - (a.profit ?? -Infinity);
      case 'rate':
        return b.annualRate - a.annualRate;
      case 'due':
        // Sem vencimento vai para o fim
        return (a.monthsToDue ?? Number.MAX_SAFE_INTEGER) - (b.monthsToDue ?? Number.MAX_SAFE_INTEGER);
      default:
        return b.value - a.value;
    }
  });

  const columns: Array<{ key: SortKey; label: string }> = [
    { key: 'value', label: 'Valor' },
    { key: 'profit', label: 'Resultado' },
    { key: 'rate', label: 'Taxa' },
    { key: 'due', label: 'Vencimento' },
  ];

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-[#e6edf3]">Posições</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Onde o dinheiro está e como cada papel remunera
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ArrowUpDown size={12} className="text-[#8b949e]" />
          {columns.map((column) => (
            <button
              key={column.key}
              onClick={() => setSortKey(column.key)}
              className={`rounded px-2 py-1 text-[11px] transition-colors ${
                sortKey === column.key
                  ? 'bg-[#21262d] text-[#58a6ff] font-medium'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {column.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-[#8b949e] text-xs text-center py-12">
          Nenhum investimento encontrado. Conecte uma instituição ou rode a sincronização.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#8b949e] border-b border-[#21262d]">
                <th className="text-left font-normal px-5 py-2">Investimento</th>
                <th className="text-left font-normal px-3 py-2">Remuneração</th>
                <th className="text-right font-normal px-3 py-2">Aplicado</th>
                <th className="text-right font-normal px-3 py-2">Resultado</th>
                <th className="text-left font-normal px-3 py-2">Vencimento</th>
                <th className="text-right font-normal px-5 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((position) => {
                const basis = BASIS_META[position.rateBasis];
                const profitUp = (position.profit ?? 0) >= 0;

                return (
                  <tr
                    key={position.id}
                    className="border-b border-[#21262d] last:border-0 hover:bg-[#1c2128] transition-colors"
                  >
                    <td className="px-5 py-3 max-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: position.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-[#e6edf3] font-medium truncate">{position.name}</p>
                          <p className="text-[10px] text-[#8b949e] truncate">
                            {position.type} · {position.institution}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[#e6edf3]">
                          {position.rateLabel ?? `~${(position.annualRate * 100).toFixed(1).replace('.', ',')}% a.a.`}
                        </span>
                        <span
                          title={basis.hint}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] ${basis.className}`}
                        >
                          {basis.icon}
                          {basis.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right text-[#8b949e] tabular-nums">
                      {position.invested !== null ? formatCurrency(position.invested) : '--'}
                    </td>

                    <td className="px-3 py-3 text-right tabular-nums">
                      {position.profit !== null ? (
                        <div className="flex flex-col items-end">
                          <span className={profitUp ? 'text-[#3fb950]' : 'text-[#f85149]'}>
                            {formatCurrency(position.profit)}
                          </span>
                          {position.profitRate !== null && (
                            <span className="text-[10px] text-[#8b949e]">
                              {(position.profitRate * 100).toFixed(2).replace('.', ',')}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#8b949e]">--</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-[#8b949e] whitespace-nowrap">
                      {formatDue(position)}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <p className="text-[#e6edf3] font-semibold tabular-nums">
                        {formatCurrency(position.value)}
                      </p>
                      <p className="text-[10px] text-[#8b949e]">
                        {Math.round(position.share * 100)}% da carteira
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
