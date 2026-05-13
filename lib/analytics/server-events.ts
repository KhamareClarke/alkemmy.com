import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

export interface RecordAnalyticsEventInput {
  userId?: string | null;
  sessionId?: string | null;
  eventName: string;
  eventCategory?: string | null;
  eventValue?: number | null;
  eventProperties?: Record<string, unknown>;
  pageUrl?: string | null;
  referrer?: string | null;
}

export async function recordAnalyticsEvent(input: RecordAnalyticsEventInput): Promise<void> {
  try {
    await adminSupabase.from('analytics_events').insert({
      user_id: input.userId ?? null,
      session_id: input.sessionId ?? null,
      event_name: input.eventName,
      event_category: input.eventCategory ?? null,
      event_value: input.eventValue ?? null,
      event_properties: input.eventProperties ?? {},
      page_url: input.pageUrl ?? null,
      referrer: input.referrer ?? null,
    });
  } catch (e) {
    console.warn('[analytics] recordAnalyticsEvent:', e);
  }
}
