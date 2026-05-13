import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const placement = request.nextUrl.searchParams.get('placement');
    let q = supabase
      .from('promotional_banners')
      .select('*')
      .order('order_priority', { ascending: false });

    if (placement) {
      q = q.eq('placement', placement);
    }

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ error: error.message, banners: [] }, { status: 200 });
    }
    return NextResponse.json({ banners: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ banners: [] }, { status: 200 });
  }
}
