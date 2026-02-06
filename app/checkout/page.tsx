'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { OrderData } from '@/lib/order-api';
import { Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: cartState, dispatch } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cash_on_delivery'>('stripe');
  const [checkoutData, setCheckoutData] = useState<any>(null);

  // Check if user was redirected from canceled Stripe Checkout
  useEffect(() => {
    const canceled = searchParams.get('canceled');
    if (canceled === 'true') {
      setError('Payment was canceled. You can try again or choose a different payment method.');
    }
  }, [searchParams]);

  const subtotal = cartState.totalPrice;
  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  const handleCheckoutSubmit = async (data: any) => {
    console.log('Checkout form submitted with data:', data);
    setError(null);
    setCheckoutData(data);
    setSelectedPaymentMethod(data.paymentMethod);

    // If Stripe is selected, redirect to Stripe Checkout
    if (data.paymentMethod === 'stripe') {
      setIsProcessing(true);
      setError(null); // Clear any previous errors
      
      try {
        const baseUrl = window.location.origin;
        console.log('Creating Stripe Checkout session...');
        
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems: cartState.items,
            orderData: data,
            userId: user?.id,
            successUrl: `${baseUrl}/thank-you?sid={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/checkout?canceled=1`,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Show more detailed error message
          const errorMsg = result.error || 'Failed to create checkout session';
          console.error('Checkout session error:', result);
          setError(errorMsg);
          setIsProcessing(false);
          return;
        }

        // Redirect to Stripe Checkout immediately - CRITICAL: Must redirect, not show form
        if (result.url) {
          console.log('✅ Redirecting to Stripe Checkout:', result.url);
          // CRITICAL: Use replace for immediate redirect - no embedded form should show
          window.location.replace(result.url);
          // Don't set processing to false - we're redirecting away
          return; // Exit immediately - redirect is happening
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (err) {
        console.error('❌ Checkout session creation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to redirect to payment');
        setIsProcessing(false);
      }
      return; // Always return to prevent further execution
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

  // Removed old embedded payment handlers - now using Stripe Checkout redirect

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
            {isProcessing && selectedPaymentMethod === 'stripe' ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting to Stripe Checkout...</h2>
                <p className="text-gray-600">Please wait while we redirect you to complete your payment securely.</p>
                <p className="text-sm text-gray-500 mt-2">If you are not redirected automatically, please check your browser console.</p>
              </div>
            ) : (
              <CheckoutForm
                onSubmit={handleCheckoutSubmit}
                isLoading={isProcessing}
                error={error ?? undefined}
              />
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}