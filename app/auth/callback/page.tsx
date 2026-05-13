'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    const run = async () => {
      const next = searchParams.get('next') || '/profile';
      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg(error.message);
          setTimeout(() => router.replace('/auth/login'), 2800);
          return;
        }
        router.replace(next);
        return;
      }
      setMsg('Missing authorization code. Redirecting to login…');
      setTimeout(() => router.replace('/auth/login'), 1600);
    };
    run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <p className="text-gray-700">{msg}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading…</p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
