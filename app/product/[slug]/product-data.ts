// Server-only product data and utilities

export const products: { [key: string]: any } = {
  'empire-bar': {
    name: 'Empire Bar',
    category: 'Soap Bar',
    price: 12,
    rating: 4.8,
    reviewCount: 127,
    shortBenefit: 'Masculine daily cleanser with activated charcoal',
    description: 'The Empire Bar is a bold, masculine cleansing bar made with activated charcoal, tea tree, and sandalwood. Designed for daily use to refresh, tone, and energize the skin. This powerful formula removes impurities while maintaining your skin\'s natural moisture barrier.',
    ingredients: [
      'Activated Charcoal - Deep pore cleansing',
      'Tea Tree Oil - Antibacterial properties',
      'Sandalwood - Soothing and aromatic',
      'Coconut Oil - Moisturizing base',
      'Shea Butter - Nourishing and protective',
      'Essential Oils - Natural fragrance'
    ],
    howToUse: [
      'Wet your skin and the bar with warm water',
      'Lather the bar between your hands or directly on skin',
      'Massage gently in circular motions',
      'Rinse thoroughly with warm water',
      'Pat dry and follow with moisturizer if needed'
    ],
    tags: ['Vegan', 'Handmade', 'For Men', 'Daily Use'],
    inStock: true,
    image: '/images/empire-bar.jpg'
  },
  'magnet-bar': {
    name: 'Magnet Bar',
    category: 'Soap Bar',
    price: 12,
    rating: 4.9,
    reviewCount: 89,
    shortBenefit: 'Seductive attraction bar with pheromone-enhancing herbs',
    description: 'The Magnet Bar combines ancient attraction herbs with modern skincare science. Infused with ylang-ylang, rose, and jasmine, this luxurious bar not only cleanses but enhances your natural magnetism and confidence.',
    ingredients: [
      'Ylang-Ylang - Natural attraction enhancer',
      'Rose Petals - Romantic and soothing',
      'Jasmine Extract - Confidence boosting',
      'Coconut Oil - Moisturizing base',
      'Cocoa Butter - Rich nourishment',
      'Pink Clay - Gentle detoxification'
    ],
    howToUse: [
      'Use during evening shower for best results',
      'Create a rich lather with warm water',
      'Apply to entire body with gentle massage',
      'Allow the aromatic oils to absorb for 1-2 minutes',
      'Rinse thoroughly and pat dry'
    ],
    tags: ['Vegan', 'Handmade', 'Aromatherapy', 'Evening Use'],
    inStock: true,
    image: '/images/magnet-bar.jpg'
  },
  'fat-loss-tea': {
    name: 'Fat Loss Tea',
    category: 'Herbal Tea',
    price: 10,
    rating: 4.7,
    reviewCount: 203,
    shortBenefit: 'Supports metabolism and natural weight management',
    description: 'Our Fat Loss Tea is a carefully crafted blend of metabolism-boosting herbs including green tea, oolong, and thermogenic spices. This natural formula supports your weight management goals while providing sustained energy throughout the day.',
    ingredients: [
      'Green Tea - Antioxidants and metabolism boost',
      'Oolong Tea - Fat burning properties',
      'Ginger Root - Digestive support',
      'Cinnamon - Blood sugar regulation',
      'Cayenne Pepper - Thermogenic effect',
      'Lemon Balm - Stress reduction'
    ],
    howToUse: [
      'Steep 1 teaspoon in hot water for 5-7 minutes',
      'Drink 2-3 cups daily, preferably before meals',
      'Best consumed 30 minutes before exercise',
      'Can be enjoyed hot or cold',
      'Combine with healthy diet and exercise for best results'
    ],
    tags: ['Vegan', 'Organic', 'Metabolism Support', 'Natural'],
    inStock: true,
    image: '/images/fat-loss-tea.jpg'
  }
};

export const getProductData = (slug: string) => {
  return products[slug] || null;
};

export const getRelatedProducts = (currentSlug: string) => {
  const relatedProducts = [
    { slug: 'magnet-bar', name: 'Magnet Bar', price: 12, image: '/images/magnet-bar.jpg' },
    { slug: 'beard-elixir', name: 'Beard Elixir', price: 16, image: '/images/beard-elixir.jpg' },
    { slug: 'skin-rescue-bar', name: 'Skin Rescue Bar', price: 14, image: '/images/skin-rescue-bar.jpg' }
  ];
  
  return relatedProducts.filter(product => product.slug !== currentSlug);
};

// Server-only function for static generation
export async function generateStaticParams() {
  return Object.keys(products).map((slug) => ({
    slug: slug,
  }));
}