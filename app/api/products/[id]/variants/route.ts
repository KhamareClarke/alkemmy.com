import { NextRequest, NextResponse } from 'next/server';
import { getVariantOptionsForProduct, getVariantsForProduct } from '@/lib/products/variant-management';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const [options, variants] = await Promise.all([
      getVariantOptionsForProduct(id),
      getVariantsForProduct(id),
    ]);
    return NextResponse.json({ options, variants });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load variants' }, { status: 500 });
  }
}
