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
    if (b.code != null) patch.code = String(b.code).trim().toUpperCase();
    if (b.type != null) patch.type = b.type === 'fixed' ? 'fixed' : 'percentage';
    if (b.value != null) patch.value = Number(b.value);
    if (b.max_uses !== undefined) patch.max_uses = b.max_uses;
    if (b.expiry_date !== undefined) patch.expiry_date = b.expiry_date;
    if (b.applicable_categories != null) patch.applicable_categories = b.applicable_categories;
    if (b.minimum_order_amount != null) patch.minimum_order_amount = Number(b.minimum_order_amount);
    if (b.status != null) patch.status = b.status;

    const { data, error } = await adminSupabase
      .from('discount_codes')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ discount: data });
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
    const { error } = await adminSupabase.from('discount_codes').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
