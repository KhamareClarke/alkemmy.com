import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due';
export type SubscriptionCadence = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
export type SubscriptionOrderStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'skipped';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan_name: string;
  cadence: SubscriptionCadence;
  recurring_total_amount: number;
  currency: string;
  items: unknown;
  next_bill_at: string;
  last_bill_at: string | null;
  failure_count: number;
}

function addCadence(d: Date, cadence: SubscriptionCadence): Date {
  const out = new Date(d);
  const days =
    cadence === 'weekly'
      ? 7
      : cadence === 'biweekly'
        ? 14
        : cadence === 'monthly'
          ? 30
          : 90;
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

export async function createSubscription(input: {
  userId: string;
  planName: string;
  cadence: SubscriptionCadence;
  recurringTotalAmount: number;
  currency?: string;
  items: unknown[];
  defaultAddressId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<{ id: string } | { error: string }> {
  const next = addCadence(new Date(), input.cadence);
  const { data, error } = await adminSupabase
    .from('subscriptions')
    .insert({
      user_id: input.userId,
      status: 'active',
      plan_name: input.planName,
      cadence: input.cadence,
      recurring_total_amount: input.recurringTotalAmount,
      currency: input.currency ?? 'GBP',
      items: input.items,
      default_address_id: input.defaultAddressId ?? null,
      stripe_customer_id: input.stripeCustomerId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      next_bill_at: next.toISOString(),
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message || 'insert failed' };
  return { id: data.id };
}

export async function pauseSubscription(subscriptionId: string): Promise<void> {
  await adminSupabase
    .from('subscriptions')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', subscriptionId);
}

export async function resumeSubscription(subscriptionId: string): Promise<void> {
  await adminSupabase
    .from('subscriptions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', subscriptionId);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await adminSupabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);
}

/** Increments failure_count; sets `past_due` after 3 failures. Does not advance billing dates. */
export async function recordSubscriptionPaymentFailure(subscriptionId: string): Promise<void> {
  const { data: row } = await adminSupabase.from('subscriptions').select('failure_count').eq('id', subscriptionId).single();
  const fc = (row?.failure_count ?? 0) + 1;
  const status: SubscriptionStatus = fc >= 3 ? 'past_due' : 'active';
  await adminSupabase
    .from('subscriptions')
    .update({
      failure_count: fc,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

}

function billingShouldFail(): boolean {
  return process.env.SUBSCRIPTION_BILLING_MODE === 'fail';
}

/**
 * Cron: pick due active subscriptions, run a billing attempt, roll `next_bill_at` forward.
 * Wire Stripe/off-session charge in place of the simulated outcome when ready.
 */
export async function processDueSubscriptions(now = new Date()): Promise<{
  processed: number;
  failed: number;
  ids: string[];
}> {
  const iso = now.toISOString();
  const { data: due, error } = await adminSupabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('next_bill_at', iso)
    .limit(50);

  if (error || !due?.length) {
    return { processed: 0, failed: 0, ids: [] };
  }

  let processed = 0;
  let failed = 0;
  const ids: string[] = [];

  for (const sub of due as Record<string, unknown>[]) {
    const id = String(sub.id);
    ids.push(id);
    const amount = Number(sub.recurring_total_amount) || 0;
    const cadence = sub.cadence as SubscriptionCadence;
    const nextBillAt = new Date(String(sub.next_bill_at));
    const periodStart = sub.last_bill_at ? new Date(String(sub.last_bill_at)) : new Date(String(sub.created_at));
    const periodEnd = nextBillAt;

    if (billingShouldFail()) {
      await adminSupabase.from('subscription_orders').insert({
        subscription_id: id,
        order_id: null,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        amount,
        status: 'failed',
        failure_reason: 'billing_failed',
      });
      await recordSubscriptionPaymentFailure(id);
      failed += 1;
      continue;
    }

    await adminSupabase.from('subscription_orders').insert({
      subscription_id: id,
      order_id: null,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      amount,
      status: 'paid',
    });

    const next = addCadence(nextBillAt, cadence);
    await adminSupabase
      .from('subscriptions')
      .update({
        last_bill_at: now.toISOString(),
        next_bill_at: next.toISOString(),
        failure_count: 0,
        updated_at: now.toISOString(),
      })
      .eq('id', id);

    void import('@/lib/cdp/journey')
      .then((m) =>
        m.recordCustomerJourneyEvent({
          userId: String(sub.user_id),
          eventType: 'subscription_billed',
          eventCategory: 'commerce',
          title: `Subscription billed: ${sub.plan_name}`,
          payload: { subscription_id: id, amount },
        })
      )
      .catch(() => {});

    processed += 1;
  }

  return { processed, failed, ids };
}
