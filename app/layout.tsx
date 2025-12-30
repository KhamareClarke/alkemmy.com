import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import CartSlideOut from '@/components/CartSlideOut';
import FloatingCartButton from '@/components/FloatingCartButton';
import ConditionalFloatingCart from '@/components/ConditionalFloatingCart';

export const metadata: Metadata = {
  title: 'Alkhemmy - Luxury Herbal Skincare',
  description: 'Elevate Your Skin. Empower Your Aura. Alkhemmy blends ancestral herbal wisdom with modern skincare.',
  keywords: 'luxury skincare, herbal skincare, natural beauty, soap bars, premium skincare',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartSlideOut />
            <ConditionalFloatingCart />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}