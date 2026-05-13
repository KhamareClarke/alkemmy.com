export type MarketingSegment = 'vip' | 'loyal' | 'dormant' | 'new' | 'at_risk' | 'unknown';

const VIP_LTV = 500;
const LOYAL_MIN_ORDERS = 3;
const DORMANT_DAYS = 180;
const AT_RISK_DAYS = 90;

export function classifyMarketingSegment(args: {
  ltv: number;
  orderCount: number;
  daysSinceLastOrder: number | null;
}): MarketingSegment {
  if (args.ltv >= VIP_LTV) return 'vip';
  if (args.orderCount >= LOYAL_MIN_ORDERS && (args.daysSinceLastOrder ?? 0) <= AT_RISK_DAYS) return 'loyal';
  if ((args.daysSinceLastOrder ?? 9999) >= DORMANT_DAYS && args.orderCount > 0) return 'dormant';
  if (args.orderCount === 0) return 'new';
  if ((args.daysSinceLastOrder ?? 0) >= AT_RISK_DAYS) return 'at_risk';
  return 'unknown';
}
