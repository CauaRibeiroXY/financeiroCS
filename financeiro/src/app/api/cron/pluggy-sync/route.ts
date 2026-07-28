import { NextResponse } from 'next/server';
import { syncItemData } from '@/app/lib/services/item-sync.service';
import { itemsService } from '@/app/lib/services/items';
import { supabaseAdmin } from '@/app/lib/supabase/client'; // Adicionado para acessar o banco no snapshot

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');

    if (itemId) {
      // sync single item (useful for manual trigger)
      await syncItemData(itemId);
      return NextResponse.json({ ok: true, started: 1 });
    }

    // ====================================================================
    // 1. SYNC DA PLUGGY (Atualiza os dados bancários primeiro)
    // ====================================================================
    const items = await itemsService.getItems();
    const itemIds = items.map(i => i.item_id).filter(Boolean) as string[];

    // run syncs in parallel but wait for completion so Vercel Cron knows result
    const results = await Promise.allSettled(itemIds.map(id => syncItemData(id)));
    const failures = results.filter(r => r.status === 'rejected').length;

    // ====================================================================
    // 2. SNAPSHOT DAS METAS (Tira a foto com os saldos atualizados)
    // ====================================================================
    let snapshotsSaved = 0;
    try {
      const { data: goals } = await supabaseAdmin.from('goals').select('*');

      if (goals && goals.length > 0) {
        // Busca o patrimônio recém-sincronizado
        const { data: accounts } = await supabaseAdmin
          .from('accounts')
          .select('balance, type')
          .in('type', ['BANK', 'PAYMENT_ACCOUNT']);

        const patrimony = accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;
        const today = new Date().toISOString().split('T')[0]; // Pega a data atual no formato YYYY-MM-DD

        // Calcula os valores e prepara o array para salvar
        const snapshots = goals.map(goal => {
          const allocatedValue = (patrimony * Number(goal.percent_allocation)) / 100;
          const totalAccumulated = allocatedValue + Number(goal.external_aporte);
          
          return {
            goal_id: goal.id,
            snapshot_date: today,
            pool_allocated_value: allocatedValue,
            external_aporte: goal.external_aporte,
            total_accumulated: totalAccumulated
          };
        });

        // Salva/Atualiza o snapshot no banco de dados em lote
        const { error: snapshotError } = await supabaseAdmin
          .from('goal_snapshots')
          .upsert(snapshots, { onConflict: 'goal_id, snapshot_date' });

        if (!snapshotError) {
          snapshotsSaved = snapshots.length;
        } else {
          console.error('Erro ao salvar snapshots das metas:', snapshotError);
        }
      }
    } catch (snapErr) {
      console.error('Erro geral no processamento dos snapshots:', snapErr);
    }

    // ====================================================================
    // 3. RETORNO COMBINADO
    // ====================================================================
    return NextResponse.json({ 
      ok: true, 
      sync: { started: itemIds.length, failures },
      snapshots: { saved: snapshotsSaved } 
    });

  } catch (err) {
    console.error('Cron sync handler error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}