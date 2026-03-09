(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__2726ea98._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/financeiro/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/financeiro/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
// Rotas que NUNCA devem ser bloqueadas
const PUBLIC_PATHS = [
    '/login',
    '/api/login',
    '/api/logout',
    '/api/webhook'
];
function middleware(request) {
    const { pathname } = request.nextUrl;
    // Libera rotas públicas imediatamente (sem qualquer verificação)
    if (PUBLIC_PATHS.some((p)=>pathname.startsWith(p))) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Verifica cookie httpOnly "auth"
    const authCookie = request.cookies.get('auth');
    if (!authCookie) {
        // Redireciona para /login mantendo a URL de destino como query param
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$financeiro$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    /*
     * Captura APENAS páginas (não arquivos estáticos, não _next, não APIs).
     * As APIs ficam fora do matcher — o middleware nunca as toca,
     * exceto /api/login e /api/logout que já estão em PUBLIC_PATHS como fallback.
     */ matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__2726ea98._.js.map