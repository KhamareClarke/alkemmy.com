-- Alkhemmy: discount codes, promotional banners, product variants
-- Run in Supabase SQL Editor (or psql) once. Safe to re-run for IF NOT EXISTS / policies.

-- ---------------------------------------------------------------------------
-- Discount codes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(12,2) NOT NULL CHECK (value >= 0),
  max_uses INT CHECK (max_uses IS NULL OR max_uses >= 0),
  current_uses INT NOT NULL DEFAULT 0 CHECK (current_uses >= 0),
  expiry_date TIMESTAMPTZ,
  applicable_categories TEXT[] DEFAULT '{}',
  minimum_order_amount NUMERIC(12,2) DEFAULT 0 CHECK (minimum_order_amount >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code_lower ON discount_codes (LOWER(code));
CREATE INDEX IF NOT EXISTS idx_discount_codes_status ON discount_codes (status);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- No direct public access; app uses service role for admin + validate route
CREATE POLICY "discount_codes_no_anon" ON discount_codes FOR ALL USING (false);

-- ---------------------------------------------------------------------------
-- Promotional banners + simple analytics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text VARCHAR(120),
  cta_link VARCHAR(1024),
  background_color VARCHAR(32),
  text_color VARCHAR(32),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'scheduled')),
  placement TEXT NOT NULL CHECK (placement IN ('hero', 'sidebar', 'footer', 'announcement_bar')),
  order_priority INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  click_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotional_banners_placement ON promotional_banners (placement);
CREATE INDEX IF NOT EXISTS idx_promotional_banners_status ON promotional_banners (status);

ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotional_banners_public_read_scheduled"
  ON promotional_banners FOR SELECT
  USING (
    status IN ('active', 'scheduled')
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- ---------------------------------------------------------------------------
-- Product variants (product_id matches your products / category tables UUID)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  option_name VARCHAR(120) NOT NULL,
  option_values TEXT[] NOT NULL DEFAULT '{}',
  option_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, option_name)
);

CREATE INDEX IF NOT EXISTS idx_variant_options_product ON variant_options (product_id);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  sku VARCHAR(120) UNIQUE NOT NULL,
  option_values JSONB NOT NULL DEFAULT '{}',
  price NUMERIC(12,2),
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  weight NUMERIC(12,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants (product_id);

CREATE OR REPLACE FUNCTION trg_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_variants_set_updated ON product_variants;
CREATE TRIGGER product_variants_set_updated
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION trg_product_variants_updated_at();

ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variant_options_public_read" ON variant_options FOR SELECT USING (true);
CREATE POLICY "product_variants_public_read" ON product_variants FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- Orders: discount snapshot
-- ---------------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_label TEXT;

-- ---------------------------------------------------------------------------
-- Checkout session: persist discount for webhook / reconciliation
-- ---------------------------------------------------------------------------
ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS discount JSONB;

-- Service role bypasses RLS; anon from client should use API routes only.
