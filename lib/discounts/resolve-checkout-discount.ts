import { adminSupabase } from '@/lib/admin-supabase';
import type { CartItem } from '@/lib/cart-context';
import type { OrderDiscountMeta } from '@/lib/order-types';
import { applyDiscountToCartLines } from './apply-discount';
import type { CartLineForDiscount } from './types';
import { validateDiscountCodeRow } from './validate-code';

export interface CheckoutDiscountInput {
  id: string;
  code: string;
}

/**
 * Server-side: load code by id, verify code string, validate rules, return priced cart + meta.
 */
export async function resolveCheckoutDiscount(
  discount: CheckoutDiscountInput | null | undefined,
  cartItems: CartItem[]
): Promise<{
  pricedCart: CartItem[];
  discountMeta: OrderDiscountMeta | null;
  subtotalBefore: number;
  subtotalAfter: number;
  discountAmount: number;
}> {
  const subtotalBefore = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const categories = Array.from(new Set(cartItems.map((i) => i.category)));

  if (!discount?.id || !discount?.code?.trim()) {
    return {
      pricedCart: cartItems,
      discountMeta: null,
      subtotalBefore,
      subtotalAfter: subtotalBefore,
      discountAmount: 0,
    };
  }

  const { data: row, error } = await adminSupabase
    .from('discount_codes')
    .select('*')
    .eq('id', discount.id)
    .maybeSingle();

  if (error || !row || row.code !== discount.code.trim()) {
    throw new Error('Invalid discount code');
  }

  const lines: CartLineForDiscount[] = cartItems.map((i) => ({
    id: String(i.id).split('::')[0],
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    category: i.category,
  }));

  const v = validateDiscountCodeRow(row, subtotalBefore, categories);
  if (!v.ok) {
    throw new Error(v.error);
  }

  const pricedLines = applyDiscountToCartLines(lines, v.result);

  const pricedCart: CartItem[] = cartItems.map((item, idx) => ({
    ...item,
    price: pricedLines[idx]?.adjustedUnitPrice ?? item.price,
  }));

  const subtotalAfter = pricedCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = Math.round((subtotalBefore - subtotalAfter) * 100) / 100;

  return {
    pricedCart,
    discountMeta: {
      discountCodeId: row.id,
      discountCode: row.code,
      discountAmount,
    },
    subtotalBefore,
    subtotalAfter,
    discountAmount,
  };
}
