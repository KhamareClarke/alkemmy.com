'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Beaker, Hand, Shield, Target, Globe, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-playfair">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              From ancient wisdom to modern skin science — welcome to Alkhemmy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand Mission Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 font-playfair"
            >
              Why We Exist
            </motion.h2>
            <motion.div 
              variants={itemVariants}
              className="max-w-4xl mx-auto"
            >
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-12">
                Alkhemmy was born from a mission to reconnect self-care with nature. We craft potent, 
                multi-functional products using natural oils, herbs, and botanicals — no fluff, just results. 
                Our goal is to restore balance, clarity, and power to your daily routine.
              </p>
              
              {/* Brand Crest */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-20 h-20 border-4 border-black rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-2xl font-playfair">A</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It's Made Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center font-playfair"
            >
              How We Create
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                variants={itemVariants}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Leaf className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🌿 Ingredient Selection</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Wildcrafted, cold-pressed, and tested for purity. Every botanical is chosen for its proven efficacy and therapeutic properties.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Beaker className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🧪 Formulation</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Recipes backed by tradition and skin science. We blend ancestral knowledge with modern research for maximum effectiveness.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Hand className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🖐️ Handmade in Small Batches</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  UK-based production with care and attention to detail. Each product is crafted by hand to ensure quality and potency.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center font-playfair"
            >
              What We Stand For
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">🧼 Effective</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every product solves a real problem. No marketing gimmicks, just proven results for your skin and wellness goals.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Safe</h3>
                <p className="text-gray-700 leading-relaxed">
                  No parabens, sulphates, or harsh chemicals. Clean formulations that respect your skin's natural barrier and health.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">🌍 Sustainable</h3>
                <p className="text-gray-700 leading-relaxed">
                  Eco-conscious packaging and supply chain. We're committed to protecting the planet that provides our ingredients.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">🔬 Innovative</h3>
                <p className="text-gray-700 leading-relaxed">
                  AI-driven matching and continuous formula improvements. We blend cutting-edge technology with natural wisdom.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founder Quote Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto">
              <blockquote className="text-3xl md:text-4xl font-bold mb-8 leading-relaxed font-playfair italic">
                "I built Alkhemmy to create real solutions, not trends. We don't sell rituals — we sell results."
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xl">K</span>
                </div>
                <div className="text-left">
                  <p className="text-xl font-semibold">Kamare Clarke</p>
                  <p className="text-[#D4AF37] font-medium">Founder</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
              Discover our complete collection of handcrafted herbal wellness products designed to deliver real results.
            </p>
            <Link href="/shop">
              <Button className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-full font-semibold hover:scale-105 transition-all duration-200 shadow-2xl">
                <ArrowRight className="w-5 h-5 mr-2" />
                Explore Our Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Additional Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 mb-8"
            >
              Trusted by Thousands of Customers Worldwide
            </motion.h3>
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">10,000+</div>
                <p className="text-gray-600">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">4.8★</div>
                <p className="text-gray-600">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">100%</div>
                <p className="text-gray-600">Natural Ingredients</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}