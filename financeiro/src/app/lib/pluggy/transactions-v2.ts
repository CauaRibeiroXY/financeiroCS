import axios from 'axios';
import type { Transaction } from 'pluggy-sdk';

/**
 * O `pluggy-sdk` (0.79.0) usa `GET /transactions?accountId=`, que a Pluggy
 * descontinuou — hoje responde 410 Gone com corpo vazio. O substituto é
 * `GET /v2/transactions`, com paginação por cursor via campo `next`.
 *
 * Os campos de cada transação são idênticos aos do v1, então o mapper
 * existente continua válido. Quando o SDK passar a expor o v2, este módulo
 * pode ser removido em favor de `pluggyClient.fetchTransactions`.
 */

const PLUGGY_API = 'https://api.pluggy.ai';

// A apiKey da Pluggy vale ~2h; renovamos com folga.
const API_KEY_TTL_MS = 90 * 60 * 1000;
const MAX_PAGES = 500;

let cachedApiKey: { key: string; expiresAt: number } | null = null;

async function getApiKey(): Promise<string> {
  if (cachedApiKey && cachedApiKey.expiresAt > Date.now()) {
    return cachedApiKey.key;
  }

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Pluggy credentials: PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET are required'
    );
  }

  const { data } = await axios.post<{ apiKey: string }>(`${PLUGGY_API}/auth`, {
    clientId,
    clientSecret,
  });

  cachedApiKey = { key: data.apiKey, expiresAt: Date.now() + API_KEY_TTL_MS };
  return data.apiKey;
}

interface TransactionsV2Response {
  results: Transaction[];
  next: string | null;
}

/**
 * Monta a URL da próxima página a partir do campo `next`.
 *
 * A Pluggy devolve `next` como uma QUERY STRING pronta, começando com '?' e já
 * contendo o accountId e o cursor no parâmetro `after`:
 *
 *   "?accountId=562b795d-...&after=MjAyMC0xMC0xNVQwMDowMDowMC4wMDBafGE4NTM0Yzg1..."
 *
 * Basta concatenar ao path. As outras formas são defensivas, caso o formato
 * mude. O cursor é opaco — não tente interpretá-lo.
 */
function resolveNextUrl(next: string, accountId: string): string {
  if (next.startsWith('?')) return `${PLUGGY_API}/v2/transactions${next}`;
  if (next.startsWith('http://') || next.startsWith('https://')) return next;
  if (next.startsWith('/')) return `${PLUGGY_API}${next}`;

  // Token solto: o parâmetro do cursor é `after`, não `cursor`.
  return `${PLUGGY_API}/v2/transactions?accountId=${encodeURIComponent(
    accountId
  )}&after=${encodeURIComponent(next)}`;
}

/**
 * Filtros aceitos pelo /v2/transactions (verificados contra a API).
 * `pageSize`/`limit` NÃO são aceitos — o tamanho da página é do servidor,
 * e a paginação se faz seguindo o campo `next`.
 */
export interface TransactionsV2Filters {
  dateFrom?: string;
  dateTo?: string;
  createdAtFrom?: string;
  ids?: string[];
}

export async function fetchAllTransactionsV2(
  accountId: string,
  filters: TransactionsV2Filters = {}
): Promise<Transaction[]> {
  const apiKey = await getApiKey();
  const headers = { 'X-API-KEY': apiKey };

  const params = new URLSearchParams({ accountId });
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.createdAtFrom) params.set('createdAtFrom', filters.createdAtFrom);
  if (filters.ids?.length) params.set('ids', filters.ids.join(','));

  const all: Transaction[] = [];
  let url: string | null = `${PLUGGY_API}/v2/transactions?${params.toString()}`;
  let pages = 0;

  while (url && pages < MAX_PAGES) {
    let data: TransactionsV2Response;

    try {
      const response = await axios.get<TransactionsV2Response>(url, { headers });
      data = response.data;
    } catch (error) {
      // O axios só diz "Request failed with status code 400", e a Pluggy costuma
      // responder com corpo vazio neste endpoint. Sem a URL e a página, o erro
      // não diz nada — e a falha só aparece a partir da segunda página, quando a
      // conta passa de 500 transações.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const body = axios.isAxiosError(error) ? JSON.stringify(error.response?.data) : undefined;

      throw new Error(
        `GET /v2/transactions falhou (HTTP ${status ?? '?'}) na página ${pages + 1} ` +
          `da conta ${accountId}. URL: ${url}. Resposta: ${body || '(vazia)'}`
      );
    }

    if (data.results?.length) {
      all.push(...data.results);
    }

    url = data.next ? resolveNextUrl(data.next, accountId) : null;
    pages++;
  }

  if (pages >= MAX_PAGES) {
    console.warn(
      `fetchAllTransactionsV2: limite de ${MAX_PAGES} páginas atingido para a conta ${accountId} — pode haver transações não importadas`
    );
  }

  return all;
}
