import { getSupabaseAdmin } from '../lib/supabase/client';

export const categorizationService = {
    /**
     * Iterates over transactions without a category and maps them via SQL matching.
     * Internally calls the process_uncategorized_transactions RPC which uses ILIKE
     * to match the description with category_rules.merchant_name.
     * 
     * @returns The number of updated transactions.
     */
    async processUncategorizedTransactions(): Promise<number> {
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase.rpc('process_uncategorized_transactions');

        if (error) {
            console.error('Error processing uncategorized transactions:', error);
            throw new Error(`Failed to process categorizations: ${error.message}`);
        }

        return data as number;
    },

    /**
     * Syncs a single category and propagates to all transactions with the same description.
     * Executes within a single transaction bloc inside Postgres via RPC.
     * 
     * @param categoryId The new category ID to set.
     * @param description The original_description of the transaction.
     */
    async syncTransactionCategory(categoryId: string, description: string): Promise<void> {
        const supabase = getSupabaseAdmin();

        const { error } = await supabase.rpc('sync_transaction_category', {
            p_category_id: categoryId,
            p_description: description
        });

        if (error) {
            console.error('Error syncing transaction category:', error);
            throw new Error(`Failed to sync category: ${error.message}`);
        }
    }
};
