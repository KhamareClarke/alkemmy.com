import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';
import { validateDiscountCodeRow } from '@/lib/discounts/validate-code';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.code || '').trim();
    const subtotal = Number(body.subtotal);
    const categories = Array.isArray(body.categories)
      ? body.categories.map((c: unknown) => String(c))
      : [];

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: 'Valid subtotal is required' }, { status: 400 });
    }

    const norm = code.toUpperCase();
    const { data: row, error } = await adminSupabase
      .from('discount_codes')
      .select('*')
      .eq('code', norm)
      .maybeSingle();

    if (error) {
      console.error('discount validate fetch', error);
      return NextResponse.json({ error: 'Unable to validate code' }, { status: 500 });
    }

    const result = validateDiscountCodeRow(row, subtotal, categories);
    if (!result.ok) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      discountCodeId: result.result.codeRow.id,
      code: result.result.codeRow.code,
      type: result.result.codeRow.type,
      value: result.result.codeRow.value,
      discountAmount: result.result.discountAmount,
      discountedSubtotal: result.result.discountedSubtotal,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
