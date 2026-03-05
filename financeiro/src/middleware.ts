import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const envPassword = process.env.APP_PASSWORD;

    if (!envPassword) {
        return NextResponse.json(
            { error: 'APP_PASSWORD não está definida.' },
            { status: 500 }
        );
    }

    // LIBERA WEBHOOK
    if (pathname.startsWith('/api/webhook')) {
        return NextResponse.next();
    }

    // Protege páginas (não APIs)
    if (!pathname.startsWith('/api')) {
        const authHeader = request.headers.get('Authorization');

        const isValid =
            authHeader === `Bearer ${envPassword}` ||
            authHeader === envPassword;

        if (!isValid) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!_next|favicon.ico).*)',
};