'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductBadges } from '@/components/ProductBadge';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  short_description: string;
  rating: number;
  review_count: number;
  badges: string[];
  category: string;
}

interface BadgeProductsPageProps {
  badge: string;
  products: Product[];
}

const BADGE_LABELS = {
  best_selling: 'Best Selling',
  bestseller: 'Bestseller',
  trending: 'Trending',
  new: 'New',
  sale: 'Sale',
  limited: 'Limited Edition',
  featured: 'Featured',
  organic: 'Organic',
  premium: 'Premium',
  popular: 'Popular'
};

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

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <Link href={`/${product.category}/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{product.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 z-10"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          {/* Product Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-3 left-3">
              <ProductBadges badges={product.badges} maxBadges={2} />
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#D4AF37] transition-colors cursor-pointer hover:underline">
            {product.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.short_description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-[#D4AF37]">£{product.price}</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
              <span className="text-sm text-gray-500 ml-1">({product.rating || 4.8})</span>
            </div>
          </div>

          <Button
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-3 rounded-full transition-all duration-200 hover:scale-105"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Add to cart:', product.title);
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default function BadgeProductsPage({ badge, products }: BadgeProductsPageProps) {
  const badgeLabel = BADGE_LABELS[badge as keyof typeof BADGE_LABELS] || badge;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {badgeLabel} Products
            </h1>
            <p className="text-lg text-gray-600">
              Discover our collection of {badgeLabel.toLowerCase()} products
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#D4AF37] text-black">
                {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-gray-400">🏷️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {badgeLabel} Products Found
            </h3>
            <p className="text-gray-600 mb-6">
              We don't have any products with the "{badgeLabel}" badge at the moment.
            </p>
            <Link href="/">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}








