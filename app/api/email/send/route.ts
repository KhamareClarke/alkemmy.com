import { NextRequest, NextResponse } from 'next/server';
import { EMAIL_NOTIFICATION_TYPES, type EmailNotificationType } from '@/lib/email/types';
import { sendNotificationEmail } from '@/lib/email/send-notification';

function isNotificationType(v: string): v is EmailNotificationType {
  return (EMAIL_NOTIFICATION_TYPES as readonly string[]).includes(v);
}

export async function POST(request: NextRequest) {
  const secret = process.env.EMAIL_SEND_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'EMAIL_SEND_API_SECRET is not configured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { type?: string; payload?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, payload = {} } = body;
  if (!type || typeof type !== 'string' || !isNotificationType(type)) {
    return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
  }

  try {
    await sendNotificationEmail(type, payload);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Send failed';
    console.error('POST /api/email/send:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
