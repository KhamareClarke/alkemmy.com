export type DiscountCodeType = 'percentage' | 'fixed'
export type DiscountCodeStatus = 'active' | 'inactive' | 'expired'

export interface DiscountCodeRow {
  id: string
  code: string
  type: DiscountCodeType
  value: number
  max_uses: number | null
  current_uses: number
  expiry_date: string | null
  applicable_categories: string[] | null
  minimum_order_amount: number | null
  status: DiscountCodeStatus
  created_at: string
  created_by: string | null
}

export interface ValidatedDiscount {
  codeRow: DiscountCodeRow
  /** Subtotal after discount, before shipping */
  discountedSubtotal: number
  discountAmount: number
}

export interface CartLineForDiscount {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}
