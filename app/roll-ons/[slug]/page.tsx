import React from 'react';
import { notFound } from 'next/navigation';
import { getRollOnBySlug, getRelatedRollOns } from '@/lib/category-api';
import ProductClientPage from './ProductClientPage';

interface RollOnPageProps {
  params: {
    slug: string;
  };
}

export default async function RollOnPage({ params }: RollOnPageProps) {
  const { slug } = params;
  
  try {
    const [product, relatedProducts] = await Promise.all([
      getRollOnBySlug(slug),
      getRelatedRollOns(slug)
    ]);

    if (!product) {
      notFound();
    }

    return (
      <ProductClientPage 
        product={product} 
        relatedProducts={relatedProducts}
      />
    );
  } catch (error) {
    console.error('Error loading roll-on product:', error);
    notFound();
  }
}

// Generate static params for all roll-on products
export async function generateStaticParams() {
  try {
    const { getRollOns } = await import('@/lib/category-api');
    const rollOns = await getRollOns();
    return rollOns.map((rollOn) => ({
      slug: rollOn.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for roll-ons:', error);
    return [];
  }
}








