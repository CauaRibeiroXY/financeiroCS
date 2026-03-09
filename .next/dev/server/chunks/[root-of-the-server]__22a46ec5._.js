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
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://xkqdgjlqmawvdaqvddqf.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
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
"[project]/financeiro/src/app/domain/categorization.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "categorizationService",
    ()=>categorizationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/supabase/client.ts [app-route] (ecmascript)");
;
const categorizationService = {
    /**
     * Iterates over transactions without a category and maps them via SQL matching.
     * Internally calls the process_uncategorized_transactions RPC which uses ILIKE
     * to match the description with category_rules.merchant_name.
     * 
     * @returns The number of updated transactions.
     */ async processUncategorizedTransactions () {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        const { data, error } = await supabase.rpc('process_uncategorized_transactions');
        if (error) {
            console.error('Error processing uncategorized transactions:', error);
            throw new Error(`Failed to process categorizations: ${error.message}`);
        }
        return data;
    },
    /**
     * Syncs a single category and propagates to all transactions with the same description.
     * Executes within a single transaction bloc inside Postgres via RPC.
     * 
     * @param categoryId The new category ID to set.
     * @param description The original_description of the transaction.
     */ async syncTransactionCategory (categoryId, description) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        const { error } = await supabase.rpc('sync_transaction_category', {
            p_category_id: categoryId,
            p_description: description
        });
        if (error) {
            console.error('Error syncing transaction category:', error);
            throw new Error(`Failed to sync category: ${error.message}`);
        }
    }
};
}),
"[project]/financeiro/src/app/api/transactions/sync-category/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$domain$2f$categorization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/domain/categorization.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/supabase/client.ts [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const { transaction_id, category_id } = body;
        if (!transaction_id || !category_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing transaction_id or category_id'
            }, {
                status: 400
            });
        }
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        // Try finding the transaction by 'id' (UUID) or by 'transaction_id' (Pluggy string)
        let { data: transaction, error: fetchError } = await supabase.from('transactions').select('description, description_raw').eq('id', transaction_id).maybeSingle();
        if (!transaction) {
            // Fallback to Pluggy's transaction_id
            const { data: fallbackTransaction } = await supabase.from('transactions').select('description, description_raw').eq('transaction_id', transaction_id).maybeSingle();
            transaction = fallbackTransaction;
        }
        if (!transaction) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Transaction not found or could not fetch description'
            }, {
                status: 404
            });
        }
        const originalDescription = transaction.description || transaction.description_raw;
        if (!originalDescription) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Transaction has no description'
            }, {
                status: 400
            });
        }
        // Call the domain service which acts natively via SQL RPC to do the DB Transaction block
        await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$domain$2f$categorization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["categorizationService"].syncTransactionCategory(category_id, originalDescription);
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Category synced and propagated successfully'
        });
    } catch (error) {
        console.error('Error in sync-category API:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__22a46ec5._.js.map