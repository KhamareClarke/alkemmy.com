// TypeScript types for category-specific tables

export interface BaseProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  description: string;
  short_description: string;
  tags: string[];
  inventory: number;
  rating: number;
  review_count: number;
  ingredients: string[];
  how_to_use: string[];
  in_stock: boolean;
  badges: string[];
  created_at: string;
  updated_at: string;
}

// 1. SOAPS
export interface Soap extends BaseProduct {
  soap_type?: string; // 'Bar', 'Liquid', 'Exfoliating'
  skin_type?: string; // 'All Skin Types', 'Sensitive', 'Oily'
  scent?: string; // 'Unscented', 'Lavender', 'Tea Tree'
  concern?: string; // 'Acne', 'Pigmentation', 'Dullness', 'Rough Skin', 'Odor'
  weight_grams?: number; // Weight of soap bar
}

// 2. HERBAL TEAS
export interface HerbalTea extends BaseProduct {
  tea_type?: string; // 'Green', 'Black', 'Herbal', 'White'
  benefits?: string[]; // ['Weight Loss', 'Detox', 'Energy']
  caffeine_level?: string; // 'Caffeine-Free', 'Low', 'Medium', 'High'
  main_ingredient?: string; // 'Green Tea', 'Chamomile', 'Hibiscus', etc.
  form?: string; // 'Loose Leaf', 'Tea Bags'
  steeping_time?: number; // Minutes
  temperature_celsius?: number; // Water temperature
  weight_grams?: number; // Package weight
}

// 3. LOTIONS
export interface Lotion extends BaseProduct {
  lotion_type?: string; // 'Body Lotion', 'Face Cream', 'Hand Cream'
  skin_type?: string; // 'All Skin Types', 'Dry', 'Sensitive'
  spf_level?: number; // SPF rating if applicable
  volume_ml?: number; // Volume in milliliters
  texture?: string; // 'Light', 'Medium', 'Rich'
}

// 4. OILS
export interface Oil extends BaseProduct {
  oil_type?: string; // 'Hair Oil', 'Body Oil', 'Face Oil', 'Essential Oil'
  application_area?: string; // 'Hair', 'Face', 'Body', 'All Over'
  extraction_method?: string; // 'Cold Pressed', 'Steam Distilled'
  volume_ml?: number; // Volume in milliliters
  carrier_oil?: string; // 'Coconut', 'Jojoba', 'Argan'
}

// 5. BEARD CARE
export interface BeardCare extends BaseProduct {
  product_type?: string; // 'Beard Oil', 'Beard Balm', 'Beard Wash', 'Beard Brush'
  beard_length?: string; // 'Short', 'Medium', 'Long', 'All Lengths'
  scent?: string; // 'Unscented', 'Sandalwood', 'Cedarwood'
  hold_strength?: string; // 'Light', 'Medium', 'Strong' (for balms)
  fragrance?: string; // 'Woody', 'Citrus', 'Musk', 'Herbal', 'Unscented'
  concern?: string; // 'Growth', 'Softening', 'Itch Relief', 'Shine'
  volume_ml?: number; // Volume in milliliters
}

// 6. SHAMPOOS
export interface Shampoo extends BaseProduct {
  product_type?: string; // 'Shampoo', 'Conditioner', '2-in-1'
  hair_type?: string; // 'All Hair Types', 'Dry', 'Oily', 'Color-Treated'
  hair_concern?: string; // 'Volume', 'Moisture', 'Damage Repair'
  volume_ml?: number; // Volume in milliliters
  sulfate_free?: boolean; // Sulfate-free formula
}

// 7. ROLL ONS
export interface RollOn extends BaseProduct {
  roll_on_type?: string; // 'Essential Oil', 'Deodorant', 'Pain Relief'
  application_area?: string; // 'Pulse Points', 'Underarms', 'Temples'
  scent?: string; // 'Lavender', 'Peppermint', 'Eucalyptus'
  volume_ml?: number; // Volume in milliliters
  concentration?: string; // 'Diluted', 'Pure', 'Blend'
  main_ingredient?: string; // 'Peppermint', 'Lavender', 'Eucalyptus', 'Lemongrass', 'Tea Tree'
  formulation?: string; // 'Essential Oil Blend', 'Herbal Extract', 'Alcohol-free'
  usage_area?: string; // 'Forehead', 'Neck', 'Wrist', 'Body'
}

// 8. ELIXIRS
export interface Elixir extends BaseProduct {
  elixir_type?: string; // 'Immunity', 'Energy', 'Sleep', 'Detox'
  benefits?: string[]; // ['Boosts Immunity', 'Improves Sleep', 'Increases Energy']
  dosage?: string; // '1 dropper daily', '2 teaspoons morning'
  volume_ml?: number; // Volume in milliliters
  alcohol_free?: boolean; // Alcohol-free formula
  main_ingredient?: string; // 'Amla', 'Ashwagandha', 'Turmeric', 'Tulsi', 'Giloy', 'Spirulina'
  form?: string; // 'Liquid', 'Drops', 'Tonic', 'Capsules'
}

// Union type for all product types
export type CategoryProduct = Soap | HerbalTea | Lotion | Oil | BeardCare | Shampoo | RollOn | Elixir;

// Category names mapping
export const CATEGORY_TABLES = {
  soaps: 'soaps',
  teas: 'herbal_teas',
  lotions: 'lotions',
  oils: 'oils',
  'beard-care': 'beard_care',
  shampoos: 'shampoos',
  'roll-ons': 'roll_ons',
  elixirs: 'elixirs'
} as const;

export type CategoryName = keyof typeof CATEGORY_TABLES;
