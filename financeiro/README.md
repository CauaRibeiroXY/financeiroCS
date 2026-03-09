# Financeiro — Painel de Controle Financeiro Pessoal

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

**Financeiro** é um painel de controle financeiro pessoal full-stack que conecta contas bancárias reais via **Open Finance** (API Pluggy) e consolida transações, investimentos, faturas e empréstimos em uma interface dark-mode unificada. O sistema sincroniza dados automaticamente via webhooks e cron jobs diários, permitindo que o usuário acompanhe patrimônio, gastos por categoria, faturas de cartão de crédito e detecte automaticamente despesas recorrentes — tudo em tempo real e sem a necessidade de inserir dados manualmente.

---

## Contexto do Projeto

O projeto nasceu da necessidade de ter uma visão consolidada e automatizada das finanças pessoais, integrando múltiplas contas bancárias e cartões de crédito em um único lugar. A solução utiliza o ecossistema de **Open Finance brasileiro** (regulamentado pelo Banco Central) por meio da API **Pluggy**, que permite a conexão segura com centenas de instituições financeiras sem armazenar credenciais bancárias. O objetivo central é oferecer controle financeiro completo — patrimônio, gastos, recorrências e investimentos — com dados sempre atualizados automaticamente.

---

## Tecnologias Utilizadas

### Linguagens
- **TypeScript 5** — tipagem estática em todo o projeto (frontend e backend)
- **TSX / React JSX** — componentes de interface

### Frameworks e Runtime
- **Next.js 16** (App Router) — framework full-stack com SSR, API Routes e Middleware
- **React 19** — biblioteca de UI com hooks modernos

### Estilização
- **Tailwind CSS 4** — utilitários de estilo com tema dark customizado
- **Lucide React** — biblioteca de ícones SVG

### Banco de Dados
- **Supabase (PostgreSQL)** — banco de dados relacional gerenciado na nuvem, acesso via service role key com `@supabase/supabase-js ^2.86`

### API Externa — Open Finance
- **Pluggy SDK (`pluggy-sdk ^0.79`)** — SDK oficial para conexão com contas bancárias via Open Finance brasileiro
- **React Pluggy Connect (`react-pluggy-connect ^2.11`)** — widget oficial de conexão de contas (OAuth flow embutido)

### Gerenciamento de Estado e Dados
- **SWR (`swr ^2.4`)** — busca de dados com cache, revalidação automática e deduplicação de requisições
- **React `useMemo` / `useState` / `useEffect`** — gerenciamento de estado local e computações memoizadas

### Gráficos e Visualização
- **Recharts (`recharts ^3.7`)** — gráficos de linha e área para o dashboard de gastos por dia

### Validação e HTTP
- **Zod (`zod ^4.1`)** — validação de schemas em runtime
- **Axios (`axios ^1.13`)** — cliente HTTP para chamadas à API interna
- **`jsonwebtoken ^9.0`** — manipulação de JWT (suporte a tokens de autenticação)

### Infraestrutura e Deploy
- **Vercel** — plataforma de deploy com serverless functions, region `gru1` (São Paulo), memory 1024MB por função
- **Vercel Cron Jobs** — job diário (`0 0 * * *`) para sincronização automática de dados com a Pluggy
- **Next.js Middleware** — proteção de rotas via cookie `httpOnly`

### Ferramentas de Build e Qualidade
- **ESLint 9** com `eslint-config-next` e `eslint-config-prettier`
- **Prettier 3** — formatação automática de código
- **PostCSS** — processamento de CSS com suporte ao Tailwind

---

## Arquitetura e Estrutura do Projeto

### Padrão Arquitetural

O projeto adota uma arquitetura **modular em camadas**, inspirada em princípios de **Clean Architecture** e **separação de responsabilidades**, dentro da estrutura do Next.js App Router:

```
[Pluggy API] ──webhook──► [Next.js API Routes] ──► [Services Layer] ──► [Supabase DB]
                                                           │
[Browser] ──fetch (SWR)──► [Next.js API Routes] ──► [Services Layer] ──► [Supabase DB]
```

**Fluxo principal:**
1. O usuário conecta uma conta bancária pelo widget **Pluggy Connect** embutido na sidebar.
2. A Pluggy dispara um **webhook** (`/api/webhook`) notificando novos dados disponíveis.
3. O `item-sync.service.ts` busca contas, transações, investimentos, empréstimos e identidade na Pluggy SDK e persiste no Supabase via **upsert** (idempotente).
4. Um **Cron Job diário** (`/api/cron/pluggy-sync`) repete o processo de sincronização para todos os itens cadastrados, garantindo dados frescos mesmo sem webhooks.
5. O frontend consome dados exclusivamente pela camada de **API Routes internas** do Next.js, usando **SWR** para cache e revalidação automática.
6. Toda a computação de métricas (patrimônio, gastos, categorias, recorrências) é feita **no frontend com `useMemo`**, mantendo a API agnóstica de apresentação.

### Organização das Pastas

```
src/
├── middleware.ts                  # Proteção de rotas via cookie httpOnly "auth"
└── app/
    ├── layout.tsx                 # Layout raiz com providers globais
    ├── (main)/                    # Grupo de rotas protegidas (layout com Sidebar)
    │   ├── page.tsx               # Dashboard principal
    │   ├── transactions/          # Listagem e paginação de transações
    │   ├── accounts/              # Contas bancárias e cartões de crédito
    │   ├── categories/            # Categorização manual de transações
    │   └── recurrences/           # Detecção automática de recorrências
    ├── login/                     # Página de login (rota pública)
    ├── api/                       # API Routes do Next.js (backend serverless)
    │   ├── login/                 # POST: autenticação por senha, gera cookie httpOnly
    │   ├── logout/                # POST: limpa cookie de autenticação
    │   ├── token/                 # GET/POST: geração de Connect Token da Pluggy
    │   ├── webhook/               # POST: recepção de eventos da Pluggy
    │   ├── accounts/              # GET/DELETE: leitura e remoção de contas
    │   ├── transactions/          # GET: listagem de transações por conta
    │   ├── bills/                 # GET: faturas de cartão de crédito
    │   ├── items/                 # GET/DELETE: itens (conexões bancárias)
    │   ├── categories/            # GET/POST/PUT: categorias e regras
    │   ├── investments/           # GET: investimentos
    │   ├── loans/                 # GET: empréstimos
    │   ├── identity/              # GET: dados de identidade do usuário
    │   └── cron/pluggy-sync/      # GET: sincronização diária (Vercel Cron)
    ├── components/                
    │   ├── layout/Sidebar.tsx     # Navegação lateral colapsável com ConnectButton
    │   ├── dashboard/             # SpendingPaceCard, PatrimonyCard, CategoryList, etc.
    │   ├── transactions/          # TransactionTable com paginação
    │   ├── recurrences/           # RecurrenceSummaryCard, RecurrenceList
    │   ├── shared/               # ConnectButton, SyncButton, Skeleton
    │   └── AuthGuard.tsx         # Guarda de autenticação client-side (legado)
    ├── hooks/                     # Custom React Hooks (SWR wrappers)
    │   ├── useDashboardData.ts    # Orquestra accounts + transactions + bills
    │   ├── useAllTransactions.ts  # Paginação de transações para listagem
    │   ├── useRecurrences.ts      # Busca e análise de recorrências
    │   ├── useCategories.ts       # Listagem de categorias e regras
    │   ├── useItems.ts            # Itens conectados à Pluggy
    │   ├── useAccounts.ts         # Contas por item
    │   └── useIdentity.ts         # Dados de identidade do titular
    ├── lib/
    │   ├── pluggy/client.ts       # Singleton do PluggyClient (server-side)
    │   ├── supabase/client.ts     # Singleton do Supabase Admin Client
    │   ├── services/              # Camada de serviços (acesso ao banco de dados)
    │   │   ├── item-sync.service.ts   # Orquestrador principal de sincronização
    │   │   ├── recurrence.ts          # Algoritmo de detecção de recorrências
    │   │   ├── accounts.ts            # CRUD de contas no Supabase
    │   │   ├── transactions.ts        # CRUD de transações
    │   │   ├── investments.ts         # CRUD de investimentos
    │   │   ├── loans.ts               # CRUD de empréstimos
    │   │   ├── identity.ts            # CRUD de identidade
    │   │   ├── credit-card-bills.ts   # CRUD de faturas
    │   │   ├── items.ts               # CRUD de itens
    │   │   ├── mappers/               # Funções puras: Pluggy SDK → DB schema
    │   │   └── webhook-handlers/      # Handlers por tipo de evento webhook
    │   └── utils/                 # Utilitários transversais
    │       ├── api.ts             # Instância Axios configurada
    │       ├── cn.ts              # Utility `cn()` para classes condicionais
    │       ├── error-handler.ts   # HOF `withErrorHandling` para API Routes
    │       ├── format.ts          # Formatação de moeda, data, iniciais
    │       ├── pagination.ts      # Lógica de paginação
    │       └── validation.ts      # Helpers de validação com Zod
    └── types/
        ├── pluggy.ts              # Interfaces TypeScript para todos os modelos de dados
        └── api.ts                 # Tipos genéricos de resposta da API
```

### Padrões Utilizados
- **Singleton Pattern**: clientes Pluggy e Supabase instanciados uma única vez (server-side)
- **Mapper Pattern**: conversão isolada entre tipos do SDK externo e schema do banco de dados
- **Custom Hooks**: toda lógica de busca e estado encapsulada em hooks reutilizáveis
- **SWR revalidation**: cache inteligente com revalidação por chave derivada dos IDs
- **Higher-Order Function**: `withErrorHandling` envolve handlers de API para tratar erros de forma centralizada
- **Upsert Pattern**: todas as escritas no Supabase são idempotentes (`ON CONFLICT DO UPDATE`)

---

## Funcionalidades Principais

### 📊 Dashboard Principal
- **Patrimônio total**: soma de saldos de contas correntes e de pagamento
- **Resultado parcial do mês**: receitas menos despesas do mês atual
- **Ritmo de gastos diários**: gráfico de área comparando gastos acumulados do mês atual vs. mês anterior (Recharts)
- **Gastos por categoria**: top 10 categorias do mês atual e anterior, com tradução automática para português
- **Faturas de cartão de crédito**: listagem de faturas abertas por cartão

### 💳 Contas e Cartões
- Visualização de contas bancárias, contas de pagamento e cartões de crédito
- Detalhes por conta: saldo, limite disponível, vencimento da fatura, status de sincronização
- Remoção de contas com revalidação automática de cache (SWR mutate)
- Exibição de logotipos dos bancos e indicador de sincronização

### 📋 Transações
- Listagem paginada de todas as transações de todas as contas conectadas
- Filtro por conta específica
- Paginação client-side com 50 transações por página
- Exibição de categoria, tipo (DÉBITO/CRÉDITO), data e valor formatado em BRL

### 🏷️ Categorização
- Criação de categorias personalizadas
- Criação de regras por descrição de comerciante
- Aplicação em lote via função SQL `sync_transaction_category()` no Supabase
- Recategorização retroativa de transações já existentes

### 🔁 Detecção de Recorrências (Algoritmo Proprietário)
- Análise automática dos últimos 3 meses de transações DEBIT
- Agrupamento por descrição normalizada (remoção de ruído: dígitos, caracteres especiais)
- Detecção e exclusão de transferências internas cross-account (e.g., PIX entre contas próprias)
- Classificação de frequência: **semanal** (≤10 dias), **mensal** (11–50 dias), **anual** (300–400 dias) ou **irregular**
- Cálculo de custo médio, equivalente mensal e data da última ocorrência
- Total mensal comprometido (soma dos equivalentes mensais de todas as recorrências detectadas)

### 🔐 Autenticação e Segurança
- Login por senha com `httpOnly cookie` (7 dias de sessão)
- Middleware do Next.js que protege todas as rotas não-públicas
- Redirecionamento automático para `/login` com parâmetro `from` para retorno após autenticação
- Senha armazenada como variável de ambiente no servidor (nunca exposta ao cliente)
- Rotas da API do cron (`/api/webhook`, `/api/login`) explicitamente excluídas da proteção

### 🔄 Sincronização Automática
- **Webhook handler** (`/api/webhook`): processa eventos `item/updated`, `transactions/created`, `transactions/updated`, entre outros
- **Cron Job diário** (meia-noite): sincroniza todos os itens com `Promise.allSettled` (falhas parciais não impedem os demais)
- Suporte a paginação de transações (500 por página) e de transações de investimentos
- Deduplicação de transações por `transaction_id` antes do upsert

---

## Integrações e APIs

### Pluggy (Open Finance)
A integração central do projeto. O **Pluggy** é uma plataforma de Open Finance que agrega dados de centenas de bancos e corretoras brasileiras de forma segura, sem armazenar credenciais do usuário.

- **Autenticação**: `PLUGGY_CLIENT_ID` + `PLUGGY_CLIENT_SECRET` (server-side apenas)
- **Widget**: `react-pluggy-connect` renderizado de forma dinâmica (SSR desabilitado)
- **Connect Token**: gerado no backend (`/api/token`) e passado ao widget client-side — nunca expostos as credenciais principais
- **Dados coletados**: contas, transações, faturas de crédito, investimentos, transações de investimento, empréstimos, identidade do titular
- **Webhook URL**: registrada na Pluggy para receber eventos em tempo real

### Supabase (PostgreSQL)
Banco de dados principal do projeto, utilizado exclusivamente com `service_role_key` no servidor para operações administrativas.

- Tabelas principais: `items`, `accounts`, `transactions`, `credit_card_bills`, `investments`, `investment_transactions`, `loans`, `identity`, `categories`, `category_rules`
- Scripts SQL incluídos: `supabase_setup_categorization.sql`, `supabase_add_account_icon.sql`
- Funções SQL: `sync_transaction_category()`, `process_uncategorized_transactions()`

### Vercel
- Deploy contínuo a partir do repositório
- Serverless Functions configuradas com 1024MB de memória e timeout de 30s
- Cron Jobs nativos da Vercel (configurados em `vercel.json`)
- CDN de imagens com suporte a AVIF e WebP, domínio permitido: `cdn.pluggy.ai`

---

## Como Executar o Projeto

### Requisitos
- **Node.js 20+**
- **npm** (incluso com Node.js)
- Conta na [Pluggy](https://pluggy.ai) (Client ID e Client Secret)
- Projeto no [Supabase](https://supabase.com) (URL e Service Role Key)

### 1. Clone o repositório e instale as dependências

```bash
git clone <url-do-repositorio>
cd cslabs/financeiro
npm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto (`cslabs/financeiro/`) com as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Pluggy Open Finance
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret

# Autenticação da aplicação (senha de acesso ao painel)
APP_PASSWORD=sua-senha-segura
```

### 3. Configure o banco de dados

Execute os scripts SQL no painel do Supabase (SQL Editor):

```sql
-- 1. Categorização
-- Cole e execute o conteúdo de: supabase_setup_categorization.sql

-- 2. Ícone de conta
-- Cole e execute o conteúdo de: supabase_add_account_icon.sql
```

> **Nota**: Crie manualmente as tabelas `items`, `accounts`, `transactions`, `credit_card_bills`, `investments`, `investment_transactions`, `loans` e `identity` conforme os tipos definidos em `src/app/types/pluggy.ts`.

### 4. Configure o Webhook na Pluggy

No painel da Pluggy, registre a URL de webhook apontando para:
```
https://seu-dominio.vercel.app/api/webhook
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e insira a senha configurada em `APP_PASSWORD`.

### Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Next.js) |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor em modo produção |
| `npm run lint` | Executa o ESLint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |

---

## Estrutura de Pastas

```
cslabs/
├── financeiro/                   # Aplicação Next.js principal
│   ├── src/
│   │   ├── middleware.ts          # Proteção de rotas (Next.js Middleware)
│   │   └── app/
│   │       ├── (main)/           # Rotas protegidas com layout de sidebar
│   │       ├── api/              # Backend serverless (API Routes)
│   │       ├── components/       # Componentes React reutilizáveis
│   │       ├── hooks/            # Custom hooks com SWR
│   │       ├── lib/              # Serviços, utilitários e clientes de API
│   │       └── types/            # Definições TypeScript
│   ├── next.config.ts            # Configurações do Next.js (CORS, imagens)
│   ├── vercel.json               # Configuração de deploy, funções e cron jobs
│   ├── package.json              # Dependências e scripts
│   ├── supabase_setup_categorization.sql  # Script de criação de tabelas e RPCs
│   └── supabase_add_account_icon.sql      # Migração para adicionar coluna de ícone
└── imagens/                      # Assets e capturas de tela do projeto
```

---

## Possíveis Melhorias

- **Metas e orçamentos**: permitir que o usuário defina limites de gasto por categoria e receba alertas visuais
- **Exportação de dados**: exportação de transações em CSV/PDF
- **Gráficos de investimentos**: evolutivo de rentabilidade e alocação por tipo de ativo
- **Suporte multi-usuário**: adicionar autenticação completa por usuário (Supabase Auth ou NextAuth) para isolar dados por conta
- **Notificações**: alertas por e-mail ou push quando uma recorrência detectada mudar de valor ou for cobrada
- **Testes automatizados**: ampliar cobertura de testes (a estrutura `__tests__` já existe em `lib/services`)
- **Modo offline / PWA**: transformar em Progressive Web App para acesso sem internet
- **Internacionalização**: suporte a múltiplas moedas e regiões além do Brasil
- **Dashboard de empréstimos**: visualização de parcelas, juros e progresso de quitação
- **Detecção de anomalias**: alertas automáticos para transações fora do padrão histórico do usuário

---

## Aprendizados Técnicos

Este projeto demonstra e consolida os seguintes conhecimentos técnicos:

### Integração com APIs Externas (Open Finance / Pluggy)
- Autenticação server-side com credenciais sensíveis (nunca expostas ao frontend)
- Geração de tokens efêmeros (Connect Token) para delegates client-side seguros
- Consumo de SDKs de terceiros com paginação e tratamento de múltiplos formatos de resposta
- Processamento de webhooks com confirmação de recebimento e retry em caso de falha

### Arquitetura Full-Stack com Next.js App Router
- Separação clara entre código de servidor e cliente (`'use client'` explícito)
- API Routes como camada de BFF (Backend for Frontend)
- Middleware de autenticação atuando antes do rendering
- Deploy serverless com controle de memória, timeout e cron jobs

### Gerenciamento de Estado e Dados no Frontend
- Uso avançado de SWR: chaves compostas, múltiplas requisições paralelas com `Promise.all`, invalidação de cache com `mutate` global
- Memoização com `useMemo` para cálculos derivados de grandes volumes de dados financeiros
- Paginação client-side sobre dados já carregados

### Banco de Dados Relacional e Supabase
- Modelagem de dados para domínio financeiro (contas, transações, investimentos, faturas)
- Operações de upsert idempotentes (`ON CONFLICT DO UPDATE`)
- Stored Procedures e RPCs em PostgreSQL para operações em lote (categorização de transações)
- Uso de `service_role` para bypass de Row Level Security em contexto de servidor

### Segurança de Aplicações Web
- Autenticação sem bibliotecas externas: cookie `httpOnly`, `secure`, `sameSite=strict`
- Proteção de rotas via Middleware sem expor lógica de autenticação ao cliente
- Variáveis de ambiente segregadas por contexto (servidor vs. cliente)

### Algoritmos e Lógica de Negócio
- Implementação de algoritmo de detecção de séries temporais recorrentes
- Normalização de strings para agrupamento fuzzy por descrição de transação
- Identificação de transferências internas cross-account para exclusão do análise
- Cálculo de mediana de intervalos para classificação de frequência

### Qualidade de Código
- TypeScript estrito com interfaces detalhadas para todos os modelos de dados
- Mapper Pattern para isolamento entre tipos de API externa e modelos internos
- Higher-Order Functions para tratamento centralizado de erros em API Routes
- ESLint + Prettier integrados ao workflow de desenvolvimento

---

## Palavras-chave Técnicas (Importante para ATS)

`TypeScript` · `Next.js` · `React` · `Tailwind CSS` · `Supabase` · `PostgreSQL` · `REST API` · `Open Finance` · `Pluggy` · `SWR` · `Recharts` · `Vercel` · `Serverless` · `Webhook` · `Cron Job` · `JWT` · `Autenticação` · `httpOnly Cookie` · `Next.js Middleware` · `App Router` · `Custom Hooks` · `useMemo` · `API Routes` · `Upsert` · `Stored Procedures` · `Axios` · `Zod` · `ESLint` · `Prettier` · `Full-Stack` · `BFF (Backend for Frontend)` · `Paginação` · `Memoização` · `Algoritmos de Detecção de Padrões` · `Séries Temporais` · `Mapper Pattern` · `Singleton Pattern` · `Deploy Automatizado` · `CI/CD` · `Lucide React` · `Módulos ES` · `Node.js`
