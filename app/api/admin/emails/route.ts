import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET() {
  try {
    const { data: emails, error } = await adminSupabase
      .from('emails')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to load emails' }, { status: 500 });
    }

    return NextResponse.json({ emails: emails || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




