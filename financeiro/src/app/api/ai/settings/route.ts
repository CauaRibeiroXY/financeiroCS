import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase/client';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Tentar buscar as configurações salvas no Supabase
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    const sanitize = (m?: string | null) => {
      if (!m || m.startsWith('gemini-3.') || m === 'gemini-flash-latest') return 'gemini-2.5-flash';
      return m;
    };

    if (error && error.code !== 'PGRST116') {
      // Se a tabela ai_settings ainda não existir no Supabase, usa fallback do servidor
      return NextResponse.json({
        apiKey: process.env.GEMINI_API_KEY || '',
        model: 'gemini-2.5-flash',
        source: 'env',
      });
    }

    return NextResponse.json({
      apiKey: data?.api_key || process.env.GEMINI_API_KEY || '',
      model: sanitize(data?.model),
      source: data?.api_key ? 'database' : 'env',
    });
  } catch {
    return NextResponse.json({
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.5-flash',
      source: 'env',
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model } = body;

    const sanitize = (m?: string | null) => {
      if (!m || m.startsWith('gemini-3.') || m === 'gemini-flash-latest') return 'gemini-2.5-flash';
      return m;
    };

    const supabase = getSupabaseAdmin();

    // Upsert na tabela ai_settings no Supabase
    const { error } = await supabase.from('ai_settings').upsert({
      id: 'default',
      api_key: apiKey ? apiKey.trim() : null,
      model: sanitize(model),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Erro ao salvar em ai_settings no Supabase:', error.message);
      return NextResponse.json(
        {
          error:
            'Não foi possível salvar no banco de dados. A chave será usada nesta sessão local.',
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações da IA salvas com sucesso para todos os seus dispositivos!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar configurações da IA.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
