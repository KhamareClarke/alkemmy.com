import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/reviews/average?productIds=id1,id2,id3 - Get average ratings for multiple products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('productIds');

    if (!productIds) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    const ids = productIds.split(',');

    // Get average ratings for all products
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', ids);

    if (error) {
      console.error('Error fetching review averages:', error);
      return NextResponse.json({ error: 'Failed to fetch review averages' }, { status: 500 });
    }

    // Calculate averages for each product
    const averages: Record<string, { averageRating: number; totalReviews: number }> = {};

    // Initialize all products with 0 ratings
    ids.forEach(id => {
      averages[id] = { averageRating: 0, totalReviews: 0 };
    });

    // Calculate averages
    reviews?.forEach(review => {
      if (!averages[review.product_id]) {
        averages[review.product_id] = { averageRating: 0, totalReviews: 0 };
      }
      averages[review.product_id].totalReviews++;
    });

    // Calculate average ratings
    Object.keys(averages).forEach(productId => {
      const productReviews = reviews?.filter(r => r.product_id === productId) || [];
      if (productReviews.length > 0) {
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        averages[productId].averageRating = Math.round((totalRating / productReviews.length) * 10) / 10;
      }
    });

    return NextResponse.json({ averages });
  } catch (error) {
    console.error('Unexpected error in GET /api/reviews/average:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




