'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useDashboardData } from '@/app/hooks/useDashboardData';
import { useItems } from '@/app/hooks/useItems';
import { TransactionTable } from '@/app/components/transactions/TransactionTable';

export default function TransactionsPage() {
  const { allTransactions, allAccounts, isLoading } = useDashboardData();
  const { items } = useItems();
  const [page, setPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const pageSize = 50;

  // filter transactions by selected account before calculating pagination
  const filteredTransactions = selectedAccountId
    ? allTransactions.filter((t) => t.account_id === selectedAccountId)
    : allTransactions;

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginated = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <ArrowUpDown size={18} className="text-[#8b949e]" />
          <h1 className="text-[#e6edf3] font-semibold text-base">Transações</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* account selector */}
        <div className="mb-4">
          <label className="text-sm text-[#8b949e] mr-2">Conta:</label>
          <select
            value={selectedAccountId}
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setPage(1); // reset paging when filter changes
            }}
            className="pl-3 pr-8 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm focus:border-[#58a6ff]"
          >
            <option value="">Todas contas</option>
            {allAccounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.number ? `${a.name} • ${a.number}` : a.name}
              </option>
            ))}
          </select>
        </div>

        <TransactionTable
          transactions={paginated}
          accounts={allAccounts}
          items={items}
          isLoading={isLoading}
          totalRecords={filteredTransactions.length}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
