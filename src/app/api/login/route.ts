import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const { password } = await request.json();

    const serverPassword = process.env.APP_PASSWORD;

    if (!serverPassword) {
        return NextResponse.json(
            { error: 'APP_PASSWORD não configurada no servidor.' },
            { status: 500 }
        );
    }

    if (password !== serverPassword) {
        return NextResponse.json(
            { error: 'Senha incorreta.' },
            { status: 401 }
        );
    }

    // Senha correta → cria cookie httpOnly seguro
    const response = NextResponse.json({ ok: true });

    response.cookies.set('auth', 'authenticated', {
        httpOnly: true,                         // não acessível via JS no browser
        secure: process.env.NODE_ENV === 'production', // HTTPS apenas em prod
        sameSite: 'strict',                     // não enviado em requests cross-site
        path: '/',                              // válido em todo o site
        maxAge: 60 * 60 * 24 * 7,              // 7 dias
    });

    return response;
}
