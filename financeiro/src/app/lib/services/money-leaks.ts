import type { AccountRecord, TransactionRecord } from '@/app/types/pluggy';
import {
  addMonths,
  currentPeriod,
  displayTitle,
  normalizeOutflows,
  type NormalizedTx,
} from './commitments';
import { translateCategory } from './categories-pt';

export type LeakSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type LeakCategory =
  | 'BANK_FEES'          // Tarifas, IOF, juros, multas, anuidade
  | 'SUBSCRIPTIONS'      // Assinaturas e serviços recorrentes acumulados
  | 'MICRO_EXPENSES'     // Efeito cafezinho / micro-gastos repetitivos
  | 'DELIVERY_TRANSPORT' // Apps de entrega e transporte (iFood, Uber, etc.)
  | 'EXPENSE_SURGE'      // Categorias com estouro expressivo vs mês anterior
  | 'LARGE_OUTLIERS';    // Maiores compras atípicas do mês

export interface LeakTransaction {
  id?: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  accountType?: string;
}

export interface MoneyLeakItem {
  id: string;
  category: LeakCategory;
  title: string;
  description: string;
  amount: number;
  previousAmount?: number;
  occurrences: number;
  severity: LeakSeverity;
  actionTip: string;
  transactions: LeakTransaction[];
}

export interface MoneyLeaksAnalysis {
  period: string;
  totalExpenses: number;
  totalLeakingAmount: number;
  potentialAnnualSavings: number;
  leakScore: number; // 0 a 100
  leakingPercentage: number;
  items: MoneyLeakItem[];
  byCategoryTotals: Record<LeakCategory, number>;
  insights: string[];
}

export interface MoneyLeaksOptions {
  period?: string;
}

// Padrões de tarifas bancárias, juros, IOF, encargos e multas
const BANK_FEE_PATTERN =
  /\b(tarifa|iof|juros|multa|anuidade|encargo|encargos|pacote\s?serv|manutencao\s?conta|taxa\s?de\s?servico|taxa\s?manut|avalia\w*\s*emerg|doc\/ted|ted\/doc)\b/i;

// Padrões de apps de delivery e transporte
const DELIVERY_TRANSPORT_PATTERN =
  /\b(ifood|ifd|uber|99app|99\s?pop|rappi|ze\s?delivery|carrefour\s?delivery|cornershop)\b/i;

// Padrões de assinaturas conhecidas
const SUBSCRIPTION_PATTERN =
  /\b(netflix|spotify|hbomax|hbo\s?max|amazon\s?prime|prime\s?video|disney|star\s?plus|globoplay|paramount|crunchyroll|deezer|youtube\s?premium|ytb\s?premium|google\s?one|icloud|apple\s?music|openai|chatgpt|claude\s?ai|github|smart\s?fit|smartfit|bluefit|bodytech)\b/i;

/**
 * Detecta onde o usuário está perdendo dinheiro ("Ralos Financeiros").
 */
export function detectMoneyLeaks(
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  options: MoneyLeaksOptions = {}
): MoneyLeaksAnalysis {
  const period = options.period ?? currentPeriod();
  const previousPeriod = addMonths(period, -1);

  const { outflows } = normalizeOutflows(transactions, accounts);

  const currentOutflows = outflows.filter((o) => o.period === period);
  const previousOutflows = outflows.filter((o) => o.period === previousPeriod);

  const totalExpenses = currentOutflows.reduce((sum, o) => sum + o.amount, 0);

  const items: MoneyLeakItem[] = [];

  // --------------------------------------------------------------------------
  // 1. TARIFAS BANCÁRIAS, JUROS, IOF E ANUIDADES (CRÍTICO - 100% Evitável)
  // --------------------------------------------------------------------------
  const feeTxs = currentOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    return BANK_FEE_PATTERN.test(desc) || BANK_FEE_PATTERN.test(cat);
  });

  if (feeTxs.length > 0) {
    const totalFees = feeTxs.reduce((s, t) => s + t.amount, 0);
    items.push({
      id: 'leak-bank-fees',
      category: 'BANK_FEES',
      title: 'Tarifas Bancárias, IOF e Juros',
      description: `${feeTxs.length} lançamento(s) de tarifas, juros de cartão ou impostos bancários somando R$ ${totalFees.toFixed(2)}.`,
      amount: Number(totalFees.toFixed(2)),
      occurrences: feeTxs.length,
      severity: 'CRITICAL',
      actionTip:
        'Solicite a portabilidade ou a adesão ao Pacote de Serviços Essenciais Gratuito do Banco Central (Resolução 3.919) para zerar tarifas de conta. Negocie isenção de anuidade no cartão e evite o rotativo.',
      transactions: feeTxs.map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 2. EFEITO CAFEZINHO / MICRO-GASTOS REPETITIVOS (<= R$ 40)
  // --------------------------------------------------------------------------
  // Despesas pequenas (R$ 3 a R$ 40) repetidas muitas vezes
  const microTxs = currentOutflows.filter((o) => o.amount >= 3 && o.amount <= 40);
  if (microTxs.length >= 6) {
    const totalMicro = microTxs.reduce((s, t) => s + t.amount, 0);
    const avgMicro = totalMicro / microTxs.length;
    items.push({
      id: 'leak-micro-expenses',
      category: 'MICRO_EXPENSES',
      title: 'Efeito Cafezinho (Micro-gastos Repetitivos)',
      description: `Foram ${microTxs.length} pequenas compras (média de R$ ${avgMicro.toFixed(2)}) de valor até R$ 40,00, totalizando R$ ${totalMicro.toFixed(2)} que saíram quase sem você perceber.`,
      amount: Number(totalMicro.toFixed(2)),
      occurrences: microTxs.length,
      severity: microTxs.length >= 14 || totalMicro >= 300 ? 'WARNING' : 'INFO',
      actionTip:
        'Pequenas compras diárias somam montantes altos no final do mês. Defina uma mesada/limite semanal para pequenos gastos do dia a dia e prefira pagar no débito ou dinheiro.',
      transactions: microTxs.slice(0, 20).map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 3. APPS DE DELIVERY E TRANSPORTE (iFood, Uber, 99, etc.)
  // --------------------------------------------------------------------------
  const deliveryTxs = currentOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    return DELIVERY_TRANSPORT_PATTERN.test(desc) || DELIVERY_TRANSPORT_PATTERN.test(cat);
  });

  if (deliveryTxs.length >= 4 || deliveryTxs.reduce((s, t) => s + t.amount, 0) >= 150) {
    const totalDelivery = deliveryTxs.reduce((s, t) => s + t.amount, 0);
    const prevDeliveryTxs = previousOutflows.filter((o) => {
      const desc = o.tx.description ?? '';
      const cat = o.tx.category ?? '';
      return DELIVERY_TRANSPORT_PATTERN.test(desc) || DELIVERY_TRANSPORT_PATTERN.test(cat);
    });
    const prevTotalDelivery = prevDeliveryTxs.reduce((s, t) => s + t.amount, 0);

    items.push({
      id: 'leak-delivery-transport',
      category: 'DELIVERY_TRANSPORT',
      title: 'Conveniência Excessiva: Delivery e Caronas por App',
      description: `Total de R$ ${totalDelivery.toFixed(2)} gastos em ${deliveryTxs.length} pedidos e corridas (iFood, Uber, etc.).`,
      amount: Number(totalDelivery.toFixed(2)),
      previousAmount: prevTotalDelivery > 0 ? Number(prevTotalDelivery.toFixed(2)) : undefined,
      occurrences: deliveryTxs.length,
      severity: totalDelivery >= 450 || deliveryTxs.length >= 12 ? 'WARNING' : 'INFO',
      actionTip:
        'Estipule dias específicos para pedir delivery (ex: apenas no final de semana) e compare preços de corridas com antecedência. Reduzir 3 pedidos no mês pode gerar economia imediata de mais de R$ 150.',
      transactions: deliveryTxs.map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 4. ASSINATURAS E STREAMINGS RECORRENTES ACUMULADOS
  // --------------------------------------------------------------------------
  const subscriptionTxs = currentOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    return SUBSCRIPTION_PATTERN.test(desc);
  });

  // Agrupar assinaturas por nome simplificado
  const subGroupMap = new Map<string, NormalizedTx[]>();
  for (const tx of subscriptionTxs) {
    const key = oBrandKey(tx.tx.description || '');
    const list = subGroupMap.get(key) || [];
    list.push(tx);
    subGroupMap.set(key, list);
  }

  if (subscriptionTxs.length >= 2 || subscriptionTxs.reduce((s, t) => s + t.amount, 0) >= 100) {
    const totalSubs = subscriptionTxs.reduce((s, t) => s + t.amount, 0);
    const annualSubs = totalSubs * 12;
    items.push({
      id: 'leak-subscriptions',
      category: 'SUBSCRIPTIONS',
      title: 'Acúmulo de Assinaturas e Serviços Digitais',
      description: `${subGroupMap.size} serviço(s) e assinatura(s) somam R$ ${totalSubs.toFixed(2)}/mês (projeção de R$ ${annualSubs.toFixed(2)} por ano).`,
      amount: Number(totalSubs.toFixed(2)),
      occurrences: subscriptionTxs.length,
      severity: totalSubs >= 200 || subGroupMap.size >= 4 ? 'WARNING' : 'INFO',
      actionTip:
        'Reveja os streamings e softwares contratados. Revezar assinaturas (assinar uma de cada vez) ou optar por planos familiares compartilhados corta esse custo pela metade.',
      transactions: subscriptionTxs.map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 5. ESTOURO DE CATEGORIAS (Categorias que dispararam vs mês anterior)
  // --------------------------------------------------------------------------
  const currentByCat = new Map<string, number>();
  for (const o of currentOutflows) {
    const cat = translateCategory(o.tx.category);
    currentByCat.set(cat, (currentByCat.get(cat) ?? 0) + o.amount);
  }

  const prevByCat = new Map<string, number>();
  for (const o of previousOutflows) {
    const cat = translateCategory(o.tx.category);
    prevByCat.set(cat, (prevByCat.get(cat) ?? 0) + o.amount);
  }

  for (const [cat, curAmt] of currentByCat.entries()) {
    const prevAmt = prevByCat.get(cat) ?? 0;
    // Se aumentou mais de 35% e pelo menos R$ 150 reais
    if (prevAmt > 50 && curAmt > prevAmt + 150) {
      const diff = curAmt - prevAmt;
      const pctIncrease = ((diff / prevAmt) * 100).toFixed(0);

      const catTxs = currentOutflows
        .filter((o) => translateCategory(o.tx.category) === cat)
        .sort((a, b) => b.amount - a.amount);

      items.push({
        id: `leak-surge-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'EXPENSE_SURGE',
        title: `Estouro em ${cat}`,
        description: `Gastos em "${cat}" saltaram de R$ ${prevAmt.toFixed(2)} para R$ ${curAmt.toFixed(2)} (+${pctIncrease}%, aumento de R$ ${diff.toFixed(2)}).`,
        amount: Number(diff.toFixed(2)),
        previousAmount: Number(prevAmt.toFixed(2)),
        occurrences: catTxs.length,
        severity: diff >= 400 ? 'WARNING' : 'INFO',
        actionTip: `Identifique os maiores lançamentos recentes em "${cat}" e estabeleça uma trava orçamentária até o fechamento do próximo mês.`,
        transactions: catTxs.slice(0, 8).map(mapNormalizedToLeakTx),
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. GASTOS ATÍPICOS DE ALTO VALOR (Outliers de Consumo)
  // --------------------------------------------------------------------------
  const nonFixedOutflows = currentOutflows.filter((o) => {
    const desc = (o.tx.description || '').toLowerCase();
    return !o.totalInstallments && !SUBSCRIPTION_PATTERN.test(desc) && !BANK_FEE_PATTERN.test(desc);
  });

  const sortedByAmt = [...nonFixedOutflows].sort((a, b) => b.amount - a.amount);
  const largeOutliers = sortedByAmt.slice(0, 3).filter((o) => o.amount >= 250);

  if (largeOutliers.length > 0 && totalExpenses > 0) {
    const totalOutliers = largeOutliers.reduce((s, t) => s + t.amount, 0);
    // Se representam mais de 20% do orçamento
    if (totalOutliers / totalExpenses >= 0.15) {
      items.push({
        id: 'leak-large-outliers',
        category: 'LARGE_OUTLIERS',
        title: 'Grandes Gastos Avulsos / Compras Pesadas',
        description: `As ${largeOutliers.length} maiores compras avulsas somaram R$ ${totalOutliers.toFixed(2)} (${((totalOutliers / totalExpenses) * 100).toFixed(0)}% de todas as despesas do mês).`,
        amount: Number(totalOutliers.toFixed(2)),
        occurrences: largeOutliers.length,
        severity: 'INFO',
        actionTip:
          'Compras avulsas elevadas reduzem o fôlego financeiro. Aplique a "regra das 72 horas" para compras não urgentes acima de R$ 200.',
        transactions: largeOutliers.map(mapNormalizedToLeakTx),
      });
    }
  }

  // Ordenar itens por gravidade e depois valor
  const severityRank: Record<LeakSeverity, number> = { CRITICAL: 3, WARNING: 2, INFO: 1 };
  items.sort((a, b) => {
    if (severityRank[b.severity] !== severityRank[a.severity]) {
      return severityRank[b.severity] - severityRank[a.severity];
    }
    return b.amount - a.amount;
  });

  // Totais por categoria de ralo
  const byCategoryTotals: Record<LeakCategory, number> = {
    BANK_FEES: 0,
    SUBSCRIPTIONS: 0,
    MICRO_EXPENSES: 0,
    DELIVERY_TRANSPORT: 0,
    EXPENSE_SURGE: 0,
    LARGE_OUTLIERS: 0,
  };

  for (const item of items) {
    byCategoryTotals[item.category] = (byCategoryTotals[item.category] || 0) + item.amount;
  }

  // Montar total em ralos (evitando duplicar o mesmo valor caso o ralo seja composto)
  // Ralos diretos facilmente evitáveis: Tarifas + Micro-gastos + Delivery excedente + Assinaturas
  const directLeakCategories: LeakCategory[] = ['BANK_FEES', 'MICRO_EXPENSES', 'DELIVERY_TRANSPORT', 'SUBSCRIPTIONS'];
  const totalLeakingAmount = items
    .filter((i) => directLeakCategories.includes(i.category))
    .reduce((s, i) => s + i.amount, 0);

  const leakingPercentage = totalExpenses > 0 ? (totalLeakingAmount / totalExpenses) * 100 : 0;
  const potentialAnnualSavings = totalLeakingAmount * 12;

  // Cálculo do Leak Score (0 a 100)
  // 100 = saúde impecável, deduções conforme a gravidade dos ralos encontrados
  let leakScore = 100;
  if (byCategoryTotals.BANK_FEES > 0) leakScore -= 20; // Juros/taxas são inaceitáveis
  if (byCategoryTotals.MICRO_EXPENSES > 200) leakScore -= 15;
  if (byCategoryTotals.DELIVERY_TRANSPORT > 300) leakScore -= 15;
  if (byCategoryTotals.SUBSCRIPTIONS > 150) leakScore -= 10;
  if (items.some((i) => i.category === 'EXPENSE_SURGE')) leakScore -= 10;
  if (leakingPercentage > 30) leakScore -= 15;
  else if (leakingPercentage > 15) leakScore -= 10;
  leakScore = Math.max(25, Math.min(100, leakScore));

  // Insights resumidos
  const insights: string[] = [];
  if (byCategoryTotals.BANK_FEES > 0) {
    insights.push(
      `🚨 Você pagou R$ ${byCategoryTotals.BANK_FEES.toFixed(2)} em taxas, IOF ou juros este mês. Esse é um valor 100% estancável.`
    );
  }
  if (byCategoryTotals.MICRO_EXPENSES > 0) {
    insights.push(
      `☕ O "Efeito Cafezinho" gerou R$ ${byCategoryTotals.MICRO_EXPENSES.toFixed(2)} em despesas de pequeno porte.`
    );
  }
  if (byCategoryTotals.DELIVERY_TRANSPORT > 0) {
    insights.push(
      `🛵 R$ ${byCategoryTotals.DELIVERY_TRANSPORT.toFixed(2)} foram destinados a apps de delivery e transporte.`
    );
  }
  if (byCategoryTotals.SUBSCRIPTIONS > 0) {
    insights.push(
      `📺 Suas assinaturas e serviços recorrentes somam R$ ${byCategoryTotals.SUBSCRIPTIONS.toFixed(2)} todo mês.`
    );
  }
  if (insights.length === 0) {
    insights.push('✅ Parabéns! Nenhum grande vazamento de dinheiro identificado no período selecionado.');
  }

  return {
    period,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalLeakingAmount: Number(totalLeakingAmount.toFixed(2)),
    potentialAnnualSavings: Number(potentialAnnualSavings.toFixed(2)),
    leakScore,
    leakingPercentage: Number(leakingPercentage.toFixed(1)),
    items,
    byCategoryTotals,
    insights,
  };
}

function mapNormalizedToLeakTx(o: NormalizedTx): LeakTransaction {
  return {
    id: o.tx.transaction_id,
    description: displayTitle(o.tx.description),
    amount: o.amount,
    date: o.date.slice(0, 10),
    category: o.tx.category,
    accountType: o.accountType,
  };
}

function oBrandKey(desc: string): string {
  const lower = desc.toLowerCase();
  if (lower.includes('netflix')) return 'Netflix';
  if (lower.includes('spotify')) return 'Spotify';
  if (lower.includes('hbo') || lower.includes('max')) return 'HBO Max';
  if (lower.includes('amazon') || lower.includes('prime')) return 'Amazon Prime';
  if (lower.includes('disney')) return 'Disney+';
  if (lower.includes('youtube')) return 'YouTube';
  if (lower.includes('apple') || lower.includes('icloud')) return 'Apple';
  if (lower.includes('google')) return 'Google';
  if (lower.includes('openai') || lower.includes('chatgpt')) return 'OpenAI / ChatGPT';
  return displayTitle(desc);
}
