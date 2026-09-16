import type { AccountRecord, TransactionRecord } from '@/app/types/pluggy';

/**
 * Motor de detecção de compromissos mensais (gastos fixos, assinaturas e parcelamentos).
 *
 * Regras de sinal da Pluggy que este módulo respeita:
 * - Conta BANK / PAYMENT_ACCOUNT: saída de dinheiro vem com `amount` NEGATIVO e `type = 'DEBIT'`.
 * - Conta CREDIT (cartão): a compra vem com `amount` POSITIVO e `type = 'DEBIT'`;
 *   o pagamento da fatura vem NEGATIVO com `type = 'CREDIT'`.
 *
 * Portanto o único discriminador confiável de "saída" é `type === 'DEBIT'` + `Math.abs(amount)`.
 * Filtrar por `amount > 0` descarta 100% dos gastos de cartão.
 */

// ============================================================================
// TIPOS
// ============================================================================

export type CommitmentKind =
  | 'MANUAL'
  | 'SUBSCRIPTION'
  | 'INSTALLMENT'
  | 'VARIABLE_RECURRING';

export interface InstallmentInfo {
  /** Parcela que cai no período consultado */
  current: number;
  total: number;
  /** Parcelas ainda não pagas, contando a do período consultado */
  remaining: number;
  /** Período (YYYY-MM) da última parcela */
  endsAt: string;
}

export interface Commitment {
  id: string;
  /** Chave estável usada para silenciar/vincular/marcar como pago */
  key: string;
  kind: CommitmentKind;
  title: string;
  /** Valor esperado no período consultado */
  amount: number;
  dueDay: number;
  category: string;
  isAuto: boolean;
  isPaid: boolean;
  /** 'CREDIT' quando vem de cartão, 'BANK' quando vem de conta, 'MANUAL' quando cadastrado à mão */
  origin: 'CREDIT' | 'BANK' | 'MANUAL';
  accountId?: string;
  /** Quantas vezes o compromisso foi observado no histórico */
  occurrences?: number;
  lastDate?: string;
  installments?: InstallmentInfo;
  /** 0..1 — quão confiável é a detecção automática */
  confidence: number;
}

export interface PeriodProjection {
  /** YYYY-MM */
  period: string;
  total: number;
  byKind: Record<CommitmentKind, number>;
  itemCount: number;
}

export interface CommitmentsResult {
  period: string;
  items: Commitment[];
  totals: {
    total: number;
    byKind: Record<CommitmentKind, number>;
  };
  projection: PeriodProjection[];
  diagnostics: {
    transactionsScanned: number;
    /** Transações de contas ignoradas ou desconhecidas */
    accountsSkipped: number;
    duplicatesRemoved: number;
    internalTransfersRemoved: number;
    installmentChains: number;
    subscriptionsDetected: number;
    /** Colisões de chave colapsadas (deve ser 0; > 0 indica bug de agrupamento) */
    duplicateKeysCollapsed: number;
  };
}

export interface ManualExpenseRow {
  id: number | string;
  title: string;
  amount: number | string;
  due_day?: number | null;
  category?: string | null;
  merchant_key?: string | null;
  is_muted?: boolean | null;
  is_active?: boolean | null;
  end_date?: string | null;
  kind?: string | null;
}

export interface DetectOptions {
  /** Período de referência (YYYY-MM) — o mês detalhado em `items`. Default: mês corrente. */
  period?: string;
  /**
   * Primeiro mês da projeção. Independente de `period` para que selecionar um
   * mês adiante não apague os meses anteriores da barra de navegação.
   * Default: 3 meses antes do mês corrente.
   */
  projectionStart?: string;
  /** Quantos meses a projeção cobre, a partir de `projectionStart`. Default: 15. */
  projectionMonths?: number;
  /** Chaves marcadas como pagas, no formato `${key}|${period}` */
  paidKeys?: Set<string>;
}

// ============================================================================
// DATAS — sempre tratadas como data civil (YYYY-MM-DD), sem fuso
// ============================================================================

/**
 * Extrai ano/mês/dia da string do banco sem passar por `new Date`.
 *
 * Necessário porque `date` é gravado como `2026-07-01 03:00:00+00`: convertido
 * para o fuso de São Paulo (-03), o dia 1º às 03:00Z cai no dia 30 do mês
 * anterior e o gasto seria contado no mês errado.
 */
export function parseYmd(value: string): { y: number; m: number; d: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!m) return { y: 0, m: 0, d: 1 };
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/** Retorna o período civil (YYYY-MM) de uma data do banco. */
export function periodOf(value: string): string {
  const { y, m } = parseYmd(value);
  return `${y}-${String(m).padStart(2, '0')}`;
}

/** Diferença em meses entre dois períodos YYYY-MM (b - a). */
export function monthsBetween(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

/** Soma `n` meses a um período YYYY-MM. */
export function addMonths(period: string, n: number): string {
  const [y, m] = period.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, '0')}`;
}

/** Número de dias inteiros entre duas datas do banco. */
function daysBetween(a: string, b: string): number {
  const pa = parseYmd(a);
  const pb = parseYmd(b);
  const ta = Date.UTC(pa.y, pa.m - 1, pa.d);
  const tb = Date.UTC(pb.y, pb.m - 1, pb.d);
  return Math.abs(tb - ta) / 86400000;
}

export function currentPeriod(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ============================================================================
// NORMALIZAÇÃO DE ESTABELECIMENTO
// ============================================================================

/** Prefixos de adquirente/subadquirente que a Pluggy deixa na descrição. */
const ACQUIRER_PREFIXES =
  /^(dl|dm|dp|hna|ifd|pag|pg|mp|rp|cp|ecomm|pagseguro|picpay|mercadopago|mercadolivre|stone|cielo|rede|getnet)\b[\s*:.-]*/i;

/** Cidades que aparecem colada na descrição em alguns conectores. */
const CITY_NOISE =
  /\b(sao paulo|s paulo|montes claros|belo horizonte|belo horizont|contagem|barueri|brasilia|rio de janeiro|osasco|serra do sali|cruzeiro da f|brejo bonito|uberlandia|campinas|curitiba|porto alegre|salvador|recife|fortaleza|goiania|nova lima|betim)\b/gi;

const LEGAL_NOISE = /\b(ltda|s\/a|sa|me|epp|eireli|mei|comercio|com|servicos|serv)\b/gi;

/**
 * Reduz a descrição a uma chave estável de estabelecimento.
 *
 * O formato da Pluggy é colunar (`NOME<espaços>CIDADE<espaços>BRA`), mas alguns
 * conectores desalinham as colunas — `DL UBERRIDES   SAO PAULO   BRA` e
 * `DL   UberRides Sao Paulo   BRA` são o mesmo gasto. Por isso, quando o corte
 * colunar devolve algo curto ou apenas um prefixo de adquirente, caímos para a
 * string inteira e removemos o ruído por lista.
 */
export function merchantKey(rawDescription: string): string {
  let text = String(rawDescription ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

  // Ruído específico de PIX / boleto / débito automático
  text = text
    .replace(/^pix\s+(enviado|recebido|transferencia)\s*[-:]*\s*/i, '')
    .replace(/^(ted|doc|transferencia)\s+(enviad[ao]|recebid[ao])\s*[-:]*\s*/i, '')
    .replace(/^pagamento\s+de\s+titulo\s*[-:]*\s*/i, '')
    .replace(/^(debito\s+automatico|deb\s?aut)\s*[-:]*\s*/i, '')
    .replace(/^no estabelecimento\s+/i, '')
    .replace(/\bcp\s*:?\s*\d+\s*-\s*/gi, '')
    .replace(/["']/g, '');

  // Remove o sufixo de país
  text = text.replace(/\s+bra?\.?$/i, '');

  // Corte colunar: descarta a última coluna (cidade)
  const columns = text.split(/\s{2,}/).filter(Boolean);
  let candidate = columns.length >= 2 ? columns.slice(0, -1).join(' ') : text;

  const looksTooShort =
    candidate.replace(/[^a-z]/g, '').length < 4 || ACQUIRER_PREFIXES.test(`${candidate} `);
  if (looksTooShort && columns.length >= 2) {
    candidate = columns.join(' ');
  }

  candidate = candidate
    .replace(CITY_NOISE, ' ')
    .replace(/\s+bra?\b/gi, ' ')
    .replace(ACQUIRER_PREFIXES, '')
    .replace(LEGAL_NOISE, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return candidate;
}

/**
 * Título legível a partir da descrição bruta.
 *
 * Nem todo conector separa as colunas com dois espaços — em alguns a cidade vem
 * colada (`IFD ERICA CRISTINA ALV MONTES CLAROS BRA`), então o corte colunar
 * sozinho deixa "Montes Claros Bra" no nome exibido.
 */
export function displayTitle(rawDescription: string): string {
  let text = String(rawDescription ?? '').trim();
  if (!text) return 'Gasto recorrente';

  text = text.split(/\s{2,}/)[0].trim();
  text = text.replace(/\s+bra?\.?$/i, '');
  text = text.replace(CITY_NOISE, ' ').replace(/\s+bra?\b/gi, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  if (!text) return String(rawDescription).split(/\s{2,}/)[0].trim() || 'Gasto recorrente';

  return text.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

// ============================================================================
// CATÁLOGOS
// ============================================================================

interface Brand {
  /** Identificador de agrupamento — todas as grafias da marca convergem para cá */
  id: string;
  pattern: RegExp;
  label: string;
  category: string;
}

/**
 * Assinaturas de valor fixo — bastam poucas ocorrências para confirmar.
 *
 * O `id` é o que agrupa: o mesmo serviço chega com grafias diferentes conforme
 * o conector (`DL GOOGLE GOOGLE`, `GOOGLE ONE`, `GOOGLEPLAY`), e sem um id
 * comum cada grafia vira um item separado na lista.
 */
const SUBSCRIPTION_BRANDS: Brand[] = [
  { id: 'netflix', pattern: /netflix/, label: 'Netflix', category: 'Streaming' },
  { id: 'hbomax', pattern: /hbo\s?max|helphbomax|hbomax|maxcom/, label: 'HBO Max', category: 'Streaming' },
  { id: 'amazonprime', pattern: /amazon\s?prime|prime\s?video/, label: 'Amazon Prime', category: 'Streaming' },
  { id: 'spotify', pattern: /spotify/, label: 'Spotify', category: 'Streaming' },
  { id: 'disney', pattern: /disney|star\s?plus/, label: 'Disney+', category: 'Streaming' },
  { id: 'globoplay', pattern: /globoplay/, label: 'Globoplay', category: 'Streaming' },
  { id: 'paramount', pattern: /paramount/, label: 'Paramount+', category: 'Streaming' },
  { id: 'crunchyroll', pattern: /crunchyroll/, label: 'Crunchyroll', category: 'Streaming' },
  { id: 'deezer', pattern: /deezer/, label: 'Deezer', category: 'Streaming' },
  { id: 'telecine', pattern: /telecine|looke|mubi/, label: 'Telecine', category: 'Streaming' },
  { id: 'youtube', pattern: /youtube|ytb\s?premium/, label: 'YouTube Premium', category: 'Streaming' },
  { id: 'google', pattern: /google/, label: 'Google', category: 'Serviços digitais' },
  { id: 'apple', pattern: /apple\s?com|itunes|apple\s?music|icloud|\bapple\b/, label: 'Apple', category: 'Serviços digitais' },
  { id: 'microsoft', pattern: /microsoft|office\s?365|xbox/, label: 'Microsoft', category: 'Serviços digitais' },
  { id: 'ia', pattern: /openai|chatgpt|anthropic|claude\s?ai|midjourney|github/, label: 'Assinatura de IA/Dev', category: 'Serviços digitais' },
  { id: 'uberone', pattern: /uber\s?one/, label: 'Uber One', category: 'Serviços digitais' },
  { id: 'ifoodclube', pattern: /ifood\s?clube|ifd\s?clube/, label: 'iFood Clube', category: 'Serviços digitais' },
  { id: 'academia', pattern: /smart\s?fit|smartfit|bluefit|selfit|bodytech|academia/, label: 'Academia', category: 'Saúde' },
];

/** Recorrências de valor variável — precisam de mais histórico, toleram mais variação. */
const UTILITY_BRANDS: Brand[] = [
  { id: 'energia', pattern: /cemig|enel|copel|celpe|light|neoenergia|equatorial|energia/, label: 'Energia', category: 'Moradia' },
  { id: 'agua', pattern: /copasa|sabesp|caesb|sanepar|saneamento|\bagua\b/, label: 'Água', category: 'Moradia' },
  { id: 'telecom', pattern: /\bvivo\b|\bclaro\b|\btim\b|\boi\b|telefonica|algar|internet|fibra/, label: 'Telefone/Internet', category: 'Moradia' },
  { id: 'condominio', pattern: /condominio/, label: 'Condomínio', category: 'Moradia' },
  { id: 'aluguel', pattern: /aluguel|imobiliaria/, label: 'Aluguel', category: 'Moradia' },
  { id: 'saude', pattern: /unimed|amil|hapvida|sulamerica|plano de saude|odonto/, label: 'Plano de saúde', category: 'Saúde' },
  { id: 'seguro', pattern: /seguro|porto seguro|azul seguros/, label: 'Seguro', category: 'Seguros' },
  { id: 'educacao', pattern: /faculdade|colegio|escola|mensalidade|kumon|wizard/, label: 'Educação', category: 'Educação' },
  {
    id: 'emprestimo',
    // Prestação de empréstimo/financiamento é compromisso fixo por definição,
    // mesmo aparecendo poucas vezes no histórico disponível.
    pattern: /emprestimo|emprestimos|financiamento|consignado|crediario|prestacao|carne/,
    label: 'Empréstimo/Financiamento',
    category: 'Dívidas',
  },
];

/**
 * Categorias de consumo avulso. Nunca viram compromisso pela trilha heurística
 * — mercado, delivery e corrida repetem todo mês sem serem gasto fixo.
 * Marcas do catálogo não passam por aqui (Amazon Prime chega como "Bookstore").
 */
const NEVER_RECURRING_CATEGORY =
  /groceries|eating out|food delivery|fast food|bars|taxi|ride.?hailing|shopping|pharmacy|gas station|fuel|travel|clothing|houseware|electronics|bookstore|supermarket|delivery/i;

function matchBrand(key: string, catalog: Brand[]): Brand | undefined {
  return catalog.find((b) => b.pattern.test(key));
}

/** Lançamentos que não representam consumo (liquidação de fatura, estorno, saldo). */
function isNonExpense(tx: TransactionRecord): boolean {
  const text = `${tx.description ?? ''} ${tx.category ?? ''}`.toLowerCase();
  const banned = [
    'credit card payment',
    'pagamento fatura',
    'pagamento de fatura',
    'fatura cartao',
    'fatura cartão',
    'pagamento recebido',
    'pagamento on line',
    'pagamento online',
    'estorno',
    'reembolso',
    'saldo em atraso',
    'saldo anterior',
    'encargos',
    'rendimento',
    'aplicacao automatica',
    'resgate automatico',
  ];
  return banned.some((w) => text.includes(w));
}

// ============================================================================
// PRÉ-PROCESSAMENTO
// ============================================================================

export interface NormalizedTx {
  tx: TransactionRecord;
  key: string;
  amount: number;
  period: string;
  date: string;
  accountType: AccountRecord['type'];
  installmentNumber?: number;
  totalInstallments?: number;
}

function readInstallments(tx: TransactionRecord): { current?: number; total?: number } {
  const meta = (tx.credit_card_metadata ?? {}) as Record<string, unknown>;
  const current = Number(meta.installmentNumber);
  const total = Number(meta.totalInstallments);
  if (!Number.isFinite(current) || !Number.isFinite(total) || total < 2) return {};
  return { current, total };
}

/**
 * Dois valores que representam o mesmo lançamento.
 *
 * A tolerância cobre o centavo de ajuste que os bancos distribuem entre as
 * parcelas (R$ 180,06 numa conexão e R$ 180,07 na outra).
 */
function sameAmount(a: number, b: number): boolean {
  const diff = Math.abs(a - b);
  return diff <= 0.05 || diff / Math.max(a, b) <= 0.01;
}

/**
 * Remove o mesmo gasto sincronizado por duas conexões diferentes (Open Finance +
 * conexão direta do banco, por exemplo). Os `transaction_id` diferem, então o
 * upsert não deduplica: sem isso todo total de cartão sai dobrado.
 *
 * Só compara transações de contas DIFERENTES — duas compras iguais na mesma
 * conta e no mesmo dia são compras legítimas distintas.
 */
function dedupeAcrossAccounts(list: NormalizedTx[]): {
  kept: NormalizedTx[];
  removed: number;
} {
  // O valor NÃO entra na chave do bucket: conexões diferentes arredondam a
  // parcela de formas diferentes (R$ 54,37 x R$ 54,39, R$ 180,06 x R$ 180,07)
  // e uma chave por centavo exato separa o que deveria ser o mesmo lançamento.
  const buckets = new Map<string, NormalizedTx[]>();
  for (const item of list) {
    const inst = item.totalInstallments ? `${item.installmentNumber}/${item.totalInstallments}` : '-';
    const bucketKey = `${item.key}|${inst}`;
    const arr = buckets.get(bucketKey);
    if (arr) arr.push(item);
    else buckets.set(bucketKey, [item]);
  }

  const kept: NormalizedTx[] = [];
  let removed = 0;

  for (const bucket of buckets.values()) {
    const sorted = [...bucket].sort((a, b) => a.date.localeCompare(b.date));
    const clusters: NormalizedTx[][] = [];

    for (const item of sorted) {
      // A parcela "3 de 6" de uma compra específica existe uma única vez. Quando
      // duas conexões do mesmo cartão a reportam em ciclos de fatura diferentes
      // (Inter reporta o mesmo cartão como "THIAGO E SANTOS" e "GOLD", com até
      // um mês de defasagem), a janela de 3 dias não fecha — então para parcelas
      // a comparação usa o número da parcela e tolera a defasagem de ciclo.
      const maxDayGap = item.totalInstallments ? 70 : 3;

      const target = clusters.find((cluster) =>
        cluster.every(
          (other) =>
            other.tx.account_id !== item.tx.account_id &&
            daysBetween(other.date, item.date) <= maxDayGap &&
            sameAmount(other.amount, item.amount)
        )
      );
      if (target) target.push(item);
      else clusters.push([item]);
    }

    for (const cluster of clusters) {
      // Mantém o registro mais rico em metadados (tende a ser a conexão principal)
      const score = (t: NormalizedTx) =>
        Object.keys((t.tx.credit_card_metadata ?? {}) as object).length +
        (t.tx.status === 'POSTED' ? 1 : 0);
      const best = cluster.reduce((acc, cur) => {
        if (score(cur) !== score(acc)) return score(cur) > score(acc) ? cur : acc;
        // Empate: fica a data mais recente, para não antecipar o vencimento
        return cur.date > acc.date ? cur : acc;
      });
      kept.push(best);
      removed += cluster.length - 1;
    }
  }

  return { kept, removed };
}

/**
 * Identifica saídas de conta corrente que são apenas contrapartida de uma
 * entrada em outra conta própria — tipicamente o pagamento da fatura do cartão.
 *
 * Restrito a débitos de conta BANK/PAYMENT_ACCOUNT para nunca apagar uma compra
 * de cartão por coincidência de valor.
 */
function findInternalTransfers(
  debits: NormalizedTx[],
  credits: TransactionRecord[]
): Set<string> {
  const internal = new Set<string>();

  for (const debit of debits) {
    if (debit.accountType === 'CREDIT') continue;

    for (const credit of credits) {
      if (credit.account_id === debit.tx.account_id) continue;
      const creditAmount = Math.abs(Number(credit.amount ?? 0));
      if (creditAmount === 0) continue;
      const diff = Math.abs(creditAmount - debit.amount) / Math.max(creditAmount, debit.amount);
      if (diff > 0.01) continue;
      if (daysBetween(credit.date, debit.date) > 2) continue;
      internal.add(debit.tx.transaction_id);
      break;
    }
  }

  return internal;
}

/**
 * Identifica entradas que são apenas dinheiro mudando de conta própria.
 *
 * O espelho de `findInternalTransfers`: se um crédito casa com um débito de
 * outra conta em valor e data, ninguém ficou mais rico. Sem isso, transferir da
 * poupança para a conta corrente apareceria como receita do mês.
 */
function findInternalInflows(
  credits: NormalizedTx[],
  debits: NormalizedTx[]
): Set<string> {
  const internal = new Set<string>();

  for (const credit of credits) {
    for (const debit of debits) {
      if (debit.tx.account_id === credit.tx.account_id) continue;
      const diff = Math.abs(debit.amount - credit.amount) / Math.max(debit.amount, credit.amount);
      if (diff > 0.01) continue;
      if (daysBetween(debit.date, credit.date) > 2) continue;
      internal.add(credit.tx.transaction_id);
      break;
    }
  }

  return internal;
}

export interface NormalizationDiagnostics {
  /** Transações de contas ignoradas ou desconhecidas */
  accountsSkipped: number;
  /** Lançamentos espelhados por uma segunda conexão do mesmo banco */
  duplicatesRemoved: number;
  /** Débitos que só quitavam uma conta própria (pagamento de fatura) */
  internalTransfersRemoved: number;
  /** Entradas descartadas por serem transferência entre contas próprias */
  internalInflowsRemoved: number;
}

/**
 * Separa as transações cruas em saídas e entradas reais de dinheiro.
 *
 * Ponto de entrada compartilhado por toda análise de fluxo: aplica o filtro de
 * contas consideradas, descarta o que não é consumo, remove o espelho da
 * segunda conexão do banco e tira o pagamento de fatura. Qualquer agregação que
 * pule esta etapa conta o mesmo valor duas vezes.
 *
 * Sobre as entradas: só contam em conta não-CREDIT. Um CREDIT numa conta de
 * cartão é pagamento de fatura ou estorno — nunca receita. E dinheiro que só
 * mudou de banco não é renda nova, então a mesma detecção de transferência
 * interna que limpa as saídas é aplicada dos dois lados.
 */
export function normalizeCashflow(
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  // O casamento de entradas contra saídas é quadrático. Quem só analisa gasto
  // não deve pagar por ele — daí o padrão desligado.
  options: { includeInflows?: boolean } = {}
): { outflows: NormalizedTx[]; inflows: NormalizedTx[]; diagnostics: NormalizationDiagnostics } {
  const includeInflows = options.includeInflows ?? false;
  const accountById = new Map(accounts.map((a) => [a.account_id, a]));
  const typeOf = (accountId: string): AccountRecord['type'] =>
    accountById.get(accountId)?.type ?? 'BANK';

  const credits: TransactionRecord[] = [];
  const rawDebits: NormalizedTx[] = [];
  const rawCredits: NormalizedTx[] = [];
  let accountsSkipped = 0;

  const normalize = (tx: TransactionRecord, amount: number): NormalizedTx => {
    const inst = readInstallments(tx);
    let finalAmount = amount;

    if (inst.total && inst.total >= 2) {
      const meta = (tx.credit_card_metadata ?? {}) as Record<string, unknown>;
      const totalAmount = Number(meta.totalAmount);
      
      if (Number.isFinite(totalAmount) && totalAmount > 0) {
        // sameAmount logic inline:
        const diff = Math.abs(amount - totalAmount);
        if (diff <= 0.05 || diff / Math.max(amount, totalAmount) <= 0.01) {
          finalAmount = amount / inst.total;
        }
      }
    }

    return {
      tx,
      key: merchantKey(tx.description),
      amount: finalAmount,
      period: periodOf(tx.date),
      date: tx.date,
      accountType: typeOf(tx.account_id),
      installmentNumber: inst.current,
      totalInstallments: inst.total,
    };
  };

  for (const tx of transactions) {
    // `accounts` já vem filtrado pelas contas que devem ser consideradas. Uma
    // conta fora da lista (espelho ignorado, conta arquivada) é descartada aqui
    // — não basta removê-la de `accounts`, senão suas transações entrariam com
    // o tipo de conta assumido por omissão.
    if (accounts.length > 0 && !accountById.has(tx.account_id)) {
      accountsSkipped++;
      continue;
    }

    const amount = Math.abs(Number(tx.amount ?? 0));

    if (tx.type === 'CREDIT') {
      // Guardado cru para casar com o débito da conta corrente que quita a fatura
      credits.push(tx);
      if (!includeInflows || amount === 0) continue;
      if (typeOf(tx.account_id) === 'CREDIT') continue;
      if (isNonExpense(tx)) continue;
      rawCredits.push(normalize(tx, amount));
      continue;
    }

    if (tx.type !== 'DEBIT' || amount === 0) continue;
    if (isNonExpense(tx)) continue;

    rawDebits.push(normalize(tx, amount));
  }

  const { kept, removed } = dedupeAcrossAccounts(rawDebits);
  const internalIds = findInternalTransfers(kept, credits);
  const outflows = kept.filter((d) => !internalIds.has(d.tx.transaction_id));

  const { kept: keptCredits, removed: creditsRemoved } = dedupeAcrossAccounts(rawCredits);
  // Espelho de `findInternalTransfers`: o crédito recebido tem um débito próprio
  // do outro lado. Casa contra os débitos brutos, antes da limpeza, porque o
  // débito correspondente já foi removido de `outflows`.
  const internalCreditIds = findInternalInflows(keptCredits, rawDebits);
  const inflows = keptCredits.filter((c) => !internalCreditIds.has(c.tx.transaction_id));

  return {
    outflows,
    inflows,
    diagnostics: {
      accountsSkipped,
      duplicatesRemoved: removed + creditsRemoved,
      internalTransfersRemoved: internalIds.size,
      internalInflowsRemoved: internalCreditIds.size,
    },
  };
}

/**
 * Mantido para quem só precisa das saídas (`spending.ts`, `detectCommitments`).
 */
export function normalizeOutflows(
  transactions: TransactionRecord[],
  accounts: AccountRecord[]
): { outflows: NormalizedTx[]; diagnostics: NormalizationDiagnostics } {
  const { outflows, diagnostics } = normalizeCashflow(transactions, accounts);
  return { outflows, diagnostics };
}

// ============================================================================
// PARCELAMENTOS (determinístico)
// ============================================================================

interface InstallmentChain {
  key: string;
  title: string;
  category: string;
  amount: number;
  total: number;
  /** Período da parcela conhecida mais avançada */
  anchorPeriod: string;
  anchorNumber: number;
  accountId: string;
  dueDay: number;
  observed: number;
}

/**
 * Agrupa parcelas da mesma compra e projeta as que ainda faltam.
 *
 * Não soma as parcelas futuras que a Pluggy já devolve como PENDING: usa a
 * parcela conhecida mais avançada como âncora e calcula o resto. Assim o
 * resultado é o mesmo quer o conector envie a projeção ou não, sem dupla
 * contagem.
 */
function buildInstallmentChains(list: NormalizedTx[]): InstallmentChain[] {
  const groups = new Map<string, NormalizedTx[]>();

  for (const item of list) {
    if (!item.totalInstallments || !item.installmentNumber) continue;
    // Sem o valor na chave: a última parcela costuma vir com centavos de ajuste
    // e criaria um grupo à parte para a mesma compra. A proximidade de valor é
    // verificada na clusterização abaixo.
    const groupKey = `${item.key}|${item.totalInstallments}`;
    const arr = groups.get(groupKey);
    if (arr) arr.push(item);
    else groups.set(groupKey, [item]);
  }

  const chains: InstallmentChain[] = [];

  for (const [groupKey, items] of groups) {
    // Cada parcela aponta para o mês em que a parcela 1 caiu. Esse mês de origem
    // identifica a COMPRA: todas as parcelas de uma mesma compra convergem para
    // o mesmo valor, independentemente de qual parcela estamos olhando.
    const withOrigin = items
      .map((item) => ({
        item,
        origin: addMonths(item.period, -(item.installmentNumber! - 1)),
      }))
      .sort((a, b) => a.origin.localeCompare(b.origin) || a.item.date.localeCompare(b.item.date));

    // Tolera 1 mês de defasagem: conexões diferentes do mesmo cartão podem
    // lançar a mesma parcela em ciclos de fatura vizinhos. Compras distintas no
    // mesmo estabelecimento, valor e nº de parcelas ficam separadas.
    const clusters: Array<{ origin: string; items: NormalizedTx[] }> = [];
    for (const { item, origin } of withOrigin) {
      const target = clusters.find(
        (c) =>
          Math.abs(monthsBetween(c.origin, origin)) <= 1 &&
          sameAmount(c.items[0].amount, item.amount)
      );
      if (target) target.items.push(item);
      else clusters.push({ origin, items: [item] });
    }

    for (const cluster of clusters) {
      const anchor = cluster.items.reduce((acc, cur) =>
        (cur.installmentNumber ?? 0) > (acc.installmentNumber ?? 0) ? cur : acc
      );
      chains.push({
        // O mês de origem entra na chave: sem ele, duas compras iguais em datas
        // diferentes colidem e o React reclama de key duplicada.
        key: `inst:${groupKey}|${cluster.origin}`,
        title: displayTitle(anchor.tx.description),
        category: anchor.tx.category || 'Parcelamento',
        // Mediana em vez do valor da âncora: ignora o centavo de ajuste
        amount: Number(median(cluster.items.map((i) => i.amount)).toFixed(2)),
        total: anchor.totalInstallments!,
        anchorPeriod: anchor.period,
        anchorNumber: anchor.installmentNumber!,
        accountId: anchor.tx.account_id,
        dueDay: parseYmd(anchor.date).d,
        observed: cluster.items.length,
      });
    }
  }

  return chains;
}

/** Parcela que cai no período, ou null se a compra já terminou / não começou. */
function installmentAt(chain: InstallmentChain, period: string): InstallmentInfo | null {
  const number = chain.anchorNumber + monthsBetween(chain.anchorPeriod, period);
  if (number < 1 || number > chain.total) return null;
  return {
    current: number,
    total: chain.total,
    remaining: chain.total - number + 1,
    endsAt: addMonths(period, chain.total - number),
  };
}

// ============================================================================
// ASSINATURAS E RECORRÊNCIAS (heurístico)
// ============================================================================

interface RecurringGroup {
  key: string;
  title: string;
  category: string;
  amount: number;
  dueDay: number;
  accountId: string;
  accountType: AccountRecord['type'];
  months: string[];
  occurrences: number;
  lastDate: string;
  kind: 'SUBSCRIPTION' | 'VARIABLE_RECURRING';
  confidence: number;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Coeficiente de variação (desvio padrão / média). */
function variationCoefficient(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 1;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Dispersão dos dias do mês em que as ocorrências caem.
 *
 * Compromisso fixo cai sempre por volta do mesmo dia. Delivery e mercado se
 * espalham pelo mês — é o que separa "assinatura de R$ 66" de "dois iFoods que
 * por acaso custaram parecido".
 */
function dayOfMonthSpread(days: number[]): number {
  if (days.length < 2) return 0;
  const center = median(days);
  // O mês é circular: dia 30 e dia 2 distam 3 dias, não 28.
  const distances = days.map((d) => {
    const raw = Math.abs(d - center);
    return Math.min(raw, 30 - raw);
  });
  return Math.max(...distances);
}

/**
 * Detecta assinaturas e contas recorrentes entre as transações sem parcelamento.
 *
 * Quatro trilhas, da mais forte para a mais fraca:
 * 1. Marca de assinatura conhecida (Netflix, HBO...) — 1 ocorrência já basta.
 * 2. Utilidade/prestação conhecida (energia, aluguel, empréstimo) — ≥ 2 meses.
 * 3. Valor estável em ≥ 3 meses, sempre por volta do mesmo dia.
 * 4. Valor variável em ≥ 4 meses, sempre por volta do mesmo dia.
 *
 * As trilhas 3 e 4 exigem, além da frequência de ~1x por mês, consistência de
 * dia e categoria fora da lista de consumo avulso. Sem isso, dois pedidos de
 * iFood de valor parecido em meses distintos viravam "assinatura".
 */
function detectRecurring(list: NormalizedTx[], referencePeriod: string): RecurringGroup[] {
  const groups = new Map<string, { items: NormalizedTx[]; brand?: Brand; utility?: Brand }>();

  for (const item of list) {
    if (item.totalInstallments) continue; // parcelamento é tratado deterministicamente
    if (!item.key || item.key.length < 3) continue;
    if (item.amount < 3) continue;

    const brand = matchBrand(item.key, SUBSCRIPTION_BRANDS);
    const utility = brand ? undefined : matchBrand(item.key, UTILITY_BRANDS);

    // Agrupa pela marca quando reconhecida: as várias grafias do mesmo serviço
    // (`DL GOOGLE GOOGLE`, `GOOGLE ONE`) precisam virar um item só.
    const groupKey = brand ? `brand:${brand.id}` : utility ? `util:${utility.id}` : item.key;

    const bucket = groups.get(groupKey);
    if (bucket) bucket.items.push(item);
    else groups.set(groupKey, { items: [item], brand, utility });
  }

  const results: RecurringGroup[] = [];

  for (const [groupKey, { items, brand, utility }] of groups) {
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const months = [...new Set(sorted.map((i) => i.period))].sort();
    const amounts = sorted.map((i) => i.amount);
    const spanMonths = monthsBetween(months[0], months[months.length - 1]) + 1;
    const perMonth = sorted.length / spanMonths;
    const cv = variationCoefficient(amounts);
    const value = Number(median(amounts).toFixed(2));
    const spread = dayOfMonthSpread(sorted.map((i) => parseYmd(i.date).d));

    // Distância, em meses, entre a última ocorrência e o mês de referência.
    const staleness = monthsBetween(months[months.length - 1], referencePeriod);
    const isConsumption = sorted.some((i) => NEVER_RECURRING_CATEGORY.test(i.tx.category ?? ''));

    let kind: RecurringGroup['kind'] | null = null;
    let confidence = 0;

    if (brand && perMonth <= 1.6 && staleness <= 2) {
      kind = 'SUBSCRIPTION';
      confidence = months.length >= 2 ? 0.95 : 0.8;
    } else if (utility && perMonth <= 1.4 && months.length >= 2 && staleness <= 2) {
      kind = 'VARIABLE_RECURRING';
      confidence = 0.85;
    } else if (isConsumption) {
      continue;
    } else if (perMonth <= 1.3 && months.length >= 3 && cv <= 0.12 && spread <= 6 && staleness <= 2) {
      kind = 'SUBSCRIPTION';
      confidence = Math.min(0.9, 0.55 + months.length * 0.08);
    } else if (perMonth <= 1.2 && months.length >= 4 && cv <= 0.4 && spread <= 8 && staleness <= 1) {
      kind = 'VARIABLE_RECURRING';
      confidence = Math.min(0.75, 0.4 + months.length * 0.07);
    }

    if (!kind) continue;

    results.push({
      key: `rec:${groupKey}`,
      title: brand?.label ?? utility?.label ?? displayTitle(last.tx.description),
      category: brand?.category ?? utility?.category ?? last.tx.category ?? 'Recorrente',
      amount: value,
      dueDay: parseYmd(last.date).d,
      accountId: last.tx.account_id,
      accountType: last.accountType,
      months,
      occurrences: sorted.length,
      lastDate: last.date.slice(0, 10),
      kind,
      confidence,
    });
  }

  return results;
}

// ============================================================================
// ORQUESTRAÇÃO
// ============================================================================

function emptyByKind(): Record<CommitmentKind, number> {
  return { MANUAL: 0, SUBSCRIPTION: 0, INSTALLMENT: 0, VARIABLE_RECURRING: 0 };
}

/**
 * Dia de vencimento efetivo do compromisso.
 *
 * Para cartão, o dia que importa é o vencimento da fatura — não a data da compra.
 * Netflix comprada dia 19 é paga no vencimento do cartão.
 */
function resolveDueDay(
  accountType: AccountRecord['type'],
  fallbackDay: number,
  account?: AccountRecord
): number {
  if (accountType === 'CREDIT') {
    const dueDate = account?.credit_data?.balance_due_date;
    if (dueDate) {
      const { d } = parseYmd(String(dueDate));
      if (d >= 1 && d <= 31) return d;
    }
  }
  return fallbackDay >= 1 && fallbackDay <= 31 ? fallbackDay : 10;
}

export function detectCommitments(
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  manualExpenses: ManualExpenseRow[],
  options: DetectOptions = {}
): CommitmentsResult {
  const period = options.period ?? currentPeriod();
  const projectionMonths = Math.max(1, options.projectionMonths ?? 15);
  const projectionStart = options.projectionStart ?? addMonths(currentPeriod(), -3);
  const paidKeys = options.paidKeys ?? new Set<string>();

  const accountById = new Map(accounts.map((a) => [a.account_id, a]));

  // --- 1 e 2. Normaliza saídas, remove espelhos e transferências internas ---
  const { outflows: debits, diagnostics: normalization } = normalizeOutflows(
    transactions,
    accounts
  );
  const { accountsSkipped, duplicatesRemoved: removed, internalTransfersRemoved } = normalization;

  // --- 3. Detecta -----------------------------------------------------------
  const chains = buildInstallmentChains(debits);
  const recurring = detectRecurring(debits, period);

  // --- 4. Manuais: entradas ativas e chaves silenciadas -------------------
  const activeManual = manualExpenses.filter(
    (m) => m.is_muted !== true && m.is_active !== false && !String(m.title).startsWith('HIDDEN:')
  );
  const mutedKeys = new Set(
    manualExpenses
      .filter((m) => m.is_muted === true || String(m.title).startsWith('HIDDEN:'))
      .map((m) => (m.merchant_key || String(m.title).replace(/^HIDDEN:/, '')).trim().toLowerCase())
      .filter(Boolean)
  );
  // Um manual com `merchant_key` assume o lugar do item detectado equivalente
  const linkedKeys = new Set(
    activeManual.map((m) => (m.merchant_key || '').trim().toLowerCase()).filter(Boolean)
  );
  const manualTitleKeys = new Set(activeManual.map((m) => merchantKey(m.title)).filter(Boolean));

  const isSuppressed = (rawKey: string, prefixedKey: string) =>
    mutedKeys.has(rawKey) ||
    mutedKeys.has(prefixedKey) ||
    linkedKeys.has(rawKey) ||
    linkedKeys.has(prefixedKey) ||
    manualTitleKeys.has(rawKey);

  // --- 5. Monta os itens de um período -------------------------------------
  let collapsedKeys = 0;

  const buildPeriod = (target: string): Commitment[] => {
    const items: Commitment[] = [];

    for (const manual of activeManual) {
      if (manual.end_date && periodOf(manual.end_date) < target) continue;
      const key = `manual:${manual.id}`;
      items.push({
        id: String(manual.id),
        key,
        kind: 'MANUAL',
        title: manual.title,
        amount: Number(manual.amount ?? 0),
        dueDay: Number(manual.due_day) || 10,
        category: manual.category || 'Outros',
        isAuto: false,
        isPaid: paidKeys.has(`${key}|${target}`),
        origin: 'MANUAL',
        confidence: 1,
      });
    }

    for (const chain of chains) {
      const info = installmentAt(chain, target);
      if (!info) continue;
      const rawKey = chain.key.replace(/^inst:/, '');
      if (isSuppressed(rawKey, chain.key)) continue;
      const account = accountById.get(chain.accountId);
      items.push({
        id: chain.key,
        key: chain.key,
        kind: 'INSTALLMENT',
        title: `${chain.title} (${info.current}/${info.total})`,
        amount: chain.amount,
        dueDay: resolveDueDay('CREDIT', chain.dueDay, account),
        category: chain.category,
        isAuto: true,
        isPaid: paidKeys.has(`${chain.key}|${target}`),
        origin: 'CREDIT',
        accountId: chain.accountId,
        occurrences: chain.observed,
        installments: info,
        confidence: 0.99,
      });
    }

    for (const group of recurring) {
      const rawKey = group.key.replace(/^rec:/, '');
      if (isSuppressed(rawKey, group.key)) continue;
      const account = accountById.get(group.accountId);
      items.push({
        id: group.key,
        key: group.key,
        kind: group.kind,
        title: group.title,
        amount: group.amount,
        dueDay: resolveDueDay(group.accountType, group.dueDay, account),
        category: group.category,
        isAuto: true,
        isPaid: paidKeys.has(`${group.key}|${target}`),
        origin: group.accountType === 'CREDIT' ? 'CREDIT' : 'BANK',
        accountId: group.accountId,
        occurrences: group.occurrences,
        lastDate: group.lastDate,
        confidence: group.confidence,
      });
    }

    // Garantia de unicidade: `key` é usada como React key e como identificador de
    // pagamento. Uma colisão aqui significa bug de agrupamento, então é
    // colapsada e contabilizada em vez de virar item fantasma na lista.
    const seen = new Set<string>();
    const unique = items.filter((item) => {
      if (seen.has(item.key)) {
        collapsedKeys++;
        return false;
      }
      seen.add(item.key);
      return true;
    });

    return unique.sort((a, b) => a.dueDay - b.dueDay || b.amount - a.amount);
  };

  const items = buildPeriod(period);

  const totalsByKind = emptyByKind();
  for (const item of items) totalsByKind[item.kind] += item.amount;
  const total = items.reduce((s, i) => s + i.amount, 0);

  // A projeção é ancorada em `projectionStart`, não no mês selecionado: assim a
  // barra de meses continua mostrando o passado depois de navegar para frente.
  const projection: PeriodProjection[] = [];
  for (let i = 0; i < projectionMonths; i++) {
    const target = addMonths(projectionStart, i);
    const monthItems = target === period ? items : buildPeriod(target);
    const byKind = emptyByKind();
    for (const item of monthItems) byKind[item.kind] += item.amount;
    projection.push({
      period: target,
      total: Number(monthItems.reduce((s, x) => s + x.amount, 0).toFixed(2)),
      byKind,
      itemCount: monthItems.length,
    });
  }

  return {
    period,
    items,
    totals: { total: Number(total.toFixed(2)), byKind: totalsByKind },
    projection,
    diagnostics: {
      transactionsScanned: transactions.length,
      accountsSkipped,
      duplicatesRemoved: removed,
      internalTransfersRemoved,
      installmentChains: chains.length,
      subscriptionsDetected: recurring.length,
      duplicateKeysCollapsed: collapsedKeys,
    },
  };
}
