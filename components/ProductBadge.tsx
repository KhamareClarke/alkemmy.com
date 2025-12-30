'use client';

import React from 'react';

interface ProductBadgeProps {
  badge: string;
  className?: string;
  clickable?: boolean;
}

const BADGE_CONFIG = {
  best_selling: { label: 'SIGNATURE', color: 'bg-transparent border border-[#b08a3c]/40 text-[#d6b35e]' },
  bestseller: { label: 'SIGNATURE', color: 'bg-transparent border border-[#b08a3c]/40 text-[#d6b35e]' },
  trending: { label: 'CORE', color: 'bg-transparent border border-[#b08a3c]/30 text-[#b08a3c]' },
  new: { label: 'NEW', color: 'bg-transparent border border-[#b08a3c]/30 text-[#b08a3c]' },
  sale: { label: 'SELECTION', color: 'bg-transparent border border-[#b08a3c]/30 text-[#b08a3c]' },
  limited: { label: 'LIMITED', color: 'bg-transparent border border-[#b08a3c]/40 text-[#d6b35e]' },
  featured: { label: 'FEATURED', color: 'bg-transparent border border-[#b08a3c]/30 text-[#b08a3c]' },
  organic: { label: 'ORGANIC', color: 'bg-transparent border border-[#b08a3c]/30 text-[#b08a3c]' },
  premium: { label: 'PREMIUM', color: 'bg-transparent border border-[#d6b35e]/50 text-[#d6b35e]' },
  popular: { label: 'SIGNATURE', color: 'bg-transparent border border-[#b08a3c]/40 text-[#d6b35e]' }
};

export default function ProductBadge({ badge, className = '', clickable = false }: ProductBadgeProps) {
  const config = BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG];
  
  if (!config) {
    return null;
  }

  const BadgeContent = () => (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-sm text-[10px] font-medium tracking-widest ${config.color} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
    >
      {config.label}
    </span>
  );

  if (clickable) {
    return (
      <a href={`/badges/${badge}`} className="inline-block">
        <BadgeContent />
      </a>
    );
  }

  return <BadgeContent />;
}

// Component for displaying multiple badges
interface ProductBadgesProps {
  badges: string[];
  className?: string;
  maxBadges?: number;
  clickable?: boolean;
}

export function ProductBadges({ badges, className = '', maxBadges = 3, clickable = false }: ProductBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const displayBadges = badges.slice(0, maxBadges);
  const remainingCount = badges.length - maxBadges;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayBadges.map((badge, index) => (
        <ProductBadge key={index} badge={badge} clickable={clickable} />
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
