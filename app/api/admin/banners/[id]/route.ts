import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const b = await request.json();
    const patch: Record<string, unknown> = {};
    const keys = [
      'title',
      'description',
      'image_url',
      'cta_text',
      'cta_link',
      'background_color',
      'text_color',
      'start_date',
      'end_date',
      'status',
      'placement',
      'order_priority',
    ] as const;
    for (const k of keys) {
      if (b[k] !== undefined) patch[k] = b[k];
    }
    const { data, error } = await adminSupabase
      .from('promotional_banners')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ banner: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { error } = await adminSupabase.from('promotional_banners').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
