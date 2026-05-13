'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/auth/google-oauth';
import { signInWithFacebook } from '@/lib/auth/facebook-oauth';

export default function SocialLoginButtons() {
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (which: 'google' | 'facebook') => {
    setLoading(which);
    setError(null);
    const { data, error: e } =
      which === 'google' ? await signInWithGoogle(supabase) : await signInWithFacebook(supabase);
    if (e) {
      setError(e.message);
      setLoading(null);
      return;
    }
    if (data?.url) {
      window.location.assign(data.url);
    } else {
      setError('Could not start social login');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => run('google')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium text-gray-800 disabled:opacity-60"
        >
          {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
        </button>
        <button
          type="button"
          onClick={() => run('facebook')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg bg-[#1877F2] text-white hover:bg-[#1667D9] font-medium disabled:opacity-60"
        >
          {loading === 'facebook' ? 'Redirecting…' : 'Continue with Facebook'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <p className="text-xs text-gray-500 text-center">
        Enable Google and Facebook providers in Supabase Auth, and add this redirect URL:{' '}
        <span className="font-mono">/auth/callback</span>
      </p>
    </div>
  );
}
