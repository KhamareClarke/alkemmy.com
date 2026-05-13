import 'server-only';
import { algoliasearch } from 'algoliasearch';
import type { Product } from '@/lib/supabase';
import { getProducts } from '@/lib/products';

function getIndexName(): string {
  return process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME?.trim() || process.env.ALGOLIA_INDEX_NAME?.trim() || 'products';
}

function searchClient() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID?.trim() || process.env.ALGOLIA_APP_ID?.trim();
  const key =
    process.env.ALGOLIA_SEARCH_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY?.trim();
  if (!appId || !key) return null;
  return algoliasearch(appId, key);
}

function writeClient() {
  const appId = process.env.ALGOLIA_APP_ID?.trim() || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID?.trim();
  const key = process.env.ALGOLIA_ADMIN_API_KEY?.trim();
  if (!appId || !key) return null;
  return algoliasearch(appId, key);
}

export function isAlgoliaConfigured(): boolean {
  return !!searchClient();
}

export async function searchProducts(query: string, opts?: { hitsPerPage?: number; facetFilters?: string[] }) {
  const client = searchClient();
  const indexName = getIndexName();
  if (!client || !query.trim()) {
    const fallback = await getProducts({ search: query, in_stock: true });
    return { hits: fallback, source: 'supabase' as const };
  }

  const res = await client.search({
    requests: [
      {
        indexName,
        query: query.trim(),
        hitsPerPage: opts?.hitsPerPage ?? 24,
        ...(opts?.facetFilters?.length ? { facetFilters: opts.facetFilters } : {}),
      },
    ],
  });

  const first = res.results[0];
  const hits = (first && 'hits' in first ? first.hits : []) as unknown[];
  return { hits, source: 'algolia' as const };
}

export async function indexProduct(product: Product): Promise<void> {
  const client = writeClient();
  if (!client) throw new Error('Algolia admin not configured (ALGOLIA_APP_ID + ALGOLIA_ADMIN_API_KEY)');

  const indexName = getIndexName();
  const doc = {
    objectID: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: product.price,
    tags: product.tags,
    rating: product.rating,
    in_stock: product.in_stock,
    images: product.images,
  };

  await client.saveObjects({ indexName, objects: [doc] });
}
