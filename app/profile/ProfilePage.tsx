'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Package, Settings, LogOut, Edit3, Save, X, ShoppingBag, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Address {
  id?: string;
  user_id: string;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  order_items?: OrderItem[];
  shipping_address?: Address;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_image?: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'shipping',
    first_name: '',
    last_name: '',
    address_line_1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United Kingdom',
    is_default: false,
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            first_name: user?.user_metadata?.firstName || '',
            last_name: user?.user_metadata?.lastName || '',
            email: user?.email || '',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
        }
      }

      // Load addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (addressesError) {
        console.error('Error loading addresses:', addressesError);
      } else {
        setAddresses(addressesData || []);
      }

      // Load orders
      await loadOrders();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:addresses!shipping_address_id(*),
          order_items(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const getStatusInfo = (status: string, paymentStatus: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Pending',
          description: 'Your order is being processed'
        };
      case 'processing':
        return {
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Processing',
          description: 'Your order is being prepared'
        };
      case 'shipped':
        return {
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          text: 'Shipped',
          description: 'Your order is on the way'
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Delivered',
          description: 'Your order has been delivered'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Cancelled',
          description: 'Your order has been cancelled'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: status.charAt(0).toUpperCase() + status.slice(1),
          description: 'Order status unknown'
        };
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    // Validate required fields
    if (!newAddress.first_name || !newAddress.last_name || !newAddress.address_line_1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const addressData = {
        ...newAddress,
        user_id: user.id,
      } as Address;

      if (editingAddress && editingAddress !== 'new') {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress);

        if (error) throw error;

        setAddresses(addresses.map(addr => 
          addr.id === editingAddress ? { ...addressData, id: editingAddress } : addr
        ));
      } else {
        // Create new address
        const { data, error } = await supabase
          .from('addresses')
          .insert(addressData)
          .select()
          .single();

        if (error) throw error;

        setAddresses([...addresses, data]);
      }

      setEditingAddress(null);
      setNewAddress({
        type: 'shipping',
        first_name: '',
        last_name: '',
        address_line_1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United Kingdom',
        is_default: false,
      });
      
      alert('Address saved successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-2">Manage your profile, orders, and addresses</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-[#D4AF37] text-black'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-[#D4AF37] text-black'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package className="w-5 h-5 mr-3" />
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'addresses'
                        ? 'bg-[#D4AF37] text-black'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-5 h-5 mr-3" />
                    Addresses
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    {profile && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <p className="text-gray-900">{profile.first_name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <p className="text-gray-900">{profile.last_name}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900">{profile.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Member Since
                          </label>
                          <p className="text-gray-900">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <Button
                          onClick={() => router.push('/shop')}
                          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => {
                          const statusInfo = getStatusInfo(order.status, order.payment_status || 'pending');
                          const StatusIcon = statusInfo.icon;
                          
                          return (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="font-semibold text-gray-900 text-lg">
                                  Order #{order.order_number}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                </p>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-gray-900 text-lg">
                                  £{order.total_amount.toFixed(2)}
                                </p>
                                  <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color} mt-1`}>
                                    <StatusIcon className="w-4 h-4 mr-1" />
                                    {statusInfo.text}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-gray-600">{statusInfo.description}</p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <span>Payment: {order.payment_method?.replace('_', ' ').toUpperCase()}</span>
                              </div>
                            </div>

                              <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {order.order_items && order.order_items.length > 0 ? order.order_items.map((item: any) => (
                                <div key={item.id} className="flex items-center space-x-3">
                                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        {item.product_image ? (
                                          <img 
                                            src={item.product_image} 
                                            alt={item.product_name}
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                        ) : (
                                          <Package className="w-6 h-6 text-gray-400" />
                                        )}
                                      </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × £{item.price.toFixed(2)}
                                    </p>
                                  </div>
                                      <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                          £{(item.quantity * item.price).toFixed(2)}
                                    </p>
                                      </div>
                                    </div>
                                  )) : (
                                    <p className="text-gray-500 text-sm">No items found for this order.</p>
                                  )}
                                </div>
                          </div>

                              {order.shipping_address && (
                                <div className="border-t pt-4 mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                                  <div className="text-sm text-gray-600">
                                    <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                                    <p>{order.shipping_address.address_line_1}</p>
                                    {order.shipping_address.address_line_2 && (
                                      <p>{order.shipping_address.address_line_2}</p>
                                    )}
                                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                                    <p>{order.shipping_address.country}</p>
                                    {order.shipping_address.phone && (
                                      <p className="mt-1">Phone: {order.shipping_address.phone}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Addresses</h2>
                      <Button
                        onClick={() => setEditingAddress('new')}
                        className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                      >
                        Add Address
                      </Button>
                    </div>

                    {editingAddress && (
                      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold mb-4">
                          {editingAddress === 'new' ? 'Add New Address' : 'Edit Address'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={newAddress.first_name || ''}
                              onChange={(e) => setNewAddress({...newAddress, first_name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={newAddress.last_name || ''}
                              onChange={(e) => setNewAddress({...newAddress, last_name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              value={newAddress.address_line_1 || ''}
                              onChange={(e) => setNewAddress({...newAddress, address_line_1: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 2 (Optional)
                            </label>
                            <input
                              type="text"
                              value={newAddress.address_line_2 || ''}
                              onChange={(e) => setNewAddress({...newAddress, address_line_2: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                              placeholder="Apartment, suite, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={newAddress.city || ''}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State/County
                            </label>
                            <input
                              type="text"
                              value={newAddress.state || ''}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={newAddress.postal_code || ''}
                              onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Country
                            </label>
                            <select
                              value={newAddress.country || 'United Kingdom'}
                              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            >
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Ireland">Ireland</option>
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number (Optional)
                            </label>
                            <input
                              type="tel"
                              value={newAddress.phone || ''}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                              placeholder="+44 7XXX XXXXXX"
                            />
                          </div>
                        </div>
                        
                        {/* Default Address Checkbox */}
                        <div className="mt-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newAddress.is_default || false}
                              onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                              className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Set as default address
                            </span>
                          </label>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            onClick={() => {
                              setEditingAddress(null);
                              setNewAddress({
                                type: 'shipping',
                                first_name: '',
                                last_name: '',
                                address_line_1: '',
                                city: '',
                                state: '',
                                postal_code: '',
                                country: 'United Kingdom',
                                is_default: false,
                              });
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveAddress}
                            className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                          >
                            Save Address
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {addresses.length === 0 ? (
                        <div className="text-center py-12">
                          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                          <p className="text-gray-600">Add an address to make checkout faster</p>
                        </div>
                      ) : (
                        addresses.map((address) => (
                          <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {address.first_name} {address.last_name}
                                </h3>
                                <p className="text-gray-600">
                                  {address.address_line_1}
                                  {address.address_line_2 && `, ${address.address_line_2}`}
                                </p>
                                <p className="text-gray-600">
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                                <p className="text-gray-600">{address.country}</p>
                                {address.phone && <p className="text-gray-600">{address.phone}</p>}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingAddress(address.id!);
                                    setNewAddress(address);
                                  }}
                                  className="text-[#D4AF37] hover:text-[#B8941F]"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(address.id!)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
