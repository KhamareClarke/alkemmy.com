import { supabase } from '@/lib/supabase';

export interface HelpCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface HelpArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category_id: string | null;
  published_at: string | null;
}

export interface HelpArticleDetail extends HelpArticleListItem {
  body: string;
  helpful_count: number;
  not_helpful_count: number;
}

export async function listHelpCategories(): Promise<HelpCategory[]> {
  const { data, error } = await supabase
    .from('help_categories')
    .select('id, slug, title, description, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[help] categories', error.message);
    return [];
  }
  return (data || []) as HelpCategory[];
}

export async function listPublishedArticles(categorySlug?: string): Promise<HelpArticleListItem[]> {
  let q = supabase
    .from('help_articles')
    .select('id, slug, title, excerpt, category_id, published_at')
    .eq('status', 'published');

  if (categorySlug) {
    const { data: cat } = await supabase.from('help_categories').select('id').eq('slug', categorySlug).eq('is_active', true).maybeSingle();
    if (!cat?.id) return [];
    q = q.eq('category_id', cat.id);
  }

  const { data, error } = await q.order('published_at', { ascending: false, nullsFirst: false });
  if (error) {
    console.error('[help] articles', error.message);
    return [];
  }
  return (data || []) as HelpArticleListItem[];
}

function escapeIlike(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export async function searchHelpArticles(term: string): Promise<HelpArticleListItem[]> {
  const t = term.trim().replace(/,/g, ' ');
  if (!t) return listPublishedArticles();

  const pattern = `%${escapeIlike(t)}%`;
  const sel = 'id, slug, title, excerpt, category_id, published_at';

  const [byTitle, byExcerpt] = await Promise.all([
    supabase.from('help_articles').select(sel).eq('status', 'published').ilike('title', pattern).limit(25),
    supabase.from('help_articles').select(sel).eq('status', 'published').ilike('excerpt', pattern).limit(25),
  ]);

  if (byTitle.error) console.error('[help] search title', byTitle.error.message);
  if (byExcerpt.error) console.error('[help] search excerpt', byExcerpt.error.message);

  const map = new Map<string, HelpArticleListItem>();
  for (const row of [...(byTitle.data || []), ...(byExcerpt.data || [])] as HelpArticleListItem[]) {
    map.set(row.id, row);
  }
  return Array.from(map.values());
}

export async function getHelpArticleBySlug(slug: string): Promise<HelpArticleDetail | null> {
  const { data, error } = await supabase
    .from('help_articles')
    .select('id, slug, title, excerpt, body, category_id, published_at, helpful_count, not_helpful_count')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  return data as HelpArticleDetail;
}
