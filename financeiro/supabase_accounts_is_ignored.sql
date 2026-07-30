-- ============================================================================
-- Contas espelhadas — RODAR ESTE ARQUIVO
--
-- Esta seção também existe no fim de supabase_fixed_expenses_v2.sql, mas foi
-- acrescentada depois. Se você rodou aquele arquivo antes, a coluna abaixo não
-- existe no seu banco — e a consequência não é um erro, é pior: o código tem
-- fallback silencioso e passa a considerar TODAS as contas.
--
-- O Inter exporta o mesmo cartão duas vezes, como "THIAGO E SANTOS" e "GOLD".
-- Sem esta coluna:
--   - o total das faturas sai dobrado (as duas contas têm a mesma fatura,
--     mesmo vencimento, mesmo valor);
--   - o limite disponível sai dobrado;
--   - só os gastos escapam, porque a dedupe no nível da transação os salva.
--
-- Aditivo e idempotente.
-- ============================================================================

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS is_ignored BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS accounts_is_ignored_idx
  ON public.accounts (is_ignored);

-- Confira o que existe antes de marcar:
--   SELECT account_id, name, marketing_name, type, balance,
--          credit_data->>'balance_due_date'       AS vence,
--          credit_data->>'credit_limit'           AS limite,
--          credit_data->>'available_credit_limit' AS disponivel,
--          (SELECT COUNT(*) FROM public.transactions t
--             WHERE t.account_id = a.account_id)  AS lancamentos
--   FROM public.accounts a
--   ORDER BY type, name;

-- Ignora o espelho "GOLD" do Inter, mantendo "THIAGO E SANTOS".
UPDATE public.accounts
SET is_ignored = TRUE
WHERE type = 'CREDIT'
  AND (name ILIKE '%GOLD%' OR marketing_name ILIKE '%GOLD%');

-- Confirme que sobrou exatamente um cartão por plástico:
--   SELECT name, is_ignored FROM public.accounts WHERE type = 'CREDIT';

-- Para reverter:
--   UPDATE public.accounts SET is_ignored = FALSE WHERE is_ignored;
