'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Star, ShoppingCart, Heart, Search, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllProducts, getCategories, getTags } from '@/lib/products';
import { Product, ProductFilters } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { useProductRatings } from '@/hooks/useProductRatings';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};


// Category Section Component
const CategorySection = ({ title, subtitle, products, ratings, viewMode }: { title: string; subtitle: string; products: any[]; ratings: any; viewMode: 'grid' | 'list' }) => {
  return (
    <motion.section 
      className="mb-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </motion.div>
      
      <motion.div 
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }
        variants={containerVariants}
      >
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index}
            averageRating={ratings[product.id]?.averageRating || 0}
            totalReviews={ratings[product.id]?.totalReviews || 0}
            viewMode={viewMode}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Get product IDs for fetching ratings
  const productIds = products.map(product => product.id);
  const { ratings, loading: ratingsLoading } = useProductRatings(productIds);

  // Dynamic filter tags based on available tags in database
  const filterTags = availableTags.slice(0, 8).map(tag => {
    const iconMap: Record<string, string> = {
      'Vegan': '✅',
      'Bestseller': '🔥',
      'Handmade': '🌿',
      'Daily Use': '💧',
      'Premium': '🧴',
      'Natural': '🌱',
      'Organic': '🌿',
      'Sulfate Free': '🚫',
      'Fragrance Free': '🌸',
      'Hypoallergenic': '🛡️',
      'Cruelty Free': '🐰',
      'Eco Friendly': '🌍'
    };
    
    return {
      id: tag,
      label: tag,
      icon: iconMap[tag] || '🏷️'
    };
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load initial data and check URL parameters
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, tagsData] = await Promise.all([
          getAllProducts(),
          getCategories(),
          getTags()
        ]);
        
        setProducts(productsData);
        setCategories(['all', ...categoriesData]);
        setAvailableTags(tagsData);
        
        // Check for category parameter in URL
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Filter products based on current filters
  useEffect(() => {
    const filterProducts = async () => {
      try {
        setLoading(true);
        const filters: ProductFilters = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          tags: selectedFilters.length > 0 ? selectedFilters : undefined,
          search: debouncedSearchTerm || undefined,
          in_stock: true
        };

        const filteredProducts = await getAllProducts(filters);
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error filtering products:', error);
      } finally {
        setLoading(false);
      }
    };

    filterProducts();
  }, [selectedCategory, selectedFilters, debouncedSearchTerm]);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header with Home Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Complete Alkhemmy Collection
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Handcrafted herbal wellness products for every aspect of your self-care journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-white/50 w-80 text-black placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results Indicator */}
      {searchTerm && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Search results for "{searchTerm}"
                </span>
                <span className="text-blue-600 text-sm">
                  ({products.length} {products.length === 1 ? 'product' : 'products'} found)
                </span>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Indicator */}
      {selectedFilters.length > 0 && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">
                  Active filters: {selectedFilters.join(', ')}
                </span>
                <span className="text-green-600 text-sm">
                  ({products.length} {products.length === 1 ? 'product' : 'products'} found)
                </span>
              </div>
              <button
                onClick={() => setSelectedFilters([])}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Category Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-[#D4AF37] text-black shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-600 mr-2">Quick Filters:</span>
            {filterTags.length > 0 ? (
              filterTags.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedFilters.includes(filter.id)
                      ? 'bg-[#D4AF37] text-black shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                  {selectedFilters.includes(filter.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))
            ) : (
              <span className="text-sm text-gray-500">No filters available</span>
            )}
            {selectedFilters.length > 0 && (
              <button
                onClick={() => setSelectedFilters([])}
                className="flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
              >
                <span>✕</span>
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Results count */}
            <div className="text-sm text-gray-600">
              {!loading && (
                <span>
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </span>
              )}
            </div>
            
            {/* View toggle */}
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600 mr-2 hidden sm:inline">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-[#D4AF37] text-black shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-[#D4AF37] text-black shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : selectedCategory === 'all' ? (
          // Show all categories
          Object.entries(productsByCategory).map(([category, categoryProducts]) => (
          <CategorySection
              key={category}
              title={category}
              subtitle={`Discover our ${category.toLowerCase()} collection.`}
              products={categoryProducts as Product[]}
              ratings={ratings}
              viewMode={viewMode}
            />
          ))
        ) : (
          // Show specific category
          productsByCategory[selectedCategory] && (
          <CategorySection
              title={selectedCategory}
              subtitle={`Discover our ${selectedCategory.toLowerCase()} collection.`}
              products={productsByCategory[selectedCategory]}
              ratings={ratings}
              viewMode={viewMode}
            />
          )
        )}
        
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your search or filters</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedFilters([]);
                setSelectedCategory('all');
              }}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-6 py-3 rounded-full"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-gray-900 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Stay Connected</h2>
            <p className="text-xl mb-8 opacity-90">
              Get exclusive offers, new product launches, and herbal wellness tips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full text-black focus:ring-2 focus:ring-[#D4AF37] border-0"
              />
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-8 py-3 rounded-full">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}