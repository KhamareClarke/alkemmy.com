'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from '@/hooks/use-toast';

type CartToastKind = 'added' | 'removed';

interface PaymentAlertState {
  open: boolean;
  title: string;
  message: string;
}

interface InAppNotificationsValue {
  reviewBadgeCount: number;
  clearReviewBadge: () => void;
  notifyNewReview: () => void;
  notifyCartUpdate: (kind: CartToastKind) => void;
  notifyOrderStatus: (status: string, orderNumber?: string) => void;
  notifyPromoApplied: (code: string) => void;
  showPaymentAlert: (title: string, message: string) => void;
  dismissPaymentAlert: () => void;
  paymentAlert: PaymentAlertState;
  stockBanner: string | null;
  showStockBanner: (message: string) => void;
  dismissStockBanner: () => void;
}

const InAppNotificationsContext = createContext<InAppNotificationsValue | null>(null);

export function InAppNotificationProvider({ children }: { children: React.ReactNode }) {
  const [reviewBadgeCount, setReviewBadgeCount] = useState(0);
  const [paymentAlert, setPaymentAlert] = useState<PaymentAlertState>({
    open: false,
    title: '',
    message: '',
  });
  const [stockBanner, setStockBanner] = useState<string | null>(null);

  const clearReviewBadge = useCallback(() => setReviewBadgeCount(0), []);

  const notifyNewReview = useCallback(() => {
    setReviewBadgeCount((c) => c + 1);
    toast({
      title: 'New review',
      description: 'A customer left a new product review.',
    });
  }, []);

  const notifyCartUpdate = useCallback((kind: CartToastKind) => {
    if (kind === 'added') {
      toast({ title: 'Cart updated', description: 'Item added to your cart.' });
    } else {
      toast({ title: 'Cart updated', description: 'Your cart was updated.' });
    }
  }, []);

  const notifyOrderStatus = useCallback((status: string, orderNumber?: string) => {
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    toast({
      title: `Order ${label}`,
      description: orderNumber ? `Order #${orderNumber} is now ${status}.` : `Your order is now ${status}.`,
    });
  }, []);

  const notifyPromoApplied = useCallback((code: string) => {
    toast({
      title: 'Promo applied',
      description: `Code ${code} is applied to your order.`,
    });
  }, []);

  const showPaymentAlert = useCallback((title: string, message: string) => {
    setPaymentAlert({ open: true, title, message });
  }, []);

  const dismissPaymentAlert = useCallback(() => {
    setPaymentAlert((p) => ({ ...p, open: false }));
  }, []);

  const showStockBanner = useCallback((message: string) => setStockBanner(message), []);
  const dismissStockBanner = useCallback(() => setStockBanner(null), []);

  const value = useMemo(
    () => ({
      reviewBadgeCount,
      clearReviewBadge,
      notifyNewReview,
      notifyCartUpdate,
      notifyOrderStatus,
      notifyPromoApplied,
      showPaymentAlert,
      dismissPaymentAlert,
      paymentAlert,
      stockBanner,
      showStockBanner,
      dismissStockBanner,
    }),
    [
      reviewBadgeCount,
      clearReviewBadge,
      notifyNewReview,
      notifyCartUpdate,
      notifyOrderStatus,
      notifyPromoApplied,
      showPaymentAlert,
      dismissPaymentAlert,
      paymentAlert,
      stockBanner,
      showStockBanner,
      dismissStockBanner,
    ]
  );

  return <InAppNotificationsContext.Provider value={value}>{children}</InAppNotificationsContext.Provider>;
}

export function useInAppNotifications() {
  const ctx = useContext(InAppNotificationsContext);
  if (!ctx) {
    throw new Error('useInAppNotifications must be used within InAppNotificationProvider');
  }
  return ctx;
}
