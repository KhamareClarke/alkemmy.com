# Supabase Integration Setup

This document explains how to set up the Supabase integration for the Alkhemmy.com project.

## Prerequisites

- Supabase project created
- Project URL and API key available

## Database Setup

### 1. Create Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON products
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Migrate Existing Data

After setting up the schema, run the migration script:

```bash
npm run migrate-data
```

This will populate the database with the existing product data.

## Features Implemented

### ✅ Product Schema
- **title**: Product name
- **slug**: URL-friendly identifier
- **price**: Product price
- **images**: Array of image URLs
- **description**: Full product description
- **short_description**: Brief product summary
- **tags**: Array of product tags
- **inventory**: Stock quantity
- **category**: Product category
- **rating**: Average rating
- **review_count**: Number of reviews
- **ingredients**: Array of ingredients
- **how_to_use**: Usage instructions
- **in_stock**: Availability status

### ✅ Dynamic Content
- All product pages use dynamic content via slugs
- Products are fetched from Supabase in real-time
- Related products are dynamically generated

### ✅ Search and Filtering
- **Search**: Full-text search across title, description, and short description
- **Category filtering**: Filter by product category
- **Tag filtering**: Filter by product tags
- **Price filtering**: Filter by price range
- **Stock filtering**: Show only in-stock products

### ✅ API Functions
- `getProducts(filters?)`: Get all products with optional filters
- `getProductBySlug(slug)`: Get single product by slug
- `getRelatedProducts(slug, limit?)`: Get related products
- `getCategories()`: Get all unique categories
- `getTags()`: Get all unique tags
- `searchProducts(term, filters?)`: Search products
- `getFeaturedProducts(limit?)`: Get featured products
- `getBestsellerProducts(limit?)`: Get bestseller products

## Usage Examples

### Get all products
```typescript
import { getProducts } from '@/lib/products';

const products = await getProducts();
```

### Search products
```typescript
import { searchProducts } from '@/lib/products';

const results = await searchProducts('soap', {
  category: 'Soap Bar',
  tags: ['Vegan', 'Handmade']
});
```

### Get product by slug
```typescript
import { getProductBySlug } from '@/lib/products';

const product = await getProductBySlug('empire-bar');
```

## Environment Variables

The Supabase configuration is currently hardcoded in `lib/supabase.ts`. For production, consider using environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. Set up the database schema in Supabase
2. Run the data migration
3. Test the product pages and search functionality
4. Consider adding more product data
5. Implement product management interface for admins
6. Add product reviews and ratings system
7. Implement inventory management
8. Add product variants (sizes, colors, etc.)

## Troubleshooting

### Common Issues

1. **Products not loading**: Check if the database schema is properly set up
2. **Search not working**: Ensure the search indexes are created
3. **Permission errors**: Check RLS policies are correctly configured
4. **Migration fails**: Verify the products table exists and is empty

### Debug Mode

To debug Supabase queries, check the browser console for error messages and network requests.

