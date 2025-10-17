'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddToCartButton from '@/components/AddToCartButton';
import ProductBadge from '@/components/ProductBadge';
import { Bundle } from '@/lib/supabase';
import Link from 'next/link';

interface BundlesSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  featured?: boolean;
}

export default function BundlesSection({ 
  title = "Special Bundles", 
  subtitle = "Save more with our curated product bundles",
  limit = 3,
  featured = true
}: BundlesSectionProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (featured) params.append('featured', 'true');
        if (limit && limit > 0) params.append('limit', limit.toString());
        
        const response = await fetch(`/api/bundles?${params}`);
        const data = await response.json();
        
        if (data.bundles) {
          setBundles(data.bundles);
        }
      } catch (error) {
        console.error('Error fetching bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [featured, limit]);

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

  if (loading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                <div className="aspect-square mb-8 bg-gray-200 rounded-xl"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show sample bundles only if no bundles are found AND we're not loading
  const sampleBundles = [
    {
      id: 'sample-1',
      title: 'Confidence Kit',
      short_description: 'Empire + Magnet Bar',
      price: 24,
      original_price: 27,
      images: ['https://images.pexels.com/photos/6621487/pexels-photo-6621487.jpeg?auto=compress&cs=tinysrgb&w=800'],
      is_featured: true,
      is_bestseller: false,
      is_active: true,
      in_stock: true,
      bundle_items: [],
      tags: [],
      category: 'bundles',
      inventory: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slug: 'confidence-kit',
      description: 'A perfect combination of our best-selling products for confident, healthy skin.'
    },
    {
      id: 'sample-2',
      title: 'Complete Care Bundle',
      short_description: 'Skin Rescue + Hair Oil + Tea',
      price: 42,
      original_price: 47,
      images: ['https://images.pexels.com/photos/7755552/pexels-photo-7755552.jpeg?auto=compress&cs=tinysrgb&w=800'],
      is_featured: true,
      is_bestseller: true,
      is_active: true,
      in_stock: true,
      bundle_items: [],
      tags: [],
      category: 'bundles',
      inventory: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slug: 'complete-care-bundle',
      description: 'Everything you need for complete wellness and beauty care.'
    }
  ];

  // Use real bundles if available, otherwise show sample bundles
  const displayBundles = bundles.length > 0 ? bundles : sampleBundles;

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-6">
            <Star className="w-5 h-5 text-[#D4AF37] mr-2" />
            <span className="text-gray-900 font-semibold text-sm">Special Offers</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayBundles.map((bundle, index) => (
            <Link key={bundle.id} href={`/bundle/${bundle.slug}`}>
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -15, scale: 1.02 }}
                className="group bg-white rounded-2xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl border border-[#D4AF37]/10 relative overflow-hidden cursor-pointer"
              >
              {/* Badge */}
              {bundle.is_bestseller && (
                <div className="absolute top-4 right-4 z-10">
                  <ProductBadge badge="bestseller" />
                </div>
              )}
              
              {bundle.is_featured && !bundle.is_bestseller && (
                <div className="absolute top-4 right-4 z-10">
                  <ProductBadge badge="featured" />
                </div>
              )}

              <div className="aspect-square mb-8 overflow-hidden rounded-xl relative">
                <img
                  src={bundle.images[0] || '/placeholder-product.jpg'}
                  alt={bundle.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {bundle.title}
                </h3>
                
                <p className="text-gray-600 text-sm font-medium line-clamp-2">
                  {bundle.short_description || bundle.description}
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold text-[#D4AF37]">
                    £{bundle.price}
                  </span>
                  {bundle.original_price && (
                    <span className="text-lg text-gray-500 line-through">
                      £{bundle.original_price}
                    </span>
                  )}
                </div>
                
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
                    className="w-full group bg-[#000000] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#6C7A61] hover:text-[#000000] text-white transition-all duration-500 transform hover:scale-105 rounded-xl font-bold"
                    size="md"
                  />
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

