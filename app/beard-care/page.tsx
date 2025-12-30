'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBeardCareProducts, BeardCare } from '@/lib/category-api';
import { ProductBadges } from '@/components/ProductBadge';
import ProductCard from '@/components/ProductCard';
import { useProductRatings } from '@/hooks/useProductRatings';
import Link from 'next/link';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};


export default function BeardCarePage() {
  const [products, setProducts] = useState<BeardCare[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BeardCare[]>([]);
  const [loading, setLoading] = useState(true);

  // Get product IDs for fetching ratings
  const productIds = filteredProducts.map(product => product.id);
  const { ratings, loading: ratingsLoading } = useProductRatings(productIds);

  useEffect(() => {
    const loadBeardCare = async () => {
      try {
        setLoading(true);
        const beardCare = await getBeardCareProducts();
        setProducts(beardCare);
        setFilteredProducts(beardCare);
      } catch (error) {
        console.error('Error loading beard care products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBeardCare();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beard care products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🧔 Beard Care</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete grooming solutions for men. Premium beard oils, balms, and care products for the modern gentleman.
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {products.length === 0 ? 'No beard care products found.' : 'No beard care products match your filters.'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  title: product.title,
                  slug: product.slug,
                  price: product.price,
                  images: product.images,
                  short_description: product.short_description,
                  in_stock: product.in_stock,
                  inventory: product.inventory,
                  category: 'beard-care'
                }} 
                index={index}
                averageRating={ratings[product.id]?.averageRating || 0}
                totalReviews={ratings[product.id]?.totalReviews || 0}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
