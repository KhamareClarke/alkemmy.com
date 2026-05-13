-- Empire OS event log (metrics + replay). Service role inserts from API routes.
CREATE TABLE IF NOT EXISTS empire_os_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empire_os_events_created ON empire_os_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_empire_os_events_skill ON empire_os_events (skill_id);

ALTER TABLE empire_os_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE empire_os_events IS 'Empire OS integration: skill signals and webhook audit trail (insert via service role / backend only).';