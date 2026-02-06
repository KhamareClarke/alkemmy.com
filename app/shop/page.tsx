import React, { Suspense } from 'react';
import { getAllProducts, getCategories, getTags } from '@/lib/products';
import ShopClient from './ShopClient';

// Server Component - fetches data on server for instant display
// Products appear immediately when page loads - no loading state!
export default async function ShopPage() {
  // Fetch all data on the server - products appear immediately!
  const [products, categories, tags] = await Promise.all([
    getAllProducts({ in_stock: true }),
    getCategories(),
    getTags(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    }>
      <ShopClient 
        initialProducts={products}
        initialCategories={categories}
        initialTags={tags}
      />
    </Suspense>
  );
}
