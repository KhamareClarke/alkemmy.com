'use client';

import React from 'react';
import type { VariantOptionRow, ProductVariantRow } from '@/lib/products/variant-management';

interface VariantSelectorProps {
  options: VariantOptionRow[];
  variants: ProductVariantRow[];
  selected: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

export default function VariantSelector({
  options,
  variants,
  selected,
  onChange,
}: VariantSelectorProps) {
  if (!options.length) return null;

  return (
    <div className="space-y-4 mb-6">
      <p className="font-semibold text-gray-900">Options</p>
      {options.map((opt) => (
        <div key={opt.id}>
          <p className="text-sm text-gray-600 mb-2">{opt.option_name}</p>
          <div className="flex flex-wrap gap-2">
            {(opt.option_values || []).map((val) => {
              const active = (selected[opt.option_name] || '') === val;
              const exists = variants.some(
                (v) => (v.option_values?.[opt.option_name] || '') === val
              );
              return (
                <button
                  key={val}
                  type="button"
                  disabled={!exists}
                  onClick={() => onChange({ ...selected, [opt.option_name]: val })}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    active
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-gray-900'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  } ${!exists ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
