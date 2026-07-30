import { buildOverview } from '../overview';
import { buildCycleResolver } from '../billing-cycle';
import type {
  AccountRecord,
  CreditCardBillRecord,
  InvestmentRecord,
  TransactionRecord,
} from '@/app/types/pluggy';

const ACCOUNTS = [
  { account_id: 'bank-1', type: 'BANK', name: 'Conta corrente', balance: 5000 },
  { account_id: 'bank-2', type: 'BANK', name: 'Poupança', balance: 2000 },
  {
    account_id: 'card-1',
    type: 'CREDIT',
    name: 'Cartão',
    credit_data: {
      credit_limit: 10000,
      available_credit_limit: 7000,
      balance_due_date: '2026-08-15T00:00:00.000Z',
    },
  },
] as unknown as AccountRecord[];

const NOW = new Date('2026-07-31T12:00:00Z');

let seq = 0;
function tx(partial: Partial<TransactionRecord>): TransactionRecord {
  return {
    transaction_id: `tx-${seq++}`,
    account_id: 'card-1',
    date: '2026-07-10 03:00:00+00',
    description: 'Compra',
    amount: 100,
    type: 'DEBIT',
    status: 'POSTED',
    ...partial,
  } as TransactionRecord;
}

function bill(partial: Partial<CreditCardBillRecord>): CreditCardBillRecord {
  return {
    bill_id: `bill-${seq++}`,
    account_id: 'card-1',
    due_date: '2026-08-15 03:00:00+00',
    total_amount: 0,
    ...partial,
  } as CreditCardBillRecord;
}

function run(
  transactions: TransactionRecord[],
  bills: CreditCardBillRecord[] = [],
  investments: InvestmentRecord[] = [],
  period = '2026-07'
) {
  return buildOverview(transactions, ACCOUNTS, bills, investments, { period, now: NOW });
}

describe('buildOverview — partição por tipo de conta', () => {
  it('conta corrente + cartão fecha com o total', () => {
    const result = run([
      tx({ account_id: 'bank-1', description: 'Mercado', amount: -200 }),
      tx({ account_id: 'card-1', description: 'Farmacia', amount: 80 }),
      tx({ account_id: 'card-1', description: 'Posto', amount: 150 }),
    ]);

    expect(result.slices.bank.totalExpenses).toBe(200);
    expect(result.slices.creditMonth.totalExpenses).toBe(230);
    expect(result.slices.all.totalExpenses).toBe(430);
    expect(result.diagnostics.additivityDelta).toBe(0);
  });

  it('conta a compra do cartão UMA vez, mesmo com o pagamento da fatura na conta', () => {
    // A regressão que motivou o trabalho: a compra é DEBIT no cartão e o
    // pagamento é DEBIT na conta, então o total somava as duas pernas.
    const result = run([
      tx({ account_id: 'card-1', description: 'Compra no cartao', amount: 500 }),
      tx({
        account_id: 'bank-1',
        description: 'Pagamento fatura cartao',
        amount: -500,
        date: '2026-07-15 12:00:00+00',
      }),
      tx({
        account_id: 'card-1',
        description: 'Pagamento recebido',
        amount: -500,
        type: 'CREDIT',
        date: '2026-07-15 03:00:00+00',
      }),
    ]);

    expect(result.slices.all.totalExpenses).toBe(500);
    expect(result.slices.bank.totalExpenses).toBe(0);
    // O valor não some sem explicação: vira contexto no card de resultado
    expect(result.balances.cardBillPayments).toBe(500);
  });
});

describe('buildOverview — receita', () => {
  it('salário na conta corrente é receita', () => {
    const result = run([
      tx({
        account_id: 'bank-1',
        description: 'Salario',
        amount: 8000,
        type: 'CREDIT',
        date: '2026-07-05 12:00:00+00',
      }),
      tx({ account_id: 'bank-1', description: 'Mercado', amount: -300 }),
    ]);

    expect(result.slices.bank.totalIncome).toBe(8000);
    expect(result.slices.bank.partialResult).toBe(7700);
  });

  it('transferir entre contas próprias não vira receita', () => {
    const result = run([
      tx({
        account_id: 'bank-2',
        description: 'Transferencia enviada',
        amount: -1000,
        date: '2026-07-10 12:00:00+00',
      }),
      tx({
        account_id: 'bank-1',
        description: 'Transferencia recebida',
        amount: 1000,
        type: 'CREDIT',
        date: '2026-07-10 13:00:00+00',
      }),
    ]);

    expect(result.slices.bank.totalIncome).toBe(0);
    expect(result.slices.bank.totalExpenses).toBe(0);
    expect(result.diagnostics.internalInflowsRemoved).toBe(1);
  });

  it('CREDIT em conta de cartão nunca é receita', () => {
    const result = run([
      tx({
        account_id: 'card-1',
        description: 'Estorno de compra',
        amount: -120,
        type: 'CREDIT',
      }),
    ]);

    expect(result.slices.all.totalIncome).toBe(0);
  });

  it('escopo cartão devolve receita null, não zero', () => {
    const result = run([tx({ description: 'Compra', amount: 100 })]);

    expect(result.slices.creditMonth.totalIncome).toBeNull();
    expect(result.slices.creditMonth.partialResult).toBeNull();
    expect(result.slices.bank.totalIncome).toBe(0);
  });
});

describe('buildOverview — ciclo de fatura', () => {
  it('compra do fim do mês cai na fatura seguinte', () => {
    const transactions = [
      tx({
        description: 'Compra 25/07',
        amount: 300,
        date: '2026-07-25 03:00:00+00',
        credit_card_metadata: { billId: 'bill-ago' },
      }),
    ];
    const bills = [bill({ bill_id: 'bill-ago', due_date: '2026-08-15 03:00:00+00' })];

    const julho = run(transactions, bills, [], '2026-07');
    const agosto = run(transactions, bills, [], '2026-08');

    // Pelo mês civil é gasto de julho...
    expect(julho.slices.creditMonth.totalExpenses).toBe(300);
    expect(julho.slices.creditCycle.totalExpenses).toBe(0);
    // ...mas entra na fatura que vence em agosto
    expect(agosto.slices.creditCycle.totalExpenses).toBe(300);
  });

  it('sem metadado de fatura, cai no mês civil e fica contabilizado', () => {
    const result = run([tx({ description: 'Compra antiga', amount: 50 })]);

    expect(result.slices.creditCycle.totalExpenses).toBe(50);
    expect(result.diagnostics.cycle.unresolved).toBe(1);
  });

  it('rótulo de comparação muda no modo fatura', () => {
    const result = run([tx({ amount: 10 })]);

    expect(result.slices.creditMonth.comparisonLabel).toBe('mês passado');
    expect(result.slices.creditCycle.comparisonLabel).toBe('fatura anterior');
  });
});

describe('buildCycleResolver — calibração do billForecastDate', () => {
  it('usa billId quando a fatura foi sincronizada', () => {
    const bills = [bill({ bill_id: 'b1', due_date: '2026-08-15 03:00:00+00' })];
    const resolver = buildCycleResolver(ACCOUNTS, bills, []);

    const assignment = resolver.resolve(
      tx({ credit_card_metadata: { billId: 'b1' }, date: '2026-07-25 03:00:00+00' })
    );

    expect(assignment).toEqual({ period: '2026-08', source: 'billId' });
  });

  it('mede o offset do forecast em vez de assumir', () => {
    // Conector que rotula a previsão pelo mês de FECHAMENTO: forecast 2026-07
    // para uma fatura que vence em agosto.
    const bills = [bill({ bill_id: 'b1', due_date: '2026-08-15 03:00:00+00' })];
    const calibration = [
      tx({ credit_card_metadata: { billId: 'b1', billForecastDate: '2026-07' } }),
    ];

    const resolver = buildCycleResolver(ACCOUNTS, bills, calibration);
    expect(resolver.diagnostics.offsetByAccount['card-1']).toBe(1);

    // Uma compra que só tem forecast é corrigida pelo offset medido
    const assignment = resolver.resolve(
      tx({ credit_card_metadata: { billForecastDate: '2026-09' } })
    );
    expect(assignment).toEqual({ period: '2026-10', source: 'forecast' });
  });

  it('offset zero quando o forecast já é o mês de vencimento', () => {
    // É o caso real do Mercado Pago: forecast 2026-07 → vencimento 2026-07-17
    const bills = [bill({ bill_id: 'b1', due_date: '2026-07-17 00:00:00+00' })];
    const calibration = [
      tx({ credit_card_metadata: { billId: 'b1', billForecastDate: '2026-07' } }),
    ];

    const resolver = buildCycleResolver(ACCOUNTS, bills, calibration);
    expect(resolver.diagnostics.offsetByAccount['card-1']).toBe(0);
  });
});

describe('buildOverview — comparação de ritmo', () => {
  it('compara com o mesmo ponto do mês anterior, não com o mês inteiro', () => {
    // Hoje é dia 31/07. Junho teve 300 até o dia 10 e 1000 no total.
    const result = run([
      tx({ account_id: 'bank-1', amount: -400, date: '2026-07-05 12:00:00+00' }),
      tx({ account_id: 'bank-1', amount: -300, date: '2026-06-10 12:00:00+00' }),
      tx({ account_id: 'bank-1', amount: -700, date: '2026-06-28 12:00:00+00' }),
    ]);

    expect(result.slices.bank.totalExpenses).toBe(400);
    expect(result.slices.bank.previousExpenses).toBe(1000);
    // Julho está no dia 31, então o corte de junho é o mês todo
    expect(result.slices.bank.previousExpensesToDate).toBe(1000);
  });

  it('corta o período anterior no dia em que o atual está', () => {
    const meioDoMes = new Date('2026-07-10T12:00:00Z');
    const result = buildOverview(
      [
        tx({ account_id: 'bank-1', amount: -400, date: '2026-07-05 12:00:00+00' }),
        tx({ account_id: 'bank-1', amount: -300, date: '2026-06-08 12:00:00+00' }),
        tx({ account_id: 'bank-1', amount: -700, date: '2026-06-28 12:00:00+00' }),
      ],
      ACCOUNTS,
      [],
      [],
      { period: '2026-07', now: meioDoMes }
    );

    // No dia 10, junho só tinha 300 acumulados — comparar com 1000 seria injusto
    expect(result.slices.bank.previousExpenses).toBe(1000);
    expect(result.slices.bank.previousExpensesToDate).toBe(300);
    expect(result.slices.bank.elapsedDays).toBe(10);
  });

  it('esconde a linha atual nos dias que ainda não chegaram', () => {
    const meioDoMes = new Date('2026-07-10T12:00:00Z');
    const result = buildOverview(
      [tx({ account_id: 'bank-1', amount: -400, date: '2026-07-05 12:00:00+00' })],
      ACCOUNTS,
      [],
      [],
      { period: '2026-07', now: meioDoMes }
    );

    const dias = result.slices.bank.spendingByDay;
    expect(dias[9].current).toBe(400); // dia 10
    expect(dias[10].current).toBeNull(); // dia 11 ainda não aconteceu
  });
});

describe('buildOverview — eixo do modo fatura', () => {
  it('ordena pelo dia do ciclo, não pelo dia do mês', () => {
    // Uma fatura atravessa dois meses civis: 25/07 e 03/08 são a mesma fatura.
    // Pelo dia do mês a curva acumulada sairia fora de ordem (dia 3 depois do 25).
    const transactions = [
      tx({
        amount: 100,
        date: '2026-07-25 03:00:00+00',
        credit_card_metadata: { billId: 'b-set' },
      }),
      tx({
        amount: 50,
        date: '2026-08-03 03:00:00+00',
        credit_card_metadata: { billId: 'b-set' },
      }),
    ];
    const bills = [bill({ bill_id: 'b-set', due_date: '2026-09-15 03:00:00+00' })];

    const result = buildOverview(transactions, ACCOUNTS, bills, [], {
      period: '2026-09',
      now: new Date('2026-08-20T12:00:00Z'),
    });

    const dias = result.slices.creditCycle.spendingByDay;
    // Primeira compra do ciclo é o dia 1; a de 03/08 cai 9 dias depois
    expect(dias[0].current).toBe(100);
    expect(dias[9].current).toBe(150);
    expect(result.slices.creditCycle.dayLabel).toBe('Dia do ciclo');
  });

  it('mantém o dia do mês no modo civil', () => {
    const result = run([tx({ amount: 100, date: '2026-07-25 03:00:00+00' })]);

    const dias = result.slices.creditMonth.spendingByDay;
    expect(dias[23].current).toBe(0); // dia 24
    expect(dias[24].current).toBe(100); // dia 25
    expect(result.slices.creditMonth.dayLabel).toBe('Dia');
  });
});

describe('buildOverview — saldos e cartões', () => {
  it('patrimônio soma só conta corrente e pagamento', () => {
    const result = run([]);
    expect(result.balances.patrimony).toBe(7000);
  });

  it('limite ausente vira null, não zero', () => {
    const semLimite = [
      { account_id: 'card-9', type: 'CREDIT', name: 'Cartão sem dados' },
    ] as unknown as AccountRecord[];

    const result = buildOverview([], semLimite, [], [], { period: '2026-07', now: NOW });
    expect(result.balances.creditLimit).toBeNull();
    expect(result.balances.availableCredit).toBeNull();
  });

  it('ignora posição de investimento resgatada', () => {
    const investments = [
      { investment_id: 'i1', balance: 1000, status: 'ACTIVE' },
      { investment_id: 'i2', balance: 5000, status: 'TOTAL_WITHDRAWAL' },
    ] as unknown as InvestmentRecord[];

    const result = run([], [], investments);
    expect(result.balances.totalInvestments).toBe(1000);
  });

  it('não conta parcela futura como gasto do mês', () => {
    const result = run([
      tx({ description: 'Parcela 1', amount: 100, date: '2026-07-10 03:00:00+00' }),
      tx({
        description: 'Parcela 2',
        amount: 100,
        date: '2026-08-10 03:00:00+00',
        status: 'PENDING',
      }),
    ]);

    expect(result.slices.all.totalExpenses).toBe(100);
  });

  it('lê o mês pela data civil, sem deslocar por fuso', () => {
    // 03:00Z do dia 1º cairia em junho no fuso de São Paulo
    const result = run([tx({ amount: 250, date: '2026-07-01 03:00:00+00' })]);
    expect(result.slices.all.totalExpenses).toBe(250);
  });
});
