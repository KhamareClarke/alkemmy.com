import { NextRequest, NextResponse } from 'next/server';
import { handleTrackingWebhook } from '@/lib/shipping/shippo';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const secret = process.env.SHIPPO_WEBHOOK_SECRET?.trim();
  if (secret) {
    const sig = request.headers.get('x-shippo-signature') || request.headers.get('Shippo-Signature');
    if (sig !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = await handleTrackingWebhook(body as Parameters<typeof handleTrackingWebhook>[0]);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
