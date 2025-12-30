'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, cartActions } from '@/lib/cart-context';
import Link from 'next/link';

interface CartNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  productName: string;
}

export default function CartNotification({ isVisible, onClose, productName }: CartNotificationProps) {
  const { dispatch } = useCart();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleViewCart = () => {
    dispatch(cartActions.setCartOpen(true));
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm z-50"
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Success icon and message */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 pr-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Added to Cart!
              </h3>
              <p className="text-xs text-gray-600">
                <span className="font-medium">{productName}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleViewCart();
              }}
              size="sm"
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black text-xs"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              View Cart
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
            >
              Continue
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
