-- Create reviews table for product reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- One review per user per product
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews table
CREATE POLICY "reviews_select_policy" ON reviews
  FOR SELECT USING (true); -- Anyone can read reviews

CREATE POLICY "reviews_insert_policy" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "reviews_update_policy" ON reviews
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

CREATE POLICY "reviews_delete_policy" ON reviews
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();




