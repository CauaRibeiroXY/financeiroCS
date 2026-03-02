'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useItems } from './useItems';
import type { AccountRecord, TransactionRecord, CreditCardBillRecord } from '@/app/types/pluggy';

interface AccountsResponse {
  success: boolean;
  data: { results: AccountRecord[] };
}

interface TransactionsResponse {
  success: boolean;
  data: { results: TransactionRecord[] };
}

interface BillsResponse {
  success: boolean;
  data: { results: CreditCardBillRecord[] };
}

export interface CategoryData {
  name: string;
  current: number;
  previous: number;
  color: string;
}

export interface DashboardData {
  patrimony: number;
  totalIncome: number;
  totalExpenses: number;
  partialResult: number;
  allTransactions: TransactionRecord[];
  allAccounts: AccountRecord[];
  categories: CategoryData[];
  spendingByDay: { day: number; current: number; previous: number }[];
  allBills: CreditCardBillRecord[];
  isLoading: boolean;
  isError: boolean;
}

// Internal hook to fetch accounts for multiple items in parallel
function useAllAccountsForItems(itemIds: string[]) {
  const urls = itemIds.map((id) => `/api/accounts?itemId=${id}&pageSize=200`);
  // Build a stable key
  const key = itemIds.length > 0 ? urls.join('|') : null;

  const { data, error, isLoading } = useSWR<AccountsResponse[]>(
    key,
    async () => {
      const results = await Promise.all(
        urls.map((url) =>
          fetch(url)
            .then((r) => r.json())
            .catch(() => ({ success: false, data: { results: [] } }))
        )
      );
      return results;
    }
  );

  const allAccounts: AccountRecord[] = useMemo(() => {
    if (!data) return [];
    return data.flatMap((r) => r?.data?.results ?? []);
  }, [data]);

  return { allAccounts, isLoading, isError: !!error };
}

// Internal hook to fetch transactions for multiple accounts in parallel
function useAllTransactionsForAccounts(accountIds: string[]) {
  const key =
    accountIds.length > 0
      ? accountIds.map((id) => `/api/transactions?accountId=${id}&pageSize=200`).join('|')
      : null;

  const { data, error, isLoading } = useSWR<TransactionsResponse[]>(
    key,
    async () => {
      const results = await Promise.all(
        accountIds.map((id) =>
          fetch(`/api/transactions?accountId=${id}&pageSize=200`)
            .then((r) => r.json())
            .catch(() => ({ success: false, data: { results: [] } }))
        )
      );
      return results;
    }
  );

  const allTransactions: TransactionRecord[] = useMemo(() => {
    if (!data) return [];
    return data.flatMap((r) => r?.data?.results ?? []);
  }, [data]);

  return { allTransactions, isLoading, isError: !!error };
}

// Internal hook to fetch bills for multiple accounts in parallel
function useAllBillsForAccounts(accountIds: string[]) {
  const key =
    accountIds.length > 0
      ? accountIds.map((id) => `/api/bills?accountId=${id}&pageSize=200`).join('|')
      : null;

  const { data, error, isLoading } = useSWR<BillsResponse[]>(
    key,
    async () => {
      const results = await Promise.all(
        accountIds.map((id) =>
          fetch(`/api/bills?accountId=${id}&pageSize=200`)
            .then((r) => r.json())
            .catch(() => ({ success: false, data: { results: [] } }))
        )
      );
      return results;
    }
  );

  const allBills: CreditCardBillRecord[] = useMemo(() => {
    if (!data) return [];
    return data.flatMap((r) => r?.data?.results ?? []);
  }, [data]);

  return { allBills, isLoading, isError: !!error };
}

export function useDashboardData(): DashboardData {
  const { items, isLoading: itemsLoading, isError: itemsError } = useItems();

  const itemIds = useMemo(() => items.map((i) => i.item_id), [items]);

  const {
    allAccounts,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAllAccountsForItems(itemIds);

  const accountIds = useMemo(
    () => allAccounts.map((a) => a.account_id),
    [allAccounts]
  );

  const {
    allTransactions,
    isLoading: txLoading,
    isError: txError,
  } = useAllTransactionsForAccounts(accountIds);

  const creditAccountIds = useMemo(
    () => allAccounts.filter(a => a.type === 'CREDIT').map((a) => a.account_id),
    [allAccounts]
  );

  const {
    allBills,
    isLoading: billsLoading,
    isError: billsError,
  } = useAllBillsForAccounts(creditAccountIds);

  const isLoading = itemsLoading || accountsLoading || txLoading || billsLoading;
  const isError = itemsError || accountsError || txError || billsError;

  // Compute aggregated data
  const patrimony = useMemo(
    () =>
      allAccounts
        .filter((a) => a.type === 'BANK' || a.type === 'PAYMENT_ACCOUNT')
        .reduce((sum, a) => sum + (a.balance ?? 0), 0),
    [allAccounts]
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTx = useMemo(
    () =>
      allTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [allTransactions, currentMonth, currentYear]
  );

  const prevMonthTx = useMemo(
    () =>
      allTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }),
    [allTransactions, prevMonth, prevYear]
  );

  const totalIncome = useMemo(
    () =>
      currentMonthTx
        .filter((t) => t.type === 'CREDIT')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [currentMonthTx]
  );

  const totalExpenses = useMemo(
    () =>
      currentMonthTx
        .filter((t) => t.type === 'DEBIT')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [currentMonthTx]
  );

  const partialResult = totalIncome - totalExpenses;

  // Categories aggregation
  const categories: CategoryData[] = useMemo(() => {
    const categoryTranslationMap: Record<string, string> = {
      'Houseware': 'Utensílios domésticos',
      'Food & Dining': 'Alimentação',
      'Restaurants': 'Alimentação',
      'Groceries': 'Alimentação',
      'Telecommunications': 'Telecomunicações',
      'Internet': 'Telecomunicações',
      'Services': 'Serviços',
      'Health & Fitness': 'Saúde',
      'Recreation': 'Lazer',
      'Entertainment': 'Lazer',
      'Automotive': 'Automotivo',
      'Gas Station': 'Postos de combustível',
      'Gas stations': 'Postos de combustível',
      'Parking': 'Automotivo',
      'Taxes': 'Impostos',
      'Education': 'Educação',
      'Investments': 'Investimentos',
      'Transfers': 'Transferência - PIX',
      'Transfer - PIX': 'Transferência - PIX',
      'Transfer': 'Transferência - PIX',
      'Insurance': 'Seguros',
      'Loans': 'Empréstimos',
      'Fees': 'Taxas',
      'Personal Care': 'Saúde',
      'Travel': 'Lazer',
      'Shopping': 'Utensílios domésticos',
      'Food delivery': 'Alimentação',
      'Other': 'Outros'
    };

    const translateCategory = (cat: string | undefined | null) => {
      if (!cat) return 'Outros';
      return categoryTranslationMap[cat] || cat;
    };

    const catMap: Record<string, { current: number; previous: number }> = {};

    currentMonthTx
      .filter((t) => t.type === 'DEBIT')
      .forEach((t) => {
        const cat = translateCategory(t.category);
        if (!catMap[cat]) catMap[cat] = { current: 0, previous: 0 };
        catMap[cat].current += Math.abs(t.amount);
      });

    prevMonthTx
      .filter((t) => t.type === 'DEBIT')
      .forEach((t) => {
        const cat = translateCategory(t.category);
        if (!catMap[cat]) catMap[cat] = { current: 0, previous: 0 };
        catMap[cat].previous += Math.abs(t.amount);
      });

    const colors: Record<string, string> = {
      Serviços: '#3b82f6',
      'Utensílios domésticos': '#f97316',
      'Postos de combustível': '#f97316',
      Telecomunicações: '#06b6d4',
      Automotivo: '#f97316',
      'Energia elétrica': '#eab308',
      'Transferência - PIX': '#8b5cf6',
      Internet: '#06b6d4',
      Água: '#3b82f6',
      Alimentação: '#10b981',
      Saúde: '#ef4444',
      Lazer: '#ec4899',
      Educação: '#6366f1',
      Investimentos: '#10b981',
      'Juros e dividendos': '#10b981',
      Outros: '#6b7280',
    };

    return Object.entries(catMap)
      .map(([name, vals]) => ({
        name,
        current: vals.current,
        previous: vals.previous,
        color: colors[name] || '#6b7280',
      }))
      .sort((a, b) => b.current !== a.current ? b.current - a.current : b.previous - a.previous)
      .slice(0, 10);
  }, [currentMonthTx, prevMonthTx]);

  // Spending by day (for chart)
  const spendingByDay = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const result = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      current: 0,
      previous: 0,
    }));

    let cumCurrent = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayTx = currentMonthTx.filter(
        (t) => new Date(t.date).getDate() === d && t.type === 'DEBIT'
      );
      cumCurrent += dayTx.reduce((s, t) => s + Math.abs(t.amount), 0);
      result[d - 1].current = cumCurrent;
    }

    let cumPrev = 0;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    for (let d = 1; d <= Math.min(daysInMonth, daysInPrevMonth); d++) {
      const dayTx = prevMonthTx.filter(
        (t) => new Date(t.date).getDate() === d && t.type === 'DEBIT'
      );
      cumPrev += dayTx.reduce((s, t) => s + Math.abs(t.amount), 0);
      result[d - 1].previous = cumPrev;
    }

    return result;
  }, [currentMonthTx, prevMonthTx, currentMonth, currentYear, prevMonth, prevYear]);

  return {
    patrimony,
    totalIncome,
    totalExpenses,
    partialResult,
    allTransactions,
    allAccounts,
    categories,
    spendingByDay,
    allBills,
    isLoading,
    isError,
  };
}
