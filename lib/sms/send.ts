import 'server-only';
import type { SendSmsOptions, SmsProvider } from './types';
import { getGhlConfig, normalizePhoneE164, sendGhlSms } from './ghl';
import { getTwilioClient, getTwilioFromNumber } from './client';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function resolveSmsProvider(): SmsProvider | null {
  if (getGhlConfig()) return 'ghl';
  if (getTwilioClient() && getTwilioFromNumber()) return 'twilio';
  return null;
}

async function sendOnce(options: SendSmsOptions): Promise<{ sid?: string; provider: SmsProvider }> {
  const to = normalizePhoneE164(options.to);
  const ghl = getGhlConfig();
  if (ghl) {
    const r = await sendGhlSms({ to, message: options.body });
    return { sid: r.messageId, provider: 'ghl' };
  }

  const client = getTwilioClient();
  const from = getTwilioFromNumber();
  if (!client || !from) {
    throw new Error('SMS not configured: set GHL_LOCATION_ID+GHL_API_KEY or TWILIO_* + TWILIO_PHONE_NUMBER');
  }

  const msg = await client.messages.create({
    from,
    to,
    body: options.body,
    statusCallback: process.env.TWILIO_SMS_STATUS_CALLBACK_URL?.trim() || undefined,
  });
  return { sid: msg.sid, provider: 'twilio' };
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 400;

export async function sendSmsWithRetry(options: SendSmsOptions): Promise<{ sid?: string; provider: SmsProvider }> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await sendOnce(options);
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Fire-and-forget; logs errors */
export function sendSmsSafe(options: SendSmsOptions): void {
  void sendSmsWithRetry(options).catch((e) => {
    console.error('[sms]', options.type, e);
  });
}
