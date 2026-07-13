/**
 * GET /api/fleet/diagnose
 * Check fleet ingest wiring (env + live POST to hub). Never leaks secret values.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function mask(value: string | undefined | null): string {
  if (!value) return '(missing)';
  if (value.length <= 6) return '(too short)';
  return `${value.slice(0, 3)}…${value.slice(-3)} (len=${value.length})`;
}

export async function GET(_request: NextRequest) {
  const fleetUrl = (process.env.FLEET_INGEST_URL || '').trim();
  const empireHub = (process.env.EMPIRE_HUB_URL || '').trim().replace(/\/$/, '');
  const hubUrl =
    (fleetUrl || (empireHub ? `${empireHub}/api/fleet/ingest` : 'https://www.khamareclarke.com/api/fleet/ingest')).replace(
      /\/$/,
      ''
    );
  const fleetSecret = (process.env.FLEET_INGEST_SECRET || '').trim();
  const empireSecret = (process.env.EMPIRE_INGEST_SECRET || '').trim();
  const secret = fleetSecret || empireSecret;

  const env = {
    FLEET_INGEST_URL: fleetUrl || '(default via EMPIRE_HUB_URL or khamareclarke.com)',
    FLEET_INGEST_SECRET: mask(fleetSecret),
    EMPIRE_HUB_URL: empireHub || '(missing)',
    EMPIRE_INGEST_SECRET: mask(empireSecret),
    secret_used: fleetSecret ? 'FLEET_INGEST_SECRET' : empireSecret ? 'EMPIRE_INGEST_SECRET (fallback)' : '(none)',
    NODE_ENV: process.env.NODE_ENV,
  };

  if (!secret) {
    return NextResponse.json({
      ok: false,
      reason: 'Neither FLEET_INGEST_SECRET nor EMPIRE_INGEST_SECRET is set on this Vercel project',
      env,
    });
  }

  const body = {
    project: 'alkemmy',
    event_type: 'test',
    summary: 'Fleet diagnose — wiring check from alkhemmy.com',
    payload: { source: 'GET /api/fleet/diagnose' },
  };

  let status = 0;
  let responseText = '';
  let error: string | null = null;
  try {
    const res = await fetch(hubUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    status = res.status;
    responseText = (await res.text()).slice(0, 2000);
  } catch (e) {
    error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  const ok = !error && status >= 200 && status < 300;

  return NextResponse.json({
    ok,
    env,
    request: { target: hubUrl, body },
    response: { status, body: responseText, error },
    hint: ok
      ? 'Test event accepted. Check JARVIS All projects or fleet events on khamareclarke.com.'
      : status === 401
        ? 'Hub rejected the secret. Set FLEET_INGEST_SECRET on alkhemmy to match khamareclarke.com hub (or align EMPIRE_INGEST_SECRET if hub accepts it).'
        : status === 0
          ? 'Could not reach the hub. Check FLEET_INGEST_URL / EMPIRE_HUB_URL.'
          : 'Hub returned non-2xx. See response.body.',
  });
}
