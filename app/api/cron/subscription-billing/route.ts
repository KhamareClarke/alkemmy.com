import { NextRequest, NextResponse } from 'next/server';
import { processDueSubscriptions } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await processDueSubscriptions();
  return NextResponse.json({ ok: true, ...result });
}
