import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ libera webhook
    if (pathname.startsWith('/api/webhook')) {
        return NextResponse.next();
    }

    // 🔒 protege apenas páginas específicas
    if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin')
    ) {
        const authHeader = request.headers.get('authorization');
        const password = process.env.APP_PASSWORD;

        if (!password) {
            return new NextResponse('APP_PASSWORD não definida', { status: 500 });
        }

        if (authHeader !== `Bearer ${password}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/api/webhook'],
};