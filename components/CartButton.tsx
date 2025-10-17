'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart, cartActions } from '@/lib/cart-context';
import { motion } from 'framer-motion';

interface CartButtonProps {
  className?: string;
  showCount?: boolean;
}

export default function CartButton({ className = '', showCount = true }: CartButtonProps) {
  const { state, dispatch } = useCart();
  const { totalItems } = state;

  const handleClick = () => {
    dispatch(cartActions.toggleCart());
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      
      {showCount && totalItems > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </motion.span>
      )}
    </button>
  );
}






