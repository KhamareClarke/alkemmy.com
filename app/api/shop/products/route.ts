import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getCategories, getTags } from '@/lib/products';

// Use Next.js caching for fast responses
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const inStock = searchParams.get('in_stock');

    const filters = {
      category: category && category !== 'all' ? category : undefined,
      search: search || undefined,
      tags: tags ? tags.split(',') : undefined,
      in_stock: inStock === 'true' ? true : undefined,
    };

    // Fetch all data in parallel
    const [products, categories, availableTags] = await Promise.all([
      getAllProducts(filters),
      getCategories(),
      getTags(),
    ]);

    return NextResponse.json({
      products,
      categories,
      tags: availableTags,
    });
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
