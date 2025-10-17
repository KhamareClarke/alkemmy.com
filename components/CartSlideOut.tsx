'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, cartActions } from '@/lib/cart-context';
import Link from 'next/link';
import Image from 'next/image';

export default function CartSlideOut() {
  const { state, dispatch } = useCart();
  const { items, totalItems, totalPrice, isOpen } = state;

  const handleClose = () => {
    dispatch(cartActions.setCartOpen(false));
  };

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
          />
          
          {/* Slide-out panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-gray-900">
                  Shopping Cart ({totalItems})
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some products to get started
                  </p>
                  <Button
                    onClick={handleClose}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.category}
                        </p>
                        <p className="text-sm font-bold text-[#D4AF37]">
                          £{item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-500" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-[#D4AF37]">
                    £{totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                  <Link href="/checkout" onClick={handleClose}>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
