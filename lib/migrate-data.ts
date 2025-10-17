import { supabase } from './supabase'

// Migration data from the existing static products
const productsToMigrate = [
  {
    title: 'Empire Bar',
    slug: 'empire-bar',
    price: 12,
    images: ['/images/empire-bar.jpg'],
    description: 'The Empire Bar is a bold, masculine cleansing bar made with activated charcoal, tea tree, and sandalwood. Designed for daily use to refresh, tone, and energize the skin. This powerful formula removes impurities while maintaining your skin\'s natural moisture barrier.',
    short_description: 'Masculine daily cleanser with activated charcoal',
    tags: ['Vegan', 'Handmade', 'For Men', 'Daily Use'],
    inventory: 50,
    category: 'Soap Bar',
    rating: 4.8,
    review_count: 127,
    ingredients: [
      'Activated Charcoal - Deep pore cleansing',
      'Tea Tree Oil - Antibacterial properties',
      'Sandalwood - Soothing and aromatic',
      'Coconut Oil - Moisturizing base',
      'Shea Butter - Nourishing and protective',
      'Essential Oils - Natural fragrance'
    ],
    how_to_use: [
      'Wet your skin and the bar with warm water',
      'Lather the bar between your hands or directly on skin',
      'Massage gently in circular motions',
      'Rinse thoroughly with warm water',
      'Pat dry and follow with moisturizer if needed'
    ],
    in_stock: true
  },
  {
    title: 'Magnet Bar',
    slug: 'magnet-bar',
    price: 12,
    images: ['/images/magnet-bar.jpg'],
    description: 'The Magnet Bar combines ancient attraction herbs with modern skincare science. Infused with ylang-ylang, rose, and jasmine, this luxurious bar not only cleanses but enhances your natural magnetism and confidence.',
    short_description: 'Seductive attraction bar with pheromone-enhancing herbs',
    tags: ['Vegan', 'Handmade', 'Aromatherapy', 'Evening Use'],
    inventory: 45,
    category: 'Soap Bar',
    rating: 4.9,
    review_count: 89,
    ingredients: [
      'Ylang-Ylang - Natural attraction enhancer',
      'Rose Petals - Romantic and soothing',
      'Jasmine Extract - Confidence boosting',
      'Coconut Oil - Moisturizing base',
      'Cocoa Butter - Rich nourishment',
      'Pink Clay - Gentle detoxification'
    ],
    how_to_use: [
      'Use during evening shower for best results',
      'Create a rich lather with warm water',
      'Apply to entire body with gentle massage',
      'Allow the aromatic oils to absorb for 1-2 minutes',
      'Rinse thoroughly and pat dry'
    ],
    in_stock: true
  },
  {
    title: 'Fat Loss Tea',
    slug: 'fat-loss-tea',
    price: 10,
    images: ['/images/fat-loss-tea.jpg'],
    description: 'Our Fat Loss Tea is a carefully crafted blend of metabolism-boosting herbs including green tea, oolong, and thermogenic spices. This natural formula supports your weight management goals while providing sustained energy throughout the day.',
    short_description: 'Supports metabolism and natural weight management',
    tags: ['Vegan', 'Organic', 'Metabolism Support', 'Natural'],
    inventory: 75,
    category: 'Herbal Tea',
    rating: 4.7,
    review_count: 203,
    ingredients: [
      'Green Tea - Antioxidants and metabolism boost',
      'Oolong Tea - Fat burning properties',
      'Ginger Root - Digestive support',
      'Cinnamon - Blood sugar regulation',
      'Cayenne Pepper - Thermogenic effect',
      'Lemon Balm - Stress reduction'
    ],
    how_to_use: [
      'Steep 1 teaspoon in hot water for 5-7 minutes',
      'Drink 2-3 cups daily, preferably before meals',
      'Best consumed 30 minutes before exercise',
      'Can be enjoyed hot or cold',
      'Combine with healthy diet and exercise for best results'
    ],
    in_stock: true
  },
  // Additional products from the shop page
  {
    title: 'Acne Bar',
    slug: 'acne-bar',
    price: 12,
    images: ['/images/acne-bar.jpg'],
    description: 'Specially formulated to combat acne and breakouts with natural antibacterial ingredients.',
    short_description: 'Breakout control',
    tags: ['Vegan', 'Handmade', 'Acne Treatment', 'Daily Use'],
    inventory: 40,
    category: 'Soap Bar',
    rating: 4.6,
    review_count: 95,
    ingredients: ['Tea Tree Oil', 'Salicylic Acid', 'Bentonite Clay', 'Coconut Oil'],
    how_to_use: ['Use twice daily', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  },
  {
    title: 'Hyperpigmentation Bar',
    slug: 'hyperpigmentation-bar',
    price: 12,
    images: ['/images/hyperpigmentation-bar.jpg'],
    description: 'Helps even skin tone and reduce dark spots with natural brightening agents.',
    short_description: 'Evens tone',
    tags: ['Vegan', 'Handmade', 'Brightening', 'Daily Use'],
    inventory: 35,
    category: 'Soap Bar',
    rating: 4.5,
    review_count: 78,
    ingredients: ['Vitamin C', 'Licorice Root', 'Kojic Acid', 'Coconut Oil'],
    how_to_use: ['Use daily', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  },
  {
    title: 'Eczema Bar',
    slug: 'eczema-bar',
    price: 12,
    images: ['/images/eczema-bar.jpg'],
    description: 'Gentle formula designed for sensitive skin and eczema relief.',
    short_description: 'Soothing and gentle',
    tags: ['Vegan', 'Handmade', 'Sensitive Skin', 'Gentle'],
    inventory: 30,
    category: 'Soap Bar',
    rating: 4.8,
    review_count: 112,
    ingredients: ['Oatmeal', 'Chamomile', 'Aloe Vera', 'Coconut Oil'],
    how_to_use: ['Use as needed', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  },
  {
    title: 'Skin Rescue Bar',
    slug: 'skin-rescue-bar',
    price: 14,
    images: ['/images/skin-rescue-bar.jpg'],
    description: 'Intensive repair bar for damaged and stressed skin.',
    short_description: 'For damaged skin',
    tags: ['Vegan', 'Handmade', 'Repair', 'Intensive Care'],
    inventory: 25,
    category: 'Soap Bar',
    rating: 4.7,
    review_count: 67,
    ingredients: ['Manuka Honey', 'Colloidal Oatmeal', 'Vitamin E', 'Coconut Oil'],
    how_to_use: ['Use daily', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  },
  {
    title: 'Charcoal Detox Bar',
    slug: 'charcoal-detox-bar',
    price: 12,
    images: ['/images/charcoal-detox-bar.jpg'],
    description: 'Deep cleansing bar with activated charcoal for thorough detoxification.',
    short_description: 'Deep pore cleanse',
    tags: ['Vegan', 'Handmade', 'Detox', 'Deep Cleansing'],
    inventory: 55,
    category: 'Soap Bar',
    rating: 4.6,
    review_count: 89,
    ingredients: ['Activated Charcoal', 'Bentonite Clay', 'Tea Tree Oil', 'Coconut Oil'],
    how_to_use: ['Use 2-3 times weekly', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  },
  {
    title: 'Gold Leaf Bar',
    slug: 'gold-leaf-bar',
    price: 16,
    images: ['/images/gold-leaf-bar.jpg'],
    description: 'Luxury bar with real gold leaf for premium skincare experience.',
    short_description: 'Luxury glow',
    tags: ['Vegan', 'Handmade', 'Luxury', 'Premium'],
    inventory: 20,
    category: 'Soap Bar',
    rating: 4.9,
    review_count: 45,
    ingredients: ['Gold Leaf', 'Rose Oil', 'Vitamin E', 'Coconut Oil'],
    how_to_use: ['Use for special occasions', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  },
  {
    title: 'Clarity Bar',
    slug: 'clarity-bar',
    price: 12,
    images: ['/images/clarity-bar.jpg'],
    description: 'Energizing bar with mint and eucalyptus for mental clarity.',
    short_description: 'Focus and refresh',
    tags: ['Vegan', 'Handmade', 'Energizing', 'Mental Clarity'],
    inventory: 40,
    category: 'Soap Bar',
    rating: 4.5,
    review_count: 73,
    ingredients: ['Peppermint Oil', 'Eucalyptus Oil', 'Rosemary', 'Coconut Oil'],
    how_to_use: ['Use in morning', 'Massage gently', 'Rinse thoroughly'],
    in_stock: true
  }
]

export async function migrateProducts() {
  console.log('Starting product migration...')
  
  try {
    // Insert products in batches
    const { data, error } = await supabase
      .from('products')
      .insert(productsToMigrate)
      .select()

    if (error) {
      console.error('Error migrating products:', error)
      throw error
    }

    console.log(`Successfully migrated ${data?.length || 0} products`)
    return data
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Function to check if products already exist
export async function checkExistingProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .limit(1)

  if (error) {
    console.error('Error checking existing products:', error)
    return false
  }

  return data && data.length > 0
}

