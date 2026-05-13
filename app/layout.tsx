import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { InAppNotificationProvider } from '@/lib/notifications/in-app-context';
import { InAppNotificationHost } from '@/components/notifications/InAppNotificationHost';
import { CartToastBridge } from '@/components/notifications/CartToastBridge';
import { PushSubscriber } from '@/components/notifications/PushSubscriber';
import AnnouncementBar from '@/components/banners/AnnouncementBar';
import CartSlideOut from '@/components/CartSlideOut';
import ConditionalFloatingCart from '@/components/ConditionalFloatingCart';
import Ga4Script from '@/components/analytics/Ga4Script';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationJsonLd } from '@/lib/seo/jsonld';
import { LiveChatWidget } from '@/components/chat/LiveChatWidget';

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
        <Ga4Script />
        <JsonLd data={organizationJsonLd()} />
        <AuthProvider>
          <InAppNotificationProvider>
            <CartProvider>
              <CartToastBridge />
              <AnnouncementBar />
              {children}
              <CartSlideOut />
              <ConditionalFloatingCart />
            </CartProvider>
            <InAppNotificationHost />
            <PushSubscriber />
            <LiveChatWidget />
          </InAppNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}