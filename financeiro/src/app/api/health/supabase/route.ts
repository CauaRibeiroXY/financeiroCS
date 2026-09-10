import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

// Tabelas centrais do app. Se o banco responde mas alguma delas falta,
// o problema é de schema (migration), não de conexão.
const CORE_TABLES = [
  'accounts',
  'transactions',
  'pluggy_items',
  'categories',
  'goals',
] as const;

const QUERY_TIMEOUT_MS = 8000;

type TableCheck = {
  table: string;
  ok: boolean;
  rows: number | null;
  error: string | null;
};

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !key && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        status: 'misconfigured',
        message: `Variáveis de ambiente ausentes: ${missing.join(', ')}`,
        latencyMs: 0,
        tables: [],
      },
      { status: 503 }
    );
  }

  const startedAt = Date.now();

  try {
    // Import dinâmico: o client faz throw no topo do módulo se faltar env,
    // e aqui já validamos acima — assim o erro vira JSON em vez de 500 opaco.
    const { supabaseAdmin } = await import('@/app/lib/supabase/client');

    const tables: TableCheck[] = await Promise.all(
      CORE_TABLES.map(async (table) => {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'estimated', head: true })
          .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));

        return {
          table,
          ok: !error,
          rows: error ? null : (count ?? 0),
          error: error?.message ?? null,
        };
      })
    );

    const latencyMs = Date.now() - startedAt;
    const failed = tables.filter((t) => !t.ok);

    if (failed.length === tables.length) {
      return NextResponse.json(
        {
          ok: false,
          status: 'unreachable',
          message: `Não foi possível consultar o banco: ${failed[0].error}`,
          latencyMs,
          tables,
        },
        { status: 503 }
      );
    }

    if (failed.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          status: 'degraded',
          message: `Conectado, mas ${failed.length} de ${tables.length} tabelas falharam: ${failed
            .map((t) => t.table)
            .join(', ')}`,
          latencyMs,
          tables,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: 'healthy',
      message: `Conectado — ${tables.length} tabelas acessíveis`,
      latencyMs,
      tables,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase health check failed:', error);

    return NextResponse.json(
      {
        ok: false,
        status: 'unreachable',
        message,
        latencyMs: Date.now() - startedAt,
        tables: [],
      },
      { status: 503 }
    );
  }
}
