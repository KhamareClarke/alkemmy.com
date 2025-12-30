'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ArrowLeft, Trash2, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

interface WishlistItem {
  id: string;
  title: string;
  images: string[];
  price: number;
  original_price?: number;
  category: string;
  slug: string;
  in_stock: boolean;
  inventory: number;
  rating?: number;
  short_description?: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = (itemId: string) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== itemId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

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
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {wishlistItems.length === 0 ? (
          /* Empty Wishlist */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-16 h-16 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist and they'll appear here.
            </p>
            <Link href="/shop">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-8 py-4 text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl rounded-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Items */
          <>
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
                </h2>
                <p className="text-gray-600 mt-1">Products you've saved for later</p>
              </div>
              <Button
                onClick={clearWishlist}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] flex items-center justify-center relative">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{item.title.charAt(0)}</span>
                      </div>
                    )}
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.short_description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.short_description}
                      </p>
                    )}

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({item.rating})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-[#D4AF37]">£{item.price}</span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-gray-500 line-through text-sm">£{item.original_price}</span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      <span className={`text-sm font-medium ${
                        item.in_stock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/${item.category}/${item.slug}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                        >
                          View Details
                        </Button>
                      </Link>
                      {item.in_stock && (
                        <div className="flex-1">
                          <AddToCartButton
                            product={{
                              id: item.id,
                              title: item.title,
                              images: item.images || [],
                              price: item.price,
                              category: item.category,
                              slug: item.slug,
                              in_stock: item.in_stock,
                              inventory: item.inventory,
                            }}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-3 rounded-lg text-sm"
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-12 text-center">
              <Link href="/shop">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-8 py-4 text-lg transition-all duration-300 rounded-full"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
