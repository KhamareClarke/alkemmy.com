'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, cartActions, CartItem } from '@/lib/cart-context';
import CartNotification from './CartNotification';

interface ProductQuantityControlsProps {
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
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showAddButton?: boolean; // If true, shows "Add to Cart" button when quantity is 0
}

export default function ProductQuantityControls({
  product,
  className = '',
  size = 'md',
  showAddButton = true,
}: ProductQuantityControlsProps) {
  const { state, dispatch } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Find if product is already in cart
  const cartItem = state.items.find(item => item.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;
  const [localQuantity, setLocalQuantity] = useState(currentQuantity);

  // Sync local quantity with cart quantity
  useEffect(() => {
    setLocalQuantity(currentQuantity);
  }, [currentQuantity]);

  const isOutOfStock = !product.in_stock || product.inventory <= 0;
  const maxQuantity = Math.min(product.inventory || 999, 99); // Cap at 99 or inventory

  const handleQuantityChange = (newQuantity: number) => {
    if (isOutOfStock) return;
    
    // Clamp quantity between 0 and max
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));
    setLocalQuantity(clampedQuantity);

    if (clampedQuantity === 0) {
      // Remove from cart
      if (cartItem) {
        dispatch(cartActions.removeItem(product.id));
      }
    } else {
      // Add or update in cart
      const cartItemData: CartItem = {
        id: product.id,
        name: product.title,
        image: product.images[0] || '/placeholder-product.jpg',
        price: product.price,
        quantity: clampedQuantity,
        category: product.category,
        slug: product.slug,
      };

      if (cartItem) {
        // Update existing item
        dispatch(cartActions.updateQuantity(product.id, clampedQuantity));
      } else {
        // Add new item
        dispatch(cartActions.addItem(cartItemData));
        setShowNotification(true);
      }

      // Show animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleIncrease = () => {
    handleQuantityChange(localQuantity + 1);
  };

  const handleDecrease = () => {
    handleQuantityChange(localQuantity - 1);
  };

  const handleAddToCart = () => {
    handleQuantityChange(1);
  };

  const sizeClasses = {
    sm: {
      button: 'w-7 h-7 text-xs',
      input: 'w-10 h-7 text-sm',
      container: 'h-7',
    },
    md: {
      button: 'w-8 h-8 text-sm',
      input: 'w-12 h-8 text-base',
      container: 'h-8',
    },
    lg: {
      button: 'w-10 h-10 text-base',
      input: 'w-16 h-10 text-lg',
      container: 'h-10',
    },
  };

  const currentSize = sizeClasses[size];

  if (isOutOfStock) {
    return (
      <Button
        disabled
        className={`w-full bg-gray-300 text-gray-500 cursor-not-allowed ${className}`}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Out of Stock
      </Button>
    );
  }

  // If quantity is 0 and showAddButton is true, show "Add to Cart" button
  if (localQuantity === 0 && showAddButton) {
    return (
      <>
        <Button
          onClick={handleAddToCart}
          className={`w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black transition-all duration-200 ${className}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <CartNotification
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
          productName={product.title}
        />
      </>
    );
  }

  // Show quantity controls
  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleDecrease}
          disabled={localQuantity === 0}
          className={`
            ${currentSize.button}
            flex items-center justify-center
            rounded-lg border-2 border-[#D4AF37]
            bg-white hover:bg-[#D4AF37] hover:text-white
            text-[#D4AF37] font-bold
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isAnimating ? 'scale-95' : ''}
          `}
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div
          className={`
            ${currentSize.input}
            flex items-center justify-center
            border-2 border-[#D4AF37]
            rounded-lg
            font-bold text-[#000000]
            bg-white
          `}
        >
          {localQuantity}
        </div>

        <button
          onClick={handleIncrease}
          disabled={localQuantity >= maxQuantity}
          className={`
            ${currentSize.button}
            flex items-center justify-center
            rounded-lg border-2 border-[#D4AF37]
            bg-white hover:bg-[#D4AF37] hover:text-white
            text-[#D4AF37] font-bold
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isAnimating ? 'scale-95' : ''}
          `}
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <CartNotification
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        productName={product.title}
      />
    </>
  );
}



