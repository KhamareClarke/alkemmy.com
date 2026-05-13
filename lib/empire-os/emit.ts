import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';
import type { EmpireEventPayload, SkillId } from './types';
import { getEmpireOutboundWebhookUrls } from './config';
import { deliverToAllUrls } from './webhook-outbound';

function newCorrelationId(): string {
  return `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function recordEmpireEvent(payload: EmpireEventPayload): Promise<{ correlationId: string }> {
  const correlationId = payload.correlationId || newCorrelationId();
  const enriched = { ...payload, correlationId, emittedAt: new Date().toISOString() };

  try {
    await adminSupabase.from('empire_os_events').insert({
      skill_id: payload.skillId ?? null,
      event_type: payload.eventType,
      payload: enriched as unknown as Record<string, unknown>,
      correlation_id: correlationId,
    });
  } catch (e) {
    console.warn('[empire-os] empire_os_events insert skipped or failed:', e);
  }

  return { correlationId };
}

/**
 * Record an Empire OS event (best-effort Supabase) and fan-out to outbound webhooks with retries.
 */
export async function emitEmpireEvent(payload: EmpireEventPayload): Promise<{
  correlationId: string;
  delivery: Awaited<ReturnType<typeof deliverToAllUrls>>;
}> {
  const { correlationId } = await recordEmpireEvent(payload);
  const enriched = { ...payload, correlationId, emittedAt: new Date().toISOString() };

  const urls = getEmpireOutboundWebhookUrls();
  const auth = process.env.EMPIRE_OS_OUTBOUND_AUTH?.trim();
  const extraHeaders: Record<string, string> = {};
  if (auth) {
    if (auth.startsWith('Bearer ')) extraHeaders.Authorization = auth;
    else extraHeaders.Authorization = `Bearer ${auth}`;
  }
  const delivery =
    urls.length > 0 ? await deliverToAllUrls(urls, { type: 'empire_os.event', ...enriched }, extraHeaders) : [];

  if (urls.length > 0) {
    console.log(
      '[empire-os] outbound',
      JSON.stringify({ correlationId, ok: delivery.filter((d) => d.ok).length, total: delivery.length })
    );
  }

  return { correlationId, delivery };
}

export async function emitSkillSignal(
  skillId: SkillId,
  data: Record<string, unknown>,
  source = 'alkhemmy-core'
): Promise<{ correlationId: string }> {
  const { correlationId } = await emitEmpireEvent({
    skillId,
    eventType: 'skill.triggered',
    source,
    data,
  });
  return { correlationId };
}
