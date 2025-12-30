'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Minus, ShoppingCart, Heart, Check, Share2, Sparkles, Info, Package, Gift, ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AddToCartButton from '@/components/AddToCartButton';
import StarRating from '@/components/StarRating';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';
import Link from 'next/link';
import { Bundle } from '@/lib/supabase';

interface BundleClientPageProps {
  bundle: Bundle;
  relatedBundles: Bundle[];
}

export default function BundleClientPage({ bundle, relatedBundles }: BundleClientPageProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch reviews data
  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${bundle.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [bundle.id]);

  // Handle scroll for floating cart
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 600;
      setShowFloatingCart(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateQuantity = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const savings = bundle.original_price ? bundle.original_price - bundle.price : 0;
  const savingsPercentage = bundle.original_price ? Math.round((savings / bundle.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Add to Cart Button */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: showFloatingCart ? 1 : 0,
          y: showFloatingCart ? 0 : 100
        }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-[#D4AF37]/20 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={bundle.images[0] || '/placeholder-product.jpg'} 
                alt={bundle.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{bundle.title}</p>
                <p className="text-[#D4AF37] font-bold">£{bundle.price}</p>
              </div>
            </div>
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
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold px-6 py-2 rounded-full"
              size="sm"
            />
          </div>
        </div>
      </motion.div>

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
            <Link href="/skin-matcher">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Skin Matcher
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{bundle.title}</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#D4AF37]">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/bundles" className="text-gray-500 hover:text-[#D4AF37]">Bundles</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{bundle.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={bundle.images[selectedImage] || '/placeholder-product.jpg'}
                alt={bundle.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {bundle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {bundle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-[#D4AF37]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${bundle.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Bundle Badge */}
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#D4AF37]" />
              <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-sm font-semibold">
                Bundle Deal
              </span>
              {bundle.is_bestseller && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Bestseller
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900">{bundle.title}</h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              {bundle.short_description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} size="lg" />
                <span className="text-sm text-gray-600">
                  ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-[#D4AF37]">£{bundle.price}</span>
                {bundle.original_price && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">£{bundle.original_price}</span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Save £{savings} ({savingsPercentage}%)
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {bundle.in_stock ? 'In Stock' : 'Out of Stock'} • {bundle.inventory} available
              </p>
            </div>

            {/* Bundle Items */}
            {bundle.bundle_items && bundle.bundle_items.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                  What's Included
                </h3>
                <div className="space-y-3">
                  {bundle.bundle_items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium">{item.product_name || `Product ID: ${item.product_id}`}</span>
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
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
                    <h3 className="font-bold text-gray-900 text-lg">Not sure if this bundle is right for you?</h3>
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

              <div className="flex gap-4">
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
                  className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-4 px-8 rounded-xl text-lg"
                  size="lg"
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-6 py-4 border-2 ${
                    isWishlisted 
                      ? 'border-red-500 text-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-4 border-2 border-gray-300 hover:border-[#D4AF37]"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Free UK Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">Handcrafted</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">100% Natural</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Details */}
        <div className="mt-16 space-y-12">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold mb-6">About This Bundle</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed text-lg">
                {bundle.description}
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What's included in this bundle?</AccordionTrigger>
                <AccordionContent>
                  This bundle includes {bundle.bundle_items?.length || 0} carefully selected products that work together to provide a complete wellness experience. Each item is handpicked for its quality and effectiveness.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How much do I save with this bundle?</AccordionTrigger>
                <AccordionContent>
                  {bundle.original_price ? (
                    <>You save £{savings} ({savingsPercentage}%) compared to buying each product individually. This represents excellent value for money while ensuring you have everything you need.</>
                  ) : (
                    <>This bundle offers great value by combining complementary products at a special price.</>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I customize this bundle?</AccordionTrigger>
                <AccordionContent>
                  This bundle is pre-curated for optimal results. However, you can purchase individual products separately if you prefer to customize your selection.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What if I'm not satisfied?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day satisfaction guarantee. If you're not completely happy with your bundle, you can return it for a full refund.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <ReviewsList productId={bundle.id} />
            <div className="mt-8">
              <ReviewForm productId={bundle.id} />
            </div>
          </div>
        </div>

        {/* Related Bundles */}
        {relatedBundles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBundles.map((relatedBundle) => (
                <motion.div
                  key={relatedBundle.id}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl border border-gray-100"
                >
                  <Link href={`/bundle/${relatedBundle.slug}`}>
                    <div className="aspect-square mb-4 overflow-hidden rounded-xl">
                      <img
                        src={relatedBundle.images[0] || '/placeholder-product.jpg'}
                        alt={relatedBundle.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {relatedBundle.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {relatedBundle.short_description}
                    </p>
                  </Link>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#D4AF37] font-bold text-lg">£{relatedBundle.price}</span>
                      {relatedBundle.original_price && (
                        <span className="text-gray-500 line-through text-sm">£{relatedBundle.original_price}</span>
                      )}
                    </div>
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      <AddToCartButton
                        product={{
                          id: relatedBundle.id,
                          title: relatedBundle.title,
                          images: relatedBundle.images,
                          price: relatedBundle.price,
                          category: relatedBundle.category,
                          slug: relatedBundle.slug,
                          in_stock: relatedBundle.in_stock,
                          inventory: relatedBundle.inventory,
                        }}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg text-sm"
                        size="sm"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
