'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart-context';
import { useInAppNotifications } from '@/lib/notifications/in-app-context';

/** Emits cart toasts when item count changes (must render inside CartProvider + InAppNotificationProvider). */
export function CartToastBridge() {
  const { state } = useCart();
  const { notifyCartUpdate } = useInAppNotifications();
  const prevTotal = useRef(state.totalItems);
  const allowToasts = useRef(false);
  const totalRef = useRef(state.totalItems);

  useEffect(() => {
    totalRef.current = state.totalItems;
  }, [state.totalItems]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      allowToasts.current = true;
      prevTotal.current = totalRef.current;
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!allowToasts.current) return;
    if (state.totalItems > prevTotal.current) {
      notifyCartUpdate('added');
    } else if (state.totalItems < prevTotal.current) {
      notifyCartUpdate('removed');
    }
    prevTotal.current = state.totalItems;
  }, [state.totalItems, notifyCartUpdate]);

  return null;
}
