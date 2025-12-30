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
  CATEGORY_TABLES,
  CategoryName
} from './category-types';
import { Bundle } from './supabase';

// Generic CRUD operations for all categories
export async function createProduct<T extends any>(
  category: CategoryName,
  productData: Partial<T>
): Promise<T | null> {
  const tableName = CATEGORY_TABLES[category];
  
  const { data, error } = await supabase
    .from(tableName)
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error(`Error creating ${category} product:`, error);
    return null;
  }
  
  return data as T;
}

export async function updateProduct<T extends any>(
  category: CategoryName,
  id: string,
  productData: Partial<T>
): Promise<T | null> {
  const tableName = CATEGORY_TABLES[category];
  
  const { data, error } = await supabase
    .from(tableName)
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${category} product:`, error);
    return null;
  }
  
  return data as T;
}

export async function deleteProduct(
  category: CategoryName,
  id: string
): Promise<boolean> {
  const tableName = CATEGORY_TABLES[category];
  
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting ${category} product:`, error);
    return false;
  }
  
  return true;
}

// Specific functions for each category

// SOAPS
export async function createSoap(soapData: Partial<Soap>): Promise<Soap | null> {
  return createProduct<Soap>('soaps', soapData);
}

export async function updateSoap(id: string, soapData: Partial<Soap>): Promise<Soap | null> {
  return updateProduct<Soap>('soaps', id, soapData);
}

export async function deleteSoap(id: string): Promise<boolean> {
  return deleteProduct('soaps', id);
}

// HERBAL TEAS
export async function createHerbalTea(teaData: Partial<HerbalTea>): Promise<HerbalTea | null> {
  return createProduct<HerbalTea>('teas', teaData);
}

export async function updateHerbalTea(id: string, teaData: Partial<HerbalTea>): Promise<HerbalTea | null> {
  return updateProduct<HerbalTea>('teas', id, teaData);
}

export async function deleteHerbalTea(id: string): Promise<boolean> {
  return deleteProduct('teas', id);
}

// LOTIONS
export async function createLotion(lotionData: Partial<Lotion>): Promise<Lotion | null> {
  return createProduct<Lotion>('lotions', lotionData);
}

export async function updateLotion(id: string, lotionData: Partial<Lotion>): Promise<Lotion | null> {
  return updateProduct<Lotion>('lotions', id, lotionData);
}

export async function deleteLotion(id: string): Promise<boolean> {
  return deleteProduct('lotions', id);
}

// OILS
export async function createOil(oilData: Partial<Oil>): Promise<Oil | null> {
  return createProduct<Oil>('oils', oilData);
}

export async function updateOil(id: string, oilData: Partial<Oil>): Promise<Oil | null> {
  return updateProduct<Oil>('oils', id, oilData);
}

export async function deleteOil(id: string): Promise<boolean> {
  return deleteProduct('oils', id);
}

// BEARD CARE
export async function createBeardCare(beardCareData: Partial<BeardCare>): Promise<BeardCare | null> {
  return createProduct<BeardCare>('beard-care', beardCareData);
}

export async function updateBeardCare(id: string, beardCareData: Partial<BeardCare>): Promise<BeardCare | null> {
  return updateProduct<BeardCare>('beard-care', id, beardCareData);
}

export async function deleteBeardCare(id: string): Promise<boolean> {
  return deleteProduct('beard-care', id);
}

// SHAMPOOS
export async function createShampoo(shampooData: Partial<Shampoo>): Promise<Shampoo | null> {
  return createProduct<Shampoo>('shampoos', shampooData);
}

export async function updateShampoo(id: string, shampooData: Partial<Shampoo>): Promise<Shampoo | null> {
  return updateProduct<Shampoo>('shampoos', id, shampooData);
}

export async function deleteShampoo(id: string): Promise<boolean> {
  return deleteProduct('shampoos', id);
}

// ROLL ONS
export async function createRollOn(rollOnData: Partial<RollOn>): Promise<RollOn | null> {
  return createProduct<RollOn>('roll-ons', rollOnData);
}

export async function updateRollOn(id: string, rollOnData: Partial<RollOn>): Promise<RollOn | null> {
  return updateProduct<RollOn>('roll-ons', id, rollOnData);
}

export async function deleteRollOn(id: string): Promise<boolean> {
  return deleteProduct('roll-ons', id);
}

// ELIXIRS
export async function createElixir(elixirData: Partial<Elixir>): Promise<Elixir | null> {
  return createProduct<Elixir>('elixirs', elixirData);
}

export async function updateElixir(id: string, elixirData: Partial<Elixir>): Promise<Elixir | null> {
  return updateProduct<Elixir>('elixirs', id, elixirData);
}

export async function deleteElixir(id: string): Promise<boolean> {
  return deleteProduct('elixirs', id);
}

// BUNDLES
export async function createBundle(bundleData: Partial<Bundle>): Promise<Bundle | null> {
  const { data, error } = await supabase
    .from('bundles')
    .insert([bundleData])
    .select()
    .single();

  if (error) {
    console.error('Error creating bundle:', error);
    return null;
  }
  
  return data as Bundle;
}

export async function updateBundle(id: string, bundleData: Partial<Bundle>): Promise<Bundle | null> {
  const { data, error } = await supabase
    .from('bundles')
    .update(bundleData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bundle:', error);
    return null;
  }
  
  return data as Bundle;
}

export async function deleteBundle(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('bundles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bundle:', error);
    return false;
  }
  
  return true;
}

export async function getBundles(): Promise<Bundle[]> {
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bundles:', error);
    return [];
  }
  
  return data as Bundle[];
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching bundle by slug:', error);
    return null;
  }
  
  if (!data) {
    return null;
  }

  // Fetch product names for bundle items
  const bundleItemsWithNames = await Promise.all(
    (data.bundle_items || []).map(async (item: { product_id: string; quantity: number; product_type: string }) => {
      try {
        // Get the table name from product_type (category name)
        // product_type could be a category name (e.g., "teas") or already a table name (e.g., "herbal_teas")
        let tableName: string = CATEGORY_TABLES[item.product_type as CategoryName] || '';
        
        // If not found in CATEGORY_TABLES, try using product_type as-is (might be a table name)
        if (!tableName) {
          // Check if it's a valid table name by checking all table values
          const allTableNames = Object.values(CATEGORY_TABLES);
          if (allTableNames.includes(item.product_type as any)) {
            tableName = item.product_type;
          } else {
            // Fallback: try common mappings
            const tableMappings: Record<string, string> = {
              'herbal_teas': 'herbal_teas',
              'beard_care': 'beard_care',
              'roll_ons': 'roll_ons',
              'soaps': 'soaps',
              'lotions': 'lotions',
              'oils': 'oils',
              'shampoos': 'shampoos',
              'elixirs': 'elixirs'
            };
            tableName = tableMappings[item.product_type] || item.product_type;
          }
        }
        
        const { data: productData, error: productError } = await supabase
          .from(tableName)
          .select('id, title')
          .eq('id', item.product_id)
          .single();

        if (productError || !productData) {
          console.error(`Error fetching product ${item.product_id} from ${tableName}:`, productError);
          return {
            ...item,
            product_name: 'Product Not Found'
          };
        }

        return {
          ...item,
          product_name: productData.title
        };
      } catch (err) {
        console.error(`Error processing bundle item ${item.product_id}:`, err);
        return {
          ...item,
          product_name: 'Product Not Found'
        };
      }
    })
  );

  return {
    ...data,
    bundle_items: bundleItemsWithNames
  } as Bundle;
}

export async function getRelatedBundles(currentSlug: string): Promise<Bundle[]> {
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('is_active', true)
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching related bundles:', error);
    return [];
  }
  
  return data as Bundle[];
}

// Get all products from all categories for bundle creation
export async function getAllProducts(): Promise<Array<{id: string, title: string, category: string}>> {
  const allProducts: Array<{id: string, title: string, category: string}> = [];
  
  try {
    // Fetch from all 8 category tables only
    const categories = Object.entries(CATEGORY_TABLES);
    
    for (const [categoryName, tableName] of categories) {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, title')
        .eq('in_stock', true)
        .order('title');
      
      if (!error && data) {
        allProducts.push(...data.map(product => ({
          id: product.id,
          title: product.title,
          category: categoryName
        })));
      }
    }
    
    return allProducts.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

// Get all products with full details for Skin Matcher
export async function getAllProductsForSkinMatcher(): Promise<any[]> {
  const allProducts: any[] = [];
  
  try {
    // Fetch from all 8 category tables with full product details
    const categories = Object.entries(CATEGORY_TABLES);
    
    for (const [categoryName, tableName] of categories) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('in_stock', true)
        .order('title');
      
      if (!error && data) {
        allProducts.push(...data.map(product => ({
          ...product,
          category: categoryName
        })));
      }
    }
    
    return allProducts;
  } catch (error) {
    console.error('Error fetching all products for skin matcher:', error);
    return [];
  }
}

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Utility function to validate product data
export function validateProductData(data: any, category: CategoryName): string[] {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!data.slug || data.slug.trim() === '') {
    errors.push('Slug is required');
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (!data.description || data.description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!data.short_description || data.short_description.trim() === '') {
    errors.push('Short description is required');
  }
  
  // Category-specific validations
  switch (category) {
    case 'soaps':
      if (!data.soap_type) errors.push('Soap type is required');
      if (!data.skin_type) errors.push('Skin type is required');
      break;
    case 'teas':
      if (!data.tea_type) errors.push('Tea type is required');
      if (!data.caffeine_level) errors.push('Caffeine level is required');
      break;
    case 'lotions':
      if (!data.lotion_type) errors.push('Lotion type is required');
      if (!data.skin_type) errors.push('Skin type is required');
      break;
    case 'oils':
      if (!data.oil_type) errors.push('Oil type is required');
      if (!data.application_area) errors.push('Application area is required');
      break;
    case 'beard-care':
      if (!data.product_type) errors.push('Product type is required');
      if (!data.beard_length) errors.push('Beard length is required');
      break;
    case 'shampoos':
      if (!data.product_type) errors.push('Product type is required');
      if (!data.hair_type) errors.push('Hair type is required');
      break;
    case 'roll-ons':
      if (!data.roll_on_type) errors.push('Roll-on type is required');
      if (!data.application_area) errors.push('Application area is required');
      break;
    case 'elixirs':
      if (!data.elixir_type) errors.push('Elixir type is required');
      if (!data.dosage) errors.push('Dosage is required');
      break;
  }
  
  return errors;
}


