'use client';

import React, { useEffect, useState } from 'react';
import FooterBanner from '@/components/banners/FooterBanner';
import type { BannerDTO } from '@/components/banners/HeroBanner';

export default function HomeFooterBanner() {
  const [banner, setBanner] = useState<BannerDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/banners?placement=footer');
        const data = await res.json();
        if (!cancelled && data.banners?.[0]) setBanner(data.banners[0]);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!banner?.id) return;
    fetch(`/api/banners/${banner.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    }).catch(() => {});
  }, [banner]);

  if (!banner) return null;

  const trackClick = () => {
    fetch(`/api/banners/${banner.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click' }),
    }).catch(() => {});
  };

  return (
    <div className="mb-16">
      <FooterBanner banner={banner} onCtaClick={trackClick} />
    </div>
  );
}
