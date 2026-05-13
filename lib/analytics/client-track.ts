'use client';

import { trackEvent as gaTrack } from './ga4-client';

const SESSION_KEY = 'alkhemmy_sid';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = `s_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return '';
  }
}

/** GA4 + optional first-party DB row (non-blocking). */
export function trackClientEvent(
  eventName: string,
  opts: {
    category?: string;
    value?: number;
    properties?: Record<string, unknown>;
    gaPayload?: Record<string, unknown>;
  } = {}
) {
  gaTrack(eventName, { ...opts.gaPayload, ...opts.properties });

  const payload = {
    event_name: eventName,
    event_category: opts.category ?? null,
    event_value: opts.value ?? null,
    event_properties: opts.properties ?? {},
    session_id: getSessionId(),
    page_url: typeof window !== 'undefined' ? window.location.href : null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
  };

  void fetch('/api/analytics/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
