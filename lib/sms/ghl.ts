import 'server-only';

/**
 * Go High Level (LeadConnector) SMS via Conversations API.
 * Requires GHL_LOCATION_ID and GHL_API_KEY (private integration token, pit-...).
 */
const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export function getGhlConfig(): { locationId: string; apiKey: string } | null {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const apiKey = process.env.GHL_API_KEY?.trim();
  if (!locationId || !apiKey) return null;
  return { locationId, apiKey };
}

/** E.164 preferred; strips spaces */
export function normalizePhoneE164(raw: string, defaultCountry = '44'): string {
  let s = raw.replace(/[\s()-]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  if (s.startsWith('0') && !s.startsWith('00')) {
    s = `+${defaultCountry}${s.slice(1)}`;
  }
  if (!s.startsWith('+')) s = `+${s}`;
  return s;
}

async function findContactIdByPhone(
  locationId: string,
  apiKey: string,
  phone: string
): Promise<string | null> {
  const q = encodeURIComponent(phone);
  const url = `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&phone=${q}`;
  const res = await fetch(url, { method: 'GET', headers: headers(apiKey) });
  if (!res.ok) return null;
  const data = (await res.json()) as { contact?: { id?: string }; id?: string };
  return data.contact?.id ?? data.id ?? null;
}

async function upsertContact(
  locationId: string,
  apiKey: string,
  phone: string,
  firstName?: string
): Promise<string> {
  const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      locationId,
      phone,
      firstName: firstName || 'Customer',
      source: 'alkhemmy-store',
    }),
  });
  const text = await res.text();
  let json: { contact?: { id?: string }; id?: string; message?: string };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw new Error(`GHL upsert contact: non-JSON (${res.status}) ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `GHL upsert contact failed (${res.status})`);
  }
  const id = json.contact?.id ?? json.id;
  if (!id) throw new Error('GHL upsert contact: missing id');
  return id;
}

export async function sendGhlSms(params: {
  to: string;
  message: string;
  firstName?: string;
}): Promise<{ messageId?: string; contactId: string }> {
  const cfg = getGhlConfig();
  if (!cfg) throw new Error('GHL_LOCATION_ID and GHL_API_KEY are required for GHL SMS');

  const phone = normalizePhoneE164(params.to);
  let contactId = await findContactIdByPhone(cfg.locationId, cfg.apiKey, phone);
  if (!contactId) {
    contactId = await upsertContact(cfg.locationId, cfg.apiKey, phone, params.firstName);
  }

  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: 'POST',
    headers: headers(cfg.apiKey),
    body: JSON.stringify({
      type: 'SMS',
      contactId,
      message: params.message,
    }),
  });

  const text = await res.text();
  let json: { messageId?: string; id?: string; msg?: string; message?: string };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw new Error(`GHL send SMS: non-JSON (${res.status}) ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(json.message || json.msg || `GHL send SMS failed (${res.status})`);
  }
  return { messageId: json.messageId ?? json.id, contactId };
}
