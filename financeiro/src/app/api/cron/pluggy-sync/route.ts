import { NextResponse } from 'next/server';
import { syncItemData } from '@/app/lib/services/item-sync.service';
import { itemsService } from '@/app/lib/services/items';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');

    if (itemId) {
      // sync single item (useful for manual trigger)
      await syncItemData(itemId);
      return NextResponse.json({ ok: true, started: 1 });
    }

    // fetch all items from DB and sync each one
    const items = await itemsService.getItems();
    const itemIds = items.map(i => i.item_id).filter(Boolean) as string[];

    // run syncs in parallel but wait for completion so Vercel Cron knows result
    const results = await Promise.allSettled(itemIds.map(id => syncItemData(id)));

    const failures = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ ok: true, started: itemIds.length, failures });
  } catch (err) {
    console.error('Cron sync handler error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
