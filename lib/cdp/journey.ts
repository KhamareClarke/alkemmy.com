import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

export interface RecordJourneyInput {
  userId?: string | null;
  guestEmail?: string | null;
  eventType: string;
  eventCategory?: string;
  title?: string;
  payload?: Record<string, unknown>;
  orderId?: string | null;
  pageUrl?: string | null;
}

export async function recordCustomerJourneyEvent(input: RecordJourneyInput): Promise<void> {
  const { error } = await adminSupabase.from('customer_journey_events').insert({
    user_id: input.userId || null,
    guest_email: input.guestEmail?.trim() || null,
    event_type: input.eventType,
    event_category: input.eventCategory ?? null,
    title: input.title ?? null,
    payload: input.payload ?? {},
    order_id: input.orderId ?? null,
    page_url: input.pageUrl ?? null,
  });
  if (error) {
    console.error('[cdp] journey insert:', error.message);
  }
}

export async function listCustomerJourneyEvents(
  userId: string,
  limit = 100
): Promise<{ id: string; event_type: string; title: string | null; created_at: string; payload: unknown }[]> {
  const { data, error } = await adminSupabase
    .from('customer_journey_events')
    .select('id, event_type, title, created_at, payload')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[cdp] journey list:', error.message);
    return [];
  }
  return (data || []) as { id: string; event_type: string; title: string | null; created_at: string; payload: unknown }[];
}
