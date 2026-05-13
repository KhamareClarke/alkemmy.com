import 'server-only';

import { adminSupabase } from '@/lib/admin-supabase';

export interface CustomerLtvPrediction {
  currentLtv: number;
  predictedLtv: number;
  potentialLtv: number;
  recommendation: string;
}

/**
 * Heuristic CLV from `customer_profiles` + recent order velocity (not a trained ML model).
 *
 * @returns `currentLtv` — realized revenue to date; `predictedLtv` — naive 12‑month extrapolation;
 *          `potentialLtv` — upside if segment re-engages; `recommendation` — short playbook string.
 */
export async function predictCustomerLTV(userId: string): Promise<CustomerLtvPrediction> {
  const { data: profile } = await adminSupabase
    .from('customer_profiles')
    .select('total_lifetime_value, total_orders, last_order_date, segment')
    .eq('user_id', userId)
    .maybeSingle();

  const currentLtv = Number(profile?.total_lifetime_value ?? 0);
  const totalOrders = Number(profile?.total_orders ?? 0);
  const segment = profile?.segment as string | null | undefined;

  const { data: recent } = await adminSupabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(6);

  const rows = recent || [];
  const last90 = rows.filter((o: { created_at: string }) => {
    const t = new Date(o.created_at).getTime();
    return Date.now() - t < 90 * 86400 * 1000;
  });
  const spend90 = last90.reduce((s: number, o: { total_amount: number }) => s + Number(o.total_amount || 0), 0);

  const monthsActive = Math.max(1, totalOrders > 0 ? Math.min(24, totalOrders) : 1);
  const runRate = spend90 > 0 ? spend90 / 3 : currentLtv / monthsActive;
  const predictedLtv = Math.round((currentLtv + runRate * 12) * 100) / 100;
  const uplift = segment === 'dormant' ? 0.15 : segment === 'at_risk' ? 0.25 : 0.4;
  const potentialLtv = Math.round(currentLtv * (1 + uplift) * 100) / 100;

  let recommendation =
    'Maintain email cadence and post-purchase education to protect repeat rate.';
  if (segment === 'dormant') {
    recommendation = 'Run a win-back offer and survey; CLV recovery needs reactivation within 30 days.';
  } else if (segment === 'at_risk') {
    recommendation = 'Trigger loyalty points or replenishment reminders; engagement dropped.';
  } else if (segment === 'vip' || currentLtv >= 800) {
    recommendation = 'Prioritize concierge support and early access drops to maximize advocacy.';
  } else if (totalOrders <= 1) {
    recommendation = 'Focus on second purchase within 45 days (bundles, samples).';
  }

  return {
    currentLtv,
    predictedLtv,
    potentialLtv,
    recommendation,
  };
}
