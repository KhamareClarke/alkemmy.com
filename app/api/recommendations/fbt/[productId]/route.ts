import { NextRequest, NextResponse } from 'next/server';
import { getFrequentlyBoughtTogether } from '@/lib/recommendations/frequently-bought-together';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 });
  }

  try {
    const items = await getFrequentlyBoughtTogether(productId, 8);
    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
