'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X, ShoppingBag, Package, Clock, CheckCircle, Truck, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipping_address?: any;
  order_items?: any[];
  user?: User;
}

export default function AdminOrdersPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMetrics, setOrderMetrics] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'stripe' | 'cash_on_delivery'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [modalOrderLoading, setModalOrderLoading] = useState(false);
  const ordersLoadInProgress = useRef(false);

  const fetchOrderDetails = async (orderId: string) => {
    setModalOrderLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedOrder(data.order);
      }
    } catch (e) {
      console.error('Failed to load order details', e);
    } finally {
      setModalOrderLoading(false);
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    if (authStatus === 'true' && authTime) {
      const authTimestamp = parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - authTimestamp < twentyFourHours) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
      }
    }
    setAuthChecked(true);
  }, []);

  const loadOrders = async () => {
    if (ordersLoadInProgress.current) return;
    ordersLoadInProgress.current = true;
    setOrdersError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (!response.ok) {
        setOrdersError(`Failed to load orders: ${data.error || 'Unknown error'}`);
        return;
      }
      const ordersData = data.orders || [];
      setOrders(ordersData);
      setOrderMetrics({
        pending: ordersData.filter((o: Order) => o.status === 'pending').length,
        processing: ordersData.filter((o: Order) => o.status === 'processing').length,
        shipped: ordersData.filter((o: Order) => o.status === 'shipped').length,
        delivered: ordersData.filter((o: Order) => o.status === 'delivered').length,
        cancelled: ordersData.filter((o: Order) => o.status === 'cancelled').length,
        total: ordersData.length
      });
    } catch (error) {
      setOrdersError('Error loading orders. Please check your connection.');
    } finally {
      setLoading(false);
      ordersLoadInProgress.current = false;
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadOrders();
  }, [isAuthenticated]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Failed to update: ${data.error || 'Unknown error'}`);
        return;
      }
      const paymentStatus = newStatus === 'cancelled' ? 'failed' : 'pending';
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus, payment_status: paymentStatus } : o);
      setOrders(updatedOrders);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, payment_status: paymentStatus } : null);
      }
      setOrderMetrics({
        pending: updatedOrders.filter(o => o.status === 'pending').length,
        processing: updatedOrders.filter(o => o.status === 'processing').length,
        shipped: updatedOrders.filter(o => o.status === 'shipped').length,
        delivered: updatedOrders.filter(o => o.status === 'delivered').length,
        cancelled: updatedOrders.filter(o => o.status === 'cancelled').length,
        total: updatedOrders.length
      });
    } catch (error) {
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { icon: typeof Clock; color: string; bgColor: string; text: string }> = {
      pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Pending' },
      processing: { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', text: 'Processing' },
      shipped: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', text: 'Shipped' },
      delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Delivered' },
      cancelled: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Cancelled' }
    };
    return map[status] || map.pending;
  };

  const filteredOrders = orders.filter(order => {
    if (paymentMethodFilter !== 'all') {
      if (paymentMethodFilter === 'stripe' && order.payment_method !== 'stripe') return false;
      if (paymentMethodFilter === 'cash_on_delivery' && order.payment_method !== 'cash_on_delivery') return false;
    }
    if (!orderSearchTerm) return true;
    const search = orderSearchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(search) ||
      order.user?.email?.toLowerCase().includes(search) ||
      order.user?.first_name?.toLowerCase().includes(search) ||
      order.user?.last_name?.toLowerCase().includes(search) ||
      order.shipping_address?.email?.toLowerCase().includes(search) ||
      order.shipping_address?.first_name?.toLowerCase().includes(search) ||
      order.shipping_address?.last_name?.toLowerCase().includes(search)
    );
  });

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const key = order.user?.email || order.shipping_address?.email || `guest_${order.shipping_address?.first_name}_${order.shipping_address?.last_name}` || 'unknown';
    if (!acc[key]) acc[key] = { email: order.user?.email || order.shipping_address?.email || 'No email', name: order.user ? `${order.user.first_name} ${order.user.last_name}` : `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim() || 'Guest', isRegistered: !!order.user, orders: [] };
    acc[key].orders.push(order);
    return acc;
  }, {} as Record<string, { email: string; name: string; isRegistered: boolean; orders: Order[] }>);

  const groupedArray = Object.values(groupedOrders);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view orders.</p>
          <Link href="/admin">
            <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
                <p className="text-gray-600 mt-1">Manage and view all store orders</p>
              </div>
            </div>
            <Button onClick={loadOrders} variant="outline" disabled={loading} className="border-gray-300 hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {[
            { label: 'Pending', value: orderMetrics.pending, color: 'border-yellow-500', icon: Clock },
            { label: 'Processing', value: orderMetrics.processing, color: 'border-blue-500', icon: Package },
            { label: 'Shipped', value: orderMetrics.shipped, color: 'border-purple-500', icon: Truck },
            { label: 'Delivered', value: orderMetrics.delivered, color: 'border-green-500', icon: CheckCircle },
            { label: 'Cancelled', value: orderMetrics.cancelled, color: 'border-red-500', icon: AlertCircle },
            { label: 'Total', value: orderMetrics.total, color: 'border-[#D4AF37]', icon: ShoppingBag },
            { label: 'Card', value: orders.filter(o => o.payment_method === 'stripe').length, color: 'border-blue-600', icon: CreditCard }
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${color}`}>
              <div className="flex items-center">
                <Icon className="w-8 h-8 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, email, or name..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Payment:</span>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value as typeof paymentMethodFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] text-sm"
              >
                <option value="all">All</option>
                <option value="stripe">Card</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </div>
            {(orderSearchTerm || paymentMethodFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={() => { setOrderSearchTerm(''); setPaymentMethodFilter('all'); }}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Orders <span className="text-sm font-normal text-gray-500">({groupedArray.length} customers, {filteredOrders.length} orders)</span>
            </h2>
          </div>

          {ordersError ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{ordersError}</p>
              <Button onClick={loadOrders} className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : groupedArray.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{orderSearchTerm ? 'No orders match your search.' : 'No orders found.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {groupedArray.map((group) => (
                <div key={group.email} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.email}</p>
                      <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${group.isRegistered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {group.isRegistered ? 'Registered' : 'Guest'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">£{group.orders.reduce((s, o) => s + o.total_amount, 0).toFixed(2)} total</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Order</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Payment</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.orders.map((order) => {
                          const statusInfo = getStatusInfo(order.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderModal(true);
                                    fetchOrderDetails(order.id);
                                  }}
                                  className="text-sm font-medium text-[#D4AF37] hover:text-[#B8941F] hover:underline"
                                >
                                  #{order.order_number}
                                </button>
                              </td>
                              <td className="py-3 text-sm text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3 text-sm font-medium">£{order.total_amount.toFixed(2)}</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.text}
                                </span>
                              </td>
                              <td className="py-3">
                                {order.payment_method === 'stripe' ? (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Card
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Cash on Delivery</span>
                                )}
                              </td>
                              <td className="py-3">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  disabled={updatingOrder === order.id}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.order_number}</h2>
                <button onClick={() => { setShowOrderModal(false); setSelectedOrder(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {modalOrderLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading order details...</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Date:</span><span>{new Date(selectedOrder.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-bold">£{selectedOrder.total_amount.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Payment:</span><span>{selectedOrder.payment_method === 'stripe' ? 'Card' : 'Cash on Delivery'}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
                    {selectedOrder.user ? (
                      <div className="text-sm">
                        <p className="font-medium">{selectedOrder.user.first_name} {selectedOrder.user.last_name}</p>
                        <p className="text-gray-600">{selectedOrder.user.email}</p>
                      </div>
                    ) : selectedOrder.shipping_address ? (
                      <div className="text-sm">
                        <p className="font-medium">{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</p>
                        {selectedOrder.shipping_address.email && <p className="text-gray-600">{selectedOrder.shipping_address.email}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Guest</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping</h3>
                    {selectedOrder.shipping_address ? (
                      <div className="text-sm">
                        <p>{selectedOrder.shipping_address.address_line_1}</p>
                        {selectedOrder.shipping_address.address_line_2 && <p>{selectedOrder.shipping_address.address_line_2}</p>}
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}</p>
                        <p>{selectedOrder.shipping_address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No address</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                    {selectedOrder.order_items?.length ? (
                      <div className="space-y-2">
                        {selectedOrder.order_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} × {item.quantity}</span>
                            <span>£{(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No items</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  disabled={updatingOrder === selectedOrder.id}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
