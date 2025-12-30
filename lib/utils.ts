import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to determine if a product is in stock
export function isInStock(inStock: boolean, inventory: number): boolean {
  return inStock && inventory > 0;
}

// Utility function to get stock status text
export function getStockStatusText(inStock: boolean, inventory: number): string {
  return isInStock(inStock, inventory) ? 'In Stock - Ready to Ship' : 'Out of Stock';
}