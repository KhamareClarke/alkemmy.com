-- Part 19: outbound sync queue / audit for Shopify, Amazon, eBay (optional).
CREATE TABLE IF NOT EXISTS channel_inventory_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  variant_id UUID,
  channel VARCHAR(32) NOT NULL CHECK (channel IN ('shopify', 'amazon', 'ebay', 'other')),
  external_sku TEXT,
  quantity_sent INT,
  status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed', 'skipped')),
  payload JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_sync_product ON channel_inventory_sync (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_sync_channel ON channel_inventory_sync (channel, status);

ALTER TABLE channel_inventory_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channel_inventory_sync_no_direct" ON channel_inventory_sync FOR ALL USING (false);

COMMENT ON TABLE channel_inventory_sync IS 'Audit trail for omnichannel inventory pushes (service role only)';
