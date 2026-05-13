import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/push/send-broadcast';
import type { PushPayload } from '@/lib/push/types';
import { PUSH_EVENT_TYPES, type PushEventType } from '@/lib/push/types';

function isPushType(v: string): v is PushEventType {
  return (PUSH_EVENT_TYPES as readonly string[]).includes(v);
}

export async function POST(request: NextRequest) {
  const secret = process.env.PUSH_SEND_API_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'PUSH_SEND_API_SECRET not configured' }, { status: 503 });
  }
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { userId: string; type: string; title: string; body: string; url?: string; tag?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId || !body.type || !isPushType(body.type)) {
    return NextResponse.json({ error: 'Missing userId or invalid type' }, { status: 400 });
  }
  if (!body.title || !body.body) {
    return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });
  }

  const payload: PushPayload = {
    type: body.type,
    title: body.title,
    body: body.body,
    url: body.url,
    tag: body.tag,
  };

  try {
    const n = await sendPushToUser(body.userId, payload);
    return NextResponse.json({ success: true, sent: n });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Push failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
