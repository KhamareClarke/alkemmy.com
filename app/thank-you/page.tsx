'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, Mail, ArrowLeft, Home } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { getOrderById } from '@/lib/order-api';
import Image from 'next/image';

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  order_items: any[];
}

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = useCart();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async (id: string) => {
    try {
      const orderData = await getOrderById(id);
      if (orderData) {
        setOrder(orderData as unknown as OrderDetails);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    // Clear the cart
    dispatch({ type: 'CLEAR_CART' });
    router.push('/shop');
  };

  const handleGoHome = () => {
    // Clear the cart
    dispatch({ type: 'CLEAR_CART' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order! We've received your order and will process it shortly. 
            You'll receive a confirmation email with your order details.
          </p>
          <div className="space-x-4">
            <Button onClick={handleGoHome} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button onClick={() => router.push('/shop')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-xl opacity-90">
              Your order has been confirmed and is being processed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order Number</span>
                      <span className="font-mono font-semibold">{order.order_number}</span>
              </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Order Date</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <Badge variant={order.status === 'processing' ? 'default' : 'secondary'}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#D4AF37]">£{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F4EBD0] to-[#E8D5B7] rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{item.product_name.charAt(0)}</span>
                </div>
                          )}
              </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.product_name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
                    ))}
            </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700">
                    <p className="font-medium">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </p>
                    <p>{order.shipping_address.address_line_1}</p>
                    {order.shipping_address.address_line_2 && (
                      <p>{order.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.phone && (
                      <p className="mt-2 text-sm text-gray-600">
                        Phone: {order.shipping_address.phone}
                      </p>
                    )}
                </div>
                </CardContent>
              </Card>
            </motion.div>
                </div>
                
          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
                    </div>
                </div>
                
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-gray-600">We'll prepare your order for dispatch</p>
                    </div>
            </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                      <p className="font-medium">Dispatch</p>
                      <p className="text-sm text-gray-600">Your order will be dispatched within 1-2 days</p>
                </div>
              </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    If you have any questions about your order, please contact us:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> support@alkemmy.com</p>
                    <p><strong>Phone:</strong> +44 20 1234 5678</p>
                    <p><strong>Hours:</strong> Mon-Fri 9AM-6PM GMT</p>
          </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
            <Button 
                  onClick={handleContinueShopping}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
            >
                  Continue Shopping
            </Button>
            <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
            >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
            </Button>
              </div>
            </motion.div>
          </div>
          </div>
      </div>
    </div>
  );
}