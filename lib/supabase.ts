import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvbhcvwjwsjgzjpfpogy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Ymhjdndqd3NqZ3pqcGZwb2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDEzOTksImV4cCI6MjA3NTUxNzM5OX0.OzrUu0NtIL0lrnjQM3J4cOyFWl2mK1yByWtGUcnBYys'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Product {
  id: string
  title: string
  slug: string
  price: number
  images: string[]
  description: string
  short_description?: string
  tags: string[]
  inventory: number
  category: string
  rating?: number
  review_count?: number
  ingredients?: string[]
  how_to_use?: string[]
  in_stock: boolean
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  category?: string
  tags?: string[]
  price_min?: number
  price_max?: number
  in_stock?: boolean
  search?: string
}

export interface Bundle {
  id: string
  title: string
  slug: string
  description: string
  short_description?: string
  price: number
  original_price?: number
  images: string[]
  is_active: boolean
  is_featured: boolean
  is_bestseller: boolean
  category: string
  tags: string[]
  bundle_items: Array<{
    product_id: string
    quantity: number
    product_type: string
  }>
  inventory: number
  in_stock: boolean
  created_at: string
  updated_at: string
}

