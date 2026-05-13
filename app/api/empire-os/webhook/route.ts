import { NextRequest, NextResponse } from 'next/server';
import { getEmpireInboundSecret } from '@/lib/empire-os/config';
import { recordEmpireEvent } from '@/lib/empire-os/emit';
import { isSkillId, type EmpireEventType } from '@/lib/empire-os/types';

/**
 * Inbound webhook for Empire OS / external automation.
 * Secured with Authorization: Bearer EMPIRE_OS_INBOUND_SECRET
 */
export async function POST(request: NextRequest) {
  const secret = getEmpireInboundSecret();
  if (!secret) {
    return NextResponse.json({ error: 'EMPIRE_OS_INBOUND_SECRET not configured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const skillRaw = typeof body.skillId === 'string' ? body.skillId : undefined;
  const skillId = skillRaw && isSkillId(skillRaw) ? skillRaw : undefined;

  const eventType = (
    typeof body.eventType === 'string' ? body.eventType : 'webhook.inbound'
  ) as EmpireEventType;

  const { correlationId } = await recordEmpireEvent({
    skillId,
    eventType,
    source: typeof body.source === 'string' ? body.source : 'external',
    data: body,
  });

  return NextResponse.json({ ok: true, correlationId });
}
