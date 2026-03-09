module.exports = [
"[project]/financeiro/src/app/hooks/useDashboardData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDashboardData",
    ()=>useDashboardData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useItems.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
// Internal hook to fetch accounts for multiple items in parallel
function useAllAccountsForItems(itemIds) {
    const urls = itemIds.map((id)=>`/api/accounts?itemId=${id}&pageSize=200`);
    // Build a stable key
    const key = itemIds.length > 0 ? urls.join('|') : null;
    const { data, error, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(key, async ()=>{
        const results = await Promise.all(urls.map((url)=>fetch(url).then((r)=>r.json()).catch(()=>({
                    success: false,
                    data: {
                        results: []
                    }
                }))));
        return results;
    });
    const allAccounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data) return [];
        return data.flatMap((r)=>r?.data?.results ?? []);
    }, [
        data
    ]);
    return {
        allAccounts,
        isLoading,
        isError: !!error
    };
}
// Internal hook to fetch transactions for multiple accounts in parallel
function useAllTransactionsForAccounts(accountIds) {
    const key = accountIds.length > 0 ? accountIds.map((id)=>`/api/transactions?accountId=${id}&pageSize=200`).join('|') : null;
    const { data, error, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(key, async ()=>{
        const results = await Promise.all(accountIds.map((id)=>fetch(`/api/transactions?accountId=${id}&pageSize=200`).then((r)=>r.json()).catch(()=>({
                    success: false,
                    data: {
                        results: []
                    }
                }))));
        return results;
    });
    const allTransactions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data) return [];
        const merged = data.flatMap((r)=>r?.data?.results ?? []);
        // Global sort by date DESC
        return merged.sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [
        data
    ]);
    return {
        allTransactions,
        isLoading,
        isError: !!error
    };
}
// Internal hook to fetch bills for multiple accounts in parallel
function useAllBillsForAccounts(accountIds) {
    const key = accountIds.length > 0 ? accountIds.map((id)=>`/api/bills?accountId=${id}&pageSize=200`).join('|') : null;
    const { data, error, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(key, async ()=>{
        const results = await Promise.all(accountIds.map((id)=>fetch(`/api/bills?accountId=${id}&pageSize=200`).then((r)=>r.json()).catch(()=>({
                    success: false,
                    data: {
                        results: []
                    }
                }))));
        return results;
    });
    const allBills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data) return [];
        return data.flatMap((r)=>r?.data?.results ?? []);
    }, [
        data
    ]);
    return {
        allBills,
        isLoading,
        isError: !!error
    };
}
function useDashboardData() {
    const { items, isLoading: itemsLoading, isError: itemsError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useItems"])();
    const itemIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.map((i)=>i.item_id), [
        items
    ]);
    const { allAccounts, isLoading: accountsLoading, isError: accountsError } = useAllAccountsForItems(itemIds);
    const accountIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>allAccounts.map((a)=>a.account_id), [
        allAccounts
    ]);
    const { allTransactions, isLoading: txLoading, isError: txError } = useAllTransactionsForAccounts(accountIds);
    const creditAccountIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>allAccounts.filter((a)=>a.type === 'CREDIT').map((a)=>a.account_id), [
        allAccounts
    ]);
    const { allBills, isLoading: billsLoading, isError: billsError } = useAllBillsForAccounts(creditAccountIds);
    const isLoading = itemsLoading || accountsLoading || txLoading || billsLoading;
    const isError = itemsError || accountsError || txError || billsError;
    // Compute aggregated data
    const patrimony = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>allAccounts.filter((a)=>a.type === 'BANK' || a.type === 'PAYMENT_ACCOUNT').reduce((sum, a)=>sum + (a.balance ?? 0), 0), [
        allAccounts
    ]);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const currentMonthTx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>allTransactions.filter((t)=>{
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }), [
        allTransactions,
        currentMonth,
        currentYear
    ]);
    const prevMonthTx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>allTransactions.filter((t)=>{
            const d = new Date(t.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        }), [
        allTransactions,
        prevMonth,
        prevYear
    ]);
    const totalIncome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>currentMonthTx.filter((t)=>t.type === 'CREDIT').reduce((sum, t)=>sum + Math.abs(t.amount), 0), [
        currentMonthTx
    ]);
    const totalExpenses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>currentMonthTx.filter((t)=>t.type === 'DEBIT').reduce((sum, t)=>sum + Math.abs(t.amount), 0), [
        currentMonthTx
    ]);
    const partialResult = totalIncome - totalExpenses;
    // Categories aggregation
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const categoryTranslationMap = {
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
        const translateCategory = (cat)=>{
            if (!cat) return 'Outros';
            return categoryTranslationMap[cat] || cat;
        };
        const catMap = {};
        currentMonthTx.filter((t)=>t.type === 'DEBIT').forEach((t)=>{
            const cat = translateCategory(t.category);
            if (!catMap[cat]) catMap[cat] = {
                current: 0,
                previous: 0
            };
            catMap[cat].current += Math.abs(t.amount);
        });
        prevMonthTx.filter((t)=>t.type === 'DEBIT').forEach((t)=>{
            const cat = translateCategory(t.category);
            if (!catMap[cat]) catMap[cat] = {
                current: 0,
                previous: 0
            };
            catMap[cat].previous += Math.abs(t.amount);
        });
        const colors = {
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
            Outros: '#6b7280'
        };
        return Object.entries(catMap).map(([name, vals])=>({
                name,
                current: vals.current,
                previous: vals.previous,
                color: colors[name] || '#6b7280'
            })).sort((a, b)=>b.current !== a.current ? b.current - a.current : b.previous - a.previous).slice(0, 10);
    }, [
        currentMonthTx,
        prevMonthTx
    ]);
    // Spending by day (for chart)
    const spendingByDay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const result = Array.from({
            length: daysInMonth
        }, (_, i)=>({
                day: i + 1,
                current: null,
                previous: 0
            }));
        let cumCurrent = 0;
        const todayDate = new Date();
        const isCurrentMonth = currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear();
        const todayDay = todayDate.getDate();
        for(let d = 1; d <= daysInMonth; d++){
            const dayTx = currentMonthTx.filter((t)=>new Date(t.date).getDate() === d && t.type === 'DEBIT');
            cumCurrent += dayTx.reduce((s, t)=>s + Math.abs(t.amount), 0);
            if (isCurrentMonth && d > todayDay) {
                result[d - 1].current = null;
            } else {
                result[d - 1].current = cumCurrent;
            }
        }
        let cumPrev = 0;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        for(let d = 1; d <= Math.min(daysInMonth, daysInPrevMonth); d++){
            const dayTx = prevMonthTx.filter((t)=>new Date(t.date).getDate() === d && t.type === 'DEBIT');
            cumPrev += dayTx.reduce((s, t)=>s + Math.abs(t.amount), 0);
            result[d - 1].previous = cumPrev;
        }
        return result;
    }, [
        currentMonthTx,
        prevMonthTx,
        currentMonth,
        currentYear,
        prevMonth,
        prevYear
    ]);
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
        isError
    };
}
}),
"[project]/financeiro/src/app/lib/services/recurrence.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectRecurrences",
    ()=>detectRecurrences
]);
// ============================================================================
// INTERNAL HELPERS
// ============================================================================
/**
 * Normalize a transaction description to a stable key for grouping.
 * - Converts to lowercase
 * - Removes digits and common noise characters (*, #, /, \, |, -)
 * - Collapses multiple spaces
 * - Trims edges
 */ function normalizeDescription(raw) {
    return raw.toLowerCase().replace(/[\d*#/\\|+@.,-]/g, ' ').replace(/\s+/g, ' ').trim();
}
/**
 * Identifies transaction IDs that are cross-account internal transfers.
 *
 * A pair qualifies when:
 * - One side is DEBIT on account A, the other is CREDIT on a different account B
 * - Amounts match within 1%
 * - Dates are within 2 calendar days
 *
 * Both sides are returned so they can be excluded from expense analysis.
 * This handles PIX between spouses, self-transfers between own accounts, etc.
 */ function findInternalTransferIds(transactions) {
    const internalIds = new Set();
    const accountIds = new Set(transactions.map((t)=>t.account_id));
    if (accountIds.size < 2) return internalIds;
    const credits = transactions.filter((t)=>t.type === 'CREDIT');
    const debits = transactions.filter((t)=>t.type === 'DEBIT');
    for (const debit of debits){
        const debitAmt = Math.abs(debit.amount);
        const debitTime = new Date(debit.date).getTime();
        for (const credit of credits){
            if (debit.account_id === credit.account_id) continue;
            const creditAmt = Math.abs(credit.amount);
            const amtDiff = Math.abs(debitAmt - creditAmt) / Math.max(debitAmt, creditAmt);
            if (amtDiff > 0.01) continue;
            const creditTime = new Date(credit.date).getTime();
            const dayDiff = Math.abs(debitTime - creditTime) / (1000 * 60 * 60 * 24);
            if (dayDiff > 2) continue;
            if (debit.transaction_id) internalIds.add(debit.transaction_id);
            if (credit.transaction_id) internalIds.add(credit.transaction_id);
        }
    }
    return internalIds;
}
/** Returns the most common element in an array (mode). */ function mode(arr) {
    const counts = new Map();
    for (const item of arr){
        counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    let best = arr[0];
    let bestCount = 0;
    for (const [item, count] of counts){
        if (count > bestCount) {
            bestCount = count;
            best = item;
        }
    }
    return best;
}
/** Returns the median value of a numeric array (sorted ascending). */ function median(values) {
    if (values.length === 0) return 0;
    const sorted = [
        ...values
    ].sort((a, b)=>a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
/**
 * Estimates frequency based on the median interval in days between occurrences.
 *
 * Interval thresholds:
 * - weekly    : median ≤ 10 days
 * - monthly   : 11–50 days
 * - annual    : 300–400 days
 * - irregular : otherwise
 */ function estimateFrequency(dates) {
    if (dates.length < 2) return 'irregular';
    const sorted = [
        ...dates
    ].sort((a, b)=>a.getTime() - b.getTime());
    const intervals = [];
    for(let i = 1; i < sorted.length; i++){
        const diffMs = sorted[i].getTime() - sorted[i - 1].getTime();
        intervals.push(diffMs / (1000 * 60 * 60 * 24)); // days
    }
    const med = median(intervals);
    if (med <= 10) return 'weekly';
    if (med <= 50) return 'monthly';
    if (med >= 300 && med <= 400) return 'annual';
    return 'irregular';
}
/** Converts average amount to a monthly equivalent based on frequency. */ function toMonthlyEquivalent(avgAmount, freq) {
    switch(freq){
        case 'weekly':
            return avgAmount * (52 / 12); // ~4.33 × per month
        case 'monthly':
            return avgAmount;
        case 'annual':
            return avgAmount / 12;
        case 'irregular':
        default:
            return avgAmount; // treat as monthly for conservative estimate
    }
}
function detectRecurrences(transactions) {
    // Step 1: Restrict to the last 3 calendar months (current month + 2 previous).
    // This prevents old historical patterns from skewing results.
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 1st of 2 months ago
    // Step 1b: Identify cross-account internal transfers (e.g. PIX between spouses)
    // so they are not counted as expenses in the recurrence analysis.
    const internalTransferIds = findInternalTransferIds(transactions);
    const debits = transactions.filter((t)=>{
        if (t.type !== 'DEBIT') return false;
        const txDate = new Date(t.date);
        if (txDate < cutoff) return false;
        if (t.transaction_id && internalTransferIds.has(t.transaction_id)) return false;
        return true;
    });
    // Step 2: Group by normalized description
    const groups = new Map();
    for (const tx of debits){
        const key = normalizeDescription(tx.description ?? '');
        if (!key) continue;
        const list = groups.get(key);
        if (list) {
            list.push(tx);
        } else {
            groups.set(key, [
                tx
            ]);
        }
    }
    const items = [];
    for (const [normalizedKey, txList] of groups){
        // Step 3: Require ≥ 2 occurrences
        if (txList.length < 2) continue;
        // Step 4: Require spanning ≥ 2 distinct months
        const distinctMonths = new Set(txList.map((t)=>{
            const d = new Date(t.date);
            return `${d.getFullYear()}-${d.getMonth()}`;
        }));
        if (distinctMonths.size < 2) continue;
        // Step 5: Compute metrics
        const dates = txList.map((t)=>new Date(t.date));
        const amounts = txList.map((t)=>Math.abs(t.amount));
        const averageAmount = amounts.reduce((s, a)=>s + a, 0) / amounts.length;
        const frequency = estimateFrequency(dates);
        const monthlyEquivalent = toMonthlyEquivalent(averageAmount, frequency);
        const lastDate = dates.sort((a, b)=>b.getTime() - a.getTime())[0].toISOString().split('T')[0];
        const label = mode(txList.map((t)=>t.description ?? normalizedKey));
        items.push({
            id: normalizedKey,
            label,
            frequency,
            averageAmount,
            monthlyEquivalent,
            occurrences: txList.length,
            lastDate
        });
    }
    // Step 6: Sort by monthly equivalent descending
    items.sort((a, b)=>b.monthlyEquivalent - a.monthlyEquivalent);
    const totalMonthlyCommitted = items.reduce((s, i)=>s + i.monthlyEquivalent, 0);
    return {
        items,
        totalMonthlyCommitted
    };
}
}),
"[project]/financeiro/src/app/hooks/useRecurrences.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRecurrences",
    ()=>useRecurrences
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useDashboardData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$recurrence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/services/recurrence.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function useRecurrences() {
    const { allTransactions, isLoading, isError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const analysis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$recurrence$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["detectRecurrences"])(allTransactions), [
        allTransactions
    ]);
    return {
        analysis,
        isLoading,
        isError
    };
}
}),
"[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecurrenceSummaryCard",
    ()=>RecurrenceSummaryCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
'use client';
;
;
function formatBRL(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
}
function RecurrenceSummaryCard({ analysis }) {
    const { totalMonthlyCommitted, items } = analysis;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex items-start gap-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 w-12 h-12 rounded-lg bg-[#58a6ff]/10 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                    size: 22,
                    className: "text-[#58a6ff]"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
                    lineNumber: 25,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
                lineNumber: 24,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                        children: "Total Mensal Comprometido"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
                        lineNumber: 30,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-3xl font-bold text-[#e6edf3] tabular-nums",
                        children: formatBRL(totalMonthlyCommitted)
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
                        lineNumber: 33,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-[#8b949e]",
                        children: items.length === 0 ? 'Nenhuma despesa recorrente detectada' : `${items.length} despesa${items.length === 1 ? '' : 's'} recorrente${items.length === 1 ? '' : 's'} detectada${items.length === 1 ? '' : 's'}`
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
                lineNumber: 29,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx",
        lineNumber: 22,
        columnNumber: 9
    }, this);
}
}),
"[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecurrenceList",
    ()=>RecurrenceList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
'use client';
;
;
function formatBRL(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
}
function formatDate(iso) {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}
const FREQUENCY_LABELS = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    annual: 'Anual',
    irregular: 'Irregular'
};
const FREQUENCY_COLORS = {
    weekly: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    monthly: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    annual: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    irregular: 'bg-[#30363d] text-[#8b949e] border border-[#30363d]'
};
function RecurrenceList({ items, isLoading, isError }) {
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center py-16 text-[#8b949e] gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    size: 20,
                    className: "animate-spin"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                    lineNumber: 43,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm",
                    children: "Analisando transações..."
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                    lineNumber: 44,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
            lineNumber: 42,
            columnNumber: 13
        }, this);
    }
    if (isError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-16 text-center text-red-400 text-sm",
            children: "Erro ao carregar transações. Tente novamente."
        }, void 0, false, {
            fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
            lineNumber: 51,
            columnNumber: 13
        }, this);
    }
    if (items.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-16 text-center text-[#8b949e] text-sm",
            children: [
                "Nenhuma despesa recorrente detectada.",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                    lineNumber: 61,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs mt-1 block opacity-70",
                    children: "Precisamos de pelo menos 2 transações semelhantes em meses diferentes."
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                    lineNumber: 62,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
            lineNumber: 59,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-[#30363d]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-left px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                                children: "Descrição"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                lineNumber: 74,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-left px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                                children: "Frequência"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                lineNumber: 77,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                                children: "Valor Médio"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                lineNumber: 80,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                                children: "Custo Mensal"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                lineNumber: 83,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                                children: "Ocorrências"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                lineNumber: 86,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider",
                                children: "Última Cobrança"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                lineNumber: 89,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                        lineNumber: 73,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                    lineNumber: 72,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    className: "divide-y divide-[#30363d]",
                    children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "hover:bg-[#21262d] transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-3 text-[#e6edf3] font-medium truncate max-w-[220px]",
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                    lineNumber: 101,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${FREQUENCY_COLORS[item.frequency]}`,
                                        children: FREQUENCY_LABELS[item.frequency]
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                        lineNumber: 107,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                    lineNumber: 106,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-3 text-right text-[#e6edf3] tabular-nums",
                                    children: formatBRL(item.averageAmount)
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                    lineNumber: 115,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-3 text-right font-semibold text-[#58a6ff] tabular-nums",
                                    children: formatBRL(item.monthlyEquivalent)
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                    lineNumber: 120,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-3 text-right text-[#8b949e] tabular-nums",
                                    children: [
                                        item.occurrences,
                                        "×"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                    lineNumber: 125,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-4 py-3 text-right text-[#8b949e]",
                                    children: formatDate(item.lastDate)
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                                    lineNumber: 130,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                            lineNumber: 96,
                            columnNumber: 25
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
                    lineNumber: 94,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
            lineNumber: 71,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx",
        lineNumber: 70,
        columnNumber: 9
    }, this);
}
}),
"[project]/financeiro/src/app/(main)/recurrences/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecurrencesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useRecurrences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useRecurrences.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$recurrences$2f$RecurrenceSummaryCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/recurrences/RecurrenceSummaryCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$recurrences$2f$RecurrenceList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/recurrences/RecurrenceList.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function RecurrencesPage() {
    const { analysis, isLoading, isError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useRecurrences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRecurrences"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                size: 18,
                                className: "text-[#8b949e]"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                                lineNumber: 16,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-[#e6edf3] font-semibold text-base",
                                children: "Recorrências"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                                lineNumber: 17,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                        lineNumber: 15,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-[#8b949e]",
                        children: "Detecção automática de despesas recorrentes"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                        lineNumber: 19,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                lineNumber: 14,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-6 overflow-auto space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$recurrences$2f$RecurrenceSummaryCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecurrenceSummaryCard"], {
                        analysis: analysis
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                        lineNumber: 27,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-6 py-4 border-b border-[#30363d]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-medium text-[#e6edf3]",
                                        children: "Despesas Recorrentes Detectadas"
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                                        lineNumber: 32,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#8b949e] mt-0.5",
                                        children: "Agrupadas por descrição similar, com frequência e custo mensal estimados"
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                                        lineNumber: 33,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                                lineNumber: 31,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$recurrences$2f$RecurrenceList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecurrenceList"], {
                                items: analysis.items,
                                isLoading: isLoading,
                                isError: isError
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                                lineNumber: 37,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                        lineNumber: 30,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
                lineNumber: 25,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/(main)/recurrences/page.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, this);
}
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>TrendingUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 7h6v6",
            key: "box55l"
        }
    ],
    [
        "path",
        {
            d: "m22 7-8.5 8.5-5-5L2 17",
            key: "1t1m79"
        }
    ]
];
const TrendingUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("trending-up", __iconNode);
;
 //# sourceMappingURL=trending-up.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrendingUp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=financeiro_61dcf693._.js.map