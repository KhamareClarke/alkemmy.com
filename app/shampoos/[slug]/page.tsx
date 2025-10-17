import React from 'react';
import { notFound } from 'next/navigation';
import { getShampooBySlug, getRelatedShampoos } from '@/lib/category-api';
import ProductClientPage from './ProductClientPage';

interface ShampooPageProps {
  params: {
    slug: string;
  };
}

export default async function ShampooPage({ params }: ShampooPageProps) {
  const { slug } = params;
  
  try {
    const [product, relatedProducts] = await Promise.all([
      getShampooBySlug(slug),
      getRelatedShampoos(slug)
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
    console.error('Error loading shampoo product:', error);
    notFound();
  }
}

// Generate static params for all shampoo products
export async function generateStaticParams() {
  try {
    const { getShampoos } = await import('@/lib/category-api');
    const shampoos = await getShampoos();
    return shampoos.map((shampoo) => ({
      slug: shampoo.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for shampoos:', error);
    return [];
  }
}








