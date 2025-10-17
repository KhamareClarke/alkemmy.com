import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get reviews with user information
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles!user_id(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Calculate average rating
    const totalRating = reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
    const averageRating = reviews?.length > 0 ? totalRating / reviews.length : 0;
    const totalReviews = reviews?.length || 0;

    return NextResponse.json({
      reviews: reviews || [],
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const { productId, rating, comment } = await request.json();

    if (!productId || !rating) {
      return NextResponse.json({ error: 'Product ID and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Get the current user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    // Create the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: productId,
        rating,
        comment: comment || null
      })
      .select(`
        *,
        user:profiles!user_id(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




