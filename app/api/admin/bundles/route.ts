import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: bundles, error } = await adminSupabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bundles:', error);
      return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
    }

    return NextResponse.json({ bundles });
  } catch (error) {
    console.error('Error in admin bundles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: bundle, error } = await adminSupabase
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
    console.error('Error in admin bundles POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




