export type SalesChannel = 'shopify' | 'amazon' | 'ebay';

export interface ChannelSyncResult {
  channel: SalesChannel;
  ok: boolean;
  detail?: string;
  externalId?: string;
}

export interface ProductInventoryPayload {
  productId: string;
  variantId?: string | null;
  sku?: string | null;
  quantity: number;
  title?: string;
  /** When known, Shopify inventory_item_id (numeric string) for this SKU */
  shopifyInventoryItemId?: string | null;
}
