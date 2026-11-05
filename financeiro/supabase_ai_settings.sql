-- ============================================================================
-- TABELA: ai_settings (Configurações centralizadas da IA e Gemini API Key)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  api_key TEXT,
  model TEXT DEFAULT 'gemini-3.6-flash',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Permitir acesso completo para service_role (backend da aplicação)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_settings' AND policyname = 'Allow service_role full access on ai_settings'
  ) THEN
    CREATE POLICY "Allow service_role full access on ai_settings"
    ON public.ai_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
