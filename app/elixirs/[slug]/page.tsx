import React from 'react';
import { notFound } from 'next/navigation';
import { getElixirBySlug, getRelatedElixirs } from '@/lib/category-api';
import ProductClientPage from './ProductClientPage';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface ElixirPageProps {
  params: {
    slug: string;
  };
}

export default async function ElixirPage({ params }: ElixirPageProps) {
  const { slug } = params;
  
  try {
    const [product, relatedProducts] = await Promise.all([
      getElixirBySlug(slug),
      getRelatedElixirs(slug)
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
    console.error('Error loading elixir product:', error);
    notFound();
  }
}

// Generate static params for all elixir products
export async function generateStaticParams() {
  try {
    const { getElixirs } = await import('@/lib/category-api');
    const elixirs = await getElixirs();
    return elixirs.map((elixir) => ({
      slug: elixir.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for elixirs:', error);
    return [];
  }
}








