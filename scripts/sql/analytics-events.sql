-- Custom analytics events (server ingests via service role).
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  session_id VARCHAR(128),
  event_name VARCHAR(128) NOT NULL,
  event_category VARCHAR(64),
  event_value DECIMAL(14, 4),
  event_properties JSONB NOT NULL DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events (user_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE analytics_events IS 'First-party event stream for funnels + GA4 complement';
