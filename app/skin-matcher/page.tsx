'use client';

import React, { useEffect, useState } from 'react';
import SkinMatcherQuiz from '@/components/SkinMatcherQuiz';

export default function SkinMatcherPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4AF37]/10 to-[#6C7A61]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-6 animate-pulse">
            <div className="w-10 h-10 text-white">✨</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading AI Skin Matcher...</h2>
        </div>
      </div>
    );
  }

  return <SkinMatcherQuiz />;
}

