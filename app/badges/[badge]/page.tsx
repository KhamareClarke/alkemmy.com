import React from 'react';
import { notFound } from 'next/navigation';
import { getSoaps, getHerbalTeas, getLotions, getOils, getBeardCareProducts, getShampoos, getRollOns, getElixirs } from '@/lib/category-api';
import BadgeProductsPage from './BadgeProductsPage';

interface BadgePageProps {
  params: {
    badge: string;
  };
}

// Valid badge types
const VALID_BADGES = [
  'best_selling', 'bestseller', 'trending', 'new', 'sale', 
  'limited', 'featured', 'organic', 'premium', 'popular'
];

export default async function BadgePage({ params }: BadgePageProps) {
  const { badge } = params;
  
  // Check if badge is valid
  if (!VALID_BADGES.includes(badge)) {
    notFound();
  }

  // Fetch products from all categories
  const [soaps, teas, lotions, oils, beardCare, shampoos, rollOns, elixirs] = await Promise.all([
    getSoaps(),
    getHerbalTeas(),
    getLotions(),
    getOils(),
    getBeardCareProducts(),
    getShampoos(),
    getRollOns(),
    getElixirs()
  ]);

  // Filter products by badge
  const allProducts = [
    ...soaps.map(p => ({ ...p, category: 'soaps' })),
    ...teas.map(p => ({ ...p, category: 'teas' })),
    ...lotions.map(p => ({ ...p, category: 'lotions' })),
    ...oils.map(p => ({ ...p, category: 'oils' })),
    ...beardCare.map(p => ({ ...p, category: 'beard-care' })),
    ...shampoos.map(p => ({ ...p, category: 'shampoos' })),
    ...rollOns.map(p => ({ ...p, category: 'roll-ons' })),
    ...elixirs.map(p => ({ ...p, category: 'elixirs' }))
  ];

  const filteredProducts = allProducts.filter(product => 
    product.badges && product.badges.includes(badge)
  );

  return (
    <BadgeProductsPage 
      badge={badge} 
      products={filteredProducts}
    />
  );
}

// Generate static params for all valid badges
export async function generateStaticParams() {
  return VALID_BADGES.map((badge) => ({
    badge: badge,
  }));
}








