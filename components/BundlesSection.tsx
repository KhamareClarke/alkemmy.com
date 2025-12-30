'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductQuantityControls from '@/components/ProductQuantityControls';
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
  title = "Curated Selections", 
  subtitle = "Formulations chosen by most clients",
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
      <section className="py-24 bg-charcoal parchment-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white/90 mb-6 elite-spacing">
              {title}
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto elite-spacing">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-charcoal-light rounded-sm cinematic-shadow p-8 animate-pulse border border-gold/10">
                <div className="aspect-square mb-8 bg-charcoal rounded-sm"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-charcoal rounded"></div>
                  <div className="h-4 bg-charcoal rounded"></div>
                  <div className="h-8 bg-charcoal rounded"></div>
                  <div className="h-12 bg-charcoal rounded"></div>
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
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 elite-spacing leading-[1.1]">
            <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">{title}</span>
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-6" />
          <p className="text-base text-white/60 font-bold max-w-xl mx-auto leading-relaxed">{subtitle}</p>
        </motion.div>

        {/* Horizontal Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{
              x: [0, -100 * displayBundles.length + '%']
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 120,
                ease: "linear"
              }
            }}
          >
            {[...displayBundles, ...displayBundles].map((bundle, index) => (
              <motion.div
                key={`${bundle.id}-${index}`}
                className="group relative flex-shrink-0 w-[380px]"
              >
                <Link href={`/bundle/${bundle.slug}`}>
                  <div className="aspect-[3/4] mb-5 overflow-hidden relative rounded-sm">
                    {/* Background Image */}
                    <img
                      src={bundle.images[0] || '/placeholder-product.jpg'}
                      alt={bundle.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/50 to-transparent" />
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-serif font-bold mb-2 elite-spacing bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">
                        {bundle.title}
                      </h3>
                      <p className="text-sm font-medium text-white/60 mb-4">
                        £{bundle.price}
                      </p>
                      <Button
                        className="bg-gold-button text-charcoal font-bold px-8 py-4 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105 w-full"
                      >
                        {bundle.in_stock || bundle.is_active ? 'View Bundle' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

