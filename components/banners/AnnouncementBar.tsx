'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { BannerDTO } from './HeroBanner';

export default function AnnouncementBar() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/banners?placement=announcement_bar');
        const data = await res.json();
        if (!cancelled && data.banners?.length) {
          setBanners(data.banners);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const b = banners[0];
    if (!b || dismissed === b.id) return;
    fetch(`/api/banners/${b.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    }).catch(() => {});
  }, [banners, dismissed]);

  const b = banners[0];
  if (!b || dismissed === b.id) return null;

  const bg = b.background_color || '#D4AF37';
  const fg = b.text_color || '#111';

  const trackClick = () => {
    fetch(`/api/banners/${b.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click' }),
    }).catch(() => {});
  };

  return (
    <div
      className="w-full py-2.5 px-4 flex items-center justify-center gap-4 text-sm md:text-base relative"
      style={{ backgroundColor: bg, color: fg }}
    >
      <p className="font-medium text-center pr-8">
        {b.title}
        {b.cta_text && b.cta_link && (
          <>
            {' '}
            <Link
              href={b.cta_link}
              onClick={trackClick}
              className="underline font-semibold"
            >
              {b.cta_text}
            </Link>
          </>
        )}
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(b.id)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
