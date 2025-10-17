'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Heart, Zap, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AddToCartButton from '@/components/AddToCartButton';
import { getAllProductsForSkinMatcher } from '@/lib/admin-api';

interface QuizAnswers {
  age: string;
  gender: string;
  skinType: string;
  concerns: string[];
  budget: string;
  lifestyle: string;
}

interface Product {
  id: string;
  title: string;
  images: string[];
  price: number;
  category: string;
  slug: string;
  in_stock: boolean;
  inventory: number;
  description?: string;
  short_description?: string;
  tags?: string[];
  score?: number;
  reasons?: string[];
}

const SkinMatcherQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    age: '',
    gender: '',
    skinType: '',
    concerns: [],
    budget: '',
    lifestyle: ''
  });
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    {
      id: 'age',
      title: 'What\'s your age range?',
      type: 'single',
      options: [
        { value: '18-25', label: '18-25', icon: '🌸' },
        { value: '26-35', label: '26-35', icon: '🌺' },
        { value: '36-45', label: '36-45', icon: '🌹' },
        { value: '46-55', label: '46-55', icon: '🌻' },
        { value: '55+', label: '55+', icon: '🌷' }
      ]
    },
    {
      id: 'gender',
      title: 'How do you identify?',
      type: 'single',
      options: [
        { value: 'female', label: 'Female', icon: '👩' },
        { value: 'male', label: 'Male', icon: '👨' },
        { value: 'non-binary', label: 'Non-binary', icon: '🧑' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '🤐' }
      ]
    },
    {
      id: 'skinType',
      title: 'What\'s your skin type?',
      type: 'single',
      options: [
        { value: 'oily', label: 'Oily', description: 'Shiny, enlarged pores, prone to breakouts' },
        { value: 'dry', label: 'Dry', description: 'Tight, flaky, rough texture' },
        { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
        { value: 'sensitive', label: 'Sensitive', description: 'Easily irritated, reactive' },
        { value: 'normal', label: 'Normal', description: 'Balanced, few imperfections' }
      ]
    },
    {
      id: 'concerns',
      title: 'What are your main skin concerns?',
      type: 'multiple',
      options: [
        { value: 'acne', label: 'Acne & Breakouts', icon: '🎯' },
        { value: 'aging', label: 'Aging & Wrinkles', icon: '⏰' },
        { value: 'dark-spots', label: 'Dark Spots & Hyperpigmentation', icon: '🌑' },
        { value: 'dryness', label: 'Dryness & Dehydration', icon: '💧' },
        { value: 'sensitivity', label: 'Sensitivity & Redness', icon: '🌡️' },
        { value: 'dullness', label: 'Dullness & Uneven Tone', icon: '✨' },
        { value: 'pores', label: 'Large Pores', icon: '🔍' },
        { value: 'texture', label: 'Rough Texture', icon: '🏔️' }
      ]
    },
    {
      id: 'budget',
      title: 'What\'s your skincare budget?',
      type: 'single',
      options: [
        { value: 'budget', label: 'Budget (£10-25)', icon: '💰' },
        { value: 'mid-range', label: 'Mid-range (£25-50)', icon: '💎' },
        { value: 'premium', label: 'Premium (£50+)', icon: '👑' }
      ]
    },
    {
      id: 'lifestyle',
      title: 'Describe your lifestyle',
      type: 'single',
      options: [
        { value: 'busy', label: 'Busy & On-the-go', description: 'Need quick, effective routines' },
        { value: 'minimalist', label: 'Minimalist', description: 'Prefer simple, essential products' },
        { value: 'luxury', label: 'Luxury & Pampering', description: 'Enjoy indulgent skincare rituals' },
        { value: 'natural', label: 'Natural & Organic', description: 'Prefer clean, natural ingredients' }
      ]
    }
  ];

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      // Fetch all products from all 8 categories
      const allProducts = await getAllProductsForSkinMatcher();
      
      // Apply rule-based logic to filter and score products
      const scoredProducts = allProducts.map(product => {
        const { score, reasons } = calculateProductScore(product, answers);
        return {
          ...product,
          score,
          reasons
        };
      });

      // Smart analysis and filtering
      const analyzedProducts = analyzeAndFilterProducts(scoredProducts, answers);
      
      // Take only top 3 recommendations
      let topRecommendations = analyzedProducts.slice(0, 3);

      // If no good recommendations found, show 3 general products
      if (topRecommendations.length === 0) {
        topRecommendations = allProducts.slice(0, 3);
      }

      setRecommendations(topRecommendations);
      setShowResults(true);
      
      // Store results in localStorage
      localStorage.setItem('skinMatcherResults', JSON.stringify({
        answers,
        recommendations: topRecommendations,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProductScore = (product: any, answers: QuizAnswers): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];
    const { age, gender, skinType, concerns, budget, lifestyle } = answers;
    
    // Ensure product has required fields
    if (!product || !product.id || !product.title) {
      return { score: 0, reasons: [] };
    }

    // Age-based scoring with smarter matching
    const tags = product.tags || [];
    const description = (product.description || '').toLowerCase();
    const shortDescription = (product.short_description || '').toLowerCase();
    const allText = `${description} ${shortDescription}`.toLowerCase();
    
    // Smart age-based matching
    if (age === '18-25') {
      if (allText.includes('teen') || allText.includes('acne') || allText.includes('breakout') || allText.includes('clear')) {
        score += 4;
        reasons.push('Perfect for young skin and acne concerns');
      } else if (allText.includes('gentle') || allText.includes('mild')) {
        score += 2;
        reasons.push('Gentle formula suitable for young skin');
      }
    }
    if (age === '26-35') {
      if (allText.includes('anti-aging') || allText.includes('preventive') || allText.includes('wrinkle') || allText.includes('firming')) {
        score += 4;
        reasons.push('Ideal for preventive anti-aging care');
      } else if (allText.includes('hydrating') || allText.includes('moisturizing')) {
        score += 2;
        reasons.push('Great for maintaining healthy skin');
      }
    }
    if (age === '36-45') {
      if (allText.includes('anti-aging') || allText.includes('mature') || allText.includes('wrinkle') || allText.includes('firming')) {
        score += 5;
        reasons.push('Targeted for mature skin concerns');
      } else if (allText.includes('hydrating') || allText.includes('nourishing')) {
        score += 3;
        reasons.push('Excellent for mature skin hydration');
      }
    }
    if (age === '46-55') {
      if (allText.includes('mature') || allText.includes('anti-aging') || allText.includes('intensive') || allText.includes('wrinkle')) {
        score += 5;
        reasons.push('Formulated for mature skin needs');
      } else if (allText.includes('hydrating') || allText.includes('nourishing')) {
        score += 3;
        reasons.push('Great for mature skin care');
      }
    }
    if (age === '55+') {
      if (allText.includes('mature') || allText.includes('intensive') || allText.includes('anti-aging') || allText.includes('wrinkle')) {
        score += 6;
        reasons.push('Intensive care for mature skin');
      } else if (allText.includes('hydrating') || allText.includes('nourishing')) {
        score += 4;
        reasons.push('Excellent for mature skin nourishment');
      }
    }

    // Smart skin type matching
    if (skinType === 'oily') {
      if (allText.includes('oil-free') || allText.includes('mattifying') || allText.includes('non-comedogenic') || allText.includes('lightweight')) {
        score += 5;
        reasons.push('Perfect for oily skin - helps control shine');
      } else if (allText.includes('cleansing') || allText.includes('purifying')) {
        score += 3;
        reasons.push('Great for oily skin cleansing');
      } else if (product.category === 'soaps') {
        score += 2;
        reasons.push('Soap formula ideal for oily skin');
      }
    }
    if (skinType === 'dry') {
      if (allText.includes('hydrating') || allText.includes('moisturizing') || allText.includes('nourishing') || allText.includes('rich')) {
        score += 5;
        reasons.push('Excellent for dry skin - provides deep hydration');
      } else if (allText.includes('oil') || allText.includes('butter') || allText.includes('cream')) {
        score += 3;
        reasons.push('Rich formula perfect for dry skin');
      } else if (product.category === 'oils' || product.category === 'lotions') {
        score += 2;
        reasons.push('Moisturizing formula for dry skin');
      }
    }
    if (skinType === 'sensitive') {
      if (allText.includes('gentle') || allText.includes('sensitive') || allText.includes('calming') || allText.includes('soothing')) {
        score += 5;
        reasons.push('Gentle formula perfect for sensitive skin');
      } else if (allText.includes('natural') || allText.includes('organic') || allText.includes('fragrance-free')) {
        score += 3;
        reasons.push('Natural ingredients safe for sensitive skin');
      }
    }
    if (skinType === 'combination') {
      if (allText.includes('balancing') || allText.includes('combination') || allText.includes('normalizing')) {
        score += 4;
        reasons.push('Balancing formula for combination skin');
      } else if (allText.includes('gentle') || allText.includes('mild')) {
        score += 2;
        reasons.push('Gentle formula suitable for combination skin');
      }
    }
    if (skinType === 'normal') {
      if (allText.includes('maintaining') || allText.includes('healthy') || allText.includes('balanced')) {
        score += 3;
        reasons.push('Perfect for maintaining healthy skin');
      } else {
        score += 1;
        reasons.push('Suitable for normal skin');
      }
    }

    // Smart concern-based scoring
    concerns.forEach(concern => {
      if (concern === 'acne') {
        if (allText.includes('acne') || allText.includes('salicylic') || allText.includes('breakout') || allText.includes('bha')) {
          score += 4;
          reasons.push('Targets acne and breakouts effectively');
        } else if (allText.includes('cleansing') || allText.includes('purifying')) {
          score += 2;
          reasons.push('Helps cleanse and purify skin');
        }
      }
      if (concern === 'aging') {
        if (allText.includes('anti-aging') || allText.includes('retinol') || allText.includes('wrinkle') || allText.includes('firming')) {
          score += 4;
          reasons.push('Anti-aging properties to reduce fine lines');
        } else if (allText.includes('hydrating') || allText.includes('moisturizing')) {
          score += 2;
          reasons.push('Helps maintain youthful skin');
        }
      }
      if (concern === 'dark-spots') {
        if (allText.includes('brightening') || allText.includes('vitamin-c') || allText.includes('lightening') || allText.includes('even')) {
          score += 4;
          reasons.push('Brightening formula to fade dark spots');
        } else if (allText.includes('exfoliating') || allText.includes('renewing')) {
          score += 2;
          reasons.push('Helps improve skin tone');
        }
      }
      if (concern === 'dryness') {
        if (allText.includes('hydrating') || allText.includes('hyaluronic') || allText.includes('moisturizing') || allText.includes('nourishing')) {
          score += 4;
          reasons.push('Intensive hydration for dry skin');
        } else if (allText.includes('oil') || allText.includes('butter')) {
          score += 2;
          reasons.push('Rich moisturizing formula');
        }
      }
      if (concern === 'sensitivity') {
        if (allText.includes('gentle') || allText.includes('calming') || allText.includes('soothing') || allText.includes('sensitive')) {
          score += 4;
          reasons.push('Calming ingredients for sensitive skin');
        } else if (allText.includes('natural') || allText.includes('organic')) {
          score += 2;
          reasons.push('Natural ingredients gentle on skin');
        }
      }
      if (concern === 'dullness') {
        if (allText.includes('brightening') || allText.includes('exfoliating') || allText.includes('radiant') || allText.includes('glow')) {
          score += 4;
          reasons.push('Brightening and exfoliating for radiant skin');
        } else if (allText.includes('vitamin-c') || allText.includes('antioxidant')) {
          score += 2;
          reasons.push('Antioxidant properties for healthy glow');
        }
      }
      if (concern === 'pores') {
        if (allText.includes('pore') || allText.includes('minimizing') || allText.includes('tightening')) {
          score += 4;
          reasons.push('Helps minimize and tighten pores');
        } else if (allText.includes('cleansing') || allText.includes('purifying')) {
          score += 2;
          reasons.push('Deep cleansing for pore care');
        }
      }
      if (concern === 'texture') {
        if (allText.includes('smooth') || allText.includes('exfoliating') || allText.includes('refining')) {
          score += 4;
          reasons.push('Smoothing formula for improved texture');
        } else if (allText.includes('renewing') || allText.includes('regenerating')) {
          score += 2;
          reasons.push('Helps improve skin texture');
        }
      }
    });

    // Budget matching
    const price = product.price || 0;
    if (budget === 'budget' && price <= 25) {
      score += 2;
      reasons.push('Fits your budget range perfectly');
    }
    if (budget === 'mid-range' && price > 25 && price <= 50) {
      score += 2;
      reasons.push('Great value in your preferred price range');
    }
    if (budget === 'premium' && price > 50) {
      score += 2;
      reasons.push('Premium quality within your budget');
    }

    // Lifestyle preferences
    if (lifestyle === 'natural' && (tags.includes('natural') || tags.includes('organic') || description.includes('natural') || description.includes('organic'))) {
      score += 2;
      reasons.push('Made with natural and organic ingredients');
    }
    if (lifestyle === 'minimalist' && (tags.includes('multi-purpose') || tags.includes('essential') || description.includes('multi-purpose') || description.includes('essential'))) {
      score += 2;
      reasons.push('Multi-purpose formula for your minimalist routine');
    }
    if (lifestyle === 'luxury' && (tags.includes('premium') || tags.includes('luxury') || description.includes('premium') || description.includes('luxury'))) {
      score += 2;
      reasons.push('Luxury formula for indulgent skincare');
    }

    // Category-based scoring
    if (product.category === 'soaps' && skinType === 'oily') {
      score += 1;
      reasons.push('Soap formula ideal for oily skin cleansing');
    }
    if (product.category === 'oils' && skinType === 'dry') {
      score += 1;
      reasons.push('Oil-based formula perfect for dry skin nourishment');
    }
    if (product.category === 'lotions' && concerns.includes('dryness')) {
      score += 1;
      reasons.push('Lotion texture ideal for dry skin hydration');
    }

    // Add general category benefits
    if (reasons.length === 0) {
      reasons.push(`Great ${product.category} option for your skin profile`);
    }

    return { score, reasons };
  };

  // Smart analysis function to intelligently filter and rank products
  const analyzeAndFilterProducts = (scoredProducts: any[], answers: QuizAnswers) => {
    const { age, skinType, concerns, budget, lifestyle } = answers;
    
    // Filter products with minimum score threshold
    const qualifiedProducts = scoredProducts.filter(product => product.score >= 3);
    
    // If not enough qualified products, lower threshold
    if (qualifiedProducts.length < 3) {
      const lowerThreshold = scoredProducts.filter(product => product.score >= 1);
      if (lowerThreshold.length >= 3) {
        return lowerThreshold.sort((a, b) => b.score - a.score);
      }
    }
    
    // Smart category diversification - ensure variety
    const categoryMap = new Map();
    const diversifiedProducts = [];
    
    // First pass: Add best product from each relevant category
    qualifiedProducts.sort((a, b) => b.score - a.score);
    
    for (const product of qualifiedProducts) {
      const category = product.category;
      if (!categoryMap.has(category) || categoryMap.get(category).score < product.score) {
        categoryMap.set(category, product);
      }
    }
    
    // Convert map to array and sort by score
    const categoryBest = Array.from(categoryMap.values()).sort((a, b) => b.score - a.score);
    
    // Take top 3 from diversified categories
    return categoryBest.slice(0, 3);
  };

  const getCurrentAnswer = () => {
    const currentStepData = steps[currentStep];
    return answers[currentStepData.id as keyof QuizAnswers];
  };

  const isStepComplete = () => {
    const currentStepData = steps[currentStep];
    const answer = getCurrentAnswer();
    
    if (currentStepData.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== '';
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Perfect Skincare Match
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Based on your skin profile, we've curated these personalized recommendations just for you.
            </p>
            
            {/* Analysis Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-[#F4EBD0] to-[#D4AF37]/20 rounded-2xl p-6 max-w-4xl mx-auto mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Your Skin Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Age Group:</span>
                  <span className="ml-2 text-gray-600">{answers.age}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Skin Type:</span>
                  <span className="ml-2 text-gray-600 capitalize">{answers.skinType}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Main Concerns:</span>
                  <span className="ml-2 text-gray-600">{answers.concerns.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Budget Range:</span>
                  <span className="ml-2 text-gray-600 capitalize">{answers.budget}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {recommendations.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-square mb-4 overflow-hidden rounded-xl">
                  <img
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.short_description || product.description}
                </p>
                
                {/* Reasons for recommendation */}
                {product.reasons && product.reasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Why we recommend this:</h4>
                    <ul className="space-y-1">
                      {product.reasons.slice(0, 3).map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="text-xs text-gray-600 flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#D4AF37]">
                    £{product.price}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">Perfect Match</span>
                  </div>
                </div>
                
                <AddToCartButton
                  product={{
                    id: product.id,
                    title: product.title,
                    images: product.images || [],
                    price: product.price,
                    category: product.category,
                    slug: product.slug,
                    in_stock: product.in_stock,
                    inventory: product.inventory,
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-3 px-4 rounded-lg"
                  size="sm"
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setAnswers({
                  age: '',
                  gender: '',
                  skinType: '',
                  concerns: [],
                  budget: '',
                  lifestyle: ''
                });
              }}
              variant="outline"
              size="lg"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button
              onClick={() => window.location.href = '/shop'}
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Analyzing Your Skin Profile...
          </h2>
          <p className="text-gray-600 mb-6">
            Our AI is finding the perfect products for you
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-[#D4AF37] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600">
              Help us understand your skin better for personalized recommendations
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <AnimatePresence mode="wait">
                {currentStepData.options.map((option, index) => {
                  const isSelected = currentStepData.type === 'multiple' 
                    ? (answers[currentStepData.id as keyof QuizAnswers] as string[])?.includes(option.value)
                    : answers[currentStepData.id as keyof QuizAnswers] === option.value;

                  return (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => {
                          if (currentStepData.type === 'multiple') {
                            const currentAnswers = answers[currentStepData.id as keyof QuizAnswers] as string[] || [];
                            const newAnswers = isSelected
                              ? currentAnswers.filter(a => a !== option.value)
                              : [...currentAnswers, option.value];
                            handleAnswer(currentStepData.id, newAnswers);
                          } else {
                            handleAnswer(currentStepData.id, option.value);
                          }
                        }}
                        className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-[#D4AF37]/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {option.icon && (
                            <span className="text-2xl">{option.icon}</span>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {option.label}
                            </h3>
                            {option.description && (
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-6 h-6 text-[#D4AF37]" />
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isStepComplete()}
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get My Results
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkinMatcherQuiz;

