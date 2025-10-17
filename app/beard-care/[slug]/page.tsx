import React from 'react';
import { notFound } from 'next/navigation';
import { getBeardCareBySlug, getRelatedBeardCare } from '@/lib/category-api';
import ProductClientPage from './ProductClientPage';

interface BeardCarePageProps {
  params: {
    slug: string;
  };
}

export default async function BeardCarePage({ params }: BeardCarePageProps) {
  const { slug } = params;
  
  try {
    const [product, relatedProducts] = await Promise.all([
      getBeardCareBySlug(slug),
      getRelatedBeardCare(slug)
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
    console.error('Error loading beard care product:', error);
    notFound();
  }
}

// Generate static params for all beard care products
export async function generateStaticParams() {
  try {
    const { getBeardCareProducts } = await import('@/lib/category-api');
    const products = await getBeardCareProducts();
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for beard care products:', error);
    return [];
  }
}