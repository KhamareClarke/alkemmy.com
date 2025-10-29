'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import SkinMatcherQuiz to avoid SSR issues
const SkinMatcherQuiz = dynamic(() => import('@/components/SkinMatcherQuiz'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-6 animate-pulse">
          <div className="w-10 h-10 text-white">✨</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading AI Skin Matcher...</h2>
      </div>
    </div>
  ),
});

export default function SkinMatcherPage() {
  return <SkinMatcherQuiz />;
}

