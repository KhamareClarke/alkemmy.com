'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSoaps, Soap } from '@/lib/category-api';
import ProductFilters from '@/components/ProductFilters';
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


export default function SoapsPage() {
  const [products, setProducts] = useState<Soap[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Soap[]>([]);
  const [loading, setLoading] = useState(true);

  // Get product IDs for fetching ratings
  const productIds = filteredProducts.map(product => product.id);
  const { ratings, loading: ratingsLoading } = useProductRatings(productIds);

  useEffect(() => {
    const loadSoaps = async () => {
      try {
        setLoading(true);
        const soaps = await getSoaps();
        setProducts(soaps);
        setFilteredProducts(soaps);
      } catch (error) {
        console.error('Error loading soaps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSoaps();
  }, []);

  const handleFiltersChange = (filters: Record<string, string[]>) => {
    let filtered = [...products];

    // Apply filters
    Object.entries(filters).forEach(([filterName, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter(product => {
          switch (filterName) {
            case 'Skin Type':
              return selectedValues.includes(product.skin_type || '');
            case 'Key Ingredient':
              // Check both predefined soap_type and custom ingredients in tags/description
              return selectedValues.includes(product.soap_type || '') ||
                     selectedValues.some(ingredient => 
                       product.tags?.some(tag => tag.toLowerCase().includes(ingredient.toLowerCase())) ||
                       product.description?.toLowerCase().includes(ingredient.toLowerCase()) ||
                       product.short_description?.toLowerCase().includes(ingredient.toLowerCase())
                     );
            case 'Concern':
              return selectedValues.includes(product.concern || '');
            case 'Fragrance':
              return selectedValues.includes(product.scent || '');
            default:
              return true;
          }
        });
      }
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading soaps...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🧼 Soaps</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Natural bar soaps for every skin type. Handcrafted with premium ingredients for a luxurious cleansing experience.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters 
              category="soaps" 
              onFiltersChange={handleFiltersChange}
              className="sticky top-8"
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {products.length === 0 ? 'No soaps found.' : 'No soaps match your filters.'}
                </p>
                {products.length > 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your filters to see more results.
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {filteredProducts.length} of {products.length} soaps
                </p>
              </div>
            )}
            
            {filteredProducts.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      ...product,
                      category: 'soaps',
                      is_bestseller: product.badges?.includes('Bestseller') || false
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
      </div>
    </div>
  );
}
