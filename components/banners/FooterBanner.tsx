'use client';

import React from 'react';
import Link from 'next/link';
import type { BannerDTO } from './HeroBanner';

interface FooterBannerProps {
  banner: BannerDTO;
  onCtaClick?: () => void;
}

export default function FooterBanner({ banner, onCtaClick }: FooterBannerProps) {
  const bg = banner.background_color || '#111';
  const fg = banner.text_color || '#F4EBD0';

  return (
    <div
      className="rounded-xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{ backgroundColor: bg, color: fg }}
    >
      <div>
        <p className="font-bold text-lg">{banner.title}</p>
        {banner.description && <p className="text-sm opacity-90 mt-1">{banner.description}</p>}
      </div>
      {banner.cta_text && banner.cta_link && (
        <Link
          href={banner.cta_link}
          onClick={onCtaClick}
          className="inline-flex items-center justify-center bg-[#D4AF37] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#B8941F] shrink-0"
        >
          {banner.cta_text}
        </Link>
      )}
    </div>
  );
}
