(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/financeiro/src/app/hooks/useDashboardData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDashboardData",
    ()=>useDashboardData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useItems.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
// Internal hook to fetch accounts for multiple items in parallel
function useAllAccountsForItems(itemIds) {
    _s();
    const urls = itemIds.map((id)=>`/api/accounts?itemId=${id}&pageSize=200`);
    // Build a stable key
    const key = itemIds.length > 0 ? urls.join('|') : null;
    const { data, error, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(key, {
        "useAllAccountsForItems.useSWR": async ()=>{
            const results = await Promise.all(urls.map({
                "useAllAccountsForItems.useSWR": (url)=>fetch(url).then({
                        "useAllAccountsForItems.useSWR": (r)=>r.json()
                    }["useAllAccountsForItems.useSWR"]).catch({
                        "useAllAccountsForItems.useSWR": ()=>({
                                success: false,
                                data: {
                                    results: []
                                }
                            })
                    }["useAllAccountsForItems.useSWR"])
            }["useAllAccountsForItems.useSWR"]));
            return results;
        }
    }["useAllAccountsForItems.useSWR"]);
    const allAccounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useAllAccountsForItems.useMemo[allAccounts]": ()=>{
            if (!data) return [];
            return data.flatMap({
                "useAllAccountsForItems.useMemo[allAccounts]": (r)=>r?.data?.results ?? []
            }["useAllAccountsForItems.useMemo[allAccounts]"]);
        }
    }["useAllAccountsForItems.useMemo[allAccounts]"], [
        data
    ]);
    return {
        allAccounts,
        isLoading,
        isError: !!error
    };
}
_s(useAllAccountsForItems, "KCnXYk2lbM8vIVWLi+qPnqO1BPA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
    ];
});
// Internal hook to fetch transactions for multiple accounts in parallel
function useAllTransactionsForAccounts(accountIds) {
    _s1();
    const key = accountIds.length > 0 ? accountIds.map((id)=>`/api/transactions?accountId=${id}&pageSize=200`).join('|') : null;
    const { data, error, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(key, {
        "useAllTransactionsForAccounts.useSWR": async ()=>{
            const results = await Promise.all(accountIds.map({
                "useAllTransactionsForAccounts.useSWR": (id)=>fetch(`/api/transactions?accountId=${id}&pageSize=200`).then({
                        "useAllTransactionsForAccounts.useSWR": (r)=>r.json()
                    }["useAllTransactionsForAccounts.useSWR"]).catch({
                        "useAllTransactionsForAccounts.useSWR": ()=>({
                                success: false,
                                data: {
                                    results: []
                                }
                            })
                    }["useAllTransactionsForAccounts.useSWR"])
            }["useAllTransactionsForAccounts.useSWR"]));
            return results;
        }
    }["useAllTransactionsForAccounts.useSWR"]);
    const allTransactions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useAllTransactionsForAccounts.useMemo[allTransactions]": ()=>{
            if (!data) return [];
            return data.flatMap({
                "useAllTransactionsForAccounts.useMemo[allTransactions]": (r)=>r?.data?.results ?? []
            }["useAllTransactionsForAccounts.useMemo[allTransactions]"]);
        }
    }["useAllTransactionsForAccounts.useMemo[allTransactions]"], [
        data
    ]);
    return {
        allTransactions,
        isLoading,
        isError: !!error
    };
}
_s1(useAllTransactionsForAccounts, "AkCCmKhibWFRYnCzfZ7oUbHZrok=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
    ];
});
function useDashboardData() {
    _s2();
    const { items, isLoading: itemsLoading, isError: itemsError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useItems"])();
    const itemIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[itemIds]": ()=>items.map({
                "useDashboardData.useMemo[itemIds]": (i)=>i.item_id
            }["useDashboardData.useMemo[itemIds]"])
    }["useDashboardData.useMemo[itemIds]"], [
        items
    ]);
    const { allAccounts, isLoading: accountsLoading, isError: accountsError } = useAllAccountsForItems(itemIds);
    const accountIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[accountIds]": ()=>allAccounts.map({
                "useDashboardData.useMemo[accountIds]": (a)=>a.account_id
            }["useDashboardData.useMemo[accountIds]"])
    }["useDashboardData.useMemo[accountIds]"], [
        allAccounts
    ]);
    const { allTransactions, isLoading: txLoading, isError: txError } = useAllTransactionsForAccounts(accountIds);
    const isLoading = itemsLoading || accountsLoading || txLoading;
    const isError = itemsError || accountsError || txError;
    // Compute aggregated data
    const patrimony = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[patrimony]": ()=>allAccounts.filter({
                "useDashboardData.useMemo[patrimony]": (a)=>a.type === 'BANK' || a.type === 'PAYMENT_ACCOUNT'
            }["useDashboardData.useMemo[patrimony]"]).reduce({
                "useDashboardData.useMemo[patrimony]": (sum, a)=>sum + (a.balance ?? 0)
            }["useDashboardData.useMemo[patrimony]"], 0)
    }["useDashboardData.useMemo[patrimony]"], [
        allAccounts
    ]);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const currentMonthTx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[currentMonthTx]": ()=>allTransactions.filter({
                "useDashboardData.useMemo[currentMonthTx]": (t)=>{
                    const d = new Date(t.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                }
            }["useDashboardData.useMemo[currentMonthTx]"])
    }["useDashboardData.useMemo[currentMonthTx]"], [
        allTransactions,
        currentMonth,
        currentYear
    ]);
    const prevMonthTx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[prevMonthTx]": ()=>allTransactions.filter({
                "useDashboardData.useMemo[prevMonthTx]": (t)=>{
                    const d = new Date(t.date);
                    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
                }
            }["useDashboardData.useMemo[prevMonthTx]"])
    }["useDashboardData.useMemo[prevMonthTx]"], [
        allTransactions,
        prevMonth,
        prevYear
    ]);
    const totalIncome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[totalIncome]": ()=>currentMonthTx.filter({
                "useDashboardData.useMemo[totalIncome]": (t)=>t.type === 'CREDIT'
            }["useDashboardData.useMemo[totalIncome]"]).reduce({
                "useDashboardData.useMemo[totalIncome]": (sum, t)=>sum + Math.abs(t.amount)
            }["useDashboardData.useMemo[totalIncome]"], 0)
    }["useDashboardData.useMemo[totalIncome]"], [
        currentMonthTx
    ]);
    const totalExpenses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[totalExpenses]": ()=>currentMonthTx.filter({
                "useDashboardData.useMemo[totalExpenses]": (t)=>t.type === 'DEBIT'
            }["useDashboardData.useMemo[totalExpenses]"]).reduce({
                "useDashboardData.useMemo[totalExpenses]": (sum, t)=>sum + Math.abs(t.amount)
            }["useDashboardData.useMemo[totalExpenses]"], 0)
    }["useDashboardData.useMemo[totalExpenses]"], [
        currentMonthTx
    ]);
    const partialResult = totalIncome - totalExpenses;
    // Categories aggregation
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[categories]": ()=>{
            const catMap = {};
            currentMonthTx.filter({
                "useDashboardData.useMemo[categories]": (t)=>t.type === 'DEBIT'
            }["useDashboardData.useMemo[categories]"]).forEach({
                "useDashboardData.useMemo[categories]": (t)=>{
                    const cat = t.category || 'Outros';
                    if (!catMap[cat]) catMap[cat] = {
                        current: 0,
                        previous: 0
                    };
                    catMap[cat].current += Math.abs(t.amount);
                }
            }["useDashboardData.useMemo[categories]"]);
            prevMonthTx.filter({
                "useDashboardData.useMemo[categories]": (t)=>t.type === 'DEBIT'
            }["useDashboardData.useMemo[categories]"]).forEach({
                "useDashboardData.useMemo[categories]": (t)=>{
                    const cat = t.category || 'Outros';
                    if (!catMap[cat]) catMap[cat] = {
                        current: 0,
                        previous: 0
                    };
                    catMap[cat].previous += Math.abs(t.amount);
                }
            }["useDashboardData.useMemo[categories]"]);
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
            return Object.entries(catMap).map({
                "useDashboardData.useMemo[categories]": ([name, vals])=>({
                        name,
                        current: vals.current,
                        previous: vals.previous,
                        color: colors[name] || '#6b7280'
                    })
            }["useDashboardData.useMemo[categories]"]).sort({
                "useDashboardData.useMemo[categories]": (a, b)=>b.current - a.current
            }["useDashboardData.useMemo[categories]"]).slice(0, 10);
        }
    }["useDashboardData.useMemo[categories]"], [
        currentMonthTx,
        prevMonthTx
    ]);
    // Spending by day (for chart)
    const spendingByDay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDashboardData.useMemo[spendingByDay]": ()=>{
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const result = Array.from({
                length: daysInMonth
            }, {
                "useDashboardData.useMemo[spendingByDay].result": (_, i)=>({
                        day: i + 1,
                        current: 0,
                        previous: 0
                    })
            }["useDashboardData.useMemo[spendingByDay].result"]);
            let cumCurrent = 0;
            for(let d = 1; d <= daysInMonth; d++){
                const dayTx = currentMonthTx.filter({
                    "useDashboardData.useMemo[spendingByDay].dayTx": (t)=>new Date(t.date).getDate() === d && t.type === 'DEBIT'
                }["useDashboardData.useMemo[spendingByDay].dayTx"]);
                cumCurrent += dayTx.reduce({
                    "useDashboardData.useMemo[spendingByDay]": (s, t)=>s + Math.abs(t.amount)
                }["useDashboardData.useMemo[spendingByDay]"], 0);
                result[d - 1].current = cumCurrent;
            }
            let cumPrev = 0;
            const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
            for(let d = 1; d <= Math.min(daysInMonth, daysInPrevMonth); d++){
                const dayTx = prevMonthTx.filter({
                    "useDashboardData.useMemo[spendingByDay].dayTx": (t)=>new Date(t.date).getDate() === d && t.type === 'DEBIT'
                }["useDashboardData.useMemo[spendingByDay].dayTx"]);
                cumPrev += dayTx.reduce({
                    "useDashboardData.useMemo[spendingByDay]": (s, t)=>s + Math.abs(t.amount)
                }["useDashboardData.useMemo[spendingByDay]"], 0);
                result[d - 1].previous = cumPrev;
            }
            return result;
        }
    }["useDashboardData.useMemo[spendingByDay]"], [
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
        isLoading,
        isError
    };
}
_s2(useDashboardData, "9Ue3Ch7lGGsYZoGqWRxaaxrU/6g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useItems"],
        useAllAccountsForItems,
        useAllTransactionsForAccounts
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/components/shared/Skeleton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/cn.ts [app-client] (ecmascript)");
;
;
function Skeleton({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('animate-pulse rounded-md bg-[#21262d]', className)
    }, void 0, false, {
        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = Skeleton;
function SkeletonCard() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                        className: "h-4 w-32"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-8 w-40"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-48"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
_c1 = SkeletonCard;
function SkeletonTableRow() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
_c2 = SkeletonTableRow;
function SkeletonTable({ rows = 6 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-[#30363d]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                className: "w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "border-b border-[#30363d]",
                            children: [
                                '',
                                'DESCRIÇÃO',
                                'CATEGORIA',
                                'CONTA',
                                'DATA',
                                'VALOR'
                            ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "py-3 px-4 text-left",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: Array.from({
                            length: rows
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SkeletonTableRow, {}, i, false, {
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
_c3 = SkeletonTable;
function SkeletonCategoryRow() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-4 py-3 border-b border-[#30363d]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-4 rounded-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-32 flex-1"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-20"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-2 w-24 rounded-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: "h-4 w-16 rounded-full"
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/Skeleton.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
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
_c4 = SkeletonCategoryRow;
function SkeletonText({ lines = 2, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('space-y-2', className),
        children: Array.from({
            length: lines
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')
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
_c5 = SkeletonText;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "Skeleton");
__turbopack_context__.k.register(_c1, "SkeletonCard");
__turbopack_context__.k.register(_c2, "SkeletonTableRow");
__turbopack_context__.k.register(_c3, "SkeletonTable");
__turbopack_context__.k.register(_c4, "SkeletonCategoryRow");
__turbopack_context__.k.register(_c5, "SkeletonText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/(main)/accounts/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccountsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/wallet.js [app-client] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$config$2d$context$2d$12s$2d$CCVTDPOP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__j__as__mutate$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/_internal/config-context-12s-CCVTDPOP.mjs [app-client] (ecmascript) <export j as mutate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useDashboardData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useItems.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$shared$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/shared/Skeleton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function AccountCard({ account, item }) {
    const isCredit = account.type === 'CREDIT';
    const bgColor = item?.primary_color || '#58a6ff';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden",
                                style: {
                                    background: bgColor
                                },
                                children: item?.connector_image_url ? // eslint-disable-next-line @next/next/no-img-element
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: item.connector_image_url,
                                    alt: item.connector_name || 'Bank',
                                    className: "w-full h-full object-contain p-1"
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                    lineNumber: 33,
                                    columnNumber: 15
                                }, this) : (item?.connector_name || account.name).slice(0, 2).toUpperCase()
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[#e6edf3] text-sm font-semibold",
                                        children: account.marketing_name || account.name
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 43,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[#8b949e] text-xs",
                                        children: [
                                            item?.connector_name || 'Instituição',
                                            " •",
                                            ' ',
                                            account.number ? `***${account.number.slice(-4)}` : account.subtype || account.type
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-xs px-2 py-0.5 rounded-full font-medium', isCredit ? 'bg-[#d29922]/20 text-[#d29922]' : 'bg-[#3fb950]/20 text-[#3fb950]'),
                                children: isCredit ? 'Crédito' : account.type === 'BANK' ? 'Corrente' : 'Pagamento'
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": "Remover conta",
                                onClick: async ()=>{
                                    if (!confirm('Remover esta conta? Esta ação não pode ser desfeita.')) return;
                                    try {
                                        const res = await fetch(`/api/accounts?accountId=${account.account_id}`, {
                                            method: 'DELETE'
                                        });
                                        if (!res.ok) throw new Error('Failed to delete');
                                        // Revalidate accounts for this item
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$config$2d$context$2d$12s$2d$CCVTDPOP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__j__as__mutate$3e$__["mutate"])(`/api/accounts?itemId=${account.item_id}&pageSize=200`);
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$config$2d$context$2d$12s$2d$CCVTDPOP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__j__as__mutate$3e$__["mutate"])(`/api/accounts?itemId=${account.item_id}`);
                                    } catch (err) {
                                        console.error('Error deleting account:', err);
                                        alert('Erro ao remover conta');
                                    }
                                },
                                className: "p-1 rounded hover:bg-[#21262d]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    size: 16,
                                    className: "text-[#ff6b6b]"
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[#8b949e] text-xs mb-1",
                        children: isCredit ? 'Fatura atual' : 'Saldo disponível'
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[#e6edf3] text-2xl font-bold",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(account.balance ?? 0)
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            isCredit && account.credit_data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-2 border-t border-[#30363d] grid grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#8b949e] text-xs mb-1",
                                children: "Limite disponível"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#3fb950] text-sm font-medium",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(account.credit_data.available_credit_limit ?? 0)
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 101,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#8b949e] text-xs mb-1",
                                children: "Limite total"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#e6edf3] text-sm font-medium",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(account.credit_data.credit_limit ?? 0)
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    account.credit_data.balance_due_date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#8b949e] text-xs mb-1",
                                children: "Vencimento"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 115,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#e6edf3] text-sm",
                                children: new Date(account.credit_data.balance_due_date).toLocaleDateString('pt-BR')
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 116,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 114,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 pt-1 border-t border-[#21262d]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-1.5 h-1.5 rounded-full', item?.status === 'UPDATED' ? 'bg-[#3fb950]' : 'bg-[#d29922]')
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[#8b949e] text-xs",
                        children: item?.status === 'UPDATED' ? 'Sincronizado' : 'Atualizando...'
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = AccountCard;
function AccountsPage() {
    _s();
    const { allAccounts, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const { items } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useItems"])();
    const bankAccounts = allAccounts.filter((a)=>a.type === 'BANK' || a.type === 'PAYMENT_ACCOUNT');
    const creditAccounts = allAccounts.filter((a)=>a.type === 'CREDIT');
    const totalBalance = bankAccounts.reduce((s, a)=>s + (a.balance ?? 0), 0);
    const totalCredit = creditAccounts.reduce((s, a)=>s + (a.credit_data?.available_credit_limit ?? 0), 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
                            size: 18,
                            className: "text-[#8b949e]"
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-[#e6edf3] font-semibold text-base",
                            children: "Contas"
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                            lineNumber: 161,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                    lineNumber: 159,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-6 overflow-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 rounded-xl bg-[#3fb950]/20 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                            size: 20,
                                            className: "text-[#3fb950]"
                                        }, void 0, false, {
                                            fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                            lineNumber: 171,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[#8b949e] text-xs mb-1",
                                                children: "Total em conta"
                                            }, void 0, false, {
                                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                                lineNumber: 174,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[#e6edf3] text-xl font-bold",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(totalBalance)
                                            }, void 0, false, {
                                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                                lineNumber: 175,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 173,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 rounded-xl bg-[#d29922]/20 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                            size: 20,
                                            className: "text-[#d29922]"
                                        }, void 0, false, {
                                            fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                            lineNumber: 180,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 179,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[#8b949e] text-xs mb-1",
                                                children: "Crédito disponível"
                                            }, void 0, false, {
                                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                                lineNumber: 183,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[#e6edf3] text-xl font-bold",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(totalCredit)
                                            }, void 0, false, {
                                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                                lineNumber: 184,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 182,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this),
                    (isLoading || bankAccounts.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-3",
                                children: "Contas Bancárias"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
                                children: isLoading ? Array.from({
                                    length: 2
                                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$shared$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SkeletonCard"], {}, i, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 59
                                    }, this)) : bankAccounts.map((account)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AccountCard, {
                                        account: account,
                                        item: items.find((i)=>i.item_id === account.item_id)
                                    }, account.account_id, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this),
                    (isLoading || creditAccounts.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-3",
                                children: "Cartões de Crédito"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 212,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
                                children: isLoading ? Array.from({
                                    length: 1
                                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$shared$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SkeletonCard"], {}, i, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 217,
                                        columnNumber: 59
                                    }, this)) : creditAccounts.map((account)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AccountCard, {
                                        account: account,
                                        item: items.find((i)=>i.item_id === account.item_id)
                                    }, account.account_id, false, {
                                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                        lineNumber: 219,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 215,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 211,
                        columnNumber: 11
                    }, this),
                    !isLoading && allAccounts.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center gap-4 py-20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-full bg-[#21262d] flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
                                    size: 32,
                                    className: "text-[#58a6ff]"
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                    lineNumber: 233,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-[#e6edf3] text-xl font-semibold",
                                children: "Nenhuma conta encontrada"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 235,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#8b949e] text-sm text-center max-w-sm",
                                children: "Conecte sua conta bancária para visualizar seus dados financeiros."
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                        lineNumber: 231,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/(main)/accounts/page.tsx",
        lineNumber: 156,
        columnNumber: 5
    }, this);
}
_s(AccountsPage, "T0K4VuRLDkNOi7FHkXxhOhyc4lg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useDashboardData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useItems"]
    ];
});
_c1 = AccountsPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "AccountCard");
__turbopack_context__.k.register(_c1, "AccountsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>Building2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10 12h4",
            key: "a56b0p"
        }
    ],
    [
        "path",
        {
            d: "M10 8h4",
            key: "1sr2af"
        }
    ],
    [
        "path",
        {
            d: "M14 21v-3a2 2 0 0 0-4 0v3",
            key: "1rgiei"
        }
    ],
    [
        "path",
        {
            d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
            key: "secmi2"
        }
    ],
    [
        "path",
        {
            d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",
            key: "16ra0t"
        }
    ]
];
const Building2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("building-2", __iconNode);
;
 //# sourceMappingURL=building-2.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Building2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript)");
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>Trash2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10 11v6",
            key: "nco0om"
        }
    ],
    [
        "path",
        {
            d: "M14 11v6",
            key: "outv1u"
        }
    ],
    [
        "path",
        {
            d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
            key: "miytrc"
        }
    ],
    [
        "path",
        {
            d: "M3 6h18",
            key: "d0wm0j"
        }
    ],
    [
        "path",
        {
            d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
            key: "e791ji"
        }
    ]
];
const Trash2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("trash-2", __iconNode);
;
 //# sourceMappingURL=trash-2.js.map
}),
"[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Trash2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript)");
}),
"[project]/financeiro/node_modules/swr/dist/_internal/config-context-12s-CCVTDPOP.mjs [app-client] (ecmascript) <export j as mutate>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mutate",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$config$2d$context$2d$12s$2d$CCVTDPOP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["j"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$config$2d$context$2d$12s$2d$CCVTDPOP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/_internal/config-context-12s-CCVTDPOP.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=financeiro_d50b263a._.js.map