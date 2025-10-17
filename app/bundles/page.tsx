'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ShoppingCart, Grid, List, SortAsc, SortDesc, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddToCartButton from '@/components/AddToCartButton';
import ProductBadge from '@/components/ProductBadge';
import { Bundle } from '@/lib/supabase';
import Link from 'next/link';

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [showFeatured, setShowFeatured] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bundles');
        const data = await response.json();
        
        if (data.bundles) {
          setBundles(data.bundles);
          setFilteredBundles(data.bundles);
        }
      } catch (error) {
        console.error('Error fetching bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Filter and sort bundles
  useEffect(() => {
    let filtered = [...bundles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bundle =>
        bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Featured filter
    if (showFeatured) {
      filtered = filtered.filter(bundle => bundle.is_featured);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(bundle => {
        if (max) {
          return bundle.price >= min && bundle.price <= max;
        } else {
          return bundle.price >= min;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredBundles(filtered);
  }, [bundles, searchTerm, sortBy, priceRange, showFeatured]);

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setPriceRange('all');
    setShowFeatured(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">All Bundles</h1>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Bundles
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our curated product bundles designed to give you the best value and complete wellness experience.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bundles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-25">Under £25</SelectItem>
                  <SelectItem value="25-50">£25 - £50</SelectItem>
                  <SelectItem value="50-100">£50 - £100</SelectItem>
                  <SelectItem value="100">Over £100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <Button
              variant={showFeatured ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFeatured(!showFeatured)}
            >
              <Star className="w-4 h-4 mr-2" />
              Featured Only
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredBundles.length} bundle{filteredBundles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="aspect-square mb-4 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBundles.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredBundles.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex p-6' : 'p-6'
                }`}
              >
                <Link href={`/bundle/${bundle.slug}`} className="flex-1">
                  <div className={`${viewMode === 'list' ? 'flex gap-6' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} overflow-hidden rounded-lg mb-4`}>
                      <img
                        src={bundle.images[0] || '/placeholder-product.jpg'}
                        alt={bundle.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      {/* Badge */}
                      {bundle.is_bestseller && (
                        <div className="mb-2">
                          <ProductBadge badge="bestseller" />
                        </div>
                      )}
                      
                      {bundle.is_featured && !bundle.is_bestseller && (
                        <div className="mb-2">
                          <ProductBadge badge="featured" />
                        </div>
                      )}

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#D4AF37] transition-colors">
                        {bundle.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {bundle.short_description || bundle.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#D4AF37]">
                            £{bundle.price}
                          </span>
                          {bundle.original_price && (
                            <span className="text-sm text-gray-500 line-through">
                              £{bundle.original_price}
                            </span>
                          )}
                        </div>
                        {bundle.original_price && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                            Save £{bundle.original_price - bundle.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                
                <div className={`${viewMode === 'list' ? 'flex flex-col justify-center' : 'mt-4'}`}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton
                      product={{
                        id: bundle.id,
                        title: bundle.title,
                        images: bundle.images,
                        price: bundle.price,
                        category: bundle.category,
                        slug: bundle.slug,
                        in_stock: bundle.in_stock,
                        inventory: bundle.inventory,
                      }}
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg"
                      size="sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bundles found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}