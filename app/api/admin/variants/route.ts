import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 });
  }
  const baseId = productId.split('::')[0];
  const [optRes, varRes] = await Promise.all([
    adminSupabase
      .from('variant_options')
      .select('*')
      .eq('product_id', baseId)
      .order('option_order', { ascending: true }),
    adminSupabase
      .from('product_variants')
      .select('*')
      .eq('product_id', baseId)
      .order('created_at', { ascending: true }),
  ]);
  if (optRes.error) {
    return NextResponse.json({ error: optRes.error.message }, { status: 500 });
  }
  if (varRes.error) {
    return NextResponse.json({ error: varRes.error.message }, { status: 500 });
  }
  return NextResponse.json({ options: optRes.data || [], variants: varRes.data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const kind = body.kind === 'option' ? 'option' : 'variant';

    if (kind === 'option') {
      const { data, error } = await adminSupabase
        .from('variant_options')
        .insert({
          product_id: String(body.product_id).split('::')[0],
          option_name: String(body.option_name),
          option_values: Array.isArray(body.option_values) ? body.option_values.map(String) : [],
          option_order: body.option_order != null ? Number(body.option_order) : 0,
        })
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ option: data });
    }

    const { data, error } = await adminSupabase
      .from('product_variants')
      .insert({
        product_id: String(body.product_id).split('::')[0],
        sku: String(body.sku),
        option_values: body.option_values && typeof body.option_values === 'object' ? body.option_values : {},
        price: body.price != null ? Number(body.price) : null,
        image_url: body.image_url || null,
        stock: body.stock != null ? Number(body.stock) : 0,
        weight: body.weight != null ? Number(body.weight) : null,
      })
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ variant: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const kind = body.kind === 'option' ? 'option' : 'variant';
    const id = String(body.id);
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (kind === 'option') {
      const patch: Record<string, unknown> = {};
      if (body.option_name != null) patch.option_name = body.option_name;
      if (body.option_values != null) patch.option_values = body.option_values;
      if (body.option_order != null) patch.option_order = Number(body.option_order);
      const { data, error } = await adminSupabase
        .from('variant_options')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ option: data });
    }

    const patch: Record<string, unknown> = {};
    if (body.sku != null) patch.sku = body.sku;
    if (body.option_values != null) patch.option_values = body.option_values;
    if (body.price !== undefined) patch.price = body.price;
    if (body.image_url !== undefined) patch.image_url = body.image_url;
    if (body.stock != null) patch.stock = Number(body.stock);
    if (body.weight !== undefined) patch.weight = body.weight;

    const { data, error } = await adminSupabase
      .from('product_variants')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ variant: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const kind = request.nextUrl.searchParams.get('kind') || 'variant';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const table = kind === 'option' ? 'variant_options' : 'product_variants';
  const { error } = await adminSupabase.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
