import type { SupabaseClient } from '@supabase/supabase-js';

function redirectUrl() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/auth/callback`;
}

export async function signInWithGoogle(supabase: SupabaseClient) {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl(),
      queryParams: { prompt: 'select_account' },
    },
  });
}
