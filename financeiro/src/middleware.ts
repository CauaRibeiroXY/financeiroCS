import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Aplicar proteção apenas em rotas de API
    if (request.nextUrl.pathname.startsWith('/api')) {
        const authHeader = request.headers.get('Authorization');
        const envPassword = process.env.APP_PASSWORD;

        if (!envPassword) {
            // Falha segura se a variável não estiver definida
            return NextResponse.json(
                { error: 'Configuração do servidor ausente: APP_PASSWORD não está definida.' },
                { status: 500 }
            );
        }

        // Verificar se o cabeçalho Authorization está presente e é válido
        const isValid = authHeader === `Bearer ${envPassword}` || authHeader === envPassword;

        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

// Configuração do Matcher para interceptar todas as chamadas de API
export const config = {
    matcher: '/api/:path*',
};
