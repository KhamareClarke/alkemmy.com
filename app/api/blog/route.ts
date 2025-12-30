import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

// Disable caching for this route to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check if we're using service role key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('🔑 Using service role key:', !!serviceKey);
    console.log('🔑 Using anon key as fallback:', !!anonKey && !serviceKey);
    
    // Try to fetch with count first to see total
    const { count: totalCount, error: countError } = await adminSupabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total count query:', totalCount);
    if (countError) {
      console.error('❌ Count query error:', countError);
    }
    
    // Fetch ALL posts first to see what we have - no filters, no limits
    const { data: allPosts, error: allError, count } = await adminSupabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all posts:', allError);
      console.error('Error details:', JSON.stringify(allError, null, 2));
    }

    console.log('📊 Query Results:');
    console.log('  - Posts returned:', allPosts?.length || 0);
    console.log('  - Count from query:', count);
    console.log('  - Query error:', allError);
    console.log('  - Expected in DB: 5');
    
    if (count !== null && count !== undefined) {
      if (count !== (allPosts?.length || 0)) {
        console.warn(`⚠️ Mismatch: Query count says ${count} but got ${allPosts?.length || 0} posts`);
      }
      if (count !== 5) {
        console.warn(`⚠️ Expected 5 posts but query returned count: ${count}`);
      }
    }
    
    if (allPosts && allPosts.length > 0) {
      console.log('Sample post:', {
        id: allPosts[0].id,
        title: allPosts[0].title,
        published: allPosts[0].published,
        published_at: allPosts[0].published_at
      });
      
      // Log ALL posts with full details
      console.log('📋 Full list of all posts fetched:');
      allPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. ID: ${post.id}`);
        console.log(`     Title: "${post.title}"`);
        console.log(`     Published: ${post.published}`);
        console.log(`     Created: ${post.created_at}`);
        console.log(`     Slug: ${post.slug}`);
        console.log('     ---');
      });
    } else {
      console.warn('⚠️ No posts returned from query, but you say there are 5 in DB');
      console.warn('This might be an RLS (Row Level Security) issue or query problem');
    }

    // Debug: Check the published field type for all posts
    if (allPosts && allPosts.length > 0) {
      console.log('🔍 Checking published field types:');
      allPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}" - published type: ${typeof post.published}, value: ${post.published}, isTrue: ${post.published === true}, isTruthy: ${!!post.published}`);
      });
    }

    // Fetch only published posts for public display
    // Try multiple ways to filter in case of data type issues
    const { data: publishedPosts, error: publishedError } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (publishedError) {
      console.error('Error fetching published blog posts:', publishedError);
    }

    console.log('📊 Published filter results:');
    console.log('  - Published posts count:', publishedPosts?.length || 0);
    console.log('  - Total posts in DB:', allPosts?.length || 0);
    
    // If filter returned fewer posts, manually filter to see what's wrong
    if (publishedPosts && allPosts && publishedPosts.length < allPosts.length) {
      const manuallyFiltered = allPosts.filter(p => p.published === true);
      console.log('  - Manually filtered (published === true):', manuallyFiltered.length);
      
      const manuallyFilteredTruthy = allPosts.filter(p => !!p.published);
      console.log('  - Manually filtered (truthy):', manuallyFilteredTruthy.length);
      
      // Find which posts are missing
      const missingPosts = allPosts.filter(p => {
        const found = publishedPosts.find(p2 => p2.id === p.id);
        return !found && p.published === true;
      });
      if (missingPosts.length > 0) {
        console.warn('  - Posts that should be published but weren\'t returned:');
        missingPosts.forEach(p => {
          console.warn(`    - "${p.title}" (ID: ${p.id}) - published: ${p.published} (type: ${typeof p.published})`);
        });
      }
    }

    // Log detailed info about all posts
    if (allPosts && allPosts.length > 0) {
      console.log('📋 All posts status:');
      allPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}" - Published: ${post.published} (ID: ${post.id})`);
      });
    }

    // If no published posts but we have posts in DB, return all posts with a warning
    // This helps debug the issue
    if ((!publishedPosts || publishedPosts.length === 0) && allPosts && allPosts.length > 0) {
      console.warn('⚠️ No published posts found, but posts exist in DB. Returning all posts for debugging.');
      const allPostsWithDates = (allPosts || []).map(post => ({
        ...post,
        published_at: post.published_at || post.created_at || new Date().toISOString()
      })).sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at).getTime();
        const dateB = new Date(b.published_at || b.created_at).getTime();
        return dateB - dateA;
      });

      return NextResponse.json({ 
        posts: allPostsWithDates,
        debug: {
          totalInDB: allPosts.length,
          publishedCount: 0,
          warning: 'No published posts found. Showing all posts. Please mark posts as published in admin dashboard.',
          allPostsStatus: allPosts.map(p => ({ title: p.title, published: p.published }))
        }
      });
    }

    // If we have some published posts but not all, log which ones are missing
    if (publishedPosts && allPosts && publishedPosts.length < allPosts.length) {
      const unpublishedPosts = allPosts.filter(p => !p.published);
      console.warn(`⚠️ ${unpublishedPosts.length} post(s) are not published:`);
      unpublishedPosts.forEach(post => {
        console.warn(`  - "${post.title}" (ID: ${post.id}) - Status: Draft`);
      });
    }

    // Use manual filtering instead of database filter to handle data type issues
    // Filter all posts where published is truthy (handles both boolean true and string "true")
    const manuallyFilteredPublished = (allPosts || []).filter(post => {
      // Check if published is true (boolean) or truthy string
      const isPublished = post.published === true || post.published === 'true' || !!post.published;
      return isPublished;
    });

    console.log('📊 Manual filtering results:');
    console.log('  - All posts:', allPosts?.length || 0);
    console.log('  - Database filter returned:', publishedPosts?.length || 0);
    console.log('  - Manual filter returned:', manuallyFilteredPublished.length);

    // Use manually filtered posts if database filter missed some
    const postsToUse = manuallyFilteredPublished.length >= (publishedPosts?.length || 0) 
      ? manuallyFilteredPublished 
      : (publishedPosts || []);

    // Map and sort published posts
    const validPosts = postsToUse.map(post => ({
      ...post,
      // Ensure published_at exists, use created_at as fallback
      published_at: post.published_at || post.created_at || new Date().toISOString()
    })).sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return dateB - dateA;
    });

    console.log('✅ Returning published posts:', validPosts.length);

    return NextResponse.json({ 
      posts: validPosts,
      debug: {
        totalInDB: allPosts?.length || 0,
        publishedCount: validPosts.length,
        databaseFilterCount: publishedPosts?.length || 0,
        manualFilterCount: manuallyFilteredPublished.length
      }
    });
  } catch (error) {
    console.error('Unexpected error fetching blog posts:', error);
    return NextResponse.json({ 
      posts: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


