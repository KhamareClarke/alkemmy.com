-- Create emails table to track all sent emails
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_type TEXT DEFAULT 'custom', -- 'order_confirmation', 'status_update', 'custom', etc.
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies for emails table
CREATE POLICY "emails_select_policy" ON emails
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "emails_insert_policy" ON emails
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "emails_update_policy" ON emails
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS emails_sent_at_idx ON emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS emails_to_email_idx ON emails(to_email);
CREATE INDEX IF NOT EXISTS emails_type_idx ON emails(email_type);




