'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddToCartButton from './AddToCartButton';
import StarRating from './StarRating';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  short_description: string;
  in_stock: boolean;
  inventory: number;
  category: string;
  is_bestseller?: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
  averageRating?: number;
  totalReviews?: number;
  className?: string;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  averageRating = 0,
  totalReviews = 0,
  className = '',
  viewMode = 'grid'
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      >
        <Link href={`/product/${product.slug}`}>
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
              <div className="w-full h-full overflow-hidden bg-gray-100">
                <img
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {product.is_bestseller && (
                <div className="absolute top-2 left-2 bg-[#D4AF37] text-black px-2 py-1 rounded-full text-xs font-semibold">
                  Bestseller
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <Heart 
                  className={`w-3 h-3 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#D4AF37] transition-colors cursor-pointer hover:underline">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 sm:line-clamp-3">
                    {product.short_description}
                  </p>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    {averageRating > 0 ? (
                      <>
                        <StarRating rating={averageRating} size="sm" />
                        <span className="text-sm text-gray-500 ml-1">
                          ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                        </span>
                      </>
                    ) : (
                      <>
                        <StarRating rating={0} size="sm" />
                        <span className="text-sm text-gray-500 ml-1">(No reviews)</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end space-y-3">
                  <span className="text-2xl font-bold text-[#D4AF37]">£{product.price}</span>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      title: product.title,
                      images: product.images,
                      price: product.price,
                      category: product.category,
                      slug: product.slug,
                      in_stock: product.in_stock,
                      inventory: product.inventory,
                    }}
                    className="w-full sm:w-auto px-6 py-2 rounded-full transition-all duration-200 hover:scale-105"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {product.is_bestseller && (
            <div className="absolute top-3 left-3 bg-[#D4AF37] text-black px-2 py-1 rounded-full text-xs font-semibold">
              Bestseller
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
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
              {averageRating > 0 ? (
                <>
                  <StarRating rating={averageRating} size="sm" />
                  <span className="text-sm text-gray-500 ml-1">
                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <>
                  <StarRating rating={0} size="sm" />
                  <span className="text-sm text-gray-500 ml-1">(No reviews)</span>
                </>
              )}
            </div>
          </div>
          
          <AddToCartButton
            product={{
              id: product.id,
              title: product.title,
              images: product.images,
              price: product.price,
              category: product.category,
              slug: product.slug,
              in_stock: product.in_stock,
              inventory: product.inventory,
            }}
            className="w-full py-3 rounded-full transition-all duration-200 hover:scale-105"
            size="md"
          />
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
