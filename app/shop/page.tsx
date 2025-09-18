'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Star, ShoppingCart, Heart, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// Product Card Component
const ProductCard = ({ product, index }: { product: any; index: number }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] flex items-center justify-center">
          <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{product.name.charAt(0)}</span>
          </div>
        </div>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        {product.badge && (
          <div className="absolute top-3 left-3 bg-[#D4AF37] text-black px-2 py-1 rounded-full text-xs font-semibold">
            {product.badge}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#D4AF37] transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.benefit}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-[#D4AF37]">£{product.price}</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
            ))}
            <span className="text-sm text-gray-500 ml-1">(4.8)</span>
          </div>
        </div>
        
        <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-3 rounded-full transition-all duration-200 hover:scale-105">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

// Category Section Component
const CategorySection = ({ title, subtitle, products }: { title: string; subtitle: string; products: any[] }) => {
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={containerVariants}
      >
        {products.map((product, index) => (
          <ProductCard key={product.name} product={product} index={index} />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default function ShopPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const categories = [
    { id: 'soaps', label: 'Soaps' },
    { id: 'teas', label: 'Teas' },
    { id: 'oils', label: 'Oils' },
    { id: 'lotions', label: 'Lotions' },
    { id: 'shampoo', label: 'Shampoo' },
    { id: 'beard', label: 'Beard' },
    { id: 'rollons', label: 'Roll-Ons' },
    { id: 'all', label: 'All' }
  ];

  const filterTags = [
    { id: 'vegan', label: 'Vegan', icon: '✅' },
    { id: 'bestseller', label: 'Bestseller', icon: '🔥' },
    { id: 'sensitive', label: 'Sensitive Skin', icon: '🌿' },
    { id: 'dry', label: 'Dry Skin', icon: '💧' },
    { id: 'daily', label: 'Daily Use', icon: '🧴' }
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Product Data
  const soapBars = [
    { name: "Empire Bar", price: 12, benefit: "Masculine daily cleanser", badge: "Bestseller" },
    { name: "Magnet Bar", price: 12, benefit: "Seductive attraction bar", badge: "Popular" },
    { name: "Acne Bar", price: 12, benefit: "Breakout control" },
    { name: "Hyperpigmentation Bar", price: 12, benefit: "Evens tone" },
    { name: "Eczema Bar", price: 12, benefit: "Soothing and gentle" },
    { name: "Skin Rescue Bar", price: 14, benefit: "For damaged skin", badge: "New" },
    { name: "Charcoal Detox Bar", price: 12, benefit: "Deep pore cleanse" },
    { name: "Gold Leaf Bar", price: 16, benefit: "Luxury glow", badge: "Premium" },
    { name: "Clarity Bar", price: 12, benefit: "Focus and refresh" },
    { name: "Money Bar", price: 14, benefit: "Energetic cleanser" },
    { name: "Root Healing Bar", price: 14, benefit: "Grounding bar" },
    { name: "Cacao Bar", price: 14, benefit: "Antioxidant-rich" },
    { name: "Dandelion Detox Bar", price: 13, benefit: "Skin detox" },
    { name: "Versace Red Clone Bar", price: 16, benefit: "Signature fragrance", badge: "Limited" }
  ];

  const herbalTeas = [
    { name: "Fat Loss Tea", price: 10, benefit: "Supports metabolism", badge: "Bestseller" },
    { name: "Immunity Tea", price: 10, benefit: "Strengthens defense" },
    { name: "Energy Tea", price: 10, benefit: "Natural energy boost" },
    { name: "Cognitive Clarity Tea", price: 12, benefit: "Mental sharpness", badge: "New" },
    { name: "Skin Glow Tea", price: 11, benefit: "Clears skin from within" }
  ];

  const hairBodyOils = [
    { name: "Herbal Hair Oil", price: 15, benefit: "Growth + scalp health", badge: "Popular" },
    { name: "Body Glow Oil", price: 14, benefit: "Moisturising full-body oil" },
    { name: "CBD Repair Oil", price: 18, benefit: "Pain relief + moisture", badge: "Premium" },
    { name: "Beard Growth Oil", price: 16, benefit: "For strong, thick beards" },
    { name: "Anti-Itch Scalp Oil", price: 14, benefit: "Soothes flakes and irritation" }
  ];

  const beardCare = [
    { name: "Beard Elixir", price: 16, benefit: "Premium conditioning", badge: "Bestseller" },
    { name: "Attraction Roll-On", price: 12, benefit: "Long-lasting herbal fragrance" },
    { name: "Freshness Roll-On", price: 10, benefit: "Herbal deodorant" }
  ];

  const herbalLotions = [
    { name: "Skin Therapy Lotion", price: 14, benefit: "Deep hydration" },
    { name: "Brightening Lotion", price: 15, benefit: "Evens skin tone", badge: "New" },
    { name: "Eczema Relief Lotion", price: 14, benefit: "For sensitive skin" },
    { name: "CBD Recovery Lotion", price: 18, benefit: "Relax muscles and nourish skin", badge: "Premium" }
  ];

  const shampoosConditioners = [
    { name: "Herbal Shampoo", price: 12, benefit: "Cleans without stripping" },
    { name: "Growth Conditioner", price: 13, benefit: "Strengthens roots", badge: "Popular" },
    { name: "Hydrating Conditioner", price: 13, benefit: "Deep moisture" }
  ];

  const elixirsRollOns = [
    { name: "Calm Focus Elixir", price: 10, benefit: "Mind clarity" },
    { name: "Sleep Roll-On", price: 10, benefit: "Nighttime relaxation", badge: "Bestseller" },
    { name: "Rise & Shine Roll-On", price: 10, benefit: "Morning boost" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
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
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-white/50 w-80"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Category Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-[#D4AF37] text-black shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
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
            {filterTags.map((filter) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent">
                <option>All Skin Types</option>
                <option>Sensitive</option>
                <option>Oily</option>
                <option>Dry</option>
                <option>Combination</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent">
                <option>All Products</option>
                <option>Soaps</option>
                <option>Teas</option>
                <option>Oils</option>
                <option>Lotions</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent">
                <option>All Prices</option>
                <option>Under £15</option>
                <option>£15 - £20</option>
                <option>Over £20</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#D4AF37] text-black' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#D4AF37] text-black' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {(selectedCategory === 'all' || selectedCategory === 'soaps') && (
          <CategorySection
            title="Soap Bars"
            subtitle="Powerful formulas for every skin goal."
            products={soapBars}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'teas') && (
          <CategorySection
            title="Herbal Teas"
            subtitle="Drink your way to balance."
            products={herbalTeas}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'oils') && (
          <CategorySection
            title="Hair & Body Oils"
            subtitle="Nourish from root to tip."
            products={hairBodyOils}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'beard') && (
          <CategorySection
            title="Beard Oils & Roll-Ons"
            subtitle="Groom like royalty."
            products={beardCare}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'lotions') && (
          <CategorySection
            title="Natural Lotions"
            subtitle="Hydrate, heal, and protect."
            products={herbalLotions}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'shampoo') && (
          <CategorySection
            title="Shampoos & Conditioners"
            subtitle="Gentle on scalp, rich in nutrients."
            products={shampoosConditioners}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'rollons') && (
          <CategorySection
            title="Elixirs & Aromatherapy"
            subtitle="On-the-go healing + scent rituals."
            products={elixirsRollOns}
          />
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