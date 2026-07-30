import { analyzeSpending } from '../spending';
import type { AccountRecord, TransactionRecord } from '@/app/types/pluggy';

const ACCOUNTS = [
  { account_id: 'card-a', type: 'CREDIT', name: 'Cartao A' },
  { account_id: 'card-a-mirror', type: 'CREDIT', name: 'Cartao A (espelho)' },
  { account_id: 'bank-1', type: 'BANK', name: 'Conta corrente' },
] as unknown as AccountRecord[];

let seq = 0;
function tx(partial: Partial<TransactionRecord>): TransactionRecord {
  return {
    transaction_id: `tx-${seq++}`,
    account_id: 'card-a',
    date: '2026-07-10 03:00:00+00',
    description: 'X',
    amount: 10,
    type: 'DEBIT',
    status: 'POSTED',
    ...partial,
  } as TransactionRecord;
}

describe('analyzeSpending — agrupamento por categoria', () => {
  it('soma o mês por categoria e traduz o rótulo', () => {
    const transactions = [
      tx({ description: 'SUPERMERCADOS BH', amount: 100, category: 'Groceries' }),
      tx({ description: 'FRIGORIFICO', amount: 50, category: 'Groceries' }),
      tx({ description: 'IFD ALGUEM', amount: 40, category: 'Food delivery' }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, { period: '2026-07' });
    const byLabel = new Map(result.groups.map((g) => [g.label, g.amount]));

    expect(byLabel.get('Supermercado')).toBe(150);
    expect(byLabel.get('Delivery')).toBe(40);
    expect(result.total).toBe(190);
  });

  it('calcula a fatia e a variação contra o mês anterior', () => {
    const transactions = [
      tx({ description: 'SUPERMERCADOS BH', amount: 100, category: 'Groceries' }),
      tx({
        description: 'SUPERMERCADOS BH',
        amount: 80,
        category: 'Groceries',
        date: '2026-06-10 03:00:00+00',
      }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, { period: '2026-07' });
    const mercado = result.groups.find((g) => g.label === 'Supermercado')!;

    expect(mercado.previousAmount).toBe(80);
    expect(mercado.change).toBeCloseTo(0.25);
    expect(mercado.share).toBe(1);
  });

  it('agrupa lançamentos sem categoria em vez de descartá-los', () => {
    const transactions = [tx({ description: 'ALGUMA COISA', amount: 30, category: null })];

    const result = analyzeSpending(transactions, ACCOUNTS, { period: '2026-07' });
    expect(result.groups[0].label).toBe('Sem categoria');
    expect(result.total).toBe(30);
  });
});

describe('analyzeSpending — agrupamento por empresa', () => {
  it('junta todos os pedidos de iFood num item só', () => {
    // Cada pedido chega como `IFD <restaurante>`: sem o catálogo de empresas o
    // gasto com iFood fica pulverizado em uma linha por restaurante.
    const transactions = [
      tx({ description: 'IFD KRISLEN CARLA SANT MONTES CLAROS BRA', amount: 68.24, category: 'Food delivery' }),
      tx({ description: 'IFD ERICA CRISTINA ALV MONTES CLAROS BRA', amount: 66.29, category: 'Food delivery' }),
      tx({ description: 'IFD EDIVALDO DE OLIVEI MONTES CLAROS BRA', amount: 47.27, category: 'Food delivery' }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, {
      period: '2026-07',
      groupBy: 'merchant',
    });

    const ifood = result.groups.find((g) => g.label === 'iFood');
    expect(ifood?.amount).toBeCloseTo(181.8);
    expect(ifood?.transactions).toBe(3);
    expect(result.groups).toHaveLength(1);
  });

  it('unifica as grafias do Uber', () => {
    const transactions = [
      tx({ description: 'DL UBERRIDES           SAO PAULO     BRA', amount: 6.95 }),
      tx({ description: 'DL           UberRides Sao Paulo     BRA', amount: 7.91 }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, {
      period: '2026-07',
      groupBy: 'merchant',
    });

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].label).toBe('Uber');
    expect(result.groups[0].amount).toBeCloseTo(14.86);
  });

  it('mantém o beneficiário do PIX como empresa própria', () => {
    // "Quanto eu mando para o fulano todo mês" é a pergunta que isso responde.
    const transactions = [
      tx({
        account_id: 'bank-1',
        description: 'Pix enviado Vinicius Gabriel Gomes Teixeira',
        amount: -70,
        date: '2026-07-15 12:00:00+00',
      }),
      tx({
        account_id: 'bank-1',
        description: 'Pix enviado Vinicius Gabriel Gomes Teixeira',
        amount: -70,
        date: '2026-06-15 12:00:00+00',
      }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, {
      period: '2026-07',
      groupBy: 'merchant',
    });

    const grupo = result.groups[0];
    expect(grupo.label).toBe('Vinicius Gabriel Gomes Teixeira');
    expect(grupo.amount).toBe(70);
    expect(grupo.previousAmount).toBe(70);
  });
});

describe('analyzeSpending — higiene dos dados', () => {
  it('não dobra o gasto quando duas conexões trazem a mesma compra', () => {
    const transactions = [
      tx({ account_id: 'card-a', description: 'SUPERMERCADOS BH', amount: 71.76, category: 'Groceries' }),
      tx({
        account_id: 'card-a-mirror',
        description: 'SUPERMERCADOS BH',
        amount: 71.76,
        category: 'Groceries',
        date: '2026-07-11 03:00:00+00',
      }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, { period: '2026-07' });
    expect(result.total).toBe(71.76);
    expect(result.diagnostics.duplicatesRemoved).toBe(1);
  });

  it('ignora pagamento de fatura — não é consumo', () => {
    const transactions = [
      tx({ description: 'SUPERMERCADOS BH', amount: 100, category: 'Groceries' }),
      tx({
        account_id: 'bank-1',
        description: 'Pagamento fatura cartao',
        amount: -1905.92,
        date: '2026-07-13 12:00:00+00',
      }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, { period: '2026-07' });
    expect(result.total).toBe(100);
  });

  it('não conta parcelas futuras como gasto do mês', () => {
    // A Pluggy devolve as parcelas seguintes como PENDING com data futura.
    const transactions = [
      tx({ description: 'LOJA X', amount: 100, date: '2026-07-10 03:00:00+00' }),
      tx({ description: 'LOJA X', amount: 100, date: '2026-08-10 03:00:00+00', status: 'PENDING' }),
      tx({ description: 'LOJA X', amount: 100, date: '2026-09-10 03:00:00+00', status: 'PENDING' }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, { period: '2026-07' });
    expect(result.total).toBe(100);
  });
});

describe('analyzeSpending — janela e médias', () => {
  it('monta a linha do tempo com todos os meses da janela, inclusive vazios', () => {
    const transactions = [
      tx({ description: 'LOJA X', amount: 100, date: '2026-05-10 03:00:00+00' }),
      tx({ description: 'LOJA X', amount: 200, date: '2026-07-10 03:00:00+00' }),
    ];

    const result = analyzeSpending(transactions, ACCOUNTS, {
      period: '2026-07',
      windowMonths: 3,
    });

    expect(result.timeline).toEqual([
      { period: '2026-05', total: 100 },
      { period: '2026-06', total: 0 },
      { period: '2026-07', total: 200 },
    ]);
  });

  it('respeita o limite de grupos retornados', () => {
    const transactions = Array.from({ length: 10 }, (_, i) =>
      tx({ description: `LOJA ${String.fromCharCode(65 + i)}`, amount: (i + 1) * 10 })
    );

    const result = analyzeSpending(transactions, ACCOUNTS, {
      period: '2026-07',
      groupBy: 'merchant',
      limit: 3,
    });

    expect(result.groups).toHaveLength(3);
    // Ordenado por valor decrescente
    expect(result.groups[0].amount).toBe(100);
  });
});
