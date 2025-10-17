'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Minus, ShoppingCart, Heart, Check, Share2, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getStockStatusText } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import StarRating from '@/components/StarRating';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';
import Link from 'next/link';
import { Product } from '@/lib/supabase';

interface ProductClientPageProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductClientPage({ product, relatedProducts }: ProductClientPageProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [hoveredIngredient, setHoveredIngredient] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch reviews data
  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${product.id}`);
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
  }, [product.id]);

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

  // Ingredient explanations
  const ingredientExplanations: { [key: string]: string } = {
    'Activated Charcoal': 'Draws out impurities and toxins from deep within pores for a thorough cleanse',
    'Tea Tree Oil': 'Natural antibacterial and antifungal properties help prevent breakouts',
    'Sandalwood': 'Calming and anti-inflammatory, reduces redness and soothes irritated skin',
    'Coconut Oil': 'Rich in fatty acids that deeply moisturize and create a protective barrier',
    'Shea Butter': 'Contains vitamins A and E, provides long-lasting hydration and healing',
    'Essential Oils': 'Natural aromatherapy benefits for mood enhancement and relaxation',
    'Ylang-Ylang': 'Balances oil production and promotes emotional well-being',
    'Rose Petals': 'Rich in antioxidants, tones skin and provides natural fragrance',
    'Jasmine Extract': 'Boosts confidence through aromatherapy while moisturizing skin',
    'Cocoa Butter': 'Deep moisturizing properties that improve skin elasticity',
    'Pink Clay': 'Gentle detoxification that removes impurities without over-drying',
    'Green Tea': 'Powerful antioxidants that protect against free radical damage',
    'Oolong Tea': 'Boosts metabolism and contains polyphenols for skin health',
    'Ginger Root': 'Stimulates circulation and aids in digestion and detoxification',
    'Cinnamon': 'Helps regulate blood sugar and has antimicrobial properties',
    'Cayenne Pepper': 'Increases thermogenesis and boosts metabolic rate naturally',
    'Lemon Balm': 'Calming herb that reduces stress and promotes relaxation'
  };

  const getIngredientName = (ingredient: string) => {
    return ingredient.split(' - ')[0];
  };

  const getIngredientExplanation = (ingredient: string) => {
    const name = getIngredientName(ingredient);
    return ingredientExplanations[name] || 'Natural ingredient with beneficial properties for skin and wellness';
  };

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
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-2xl rounded-2xl p-4 border border-gray-200"
        style={{ pointerEvents: showFloatingCart ? 'auto' : 'none' }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-xl shadow-md flex items-center justify-center">
            <span className="text-[#D4AF37] font-bold">{product.title.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{product.title}</p>
            <p className="text-[#D4AF37] font-bold">£{product.price}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(-1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => updateQuantity(1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </motion.div>

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#D4AF37] transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-[#D4AF37] transition-colors">Shop</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section - Clean 2-Column Layout */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Main Product Image */}
              <div className="aspect-square bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                <div className="w-64 h-64 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-6xl">{product.title.charAt(0)}</span>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex space-x-3 justify-center">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-[#D4AF37] shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    } bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] flex items-center justify-center`}
                  >
                    <span className="text-[#D4AF37] font-bold">{product.title.charAt(0)}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Category & Name */}
              <div>
                <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <StarRating rating={averageRating} size="lg" showNumber={true} />
                <span className="text-gray-600 font-medium">
                  ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Price */}
              <div className="text-4xl font-bold text-[#D4AF37] mb-6">£{product.price}</div>

              {/* Short Benefit */}
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {product.short_description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-6 mb-8">
                <span className="font-semibold text-gray-900 text-lg">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl">
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="p-3 hover:bg-gray-100 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="p-3 hover:bg-gray-100 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <AddToCartButton
                  product={{
                    id: product.id,
                    title: product.title,
                    images: product.images,
                    price: product.price,
                    category: 'products',
                    slug: product.slug,
                    in_stock: product.in_stock,
                    inventory: product.inventory,
                  }}
                  quantity={quantity}
                  className="flex-1 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  size="lg"
                />
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <button className="p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Share2 className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Stock Status */}
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Description Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why You'll Love This</h2>
            <div className="prose prose-xl max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Ingredients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.ingredients.map((ingredient: string, index: number) => (
                <div 
                  key={index} 
                  className="relative group cursor-help bg-white p-4 rounded-xl border border-gray-200 hover:border-[#D4AF37] hover:shadow-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredIngredient(ingredient)}
                  onMouseLeave={() => setHoveredIngredient(null)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-[#D4AF37] rounded-full flex-shrink-0"></div>
                    <p className="text-gray-700 font-medium group-hover:text-[#D4AF37] transition-colors flex-1">
                      {ingredient}
                    </p>
                    <Info className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  
                  {/* Tooltip */}
                  {hoveredIngredient === ingredient && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 mt-2 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-xl max-w-xs left-0"
                    >
                      {getIngredientExplanation(ingredient)}
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-900 rotate-45"></div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Use</h2>
            <div className="space-y-6">
              {product.how_to_use.map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="w-10 h-10 bg-[#D4AF37] text-black rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-lg pt-2">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "How often should I use this product?",
                  answer: "For best results, use daily as part of your morning or evening routine. Start with once daily and increase frequency as your skin adjusts."
                },
                {
                  question: "Is this suitable for sensitive skin?",
                  answer: "Yes, our products are formulated with natural ingredients that are gentle on sensitive skin. However, we recommend doing a patch test before first use."
                },
                {
                  question: "How long will one bar/bottle last?",
                  answer: "With daily use, one product typically lasts 4-6 weeks depending on usage frequency and amount used per application."
                },
                {
                  question: "Are your products vegan and cruelty-free?",
                  answer: "Absolutely! All our products are 100% vegan, cruelty-free, and made with ethically sourced natural ingredients."
                },
                {
                  question: "What if I'm not satisfied with my purchase?",
                  answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied, contact us for a full refund or exchange."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-gray-200 rounded-xl px-6 shadow-md">
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-[#D4AF37] py-6 text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reviews List */}
              <div className="lg:col-span-2">
                <ReviewsList productId={product.id} />
              </div>
              
              {/* Review Form */}
              <div>
                <ReviewForm 
                  productId={product.id} 
                  onReviewSubmitted={() => {
                    // Refresh reviews data
                    fetch(`/api/reviews?productId=${product.id}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.averageRating !== undefined) {
                          setAverageRating(data.averageRating);
                          setTotalReviews(data.totalReviews);
                        }
                      })
                      .catch(console.error);
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] flex items-center justify-center">
                    <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">{relatedProduct.title.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-2xl font-bold text-[#D4AF37]">£{relatedProduct.price}</span>
                    </div>
                    <Link href={`/product/${relatedProduct.slug}`}>
                      <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}