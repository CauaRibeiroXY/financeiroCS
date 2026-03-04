-- SQL para rodar no Supabase e adicionar o campo icon_url na tabela Accounts
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS icon_url text;
