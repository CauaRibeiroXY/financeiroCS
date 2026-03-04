
const supabaseUrl = 'https://xkqdgjlqmawvdaqvddqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcWRnamxxbWF3dmRhcXZkZHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIzMjMxMSwiZXhwIjoyMDg3ODA4MzExfQ.8MZjP_mtZYv0h5Jggywj0pi9bkZ_6X36D2vqbCyhRMg';

async function main() {
    try {
        const headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        // Check transactions
        const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?select=date&order=date.desc&limit=10`, { headers });
        const transactions = await txRes.json();

        console.log('--- LATEST TRANSACTIONS ---');
        if (Array.isArray(transactions)) {
            transactions.forEach(t => console.log(t.date));
        } else {
            console.log('Error or no data:', transactions);
        }

        // Check items
        const itemRes = await fetch(`${supabaseUrl}/rest/v1/pluggy_items?select=item_id,status,last_updated_at,connector_name`, { headers });
        const items = await itemRes.json();

        console.log('\n--- PLUGGY ITEMS STATUS ---');
        if (Array.isArray(items)) {
            items.forEach(i => console.log(`${i.connector_name} (${i.item_id}): ${i.status} (Last Update: ${i.last_updated_at})`));
        } else {
            console.log('Error or no data:', items);
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
