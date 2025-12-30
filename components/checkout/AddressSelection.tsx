'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Edit3, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Address {
  id: string;
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
  created_at: string;
  updated_at: string;
}

interface AddressSelectionProps {
  onAddressSelect: (address: Address) => void;
  onAddNew: () => void;
  selectedAddressId?: string;
  type: 'shipping' | 'billing';
}

export default function AddressSelection({ 
  onAddressSelect, 
  onAddNew, 
  selectedAddressId,
  type 
}: AddressSelectionProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedAddressId || null);

  useEffect(() => {
    if (user) {
      loadAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', type)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error);
      } else {
        setAddresses(data || []);
        // Auto-select default address if available
        const defaultAddress = data?.find(addr => addr.is_default);
        if (defaultAddress && !selectedId) {
          setSelectedId(defaultAddress.id);
          onAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedId(addressId);
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      onAddressSelect(address);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Please sign in to use saved addresses or continue as guest.
          </p>
          <Button onClick={onAddNew} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Enter Address Manually
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            No saved {type} addresses found. Add a new address below.
          </p>
          <Button onClick={onAddNew} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup
            value={selectedId || ''}
            onValueChange={handleAddressSelect}
            className="space-y-3"
          >
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedId === address.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={address.id}
                    id={address.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={address.id} className="cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {address.first_name} {address.last_name}
                          </span>
                          {address.is_default && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37] text-black">
                              Default
                            </span>
                          )}
                        </div>
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
                    </Label>
                  </div>
                  {selectedId === address.id && (
                    <div className="flex items-center text-[#D4AF37]">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </RadioGroup>

          <div className="pt-4 border-t">
            <Button
              onClick={onAddNew}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




