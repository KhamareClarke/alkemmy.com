'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import StripePayment from '@/components/checkout/StripePayment';
import { OrderData } from '@/lib/order-api';
import { Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cartState, dispatch } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cash_on_delivery'>('stripe');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showStripePayment, setShowStripePayment] = useState(false);

  const subtotal = cartState.totalPrice;
  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  const handleCheckoutSubmit = async (data: any) => {
    console.log('Checkout form submitted with data:', data);
    setError(null);
    setCheckoutData(data);
    setSelectedPaymentMethod(data.paymentMethod);

    // If Stripe is selected, show Stripe payment form
    if (data.paymentMethod === 'stripe') {
      setShowStripePayment(true);
      return; // Don't process order yet, wait for Stripe payment
    }

    // If cash on delivery, process order immediately
    setIsProcessing(true);
    try {
      console.log('Processing cash on delivery order');
      await processOrder(data, null);
    } catch (err) {
      console.error('Checkout submit error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntent: any) => {
    if (!checkoutData) {
      setError('Checkout data is missing. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Processing Stripe payment order with payment intent:', paymentIntent.id);
      const result = await processOrder(checkoutData, paymentIntent.id);
      
      // Send payment success email via API
      if (result && result.order && result.orderItems) {
        try {
          await fetch('/api/send-payment-success-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderNumber: result.order.order_number,
              customerName: `${checkoutData.shippingAddress.firstName} ${checkoutData.shippingAddress.lastName}`,
              customerEmail: checkoutData.shippingAddress.email,
              totalAmount: result.order.total_amount,
              paymentMethod: 'stripe',
              paymentIntentId: paymentIntent.id,
              orderDate: new Date().toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              items: result.orderItems.map((item: any) => ({
                name: item.product_name,
                quantity: item.quantity,
                price: item.price
              }))
            }),
          });
        } catch (emailError) {
          console.error('Failed to send payment success email:', emailError);
          // Don't fail the order if email fails
        }
      }
    } catch (err) {
      console.error('Stripe payment processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePaymentError = async (error: string) => {
    setError(error);
    setIsProcessing(false);
    
    // Send payment failed email via API
    if (checkoutData) {
      try {
        await fetch('/api/send-payment-failed-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: `${checkoutData.shippingAddress.firstName} ${checkoutData.shippingAddress.lastName}`,
            customerEmail: checkoutData.shippingAddress.email,
            totalAmount: total,
            paymentMethod: 'stripe',
            errorMessage: error,
            orderDate: new Date().toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            items: cartState.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }),
        });
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
        // Don't show error to user if email fails
      }
    }
  };

  const processOrder = async (data: OrderData, paymentIntentId: string | null) => {
    try {
      const response = await fetch('/api/process-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: data,
          cartItems: cartState.items,
          userId: user?.id,
          paymentIntentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process order');
      }

      // Clear cart and show success message
      dispatch({ type: 'CLEAR_CART' });
      setOrderSuccess(true);
      
      // Redirect to thank you page after a short delay
      setTimeout(() => {
        window.location.href = `/thank-you?order_id=${result.order.id}`;
      }, 2000);
      
      return result; // Return result for email sending
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process order');
      throw err;
    }
  };


  if (cartState.items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout.</p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-6 py-3 rounded-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order! You'll be redirected to the confirmation page shortly.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-black hover:text-gray-800 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
          </div>
          <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Secure Checkout
            </h1>
            <p className="text-xl opacity-90">
              You're just a few steps away from natural luxury.
            </p>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Main Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2">
            {!showStripePayment ? (
              <CheckoutForm
                onSubmit={handleCheckoutSubmit}
                isLoading={isProcessing}
                error={error ?? undefined}
              />
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
                  <p className="text-black/80">Enter your card details to complete your order</p>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => {
                    setShowStripePayment(false);
                    setError(null);
                  }}
                  className="text-[#D4AF37] hover:text-[#B8941F] font-medium flex items-center gap-2 mb-4"
                >
                  ← Back to Checkout
                </button>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Stripe Payment Component */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <StripePayment
                    amount={total}
                    onSuccess={handleStripePaymentSuccess}
                    onError={handleStripePaymentError}
                    isLoading={isProcessing}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              paymentMethod={selectedPaymentMethod}
              isLoading={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}