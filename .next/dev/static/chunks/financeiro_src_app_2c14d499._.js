(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/financeiro/src/app/lib/utils/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: '',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Adiciona um interceptor global para anexar a senha em todas as requisições Axios (caso utilizadas)
api.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem('app_password');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});
if ("TURBOPACK compile-time truthy", 1) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    api.interceptors.request.use((config)=>config);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/components/providers/SWRProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SWRProvider",
    ()=>SWRProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/api.ts [app-client] (ecmascript)");
'use client';
;
;
;
const fetcher = (url)=>__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get(url).then((res)=>res.data);
function SWRProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SWRConfig"], {
        value: {
            fetcher,
            revalidateOnFocus: false,
            errorRetryCount: 3,
            errorRetryInterval: 5000,
            dedupingInterval: 10000
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/financeiro/src/app/components/providers/SWRProvider.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
_c = SWRProvider;
var _c;
__turbopack_context__.k.register(_c, "SWRProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/lib/utils/cn.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Simple class name utility (clsx-like, without dependency)
 */ __turbopack_context__.s([
    "cn",
    ()=>cn
]);
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/hooks/useItems.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useItems",
    ()=>useItems
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useItems() {
    _s();
    const { data, error, isLoading, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])('/api/items');
    return {
        items: data?.data?.results ?? [],
        isLoading,
        isError: !!error,
        mutate
    };
}
_s(useItems, "VRI3YSxoWYZ/jyoKeeIu/AvyMKw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/hooks/useAccounts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAccounts",
    ()=>useAccounts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useAccounts(itemId) {
    _s();
    const { data, error, isLoading, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(itemId ? `/api/accounts?itemId=${itemId}` : null);
    return {
        accounts: data?.data?.results ?? [],
        isLoading,
        isError: !!error,
        mutate
    };
}
_s(useAccounts, "VRI3YSxoWYZ/jyoKeeIu/AvyMKw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/hooks/useIdentity.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIdentity",
    ()=>useIdentity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/index/index.mjs [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useIdentity(itemId) {
    _s();
    const { data, error, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(itemId ? `/api/identity?itemId=${itemId}` : null);
    return {
        identity: data?.data ?? null,
        isLoading,
        isError: !!error
    };
}
_s(useIdentity, "3etLDUffADz62tD7g9gJKxYxEy4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$index$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/lib/utils/format.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Formata um valor numérico para moeda BRL
 */ __turbopack_context__.s([
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatDateShort",
    ()=>formatDateShort,
    "formatPercentage",
    ()=>formatPercentage,
    "getCategoryColor",
    ()=>getCategoryColor,
    "getInitials",
    ()=>getInitials,
    "getLocalLogo",
    ()=>getLocalLogo,
    "truncate",
    ()=>truncate
]);
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d);
}
function formatDateShort(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(d);
}
function formatPercentage(value) {
    const formatted = Math.abs(value).toFixed(1).replace('.', ',');
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
}
function getCategoryColor(category) {
    const colors = {
        'Serviços': '#3b82f6',
        'Utensílios domésticos': '#f97316',
        'Postos de combustível': '#f97316',
        'Telecomunicações': '#06b6d4',
        'Automotivo': '#f97316',
        'Energia elétrica': '#eab308',
        'Transferência - PIX': '#8b5cf6',
        'Internet': '#06b6d4',
        'Água': '#3b82f6',
        'Alimentação': '#10b981',
        'Saúde': '#ef4444',
        'Lazer': '#ec4899',
        'Educação': '#6366f1',
        'Investimentos': '#10b981',
        'Juros e dividendos': '#10b981',
        'Outros': '#6b7280'
    };
    return colors[category] || '#6b7280';
}
function getInitials(name) {
    return name.split(' ').slice(0, 2).map((n)=>n[0]).join('').toUpperCase();
}
function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}
function getLocalLogo(name) {
    if (!name) return null;
    const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('itau')) return '/logos/logo_itau.png';
    if (normalized.includes('inter') || normalized.includes('gold')) return '/logos/logo_inter.png';
    if (normalized.includes('mercado pago') || normalized.includes('mercadopago')) return '/logos/logo_mercadopago.png';
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/components/shared/ConnectButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConnectButton",
    ()=>ConnectButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-client] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/api.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const PluggyConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/financeiro/node_modules/react-pluggy-connect/dist/module/index.js [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.PluggyConnect), {
    loadableGenerated: {
        modules: [
            "[project]/financeiro/node_modules/react-pluggy-connect/dist/module/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>null
});
_c = PluggyConnect;
function ConnectButton({ onSuccess, onError, className, label, iconOnly = false }) {
    _s();
    const [connectToken, setConnectToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleOpenConnect = async ()=>{
        setIsLoading(true);
        try {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].post('/api/token', {});
            setConnectToken(data.accessToken);
            setIsOpen(true);
        } catch (error) {
            console.error('Error creating token:', error);
            onError?.('Falha ao criar token de conexão');
        } finally{
            setIsLoading(false);
        }
    };
    const handleSuccess = async (_data)=>{
        setIsOpen(false);
        onSuccess?.();
    };
    const handleError = (error)=>{
        console.error('Pluggy Connect error:', error);
        onError?.(error.message || 'Falha na conexão');
        setIsOpen(false);
    };
    const handleClose = ()=>{
        setIsOpen(false);
        setConnectToken(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleOpenConnect,
                disabled: isLoading,
                className: className || 'flex items-center gap-2 rounded-lg bg-[#58a6ff] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#79b8ff] disabled:opacity-50 disabled:cursor-not-allowed',
                children: [
                    isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        size: 16,
                        className: "animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/ConnectButton.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/ConnectButton.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this),
                    !iconOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: isLoading ? 'Conectando...' : label || 'Conectar Conta'
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/shared/ConnectButton.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/components/shared/ConnectButton.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            ("TURBOPACK compile-time value", "object") !== 'undefined' && connectToken && isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PluggyConnect, {
                connectToken: connectToken,
                includeSandbox: true,
                onSuccess: handleSuccess,
                onError: handleError,
                onClose: handleClose
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/shared/ConnectButton.tsx",
                lineNumber: 91,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(ConnectButton, "Ylm25uL/Vqx0rvUQgfl0Y21+GwU=");
_c1 = ConnectButton;
var _c, _c1;
__turbopack_context__.k.register(_c, "PluggyConnect");
__turbopack_context__.k.register(_c1, "ConnectButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/components/layout/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sidebar",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpDown$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/arrow-up-down.js [app-client] (ecmascript) <export default as ArrowUpDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/wallet.js [app-client] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tags$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tags$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/lucide-react/dist/esm/icons/tags.js [app-client] (ecmascript) <export default as Tags>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useItems.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useAccounts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useAccounts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useIdentity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/hooks/useIdentity.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/lib/utils/format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$shared$2f$ConnectButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/shared/ConnectButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/swr/dist/_internal/index.mjs [app-client] (ecmascript) <locals>");
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
;
;
;
;
const navItems = [
    {
        label: 'Visão Geral',
        href: '/',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
            size: 18
        }, void 0, false, {
            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
            lineNumber: 32,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Transações',
        href: '/transactions',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpDown$3e$__["ArrowUpDown"], {
            size: 18
        }, void 0, false, {
            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
            lineNumber: 37,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Contas',
        href: '/accounts',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
            size: 18
        }, void 0, false, {
            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
            lineNumber: 42,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        label: 'Categorias',
        href: '/categories',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tags$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tags$3e$__["Tags"], {
            size: 18
        }, void 0, false, {
            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
            lineNumber: 47,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    }
];
// bottom items removed per design – sidebar will no longer show feedback/support/plan links
const bottomItems = [];
function Sidebar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { items, mutate: mutateItems } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useItems"])();
    const firstItemId = items[0]?.item_id;
    const { identity } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useIdentity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIdentity"])(firstItemId);
    const { accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useAccounts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAccounts"])(firstItemId);
    const { mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useSWRConfig"])();
    const [collapsed, setCollapsed] = __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const displayName = identity?.full_name || identity?.company_name || 'Usuário';
    const email = identity?.emails?.[0]?.value || '';
    const initials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInitials"])(displayName);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col min-h-screen bg-[#161b22] border-r border-[#30363d] shrink-0 overflow-hidden', collapsed ? 'w-16' : 'w-60'),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center border-b border-[#30363d]', collapsed ? 'justify-center px-1 py-5' : 'justify-between px-5 py-5'),
                children: collapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-7 h-7 rounded-md bg-[#58a6ff] flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-black text-xs font-bold",
                                children: "F"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                lineNumber: 86,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                            lineNumber: 85,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setCollapsed(!collapsed),
                            className: "p-1 rounded hover:bg-[#21262d] ml-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                size: 18,
                                className: "text-[#8b949e]"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                lineNumber: 92,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-7 h-7 rounded-md bg-[#58a6ff] flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-black text-xs font-bold",
                                        children: "F"
                                    }, void 0, false, {
                                        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                    lineNumber: 98,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[#e6edf3] font-semibold text-base tracking-tight",
                                    children: "Financeiro"
                                }, void 0, false, {
                                    fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setCollapsed(!collapsed),
                            className: "p-1 rounded hover:bg-[#21262d]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                size: 18,
                                className: "text-[#8b949e]"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                lineNumber: 109,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                            lineNumber: 105,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto",
                children: [
                    !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[#8b949e] text-xs font-medium uppercase tracking-wider px-2 mb-2",
                        children: "Organização"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this),
                    navItems.map((item)=>{
                        const isActive = pathname === item.href;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: item.href,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-3 py-2 rounded-lg text-sm transition-colors', collapsed ? 'justify-center gap-0 px-2' : 'gap-3', isActive ? 'bg-[#21262d] text-[#58a6ff] font-medium' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'),
                            children: [
                                item.icon,
                                !collapsed && item.label
                            ]
                        }, item.href, true, {
                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                            lineNumber: 126,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "my-4 border-t border-[#30363d]"
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    accounts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-2",
                        children: [
                            !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#8b949e] text-xs px-1 mb-1",
                                children: "Contas"
                            }, void 0, false, {
                                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this),
                            accounts.map((acct)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center py-2 rounded-lg text-sm text-[#8b949e]', collapsed ? 'justify-center gap-0 px-2' : 'gap-2 px-3'),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-5 h-5 rounded text-xs flex items-center justify-center text-white font-bold",
                                            style: {
                                                background: '#8b949e'
                                            },
                                            children: acct.name ? acct.name[0] : 'A'
                                        }, void 0, false, {
                                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                            lineNumber: 161,
                                            columnNumber: 17
                                        }, this),
                                        !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate text-xs",
                                            children: acct.name
                                        }, void 0, false, {
                                            fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                            lineNumber: 168,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, acct.account_id, true, {
                                    fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                                    lineNumber: 154,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-3 py-4 border-t border-[#30363d] flex gap-2', collapsed ? 'flex-col items-center' : 'justify-center'),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SyncButton, {
                        iconOnly: collapsed,
                        className: collapsed ? 'p-2' : 'flex-1'
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$shared$2f$ConnectButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConnectButton"], {
                        onSuccess: ()=>mutate(()=>true, undefined, {
                                revalidate: true
                            }),
                        iconOnly: collapsed,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 rounded-lg bg-[#58a6ff] text-black transition-all hover:bg-[#79b8ff] disabled:opacity-50 disabled:cursor-not-allowed', collapsed ? 'p-2' : 'px-4 py-2 text-sm font-semibold flex-1')
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/financeiro/src/app/components/layout/Sidebar.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_s(Sidebar, "/FBDccFKHtZIY9dFxkR015npLHQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useItems$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useItems"],
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useIdentity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIdentity"],
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$hooks$2f$useAccounts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAccounts"],
        __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$swr$2f$dist$2f$_internal$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useSWRConfig"]
    ];
});
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/financeiro/src/app/(main)/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MainLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$providers$2f$SWRProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/providers/SWRProvider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/src/app/components/layout/Sidebar.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function MainLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$providers$2f$SWRProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SWRProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen bg-[#0d1117]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$src$2f$app$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sidebar"], {}, void 0, false, {
                    fileName: "[project]/financeiro/src/app/(main)/layout.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 overflow-auto",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/financeiro/src/app/(main)/layout.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/financeiro/src/app/(main)/layout.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/financeiro/src/app/(main)/layout.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/financeiro/src/app/(main)/layout.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = MainLayout;
var _c;
__turbopack_context__.k.register(_c, "MainLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=financeiro_src_app_2c14d499._.js.map