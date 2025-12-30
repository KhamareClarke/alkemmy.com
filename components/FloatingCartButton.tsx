'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart, cartActions } from '@/lib/cart-context';

export default function FloatingCartButton() {
  const { state, dispatch } = useCart();
  const { totalItems } = state;

  const handleClick = () => {
    dispatch(cartActions.toggleCart());
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-[#D4AF37] hover:bg-[#B8941F] text-black p-4 rounded-full shadow-2xl border-2 border-white transition-all duration-300"
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}






