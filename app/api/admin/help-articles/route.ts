import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET() {
  const { data: categories } = await adminSupabase.from('help_categories').select('*').order('sort_order');
  const { data: articles, error } = await adminSupabase
    .from('help_articles')
    .select('*, help_categories(slug, title)')
    .order('updated_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ categories: categories || [], articles: articles || [] });
}

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const slug = String(b.slug || '').trim().toLowerCase().replace(/\s+/g, '-');
    const title = String(b.title || '').trim();
    const body = String(b.body || '');
    const excerpt = b.excerpt != null ? String(b.excerpt) : null;
    const status = b.status === 'published' ? 'published' : 'draft';
    const category_id = b.category_id ? String(b.category_id) : null;
    const published_at = status === 'published' ? new Date().toISOString() : null;

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug and title required' }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('help_articles')
      .insert({
        slug,
        title,
        body,
        excerpt,
        status,
        category_id,
        published_at,
      })
      .select('id')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const b = await request.json();
    const id = String(b.id || '');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (b.title != null) patch.title = String(b.title);
    if (b.body != null) patch.body = String(b.body);
    if (b.excerpt !== undefined) patch.excerpt = b.excerpt == null ? null : String(b.excerpt);
    if (b.status === 'published' || b.status === 'draft') {
      patch.status = b.status;
      if (b.status === 'published') patch.published_at = new Date().toISOString();
    }
    if (b.category_id !== undefined) patch.category_id = b.category_id || null;

    const { error } = await adminSupabase.from('help_articles').update(patch).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
