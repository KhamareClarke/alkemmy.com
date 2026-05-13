/**
 * Pure cart math (mirrors {@link cartReducer} totals) for unit tests without React.
 */
export interface CartLineInput {
  price: number;
  quantity: number;
}

export function cartLineTotal(line: CartLineInput): number {
  return Math.round(line.price * line.quantity * 100) / 100;
}

export function computeCartTotals(lines: CartLineInput[]): { totalItems: number; totalPrice: number } {
  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const totalPrice = Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;
  return { totalItems, totalPrice };
}
