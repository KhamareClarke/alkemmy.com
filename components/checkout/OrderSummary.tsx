'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Truck, Leaf, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';

interface OrderSummaryProps {
  onPlaceOrder?: () => void;
  isLoading?: boolean;
  paymentMethod?: 'stripe' | 'paypal' | 'cash_on_delivery';
}

export default function OrderSummary({ onPlaceOrder, isLoading, paymentMethod }: OrderSummaryProps) {
  const { state: cartState } = useCart();

  const subtotal = cartState.totalPrice;
  const shipping = subtotal > 50 ? 0 : 4.99; // Free shipping over £50
  const total = subtotal + shipping;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="sticky top-8"
    >
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartState.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{item.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">£{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `£${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            {subtotal < 50 && (
              <div className="text-sm text-gray-500">
                Add £{(50 - subtotal).toFixed(2)} more for free shipping
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-[#D4AF37]">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Display */}
          {paymentMethod && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {paymentMethod === 'stripe' ? (
                  <CreditCard className="w-5 h-5 text-gray-600" />
                ) : paymentMethod === 'paypal' ? (
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                ) : (
                  <Truck className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {paymentMethod === 'stripe' ? 'Credit/Debit Card (Stripe)' : 
                     paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === 'stripe' ? 'Payment will be processed securely via Stripe' :
                     paymentMethod === 'paypal' ? 'Payment will be processed via PayPal' :
                     'Pay when your order arrives'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Place Order Button */}
          {onPlaceOrder && (
            <Button
              onClick={onPlaceOrder}
              disabled={isLoading || cartState.items.length === 0}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
          )}

          {/* Trust Indicators */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">100% Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-3">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Natural Products, Made in the UK</span>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Fast Dispatch Within 1–2 Days</span>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
              <span>SSL Secured</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
              <span>PCI Compliant</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
              <span>Encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
