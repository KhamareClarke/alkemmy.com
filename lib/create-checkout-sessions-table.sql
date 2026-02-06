-- Create a table to store checkout session data temporarily
-- This avoids storing large JSON in order notes which can cause URL length issues

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  temp_order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_data JSONB NOT NULL,
  cart_items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_temp_order_id ON checkout_sessions(temp_order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);

-- Enable RLS
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role to access (for webhooks)
CREATE POLICY "Service role can manage checkout sessions" ON checkout_sessions
  FOR ALL USING (true);

-- Clean up expired sessions periodically (can be done via cron job)
-- DELETE FROM checkout_sessions WHERE expires_at < NOW();
