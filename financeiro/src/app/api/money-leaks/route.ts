import { NextRequest, NextResponse } from 'next/server';
import { addMonths, currentPeriod } from '@/app/lib/services/commitments';
import { fetchAllTransactions, fetchConsideredAccounts } from '@/app/lib/services/ledger-source';
import { detectMoneyLeaks } from '@/app/lib/services/money-leaks';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Análise de onde o usuário está perdendo dinheiro ("Ralos Financeiros").
 *
 * Query params:
 * - `period` YYYY-MM (default: mês corrente)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get('period') ?? currentPeriod();

    // Buscar histórico de até 4 meses anteriores para cálculo de linha de base histórica
    // e diferenciação precisa entre despesas rotineiras crônicas vs viagens/eventos pontuais
    const fromDate = `${addMonths(period, -4)}-01T00:00:00.000Z`;
    const toDate = `${addMonths(period, 1)}-01T00:00:00.000Z`;

    const [accounts, transactions] = await Promise.all([
      fetchConsideredAccounts(),
      fetchAllTransactions(fromDate, toDate),
    ]);

    const result = detectMoneyLeaks(transactions, accounts, { period });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro na rota /api/money-leaks:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao detectar vazamentos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
