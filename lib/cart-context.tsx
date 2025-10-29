'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Cart item type
export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
  slug: string;
}

// Cart state type
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
}

// Cart actions type
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      } else {
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    
    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };
    
    case 'LOAD_CART': {
      const items = action.payload;
      return {
        ...state,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }
    
    default:
      return state;
  }
}

// Cart context
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('alkemmy-cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          
          // Clean up base64 images if present (they cause quota errors)
          const cleanedItems = cartItems.map((item: CartItem) => {
            const isBase64 = item.image && item.image.startsWith('data:image');
            return {
              ...item,
              image: isBase64 ? '/placeholder-product.jpg' : (item.image || '/placeholder-product.jpg'),
            };
          });
          
          dispatch({ type: 'LOAD_CART', payload: cleanedItems });
          
          // Save cleaned items back to localStorage if any were cleaned
          if (cleanedItems.some((item: CartItem, index: number) => 
            item.image === '/placeholder-product.jpg' && cartItems[index].image !== '/placeholder-product.jpg'
          )) {
            localStorage.setItem('alkemmy-cart', JSON.stringify(cleanedItems));
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          // Clear corrupted cart data
          localStorage.removeItem('alkemmy-cart');
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        // Create a lightweight version of cart items for localStorage
        // Exclude base64 images to prevent quota errors
        const lightweightItems = state.items.map(item => {
          // Only store image if it's a regular URL (not base64)
          // Base64 images start with "data:image"
          const isBase64 = item.image && item.image.startsWith('data:image');
          
          return {
            id: item.id,
            name: item.name,
            image: isBase64 ? '/placeholder-product.jpg' : (item.image || '/placeholder-product.jpg'),
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            slug: item.slug,
          };
        });
        
        localStorage.setItem('alkemmy-cart', JSON.stringify(lightweightItems));
      } catch (error) {
        // If quota exceeded, try saving without images
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, saving cart without images');
          const minimalItems = state.items.map(item => ({
            id: item.id,
            name: item.name,
            image: '/placeholder-product.jpg',
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            slug: item.slug,
          }));
          localStorage.setItem('alkemmy-cart', JSON.stringify(minimalItems));
        } else {
          console.error('Error saving cart to localStorage:', error);
        }
      }
    }
  }, [state.items, isLoaded]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Cart actions helper functions
export const cartActions = {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => ({
    type: 'ADD_ITEM' as const,
    payload: { ...item, quantity: item.quantity || 1 },
  }),
  
  removeItem: (id: string) => ({
    type: 'REMOVE_ITEM' as const,
    payload: id,
  }),
  
  updateQuantity: (id: string, quantity: number) => ({
    type: 'UPDATE_QUANTITY' as const,
    payload: { id, quantity },
  }),
  
  clearCart: () => ({
    type: 'CLEAR_CART' as const,
  }),
  
  toggleCart: () => ({
    type: 'TOGGLE_CART' as const,
  }),
  
  setCartOpen: (isOpen: boolean) => ({
    type: 'SET_CART_OPEN' as const,
    payload: isOpen,
  }),
};
