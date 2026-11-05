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
  | 'BANK_FEES'          // Tarifas, IOF, juros, multas, anuidade (100% inútil)
  | 'SUBSCRIPTIONS'      // Assinaturas e serviços recorrentes acumulados
  | 'MICRO_EXPENSES'     // Efeito cafezinho REAL da rotina diária (fora de viagens)
  | 'DELIVERY_TRANSPORT' // Apps de conveniência recorrentes (persistente em várias semanas/meses)
  | 'EXPENSE_SURGE'      // Categorias com estouro expressivo vs média móvel anterior
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

export interface OccasionalEventCluster {
  id: string;
  title: string;
  dateRange: string; // ex: "01/11 a 05/11"
  totalAmount: number;
  occurrences: number;
  reason: string;
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
  occasionalEvents: OccasionalEventCluster[];
  byCategoryTotals: Record<LeakCategory, number>;
  insights: string[];
}

export interface MoneyLeaksOptions {
  period?: string;
}

// Padrões de tarifas bancárias, juros, IOF, encargos e multas (Zero Contrapartida)
const BANK_FEE_PATTERN =
  /\b(tarifa|iof|juros|multa|anuidade|encargo|encargos|pacote\s?serv|manutencao\s?conta|taxa\s?de\s?servico|taxa\s?manut|avalia\w*\s*emerg|doc\/ted|ted\/doc)\b/i;

// Padrões de apps de delivery e transporte cotidiano
const DELIVERY_TRANSPORT_PATTERN =
  /\b(ifood|ifd|uber|99app|99\s?pop|rappi|ze\s?delivery|carrefour\s?delivery|cornershop)\b/i;

// Padrões de assinaturas e streamings conhecidos
const SUBSCRIPTION_PATTERN =
  /\b(netflix|spotify|hbomax|hbo\s?max|amazon\s?prime|prime\s?video|disney|star\s?plus|globoplay|paramount|crunchyroll|deezer|youtube\s?premium|ytb\s?premium|google\s?one|icloud|apple\s?music|openai|chatgpt|claude\s?ai|github|smart\s?fit|smartfit|bluefit|bodytech)\b/i;

// Padrões de deslocamento, viagens e atrações atípicas (para cluster de viagem)
const TRIP_TRANSIT_PATTERN =
  /\b(metro|metr[oô]|cptm|autopass|supervia|vlt|bilhete\s?[uú]nico|pedagio|ped[aá]gio|sem\s?parar|conectcar|veloe|aeroporto|latam|gol\s?linhas|azul\s?linhas|airbnb|booking|hotel|pousada|rodoviaria|cometa|1001|masp|parque|ingresso|sympla|eventim)\b/i;

// Padrões de saúde/farmácia que NÃO devem ser classificados como "efeito cafezinho"
const HEALTH_PHARMACY_PATTERN =
  /\b(farmacia|farm[aá]cia|droga|drogasil|drogaria|raia|pague\s?menos|panvel|ultrafarma|consulta|laborat|exame|medico|hospital|dentista|odont)\b/i;

/**
 * Detecta onde o usuário está realmente perdendo dinheiro com inteligência contextual:
 * 1. Isola clusters de viagens e eventos pontuais (ex: metrô por 5 dias quando outros meses têm 0).
 * 2. Purga gastos de saúde e passagens atípicas do "Efeito Cafezinho".
 * 3. Foca em ralos 100% inúteis (tarifas bancárias/juros), assinaturas zumbis e comodidade crônica.
 */
export function detectMoneyLeaks(
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  options: MoneyLeaksOptions = {}
): MoneyLeaksAnalysis {
  const period = options.period ?? currentPeriod();
  const prevMonth1 = addMonths(period, -1);
  const prevMonth2 = addMonths(period, -2);
  const prevMonth3 = addMonths(period, -3);

  const { outflows } = normalizeOutflows(transactions, accounts);

  // Separar saídas por mês
  const currentOutflows = outflows.filter((o) => o.period === period);
  const previousOutflows = outflows.filter((o) => o.period === prevMonth1);
  const pastBaselineOutflows = outflows.filter(
    (o) => o.period === prevMonth1 || o.period === prevMonth2 || o.period === prevMonth3
  );

  const totalExpenses = currentOutflows.reduce((sum, o) => sum + o.amount, 0);

  // --------------------------------------------------------------------------
  // PASSO 0: DETECÇÃO DE EVENTOS & VIAGENS PONTUAIS (CLUSTER TEMPORAL ATÍPICO)
  // --------------------------------------------------------------------------
  // Exemplo: se o uso de metrô/transporte foi só em 5 dias de nov, enquanto nos outros
  // meses o gasto é 0, trata-se de uma viagem ou evento temporário, NÃO um ralo crônico!
  const occasionalEvents: OccasionalEventCluster[] = [];
  const eventTxIds = new Set<string>();

  // Analisar transações que têm características de viagem, turismo ou trânsito intermunicipal
  const transitOrTripOutflows = currentOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    return TRIP_TRANSIT_PATTERN.test(desc) || TRIP_TRANSIT_PATTERN.test(cat);
  });

  if (transitOrTripOutflows.length > 0) {
    // Verificar linha de base histórica (baseline) nos meses anteriores (M-1, M-2, M-3)
    const baselineOccurrences = pastBaselineOutflows.filter((o) => {
      const desc = o.tx.description ?? '';
      const cat = o.tx.category ?? '';
      return TRIP_TRANSIT_PATTERN.test(desc) || TRIP_TRANSIT_PATTERN.test(cat);
    }).length;

    // Calcular amplitude de dias em que essas transações ocorreram no mês atual
    const dates = transitOrTripOutflows
      .map((o) => o.date.slice(0, 10))
      .sort();
    const uniqueDays = Array.from(new Set(dates));

    // Se as ocorrências ocorreram em até 7 dias distintos E o histórico anterior foi nulo ou muito baixo (média < 1/mês)
    const isBurst = uniqueDays.length <= 7;
    const isAtypicalHistory = baselineOccurrences <= 2;

    if (isBurst && isAtypicalHistory) {
      const clusterTotal = transitOrTripOutflows.reduce((s, o) => s + o.amount, 0);
      const firstDay = uniqueDays[0].split('-').slice(1).reverse().join('/');
      const lastDay = uniqueDays[uniqueDays.length - 1].split('-').slice(1).reverse().join('/');
      const dateRangeStr = uniqueDays.length === 1 ? firstDay : `${firstDay} a ${lastDay}`;

      // Amostra de nomes
      const sampleNames = Array.from(
        new Set(transitOrTripOutflows.map((o) => displayTitle(o.tx.description)))
      ).slice(0, 3).join(', ');

      occasionalEvents.push({
        id: 'event-trip-transit',
        title: `Deslocamento / Viagem Pontual (${sampleNames})`,
        dateRange: dateRangeStr,
        totalAmount: Number(clusterTotal.toFixed(2)),
        occurrences: transitOrTripOutflows.length,
        reason: `Concentrado em ${uniqueDays.length} dia(s) (${dateRangeStr}). Histórico nos meses anteriores é nulo ou próximo de zero, confirmando que foi uma viagem/evento isolado e NÃO um ralo crônico.`,
        transactions: transitOrTripOutflows.map(mapNormalizedToLeakTx),
      });

      // Registrar IDs para NÃO incluir essas despesas no Efeito Cafezinho ou Hábitos
      for (const t of transitOrTripOutflows) {
        if (t.tx.transaction_id) eventTxIds.add(t.tx.transaction_id);
      }
    }
  }

  // Despesas elegíveis para análise de ralos (expurgando despesas de eventos/viagens pontuais)
  const leakEligibleOutflows = currentOutflows.filter((o) => {
    if (o.tx.transaction_id && eventTxIds.has(o.tx.transaction_id)) return false;
    return true;
  });

  const items: MoneyLeakItem[] = [];

  // --------------------------------------------------------------------------
  // 1. TARIFAS BANCÁRIAS, JUROS, IOF E ANUIDADES (CRÍTICO - 100% Inútil / Evitável)
  // --------------------------------------------------------------------------
  const feeTxs = leakEligibleOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    return BANK_FEE_PATTERN.test(desc) || BANK_FEE_PATTERN.test(cat);
  });

  if (feeTxs.length > 0) {
    const totalFees = feeTxs.reduce((s, t) => s + t.amount, 0);
    items.push({
      id: 'leak-bank-fees',
      category: 'BANK_FEES',
      title: 'Tarifas Bancárias, Juros de Rotativo e Multas',
      description: `${feeTxs.length} lançamento(s) somando R$ ${totalFees.toFixed(2)} de tarifas de conta, anuidade ou encargos bancários sem nenhuma contrapartida para você.`,
      amount: Number(totalFees.toFixed(2)),
      occurrences: feeTxs.length,
      severity: 'CRITICAL',
      actionTip:
        '100% estancável: Solicite ao banco a migração imediata para o Pacote Essencial Gratuito do Banco Central (Resolução 3.919) para zerar tarifas de conta. Negocie anuidade do cartão ou use cartões sem taxa.',
      transactions: feeTxs.map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 2. ASSINATURAS E STREAMINGS RECORRENTES ACUMULADOS
  // --------------------------------------------------------------------------
  const subscriptionTxs = leakEligibleOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    return SUBSCRIPTION_PATTERN.test(desc);
  });

  // Agrupar assinaturas por serviço
  const subGroupMap = new Map<string, NormalizedTx[]>();
  for (const tx of subscriptionTxs) {
    const key = oBrandKey(tx.tx.description || '');
    const list = subGroupMap.get(key) || [];
    list.push(tx);
    subGroupMap.set(key, list);
  }

  if (subscriptionTxs.length >= 2 || subscriptionTxs.reduce((s, t) => s + t.amount, 0) >= 90) {
    const totalSubs = subscriptionTxs.reduce((s, t) => s + t.amount, 0);
    const annualSubs = totalSubs * 12;
    const servicesList = Array.from(subGroupMap.keys()).join(', ');
    items.push({
      id: 'leak-subscriptions',
      category: 'SUBSCRIPTIONS',
      title: 'Acúmulo de Assinaturas e Serviços Digitais',
      description: `${subGroupMap.size} serviços ativos (${servicesList}) somam R$ ${totalSubs.toFixed(2)}/mês (projeção de R$ ${annualSubs.toFixed(2)} por ano).`,
      amount: Number(totalSubs.toFixed(2)),
      occurrences: subscriptionTxs.length,
      severity: totalSubs >= 200 || subGroupMap.size >= 4 ? 'WARNING' : 'INFO',
      actionTip:
        'Cancele assinaturas pouco usadas ou faça revezamento (assine uma plataforma por mês e assista às séries acumuladas). Planos familiares compartilhados cortam mais de 60% desse valor.',
      transactions: subscriptionTxs.map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 3. COMODIDADE CRÔNICA: DELIVERY & TRANSPORTE COTIDIANO (iFood, Uber, etc.)
  // --------------------------------------------------------------------------
  // Para ser ralo crônico, NÃO pode ser um pico de 2 dias de viagem. Deve ter frequência
  // relevante e dispersão temporal ao longo das semanas.
  const deliveryTxs = leakEligibleOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    return DELIVERY_TRANSPORT_PATTERN.test(desc) || DELIVERY_TRANSPORT_PATTERN.test(cat);
  });

  const totalDelivery = deliveryTxs.reduce((s, t) => s + t.amount, 0);

  // Mês anterior
  const prevDeliveryTxs = previousOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    return DELIVERY_TRANSPORT_PATTERN.test(desc) || DELIVERY_TRANSPORT_PATTERN.test(cat);
  });
  const prevTotalDelivery = prevDeliveryTxs.reduce((s, t) => s + t.amount, 0);

  // Verificar dispersão semanal: pelo menos em 2 semanas diferentes ou 5+ pedidos
  const deliveryDays = Array.from(new Set(deliveryTxs.map((o) => o.date.slice(0, 10))));

  if (deliveryTxs.length >= 5 || (totalDelivery >= 180 && deliveryDays.length >= 3)) {
    items.push({
      id: 'leak-delivery-transport',
      category: 'DELIVERY_TRANSPORT',
      title: 'Comodidade Crônica: Delivery e Caronas de App',
      description: `R$ ${totalDelivery.toFixed(2)} gastos em ${deliveryTxs.length} pedidos e corridas distribuídos em ${deliveryDays.length} dias de rotina.`,
      amount: Number(totalDelivery.toFixed(2)),
      previousAmount: prevTotalDelivery > 0 ? Number(prevTotalDelivery.toFixed(2)) : undefined,
      occurrences: deliveryTxs.length,
      severity: totalDelivery >= 450 || deliveryTxs.length >= 12 ? 'WARNING' : 'INFO',
      actionTip:
        'Estipule uma regra clara: delivery apenas no final de semana ou limite a 2 pedidos semanais. Cada 3 pedidos cortados geram economia imediata de R$ 150 a R$ 200/mês.',
      transactions: deliveryTxs.map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 4. O VERDADEIRO EFEITO CAFEZINHO (Micro-gastos da rotina diária)
  // --------------------------------------------------------------------------
  // Pequenas compras (R$ 4 a R$ 40) que acontecem na rotina, EXPURGANDO farmácia/saúde,
  // assinaturas e gastos de viagens/eventos já isolados.
  const microTxs = leakEligibleOutflows.filter((o) => {
    const desc = o.tx.description ?? '';
    const cat = o.tx.category ?? '';
    if (o.amount < 4 || o.amount > 40) return false;
    if (BANK_FEE_PATTERN.test(desc) || BANK_FEE_PATTERN.test(cat)) return false;
    if (SUBSCRIPTION_PATTERN.test(desc)) return false;
    if (HEALTH_PHARMACY_PATTERN.test(desc) || HEALTH_PHARMACY_PATTERN.test(cat)) return false;
    return true;
  });

  // Só aciona se houver repetitividade real na rotina (>= 7 transações e pelo menos 4 dias distintos)
  const microDays = Array.from(new Set(microTxs.map((o) => o.date.slice(0, 10))));

  if (microTxs.length >= 7 && microDays.length >= 4) {
    const totalMicro = microTxs.reduce((s, t) => s + t.amount, 0);
    const avgMicro = totalMicro / microTxs.length;
    items.push({
      id: 'leak-micro-expenses',
      category: 'MICRO_EXPENSES',
      title: 'Efeito Cafezinho da Rotina (Micro-gastos Diários)',
      description: `${microTxs.length} pequenos gastos cotidianos (média R$ ${avgMicro.toFixed(2)}) em lanchonetes, snacks e conveniência somando R$ ${totalMicro.toFixed(2)} ao longo do mês.`,
      amount: Number(totalMicro.toFixed(2)),
      occurrences: microTxs.length,
      severity: microTxs.length >= 14 || totalMicro >= 300 ? 'WARNING' : 'INFO',
      actionTip:
        'Defina um teto semanal para pequenas conveniências no Pix/Débito. Pequenos gastos invisíveis de rotina são fáceis de cortar sem alterar sua qualidade de vida.',
      transactions: microTxs.slice(0, 20).map(mapNormalizedToLeakTx),
    });
  }

  // --------------------------------------------------------------------------
  // 5. ESTOURO DE CATEGORIAS (Comparado à média móvel)
  // --------------------------------------------------------------------------
  const currentByCat = new Map<string, number>();
  for (const o of leakEligibleOutflows) {
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
    // Se aumentou mais de 35% e pelo menos R$ 160 reais
    if (prevAmt > 50 && curAmt > prevAmt + 160) {
      const diff = curAmt - prevAmt;
      const pctIncrease = ((diff / prevAmt) * 100).toFixed(0);

      const catTxs = leakEligibleOutflows
        .filter((o) => translateCategory(o.tx.category) === cat)
        .sort((a, b) => b.amount - a.amount);

      items.push({
        id: `leak-surge-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'EXPENSE_SURGE',
        title: `Estouro Orçamentário em ${cat}`,
        description: `Gastos em "${cat}" saltaram de R$ ${prevAmt.toFixed(2)} para R$ ${curAmt.toFixed(2)} (+${pctIncrease}%, alta de R$ ${diff.toFixed(2)}).`,
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
  // 6. GASTOS ATÍPICOS DE ALTO VALOR (Grandes Outliers Avulsos)
  // --------------------------------------------------------------------------
  const nonFixedOutflows = leakEligibleOutflows.filter((o) => {
    const desc = (o.tx.description || '').toLowerCase();
    return !o.totalInstallments && !SUBSCRIPTION_PATTERN.test(desc) && !BANK_FEE_PATTERN.test(desc);
  });

  const sortedByAmt = [...nonFixedOutflows].sort((a, b) => b.amount - a.amount);
  const largeOutliers = sortedByAmt.slice(0, 3).filter((o) => o.amount >= 300);

  if (largeOutliers.length > 0 && totalExpenses > 0) {
    const totalOutliers = largeOutliers.reduce((s, t) => s + t.amount, 0);
    if (totalOutliers / totalExpenses >= 0.18) {
      items.push({
        id: 'leak-large-outliers',
        category: 'LARGE_OUTLIERS',
        title: 'Grandes Gastos Avulsos / Compras Pesadas',
        description: `As ${largeOutliers.length} maiores compras avulsas somaram R$ ${totalOutliers.toFixed(2)} (${((totalOutliers / totalExpenses) * 100).toFixed(0)}% de todo o orçamento do mês).`,
        amount: Number(totalOutliers.toFixed(2)),
        occurrences: largeOutliers.length,
        severity: 'INFO',
        actionTip:
          'Compras de valor alto devem ser planejadas com antecedência. Aplique a "regra das 72 horas" para avaliar se a despesa é urgente antes de passar o cartão.',
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

  // Ralos diretos facilmente evitáveis: Tarifas + Micro-gastos + Delivery excessivo + Assinaturas
  const directLeakCategories: LeakCategory[] = [
    'BANK_FEES',
    'MICRO_EXPENSES',
    'DELIVERY_TRANSPORT',
    'SUBSCRIPTIONS',
  ];
  const totalLeakingAmount = items
    .filter((i) => directLeakCategories.includes(i.category))
    .reduce((s, i) => s + i.amount, 0);

  const leakingPercentage = totalExpenses > 0 ? (totalLeakingAmount / totalExpenses) * 100 : 0;
  // ATENÇÃO: Economia anualizada SÓ multiplica ralos verdadeiramente crônicos!
  const potentialAnnualSavings = totalLeakingAmount * 12;

  // Cálculo do Leak Score (0 a 100)
  let leakScore = 100;
  if (byCategoryTotals.BANK_FEES > 0) leakScore -= 20; // Juros e tarifas são inaceitáveis
  if (byCategoryTotals.MICRO_EXPENSES > 200) leakScore -= 15;
  if (byCategoryTotals.DELIVERY_TRANSPORT > 300) leakScore -= 15;
  if (byCategoryTotals.SUBSCRIPTIONS > 150) leakScore -= 10;
  if (items.some((i) => i.category === 'EXPENSE_SURGE')) leakScore -= 10;
  if (leakingPercentage > 30) leakScore -= 15;
  else if (leakingPercentage > 15) leakScore -= 10;
  leakScore = Math.max(25, Math.min(100, leakScore));

  // Insights resumidos
  const insights: string[] = [];

  // Se houver eventos pontuais detectados, elogie o contexto na primeira linha de insights
  if (occasionalEvents.length > 0) {
    for (const ev of occasionalEvents) {
      insights.push(
        `✈️ Viagem/Evento isolado detectado: R$ ${ev.totalAmount.toFixed(2)} em ${ev.title.toLowerCase()} (${ev.dateRange}). Tratado como atípico, sem distorcer seus ralos crônicos.`
      );
    }
  }

  if (byCategoryTotals.BANK_FEES > 0) {
    insights.push(
      `🚨 Você pagou R$ ${byCategoryTotals.BANK_FEES.toFixed(2)} em tarifas bancárias ou juros. Isso é dinheiro 100% estancável via Resolução 3.919 do Bacen.`
    );
  }
  if (byCategoryTotals.MICRO_EXPENSES > 0) {
    insights.push(
      `☕ O "Efeito Cafezinho" da rotina acumulou R$ ${byCategoryTotals.MICRO_EXPENSES.toFixed(2)} em pequenas compras diárias.`
    );
  }
  if (byCategoryTotals.DELIVERY_TRANSPORT > 0) {
    insights.push(
      `🛵 R$ ${byCategoryTotals.DELIVERY_TRANSPORT.toFixed(2)} foram gastos em apps de delivery e transporte ao longo do mês.`
    );
  }
  if (byCategoryTotals.SUBSCRIPTIONS > 0) {
    insights.push(
      `📺 Suas assinaturas e serviços digitais totalizam R$ ${byCategoryTotals.SUBSCRIPTIONS.toFixed(2)}/mês.`
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
    occasionalEvents,
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
  if (lower.includes('globo')) return 'Globoplay';
  if (lower.includes('openai') || lower.includes('chatgpt')) return 'ChatGPT / OpenAI';
  if (lower.includes('claude')) return 'Claude AI';
  if (lower.includes('github')) return 'GitHub';
  if (lower.includes('smartfit') || lower.includes('smart fit')) return 'Smart Fit';
  return displayTitle(desc).slice(0, 18);
}
