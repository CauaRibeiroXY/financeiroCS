import {
  analyzePortfolio,
  DEFAULT_ASSUMPTIONS,
  monthlyRate,
  projectPortfolio,
} from '../portfolio';
import type { InvestmentRecord } from '@/app/types/pluggy';

let seq = 0;
function inv(partial: Partial<InvestmentRecord>): InvestmentRecord {
  return {
    investment_id: `inv-${seq++}`,
    item_id: 'item-1',
    name: 'Investimento',
    status: 'ACTIVE',
    ...partial,
  } as InvestmentRecord;
}

describe('monthlyRate', () => {
  it('usa a equivalência composta, não a divisão por 12', () => {
    // 12,68% a.a. equivale a exatamente 1% ao mês
    expect(monthlyRate(0.126825)).toBeCloseTo(0.01, 5);
    // A divisão simples daria 0,875% — o erro se acumula no horizonte longo
    expect(monthlyRate(0.105)).toBeLessThan(0.105 / 12);
  });

  it('doze meses compostos reconstroem a taxa anual', () => {
    const annual = 0.1;
    expect(Math.pow(1 + monthlyRate(annual), 12) - 1).toBeCloseTo(annual, 10);
  });
});

describe('projectPortfolio', () => {
  const base = { ...DEFAULT_ASSUMPTIONS, months: 12, monthlyContribution: 0 };

  it('o primeiro ponto é o valor de hoje, sem rendimento', () => {
    const { series } = projectPortfolio(10_000, 0.1, base, '2026-07');

    expect(series[0].monthIndex).toBe(0);
    expect(series[0].period).toBe('2026-07');
    expect(series[0].nominal).toBe(10_000);
    expect(series[0].contributed).toBe(10_000);
  });

  it('sem aporte, o saldo cresce exatamente à taxa anual em 12 meses', () => {
    const { finalNominal } = projectPortfolio(10_000, 0.1, base, '2026-07');
    expect(finalNominal).toBeCloseTo(11_000, 0);
  });

  it('soma os aportes ao total aportado, não ao rendimento', () => {
    const { series, totalContributed } = projectPortfolio(
      1000,
      0.1,
      { ...base, monthlyContribution: 100 },
      '2026-07'
    );

    // 1000 iniciais + 12 aportes de 100
    expect(totalContributed).toBe(2200);
    // O saldo final supera o aportado — a diferença é o juro
    expect(series[series.length - 1].nominal).toBeGreaterThan(2200);
  });

  it('a linha real fica abaixo da nominal quando há inflação', () => {
    const { series } = projectPortfolio(10_000, 0.1, { ...base, ipca: 0.045 }, '2026-07');
    const last = series[series.length - 1];

    expect(last.real).toBeLessThan(last.nominal);
    // Ganho real ≈ (1,10 / 1,045) − 1 ≈ 5,26%
    expect(last.real / 10_000 - 1).toBeCloseTo(0.0526, 3);
  });

  it('com taxa igual à inflação, o poder de compra não muda', () => {
    const { series } = projectPortfolio(
      10_000,
      0.045,
      { ...base, ipca: 0.045, months: 24 },
      '2026-07'
    );
    expect(series[series.length - 1].real).toBeCloseTo(10_000, 0);
  });

  it('a banda de cenários envolve o caso base', () => {
    const { series } = projectPortfolio(10_000, 0.1, { ...base, scenarioSpread: 0.25 }, '2026-07');
    const last = series[series.length - 1];

    expect(last.low).toBeLessThan(last.nominal);
    expect(last.high).toBeGreaterThan(last.nominal);
  });

  it('avança o período corretamente na virada do ano', () => {
    const { series } = projectPortfolio(1000, 0.1, { ...base, months: 6 }, '2026-10');
    expect(series.map((p) => p.period)).toEqual([
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
      '2027-03',
    ]);
  });
});

describe('analyzePortfolio — leitura das taxas', () => {
  const assumptions = { cdi: 0.1, ipca: 0.05, equity: 0.12 };

  it('lê percentual do CDI', () => {
    const result = analyzePortfolio(
      [inv({ type: 'FIXED_INCOME', rate_type: 'CDI', rate: 110, balance: 1000 })],
      assumptions
    );

    expect(result.positions[0].annualRate).toBeCloseTo(0.11);
    expect(result.positions[0].rateLabel).toBe('110% do CDI');
    expect(result.positions[0].rateBasis).toBe('contracted');
  });

  it('lê spread sobre o IPCA', () => {
    const result = analyzePortfolio(
      [inv({ type: 'FIXED_INCOME', rate_type: 'IPCA', rate: 5.5, balance: 1000 })],
      assumptions
    );

    expect(result.positions[0].annualRate).toBeCloseTo(0.105);
    expect(result.positions[0].rateLabel).toBe('IPCA + 5,50%');
  });

  it('trata rate baixo em papel indexado como spread, não como % do índice', () => {
    // 5 no CDI é "CDI + 5%", não "5% do CDI" — nenhum CDB paga 5% do CDI.
    const result = analyzePortfolio(
      [inv({ type: 'FIXED_INCOME', rate_type: 'CDI', rate: 5, balance: 1000 })],
      assumptions
    );
    expect(result.positions[0].annualRate).toBeCloseTo(0.15);
  });

  it('lê prefixado', () => {
    const result = analyzePortfolio(
      [inv({ type: 'FIXED_INCOME', rate_type: 'PRE_FIXADO', fixed_annual_rate: 12.5, balance: 1000 })],
      assumptions
    );

    expect(result.positions[0].annualRate).toBeCloseTo(0.125);
    expect(result.positions[0].rateBasis).toBe('contracted');
  });

  it('cai para o histórico de 12 meses quando não há taxa contratada', () => {
    const result = analyzePortfolio(
      [inv({ type: 'MUTUAL_FUND', last_twelve_months_rate: 8.4, balance: 1000 })],
      assumptions
    );

    expect(result.positions[0].annualRate).toBeCloseTo(0.084);
    expect(result.positions[0].rateBasis).toBe('historical');
  });

  it('usa a premissa da classe quando não há taxa nem histórico', () => {
    const result = analyzePortfolio([inv({ type: 'EQUITY', balance: 1000 })], assumptions);

    expect(result.positions[0].annualRate).toBeCloseTo(0.12);
    expect(result.positions[0].rateBasis).toBe('assumed');
    expect(result.positions[0].rateLabel).toBeNull();
  });
});

describe('analyzePortfolio — carteira', () => {
  it('pondera a taxa da carteira pelo valor, não pela contagem', () => {
    const result = analyzePortfolio(
      [
        inv({ type: 'FIXED_INCOME', rate_type: 'PRE_FIXADO', fixed_annual_rate: 10, balance: 9000 }),
        inv({ type: 'FIXED_INCOME', rate_type: 'PRE_FIXADO', fixed_annual_rate: 20, balance: 1000 }),
      ],
      { cdi: 0.1 }
    );

    // Média simples daria 15%; ponderada dá 11%
    expect(result.weightedAnnualRate).toBeCloseTo(0.11);
  });

  it('deriva o lucro quando o conector só informa o aplicado', () => {
    const result = analyzePortfolio([
      inv({ type: 'FIXED_INCOME', balance: 1200, amount_original: 1000 }),
    ]);

    expect(result.positions[0].profit).toBe(200);
    expect(result.positions[0].profitRate).toBeCloseTo(0.2);
    expect(result.totalProfitRate).toBeCloseTo(0.2);
  });

  it('mantém nulo o que o banco não informou, em vez de assumir zero', () => {
    const result = analyzePortfolio([inv({ type: 'EQUITY', balance: 500 })]);

    expect(result.totalInvested).toBeNull();
    expect(result.totalProfit).toBeNull();
    expect(result.totalWithdrawable).toBeNull();
    expect(result.total).toBe(500);
  });

  it('descarta posições encerradas e zeradas', () => {
    const result = analyzePortfolio([
      inv({ balance: 1000 }),
      inv({ balance: 5000, status: 'TOTAL_WITHDRAWAL' }),
      inv({ balance: 0 }),
    ]);

    expect(result.positions).toHaveLength(1);
    expect(result.total).toBe(1000);
  });

  it('calcula o valor por quantidade × cota quando não há saldo', () => {
    const result = analyzePortfolio([inv({ type: 'EQUITY', quantity: 10, value: 25.5 })]);
    expect(result.total).toBe(255);
  });

  it('classifica os vencimentos em faixas', () => {
    const result = analyzePortfolio(
      [
        inv({ balance: 1000 }), // sem vencimento → liquidez
        inv({ balance: 2000, due_date: '2027-01-15' }), // 6 meses
        inv({ balance: 3000, due_date: '2029-07-15' }), // 36 meses
      ],
      {},
      '2026-07'
    );

    const byKey = new Map(result.maturities.map((b) => [b.key, b.value]));
    expect(byKey.get('liquid')).toBe(1000);
    expect(byKey.get('12m')).toBe(2000);
    expect(byKey.get('60m')).toBe(3000);
  });

  it('mede quanto da carteira tem taxa contratada', () => {
    const result = analyzePortfolio([
      inv({ type: 'FIXED_INCOME', rate_type: 'CDI', rate: 100, balance: 7000 }),
      inv({ type: 'EQUITY', balance: 3000 }),
    ]);

    expect(result.rateCoverage.contracted).toBe(7000);
    expect(result.rateCoverage.assumed).toBe(3000);
  });

  it('carteira vazia não quebra a projeção', () => {
    const result = analyzePortfolio([]);

    expect(result.total).toBe(0);
    expect(result.weightedAnnualRate).toBe(0);
    expect(result.projection.series[0].nominal).toBe(0);
  });
});
