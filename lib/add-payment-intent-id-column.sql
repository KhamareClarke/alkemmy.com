-- Add payment_intent_id column to orders table for Stripe webhook integration
-- This allows us to efficiently find orders by payment intent ID

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);

-- Add comment to column
COMMENT ON COLUMN orders.payment_intent_id IS 'Stripe Payment Intent ID for webhook processing';
