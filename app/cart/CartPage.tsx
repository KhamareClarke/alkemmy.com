'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, cartActions } from '@/lib/cart-context';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { state, dispatch } = useCart();
  const { items, totalItems, totalPrice } = state;

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(cartActions.removeItem(id));
    } else {
      dispatch(cartActions.updateQuantity(id, quantity));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(cartActions.removeItem(id));
  };

  const handleClearCart = () => {
    dispatch(cartActions.clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/shop"
                className="inline-flex items-center text-[#D4AF37] hover:text-[#B8941F]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center text-[#D4AF37] hover:text-[#B8941F]"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/">
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black px-8 py-3">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/shop"
              className="inline-flex items-center text-[#D4AF37] hover:text-[#B8941F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-flex items-center text-[#D4AF37] hover:text-[#B8941F]"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h1>
            <Button
              onClick={handleClearCart}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/${item.category}/${item.slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-[#D4AF37] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 capitalize mb-2">
                          {item.category}
                        </p>
                        <p className="text-lg font-bold text-[#D4AF37]">
                          £{item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-500" />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">£{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">£0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-[#D4AF37]">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black py-3 text-lg font-semibold">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Continue Shopping */}
              <Link href="/" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

