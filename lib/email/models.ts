/** Shared email payload models (used by templates + legacy email-service). */

export interface OrderConfirmationEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  orderDate: string;
}

export interface PaymentSuccessEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  paymentIntentId?: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface PaymentFailedEmail {
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  errorMessage: string;
  orderDate: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderStatusUpdateEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  previousStatus: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface PasswordResetCodeEmail {
  email: string;
  code: string;
}

export interface ContactFormEmail {
  name: string;
  email: string;
  subject: string;
  message: string;
}
