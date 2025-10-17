import { supabase, Product, ProductFilters } from './supabase'

// Helper function to convert table name to proper category name
function getCategoryFromTable(tableName: string): string {
  const categoryMap: Record<string, string> = {
    'soaps': 'Soaps',
    'herbal_teas': 'Herbal Teas',
    'lotions': 'Lotions',
    'oils': 'Oils',
    'beard_care': 'Beard Care',
    'shampoos': 'Shampoos',
    'roll_ons': 'Roll-ons',
    'elixirs': 'Elixirs'
  };
  
  return categoryMap[tableName] || tableName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Helper function to normalize category names to prevent duplicates
function normalizeCategoryName(categoryName: string): string {
  const normalizationMap: Record<string, string> = {
    'Herbal Tea': 'Herbal Teas',
    'Soap Bar': 'Soaps',
    'Soap': 'Soaps',
    'Tea': 'Herbal Teas',
    'Roll On': 'Roll-ons',
    'Roll Ons': 'Roll-ons',
    'Beard': 'Beard Care',
    'Shampoo': 'Shampoos',
    'Oil': 'Oils',
    'Lotion': 'Lotions',
    'Elixir': 'Elixirs'
  };
  
  return normalizationMap[categoryName] || categoryName;
}

// Get all products with optional filters
export async function getProducts(filters?: ProductFilters) {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters) {
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.price_min !== undefined) {
      query = query.gte('price', filters.price_min)
    }

    if (filters.price_max !== undefined) {
      query = query.lte('price', filters.price_max)
    }

    if (filters.in_stock !== undefined) {
      query = query.eq('in_stock', filters.in_stock)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return data as Product[]
}

// Get all products from all category tables with optional filters
export async function getAllProducts(filters?: ProductFilters) {
  const categoryTables = [
    'soaps',
    'herbal_teas', 
    'lotions',
    'oils',
    'beard_care',
    'shampoos',
    'roll_ons',
    'elixirs'
  ];

  const allProducts: Product[] = [];

  // Fetch from all category tables
  for (const table of categoryTables) {
    try {
      let query = supabase
        .from(table)
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags)
        }

        if (filters.price_min !== undefined) {
          query = query.gte('price', filters.price_min)
        }

        if (filters.price_max !== undefined) {
          query = query.lte('price', filters.price_max)
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`)
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching products from ${table}:`, error);
        continue; // Continue with other tables
      }

      if (data) {
        // Add category information to each product
        const productsWithCategory = data.map(product => ({
          ...product,
          category: normalizeCategoryName(product.category || getCategoryFromTable(table)) // Use existing category or convert table name, then normalize
        }));
        allProducts.push(...productsWithCategory);
      }
    } catch (err) {
      console.error(`Error fetching from ${table}:`, err);
      continue; // Continue with other tables
    }
  }

  // Also fetch from main products table
  try {
    const mainProducts = await getProducts(filters);
    const normalizedMainProducts = mainProducts.map(product => ({
      ...product,
      category: normalizeCategoryName(product.category)
    }));
    allProducts.push(...normalizedMainProducts);
  } catch (err) {
    console.error('Error fetching from main products table:', err);
  }

  // Apply category filter if specified
  if (filters?.category && filters.category !== 'all') {
    return allProducts.filter(product => 
      product.category?.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  // Sort by creation date
  return allProducts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Get a single product by slug from any category table
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // List of all category tables to search
  const categoryTables = [
    'soaps',
    'herbal_teas', 
    'lotions',
    'oils',
    'beard_care',
    'shampoos',
    'roll_ons',
    'elixirs'
  ];

  // Search each category table for the product
  for (const table of categoryTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('slug', slug)
        .single();

      if (data && !error) {
        return data as Product;
      }
    } catch (err) {
      // Continue to next table if this one fails
      continue;
    }
  }

  // If not found in any category table, try the main products table as fallback
  try {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
      .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Product not found
    }
      console.error('Error fetching product:', error);
      throw error;
  }

    return data as Product;
  } catch (err) {
    return null;
  }
}

// Get related products (same category, excluding current product)
export async function getRelatedProducts(currentSlug: string, limit: number = 3): Promise<Product[]> {
  // First get the current product to find its category
  const currentProduct = await getProductBySlug(currentSlug)
  if (!currentProduct) return []

  // Determine which table the current product is from
  const categoryTables = [
    'soaps',
    'herbal_teas', 
    'lotions',
    'oils',
    'beard_care',
    'shampoos',
    'roll_ons',
    'elixirs'
  ];

  let sourceTable = 'products'; // fallback

  // Find which table contains the current product
  for (const table of categoryTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('slug')
        .eq('slug', currentSlug)
        .single();

      if (data && !error) {
        sourceTable = table;
        break;
      }
    } catch (err) {
      continue;
    }
  }

  // Get related products from the same table
  try {
  const { data, error } = await supabase
      .from(sourceTable)
    .select('*')
    .neq('slug', currentSlug)
    .eq('in_stock', true)
      .limit(limit);

  if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return data as Product[];
  } catch (err) {
    console.error('Error fetching related products:', err);
    return [];
  }
}

// Get all unique categories from all tables
export async function getCategories(): Promise<string[]> {
  const categoryTables = [
    'soaps',
    'herbal_teas', 
    'lotions',
    'oils',
    'beard_care',
    'shampoos',
    'roll_ons',
    'elixirs'
  ];

  const allCategories = new Set<string>();

  // Get categories from main products table
  try {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('in_stock', true)

    if (!error && data) {
      data.forEach(item => {
        if (item.category) {
          allCategories.add(normalizeCategoryName(item.category));
        }
      });
    }
  } catch (err) {
    console.error('Error fetching categories from main table:', err);
  }

  // Get categories from category tables
  for (const table of categoryTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('in_stock', true)
        .limit(1); // Just check if table has data

      if (!error && data && data.length > 0) {
        // Convert table name to category name using the same mapping
        const categoryName = normalizeCategoryName(getCategoryFromTable(table));
        allCategories.add(categoryName);
      }
    } catch (err) {
      console.error(`Error checking ${table} table:`, err);
    }
  }

  return Array.from(allCategories).sort();
}

// Get all unique tags from all tables
export async function getTags(): Promise<string[]> {
  const categoryTables = [
    'soaps',
    'herbal_teas', 
    'lotions',
    'oils',
    'beard_care',
    'shampoos',
    'roll_ons',
    'elixirs'
  ];

  const allTags = new Set<string>();

  // Get tags from main products table
  try {
  const { data, error } = await supabase
    .from('products')
    .select('tags')
    .eq('in_stock', true)

    if (!error && data) {
      data.forEach(item => {
        if (item.tags) {
          item.tags.forEach((tag: string) => allTags.add(tag));
        }
      });
    }
  } catch (err) {
    console.error('Error fetching tags from main table:', err);
  }

  // Get tags from category tables
  for (const table of categoryTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('tags')
        .eq('in_stock', true)

      if (!error && data) {
        data.forEach(item => {
          if (item.tags) {
            item.tags.forEach((tag: string) => allTags.add(tag));
          }
        });
      }
    } catch (err) {
      console.error(`Error fetching tags from ${table}:`, err);
    }
  }

  return Array.from(allTags).sort();
}

// Search products
export async function searchProducts(searchTerm: string, filters?: Omit<ProductFilters, 'search'>): Promise<Product[]> {
  const searchFilters: ProductFilters = {
    ...filters,
    search: searchTerm
  }
  
  return getProducts(searchFilters)
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  return getProducts({ category })
}

// Get featured products (high rating, in stock)
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .gte('rating', 4.5)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data as Product[]
}

// Get bestseller products (high review count)
export async function getBestsellerProducts(limit: number = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('review_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching bestseller products:', error)
    return []
  }

  return data as Product[]
}



