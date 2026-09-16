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
      model: data?.model || 'gemini-2.5-flash',
      source: data?.api_key ? 'database' : 'env',
    });
  } catch (err: any) {
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

    const supabase = getSupabaseAdmin();

    // Upsert na tabela ai_settings no Supabase
    const { error } = await supabase.from('ai_settings').upsert({
      id: 'default',
      api_key: apiKey ? apiKey.trim() : null,
      model: model || 'gemini-2.5-flash',
      updated_at: new Date().toISOString(),
    });

    if (error) {
      // Se der erro por falta da tabela ai_settings no Postgres, instruímos a criar ou tratamos
      console.warn('Erro ao salvar em ai_settings no Supabase:', error.message);
      return NextResponse.json(
        {
          error:
            'Não foi possível salvar no banco de dados. A chave será usada nesta sessão. Certifique-se de que a tabela ai_settings exista ou use GEMINI_API_KEY no servidor.',
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações da IA salvas com sucesso para todos os seus dispositivos!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao salvar configurações da IA.' },
      { status: 500 }
    );
  }
}
