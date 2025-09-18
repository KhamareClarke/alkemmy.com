'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Truck, Heart, ArrowRight, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Confirmation Header */}
      <section className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Success Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <Check className="w-12 h-12 text-[#D4AF37]" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Thank You for Your Order 🙌
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Your Alkhemmy package is being prepared with care and intention.
            </p>
            
            {/* Confetti Emojis */}
            <div className="flex justify-center space-x-4 text-3xl mb-8">
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                🎉
              </motion.span>
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                ✨
              </motion.span>
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              >
                🌿
              </motion.span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Order Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Order ID */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-xl font-bold text-[#D4AF37]">#AK-384729</p>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-xl flex items-center justify-center">
                      <span className="text-[#D4AF37] font-bold">E</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Empire Bar</p>
                      <p className="text-sm text-gray-600">Quantity: 2</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">£24.00</p>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-xl flex items-center justify-center">
                      <span className="text-[#D4AF37] font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Skin Rescue Bar</p>
                      <p className="text-sm text-gray-600">Quantity: 1</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">£14.00</p>
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">£38.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">£4.99</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#D4AF37]">£42.99</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">Sarah Johnson</p>
                <p>123 Wellness Street</p>
                <p>London, SW1A 1AA</p>
                <p>United Kingdom</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - What's Next */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Expected Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8"
            >
              <div className="flex items-center justify-center space-x-4">
                <Truck className="w-8 h-8 text-green-600" />
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-xl mb-2">Expected Delivery</h3>
                  <p className="text-2xl font-bold text-green-600">2–3 Working Days</p>
                  <p className="text-gray-600 mt-2">Your natural luxury is on its way</p>
                </div>
              </div>
            </motion.div>

            {/* What Happens Next */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What Happens Now?</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📦 Your items are being packaged</h4>
                    <p className="text-gray-600">We're carefully preparing your natural skincare products with love and attention to detail.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">✉️ You'll receive a confirmation email shortly</h4>
                    <p className="text-gray-600">Check your inbox for complete order details and receipt.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🚚 You'll get tracking info when it ships</h4>
                    <p className="text-gray-600">Track your package every step of the way to your door.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Confirmation Email Sent</h3>
                  <p className="text-gray-600">Check your inbox for order details and tracking information.</p>
                </div>
              </div>
            </div>

            {/* Special Offer */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-bold text-gray-900">First-Time Customer?</h3>
                  <p className="text-gray-600 mb-4">Join our community and get 15% off your next order plus exclusive wellness tips.</p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-full">
                    Join the Community
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Post-Purchase CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Get the Most from Your Products</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Maximize your skincare results with expert guidance and discover more natural luxury
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              View Usage Guides
            </Button>
            <Link href="/shop">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Explore More Products
              </Button>
            </Link>
            <Button 
              onClick={() => window.open('https://instagram.com/alkhemmy.skin', '_blank')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Follow Us on Instagram
            </Button>
          </div>
        </motion.section>

        {/* Social Share / Brand Loyalty Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Loved your experience? Tell your friends!</h3>
          <p className="text-gray-600 mb-6 text-lg">
            Share the love and help others discover the power of natural skincare
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.open('https://instagram.com/alkhemmy.skin', '_blank')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Share on Instagram
            </Button>
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Star className="w-5 h-5 mr-2" />
              Leave a Review
            </Button>
          </div>
        </motion.section>

        {/* Customer Testimonial */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-700 italic mb-6">
              "I've been using Alkhemmy products for 6 months now and my skin has never looked better. The natural ingredients really make a difference, and the quality is outstanding. Worth every penny!"
            </blockquote>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Maria K.</p>
                <p className="text-sm text-gray-600">Verified Customer</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/shop">
            <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <ArrowRight className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 rounded-full">
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">
            Our customer care team is here to help with any questions about your order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:hello@alkhemmy.com" className="text-[#D4AF37] hover:text-[#B8941F] font-semibold">
              hello@alkhemmy.com
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <a href="tel:+44123456789" className="text-[#D4AF37] hover:text-[#B8941F] font-semibold">
              +44 123 456 789
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}