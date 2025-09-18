'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Lock, Truck, Leaf, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Empire Bar',
      price: 12,
      quantity: 2,
      image: '/images/empire-bar.jpg'
    },
    {
      id: 2,
      name: 'Skin Rescue Bar',
      price: 14,
      quantity: 1,
      image: '/images/skin-rescue-bar.jpg'
    }
  ]);

  const [billingIsSameAsShipping, setBillingIsSameAsShipping] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 4.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Secure Checkout
            </h1>
            <p className="text-xl opacity-90">
              You're just a few steps away from natural luxury.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Cart Items & Forms */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Cart Items Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h2>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{item.name.charAt(0)}</span>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                      <p className="text-[#D4AF37] font-bold">£{item.price}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900">£{item.price * item.quantity}</p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Shipping Information Form */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="+44 7XXX XXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent">
                    <option>United Kingdom</option>
                    <option>Ireland</option>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Australia</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="SW1A 1AA"
                  />
                </div>
              </div>
            </motion.section>

            {/* Billing Information Form */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>
              
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox
                  id="billing-same"
                  checked={billingIsSameAsShipping}
                  onCheckedChange={(checked) => setBillingIsSameAsShipping(checked as boolean)}
                />
                <label htmlFor="billing-same" className="text-sm font-medium text-gray-700">
                  Billing same as shipping?
                </label>
              </div>

              {!billingIsSameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Enter billing name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="billing@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Billing street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="Billing city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="SW1A 1AA"
                    />
                  </div>
                </div>
              )}
            </motion.section>

            {/* Payment Method */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#D4AF37] transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="card"
                    name="payment"
                    value="card"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <label htmlFor="card" className="font-medium text-gray-900 cursor-pointer">Credit/Debit Card</label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#D4AF37] transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment"
                    value="paypal"
                    checked={selectedPaymentMethod === 'paypal'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <label htmlFor="paypal" className="font-medium text-gray-900 cursor-pointer">PayPal</label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#D4AF37] transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="apple-pay"
                    name="payment"
                    value="apple-pay"
                    checked={selectedPaymentMethod === 'apple-pay'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <label htmlFor="apple-pay" className="font-medium text-gray-900 cursor-pointer">Apple Pay</label>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Payment gateway not active — demo only.
                </p>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-8"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">£{shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-[#D4AF37]">£{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 mb-6">
                  Place Order
                </Button>
                
                {/* Trust Indicators */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">100% Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Natural Products, Made in the UK</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Fast Dispatch Within 1–2 Days</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}