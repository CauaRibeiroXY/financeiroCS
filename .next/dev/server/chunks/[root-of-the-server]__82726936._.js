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
"[project]/financeiro/src/app/lib/services/identity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "identityService",
    ()=>identityService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/supabase/client.ts [app-route] (ecmascript)");
;
const identityService = {
    async upsertIdentity (identityData) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        const { data, error } = await supabase.from('identities').upsert(identityData, {
            onConflict: 'identity_id',
            ignoreDuplicates: false
        }).select().single();
        if (error) {
            console.error('Error upserting identity:', error);
            throw new Error(`Failed to upsert identity: ${error.message}`);
        }
        return data;
    },
    async getIdentityByItemId (itemId) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdmin"])();
        const { data, error } = await supabase.from('identities').select('*').eq('item_id', itemId).single();
        if (error) {
            // PGRST116 = no rows returned (not found)
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Error fetching identity:', error);
            throw new Error(`Failed to fetch identity: ${error.message}`);
        }
        return data;
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
"[project]/financeiro/src/app/lib/utils/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAccountId",
    ()=>requireAccountId,
    "requireItemId",
    ()=>requireItemId,
    "validateAccountId",
    ()=>validateAccountId,
    "validateItemId",
    ()=>validateItemId
]);
function validateItemId(request) {
    const { searchParams } = request.nextUrl;
    const itemId = searchParams.get('itemId');
    if (!itemId) {
        return null;
    }
    return itemId;
}
function requireItemId(request) {
    const itemId = validateItemId(request);
    if (!itemId) {
        const error = new Error('itemId is required');
        error.status = 400;
        throw error;
    }
    return itemId;
}
function validateAccountId(request) {
    const { searchParams } = request.nextUrl;
    const accountId = searchParams.get('accountId');
    if (!accountId) {
        return null;
    }
    return accountId;
}
function requireAccountId(request) {
    const accountId = validateAccountId(request);
    if (!accountId) {
        const error = new Error('accountId is required');
        error.status = 400;
        throw error;
    }
    return accountId;
}
}),
"[project]/financeiro/src/app/api/identity/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/services/identity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/error-handler.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/validation.ts [app-route] (ecmascript)");
;
;
;
;
const runtime = 'nodejs';
const maxDuration = 30;
async function handleGetIdentity(request) {
    const itemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireItemId"])(request);
    // Fetch from database (kept in sync by webhooks)
    const identity = await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$services$2f$identity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["identityService"].getIdentityByItemId(itemId);
    if (!identity) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Identity not found'
        }, {
            status: 404
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: identity
    });
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withErrorHandling"])(handleGetIdentity);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__82726936._.js.map