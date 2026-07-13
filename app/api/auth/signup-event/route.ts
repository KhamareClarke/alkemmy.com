import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';

/** Fire-and-forget fleet notify after successful client-side Supabase signUp. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 });
    }

    const name = [firstName, lastName].filter(Boolean).join(' ') || email;

    void emitFleetIngest({
      event_type: 'signup',
      summary: `New signup: ${name} (${email})`,
      payload: { email, firstName, lastName },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
