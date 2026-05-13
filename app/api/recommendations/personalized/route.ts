import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCollaborativeRecommendations, getPersonalizedRecommendations } from '@/lib/recommendations/personalized';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const token = auth.slice(7);
  const supabase = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get('mode') || 'personalized';
  try {
    const items =
      mode === 'collaborative'
        ? await getCollaborativeRecommendations(user.id, 8)
        : await getPersonalizedRecommendations(user.id, 8);
    return NextResponse.json({ items, mode });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load recommendations' }, { status: 500 });
  }
}
