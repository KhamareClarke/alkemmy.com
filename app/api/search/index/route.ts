import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/products';
import { indexProduct } from '@/lib/search/algolia';

export async function POST(request: NextRequest) {
  const secret = process.env.ALGOLIA_INDEX_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'ALGOLIA_INDEX_WEBHOOK_SECRET not set' }, { status: 503 });
  }
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await request.json();
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  await indexProduct(product);
  return NextResponse.json({ ok: true, objectID: product.id });
}
