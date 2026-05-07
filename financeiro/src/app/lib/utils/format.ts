/**
 * Formata um valor numérico para moeda BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma string de data para o formato brasileiro
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formata uma data para formato curto (dd/MM/yyyy)
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formata uma variação percentual com sinal
 */
export function formatPercentage(value: number): string {
  const formatted = Math.abs(value).toFixed(1).replace('.', ',');
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
}

/**
 * Retorna a cor Tailwind para uma categoria
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Serviços': '#3b82f6',
    'Utensílios domésticos': '#f97316',
    'Postos de combustível': '#f97316',
    'Telecomunicações': '#06b6d4',
    'Automotivo': '#f97316',
    'Energia elétrica': '#eab308',
    'Transferência - PIX': '#8b5cf6',
    'Internet': '#06b6d4',
    'Água': '#3b82f6',
    'Alimentação': '#10b981',
    'Saúde': '#ef4444',
    'Lazer': '#ec4899',
    'Educação': '#6366f1',
    'Investimentos': '#10b981',
    'Juros e dividendos': '#10b981',
    'Outros': '#6b7280',
  };
  return colors[category] || '#6b7280';
}

/**
 * Retorna as iniciais de um nome
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Trunca uma string no tamanho máximo
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Retorna o caminho de um logo local baseado no nome da instituição
 */
export function getLocalLogo(name?: string): string | null {
  if (!name) return null;
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized.includes('itau')) return '/logos/logo_itau.png';
  if (normalized.includes('inter') || normalized.includes('gold')) return '/logos/logo_inter.png';
  if (normalized.includes('mercado pago') || normalized.includes('mercadopago')) return '/logos/logo_mercadopago.png';
  return null;
}
