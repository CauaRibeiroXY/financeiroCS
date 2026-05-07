import { NextResponse } from 'next/server';

export async function GET() {
    // A própria requisição já terá passado pelo middleware de verificação,
    // ou seja, se chegar aqui a senha é válida.
    return NextResponse.json({ success: true, message: 'Autenticado com sucesso' });
}
