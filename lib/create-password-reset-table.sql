-- Create password_reset_codes table
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS password_reset_codes_email_idx ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS password_reset_codes_code_idx ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS password_reset_codes_expires_at_idx ON password_reset_codes(expires_at);

-- Enable RLS
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policies (only service role can access)
CREATE POLICY "password_reset_codes_select_policy" ON password_reset_codes
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "password_reset_codes_insert_policy" ON password_reset_codes
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "password_reset_codes_update_policy" ON password_reset_codes
  FOR UPDATE USING (auth.role() = 'service_role');

-- Clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;




