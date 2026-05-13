'use client';

import type { EcommerceData } from './types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function getMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
}

export function isGa4Enabled(): boolean {
  return !!getMeasurementId();
}

/** GA4 recommended event or custom event. */
export function trackEvent(eventName: string, eventData: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const mid = getMeasurementId();
  if (!mid || !window.gtag) return;
  window.gtag('event', eventName, eventData);
}

export function trackPageView(title: string, path: string) {
  if (typeof window === 'undefined') return;
  const mid = getMeasurementId();
  if (!mid || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: window.location.origin + path,
    page_path: path,
  });
}

/** GA4 ecommerce payload (purchase, add_to_cart, begin_checkout, etc.). */
export function trackEcommerce(eventName: string, ecommerceData: EcommerceData) {
  trackEvent(eventName, {
    currency: ecommerceData.currency ?? 'GBP',
    value: ecommerceData.value,
    items: ecommerceData.items,
    transaction_id: ecommerceData.transaction_id,
    coupon: ecommerceData.coupon,
    shipping: ecommerceData.shipping,
    tax: ecommerceData.tax,
  });
}
