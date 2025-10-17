'use client';

import { usePathname } from 'next/navigation';
import FloatingCartButton from './FloatingCartButton';

export default function ConditionalFloatingCart() {
  const pathname = usePathname();
  
  // Hide floating cart on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <FloatingCartButton />;
}




