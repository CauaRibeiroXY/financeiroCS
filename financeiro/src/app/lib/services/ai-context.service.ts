import { getSupabaseAdmin } from '@/app/lib/supabase/client';
import { buildOverview } from './overview';
import { detectRecurrences } from './recurrence';
import type {
  AccountRecord,
  CreditCardBillRecord,
  InvestmentRecord,
  TransactionRecord,
} from '@/app/types/pluggy';

export interface FinancialContext {
  summaryText: string;
  metadata: {
    patrimony: number;
    totalInvestments: number;
    monthlyExpenses: number;
    monthlyIncome: number;
    openBillsTotal: number;
  };
}

export async function buildFinancialAIContext(): Promise<FinancialContext> {
  const supabase = getSupabaseAdmin();

  // Buscar dados em paralelo no Supabase
  const [
    accountsRes,
    transactionsRes,
    billsRes,
    investmentsRes,
    goalsRes,
    fixedExpensesRes,
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('is_ignored', false),
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(300),
    supabase.from('credit_card_bills').select('*'),
    supabase.from('investments').select('*'),
    supabase.from('goals').select('*'),
    supabase.from('fixed_expenses').select('*'),
  ]);

  const accounts = (accountsRes.data || []) as AccountRecord[];
  const transactions = (transactionsRes.data || []) as TransactionRecord[];
  const bills = (billsRes.data || []) as CreditCardBillRecord[];
  const investments = (investmentsRes.data || []) as InvestmentRecord[];
  const goals = goalsRes.data || [];
  const fixedExpenses = fixedExpensesRes.data || [];

  // Data atual e período
  const now = new Date();
  const currentMonthYear = now.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const todayYmd = now.toISOString().split('T')[0];

  // Calcular métricas agregadas via overview service
  const overview = buildOverview(transactions, accounts, bills, investments, {
    now,
  });

  // Detectar recorrências
  const recurrenceAnalysis = detectRecurrences(transactions);
  const recurrences = recurrenceAnalysis.items;

  // 1. Resumo de Contas e Saldos
  const accountSummary = accounts
    .map(
      (a) =>
        `- ${a.name || 'Conta'} (${a.type}): R$ ${Number(a.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    )
    .join('\n');

  // 2. Resumo de Cartões de Crédito e Faturas
  const creditSummary = overview.cards
    .map((c) => {
      const limitStr = c.creditLimit !== null ? `Lim: R$ ${c.creditLimit.toFixed(2)}` : 'Sem limite desc. ';
      const availStr = c.availableCredit !== null ? `Disp: R$ ${c.availableCredit.toFixed(2)}` : '';
      const billStr = c.billTotal !== null ? `Fatura Atual: R$ ${c.billTotal.toFixed(2)} (Venc: ${c.billDueDate || 'N/A'})` : `Gasto Ciclo Atual: R$ ${c.cycleTotal.toFixed(2)}`;
      return `- Cartão ${c.name}: ${billStr} [${limitStr} | ${availStr}]`;
    })
    .join('\n');

  // 3. Top Categorias do Mês
  const topCategories = overview.slices.all.categories
    .slice(0, 7)
    .map(
      (c) =>
        `- ${c.label}: R$ ${c.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Mês anterior: R$ ${c.previous.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
    )
    .join('\n');

  // 4. Recorrências e Gastos Fixos
  const recurrenceSummary = recurrences
    .slice(0, 6)
    .map(
      (r) =>
        `- ${r.label}: R$ ${r.averageAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${r.frequency})`
    )
    .join('\n');

  const fixedExpensesSummary = fixedExpenses
    .map(
      (f) =>
        `- ${f.title}: R$ ${Number(f.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${f.kind || 'Fixa'})`
    )
    .join('\n');

  // 5. Metas
  const goalsSummary = goals
    .map((g) => {
      const target = Number(g.target_amount || 0);
      const current = Number(g.current_amount || 0);
      const pct = target > 0 ? ((current / target) * 100).toFixed(1) : '0';
      return `- Meta "${g.title || g.name}": R$ ${current.toLocaleString('pt-BR')} de R$ ${target.toLocaleString('pt-BR')} (${pct}%)`;
    })
    .join('\n');

  // 6. Últimos Lançamentos (Top 20)
  const recentTransactions = transactions
    .slice(0, 20)
    .map((t) => {
      const typeStr = t.type === 'CREDIT' ? 'RECEITA (+)' : 'DESPESA (-)';
      const amt = Math.abs(Number(t.amount || 0)).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      });
      const cat = t.category ? `[${t.category}]` : '';
      return `${t.date} | ${typeStr} | R$ ${amt} | ${t.description || 'Sem descrição'} ${cat}`;
    })
    .join('\n');

  const summaryText = `
=== RESUMO FINANCEIRO DO USUÁRIO ===
Data Atual da Consulta: ${todayYmd} (${currentMonthYear})

--- PATRIMÔNIO E INVESTIMENTOS ---
- Saldo Total em Contas: R$ ${overview.balances.patrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Total Investido: R$ ${overview.balances.totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Total Faturas Abertas (Cartões): R$ ${overview.balances.openBillsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

--- CONTAS BANCÁRIAS E SALDOS ---
${accountSummary || 'Nenhuma conta cadastrada'}

--- CARTÕES DE CRÉDITO ---
${creditSummary || 'Nenhum cartão cadastrado'}

--- MÊS ATUAL (${currentMonthYear}) ---
- Total de Receitas/Entradas: R$ ${Number(overview.slices.all.totalIncome || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Total de Despesas/Saídas: R$ ${overview.slices.all.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Resultado Parcial do Mês: R$ ${Number(overview.slices.all.partialResult || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Comparação com Mês Anterior até o mesmo dia: R$ ${overview.slices.all.previousExpensesToDate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

--- PRINCIPAIS GASTOS POR CATEGORIA (MÊS ATUAL) ---
${topCategories || 'Sem gastos por categoria'}

--- ASSINATURAS E GASTOS RECORRENTES DETECTADOS ---
${recurrenceSummary || 'Nenhum gasto recorrente detectado'}

--- COMPROMISSOS E GASTOS FIXOS ---
${fixedExpensesSummary || 'Nenhum gasto fixo cadastrado'}

--- METAS FINANCEIRAS ---
${goalsSummary || 'Nenhuma meta cadastrada'}

--- ÚLTIMAS TRANSAÇÕES REGISTRADAS (RECENTES) ---
${recentTransactions || 'Nenhuma transação recente'}
`.trim();

  return {
    summaryText,
    metadata: {
      patrimony: overview.balances.patrimony,
      totalInvestments: overview.balances.totalInvestments,
      monthlyExpenses: overview.slices.all.totalExpenses,
      monthlyIncome: overview.slices.all.totalIncome || 0,
      openBillsTotal: overview.balances.openBillsTotal,
    },
  };
}
