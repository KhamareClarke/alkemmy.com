-- Part 8–12: CDP profiles + journey, multi-warehouse inventory, loyalty, order shipments (tracking).
-- Run in Supabase SQL Editor. Uses auth.users and orders where present.

-- ---------------------------------------------------------------------------
-- 8.1 Unified customer profile
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  total_lifetime_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_orders INT NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  average_order_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  segment VARCHAR(32) CHECK (segment IS NULL OR segment IN ('vip', 'loyal', 'at_risk', 'new', 'dormant')),
  lifetime_tier VARCHAR(24) CHECK (lifetime_tier IS NULL OR lifetime_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  predicted_churn_risk NUMERIC(5, 4) CHECK (predicted_churn_risk IS NULL OR (predicted_churn_risk >= 0 AND predicted_churn_risk <= 1)),
  email_opt_in BOOLEAN NOT NULL DEFAULT true,
  sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  source VARCHAR(32) CHECK (source IS NULL OR source IN ('organic', 'paid_ads', 'referral', 'unknown')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_segment ON customer_profiles (segment);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_ltv ON customer_profiles (total_lifetime_value DESC);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_profiles_no_direct" ON customer_profiles FOR ALL USING (false);

-- ---------------------------------------------------------------------------
-- 8.2 Customer journey timeline
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  guest_email VARCHAR(320),
  event_type VARCHAR(64) NOT NULL,
  event_category VARCHAR(64),
  title TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  order_id UUID REFERENCES orders (id) ON DELETE SET NULL,
  page_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journey_user_created ON customer_journey_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_order ON customer_journey_events (order_id);
CREATE INDEX IF NOT EXISTS idx_journey_type ON customer_journey_events (event_type);

ALTER TABLE customer_journey_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_journey_no_direct" ON customer_journey_events FOR ALL USING (false);

-- ---------------------------------------------------------------------------
-- 11.1 Multi-warehouse inventory
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'GB',
  is_default BOOLEAN NOT NULL DEFAULT false,
  address JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses (id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  reorder_point INT NOT NULL DEFAULT 5 CHECK (reorder_point >= 0),
  auto_reorder_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_stock_wh_prod_var
  ON inventory_stock (warehouse_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS idx_inventory_stock_product ON inventory_stock (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_low ON inventory_stock (warehouse_id)
  WHERE quantity_on_hand - quantity_reserved <= reorder_point;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses (id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity_delta INT NOT NULL,
  movement_type VARCHAR(32) NOT NULL CHECK (movement_type IN (
    'receive', 'reserve', 'release', 'ship', 'adjust', 'transfer_in', 'transfer_out'
  )),
  reference_type VARCHAR(32),
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_wh ON inventory_movements (warehouse_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_ref ON inventory_movements (reference_type, reference_id);

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warehouses_no_direct" ON warehouses FOR ALL USING (false);
CREATE POLICY "inventory_stock_no_direct" ON inventory_stock FOR ALL USING (false);
CREATE POLICY "inventory_movements_no_direct" ON inventory_movements FOR ALL USING (false);

-- Seed default warehouse (idempotent)
INSERT INTO warehouses (code, name, country, is_default)
VALUES ('MAIN', 'Main warehouse', 'GB', true)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10.2 Shipment / tracking store (webhook + API)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders (id) ON DELETE SET NULL,
  carrier VARCHAR(64) NOT NULL,
  tracking_number VARCHAR(128) NOT NULL,
  shippo_transaction_id VARCHAR(128),
  label_url TEXT,
  status VARCHAR(64),
  last_webhook JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (carrier, tracking_number)
);

CREATE INDEX IF NOT EXISTS idx_order_shipments_order ON order_shipments (order_id);

ALTER TABLE order_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_shipments_no_direct" ON order_shipments FOR ALL USING (false);

-- ---------------------------------------------------------------------------
-- 12.1 Loyalty points
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_loyalty_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INT NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
  lifetime_redeemed INT NOT NULL DEFAULT 0 CHECK (lifetime_redeemed >= 0),
  tier VARCHAR(24) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  points_delta INT NOT NULL,
  balance_after INT,
  reason VARCHAR(64) NOT NULL,
  order_id UUID REFERENCES orders (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_user ON loyalty_transactions (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_one_order_payment
  ON loyalty_transactions (order_id)
  WHERE reason = 'order_payment';

ALTER TABLE customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_loyalty_no_direct" ON customer_loyalty_points FOR ALL USING (false);
CREATE POLICY "loyalty_transactions_no_direct" ON loyalty_transactions FOR ALL USING (false);

COMMENT ON TABLE customer_profiles IS 'CDP rollup; maintained by service role from orders + prefs';
COMMENT ON TABLE customer_journey_events IS 'Timeline: purchases, reviews, emails, status, etc.';
COMMENT ON TABLE inventory_stock IS 'Per-warehouse on_hand + reserved';
COMMENT ON TABLE loyalty_transactions IS 'Points earn/redeem audit trail';
