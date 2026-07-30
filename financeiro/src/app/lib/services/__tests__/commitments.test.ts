import {
  addMonths,
  detectCommitments,
  merchantKey,
  monthsBetween,
  periodOf,
} from '../commitments';
import type { AccountRecord, TransactionRecord } from '@/app/types/pluggy';

// Contas reais do dump: 3 cartões, sendo dois espelhos da mesma fatura
const ACCOUNTS = [
  {
    account_id: '17554880-b487-4285-b5bf-78549db883f6',
    type: 'CREDIT',
    name: 'Cartao A (billId)',
    credit_data: { balance_due_date: '2026-08-13T00:00:00.000Z' },
  },
  {
    account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
    type: 'CREDIT',
    name: 'Cartao A (espelho)',
    credit_data: { balance_due_date: '2026-08-13T00:00:00.000Z' },
  },
  {
    account_id: '7218de2f-0f24-4701-976c-13c758ebbb96',
    type: 'CREDIT',
    name: 'Cartao B',
    credit_data: { balance_due_date: '2026-08-10T00:00:00.000Z' },
  },
  { account_id: 'bank-1', type: 'BANK', name: 'Conta corrente' },
] as unknown as AccountRecord[];

let seq = 0;
function tx(partial: Partial<TransactionRecord>): TransactionRecord {
  return {
    transaction_id: `tx-${seq++}`,
    account_id: '17554880-b487-4285-b5bf-78549db883f6',
    date: '2026-07-21 03:00:00+00',
    description: 'X',
    amount: 10,
    type: 'DEBIT',
    status: 'PENDING',
    ...partial,
  } as TransactionRecord;
}

/** Assinatura de cartão parcelada em 12x, como o conector devolve. */
function installmentSeries(
  description: string,
  amount: number,
  opts: { fromPeriod: string; fromNumber: number; total: number; accountId?: string; day?: string }
) {
  const out: TransactionRecord[] = [];
  for (let i = 0; opts.fromNumber + i <= opts.total; i++) {
    const period = addMonths(opts.fromPeriod, i);
    out.push(
      tx({
        account_id: opts.accountId,
        description,
        amount,
        date: `${period}-${opts.day ?? '21'} 03:00:00+00`,
        category: 'Video streaming',
        credit_card_metadata: {
          billId: `bill-${period}`,
          installmentNumber: opts.fromNumber + i,
          totalInstallments: opts.total,
        },
      })
    );
  }
  return out;
}

describe('helpers de período', () => {
  it('lê o mês pela data civil, sem deslocar por fuso', () => {
    // 03:00Z do dia 1º viraria o mês anterior em America/Sao_Paulo
    expect(periodOf('2026-07-01 03:00:00+00')).toBe('2026-07');
    expect(periodOf('2026-12-31 03:00:00+00')).toBe('2026-12');
  });

  it('soma e subtrai meses atravessando o ano', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(monthsBetween('2026-07', '2027-03')).toBe(8);
  });
});

describe('merchantKey', () => {
  it('unifica o mesmo estabelecimento com colunas desalinhadas', () => {
    expect(merchantKey('DL UBERRIDES           SAO PAULO     BRA')).toBe(
      merchantKey('DL           UberRides Sao Paulo     BRA')
    );
  });

  it('remove sufixo de cidade/país e prefixo de adquirente', () => {
    expect(merchantKey('AMAZON PRIME BR        SAO PAULO     BRA')).toBe('amazon prime');
    expect(merchantKey('DM HELPHBOMAXCOM       SAO PAULO     BRA')).toBe('helphbomaxcom');
  });

  it('mantém iguais as variações de caixa e espaçamento', () => {
    expect(merchantKey('SUPERMERC. SAO GERALDO CRUZEIRO DA F BRA')).toBe(
      merchantKey('SUPERMERC  SAO GERALDO CRUZEIRO DA F BRA')
    );
    expect(merchantKey('NETFLIX ENTRETENIMENTO BARUERI       BRA')).toBe(
      merchantKey('NETFLIX ENTRETENIMENTO Barueri       BRA')
    );
  });

  it('extrai o beneficiário de um PIX', () => {
    expect(merchantKey('PIX ENVIADO - Cp :90400888-Bruna Ferreira Araujo')).toBe(
      'bruna ferreira araujo'
    );
  });
});

describe('detectCommitments — gastos de cartão', () => {
  it('conta compras de cartão, que vêm com amount POSITIVO', () => {
    // Este é o bug original: filtrar por `amount > 0` zerava todo o cartão.
    const transactions = installmentSeries('AMAZON PRIME BR        SAO PAULO     BRA', 13.9, {
      fromPeriod: '2026-04',
      fromNumber: 1,
      total: 12,
    });

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    const amazon = result.items.find((i) => i.title.includes('Amazon'));

    expect(amazon).toBeDefined();
    expect(amazon!.amount).toBe(13.9);
    expect(amazon!.kind).toBe('INSTALLMENT');
  });

  it('usa o vencimento da fatura como dia de pagamento, não a data da compra', () => {
    const transactions = installmentSeries('AMAZON PRIME BR        SAO PAULO     BRA', 13.9, {
      fromPeriod: '2026-04',
      fromNumber: 1,
      total: 12,
      day: '21',
    });

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    expect(result.items[0].dueDay).toBe(13); // balance_due_date do cartão
  });

  it('não dobra o valor quando duas conexões trazem a mesma compra', () => {
    const transactions: TransactionRecord[] = [
      // Mesma compra, dois account_id, transaction_id diferentes, 1 dia de diferença
      tx({
        account_id: '17554880-b487-4285-b5bf-78549db883f6',
        description: 'FARMACIA PARA TODOS    BREJO BONITO  BRA',
        amount: 42,
        date: '2026-07-18 03:00:00+00',
        category: 'Pharmacy',
      }),
      tx({
        account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
        description: 'FARMACIA PARA TODOS    BREJO BONITO  BRA',
        amount: 42,
        date: '2026-07-19 03:00:00+00',
        category: 'Pharmacy',
        credit_card_metadata: { payeeMCC: 5912, cardNumber: '9565' },
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.diagnostics.duplicatesRemoved).toBe(1);
  });

  it('não deduplica duas compras iguais na MESMA conta', () => {
    const transactions: TransactionRecord[] = [
      tx({ description: 'SUPERMERCADOS BH', amount: 71.76, date: '2026-07-26 03:00:00+00' }),
      tx({ description: 'SUPERMERCADOS BH', amount: 71.76, date: '2026-07-26 03:00:00+00' }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.diagnostics.duplicatesRemoved).toBe(0);
  });
});

describe('detectCommitments — parcelamentos', () => {
  it('projeta as parcelas restantes e a data de término', () => {
    // CARMO MOTOS: 62,00 em 6x, parcela 3 caiu em julho/2026
    const transactions = installmentSeries('CARMO MOTOS LTDA       MONTES CLAROS BRA', 62, {
      fromPeriod: '2026-05',
      fromNumber: 1,
      total: 6,
      day: '12',
    });

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    const carmo = result.items.find((i) => i.title.includes('Carmo'));

    expect(carmo?.installments).toEqual({
      current: 4,
      total: 6,
      remaining: 3,
      endsAt: '2026-10',
    });
  });

  it('para de cobrar depois da última parcela', () => {
    const transactions = installmentSeries('CARMO MOTOS LTDA       MONTES CLAROS BRA', 62, {
      fromPeriod: '2026-05',
      fromNumber: 1,
      total: 6,
      day: '12',
    });

    const emOutubro = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-10' });
    const emNovembro = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-11' });

    expect(emOutubro.items).toHaveLength(1);
    expect(emNovembro.items).toHaveLength(0);
  });

  it('não soma duas vezes as parcelas futuras que a Pluggy já envia', () => {
    // O dump traz parcelas até 2027-03 como PENDING. A projeção é derivada da
    // âncora, então cada mês cobra o valor uma única vez.
    const transactions = installmentSeries('AMAZON PRIME BR        SAO PAULO     BRA', 13.9, {
      fromPeriod: '2026-04',
      fromNumber: 1,
      total: 12,
    });

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    expect(result.totals.total).toBe(13.9);
  });

  it('não separa a compra quando as parcelas diferem por centavos', () => {
    // Mercado Livre lança 180,06 nas primeiras parcelas e 180,07 na última.
    const transactions = [
      tx({
        description: 'MERCADOLIVRE*2PRODUTOS',
        amount: 180.06,
        date: '2026-06-12 03:00:00+00',
        credit_card_metadata: { installmentNumber: 3, totalInstallments: 4 },
      }),
      tx({
        description: 'MERCADOLIVRE*2PRODUTOS',
        amount: 180.07,
        date: '2026-07-12 03:00:00+00',
        credit_card_metadata: { installmentNumber: 4, totalInstallments: 4 },
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.diagnostics.installmentChains).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].installments?.current).toBe(4);
  });

  it('funde a mesma parcela reportada por duas conexões em ciclos diferentes', () => {
    // Inter exporta o mesmo cartão como "THIAGO E SANTOS" e "GOLD", e o ciclo
    // de fatura pode vir defasado em um mês — a janela de 3 dias não fecha.
    const transactions = [
      tx({
        account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
        description: 'HNA*OBOTICARIO',
        amount: 54.37,
        date: '2026-07-12 03:00:00+00',
        credit_card_metadata: { installmentNumber: 2, totalInstallments: 3 },
      }),
      tx({
        account_id: '17554880-b487-4285-b5bf-78549db883f6',
        description: 'HNA*OBOTICARIO',
        amount: 54.39,
        date: '2026-08-12 03:00:00+00',
        credit_card_metadata: { installmentNumber: 2, totalInstallments: 3 },
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    expect(result.diagnostics.duplicatesRemoved).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('gera chaves únicas para cada cadeia de parcelamento', () => {
    // Chave duplicada quebra a lista no React e dobra o valor projetado.
    const transactions = [
      ...installmentSeries('CARMO MOTOS LTDA       MONTES CLAROS BRA', 62, {
        fromPeriod: '2026-05',
        fromNumber: 1,
        total: 6,
        day: '12',
      }),
      ...installmentSeries('LOJA X                 SAO PAULO     BRA', 62, {
        fromPeriod: '2026-01',
        fromNumber: 1,
        total: 6,
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-06' });
    const keys = result.items.map((i) => i.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(result.diagnostics.duplicateKeysCollapsed).toBe(0);
  });

  it('separa duas compras iguais feitas em meses diferentes', () => {
    const transactions = [
      ...installmentSeries('LOJA X                 SAO PAULO     BRA', 100, {
        fromPeriod: '2026-01',
        fromNumber: 1,
        total: 10,
      }),
      ...installmentSeries('LOJA X                 SAO PAULO     BRA', 100, {
        fromPeriod: '2026-06',
        fromNumber: 1,
        total: 10,
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    expect(result.diagnostics.installmentChains).toBe(2);
    expect(result.totals.total).toBe(200);
  });
});

describe('detectCommitments — assinaturas', () => {
  it('reconhece Netflix com uma única ocorrência (marca conhecida)', () => {
    const transactions = [
      tx({
        account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
        description: 'NETFLIX ENTRETENIMENTO BARUERI       BRA',
        amount: 44.9,
        date: '2026-07-19 03:00:00+00',
        category: 'Digital services',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-08' });
    const netflix = result.items.find((i) => i.title === 'Netflix');

    expect(netflix).toBeDefined();
    expect(netflix!.kind).toBe('SUBSCRIPTION');
    expect(netflix!.amount).toBe(44.9);
  });

  it('não trata supermercado como gasto fixo, mesmo repetindo todo mês', () => {
    const transactions: TransactionRecord[] = [];
    for (const period of ['2026-05', '2026-06', '2026-07']) {
      for (const [i, amount] of [39.88, 82.56, 154.95, 241.8, 71.76].entries()) {
        transactions.push(
          tx({
            description: 'SUPERMERCADOS BH       CONTAGEM      BRA',
            amount,
            date: `${period}-${String(10 + i).padStart(2, '0')} 03:00:00+00`,
            category: 'Groceries',
          })
        );
      }
    }

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    // 5 compras por mês: frequência alta e valor instável → não é compromisso
    expect(result.items.filter((i) => i.title.includes('Supermercados'))).toHaveLength(0);
  });

  it('detecta recorrência estável não catalogada com 3 meses no mesmo dia', () => {
    const transactions = ['2026-05', '2026-06', '2026-07'].map((period) =>
      tx({
        account_id: 'bank-1',
        description: 'Pix enviado Vinicius Gabriel Gomes Teixeira',
        amount: -70,
        date: `${period}-15 12:00:00+00`,
      })
    );

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    const item = result.items.find((i) => i.title.includes('Vinicius'));

    expect(item?.kind).toBe('SUBSCRIPTION');
    expect(item?.amount).toBe(70);
    expect(item?.dueDay).toBe(15);
    expect(item?.origin).toBe('BANK');
  });

  it('não promove dois deliveries de valor parecido a assinatura', () => {
    // Dois iFoods em meses diferentes passavam pela trilha genérica antiga.
    const transactions = [
      tx({
        description: 'IFD ERICA CRISTINA ALV MONTES CLAROS BRA',
        amount: 66.29,
        date: '2026-06-04 03:00:00+00',
        category: 'Food delivery',
      }),
      tx({
        description: 'IFD ERICA CRISTINA ALV MONTES CLAROS BRA',
        amount: 66.29,
        date: '2026-07-27 03:00:00+00',
        category: 'Food delivery',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.items).toHaveLength(0);
  });

  it('agrupa grafias diferentes da mesma marca num item só', () => {
    // `DL GOOGLE GOOGLE` e `GOOGLE ONE` viravam dois "Google" na lista.
    const transactions = [
      ...['2026-05', '2026-06'].map((p) =>
        tx({
          description: 'DL GOOGLE GOOGLE       SAO PAULO     BRA',
          amount: 9.99,
          date: `${p}-25 03:00:00+00`,
          category: 'Digital services',
        })
      ),
      tx({
        description: 'GOOGLE ONE            SAO PAULO     BRA',
        amount: 9.99,
        date: '2026-07-25 03:00:00+00',
        category: 'Digital services',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    const google = result.items.filter((i) => i.title === 'Google');

    expect(google).toHaveLength(1);
    expect(google[0].occurrences).toBe(3);
  });

  it('reconhece prestação de empréstimo com 2 meses', () => {
    const transactions = ['2026-06', '2026-07'].map((p) =>
      tx({
        account_id: 'bank-1',
        description: 'Pagamento de parcela empréstimos Mercado Pago',
        amount: -99.5,
        date: `${p}-04 12:00:00+00`,
      })
    );

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.items[0]?.kind).toBe('VARIABLE_RECURRING');
    expect(result.items[0]?.title).toBe('Empréstimo/Financiamento');
  });

  it('descarta assinatura cancelada há mais de 2 meses', () => {
    const transactions = [
      tx({
        description: 'SPOTIFY                SAO PAULO     BRA',
        amount: 21.9,
        date: '2026-01-10 03:00:00+00',
      }),
      tx({
        description: 'SPOTIFY                SAO PAULO     BRA',
        amount: 21.9,
        date: '2026-02-10 03:00:00+00',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.items).toHaveLength(0);
  });
});

describe('detectCommitments — lançamentos que não são gasto', () => {
  it('ignora pagamento de fatura em qualquer sinal ou tipo', () => {
    const transactions = [
      tx({
        description: 'PAGAMENTO ON LINE',
        amount: -1905.92,
        type: 'CREDIT',
        category: 'Shopping',
        date: '2026-07-13 03:00:00+00',
      }),
      tx({
        description: 'Pagamento recebido',
        amount: -1905.92,
        type: 'CREDIT',
        category: 'Credit card payment',
        date: '2026-06-13 03:00:00+00',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.items).toHaveLength(0);
  });

  it('remove o débito da conta corrente que quita a fatura do cartão', () => {
    const transactions = [
      tx({
        account_id: 'bank-1',
        description: 'Pagamento cartao',
        amount: -1905.92,
        type: 'DEBIT',
        date: '2026-07-13 12:00:00+00',
      }),
      tx({
        account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
        description: 'Credito de pagamento',
        amount: -1905.92,
        type: 'CREDIT',
        date: '2026-07-13 03:00:00+00',
      }),
      tx({
        account_id: 'bank-1',
        description: 'Pagamento cartao',
        amount: -1905.92,
        type: 'DEBIT',
        date: '2026-06-13 12:00:00+00',
      }),
      tx({
        account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
        description: 'Credito de pagamento',
        amount: -1905.92,
        type: 'CREDIT',
        date: '2026-06-13 03:00:00+00',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], { period: '2026-07' });
    expect(result.diagnostics.internalTransfersRemoved).toBe(2);
    expect(result.items).toHaveLength(0);
  });
});

describe('detectCommitments — manuais', () => {
  it('manual com merchant_key substitui o item detectado', () => {
    const transactions = [
      tx({
        description: 'NETFLIX ENTRETENIMENTO BARUERI       BRA',
        amount: 44.9,
        date: '2026-07-19 03:00:00+00',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [
      { id: 1, title: 'Netflix (plano família)', amount: 59.9, due_day: 5, merchant_key: 'netflix entretenimento' },
    ], { period: '2026-08' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].amount).toBe(59.9);
    expect(result.items[0].kind).toBe('MANUAL');
  });

  it('linha silenciada faz o item detectado desaparecer', () => {
    const transactions = [
      tx({
        description: 'NETFLIX ENTRETENIMENTO BARUERI       BRA',
        amount: 44.9,
        date: '2026-07-19 03:00:00+00',
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [
      { id: 1, title: 'Ignorado', amount: 0, merchant_key: 'netflix entretenimento', is_muted: true, is_active: false },
    ], { period: '2026-08' });

    expect(result.items).toHaveLength(0);
  });

  it('respeita end_date do manual', () => {
    const manual = [{ id: 1, title: 'Aluguel', amount: 1500, due_day: 5, end_date: '2026-09-30' }];

    expect(detectCommitments([], ACCOUNTS, manual, { period: '2026-09' }).items).toHaveLength(1);
    expect(detectCommitments([], ACCOUNTS, manual, { period: '2026-10' }).items).toHaveLength(0);
  });

  it('marca como pago pelo par chave+período', () => {
    const manual = [{ id: 7, title: 'Aluguel', amount: 1500, due_day: 5 }];
    const paidKeys = new Set(['manual:7|2026-08']);

    expect(detectCommitments([], ACCOUNTS, manual, { period: '2026-08', paidKeys }).items[0].isPaid).toBe(true);
    expect(detectCommitments([], ACCOUNTS, manual, { period: '2026-09', paidKeys }).items[0].isPaid).toBe(false);
  });
});

describe('detectCommitments — contas ignoradas', () => {
  it('descarta transações de conta fora da lista considerada', () => {
    const consideradas = ACCOUNTS.filter(
      (a) => a.account_id !== '92f6422e-e2dc-46ed-a010-705b4717f852'
    );

    const transactions = ['2026-05', '2026-06', '2026-07'].map((p) =>
      tx({
        account_id: '92f6422e-e2dc-46ed-a010-705b4717f852',
        description: 'NETFLIX ENTRETENIMENTO BARUERI       BRA',
        amount: 44.9,
        date: `${p}-19 03:00:00+00`,
      })
    );

    const result = detectCommitments(transactions, consideradas, [], { period: '2026-07' });
    expect(result.diagnostics.accountsSkipped).toBe(3);
    expect(result.items).toHaveLength(0);
  });
});

describe('detectCommitments — projeção', () => {
  it('inclui meses anteriores ao selecionado na barra de navegação', () => {
    const transactions = installmentSeries('CARMO MOTOS LTDA       MONTES CLAROS BRA', 62, {
      fromPeriod: '2026-05',
      fromNumber: 1,
      total: 6,
      day: '12',
    });

    const result = detectCommitments(transactions, ACCOUNTS, [], {
      period: '2026-08',
      projectionStart: '2026-05',
      projectionMonths: 6,
    });

    expect(result.projection[0].period).toBe('2026-05');
    expect(result.projection.map((p) => p.period)).toContain('2026-08');
    // O mês selecionado continua sendo o detalhado em `items`
    expect(result.period).toBe('2026-08');
    expect(result.items[0].installments?.current).toBe(4);
  });


  it('decresce conforme os parcelamentos acabam', () => {
    const transactions = [
      ...installmentSeries('CARMO MOTOS LTDA       MONTES CLAROS BRA', 62, {
        fromPeriod: '2026-05',
        fromNumber: 1,
        total: 6,
        day: '12',
      }),
      ...installmentSeries('AMAZON PRIME BR        SAO PAULO     BRA', 13.9, {
        fromPeriod: '2026-04',
        fromNumber: 1,
        total: 12,
      }),
    ];

    const result = detectCommitments(transactions, ACCOUNTS, [], {
      period: '2026-08',
      projectionStart: '2026-08',
      projectionMonths: 12,
    });

    const byPeriod = new Map(result.projection.map((p) => [p.period, p.total]));

    expect(byPeriod.get('2026-08')).toBe(75.9); // Carmo 4/6 + Amazon 5/12
    expect(byPeriod.get('2026-10')).toBe(75.9); // Carmo 6/6 (última) + Amazon
    expect(byPeriod.get('2026-11')).toBe(13.9); // Carmo terminou
    expect(byPeriod.get('2027-03')).toBe(13.9); // última da Amazon
    expect(byPeriod.get('2027-04')).toBe(0);
  });
});
