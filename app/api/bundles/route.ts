import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('bundles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (limit && parseInt(limit) > 0) {
      query = query.limit(parseInt(limit));
    }

    const { data: bundles, error } = await query;

    if (error) {
      console.error('Error fetching bundles:', error);
      return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
    }

    return NextResponse.json({ bundles });
  } catch (error) {
    console.error('Error in bundles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: bundle, error } = await supabase
      .from('bundles')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating bundle:', error);
      return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error('Error in bundles POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

