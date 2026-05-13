'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface BannerDTO {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  background_color?: string | null;
  text_color?: string | null;
}

interface HeroBannerProps {
  banner: BannerDTO;
  onCtaClick?: () => void;
}

export default function HeroBanner({ banner, onCtaClick }: HeroBannerProps) {
  const bg = banner.background_color || '#1a1a1a';
  const fg = banner.text_color || '#F4EBD0';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-10"
      style={{ backgroundColor: bg, color: fg }}
    >
      <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{banner.title}</h2>
          {banner.description && (
            <p className="text-lg opacity-90 mb-6 leading-relaxed">{banner.description}</p>
          )}
          {banner.cta_text && banner.cta_link && (
            <Link
              href={banner.cta_link}
              onClick={onCtaClick}
              className="inline-block bg-[#D4AF37] text-black font-semibold px-8 py-3 rounded-full hover:bg-[#B8941F] transition-colors"
            >
              {banner.cta_text}
            </Link>
          )}
        </div>
        {banner.image_url && (
          <div className="relative h-56 md:h-72 rounded-xl overflow-hidden">
            <Image src={banner.image_url} alt="" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>
    </motion.section>
  );
}
