import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase/client';
import { analyzePortfolio, DEFAULT_ASSUMPTIONS } from '@/app/lib/services/portfolio';
import type { InvestmentRecord } from '@/app/types/pluggy';

export const runtime = 'nodejs';
export const maxDuration = 30;

/** Lê um número da query, caindo no default quando ausente ou inválido. */
function readNumber(
  params: URLSearchParams,
  key: string,
  fallback: number,
  { min, max }: { min: number; max: number }
): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/**
 * Carteira consolidada e projeção.
 *
 * As premissas da projeção (CDI, IPCA, retorno de renda variável, aporte,
 * horizonte) vêm por query param porque são escolha do usuário, não dado do
 * banco — a interface expõe cada uma delas junto do resultado.
 *
 * Query params (todos opcionais):
 * - `cdi`, `ipca`, `equity`  taxas anuais em % (ex.: `10.5`)
 * - `contribution`           aporte mensal em reais
 * - `months`                 horizonte da projeção
 * - `spread`                 largura da banda de cenários em % (ex.: `25`)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const assumptions = {
      cdi: readNumber(searchParams, 'cdi', DEFAULT_ASSUMPTIONS.cdi * 100, { min: 0, max: 100 }) / 100,
      ipca: readNumber(searchParams, 'ipca', DEFAULT_ASSUMPTIONS.ipca * 100, { min: 0, max: 100 }) / 100,
      equity:
        readNumber(searchParams, 'equity', DEFAULT_ASSUMPTIONS.equity * 100, { min: -50, max: 100 }) / 100,
      monthlyContribution: readNumber(searchParams, 'contribution', 0, { min: 0, max: 10_000_000 }),
      months: Math.round(readNumber(searchParams, 'months', DEFAULT_ASSUMPTIONS.months, { min: 1, max: 480 })),
      scenarioSpread:
        readNumber(searchParams, 'spread', DEFAULT_ASSUMPTIONS.scenarioSpread * 100, {
          min: 0,
          max: 90,
        }) / 100,
    };

    const { data, error } = await supabaseAdmin.from('investments').select('*');
    if (error) throw new Error(error.message);

    const result = analyzePortfolio((data ?? []) as InvestmentRecord[], assumptions);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
