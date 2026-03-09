module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/financeiro/src/app/lib/supabase/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAdmin",
    ()=>getSupabaseAdmin,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://uepwnuqcsjxatrxkxuik.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'x-client-info': 'pluggy-quickstart'
        }
    }
});
const getSupabaseAdmin = ()=>supabaseAdmin;
}),
"[project]/financeiro/src/app/lib/services/transactions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "transactionsService",
    ()=>transactionsService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/supabase/client.ts [app-route] (ecmascript)");
;
const transactionsService = {
    async upsertTransactions (transactions) {
        const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])().from("transactions").upsert(transactions, {
            onConflict: "transaction_id",
            ignoreDuplicates: false
        }).select();
        if (error) {
            console.error("Error upserting transactions:", error);
            throw new Error(`Failed to upsert transactions: ${error.message}`);
        }
        return data || [];
    },
    async getTransactionsByAccountId (accountId, page = 1, pageSize = 50) {
        const offset = (page - 1) * pageSize;
        const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])().from("transactions").select("*").eq("account_id", accountId).order("date", {
            ascending: false
        }).range(offset, offset + pageSize - 1);
        if (error) {
            console.error("Error fetching transactions:", error);
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
        return data || [];
    },
    async getTransactionsCountByAccountId (accountId) {
        const { count, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])().from("transactions").select("*", {
            count: 'exact',
            head: true
        }).eq("account_id", accountId);
        if (error) {
            console.error("Error counting transactions:", error);
            throw new Error(`Failed to count transactions: ${error.message}`);
        }
        return count || 0;
    },
    async deleteTransactions (transactionIds) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        const { error } = await supabase.from("transactions").delete().in("transaction_id", transactionIds);
        if (error) {
            console.error("Error deleting transactions:", error);
            throw new Error(`Failed to delete transactions: ${error.message}`);
        }
    }
};
}),
"[project]/financeiro/src/app/lib/utils/error-handler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withErrorHandling",
    ()=>withErrorHandling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/server.js [app-route] (ecmascript)");
;
function withErrorHandling(handler) {
    return async (request)=>{
        try {
            return await handler(request);
        } catch (error) {
            const isError = error instanceof Error;
            const errorMessage = isError ? error.message : String(error);
            const errorStack = isError ? error.stack : undefined;
            const errorName = isError ? error.name : undefined;
            const httpError = error;
            console.error('Route handler error:', {
                url: request.url,
                method: request.method,
                message: errorMessage,
                stack: errorStack,
                name: errorName,
                response: httpError.response?.data,
                status: httpError.response?.status
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: errorMessage || 'Internal server error',
                details: httpError.response?.data || errorMessage
            }, {
                status: httpError.response?.status || 500
            });
        }
    };
}
}),
"[project]/financeiro/src/app/api/transactions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "maxDuration",
    ()=>maxDuration,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$transactions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/services/transactions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/error-handler.ts [app-route] (ecmascript)");
;
;
;
const runtime = 'nodejs';
const maxDuration = 30;
async function handleGetTransactions(request) {
    const { searchParams } = request.nextUrl;
    const accountId = searchParams.get('accountId');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    if (!accountId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'accountId is required'
        }, {
            status: 400
        });
    }
    const currentPage = page ? parseInt(page) : 1;
    const currentPageSize = pageSize ? parseInt(pageSize) : 50;
    const transactions = await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$transactions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transactionsService"].getTransactionsByAccountId(accountId, currentPage, currentPageSize);
    const totalCount = await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$transactions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transactionsService"].getTransactionsCountByAccountId(accountId);
    return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: {
            results: transactions,
            page: currentPage,
            pageSize: currentPageSize,
            totalPages: Math.ceil(totalCount / currentPageSize),
            totalRecords: totalCount
        }
    });
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withErrorHandling"])(handleGetTransactions);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dbf2e267._.js.map