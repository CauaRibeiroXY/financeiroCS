-- ============================================================================
-- Financeiro — schema completo do Supabase
--
-- ⚠️  DESTRUTIVO: a seção 1 apaga todas as tabelas e todos os dados.
--     Rode apenas para recriar o banco do zero.
--
-- Substitui os arquivos avulsos anteriores:
--   supabase_setup_categorization.sql
--   supabase_add_account_icon.sql
--   supabase_accounts_is_ignored.sql
--   supabase_fixed_expenses_v2.sql
--
-- Ordem: extensões → drop → utilidades → tabelas Pluggy → tabelas do app
--        → índices → funções → triggers → RLS
--
-- Decisões de projeto (o "porquê" de divergir do schema antigo):
--
-- 1. Sem CHECK em enum vindo da Pluggy. Um valor novo do lado deles (um novo
--    `investment.type`, um novo `item.status`) viraria erro de constraint e
--    derrubaria a ingestão inteira. O app já normaliza o que precisa.
--
-- 2. NOT NULL só onde o mapper comprovadamente sempre escreve. Nas tabelas
--    alimentadas pela API, campo obrigatório demais = sync quebrado.
--
-- 3. FK com ON DELETE CASCADE. Sem isso, `DELETE /api/items?itemId=` falha por
--    violação de chave estrangeira quando o item já tem contas.
--
-- 4. RLS habilitada e SEM policies. O app acessa tudo pela service_role, que
--    ignora RLS; anon/authenticated ficam sem acesso nenhum. Ver seção 9.
-- ============================================================================


-- ============================================================================
-- 1. EXTENSÕES
-- ============================================================================

-- gen_random_uuid() é nativa desde o PG13 — dispensa a uuid-ossp que o
-- script antigo instalava.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================================
-- 2. DROP — apaga tudo
-- ============================================================================

-- As tabelas vão primeiro: DROP TABLE ... CASCADE já remove os triggers junto,
-- e é por isso que não há DROP TRIGGER aqui. Se as funções fossem derrubadas
-- antes, o Postgres recusaria — os triggers ainda dependeriam delas.
DROP TABLE IF EXISTS public.fixed_expense_payments CASCADE;
DROP TABLE IF EXISTS public.fixed_expenses        CASCADE;
DROP TABLE IF EXISTS public.goal_snapshots        CASCADE;
DROP TABLE IF EXISTS public.goals                 CASCADE;
DROP TABLE IF EXISTS public.category_rules        CASCADE;
DROP TABLE IF EXISTS public.categories            CASCADE;
DROP TABLE IF EXISTS public.investment_transactions CASCADE;
DROP TABLE IF EXISTS public.investments           CASCADE;
DROP TABLE IF EXISTS public.credit_card_bills     CASCADE;
DROP TABLE IF EXISTS public.transactions          CASCADE;
DROP TABLE IF EXISTS public.identities            CASCADE;
DROP TABLE IF EXISTS public.loans                 CASCADE;
DROP TABLE IF EXISTS public.accounts              CASCADE;
DROP TABLE IF EXISTS public.pluggy_items          CASCADE;

-- Agora sim as funções, já sem dependentes.
DROP FUNCTION IF EXISTS public.process_uncategorized_transactions();
DROP FUNCTION IF EXISTS public.sync_transaction_category(UUID, TEXT);
DROP FUNCTION IF EXISTS public.touch_updated_at();


-- ============================================================================
-- 3. UTILIDADES
-- ============================================================================

-- As tabelas têm `updated_at DEFAULT now()`, mas o default só vale no INSERT.
-- Nos upserts do sync a coluna ficava congelada na data de criação; este
-- trigger mantém o valor real de última escrita.
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 4. TABELAS ALIMENTADAS PELA PLUGGY
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 4.1 pluggy_items — uma conexão bancária (item da Pluggy)
-- ---------------------------------------------------------------------------
CREATE TABLE public.pluggy_items (
  item_id             UUID PRIMARY KEY,
  user_id             TEXT,
  connector_id        TEXT,
  connector_name      TEXT,
  connector_image_url TEXT,
  -- UPDATED | UPDATING | WAITING_USER_INPUT | LOGIN_ERROR | OUTDATED | CREATED
  -- Sem CHECK de propósito: ver decisão 1 no cabeçalho.
  status              TEXT,
  last_updated_at     TIMESTAMPTZ,
  webhook_url         TEXT,
  parameters          JSONB,
  institution_name    TEXT,
  institution_url     TEXT,
  primary_color       TEXT,
  secondary_color     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.pluggy_items IS
  'Conexões bancárias. item_id é o id do item na Pluggy.';

-- ---------------------------------------------------------------------------
-- 4.2 accounts — contas e cartões de um item
-- ---------------------------------------------------------------------------
CREATE TABLE public.accounts (
  account_id                  TEXT PRIMARY KEY,
  item_id                     UUID REFERENCES public.pluggy_items(item_id) ON DELETE CASCADE,
  -- BANK | CREDIT | PAYMENT_ACCOUNT
  type                        TEXT NOT NULL,
  subtype                     TEXT,
  number                      TEXT,
  name                        TEXT NOT NULL,
  marketing_name              TEXT,
  balance                     NUMERIC,
  currency_code               TEXT DEFAULT 'BRL',
  owner                       TEXT,
  tax_number                  TEXT,
  icon_url                    TEXT,
  bank_data                   JSONB,
  credit_data                 JSONB,
  disaggregated_credit_limits JSONB,

  -- Contas espelhadas: alguns bancos exportam o mesmo cartão duas vezes
  -- (o Inter manda "THIAGO E SANTOS" e "GOLD"). Somar as duas dobraria fatura
  -- e limite. Marque a cópia com is_ignored = TRUE — ver seção 10.
  is_ignored                  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4.3 transactions — lançamentos
-- ---------------------------------------------------------------------------
CREATE TABLE public.transactions (
  transaction_id             TEXT PRIMARY KEY,
  account_id                 TEXT REFERENCES public.accounts(account_id) ON DELETE CASCADE,
  date                       TIMESTAMPTZ NOT NULL,
  description                TEXT NOT NULL,
  description_raw            TEXT,
  amount                     NUMERIC NOT NULL,
  amount_in_account_currency NUMERIC,
  balance                    NUMERIC,
  currency_code              TEXT DEFAULT 'BRL',
  category                   TEXT,

  -- Coluna com dois donos: recebe o categoryId da Pluggy no sync ('04000000')
  -- e o UUID de public.categories quando você recategoriza pela interface
  -- (via sync_transaction_category). Por isso é TEXT, não UUID, e não tem FK.
  category_id                TEXT,

  provider_code              TEXT,
  provider_id                TEXT,
  status                     TEXT DEFAULT 'POSTED',   -- POSTED | PENDING
  type                       TEXT NOT NULL,           -- CREDIT | DEBIT
  operation_type             TEXT,
  operation_category         TEXT,
  payment_data               JSONB,
  credit_card_metadata       JSONB,
  merchant                   JSONB,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4.4 credit_card_bills — faturas
-- ---------------------------------------------------------------------------
CREATE TABLE public.credit_card_bills (
  bill_id                    TEXT PRIMARY KEY,
  account_id                 TEXT REFERENCES public.accounts(account_id) ON DELETE CASCADE,
  -- Nullable: o mapper deixa em branco quando a Pluggy não informa.
  due_date                   TIMESTAMPTZ,
  total_amount               NUMERIC,
  total_amount_currency_code TEXT DEFAULT 'BRL',
  minimum_payment_amount     NUMERIC,
  allows_installments        BOOLEAN DEFAULT FALSE,
  finance_charges            JSONB,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4.5 investments — posições
-- ---------------------------------------------------------------------------
CREATE TABLE public.investments (
  investment_id           TEXT PRIMARY KEY,
  item_id                 UUID REFERENCES public.pluggy_items(item_id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  code                    TEXT,
  isin                    TEXT,
  number                  TEXT,
  owner                   TEXT,
  currency_code           TEXT DEFAULT 'BRL',
  -- FIXED_INCOME | SECURITY | MUTUAL_FUND | EQUITY | ETF | COE | ...
  type                    TEXT,
  subtype                 TEXT,
  last_month_rate         NUMERIC,
  last_twelve_months_rate NUMERIC,
  annual_rate             NUMERIC,
  date                    TIMESTAMPTZ,
  value                   NUMERIC,
  quantity                NUMERIC,
  -- amount/balance são nullable: o mapper usa `investment.amount || undefined`,
  -- então zero e ausência viram NULL. Eram NOT NULL e o schema antigo precisava
  -- de dois ALTER depois para desfazer.
  amount                  NUMERIC,
  balance                 NUMERIC,
  taxes                   NUMERIC,
  taxes2                  NUMERIC,
  due_date                TIMESTAMPTZ,
  rate                    NUMERIC,
  rate_type               TEXT,   -- CDI | IPCA | PRE_FIXADO | SELIC | ...
  fixed_annual_rate       NUMERIC,
  issuer                  TEXT,
  issue_date              TIMESTAMPTZ,
  amount_profit           NUMERIC,
  amount_withdrawal       NUMERIC,
  amount_original         NUMERIC,
  status                  TEXT DEFAULT 'ACTIVE',
  institution             JSONB,
  metadata                JSONB,
  provider_id             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4.6 investment_transactions — movimentos das posições
-- ---------------------------------------------------------------------------
CREATE TABLE public.investment_transactions (
  transaction_id    TEXT PRIMARY KEY,
  investment_id     TEXT REFERENCES public.investments(investment_id) ON DELETE CASCADE,
  trade_date        TIMESTAMPTZ NOT NULL,
  date              TIMESTAMPTZ NOT NULL,
  description       TEXT,
  quantity          NUMERIC,
  value             NUMERIC NOT NULL DEFAULT 0,
  amount            NUMERIC NOT NULL DEFAULT 0,
  net_amount        NUMERIC,
  -- BUY | SELL | DIVIDEND | SPLIT | BONUS | TRANSFER
  -- O CHECK antigo não incluía TRANSFER, que é justamente o default do mapper
  -- (`transaction.type || 'TRANSFER'`) — todo movimento sem tipo era rejeitado.
  type              TEXT NOT NULL,
  brokerage_number  TEXT,
  expenses          JSONB,
  currency_code     TEXT DEFAULT 'BRL',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4.7 loans — empréstimos e financiamentos
-- ---------------------------------------------------------------------------
CREATE TABLE public.loans (
  loan_id                                TEXT PRIMARY KEY,
  item_id                                UUID REFERENCES public.pluggy_items(item_id) ON DELETE CASCADE,
  contract_number                        TEXT,
  ipoc_code                              TEXT,
  product_name                           TEXT NOT NULL,
  provider_id                            TEXT,
  type                                   TEXT,
  date                                   TIMESTAMPTZ,
  contract_date                          TIMESTAMPTZ,
  disbursement_dates                     JSONB,
  settlement_date                        TIMESTAMPTZ,
  due_date                               TIMESTAMPTZ,
  first_installment_due_date             TIMESTAMPTZ,
  contract_amount                        NUMERIC,
  currency_code                          TEXT DEFAULT 'BRL',
  cet                                    NUMERIC,
  installment_periodicity                TEXT,
  installment_periodicity_additional_info TEXT,
  amortization_scheduled                 TEXT,
  amortization_scheduled_additional_info TEXT,
  cnpj_consignee                         TEXT,
  interest_rates                         JSONB,
  contracted_fees                        JSONB,
  contracted_finance_charges             JSONB,
  warranties                             JSONB,
  installments                           JSONB,
  payments                               JSONB,
  created_at                             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4.8 identities — dados cadastrais do titular
-- ---------------------------------------------------------------------------
CREATE TABLE public.identities (
  identity_id        TEXT PRIMARY KEY,
  item_id            UUID REFERENCES public.pluggy_items(item_id) ON DELETE CASCADE,
  full_name          TEXT,
  company_name       TEXT,
  document           TEXT,
  document_type      TEXT,
  tax_number         TEXT,
  job_title          TEXT,
  birth_date         TIMESTAMPTZ,
  investor_profile   TEXT,
  establishment_code TEXT,
  establishment_name TEXT,
  addresses          JSONB,
  phone_numbers      JSONB,
  emails             JSONB,
  relations          JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 5. TABELAS DO APLICATIVO (não vêm da Pluggy)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 5.1 categories / category_rules — categorização por estabelecimento
-- ---------------------------------------------------------------------------
CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.category_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL UNIQUE,
  category_id   UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.category_rules IS
  'Regra "descrição contém X → categoria Y", aplicada por process_uncategorized_transactions().';

-- ---------------------------------------------------------------------------
-- 5.2 goals / goal_snapshots — metas e histórico
-- ---------------------------------------------------------------------------
CREATE TABLE public.goals (
  id                 BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title              TEXT NOT NULL,
  target_amount      NUMERIC NOT NULL,
  external_aporte    NUMERIC NOT NULL DEFAULT 0,
  percent_allocation NUMERIC NOT NULL DEFAULT 0,
  color              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.goal_snapshots (
  id                   BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  goal_id              BIGINT REFERENCES public.goals(id) ON DELETE CASCADE,
  snapshot_date        DATE NOT NULL,
  pool_allocated_value NUMERIC NOT NULL,
  external_aporte      NUMERIC NOT NULL,
  total_accumulated    NUMERIC NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- É o alvo do onConflict do cron (`goal_id, snapshot_date`).
  --
  -- O schema antigo tinha TAMBÉM um índice único por MÊS
  -- (goal_id, date_trunc('month', snapshot_date)). Os dois juntos se anulam:
  -- o cron grava uma foto por DIA, então a partir do dia 2 de cada mês o
  -- upsert batia no índice mensal e estourava violação de unicidade. O índice
  -- mensal foi removido de propósito — não recrie.
  CONSTRAINT goal_snapshots_goal_date_uniq UNIQUE (goal_id, snapshot_date)
);

-- ---------------------------------------------------------------------------
-- 5.3 fixed_expenses — compromissos mensais
--
-- Consolida o CREATE original + os ~10 ALTER TABLE do fixed_expenses_v2.
-- ---------------------------------------------------------------------------
CREATE TABLE public.fixed_expenses (
  id                 BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title              TEXT NOT NULL,
  amount             NUMERIC NOT NULL DEFAULT 0,
  due_day            INTEGER CHECK (due_day IS NULL OR due_day BETWEEN 1 AND 31),
  category           TEXT DEFAULT 'Outros',

  kind               TEXT NOT NULL DEFAULT 'MANUAL'
                     CHECK (kind IN ('MANUAL', 'SUBSCRIPTION', 'INSTALLMENT', 'VARIABLE_RECURRING')),

  -- Chave normalizada do estabelecimento. Quando preenchida, esta linha
  -- SUBSTITUI o item que o detector encontraria com a mesma chave — é assim
  -- que se corrige um valor detectado errado sem perder o vínculo.
  merchant_key       TEXT,
  account_id         TEXT,

  -- NULL = prazo indeterminado.
  end_date           DATE,
  installments_total INTEGER,

  is_auto            BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid            BOOLEAN NOT NULL DEFAULT FALSE,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  -- Substitui o hack antigo de gravar o título como 'HIDDEN:<chave>'.
  is_muted           BOOLEAN NOT NULL DEFAULT FALSE,

  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5.4 fixed_expense_payments — baixa por período
--
-- Compromisso detectado automaticamente não tem linha própria (é recalculado a
-- cada request), então o pagamento é marcado pela chave estável do detector:
--   'manual:12'  |  'rec:netflix'  |  'inst:carmo motos|62.00|6'
-- ---------------------------------------------------------------------------
CREATE TABLE public.fixed_expense_payments (
  id           BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  expense_key  TEXT NOT NULL,
  period       TEXT NOT NULL CHECK (period ~ '^\d{4}-\d{2}$'),   -- 'YYYY-MM'
  amount       NUMERIC NOT NULL DEFAULT 0,
  paid_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fixed_expense_payments_uniq UNIQUE (expense_key, period)
);


-- ============================================================================
-- 6. ÍNDICES
--
-- O Postgres cria índice para PRIMARY KEY e UNIQUE, mas NÃO para chave
-- estrangeira. Sem os índices de FK abaixo, todo join e todo ON DELETE CASCADE
-- vira varredura sequencial.
-- ============================================================================

CREATE INDEX accounts_item_id_idx        ON public.accounts (item_id);
CREATE INDEX accounts_is_ignored_idx     ON public.accounts (is_ignored);
CREATE INDEX credit_card_bills_acct_idx  ON public.credit_card_bills (account_id);
CREATE INDEX investments_item_id_idx     ON public.investments (item_id);
CREATE INDEX inv_txns_investment_id_idx  ON public.investment_transactions (investment_id);
CREATE INDEX loans_item_id_idx           ON public.loans (item_id);
CREATE INDEX identities_item_id_idx      ON public.identities (item_id);
CREATE INDEX category_rules_cat_id_idx   ON public.category_rules (category_id);
CREATE INDEX goal_snapshots_goal_id_idx  ON public.goal_snapshots (goal_id);

-- Varredura de 12 meses que o detector de recorrências faz.
CREATE INDEX transactions_account_date_idx ON public.transactions (account_id, date DESC);
CREATE INDEX transactions_date_type_idx    ON public.transactions (date DESC, type);

-- process_uncategorized_transactions() filtra por category_id vazio.
CREATE INDEX transactions_category_id_idx  ON public.transactions (category_id)
  WHERE category_id IS NULL OR category_id = '';

-- Uma chave de estabelecimento não pode ter dois vínculos.
CREATE UNIQUE INDEX fixed_expenses_merchant_key_uniq
  ON public.fixed_expenses (merchant_key)
  WHERE merchant_key IS NOT NULL;

CREATE INDEX fixed_expenses_active_idx
  ON public.fixed_expenses (is_active, is_muted);

CREATE INDEX fixed_expense_payments_period_idx
  ON public.fixed_expense_payments (period);


-- ============================================================================
-- 7. FUNÇÕES (RPC chamadas pelo app)
-- ============================================================================

-- Chamada por src/app/domain/categorization.ts.
-- Cria/atualiza a regra e reclassifica de uma vez as transações com a mesma
-- descrição, numa única transação do banco.
CREATE OR REPLACE FUNCTION public.sync_transaction_category(
  p_category_id UUID,
  p_description TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.category_rules (merchant_name, category_id)
  VALUES (p_description, p_category_id)
  ON CONFLICT (merchant_name)
  DO UPDATE SET category_id = EXCLUDED.category_id;

  UPDATE public.transactions
  SET category_id = p_category_id::TEXT
  WHERE description = p_description
     OR description_raw = p_description;
END;
$$ LANGUAGE plpgsql;

-- Aplica todas as regras às transações ainda sem categoria e devolve quantas
-- foram atualizadas. Em empate, vence a regra de nome mais longo (mais específica).
--
-- Correção: a versão antiga fazia `RETURNING id`, mas transactions não tem
-- coluna `id` — a chave é transaction_id. A função quebrava ao ser chamada.
CREATE OR REPLACE FUNCTION public.process_uncategorized_transactions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE public.transactions t
    SET category_id = (
      SELECT cr.category_id::TEXT
      FROM public.category_rules cr
      WHERE t.description     ILIKE '%' || cr.merchant_name || '%'
         OR t.description_raw ILIKE '%' || cr.merchant_name || '%'
      ORDER BY LENGTH(cr.merchant_name) DESC
      LIMIT 1
    )
    WHERE (t.category_id IS NULL OR t.category_id = '')
      AND EXISTS (
        SELECT 1
        FROM public.category_rules cr
        WHERE t.description     ILIKE '%' || cr.merchant_name || '%'
           OR t.description_raw ILIKE '%' || cr.merchant_name || '%'
      )
    RETURNING t.transaction_id
  )
  SELECT COUNT(*) INTO updated_count FROM updated;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pluggy_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.credit_card_bills
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.investment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.identities
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.fixed_expenses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ============================================================================
-- 9. RLS — Row Level Security
--
-- Habilitada em tudo, e SEM policy nenhuma. Não é descuido:
--
--   - O app acessa o banco só pelo servidor, com a SUPABASE_SERVICE_ROLE_KEY.
--     A service_role IGNORA RLS por definição, então o app continua funcionando
--     normalmente.
--   - Sem policy, as roles anon e authenticated não leem nem escrevem nada.
--     Como NEXT_PUBLIC_SUPABASE_URL é público, isso fecha a porta caso uma
--     anon key seja exposta um dia.
--
-- O schema antigo usava `CREATE POLICY "Allow all" ... USING (true)` em
-- fixed_expenses, o que libera leitura para a anon key — o oposto do objetivo.
--
-- Se um dia o front passar a falar direto com o Supabase, crie policies
-- explícitas por tabela aqui.
-- ============================================================================

ALTER TABLE public.pluggy_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_bills       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identities              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_snapshots          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expense_payments  ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 10. PÓS-INSTALAÇÃO (opcional, rode depois do primeiro sync)
-- ============================================================================

-- Contas espelhadas: confira o que veio antes de marcar qualquer coisa.
--
--   SELECT account_id, name, marketing_name, type, balance,
--          credit_data->>'balance_due_date'       AS vence,
--          credit_data->>'credit_limit'           AS limite,
--          credit_data->>'available_credit_limit' AS disponivel,
--          (SELECT COUNT(*) FROM public.transactions t
--             WHERE t.account_id = a.account_id)  AS lancamentos
--   FROM public.accounts a
--   ORDER BY type, name;
--
-- Duas linhas com o MESMO limite e MESMO vencimento são o mesmo plástico.
-- Em geral uma delas tem bem menos lançamentos — mantenha a que tem mais.
--
-- Marque a cópia pelo account_id específico. NÃO use padrão de nome
-- (ILIKE '%GOLD%' e afins): o que é espelho varia por banco, e marcar a conta
-- errada faz um cartão legítimo sumir dos cálculos sem aviso.
--
--   UPDATE public.accounts SET is_ignored = TRUE
--   WHERE account_id = 'o-id-da-copia';
--
-- Para reverter:
--   UPDATE public.accounts SET is_ignored = FALSE WHERE is_ignored;


-- ============================================================================
-- 11. VERIFICAÇÃO — rode depois de aplicar o schema
-- ============================================================================

-- Devem aparecer 14 tabelas:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- Todo upsert do app depende de uma constraint única no alvo do onConflict.
-- Esta consulta lista o que existe — se faltar alguma, o upsert falha com
-- 42P10 (there is no unique or exclusion constraint matching the ON CONFLICT):
--
--   SELECT c.relname AS tabela, i.relname AS indice, a.attname AS coluna
--   FROM pg_index ix
--   JOIN pg_class i     ON i.oid = ix.indexrelid
--   JOIN pg_class c     ON c.oid = ix.indrelid
--   JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(ix.indkey)
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND ix.indisunique
--   ORDER BY c.relname;
