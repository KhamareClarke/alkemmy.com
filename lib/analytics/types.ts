/** GA4 + first-party event names used across Alkhemmy. */
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CART_UPDATE: 'cart_update',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  QUIZ_COMPLETE: 'quiz_complete',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  LOGIN: 'login',
  SIGN_UP: 'sign_up',
  SUBMIT_REVIEW: 'submit_review',
  WISHLIST_ADD: 'wishlist_add',
  WISHLIST_REMOVE: 'wishlist_remove',
  DISCOUNT_APPLIED: 'discount_applied',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export interface EcommerceData {
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price?: number;
    quantity?: number;
  }>;
  transaction_id?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}
