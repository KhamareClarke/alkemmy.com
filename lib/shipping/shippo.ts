import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

const SHIPPO_BASE = 'https://api.goshippo.com';

function token(): string {
  const t = process.env.SHIPPO_API_TOKEN?.trim();
  if (!t) throw new Error('SHIPPO_API_TOKEN is not set');
  return t;
}

function headers(): HeadersInit {
  return {
    Authorization: `ShippoToken ${token()}`,
    'Content-Type': 'application/json',
  };
}

export interface ShippoAddressInput {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface ParcelInput {
  length: string;
  width: string;
  height: string;
  distance_unit: 'in' | 'cm';
  weight: string;
  mass_unit: 'lb' | 'kg';
}

export async function getMultiCarrierRates(args: {
  from: ShippoAddressInput;
  to: ShippoAddressInput;
  parcel: ParcelInput;
}): Promise<{ object_id: string; rates: unknown[] }> {
  const body = {
    address_from: args.from,
    address_to: args.to,
    parcels: [args.parcel],
    async: false,
  };

  const res = await fetch(`${SHIPPO_BASE}/shipments/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Shippo shipment ${res.status}: ${JSON.stringify(json)}`);
  }
  const rates = (json as { rates?: unknown[]; object_id?: string }).rates ?? [];
  const object_id = (json as { object_id?: string }).object_id ?? '';
  return { object_id, rates };
}

export async function purchaseShippingLabel(rateObjectId: string): Promise<unknown> {
  const res = await fetch(`${SHIPPO_BASE}/transactions/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ rate: rateObjectId, label_file_type: 'PDF', async: false }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Shippo transaction ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

export async function getTrackingStatus(trackingNumber: string, carrier: string): Promise<unknown> {
  const res = await fetch(`${SHIPPO_BASE}/tracks/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ carrier, tracking_number: trackingNumber }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Shippo track ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

export type ShippoWebhookEvent = {
  event?: string;
  test?: boolean;
  data?: Record<string, unknown>;
};

/** Persist tracking updates from Shippo webhooks (tracking_status object). */
export async function handleTrackingWebhook(event: ShippoWebhookEvent): Promise<{ ok: boolean; detail?: string }> {
  const data = event.data as
    | {
        tracking_number?: string;
        carrier?: string;
        tracking_status?: { status?: string; status_date?: string };
        metadata?: string;
      }
    | undefined;

  if (!data?.tracking_number || !data.carrier) {
    return { ok: false, detail: 'missing tracking_number or carrier' };
  }

  const status = data.tracking_status?.status ?? 'unknown';
  const meta = data.metadata;
  const orderId =
    typeof meta === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(meta)
      ? meta
      : null;

  const { error } = await adminSupabase.from('order_shipments').upsert(
    {
      order_id: orderId,
      carrier: data.carrier,
      tracking_number: data.tracking_number,
      status,
      last_webhook: event as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'carrier,tracking_number' }
  );

  if (error) {
    console.error('[shippo] webhook upsert:', error.message);
    return { ok: false, detail: error.message };
  }
  return { ok: true };
}
