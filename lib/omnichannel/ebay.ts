import 'server-only';

import type { ProductInventoryPayload, ChannelSyncResult } from './types';

/**
 * eBay Inventory API bulkUpdatePriceQuantity (stub).
 * Requires OAuth + merchant location when enabled.
 */
export async function syncInventoryToEbay(payload: ProductInventoryPayload): Promise<ChannelSyncResult> {
  const clientId = process.env.EBAY_CLIENT_ID?.trim();
  if (!clientId) {
    return { channel: 'ebay', ok: false, detail: 'EBAY_CLIENT_ID not configured' };
  }

  void payload;
  return {
    channel: 'ebay',
    ok: true,
    detail: 'stub_ok_configure_inventory_api',
    externalId: payload.sku || payload.productId,
  };
}
