export type CustomerSegment = 'vip' | 'loyal' | 'at_risk' | 'new' | 'dormant';
export type LifetimeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AcquisitionSource = 'organic' | 'paid_ads' | 'referral' | 'unknown';

export interface CustomerProfileRow {
  id: string;
  user_id: string;
  total_lifetime_value: number;
  total_orders: number;
  average_order_value: number;
  last_order_date: string | null;
  segment: CustomerSegment | null;
  lifetime_tier: LifetimeTier | null;
  predicted_churn_risk: number | null;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  source: AcquisitionSource | null;
  updated_at: string;
  created_at: string;
}
