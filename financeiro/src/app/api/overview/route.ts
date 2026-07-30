import { NextRequest, NextResponse } from 'next/server';
import { addMonths, currentPeriod } from '@/app/lib/services/commitments';
import {
  fetchAllBills,
  fetchAllTransactions,
  fetchConsideredAccounts,
  fetchInvestments,
} from '@/app/lib/services/ledger-source';
import { buildOverview } from '@/app/lib/services/overview';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Números da Visão Geral, com o corte por tipo de conta.
 *
 * Devolve os quatro recortes de uma vez (tudo, conta corrente, cartão por mês e
 * cartão por fatura). O custo pesado — buscar as transações e normalizá-las — é
 * o mesmo para qualquer recorte, e uma resposta só garante que
 * `conta + cartão = tudo`, o que três requisições em instantes diferentes não
 * conseguem garantir. Como efeito colateral, trocar de aba não refaz fetch.
 *
 * Query params:
 * - `period`  YYYY-MM (default: mês corrente)
 * - `window`  meses da linha do tempo (default: 6, máx. 12)
 * - `limit`   categorias por recorte (default: 10)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const period = searchParams.get('period') ?? currentPeriod();
    const windowMonths = Math.min(12, Math.max(2, Number(searchParams.get('window')) || 6));
    const limit = Math.min(30, Math.max(1, Number(searchParams.get('limit')) || 10));

    // Um mês a mais para trás do que a janela pede: um ciclo de fatura rotulado
    // como agosto contém compras do fim de junho.
    const fromDate = `${addMonths(period, -(windowMonths + 1))}-01T00:00:00.000Z`;
    // E para frente, para as faturas futuras que a Pluggy já projeta.
    const toDate = `${addMonths(period, 2)}-01T00:00:00.000Z`;

    const accounts = await fetchConsideredAccounts();

    const [transactions, bills, investments] = await Promise.all([
      fetchAllTransactions(fromDate, toDate),
      fetchAllBills(accounts),
      fetchInvestments(),
    ]);

    const result = buildOverview(transactions, accounts, bills, investments, {
      period,
      windowMonths,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
