import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { adminSupabase } from '@/lib/admin-supabase';
import { cancelSubscription, pauseSubscription, resumeSubscription } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

function userClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
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

  const { data: sub, error: subErr } = await adminSupabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('id', id)
    .single();
  if (subErr || !sub || sub.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const action = String(body.action || '').toLowerCase();
  if (action === 'pause') await pauseSubscription(id);
  else if (action === 'resume') await resumeSubscription(id);
  else if (action === 'cancel') await cancelSubscription(id);
  else {
    return NextResponse.json({ error: 'action must be pause, resume, or cancel' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
