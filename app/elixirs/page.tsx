'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getElixirs, Elixir } from '@/lib/category-api';
import ProductFilters from '@/components/ProductFilters';
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


export default function ElixirsPage() {
  const [products, setProducts] = useState<Elixir[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Elixir[]>([]);
  const [loading, setLoading] = useState(true);

  // Get product IDs for fetching ratings
  const productIds = filteredProducts.map(product => product.id);
  const { ratings, loading: ratingsLoading } = useProductRatings(productIds);

  useEffect(() => {
    const loadElixirs = async () => {
      try {
        setLoading(true);
        const elixirs = await getElixirs();
        setProducts(elixirs);
        setFilteredProducts(elixirs);
      } catch (error) {
        console.error('Error loading elixirs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadElixirs();
  }, []);

  const handleFiltersChange = (filters: Record<string, string[]>) => {
    let filtered = [...products];

    // Apply filters
    Object.entries(filters).forEach(([filterName, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter(product => {
          switch (filterName) {
            case 'Elixir Type':
              return selectedValues.includes(product.elixir_type || '');
            case 'Benefits':
              return selectedValues.some(benefit => 
                product.benefits?.some(b => b.toLowerCase().includes(benefit.toLowerCase()))
              );
            case 'Key Ingredient':
              // Check both predefined main_ingredient and custom ingredients in tags/description
              return selectedValues.includes(product.main_ingredient || '') ||
                     selectedValues.some(ingredient => 
                       product.tags?.some(tag => tag.toLowerCase().includes(ingredient.toLowerCase())) ||
                       product.description?.toLowerCase().includes(ingredient.toLowerCase()) ||
                       product.short_description?.toLowerCase().includes(ingredient.toLowerCase())
                     );
            case 'Volume':
              return selectedValues.includes(product.volume_ml?.toString() || '');
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
          <p className="text-gray-600">Loading elixirs...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🌟 Elixirs</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Concentrated herbal wellness shots. Powerful elixirs for targeted health and wellness benefits.
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
              category="elixirs" 
              onFiltersChange={handleFiltersChange}
              className="sticky top-8"
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {products.length === 0 ? 'No elixirs found.' : 'No elixirs match your filters.'}
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
                  Showing {filteredProducts.length} of {products.length} elixirs
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
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: product.price,
                      images: product.images,
                      short_description: product.short_description,
                      in_stock: product.in_stock,
                      inventory: product.inventory,
                      category: 'elixirs'
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
