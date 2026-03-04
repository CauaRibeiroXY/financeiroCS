
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase
        .from('transactions')
        .select('date')
        .order('date', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    console.log('Latest transactions dates:');
    data.forEach(t => console.log(t.date));

    const { data: items, error: itemError } = await supabase
        .from('pluggy_items')
        .select('item_id, status, last_updated_at');

    if (itemError) {
        console.error('Error fetching items:', itemError);
    } else {
        console.log('\nItems status:');
        items.forEach(i => console.log(`${i.item_id}: ${i.status} (Last Update: ${i.last_updated_at})`));
    }
}

main();
