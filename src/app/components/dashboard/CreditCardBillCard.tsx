'use client';

import { CreditCard, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/app/lib/utils/format';
import { SkeletonCard } from '@/app/components/shared/Skeleton';
import type { CreditCardBillRecord, AccountRecord } from '@/app/types/pluggy';

interface CreditCardBillCardProps {
    bills: CreditCardBillRecord[];
    accounts: AccountRecord[];
    isLoading: boolean;
}

export function CreditCardBillCard({ bills, accounts, isLoading }: CreditCardBillCardProps) {
    if (isLoading) return <SkeletonCard />;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Find bills for the current or upcoming month
    const currentBills = bills.filter((b) => {
        if (!b.due_date) return false;
        const d = new Date(b.due_date);
        // Include bills for this month, or the closest next month if none this month
        return d.getMonth() >= currentMonth && d.getFullYear() >= currentYear;
    });

    // Sort by due date
    currentBills.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    // Deduplicate by account (keep the earliest upcoming bill per account)
    const uniqueAccountBillsMap = new Map<string, CreditCardBillRecord>();
    currentBills.forEach((b) => {
        if (!uniqueAccountBillsMap.has(b.account_id)) {
            uniqueAccountBillsMap.set(b.account_id, b);
        }
    });

    const latestBills = Array.from(uniqueAccountBillsMap.values());
    const totalAmount = latestBills.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    return (
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider">
                        Faturas de Cartão
                    </span>
                    <CreditCard size={13} className="text-[#8b949e]" />
                </div>
                <Link href="/accounts" className="flex items-center gap-1 text-[#58a6ff] text-xs hover:underline">
                    Ver contas <ArrowUpRight size={12} />
                </Link>
            </div>

            {/* Value */}
            <div>
                <p className="text-[#e6edf3] text-3xl font-bold leading-none">
                    {formatCurrency(totalAmount)}
                </p>
            </div>

            {/* Bills List */}
            <div className="flex flex-col gap-2 mt-2">
                {latestBills.length === 0 ? (
                    <p className="text-[#8b949e] text-xs text-center py-2">
                        Nenhuma fatura encontrada.
                    </p>
                ) : (
                    latestBills.slice(0, 3).map((bill) => {
                        const acc = accounts.find((a) => a.account_id === bill.account_id) || accounts.find((a) => a.id === bill.account_id);
                        const accountName = acc?.name || 'Cartão de Crédito';
                        const dueDate = bill.due_date ? new Date(bill.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--';

                        return (
                            <div key={bill.bill_id} className="flex items-center justify-between text-sm border-b border-[#21262d] pb-2 last:border-0 last:pb-0">
                                <div className="flex flex-col">
                                    <span className="text-[#e6edf3] truncate max-w-[150px]">{accountName}</span>
                                    <span className="text-[#8b949e] text-xs">Vence: {dueDate}</span>
                                </div>
                                <span className="text-[#e6edf3] font-medium">{formatCurrency(bill.total_amount)}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
