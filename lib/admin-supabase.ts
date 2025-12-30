// Admin Supabase client that bypasses RLS
import 'server-only';
import { createClient } from '@supabase/supabase-js';

// This client uses the service role key which bypasses RLS
// Make sure to add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
if (typeof window !== 'undefined') {
  throw new Error('admin-supabase must only be imported on the server.');
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required. Please add it to your .env.local file.');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required. Please add it to your .env.local file.');
}

export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for normal operations
export { supabase } from './supabase';




