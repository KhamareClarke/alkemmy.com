import 'server-only';

import { adminSupabase } from '@/lib/admin-supabase';
import type { ProductInventoryPayload, SalesChannel, ChannelSyncResult } from './types';
import { syncInventoryToShopify } from './shopify';
import { syncInventoryToAmazon } from './amazon';
import { syncInventoryToEbay } from './ebay';

async function logSync(
  payload: ProductInventoryPayload,
  channel: SalesChannel,
  result: ChannelSyncResult
): Promise<void> {
  try {
    await adminSupabase.from('channel_inventory_sync').insert({
      product_id: payload.productId,
      variant_id: payload.variantId ?? null,
      channel,
      external_sku: payload.sku ?? null,
      quantity_sent: Math.floor(payload.quantity),
      status: result.ok ? 'synced' : 'failed',
      payload: { detail: result.detail, externalId: result.externalId } as Record<string, unknown>,
      error_message: result.ok ? null : result.detail ?? 'error',
    });
  } catch {
    /* table may not exist until migration */
  }
}

/** Push one quantity snapshot to Shopify, Amazon, and eBay adapters; writes `channel_inventory_sync` when the table exists. */
export async function syncInventoryToAllChannels(payload: ProductInventoryPayload): Promise<ChannelSyncResult[]> {
  const runners: { ch: SalesChannel; fn: () => Promise<ChannelSyncResult> }[] = [
    { ch: 'shopify', fn: () => syncInventoryToShopify(payload) },
    { ch: 'amazon', fn: () => syncInventoryToAmazon(payload) },
    { ch: 'ebay', fn: () => syncInventoryToEbay(payload) },
  ];

  const out: ChannelSyncResult[] = [];
  for (const { ch, fn } of runners) {
    const r = await fn();
    out.push(r);
    void logSync(payload, ch, r);
  }
  return out;
}
