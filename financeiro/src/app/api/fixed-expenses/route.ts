import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase/client';
import {
  addMonths,
  currentPeriod,
  detectCommitments,
  type ManualExpenseRow,
} from '@/app/lib/services/commitments';
import { fetchAllTransactions, fetchConsideredAccounts } from '@/app/lib/services/ledger-source';

export const runtime = 'nodejs';
export const maxDuration = 30;

/** Chaves pagas no formato `${key}|${period}`. Tolera a tabela ainda não existir. */
async function fetchPaidKeys(): Promise<Set<string>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('fixed_expense_payments')
      .select('expense_key, period');
    if (error || !data) return new Set();
    return new Set(data.map((r: { expense_key: string; period: string }) => `${r.expense_key}|${r.period}`));
  } catch {
    return new Set();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get('period') ?? currentPeriod();
    const projectionMonths = Number(searchParams.get('months')) || 15;
    /** Primeiro mês da barra de navegação — fixo, independente do mês selecionado. */
    const projectionStart = searchParams.get('from') ?? addMonths(currentPeriod(), -3);
    /** Meses de histórico usados para provar a recorrência. */
    const lookback = Number(searchParams.get('lookback')) || 12;

    // A janela cobre o histórico que prova a recorrência e vai até o fim da
    // projeção, para pegar as parcelas futuras que a Pluggy já devolve como
    // PENDING. Ancorada no menor dos dois períodos, já que dá para navegar
    // para trás do mês corrente.
    const earliest = period < projectionStart ? period : projectionStart;
    const fromDate = `${addMonths(earliest, -lookback)}-01T00:00:00.000Z`;
    const toDate = `${addMonths(projectionStart, projectionMonths + 12)}-01T00:00:00.000Z`;

    const [manualRes, accountsRes, transactions, paidKeys] = await Promise.all([
      supabaseAdmin.from('fixed_expenses').select('*').order('due_day', { ascending: true }),
      fetchConsideredAccounts(),
      fetchAllTransactions(fromDate, toDate),
      fetchPaidKeys(),
    ]);

    if (manualRes.error) {
      return NextResponse.json({ success: false, error: manualRes.error.message }, { status: 500 });
    }

    const result = detectCommitments(
      transactions,
      accountsRes,
      (manualRes.data ?? []) as ManualExpenseRow[],
      { period, projectionStart, projectionMonths, paidKeys }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/** Cadastra um gasto fixo manual. */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const row = {
      kind: 'MANUAL',
      title: String(body.title ?? '').trim(),
      amount: Number(body.amount ?? 0),
      due_day: Number(body.due_day) || 10,
      category: body.category || 'Outros',
      // Preenchido quando o manual deve substituir um item detectado
      merchant_key: body.merchant_key ? String(body.merchant_key) : null,
      end_date: body.end_date || null,
      is_active: true,
      is_muted: false,
    };

    if (!row.title) {
      return NextResponse.json({ success: false, error: 'Título obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('fixed_expenses')
      .insert([row])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Marca/desmarca um compromisso como pago no período.
 *
 * O pagamento é registrado por período — um `is_paid` único na linha não
 * consegue representar "paguei agosto mas setembro está aberto".
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const key = String(body.key ?? '');
    const period = String(body.period ?? currentPeriod());
    const paid = body.paid !== false;

    if (!key) {
      return NextResponse.json({ success: false, error: 'key obrigatória' }, { status: 400 });
    }

    if (paid) {
      const { error } = await supabaseAdmin
        .from('fixed_expense_payments')
        .upsert([{ expense_key: key, period, amount: Number(body.amount ?? 0) }], {
          onConflict: 'expense_key,period',
        });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from('fixed_expense_payments')
        .delete()
        .eq('expense_key', key)
        .eq('period', period);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Remove um manual, ou silencia um item detectado automaticamente.
 *
 * Itens automáticos não existem como linha: são recalculados a cada request.
 * Para "apagar" um deles gravamos uma linha silenciada com a `merchant_key`,
 * que o detector passa a ignorar.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    const key = searchParams.get('key');

    if (!id && !key) {
      return NextResponse.json({ success: false, error: 'id ou key ausente' }, { status: 400 });
    }

    const isAuto = Boolean(key && (key.startsWith('rec:') || key.startsWith('inst:')));

    if (isAuto) {
      const rawKey = key!.replace(/^(rec|inst):/, '');
      const { error } = await supabaseAdmin.from('fixed_expenses').insert([
        {
          kind: 'MANUAL',
          title: searchParams.get('title') || `Ignorado: ${rawKey}`,
          amount: 0,
          due_day: 1,
          merchant_key: rawKey,
          is_muted: true,
          is_active: false,
        },
      ]);
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, muted: rawKey });
    }

    const manualId = id?.replace(/^manual:/, '');
    if (!manualId || !/^\d+$/.test(manualId)) {
      return NextResponse.json({ success: false, error: 'id inválido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('fixed_expenses').delete().eq('id', manualId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
