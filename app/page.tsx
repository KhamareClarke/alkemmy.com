'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, ShoppingBag, Leaf, Droplets, Sparkles, Heart, Star, ArrowRight, Check, Instagram, Facebook, Bot, Zap, User, LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductBadge from '@/components/ProductBadge';
import CartButton from '@/components/CartButton';
import ProductQuantityControls from '@/components/ProductQuantityControls';
import BundlesSection from '@/components/BundlesSection';
import NewsletterSignup from '@/components/NewsletterSignup';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { useAuth } from '@/lib/auth-context';
import { getAllProducts } from '@/lib/products';
import { Product } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured products from database
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await getAllProducts();
        // Get 4 random products or products with high ratings
        const featured = products
          .filter(product => product.in_stock)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch recent reviews from database
  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await fetch('/api/reviews/recent?limit=3');
        const data = await response.json();
        if (data.reviews) {
          setRecentReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching recent reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);

  const navItems = ['Shop', 'Collections', 'About', 'Contact'];

  const productCategories = [
    {
      id: 1,
      name: 'Soaps',
      description: 'Cleansing bars for all skin classifications',
      image: '/images/categories/soaps.jpg',
      link: '/soaps'
    },
    {
      id: 2,
      name: 'Herbal Teas',
      description: 'Botanical infusions for internal balance',
      image: '/images/categories/herbal-teas.jpg',
      link: '/herbal-teas'
    },
    {
      id: 3,
      name: 'Lotions',
      description: 'Hydration systems for dermal application',
      image: '/images/categories/lotions.jpg',
      link: '/lotions'
    },
    {
      id: 4,
      name: 'Hair & Body Oils',
      description: 'Cold-pressed formulations for deep penetration',
      image: '/images/categories/oils.jpg',
      link: '/oils'
    },
    {
      id: 5,
      name: 'Beard Care',
      description: 'Grooming protocols for facial hair maintenance',
      image: '/images/categories/beard-care.jpg',
      link: '/beard-care'
    },
    {
      id: 6,
      name: 'Shampoos & Conditioners',
      description: 'Scalp and follicle treatment systems',
      image: '/images/categories/shampoos.jpg',
      link: '/shampoos'
    },
    {
      id: 7,
      name: 'Roll-ons',
      description: 'Precision delivery for targeted application',
      image: '/images/categories/roll-ons.jpg',
      link: '/roll-ons'
    },
    {
      id: 8,
      name: 'Elixirs',
      description: 'Concentrated botanical extracts',
      image: '/images/categories/elixirs.jpg',
      link: '/elixirs'
    }
  ];

  // Helper function to get product badge based on rating and other factors
  const getProductBadge = (product: Product, index: number) => {
    if (product.rating && product.rating >= 4.5) return 'Bestseller';
    if (index === 0) return 'Popular';
    if (index === 1) return 'New';
    if (index === 2) return 'Trending';
    return 'Featured';
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-matte-black cinematic-grain">
      {/* Announcement Bar with Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-matte-black border-b border-gold/10 py-3 px-4"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
          <h1 className="text-2xl font-serif font-bold text-metallic-gold elite-spacing">
            ALKHEMMY
          </h1>
          <span className="text-metallic-gold text-sm font-bold elite-spacing text-center">Complimentary UK delivery on orders exceeding £35</span>
          <div className="text-right">
            {user ? (
              <Link href="/profile" className="text-white/70 hover:text-white text-sm font-light tracking-wide transition-colors duration-300">
                Account
              </Link>
            ) : (
              <Link href="/auth/login" className="text-white/70 hover:text-white text-sm font-light tracking-wide transition-colors duration-300">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-charcoal/95 backdrop-blur-xl border-b border-gold/20 cinematic-shadow' 
            : 'bg-charcoal/90 backdrop-blur-sm border-b border-gold/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16 relative">
            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-10">
              {navItems.map((item, index) => (
                <motion.a
                  key={item}
                  href={item === 'Collections' ? '/bundles' : item === 'Shop' ? '/shop' : item === 'About' ? '/about' : item === 'Contact' ? '/contact' : '#'}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium tracking-wider transition-all duration-300 relative group uppercase"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-gold-structural transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
              ))}
            </div>

            {/* Right Side Icons - Absolute Position */}
            <div className="hidden md:flex items-center space-x-5 absolute right-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link href="/wishlist" className="text-white/80 hover:text-metallic-gold transition-all duration-300 group">
                  <Heart className="h-5 w-5 group-hover:fill-current" />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 }}
              >
                <Link href="/cart" className="text-white/80 hover:text-metallic-gold transition-all duration-300">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link href="/cart" className="relative text-white/80 hover:text-metallic-gold transition-all duration-300">
                  <ShoppingBag className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white/90 hover:text-gold transition-colors duration-300 p-2"
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
            className="md:hidden bg-matte-black/98 backdrop-blur-xl border-t border-[#b08a3c]/20"
          >
            <div className="px-6 pt-6 pb-8 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === 'Collections' ? '/bundles' : item === 'Shop' ? '/shop' : item === 'About' ? '/about' : item === 'Contact' ? '/contact' : '#'}
                  className="text-white/70 hover:text-white block px-4 py-3 text-sm font-light tracking-wide transition-colors duration-300"
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 border-t border-[#b08a3c]/10 mt-4">
                {user ? (
                  <Link href="/profile" className="text-white/50 hover:text-white block px-4 py-3 text-sm font-light tracking-wide transition-colors duration-300">
                    Account
                  </Link>
                ) : (
                  <Link href="/auth/login" className="text-white/50 hover:text-white block px-4 py-3 text-sm font-light tracking-wide transition-colors duration-300">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden cinematic-grain ambient-vignette">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-matte-black/50 to-matte-black pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 leading-[1.1] elite-spacing"
            >
              <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">Botanical</span> Formulations
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-20 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mb-4"
            />
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl mb-8 font-normal max-w-2xl mx-auto leading-relaxed tracking-wide"
              style={{color: 'var(--warm-white-80)'}}
            >
              Precision-crafted botanical solutions for modern wellness
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <Link href="/shop">
                <Button 
                  size="lg" 
                  className="bg-gold-button text-charcoal font-bold px-16 py-7 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105 hover:shadow-2xl"
                >
                  Explore Collection
                </Button>
              </Link>
              <p className="text-sm font-medium tracking-wide elite-spacing" style={{color: 'var(--warm-white-60)'}}>
                Browse our complete range of formulations
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Authority Section */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <Check className="h-8 w-8 text-gold-structural mb-3" />
              <h4 className="text-sm font-bold text-white mb-1 elite-spacing uppercase tracking-widest">Certified</h4>
              <p className="text-xs text-white/40 font-light">GMP Compliant</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <Check className="h-8 w-8 text-gold-structural mb-3" />
              <h4 className="text-sm font-bold text-white mb-1 elite-spacing uppercase tracking-widest">Cruelty Free</h4>
              <p className="text-xs text-white/40 font-light">No Animal Testing</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <Check className="h-8 w-8 text-gold-structural mb-3" />
              <h4 className="text-sm font-bold text-white mb-1 elite-spacing uppercase tracking-widest">UK Made</h4>
              <p className="text-xs text-white/40 font-light">British Standards</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <Check className="h-8 w-8 text-gold-structural mb-3" />
              <h4 className="text-sm font-bold text-white mb-1 elite-spacing uppercase tracking-widest">Secure</h4>
              <p className="text-xs text-white/40 font-light">SSL Protected</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Category Grid */}
      <section id="categories" className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 elite-spacing leading-[1.1]">
              <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">Botanical Range</span>
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-6" />
            <p className="text-base text-white/60 font-bold leading-relaxed max-w-xl mx-auto">
              Eight formulations crafted for comprehensive wellness
            </p>
          </motion.div>

          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex gap-4"
              animate={{
                x: [0, -100 * productCategories.length + '%']
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
              {[...productCategories, ...productCategories].map((category, index) => (
                <motion.div
                  key={`${category.id}-${index}`}
                  className="group relative flex-shrink-0 w-[320px]"
                >
                  <Link href={category.link}>
                    <div className="aspect-[16/9] mb-4 overflow-hidden relative rounded-sm">
                      {/* Background Image */}
                      {category.image && (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/60 to-transparent" />
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 pb-8">
                        <h3 className="text-lg font-serif font-bold mb-2 elite-spacing bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">
                          {category.name}
                        </h3>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-gold-button text-charcoal font-bold px-12 py-6 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105"
              >
                Explore All Categories
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Formulation Standards - REDESIGNED */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 elite-spacing leading-[1.1]">
              <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">Formulation Standards</span>
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6 mx-auto" />
            <p className="text-base text-white/60 font-bold max-w-xl leading-relaxed mx-auto">
              Four principles that define our approach to botanical formulation
            </p>
          </motion.div>

          {/* Principles Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-20 max-w-5xl mx-auto">
            {[
              {
                number: '01',
                title: 'Natural Constituents',
                description: 'Botanical extracts'
              },
              {
                number: '02',
                title: 'Batch Production',
                description: 'Limited quantities'
              },
              {
                number: '03',
                title: 'Ethical Standards',
                description: 'No animal testing'
              },
              {
                number: '04',
                title: 'Result-Oriented',
                description: 'Measurable improvement'
              }
            ].map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group relative text-center"
              >
                {/* Number */}
                <div className="text-6xl md:text-8xl font-serif font-bold text-white/5 mb-6 elite-spacing leading-none">
                  {principle.number}
                </div>
                
                {/* Content */}
                <div className="relative -mt-16">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4 elite-spacing leading-tight bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">
                    {principle.title}
                  </h3>
                  <div className="w-12 h-px bg-white/10 mb-4 mx-auto" />
                  <p className="text-white/60 text-base font-medium leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Seal */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-32 text-center"
          >
            <div className="w-24 h-px bg-white/10 mx-auto mb-6" />
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-12">Standards Observed</p>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-3"
            >
              <Link href="/about">
                <Button
                  size="lg"
                  className="bg-gold-button text-charcoal font-bold px-12 py-6 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105"
                >
                  Our Approach
                </Button>
              </Link>
              <p className="text-white/50 text-sm font-medium tracking-wide elite-spacing">
                Learn more about our formulation philosophy
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Preview - REDESIGNED */}
      <section className="py-32 ambient-vignette">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 elite-spacing leading-[1.1]">
              <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">Formulations</span>
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-6" />
            <p className="text-base text-white/60 font-bold max-w-xl leading-relaxed mx-auto">
              Precision-crafted botanical solutions
            </p>
          </motion.div>

          {loading ? (
            <div className="flex gap-8">
              <div className="w-1/2 animate-pulse">
                <div className="aspect-[3/4] mb-4 bg-charcoal/30 rounded-sm"></div>
                <div className="h-5 bg-charcoal/30 rounded w-2/3"></div>
              </div>
              <div className="w-1/2 grid grid-cols-2 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] mb-3 bg-charcoal/30 rounded-sm"></div>
                    <div className="h-4 bg-charcoal/30 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-12">
              {/* First Product - Large */}
              {featuredProducts[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="w-1/2 product-pedestal"
                >
                  <Link href={`/product/${featuredProducts[0].slug}`}>
                    <div className="aspect-[3/4] mb-8 overflow-hidden relative group rounded-sm product-shadow">
                      <img
                        src={featuredProducts[0].images[0] || '/placeholder-product.jpg'}
                        alt={featuredProducts[0].title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      <ProductBadge badge={getProductBadge(featuredProducts[0], 0).toLowerCase().replace(/\s+/g, '_')} className="absolute top-6 left-6" />
                    </div>
                    <h3 className="text-2xl font-serif font-medium mb-3 elite-spacing" style={{color: 'var(--warm-white)'}}>
                      {featuredProducts[0].title}
                    </h3>
                    <p className="text-lg font-medium" style={{color: 'var(--warm-white-60)'}}>£{featuredProducts[0].price}</p>
                  </Link>
                </motion.div>
              )}  
              {/* Remaining Products - Grid */}
              <div className="w-1/2 grid grid-cols-2 gap-8">
                {featuredProducts.slice(1, 4).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                    viewport={{ once: true }}
                    className="product-pedestal"
                  >
                    <Link href={`/product/${product.slug}`}>
                      <div className="aspect-[3/4] mb-5 overflow-hidden relative group rounded-sm product-shadow">
                        <img
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.title}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        <ProductBadge badge={getProductBadge(product, index + 1).toLowerCase().replace(/\s+/g, '_')} className="absolute top-4 left-4" />
                      </div>
                      <h3 className="text-lg font-serif font-medium mb-2 elite-spacing" style={{color: 'var(--warm-white)'}}>
                        {product.title}
                      </h3>
                      <p className="text-base font-medium" style={{color: 'var(--warm-white-60)'}}>£{product.price}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-gold-button text-charcoal font-bold px-12 py-6 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105"
                >
                  View Collection
                </Button>
              </Link>
              <p className="text-white/50 text-sm font-medium tracking-wide elite-spacing">
                Discover our complete range of botanical formulations
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Product Matcher Teaser - PRIMARY */}
      <section className="pt-40 pb-32 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 elite-spacing leading-[1.2]">
              <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">Private Formulation</span>
              <br />
              Assessment
            </h2>
            
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-8" />
            
            <p className="text-base md:text-lg mb-16 text-white/60 font-bold max-w-3xl mx-auto leading-relaxed elite-spacing">
              AI-powered private treatment. Confidential analysis. Personalized recommendations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-16">
              {[
                {
                  step: "01",
                  title: "Profile",
                  description: "Dermal classification"
                },
                {
                  step: "02", 
                  title: "Analysis",
                  description: "Pattern recognition"
                },
                {
                  step: "03",
                  title: "Recommendation",
                  description: "Targeted selection"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group text-center p-8 rounded-sm"
                >
                  <div className="text-6xl font-light text-white/10 mb-4 elite-spacing">{item.step}</div>
                  <h3 className="text-2xl font-serif font-bold mb-3 elite-spacing bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">
                    {item.title}
                  </h3>
                  <p className="text-white/50 font-medium text-sm elite-spacing leading-relaxed">
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
              className="flex flex-col items-center gap-3"
            >
              <Link href="/skin-matcher">
                <Button 
                  size="lg" 
                  className="bg-gold-button text-charcoal font-bold px-14 py-6 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105"
                >
                  Begin Assessment
                </Button>
              </Link>
              <p className="text-white/50 text-sm font-medium tracking-wide elite-spacing">
                Start your personalized formulation journey
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bundles Section */}
      <BundlesSection 
        title="Curated Selections"
        subtitle="Formulations chosen by most clients"
        limit={0}
        featured={false}
      />

      {/* Customer Testimonials - REDESIGNED */}
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
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 elite-spacing leading-[1.1]">
              <span className="bg-gradient-to-r from-[#f4e4b0] via-[#d4af37] to-[#f4e4b0] bg-clip-text text-transparent animate-gradient">Results</span>
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto" />
          </motion.div>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="flex justify-center mb-6 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-charcoal/30 rounded"></div>
                    ))}
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="h-4 bg-charcoal/30 rounded mx-auto w-full"></div>
                    <div className="h-4 bg-charcoal/30 rounded mx-auto w-5/6"></div>
                    <div className="h-4 bg-charcoal/30 rounded mx-auto w-4/6"></div>
                  </div>
                  <div className="h-5 bg-charcoal/30 rounded mx-auto w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
              {recentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group relative text-center"
                >
                  {/* Stars */}
                  <div className="flex justify-center mb-8">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold-structural fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-white/70 font-medium text-lg mb-10 leading-relaxed italic">
                    "{review.comment}"
                  </blockquote>
                  
                  {/* Divider */}
                  <div className="w-12 h-px bg-white/10 mx-auto mb-6" />
                  
                  {/* Author */}
                  <cite className="text-white/90 font-bold text-base block elite-spacing not-italic">
                    {review.user.name}
                  </cite>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-white/40 text-base font-light elite-spacing">No verified reviews available at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-matte-black text-white pt-32 pb-12 relative overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Brand Seal */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mb-8" />
            <h3 className="text-3xl font-serif text-gold-structural mb-3 elite-spacing">
              Crafted by Alkhemmy
            </h3>
            <p className="text-white/50 font-light text-sm tracking-widest uppercase mb-4">
              Premium Botanical Formulations
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/30">
              <Check className="h-4 w-4 text-gold-structural" />
              <span>Est. 2024 • UK Registered • ISO Certified</span>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo & Tagline */}
            <div className="md:col-span-1">
              <h3 className="text-3xl font-serif font-bold mb-4 text-gold-structural elite-spacing">
                ALKHEMMY
              </h3>
              <p className="text-white/40 font-light text-sm leading-relaxed elite-spacing tracking-wide">
                Botanical Excellence
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="https://instagram.com/alkhemmy" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/70 transition-colors duration-300 p-2 rounded-sm hover:bg-white/5">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://facebook.com/alkhemmy" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/70 transition-colors duration-300 p-2 rounded-sm hover:bg-white/5">
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            {/* Shop Links */}
            <div>
              <h4 className="text-sm font-medium mb-6 text-gold-structural elite-wide uppercase">Shop</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/shop" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/bundles" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    Bundles
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="text-sm font-medium mb-6 text-gold-structural elite-wide uppercase">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/blog" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white/70 transition-colors duration-300 font-light elite-spacing">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-medium mb-6 text-gold-structural elite-wide uppercase tracking-widest">Registry</h4>
              <p className="text-white/50 font-light mb-6 elite-spacing text-sm leading-relaxed">
                Exclusive access and priority notifications for new formulations.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-5 py-4 rounded-sm border border-white/10 bg-charcoal/30 backdrop-blur-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 elite-spacing text-sm"
                />
                <Button 
                  className="bg-gold-button text-charcoal font-medium px-6 py-4 text-xs transition-all duration-500 rounded-sm elite-spacing uppercase tracking-widest hover:scale-105"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-20 pt-10 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/30 text-xs font-light elite-spacing tracking-wide">
                © 2024 Alkhemmy. All rights reserved.
              </p>
              <p className="text-white/20 text-xs font-light elite-spacing tracking-wide">
                Manufactured in the United Kingdom
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Widget */}
      <WhatsAppWidget 
        phoneNumber="+447473255886"
        message="Hello! I'd like to know more about Alkemmy products."
      />
    </div>
  );
}