import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

/**
 * Twilio SMS status callbacks (application/x-www-form-urlencoded).
 * Optional: set TWILIO_AUTH_TOKEN and validate with Twilio signature.
 * GHL / other providers: extend with separate secret header checks if needed.
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = await request.formData();
    const payload: Record<string, string> = {};
    params.forEach((v, k) => {
      if (typeof v === 'string') payload[k] = v;
    });

    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const signature = request.headers.get('x-twilio-signature');
    const url = process.env.TWILIO_WEBHOOK_PUBLIC_URL?.trim();

    if (authToken && signature && url) {
      const valid = twilio.validateRequest(authToken, signature, url, payload);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const sid = payload.MessageSid || payload.SmsSid;
    const status = payload.MessageStatus || payload.SmsStatus;
    console.log('[sms webhook twilio]', JSON.stringify({ sid, status, to: payload.To }));

    return new NextResponse(null, { status: 204 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  console.log('[sms webhook]', JSON.stringify(json));
  return NextResponse.json({ ok: true });
}
