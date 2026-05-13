import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: orderAgg, error: aggErr } = await adminSupabase
      .from('orders')
      .select('discount_code_id, discount_amount, total_amount')
      .not('discount_code_id', 'is', null);

    const revenueByCode: Record<string, number> = {};
    const usesFromOrders: Record<string, number> = {};
    if (!aggErr && orderAgg) {
      for (const o of orderAgg as any[]) {
        if (!o.discount_code_id) continue;
        usesFromOrders[o.discount_code_id] = (usesFromOrders[o.discount_code_id] || 0) + 1;
        revenueByCode[o.discount_code_id] =
          (revenueByCode[o.discount_code_id] || 0) + Number(o.total_amount || 0);
      }
    }

    const enriched = (data || []).map((row: any) => ({
      ...row,
      orders_with_code: usesFromOrders[row.id] || 0,
      revenue_on_discounted_orders: Math.round((revenueByCode[row.id] || 0) * 100) / 100,
    }));

    return NextResponse.json({ discounts: enriched });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const code = String(b.code || '').trim().toUpperCase();
    const type = b.type === 'fixed' ? 'fixed' : 'percentage';
    const value = Number(b.value);
    const maxUses = b.max_uses != null ? parseInt(String(b.max_uses), 10) : null;
    const expiryDate = b.expiry_date ? String(b.expiry_date) : null;
    const applicableCategories = Array.isArray(b.applicable_categories)
      ? b.applicable_categories.map((x: unknown) => String(x))
      : [];
    const minimumOrderAmount = b.minimum_order_amount != null ? Number(b.minimum_order_amount) : 0;
    const status = ['active', 'inactive', 'expired'].includes(b.status) ? b.status : 'active';
    const createdBy = b.created_by ? String(b.created_by) : null;

    if (!code || !Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: 'Invalid code or value' }, { status: 400 });
    }
    if (type === 'percentage' && value > 100) {
      return NextResponse.json({ error: 'Percentage cannot exceed 100' }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('discount_codes')
      .insert({
        code,
        type,
        value,
        max_uses: maxUses,
        expiry_date: expiryDate,
        applicable_categories: applicableCategories,
        minimum_order_amount: minimumOrderAmount,
        status,
        created_by: createdBy,
      })
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
