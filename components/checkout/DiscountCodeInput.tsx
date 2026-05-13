'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInAppNotifications } from '@/lib/notifications/in-app-context';

export interface AppliedDiscountState {
  discountCodeId: string;
  code: string;
  discountAmount: number;
  discountedSubtotal: number;
}

interface DiscountCodeInputProps {
  subtotal: number;
  categories: string[];
  value: AppliedDiscountState | null;
  onApplied: (v: AppliedDiscountState | null) => void;
}

export default function DiscountCodeInput({
  subtotal,
  categories,
  value,
  onApplied,
}: DiscountCodeInputProps) {
  const { notifyPromoApplied } = useInAppNotifications();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal, categories }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not validate code');
        return;
      }
      if (!data.valid) {
        setError(data.error || 'Invalid code');
        return;
      }
      onApplied({
        discountCodeId: data.discountCodeId,
        code: data.code,
        discountAmount: data.discountAmount,
        discountedSubtotal: data.discountedSubtotal,
      });
      notifyPromoApplied(data.code);
      setCode(data.code);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setCode('');
    onApplied(null);
    setError(null);
  };

  return (
    <div className="space-y-2 border border-gray-100 rounded-lg p-4 bg-gray-50/80">
      <p className="text-sm font-semibold text-gray-900">Discount code</p>
      {value ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-green-700 font-medium">
            {value.code} (−£{value.discountAmount.toFixed(2)})
          </span>
          <Button type="button" variant="outline" size="sm" onClick={remove}>
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="bg-white"
          />
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 bg-[#D4AF37] text-black hover:bg-[#B8941F]"
            disabled={loading || !code.trim()}
            onClick={apply}
          >
            {loading ? '…' : 'Apply'}
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
