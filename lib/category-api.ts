import { supabase } from './supabase';
import { 
  Soap, 
  HerbalTea, 
  Lotion, 
  Oil, 
  BeardCare, 
  Shampoo, 
  RollOn, 
  Elixir,
  CategoryProduct,
  CATEGORY_TABLES,
  CategoryName
} from './category-types';

// Re-export types for convenience
export type { 
  Soap, 
  HerbalTea, 
  Lotion, 
  Oil, 
  BeardCare, 
  Shampoo, 
  RollOn, 
  Elixir,
  CategoryProduct,
  CategoryName
};

// Generic filters interface
export interface CategoryFilters {
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  tags?: string[];
}

// Generic function to get products from any category table
export async function getCategoryProducts<T extends CategoryProduct>(
  category: CategoryName,
  filters?: CategoryFilters
): Promise<T[]> {
  const tableName = CATEGORY_TABLES[category];
  let query = supabase.from(tableName).select('*');

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
  }
  if (filters?.min_price !== undefined) {
    query = query.gte('price', filters.min_price);
  }
  if (filters?.max_price !== undefined) {
    query = query.lte('price', filters.max_price);
  }
  if (filters?.in_stock !== undefined) {
    query = query.eq('in_stock', filters.in_stock);
  }
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${category} products:`, error);
    return [];
  }
  return data as T[];
}

// Generic function to get a single product by slug
export async function getCategoryProductBySlug<T extends CategoryProduct>(
  category: CategoryName,
  slug: string
): Promise<T | null> {
  const tableName = CATEGORY_TABLES[category];
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching ${category} product with slug ${slug}:`, error);
    return null;
  }
  return data as T;
}

// Generic function to get related products from the same category
export async function getRelatedCategoryProducts<T extends CategoryProduct>(
  category: CategoryName,
  currentSlug: string,
  limit: number = 3
): Promise<T[]> {
  const tableName = CATEGORY_TABLES[category];
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .neq('slug', currentSlug)
    .limit(limit);

  if (error) {
    console.error(`Error fetching related ${category} products:`, error);
    return [];
  }
  return data as T[];
}

// Specific functions for each category

// SOAPS
export async function getSoaps(filters?: CategoryFilters): Promise<Soap[]> {
  return getCategoryProducts<Soap>('soaps', filters);
}

export async function getSoapBySlug(slug: string): Promise<Soap | null> {
  return getCategoryProductBySlug<Soap>('soaps', slug);
}

export async function getRelatedSoaps(currentSlug: string): Promise<Soap[]> {
  return getRelatedCategoryProducts<Soap>('soaps', currentSlug);
}

// HERBAL TEAS
export async function getHerbalTeas(filters?: CategoryFilters): Promise<HerbalTea[]> {
  return getCategoryProducts<HerbalTea>('teas', filters);
}

export async function getHerbalTeaBySlug(slug: string): Promise<HerbalTea | null> {
  return getCategoryProductBySlug<HerbalTea>('teas', slug);
}

export async function getRelatedHerbalTeas(currentSlug: string): Promise<HerbalTea[]> {
  return getRelatedCategoryProducts<HerbalTea>('teas', currentSlug);
}

// LOTIONS
export async function getLotions(filters?: CategoryFilters): Promise<Lotion[]> {
  return getCategoryProducts<Lotion>('lotions', filters);
}

export async function getLotionBySlug(slug: string): Promise<Lotion | null> {
  return getCategoryProductBySlug<Lotion>('lotions', slug);
}

export async function getRelatedLotions(currentSlug: string): Promise<Lotion[]> {
  return getRelatedCategoryProducts<Lotion>('lotions', currentSlug);
}

// OILS
export async function getOils(filters?: CategoryFilters): Promise<Oil[]> {
  return getCategoryProducts<Oil>('oils', filters);
}

export async function getOilBySlug(slug: string): Promise<Oil | null> {
  return getCategoryProductBySlug<Oil>('oils', slug);
}

export async function getRelatedOils(currentSlug: string): Promise<Oil[]> {
  return getRelatedCategoryProducts<Oil>('oils', currentSlug);
}

// BEARD CARE
export async function getBeardCareProducts(filters?: CategoryFilters): Promise<BeardCare[]> {
  return getCategoryProducts<BeardCare>('beard-care', filters);
}

export async function getBeardCareBySlug(slug: string): Promise<BeardCare | null> {
  return getCategoryProductBySlug<BeardCare>('beard-care', slug);
}

export async function getRelatedBeardCare(currentSlug: string): Promise<BeardCare[]> {
  return getRelatedCategoryProducts<BeardCare>('beard-care', currentSlug);
}

// SHAMPOOS
export async function getShampoos(filters?: CategoryFilters): Promise<Shampoo[]> {
  return getCategoryProducts<Shampoo>('shampoos', filters);
}

export async function getShampooBySlug(slug: string): Promise<Shampoo | null> {
  return getCategoryProductBySlug<Shampoo>('shampoos', slug);
}

export async function getRelatedShampoos(currentSlug: string): Promise<Shampoo[]> {
  return getRelatedCategoryProducts<Shampoo>('shampoos', currentSlug);
}

// ROLL ONS
export async function getRollOns(filters?: CategoryFilters): Promise<RollOn[]> {
  return getCategoryProducts<RollOn>('roll-ons', filters);
}

export async function getRollOnBySlug(slug: string): Promise<RollOn | null> {
  return getCategoryProductBySlug<RollOn>('roll-ons', slug);
}

export async function getRelatedRollOns(currentSlug: string): Promise<RollOn[]> {
  return getRelatedCategoryProducts<RollOn>('roll-ons', currentSlug);
}

// ELIXIRS
export async function getElixirs(filters?: CategoryFilters): Promise<Elixir[]> {
  return getCategoryProducts<Elixir>('elixirs', filters);
}

export async function getElixirBySlug(slug: string): Promise<Elixir | null> {
  return getCategoryProductBySlug<Elixir>('elixirs', slug);
}

export async function getRelatedElixirs(currentSlug: string): Promise<Elixir[]> {
  return getRelatedCategoryProducts<Elixir>('elixirs', currentSlug);
}

// Utility function to get all available tags across all categories
export async function getAllCategoryTags(): Promise<string[]> {
  const allTags: string[] = [];
  
  for (const tableName of Object.values(CATEGORY_TABLES)) {
    const { data, error } = await supabase
      .from(tableName)
      .select('tags');
    
    if (!error && data) {
      const tableTags = data.flatMap((item: { tags: string[] }) => item.tags);
      allTags.push(...tableTags);
    }
  }
  
  return Array.from(new Set(allTags)); // Return unique tags
}








