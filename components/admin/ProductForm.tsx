'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { 
  createSoap, 
  updateSoap, 
  createHerbalTea, 
  updateHerbalTea,
  createLotion,
  updateLotion,
  createOil,
  updateOil,
  createBeardCare,
  updateBeardCare,
  createShampoo,
  updateShampoo,
  createRollOn,
  updateRollOn,
  createElixir,
  updateElixir,
  generateSlug,
  validateProductData
} from '@/lib/admin-api';
import { 
  Soap, 
  HerbalTea, 
  Lotion, 
  Oil, 
  BeardCare, 
  Shampoo, 
  RollOn, 
  Elixir 
} from '@/lib/category-api';

type CategoryProduct = Soap | HerbalTea | Lotion | Oil | BeardCare | Shampoo | RollOn | Elixir;

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
    'Product Type': ['Shampoo', 'Conditioner', '2-in-1', 'Treatment'],
    'Sulfate Free': ['Yes', 'No']
  },
  'roll-ons': {
    'Purpose': ['Headache Relief', 'Stress', 'Energy Boost', 'Sleep', 'Pain Relief'],
    'Application Area': ['Pulse Points', 'Underarms', 'Temples', 'Body'],
    'Scent': ['Lavender', 'Peppermint', 'Eucalyptus', 'Lemongrass', 'Tea Tree'],
    'Concentration': ['Diluted', 'Pure', 'Blend']
  },
  elixirs: {
    'Purpose': ['Immunity', 'Skin Glow', 'Energy', 'Detox', 'Digestion', 'Hormonal Balance'],
    'Benefits': ['Boosts Immunity', 'Improves Sleep', 'Increases Energy', 'Detoxifies', 'Balances Hormones'],
    'Dosage': ['1 dropper daily', '2 teaspoons morning', '1 tablespoon evening', 'As needed'],
    'Alcohol Free': ['Yes', 'No']
  }
};

interface ProductFormProps {
  category: string;
  product: CategoryProduct | null;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORY_OPTIONS = [
  { id: 'soaps', name: '🧼 Soaps', description: 'Natural bar soaps for every skin type' },
  { id: 'teas', name: '🍃 Herbal Teas', description: 'Wellness blends for mind and body' },
  { id: 'lotions', name: '🧴 Lotions', description: 'Nourishing creams and moisturizers' },
  { id: 'oils', name: '💧 Hair & Body Oils', description: 'Cold-pressed oils for deep nourishment' },
  { id: 'beard-care', name: '🧔 Beard Care', description: 'Complete grooming solutions for men' },
  { id: 'shampoos', name: '🚿 Shampoos & Conditioners', description: 'Gentle cleansing for healthy hair' },
  { id: 'roll-ons', name: '⚡ Roll-ons', description: 'Targeted treatments on-the-go' },
  { id: 'elixirs', name: '🌟 Elixirs', description: 'Concentrated herbal wellness shots' }
];

export default function ProductForm({ category, product, onClose, onSave }: ProductFormProps) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [showCategorySelection, setShowCategorySelection] = useState(!product && !category);
  const [formData, setFormData] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    price: product?.price || 0,
    description: product?.description || '',
    short_description: product?.short_description || '',
    tags: product?.tags || [],
    inventory: product?.inventory || 0,
    rating: product?.rating || 0,
    review_count: product?.review_count || 0,
    ingredients: product?.ingredients || [],
    how_to_use: product?.how_to_use || [],
    in_stock: product?.in_stock ?? true,
    images: product?.images || [],
    badges: product?.badges || [],
    // Category-specific fields
    soap_type: (product as Soap)?.soap_type || '',
    skin_type: (product as Soap)?.skin_type || '',
    scent: (product as Soap)?.scent || '',
    concern: (product as Soap)?.concern || '',
    weight_grams: (product as Soap)?.weight_grams || 0,
    tea_type: (product as HerbalTea)?.tea_type || '',
    benefits: (product as HerbalTea)?.benefits || [],
    caffeine_level: (product as HerbalTea)?.caffeine_level || '',
    main_ingredient: (product as HerbalTea)?.main_ingredient || '',
    form: (product as HerbalTea)?.form || '',
    steeping_time: (product as HerbalTea)?.steeping_time || 0,
    temperature_celsius: (product as HerbalTea)?.temperature_celsius || 0,
    lotion_type: (product as Lotion)?.lotion_type || '',
    spf_level: (product as Lotion)?.spf_level || 0,
    volume_ml: (product as Lotion)?.volume_ml || 0,
    texture: (product as Lotion)?.texture || '',
    oil_type: (product as Oil)?.oil_type || '',
    application_area: (product as Oil)?.application_area || '',
    extraction_method: (product as Oil)?.extraction_method || '',
    carrier_oil: (product as Oil)?.carrier_oil || '',
    product_type: (product as BeardCare)?.product_type || '',
    beard_length: (product as BeardCare)?.beard_length || '',
    hold_strength: (product as BeardCare)?.hold_strength || '',
    fragrance: (product as BeardCare)?.fragrance || '',
    concern: (product as BeardCare)?.concern || '',
    product_type: (product as Shampoo)?.product_type || '',
    hair_type: (product as Shampoo)?.hair_type || '',
    hair_concern: (product as Shampoo)?.hair_concern || '',
    volume_ml: (product as Shampoo)?.volume_ml || 0,
    sulfate_free: (product as Shampoo)?.sulfate_free || false,
    roll_on_type: (product as RollOn)?.roll_on_type || '',
    application_area: (product as RollOn)?.application_area || '',
    concentration: (product as RollOn)?.concentration || '',
    elixir_type: (product as Elixir)?.elixir_type || '',
    benefits: (product as Elixir)?.benefits || [],
    dosage: (product as Elixir)?.dosage || '',
    volume_ml: (product as Elixir)?.volume_ml || 0,
    alcohol_free: (product as Elixir)?.alcohol_free || true
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [newHowToUse, setNewHowToUse] = useState('');
  const [customIngredients, setCustomIngredients] = useState<Record<string, string[]>>({});
  const [newCustomIngredient, setNewCustomIngredient] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState(false);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (!product && formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title, product]);

  // Load custom ingredients from localStorage on mount
  useEffect(() => {
    const savedCustomIngredients = localStorage.getItem(`admin_custom_ingredients_${selectedCategory}`);
    if (savedCustomIngredients) {
      try {
        setCustomIngredients(JSON.parse(savedCustomIngredients));
      } catch (error) {
        console.error('Error loading custom ingredients:', error);
      }
    }
  }, [selectedCategory]);

  // Save custom ingredients to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`admin_custom_ingredients_${selectedCategory}`, JSON.stringify(customIngredients));
  }, [customIngredients, selectedCategory]);

  const addCustomIngredient = (filterName: string) => {
    const customValue = newCustomIngredient[filterName]?.trim();
    if (customValue && !customIngredients[filterName]?.includes(customValue)) {
      const newCustomIngredients = {
        ...customIngredients,
        [filterName]: [...(customIngredients[filterName] || []), customValue]
      };
      setCustomIngredients(newCustomIngredients);
      setNewCustomIngredient({ ...newCustomIngredient, [filterName]: '' });
    }
  };

  const removeCustomIngredient = (filterName: string, value: string) => {
    const newCustomIngredients = {
      ...customIngredients,
      [filterName]: (customIngredients[filterName] || []).filter(v => v !== value)
    };
    setCustomIngredients(newCustomIngredients);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64 for now (in production, you'd upload to a cloud service)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        newImages.push(base64);
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors(prev => [...prev, 'Failed to upload images. Please try again.']);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Function to filter form data based on category
  const filterFormDataByCategory = (data: any, category: string) => {
    const baseFields = {
      title: data.title,
      slug: data.slug,
      price: data.price,
      description: data.description,
      short_description: data.short_description,
      tags: data.tags.filter((tag: string) => tag.trim() !== ''),
      inventory: data.inventory,
      rating: data.rating,
      review_count: data.review_count,
      ingredients: data.ingredients.filter((ingredient: string) => ingredient.trim() !== ''),
      how_to_use: data.how_to_use.filter((step: string) => step.trim() !== ''),
      in_stock: data.in_stock,
      images: data.images,
      badges: data.badges.filter((badge: string) => badge.trim() !== '')
    };

    // Add category-specific fields
    switch (category) {
      case 'soaps':
        return {
          ...baseFields,
          soap_type: data.soap_type,
          skin_type: data.skin_type,
          scent: data.scent,
          concern: data.concern,
          weight_grams: data.weight_grams
        };
      case 'teas':
        return {
          ...baseFields,
          tea_type: data.tea_type,
          benefits: data.benefits,
          caffeine_level: data.caffeine_level,
          main_ingredient: data.main_ingredient,
          form: data.form,
          steeping_time: data.steeping_time,
          temperature_celsius: data.temperature_celsius,
          weight_grams: data.weight_grams
        };
      case 'lotions':
        return {
          ...baseFields,
          lotion_type: data.lotion_type,
          skin_type: data.skin_type,
          spf_level: data.spf_level,
          volume_ml: data.volume_ml,
          texture: data.texture
        };
      case 'oils':
        return {
          ...baseFields,
          oil_type: data.oil_type,
          application_area: data.application_area,
          extraction_method: data.extraction_method,
          carrier_oil: data.carrier_oil,
          volume_ml: data.volume_ml
        };
      case 'beard-care':
        return {
          ...baseFields,
          product_type: data.product_type,
          beard_length: data.beard_length,
          scent: data.scent,
          hold_strength: data.hold_strength,
          fragrance: data.fragrance,
          concern: data.concern,
          volume_ml: data.volume_ml
        };
      case 'shampoos':
        return {
          ...baseFields,
          product_type: data.product_type,
          hair_type: data.hair_type,
          hair_concern: data.hair_concern,
          volume_ml: data.volume_ml,
          sulfate_free: data.sulfate_free
        };
      case 'roll-ons':
        return {
          ...baseFields,
          roll_on_type: data.roll_on_type,
          application_area: data.application_area,
          scent: data.scent,
          volume_ml: data.volume_ml,
          concentration: data.concentration
        };
      case 'elixirs':
        return {
          ...baseFields,
          elixir_type: data.elixir_type,
          benefits: data.benefits,
          dosage: data.dosage,
          volume_ml: data.volume_ml,
          alcohol_free: data.alcohol_free
        };
      default:
        return baseFields;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Validate form data
      const validationErrors = validateProductData(formData, selectedCategory as any);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Filter form data to only include relevant fields for the category
      const submitData = filterFormDataByCategory(formData, selectedCategory);

      let result;
      if (product) {
        // Update existing product
        switch (selectedCategory) {
          case 'soaps':
            result = await updateSoap(product.id, submitData);
            break;
          case 'teas':
            result = await updateHerbalTea(product.id, submitData);
            break;
          case 'lotions':
            result = await updateLotion(product.id, submitData);
            break;
          case 'oils':
            result = await updateOil(product.id, submitData);
            break;
          case 'beard-care':
            result = await updateBeardCare(product.id, submitData);
            break;
          case 'shampoos':
            result = await updateShampoo(product.id, submitData);
            break;
          case 'roll-ons':
            result = await updateRollOn(product.id, submitData);
            break;
          case 'elixirs':
            result = await updateElixir(product.id, submitData);
            break;
        }
      } else {
        // Create new product
        switch (selectedCategory) {
          case 'soaps':
            result = await createSoap(submitData);
            break;
          case 'teas':
            result = await createHerbalTea(submitData);
            break;
          case 'lotions':
            result = await createLotion(submitData);
            break;
          case 'oils':
            result = await createOil(submitData);
            break;
          case 'beard-care':
            result = await createBeardCare(submitData);
            break;
          case 'shampoos':
            result = await createShampoo(submitData);
            break;
          case 'roll-ons':
            result = await createRollOn(submitData);
            break;
          case 'elixirs':
            result = await createElixir(submitData);
            break;
        }
      }

      if (result) {
        onSave();
      } else {
        setErrors(['Failed to save product. Please try again.']);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors(['An error occurred while saving the product.']);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, newIngredient.trim()] }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter(ingredient => ingredient !== ingredientToRemove) }));
  };

  const addHowToUse = () => {
    if (newHowToUse.trim() && !formData.how_to_use.includes(newHowToUse.trim())) {
      setFormData(prev => ({ ...prev, how_to_use: [...prev.how_to_use, newHowToUse.trim()] }));
      setNewHowToUse('');
    }
  };

  const removeHowToUse = (stepToRemove: string) => {
    setFormData(prev => ({ ...prev, how_to_use: prev.how_to_use.filter(step => step !== stepToRemove) }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategorySelection(false);
  };

  const renderCategorySelection = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Product Category</h3>
          <p className="text-gray-600">Choose the category for your new product</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCategorySelect(option.id)}
              className="p-6 text-left border-2 border-gray-200 rounded-lg hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{option.name.split(' ')[0]}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-[#B8941F]">
                    {option.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const renderCategoryFields = () => {
    const filters = CATEGORY_FILTERS[selectedCategory as keyof typeof CATEGORY_FILTERS];
    if (!filters) return null;

    // Map filter names to actual form field names for each category
    const getFieldName = (filterName: string) => {
      const fieldMappings: Record<string, Record<string, string>> = {
        soaps: {
          'Skin Type': 'skin_type',
          'Key Ingredient': 'soap_type',
          'Concern': 'concern',
          'Fragrance': 'scent'
        },
        teas: {
          'Purpose': 'tea_type',
          'Main Ingredient': 'main_ingredient',
          'Caffeine Level': 'caffeine_level',
          'Form': 'form'
        },
        lotions: {
          'Skin Type': 'skin_type',
          'Concern': 'lotion_type',
          'Key Ingredient': 'texture',
          'Texture': 'texture'
        },
        oils: {
          'Type': 'oil_type',
          'Base Ingredient': 'carrier_oil',
          'Concern': 'application_area',
          'Formulation': 'extraction_method'
        },
        'beard-care': {
          'Product Type': 'product_type',
          'Beard Type': 'beard_length',
          'Fragrance': 'fragrance',
          'Concern': 'concern'
        },
        shampoos: {
          'Hair Type': 'hair_type',
          'Concern': 'hair_concern',
          'Product Type': 'product_type',
          'Sulfate Free': 'sulfate_free'
        },
        'roll-ons': {
          'Purpose': 'roll_on_type',
          'Application Area': 'application_area',
          'Scent': 'scent',
          'Concentration': 'concentration'
        },
        elixirs: {
          'Purpose': 'elixir_type',
          'Benefits': 'benefits',
          'Dosage': 'dosage',
          'Alcohol Free': 'alcohol_free'
        }
      };

      return fieldMappings[selectedCategory]?.[filterName] || filterName.toLowerCase().replace(/\s+/g, '_');
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Category-Specific Fields</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(filters).map(([filterName, options]) => {
            const fieldName = getFieldName(filterName);
            const isKeyIngredientField = filterName === 'Key Ingredient' || filterName === 'Main Ingredient' || filterName === 'Ingredient';
            const isArrayField = fieldName === 'benefits'; // Handle benefits as array field
            const isBooleanField = fieldName === 'sulfate_free'; // Handle boolean fields
            const allOptions = [...options, ...(customIngredients[filterName] || [])];
            
            // Special handling for array fields like benefits
            if (isArrayField) {
              const currentValues = formData[fieldName as keyof typeof formData] as string[] || [];
              
              const addArrayValue = (newValue: string) => {
                if (newValue.trim() && !currentValues.includes(newValue.trim())) {
                  setFormData(prev => ({ 
                    ...prev, 
                    [fieldName]: [...currentValues, newValue.trim()]
                  }));
                }
              };

              const removeArrayValue = (valueToRemove: string) => {
                setFormData(prev => ({ 
                  ...prev, 
                  [fieldName]: currentValues.filter(v => v !== valueToRemove)
                }));
              };

              return (
                <div key={filterName} className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filterName}
                  </label>
                  <div className="space-y-2">
                    {currentValues.map((value, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{value}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayValue(value)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Add ${filterName.toLowerCase()}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            addArrayValue(target.value);
                            target.value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                          if (input) {
                            addArrayValue(input.value);
                            input.value = '';
                          }
                        }} 
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Special handling for boolean fields
            if (isBooleanField) {
              const currentValue = formData[fieldName as keyof typeof formData] as boolean;
              
              return (
                <div key={filterName}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filterName}
                  </label>
                  <select
                    value={currentValue ? 'Yes' : 'No'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [fieldName]: e.target.value === 'Yes'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              );
            }
            
            return (
              <div key={filterName} className={isKeyIngredientField ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filterName}
                </label>
                <select
                  value={formData[fieldName as keyof typeof formData] as string}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [fieldName]: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="">Select {filterName}</option>
                  {allOptions.map((option) => {
                    const isCustom = customIngredients[filterName]?.includes(option);
                    return (
                      <option key={option} value={option}>
                        {option} {isCustom ? '(Custom)' : ''}
                      </option>
                    );
                  })}
                </select>
                
                {isKeyIngredientField && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newCustomIngredient[filterName] || ''}
                        onChange={(e) => setNewCustomIngredient({ ...newCustomIngredient, [filterName]: e.target.value })}
                        placeholder={`Add custom ${filterName.toLowerCase()}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomIngredient(filterName);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addCustomIngredient(filterName)}
                        size="sm"
                        className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {customIngredients[filterName] && customIngredients[filterName].length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 font-medium">Custom {filterName}s:</p>
                        <div className="flex flex-wrap gap-1">
                          {customIngredients[filterName].map((ingredient) => (
                            <span
                              key={ingredient}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#D4AF37] text-black"
                            >
                              {ingredient}
                              <button
                                type="button"
                                onClick={() => removeCustomIngredient(filterName, ingredient)}
                                className="ml-1 text-black hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Press Enter or click Add to add a custom {filterName.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Product'} 
            {!showCategorySelection && selectedCategory && (
              <span className="text-gray-500 ml-2">
                - {CATEGORY_OPTIONS.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {showCategorySelection ? (
          <div className="p-6">
            {renderCategorySelection()}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (£) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inventory
                  </label>
                  <input
                    type="number"
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Count
                  </label>
                  <input
                    type="number"
                    value={formData.review_count}
                    onChange={(e) => setFormData({ ...formData, review_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  className="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 rounded"
                />
                <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">
                  In Stock
                </label>
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Descriptions</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D4AF37] transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    {uploadingImages ? (
                      <span className="text-[#D4AF37]">Uploading images...</span>
                    ) : (
                      <>
                        <span className="text-[#D4AF37] font-medium">Click to upload images</span>
                        <span className="block text-gray-500">or drag and drop</span>
                        <span className="block text-xs text-gray-400">PNG, JPG, GIF up to 10MB each</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Image Controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                              title="Move left"
                            >
                              ←
                            </button>
                          )}
                          {index < formData.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                              title="Move right"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Image Number Badge */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Tips */}
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Image Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• First image will be the main product image</li>
                  <li>• Use high-quality images (at least 800x800px)</li>
                  <li>• Show the product from different angles</li>
                  <li>• Use consistent lighting and background</li>
                </ul>
              </div>
            </div>

            {/* Category-specific fields */}
            {renderCategoryFields()}

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#D4AF37] text-black"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-black hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add an ingredient"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
                <Button type="button" onClick={addIngredient} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* How to Use */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">How to Use</h3>
              <div className="space-y-2">
                {formData.how_to_use.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{step}</span>
                    <button
                      type="button"
                      onClick={() => removeHowToUse(step)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHowToUse}
                  onChange={(e) => setNewHowToUse(e.target.value)}
                  placeholder="Add a usage step"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
                <Button type="button" onClick={addHowToUse} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Badges */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Product Badges</h3>
              <p className="text-sm text-gray-600">Select badges to highlight special products on the website</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'best_selling', label: 'Best Selling', color: 'bg-red-500' },
                  { id: 'trending', label: 'Trending', color: 'bg-orange-500' },
                  { id: 'new', label: 'New', color: 'bg-green-500' },
                  { id: 'sale', label: 'Sale', color: 'bg-purple-500' },
                  { id: 'limited', label: 'Limited Edition', color: 'bg-pink-500' },
                  { id: 'featured', label: 'Featured', color: 'bg-blue-500' },
                  { id: 'organic', label: 'Organic', color: 'bg-emerald-500' },
                  { id: 'premium', label: 'Premium', color: 'bg-yellow-500' }
                ].map((badge) => {
                  const isSelected = formData.badges.includes(badge.id);
                  return (
                    <label
                      key={badge.id}
                      className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              badges: [...prev.badges, badge.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              badges: prev.badges.filter(b => b !== badge.id)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${badge.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Selected Badges Preview */}
              {formData.badges.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Badges Preview:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.badges.map((badgeId) => {
                      const badge = [
                        { id: 'best_selling', label: 'Best Selling', color: 'bg-red-500' },
                        { id: 'trending', label: 'Trending', color: 'bg-orange-500' },
                        { id: 'new', label: 'New', color: 'bg-green-500' },
                        { id: 'sale', label: 'Sale', color: 'bg-purple-500' },
                        { id: 'limited', label: 'Limited Edition', color: 'bg-pink-500' },
                        { id: 'featured', label: 'Featured', color: 'bg-blue-500' },
                        { id: 'organic', label: 'Organic', color: 'bg-emerald-500' },
                        { id: 'premium', label: 'Premium', color: 'bg-yellow-500' }
                      ].find(b => b.id === badgeId);
                      
                      return badge ? (
                        <span
                          key={badgeId}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
