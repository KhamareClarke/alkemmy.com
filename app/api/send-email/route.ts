import { NextRequest, NextResponse } from 'next/server';
import { sendRawEmailSafe } from '@/lib/email/send-core';
import { getFromEmail } from '@/lib/email/smtp';

export async function POST(request: NextRequest) {
  let parsed: {
    to?: string;
    subject?: string;
    body?: string;
    from?: string;
    emailType?: string;
  };

  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { to, subject, body, from, emailType = 'custom' } = parsed;

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sendRawEmailSafe({
      to,
      subject,
      html: body.replace(/\n/g, '<br>'),
      text: body,
      emailType,
      fromOverride: from,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('POST /api/send-email:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
