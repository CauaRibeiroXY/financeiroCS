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
"[project]/financeiro/src/app/lib/services/credit-card-bills.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "creditCardBillsService",
    ()=>creditCardBillsService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/supabase/client.ts [app-route] (ecmascript)");
;
const creditCardBillsService = {
    async upsertBills (bills) {
        const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])().from("credit_card_bills").upsert(bills, {
            onConflict: "bill_id",
            ignoreDuplicates: false
        }).select();
        if (error) {
            console.error("Error upserting credit card bills:", error);
            throw new Error(`Failed to upsert credit card bills: ${error.message}`);
        }
        return data || [];
    },
    async getBillsByAccountId (accountId) {
        const { data, error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])().from("credit_card_bills").select("*").eq("account_id", accountId).order("due_date", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching credit card bills:", error);
            throw new Error(`Failed to fetch credit card bills: ${error.message}`);
        }
        return data || [];
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
"[project]/financeiro/src/app/api/bills/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$credit$2d$card$2d$bills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/services/credit-card-bills.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/error-handler.ts [app-route] (ecmascript)");
;
;
;
const runtime = 'nodejs';
const maxDuration = 30;
async function handleGetBills(request) {
    const { searchParams } = request.nextUrl;
    const accountId = searchParams.get('accountId');
    if (!accountId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'accountId is required'
        }, {
            status: 400
        });
    }
    const bills = await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$credit$2d$card$2d$bills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["creditCardBillsService"].getBillsByAccountId(accountId);
    return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: {
            results: bills,
            page: 1,
            pageSize: bills.length,
            totalPages: 1,
            totalRecords: bills.length
        }
    });
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withErrorHandling"])(handleGetBills);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f1d56351._.js.map