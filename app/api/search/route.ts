import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search/algolia';
import type { Product } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  if (!q.trim()) {
    return NextResponse.json({ hits: [], source: 'none' });
  }

  try {
    const { hits, source } = await searchProducts(q, { hitsPerPage: 24 });
    if (source === 'supabase') {
      return NextResponse.json({ hits: hits as Product[], source });
    }
    return NextResponse.json({ hits, source });
  } catch (e) {
    console.error('[search]', e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
