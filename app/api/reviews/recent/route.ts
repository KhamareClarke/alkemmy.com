import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    // Fetch recent reviews with user and product information
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        product_id,
        profiles!reviews_user_id_fkey (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Get product information for each review
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        // Try to find the product in category tables first
        const categoryTables = ['soaps', 'herbal_teas', 'lotions', 'oils', 'beard_care', 'shampoos', 'roll_ons', 'elixirs'];
        let product = null;
        let productTable = 'products';

        for (const table of categoryTables) {
          const { data } = await supabase
            .from(table)
            .select('id, title, category')
            .eq('id', review.product_id)
            .single();
          
          if (data) {
            product = data;
            productTable = table;
            break;
          }
        }

        // If not found in category tables, try main products table
        if (!product) {
          const { data } = await supabase
            .from('products')
            .select('id, title, category')
            .eq('id', review.product_id)
            .single();
          
          if (data) {
            product = data;
          }
        }

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user: {
            name: (review.profiles as any)?.email?.split('@')[0] || 'Anonymous',
            email: (review.profiles as any)?.email || ''
          },
          product: product ? {
            title: product.title,
            category: product.category || productTable
          } : null
        };
      })
    );

    return NextResponse.json({ reviews: reviewsWithProducts });
  } catch (error) {
    console.error('Error in recent reviews API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
