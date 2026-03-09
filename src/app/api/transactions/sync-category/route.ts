import { NextResponse } from 'next/server';
import { categorizationService } from '@/app/domain/categorization';
import { getSupabaseAdmin } from '@/app/lib/supabase/client';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transaction_id, category_id } = body;

        if (!transaction_id || !category_id) {
            return NextResponse.json({ error: 'Missing transaction_id or category_id' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Try finding the transaction by 'id' (UUID) or by 'transaction_id' (Pluggy string)
        let { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('description, description_raw')
            .eq('id', transaction_id)
            .maybeSingle();

        if (!transaction) {
            // Fallback to Pluggy's transaction_id
            const { data: fallbackTransaction } = await supabase
                .from('transactions')
                .select('description, description_raw')
                .eq('transaction_id', transaction_id)
                .maybeSingle();

            transaction = fallbackTransaction;
        }

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found or could not fetch description' }, { status: 404 });
        }

        const originalDescription = transaction.description || transaction.description_raw;

        if (!originalDescription) {
            return NextResponse.json({ error: 'Transaction has no description' }, { status: 400 });
        }

        // Call the domain service which acts natively via SQL RPC to do the DB Transaction block
        await categorizationService.syncTransactionCategory(category_id, originalDescription);

        return NextResponse.json({ success: true, message: 'Category synced and propagated successfully' });
    } catch (error: any) {
        console.error('Error in sync-category API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
