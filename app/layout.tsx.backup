import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import CartSlideOut from '@/components/CartSlideOut';
import FloatingCartButton from '@/components/FloatingCartButton';
import ConditionalFloatingCart from '@/components/ConditionalFloatingCart';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className={inter.className}>
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