// Admin Supabase client that bypasses RLS
import { createClient } from '@supabase/supabase-js';

// This client uses the service role key which bypasses RLS
// Make sure to add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for normal operations
export { supabase } from './supabase';




