import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase } from '@/lib/admin-supabase';

const bodySchema = z.object({
  article_id: z.string().uuid(),
  is_helpful: z.boolean(),
  comment: z.string().max(2000).optional(),
  session_id: z.string().max(128).optional(),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { article_id, is_helpful, comment, session_id } = parsed.data;

  const { data: art, error: artErr } = await adminSupabase
    .from('help_articles')
    .select('id, helpful_count, not_helpful_count')
    .eq('id', article_id)
    .eq('status', 'published')
    .maybeSingle();
  if (artErr || !art) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const { error: insErr } = await adminSupabase.from('help_feedback').insert({
    article_id,
    is_helpful,
    comment: comment ?? null,
    session_id: session_id ?? null,
    user_id: null,
  });
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  await adminSupabase
    .from('help_articles')
    .update({
      helpful_count: (art.helpful_count || 0) + (is_helpful ? 1 : 0),
      not_helpful_count: (art.not_helpful_count || 0) + (is_helpful ? 0 : 1),
      updated_at: new Date().toISOString(),
    })
    .eq('id', article_id);

  return NextResponse.json({ ok: true });
}
