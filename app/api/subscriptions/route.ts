import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSubscription } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

function userClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const client = userClient(token);
  const {
    data: { user },
    error: authErr,
  } = await client.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const planName = String(body.plan_name || body.planName || '').trim();
  const cadence = String(body.cadence || 'monthly') as 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  const recurringTotalAmount = Number(body.recurring_total_amount ?? body.amount);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!planName || !Number.isFinite(recurringTotalAmount) || recurringTotalAmount < 0) {
    return NextResponse.json({ error: 'Invalid plan_name or recurring_total_amount' }, { status: 400 });
  }
  if (!['weekly', 'biweekly', 'monthly', 'quarterly'].includes(cadence)) {
    return NextResponse.json({ error: 'Invalid cadence' }, { status: 400 });
  }

  const res = await createSubscription({
    userId: user.id,
    planName,
    cadence,
    recurringTotalAmount,
    currency: body.currency ? String(body.currency) : 'GBP',
    items,
    defaultAddressId: body.default_address_id ? String(body.default_address_id) : null,
    stripeCustomerId: body.stripe_customer_id ? String(body.stripe_customer_id) : null,
    stripeSubscriptionId: body.stripe_subscription_id ? String(body.stripe_subscription_id) : null,
  });

  if ('error' in res) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({ subscriptionId: res.id });
}
