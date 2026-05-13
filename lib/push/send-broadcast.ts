import 'server-only';
import webpush from 'web-push';
import { adminSupabase } from '@/lib/admin-supabase';
import { getVapidKeys } from './vapid';
import type { PushPayload } from './types';

function configureWebPush() {
  const keys = getVapidKeys();
  if (!keys) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || 'mailto:support@alkhemmy.com',
    keys.publicKey,
    keys.privateKey
  );
  return true;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!configureWebPush()) {
    console.warn('[push] VAPID keys missing; skip send');
    return 0;
  }

  const { data: rows, error } = await adminSupabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_secret')
    .eq('user_id', userId);

  if (error || !rows?.length) return 0;

  let sent = 0;
  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth_secret },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 12 }
      );
      sent++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await adminSupabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
      } else {
        console.error('[push] send failed', e);
      }
    }
  }
  return sent;
}
