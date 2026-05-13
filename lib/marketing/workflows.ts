export type WorkflowId = 'WELCOME_SERIES' | 'CART_ABANDONMENT' | 'PURCHASE_FOLLOW_UP' | 'WIN_BACK_CAMPAIGN';

export interface WorkflowStep {
  id: string;
  /** Hours after workflow start or previous step */
  delayHours: number;
  templateKey: string;
  subject?: string;
  /** Minimal condition DSL evaluated server-side when runner is wired */
  condition?: 'always' | 'has_cart_items' | 'no_purchase_7d' | 'purchased_before';
}

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

/** Declarative automation definitions — enqueue sends via your email provider / job runner. */
export const workflows: Record<WorkflowId, WorkflowDefinition> = {
  WELCOME_SERIES: {
    id: 'WELCOME_SERIES',
    name: 'Welcome series',
    description: 'Onboarding after signup',
    steps: [
      { id: 'w1', delayHours: 0, templateKey: 'signup_confirmation', condition: 'always' },
      { id: 'w2', delayHours: 24, templateKey: 'newsletter_weekly', subject: 'Getting started', condition: 'always' },
      { id: 'w3', delayHours: 72, templateKey: 'new_product_launch', subject: 'Curated picks for you', condition: 'always' },
    ],
  },
  CART_ABANDONMENT: {
    id: 'CART_ABANDONMENT',
    name: 'Cart abandonment',
    description: 'Recover checkout drop-off',
    steps: [
      { id: 'c1', delayHours: 1, templateKey: 'abandoned_cart', condition: 'has_cart_items' },
      { id: 'c2', delayHours: 24, templateKey: 'abandoned_cart', subject: 'Still thinking it over?', condition: 'has_cart_items' },
      { id: 'c3', delayHours: 72, templateKey: 'abandoned_cart', subject: 'Last reminder — your cart', condition: 'has_cart_items' },
    ],
  },
  PURCHASE_FOLLOW_UP: {
    id: 'PURCHASE_FOLLOW_UP',
    name: 'Post-purchase',
    description: 'Reviews and replenishment nudges',
    steps: [
      { id: 'p1', delayHours: 48, templateKey: 'product_review_request', condition: 'always' },
      { id: 'p2', delayHours: 168, templateKey: 'newsletter_seasonal', subject: 'How is your routine?', condition: 'always' },
    ],
  },
  WIN_BACK_CAMPAIGN: {
    id: 'WIN_BACK_CAMPAIGN',
    name: 'Win-back',
    description: 'Re-engage dormant customers',
    steps: [
      { id: 'b1', delayHours: 0, templateKey: 'newsletter_weekly', subject: 'We miss you', condition: 'no_purchase_7d' },
      { id: 'b2', delayHours: 120, templateKey: 'price_drop', condition: 'purchased_before' },
    ],
  },
};
