'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CartItem {
  id: string;
  title: string;
  images: string[];
  price: number;
  category: string;
  slug: string;
  quantity: number;
  in_stock: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-16 h-16 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/shop">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold px-8 py-4 text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl rounded-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cart Items ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h2>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-xl flex items-center justify-center flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{item.title.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">Category: {item.category}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-[#D4AF37]">£{item.price}</span>
                          <span className={`text-sm font-medium ${
                            item.in_stock ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-sm text-gray-500">
                      Add £{(50 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#D4AF37]">£{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#6C7A61] hover:from-[#6C7A61] hover:to-[#D4AF37] text-[#000000] font-bold py-4 text-lg transition-all duration-300 rounded-full mb-4"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>

                <Link href="/shop">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-4 text-lg transition-all duration-300 rounded-full"
                  >
                    Continue Shopping
                  </Button>
                </Link>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">Free shipping on orders over £50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}