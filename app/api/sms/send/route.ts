import { NextRequest, NextResponse } from 'next/server';
import { SMS_TYPES, type SmsType } from '@/lib/sms/types';
import { buildSmsBody } from '@/lib/sms/templates';
import { sendSmsWithRetry } from '@/lib/sms/send';

function isSmsType(v: string): v is SmsType {
  return (SMS_TYPES as readonly string[]).includes(v);
}

export async function POST(request: NextRequest) {
  const secret = process.env.SMS_SEND_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'SMS_SEND_API_SECRET is not configured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    type?: string;
    to?: string;
    body?: string;
    templateVars?: Record<string, string | undefined>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, to, body: explicitBody, templateVars } = body;
  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'Missing to (E.164 phone)' }, { status: 400 });
  }
  if (!type || !isSmsType(type)) {
    return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
  }

  const text =
    explicitBody && explicitBody.trim().length > 0
      ? explicitBody.trim()
      : buildSmsBody(type, templateVars || {});

  try {
    const result = await sendSmsWithRetry({ to, body: text, type });
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'SMS send failed';
    console.error('POST /api/sms/send:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
