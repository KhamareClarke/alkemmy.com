'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface ProductFiltersProps {
  category: string;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  className?: string;
}

const CATEGORY_FILTERS = {
  soaps: {
    'Skin Type': ['Dry', 'Oily', 'Sensitive', 'Normal', 'Combination'],
    'Key Ingredient': ['Charcoal', 'Neem', 'Aloe Vera', 'Turmeric', 'Sandalwood', 'Rose'],
    'Concern': ['Acne', 'Pigmentation', 'Dullness', 'Rough Skin', 'Odor'],
    'Fragrance': ['Mild', 'Floral', 'Herbal', 'Citrus', 'Unscented']
  },
  teas: {
    'Purpose': ['Detox', 'Relaxation', 'Immunity', 'Digestion', 'Weight Management', 'Sleep'],
    'Main Ingredient': ['Green Tea', 'Chamomile', 'Hibiscus', 'Tulsi', 'Ginger', 'Peppermint'],
    'Caffeine Level': ['Caffeine-free', 'Low-caffeine', 'Regular'],
    'Form': ['Loose Leaf', 'Tea Bags']
  },
  lotions: {
    'Skin Type': ['Dry', 'Oily', 'Sensitive', 'Combination', 'Normal'],
    'Concern': ['Hydration', 'Brightening', 'Anti-Aging', 'Sun Protection', 'Even Tone'],
    'Key Ingredient': ['Shea Butter', 'Aloe Vera', 'Vitamin E', 'Cocoa Butter', 'Coconut Oil'],
    'Texture': ['Light', 'Rich', 'Gel-based', 'Cream-based']
  },
  oils: {
    'Type': ['Hair Oil', 'Body Oil', 'Multipurpose Oil'],
    'Base Ingredient': ['Coconut', 'Almond', 'Argan', 'Castor', 'Olive', 'Jojoba'],
    'Concern': ['Hair Fall', 'Dandruff', 'Dry Scalp', 'Stretch Marks', 'Dry Skin'],
    'Formulation': ['Cold-Pressed', 'Blend', 'Ayurvedic', 'Organic']
  },
  'beard-care': {
    'Product Type': ['Beard Oil', 'Balm', 'Wash', 'Comb/Brush', 'Kit'],
    'Beard Type': ['Short', 'Long', 'Thick', 'Patchy'],
    'Fragrance': ['Woody', 'Citrus', 'Musk', 'Herbal', 'Unscented'],
    'Concern': ['Growth', 'Softening', 'Itch Relief', 'Shine']
  },
  shampoos: {
    'Hair Type': ['Dry', 'Oily', 'Frizzy', 'Curly', 'Straight', 'Color-treated'],
    'Concern': ['Hair Fall', 'Dandruff', 'Damage Repair', 'Volume', 'Shine'],
    'Ingredient': ['Argan Oil', 'Keratin', 'Aloe Vera', 'Tea Tree', 'Biotin'],
    'Formulation': ['Sulfate-free', 'Paraben-free', 'Organic', 'Herbal']
  },
  'roll-ons': {
    'Purpose': ['Headache Relief', 'Stress', 'Energy Boost', 'Sleep', 'Pain Relief'],
    'Main Ingredient': ['Peppermint', 'Lavender', 'Eucalyptus', 'Lemongrass', 'Tea Tree'],
    'Formulation': ['Essential Oil Blend', 'Herbal Extract', 'Alcohol-free'],
    'Usage Area': ['Forehead', 'Neck', 'Wrist', 'Body']
  },
  elixirs: {
    'Purpose': ['Immunity', 'Skin Glow', 'Energy', 'Detox', 'Digestion', 'Hormonal Balance'],
    'Main Ingredient': ['Amla', 'Ashwagandha', 'Turmeric', 'Tulsi', 'Giloy', 'Spirulina'],
    'Form': ['Liquid', 'Drops', 'Tonic', 'Capsules'],
    'Formulation': ['Herbal', 'Ayurvedic', 'Organic']
  }
};

export default function ProductFilters({ category, onFiltersChange, className = '' }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [customIngredients, setCustomIngredients] = useState<Record<string, string[]>>({});

  const filters = CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS];

  // Initialize selected filters based on category
  useEffect(() => {
    console.log('Initializing filters for category:', category);
    const initialFilters: Record<string, string[]> = {};
    if (CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS]) {
      Object.keys(CATEGORY_FILTERS[category as keyof typeof CATEGORY_FILTERS]).forEach(filterName => {
        initialFilters[filterName] = [];
      });
    }
    console.log('Initial filters:', initialFilters);
    setSelectedFilters(initialFilters);
    onFiltersChange(initialFilters); // Notify parent of initial state
  }, [category]); // Removed onFiltersChange from dependencies

  // Load custom ingredients from localStorage (set by admin panel)
  useEffect(() => {
    const savedCustomIngredients = localStorage.getItem(`admin_custom_ingredients_${category}`);
    if (savedCustomIngredients) {
      try {
        setCustomIngredients(JSON.parse(savedCustomIngredients));
      } catch (error) {
        console.error('Error loading custom ingredients:', error);
      }
    }
  }, [category]);

  // Debug: Track selectedFilters changes
  useEffect(() => {
    console.log('selectedFilters changed:', selectedFilters);
  }, [selectedFilters]);
  
  if (!filters) {
    return null;
  }

  const handleFilterChange = (filterName: string, value: string, checked: boolean) => {
    console.log('Filter change:', { filterName, value, checked, currentFilters: selectedFilters });
    
    const newFilters = { ...selectedFilters };
    
    if (!newFilters[filterName]) {
      newFilters[filterName] = [];
    }
    
    if (checked) {
      newFilters[filterName] = [...newFilters[filterName], value];
    } else {
      newFilters[filterName] = newFilters[filterName].filter(v => v !== value);
    }
    
    console.log('New filters:', newFilters);
    setSelectedFilters(newFilters);
    onFiltersChange(newFilters);
  };


  const clearAllFilters = () => {
    setSelectedFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filters => filters.length > 0);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Products</h3>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-1"
            >
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="space-y-6">
            {Object.entries(filters).map(([filterName, options]) => {
              // Combine predefined options with custom ingredients for key ingredient fields
              const isKeyIngredientField = filterName === 'Key Ingredient' || filterName === 'Main Ingredient' || filterName === 'Ingredient';
              const allOptions = isKeyIngredientField 
                ? [...options, ...(customIngredients[filterName] || [])]
                : options;
              
              return (
                <div key={filterName}>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{filterName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {allOptions.map((option) => {
                      const isSelected = selectedFilters[filterName]?.includes(option) || false;
                      return (
                        <label
                          key={option}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleFilterChange(filterName, option, e.target.checked)}
                            className="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedFilters).map(([filterName, values]) =>
                values.map((value) => (
                  <span
                    key={`${filterName}-${value}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#D4AF37] text-black"
                  >
                    <span className="font-medium">{filterName}:</span>
                    <span className="ml-1">{value}</span>
                    <button
                      onClick={() => handleFilterChange(filterName, value, false)}
                      className="ml-2 text-black hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
