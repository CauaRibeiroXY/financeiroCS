/**
 * Tradução e cor das categorias que a Pluggy devolve em inglês.
 *
 * Compartilhado entre a análise de gastos e a visão geral: duas telas mostrando
 * "Supermercado" com cores diferentes, ou uma delas mostrando "Groceries", é
 * exatamente o que acontece quando cada arquivo mantém a própria cópia do mapa.
 */

const CATEGORY_PT: Record<string, string> = {
  Groceries: 'Supermercado',
  Supermarket: 'Supermercado',
  'Eating out': 'Restaurantes e bares',
  Restaurants: 'Restaurantes e bares',
  Bars: 'Restaurantes e bares',
  'Fast food': 'Restaurantes e bares',
  'Food delivery': 'Delivery',
  'Food & Dining': 'Restaurantes e bares',
  'Taxi and ride-hailing': 'Transporte',
  Transportation: 'Transporte',
  'Public transportation': 'Transporte',
  Parking: 'Transporte',
  'Gas station': 'Combustível',
  'Gas stations': 'Combustível',
  Automotive: 'Automotivo',
  Pharmacy: 'Farmácia',
  Health: 'Saúde',
  'Health & Fitness': 'Saúde',
  'Personal care': 'Cuidados pessoais',
  'Video streaming': 'Streaming',
  'Music streaming': 'Streaming',
  'Digital services': 'Serviços digitais',
  Telecommunications: 'Telecomunicações',
  Internet: 'Telecomunicações',
  Shopping: 'Compras',
  Clothing: 'Vestuário',
  Houseware: 'Casa',
  Electronics: 'Eletrônicos',
  Bookstore: 'Livraria',
  Tickets: 'Lazer',
  Entertainment: 'Lazer',
  Recreation: 'Lazer',
  Travel: 'Viagem',
  Education: 'Educação',
  Insurance: 'Seguros',
  Loans: 'Empréstimos',
  Taxes: 'Impostos',
  Fees: 'Tarifas',
  Investments: 'Investimentos',
  'Same person transfer': 'Transferências',
  Transfers: 'Transferências',
  Transfer: 'Transferências',
  'Credit card payment': 'Pagamento de fatura',
  Services: 'Serviços',
  Other: 'Outros',
};

export function translateCategory(raw?: string | null): string {
  if (!raw) return 'Sem categoria';
  return CATEGORY_PT[raw] ?? raw;
}

/** Paleta estável — a mesma chave recebe sempre a mesma cor. */
const PALETTE = [
  '#58a6ff',
  '#3fb950',
  '#f0883e',
  '#a371f7',
  '#db61a2',
  '#e3b341',
  '#39c5cf',
  '#ff7b72',
  '#7ee787',
  '#d2a8ff',
  '#ffa657',
  '#79c0ff',
];

export function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
