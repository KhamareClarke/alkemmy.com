import 'server-only';

import type { ProductInventoryPayload, ChannelSyncResult } from './types';

/**
 * Set available quantity at a Shopify location (Admin REST `inventory_levels/set`).
 * Pass `shopifyInventoryItemId` on the payload or set `SHOPIFY_DEFAULT_INVENTORY_ITEM_ID` for single-SKU shops.
 */
export async function syncInventoryToShopify(payload: ProductInventoryPayload): Promise<ChannelSyncResult> {
  const store = process.env.SHOPIFY_STORE?.trim();
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const locationId = process.env.SHOPIFY_LOCATION_ID?.trim();
  const itemId =
    (payload.shopifyInventoryItemId || process.env.SHOPIFY_DEFAULT_INVENTORY_ITEM_ID || '').trim();

  if (!store || !token || !locationId || !itemId) {
    return {
      channel: 'shopify',
      ok: false,
      detail:
        'Missing SHOPIFY_STORE, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_LOCATION_ID, or inventory item id (payload.shopifyInventoryItemId / SHOPIFY_DEFAULT_INVENTORY_ITEM_ID)',
    };
  }

  const url = `https://${store}/admin/api/2024-01/inventory_levels/set.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({
      location_id: Number(locationId),
      inventory_item_id: itemId,
      available: Math.max(0, Math.floor(payload.quantity)),
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { channel: 'shopify', ok: false, detail: JSON.stringify(json) };
  }
  return { channel: 'shopify', ok: true, detail: 'synced', externalId: itemId };
}
