import React from 'react';
import { notFound } from 'next/navigation';
import { getOilBySlug, getRelatedOils } from '@/lib/category-api';
import ProductClientPage from './ProductClientPage';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface OilPageProps {
  params: {
    slug: string;
  };
}

export default async function OilPage({ params }: OilPageProps) {
  const { slug } = params;
  
  try {
    const [product, relatedProducts] = await Promise.all([
      getOilBySlug(slug),
      getRelatedOils(slug)
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
    console.error('Error loading oil product:', error);
    notFound();
  }
}

// Generate static params for all oil products
export async function generateStaticParams() {
  try {
    const { getOils } = await import('@/lib/category-api');
    const oils = await getOils();
    return oils.map((oil) => ({
      slug: oil.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for oils:', error);
    return [];
  }
}








