-- Part 13–15: Subscriptions, help center / knowledge base.
-- Run in Supabase after core `orders` / `addresses` / `auth` exist.

-- ---------------------------------------------------------------------------
-- 13.1 Subscriptions + billing history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status VARCHAR(24) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  plan_name VARCHAR(255) NOT NULL,
  cadence VARCHAR(24) NOT NULL CHECK (cadence IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  recurring_total_amount NUMERIC(14, 2) NOT NULL CHECK (recurring_total_amount >= 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'GBP',
  items JSONB NOT NULL DEFAULT '[]',
  default_address_id UUID REFERENCES addresses (id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  next_bill_at TIMESTAMPTZ NOT NULL,
  last_bill_at TIMESTAMPTZ,
  failure_count INT NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_bill ON subscriptions (next_bill_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders (id) ON DELETE SET NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'skipped')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_orders_sub ON subscription_orders (subscription_id, created_at DESC);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_no_direct" ON subscriptions FOR ALL USING (false);
CREATE POLICY "subscription_orders_no_direct" ON subscription_orders FOR ALL USING (false);

-- ---------------------------------------------------------------------------
-- 15.1 Help center
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES help_categories (id) ON DELETE SET NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  helpful_count INT NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  not_helpful_count INT NOT NULL DEFAULT 0 CHECK (not_helpful_count >= 0),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body, '')), 'C')
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles (category_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_status ON help_articles (status);
CREATE INDEX IF NOT EXISTS idx_help_articles_search ON help_articles USING gin (search_vector);

CREATE TABLE IF NOT EXISTS help_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES help_articles (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  session_id VARCHAR(128),
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_help_feedback_article ON help_feedback (article_id);

ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_categories_public_read"
  ON help_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "help_articles_public_read"
  ON help_articles FOR SELECT
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );

COMMENT ON TABLE subscriptions IS 'Recurring commerce; bill via cron + payment provider';
COMMENT ON TABLE help_articles IS 'Knowledge base; public read when published';

-- Optional seed
INSERT INTO help_categories (slug, title, description, sort_order, is_active)
VALUES ('getting-started', 'Getting started', 'Basics for new customers', 0, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO help_articles (category_id, slug, title, excerpt, body, status, published_at)
SELECT c.id,
  'welcome-to-alkhemmy',
  'Welcome to Alkhemmy',
  'What to expect from your first order.',
  'We craft small-batch herbal skincare in the UK. Track your parcel from the order confirmation email, and patch-test new products before full use.',
  'published',
  now()
FROM help_categories c
WHERE c.slug = 'getting-started'
ON CONFLICT (slug) DO NOTHING;
