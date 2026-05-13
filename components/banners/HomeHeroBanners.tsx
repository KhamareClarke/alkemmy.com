'use client';

import React, { useEffect, useState } from 'react';
import HeroBanner, { type BannerDTO } from '@/components/banners/HeroBanner';

export default function HomeHeroBanners() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/banners?placement=hero');
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
    if (!b?.id) return;
    fetch(`/api/banners/${b.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    }).catch(() => {});
  }, [banners]);

  const b = banners[0];
  if (!b) return null;

  const trackClick = () => {
    fetch(`/api/banners/${b.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click' }),
    }).catch(() => {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      <HeroBanner banner={b} onCtaClick={trackClick} />
    </div>
  );
}
