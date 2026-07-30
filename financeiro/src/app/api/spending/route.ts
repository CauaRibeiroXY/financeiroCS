import { NextRequest, NextResponse } from 'next/server';
import { addMonths, currentPeriod } from '@/app/lib/services/commitments';
import { fetchAllTransactions, fetchConsideredAccounts } from '@/app/lib/services/ledger-source';
import { analyzeSpending, type GroupBy } from '@/app/lib/services/spending';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Principais gastos do mês, agrupados por categoria ou por empresa.
 *
 * Query params:
 * - `period`  YYYY-MM, mês de referência (default: mês corrente)
 * - `groupBy` 'category' | 'merchant' (default: 'category')
 * - `window`  meses da janela usada para média e evolução (default: 6)
 * - `limit`   quantos grupos retornar (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const period = searchParams.get('period') ?? currentPeriod();
    const groupByParam = searchParams.get('groupBy');
    const groupBy: GroupBy = groupByParam === 'merchant' ? 'merchant' : 'category';
    const windowMonths = Math.min(24, Math.max(2, Number(searchParams.get('window')) || 6));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));

    // A janela termina no mês de referência, mas a busca começa um mês antes do
    // início dela para o cálculo de variação ter base de comparação.
    const fromDate = `${addMonths(period, -windowMonths)}-01T00:00:00.000Z`;
    const toDate = `${addMonths(period, 1)}-01T00:00:00.000Z`;

    const [accounts, transactions] = await Promise.all([
      fetchConsideredAccounts(),
      fetchAllTransactions(fromDate, toDate),
    ]);

    const result = analyzeSpending(transactions, accounts, {
      period,
      groupBy,
      windowMonths,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
