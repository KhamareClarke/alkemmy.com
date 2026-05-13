'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
    Intercom?: (...args: unknown[]) => void;
    intercomSettings?: { app_id: string; [k: string]: unknown };
  }
}

/**
 * Floating chat: Crisp (preferred) or Intercom via public env IDs.
 * History and agent tools live in the vendor dashboard.
 */
export function LiveChatWidget() {
  const crispId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  const intercomId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    if (crispId) {
      loaded.current = true;
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = crispId;
      const s = document.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      document.head.appendChild(s);
      void supabase.auth.getSession().then(({ data }) => {
        const email = data.session?.user?.email;
        const meta = data.session?.user?.user_metadata as Record<string, string | undefined> | undefined;
        if (email && window.$crisp) {
          window.$crisp.push(['set', 'user:email', [email]]);
          const fn = [meta?.first_name, meta?.last_name].filter(Boolean).join(' ');
          if (fn) window.$crisp.push(['set', 'user:nickname', [fn]]);
        }
      });
      return;
    }

    if (intercomId) {
      loaded.current = true;
      window.intercomSettings = { app_id: intercomId };
      const w = window as Window & { attachEvent?: unknown };
      const loadIntercom = () => {
        const s = document.createElement('script');
        s.src = `https://widget.intercom.io/widget/${intercomId}`;
        s.async = true;
        document.head.appendChild(s);
      };
      if (document.readyState === 'complete') loadIntercom();
      else window.addEventListener('load', loadIntercom);
    }
  }, [crispId, intercomId]);

  return null;
}
