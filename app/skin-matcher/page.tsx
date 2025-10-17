'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, Zap, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SkinMatcherQuiz from '@/components/SkinMatcherQuiz';
import Link from 'next/link';

export default function SkinMatcherPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">AI Skin Matcher</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              AI Skin Matcher
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Discover your perfect skincare routine with our intelligent AI-powered skin analysis. 
              Get personalized product recommendations tailored to your unique skin needs.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#D4AF37]/20 rounded-full mb-3">
                  <Heart className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Personalized</h3>
                <p className="text-sm text-gray-600">Tailored to your skin type</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#D4AF37]/20 rounded-full mb-3">
                  <Zap className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Quick & Easy</h3>
                <p className="text-sm text-gray-600">2-minute assessment</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#D4AF37]/20 rounded-full mb-3">
                  <Shield className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Expert Backed</h3>
                <p className="text-sm text-gray-600">Dermatologist-approved</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#D4AF37]/20 rounded-full mb-3">
                  <Star className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Results</h3>
                <p className="text-sm text-gray-600">Instant recommendations</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quiz Component */}
      <SkinMatcherQuiz />
    </div>
  );
}

