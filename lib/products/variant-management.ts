import { supabase } from '@/lib/supabase';

export interface VariantOptionRow {
  id: string;
  product_id: string;
  option_name: string;
  option_values: string[];
  option_order: number;
  created_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  option_values: Record<string, string>;
  price: number | null;
  image_url: string | null;
  stock: number;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

export async function getVariantOptionsForProduct(
  productId: string
): Promise<VariantOptionRow[]> {
  const baseId = productId.split('::')[0];
  const { data, error } = await supabase
    .from('variant_options')
    .select('*')
    .eq('product_id', baseId)
    .order('option_order', { ascending: true });

  if (error) {
    console.warn('variant_options:', error.message);
    return [];
  }
  return (data || []) as VariantOptionRow[];
}

export async function getVariantsForProduct(
  productId: string
): Promise<ProductVariantRow[]> {
  const baseId = productId.split('::')[0];
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', baseId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('product_variants:', error.message);
    return [];
  }
  return (data || []) as ProductVariantRow[];
}

export function findVariantMatchingOptions(
  variants: ProductVariantRow[],
  selected: Record<string, string>
): ProductVariantRow | undefined {
  const keys = Object.keys(selected).sort();
  return variants.find((v) => {
    const vo = v.option_values || {};
    return keys.every((k) => (vo[k] || '').toLowerCase() === (selected[k] || '').toLowerCase());
  });
}

export function formatVariantLabel(selected: Record<string, string>): string {
  return Object.entries(selected)
    .map(([k, val]) => `${k}: ${val}`)
    .join(' · ');
}
