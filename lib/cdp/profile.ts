import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';
import type { CustomerSegment, LifetimeTier } from './types';

function tierFromLtv(ltv: number): LifetimeTier {
  if (ltv >= 1500) return 'platinum';
  if (ltv >= 500) return 'gold';
  if (ltv >= 200) return 'silver';
  return 'bronze';
}

function segmentFromOrders(
  totalOrders: number,
  lastOrder: Date | null,
  ltv: number
): CustomerSegment {
  if (ltv >= 800 || totalOrders >= 10) return 'vip';
  const now = Date.now();
  if (!lastOrder) return 'new';
  const days = (now - lastOrder.getTime()) / (86400 * 1000);
  if (totalOrders <= 1 && days < 45) return 'new';
  if (days > 180) return 'dormant';
  if (days > 90) return 'at_risk';
  if (totalOrders >= 3) return 'loyal';
  return 'at_risk';
}

function churnRisk(lastOrder: Date | null, totalOrders: number): number | null {
  if (!lastOrder || totalOrders === 0) return null;
  const days = (Date.now() - lastOrder.getTime()) / (86400 * 1000);
  const base = Math.min(1, days / 365);
  return Math.round(base * 1000) / 1000;
}

/** Recompute rollup from non-cancelled orders for a user. */
export async function refreshCustomerProfileFromOrders(userId: string): Promise<void> {
  const { data: orders, error } = await adminSupabase
    .from('orders')
    .select('total_amount, created_at, payment_status, status')
    .eq('user_id', userId)
    .neq('status', 'cancelled');

  if (error) {
    console.error('[cdp] profile orders:', error.message);
    return;
  }

  const rows = orders || [];
  const completed = rows;
  const amounts = completed.map((o: { total_amount: number }) => Number(o.total_amount) || 0);
  const ltv = amounts.reduce((a, b) => a + b, 0);
  const totalOrders = completed.length;
  const aov = totalOrders > 0 ? ltv / totalOrders : 0;
  const last = completed
    .map((o: { created_at: string }) => new Date(o.created_at))
    .sort((a, b) => b.getTime() - a.getTime())[0] || null;

  const segment = segmentFromOrders(totalOrders, last, ltv);
  const lifetime_tier = tierFromLtv(ltv);
  const predicted_churn_risk = churnRisk(last, totalOrders);

  const { error: upsertError } = await adminSupabase.from('customer_profiles').upsert(
    {
      user_id: userId,
      total_lifetime_value: ltv,
      total_orders: totalOrders,
      average_order_value: aov,
      last_order_date: last ? last.toISOString() : null,
      segment,
      lifetime_tier,
      predicted_churn_risk,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    console.error('[cdp] profile upsert:', upsertError.message);
  }
}
