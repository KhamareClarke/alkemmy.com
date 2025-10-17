'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import StripePayment from './StripePayment';

interface PaymentFormProps {
  amount: number;
  paymentMethod: 'stripe' | 'paypal';
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function PaymentForm({ 
  amount, 
  paymentMethod, 
  onSuccess, 
  onError, 
  isLoading 
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeSuccess = async (paymentIntent: any) => {
    setIsProcessing(true);
    try {
      await onSuccess(paymentIntent);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate PayPal payment processing
      // In a real implementation, you would integrate with PayPal SDK
      console.log('Processing PayPal payment for amount:', amount);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const mockPaymentIntent = {
        id: `paypal_${Date.now()}`,
        status: 'succeeded',
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method: 'paypal'
      };
      
      await onSuccess(mockPaymentIntent);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'PayPal payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeError = (error: string) => {
    onError(error);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details - {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Order Total</span>
              <span className="text-xl font-bold text-[#D4AF37]">£{amount.toFixed(2)}</span>
            </div>

            {paymentMethod === 'stripe' ? (
              <StripePayment
                amount={amount}
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                isLoading={isLoading || isProcessing}
              />
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    You will be redirected to PayPal to complete your payment securely.
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={handlePayPalPayment}
                  disabled={isLoading || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing PayPal Payment...
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-white rounded mr-2 flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">P</span>
                      </div>
                      Pay with PayPal
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Security:</strong> All payments are processed securely using industry-standard encryption.</p>
            <p><strong>Refunds:</strong> If you're not satisfied, we offer a 30-day money-back guarantee.</p>
            <p><strong>Support:</strong> Need help? Contact us at support@alkemmy.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




