'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

// Payment form component
function PaymentForm({ amount, onSuccess, onError, isLoading }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to pence
          currency: 'gbp',
        }),
      });

      const { client_secret, error: serverError } = await response.json();

      if (serverError) {
        throw new Error(serverError);
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Card Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-gray-300 rounded-lg">
              <CardElement options={cardElementOptions} />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || processing || isLoading}
        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-3"
      >
        {processing ? 'Processing Payment...' : `Pay £${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

// Main Stripe payment component
export default function StripePayment({ amount, onSuccess, onError, isLoading }: StripePaymentProps) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Stripe is not configured. For testing, you can use Cash on Delivery instead.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => onSuccess({ id: 'test-payment-intent' })}
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-3"
        >
          Test Payment (Skip Stripe)
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        isLoading={isLoading}
      />
    </Elements>
  );
}
