import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ ok: true });

    // Remove o cookie "auth" zerando o maxAge
    response.cookies.set('auth', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });

    return response;
}
