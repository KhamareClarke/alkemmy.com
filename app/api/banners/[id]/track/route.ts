import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const type = body.type === 'click' ? 'click' : 'view';

    const col = type === 'click' ? 'click_count' : 'view_count';
    const { data: row, error: fe } = await adminSupabase
      .from('promotional_banners')
      .select('view_count, click_count')
      .eq('id', id)
      .maybeSingle();
    if (fe || !row) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    const nextVal = (Number((row as any)[col]) || 0) + 1;
    const { error: up } = await adminSupabase
      .from('promotional_banners')
      .update({ [col]: nextVal })
      .eq('id', id);
    if (up) {
      return NextResponse.json({ error: up.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'track failed' }, { status: 500 });
  }
}
