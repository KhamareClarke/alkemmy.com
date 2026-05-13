import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

const CHECKOUT_FUNNEL = [
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'add_shipping_info',
  'add_payment_info',
  'purchase',
] as const;

export interface FunnelStepCount {
  step: string;
  count: number;
}

export interface FunnelReport {
  steps: FunnelStepCount[];
  conversionRateViewToPurchase: number | null;
  dropoff: FunnelStepCount[];
}

/**
 * Checkout funnel from first-party `analytics_events` (last `windowHours`).
 * Requires events ingested with GA4-aligned names.
 */
export async function getCheckoutFunnelReport(windowHours = 168): Promise<FunnelReport> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const empty: FunnelReport = {
    steps: CHECKOUT_FUNNEL.map((s) => ({ step: s, count: 0 })),
    conversionRateViewToPurchase: null,
    dropoff: [],
  };

  try {
    const { data, error } = await adminSupabase
      .from('analytics_events')
      .select('event_name')
      .gte('created_at', since)
      .in('event_name', [...CHECKOUT_FUNNEL]);

    if (error || !data) return empty;

    const counts = new Map<string, number>();
    for (const row of data as { event_name: string }[]) {
      counts.set(row.event_name, (counts.get(row.event_name) || 0) + 1);
    }

    const steps = CHECKOUT_FUNNEL.map((step) => ({
      step,
      count: counts.get(step) || 0,
    }));

    const view = steps[0]?.count || 0;
    const purchase = steps[steps.length - 1]?.count || 0;
    const conversionRateViewToPurchase =
      view > 0 ? Math.round((purchase / view) * 10000) / 100 : null;

    const dropoff: FunnelStepCount[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const a = steps[i].count;
      const b = steps[i + 1].count;
      if (a > b) dropoff.push({ step: `${steps[i].step}→${steps[i + 1].step}`, count: a - b });
    }

    return { steps, conversionRateViewToPurchase, dropoff };
  } catch {
    return empty;
  }
}
