import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getProductBySlug } from '@/lib/products';
import { buildComplementaryRecommendations } from '@/lib/empire-os/recommendations-engine';
import { emitSkillSignal } from '@/lib/empire-os/emit';

/**
 * Skill 1 / 18 — complementary recommendations from slugs or category context.
 * POST { slugs?: string[], limit?: number, bundleDiscountPercent?: number, context?: { category?: string } }
 */
export async function POST(request: NextRequest) {
  const optSecret = process.env.EMPIRE_OS_RECOMMENDATIONS_SECRET?.trim();
  if (optSecret) {
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (token !== optSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: {
    slugs?: string[];
    limit?: number;
    bundleDiscountPercent?: number;
    context?: { category?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slugs = Array.isArray(body.slugs) ? body.slugs.filter((s) => typeof s === 'string') : [];
  const seeds: Array<{ category: string; tags?: string[]; slug: string; title: string }> = [];

  for (const slug of slugs.slice(0, 12)) {
    const p = await getProductBySlug(slug);
    if (p) {
      seeds.push({
        category: p.category,
        tags: p.tags,
        slug: p.slug,
        title: p.title,
      });
    }
  }

  if (seeds.length === 0 && body.context?.category) {
    seeds.push({
      category: body.context.category,
      tags: [],
      slug: '_context',
      title: '',
    });
  }

  if (seeds.length === 0) {
    return NextResponse.json(
      { error: 'Provide at least one valid product slug or context.category' },
      { status: 400 }
    );
  }

  const catalog = await getAllProducts();
  const { recommendations } = buildComplementaryRecommendations(seeds, catalog, {
    limit: Math.min(12, body.limit ?? 6),
    bundleDiscountPercent: body.bundleDiscountPercent,
  });

  const { correlationId } = await emitSkillSignal('smart_product_recommendations', {
    seedSlugs: slugs,
    resultCount: recommendations.length,
    sample: recommendations.slice(0, 3).map((r) => r.slug),
  });

  return NextResponse.json({ recommendations, correlationId, skill: 'smart_product_recommendations' });
}
