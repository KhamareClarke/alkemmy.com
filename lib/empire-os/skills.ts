import type { SkillDefinition } from './types';

/** Full registry: 33 autonomous skills across 5 categories. */
export const EMPIRE_SKILLS: SkillDefinition[] = [
  {
    id: 'smart_product_recommendations',
    category: 'A',
    title: 'Smart Product Recommendations',
    summary:
      'Browsing + purchase signals → complementary products (e.g. Lavender Soap → Lavender Lotion + bundle hint).',
  },
  {
    id: 'dynamic_product_bundles',
    category: 'A',
    title: 'Dynamic Product Bundles',
    summary: 'Personalized “Complete Your Routine” bundles matched to skin type / history.',
  },
  {
    id: 'personalized_email_marketing',
    category: 'A',
    title: 'Personalized Email Marketing',
    summary: 'Subject/body/timing tuned per engagement (e.g. open-time scheduling).',
  },
  {
    id: 'gamification_loyalty',
    category: 'A',
    title: 'Gamification for Loyalty',
    summary: 'Points per spend, badges (e.g. 3 reviews), tiers redeemable as discounts.',
  },
  {
    id: 'smart_discounting',
    category: 'A',
    title: 'Smart Discounting',
    summary: 'Optimal discount depth + moment (e.g. post-abandon timed offer).',
  },
  {
    id: 'welcome_series_automation',
    category: 'A',
    title: 'Welcome Series Automation',
    summary: 'Multi-step welcome + quiz + first-purchase incentive; branches on behavior.',
  },
  {
    id: 'product_review_generation',
    category: 'A',
    title: 'Product Review Generation',
    summary: 'Review asks at best time; loyalty points as incentive.',
  },
  {
    id: 'content_personalization',
    category: 'A',
    title: 'Content Personalization',
    summary: 'Segmented storefront copy: new vs repeat (“Top 5” vs “Your favorites”).',
  },
  {
    id: 'demand_forecasting',
    category: 'B',
    title: 'Demand Forecasting',
    summary: 'SKU-level demand signals → reorder suggestions by quarter.',
  },
  {
    id: 'inventory_optimization',
    category: 'B',
    title: 'Inventory Optimization',
    summary: 'Fast/slow movers → suggested order quantities.',
  },
  {
    id: 'supplier_management',
    category: 'B',
    title: 'Supplier Management',
    summary: 'Low stock → alerts / backup supplier routing (policy-driven).',
  },
  {
    id: 'waste_reduction',
    category: 'B',
    title: 'Waste Reduction',
    summary: 'Near-expiry → clearance bundles and targeted promos.',
  },
  {
    id: 'cost_optimization',
    category: 'B',
    title: 'Cost Optimization',
    summary: 'Compare supplier quotes; surface savings scenarios.',
  },
  {
    id: 'packaging_sustainability',
    category: 'B',
    title: 'Packaging Sustainability',
    summary: 'Eco option tradeoffs (cost delta vs positioning value).',
  },
  {
    id: 'quality_assurance',
    category: 'B',
    title: 'Quality Assurance',
    summary: 'Batch / review sentiment anomalies → QC flags.',
  },
  {
    id: 'supplier_performance',
    category: 'B',
    title: 'Supplier Performance',
    summary: 'Scorecards: on-time, defect rate, lead time.',
  },
  {
    id: 'dynamic_pricing',
    category: 'C',
    title: 'Dynamic Pricing',
    summary: 'Demand-aware price bands within guardrails.',
  },
  {
    id: 'upsell_cross_sell',
    category: 'C',
    title: 'Upselling & Cross-Selling',
    summary: 'Contextual ladder offers (entry → premium line).',
  },
  {
    id: 'churn_prevention',
    category: 'C',
    title: 'Churn Prevention',
    summary: 'Win-back paths for lapsed buyers with guardrailed discounts.',
  },
  {
    id: 'lifetime_value_maximization',
    category: 'C',
    title: 'Lifetime Value Maximization',
    summary: 'CLV tiers → VIP perks, early access, concierge flows.',
  },
  {
    id: 'cart_recovery',
    category: 'C',
    title: 'Cart Recovery',
    summary: 'Diagnose friction (shipping, trust) → tailored recovery offers.',
  },
  {
    id: 'win_back_campaign',
    category: 'C',
    title: 'Win-Back Campaign',
    summary: 'High-intent dormant segments → controlled incentives.',
  },
  {
    id: 'referral_growth',
    category: 'C',
    title: 'Referral Growth',
    summary: 'Satisfied cohorts → referral codes + attribution.',
  },
  {
    id: 'ab_testing_automation',
    category: 'C',
    title: 'A/B Testing Automation',
    summary: 'Auto-allocate traffic; promote winning variant when significant.',
  },
  {
    id: 'satisfaction_monitoring',
    category: 'D',
    title: 'Satisfaction Monitoring',
    summary: 'NPS/CSAT post-purchase; route detractors to support playbooks.',
  },
  {
    id: 'feedback_loop_automation',
    category: 'D',
    title: 'Feedback Loop Automation',
    summary: 'Aggregate themes (e.g. shipping complaints) → actionable tickets.',
  },
  {
    id: 'vip_customer_program',
    category: 'D',
    title: 'VIP Customer Program',
    summary: 'Top cohorts → early drops, exclusive SKUs, concierge.',
  },
  {
    id: 'community_building',
    category: 'D',
    title: 'Community Building',
    summary: 'Themed micro-segments (e.g. “Lavender Lovers”) for previews & UGC.',
  },
  {
    id: 'seasonal_engagement',
    category: 'D',
    title: 'Seasonal Engagement',
    summary: 'Calendar-aware campaigns and bundles (summer essentials, etc.).',
  },
  {
    id: 'content_marketing',
    category: 'E',
    title: 'Content Marketing',
    summary: 'Blog ↔ email loops; auto-surface fresh posts to relevant segments.',
  },
  {
    id: 'influencer_coordination',
    category: 'E',
    title: 'Influencer Coordination',
    summary: 'Track mentions, UTMs, and rough ROI from attributed orders.',
  },
  {
    id: 'trend_detection',
    category: 'E',
    title: 'Trend Detection',
    summary: 'Search/review/tag spikes → new product or collection hypotheses.',
  },
  {
    id: 'continuous_optimization',
    category: 'E',
    title: 'Continuous Optimization',
    summary: 'Per-cohort learning loops (messaging style, benefit vs social proof).',
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  A: 'Customer engagement',
  B: 'Inventory & supply chain',
  C: 'Revenue optimization',
  D: 'Customer retention',
  E: 'Marketing & content',
};

export function skillById(id: string): SkillDefinition | undefined {
  return EMPIRE_SKILLS.find((s) => s.id === id);
}
