'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Leaf, Shield, Star, Users, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Natural Ingredients",
      description: "We use only the finest natural ingredients sourced from trusted suppliers around the world."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assured",
      description: "Every product undergoes rigorous testing to ensure the highest quality and safety standards."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Love",
      description: "Our products are crafted with care and passion, bringing you the best in natural wellness."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Award Winning",
      description: "Recognized by industry experts and loved by thousands of satisfied customers worldwide."
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "50+", label: "Products" },
    { number: "5", label: "Years Experience" },
    { number: "100%", label: "Natural" }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">About Alkhemmy</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              About <span className="text-[#D4AF37]">Alkhemmy</span>
            </motion.h1>
            <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              We are passionate about creating premium natural products that enhance your wellness journey. 
              Our carefully curated collection brings together the finest ingredients from around the world.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
          <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center"
          >
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded with a vision to bring the healing power of nature into your daily routine, 
                  Alkhemmy has been at the forefront of natural wellness for over 5 years.
                </p>
                <p>
                  Our journey began when our founder discovered the transformative effects of carefully 
                  crafted natural products during travels across different cultures and traditions.
                </p>
                <p>
                  Today, we continue to source the finest ingredients from trusted suppliers worldwide, 
                  ensuring every product meets our high standards for quality, purity, and effectiveness.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-[#D4AF37]/20 to-[#6C7A61]/20 rounded-2xl flex items-center justify-center">
                <Globe className="w-24 h-24 text-[#D4AF37]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Alkhemmy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing you with the best natural products and exceptional service.
                </p>
              </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-[#D4AF37] mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#6C7A61]/10 rounded-2xl p-8 md:p-12">
              <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                To empower individuals on their wellness journey by providing premium natural products 
                that promote health, beauty, and overall well-being. We believe that nature holds the 
                key to a balanced and fulfilling life.
                </p>
              </motion.div>
            </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A passionate group of individuals dedicated to bringing you the best in natural wellness.
                </p>
              </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Founder & CEO",
                description: "Passionate about natural wellness and sustainable living."
              },
              {
                name: "Dr. Michael Chen",
                role: "Chief Scientist",
                description: "Expert in natural ingredients and product formulation."
              },
              {
                name: "Emma Rodriguez",
                role: "Head of Quality",
                description: "Ensures every product meets our high standards."
              }
            ].map((member, index) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37]/20 to-[#6C7A61]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-[#D4AF37] font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </motion.div>
            ))}
            </div>
        </div>
        </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Explore our collection of premium natural products and discover the difference quality makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
                <Button size="lg" variant="secondary" className="bg-white text-[#D4AF37] hover:bg-gray-100">
                  Shop Now
                </Button>
              </Link>
              <Link href="/bundles">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#D4AF37]">
                  View Bundles
              </Button>
            </Link>
            </div>
          </motion.div>
        </div>
        </div>
    </div>
  );
}