import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

const POINTS_PER_CURRENCY_UNIT = 1;
const POINTS_PER_DISCOUNT_UNIT = 100;

function tierFromLifetimeEarned(lifetime: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (lifetime >= 5000) return 'platinum';
  if (lifetime >= 2000) return 'gold';
  if (lifetime >= 500) return 'silver';
  return 'bronze';
}

export async function getLoyaltyBalance(userId: string): Promise<{ balance: number; tier: string; lifetime_earned: number } | null> {
  const { data, error } = await adminSupabase.from('customer_loyalty_points').select('*').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return {
    balance: data.balance,
    tier: data.tier,
    lifetime_earned: data.lifetime_earned,
  };
}

/** $1 = 1 point (configurable constants above). Idempotent per order via partial unique index. */
export async function awardLoyaltyPointsForPaidOrder(userId: string, orderId: string, orderTotal: number): Promise<void> {
  const points = Math.max(0, Math.floor(orderTotal * POINTS_PER_CURRENCY_UNIT));
  if (points <= 0) return;

  const { data: existing } = await adminSupabase
    .from('loyalty_transactions')
    .select('id')
    .eq('order_id', orderId)
    .eq('reason', 'order_payment')
    .maybeSingle();
  if (existing) return;

  const { data: row } = await adminSupabase.from('customer_loyalty_points').select('*').eq('user_id', userId).maybeSingle();
  const balance = (row?.balance ?? 0) + points;
  const lifetime_earned = (row?.lifetime_earned ?? 0) + points;
  const tier = tierFromLifetimeEarned(lifetime_earned);

  await adminSupabase.from('customer_loyalty_points').upsert(
    {
      user_id: userId,
      balance,
      lifetime_earned,
      lifetime_redeemed: row?.lifetime_redeemed ?? 0,
      tier,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  await adminSupabase.from('loyalty_transactions').insert({
    user_id: userId,
    points_delta: points,
    balance_after: balance,
    reason: 'order_payment',
    order_id: orderId,
    metadata: { order_total: orderTotal },
  });
}

/** 100 points = $1 discount → returns max discount in currency for current balance. */
export function pointsToDiscountValue(points: number): number {
  return Math.floor(points / POINTS_PER_DISCOUNT_UNIT);
}

export function discountValueToPoints(amount: number): number {
  return Math.ceil(amount * POINTS_PER_DISCOUNT_UNIT);
}

export async function redeemLoyaltyPointsForDiscount(
  userId: string,
  pointsToSpend: number,
  orderId?: string | null
): Promise<{ ok: boolean; newBalance?: number; error?: string }> {
  if (pointsToSpend <= 0 || pointsToSpend % POINTS_PER_DISCOUNT_UNIT !== 0) {
    return { ok: false, error: 'Points must be a multiple of 100 for redemption' };
  }

  const { data: row } = await adminSupabase.from('customer_loyalty_points').select('*').eq('user_id', userId).maybeSingle();
  if (!row || row.balance < pointsToSpend) {
    return { ok: false, error: 'Insufficient points' };
  }

  const balance = row.balance - pointsToSpend;
  const lifetime_redeemed = row.lifetime_redeemed + pointsToSpend;

  await adminSupabase
    .from('customer_loyalty_points')
    .update({ balance, lifetime_redeemed, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await adminSupabase.from('loyalty_transactions').insert({
    user_id: userId,
    points_delta: -pointsToSpend,
    balance_after: balance,
    reason: 'redeem_discount',
    order_id: orderId ?? null,
    metadata: {},
  });

  return { ok: true, newBalance: balance };
}
