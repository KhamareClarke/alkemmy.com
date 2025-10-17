'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
      setIsHovering(false);
    }
  };

  const displayRating = isHovering ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className={`flex items-center ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= displayRating;
          
          return (
            <Star
              key={index}
              className={`${sizeClasses[size]} ${
                isFilled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              } ${interactive ? 'hover:text-yellow-400 transition-colors' : ''}`}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleMouseEnter(starRating)}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;




