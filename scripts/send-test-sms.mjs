/**
 * Test SMS — loads .env.local, uses GHL if set else Twilio.
 * Usage: node scripts/send-test-sms.mjs "+44 7473 255886"
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import twilio from 'twilio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function ghlHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function normalizePhoneE164(raw, defaultCountry = '44') {
  let s = String(raw).replace(/[\s()-]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  if (s.startsWith('0') && !s.startsWith('00')) s = `+${defaultCountry}${s.slice(1)}`;
  if (!s.startsWith('+')) s = `+${s}`;
  return s;
}

async function findContactIdByPhone(locationId, apiKey, phone) {
  const q = encodeURIComponent(phone);
  const url = `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&phone=${q}`;
  const res = await fetch(url, { method: 'GET', headers: ghlHeaders(apiKey) });
  if (!res.ok) return null;
  const data = await res.json();
  return data.contact?.id ?? data.id ?? null;
}

async function upsertContact(locationId, apiKey, phone) {
  const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      phone,
      firstName: 'Customer',
      source: 'alkhemmy-store-test',
    }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`GHL upsert contact: non-JSON (${res.status}) ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(json.message || `GHL upsert contact failed (${res.status})`);
  const id = json.contact?.id ?? json.id;
  if (!id) throw new Error('GHL upsert contact: missing id');
  return id;
}

async function sendGhlSms(to, message) {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const apiKey = process.env.GHL_API_KEY?.trim();
  if (!locationId || !apiKey) throw new Error('Missing GHL_LOCATION_ID or GHL_API_KEY');

  const phone = normalizePhoneE164(to);
  let contactId = await findContactIdByPhone(locationId, apiKey, phone);
  if (!contactId) contactId = await upsertContact(locationId, apiKey, phone);

  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: 'POST',
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ type: 'SMS', contactId, message }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`GHL send SMS: non-JSON (${res.status}) ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(json.message || json.msg || `GHL send SMS failed (${res.status})`);
  return json.messageId ?? json.id;
}

async function main() {
  const to = process.argv[2]?.trim() || '+447473255886';
  const message = `Alkhemmy SMS test (${new Date().toISOString()}). Not monitored.`;

  if (process.env.GHL_LOCATION_ID?.trim() && process.env.GHL_API_KEY?.trim()) {
    const id = await sendGhlSms(to, message);
    console.log('GHL SMS sent, messageId:', id);
    return;
  }

  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();
  if (!sid || !token || !from) {
    console.error('Set GHL_LOCATION_ID+GHL_API_KEY or TWILIO_ACCOUNT_SID+TWILIO_AUTH_TOKEN+TWILIO_PHONE_NUMBER');
    process.exit(1);
  }
  const client = twilio(sid, token);
  const msg = await client.messages.create({
    from,
    to: normalizePhoneE164(to),
    body: message,
  });
  console.log('Twilio SMS sent, sid:', msg.sid);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
