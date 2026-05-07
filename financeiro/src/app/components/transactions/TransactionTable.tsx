'use client';

import { useState, useMemo } from 'react';
import { useSWRConfig } from 'swr';
import { Search, MoreVertical, ArrowDownLeft, ArrowUpRight, ArrowUpDown, Edit2, Check, X, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor, getLocalLogo } from '@/app/lib/utils/format';
import { SkeletonTable } from '@/app/components/shared/Skeleton';
import type { TransactionRecord, PluggyItemRecord } from '@/app/types/pluggy';
import type { AccountRecord } from '@/app/types/pluggy';
import { useCategories } from '@/app/hooks/useCategories';
import { CategoryModal } from './CategoryModal';

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
  const name = account.marketing_name || account.name || item?.connector_name || 'Banco';
  const localLogo = getLocalLogo(account.marketing_name || account.name);
  const imageUrl = localLogo || account.icon_url || item?.connector_image_url;

  return (
    <div
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[10px] font-bold overflow-hidden"
      style={{ background: bgColor }}
      title={name}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain p-0.5 rounded-full bg-white"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextSibling) nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span
        className="w-full h-full flex items-center justify-center"
        style={{
          display: imageUrl ? 'none' : 'flex',
        }}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
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
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [syncingTxId, setSyncingTxId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { categories, addCategory } = useCategories();
  const { mutate } = useSWRConfig();

  const handleSaveCategory = async (tx: TransactionRecord) => {
    if (!selectedCategory) {
      setEditingTxId(null);
      return;
    }

    setSyncingTxId(tx.transaction_id);
    try {
      const res = await fetch('/api/transactions/sync-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: tx.id || tx.transaction_id,
          category_id: selectedCategory,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to sync category');
      }

      // Invalidate SWR cache for all transactions hooks to force refetch
      mutate(
        (key: any) => typeof key === 'string' && key.includes('/api/transactions?accountId='),
        undefined,
        { revalidate: true }
      );

      setEditingTxId(null);
    } catch (err) {
      console.error('Error syncing category:', err);
      alert('Erro ao alterar categoria.');
    } finally {
      setSyncingTxId(null);
    }
  };

  const handleCreateCategory = async (name: string) => {
    try {
      const result = await addCategory(name);
      if (result.success && result.data) {
        setSelectedCategory(result.data.id);
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao criar categoria.');
      throw error;
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((t) => {
      const catName = t.category_id
        ? categories.find((c) => c.id === t.category_id)?.name || t.category
        : t.category;

      return (
        t.description?.toLowerCase().includes(q) ||
        catName?.toLowerCase().includes(q)
      );
    });
  }, [transactions, search, categories]);

  // compute stats based on filtered list
  const totalDebit = useMemo(
    () =>
      filtered
        .filter((t) => t.type === 'DEBIT')
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [filtered]
  );

  const totalCredit = useMemo(
    () =>
      filtered
        .filter((t) => t.type === 'CREDIT')
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [filtered]
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
            className={`flex items-center gap-1 text-sm font-medium ${netBalance >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
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
                const displayCategory = tx.category_id
                  ? categories.find((c) => c.id === tx.category_id)?.name || tx.category
                  : tx.category;

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
                    <td className="py-3 px-4 min-w-[200px]">
                      {editingTxId === tx.transaction_id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedCategory}
                            onChange={(e) => {
                              if (e.target.value === 'new') {
                                setIsCategoryModalOpen(true);
                              } else {
                                setSelectedCategory(e.target.value);
                              }
                            }}
                            className="bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-xs rounded px-2 py-1 max-w-[120px] focus:outline-none focus:border-[#58a6ff]"
                          >
                            <option value="">Selecione...</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                            <option value="new" className="text-[#58a6ff] font-medium">+ Adicionar Nova Categoria</option>
                          </select>
                          <button
                            onClick={() => handleSaveCategory(tx)}
                            disabled={syncingTxId === tx.transaction_id}
                            className="text-[#3fb950] hover:bg-[#3fb950]/10 p-1 rounded transition-colors disabled:opacity-50"
                            title="Salvar"
                          >
                            {syncingTxId === tx.transaction_id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingTxId(null)}
                            disabled={syncingTxId === tx.transaction_id}
                            className="text-[#f85149] hover:bg-[#f85149]/10 p-1 rounded transition-colors disabled:opacity-50"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-2">
                          <CategoryBadge category={displayCategory} />
                          <button
                            onClick={() => {
                              setEditingTxId(tx.transaction_id);
                              setSelectedCategory('');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[#8b949e] hover:text-[#58a6ff] transition-opacity p-1"
                            title="Editar Categoria"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
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
                      className={`py-3 px-4 text-right text-sm font-semibold ${isCredit ? 'text-[#3fb950]' : 'text-[#e6edf3]'
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onConfirm={handleCreateCategory}
      />
    </div>
  );
}
