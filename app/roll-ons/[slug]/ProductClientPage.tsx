'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Check, ArrowLeft, Minus, Plus, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RollOn } from '@/lib/category-api';
import { getStockStatusText } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';

interface ProductClientPageProps {
  product: RollOn;
  relatedProducts: RollOn[];
}

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

const ProductCard = ({ product, index }: { product: RollOn; index: number }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <Link href={`/roll-ons/${product.slug}`} className="block">
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

export default function ProductClientPage({ product, relatedProducts }: ProductClientPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);


  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log('Wishlist:', product.title, isWishlisted ? 'removed from' : 'added to');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Link href="/skin-matcher">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Skin Matcher
              </Button>
            </Link>
            <Link href="/roll-ons">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Roll-ons
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-2xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">{product.title.charAt(0)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-[#D4AF37]' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#D4AF37] font-bold">{product.title.charAt(0)}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Roll-on</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

              {/* Product Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Product Highlights:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.badges.map((badge, index) => {
                      const badgeConfig = {
                        best_selling: { label: 'Best Selling', color: 'text-red-600' },
                        bestseller: { label: 'Bestseller', color: 'text-red-600' },
                        trending: { label: 'Trending', color: 'text-orange-600' },
                        new: { label: 'New', color: 'text-green-600' },
                        sale: { label: 'Sale', color: 'text-purple-600' },
                        limited: { label: 'Limited Edition', color: 'text-pink-600' },
                        featured: { label: 'Featured', color: 'text-blue-600' },
                        organic: { label: 'Organic', color: 'text-emerald-600' },
                        premium: { label: 'Premium', color: 'text-yellow-600' },
                        popular: { label: 'Popular', color: 'text-[#D4AF37]' }
                      };
                      
                      const config = badgeConfig[badge as keyof typeof badgeConfig];
                      if (!config) return null;
                      
                      return (
                        <a
                          key={index}
                          href={`/badges/${badge}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 ${config.color} border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer`}
                        >
                          {config.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                  <span className="text-gray-600 font-medium">({product.review_count} reviews)</span>
                </div>
              </div>

              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {product.short_description}
              </p>

              <div className="flex items-center space-x-3 mb-8">
                {product.in_stock && product.inventory > 0 ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
                <span className={`font-semibold text-lg ${
                  product.in_stock && product.inventory > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {getStockStatusText(product.in_stock, product.inventory)}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-[#D4AF37]">£{product.price}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Find Your Match */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Not sure if this is right for you?</h3>
                    <p className="text-gray-600">Let our AI help you find your perfect match</p>
                  </div>
                  <Link href="/skin-matcher">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Find My Match
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex space-x-4">
                <AddToCartButton
                  product={{
                    id: product.id,
                    title: product.title,
                    images: product.images,
                    price: product.price,
                    category: 'roll-ons',
                    slug: product.slug,
                    in_stock: product.in_stock,
                    inventory: product.inventory,
                  }}
                  quantity={quantity}
                  className="flex-1 py-4 rounded-full text-lg font-semibold"
                  size="lg"
                />
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className={`p-4 rounded-full ${isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-600'} hover:bg-gray-50`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Ingredients</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {product.ingredients?.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            {/* How to Use */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">How to Use</h3>
              <ul className="list-decimal list-inside text-gray-700 space-y-1">
                {product.how_to_use?.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">You might also like</h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}


