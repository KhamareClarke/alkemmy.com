import type { SupabaseClient } from '@supabase/supabase-js';

function redirectUrl() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/auth/callback`;
}

export async function signInWithFacebook(supabase: SupabaseClient) {
  return supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: redirectUrl(),
    },
  });
}
