import { NextResponse } from 'next/server';

interface GoogleGeminiModel {
  name: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { apiKey: clientApiKey } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API do Gemini não fornecida.' },
        { status: 400 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Falha ao buscar a lista de modelos do Google.';
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.error?.message || errorMessage;
      } catch {}

      return NextResponse.json(
        { error: `Erro na API do Google: ${errorMessage}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawModels: GoogleGeminiModel[] = data.models || [];

    // Filtrar apenas modelos que suportam geração de conteúdo (chat)
    const chatModels = rawModels
      .filter((m: GoogleGeminiModel) =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent')
      )
      .map((m: GoogleGeminiModel) => {
        // O campo 'name' da API vem no formato "models/gemini-1.5-flash"
        const cleanId = m.name.replace(/^models\//, '');
        return {
          id: cleanId,
          fullId: m.name,
          name: m.displayName || cleanId,
          description: m.description || '',
        };
      });

    return NextResponse.json({ models: chatModels });
  } catch (err: unknown) {
    console.error('Erro na rota /api/ai/models:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro interno ao consultar lista de modelos.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
