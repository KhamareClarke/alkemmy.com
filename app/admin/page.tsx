'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, Filter, Save, X, Users, ShoppingBag, Package, Clock, CheckCircle, Truck, AlertCircle, RefreshCw, Mail, Send, FileText, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getSoaps, 
  getHerbalTeas, 
  getLotions, 
  getOils, 
  getBeardCareProducts, 
  getShampoos, 
  getRollOns, 
  getElixirs
} from '@/lib/category-api';
import {
  Soap,
  HerbalTea,
  Lotion,
  Oil,
  BeardCare,
  Shampoo,
  RollOn,
  Elixir
} from '@/lib/category-types';
import { Bundle } from '@/lib/supabase';
import { 
  deleteSoap,
  deleteHerbalTea,
  deleteLotion,
  deleteOil,
  deleteBeardCare,
  deleteShampoo,
  deleteRollOn,
  deleteElixir,
  createBundle,
  updateBundle,
  deleteBundle,
  getBundles
} from '@/lib/admin-api';
import ProductForm from '@/components/admin/ProductForm';
import BundleForm from '@/components/admin/BundleForm';
// import { adminSupabase } from '@/lib/admin-supabase';

type CategoryProduct = Soap | HerbalTea | Lotion | Oil | BeardCare | Shampoo | RollOn | Elixir;

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  product?: {
    title: string;
    slug: string;
  };
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

const CATEGORIES = [
  { id: 'soaps', name: '🧼 Soaps', description: 'Natural Bar Soaps' },
  { id: 'teas', name: '🍃 Herbal Teas', description: 'Wellness Blends' },
  { id: 'lotions', name: '🧴 Lotions', description: 'Creams & Moisturizers' },
  { id: 'oils', name: '💧 Hair & Body Oils', description: 'Natural Oils' },
  { id: 'beard-care', name: '🧔 Beard Care', description: 'Men\'s Grooming' },
  { id: 'shampoos', name: '🚿 Shampoos', description: 'Hair Care' },
  { id: 'roll-ons', name: '⚡ Roll-ons', description: 'On-the-Go Treatments' },
  { id: 'elixirs', name: '🌟 Elixirs', description: 'Concentrated Herbal Wellness' }
];

const CATEGORY_FILTERS = {
  soaps: {
    'Skin Type': ['Dry', 'Oily', 'Sensitive', 'Normal', 'Combination'],
    'Key Ingredient': ['Charcoal', 'Neem', 'Aloe Vera', 'Turmeric', 'Sandalwood', 'Rose'],
    'Concern': ['Acne', 'Pigmentation', 'Dullness', 'Rough Skin', 'Odor'],
    'Fragrance': ['Mild', 'Floral', 'Herbal', 'Citrus', 'Unscented']
  },
  teas: {
    'Purpose': ['Detox', 'Relaxation', 'Immunity', 'Digestion', 'Weight Management', 'Sleep'],
    'Main Ingredient': ['Green Tea', 'Chamomile', 'Hibiscus', 'Tulsi', 'Ginger', 'Peppermint'],
    'Caffeine Level': ['Caffeine-free', 'Low-caffeine', 'Regular'],
    'Form': ['Loose Leaf', 'Tea Bags']
  },
  lotions: {
    'Skin Type': ['Dry', 'Oily', 'Sensitive', 'Combination', 'Normal'],
    'Concern': ['Hydration', 'Brightening', 'Anti-Aging', 'Sun Protection', 'Even Tone'],
    'Key Ingredient': ['Shea Butter', 'Aloe Vera', 'Vitamin E', 'Cocoa Butter', 'Coconut Oil'],
    'Texture': ['Light', 'Rich', 'Gel-based', 'Cream-based']
  },
  oils: {
    'Type': ['Hair Oil', 'Body Oil', 'Multipurpose Oil'],
    'Base Ingredient': ['Coconut', 'Almond', 'Argan', 'Castor', 'Olive', 'Jojoba'],
    'Concern': ['Hair Fall', 'Dandruff', 'Dry Scalp', 'Stretch Marks', 'Dry Skin'],
    'Formulation': ['Cold-Pressed', 'Blend', 'Ayurvedic', 'Organic']
  },
  'beard-care': {
    'Product Type': ['Beard Oil', 'Balm', 'Wash', 'Comb/Brush', 'Kit'],
    'Beard Type': ['Short', 'Long', 'Thick', 'Patchy'],
    'Fragrance': ['Woody', 'Citrus', 'Musk', 'Herbal', 'Unscented'],
    'Concern': ['Growth', 'Softening', 'Itch Relief', 'Shine']
  },
  shampoos: {
    'Hair Type': ['Dry', 'Oily', 'Frizzy', 'Curly', 'Straight', 'Color-treated'],
    'Concern': ['Hair Fall', 'Dandruff', 'Damage Repair', 'Volume', 'Shine'],
    'Ingredient': ['Argan Oil', 'Keratin', 'Aloe Vera', 'Tea Tree', 'Biotin'],
    'Formulation': ['Sulfate-free', 'Paraben-free', 'Organic', 'Herbal']
  },
  'roll-ons': {
    'Purpose': ['Headache Relief', 'Stress', 'Energy Boost', 'Sleep', 'Pain Relief'],
    'Main Ingredient': ['Peppermint', 'Lavender', 'Eucalyptus', 'Lemongrass', 'Tea Tree'],
    'Formulation': ['Essential Oil Blend', 'Herbal Extract', 'Alcohol-free'],
    'Usage Area': ['Forehead', 'Neck', 'Wrist', 'Body']
  },
  elixirs: {
    'Purpose': ['Immunity', 'Skin Glow', 'Energy', 'Detox', 'Digestion', 'Hormonal Balance'],
    'Main Ingredient': ['Amla', 'Ashwagandha', 'Turmeric', 'Tulsi', 'Giloy', 'Spirulina'],
    'Form': ['Liquid', 'Drops', 'Tonic', 'Capsules'],
    'Formulation': ['Herbal', 'Ayurvedic', 'Organic']
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'bundles' | 'users' | 'orders' | 'emails' | 'reviews'>('products');
  const [selectedCategory, setSelectedCategory] = useState('soaps');
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CategoryProduct | null>(null);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [orderMetrics, setOrderMetrics] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total: 0
  });
  const [refreshing, setRefreshing] = useState({
    users: false,
    orders: false
  });
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  
  // Email management state
  const [emails, setEmails] = useState<any[]>([]);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailComposer, setEmailComposer] = useState({
    to: '',
    subject: '',
    body: '',
    senderEmail: 'khamareclarke@gmail.com'
  });
  const [emailTemplates, setEmailTemplates] = useState([
    {
      name: 'New Product Launch',
      subject: '🌟 Exciting New Product Launch - Limited Time Offer!',
      body: 'Dear Valued Customer,\n\nWe\'re thrilled to announce our latest addition to the Alkhemmy collection! Our new [Product Name] is now available with an exclusive launch discount.\n\n✨ Special Launch Offer:\n- 20% OFF for the first 48 hours\n- Free shipping on orders over £50\n- Limited quantities available\n\nDon\'t miss out on this incredible opportunity to experience our premium herbal skincare.\n\nShop now: [Your Website]\n\nWith love,\nThe Alkhemmy Team'
    },
    {
      name: 'Season End Sale',
      subject: '🔥 Season End Sale - Up to 50% OFF Everything!',
      body: 'Dear Customer,\n\nAs the season comes to an end, we\'re offering massive discounts on our entire collection!\n\n🎉 Season End Sale:\n- Up to 50% OFF selected items\n- Buy 2 Get 1 FREE on all soaps\n- Free express shipping on orders over £75\n- Limited time only!\n\nThis is your chance to stock up on your favorite products at unbeatable prices.\n\nShop the sale: [Your Website]\n\nHurry, offer ends soon!\n\nBest regards,\nAlkhemmy Team'
    },
    {
      name: 'Hurry Up Reminder',
      subject: '⏰ Last Chance - Your Cart is Waiting!',
      body: 'Hi there,\n\nWe noticed you left some amazing products in your cart! Don\'t let them slip away.\n\n🛒 Your cart contains:\n- [Product 1]\n- [Product 2]\n- [Product 3]\n\n💡 Special reminder offer:\n- 10% OFF your cart with code: HURRY10\n- Free shipping included\n- Valid for 24 hours only\n\nComplete your purchase now: [Your Website]\n\nQuestions? We\'re here to help!\n\nWarm regards,\nAlkhemmy Team'
    },
    {
      name: 'Welcome New Customer',
      subject: 'Welcome to Alkhemmy - Your Journey to Beautiful Skin Starts Here!',
      body: 'Welcome to the Alkhemmy family!\n\nWe\'re delighted you\'ve joined us on this journey to healthier, more radiant skin.\n\n🎁 As a welcome gift, enjoy:\n- 15% OFF your first order (use code: WELCOME15)\n- Free shipping on your first purchase\n- Exclusive access to new products\n\nDiscover our premium herbal skincare collection crafted with love and ancient wisdom.\n\nStart shopping: [Your Website]\n\nThank you for choosing Alkhemmy!\n\nWith gratitude,\nThe Alkhemmy Team'
    },
    {
      name: 'Back in Stock',
      subject: '🎉 Your Favorite Products Are Back in Stock!',
      body: 'Great news!\n\nYour most-loved products are back in stock and ready to ship.\n\n✨ Back in Stock:\n- [Product Name 1]\n- [Product Name 2]\n- [Product Name 3]\n\nDon\'t wait - these popular items sell out quickly!\n\nShop now: [Your Website]\n\nQuestions? Reply to this email anytime.\n\nBest wishes,\nAlkhemmy Team'
    }
  ]);

  // Filtered data based on search terms
  const filteredUsers = users.filter(user => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  const filteredOrders = orders.filter(order => {
    if (!orderSearchTerm) return true;
    const searchLower = orderSearchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.user?.first_name?.toLowerCase().includes(searchLower) ||
      order.user?.last_name?.toLowerCase().includes(searchLower) ||
      order.shipping_address?.email?.toLowerCase().includes(searchLower) ||
      order.shipping_address?.first_name?.toLowerCase().includes(searchLower) ||
      order.shipping_address?.last_name?.toLowerCase().includes(searchLower) ||
      (order.user === null && 'guest customer'.includes(searchLower))
    );
  });

  // Group orders by customer email or name+address for guests without email
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    // For registered users, use their profile email
    // For guest users, use email if available, otherwise use name+address as unique identifier
    let groupKey: string;
    let customerEmail: string;
    let customerName: string;
    
    if (order.user) {
      // Registered user
      groupKey = order.user.email;
      customerEmail = order.user.email;
      customerName = `${order.user.first_name} ${order.user.last_name}`;
    } else if (order.shipping_address) {
      // Guest user
      customerName = `${order.shipping_address.first_name} ${order.shipping_address.last_name}`;
      
      if (order.shipping_address.email) {
        // Guest with email
        groupKey = order.shipping_address.email;
        customerEmail = order.shipping_address.email;
      } else {
        // Guest without email - group by name + address
        const addressKey = `${order.shipping_address.first_name}_${order.shipping_address.last_name}_${order.shipping_address.address_line_1}_${order.shipping_address.city}`;
        groupKey = `no_email_${addressKey}`;
        customerEmail = 'No email provided';
      }
    } else {
      // Fallback
      groupKey = 'unknown_customer';
      customerEmail = 'No email provided';
      customerName = 'Unknown Customer';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        email: customerEmail,
        name: customerName,
        isRegistered: !!order.user,
        orders: []
      };
    }
    groups[groupKey].orders.push(order);
    return groups;
  }, {} as Record<string, { email: string; name: string; isRegistered: boolean; orders: Order[] }>);

  const groupedOrdersArray = Object.values(groupedOrders);

  // Hardcoded admin password - change this to your desired password
  const ADMIN_PASSWORD = 'alkemmy2024';

  // Check authentication status on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    
    if (authStatus === 'true' && authTime) {
      // Check if authentication is still valid (24 hours)
      const authTimestamp = parseInt(authTime);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - authTimestamp < twentyFourHours) {
        setIsAuthenticated(true);
      } else {
        // Authentication expired
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      // Persist authentication state with timestamp
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_time', Date.now().toString());
    } else {
      setAuthError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setAuthError('');
    // Clear authentication state
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to load users: ${data.error || 'Unknown error'}`);
        return;
      } else {
        setUsers(data.users || []);
      }
    } catch (error) {
      alert('Error loading users. Please check your connection.');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to load orders: ${data.error || 'Unknown error'}`);
        return;
      } else {
        const ordersData = data.orders || [];
        setOrders(ordersData);
        
        // Calculate metrics
        const metrics = {
          pending: ordersData.filter((order: Order) => order.status === 'pending').length,
          processing: ordersData.filter((order: Order) => order.status === 'processing').length,
          shipped: ordersData.filter((order: Order) => order.status === 'shipped').length,
          delivered: ordersData.filter((order: Order) => order.status === 'delivered').length,
          cancelled: ordersData.filter((order: Order) => order.status === 'cancelled').length,
          total: ordersData.length
        };
        setOrderMetrics(metrics);
      }
    } catch (error) {
      alert('Error loading orders. Please check your connection.');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to update order status: ${data.error || 'Unknown error'}`);
      } else {
        // For cash on delivery orders, payment status should never be 'paid'
        // Since we don't have online payment system, all orders are cash on delivery
        let paymentStatus = 'pending';
        if (newStatus === 'cancelled') {
          paymentStatus = 'failed';
        }
        // Never set to 'paid' for cash on delivery orders

        // Update the selected order status immediately
        if (selectedOrder) {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
            payment_status: paymentStatus
          });
        }
        // Update the orders array immediately
        const updatedOrders = orders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus,
                payment_status: paymentStatus
              }
            : order
        );
        setOrders(updatedOrders);
        
        // Update metrics
        const metrics = {
          pending: updatedOrders.filter((order: Order) => order.status === 'pending').length,
          processing: updatedOrders.filter((order: Order) => order.status === 'processing').length,
          shipped: updatedOrders.filter((order: Order) => order.status === 'shipped').length,
          delivered: updatedOrders.filter((order: Order) => order.status === 'delivered').length,
          cancelled: updatedOrders.filter((order: Order) => order.status === 'cancelled').length,
          total: updatedOrders.length
        };
        setOrderMetrics(metrics);
        alert('Order status updated successfully');
      }
    } catch (error) {
      alert(`An error occurred while updating the order status`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Pending'
        };
      case 'processing':
        return {
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Processing'
        };
      case 'shipped':
        return {
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          text: 'Shipped'
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Delivered'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Cancelled'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeModals = () => {
    setShowOrderModal(false);
    setShowUserModal(false);
    setSelectedOrder(null);
    setSelectedUser(null);
  };

  const refreshProducts = async () => {
    setLoading(true);
    try {
      // Reload products for current category
      const loadProducts = async () => {
        setLoading(true);
        try {
          let productsData: CategoryProduct[] = [];
          
          switch (selectedCategory) {
            case 'soaps':
              productsData = await getSoaps();
              break;
            case 'teas':
              productsData = await getHerbalTeas();
              break;
            case 'lotions':
              productsData = await getLotions();
              break;
            case 'oils':
              productsData = await getOils();
              break;
            case 'beard-care':
              productsData = await getBeardCareProducts();
              break;
            case 'shampoos':
              productsData = await getShampoos();
              break;
            case 'roll-ons':
              productsData = await getRollOns();
              break;
            case 'elixirs':
              productsData = await getElixirs();
              break;
          }
          
          setProducts(productsData);
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setLoading(false);
        }
      };
      
      await loadProducts();
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(prev => ({ ...prev, users: true }));
    try {
      await loadUsers();
    } catch (error) {
      alert('Failed to refresh users');
    } finally {
      setRefreshing(prev => ({ ...prev, users: false }));
    }
  };

  const refreshOrders = async () => {
    setRefreshing(prev => ({ ...prev, orders: true }));
    try {
      await loadOrders();
    } catch (error) {
      alert('Failed to refresh orders');
    } finally {
      setRefreshing(prev => ({ ...prev, orders: false }));
    }
  };

  // Email management functions
  const loadEmails = async () => {
    try {
      const response = await fetch('/api/admin/emails');
      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to load emails: ${data.error || 'Unknown error'}`);
        return;
      }

      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error loading emails:', error);
      alert('Error loading emails. Please check your connection.');
    }
  };

  // Reviews management functions
  const loadReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to load reviews: ${data.error || 'Unknown error'}`);
        return;
      }

      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      alert('Error loading reviews. Please check your connection.');
    }
  };

  const downloadReviews = () => {
    const csvContent = [
      ['ID', 'User Name', 'User Email', 'Product', 'Rating', 'Comment', 'Date'],
      ...reviews.map(review => [
        review.id,
        review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Unknown',
        review.user?.email || 'N/A',
        review.product?.title || 'Unknown Product',
        review.rating,
        review.comment || '',
        new Date(review.created_at).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove the review from the local state
        setReviews(reviews.filter(review => review.id !== reviewId));
        alert('Review deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete review: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('An error occurred while deleting the review');
    }
  };

  const sendEmail = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailComposer.to,
          subject: emailComposer.subject,
          body: emailComposer.body,
          from: emailComposer.senderEmail
        }),
      });

      if (response.ok) {
        alert('Email sent successfully!');
        setShowEmailComposer(false);
        setEmailComposer({
          to: '',
          subject: '',
          body: '',
          senderEmail: 'khamareclarke@gmail.com'
        });
        loadEmails(); // Refresh emails list
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error}`);
      }
    } catch (error) {
      alert('Error sending email. Please try again.');
    }
  };

  const useTemplate = (template: any) => {
    setEmailComposer(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
  };

  // Load data when active tab changes
  useEffect(() => {
    if (activeTab === 'bundles') {
      loadBundles();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'emails') {
      loadEmails();
    } else if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab]);

  // Load users immediately when component mounts
  useEffect(() => {
    loadUsers();
    loadOrders();
  }, []);

  // Load products for selected category
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let data: CategoryProduct[] = [];
        switch (selectedCategory) {
          case 'soaps':
            data = await getSoaps();
            break;
          case 'teas':
            data = await getHerbalTeas();
            break;
          case 'lotions':
            data = await getLotions();
            break;
          case 'oils':
            data = await getOils();
            break;
          case 'beard-care':
            data = await getBeardCareProducts();
            break;
          case 'shampoos':
            data = await getShampoos();
            break;
          case 'roll-ons':
            data = await getRollOns();
            break;
          case 'elixirs':
            data = await getElixirs();
            break;
        }
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  // Load bundles
  const loadBundles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bundles');
      const data = await response.json();
      if (data.bundles) {
        setBundles(data.bundles);
      }
    } catch (error) {
      console.error('Error loading bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditProduct = (product: CategoryProduct) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (product: CategoryProduct) => {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      setLoading(true);
      try {
        let success = false;
        switch (selectedCategory) {
          case 'soaps':
            success = await deleteSoap(product.id);
            break;
          case 'teas':
            success = await deleteHerbalTea(product.id);
            break;
          case 'lotions':
            success = await deleteLotion(product.id);
            break;
          case 'oils':
            success = await deleteOil(product.id);
            break;
          case 'beard-care':
            success = await deleteBeardCare(product.id);
            break;
          case 'shampoos':
            success = await deleteShampoo(product.id);
            break;
          case 'roll-ons':
            success = await deleteRollOn(product.id);
            break;
          case 'elixirs':
            success = await deleteElixir(product.id);
            break;
        }
        
        if (success) {
          // Reload products
          window.location.reload();
        } else {
          alert('Failed to delete product. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while deleting the product.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Bundle management functions
  const handleAddBundle = () => {
    setEditingBundle(null);
    setShowAddForm(true);
  };

  const handleEditBundle = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setShowAddForm(true);
  };

  const handleSaveBundle = async (bundleData: Partial<Bundle>) => {
    setLoading(true);
    try {
      let success = false;
      if (editingBundle) {
        const result = await updateBundle(editingBundle.id, bundleData);
        success = result !== null;
      } else {
        const result = await createBundle(bundleData);
        success = result !== null;
      }
      
      if (success) {
        setShowAddForm(false);
        setEditingBundle(null);
        loadBundles(); // Reload bundles
      } else {
        alert('Failed to save bundle. Please try again.');
      }
    } catch (error) {
      console.error('Error saving bundle:', error);
      alert('An error occurred while saving the bundle.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBundle = async (bundle: Bundle) => {
    if (confirm(`Are you sure you want to delete "${bundle.title}"?`)) {
      setLoading(true);
      try {
        const success = await deleteBundle(bundle.id);
        
        if (success) {
          loadBundles(); // Reload bundles
        } else {
          alert('Failed to delete bundle. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting bundle:', error);
        alert('An error occurred while deleting the bundle.');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // TODO: Implement filter matching
    const matchesFilters = true;
    
    return matchesSearch && matchesFilters;
  });

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#D4AF37]">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Access
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the admin password to access the dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:z-10 sm:text-sm"
                placeholder="Enter admin password"
              />
            </div>

            {authError && (
              <div className="text-red-600 text-sm text-center">
                {authError}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#D4AF37] hover:bg-[#B8941F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
              >
                Access Admin Panel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your store</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'products' && (
                <>
                  <Button onClick={refreshProducts} variant="outline" className="border-gray-300 hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={handleAddProduct} className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </>
              )}
              {activeTab === 'bundles' && (
                <>
                  <Button onClick={loadBundles} variant="outline" className="border-gray-300 hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={handleAddBundle} className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bundle
                  </Button>
                </>
              )}
              {activeTab === 'users' && (
                <Button 
                  onClick={refreshUsers} 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                  disabled={refreshing.users}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing.users ? 'animate-spin' : ''}`} />
                  {refreshing.users ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
              {activeTab === 'orders' && (
                <Button 
                  onClick={refreshOrders} 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                  disabled={refreshing.orders}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing.orders ? 'animate-spin' : ''}`} />
                  {refreshing.orders ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
              {activeTab === 'emails' && (
                <Button 
                  onClick={loadEmails} 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
              {activeTab === 'reviews' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={loadReviews} 
                    variant="outline" 
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={downloadReviews} 
                    variant="outline" 
                    className="border-green-300 hover:bg-green-50 text-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              )}
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </Button>
            </div>
          </div>
          
          {/* Admin Tabs */}
          <div className="mt-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4 mr-2 inline" />
                Products
              </button>
              <button
                onClick={() => setActiveTab('bundles')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'bundles'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4 mr-2 inline" />
                Bundles
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-2 inline" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'emails'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-4 h-4 mr-2 inline" />
                Emails
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star className="w-4 h-4 mr-2 inline" />
                Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_FILTERS[selectedCategory as keyof typeof CATEGORY_FILTERS] || {}).map(([filterName, options]) => (
                <div key={filterName} className="relative">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent">
                    <option value="">{filterName}</option>
                    {options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name} Products
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredProducts.length} products)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images && product.images.length > 0 ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0]}
                                alt={product.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {product.title.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.short_description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        £{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.in_stock && product.inventory > 0
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.in_stock && product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.rating} ({product.review_count} reviews)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-[#D4AF37] hover:text-[#B8941F]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {/* Bundles Tab */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bundles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Bundles Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading bundles...</p>
                </div>
              ) : bundles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bundles found</p>
                  <p className="text-sm">Create your first bundle to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bundle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bundles
                        .filter(bundle => 
                          bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bundle.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((bundle) => (
                        <tr key={bundle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={bundle.images?.[0] || '/placeholder-product.jpg'}
                                  alt={bundle.title}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {bundle.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {bundle.short_description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              £{bundle.price}
                              {bundle.original_price && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  £{bundle.original_price}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                bundle.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {bundle.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {bundle.is_featured && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                              {bundle.is_bestseller && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Bestseller
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bundle.bundle_items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(bundle.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditBundle(bundle)}
                                className="text-[#D4AF37] hover:text-[#B8941F]"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBundle(bundle)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or ID..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                </div>
                {userSearchTerm && (
                  <Button
                    onClick={() => setUserSearchTerm('')}
                    variant="outline"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Registered Users
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredUsers.length} of {users.length} users)
                  </span>
                </h2>
              </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {userSearchTerm ? 'No users found matching your search.' : 'No registered users found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => handleUserClick(user)}
                                className="text-sm font-medium text-[#D4AF37] hover:text-[#B8941F] hover:underline cursor-pointer"
                              >
                                {user.first_name} {user.last_name}
                              </button>
                              <div className="text-sm text-gray-500">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.order_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          £{(user.total_spent || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Order Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.pending}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.processing}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <Truck className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shipped</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.shipped}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.delivered}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.cancelled}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#D4AF37]">
                <div className="flex items-center">
                  <ShoppingBag className="w-8 h-8 text-[#D4AF37] mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search orders by order number, customer email, or name..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                </div>
                {orderSearchTerm && (
                  <Button
                    onClick={() => setOrderSearchTerm('')}
                    variant="outline"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Orders
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({groupedOrdersArray.length} customers, {filteredOrders.length} orders)
                  </span>
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : groupedOrdersArray.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {orderSearchTerm ? 'No orders found matching your search.' : 'No orders found.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedOrdersArray.map((customerGroup) => (
                    <div key={customerGroup.email} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {/* Customer Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {customerGroup.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {customerGroup.email === 'No email provided' ? (
                                <span className="text-red-500 italic">No email provided</span>
                              ) : (
                                customerGroup.email
                              )}
                            </p>
                            {customerGroup.email === 'No email provided' && customerGroup.orders.length > 0 && customerGroup.orders[0].shipping_address && (
                              <p className="text-xs text-gray-500 mt-1">
                                {customerGroup.orders[0].shipping_address.address_line_1}, {customerGroup.orders[0].shipping_address.city}
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                customerGroup.isRegistered 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {customerGroup.isRegistered ? 'Registered User' : 'Guest Customer'}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                {customerGroup.orders.length} order{customerGroup.orders.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Spent</p>
                            <p className="text-lg font-bold text-gray-900">
                              £{customerGroup.orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Orders Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Method
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {customerGroup.orders.map((order) => {
                              const statusInfo = getStatusInfo(order.status);
                              const StatusIcon = statusInfo.icon;
                              
                              return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      onClick={() => handleOrderClick(order)}
                                      className="text-sm font-medium text-[#D4AF37] hover:text-[#B8941F] hover:underline cursor-pointer"
                                    >
                                      #{order.order_number}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    £{order.total_amount.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusInfo.text}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.payment_method?.replace('_', ' ').toUpperCase()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <select
                                      value={order.status}
                                      onChange={(e) => {
                                        const newStatus = e.target.value;
                                        updateOrderStatus(order.id, newStatus);
                                      }}
                                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
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
        )}

        {/* Emails Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            {/* Email Management Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Management
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({emails.length} emails sent)
                  </span>
                </h2>
                <Button
                  onClick={() => setShowEmailComposer(true)}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Compose Email
                </Button>
              </div>

              {/* Email Templates */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">AI-Suggested Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {emailTemplates.map((template, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#D4AF37] transition-colors">
                      <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.subject}</p>
                      <Button
                        onClick={() => useTemplate(template)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sent Emails List */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Recent Emails</h3>
                {emails.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No emails sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emails.map((email) => (
                      <div key={email.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{email.to_email}</span>
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                email.status === 'sent' ? 'bg-green-100 text-green-800' : 
                                email.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {email.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{email.subject}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(email.sent_at).toLocaleString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 capitalize">{email.email_type.replace('_', ' ')}</span>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && activeTab === 'products' && (
        <ProductForm
          category={editingProduct ? selectedCategory : ''}
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowAddForm(false);
            setEditingProduct(null);
            // Reload products for current category
            const loadProducts = async () => {
              setLoading(true);
              try {
                let data: CategoryProduct[] = [];
                switch (selectedCategory) {
                  case 'soaps':
                    data = await getSoaps();
                    break;
                  case 'teas':
                    data = await getHerbalTeas();
                    break;
                  case 'lotions':
                    data = await getLotions();
                    break;
                  case 'oils':
                    data = await getOils();
                    break;
                  case 'beard-care':
                    data = await getBeardCareProducts();
                    break;
                  case 'shampoos':
                    data = await getShampoos();
                    break;
                  case 'roll-ons':
                    data = await getRollOns();
                    break;
                  case 'elixirs':
                    data = await getElixirs();
                    break;
                }
                setProducts(data);
              } catch (error) {
                console.error('Error loading products:', error);
              } finally {
                setLoading(false);
              }
            };
            loadProducts();
          }}
        />
      )}

      {/* Add/Edit Bundle Modal */}
      {showAddForm && activeTab === 'bundles' && (
        <BundleForm
          bundle={editingBundle}
          onSave={handleSaveBundle}
          onCancel={() => {
            setShowAddForm(false);
            setEditingBundle(null);
          }}
          loading={loading}
        />
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.order_number}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">#{selectedOrder.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.created_at).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg">£{selectedOrder.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedOrder.payment_method?.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Order Status:</span>
                        <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(selectedOrder.status).bgColor} ${getStatusInfo(selectedOrder.status).color}`}>
                          {React.createElement(getStatusInfo(selectedOrder.status).icon, { className: "w-3 h-3 mr-1" })}
                          {getStatusInfo(selectedOrder.status).text}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                    {selectedOrder.user ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedOrder.user.first_name} {selectedOrder.user.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedOrder.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">User Type:</span>
                          <span className="font-medium text-green-600">Registered User</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">User Type:</span>
                          <span className="font-medium text-orange-600">Guest Customer</span>
                        </div>
                        {selectedOrder.shipping_address && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    {selectedOrder.shipping_address ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium ml-2">{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <div className="font-medium ml-2">
                            <div>{selectedOrder.shipping_address.address_line_1}</div>
                            {selectedOrder.shipping_address.address_line_2 && (
                              <div>{selectedOrder.shipping_address.address_line_2}</div>
                            )}
                            <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</div>
                            <div>{selectedOrder.shipping_address.country}</div>
                          </div>
                        </div>
                        {selectedOrder.shipping_address.phone && (
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium ml-2">{selectedOrder.shipping_address.phone}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No shipping address available</p>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrder.order_items.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              {item.product_image ? (
                                <img 
                                  src={item.product_image} 
                                  alt={item.product_name}
                                  className="w-full h-full object-cover rounded"
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
                              <p className="font-bold text-gray-900">
                                £{(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No items found for this order</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingOrder === selectedOrder.id}
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    {updatingOrder === selectedOrder.id ? 'Updating status...' : 'Status will be updated in real-time'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  User Details
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-medium text-xs">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">
                        {new Date(selectedUser.created_at).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-[#D4AF37]">{selectedUser.order_count || 0}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-[#D4AF37]">£{(selectedUser.total_spent || 0).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Orders</h3>
                  <div className="space-y-2">
                    {orders.filter(order => order.user_id === selectedUser.id).slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowUserModal(false);
                              setShowOrderModal(true);
                            }}
                            className="text-sm font-medium text-[#D4AF37] hover:text-[#B8941F] hover:underline"
                          >
                            #{order.order_number}
                          </button>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">£{order.total_amount.toFixed(2)}</div>
                          <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(order.status).bgColor} ${getStatusInfo(order.status).color}`}>
                            {React.createElement(getStatusInfo(order.status).icon, { className: "w-3 h-3 mr-1" })}
                            {getStatusInfo(order.status).text}
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.filter(order => order.user_id === selectedUser.id).length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No orders found for this user</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Management Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Reviews
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({reviews.length} reviews)
                  </span>
                </h2>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#D4AF37] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous'}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {review.user?.email || 'No email'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Product:</strong> {review.product?.title || 'Unknown Product'}
                            </p>
                            {review.comment && (
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {review.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              onClick={() => deleteReview(review.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Compose Email
                </h2>
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Email Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Email Address
                    </label>
                    <input
                      type="email"
                      value={emailComposer.to}
                      onChange={(e) => setEmailComposer(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      value={emailComposer.senderEmail}
                      onChange={(e) => setEmailComposer(prev => ({ ...prev, senderEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailComposer.subject}
                    onChange={(e) => setEmailComposer(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Email subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body
                  </label>
                  <textarea
                    value={emailComposer.body}
                    onChange={(e) => setEmailComposer(prev => ({ ...prev, body: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Write your email content here..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setShowEmailComposer(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendEmail}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                    disabled={!emailComposer.to || !emailComposer.subject || !emailComposer.body}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

