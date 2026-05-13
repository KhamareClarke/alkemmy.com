/** Order/checkout types safe to import from Client Components (`import type` only). */

export interface OrderData {
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingSameAsShipping: boolean;
  paymentMethod: 'stripe' | 'paypal' | 'cash_on_delivery';
  saveAddress?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address_id: string;
  billing_address_id?: string;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderDiscountMeta {
  discountCodeId: string;
  discountCode: string;
  discountAmount: number;
}
