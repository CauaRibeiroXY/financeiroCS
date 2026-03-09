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
        return data.flatMap((r)=>r?.data?.results ?? []);
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
                current: 0,
                previous: 0
            }));
        let cumCurrent = 0;
        for(let d = 1; d <= daysInMonth; d++){
            const dayTx = currentMonthTx.filter((t)=>new Date(t.date).getDate() === d && t.type === 'DEBIT');
            cumCurrent += dayTx.reduce((s, t)=>s + Math.abs(t.amount), 0);
            result[d - 1].current = cumCurrent;
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
"[project]/financeiro/src/app/components/shared/Skeleton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Skeleton",
    ()=>Skeleton,
    "SkeletonCard",
    ()=>SkeletonCard,
    "SkeletonCategoryRow",
    ()=>SkeletonCategoryRow,
    "SkeletonTable",
    ()=>SkeletonTable,
    "SkeletonTableRow",
    ()=>SkeletonTableRow,
    "SkeletonText",
    ()=>SkeletonText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/cn.ts [app-ssr] (ecmascript)");
;
;
function Skeleton({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('animate-pulse rounded-md bg-[#21262d]', className)
    }, void 0, false, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
function SkeletonCard() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                        className: "h-4 w-32"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                        className: "h-4 w-16"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-8 w-40"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-48"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-24 w-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function SkeletonTableRow() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-4 w-4 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 35,
                    columnNumber: 33
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-4 w-48"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 36,
                    columnNumber: 33
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-6 w-32 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 37,
                    columnNumber: 33
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-6 w-12 rounded"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 38,
                    columnNumber: 33
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-4 w-24"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 39,
                    columnNumber: 33
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-4 w-20"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 40,
                    columnNumber: 33
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
function SkeletonTable({ rows = 6 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-[#30363d]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    className: "h-9 w-64 rounded-lg"
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                className: "w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "border-b border-[#30363d]",
                            children: [
                                '',
                                'DESCRIÇÃO',
                                'CATEGORIA',
                                'CONTA',
                                'DATA',
                                'VALOR'
                            ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "py-3 px-4 text-left",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                        className: "h-3 w-16"
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                                        lineNumber: 56,
                                        columnNumber: 17
                                    }, this)
                                }, h, false, {
                                    fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                                    lineNumber: 55,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: Array.from({
                            length: rows
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SkeletonTableRow, {}, i, false, {
                                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
function SkeletonCategoryRow() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-4 py-3 border-b border-[#30363d]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-4 rounded-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-32 flex-1"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-20"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-2 w-24 rounded-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-16 rounded-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-16"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
function SkeletonText({ lines = 2, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('space-y-2', className),
        children: Array.from({
            length: lines
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')
            }, i, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 88,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
}),
"[project]/financeiro/src/app/hooks/useCategories.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCategories",
    ()=>useCategories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/api.ts [app-ssr] (ecmascript)");
;
;
const fetcher = (url)=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get(url).then((res)=>res.data);
function useCategories() {
    const { data, error, isLoading, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])('/api/categories', fetcher);
    const addCategory = async (name)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].post('/api/categories', {
                name
            });
            // Optimistic update
            mutate([
                ...data || [],
                response.data
            ], false);
            // Revalidate to ensure server state
            mutate();
            return {
                success: true,
                data: response.data
            };
        } catch (err) {
            console.error('Error adding category:', err);
            throw new Error(err.response?.data?.error || 'Failed to add category');
        }
    };
    const deleteCategory = async (id)=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].delete(`/api/categories/${id}`);
            // Optimistic update
            mutate((data || []).filter((c)=>c.id !== id), false);
            // Revalidate
            mutate();
            return {
                success: true
            };
        } catch (err) {
            console.error('Error deleting category:', err);
            throw new Error(err.response?.data?.error || 'Failed to delete category');
        }
    };
    return {
        categories: data || [],
        isLoading,
        isError: !!error,
        addCategory,
        deleteCategory,
        mutate
    };
}
}),
"[project]/financeiro/src/app/components/transactions/TransactionTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/financeiro/src/app/components/transactions/TransactionTable.tsx'\n\nUnexpected token. Did you mean `{'}'}` or `&rbrace;`?");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/financeiro/src/app/(main)/transactions/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TransactionsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpDown$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-up-down.js [app-ssr] (ecmascript) <export default as ArrowUpDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useDashboardData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useItems.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$transactions$2f$TransactionTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/transactions/TransactionTable.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function TransactionsPage() {
    const { allTransactions, allAccounts, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const { items } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useItems"])();
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [selectedAccountId, setSelectedAccountId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const pageSize = 50;
    // filter transactions by selected account before calculating pagination
    const filteredTransactions = selectedAccountId ? allTransactions.filter((t)=>t.account_id === selectedAccountId) : allTransactions;
    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const paginated = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpDown$3e$__["ArrowUpDown"], {
                            size: 18,
                            className: "text-[#8b949e]"
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-[#e6edf3] font-semibold text-base",
                            children: "Transações"
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-6 overflow-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-[#8b949e] mr-2",
                                children: "Conta:"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: selectedAccountId,
                                onChange: (e)=>{
                                    setSelectedAccountId(e.target.value);
                                    setPage(1); // reset paging when filter changes
                                },
                                className: "pl-3 pr-8 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm focus:border-[#58a6ff]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Todas contas"
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                                        lineNumber: 47,
                                        columnNumber: 13
                                    }, this),
                                    allAccounts.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: a.account_id,
                                            children: a.number ? `${a.name} • ${a.number}` : a.name
                                        }, a.account_id, false, {
                                            fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                                            lineNumber: 49,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$transactions$2f$TransactionTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TransactionTable"], {
                        transactions: paginated,
                        accounts: allAccounts,
                        items: items,
                        isLoading: isLoading,
                        totalRecords: filteredTransactions.length,
                        page: page,
                        totalPages: totalPages,
                        onPageChange: setPage
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/(main)/transactions/page.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>Search
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m21 21-4.34-4.34",
            key: "14j7rj"
        }
    ],
    [
        "circle",
        {
            cx: "11",
            cy: "11",
            r: "8",
            key: "4ej97u"
        }
    ]
];
const Search = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("search", __iconNode);
;
 //# sourceMappingURL=search.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Search",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>EllipsisVertical
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "1",
            key: "41hilf"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "5",
            r: "1",
            key: "gxeob9"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "19",
            r: "1",
            key: "lyex9k"
        }
    ]
];
const EllipsisVertical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("ellipsis-vertical", __iconNode);
;
 //# sourceMappingURL=ellipsis-vertical.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-ssr] (ecmascript) <export default as MoreVertical>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MoreVertical",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-ssr] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-down-left.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>ArrowDownLeft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M17 7 7 17",
            key: "15tmo1"
        }
    ],
    [
        "path",
        {
            d: "M17 17H7V7",
            key: "1org7z"
        }
    ]
];
const ArrowDownLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-down-left", __iconNode);
;
 //# sourceMappingURL=arrow-down-left.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-down-left.js [app-ssr] (ecmascript) <export default as ArrowDownLeft>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowDownLeft",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-down-left.js [app-ssr] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>ArrowUpRight
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M7 7h10v10",
            key: "1tivn9"
        }
    ],
    [
        "path",
        {
            d: "M7 17 17 7",
            key: "1vkiza"
        }
    ]
];
const ArrowUpRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-up-right", __iconNode);
;
 //# sourceMappingURL=arrow-up-right.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-ssr] (ecmascript) <export default as ArrowUpRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowUpRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-ssr] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/pen.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>Pen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
            key: "1a8usu"
        }
    ]
];
const Pen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("pen", __iconNode);
;
 //# sourceMappingURL=pen.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/pen.js [app-ssr] (ecmascript) <export default as Edit2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Edit2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/pen.js [app-ssr] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>Check
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M20 6 9 17l-5-5",
            key: "1gmf2c"
        }
    ]
];
const Check = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("check", __iconNode);
;
 //# sourceMappingURL=check.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Check",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>X
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M18 6 6 18",
            key: "1bl5f8"
        }
    ],
    [
        "path",
        {
            d: "m6 6 12 12",
            key: "d8bk6v"
        }
    ]
];
const X = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("x", __iconNode);
;
 //# sourceMappingURL=x.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "X",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=financeiro_596093f3._.js.map