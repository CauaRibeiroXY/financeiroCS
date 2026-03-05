import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que NUNCA devem ser bloqueadas
const PUBLIC_PATHS = ['/login', '/api/login', '/api/logout', '/api/webhook'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Libera rotas públicas imediatamente (sem qualquer verificação)
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Verifica cookie httpOnly "auth"
    const authCookie = request.cookies.get('auth');

    if (!authCookie) {
        // Redireciona para /login mantendo a URL de destino como query param
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Captura APENAS páginas (não arquivos estáticos, não _next, não APIs).
     * As APIs ficam fora do matcher — o middleware nunca as toca,
     * exceto /api/login e /api/logout que já estão em PUBLIC_PATHS como fallback.
     */
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
};