/**
 * Example: Complete Component using fetchAllTransactions with Pluggy Pagination
 * 
 * This component demonstrates:
 * - Using the useAllTransactions hook
 * - Displaying paginated transactions
 * - Manual refresh functionality
 * - Error handling
 */

'use client';

import { useAllTransactions } from '@/app/hooks/useAllTransactions';
import { useState } from 'react';
import type { TransactionRecord } from '@/app/types/pluggy';

interface TransactionListProps {
  accountId: string;
  initialFrom?: string;
  initialTo?: string;
}

export function AllTransactionsExample({
  accountId,
  initialFrom,
  initialTo,
}: TransactionListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Fetch all transactions with automatic pagination
  const {
    transactions,
    totalRecords,
    dateRange,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllTransactions(accountId, initialFrom, initialTo);

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return Math.abs(b.amount) - Math.abs(a.amount);
  });

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900">Error loading transactions</h3>
        <p className="text-red-700 text-sm mt-1">{error?.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 animate-pulse">
          Loading all transactions with automatic pagination...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {totalRecords} transactions
            {dateRange && (
              <span>
                {' '}
                from {dateRange.from} to {dateRange.to}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Transactions list */}
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No transactions found for the selected date range
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Description</th>
                <th className="px-4 py-2 text-left font-semibold">Amount</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedTransactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-gray-900 max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'CREDIT' ? '+' : '-'}
                    {Math.abs(tx.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{tx.type}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.status === 'POSTED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tx.status || 'POSTED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
