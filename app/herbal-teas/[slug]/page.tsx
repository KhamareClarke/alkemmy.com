import React from 'react';
import { notFound } from 'next/navigation';
import { getHerbalTeaBySlug, getRelatedHerbalTeas } from '@/lib/category-api';
import ProductClientPage from './ProductClientPage';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface HerbalTeaPageProps {
  params: {
    slug: string;
  };
}

export default async function HerbalTeaPage({ params }: HerbalTeaPageProps) {
  const { slug } = params;
  
  try {
    const [product, relatedProducts] = await Promise.all([
      getHerbalTeaBySlug(slug),
      getRelatedHerbalTeas(slug)
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
    console.error('Error loading herbal tea product:', error);
    notFound();
  }
}

// Generate static params for all herbal tea products
export async function generateStaticParams() {
  try {
    const { getHerbalTeas } = await import('@/lib/category-api');
    const teas = await getHerbalTeas();
    return teas.map((tea) => ({
      slug: tea.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for herbal teas:', error);
    return [];
  }
}




