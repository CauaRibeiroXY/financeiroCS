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
  const pageSize = 50;

  const totalPages = Math.ceil(allTransactions.length / pageSize);
  const paginated = allTransactions.slice((page - 1) * pageSize, page * pageSize);

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
        <TransactionTable
          transactions={paginated}
          accounts={allAccounts}
          items={items}
          isLoading={isLoading}
          totalRecords={allTransactions.length}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
