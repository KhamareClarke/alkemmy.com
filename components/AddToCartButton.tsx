'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, cartActions, CartItem } from '@/lib/cart-context';
import CartNotification from './CartNotification';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
    category: string;
    slug: string;
    in_stock: boolean;
    inventory: number;
  };
  quantity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = '',
  size = 'md',
  disabled = false,
}: AddToCartButtonProps) {
  const { dispatch } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const isOutOfStock = !product.in_stock || product.inventory <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;

    const cartItem: CartItem = {
      id: product.id,
      name: product.title,
      image: product.images[0] || '/placeholder-product.jpg',
      price: product.price,
      quantity,
      category: product.category,
      slug: product.slug,
    };

    dispatch(cartActions.addItem(cartItem));
    
    // Show success animation
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    
    // Show notification
    setShowNotification(true);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (isOutOfStock) {
    return (
      <Button
        disabled
        className={`w-full bg-gray-300 text-gray-500 cursor-not-allowed ${sizeClasses[size]} ${className}`}
      >
        <ShoppingCart className={`${iconSizes[size]} mr-2`} />
        Out of Stock
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black transition-all duration-200 ${sizeClasses[size]} ${className}`}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={isAdded ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isAdded ? (
            <>
              <Check className={`${iconSizes[size]} mr-2`} />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className={`${iconSizes[size]} mr-2`} />
              Add to Cart
            </>
          )}
        </motion.div>
      </Button>
      
      <CartNotification
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        productName={product.title}
      />
    </>
  );
}
