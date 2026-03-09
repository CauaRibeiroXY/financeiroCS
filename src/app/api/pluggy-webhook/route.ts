import { NextResponse } from 'next/server';
import { syncItemData } from '@/app/lib/services/item-sync.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const eventType = (body.type || body.event || '').toString();

    const itemId =
      body?.data?.item?.id ||
      body?.data?.id ||
      body?.item_id ||
      body?.id ||
      body?.resource?.id ||
      body?.data?.attributes?.item_id;

    if (eventType !== 'item/updated') {
      return NextResponse.json({ ok: true, message: 'event ignored' });
    }

    if (!itemId) {
      return NextResponse.json({ ok: false, message: 'item id not provided' }, { status: 400 });
    }

    // respond quickly and run sync in a "background task" so the
    // webhook request does not hang or hit a timeout.  syncItemData may
    // iterate dozens of accounts and pull hundreds of transactions, so
    // performing it asynchronously here mirrors a FastAPI BackgroundTask.
    void (async () => {
      try {
        await syncItemData(String(itemId));
      } catch (err) {
        console.error('Webhook background sync error:', err);
      }
    })();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
