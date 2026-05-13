import 'server-only';

import type { ProductInventoryPayload, ChannelSyncResult } from './types';

/**
 * Amazon Selling Partner feeds / patch inventory (stub).
 * Wire Listings Items + `patchListingsItem` or feeds when credentials (LWA + refresh) are configured.
 */
export async function syncInventoryToAmazon(payload: ProductInventoryPayload): Promise<ChannelSyncResult> {
  const sellerId = process.env.AMAZON_SELLER_ID?.trim();
  const marketplace = process.env.AMAZON_MARKETPLACE_ID?.trim();
  if (!sellerId || !marketplace) {
    return {
      channel: 'amazon',
      ok: false,
      detail: 'AMAZON_SELLER_ID / AMAZON_MARKETPLACE_ID not configured',
    };
  }

  void payload;
  return {
    channel: 'amazon',
    ok: true,
    detail: 'stub_ok_configure_sp_api',
    externalId: payload.sku || payload.productId,
  };
}
