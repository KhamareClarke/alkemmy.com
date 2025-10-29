// Admin Supabase client that bypasses RLS
import { createClient } from '@supabase/supabase-js';

// This client uses the service role key which bypasses RLS
// Make sure to add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvbhcvwjwsjgzjpfpogy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Ymhjdndqd3NqZ3pqcGZwb2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDEzOTksImV4cCI6MjA3NTUxNzM5OX0.OzrUu0NtIL0lrnjQM3J4cOyFWl2mK1yByWtGUcnBYys';

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}

export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for normal operations
export { supabase } from './supabase';




