'use client';

import React from 'react';

interface ProductBadgeProps {
  badge: string;
  className?: string;
  clickable?: boolean;
}

const BADGE_CONFIG = {
  best_selling: { label: 'Best Selling', color: 'bg-red-500 text-white' },
  bestseller: { label: 'Bestseller', color: 'bg-red-500 text-white' },
  trending: { label: 'Trending', color: 'bg-orange-500 text-white' },
  new: { label: 'New', color: 'bg-green-500 text-white' },
  sale: { label: 'Sale', color: 'bg-purple-500 text-white' },
  limited: { label: 'Limited Edition', color: 'bg-pink-500 text-white' },
  featured: { label: 'Featured', color: 'bg-blue-500 text-white' },
  organic: { label: 'Organic', color: 'bg-emerald-500 text-white' },
  premium: { label: 'Premium', color: 'bg-yellow-500 text-black' },
  popular: { label: 'Popular', color: 'bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] text-[#000000]' }
};

export default function ProductBadge({ badge, className = '', clickable = false }: ProductBadgeProps) {
  const config = BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG];
  
  if (!config) {
    return null;
  }

  const BadgeContent = () => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
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
