const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data for each category
const categoryData = {
  soaps: [
    {
      title: 'Empire Bar',
      slug: 'empire-bar',
      price: 12,
      images: ['/images/empire-bar.jpg'],
      description: "The Empire Bar is a bold, masculine cleansing bar made with activated charcoal, tea tree, and sandalwood. Designed for daily use to refresh, tone, and energize the skin. This powerful formula removes impurities while maintaining your skin's natural moisture barrier.",
      short_description: 'Masculine daily cleanser with activated charcoal',
      tags: ['Vegan', 'Handmade', 'For Men', 'Daily Use', 'Bestseller'],
      inventory: 50,
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
      in_stock: true,
      soap_type: 'Bar',
      skin_type: 'All Skin Types',
      scent: 'Sandalwood',
      weight_grams: 100
    },
    {
      title: 'Magnet Bar',
      slug: 'magnet-bar',
      price: 12,
      images: ['/images/magnet-bar.jpg'],
      description: "The Magnet Bar is a seductive attraction bar infused with pheromone-enhancing herbs and essential oils. This luxurious soap is designed to boost confidence and natural magnetism while providing deep cleansing and skin nourishment.",
      short_description: 'Seductive attraction bar with pheromone-enhancing herbs',
      tags: ['Vegan', 'Handmade', 'For Men', 'Attraction', 'Premium'],
      inventory: 30,
      rating: 4.9,
      review_count: 89,
      ingredients: [
        'Pheromone-Enhancing Herbs - Natural attraction boosters',
        'Sandalwood Oil - Masculine and alluring scent',
        'Cedarwood - Grounding and confident energy',
        'Coconut Oil - Moisturizing base',
        'Shea Butter - Skin nourishment',
        'Essential Oils - Natural fragrance blend'
      ],
      how_to_use: [
        'Wet your skin and the bar with warm water',
        'Lather the bar between your hands',
        'Massage gently over your body',
        'Focus on pulse points for enhanced effect',
        'Rinse thoroughly with warm water'
      ],
      in_stock: true,
      soap_type: 'Bar',
      skin_type: 'All Skin Types',
      scent: 'Sandalwood & Cedarwood',
      weight_grams: 100
    },
    {
      title: 'Acne Bar',
      slug: 'acne-bar',
      price: 10,
      images: ['/images/acne-bar.jpg'],
      description: "The Acne Bar is specially formulated to combat acne and blemishes with natural ingredients. Contains tea tree oil, salicylic acid from willow bark, and gentle exfoliants to clear pores and prevent breakouts while maintaining skin balance.",
      short_description: 'Clear skin solution with natural acne-fighting ingredients',
      tags: ['Vegan', 'Handmade', 'Acne Treatment', 'Tea Tree', 'Exfoliating'],
      inventory: 40,
      rating: 4.7,
      review_count: 156,
      ingredients: [
        'Tea Tree Oil - Natural antibacterial properties',
        'Willow Bark Extract - Natural salicylic acid',
        'Activated Charcoal - Deep pore cleansing',
        'Coconut Oil - Moisturizing base',
        'Shea Butter - Skin protection',
        'Essential Oils - Soothing fragrance'
      ],
      how_to_use: [
        'Wet your face and the bar with warm water',
        'Gently lather the bar between your hands',
        'Apply lather to face in circular motions',
        'Let sit for 30 seconds for maximum effect',
        'Rinse thoroughly with cool water'
      ],
      in_stock: true,
      soap_type: 'Bar',
      skin_type: 'Oily/Acne-Prone',
      scent: 'Tea Tree',
      weight_grams: 100
    }
  ],
  herbal_teas: [
    {
      title: 'Fat Loss Tea',
      slug: 'fat-loss-tea',
      price: 10,
      images: ['/images/fat-loss-tea.jpg'],
      description: "Our Fat Loss Tea is a powerful blend of metabolism-boosting herbs designed to support healthy weight management. Contains green tea, oolong, and natural fat-burning compounds to help boost your metabolism and support your fitness goals.",
      short_description: 'Natural metabolism support and weight management',
      tags: ['Vegan', 'Weight Loss', 'Metabolism', 'Green Tea', 'Bestseller', 'Loose Leaf'],
      inventory: 25,
      rating: 4.6,
      review_count: 203,
      ingredients: [
        'Green Tea - Natural caffeine and antioxidants',
        'Oolong Tea - Metabolism boosting properties',
        'Garcinia Cambogia - Natural fat blocker',
        'Ginger Root - Digestive support',
        'Lemon Balm - Calming and detoxifying',
        'Natural Flavors - Delicious taste'
      ],
      how_to_use: [
        'Boil water to 80°C (176°F)',
        'Add 1 teaspoon of tea per cup',
        'Steep for 3-5 minutes',
        'Strain and enjoy hot or cold',
        'Drink 2-3 cups daily for best results'
      ],
      in_stock: true,
      tea_type: 'Green',
      benefits: ['Weight Loss', 'Metabolism Boost', 'Energy', 'Detox'],
      caffeine_level: 'Medium',
      steeping_time: 4,
      temperature_celsius: 80,
      weight_grams: 50
    },
    {
      title: 'Chamomile Sleep Tea',
      slug: 'chamomile-sleep-tea',
      price: 8,
      images: ['/images/chamomile-sleep-tea.jpg'],
      description: "Our Chamomile Sleep Tea is a calming blend perfect for bedtime. Made with premium chamomile flowers and relaxing herbs, it helps promote restful sleep and reduces stress naturally.",
      short_description: 'Calming bedtime tea for better sleep',
      tags: ['Vegan', 'Sleep', 'Relaxation', 'Chamomile', 'Tea Bags'],
      inventory: 40,
      rating: 4.8,
      review_count: 156,
      ingredients: [
        'Chamomile Flowers - Natural calming properties',
        'Lavender - Relaxing and soothing',
        'Valerian Root - Sleep support',
        'Lemon Balm - Stress relief',
        'Natural Flavors - Delicate taste'
      ],
      how_to_use: [
        'Boil water to 90°C (194°F)',
        'Place tea bag in cup',
        'Pour hot water over tea bag',
        'Steep for 5-7 minutes',
        'Remove tea bag and enjoy before bed'
      ],
      in_stock: true,
      tea_type: 'Herbal',
      benefits: ['Sleep', 'Relaxation', 'Stress Relief', 'Calming'],
      caffeine_level: 'Caffeine-free',
      steeping_time: 6,
      temperature_celsius: 90,
      weight_grams: 30
    },
    {
      title: 'Ginger Detox Tea',
      slug: 'ginger-detox-tea',
      price: 9,
      images: ['/images/ginger-detox-tea.jpg'],
      description: "Our Ginger Detox Tea is a warming blend that supports natural detoxification. Made with fresh ginger root and cleansing herbs, it helps boost metabolism and supports overall wellness.",
      short_description: 'Warming detox tea with fresh ginger',
      tags: ['Vegan', 'Detox', 'Ginger', 'Wellness', 'Loose Leaf'],
      inventory: 35,
      rating: 4.7,
      review_count: 98,
      ingredients: [
        'Fresh Ginger Root - Warming and detoxifying',
        'Turmeric - Anti-inflammatory properties',
        'Lemon Peel - Vitamin C and cleansing',
        'Peppermint - Digestive support',
        'Green Tea - Antioxidants and energy'
      ],
      how_to_use: [
        'Boil water to 85°C (185°F)',
        'Add 1 teaspoon of tea per cup',
        'Steep for 4-6 minutes',
        'Strain and enjoy hot',
        'Drink 1-2 cups daily for detox support'
      ],
      in_stock: true,
      tea_type: 'Green',
      benefits: ['Detox', 'Digestion', 'Energy', 'Wellness'],
      caffeine_level: 'Low',
      steeping_time: 5,
      temperature_celsius: 85,
      weight_grams: 45
    }
  ],
  lotions: [
    {
      title: 'Sun Lotion',
      slug: 'sun-lotion',
      price: 18,
      images: ['/images/sun-lotion.jpg'],
      description: "Our Sun Lotion provides natural sun protection with SPF 30 while deeply moisturizing your skin. Made with zinc oxide and nourishing oils, it protects against harmful UV rays while keeping your skin soft and hydrated.",
      short_description: 'Natural sun protection with SPF 30',
      tags: ['Vegan', 'SPF', 'Natural', 'Moisturizing', 'Protection'],
      inventory: 35,
      rating: 4.5,
      review_count: 78,
      ingredients: [
        'Zinc Oxide - Natural sun protection',
        'Coconut Oil - Deep moisturizing',
        'Shea Butter - Skin nourishment',
        'Vitamin E - Antioxidant protection',
        'Aloe Vera - Soothing and cooling',
        'Natural Fragrance - Light and fresh'
      ],
      how_to_use: [
        'Apply liberally to all exposed skin',
        'Reapply every 2 hours or after swimming',
        'Apply 15 minutes before sun exposure',
        'Massage gently until absorbed',
        'Use daily for best protection'
      ],
      in_stock: true,
      lotion_type: 'Body Lotion',
      skin_type: 'All Skin Types',
      spf_level: 30,
      volume_ml: 200,
      texture: 'Light'
    }
  ],
  oils: [
    {
      title: 'Argan Oil',
      slug: 'argan-oil',
      price: 25,
      images: ['/images/argan-oil.jpg'],
      description: "Pure Moroccan Argan Oil extracted from the kernels of the Argan tree. This luxurious oil is rich in vitamin E and essential fatty acids, perfect for hair, skin, and nail care. Cold-pressed to preserve maximum nutrients and benefits.",
      short_description: 'Pure Moroccan argan oil for hair and skin',
      tags: ['Vegan', 'Cold Pressed', 'Moroccan', 'Hair Care', 'Skin Care'],
      inventory: 20,
      rating: 4.9,
      review_count: 145,
      ingredients: [
        '100% Pure Argan Oil - Cold-pressed extraction',
        'Vitamin E - Natural antioxidant',
        'Essential Fatty Acids - Omega 6 and 9',
        'Natural Tocopherols - Skin protection',
        'No additives or preservatives',
        'Organic certified'
      ],
      how_to_use: [
        'For Hair: Apply 2-3 drops to damp hair',
        'For Skin: Massage 1-2 drops into clean skin',
        'For Nails: Apply to cuticles daily',
        'Use morning and evening for best results',
        'Can be used alone or mixed with other products'
      ],
      in_stock: true,
      oil_type: 'Hair Oil',
      application_area: 'Hair',
      extraction_method: 'Cold Pressed',
      volume_ml: 30,
      carrier_oil: 'Argan'
    }
  ],
  beard_care: [
    {
      title: 'Beard Oil',
      slug: 'beard-oil',
      price: 15,
      images: ['/images/beard-oil.jpg'],
      description: "Premium beard oil formulated with natural oils to condition, soften, and style your beard. Contains jojoba oil, argan oil, and essential oils to keep your beard looking and feeling its best while promoting healthy growth.",
      short_description: 'Premium beard conditioning and styling oil',
      tags: ['Vegan', 'For Men', 'Beard Care', 'Conditioning', 'Styling'],
      inventory: 30,
      rating: 4.8,
      review_count: 92,
      ingredients: [
        'Jojoba Oil - Mimics natural skin oils',
        'Argan Oil - Deep conditioning',
        'Coconut Oil - Softening properties',
        'Sandalwood Oil - Masculine fragrance',
        'Vitamin E - Hair protection',
        'Essential Oils - Natural scent'
      ],
      how_to_use: [
        'Apply 2-3 drops to clean, dry beard',
        'Massage gently from roots to tips',
        'Use fingers or beard brush to distribute',
        'Style as desired',
        'Use daily for best results'
      ],
      in_stock: true,
      product_type: 'Beard Oil',
      beard_length: 'All Lengths',
      scent: 'Sandalwood',
      volume_ml: 30
    }
  ],
  shampoos: [
    {
      title: 'Argan Shampoo',
      slug: 'argan-shampoo',
      price: 16,
      images: ['/images/argan-shampoo.jpg'],
      description: "Luxurious Argan Shampoo enriched with Moroccan argan oil to cleanse, nourish, and restore your hair's natural shine. Sulfate-free formula gently cleanses without stripping natural oils, leaving hair soft, manageable, and beautifully conditioned.",
      short_description: 'Sulfate-free shampoo with Moroccan argan oil',
      tags: ['Vegan', 'Sulfate Free', 'Argan Oil', 'Hair Care', 'Natural'],
      inventory: 25,
      rating: 4.7,
      review_count: 118,
      ingredients: [
        'Moroccan Argan Oil - Deep nourishment',
        'Coconut Oil - Moisturizing properties',
        'Aloe Vera - Soothing and conditioning',
        'Vitamin E - Hair protection',
        'Natural Surfactants - Gentle cleansing',
        'Essential Oils - Natural fragrance'
      ],
      how_to_use: [
        'Wet hair thoroughly with warm water',
        'Apply shampoo to scalp and massage gently',
        'Work through to ends of hair',
        'Rinse thoroughly with warm water',
        'Follow with conditioner for best results'
      ],
      in_stock: true,
      product_type: 'Shampoo',
      hair_type: 'All Hair Types',
      hair_concern: 'Moisture',
      volume_ml: 250,
      sulfate_free: true
    }
  ],
  roll_ons: [
    {
      title: 'Essential Oil Roll-On',
      slug: 'essential-oil-roll-on',
      price: 12,
      images: ['/images/roll-on.jpg'],
      description: "Convenient essential oil roll-on for on-the-go aromatherapy. Diluted with carrier oil for safe skin application. Perfect for stress relief, energy boost, or relaxation. Easy to carry and apply anywhere.",
      short_description: 'Convenient aromatherapy roll-on for daily use',
      tags: ['Vegan', 'Essential Oils', 'Aromatherapy', 'Portable', 'Natural'],
      inventory: 40,
      rating: 4.6,
      review_count: 67,
      ingredients: [
        'Lavender Oil - Calming and relaxing',
        'Peppermint Oil - Energizing and refreshing',
        'Jojoba Oil - Carrier oil base',
        'Vitamin E - Skin protection',
        'Natural Preservatives - Freshness',
        'No artificial fragrances'
      ],
      how_to_use: [
        'Apply to pulse points (wrists, temples, neck)',
        'Roll gently on skin',
        'Massage in with fingertips',
        'Reapply as needed throughout the day',
        'Store in cool, dry place'
      ],
      in_stock: true,
      roll_on_type: 'Essential Oil',
      application_area: 'Pulse Points',
      scent: 'Lavender & Peppermint',
      volume_ml: 10,
      concentration: 'Diluted'
    }
  ],
  elixirs: [
    {
      title: 'Immunity Boost Elixir',
      slug: 'immunity-boost-elixir',
      price: 22,
      images: ['/images/immunity-elixir.jpg'],
      description: "Powerful immunity-boosting elixir made with elderberry, echinacea, and vitamin C. This concentrated herbal blend supports your immune system naturally. Alcohol-free formula with natural sweeteners for a pleasant taste.",
      short_description: 'Concentrated herbal blend for immune support',
      tags: ['Vegan', 'Immunity', 'Elderberry', 'Alcohol Free', 'Wellness'],
      inventory: 15,
      rating: 4.8,
      review_count: 89,
      ingredients: [
        'Elderberry Extract - Natural immune support',
        'Echinacea - Immune system booster',
        'Vitamin C - Antioxidant protection',
        'Ginger Root - Anti-inflammatory',
        'Honey - Natural sweetener',
        'Purified Water - Base'
      ],
      how_to_use: [
        'Take 1 dropper (1ml) daily',
        'Can be taken directly or mixed with water',
        'Best taken in the morning',
        'Shake well before use',
        'Store in refrigerator after opening'
      ],
      in_stock: true,
      elixir_type: 'Immunity',
      benefits: ['Boosts Immunity', 'Antioxidant Support', 'Natural Defense'],
      dosage: '1 dropper daily',
      volume_ml: 30,
      alcohol_free: true
    }
  ]
};

async function migrateToCategoryTables() {
  console.log('Starting migration to category-specific tables...');
  
  try {
    // Migrate each category
    for (const [category, products] of Object.entries(categoryData)) {
      console.log(`\nMigrating ${category} products...`);
      
      for (const product of products) {
        const { data, error } = await supabase
          .from(category)
          .insert([product]);
          
        if (error) {
          console.error(`Error migrating ${category} product:`, product.title, error);
          throw error;
        } else {
          console.log(`✓ Migrated ${product.title} to ${category} table`);
        }
      }
      
      console.log(`✓ Successfully migrated ${products.length} ${category} products`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('All products have been migrated to their respective category tables.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToCategoryTables();
