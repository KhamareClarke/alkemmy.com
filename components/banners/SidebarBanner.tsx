'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BannerDTO } from './HeroBanner';

interface SidebarBannerProps {
  banner: BannerDTO;
  onCtaClick?: () => void;
}

export default function SidebarBanner({ banner, onCtaClick }: SidebarBannerProps) {
  const bg = banner.background_color || '#F4EBD0';

  return (
    <aside
      className="rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6"
      style={{ backgroundColor: bg }}
    >
      {banner.image_url && (
        <div className="relative h-40 w-full">
          <Image src={banner.image_url} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="p-4" style={{ color: banner.text_color || '#111' }}>
        <h3 className="font-bold text-lg mb-2">{banner.title}</h3>
        {banner.description && <p className="text-sm text-gray-700 mb-3">{banner.description}</p>}
        {banner.cta_text && banner.cta_link && (
          <Link
            href={banner.cta_link}
            onClick={onCtaClick}
            className="text-sm font-semibold text-[#B8941F] hover:underline"
          >
            {banner.cta_text} →
          </Link>
        )}
      </div>
    </aside>
  );
}
