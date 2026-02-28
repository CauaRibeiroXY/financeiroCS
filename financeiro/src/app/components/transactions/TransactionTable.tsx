'use client';

import { useState, useMemo } from 'react';
import { Search, MoreVertical, ArrowDownLeft, ArrowUpRight, ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor } from '@/app/lib/utils/format';
import { SkeletonTable } from '@/app/components/shared/Skeleton';
import type { TransactionRecord, PluggyItemRecord } from '@/app/types/pluggy';
import type { AccountRecord } from '@/app/types/pluggy';

interface TransactionTableProps {
  transactions: TransactionRecord[];
  accounts: AccountRecord[];
  items: PluggyItemRecord[];
  isLoading: boolean;
  totalRecords?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function InstitutionBadge({
  account,
  items,
}: {
  account: AccountRecord | undefined;
  items: PluggyItemRecord[];
}) {
  if (!account) return <span className="text-[#8b949e] text-xs">--</span>;

  const item = items.find((i) => i.item_id === account.item_id);
  const bgColor = item?.primary_color || '#8b949e';
  const imageUrl = item?.connector_image_url;
  const name = item?.connector_name || 'Banco';

  return (
    <div
      className="inline-flex items-center justify-center w-12 h-6 rounded text-white text-[9px] font-bold overflow-hidden"
      style={{ background: bgColor }}
      title={name}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="w-full h-full object-contain p-0.5" />
      ) : (
        name.slice(0, 5)
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category?: string }) {
  const cat = category || 'Outros';
  const color = getCategoryColor(cat);

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        color,
        borderColor: `${color}40`,
        background: `${color}15`,
      }}
    >
      {cat}
    </span>
  );
}

export function TransactionTable({
  transactions,
  accounts,
  items,
  isLoading,
  totalRecords,
  page = 1,
  totalPages = 1,
  onPageChange,
}: TransactionTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const totalDebit = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'DEBIT')
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );

  const totalCredit = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'CREDIT')
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );

  const netBalance = totalCredit - totalDebit;

  if (isLoading) return <SkeletonTable rows={8} />;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-[#30363d] flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transações..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-[#8b949e] text-sm">
            📋 {totalRecords ?? filtered.length}
          </span>
          <span className="flex items-center gap-1 text-[#f85149] text-sm font-medium">
            <ArrowDownLeft size={14} />
            {formatCurrency(totalDebit)}
          </span>
          <span className="flex items-center gap-1 text-[#3fb950] text-sm font-medium">
            <ArrowUpRight size={14} />
            {formatCurrency(totalCredit)}
          </span>
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              netBalance >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
            }`}
          >
            <ArrowUpDown size={14} />
            {formatCurrency(netBalance)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="w-10 py-3 px-4" />
              <th className="py-3 px-4 text-left text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                Descrição
              </th>
              <th className="py-3 px-4 text-left text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                Categoria
              </th>
              <th className="py-3 px-4 text-left text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                Conta
              </th>
              <th className="py-3 px-4 text-left text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                N.º
              </th>
              <th className="py-3 px-4 text-left text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                Data ↓
              </th>
              <th className="py-3 px-4 text-right text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                Valor
              </th>
              <th className="w-10 py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#8b949e] text-sm">
                  {search ? 'Nenhuma transação encontrada.' : 'Sem transações para exibir.'}
                </td>
              </tr>
            ) : (
              filtered.map((tx, idx) => {
                const account = accounts.find((a) => a.account_id === tx.account_id);
                const isCredit = tx.type === 'CREDIT';

                return (
                  <tr
                    key={tx.transaction_id || idx}
                    className="border-b border-[#21262d] hover:bg-[#21262d]/40 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-[#8b949e] text-sm text-center">
                      {idx + 1}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4">
                      <p className="text-[#e6edf3] text-sm font-medium max-w-xs">
                        {tx.description || tx.description_raw || '—'}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <CategoryBadge category={tx.category} />
                    </td>

                    {/* Account (institution) */}
                    <td className="py-3 px-4">
                      <InstitutionBadge account={account} items={items} />
                    </td>

                    {/* Number */}
                    <td className="py-3 px-4 text-[#8b949e] text-xs">
                      {account?.number ? (
                        <span className="truncate max-w-[80px] block">{account.number}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-[#8b949e] text-sm whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-4 text-right text-sm font-semibold ${
                        isCredit ? 'text-[#3fb950]' : 'text-[#e6edf3]'
                      }`}
                    >
                      {isCredit ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <button className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#30363d]">
          <p className="text-[#8b949e] text-xs">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded border border-[#30363d] text-[#8b949e] text-xs hover:bg-[#21262d] disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded border border-[#30363d] text-[#8b949e] text-xs hover:bg-[#21262d] disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
