import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics/server-events';

const bodySchema = z.object({
  event_name: z.string().min(1).max(128),
  event_category: z.string().max(64).optional().nullable(),
  event_value: z.number().optional().nullable(),
  event_properties: z.record(z.unknown()).optional(),
  session_id: z.string().max(128).optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  page_url: z.string().max(2000).optional().nullable(),
  referrer: z.string().max(2000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const secret = process.env.ANALYTICS_INGEST_SECRET?.trim();
  if (secret) {
    const h = request.headers.get('x-analytics-secret');
    if (h !== secret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const b = parsed.data;
  await recordAnalyticsEvent({
    eventName: b.event_name,
    eventCategory: b.event_category ?? undefined,
    eventValue: b.event_value ?? undefined,
    eventProperties: b.event_properties ?? {},
    sessionId: b.session_id ?? undefined,
    userId: b.user_id ?? undefined,
    pageUrl: b.page_url ?? request.headers.get('referer'),
    referrer: b.referrer ?? request.headers.get('referer'),
  });

  return NextResponse.json({ ok: true });
}
