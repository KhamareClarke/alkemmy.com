/** Stable ids for all 33 Empire OS skills (aligned with product brief). */
export const SKILL_IDS = [
  'smart_product_recommendations',
  'dynamic_product_bundles',
  'personalized_email_marketing',
  'gamification_loyalty',
  'smart_discounting',
  'welcome_series_automation',
  'product_review_generation',
  'content_personalization',
  'demand_forecasting',
  'inventory_optimization',
  'supplier_management',
  'waste_reduction',
  'cost_optimization',
  'packaging_sustainability',
  'quality_assurance',
  'supplier_performance',
  'dynamic_pricing',
  'upsell_cross_sell',
  'churn_prevention',
  'lifetime_value_maximization',
  'cart_recovery',
  'win_back_campaign',
  'referral_growth',
  'ab_testing_automation',
  'satisfaction_monitoring',
  'feedback_loop_automation',
  'vip_customer_program',
  'community_building',
  'seasonal_engagement',
  'content_marketing',
  'influencer_coordination',
  'trend_detection',
  'continuous_optimization',
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export function isSkillId(s: string): s is SkillId {
  return (SKILL_IDS as readonly string[]).includes(s);
}

export type EmpireCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SkillDefinition {
  id: SkillId;
  category: EmpireCategory;
  title: string;
  summary: string;
}

export type EmpireEventType =
  | 'skill.triggered'
  | 'skill.completed'
  | 'skill.failed'
  | 'customer.signal'
  | 'inventory.signal'
  | 'revenue.signal'
  | 'webhook.inbound'
  | 'webhook.outbound_ok'
  | 'webhook.outbound_fail';

export interface EmpireEventPayload {
  skillId?: SkillId;
  eventType: EmpireEventType;
  source?: string;
  data?: Record<string, unknown>;
  correlationId?: string;
}
