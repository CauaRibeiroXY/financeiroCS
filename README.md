# Financeiro — Painel de Controle Financeiro Pessoal com Pluggy

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white" />
  <img alt="Pluggy" src="https://img.shields.io/badge/Pluggy-Open_Finance-5c6bc0" />
  <img alt="Vercel" src="https://img.shields.io/badge/Implantado-Vercel-black?logo=vercel&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss&logoColor=white" />
</p>

---

## Descrição

**Financeiro** é um painel de controle financeiro pessoal full-stack que conecta contas bancárias reais via **Open Finance** (API Pluggy) e consolida transações, investimentos, faturas e empréstimos em uma interface dark-mode unificada. O sistema sincroniza dados automaticamente via webhooks e cron jobs diários, permitindo acompanhar patrimônio, gastos por categoria, faturas de cartão de crédito, metas e despesas recorrentes — sem inserção manual de dados.

## Contexto do Projeto

O projeto nasceu da necessidade de ter uma visão consolidada e automatizada das finanças pessoais, integrando múltiplas contas bancárias e cartões em um único lugar. A solução usa o ecossistema de **Open Finance brasileiro** (regulamentado pelo Banco Central) por meio da API **Pluggy**, que conecta com centenas de instituições financeiras sem armazenar credenciais bancárias.

---

# Parte 1 — Guia de instalação do zero

> Esta seção assume que você não tem nada configurado: nem conta na Pluggy, nem
> projeto no Supabase, nem deploy. Siga na ordem — cada passo depende do anterior.

## Visão geral do processo

```
1. Pluggy    → obter Client ID e Client Secret
2. Supabase  → criar projeto e aplicar supabase_schema.sql
3. Local     → clonar, configurar .env.local, rodar
4. Conectar  → ligar a primeira conta bancária pelo app
5. Vercel    → importar repositório, configurar env vars, deploy
6. Webhook   → apontar NEXT_PUBLIC_APP_URL para o domínio e redeploy
7. Verificar → conferir se as tabelas populam
```

Tempo estimado: 30–45 minutos.

## Requisitos

- **Node.js 20+** e npm
- Conta na [Pluggy](https://pluggy.ai) (o plano gratuito atende)
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (só para o passo 5)
- Git

---

## Passo 1 — Pluggy

1. Crie uma conta em [dashboard.pluggy.ai](https://dashboard.pluggy.ai).
2. Vá em **Applications** e copie o **Client ID** e o **Client Secret**.
3. Guarde os dois. Eles são usados **só no servidor** — nunca vão para o browser.

Não configure o webhook ainda. A URL só existe depois do deploy (passo 6).

**Teste rápido de que as credenciais valem** (PowerShell):

```powershell
$body = @{ clientId = 'SEU_CLIENT_ID'; clientSecret = 'SEU_CLIENT_SECRET' } | ConvertTo-Json
Invoke-RestMethod -Uri 'https://api.pluggy.ai/auth' -Method Post -Body $body -ContentType 'application/json'
```

Deve retornar um `apiKey` (JWT longo). Um `403` significa credenciais erradas — normalmente espaço ou quebra de linha colada junto.

---

## Passo 2 — Supabase

1. Em [supabase.com](https://supabase.com), crie um **New project**. Escolha a região **South America (São Paulo)** para casar com o `gru1` da Vercel.
2. Guarde a senha do Postgres que ele pede.
3. Vá em **Project Settings → API** e copie:
   - **Project URL** → `https://xxxx.supabase.co`
   - A chave **`service_role`** (a *secret*, **não** a `anon`)

### Aplicar o schema

Abra o **SQL Editor** do Supabase, cole o conteúdo inteiro de
[`financeiro/supabase_schema.sql`](financeiro/supabase_schema.sql) e execute.

Esse arquivo é a **única fonte de verdade** do banco. Ele cria as 14 tabelas, os índices, as duas funções RPC, os triggers de `updated_at` e habilita RLS. Ele começa com um bloco de `DROP TABLE ... CASCADE`, então:

> ⚠️ **Rodar o schema apaga todos os dados.** Use apenas para criar do zero ou recriar deliberadamente.

Os scripts avulsos antigos (`supabase_setup_categorization.sql`, `supabase_add_account_icon.sql`, `supabase_accounts_is_ignored.sql`, `supabase_fixed_expenses_v2.sql`) foram **absorvidos** por ele e não devem mais ser executados.

### Verificar

No fim do `supabase_schema.sql` há duas queries comentadas (seção 11). Rode a segunda: ela lista as constraints únicas. **Toda** tabela que recebe `upsert` precisa de uma — sem ela o erro é `42P10`. O resultado esperado inclui:

| Tabela | Constraint única em |
|---|---|
| `pluggy_items` | `item_id` |
| `accounts` | `account_id` |
| `transactions` | `transaction_id` |
| `credit_card_bills` | `bill_id` |
| `investments` | `investment_id` |
| `investment_transactions` | `transaction_id` |
| `loans` | `loan_id` |
| `identities` | `identity_id` |
| `goal_snapshots` | `(goal_id, snapshot_date)` |
| `fixed_expense_payments` | `(expense_key, period)` |

---

## Passo 3 — Rodar local

```bash
git clone https://github.com/ThigasSantos/FinancasCS.git
cd FinancasCS/financeiro
npm install
```

> **Atenção à pasta.** A aplicação Next.js fica em `financeiro/`, não na raiz do
> repositório. Todos os comandos npm rodam de dentro dela. Isso também determina
> a configuração da Vercel no passo 5.

Crie `financeiro/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Pluggy Open Finance
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret

# Senha de acesso ao painel
APP_PASSWORD=sua-senha-segura

# Em desenvolvimento, deixe COMENTADO. Ver "Webhook em desenvolvimento".
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e entre com a `APP_PASSWORD`.
Se a 3000 estiver ocupada, o Next sobe na 3001 — repare na porta que ele imprime.

**Sanidade:** a sidebar tem um botão **"Testar Supabase"**. Ele chama `/api/health/supabase`, que consulta as tabelas principais e mostra latência e erro exato. Se ficar verde, banco e credenciais estão certos.

---

## Passo 4 — Conectar a primeira conta

1. Na sidebar, clique em **Conectar conta**. Abre o widget Pluggy Connect.
2. Escolha o banco e autentique.
3. Aguarde: a Pluggy carrega contas primeiro e transações depois. Sincronizar cedo demais popula `accounts` e deixa `transactions` vazio.

**Como saber que terminou:**

```powershell
# $h = @{ 'X-API-KEY' = <apiKey do passo 1> }
$item = Invoke-RestMethod -Uri "https://api.pluggy.ai/items/SEU_ITEM_ID" -Headers $h
$item | Select-Object status, executionStatus
```

Espere `status = UPDATED` e `executionStatus = SUCCESS`. Só então:

4. Clique em **Sincronizar agora** na sidebar (ou chame `GET /api/cron/pluggy-sync`).

A resposta traz `failures` — um array vazio significa sucesso completo. Se vier preenchido, cada entrada tem `scope` e `message` com o erro real.

---

## Passo 5 — Deploy na Vercel

1. Faça push do seu código para o GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. **Root Directory: `financeiro`** ← passo crítico. Sem isso o build falha, porque o `package.json` do Next está no subdiretório.
4. Framework: Next.js (detecta sozinho). Node.js Version: **22.x**.
5. Em **Environment Variables**, adicione as 5 do `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PLUGGY_CLIENT_ID`, `PLUGGY_CLIENT_SECRET`, `APP_PASSWORD`) marcando Production, Preview e Development.
6. Adicione também **`CRON_SECRET`** com um valor aleatório longo. O Vercel Cron o envia como `Authorization: Bearer <valor>`, e é assim que o middleware distingue o agendador de um visitante qualquer.

   ```powershell
   # gera um valor aleatório
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
   ```

   > **Sem `CRON_SECRET`, o cron diário falha com 401.** A sincronização manual
   > pelo botão continua funcionando, porque ela usa o cookie de sessão.

7. **Deploy.**

O [`financeiro/vercel.json`](financeiro/vercel.json) já define região `gru1`, 1024MB e timeout de 30s por função, além do cron diário. Se o build reclamar do bloco `functions` ou de `regions`, remova-os — as rotas já declaram `maxDuration` individualmente.

> **Não esqueça de commitar.** Alterações locais não versionadas não vão para a
> Vercel. É a causa mais comum de "funciona local, não funciona em produção" —
> confira com `git status` antes de investigar qualquer outra coisa.

---

## Passo 6 — Webhook

Existe uma dependência circular: a URL do webhook é montada a partir de `NEXT_PUBLIC_APP_URL`, mas o domínio só existe depois do deploy.

1. Copie o domínio gerado (ex.: `https://financas-cs.vercel.app`).
2. Na Vercel, adicione `NEXT_PUBLIC_APP_URL` = esse domínio, **sem barra no final**.
3. **Redeploy.** Variáveis `NEXT_PUBLIC_` são embutidas no bundle durante o build — salvar sem rebuildar não tem efeito.
4. No dashboard da Pluggy, registre o webhook global: `https://seu-dominio.vercel.app/api/webhook`.

### Webhook em desenvolvimento

**A Pluggy só aceita webhook em `https`.** Em localhost não há como registrar — o [`/api/token`](financeiro/src/app/api/token/route.ts) omite a `webhookUrl` de propósito quando a URL não é `https`.

Existe uma variável `ENABLE_HTTP_WEBHOOK=true` que força o envio mesmo em `http`. **Ela não funciona** — a Pluggy responde `400 Webhook url must be a https secured url` e o `/api/token` inteiro falha com 500. Deixe-a desativada; ela só serve para diagnóstico.

Se precisar testar webhooks localmente, use um túnel https:

```bash
npx localtunnel --port 3000     # ou ngrok http 3000
```

E aponte `NEXT_PUBLIC_APP_URL` para a URL do túnel.

---

## Passo 7 — Verificação final

```powershell
$U = 'https://seu-projeto.supabase.co'
$K = 'sua-service-role-key'
$h = @{ apikey = $K; Authorization = "Bearer $K" }

$tabelas = @{ pluggy_items='item_id'; accounts='account_id'; transactions='transaction_id';
              credit_card_bills='bill_id'; investments='investment_id';
              investment_transactions='transaction_id'; identities='identity_id' }

foreach ($t in $tabelas.Keys) {
  $r = Invoke-RestMethod -Uri "$U/rest/v1/$t`?select=$($tabelas[$t])" -Headers $h
  Write-Host ("{0,-26} {1}" -f $t, @($r).Count)
}
```

`accounts` e `transactions` devem estar populadas. As demais dependem do que o
banco conectado expõe — ver "O que é normal vir vazio".

---

# Parte 2 — Referência

## Variáveis de ambiente

| Variável | Onde | Obrigatória | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | servidor + build | ✅ | URL do projeto Supabase. Pública por natureza. |
| `SUPABASE_SERVICE_ROLE_KEY` | **servidor** | ✅ | Chave `service_role`. Ignora RLS — **nunca** prefixe com `NEXT_PUBLIC_`. |
| `PLUGGY_CLIENT_ID` | **servidor** | ✅ | Credencial da aplicação Pluggy. |
| `PLUGGY_CLIENT_SECRET` | **servidor** | ✅ | Credencial da aplicação Pluggy. |
| `APP_PASSWORD` | **servidor** | ✅ | Senha única de acesso ao painel. |
| `NEXT_PUBLIC_APP_URL` | build | produção | Domínio https. Monta a `webhookUrl` do connect token e restringe a origem do CORS. Exige redeploy ao mudar. |
| `CRON_SECRET` | **servidor** | produção | Segredo que o Vercel Cron envia como `Authorization: Bearer`. **Sem ela o cron agendado falha com 401.** |
| `ENABLE_HTTP_WEBHOOK` | servidor | ❌ | Força webhook em `http`. **A Pluggy rejeita** — deixe desativada. |

Os clientes fazem `throw` no boot se faltar variável: `Missing NEXT_PUBLIC_SUPABASE_URL` ([supabase/client.ts](financeiro/src/app/lib/supabase/client.ts)) e `Missing Pluggy credentials` ([pluggy/client.ts](financeiro/src/app/lib/pluggy/client.ts)). O erro aparece nos Runtime Logs da Vercel.

## Banco de dados

Schema completo em [`financeiro/supabase_schema.sql`](financeiro/supabase_schema.sql), organizado em 11 seções.

**Tabelas alimentadas pela Pluggy:** `pluggy_items`, `accounts`, `transactions`, `credit_card_bills`, `investments`, `investment_transactions`, `loans`, `identities`

**Tabelas do aplicativo:** `categories`, `category_rules`, `goals`, `goal_snapshots`, `fixed_expenses`, `fixed_expense_payments`

**Funções RPC:** `sync_transaction_category(uuid, text)` e `process_uncategorized_transactions()`, chamadas por [`domain/categorization.ts`](financeiro/src/app/domain/categorization.ts).

### Decisões de modelagem

- **Sem CHECK em enum vindo da Pluggy.** Um valor novo do lado deles viraria erro de constraint e derrubaria a ingestão inteira. Os CHECKs ficam só nas tabelas do app.
- **NOT NULL só onde o mapper comprovadamente escreve.** Campo obrigatório demais em tabela de API externa = sync quebrado.
- **FKs com `ON DELETE CASCADE`.** Sem isso, `DELETE /api/items?itemId=` falha por violação de chave estrangeira assim que o item tem contas.
- **RLS habilitada, sem policies.** O app acessa tudo pela `service_role`, que ignora RLS. Sem policy, `anon` e `authenticated` não leem nada — o que protege caso a URL pública seja usada com uma anon key.
- **`transactions.category_id` é `TEXT` sem FK.** A coluna tem dois donos: recebe o `categoryId` da Pluggy no sync (`'04000000'`) e o UUID de `categories` quando você recategoriza pela interface.

### Contas espelhadas

Alguns bancos exportam o mesmo cartão duas vezes com nomes diferentes. Cada cópia tem `account_id` próprio, então o upsert não resolve — limite e fatura saem **dobrados**.

> ⚠️ **Não copie um `UPDATE` pronto daqui.** Quais contas são espelho depende do
> seu banco. Marcar a conta errada faz um cartão legítimo sumir dos cálculos,
> silenciosamente.

**1. Veja o que existe:**

```sql
SELECT account_id, name, marketing_name, balance, is_ignored,
       credit_data->>'credit_limit'           AS limite,
       credit_data->>'available_credit_limit' AS disponivel,
       credit_data->>'balance_due_date'       AS vence,
       (SELECT COUNT(*) FROM public.transactions t
          WHERE t.account_id = a.account_id)  AS lancamentos
FROM public.accounts a
WHERE type = 'CREDIT'
ORDER BY name;
```

Duas linhas com o **mesmo limite e mesmo vencimento** são o mesmo plástico. Normalmente uma delas tem bem menos lançamentos — mantenha a que tem mais.

**2. Marque a cópia pelo `account_id` específico**, nunca por padrão de nome:

```sql
UPDATE public.accounts SET is_ignored = TRUE
WHERE account_id = 'o-id-da-copia';
```

**3. Para reverter:** `UPDATE public.accounts SET is_ignored = FALSE WHERE is_ignored;`

Existe uma rede de segurança em [`dedupeMirroredBills`](financeiro/src/app/lib/services/ledger-source.ts), que descarta faturas com mesmo vencimento e mesmo valor até o centavo. Ela não cobre o caso em que o ciclo vem defasado entre as duas cópias — daí a marcação manual.

## Sincronização

Três gatilhos, todos convergindo para `syncItemData()` em [`item-sync.service.ts`](financeiro/src/app/lib/services/item-sync.service.ts):

| Gatilho | Rota | Quando |
|---|---|---|
| Webhook | `POST /api/webhook` | A Pluggy avisa que há dados novos (só produção) |
| Cron | `GET /api/cron/pluggy-sync` | Diário, 00:00 UTC (21h BRT), via `vercel.json` |
| Manual | mesma rota, ou botão "Sincronizar agora" | Sob demanda |

Sincronizar um item específico: `GET /api/cron/pluggy-sync?itemId=<uuid>`.

**Ordem interna:** contas → (por conta) transações e faturas → investimentos → empréstimos → identidade. Contas são gravadas primeiro; por isso `accounts` populada com o resto vazio indica falha nas etapas seguintes, não na conexão.

**Falhas são reportadas, não engolidas.** Cada etapa é isolada — uma conta com erro não impede as outras — mas todas as falhas voltam no JSON:

```json
{ "ok": false, "started": 1,
  "failures": [ { "scope": "transactions:9afbc323-...", "message": "..." } ] }
```

## Integração com a Pluggy — notas importantes

### O endpoint de transações v1 foi descontinuado

O `pluggy-sdk` (0.79.0) chama `GET /transactions?accountId=`, que a Pluggy **descontinuou**. Hoje ele responde **`410 Gone` com corpo vazio** — sem mensagem de erro, o que torna o diagnóstico difícil.

O substituto é `GET /v2/transactions`, com paginação por cursor. Como o SDK ainda não o expõe, o projeto o chama diretamente em
[`src/app/lib/pluggy/transactions-v2.ts`](financeiro/src/app/lib/pluggy/transactions-v2.ts).

Diferenças entre v1 e v2:

| | v1 (morto) | v2 |
|---|---|---|
| Paginação | `page` + `pageSize` | cursor no campo `next` |
| Tamanho da página | `pageSize` até 500 | definido pelo servidor — `pageSize`/`limit` retornam **400** |
| Filtro de data | `from` / `to` | `dateFrom` / `dateTo` |
| Outros filtros | — | `createdAtFrom`, `ids` |
| Envelope | `{ results, page, totalPages, totalRecords }` | `{ results, next }` |

Os **campos de cada transação são idênticos** nas duas versões, então os mappers não mudaram.

Todos os pontos de acesso foram migrados. Se você adicionar código novo que busca transações, use `fetchAllTransactionsV2` — **não** `pluggyClient.fetchTransactions`. Quando o SDK passar a expor o v2, o módulo pode ser removido.

### Outros endpoints

`accounts`, `bills`, `investments`, `loans` e `identity` continuam pelo SDK normalmente. A descontinuação afetou apenas transações.

---

# Parte 3 — Diagnóstico

> Esta seção é o atalho para os problemas que já custaram tempo. Comece sempre
> pela camada mais baixa: se a Pluggy não tem o dado, não adianta olhar o banco.

## Roteiro em camadas

```
0. Credenciais valem?          → POST https://api.pluggy.ai/auth
1. App gera connect token?     → POST /api/token
2. Item terminou de carregar?  → GET https://api.pluggy.ai/items/{id}
3. Pluggy tem transações?      → GET https://api.pluggy.ai/v2/transactions?accountId=
4. Banco aceita a escrita?     → botão "Testar Supabase" ou upsert direto
5. O código está no ar?        → git status
```

> **As rotas do app exigem sessão.** Para inspecionar `/api/...` pelo navegador,
> faça login primeiro na mesma aba — o cookie vai junto. Um **401** com
> `{"error":"Não autenticado"}` significa que falta o login, não que a rota
> está quebrada. As chamadas diretas à `api.pluggy.ai` usam a apiKey da Pluggy
> e independem disso.

## Sintomas e causas

### `accounts` populou, `transactions` vazio

O sintoma mais comum. Em ordem de probabilidade:

1. **O item ainda não terminou de carregar.** A Pluggy popula contas antes de transações. Confira `statusDetail.transactions.isUpdated` em `GET /items/{id}`.
2. **Código desatualizado em produção.** Se funciona local e não na Vercel, rode `git status` — alterações não commitadas não sobem.
3. **Endpoint v1 sendo usado.** Se alguma chamada nova usar `pluggyClient.fetchTransactions`, ela leva `410`. Use `fetchAllTransactionsV2`.
4. **Timeout na Vercel.** Ver abaixo.

Rode o sync e leia o `failures` da resposta — desde a mudança de reporte de erros, ele diz exatamente qual etapa falhou.

### `42P10 — there is no unique or exclusion constraint matching the ON CONFLICT`

Falta a constraint única na coluna alvo do `onConflict`. Rode a query de verificação da seção 11 do schema e compare com a tabela do passo 2.

### `PGRST205` / `PGRST204`

`PGRST205` = tabela não existe. `PGRST204` = coluna não existe. Nos dois casos, o schema não foi aplicado por completo — reaplique o `supabase_schema.sql`.

### `Webhook url must be a https secured url`

`ENABLE_HTTP_WEBHOOK=true` com `NEXT_PUBLIC_APP_URL` em `http`. Desative a variável. Ver "Webhook em desenvolvimento".

### Timeout na Vercel

O [`vercel.json`](financeiro/vercel.json) limita funções a **30 segundos**, e o cron sincroniza **todos** os itens em paralelo esperando todos (`Promise.allSettled`). Com muitas contas e centenas de transações, estoura — a função é morta no meio e o banco fica parcialmente populado. Localmente não há esse teto, o que explica "funciona local, falha em produção".

Saídas: sincronizar item a item (`?itemId=`) na primeira carga, ou aumentar `maxDuration`.

### Snapshots de metas falhando a partir do dia 2 do mês

O schema antigo tinha um índice único **mensal** em `goal_snapshots` convivendo com a constraint diária que o cron usa no `onConflict`. Os dois se anulavam. O `supabase_schema.sql` atual removeu o mensal — **não o recrie**.

## O que é normal vir vazio

Nem toda tabela precisa popular:

- **`investments`, `investment_transactions`, `loans`** — só se o banco expõe esses produtos. Conta corrente simples retorna vazio, sem erro.
- **`identities`** — o 404 é silenciado de propósito; vários conectores não expõem identidade.
- **`credit_card_bills`** — só para contas `type = 'CREDIT'`, e apenas com faturas fechadas.
- **`categories`, `goals`, `fixed_expenses`** — não vêm da Pluggy. São seus, criados pelo app.

A que **obrigatoriamente** popula é `transactions`.

## Comandos úteis

```powershell
# Ler credenciais do .env.local sem digitá-las
$cfg = @{}
Get-Content 'financeiro\.env.local' | ForEach-Object {
  if ($_ -match '^\s*([A-Z_0-9]+)\s*=\s*(.*)$') { $cfg[$matches[1]] = $matches[2].Trim() }
}

# Autenticar na Pluggy
$auth = Invoke-RestMethod -Uri 'https://api.pluggy.ai/auth' -Method Post `
  -ContentType 'application/json' `
  -Body (@{ clientId = $cfg['PLUGGY_CLIENT_ID']; clientSecret = $cfg['PLUGGY_CLIENT_SECRET'] } | ConvertTo-Json)
$h = @{ 'X-API-KEY' = $auth.apiKey }

# Contas e contagem de transações de um item
$accs = Invoke-RestMethod -Uri "https://api.pluggy.ai/accounts?itemId=SEU_ITEM_ID" -Headers $h
foreach ($a in $accs.results) {
  $t = Invoke-RestMethod -Uri "https://api.pluggy.ai/v2/transactions?accountId=$($a.id)" -Headers $h
  "{0,-28} {1,-8} {2} transacoes" -f $a.name, $a.type, @($t.results).Count
}

# Forçar a Pluggy a recarregar um item
Invoke-RestMethod -Uri "https://api.pluggy.ai/items/SEU_ITEM_ID" -Method Patch `
  -Headers ($h + @{'Content-Type'='application/json'}) -Body '{}'
```

---

# Parte 4 — Referência técnica

## Tecnologias

**Linguagem e framework:** TypeScript 5, Next.js 16 (App Router), React 19
**Estilo:** Tailwind CSS 4, Lucide React
**Banco:** Supabase (PostgreSQL), `@supabase/supabase-js ^2.86`
**Open Finance:** `pluggy-sdk ^0.79`, `react-pluggy-connect ^2.11`, chamadas diretas ao `/v2/transactions` via Axios
**Dados no cliente:** SWR ^2.4
**Gráficos:** Recharts ^3.7
**Validação e HTTP:** Zod ^4.1, Axios ^1.13, `jsonwebtoken ^9.0`
**Infra:** Vercel (serverless, região `gru1`, 1024MB, 30s), Vercel Cron, Next.js Middleware
**Qualidade:** ESLint 9, Prettier 3, PostCSS

## Arquitetura

```
[Pluggy API] ──webhook──► [API Routes] ──► [Services] ──► [Supabase]
                                              │
[Browser] ──SWR fetch──► [API Routes] ──► [Services] ──► [Supabase]
```

Arquitetura modular em camadas dentro do App Router. O frontend nunca fala com a Pluggy nem com o Supabase diretamente — tudo passa pelas API Routes, que atuam como BFF. As métricas (patrimônio, gastos, recorrências) são computadas no cliente com `useMemo`, mantendo a API agnóstica de apresentação.

**Padrões:** Singleton (clientes Pluggy/Supabase), Mapper (SDK → schema), Custom Hooks (SWR), HOF `withErrorHandling`, Upsert idempotente.

## Estrutura de pastas

```
FinancasCS/
├── README.md
└── financeiro/                          # ← Root Directory na Vercel
    ├── supabase_schema.sql              # Schema completo (fonte de verdade)
    ├── vercel.json                      # Deploy, funções e cron
    ├── next.config.ts
    └── src/
        ├── middleware.ts                # Proteção de rotas via cookie httpOnly
        └── app/
            ├── (main)/                  # Rotas protegidas com sidebar
            │   ├── page.tsx             # Dashboard
            │   ├── transactions/  accounts/  categories/
            │   ├── recurrences/   goals/     investments/
            ├── login/
            ├── api/
            │   ├── login/  logout/  auth/verify/
            │   ├── token/               # Connect Token da Pluggy
            │   ├── webhook/             # Eventos da Pluggy
            │   ├── cron/pluggy-sync/    # Sincronização (cron + manual)
            │   ├── health/supabase/     # Health check do banco
            │   ├── accounts/  transactions/  bills/  items/
            │   ├── categories/  investments/  loans/  identity/
            │   ├── goals/  fixed-expenses/  overview/  spending/  portfolio/
            ├── components/
            │   ├── layout/Sidebar.tsx
            │   ├── shared/              # ConnectButton, SyncButton,
            │   │                        # SupabaseStatusButton, Skeleton
            │   ├── dashboard/  transactions/  recurrences/  investments/
            ├── hooks/                   # Wrappers SWR
            ├── domain/categorization.ts # Chamadas às RPCs
            ├── lib/
            │   ├── pluggy/client.ts         # Singleton do PluggyClient
            │   ├── pluggy/transactions-v2.ts # Cliente do /v2/transactions
            │   ├── supabase/client.ts       # Singleton do Supabase Admin
            │   ├── services/                # Camada de acesso ao banco
            │   │   ├── item-sync.service.ts # Orquestrador de sincronização
            │   │   ├── recurrence.ts        # Detecção de recorrências
            │   │   ├── ledger-source.ts     # Fonte consolidada de lançamentos
            │   │   ├── mappers/             # Pluggy → schema do banco
            │   │   └── webhook-handlers/    # Handlers por tipo de evento
            │   └── utils/
            └── types/
```

## Funcionalidades

**Dashboard** — patrimônio total, resultado parcial do mês, ritmo de gastos diários comparando com o mês anterior, top categorias, faturas abertas.

**Contas e cartões** — saldo, limite disponível, vencimento, status de sincronização, remoção com revalidação de cache. Suporte a `is_ignored` para contas espelhadas.

**Transações** — listagem paginada de todas as contas, filtro por conta, formatação em BRL.

**Categorização** — categorias personalizadas, regras por descrição de comerciante, aplicação em lote via RPC, recategorização retroativa.

**Detecção de recorrências** — análise dos últimos meses de lançamentos DEBIT, agrupamento por descrição normalizada, exclusão de transferências internas cross-account, classificação de frequência (semanal / mensal / anual / irregular), custo médio e equivalente mensal.

**Gastos fixos** — compromissos mensais manuais ou detectados, com tipos (assinatura, parcelamento, recorrente variável), término, silenciamento e baixa por período.

**Metas** — alocação percentual do patrimônio, aportes externos e histórico via snapshots diários gravados pelo cron.

**Investimentos** — posições, transações e projeções.

## Segurança

### Como funciona

O [middleware](financeiro/src/middleware.ts) protege **páginas e rotas de API**. Sem o cookie `auth`:

- páginas → redirecionam para `/login`
- rotas de API → respondem **401 JSON** (não redirecionam, para o cliente não interpretar o HTML do login como sucesso)

São públicas apenas quatro rotas, por caminho exato: `/api/login`, `/api/logout`, `/api/webhook` e `/api/pluggy-webhook`. As duas últimas precisam ser abertas porque a Pluggy as chama de fora, sem cookie.

`/api/cron/*` aceita dois caminhos de autorização: o header `Authorization: Bearer $CRON_SECRET` (usado pelo Vercel Cron) **ou** o cookie de sessão (usado pelo botão "Sincronizar agora"). Sem `CRON_SECRET` configurada, o cron agendado recebe 401.

O CORS restringe a origem a `NEXT_PUBLIC_APP_URL`. Em desenvolvimento, sem essa variável, nenhum header de CORS é emitido — front e API são mesma origem e não precisam.

Também correto: a `service_role` e as credenciais da Pluggy nunca saem do servidor; o cookie é `httpOnly` + `secure` + `sameSite=strict`; o RLS está habilitado sem policies permissivas.

### Limitações conhecidas

- **Autenticação é uma senha única compartilhada**, sem noção de usuário. O banco não tem isolamento por `user_id` — quem entra vê tudo.
- **As rotas de webhook não verificam a origem.** A Pluggy não assina os webhooks, e elas precisam ficar públicas. Um terceiro que descubra a URL consegue disparar sincronizações. Mitigação possível: registrar a webhook URL com um token na query string e validá-lo.
- **O cookie não expira no servidor.** `maxAge` de 7 dias é client-side; não há revogação de sessão.

### Histórico

Até a correção de segurança, o matcher do middleware excluía `api/`: **toda a API respondia sem autenticação**. Qualquer pessoa com o domínio lia contas, saldos e transações, e podia disparar `/api/cron/pluggy-sync` em looping consumindo a cota da Pluggy. O `/api/auth/verify` — escrito assumindo estar atrás do middleware — retornava `success: true` para qualquer requisição.

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor em modo produção |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com correção automática |

Todos rodam de dentro de `financeiro/`.

## Possíveis melhorias

- Proteger as rotas `/api/*` no middleware e validar `CRON_SECRET`
- Multi-usuário com isolamento por `user_id` e RLS por policy
- Exportação de transações em CSV/PDF
- Notificações quando uma recorrência mudar de valor
- Ampliar a cobertura de testes (a estrutura `__tests__` já existe em `lib/services`)
- Detecção de anomalias em transações fora do padrão histórico
- PWA para acesso offline

---

## Aprendizados Técnicos

**Integração com APIs externas (Open Finance / Pluggy)** — autenticação server-side com credenciais sensíveis, geração de tokens efêmeros para delegação client-side, paginação por cursor, processamento de webhooks com retry, e o diagnóstico de uma quebra de contrato em produção (endpoint descontinuado retornando `410` sem corpo).

**Arquitetura full-stack com Next.js App Router** — separação servidor/cliente, API Routes como BFF, middleware antes do rendering, deploy serverless com controle de memória, timeout e cron.

**Gerenciamento de estado no frontend** — SWR com chaves compostas, requisições paralelas, invalidação global de cache; memoização de cálculos sobre grandes volumes.

**Banco relacional e Supabase** — modelagem para domínio financeiro, upserts idempotentes, RPCs em PL/pgSQL para operações em lote, `service_role` e RLS, e o aprendizado de que constraints rígidas em dados de API externa são passivo, não proteção.

**Segurança web** — cookie `httpOnly`/`secure`/`sameSite`, proteção via middleware, segregação de variáveis por contexto.

**Algoritmos** — detecção de séries temporais recorrentes, normalização de strings para agrupamento fuzzy, identificação de transferências internas, mediana de intervalos para classificação de frequência.

**Depuração sistemática** — isolar por camada em vez de adivinhar; tornar erros visíveis (o `catch` que só logava mascarou uma falha por dias) antes de tentar corrigi-los.

---

## Palavras-chave Técnicas

`TypeScript` · `Next.js` · `React` · `Tailwind CSS` · `Supabase` · `PostgreSQL` · `REST API` · `Open Finance` · `Pluggy` · `SWR` · `Recharts` · `Vercel` · `Serverless` · `Webhook` · `Cron Job` · `JWT` · `Autenticação` · `httpOnly Cookie` · `Next.js Middleware` · `App Router` · `Custom Hooks` · `useMemo` · `API Routes` · `Upsert` · `Stored Procedures` · `PL/pgSQL` · `Row Level Security` · `Axios` · `Zod` · `ESLint` · `Prettier` · `Full-Stack` · `BFF (Backend for Frontend)` · `Paginação por cursor` · `Memoização` · `Algoritmos de Detecção de Padrões` · `Séries Temporais` · `Mapper Pattern` · `Singleton Pattern` · `Deploy Automatizado` · `CI/CD` · `Lucide React` · `Node.js`
