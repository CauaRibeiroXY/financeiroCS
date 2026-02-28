'use client';

import { Wallet, CreditCard, Building2, Trash2 } from 'lucide-react';
import { mutate } from 'swr';
import { useDashboardData } from '@/app/hooks/useDashboardData';
import { useItems } from '@/app/hooks/useItems';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import type { AccountRecord, PluggyItemRecord } from '@/app/types/pluggy';
import { cn } from '@/app/lib/utils/cn';

function AccountCard({
  account,
  item,
}: {
  account: AccountRecord;
  item?: PluggyItemRecord;
}) {
  const isCredit = account.type === 'CREDIT';
  const bgColor = item?.primary_color || '#58a6ff';

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden"
            style={{ background: bgColor }}
          >
            {item?.connector_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.connector_image_url}
                alt={item.connector_name || 'Bank'}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              (item?.connector_name || account.name).slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-[#e6edf3] text-sm font-semibold">
              {account.marketing_name || account.name}
            </p>
            <p className="text-[#8b949e] text-xs">
              {item?.connector_name || 'Instituição'} •{' '}
              {account.number ? `***${account.number.slice(-4)}` : account.subtype || account.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              isCredit
                ? 'bg-[#d29922]/20 text-[#d29922]'
                : 'bg-[#3fb950]/20 text-[#3fb950]'
            )}
          >
            {isCredit ? 'Crédito' : account.type === 'BANK' ? 'Corrente' : 'Pagamento'}
          </span>
          <button
            type="button"
            aria-label="Remover conta"
            onClick={async () => {
              if (!confirm('Remover esta conta? Esta ação não pode ser desfeita.')) return;
              try {
                const res = await fetch(`/api/accounts?accountId=${account.account_id}`, {
                  method: 'DELETE',
                });
                if (!res.ok) throw new Error('Failed to delete');
                // Revalidate accounts for this item
                mutate(`/api/accounts?itemId=${account.item_id}&pageSize=200`);
                mutate(`/api/accounts?itemId=${account.item_id}`);
              } catch (err) {
                console.error('Error deleting account:', err);
                alert('Erro ao remover conta');
              }
            }}
            className="p-1 rounded hover:bg-[#21262d]"
          >
            <Trash2 size={16} className="text-[#ff6b6b]" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div>
        <p className="text-[#8b949e] text-xs mb-1">
          {isCredit ? 'Fatura atual' : 'Saldo disponível'}
        </p>
        <p className="text-[#e6edf3] text-2xl font-bold">
          {formatCurrency(account.balance ?? 0)}
        </p>
      </div>

      {/* Credit card specific info */}
      {isCredit && account.credit_data && (
        <div className="pt-2 border-t border-[#30363d] grid grid-cols-2 gap-3">
          <div>
            <p className="text-[#8b949e] text-xs mb-1">Limite disponível</p>
            <p className="text-[#3fb950] text-sm font-medium">
              {formatCurrency(account.credit_data.available_credit_limit ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-[#8b949e] text-xs mb-1">Limite total</p>
            <p className="text-[#e6edf3] text-sm font-medium">
              {formatCurrency(account.credit_data.credit_limit ?? 0)}
            </p>
          </div>
          {account.credit_data.balance_due_date && (
            <div className="col-span-2">
              <p className="text-[#8b949e] text-xs mb-1">Vencimento</p>
              <p className="text-[#e6edf3] text-sm">
                {new Date(account.credit_data.balance_due_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#21262d]">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            item?.status === 'UPDATED' ? 'bg-[#3fb950]' : 'bg-[#d29922]'
          )}
        />
        <p className="text-[#8b949e] text-xs">
          {item?.status === 'UPDATED' ? 'Sincronizado' : 'Atualizando...'}
        </p>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { allAccounts, isLoading } = useDashboardData();
  const { items } = useItems();

  const bankAccounts = allAccounts.filter(
    (a) => a.type === 'BANK' || a.type === 'PAYMENT_ACCOUNT'
  );
  const creditAccounts = allAccounts.filter((a) => a.type === 'CREDIT');

  const totalBalance = bankAccounts.reduce((s, a) => s + (a.balance ?? 0), 0);
  const totalCredit = creditAccounts.reduce(
    (s, a) => s + (a.credit_data?.available_credit_limit ?? 0),
    0
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <Wallet size={18} className="text-[#8b949e]" />
          <h1 className="text-[#e6edf3] font-semibold text-base">Contas</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#3fb950]/20 flex items-center justify-center">
              <Building2 size={20} className="text-[#3fb950]" />
            </div>
            <div>
              <p className="text-[#8b949e] text-xs mb-1">Total em conta</p>
              <p className="text-[#e6edf3] text-xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#d29922]/20 flex items-center justify-center">
              <CreditCard size={20} className="text-[#d29922]" />
            </div>
            <div>
              <p className="text-[#8b949e] text-xs mb-1">Crédito disponível</p>
              <p className="text-[#e6edf3] text-xl font-bold">{formatCurrency(totalCredit)}</p>
            </div>
          </div>
        </div>

        {/* Bank accounts */}
        {(isLoading || bankAccounts.length > 0) && (
          <section className="mb-6">
            <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-3">
              Contas Bancárias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                : bankAccounts.map((account) => (
                    <AccountCard
                      key={account.account_id}
                      account={account}
                      item={items.find((i) => i.item_id === account.item_id)}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Credit cards */}
        {(isLoading || creditAccounts.length > 0) && (
          <section>
            <h2 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-3">
              Cartões de Crédito
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 1 }).map((_, i) => <SkeletonCard key={i} />)
                : creditAccounts.map((account) => (
                    <AccountCard
                      key={account.account_id}
                      account={account}
                      item={items.find((i) => i.item_id === account.item_id)}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!isLoading && allAccounts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-16 h-16 rounded-full bg-[#21262d] flex items-center justify-center">
              <Wallet size={32} className="text-[#58a6ff]" />
            </div>
            <h2 className="text-[#e6edf3] text-xl font-semibold">
              Nenhuma conta encontrada
            </h2>
            <p className="text-[#8b949e] text-sm text-center max-w-sm">
              Conecte sua conta bancária para visualizar seus dados financeiros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
