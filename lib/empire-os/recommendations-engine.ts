import 'server-only';

/** Complementary categories for cross-sell heuristics (Skill 1 / 18). */
export const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  Soaps: ['Lotions', 'Oils', 'Herbal Teas'],
  Lotions: ['Soaps', 'Oils', 'Shampoos'],
  Oils: ['Soaps', 'Lotions', 'Beard Care'],
  'Herbal Teas': ['Soaps', 'Elixirs'],
  'Beard Care': ['Oils', 'Shampoos'],
  Shampoos: ['Lotions', 'Oils'],
  Shampoo: ['Lotions', 'Oils'],
  'Roll-ons': ['Oils', 'Elixirs'],
  Elixirs: ['Herbal Teas', 'Roll-ons'],
  'Hair & Body Oils': ['Soaps', 'Lotions'],
};

function scoreProduct(
  p: { category: string; tags?: string[]; price: number; title: string },
  seedTags: Set<string>,
  preferCategories: Set<string>
): number {
  let s = 0;
  if (preferCategories.has(p.category)) s += 3;
  const tags = p.tags || [];
  for (const t of tags) {
    if (seedTags.has(t.toLowerCase())) s += 2;
  }
  s += Math.min(1, p.price / 200);
  return s;
}

export function buildComplementaryRecommendations(
  seeds: Array<{ category: string; tags?: string[]; slug: string; title: string }>,
  catalog: Array<{ id: string; slug: string; title: string; category: string; price: number; tags?: string[]; in_stock?: boolean; images?: string[] }>,
  opts: { limit?: number; bundleDiscountPercent?: number } = {}
): {
  recommendations: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    price: number;
    reason: string;
    bundleDiscountPercent?: number;
  }>;
} {
  const limit = opts.limit ?? 6;
  const bundleDiscountPercent = opts.bundleDiscountPercent ?? 15;

  const seedSlugs = new Set(seeds.map((s) => s.slug));
  const seedTags = new Set<string>();
  const preferCats = new Set<string>();

  for (const s of seeds) {
    for (const t of s.tags || []) seedTags.add(t.toLowerCase());
    preferCats.add(s.category);
    const extra = COMPLEMENTARY_CATEGORIES[s.category] || COMPLEMENTARY_CATEGORIES[s.category.replace(/s$/i, '')] || [];
    for (const c of extra) preferCats.add(c);
  }

  const scored = catalog
    .filter((p) => p.in_stock !== false && !seedSlugs.has(p.slug))
    .map((p) => ({
      p,
      score: scoreProduct(p, seedTags, preferCats),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const recommendations = scored.map(({ p, score }) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    price: p.price,
    reason:
      score >= 5
        ? 'Matches your routine + shared ingredients/tags'
        : 'Pairs with your cart or last viewed category',
    bundleDiscountPercent: score >= 4 ? bundleDiscountPercent : undefined,
  }));

  return { recommendations };
}
