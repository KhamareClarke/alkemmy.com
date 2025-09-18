'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, Leaf, Droplets, Sparkles, Heart, Star, ArrowRight, Check, Instagram, Facebook, Bot, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Home', 'Shop', 'Bundles', 'About', 'Contact'];

  const productCategories = [
    {
      id: 1,
      name: 'Soaps',
      description: 'Natural bar soaps for every skin type',
      icon: '🧼',
      gradient: 'from-amber-50 to-amber-100',
      link: '/shop#soaps'
    },
    {
      id: 2,
      name: 'Herbal Teas',
      description: 'Wellness blends for mind and body',
      icon: '🍃',
      gradient: 'from-green-50 to-green-100',
      link: '/shop#teas'
    },
    {
      id: 3,
      name: 'Lotions',
      description: 'Nourishing creams and moisturizers',
      icon: '🧴',
      gradient: 'from-blue-50 to-blue-100',
      link: '/shop#lotions'
    },
    {
      id: 4,
      name: 'Hair & Body Oils',
      description: 'Cold-pressed oils for deep nourishment',
      icon: '💧',
      gradient: 'from-purple-50 to-purple-100',
      link: '/shop#oils'
    },
    {
      id: 5,
      name: 'Beard Care',
      description: 'Complete grooming solutions for men',
      icon: '🧔',
      gradient: 'from-orange-50 to-orange-100',
      link: '/shop#beard'
    },
    {
      id: 6,
      name: 'Shampoos & Conditioners',
      description: 'Gentle cleansing for healthy hair',
      icon: '🚿',
      gradient: 'from-teal-50 to-teal-100',
      link: '/shop#hair'
    },
    {
      id: 7,
      name: 'Roll-ons',
      description: 'Targeted treatments on-the-go',
      icon: '⚡',
      gradient: 'from-pink-50 to-pink-100',
      link: '/shop#rollons'
    },
    {
      id: 8,
      name: 'Elixirs',
      description: 'Concentrated herbal wellness shots',
      icon: '🌟',
      gradient: 'from-indigo-50 to-indigo-100',
      link: '/shop#elixirs'
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Empire Bar',
      benefit: 'Confidence in every cleanse',
      price: '£12',
      originalPrice: '£15',
      badge: 'Bestseller',
      image: 'https://images.pexels.com/photos/6621487/pexels-photo-6621487.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 2,
      name: 'Magnet Bar',
      benefit: 'Draws out impurities naturally',
      price: '£15',
      badge: 'New',
      image: 'https://images.pexels.com/photos/7755552/pexels-photo-7755552.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 3,
      name: 'Skin Rescue Bar',
      benefit: 'Gentle healing for sensitive skin',
      price: '£14',
      badge: 'Popular',
      image: 'https://images.pexels.com/photos/7755408/pexels-photo-7755408.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 4,
      name: 'Fat Loss Tea',
      benefit: 'Natural metabolism support',
      price: '£18',
      badge: 'Trending',
      image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const testimonials = [
    {
      name: 'Tasha, Birmingham',
      quote: 'The Empire Bar completely transformed my skin. I get compliments daily now!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Marcus, London',
      quote: 'Finally found beard care that actually works. The oils are incredible.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Priya, Manchester',
      quote: 'The herbal teas have become part of my daily wellness routine. Love them!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] text-[#000000] text-center py-3 px-4 text-sm font-medium"
      >
        ✨ Free UK shipping on orders over £35 • New customers get 15% off with code WELCOME15
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl border-b border-[#D4AF37]/10 shadow-lg' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#000000] to-[#D4AF37] bg-clip-text text-transparent tracking-tight">
                Alkhemmy
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-[#1E1E1E] hover:text-[#D4AF37] px-4 py-2 text-sm font-semibold transition-all duration-300 relative group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                  </motion.a>
                ))}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="group relative text-[#1E1E1E] hover:text-[#D4AF37] transition-colors duration-300 p-2 flex items-center gap-2 bg-gradient-to-r from-[#D4AF37]/10 to-[#6C7A61]/10 rounded-full px-4 py-2 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
                >
                  <Bot className="h-5 w-5" />
                  <span className="text-sm font-semibold">AI Matcher</span>
                  <Zap className="h-4 w-4 text-[#D4AF37]" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="relative text-[#1E1E1E] hover:text-[#D4AF37] transition-colors duration-300 p-2"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#000000] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    0
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#1E1E1E] hover:text-[#D4AF37] transition-colors duration-300 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#D4AF37]/10"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[#1E1E1E] hover:text-[#D4AF37] block px-4 py-3 text-base font-semibold transition-colors duration-300 rounded-lg hover:bg-[#F4EBD0]/50"
                >
                  {item}
                </a>
              ))}
              <div className="px-4 py-3">
                <div className="flex items-center text-[#1E1E1E]">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Cart (0)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-[#F4EBD0] via-white to-[#F4EBD0] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-[#D4AF37]/10 to-[#6C7A61]/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-[#6C7A61]/10 to-[#D4AF37]/10 rounded-full blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-8"
            >
              <Sparkles className="w-5 h-5 text-[#D4AF37] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Handcrafted with Ancient Wisdom</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#000000] mb-8 leading-tight"
            >
              Handcrafted Herbal Care
              <br />
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] bg-clip-text text-transparent">
                That Works
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl mb-12 text-[#1E1E1E]/80 font-light max-w-4xl mx-auto leading-relaxed"
            >
              Alkhemmy blends ancient plant knowledge with modern self-care. From soaps to teas, discover full-body wellness in every bottle.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-10 py-4 text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl rounded-full"
              >
                Shop All Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('categories')}
                className="group border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#000000] font-bold px-10 py-4 text-lg transition-all duration-500 rounded-full backdrop-blur-sm"
              >
                Explore Collections
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Category Grid */}
      <section id="categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 border border-[#D4AF37]/30 mb-6">
              <Leaf className="w-5 h-5 text-[#6C7A61] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Complete Wellness System</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-6">
              The Alkhemmy System — Head to Toe
            </h2>
            <p className="text-xl text-[#1E1E1E]/70 font-light max-w-3xl mx-auto">
              We don't just make soap. We create solutions — for skin, hair, body, and mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productCategories.map((category, index) => (
              <motion.a
                key={category.id}
                href={category.link}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -15, scale: 1.02 }}
                className={`group relative bg-gradient-to-br ${category.gradient} rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl border border-white/50 backdrop-blur-sm overflow-hidden`}
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#000000] mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-[#1E1E1E]/70 text-sm font-medium leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 inline-flex items-center text-[#D4AF37] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-24 bg-gradient-to-br from-[#F4EBD0] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-6">
              <Star className="w-5 h-5 text-[#D4AF37] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Customer Favorites</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-6">
              These Bestsellers Speak for Themselves
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -15 }}
                className="group bg-white rounded-2xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl border border-[#D4AF37]/10 relative overflow-hidden"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.badge === 'Bestseller' ? 'bg-[#D4AF37] text-[#000000]' :
                    product.badge === 'New' ? 'bg-[#6C7A61] text-white' :
                    product.badge === 'Popular' ? 'bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] text-[#000000]' :
                    'bg-[#000000] text-white'
                  }`}>
                    {product.badge}
                  </span>
                </div>

                <div className="aspect-square mb-8 overflow-hidden rounded-xl relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-[#000000] group-hover:text-[#D4AF37] transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  <p className="text-[#1E1E1E]/70 text-sm font-medium">
                    {product.benefit}
                  </p>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold text-[#D4AF37]">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-[#1E1E1E]/50 line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full group bg-[#000000] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#6C7A61] hover:text-[#000000] text-white transition-all duration-500 transform hover:scale-105 rounded-xl font-bold"
                  >
                    Add to Cart
                    <ShoppingCart className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button 
              size="lg"
              className="group bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-10 py-4 text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl rounded-full"
            >
              Shop All Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 border border-[#D4AF37]/30 mb-6">
              <Heart className="w-5 h-5 text-[#6C7A61] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Our Promise</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-8">
              The Alkhemmy Standard
            </h2>
            <p className="text-xl text-[#1E1E1E]/80 font-light max-w-4xl mx-auto leading-relaxed">
              Every product is handcrafted in small batches using organic ingredients, cold-pressed oils, and powerful herbal extracts. No shortcuts, no toxins — just nature doing what it does best.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Leaf className="h-12 w-12 text-[#6C7A61]" />,
                title: "100% Natural Ingredients",
                description: "Pure botanicals, no synthetic additives",
                gradient: "from-green-50 to-green-100"
              },
              {
                icon: <Heart className="h-12 w-12 text-[#D4AF37]" />,
                title: "Handmade in the UK",
                description: "Crafted with care in small batches",
                gradient: "from-amber-50 to-amber-100"
              },
              {
                icon: <Droplets className="h-12 w-12 text-[#6C7A61]" />,
                title: "No Sulphates or Parabens",
                description: "Clean formulas that respect your skin",
                gradient: "from-blue-50 to-blue-100"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group text-center p-10 rounded-2xl bg-gradient-to-br ${item.gradient} hover:shadow-2xl transition-all duration-500 border border-white/50 relative overflow-hidden`}
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#000000] mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-[#1E1E1E]/70 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-gradient-to-br from-[#F4EBD0] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-6">
              <Check className="w-5 h-5 text-[#6C7A61] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Why Choose Alkhemmy</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-6">
              Why Alkhemmy Works
            </h2>
            <p className="text-xl text-[#1E1E1E]/70 font-light max-w-3xl mx-auto">
              We don't just sell soap. We design skin confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🌱',
                title: '100% Natural Ingredients',
                description: 'Everything you need, nothing you don\'t.',
                gradient: 'from-green-50 to-green-100'
              },
              {
                icon: '🧼',
                title: 'Handcrafted Small Batches',
                description: 'Made with intention, not mass production.',
                gradient: 'from-amber-50 to-amber-100'
              },
              {
                icon: '🐰',
                title: 'Cruelty-Free & Vegan',
                description: 'Tested on skin, not animals.',
                gradient: 'from-pink-50 to-pink-100'
              },
              {
                icon: '🎯',
                title: 'Skin-Focused Formulas',
                description: 'Solutions, not just scents.',
                gradient: 'from-blue-50 to-blue-100'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -15, scale: 1.02 }}
                className={`group bg-gradient-to-br ${benefit.gradient} rounded-2xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl border border-white/50 relative overflow-hidden`}
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#000000] mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-[#1E1E1E]/70 font-medium leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 border border-[#D4AF37]/30 mb-6">
              <Sparkles className="w-5 h-5 text-[#D4AF37] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Special Offers</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-6">
              Bundle & Save
            </h2>
            <p className="text-xl text-[#1E1E1E]/70 font-light">
              Try more. Glow more. Save more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {[
              {
                name: 'Confidence Kit',
                products: 'Empire + Magnet Bar',
                price: '£24',
                originalPrice: '£27',
                savings: 'Save £3',
                image: 'https://images.pexels.com/photos/6621487/pexels-photo-6621487.jpeg?auto=compress&cs=tinysrgb&w=800',
                gradient: 'from-amber-50 to-amber-100'
              },
              {
                name: 'Complete Care Bundle',
                products: 'Skin Rescue + Hair Oil + Tea',
                price: '£42',
                originalPrice: '£47',
                savings: 'Save £5',
                image: 'https://images.pexels.com/photos/7755552/pexels-photo-7755552.jpeg?auto=compress&cs=tinysrgb&w=800',
                gradient: 'from-green-50 to-green-100'
              }
            ].map((bundle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -15 }}
                className={`group bg-gradient-to-br ${bundle.gradient} rounded-2xl shadow-lg p-10 transition-all duration-500 hover:shadow-2xl border border-white/50 relative overflow-hidden`}
              >
                {/* Savings Badge */}
                <div className="absolute top-6 right-6 z-10">
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] text-[#000000] text-sm font-bold">
                    {bundle.savings}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="aspect-square mb-8 overflow-hidden rounded-xl">
                    <img
                      src={bundle.image}
                      alt={bundle.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="text-center space-y-6">
                    <h3 className="text-2xl font-bold text-[#000000] group-hover:text-[#D4AF37] transition-colors duration-300">
                      {bundle.name}
                    </h3>
                    
                    <p className="text-[#1E1E1E]/70 font-medium text-lg">
                      {bundle.products}
                    </p>
                    
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-3xl font-bold text-[#D4AF37]">
                        {bundle.price}
                      </span>
                      <span className="text-xl text-[#1E1E1E]/50 line-through">
                        {bundle.originalPrice}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full group bg-[#000000] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#6C7A61] hover:text-[#000000] text-white transition-all duration-500 transform hover:scale-105 rounded-xl font-bold py-4 text-lg"
                    >
                      Shop Bundle
                      <ShoppingCart className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Product Matcher Teaser */}
      <section className="py-24 bg-gradient-to-br from-[#000000] via-[#1E1E1E] to-[#000000] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-[#6C7A61]/20 to-[#D4AF37]/20 rounded-full blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-8">
              <Bot className="w-5 h-5 text-[#D4AF37] mr-2" />
              <span className="text-white font-semibold text-sm">Coming Soon</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Meet Your Perfect Match with
              <br />
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] bg-clip-text text-transparent">
                AI Product Matcher
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 text-white/80 font-light max-w-4xl mx-auto leading-relaxed">
              Answer 3 simple questions about your skin, hair, and wellness goals. Our AI instantly recommends the perfect Alkhemmy products tailored just for you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              {[
                {
                  step: "01",
                  title: "Tell Us About You",
                  description: "Skin type, concerns, and goals"
                },
                {
                  step: "02", 
                  title: "AI Analysis",
                  description: "Smart matching algorithm"
                },
                {
                  step: "03",
                  title: "Perfect Products",
                  description: "Personalized recommendations"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] flex items-center justify-center text-[#000000] font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-white/70 font-medium">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-10 py-4 text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl rounded-full"
              >
                <Bot className="mr-2 h-5 w-5" />
                Get Early Access
                <Zap className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="group border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#000000] font-bold px-10 py-4 text-lg transition-all duration-500 rounded-full backdrop-blur-sm"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-24 bg-gradient-to-br from-[#F4EBD0] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-6">
              <Star className="w-5 h-5 text-[#D4AF37] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Customer Love</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-6">
              What Real Customers Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#D4AF37]/10 relative overflow-hidden"
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-[#6C7A61]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-4 border-[#D4AF37] group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#D4AF37] fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-[#1E1E1E]/80 font-medium text-lg mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <cite className="text-[#000000] font-bold text-lg group-hover:text-[#D4AF37] transition-colors duration-300">
                    {testimonial.name}
                  </cite>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="py-24 bg-gradient-to-br from-[#000000] to-[#1E1E1E] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-[#6C7A61]/20 to-[#D4AF37]/20 rounded-full blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#6C7A61]/20 border border-[#D4AF37]/30 mb-8">
              <Sparkles className="w-5 h-5 text-[#D4AF37] mr-2" />
              <span className="text-white font-semibold text-sm">Exclusive Offer</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Unlock 10% Off Your First Order
            </h2>
            <p className="text-xl text-white/70 font-light mb-12 leading-relaxed">
              Plus exclusive offers and natural care tips — right to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-8 py-4 rounded-full border-2 border-[#D4AF37]/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300"
              />
              <Button 
                className="group bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-8 py-4 rounded-full transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl whitespace-nowrap"
              >
                Join The Alkhemmy Circle
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 border border-[#D4AF37]/30 mb-6">
              <Instagram className="w-5 h-5 text-[#6C7A61] mr-2" />
              <span className="text-[#1E1E1E] font-semibold text-sm">Social Community</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#000000] mb-6">
              Follow the Glow @alkhemmy.co
            </h2>
            <p className="text-xl text-[#1E1E1E]/70 font-light">
              Tag us to get featured.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {[
              'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/3685538/pexels-photo-3685538.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/3762873/pexels-photo-3762873.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/3685531/pexels-photo-3685531.jpeg?auto=compress&cs=tinysrgb&w=400'
            ].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group aspect-square overflow-hidden rounded-2xl border-4 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-500 relative"
              >
                <img
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button 
              size="lg"
              className="group bg-gradient-to-r from-[#6C7A61] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#6C7A61] text-white font-bold px-10 py-4 text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl rounded-full"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Follow @alkhemmy.co
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#000000] to-[#1E1E1E] text-white py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-[#D4AF37]/10 to-[#6C7A61]/10 rounded-full blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo & Tagline */}
            <div className="md:col-span-1">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] bg-clip-text text-transparent">
                Alkhemmy
              </h3>
              <p className="text-white/70 font-light text-lg leading-relaxed">
                Handcrafted Herbal Luxury
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300 p-2 rounded-full hover:bg-[#D4AF37]/10">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300 p-2 rounded-full hover:bg-[#D4AF37]/10">
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            {/* Shop Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#D4AF37]">Shop</h4>
              <ul className="space-y-3">
                {['All Products', 'Collections', 'Bestsellers', 'New Arrivals', 'Bundles'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300 font-medium">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#D4AF37]">Support</h4>
              <ul className="space-y-3">
                {['About Us', 'Contact', 'Shipping Policy', 'Returns', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/70 hover:text-[#D4AF37] transition-colors duration-300 font-medium">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#D4AF37]">Stay Connected</h4>
              <p className="text-white/70 font-light mb-4">
                Get the latest updates and exclusive offers.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-3 rounded-lg border border-[#D4AF37]/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300"
                />
                <Button 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold transition-all duration-300 rounded-lg"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#D4AF37]/20 mt-16 pt-8 text-center">
            <p className="text-white/70 font-light">
              © 2024 Alkhemmy. All rights reserved. Handcrafted with care in the UK.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          y: isScrolled ? 0 : 100
        }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-[#D4AF37]/20 px-6 py-3">
          <div className="flex items-center gap-6">
            <button className="group p-3 rounded-full hover:bg-[#D4AF37]/10 transition-all duration-300">
              <ShoppingCart className="h-5 w-5 text-[#1E1E1E] group-hover:text-[#D4AF37] transition-colors" />
            </button>
            <button className="group p-3 rounded-full hover:bg-[#D4AF37]/10 transition-all duration-300 relative">
              <Bot className="h-5 w-5 text-[#1E1E1E] group-hover:text-[#D4AF37] transition-colors" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse"></span>
            </button>
            <button className="group p-3 rounded-full hover:bg-[#D4AF37]/10 transition-all duration-300">
              <Heart className="h-5 w-5 text-[#1E1E1E] group-hover:text-[#D4AF37] transition-colors" />
            </button>
            <Button 
              size="sm"
              onClick={() => window.location.href = '/shop'}
              className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}