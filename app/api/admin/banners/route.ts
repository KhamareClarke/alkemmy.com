import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('promotional_banners')
      .select('*')
      .order('order_priority', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const enriched = (data || []).map((b: any) => {
      const views = Number(b.view_count || 0);
      const clicks = Number(b.click_count || 0);
      const ctr = views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0;
      return { ...b, ctr_percent: ctr };
    });
    return NextResponse.json({ banners: enriched });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const { data, error } = await adminSupabase
      .from('promotional_banners')
      .insert({
        title: String(b.title),
        description: b.description || null,
        image_url: b.image_url || null,
        cta_text: b.cta_text || null,
        cta_link: b.cta_link || null,
        background_color: b.background_color || null,
        text_color: b.text_color || null,
        start_date: b.start_date || null,
        end_date: b.end_date || null,
        status: ['active', 'inactive', 'scheduled'].includes(b.status) ? b.status : 'active',
        placement: ['hero', 'sidebar', 'footer', 'announcement_bar'].includes(b.placement)
          ? b.placement
          : 'announcement_bar',
        order_priority: b.order_priority != null ? Number(b.order_priority) : 0,
      })
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ banner: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
