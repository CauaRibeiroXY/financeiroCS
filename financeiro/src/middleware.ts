import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rotas de API públicas, casadas por caminho EXATO.
 *
 * São as que precisam funcionar sem sessão:
 *   - /api/login e /api/logout gerenciam a própria sessão;
 *   - /api/webhook e /api/pluggy-webhook são chamadas pela Pluggy, de fora,
 *     sem cookie.
 *
 * Casamento exato de propósito: com `startsWith`, um caminho como
 * `/api/loginqualquercoisa` também passaria.
 */
const PUBLIC_API_PATHS = new Set([
    '/api/login',
    '/api/logout',
    '/api/webhook',
    '/api/pluggy-webhook',
]);

/** Páginas públicas — prefixo, porque /login aceita query string. */
const PUBLIC_PAGE_PREFIXES = ['/login'];

/**
 * O Vercel Cron envia `Authorization: Bearer $CRON_SECRET` quando a variável
 * CRON_SECRET existe no projeto. Sem ela definida não há como distinguir o
 * agendador de um visitante qualquer, então a rota cai na exigência de sessão
 * — e o cron passa a falhar até que a variável seja configurada.
 */
function isAuthorizedCron(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    return request.headers.get('authorization') === `Bearer ${secret}`;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isApi = pathname.startsWith('/api/');

    // 1. Rotas públicas
    const isPublic = isApi
        ? PUBLIC_API_PATHS.has(pathname)
        : PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p));

    if (isPublic) {
        return NextResponse.next();
    }

    // 2. Cron disparado pelo agendador do Vercel.
    //    Sem o segredo, segue para a checagem de sessão abaixo — é o que
    //    permite acionar o sync manualmente pelo botão da interface.
    if (pathname.startsWith('/api/cron/') && isAuthorizedCron(request)) {
        return NextResponse.next();
    }

    // 3. Sessão
    const authCookie = request.cookies.get('auth');

    if (!authCookie) {
        // Em API, redirecionar para /login devolveria o HTML da página de login
        // com status 200, e o cliente interpretaria como sucesso. 401 é o correto.
        if (isApi) {
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Redireciona para /login mantendo a URL de destino como query param
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Captura páginas E rotas de API.
     *
     * Antes o matcher excluía `api/`, o que deixava toda a API aberta: qualquer
     * pessoa com o domínio lia contas, saldos e transações sem senha, e podia
     * disparar o sync em looping consumindo a cota da Pluggy. O cookie protegia
     * apenas as páginas.
     *
     * Ficam de fora apenas os estáticos, que não passam por autenticação.
     */
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
