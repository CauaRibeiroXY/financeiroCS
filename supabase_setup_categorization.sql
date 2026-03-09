-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_rules table
CREATE TABLE IF NOT EXISTS public.category_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_name VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC for syncing a category rule and batch updating transactions in a single transaction
CREATE OR REPLACE FUNCTION sync_transaction_category(
    p_category_id UUID,
    p_description TEXT
) RETURNS void AS $$
BEGIN
    -- 1. Update or create the rule in category_rules for the given description
    INSERT INTO public.category_rules (merchant_name, category_id)
    VALUES (p_description, p_category_id)
    ON CONFLICT (merchant_name) 
    DO UPDATE SET category_id = EXCLUDED.category_id;

    -- 2. Update all transactions with the same description
    -- We assume the 'description' column holds the 'original_description'
    UPDATE public.transactions
    SET category_id = p_category_id::text
    WHERE description = p_description OR description_raw = p_description;
END;
$$ LANGUAGE plpgsql;

-- RPC to process all uncategorized transactions
-- It matches the transaction's description against the rule's merchant_name using ILIKE
CREATE OR REPLACE FUNCTION process_uncategorized_transactions()
RETURNS integer AS $$
DECLARE
    updated_count integer;
BEGIN
    WITH updated AS (
        UPDATE public.transactions t
        SET category_id = (
            SELECT cr.category_id::text
            FROM public.category_rules cr
            WHERE t.description ILIKE '%' || cr.merchant_name || '%'
               OR t.description_raw ILIKE '%' || cr.merchant_name || '%'
            ORDER BY LENGTH(cr.merchant_name) DESC
            LIMIT 1
        )
        WHERE (t.category_id IS NULL OR t.category_id = '')
          AND EXISTS (
            SELECT 1 
            FROM public.category_rules cr
            WHERE t.description ILIKE '%' || cr.merchant_name || '%'
               OR t.description_raw ILIKE '%' || cr.merchant_name || '%'
          )
        RETURNING id
    )
    SELECT count(*) INTO updated_count FROM updated;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
