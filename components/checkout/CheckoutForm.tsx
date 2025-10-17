'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, User, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';

// Form validation schemas
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/County is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  billingSameAsShipping: z.boolean(),
  paymentMethod: z.enum(['cash_on_delivery']),
  saveAddress: z.boolean().optional(),
}).refine((data) => {
  if (!data.billingSameAsShipping) {
    return data.billingAddress !== undefined;
  }
  return true;
}, {
  message: "Billing address is required when different from shipping",
  path: ["billingAddress"]
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function CheckoutForm({ onSubmit, isLoading, error }: CheckoutFormProps) {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingSameAsShipping: true,
      paymentMethod: 'cash_on_delivery',
      saveAddress: false,
    },
  });

  const billingSameAsShipping = watch('billingSameAsShipping');

  // Load user addresses if logged in
  useEffect(() => {
    if (user) {
      loadUserAddresses();
    } else {
      // For guest users, show the form directly
      setShowAddressForm(true);
    }
  }, [user]);

  const loadUserAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'shipping')
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error);
        setShowAddressForm(true);
      } else {
        setUserAddresses(data || []);
        if (data && data.length > 0) {
          setShowAddressForm(false);
          const defaultAddress = data.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedShippingAddress(defaultAddress.id);
            populateFormWithAddress(defaultAddress);
          }
        } else {
          setShowAddressForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setShowAddressForm(true);
    }
  };

  const populateFormWithAddress = (address: any) => {
    setValue('shippingAddress.firstName', address.first_name);
    setValue('shippingAddress.lastName', address.last_name);
    setValue('shippingAddress.email', user?.email || '');
    setValue('shippingAddress.addressLine1', address.address_line_1);
    setValue('shippingAddress.addressLine2', address.address_line_2 || '');
    setValue('shippingAddress.city', address.city);
    setValue('shippingAddress.state', address.state);
    setValue('shippingAddress.postalCode', address.postal_code);
    setValue('shippingAddress.country', address.country);
    setValue('shippingAddress.phone', address.phone || '');
  };

  const onFormSubmit = async (data: CheckoutFormData) => {
    console.log('Form submitted with data:', data);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout.</p>
        <Button asChild>
          <a href="/shop">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Address Selection for Logged-in Users */}
      {user && !showAddressForm && userAddresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Select Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedShippingAddress === address.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedShippingAddress(address.id);
                    populateFormWithAddress(address);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {address.first_name} {address.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      {address.phone && (
                        <p className="text-sm text-gray-600">{address.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {address.is_default && (
                        <span className="text-xs bg-[#D4AF37] text-black px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      {selectedShippingAddress === address.id && (
                        <div className="w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddressForm(true)}
                className="w-full"
              >
                Add New Address
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Address Form */}
      {showAddressForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shippingFirstName">First Name *</Label>
                <Input
                  id="shippingFirstName"
                  {...register('shippingAddress.firstName')}
                  className={errors.shippingAddress?.firstName ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="shippingLastName">Last Name *</Label>
                <Input
                  id="shippingLastName"
                  {...register('shippingAddress.lastName')}
                  className={errors.shippingAddress?.lastName ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shippingEmail">Email Address *</Label>
                <Input
                  id="shippingEmail"
                  type="email"
                  {...register('shippingAddress.email')}
                  className={errors.shippingAddress?.email ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="shippingPhone">Phone Number</Label>
                <Input
                  id="shippingPhone"
                  type="tel"
                  {...register('shippingAddress.phone')}
                  className={errors.shippingAddress?.phone ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="shippingAddress1">Address Line 1 *</Label>
              <Input
                id="shippingAddress1"
                {...register('shippingAddress.addressLine1')}
                className={errors.shippingAddress?.addressLine1 ? 'border-red-500' : ''}
              />
              {errors.shippingAddress?.addressLine1 && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.shippingAddress.addressLine1.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="shippingAddress2">Address Line 2</Label>
              <Input
                id="shippingAddress2"
                {...register('shippingAddress.addressLine2')}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shippingCity">City *</Label>
                <Input
                  id="shippingCity"
                  {...register('shippingAddress.city')}
                  className={errors.shippingAddress?.city ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="shippingState">State/County *</Label>
                <Input
                  id="shippingState"
                  {...register('shippingAddress.state')}
                  className={errors.shippingAddress?.state ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.state && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.state.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="shippingPostalCode">Postal Code *</Label>
                <Input
                  id="shippingPostalCode"
                  {...register('shippingAddress.postalCode')}
                  className={errors.shippingAddress?.postalCode ? 'border-red-500' : ''}
                />
                {errors.shippingAddress?.postalCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.shippingAddress.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="shippingCountry">Country *</Label>
              <select
                id="shippingCountry"
                {...register('shippingAddress.country')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="Ireland">Ireland</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
              {errors.shippingAddress?.country && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.shippingAddress.country.message}
                </p>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveAddress"
                  {...register('saveAddress')}
                />
                <Label htmlFor="saveAddress">Save this address for future orders</Label>
              </div>
            )}

            {user && userAddresses.length > 0 && (
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddressForm(false)}
                  className="w-full"
                >
                  Back to Address Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="billingSameAsShipping"
              checked={billingSameAsShipping}
              onCheckedChange={(checked) => setValue('billingSameAsShipping', checked as boolean)}
            />
            <Label htmlFor="billingSameAsShipping">Billing address same as shipping</Label>
          </div>

          {!billingSameAsShipping && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingFirstName">First Name *</Label>
                  <Input
                    id="billingFirstName"
                    {...register('billingAddress.firstName')}
                    className={errors.billingAddress?.firstName ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.billingAddress.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="billingLastName">Last Name *</Label>
                  <Input
                    id="billingLastName"
                    {...register('billingAddress.lastName')}
                    className={errors.billingAddress?.lastName ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.lastName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.billingAddress.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="billingAddress1">Address Line 1 *</Label>
                <Input
                  id="billingAddress1"
                  {...register('billingAddress.addressLine1')}
                  className={errors.billingAddress?.addressLine1 ? 'border-red-500' : ''}
                />
                {errors.billingAddress?.addressLine1 && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.billingAddress.addressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="billingAddress2">Address Line 2</Label>
                <Input
                  id="billingAddress2"
                  {...register('billingAddress.addressLine2')}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billingCity">City *</Label>
                  <Input
                    id="billingCity"
                    {...register('billingAddress.city')}
                    className={errors.billingAddress?.city ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.city && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.billingAddress.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="billingState">State/County *</Label>
                  <Input
                    id="billingState"
                    {...register('billingAddress.state')}
                    className={errors.billingAddress?.state ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.state && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.billingAddress.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="billingPostalCode">Postal Code *</Label>
                  <Input
                    id="billingPostalCode"
                    {...register('billingAddress.postalCode')}
                    className={errors.billingAddress?.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.billingAddress?.postalCode && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.billingAddress.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="billingCountry">Country *</Label>
                <select
                  id="billingCountry"
                  {...register('billingAddress.country')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
                {errors.billingAddress?.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.billingAddress.country.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method - Cash on Delivery Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Cash on Delivery</p>
                <p className="text-sm text-gray-600">Pay when your order arrives</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-8 py-3"
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </form>
  );
}