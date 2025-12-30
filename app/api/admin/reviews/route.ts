import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all reviews with user and product information
    const { data: reviews, error } = await adminSupabase
      .from('reviews')
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // For each review, try to find the product in any category table
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        // List of all category tables to search
        const categoryTables = [
          'soaps',
          'herbal_teas', 
          'lotions',
          'oils',
          'beard_care',
          'shampoos',
          'roll_ons',
          'elixirs'
        ];

        let product = null;

        // Search each category table for the product
        for (const table of categoryTables) {
          try {
            const { data: productData, error: productError } = await adminSupabase
              .from(table)
              .select('title, slug')
              .eq('id', review.product_id)
              .single();

            if (productData && !productError) {
              product = productData;
              break;
            }
          } catch (err) {
            // Continue to next table if this one fails
            continue;
          }
        }

        // If not found in any category table, try the main products table as fallback
        if (!product) {
          try {
            const { data: productData, error: productError } = await adminSupabase
              .from('products')
              .select('title, slug')
              .eq('id', review.product_id)
              .single();

            if (productData && !productError) {
              product = productData;
            }
          } catch (err) {
            // Product not found
          }
        }

        return {
          ...review,
          product: product || { title: 'Unknown Product', slug: '' }
        };
      })
    );

    return NextResponse.json({
      reviews: reviewsWithProducts,
      total: reviewsWithProducts.length
    });

  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




