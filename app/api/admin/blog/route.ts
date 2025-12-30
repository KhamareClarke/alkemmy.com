import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

// GET - Fetch all blog posts
export async function GET() {
  try {
    // Check which key we're using
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('[Admin API] Using service role key:', !!serviceKey);
    console.log('[Admin API] Using anon key as fallback:', !!anonKey && !serviceKey);
    
    const { data: posts, error, count } = await adminSupabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin API] Error fetching blog posts:', error);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }

    console.log('[Admin API] Posts fetched:', posts?.length || 0);
    console.log('[Admin API] Total count:', count);
    
    if (count !== null && count !== undefined && count !== (posts?.length || 0)) {
      console.warn(`[Admin API] ⚠️ Mismatch: Count says ${count} but got ${posts?.length || 0} posts`);
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('[Admin API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const postData = await request.json();

    // Validate required fields
    if (!postData.title || !postData.slug || !postData.content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await adminSupabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postData.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Log what we're receiving
    console.log('[Admin API] Creating blog post with data:', {
      title: postData.title,
      slug: postData.slug,
      published: postData.published,
      publishedType: typeof postData.published
    });

    // Ensure published is a boolean (default to true for new posts)
    const publishedValue = postData.published !== undefined 
      ? (postData.published === true || postData.published === 'true') 
      : true; // Default to true if not specified

    const publishedAt = publishedValue 
      ? (postData.published_at || new Date().toISOString())
      : null;

    console.log('[Admin API] Final values - published:', publishedValue, 'published_at:', publishedAt);

    const { data: post, error } = await adminSupabase
      .from('blog_posts')
      .insert({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt || '',
        content: postData.content,
        featured_image: postData.featured_image || null,
        author: postData.author || 'Alkemmy Team',
        category: postData.category || 'skincare',
        tags: postData.tags || [],
        read_time: postData.read_time || 5,
        published: publishedValue, // Use the properly converted boolean
        published_at: publishedAt
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Error creating blog post:', error);
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }

    console.log('[Admin API] ✅ Blog post created successfully:', {
      id: post.id,
      title: post.title,
      published: post.published,
      published_at: post.published_at
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




